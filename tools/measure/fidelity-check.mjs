// 4-LENS fidelity check for a single region (capture-first). Verifies a build
// region against its source with four independent lenses, because no one lens
// catches everything:
//   Lens 1  TYPOGRAPHY/CONTENT — per element (matched by text): fontSize, weight,
//           color, family, textTransform, exact text/emoji, icon-kind, box SHAPE
//           (square/rounded/pill/circle from border-radius) + missing/extra.
//   Lens 2  GEOMETRY — column x-positions, widths, and sibling OVERLAP.
//   Lens 3  PIXEL — region side-by-side + pixelmatch %.
//   Lens 4  VERTICAL SPACING — stacked-row gaps + region bottom margin (drives exit code).
// Build to the SOURCE spec, then run this per region before advancing.
// NOTE: this rendered check is the FROM-SCRATCH verification path, and the SECONDARY
// (assembly) confirmation for a conversion. For a CONVERSION the PRIMARY proof is the
// browser-free class-string fixture (tailwind-matrix.test.mjs) — see tools/README.md.
//
// Usage: node fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>
//   e.g. node fidelity-check.mjs https://src/ footer http://localhost/demos/pinky-bites/ footer
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';

const [srcUrl, srcSel, buildUrl, buildSel] = process.argv.slice(2);
if (!srcUrl || !srcSel || !buildUrl || !buildSel) {
  console.error('usage: node fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>');
  process.exit(1);
}
const VW = 1440;

async function capture(page, url, sel) {
  await page.setViewportSize({ width: VW, height: 1000 });
  // 'load' + a fixed settle, NOT 'networkidle' — SPAs (Wegic, Next.js, analytics beacons)
  // keep the network busy and never reach idle, which made this checker time out.
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);
  const region = await page.$(sel);
  if (!region) return { spec: [], shot: null, box: null };
  await region.scrollIntoViewIfNeeded().catch(() => {});
  const spec = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const EMOJI = /\p{Extended_Pictographic}/u;
    const out = [];
    root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,span,li,strong,button,div').forEach((el) => {
      let t = ''; for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
      t = t.replace(/\s+/g, ' ').trim(); if (t.length < 2) return;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      const c = getComputedStyle(el);
      const iconKind = el.querySelector('svg') ? 'svg'
        : /\b(fa|fas|far|fab|icon-|glyphicon)\b/.test(el.className || '') ? 'font-icon'
        : EMOJI.test(t) ? 'emoji' : 'none';
      // Box SHAPE from border-radius — the dimension the tool was blind to (a source PILL rendered as
      // a rounded-rect slipped straight through). Classify vs the box's short side so it's size-agnostic:
      //   square (~0 radius) · rounded (a corner radius) · pill (radius ≥ half the short side, oblong)
      //   · circle (pill + roughly square box). border-radius in % is resolved to px against the box.
      const brRaw = c.borderTopLeftRadius || '0px';
      let brPx = parseFloat(brRaw) || 0;
      if (/%\s*$/.test(brRaw)) brPx = (parseFloat(brRaw) / 100) * Math.min(r.width, r.height);
      const shortSide = Math.min(r.width, r.height);
      const shape = brPx < 2 ? 'square'
        : (brPx >= shortSide / 2 - 1 ? (Math.abs(r.width - r.height) <= 4 ? 'circle' : 'pill') : 'rounded');
      out.push({ text: t.slice(0, 44), tag: el.tagName.toLowerCase(), br: Math.round(brPx), shape,
        fs: Math.round(parseFloat(c.fontSize)), fw: c.fontWeight, color: c.color,
        family: (c.fontFamily.split(',')[0] || '').replace(/["']/g, ''), tt: c.textTransform,
        // Comprehensive design properties the curated subset used to SKIP (why wavy
        // underlines / bounce animations / shadows were silently missed):
        deco: (c.textDecorationLine === 'none') ? '' : `${c.textDecorationLine} ${c.textDecorationStyle} ${c.textDecorationColor}`,
        anim: (c.animationName === 'none') ? '' : `${c.animationName} ${c.animationDuration} ${c.animationIterationCount}`,
        shadow: (c.boxShadow === 'none') ? '' : c.boxShadow.replace(/\s+/g, ' '),
        transform: (c.transform === 'none') ? '' : c.transform,
        ls: c.letterSpacing === 'normal' ? '' : c.letterSpacing, lh: c.lineHeight,
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), iconKind });
    });
    return out;
  }, sel);
  // Vertical rhythm, measured RELIABLY by anchoring on the region's heading and using its PARENT
  // block: the gaps between that block's own children (overline/title/subtitle) + the block's gap to
  // its next sibling (the "gap below the heading block" — the mb-16 the whole-region scan can't see).
  const headingSpacing = await page.evaluate((sel) => {
    const root = document.querySelector(sel); if (!root) return null;
    const h = root.querySelector('h1,h2,h3,h4,h5,h6'); if (!h) return null;
    const block = h.parentElement;
    const lab = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 14) || e.tagName.toLowerCase();
    const kids = [...block.children].filter((e) => e.getBoundingClientRect().height > 2);
    const gaps = [];
    for (let i = 1; i < kids.length; i++) {
      gaps.push({ px: Math.round(kids[i].getBoundingClientRect().top - kids[i - 1].getBoundingClientRect().bottom), a: lab(kids[i - 1]), b: lab(kids[i]) });
    }
    const nx = block.nextElementSibling;
    return {
      gaps,
      belowGap: nx ? Math.round(nx.getBoundingClientRect().top - block.getBoundingClientRect().bottom) : null,
      belowLabel: nx ? lab(nx) : '', mb: getComputedStyle(block).marginBottom,
    };
  }, sel);
  const shot = await region.screenshot();
  return { spec, shot, headingSpacing };
}

