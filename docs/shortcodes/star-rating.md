# `star_rating` — Star Rating

A rating display with partial (half / decimal) fill — stars, hearts, circles or a bar — plus an optional label, value and count text. Leaf node: `{ type:'simple', shortcode:'star_rating', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `rating` | slider | `4.5` | number `0`–`10`, step `0.5` | The score (clamped to `max`; supports half steps). |
| `max` | select | `'5'` | `5` `10` | The scale the rating is out of. |
| `label` | text | `''` | string | Optional text before the symbols (e.g. "Excellent"). |
| `show_value` | switch | `'yes'` | `'yes'` \| `'no'` | Show "4.5/5" after the symbols. |
| `count_text` | text | `''` | string | Optional, e.g. "based on 220 reviews". |
| `design` | image-picker | `'star'` | `star` `heart` `circle` `bar` | The symbol / display type. |
| `size` | select | `'md'` | `xs` `sm` `md` `lg` `xl` | Symbol size. |
| `align` | alignment | `'left'` | `left` `center` `right` | Alignment. |
| `fill_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Filled-symbol color. |
| `empty_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Empty-symbol color. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Label / value text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "rating": 4.5,
  "max": "5",
  "label": "Excellent",
  "show_value": "yes",
  "count_text": "based on 220 reviews",
  "design": "star",
  "size": "md",
  "align": "left",
  "fill_color": { "predefined": "", "custom": "" },
  "empty_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `rating` is a numeric slider value (0–10) clamped to `max`, so both 5- and 10-point scales work; keep `rating` on the same scale as `max`.
- For the color pickers, only the **custom** hex is applied to `--sr-fill` / `--sr-empty` / `--sr-text` at render time (the preset choice is stored but not consumed) — set `custom` if you need an exact symbol color.
- The `bar` design renders a single track filled to `rating/max`; the other designs draw `max` symbols with fractional fill.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
