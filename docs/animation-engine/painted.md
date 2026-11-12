<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# painted — Painted (Animation Engine)

Paints a decoration onto an element with real brushes (p5.brush) when it scrolls into view, then draws it on. Rides the
node **`fx.painted`** slot (picker key **`mode`**; "off" value `none`). Per-element (every element's Animations tab,
category *Ambient*). Requires the **animation-engine extension ACTIVE**. Public doc: `/painted` on the docs site.

## Styles

6 `mode` keys, each with its own option group (same fields, different defaults):

| `mode` | Paints | Fit (auto) | Defaults |
|---|---|---|---|
| `wash` | watercolour wash behind | element | pencil, `#8ecae6`, spread 18, bleed 0.2, outline off |
| `frame` | sketched pencil frame (crossing corners) | element | pencil, `#1c1e22`, spread 10, size 1.4 |
| `highlight` | streaky marker band behind the words | content | marker, `#ffd84d`, spread 6 |
| `underline` | crayon stroke under the words | content | crayon, `#e63946`, spread 8, size 1.2 |
| `circle` | ink loop round the words | content | ink, `#e63946`, spread 16, size 1.4 |
| `hatch` | diagonal hatching behind | element | pencil, `#2a9d8f`, spread 12, strength 0.45 |

## Value shape

```json
"painted": { "mode": "circle", "circle": {
  "medium": "ink",
  "color": { "predefined": "", "custom": "#e63946" },
  "size": 1.4, "strength": 1, "spread": 16, "fit": "auto",
  "duration": 1.2, "delay": 0, "layer": "behind", "seed": 0
} }
```

Fill styles (`wash`, `highlight`, `hatch`) also take `outline` (`yes`/`no`) and `line_color`; `wash` takes `bleed`,
`texture`; `hatch` takes `gap`, `angle`. Unset keys fall back to the style's defaults, so `{ "mode": "underline" }` alone
is valid.

## Params

| Param | Type | Range / values | Notes |
|---|---|---|---|
| `medium` | select | `pencil` `ink` `fineliner` `marker` `charcoal` `crayon` `pastel` `coloured pencil` | The line / hatching brush. |
| `color` | colour | preset or hex | Paint (fill styles) or line (line styles). Resolved to hex server-side. |
| `outline`, `line_color` | switch, colour | fill styles | A brush outline round the paint. |
| `size` | slider | 0.2–6 | Brush size. |
| `bleed`, `texture` | slider | 0–1 | `wash` only. |
| `gap`, `angle` | slider | 2–30 px, −90–90° | `hatch` only. |
| `strength` | slider | 0.1–1 | Paint opacity (hatching applies it as the layer's opacity). |
| `spread` | slider | 0–80 px | How far the painting reaches past the box. |
| `fit` | select | `auto` `content` `element` | `content` = union of the text line boxes and inline-block / replaced children. |
| `duration` | slider | 0–4 s | Paint-on time; 0 = shown finished. |
| `delay` | number | s | |
| `layer` | select | `behind` `front` | `front` = z-index 2 + `mix-blend-mode: multiply`. |
| `seed` | number | 0–9999 | 0 = derived from the config + element index. |

## How it runs

- PHP (`modules/painted/includes/painted-render.php`) stamps `class="upw-painted"` + `data-upw-paint='<json>'` on the
  wrapper (forces a wrapper). **Do not `esc_attr` the JSON**: `fw_attr_to_html` escapes attributes itself, and a second
  escape leaves `&quot;` in the DOM so the runtime silently falls back to defaults (this happened during the build).
- `static/js/painted.js` (one runtime, `needs_raf`) loads the engine lazily from
  `shortcodes/studio-scene/static/js/vendor/scene-paint.js` (filter `upw_painted_engine_src`) when an element comes
  within 400 px of the viewport, paints it ONCE into two canvases (fill + line) in a host layer inside the element, then
  animates only CSS masks (conic for closed outlines and the circle, linear for the underline; the fill fades and
  sweeps in at 100°) on `window.upwAnimRaf`. Repaints (finished) on a size change via ResizeObserver.
- Canvas size is capped at 1.6 M device pixels; the host is clamped to the page width so it never causes a sideways
  scroll. Reduced motion → shown finished. No WebGL2 → the element stays unpainted.
- The engine module is `window.UnysonPlusScenePaint.paint(job, canvas)`: the same file and `PaintJob` shape as
  Kinetic Scenes' Painted look (`packages/player/src/paintLayer.ts`). p5.brush is MIT (credit kept in the file header).

## Notes

- Hatching over a see-through card crosses its text; keep `strength` low or use it behind a card with a background.
- A multi-line heading gets one highlight / circle round all its lines.
- Demo: `/animation-engine/painted/` on the demos network (built by `build-engine-demos.mjs`, helper `PT()`).
