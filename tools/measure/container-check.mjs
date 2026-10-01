// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// Container CONTENT-width check — verify a build's section container renders the SAME content width
// as its source (or an expected px value). This is the width that actually holds the design, i.e.
// `max-width` MINUS the left/right gutter/padding — the dimension a "Container Width = 1280" setting
// is supposed to yield. It exists because that number is easy to get wrong silently: if the gutter
// sits INSIDE the max-width (border-box), a 1280 setting renders only ~1216 of content and every
// element inside inherits the deficit. Content width, not max-width, is what must match the source.
//
// Usage:
//   node container-check.mjs <buildUrl> <expectedPx>            e.g. … http://localhost/demos/pinky-bites/ 1280
//   node container-check.mjs <buildUrl> <sourceUrl>             measures the source's container too
//   node container-check.mjs <buildUrl> <target> <selector>    override the container selector
//     (default tries the page-builder section container, then any .fw-container/.container)
// Exit code 1 if the content width is off by more than the tolerance (±2px).
import { launchBrowser } from './lib/browser.mjs';

const [, , buildUrl, target, selArg] = process.argv;
if (!buildUrl || !target) {
  console.error('usage: node container-check.mjs <buildUrl> <expectedPx|sourceUrl> [selector]');
  process.exit(2);
}
const TOL = 2;
const SEL = selArg || '.fw-page-builder-content .fw-container, main .fw-container, .fw-container, .container';

// The WIDEST matching container's CONTENT box (rect width minus horizontal padding) at desktop.
async function contentWidth(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  return page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 200);
    if (!els.length) return null;
    // pick the widest (the main content container, not a nested one)
    let best = null;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      const pad = parseFloat(c.paddingLeft) + parseFloat(c.paddingRight);
      const content = Math.round(r.width - pad);
      if (!best || content > best.content) {
        best = { content, outer: Math.round(r.width), pad: Math.round(pad), maxWidth: c.maxWidth, cls: (el.className || '').toString().slice(0, 40) };
      }
    }
    return best;
  }, SEL);
}

// A SOURCE site has none of those class names. The selector list is UnysonPlus/Bootstrap shaped, so on a
// Tailwind (or any other) source it matched nothing and the tool bailed with "could not resolve the
// expected width" — which is the one comparison it exists to make. Fall back to MEASURING the content
// column the way a reader sees it: per section, the widest descendant that is not full-bleed; the mode
// across sections is the site's content width. No class names, so it works on any source.
async function measuredContentWidth(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const widths = [];
    for (const sec of document.querySelectorAll('section, main > div, article')) {
      const sr = sec.getBoundingClientRect();
      if (sr.height < 80) continue;
      // A CONTENT WIDTH IS A CONTENT BOX. This used to push the widest descendant's raw
      // getBoundingClientRect().width — a BORDER box, gutter included — and then report `pad: 0`, so a
      // capped column's own padding was counted as content. On the Tailwind shape these sources use
      // (`max-w-7xl mx-auto px-8` → box 1280, padding 32/side, content 1216) it read the source as
      // "1280px content, 0 gutter" and failed a build that rendered the correct 1216 — an outer box
      // compared against a content box. Measured on a live source: box 1280 / padL 32 / padR 32.
      // Pick the column by its OUTER width (that is what makes it the content column), then report its
      // CONTENT box, which is the dimension a "Container Width" setting is supposed to yield.
      let best = 0, bestPad = 0;
      for (const el of sec.querySelectorAll('div, .container, ul, header, footer')) {
        const r = el.getBoundingClientRect();
        if (r.height < 40) continue;
        const w = Math.round(r.width);
        // full-bleed is the section itself, not the content column
        if (w >= vw - 1) continue;
        if (w > best) {
          const cs = getComputedStyle(el);
          best = w;
          bestPad = Math.round((parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0));
        }
      }
      // a genuinely full-bleed section contributes the viewport inset by its own side padding
      if (!best) {
        const cs = getComputedStyle(sec);
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        if (pad > 0) { best = Math.round(sr.width); bestPad = Math.round(pad); }
      }
      if (best - bestPad > 200) {
        // Carry the section's HEADING with its width. Aligning the two sides by INDEX is wrong whenever
        // they enumerate different numbers of sections -- a source whose hero is not a <section> shifts
        // every row by one, and then a build in which every band matches reports a large delta.
        const h = sec.querySelector('h1,h2,h3');
        widths.push({ content: best - bestPad, outer: best, pad: bestPad, label: (h ? h.textContent : '').trim().slice(0, 40) });
      }
    }
    if (!widths.length) return null;
    // The mode is taken over the CONTENT widths; the outer box and gutter are carried alongside so the
    // report can show the same "outer − gutter" breakdown the class-matched path prints.
    const tally = new Map();
    for (const w of widths) tally.set(w.content, (tally.get(w.content) || 0) + 1);
    let mode = 0, mc = 0;
    for (const [w, c] of tally) { if (c > mc || (c === mc && w > mode)) { mc = c; mode = w; } }
    const rep = widths.find((w) => w.content === mode) || { outer: mode, pad: 0 };
    // Carry the whole DISTRIBUTION out, not just the winner. A single number hides the case that actually
    // matters: a source with TWO deliberate content widths -- a narrow prose column and a wider card grid --
    // has no one 'container width', and a mode and an area-weighted pick can legitimately differ by hundreds
    // of px. Reported as one delta that reads as a converter bug rather than an ambiguity in the source.
    const dist = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]).map(([w, c]) => ({ content: w, sections: c }));
    return { content: mode, outer: rep.outer, pad: rep.pad, maxWidth: '(measured)', cls: `measured across ${widths.length} sections`, measured: true, dist, bands: widths };
  });
}

