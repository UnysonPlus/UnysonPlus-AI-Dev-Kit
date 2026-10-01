// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// elements.mjs — finding an element and reading its box + computed props, in ONE place.
//
// Five tools each had their own copy of "querySelector / match by text, then read getComputedStyle".
// They disagreed in small ways that mattered: some matched the first element containing a string
// (a wrapper), some the smallest (the leaf); some returned the raw rect, some a rounded one. A
// measurement is only comparable across tools if they all pick the same element and round the same
// way, so both rules live here.

/** The props worth printing when the caller doesn't name any — spacing and type first. */
export const DEFAULT_PROPS = [
  'fontSize', 'fontWeight', 'color', 'backgroundColor',
  'margin', 'marginTop', 'marginBottom', 'padding', 'paddingTop', 'paddingBottom',
  'textAlign', 'lineHeight', 'letterSpacing', 'display', 'width', 'maxWidth',
  'borderRadius', 'boxShadow',
];

/**
 * Runs INSIDE the page (must stay serialisable — no imports, no closures over module scope).
 *
 * `sel` is a CSS selector; `text` is a case-insensitive substring of trimmed textContent. For text
 * the SMALLEST match wins (fewest descendants) so "Reserve a Spot" resolves to the <span> that
 * carries the type, not the <section> that contains it — measuring the wrapper is the classic way
 * to get a confidently wrong number.
 *
 * @returns {Array<{text,tag,cls,rect:{x,y,w,h},props:Object}>}
 */
export const collectElements = ({ sel, text, props, all }) => {
  const pick = () => {
    if (sel) return [...document.querySelectorAll(sel)];
    const needle = String(text).toLowerCase();
    const hit = [...document.querySelectorAll('body *')].filter(
      (e) => (e.textContent || '').toLowerCase().includes(needle) && e.offsetParent !== null
    );
    hit.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    return hit;
  };
  return pick().slice(0, all ? 20 : 1).map((e) => {
    const cs = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    const o = {};
    for (const p of props) o[p] = cs[p];
    return {
      text: (e.textContent || '').trim().slice(0, 48),
      tag: e.tagName.toLowerCase(),
      cls: (e.className || '').toString().slice(0, 70),
      // y is document-relative so two pages can be compared even when they scroll differently
      rect: { x: Math.round(r.left), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      props: o,
    };
  });
};

/**
 * Diff two collected elements: only the props (and rect axes) that actually differ.
 * @returns {Array<{prop:string, source:*, build:*}>}
 */
export function diffElements(source, build, props) {
  if (!source || !build) return [];
  const rect = ['x', 'y', 'w', 'h']
    .map((k) => ({ prop: 'rect.' + k, source: source.rect[k], build: build.rect[k] }))
    .filter((d) => d.source !== d.build);
  const rest = props
    .map((p) => ({ prop: p, source: source.props[p], build: build.props[p] }))
    .filter((d) => String(d.source) !== String(d.build));
  return [...rect, ...rest];
}
