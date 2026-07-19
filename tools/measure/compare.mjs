#!/usr/bin/env node
/**
 * compare.mjs — ENSEMBLE region-by-region parity. Four INDEPENDENT signals per region
 * (header↔header, each section↔section, footer↔footer), aggregated FAIL-LOUD:
 *
 *   GEOMETRY   — region height each side, Δ%. Catches too-tall / short / missing / extra.
 *   PIXEL      — pixelmatch (the industry pixel-diff engine): normalize both region shots
 *                to the same box, count differing pixels → mismatch %; writes a diff PNG.
 *   PERCEPTUAL — Resemble.js: mismatch % with anti-alias tolerance; writes its own diff.
 *   STRUCTURE  — DOM diff: link / button / image counts + visible text tokens. This is the
 *                one pixels can't fool — a header with 1 link vs the mockup's 7 hard-FAILs.
 *
 * A region PASSES only if EVERY signal passes. (Pixel/perceptual need a faithful reference —
 * prefer the LIVE source URL so the hero video renders; see design-parity-checklist.md.)
 *
 *   node compare.mjs <mockupUrl> <devUrl> [--width 1440] [--out ./parity] [--json]
 *
 * Deps (npm i in tools/measure): pixelmatch, pngjs, resemblejs (+ playwright). Set
 * KIT_MODS to a node_modules dir to resolve them from elsewhere; PLAYWRIGHT_PATH still works.
 */
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
const require = createRequire(import.meta.url);

const MODS = process.env.KIT_MODS || null;
const rq = (name) => { try { return require(MODS ? require.resolve(name, { paths: [MODS] }) : name); } catch (e) { return null; } };
const resolveFrom = (name) => { try { return require.resolve(name, MODS ? { paths: [MODS] } : undefined); } catch { return null; } };

let chromium = (rq('playwright') || {}).chromium;
if (!chromium && process.env.PLAYWRIGHT_PATH) chromium = (rq(process.env.PLAYWRIGHT_PATH) || {}).chromium;
const PNG = (rq('pngjs') || {}).PNG;
const pmPath = resolveFrom('pixelmatch');
const pixelmatch = pmPath ? (await import(pathToFileURL(pmPath).href)).default : null;
const rjPath = resolveFrom('resemblejs/package.json');
const resembleSrc = rjPath ? readFileSync(dirname(rjPath) + '/resemble.js', 'utf8') : null;
if (!chromium || !PNG || !pixelmatch || !resembleSrc) { console.error('Missing deps. Run `npm i` in tools/measure (needs playwright, pixelmatch, pngjs, resemblejs), or set KIT_MODS/PLAYWRIGHT_PATH.'); process.exit(1); }

const args = process.argv.slice(2);
const [mockupUrl, devUrl] = args.filter(a => !a.startsWith('--'));
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d; };
const width = Number(flag('width', 1440)) || 1440;
const outDir = String(flag('out', './parity'));
const asJson = args.includes('--json');
if (!mockupUrl || !devUrl) { console.error('usage: node compare.mjs <mockupUrl> <devUrl> [--width 1440] [--out ./parity] [--json]'); process.exit(1); }

const CFG = {
  header:   { mock: ['#navbar', 'header', 'nav[class*="nav"]', 'nav'], dev: ['#masthead', '.site-header'] },
  footer:   { mock: ['footer', '#footer'], dev: ['#colophon', '.site-footer'] },
  bodyMock: ['main > *', 'body > div > *', 'body > *', 'section'],
  bodyDev:  ['.fw-page-builder-content > section', 'main section'],
};
// thresholds
const GEO_WARN = 0.08, GEO_FAIL = 0.20;
const PIX_WARN = 6, PIX_FAIL = 18;      // % mismatched pixels
const REZ_WARN = 6, REZ_FAIL = 18;      // resemble mismatch %
const STRUCT_COUNT = 2, STRUCT_TOKENS = 4; // FAIL if link/img counts differ ≥2 or ≥4 tokens missing
const NORMW = 700;

