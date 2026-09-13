#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * probe.mjs — STRUCTURAL / LAYOUT PROBE for a converted page (the reusable form of the dozens of
 * one-off `probe*` / `measure*` / `structcheck*` / `find-*` scripts).
 *
 * Renders a converted page headless and reports, per <section>: index, tag, rendered height, whether it's
 * flush/collapsed, heading presence, the column/grid layout of its children (fw-span-* / fw-grid / fw-col-*),
 * content-image count + sizes, and RUNAWAY-height flags (an ultra-tall/thin ribbon = a structural mis-map).
 * This is the first thing to run after a conversion to see WHERE a page drifts, before opening a screenshot.
 *
 * Usage:
 *   node probe.mjs                          probe http://localhost/ at 1440px
 *   node probe.mjs --url http://localhost/  explicit URL (a converted front page, or any rendered page)
 *   node probe.mjs --viewport 1920          viewport width (default 1440)
 *   node probe.mjs --section 3              DEEP-DIVE one section: list every child with class + w×h
 *   node probe.mjs --grep "Pricing"         only sections whose text contains this string
 *   node probe.mjs --json                   machine-readable JSON (for scripting / diffing)
 *
 * Env: URL (default http://localhost/), NODE_PATH (playwright; falls back to pw-screens).
 * Pairs with: shot.mjs (see it), dump-builder.php (the builder JSON behind it), score.mjs (grade it).
 */
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = _require('playwright')); }
catch { ({ chromium } = _require('D:/Web Dev/pw-screens/node_modules/playwright')); }

const args = process.argv.slice(2);
const opt  = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const URL  = opt('--url', process.env.URL || 'http://localhost/');
const VW   = parseInt(opt('--viewport', '1440'), 10) || 1440;
const SECTION = args.includes('--section') ? parseInt(opt('--section', '-1'), 10) : -1;
const GREP = opt('--grep', '');
const JSON_OUT = args.includes('--json');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: VW, height: 1000 } });
await page.goto(URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.waitForTimeout(1600);

const data = await page.evaluate(({ section, grep }) => {
  const cn = e => (typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '');
  const px = v => Math.round(parseFloat(v) || 0);
  const secs = [...document.querySelectorAll('section')];

  // DEEP-DIVE one section: every child element with its class + box.
  if (section >= 0) {
    const s = secs[section];
    if (!s) return { deep: true, err: `no section ${section} (page has ${secs.length})` };
    const walk = (el, depth, out) => {
      for (const c of el.children) {
        const r = c.getBoundingClientRect();
        const cls = cn(c).replace(/\bfx-[0-9a-f]+\b/g, '').replace(/\s+/g, ' ').trim();
        out.push({ depth, tag: c.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height),
          span: (cls.match(/fw-(?:span|col|fifth)-\S+/g) || []).join(',') || undefined,
          cls: cls.slice(0, 70) });
        if (depth < 3 && c.children.length) walk(c, depth + 1, out);
      }
      return out;
    };
    const r = s.getBoundingClientRect();
    return { deep: true, section, h: Math.round(r.height), tree: walk(s, 0, []).slice(0, 60) };
  }

  // OVERVIEW: one row per section.
  const rows = secs.map((s, i) => {
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const heads = [...s.querySelectorAll('h1,h2,h3')].filter(e => e.textContent.trim().length > 2 && e.getBoundingClientRect().width > 0);
    const imgs = [...s.querySelectorAll('img')].map(im => im.getBoundingClientRect()).filter(b => b.width > 40 && b.height > 40);
    // column layout of the most-populated flex/grid inside
    let cols = '';
    for (const fb of s.querySelectorAll('.fw-flexbox,.fw-grid')) {
      const spans = [...fb.children].filter(k => /fw-(?:span|col|fifth)-/.test(cn(k)));
      if (spans.length >= 2) { const tops = new Set(spans.map(k => Math.round(k.getBoundingClientRect().top))); cols = `${spans.length}cells/${tops.size}rows`; break; }
    }
    // runaway: an ultra-tall/thin ribbon inside, or an absurd section height
    let runaway = r.height > 8000;
    if (!runaway) for (const el of s.querySelectorAll('div,ul,ol,figure')) { const b = el.getBoundingClientRect(); if (b.height > 2500 && b.width > 0 && b.width < 160) { runaway = true; break; } }
    const txt = s.textContent.replace(/\s+/g, ' ').trim();
    return { i, tag: s.tagName.toLowerCase(), h: Math.round(r.height), pad: px(cs.paddingTop) + px(cs.paddingBottom),
      heads: heads.length, headTxt: (heads[0]?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 32),
      imgs: imgs.length, imgMax: imgs.length ? Math.max(...imgs.map(b => Math.round(b.width))) : 0,
      cols: cols || undefined, runaway: runaway || undefined, txt: txt.slice(0, 40) };
  }).filter(row => !grep || (secs[row.i].textContent || '').toLowerCase().includes(grep.toLowerCase()));

  return { deep: false, nSecs: secs.length, pageH: Math.round(document.body.scrollHeight), rows };
}, { section: SECTION, grep: GREP });

await browser.close();

if (JSON_OUT) { console.log(JSON.stringify(data, null, 2)); process.exit(0); }

if (data.deep) {
  if (data.err) { console.log('probe:', data.err); process.exit(0); }
  console.log(`\nsection ${data.section}  ·  height ${data.h}px  ·  child tree (depth≤3, class fx-* stripped)\n`);
  for (const n of data.tree) console.log(`${'  '.repeat(n.depth)}${n.tag.padEnd(7)} ${String(n.w).padStart(4)}×${String(n.h).padStart(5)}  ${n.span ? '['+n.span+'] ' : ''}${n.cls}`);
} else {
  console.log(`\n${URL}  @ ${VW}px  ·  ${data.nSecs} sections  ·  page ${data.pageH}px\n`);
  console.log('  #  tag      height   pad  heads  imgs(max)  cols          heading / text');
  console.log('  ' + '─'.repeat(92));
  for (const r of data.rows) {
    const flags = r.runaway ? '  ⚠ RUNAWAY' : '';
    console.log(`  ${String(r.i).padStart(2)} ${r.tag.padEnd(8)} ${String(r.h).padStart(6)} ${String(r.pad).padStart(4)}  ${String(r.heads).padStart(4)}  ${String(r.imgs).padStart(3)}(${String(r.imgMax).padStart(4)})  ${(r.cols || '—').padEnd(12)}  ${(r.headTxt || r.txt)}${flags}`);
  }
  const bad = data.rows.filter(r => r.runaway);
  if (bad.length) console.log(`\n  ⚠ ${bad.length} runaway section(s): ${bad.map(r => '#' + r.i).join(', ')} — a structural mis-map (tall/thin ribbon). Deep-dive with --section N.`);
  console.log('');
}
