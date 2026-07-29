# `feature_list` — Feature List

An icon-led list (checklist / per-item icons / numbered / bullets / badge) with optional sub-text, per-item links, a right-aligned value, 1–3 columns, and vertical-list **or** horizontal-strip orientation. Leaf node: `{ type:'simple', shortcode:'feature_list', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `items` | addable-popup | `[]` | array of item objects (see below) | The list entries. |
| `design` | image-picker | `'check'` | `check` `check_icon` `numbered` `bullet` `none` | **Default Marker** — the fallback marker for items with NO icon. A per-item `icon` always overrides it. `check_icon` shows a check AND the icon; `none` = icons only (no fallback). Legacy `icon`/`badge` values still render (fold to `check`, and `check`+square icon style). |
| `orientation` | image-picker | `'vertical'` | `'vertical'` (stacked rows, uses `columns`) `'horizontal'` (wrapping inline strip) | List flow. |
| `icon_position` | select | `'left'` | `'left'` (icon left of text) `'top'` (icon above text, centered) | Per-item icon placement. |
| `icon_style` | select | `'plain'` | `'plain'` `'tint'` (soft tint chip) `'circle'` (solid circle) `'outline'` `'square'` (square badge) | Chip drawn around the checklist / per-item icon markers. |
| `columns` | select | `'1'` | `'1'` `'2'` `'3'` | Number of columns (vertical orientation only). |
| `dividers` | switch | `'no'` | `'yes'` \| `'no'` | Show a divider between rows. |
| `zebra` | switch | `'no'` | `'yes'` \| `'no'` | Alternating (zebra) row background. |
| `spacing_size` | select | `'md'` | `'sm'` (tight) `'md'` (normal) `'lg'` (roomy) | Row spacing. |
| `box_style` | box-style picker | `''` | box-preset picker object | Apply a Box Preset to each feature item. |
| `marker_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Marker / icon color (`kind: bg`). |
| `marker_size` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Marker / icon size. Empty = default. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Item text color (`kind: text`). |
| `sub_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Sub-text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

### item object (`items[]`)
`text` (text, default `'Feature item'`), `subtext` (text — optional smaller line), `value_text` (text — optional right-aligned value on the same row, e.g. `"96%"`), `icon` (icon-v2 — used by the icon / badge designs), `marker_color` (compact color `{predefined,custom}`, `kind: bg` — override the marker color for this item only), `state` (`'on'` = check / `'off'` = cross + strike, checklist design only; default `'on'`), `link_url` (text — makes the item a link), `link_target` (switch `'_blank'`/`'_self'`, default `'_self'`).

## Ready-to-use example (the atts object)
```json
{
  "items": [
    { "text": "Unlimited projects", "subtext": "", "value_text": "", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "marker_color": { "predefined": "", "custom": "" }, "state": "on", "link_url": "", "link_target": "_self" },
    { "text": "Priority support", "subtext": "24/7 response", "value_text": "", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "marker_color": { "predefined": "", "custom": "" }, "state": "on", "link_url": "", "link_target": "_self" }
  ],
  "design": "check",
  "orientation": "vertical",
  "icon_position": "left",
  "icon_style": "plain",
  "columns": "1",
  "dividers": "no",
  "zebra": "no",
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
- **A per-item `icon` always overrides the Default Marker** (`design`) — set an item's `icon` and it renders as that item's marker under any `design`. `design` is only the fallback for items whose `icon` is `type:'none'`. (Exceptions: `design:'numbered'` keeps its number; `state:'off'` always shows the cross; `design:'check_icon'` shows both a check and the icon.) `icon` uses the **icon-v2** shape. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`; none: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`.
- Pair `design` with `icon_style` (tint / circle / outline / square) to chip the icon/check markers.
- `state: off` (cross + strike) only applies to the `check` (checklist) marker.
- `orientation: horizontal` flows items in a wrapping inline strip (ignores `columns` / `zebra`); `vertical` renders the `<ul>` grid that collapses to one column ≤768px.
- `icon_style` (tint / circle / outline / square) draws a chip around the **checklist** and **per-item icon** markers only — numbered and bullet markers keep their own shape. On `design: badge` the badge look wins over `icon_style`.
- `value_text` renders a right-aligned value on the row (spec/stat rows); `marker_color` overrides `--fl-marker` for that one item.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
