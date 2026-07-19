# `post_meta` — Post Meta

A **dynamic post-data element** (used in post / archive templates) that outputs a custom-field (post meta) value of the post being viewed, with optional before / after text. Leaf node: `{ type:'simple', shortcode:'post_meta', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `meta_key` | text | `''` | post meta key | Which custom field to display. Nothing renders if the field is empty. |
| `before_text` | text | `''` | string | Text before the value. |
| `after_text` | text | `''` | string | Text after the value. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "meta_key": "reading_time",
  "before_text": "",
  "after_text": " min read",
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — the value resolves from the current post's `meta_key`; there is nothing to type for the value itself.
- Renders nothing when the named field is empty or absent.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
