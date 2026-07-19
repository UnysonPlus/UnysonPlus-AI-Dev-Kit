#!/usr/bin/env node
/**
 * props.mjs — full-body PROPERTY diff. Walks both bodies, captures each element's computed
 * style + geometry, and reports NAMED property deltas (no pixels, no video noise).
 *
 * Two matching strategies (the DOMs differ — source Tailwind vs UnysonPlus markup — so we
 * can't diff trees 1:1):
 *   • CONTAINER — per region (header ↔ header, section ↔ section, footer ↔ footer), diff the
 *     region element's OWN box/background/border/padding props. Catches a translucent header,
 *     a short section, a missing border — as the exact property that differs.
 *   • TEXT-ANCHORED — match elements by their (normalized) visible text, which is identical
 *     across source and a faithful rebuild, then diff their typography/color props. Catches a
 *     wrong link colour, headline size, button background — located to the text you can see.
 *
 * A property is reported only when it differs beyond tolerance (px ±tol, colours exact-ish,
 * strings normalized). Use the LIVE source URL as the mockup so its styles are real.
 *
 *   node props.mjs <mockupUrl> <devUrl> [--width 1440] [--out ./parity] [--json]
 */
import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
let chromium = null;
for (const p of ['playwright', process.env.PLAYWRIGHT_PATH].filter(Boolean)) { try { ({ chromium } = require(p)); break; } catch {} }
if (!chromium) { console.error('Playwright not found (npm i in tools/measure, or set PLAYWRIGHT_PATH).'); process.exit(1); }

const args = process.argv.slice(2);
const [mockupUrl, devUrl] = args.filter(a => !a.startsWith('--'));
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d; };
const width = Number(flag('width', 1440)) || 1440;
const outDir = String(flag('out', './parity'));
const asJson = args.includes('--json');
if (!mockupUrl || !devUrl) { console.error('usage: node props.mjs <mockupUrl> <devUrl> [--width 1440] [--out ./parity] [--json]'); process.exit(1); }

const CFG = {
  header: { mock: ['#navbar', 'header', 'nav[class*="nav"]', 'nav'], dev: ['#masthead', '.site-header'] },
  footer: { mock: ['footer', '#footer'], dev: ['#colophon', '.site-footer'] },
  bodyMock: ['main > *', 'body > div > *', 'body > *', 'section'],
  bodyDev: ['.fw-page-builder-content > section', 'main section'],
};
const CONTAINER_PROPS = ['background-color', 'background-image', 'backdrop-filter', '-webkit-backdrop-filter', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'border-top-width', 'border-bottom-width', 'border-top-color', 'border-radius', 'box-shadow', 'display', 'flex-direction', 'justify-content', 'align-items', 'gap', 'min-height', 'opacity'];
const TEXT_PROPS = ['color', 'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line'];
const PX_TOL = 1.5;

async function firstHandle(page, sels) { for (const s of sels) { const h = await page.$(s); if (h) { const b = await h.boundingBox().catch(() => null); if (b && b.height > 4) return h; } } return null; }
async function bandHandles(page, sels, hH) {
  for (const s of sels) { const hs = await page.$$(s); const out = [];
    for (const h of hs) { const b = await h.boundingBox().catch(() => null); if (!b || b.height < 80) continue;
      const tag = await h.evaluate(el => el.tagName.toLowerCase()); if (['nav', 'footer', 'script', 'style'].includes(tag)) continue;
      if (hH && Math.abs(b.y) < 2 && Math.abs(b.height - hH) < 2) continue; out.push(h); }
    if (out.length) return out; }
  return [];
}
const containerProps = async (h) => h ? h.evaluate((el, P) => { const cs = getComputedStyle(el); const o = {}; P.forEach(p => o[p] = cs.getPropertyValue(p).trim()); return o; }, CONTAINER_PROPS) : null;
const textElems = async (h) => h ? h.evaluate((el, P) => {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const out = [];
  el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,li,span,.btn').forEach(n => {
    const t = norm(n.innerText); if (!t || t.length > 80) return;
    // prefer leaf: skip if a child element carries the exact same text (dedupe wrappers)
    if ([...n.children].some(c => norm(c.innerText) === t)) return;
    const cs = getComputedStyle(n); const style = {}; P.forEach(p => style[p] = cs.getPropertyValue(p).trim());
    out.push({ text: t.toLowerCase(), tag: n.tagName.toLowerCase(), style });
  });
  return out;
}, TEXT_PROPS) : [];