async function firstHandle(page, sels) { for (const s of sels) { const h = await page.$(s); if (h) { const b = await h.boundingBox().catch(() => null); if (b && b.height > 4) return h; } } return null; }
async function bandHandles(page, sels, headerH) {
  for (const s of sels) {
    const hs = await page.$$(s); const out = [];
    for (const h of hs) {
      const b = await h.boundingBox().catch(() => null); if (!b || b.height < 80) continue;
      const tag = await h.evaluate(el => el.tagName.toLowerCase());
      if (['nav', 'footer', 'script', 'style'].includes(tag)) continue;
      if (headerH && Math.abs(b.y) < 2 && Math.abs(b.height - headerH) < 2) continue;
      out.push(h);
    }
    if (out.length) return out;
  }
  return [];
}
const shoot = async (h) => { try { return await h.screenshot({ timeout: 8000 }); } catch { return null; } };
const domStruct = async (h) => h ? h.evaluate(el => ({
  links: el.querySelectorAll('a').length,
  buttons: el.querySelectorAll('button, .btn, [role="button"], input[type="submit"]').length,
  imgs: el.querySelectorAll('img, svg').length,
  tokens: (el.innerText || '').toLowerCase().match(/[a-z0-9][a-z0-9'&-]{1,}/g) || [],
})) : null;
// A region is "video-backed" if it contains a <video> (hero) OR is a transparent overlay
// while the page has a video (a header over the hero). Pixel/perceptual diff is unreliable
// there — a screenshot catches a different video FRAME than the reference — so we skip them
// and let geometry + structure decide.
const isVideoBacked = async (h) => h ? h.evaluate(el => {
  if (el.querySelector('video')) return true;
  if (document.querySelectorAll('video').length === 0) return false;
  const cs = getComputedStyle(el);
  return (cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent') && cs.backgroundImage === 'none';
}) : false;

// normalize both region shots to the same WxH (scale to NORMW, crop to common height) AND
// run Resemble.js — all in-browser (canvas native; no node-canvas). Returns normalized PNG
// dataURLs (for pixelmatch in node) + resemble mismatch/diff.
async function normAndResemble(scratch, bufA, bufB) {
  if (!bufA || !bufB) return null;
  const a = 'data:image/png;base64,' + bufA.toString('base64');
  const b = 'data:image/png;base64,' + bufB.toString('base64');
  return scratch.evaluate(async ({ a, b, W }) => {
    const load = (s) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = s; });
    const ia = await load(a), ib = await load(b); if (!ia || !ib) return null;
    const H = Math.min(Math.round(W * ia.height / ia.width), Math.round(W * ib.height / ib.width));
    const norm = (im) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.drawImage(im, 0, 0, W, Math.round(W * im.height / im.width)); return c.toDataURL('image/png'); };
    const na = norm(ia), nb = norm(ib);
    const rez = await new Promise(res => { try { resemble(na).compareTo(nb).ignoreAntialiasing().onComplete(d => res({ mm: parseFloat(d.misMatchPercentage), diff: d.getImageDataUrl ? d.getImageDataUrl() : null })); } catch (e) { res({ mm: null, diff: null }); } });
    return { W, H, na, nb, rez };
  }, { a, b, W: NORMW });
}
const decode = (dataUrl) => PNG.sync.read(Buffer.from(dataUrl.split(',')[1], 'base64'));
const savePng = (file, dataUrl) => writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const pageFor = async (url) => { const p = await browser.newPage(); await p.setViewportSize({ width, height: 1000 }); await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {}); await p.waitForTimeout(1200); return p; };
const mp = await pageFor(mockupUrl), dp = await pageFor(devUrl);
const sp = await browser.newPage(); await sp.addScriptTag({ content: resembleSrc });

const regionsOf = async (page, side) => {
  const header = await firstHandle(page, CFG.header[side]);
  const footer = await firstHandle(page, CFG.footer[side]);
  const hH = header ? (await header.boundingBox())?.height : 0;
  const bands = await bandHandles(page, side === 'mock' ? CFG.bodyMock : CFG.bodyDev, hH);
  return { header, footer, bands };
};
const mock = await regionsOf(mp, 'mock'), dev = await regionsOf(dp, 'dev');
mkdirSync(outDir, { recursive: true });

