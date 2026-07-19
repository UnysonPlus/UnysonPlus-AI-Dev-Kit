# `post_date` — Post Date

A **dynamic post-data element** (used in post / archive templates) that outputs the published or last-modified date of the post being viewed. Leaf node: `{ type:'simple', shortcode:'post_date', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `date_type` | select | `'published'` | `published` `modified` | Published date or last-modified date. |
| `date_format` | text | `''` | PHP date format | e.g. `F j, Y`. Blank = the site date format. |
| `link_to_post` | switch | `'no'` | `'yes'` \| `'no'` | Link the date to the post. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "date_type": "published",
  "date_format": "F j, Y",
  "link_to_post": "no",
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — the date resolves from the current post; there is nothing to type.
- `date_format` uses PHP `date()` tokens (e.g. `F j, Y`, `M j`, `Y-m-d`). Blank falls back to the site's configured date format.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
