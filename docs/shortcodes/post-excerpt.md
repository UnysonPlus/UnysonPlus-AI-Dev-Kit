# `post_excerpt` — Post Excerpt

A **dynamic post-data element** (used in post / archive templates) that outputs the excerpt of the post being viewed. Leaf node: `{ type:'simple', shortcode:'post_excerpt', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — it renders the current post's excerpt (the manual excerpt, or a trimmed auto-excerpt); there is nothing to type.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
