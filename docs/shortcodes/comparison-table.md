# `comparison_table` — Comparison Table

A feature-comparison matrix — plans across the top, feature rows down the side. Leaf node: `{ type:'simple', shortcode:'comparison_table', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `columns` | addable-popup | `[]` | array of column objects (see below) | Each column = one plan / product across the top. |
| `rows` | addable-popup | `[]` | array of row objects (see below) | Each row = one feature down the side. |
| `style` | select | `'bordered'` | `'bordered'` `'striped'` `'minimal'` | Table visual style. |
| `highlight_featured` | switch | `'yes'` | `'yes'` \| `'no'` | Emphasize the featured column. |
| `sticky_header` | switch | `'no'` | `'yes'` \| `'no'` | Keep plan headers visible while scrolling. |
| `center_cells` | switch | `'yes'` | `'yes'` \| `'no'` | Center the cell values. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Checks / featured accent (`kind: bg`). |
| `header_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Header background (`kind: bg`). |
| `header_text` | color-preset | `{predefined:'',custom:''}` | compact color object | Header text (`kind: text`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Cell text (`kind: text`). |
| `border_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Border color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

### column object (`columns[]`)
`name` (text, default `'Plan'`), `price` (text — e.g. `"$29 / mo"`), `badge` (text — optional ribbon), `featured` (switch `'yes'`/`'no'`, default `'no'`), `button_text` (text), `button_url` (text), `button_target` (switch `'_blank'`/`'_self'`, default `'_self'`).

### row object (`rows[]`)
`is_heading` (switch `'yes'`/`'no'` — renders the label as a full-width group heading), `label` (text, default `'Feature'`), `tooltip` (text — small note under the label), `values` (textarea — **one line per column, in column order**: `yes`/`y`/`true`/`✓` → check, `no`/`n`/`false`/`✗` → cross, `-`/`dash`/`n/a` → dash, any other text → literal, e.g. `Up to 5`. Missing lines render a dash).

## Ready-to-use example (the atts object)
```json
{
  "columns": [
    { "name": "Starter", "price": "$0", "badge": "", "featured": "no", "button_text": "Choose", "button_url": "#", "button_target": "_self" },
    { "name": "Pro", "price": "$29 / mo", "badge": "Popular", "featured": "yes", "button_text": "Choose", "button_url": "#", "button_target": "_self" }
  ],
  "rows": [
    { "is_heading": "no", "label": "Projects", "tooltip": "", "values": "Up to 3\nUnlimited" },
    { "is_heading": "no", "label": "Priority support", "tooltip": "", "values": "no\nyes" }
  ],
  "style": "bordered",
  "highlight_featured": "yes",
  "sticky_header": "no",
  "center_cells": "yes",
  "accent_color": { "predefined": "", "custom": "" },
  "header_bg": { "predefined": "", "custom": "" },
  "header_text": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "border_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- The matrix is two flat 1-D repeaters, not a 2-D grid. **Cell order = column order** — if you reorder `columns`, reorder each row's `values` lines to match.
- Renders a real `<table>` inside a horizontally scrollable wrapper. CSS-only, no JS. External plan buttons get `target="_blank" rel="noopener noreferrer"`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