const key = (e) => e.text.toLowerCase().replace(/^[^a-z0-9$]+/i, '').slice(0, 40).trim();
const b = await chromium.launch();
const [ps, pm] = [await b.newPage(), await b.newPage()];
const [S, M] = await Promise.all([capture(ps, srcUrl, srcSel), capture(pm, buildUrl, buildSel)]);
await b.close();

// ---- Lens 1: typography / content ----
const si = new Map(); for (const e of S.spec) if (!si.has(key(e)) || e.fs > si.get(key(e)).fs) si.set(key(e), e);
const mi = new Map(); for (const e of M.spec) if (!mi.has(key(e)) || e.fs > mi.get(key(e)).fs) mi.set(key(e), e);
console.log('===== LENS 1 — typography / content (source → build) =====');
let l1 = 0;
for (const [k, s] of si) {
  const m = mi.get(k);
  if (!m) { console.log(`  − MISSING "${s.text}" [${s.tag} ${s.fs}px ${s.iconKind}]`); l1++; continue; }
  const d = [];
  if (Math.abs(s.fs - m.fs) > 1) d.push(`size ${s.fs}→${m.fs}`);
  if (s.fw !== m.fw) d.push(`weight ${s.fw}→${m.fw}`);
  if (s.color !== m.color) d.push(`color ${s.color}→${m.color}`);
  if (s.family.toLowerCase() !== m.family.toLowerCase()) d.push(`font ${s.family}→${m.family}`);
  if (s.tt !== m.tt) d.push(`text-transform ${s.tt}→${m.tt}`);
  if (s.iconKind !== m.iconKind) d.push(`icon ${s.iconKind}→${m.iconKind}`);
  // Comprehensive design-property diffs (previously never checked → silently missed):
  if (s.deco !== m.deco) d.push(`text-decoration ${s.deco || '∅'}→${m.deco || '∅'}`);
  if (!!s.anim !== !!m.anim) d.push(`animation ${s.anim || 'none'}→${m.anim || 'none'}`);
  if (!!s.shadow !== !!m.shadow) d.push(`box-shadow ${s.shadow ? 'yes' : '∅'}→${m.shadow ? 'yes' : '∅'}`);
  if (s.shape !== m.shape) d.push(`shape ${s.shape}(${s.br}px)→${m.shape}(${m.br}px)`);
  if (s.transform !== m.transform) d.push(`transform ${s.transform || '∅'}→${m.transform || '∅'}`);
  if (s.ls !== m.ls) d.push(`letter-spacing ${s.ls || '∅'}→${m.ls || '∅'}`);
  if (d.length) { console.log(`  ⚠ "${s.text}"  ${d.join(' | ')}`); l1++; }
}
for (const [k, m] of mi) if (!si.has(k)) console.log(`  + EXTRA "${m.text}"`);
if (!l1) console.log('  ✓ typography/content match');

