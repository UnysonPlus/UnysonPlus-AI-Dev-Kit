# `post_title` — Post Title

A **dynamic post-data element** (used in post / archive templates) that outputs the title of the post or page being viewed, in the heading tag you choose. Leaf node: `{ type:'simple', shortcode:'post_title', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `heading_tag` | select | `'h1'` | `h1` `h2` `h3` `h4` `h5` `h6` `p` | HTML tag for the title. Use a single H1 per page for SEO. |
| `link_to_post` | switch | `'no'` | `'yes'` \| `'no'` | Wrap the title in a link to the post / page. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment → Bootstrap `text-*` class on the heading. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "heading_tag": "h1",
  "link_to_post": "no",
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — the title resolves from the current post; there is nothing to type.
- Keep a single `h1` per page; use `h2`–`h6` for titles in a loop / listing to preserve the document outline.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