const px = v => { const m = /(-?[\d.]+)px/.exec(v); return m ? parseFloat(m[1]) : null; };
const normStr = v => v.replace(/["']/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
const ALIGN = { start: 'left', end: 'right', left: 'left', right: 'right', center: 'center', justify: 'justify' };  // start≡left in LTR
function differs(prop, a, b) {
  if (a === b) return false;
  if (prop === 'text-align') return (ALIGN[a] || a) !== (ALIGN[b] || b);
  const pa = px(a), pb = px(b);
  if (pa != null && pb != null) return Math.abs(pa - pb) > PX_TOL;
  if (/color/.test(prop)) return normStr(a) !== normStr(b);       // rgb(a) strings
  if (prop === 'font-family') { const f = s => normStr(s).split(',')[0]; return f(a) !== f(b); }
  return normStr(a) !== normStr(b);
}
const diffObj = (A, B, props) => {
  const d = []; A = A || {}; B = B || {};
  for (const p of (props || Object.keys(A))) {
    // a border colour is invisible when its width is 0 on both sides — skip the noise.
    if (/^border-(top|bottom|left|right)-color$/.test(p)) { const w = p.replace('-color', '-width'); if ((px(A[w]) || 0) < 0.5 && (px(B[w]) || 0) < 0.5) continue; }
    const a = A[p] ?? '', b = B[p] ?? '';
    if (differs(p, a, b)) d.push({ prop: p, mock: a || '(none)', dev: b || '(none)' });
  }
  return d;
};

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const pageFor = async (u) => { const p = await browser.newPage(); await p.setViewportSize({ width, height: 1000 }); await p.goto(u, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {}); await p.waitForTimeout(1200); return p; };
const mp = await pageFor(mockupUrl), dp = await pageFor(devUrl);
const regionsOf = async (page, side) => { const header = await firstHandle(page, CFG.header[side]); const footer = await firstHandle(page, CFG.footer[side]); const hH = header ? (await header.boundingBox())?.height : 0; const bands = await bandHandles(page, side === 'mock' ? CFG.bodyMock : CFG.bodyDev, hH); return { header, footer, bands }; };
const M = await regionsOf(mp, 'mock'), D = await regionsOf(dp, 'dev');

const report = [];
async function region(label, mh, dh) {
  const cD = diffObj(await containerProps(mh), await containerProps(dh), CONTAINER_PROPS);
  const mt = await textElems(mh), dt = await textElems(dh);
  const dMap = new Map(); dt.forEach(e => { if (!dMap.has(e.text)) dMap.set(e.text, e); });
  const textDeltas = [];
  const seen = new Set();
  for (const e of mt) {
    if (seen.has(e.text)) continue; seen.add(e.text);
    const m = dMap.get(e.text); if (!m) continue;             // unmatched text = STRUCTURE's job, not here
    const d = diffObj(e.style, m.style, TEXT_PROPS);
    if (d.length) textDeltas.push({ text: e.text, deltas: d });
  }
  report.push({ region: label, container: cD, text: textDeltas });
}
await region('header', M.header, D.header);
const n = Math.max(M.bands.length, D.bands.length);
for (let i = 0; i < n; i++) await region(`section ${i + 1}`, M.bands[i], D.bands[i]);
await region('footer', M.footer, D.footer);
await browser.close();

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/props-diff.json`, JSON.stringify(report, null, 2));
if (asJson) { console.log(JSON.stringify(report, null, 2)); }
else {
  let total = 0;
  for (const r of report) {
    const nC = r.container.length, nT = r.text.reduce((a, t) => a + t.deltas.length, 0); total += nC + nT;
    if (!nC && !nT) { console.log(`\n== ${r.region} ==  ✓ no property deltas`); continue; }
    console.log(`\n== ${r.region} ==  (${nC} container, ${nT} text)`);
    for (const c of r.container) console.log(`  [container] ${c.prop}:  mock ${c.mock}  →  dev ${c.dev}`);
    for (const t of r.text.slice(0, 8)) for (const d of t.deltas) console.log(`  "${t.text.slice(0, 32)}"  ${d.prop}:  mock ${d.mock}  →  dev ${d.dev}`);
    if (r.text.length > 8) console.log(`  … +${r.text.length - 8} more text elements with deltas (see ${outDir}/props-diff.json)`);
  }
  console.log(`\n${total ? total + ' property deltas total — full JSON at ' + outDir + '/props-diff.json' : 'NO property deltas — every matched element/region matches ✓'}`);
}