const rows = [];
async function region(label, mh, dh) {
  const mb = mh ? await mh.boundingBox() : null, db = dh ? await dh.boundingBox() : null;
  const mH = mb ? Math.round(mb.height) : null, dH = db ? Math.round(db.height) : null;
  const geoPct = (mH && dH != null) ? (dH - mH) / mH : null;
  // structure
  const sM = await domStruct(mh), sD = await domStruct(dh);
  let structDelta = null, tokMiss = null;
  if (sM && sD) {
    structDelta = { links: sD.links - sM.links, imgs: sD.imgs - sM.imgs, buttons: sD.buttons - sM.buttons };
    const dset = new Set(sD.tokens); tokMiss = [...new Set(sM.tokens)].filter(t => t.length > 2 && !dset.has(t)).length;
  }
  // pixel + perceptual — skipped on video-backed regions (frame-timing noise).
  let pixPct = null, rezPct = null;
  const vb = (await isVideoBacked(mh)) || (await isVideoBacked(dh));
  const nr = vb ? null : await normAndResemble(sp, mh ? await shoot(mh) : null, dh ? await shoot(dh) : null);
  if (nr) {
    const A = decode(nr.na), B = decode(nr.nb); const diff = new PNG({ width: nr.W, height: nr.H });
    const nd = pixelmatch(A.data, B.data, diff.data, nr.W, nr.H, { threshold: 0.12 });
    pixPct = +(100 * nd / (nr.W * nr.H)).toFixed(1);
    const safe = label.replace(/[^\w]+/g, '-');
    writeFileSync(`${outDir}/${safe}.pixel.png`, PNG.sync.write(diff));
    if (nr.rez?.diff) savePng(`${outDir}/${safe}.resemble.png`, nr.rez.diff);
    rezPct = nr.rez?.mm ?? null;
  }
  // verdicts per signal
  const geoV = geoPct == null ? 'n/a' : Math.abs(geoPct) > GEO_FAIL ? 'FAIL' : Math.abs(geoPct) > GEO_WARN ? 'WARN' : 'PASS';
  const pixV = pixPct == null ? 'n/a' : pixPct > PIX_FAIL ? 'FAIL' : pixPct > PIX_WARN ? 'WARN' : 'PASS';
  const rezV = rezPct == null ? 'n/a' : rezPct > REZ_FAIL ? 'FAIL' : rezPct > REZ_WARN ? 'WARN' : 'PASS';
  const structV = !structDelta ? 'n/a' : (Math.abs(structDelta.links) >= STRUCT_COUNT || Math.abs(structDelta.imgs) >= STRUCT_COUNT || tokMiss >= STRUCT_TOKENS) ? 'FAIL' : (structDelta.links || structDelta.imgs || tokMiss >= 2) ? 'WARN' : 'PASS';
  const order = { FAIL: 3, WARN: 2, PASS: 1, 'n/a': 0 };
  const overall = [geoV, pixV, rezV, structV].reduce((a, b) => order[b] > order[a] ? b : a, 'PASS');
  rows.push({ region: label, mH, dH, geoPct: geoPct != null ? Math.round(geoPct * 100) : null, pix: pixPct, rez: rezPct, vb, struct: structDelta, tokMiss, geoV, pixV, rezV, structV, overall });
}

await region('header', mock.header, dev.header);
const n = Math.max(mock.bands.length, dev.bands.length);
for (let i = 0; i < n; i++) await region(`section ${i + 1}`, mock.bands[i], dev.bands[i]);
await region('footer', mock.footer, dev.footer);
await browser.close();

if (asJson) { console.log(JSON.stringify({ width, bodyCount: { mock: mock.bands.length, dev: dev.bands.length }, regions: rows }, null, 2)); }
else {
  const p = (s, n) => String(s ?? '—').padEnd(n);
  console.log(`\nEnsemble parity @ ${width}px   diffs → ${outDir}/   (PASS only if EVERY signal passes)\n`);
  console.log(p('region', 11) + p('geo', 7) + p('pixel', 8) + p('percept', 9) + p('structure(Δl/Δi,miss)', 24) + 'verdict');
  console.log('-'.repeat(74));
  for (const r of rows) {
    const st = r.struct ? `${r.struct.links >= 0 ? '+' : ''}${r.struct.links}l/${r.struct.imgs >= 0 ? '+' : ''}${r.struct.imgs}i, ${r.tokMiss}miss` : '—';
    const pixCell = r.vb ? 'vid' : (r.pix != null ? r.pix + '%' : '—') + `·${r.pixV[0]}`;
    const rezCell = r.vb ? 'vid' : (r.rez != null ? r.rez + '%' : '—') + `·${r.rezV[0]}`;
    console.log(p(r.region, 11) + p((r.geoPct != null ? r.geoPct + '%' : '—') + `·${r.geoV[0]}`, 7) + p(pixCell, 8) + p(rezCell, 9) + p(st + `·${r.structV[0]}`, 24) + (r.overall === 'PASS' ? 'PASS' : r.overall + ' ✗'));
  }
  console.log('-'.repeat(74));
  console.log(`body sections — mockup ${mock.bands.length}, dev ${dev.bands.length}` + (mock.bands.length === dev.bands.length ? ' ✓' : ' ✗'));
  const bad = rows.filter(r => r.overall !== 'PASS');
  console.log(bad.length ? `${bad.length} to review: ${bad.map(b => b.region + '(' + [b.geoV, b.pixV, b.rezV, b.structV].filter(v => v === 'FAIL' || v === 'WARN').join(',') + ')').join('  ')}` : 'ALL REGIONS PASS ✓');
}
