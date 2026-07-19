# `post_carousel` — Post Carousel

A **dynamic post-data element** (used in post / archive templates and any page) — a Splide slider of posts (any post type) with featured image, title, excerpt, date, meta and read-more, in three card designs. Leaf node: `{ type:'simple', shortcode:'post_carousel', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `post_type` | select | `'post'` | public post types | Which post type to query. |
| `taxonomy` | text | `'category'` | taxonomy slug | Taxonomy to filter by (category, post_tag, custom). |
| `terms` | text | `''` | comma slugs | Term slugs to include. Blank = all. |
| `number` | text | `'9'` | integer (≤40) | How many posts to load. |
| `orderby` | select | `'date'` | `date` `title` `menu_order` `rand` `comment_count` | Sort field. |
| `order` | select | `'DESC'` | `DESC` `ASC` | Sort direction. |
| `design` | image-picker | `'standard'` | `standard` `overlay` `minimal` | Card design. |
| `image_ratio` | select | `'ratio-16-9'` | `original` `ratio-16-9` `ratio-4-3` `ratio-1-1` `ratio-3-4` | Featured-image aspect ratio. |
| `show_excerpt` | switch | `'yes'` | `'yes'` \| `'no'` | Show the excerpt. |
| `excerpt_length` | text | `'18'` | integer (words) | Excerpt length in words. |
| `show_date` | switch | `'yes'` | `'yes'` \| `'no'` | Show the post date. |
| `show_meta` | switch | `'no'` | `'yes'` \| `'no'` | Show author / category. |
| `readmore` | text | `'Read More'` | string | Read-more text. Blank to hide the link. |
| `per_view` | select | `'3'` | `1` `2` `3` `4` | Slides visible at once. |
| `gap` | select | `'4'` | gap-scale slug | Gap between slides → `var(--gap-<slug>)`. |
| `autoplay` | switch | `'no'` | `'yes'` \| `'no'` | Auto-advance slides. |
| `loop` | switch | `'yes'` | `'yes'` \| `'no'` | Loop back to the start. |
| `arrows` | switch | `'yes'` | `'yes'` \| `'no'` | Show prev/next arrows. |
| `dots` | switch | `'yes'` | `'yes'` \| `'no'` | Show pagination dots. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Accent (links / meta) (`kind: bg`). |
| `card_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Card background (`kind: bg`). |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Body text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "post_type": "post",
  "taxonomy": "category",
  "terms": "",
  "number": "9",
  "orderby": "date",
  "order": "DESC",
  "design": "standard",
  "image_ratio": "ratio-16-9",
  "show_excerpt": "yes",
  "excerpt_length": "18",
  "show_date": "yes",
  "show_meta": "no",
  "readmore": "Read More",
  "per_view": "3",
  "gap": "4",
  "autoplay": "no",
  "loop": "yes",
  "arrows": "yes",
  "dots": "yes",
  "accent_color": { "predefined": "", "custom": "" },
  "card_bg": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Dynamic element — cards are generated from a live `WP_Query`, not typed content.
- `overlay` design places the text over the image (no excerpt); `minimal` drops the image for an accent left rail.
- Arrows / dots / loop auto-disable when the post count is ≤ `per_view`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
