// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
/**
 * A colour as a comparable KEY -- 'r,g,b,a', whatever syntax it was written in.
 *
 * Extracted so it can be tested on its own (colorkey.test.mjs) and reused by any lens: every tool that
 * diffs colours needs this, and a string compare is wrong in all of them.
 */
// A colour as a comparable key: 'r,g,b,a', whatever syntax it was written in. A source writes
// `oklab(0.999994 ... / 0.6)` and the build writes `rgba(255, 255, 255, 0.6)` — the SAME colour — and a
// string compare called every one of them a delta. That inflated the count and, worse, hid real ones: a
// fix would land and the number would not move, because the deltas it removed were replaced by spelling
// differences the lens could not see through. The conversions below are the standard ones, so no colour
// space has to be modelled anywhere else in the tools.
const _srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const _oklabToRgb = (L, a, b) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s2 = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s2;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s2;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s2;
  return [R, G, B].map((v) => Math.max(0, Math.min(255, Math.round(_srgb(v) * 255))));
};
const _alphaOf = (t) => (t === undefined || t === '' ? 1 : (String(t).endsWith('%') ? parseFloat(t) / 100 : parseFloat(t)));
function colorKey(v) {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return '';
  if (s === 'transparent') return '0,0,0,0';
  let m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), Math.round(_alphaOf(m[4]) * 100) / 100].join(',');
  m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) { let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), Math.round(a*100)/100].join(','); }
  m = /^oklab\(\s*([\d.]+%?)[,\s]+(-?[\d.]+)[,\s]+(-?[\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) { const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    return [..._oklabToRgb(L, +m[2], +m[3]), Math.round(_alphaOf(m[4]) * 100) / 100].join(','); }
  m = /^oklch\(\s*([\d.]+%?)[,\s]+([\d.]+)[,\s]+(-?[\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) { const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    const C = +m[2], H = (+m[3] * Math.PI) / 180;
    return [..._oklabToRgb(L, C * Math.cos(H), C * Math.sin(H)), Math.round(_alphaOf(m[4]) * 100) / 100].join(','); }
  m = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) return [Math.round(+m[1]*255), Math.round(+m[2]*255), Math.round(+m[3]*255), Math.round(_alphaOf(m[4])*100)/100].join(',');
  return '';
}


export { colorKey };
