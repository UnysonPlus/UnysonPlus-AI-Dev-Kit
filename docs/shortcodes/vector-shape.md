<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `vector_shape` — Vector Shape

A shape the user draws (or pastes) kept as clean inline SVG: badges, ornaments, simple marks, cut-out decorations. Palette tab **Media Elements**. Leaf node: `{ type:'simple', shortcode:'vector_shape', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `spacing`, advanced) documented in `README.md`. This file lists only the **shortcode-specific** atts. For a ready-made icon use `icon` (its picker searches the bundled packs) instead.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `svg` | vector-svg | `''` | SVG markup string | The shape. Sanitised on save (`fw_upw_sanitize_svg`); a value without `<svg` becomes `''`. See [`../option-types/vector-svg.md`](../option-types/vector-svg.md). |
| `label` | text | `''` | string | Screen-reader description. Set → `role="img" aria-label`; empty → `aria-hidden="true"` (decorative). |
| `link` | text | `''` | URL | Optional: wraps the shape in a link. |
| `width` | unit-input | `{value:'160',unit:'px'}` | units `px` `%` `em` `rem` `vw` | Width; height follows the viewBox. |
| `align` | select | `'left'` | `left` `center` `right` | Alignment. |
| `color_mode` | select | `'own'` | `own` `mono` | `own` = colours as drawn; `mono` = every non-`none` fill/stroke becomes `currentColor`. |
| `shape_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Colour used by `mono`; empty follows the text colour. |

## Ready-to-use example (the atts object)
```json
{
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M50,5l13,32h34l-27,21l10,33l-30,-20l-30,20l10,-33l-27,-21h34z\" fill=\"#00b295\"/></svg>",
  "label": "A star badge",
  "link": "",
  "width": { "value": "120", "unit": "px" },
  "align": "center",
  "color_mode": "mono",
  "shape_color": { "predefined": "", "custom": "#2f74e6" }
}
```

## Notes
- Write the SVG yourself when building with an agent: plain `<path>` / `<rect>` / `<circle>` / `<ellipse>` / `<polygon>` elements, each with its own `fill` (and `stroke`/`stroke-width` for outlines), a tight `viewBox`, no `<script>`, no event handlers, no external `href`. The user can open it in the editor later (pasted groups are flattened, clip masks dropped).
- `mono` CSS: `.vshape--mono .vshape__svg [fill]:not([fill="none"]) { fill: currentColor }` (and the same for `stroke`). Draw with real colours and let `mono` recolour, rather than writing `currentColor` into the SVG.
- Empty `svg` renders nothing for visitors and an editor notice for logged-in editors.
- Wrapper classes: `vshape`, `vshape--mono`, `vshape--center|--right`; inner `.vshape__svg` (width), optional `a.vshape__link`.
- Public doc: `docs/shortcodes/media-elements/vector-shape` on docs.unysonplus.com. Live demo: demos.unysonplus.com/shortcodes/icon/#sc-vector-shape.
