// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// spacing-audit.mjs — the BOX-SPACING lens: every padding / margin / gap in a region, source vs build.
//
// Why this exists: the other lenses here measure TEXT. Typography compares matched text elements,
// geometry compares column x-positions, vertical-spacing compares gaps between text rows. Spacing,
// though, lives on the CONTAINERS — a section's padding, a wrapper's margin, a flex gap — and those
// carry no text, so nothing matched them and nothing reported them. A converted page could differ by
// a 32px wrapper margin on every band and every lens would still say PASS.
//
// It walks both documents, keeps only boxes that actually declare spacing, builds a signature per box
// (padding|margin|gap + a shape hint) and diffs the two ordered sequences. Output is the boxes that
// differ, plus boxes present on one side only — which is how a DROPPED wrapper shows up.
//
//   node spacing-audit.mjs <sourceUrl> <buildUrl> [--src-sel header] [--build-sel "section:first-of-type"]
//   node spacing-audit.mjs <src> <build> --limit 40 --width 1440
import { launchBrowser, openPage, closeQuiet, evaluateSafe } from './lib/browser.mjs';

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith('--'));
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const [srcUrl, buildUrl] = pos;
if (!srcUrl || !buildUrl) {
  console.error('usage: node spacing-audit.mjs <sourceUrl> <buildUrl> [--src-sel css] [--build-sel css] [--limit N] [--width 1440]');
  process.exit(1);
}
const srcSel = flag('src-sel', 'body');
const bldSel = flag('build-sel', 'body');
const width = parseInt(flag('width', '1440'), 10) || 1440;
const limit = parseInt(flag('limit', '60'), 10) || 60;

// Runs in the page. Collects every box under `sel` that declares padding / margin / gap.
const collectBoxes = ({ sel }) => {
  const root = document.querySelector(sel);
  if (!root) return { error: 'selector not found: ' + sel };
  const num = (v) => Math.round(parseFloat(v) || 0);
  const out = [];
  const walk = (el, depth) => {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && c.display !== 'none') {
      const pad = [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(num);
      const mar = [c.marginTop, c.marginRight, c.marginBottom, c.marginLeft].map(num);
      const gap = num(c.rowGap) || num(c.columnGap) ? [num(c.rowGap), num(c.columnGap)] : [0, 0];
      if (pad.some(Boolean) || mar.some(Boolean) || gap.some(Boolean)) {
        // A short, structural label: the first words of its own text, else its tag + shape.
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
        out.push({
          depth,
          tag: el.tagName.toLowerCase(),
          label: (own || (el.textContent || '').trim()).slice(0, 30),
          w: Math.round(r.width), h: Math.round(r.height),
          pad, mar, gap,
          disp: c.display,
        });
      }
    }
    for (const k of el.children) walk(k, depth + 1);
  };
  walk(root, 0);
  return { boxes: out };
};

const sig = (b) => `${b.pad.join('/')}|${b.mar.join('/')}|${b.gap.join('/')}`;
const fmt = (b) => `${String(b.w).padStart(4)}x${String(b.h).padStart(4)} pad ${b.pad.join(',').padEnd(14)} mar ${b.mar.join(',').padEnd(14)} gap ${b.gap.join(',').padEnd(6)} ${b.tag} ${JSON.stringify(b.label).slice(0, 30)}`;

const b = await launchBrowser();
try {
  const [sp, bp] = await Promise.all([openPage(b, srcUrl, { width }), openPage(b, buildUrl, { width })]);
  const [s, d] = await Promise.all([
    evaluateSafe(sp, collectBoxes, { sel: srcSel }),
    evaluateSafe(bp, collectBoxes, { sel: bldSel }),
  ]);
  await closeQuiet(sp, bp);
  if (s.error || d.error) { console.error(s.error || d.error); process.exit(1); }

  console.log(`\n=== SPACING AUDIT  (source ${s.boxes.length} spaced boxes  |  build ${d.boxes.length}) ===\n`);

  // Compare the DISTRIBUTION first: a value the source uses a lot and the build never does is the
  // clearest signal that a whole class of spacing was dropped or rewritten.
  const tally = (boxes, key) => {
    const m = new Map();
    for (const bx of boxes) for (const v of bx[key]) if (v) m.set(v, (m.get(v) || 0) + 1);
    return m;
  };
  for (const key of ['pad', 'mar', 'gap']) {
    const sm = tally(s.boxes, key); const dm = tally(d.boxes, key);
    const vals = [...new Set([...sm.keys(), ...dm.keys()])].sort((a, z) => z - a);
    const rows = vals.map((v) => ({ v, s: sm.get(v) || 0, d: dm.get(v) || 0 })).filter((r) => r.s !== r.d);
    if (!rows.length) { console.log(`${key}: distribution matches`); continue; }
    console.log(`${key} values whose COUNT differs (source → build):`);
    for (const r of rows.slice(0, 14)) {
      const note = r.d === 0 ? '  ← never used in build' : r.s === 0 ? '  ← build-only' : '';
      console.log(`   ${String(r.v).padStart(4)}px : ${String(r.s).padStart(3)} → ${String(r.d).padStart(3)}${note}`);
    }
    console.log('');
  }

  // Then the ordered walk, so a specific box can be found.
  const n = Math.max(s.boxes.length, d.boxes.length);
  let shown = 0;
  console.log('per-box walk (only where the signature differs):');
  for (let i = 0; i < n && shown < limit; i++) {
    const a = s.boxes[i]; const z = d.boxes[i];
    if (a && z && sig(a) === sig(z)) continue;
    shown++;
    console.log(`  #${String(i).padStart(3)} SRC ${a ? fmt(a) : '(none)'}`);
    console.log(`       BLD ${z ? fmt(z) : '(none)'}`);
  }
  if (!shown) console.log('  every box signature matches');
} finally { await closeQuiet(b); }
