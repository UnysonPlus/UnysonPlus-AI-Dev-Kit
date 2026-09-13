// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// section-audit.mjs — VISUAL section-by-section comparison of a SOURCE site vs a CONVERTED/build site.
//
// Where compare.mjs is a per-region METRIC ensemble (you name one selector on each side and it prints a
// pass/fail geometry+pixel diff), this tool auto-SPLITS both pages into their natural bands — <header>,
// each <section>, <footer> — matches source↔build by heading text, and writes ONE stacked, labelled PNG
// per band (SOURCE on top, CONVERTED below). A human or the AI then reads one image per section and
// concludes what's off. This is the "screenshot the header of both and compare, then the footer, then
// each section" workflow — no pasting screenshots, one image per section.
//
//   node section-audit.mjs --source https://modfii.com/ --converted http://localhost/
//   node section-audit.mjs --source https://src/ --converted http://localhost/ --only hero,footer
//   node section-audit.mjs --source https://src/ --converted http://localhost/ --out ./audit --width 1440
//
// Output: <out>/NN-<label>.png (source stacked above converted, each labelled) + manifest.json.
// A band with no match on the build side is written source-only and tagged "(no converted match)".
//
// Deps: playwright-core (system Chrome via channel:'chrome') + sharp — both already in this folder.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const SRC_URL  = flag('source', '');
const CONV_URL = flag('converted', '');
const WIDTH    = parseInt(flag('width', '1440'), 10) || 1440;
const OUT      = flag('out', './out/section-audit'); // under the gitignored out/ dir by default
const ONLY     = (flag('only', '') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
if (!SRC_URL || !CONV_URL) {
  console.error('usage: node section-audit.mjs --source <srcUrl> --converted <buildUrl> [--only hero,footer] [--out DIR] [--width 1440]');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

async function snap(browser, url, tag) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 1000 } });
  // DISABLE HTTP CACHE — the converted site's generated child-theme CSS keeps the SAME url across
  // re-conversions, so Chrome serves the STALE stylesheet and the audit shows an OLD render (looks like
  // "no improvement" even after a real fix). Force every request to revalidate so the audit is truthful.
  try { const cdp = await page.context().newCDPSession(page); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); } catch { /* CDP unavailable — proceed */ }
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
  const regions = await page.evaluate(() => {
    const out = [];
    const push = (el, kind) => {
      const r = el.getBoundingClientRect();
      if (r.height < 20) return;
      const h = el.querySelector('h1,h2,h3');
      const label = (h ? h.textContent : el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      out.push({ kind, label, y: Math.round(r.top + window.scrollY), h: Math.round(r.height) });
    };
    const header = document.querySelector('header'); if (header) push(header, 'header');
    document.querySelectorAll('main section, body > section, section').forEach((s) => { if (!s.closest('header') && !s.closest('footer')) push(s, 'section'); });
    const footer = document.querySelector('footer'); if (footer) push(footer, 'footer');
    out.sort((a, b) => a.y - b.y);
    const kept = [];
    for (const r of out) {
      // drop only a band nested inside a prior NON-header band — the fixed header overlaps section 1 at y=0.
      if (kept.some((k) => k.kind !== 'header' && r.kind !== 'header' && r.y >= k.y && r.y < k.y + k.h - 5)) continue;
      kept.push(r);
    }
    return kept;
  });
  const pngPath = path.join(OUT, `_${tag}_full.png`);
  await page.screenshot({ path: pngPath, fullPage: true });
  await page.close();
  return { pngPath, regions };
}

const sim = (a, b) => {
  const ta = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const tb = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  if (!ta.size || !tb.size) return 0;
  let hit = 0; for (const w of ta) if (tb.has(w)) hit++;
  return hit / Math.max(ta.size, tb.size);
};

