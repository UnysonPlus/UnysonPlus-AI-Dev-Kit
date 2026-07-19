# `svg_draw` — SVG Draw

A self-drawing line-art SVG — the strokes draw themselves on scroll, load, hover, or scrubbed with scroll, with an optional fill after drawing. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'svg_draw', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `svg` | multi-picker | `{source:'preset'}` | see Notes | The artwork source (built-in preset, pasted code, or uploaded `.svg`). |
| `trigger` | image-picker | `'view'` | `view` `scrub` `load` `hover` | When the drawing runs (`scrub` ties progress to scroll; ignores Draw duration). |
| `duration` | slider | `1.6` | 0.3–6 (s) | Draw duration. |
| `stagger` | slider | `0.15` | 0–1 (s) | Delay between paths. |
| `direction` | select | `'normal'` | `normal` `reverse` | Draw direction. |
| `loop` | switch | `'no'` | `'yes'` \| `'no'` | Draw, erase and redraw forever. |
| `stroke_width` | slider | `2` | 1–12 (px) | Outline stroke width. |
| `stroke_color` | color-preset | `{predefined:'',custom:'#2f74e6'}` | compact color object | Stroke color (`kind: text`). |
| `fill_after` | switch | `'no'` | `'yes'` \| `'no'` | Fade in a fill once the outline finishes. |
| `fill_color` | color-preset | `{predefined:'',custom:'#2f74e6'}` | compact color object | Fill color (`kind: bg`), used when `fill_after: yes`. |
| `max_width` | slider | `320` | 0–1200 (px) | Constrain artwork width (0 = SVG's natural size). |
| `align` | select | `'center'` | `left` `center` `right` | Horizontal alignment. |

## Ready-to-use example (the atts object)
```json
{
  "svg": {
    "source": "preset",
    "preset": { "preset": "signature" },
    "code": { "code": "" },
    "upload": { "file": "" }
  },
  "trigger": "view",
  "duration": 1.6,
  "stagger": 0.15,
  "direction": "normal",
  "loop": "no",
  "stroke_width": 2,
  "stroke_color": { "predefined": "", "custom": "#2f74e6" },
  "fill_after": "no",
  "fill_color": { "predefined": "", "custom": "#2f74e6" },
  "max_width": 320,
  "align": "center"
}
```

## Notes
- `svg` is a **multi-picker**: `{ "source": "preset"|"code"|"upload", "preset": { "preset": "<slug>" }, "code": { "code": "<svg markup>" }, "upload": { "file": "<media>" } }`. The safe generator emits all three branches (defaulted) plus the active `source`.
  - `preset` slugs: `signature` `underline` `arrow` `check` `wave` `star` `heart` `circle`.
  - `code` → paste the full `<svg>…</svg>` markup (scripts/handlers stripped). Outline (stroke) paths draw best.
  - `upload` → a `.svg` file (inlined so its paths can animate).
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
