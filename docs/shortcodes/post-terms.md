# `post_terms` — Post Terms

A **dynamic post-data element** (used in post / archive templates) that outputs the taxonomy terms (categories, tags, or a custom taxonomy) of the post being viewed. Leaf node: `{ type:'simple', shortcode:'post_terms', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `taxonomy` | select | `'category'` | public taxonomy slugs | Which terms to show (Categories, Tags, or custom). |
| `term_prefix` | text | `''` | string | Text before the terms, e.g. "Filed under:". |
| `term_separator` | text | `', '` | string | String between terms. |
| `link_terms` | switch | `'yes'` | `'yes'` \| `'no'` | Link each term to its archive. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "taxonomy": "category",
  "term_prefix": "",
  "term_separator": ", ",
  "link_terms": "yes",
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — the terms resolve from the current post; there is nothing to type.
- `taxonomy` choices are the site's public taxonomies (defaults to `category`, with `post_tag` and any custom taxonomies also available).
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
