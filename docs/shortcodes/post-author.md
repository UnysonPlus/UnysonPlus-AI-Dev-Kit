# `post_author` — Post Author

A **dynamic post-data element** (used in post / archive templates) that outputs the author of the post being viewed, with an optional prefix, avatar, and link. Leaf node: `{ type:'simple', shortcode:'post_author', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `author_prefix` | text | `''` | string | Text before the name, e.g. "By". |
| `link_to_author` | switch | `'no'` | `'yes'` \| `'no'` | Link the name to the author archive. |
| `show_avatar` | switch | `'no'` | `'yes'` \| `'no'` | Show the author avatar. |
| `avatar_size` | number | `48` | 16–256 (integer px) | Avatar size in pixels. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "author_prefix": "By",
  "link_to_author": "yes",
  "show_avatar": "yes",
  "avatar_size": 40,
  "text_align": "",
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — there is nothing to type for the name; it resolves from the current post in the loop / template context.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
- `avatar_size` only applies when `show_avatar` is `'yes'`.
