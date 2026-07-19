# `feature_list` — Feature List

An icon-led list (checklist / per-item icons / numbered / bullets / badge) with optional sub-text and per-item links, 1–3 columns. Leaf node: `{ type:'simple', shortcode:'feature_list', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `items` | addable-popup | `[]` | array of item objects (see below) | The list entries. |
| `design` | image-picker | `'check'` | `check` `icon` `numbered` `bullet` `badge` | Marker style for each item. |
| `columns` | select | `'1'` | `'1'` `'2'` `'3'` | Number of columns. |
| `dividers` | switch | `'no'` | `'yes'` \| `'no'` | Show a divider between rows. |
| `spacing_size` | select | `'md'` | `'sm'` (tight) `'md'` (normal) `'lg'` (roomy) | Row spacing. |
| `box_style` | box-style picker | `''` | box-preset picker object | Apply a Box Preset to each feature item. |
| `marker_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Marker / icon color (`kind: bg`). |
| `marker_size` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Marker / icon size. Empty = default. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Item text color (`kind: text`). |
| `sub_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Sub-text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

### item object (`items[]`)
`text` (text, default `'Feature item'`), `subtext` (text — optional smaller line), `icon` (icon-v2 — used by the icon / badge designs), `state` (`'on'` = check / `'off'` = cross + strike, checklist design only; default `'on'`), `link_url` (text — makes the item a link), `link_target` (switch `'_blank'`/`'_self'`, default `'_self'`).

## Ready-to-use example (the atts object)
```json
{
  "items": [
    { "text": "Unlimited projects", "subtext": "", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "state": "on", "link_url": "", "link_target": "_self" },
    { "text": "Priority support", "subtext": "24/7 response", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "state": "on", "link_url": "", "link_target": "_self" }
  ],
  "design": "check",
  "columns": "1",
  "dividers": "no",
  "spacing_size": "md",
  "box_style": "",
  "marker_color": { "predefined": "", "custom": "" },
  "marker_size": { "value": "", "unit": "px" },
  "text_color": { "predefined": "", "custom": "" },
  "sub_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `icon` uses the **icon-v2** shape and is only shown by the `icon` / `badge` designs. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`; none: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`.
- `state: off` (cross + strike) only applies to the `check` (checklist) design.
- Renders a `<ul>` grid that collapses to one column ≤768px.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
