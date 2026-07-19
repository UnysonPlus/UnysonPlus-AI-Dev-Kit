# `progress` — Progress / Skills

Labelled progress indicators that fill (and optionally count their % up) when scrolled into view — as horizontal bars, circular rings, semi-circle gauges, pies, vertical bars, or segmented blocks. Leaf node: `{ type:'simple', shortcode:'progress', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `layout` | multi-picker | `{type:'bar'}` | picker `type`: `bar` `circle` `gauge` `pie` `vertical` `segmented` | The progress style. Non-bar styles reveal sizing sub-options. |
| `bars` | addable-popup | `[]` | array of bar objects (see below) | The progress items. |
| `height` | text | `'10px'` | CSS length | Bar thickness (horizontal bars). |
| `value_position` | select | `'head'` | `head` (beside label) `inside` (in the bar) | Where the % renders (bars). |
| `rounded` | switch | `'yes'` | `'yes'` \| `'no'` | Round the bar / ring ends. |
| `striped` | switch | `'no'` | `'yes'` \| `'no'` | Diagonal stripe texture (bars). |
| `show_value` | switch | `'yes'` | `'yes'` \| `'no'` | Display the % value. |
| `animate` | switch | `'yes'` | `'yes'` \| `'no'` | Fill on scroll into view. |
| `count_up` | switch | `'yes'` | `'yes'` \| `'no'` | Count the % up from 0 while filling. |
| `gap` | text | `'1.1rem'` | CSS length | Space between items. |
| `fill_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Default fill color (per-bar color overrides). |
| `fill_color_2` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Optional second color → gradient fill. |
| `track_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Unfilled track behind each item. |
| `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:text`) | Label / percentage text color. |

The `layout` picker reveals sub-options per style: `circle` → `circle_size` (`'120'`), `circle_thickness` (`10`), `circle_columns` (`'3'`); `gauge` → `gauge_size` (`'160'`), `gauge_thickness` (`12`), `gauge_columns` (`'3'`); `pie` → `pie_size` (`'140'`), `pie_columns` (`'3'`); `vertical` → `vertical_height` (`'180'`), `vertical_columns` (`'3'`); `segmented` → `segment_count` (`10`).

Each **bar** object: `label` (text), `percent` (slider `0`–`100`, default `80`), `icon` (icon-v2, optional), `color` (compact color-preset, `kind:bg` — overrides the section fill).

## Ready-to-use example (the atts object)
```json
{
  "layout": { "type": "bar" },
  "bars": [
    { "label": "Interface Design", "percent": 90, "icon": { "type": "none" }, "color": { "predefined": "", "custom": "" } },
    { "label": "Development",      "percent": 80, "icon": { "type": "none" }, "color": { "predefined": "", "custom": "" } },
    { "label": "Marketing",        "percent": 65, "icon": { "type": "none" }, "color": { "predefined": "", "custom": "" } }
  ],
  "height": "10px",
  "value_position": "head",
  "rounded": "yes",
  "striped": "no",
  "show_value": "yes",
  "animate": "yes",
  "count_up": "yes",
  "gap": "1.1rem",
  "fill_color": { "predefined": "", "custom": "" },
  "fill_color_2": { "predefined": "", "custom": "" },
  "track_color": { "predefined": "", "custom": "" },
  "label_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `layout` is a multi-picker; the saved shape includes the chosen `type` plus that type's sub-option key (e.g. `{ "type":"circle", "circle": { "circle_size":"120", ... } }`). For `bar` no sub-options are needed.
- `percent` is a numeric slider value (0–100), not a string. Switches are strings (`'yes'`/`'no'`).
- Circle/gauge/pie SVG strokes need a real color — presets resolve to hex; if neither preset nor custom is set the CSS default applies.
- Setting `fill_color_2` turns the fill into a gradient between `fill_color` and `fill_color_2`.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
