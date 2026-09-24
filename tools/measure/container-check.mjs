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
import { chromium } from 'playwright';

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
      let best = 0;
      for (const el of sec.querySelectorAll('div, .container, ul, header, footer')) {
        const r = el.getBoundingClientRect();
        if (r.height < 40) continue;
        const w = Math.round(r.width);
        // full-bleed is the section itself, not the content column
        if (w >= vw - 1) continue;
        if (w > best) best = w;
      }
      // a genuinely full-bleed section contributes the viewport inset by its own side padding
      if (!best) {
        const cs = getComputedStyle(sec);
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        if (pad > 0) best = Math.round(sr.width - pad);
      }
      if (best > 200) widths.push(best);
    }
    if (!widths.length) return null;
    const tally = new Map();
    for (const w of widths) tally.set(w, (tally.get(w) || 0) + 1);
    let mode = 0, mc = 0;
    for (const [w, c] of tally) { if (c > mc || (c === mc && w > mode)) { mc = c; mode = w; } }
    return { content: mode, outer: mode, pad: 0, maxWidth: '(measured)', cls: `measured across ${widths.length} sections`, measured: true };
  });
}

const b = await chromium.launch();
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
const pass = Math.abs(diff) <= TOL;
console.log(`\nContainer content-width check`);
console.log(`  build   : ${build.content}px content  (outer ${build.outer}px − gutter ${build.pad}px · max-width ${build.maxWidth} · .${build.cls})`);
if (srcInfo) console.log(`  source  : ${srcInfo.content}px content  (outer ${srcInfo.outer}px − gutter ${srcInfo.pad}px · max-width ${srcInfo.maxWidth})`);
else console.log(`  expected: ${expected}px content`);
console.log(`  ${pass ? '✓ PASS' : '✗ FAIL'} — Δ ${diff >= 0 ? '+' : ''}${diff}px (tolerance ±${TOL})\n`);
process.exit(pass ? 0 : 1);
