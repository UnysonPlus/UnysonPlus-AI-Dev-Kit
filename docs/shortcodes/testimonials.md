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

## Designs at a glance (visual signature → best source match)

The `design` key selects one of **11 registry designs** (the wrapper gets class `testimonials design-<key>`); the Classic design has three sub-modes via `layout_choice`, so there are **12 effective layouts**. Pick by what the source testimonial section *looks like*:

| design | renders as | best source match | # items |
|---|---|---|---|
| `default` + `single` | one quote centred in a ~700px column, no slider chrome | a lone hero/editorial quote (stars + quote + author) | 1 |
| `default` + `grid` | even N-column tiled card grid (`row-cols-1..4`) | a static grid/row of quote cards | few–many |
| `default` + `carousel` | Splide horizontal slider (arrows + dots, 1–3 per view) | a classic "quote + avatar" slider | few–many |
| `marquee` | one continuously auto-scrolling row of 320px cards (loop, edge-fade) | a sideways-scrolling testimonial ticker / wall | many |
| `masonry` | Pinterest `column-count` wall, uneven card heights | a wall of many quotes with ragged/uneven heights | many |
| `split` | big photo column beside a big quote, one per Splide slide | "photo beside quote" featured slider / block (needs per-item photos) | few |
| `bubble` | grid of chat cards — quote in a rounded speech balloon w/ tail, author below | chat/message-styled or balloon-quote grid | few–many |
| `stacked` | minimal vertical list, hairline `border-bottom` dividers, no cards | long-form single-column list of quotes with dividers | few–many |
| `thumbnav` | large single quote synced to a row of circular avatar thumbnails (click-a-face nav) | slider where you pick a person's avatar to switch quotes (needs photos) | few |
| `spotlight` | coverflow — active card full-size, neighbours scaled .84 + dimmed .4 | carousel with a prominent centre card + dimmed side previews | few–many |
| `bento` | asymmetric grid; `testimonials[0]` is a 2×2 featured tile, rest fill 1×1 | "hero quote + smaller supporting quotes" mosaic (item 0 = the strongest) | ≥3 |
| `zigzag` | full-width rows, photo alternates left/right down the page | alternating image/text feature-rows applied to testimonials (needs photos) | few |
| `pullquote` | one oversized editorial statement at a time (giant quote mark, crossfade) | rotating magazine-style pull-quote | 1 at a time |

**Rendered part classes** (for scoped CSS / per-part overrides): quote `.testimonial-quote` (a `<blockquote>`), name `.testimonial-author` (`fw-semibold`), role `.testimonial-job`, site link `.testimonial-site`, rating `.testimonial-rating` (`.ts-star--full/half/empty`), card root `.testimonial-item`, quotemark `.ts-card__quotemark`; structural designs also emit per-design BEM roots (`.ts-marquee__* .ts-masonry__* .ts-split__* .ts-bubble__* .ts-stacked__* .ts-thumbnav__* .ts-spotlight__* .ts-bento__* .ts-zigzag__* .ts-pullquote__*`).

**Card Rows scope (which designs it drives):** only `default`, `split`, `zigzag`, `thumbnav`, `bubble` route through `sc_render_card` and honour `card_rows`; `masonry, bento, stacked, marquee, spotlight, pullquote` build their card markup directly and **ignore** `card_rows`.

**Gotchas:** the ONLY thing required to select a design is `design_settings/design` (all sub-options default); an unknown key falls back to `default`. `default` shows arrows/dots only when `count > items_per_slide`; a grid needs `layout_choice=grid` explicitly (else it defaults to carousel). `split`/`zigzag`/`thumbnav` need per-item `author_avatar` photos or their media column/thumb rail is empty. `bento` uses `testimonials[0]` as the featured hero — order matters. At least one entry is mandatory (empty → "No testimonials found."). Write alignment/choice **keys** (`center`, not `text-center`) — the reader maps them.

## Site Converter — automatic design detection

The deterministic Site Converter **classifies the source testimonial section and picks the closest design** (`FW_Site_Converter_Stitch::detect_testimonial_design()`), instead of always emitting Classic. It's conservative — high-confidence structural signals only, else a safe Classic fallback:

| source signal (class / markup) | → design emitted |
|---|---|
| `marquee` / `animate-marquee` / an infinite-scroll animation | `marquee` |
| a slider lib (`swiper`/`slick`/`embla`/`splide`/…), `role[description]=carousel`, `snap-x`, `overflow-x-auto` | `default` + `carousel` |
| `columns-1..4` / `masonry` (≥3 items) | `masonry` (+ `masonry_columns`) |
| a grid whose FIRST child spans `col-span-2`/`row-span-2` (≥3 items) | `bento` |
| a 2-col (`grid-cols-2` / `md:flex-row`) item with a LARGE non-avatar photo (`w-1/2`/`aspect-*`/`object-cover`) | `split` |
| a single-column list with `divide-y` dividers (≥2 items) | `stacked` |
| ≥2 items in a plain grid | `default` + `grid` (column count carried) |
| exactly 1 item | `default` + `single` |

`bubble`, `thumbnav`, `spotlight`, `zigzag`, `pullquote` are not auto-selected yet (they overlap too much with grid/carousel to detect deterministically) — they fall back to `grid`/`carousel`/`single`. Detection also carries the source author **uppercase + letter-spacing** kicker onto `.testimonial-author`/`.testimonial-job` via scoped `custom_css`.

## Notes
- `design_settings` is a **multi-picker**: shape is `{ design:'<key>', '<key>':{ …that design's options… } }`. Designs: `default` (Classic — carousel/grid/single), `marquee`, `masonry`, `bubble`, `split`, `thumbnav`, `spotlight`, `zigzag`, `pullquote`, `stacked`, `bento`. Only the chosen design's options appear. `stacked` and `bento` have no design-specific options.
- For the Classic design, `default.layout_type` is a nested multi-picker: `{ layout_choice:'carousel'|'grid'|'single' }`; the `grid` choice reveals `grid_columns` (`row-cols-1` `row-cols-2` `row-cols-3` `row-cols-4`) + `gutter` (`''` `g-0` `g-1` `g-2` `g-3` `g-4` `g-5`). Carousel options (`carousel_*`) are stored but inert in grid/single.
- Carousel sub-options (revealed by carousel/slider designs — `default`, `split`, `thumbnav`, `spotlight`, `pullquote`): `carousel_autoplay` (`yes`/`no`), `carousel_interval` (ms string), `carousel_pause_hover` (`yes`/`no`), `carousel_controls` (`yes`/`no`), `carousel_indicators` (`yes`/`no`), `carousel_indicator_style` (`none` `dots` `lines`), `carousel_wrap` (`yes`/`no`). The **Card tab** carries the cross-design card model: top-level **`card_rows`** (the Card Rows slot designer, shared helper `sc_card_rows_field()` with `wc_products` / `team-member` / `posts`): `[{ slots:[…], direction:'inline'|'stack', justify, align, reverse }]`; slots = `quotemark, quote, avatar, name, role, author (=name+role), identity (=avatar+name+role), rating, site`; a slot renders only when it's in a row and has content; avatar position = which row + its direction, and a row's `reverse` flips an inline row. It **superseded** `default.card_style` + `default.avatar_position` + `show_rating` (all removed 2026-08-01). The default design's grid/single/carousel cards render from these rows; **structural designs apply a per-design slot filter** — a slot they render in their own fixed position is stripped from the rows so it doesn't double up: `split` / `zigzag` / `thumbnav` filter `avatar` + `identity` (the design owns the media column / thumb rail), and `bubble` filters `quote` (the design owns the balloon); the rows then compose only the remaining body slots. Card-grid designs (`default`, `masonry`, `bento`, `stacked`, `marquee`) filter nothing. The Card tab also shows a **live wireframe card preview** (above the rows, shared with `wc_products` / `team-member` / `posts`) and a **Rating star styling** group (symbol / colors / size, shared with `wc_products`). The card SKIN comes from `box_style` (a Box Preset, also on the Card tab). Other design-specific options: `default.items_per_slide` (`1` `2` `3`); `marquee.marquee_speed` (`slow` `normal` `fast`) + `marquee.marquee_direction` (`left` = Right→Left, `right` = Left→Right); `masonry.masonry_columns` / `bubble.bubble_columns` (`1` `2` `3` `4`); `zigzag.zigzag_start` (`left` `right`).
- `rating` is 0–5 in 0.5 steps — clamp to that range; half-steps render half-stars.
- `author_avatar` is a WP upload **object** (`{ attachment_id, url }`); use `attachment_id: 0` when only a URL is known.
- Cross-design appearance (container, alignment, avatar, colors) stays top-level and applies regardless of design. Colors use the **compact color-preset** shape. See `README.md`.
