// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// The page-canvas lens: it must REPORT a dropped canvas gradient (the defect no lens saw) and must NOT
// cry wolf when the two sides express the same gradient in different colour syntax.
// Run: node canvas-key.test.mjs
import { gradShape, canvasDeltas } from './canvas-key.mjs';

let fails = 0;
const ok = (c, m, got) => { console.log((c ? '  ✓ ' : '  ✗ FAIL ') + m + (c ? '' : '  (got: ' + JSON.stringify(got) + ')')); if (!c) fails++; };

console.log('\n=== page canvas lens ===');

const SRC = { color: 'oklch(0.205 0.045 265)', attachment: 'fixed', size: 'auto',
  image: 'linear-gradient(145deg, oklch(0.205 0.045 265) 0%, oklab(0.345976 0.0227877 -0.0963011) 38%, oklab(0.387292 -0.0395197 -0.0403311) 70%, oklch(0.205 0.045 265) 100%)' };
// What the converter emitted BEFORE the fix: the colour survived, the gradient did not.
const WAS = { color: 'rgb(13, 22, 44)', attachment: 'scroll', size: 'auto', image: 'none, none' };
// What it emits now: same gradient through rgb() syntax.
const NOW = { color: 'rgb(13, 22, 44)', attachment: 'fixed, fixed', size: 'auto',
  image: 'linear-gradient(145deg, rgb(13, 22, 44) 0%, rgb(52, 48, 106) 38%, rgb(29, 74, 91) 70%, rgb(13, 22, 44) 100%), none' };

{
  // THE PROOF THE LENS WOULD HAVE CAUGHT IT. A lens that cannot move when a defect is fixed is itself a bug.
  const d = canvasDeltas(SRC, WAS);
  ok(d.some((x) => x.prop === 'canvas gradient' && /LOST ITS GRADIENT/.test(x.dev)), 'reports a DROPPED canvas gradient', d);
}
{
  const d = canvasDeltas(SRC, NOW);
  ok(!d.some((x) => x.prop.startsWith('canvas gradient ')), 'no false gradient delta across oklch/oklab vs rgb syntax', d);
  ok(!d.some((x) => x.prop === 'canvas background-color'), 'no false colour delta for the same colour in two syntaxes', d);
  // NOT a defect: the theme reserves a second background slot for the pattern, so a pattern-less page
  // renders `<gradient>, none` and every layered longhand doubles. Comparing the LISTS made the lens
  // report a defect on a canvas that matches, so only the gradient's own (first) layer is compared.
  ok(!d.some((x) => x.prop === 'canvas background-attachment'), 'no false delta from the reserved pattern layer', d);
  ok(d.length === 0, 'a matching canvas produces NO deltas at all', d);
}
{
  // A genuinely different gradient must NOT pass.
  const other = Object.assign({}, NOW, { attachment: 'fixed', image: 'linear-gradient(90deg, rgb(13, 22, 44) 0%, rgb(255, 0, 0) 100%)' });
  const d = canvasDeltas(SRC, other);
  ok(d.some((x) => x.prop === 'canvas gradient angle'), 'reports a wrong angle', d);
  ok(d.some((x) => x.prop === 'canvas gradient colors'), 'reports wrong stop colours', d);
  ok(d.some((x) => x.prop === 'canvas gradient stops'), 'reports a wrong stop count/positions', d);
}
ok(gradShape('none') === null, 'gradShape ignores a non-gradient');
ok(gradShape('radial-gradient(circle, #fff 0%, #000 100%)').kind === 'radial', 'gradShape reads radial');
ok(canvasDeltas(SRC, SRC).length === 0, 'identical canvases produce no deltas', canvasDeltas(SRC, SRC));

console.log(fails === 0 ? '\n✓ ALL PASS — the canvas lens sees a dropped gradient and ignores syntax\n' : '\n✗ ' + fails + ' FAILURE(S)\n');
process.exit(fails === 0 ? 0 : 1);