// ---- Lens 2: geometry (overlap + columns) ----
console.log('\n===== LENS 2 — geometry (overlap + columns) =====');
const boxes = M.spec.filter((e) => e.tag !== 'span' && e.w > 30 && e.h > 8);
let overlaps = 0;
for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
  const a = boxes[i], c = boxes[j];
  const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
  const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
  if (ox > 12 && oy > 6 && !(a.x <= c.x && a.x + a.w >= c.x + c.w) && !(c.x <= a.x && c.x + c.w >= a.x + a.w)) {
    if (overlaps < 6) console.log(`  ⚠ OVERLAP "${a.text.slice(0,22)}" ∩ "${c.text.slice(0,22)}" (${ox}px)`);
    overlaps++;
  }
}
const colXsS = [...new Set(S.spec.map((e) => e.x))].sort((x, y) => x - y).filter((x, i, a) => i === 0 || x - a[i-1] > 40);
const colXsM = [...new Set(M.spec.map((e) => e.x))].sort((x, y) => x - y).filter((x, i, a) => i === 0 || x - a[i-1] > 40);
console.log(`  column x-starts  SRC ${colXsS.join(',')}  |  BUILD ${colXsM.join(',')}`);
if (!overlaps) console.log('  ✓ no overlaps');

// ---- Lens 3: pixel ----
console.log('\n===== LENS 3 — pixel mismatch =====');
if (S.shot && M.shot) {
  const W = 700;
  const fit = async (buf) => sharp(buf).resize({ width: W }).png().toBuffer();
  let [a, c] = [await fit(S.shot), await fit(M.shot)];
  const ha = (await sharp(a).metadata()).height, hc = (await sharp(c).metadata()).height;
  const H = Math.max(ha, hc);
  const pad = async (buf) => sharp(buf).extend({ bottom: H - (await sharp(buf).metadata()).height, background: '#fff' }).png().toBuffer();
  a = await pad(a); c = await pad(c);
  const A = PNG.sync.read(a), C = PNG.sync.read(c), out = new PNG({ width: W, height: H });
  const n = pixelmatch(A.data, C.data, out.data, W, H, { threshold: 0.12 });
  console.log(`  ${(100 * n / (W * H)).toFixed(1)}% pixels differ`);
} else console.log('  (region shot missing)');

// ---- Lens 4: vertical spacing (stacked row gaps + region bottom margin), RANKED by delta ----
// The most-visible dimension and the one x-positions/typography can't see. Ranked biggest-first,
// so a VERY obvious 44px miss is reported above a subtle 2px one.
console.log('\n===== LENS 4 — vertical spacing (heading block, ranked: most obvious first) =====');
const HS = S.headingSpacing, HM = M.headingSpacing;
let l4 = 0;
if (!HS || !HM) { console.log('  (no heading block found in one side — skipped)'); }
else {
  const fmt = (h) => h.gaps.map((g) => `${g.px}[${g.a}→${g.b}]`).join(' ') + `  | below→"${h.belowLabel}": ${h.belowGap}px`;
  console.log('  SRC:', fmt(HS));
  console.log('  BLD:', fmt(HM));
  const flags = [];
  for (let i = 0; i < Math.min(HS.gaps.length, HM.gaps.length); i++) {
    const d = Math.abs(HS.gaps[i].px - HM.gaps[i].px);
    if (d > 4) flags.push({ d, msg: `gap "${HS.gaps[i].a}"↕"${HS.gaps[i].b}": ${HS.gaps[i].px}px → ${HM.gaps[i].px}px  (Δ${d})` });
  }
  if (HS.belowGap != null && HM.belowGap != null) {
    const d = Math.abs(HS.belowGap - HM.belowGap);
    if (d > 6) flags.push({ d, msg: `GAP BELOW heading block: ${HS.belowGap}px → ${HM.belowGap}px  (Δ${d})` });
  }
  if (HS.gaps.length !== HM.gaps.length) console.log(`  ⚠ child count differs: SRC ${HS.gaps.length + 1} vs BUILD ${HM.gaps.length + 1}`);
  flags.sort((a, c) => c.d - a.d);
  for (const f of flags) console.log(`  ⚠ ${f.msg}`);
  l4 = flags.length;
  if (!l4) console.log('  ✓ vertical spacing matches');
}
process.exit(l4 ? 1 : 0);
