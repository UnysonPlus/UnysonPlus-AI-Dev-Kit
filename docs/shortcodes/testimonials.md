# `testimonials` — Testimonials

A multi-item testimonial widget with swappable designs (carousel, grid, marquee, masonry, bubble, split, spotlight, zigzag, and more). Leaf node: `{ type:'simple', shortcode:'testimonials', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `testimonials` | addable-popup | `[]` | array of `{ content, author_avatar, author_name, author_job, site_name, site_url, rating }` | The testimonial entries. |
| `testimonials[].content` | textarea | `''` | inline HTML (safe subset) | The quote body. `<strong> <em> <a> <br>` allowed; block markup is stripped. |
| `testimonials[].author_avatar` | upload | `''` | `{ attachment_id, url }` | Avatar image. |
| `testimonials[].author_name` | text | `''` | string | Author name (bold line under the quote). |
| `testimonials[].author_job` | text | `''` | string | Job title / role (small, muted). |
| `testimonials[].site_name` | text | `''` | string | Link text for the source site. |
| `testimonials[].site_url` | text | `''` | URL | Adds `rel="nofollow" target="_blank"` when set. |
| `testimonials[].rating` | slider | `5` | 0–5 in 0.5 steps | Renders 5 rating stars (full / half). |
| `design_settings` | multi-picker | `{design:'default'}` | see Notes | Picks the design and reveals only that design's options. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Box Preset applied to each card (grid / card designs). |
| `container_type` | select | `'container'` | `''` `container` `container-fluid` | Outer width wrapper. |
| `text_align` | select | `''` | `''` `text-center` `text-end` | Text alignment where the design honours it. |
| `avatar_shape` | select | `'rounded-circle'` | `rounded-circle` `rounded` `rounded-0` | Avatar corner radius. |
| `avatar_size` | select | `'avatar-md'` | `avatar-sm` `avatar-md` `avatar-lg` | Avatar size (mainly the Classic design). |
| `show_rating` | switch | `'yes'` | `yes` \| `no` | Toggle star display across all designs. |
| `text_color` / `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text / background color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `quote_color` / `author_name_color` / `author_job_color` / `site_link_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Per-part color overrides. |

## Ready-to-use example (the atts object)
```json
{
  "testimonials": [
    { "content": "This completely changed how our team ships work.", "author_avatar": { "attachment_id": 0, "url": "https://example.com/a1.jpg" }, "author_name": "Alex Rivera", "author_job": "Product Lead", "site_name": "", "site_url": "", "rating": 5 },
    { "content": "Reliable, fast, and a joy to use every day.", "author_avatar": { "attachment_id": 0, "url": "https://example.com/a2.jpg" }, "author_name": "Sam Chen", "author_job": "Founder", "site_name": "", "site_url": "", "rating": 4.5 }
  ],
  "design_settings": { "design": "default", "default": { "layout_type": { "layout_choice": "carousel" }, "items_per_slide": "1", "card_style": "card card-body shadow", "avatar_position": "top", "carousel_autoplay": "yes", "carousel_interval": "5000", "carousel_pause_hover": "yes", "carousel_controls": "yes", "carousel_indicators": "yes", "carousel_indicator_style": "dots", "carousel_wrap": "yes" } },
  "box_style": "",
  "container_type": "container",
  "text_align": "",
  "avatar_shape": "rounded-circle",
  "avatar_size": "avatar-md",
  "show_rating": "yes",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "quote_color": { "predefined": "", "custom": "" },
  "author_name_color": { "predefined": "", "custom": "" },
  "author_job_color": { "predefined": "", "custom": "" },
  "site_link_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `design_settings` is a **multi-picker**: shape is `{ design:'<key>', '<key>':{ …that design's options… } }`. Designs: `default` (Classic — carousel/grid/single), `marquee`, `masonry`, `bubble`, `split`, `thumbnav`, `spotlight`, `zigzag`, `pullquote`, `stacked`, `bento`. Only the chosen design's options appear. `stacked` and `bento` have no design-specific options.
- For the Classic design, `default.layout_type` is a nested multi-picker: `{ layout_choice:'carousel'|'grid'|'single' }`; the `grid` choice reveals `grid_columns` (`row-cols-1..4`) + `gutter` (`g-0..g-5`). Carousel options (`carousel_*`) are stored but inert in grid/single.
- `rating` is 0–5 in 0.5 steps — clamp to that range; half-steps render half-stars.
- `author_avatar` is a WP upload **object** (`{ attachment_id, url }`); use `attachment_id: 0` when only a URL is known.
- Cross-design appearance (container, alignment, avatar, colors) stays top-level and applies regardless of design. Colors use the **compact color-preset** shape. See `README.md`.
