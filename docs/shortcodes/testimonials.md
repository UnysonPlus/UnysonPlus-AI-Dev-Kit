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
| `box_style` | box-style picker | see Notes | box-preset picker object | Box Preset applied to each card (border/corners/shadow/fill+hover) — on the **Card tab**. |
| `container_type` | select | `'container'` | `''` `container` `container-fluid` | Outer width wrapper. |
| `text_align` | select | `''` | `''` `text-center` `text-end` | Text alignment where the design honours it. |
| `avatar_shape` | select | `'rounded-circle'` | `rounded-circle` `rounded` `rounded-0` | Avatar corner radius. |
| `avatar_size` | select | `'avatar-md'` | `avatar-sm` `avatar-md` `avatar-lg` | Avatar size (mainly the Classic design). |
| `card_rows` | addable-popup | seeded | array of `{ slots:[…], direction, justify, align, reverse }` | **Card Rows** slot designer (own **Card tab**, cross-design; the Classic design's cards render from it). The composable card model shared with `wc_products` / `team-member` / `posts` via `sc_card_rows_field()`. Slots: `quotemark, quote, avatar, name, role, **author** (=name+role stacked), **identity** (=avatar+name+role), rating, site`. Avatar position = which row + its direction (inline = beside, stacked = above/below); a row's **`reverse`** flips an inline row (avatar left↔right) without re-ordering slots. *(Replaced `card_style`, `avatar_position`, `show_rating`, removed 2026-08-01: presence = "is the slot in a row".)* |
| `text_color` / `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text / background color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `quote_color` / `author_name_color` / `author_job_color` / `site_link_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Per-part color overrides. |
| `reviews_schema` | switch | `'no'` | `yes` \| `no` | Emit **Review** / **Rating** JSON-LD (with `Person`/`Organization` authors) so search engines read the testimonials as reviews. |

## Ready-to-use example (the atts object)
```json
{
  "testimonials": [
    { "content": "This completely changed how our team ships work.", "author_avatar": { "attachment_id": 0, "url": "https://example.com/a1.jpg" }, "author_name": "Alex Rivera", "author_job": "Product Lead", "site_name": "", "site_url": "", "rating": 5 },
    { "content": "Reliable, fast, and a joy to use every day.", "author_avatar": { "attachment_id": 0, "url": "https://example.com/a2.jpg" }, "author_name": "Sam Chen", "author_job": "Founder", "site_name": "", "site_url": "", "rating": 4.5 }
  ],
  "design_settings": { "design": "default", "default": { "layout_type": { "layout_choice": "carousel" }, "items_per_slide": "1", "carousel_autoplay": "yes", "carousel_interval": "5000", "carousel_pause_hover": "yes", "carousel_controls": "yes", "carousel_indicators": "yes", "carousel_indicator_style": "dots", "carousel_wrap": "yes" } },
  "box_style": "",
  "container_type": "container",
  "text_align": "",
  "avatar_shape": "rounded-circle",
  "avatar_size": "avatar-md",
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
- For the Classic design, `default.layout_type` is a nested multi-picker: `{ layout_choice:'carousel'|'grid'|'single' }`; the `grid` choice reveals `grid_columns` (`row-cols-1` `row-cols-2` `row-cols-3` `row-cols-4`) + `gutter` (`''` `g-0` `g-1` `g-2` `g-3` `g-4` `g-5`). Carousel options (`carousel_*`) are stored but inert in grid/single.
- Carousel sub-options (revealed by carousel/slider designs — `default`, `split`, `thumbnav`, `spotlight`, `pullquote`): `carousel_autoplay` (`yes`/`no`), `carousel_interval` (ms string), `carousel_pause_hover` (`yes`/`no`), `carousel_controls` (`yes`/`no`), `carousel_indicators` (`yes`/`no`), `carousel_indicator_style` (`none` `dots` `lines`), `carousel_wrap` (`yes`/`no`). The **Card tab** carries the cross-design card model: top-level **`card_rows`** (the Card Rows slot designer, shared helper `sc_card_rows_field()` with `wc_products` / `team-member` / `posts`): `[{ slots:[…], direction:'inline'|'stack', justify, align, reverse }]`; slots = `quotemark, quote, avatar, name, role, author (=name+role), identity (=avatar+name+role), rating, site`; a slot renders only when it's in a row and has content; avatar position = which row + its direction, and a row's `reverse` flips an inline row. It **superseded** `default.card_style` + `default.avatar_position` + `show_rating` (all removed 2026-08-01). The default design's grid/single/carousel cards render from these rows; **structural designs apply a per-design slot filter** — a slot they render in their own fixed position is stripped from the rows so it doesn't double up: `split` / `zigzag` / `thumbnav` filter `avatar` + `identity` (the design owns the media column / thumb rail), and `bubble` filters `quote` (the design owns the balloon); the rows then compose only the remaining body slots. Card-grid designs (`default`, `masonry`, `bento`, `stacked`, `marquee`) filter nothing. The Card tab also shows a **live wireframe card preview** (above the rows, shared with `wc_products` / `team-member` / `posts`) and a **Rating star styling** group (symbol / colors / size, shared with `wc_products`). The card SKIN comes from `box_style` (a Box Preset, also on the Card tab). Other design-specific options: `default.items_per_slide` (`1` `2` `3`); `marquee.marquee_speed` (`slow` `normal` `fast`) + `marquee.marquee_direction` (`left` = Right→Left, `right` = Left→Right); `masonry.masonry_columns` / `bubble.bubble_columns` (`1` `2` `3` `4`); `zigzag.zigzag_start` (`left` `right`).
- `rating` is 0–5 in 0.5 steps — clamp to that range; half-steps render half-stars.
- `author_avatar` is a WP upload **object** (`{ attachment_id, url }`); use `attachment_id: 0` when only a URL is known.
- Cross-design appearance (container, alignment, avatar, colors) stays top-level and applies regardless of design. Colors use the **compact color-preset** shape. See `README.md`.