function match(src, conv) {
  const pairs = [];
  const sh = src.find((r) => r.kind === 'header'), ch = conv.find((r) => r.kind === 'header');
  if (sh && ch) pairs.push({ label: 'header', src: sh, conv: ch });
  const sSecs = src.filter((r) => r.kind === 'section'), cSecs = conv.filter((r) => r.kind === 'section');
  // BEST-PAIR-FIRST matching (not greedy per-source): score every source×converted pair, then assign
  // highest-similarity pairs first. Greedy-per-source mis-aligned near-duplicate headings — e.g. the source
  // "Trusted by buyers…" (logos) would steal the converted "Trusted by 2,000…" (testimonials) on the shared
  // "trusted" token, leaving the real testimonials unmatched.
  const cand = [];
  sSecs.forEach((s, si) => cSecs.forEach((c, ci) => { const sc = sim(s.label, c.label); if (sc > 0.15) cand.push({ si, ci, sc }); }));
  cand.sort((a, b) => b.sc - a.sc);
  const usedS = new Set(), usedC = new Set(), matchOf = {};
  for (const { si, ci } of cand) { if (usedS.has(si) || usedC.has(ci)) continue; usedS.add(si); usedC.add(ci); matchOf[si] = ci; }
  sSecs.forEach((s, si) => {
    if (si in matchOf) pairs.push({ label: s.label || 'section', src: s, conv: cSecs[matchOf[si]] });
    else pairs.push({ label: (s.label || 'section') + ' (no match)', src: s, conv: null });
  });
  const sf = src.find((r) => r.kind === 'footer'), cf = conv.find((r) => r.kind === 'footer');
  if (sf && cf) pairs.push({ label: 'footer', src: sf, conv: cf });
  return pairs;
}

async function cropLabeled(pngPath, region, caption, targetW) {
  const meta = await sharp(pngPath).metadata();
  const top = Math.max(0, Math.min(region.y, meta.height - 1));
  const h = Math.max(1, Math.min(region.h, meta.height - top));
  const body = await sharp(pngPath).extract({ left: 0, top, width: Math.min(meta.width, WIDTH), height: h }).toBuffer();
  const scaled = await sharp(body).resize({ width: targetW }).toBuffer();
  const sm = await sharp(scaled).metadata();
  const band = 26;
  const svg = Buffer.from(`<svg width="${targetW}" height="${band}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="18" font-family="monospace" font-size="14" fill="#fff">${caption.replace(/[<&]/g, '')}</text></svg>`);
  return sharp({ create: { width: targetW, height: sm.height + band, channels: 3, background: '#fff' } })
    .composite([{ input: svg, top: 0, left: 0 }, { input: scaled, top: band, left: 0 }]).png().toBuffer();
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  console.log('snapping source   ', SRC_URL);
  const src = await snap(browser, SRC_URL, 'src');
  console.log('snapping converted', CONV_URL);
  const conv = await snap(browser, CONV_URL, 'conv');
  const pairs = match(src.regions, conv.regions);
  const targetW = 900;
  let n = 0; const manifest = [];
  for (const pair of pairs) {
    const key = (pair.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)) || 'section';
    if (ONLY.length && !ONLY.some((o) => key.includes(o) || pair.label.toLowerCase().includes(o))) continue;
    const srcImg = await cropLabeled(src.pngPath, pair.src, `SOURCE — ${pair.label}`, targetW);
    let stack = srcImg;
    if (pair.conv) {
      const convImg = await cropLabeled(conv.pngPath, pair.conv, `CONVERTED — ${pair.label}`, targetW);
      const sh = (await sharp(srcImg).metadata()).height, chh = (await sharp(convImg).metadata()).height, gap = 6;
      stack = await sharp({ create: { width: targetW, height: sh + chh + gap, channels: 3, background: '#888' } })
        .composite([{ input: srcImg, top: 0, left: 0 }, { input: convImg, top: sh + gap, left: 0 }]).png().toBuffer();
    }
    const file = path.join(OUT, `${String(n).padStart(2, '0')}-${key}.png`);
    await sharp(stack).toFile(file);
    manifest.push({ file: path.basename(file), label: pair.label, matched: !!pair.conv });
    console.log('  wrote', path.basename(file), pair.conv ? '' : '(no converted match)');
    n++;
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('DONE →', path.resolve(OUT), `(${n} section image(s); read them top-to-bottom)`);
} finally {
  await browser.close();
}
