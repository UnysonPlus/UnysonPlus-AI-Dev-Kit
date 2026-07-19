# `svg_morph` — SVG Morph

A shape that smoothly morphs through a sequence of SVG silhouettes (blobs, geometric shapes, custom paths) — looping, on hover, on view, or on click. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'svg_morph', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `shapes_list` | addable-popup | 3 blob shapes (see example) | array — see Notes | The shapes it morphs through, in order (add 2+; drag to reorder). |
| `loopback` | switch | `'yes'` | `'yes'` \| `'no'` | Morph from the last shape back to the first for a seamless cycle. |
| `render_mode` | select | `'fill'` | `fill` `stroke` | Filled shape vs outline. |
| `trigger` | select | `'loop'` | `loop` `hover` `view` `click` | What drives the morph. |
| `easing` | select | `'ease-in-out'` | `linear` `ease-in` `ease-out` `ease-in-out` | Morph easing. |
| `fill_color` | color-preset | `{predefined:'',custom:'#2f74e6'}` | compact color object | Fill color (`kind: bg`), used in Filled mode. |
| `stroke_color` | color-preset | `{predefined:'',custom:'#2f74e6'}` | compact color object | Stroke color (`kind: text`), used in Outline mode. |
| `stroke_width` | slider | `3` | 1–16 (px) | Outline stroke width. |
| `max_width` | slider | `200` | 40–900 (px) | Size (the shape is square — width = height). |
| `align` | select | `'center'` | `left` `center` `right` | Horizontal alignment. |

## Ready-to-use example (the atts object)
```json
{
  "shapes_list": [
    { "pick": { "source": "library", "library": { "shape": "blob1" } }, "morph_dur": 1.2, "hold": 0.6 },
    { "pick": { "source": "library", "library": { "shape": "blob2" } }, "morph_dur": 1.2, "hold": 0.6 },
    { "pick": { "source": "library", "library": { "shape": "blob3" } }, "morph_dur": 1.2, "hold": 0.6 }
  ],
  "loopback": "yes",
  "render_mode": "fill",
  "trigger": "loop",
  "easing": "ease-in-out",
  "fill_color": { "predefined": "", "custom": "#2f74e6" },
  "stroke_color": { "predefined": "", "custom": "#2f74e6" },
  "stroke_width": 3,
  "max_width": 200,
  "align": "center"
}
```

## Notes
- `shapes_list` is an **addable-popup** repeater; each item is `{ pick, morph_dur, hold }`:
  - `pick` is a **multi-picker**: `{ "source": "library"|"upload"|"custom", "library": { "shape": "<slug>" }, "upload": { "markup": "<svg>" }, "custom": { "d": "<path d>" } }`.
    Library shape slugs: `blob1` `blob2` `blob3` `circle` `square` `triangle` `diamond` `pentagon` `hexagon` `star` `heart` `droplet`. `upload` uses an `svg-code` field (upload `.svg` or paste `<svg>…</svg>`, best with a single silhouette); `custom` takes one path `d`.
  - `morph_dur` (slider, default `1.2`, 0.2–8 s) — morph time from this shape to the next.
  - `hold` (slider, default `0.6`, 0–6 s) — Loop trigger only; how long this shape holds before morphing.
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
