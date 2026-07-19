# `featured_image` — Featured Image

Outputs the current post / page's featured image at a chosen registered size, optionally linked. A dynamic-content element (it pulls the post thumbnail, not an uploaded image). Leaf node: `{ type:'simple', shortcode:'featured_image', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image_size` | select | `'large'` | `thumbnail` `medium` `large` `full` (+ any registered intermediate sizes) | Which registered image size to output. |
| `link_to` | select | `'none'` | `none` `post` `file` | Wrap the image in no link, a link to the post/page, or a link to the full image file. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment of the image within its column. |

## Ready-to-use example (the atts object)
```json
{
  "image_size": "large",
  "link_to": "none",
  "text_align": "center"
}
```

## Notes
- This element renders the **post's featured image** (post thumbnail) — there is no upload field here. For an arbitrary uploaded image use `media_image` (`image.md`).
- Custom theme-registered image sizes appear in the `image_size` choices automatically.
- Registered intermediate size slugs vary per install; `thumbnail` / `medium` / `large` / `full` are always present.
