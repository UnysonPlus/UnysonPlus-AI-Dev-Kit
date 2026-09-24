#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * shot.mjs — SCREENSHOT a converted page (the reusable form of the dozens of one-off `shot*` / `fullshot` /
 * `cmpshots` scripts). Full-page by default; can clip to one section; can also shoot the SOURCE url alongside
 * so you get a source-vs-converted pair to eyeball. Scrolls first so lazy assets load.
 *
 * Usage:
 *   node shot.mjs --out out.png                       full-page shot of http://localhost/
 *   node shot.mjs --url http://localhost/ --out c.png explicit converted URL
 *   node shot.mjs --section 3 --out sec3.png          clip to section #3 (index from probe.mjs)
 *   node shot.mjs --source https://site.com --out-src src.png --out conv.png   shoot BOTH for comparison
 *   node shot.mjs --viewport 1920 --out out.png       viewport width (default 1440)
 *
 * Prefer this + probe.mjs for a quick look; for a rigorous per-section source-vs-converted band diff use the
 * capture service's verify.mjs. Always LOOK at the output (Read the PNG) — a converter fix isn't done until
 * the rendered page matches source, per the house rule.
 *
 * Env: URL (default http://localhost/), NODE_PATH (playwright; falls back to pw-screens).
 */
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = _require('playwright')); }
catch { ({ chromium } = _require('D:/Web Dev/pw-screens/node_modules/playwright')); }

const args = process.argv.slice(2);
const opt  = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const URL     = opt('--url', process.env.URL || 'http://localhost/');
const SOURCE  = opt('--source', '');
const OUT     = opt('--out', 'shot.png');
const OUT_SRC = opt('--out-src', 'shot-source.png');
const VW      = parseInt(opt('--viewport', '1440'), 10) || 1440;
const SECTION = args.includes('--section') ? parseInt(opt('--section', '-1'), 10) : -1;

async function scrollAll(page) {
  await page.evaluate(async () => {
    await new Promise(res => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 700); y += 700; if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 60); });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function shoot(browser, url, out, section) {
  const page = await browser.newPage({ viewport: { width: VW, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1600);
  await scrollAll(page);
  if (section >= 0) {
    const clip = await page.evaluate(i => { const s = document.querySelectorAll('section')[i]; if (!s) return null; s.scrollIntoView(); const r = s.getBoundingClientRect(); return { x: 0, y: window.scrollY + r.top, width: document.body.clientWidth, height: Math.min(r.height, 4000) }; }, section);
    if (!clip) { console.log(`shot: no section ${section} at ${url}`); await page.close(); return; }
    await page.waitForTimeout(300);
    await page.screenshot({ path: out, clip });
  } else {
    await page.screenshot({ path: out, fullPage: true });
  }
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log(`shot: ${out}  (${url}${section >= 0 ? ' §' + section : ''}, page ${h}px)`);
  await page.close();
}

const browser = await chromium.launch();
await shoot(browser, URL, OUT, SECTION);
if (SOURCE) await shoot(browser, SOURCE, OUT_SRC, -1);   // source is always full-page (no converted-section index)
await browser.close();
