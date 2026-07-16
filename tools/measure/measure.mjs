#!/usr/bin/env node
/**
 * measure.mjs — the design-parity harness.
 *
 * Loads a mockup and the dev site at the same viewport, extracts a fixed metric
 * set from each DOM, and prints a diff table with pass/fail against tolerances.
 * This is how the agent STOPS guessing sizes.
 *
 *   node measure.mjs <mockupUrl> <devUrl> [--width 1440] [--json]
 *
 * mockupUrl may be a file:// path to the mockup HTML; devUrl the dev site URL.
 * Requires Playwright: run `npm i` in this folder (see package.json). To reuse a
 * Playwright installed elsewhere, set env PLAYWRIGHT_PATH to its module path.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let chromium;
const candidates = ['playwright'];
if (process.env.PLAYWRIGHT_PATH) { candidates.push(process.env.PLAYWRIGHT_PATH); }
for (const p of candidates) {
  try { ({ chromium } = require(p)); break; } catch {}
}
if (!chromium) { console.error('Playwright not found. Run `npm i` in tools/measure (or set PLAYWRIGHT_PATH).'); process.exit(1); }

const args = process.argv.slice(2);
const [mockupUrl, devUrl] = args.filter(a => !a.startsWith('--'));
const width = Number((args.find(a => a.startsWith('--width')) || '').split('=')[1] || args[args.indexOf('--width') + 1]) || 1440;
const asJson = args.includes('--json');
if (!mockupUrl || !devUrl) { console.error('usage: node measure.mjs <mockupUrl> <devUrl> [--width 1440] [--json]'); process.exit(1); }

/**
 * Selector map: each metric names candidate selectors for the mockup and for the
 * dev (unysonplus-theme) DOM, and what to read. Edit per project as needed —
 * multiple selectors are tried in order; first match wins.
 */
const METRICS = [
  { key: 'container_maxwidth', tol: 4, read: 'width',
    mock: ['.wrap', '.container', 'main > .container', 'body'], dev: ['.fw-container', '.container'] },
  { key: 'header_height', tol: 3, read: 'height',
    mock: ['header', '.site', '.nav'], dev: ['.site-header .header-main', '.site-header'] },
  { key: 'logo_width', tol: 4, read: 'width',
    mock: ['.brand img', 'header img', '.logo img'], dev: ['.site-logo', '.header-element--logo img'] },
  { key: 'logo_height', tol: 4, read: 'height',
    mock: ['.brand img', 'header img', '.logo img'], dev: ['.site-logo', '.header-element--logo img'] },
  { key: 'footer_height', tol: 8, read: 'height',
    mock: ['footer'], dev: ['.footer', 'footer'] },
  { key: 'h1_fontsize', tol: 2, read: 'fontSize',
    mock: ['h1'], dev: ['h1'] },
  { key: 'body_fontsize', tol: 1, read: 'fontSize',
    mock: ['body', 'p'], dev: ['body', 'p'] },
];

async function grab(page, url) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(800);
  return page.evaluate((METRICS) => {
    const num = (v) => Math.round(parseFloat(v) * 10) / 10;
    const pick = (sels, read) => {
      for (const s of sels) {
        const el = document.querySelector(s);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (read === 'width') return num(r.width);
        if (read === 'height') return num(r.height);
        if (read === 'fontSize') return num(cs.fontSize);
      }
      return null;
    };
    const out = {};
    for (const m of METRICS) out[m.key] = pick(m.__which === 'mock' ? m.mock : m.dev, m.read);
    return out;
  }, METRICS.map(m => ({ ...m, __which: page.__which })));
}

const browser = await chromium.launch();
const mp = await browser.newPage(); mp.__which = 'mock';
const dp = await browser.newPage(); dp.__which = 'dev';
const mock = await grab(mp, mockupUrl);
const dev = await grab(dp, devUrl);
await browser.close();

const rows = METRICS.map(m => {
  const a = mock[m.key], b = dev[m.key];
  const diff = (a != null && b != null) ? Math.round((b - a) * 10) / 10 : null;
  const pass = (a != null && b != null) ? Math.abs(diff) <= m.tol : false;
  return { metric: m.key, mockup: a, dev: b, diff, tol: m.tol, pass };
});

if (asJson) { console.log(JSON.stringify(rows, null, 2)); }
else {
  const pad = (s, n) => String(s ?? '—').padEnd(n);
  console.log(`\nParity @ ${width}px   mockup=${mockupUrl}\n`);
  console.log(pad('metric', 22) + pad('mockup', 10) + pad('dev', 10) + pad('diff', 8) + pad('tol', 6) + 'result');
  console.log('-'.repeat(64));
  for (const r of rows) {
    console.log(pad(r.metric, 22) + pad(r.mockup, 10) + pad(r.dev, 10) + pad(r.diff, 8) + pad('±' + r.tol, 6) + (r.pass ? 'PASS' : 'FAIL ✗'));
  }
  const fails = rows.filter(r => !r.pass);
  console.log('-'.repeat(64));
  console.log(fails.length ? `${fails.length} FAIL: ${fails.map(f => f.metric).join(', ')}` : 'ALL PASS ✓');
}
