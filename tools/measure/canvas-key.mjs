// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// canvas-key -- compare a PAGE CANVAS (the body/html background) by structure rather than spelling.
//
// WHY: the canvas belongs to no region, so no lens reported it. A source whose whole identity was a
// full-height gradient on <body> converted to one flat fill, and every band still matched its own
// counterpart -- so the band scores stayed quiet and the property scan never looked, because it compares
// elements INSIDE regions. This module is the missing read, kept separate from props.mjs so it can be
// tested without launching a browser.
import { colorKey } from './color-key.mjs';

const normStr = (v) => String(v == null ? '' : v).replace(/["']/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
export const isReal = (v) => !!v && v !== 'none' && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent';

// A gradient's STRUCTURE: kind, angle, stop positions and colour KEYS. `oklch(0.205 0.045 265)` and
// `rgb(13, 22, 44)` are one colour, so comparing the strings would report a defect where there is none --
// the same string-vs-value trap that made props.mjs cry wolf on every oklab colour before color-key.mjs.
export const gradShape = (img) => {
  const str = String(img || '');
  if (!/gradient\(/i.test(str)) return null;
  const kind = (str.match(/(repeating-)?(linear|radial|conic)-gradient/i) || [])[2] || '';
  const angle = (str.match(/(-?[0-9.]+)deg/) || [])[1] || '';
  const stops = (str.match(/(-?[0-9.]+)%/g) || []).join(',');
  const colors = (str.match(/(?:#[0-9a-f]{3,8}|rgba?\([^)]*\)|okl(?:ch|ab)\([^)]*\)|hsla?\([^)]*\)|color\(srgb[^)]*\))/gi) || [])
    .map(colorKey).filter(Boolean).join('|');
  return { kind: kind.toLowerCase(), angle, stops, colors };
};

// Named deltas between two canvas records ({color, image, attachment, size}). Empty array = the page
// canvas matches.
export const canvasDeltas = (a, b) => {
  a = a || {}; b = b || {};
  const out = [];
  const ca = colorKey(a.color), cb = colorKey(b.color);
  if ((ca && cb) ? ca !== cb : normStr(a.color) !== normStr(b.color)) {
    out.push({ prop: 'canvas background-color', mock: a.color, dev: b.color });
  }
  const ga = gradShape(a.image), gb = gradShape(b.image);
  if (ga && !gb) out.push({ prop: 'canvas gradient', mock: String(a.image).slice(0, 120), dev: 'none — THE PAGE LOST ITS GRADIENT' });
  else if (!ga && gb) out.push({ prop: 'canvas gradient', mock: 'none', dev: String(b.image).slice(0, 120) });
  else if (ga && gb) {
    for (const k of ['kind', 'angle', 'stops', 'colors']) {
      if (String(ga[k]) !== String(gb[k])) out.push({ prop: 'canvas gradient ' + k, mock: String(ga[k]) || '(none)', dev: String(gb[k]) || '(none)' });
    }
  }
  // Compare the attachment of the layer that CARRIES the gradient -- the first -- not the whole list.
  // The theme's body rule reserves a second slot for the background pattern
  // (`background-image: var(--site-bg-image, none), var(--site-bg-pattern, none)`), so a page with no
  // pattern legitimately renders `<gradient>, none` and every layered longhand doubles: `fixed, fixed`.
  // Comparing the lists reported that as a defect on a canvas that matches -- the lens crying wolf about
  // its own target, which is how a lens stops being read.
  const att1 = (v) => normStr(String(v || '').split(',')[0]);
  if (ga && gb && att1(a.attachment) !== att1(b.attachment)) out.push({ prop: 'canvas background-attachment', mock: a.attachment, dev: b.attachment });
  return out;
};
