# `highlight_text` — Highlight Text

A short run of text (heading, paragraph or inline `<span>`) given a decorative effect — marker highlight, gradient fill, underline, outline, glow or drop cap. Leaf node: `{ type:'simple', shortcode:'highlight_text', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `prefix` | text | `''` | string | Plain text BEFORE the highlighted text, same line (trailing space added). |
| `text` | textarea | `'Make it stand out.'` | string (basic inline HTML ok) | The part that receives the effect. For Drop cap, a full paragraph. |
| `suffix` | text | `''` | string | Plain text AFTER the highlighted text, same line (leading space added). |
| `tag` | select | `'h2'` | `h1` `h2` `h3` `h4` `h5` `h6` `p` `span` `div` | Wrapping HTML tag. Use `p` for Drop cap. |
| `fx` | image-picker | `'marker'` | `marker` `gradient` `underline` `outline` `glow` `dropcap` | The highlight effect. |
| `align` | alignment | `'left'` | `left` `center` `right` | Text alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Base text color (`kind: text`). |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Marker / gradient start / underline / glow / drop-cap color (`kind: bg`). |
| `accent2_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Gradient end color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "prefix": "Build it",
  "text": "visually",
  "suffix": "and ship faster.",
  "tag": "h2",
  "fx": "marker",
  "align": "left",
  "text_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "bg-yellow", "custom": "" },
  "accent2_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `text` accepts basic inline HTML (bold, italic, links). Split a phrase across `prefix` + `text` + `suffix` to emphasise just the middle run inside a heading.
- The `gradient` effect uses both `accent_color` (start) and `accent2_color` (end); the other effects use only `accent_color`.
- For the `dropcap` effect set `tag` to `p` and put a full paragraph in `text`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