const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });

let build = await contentWidth(page, buildUrl);
if (!build) { build = await measuredContentWidth(page, buildUrl); }
const isUrl = /^https?:\/\//i.test(target);
let expected, srcInfo = null;
if (isUrl) {
  srcInfo = await contentWidth(page, target);
  if (!srcInfo) { srcInfo = await measuredContentWidth(page, target); }
  expected = srcInfo ? srcInfo.content : null;
}
else { expected = Math.round(parseFloat(target)); }
await b.close();

if (!build) { console.error(`✗ no container matched "${SEL}" on the build, and no content column could be measured`); process.exit(1); }
if (expected == null) { console.error('✗ could not resolve the expected width'); process.exit(1); }

const diff = build.content - expected;
let pass = Math.abs(diff) <= TOL;   // provisional; the per-band result below outranks it
console.log(`\nContainer content-width check`);
console.log(`  build   : ${build.content}px content  (outer ${build.outer}px − gutter ${build.pad}px · max-width ${build.maxWidth} · .${build.cls})`);
if (srcInfo) console.log(`  source  : ${srcInfo.content}px content  (outer ${srcInfo.outer}px − gutter ${srcInfo.pad}px · max-width ${srcInfo.maxWidth})`);
else console.log(`  expected: ${expected}px content`);
const showDist = (label, info) => {
  if (!info || !info.dist || info.dist.length < 2) return;
  console.log(`  ${label} widths : ` + info.dist.slice(0, 4).map((d) => d.content + 'px x' + d.sections).join('  ') + (info.dist.length > 4 ? '  ...' : ''));
};
// Per-band comparison, MATCHED BY HEADING. This is the answer the single delta below cannot give: when
// the two sides enumerate a different number of sections, the mode-vs-mode delta describes the
// misalignment, not the container. Measured case: every band matched and the headline still read +256px.
const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let bandVerdict = null;
if (build && srcInfo && build.bands && srcInfo.bands) {
  const used = new Set();
  const rows = [];
  for (const sb of srcInfo.bands) {
    const key = norm(sb.label);
    let hit = -1;
    if (key) {
      hit = build.bands.findIndex((d, k) => !used.has(k) && norm(d.label) && (norm(d.label) === key
        || norm(d.label).startsWith(key.slice(0, 18)) || key.startsWith(norm(d.label).slice(0, 18))));
    }
    if (hit >= 0) used.add(hit);
    rows.push({ label: sb.label, src: sb.content, dev: hit >= 0 ? build.bands[hit].content : null });
  }
  const matched = rows.filter((r) => r.dev != null);
  if (matched.length) {
    const near = matched.filter((r) => Math.abs(r.src - r.dev) <= 24);
    console.log('');
    console.log('  per-band (matched by heading):');
    for (const r of rows) {
      const mark = r.dev == null ? '  ?' : (Math.abs(r.src - r.dev) <= 24 ? '  ok' : '  !!');
      console.log(mark + ' ' + String(r.src).padStart(5) + ' -> ' + String(r.dev == null ? 'unmatched' : r.dev).padStart(9) + '   ' + (r.label || '(no heading)'));
    }
    bandVerdict = { matched: matched.length, near: near.length, total: rows.length };
    console.log('  ' + near.length + ' of ' + matched.length + ' matched bands within 24px' +
      (rows.length > matched.length ? '  (' + (rows.length - matched.length) + ' source band(s) had no counterpart)' : ''));
    if (near.length === matched.length) {
      console.log('  NOTE: every matched band agrees — the delta below is mode-vs-mode across differently');
      console.log('        aligned section lists, not a container error.');
    }
  }
}
showDist('build ', build);
showDist('source', srcInfo);
// Two well-populated widths mean the source has no single container width; say so rather than letting the
// delta imply the build simply picked the wrong one.
const spread = (i2) => i2 && i2.dist && i2.dist.length > 1 && i2.dist[1].sections >= 2 && Math.abs(i2.dist[0].content - i2.dist[1].content) > 64;
if (spread(srcInfo)) {
  console.log('  ! the SOURCE uses more than one content width (' + srcInfo.dist.slice(0, 2).map((d) => d.content + 'px').join(' and ') + ') -');
  console.log('    a single container setting cannot match both; the delta below is against the most common one.');
}
// The per-band result OUTRANKS the mode delta when we have it: a build whose every matched band agrees
// with its source band IS the right container, whatever the modes say. Leaving FAIL there made the tool
// contradict its own evidence two lines later, which is how a lens stops being believed.
const bandPass = !!(bandVerdict && bandVerdict.matched >= 2 && bandVerdict.near === bandVerdict.matched);
if (bandPass) pass = true;
console.log('  ' + (pass ? '✓ PASS' : '✗ FAIL') + ' - ' + (bandPass
  ? 'every matched band agrees (mode delta ' + (diff >= 0 ? '+' : '') + diff + 'px is a list-alignment artefact)'
  : 'delta ' + (diff >= 0 ? '+' : '') + diff + 'px (tolerance +/-' + TOL + ')'));
console.log('');
process.exit(pass ? 0 : 1);
