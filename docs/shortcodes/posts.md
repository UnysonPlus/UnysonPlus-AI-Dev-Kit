# `posts` — Posts

A data-driven query grid: pulls content from the WordPress post DB (`WP_Query`) and renders each result through one of many registry card designs inside a `grid` / `list` / `masonry` / `slider` layout. Leaf node: `{ type:'simple', shortcode:'posts', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts. The picker option ids resolve to the flat keys below via the view's `normalize_atts()`, so generators may emit these flat keys directly.

## atts (grouped — flat keys the view reads)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `use_current_query` | switch | `'no'` | `'yes'` \| `'no'` | Use the current page's posts (archive/search/blog index); ignores the query fields below. |
| `post_type` | select (dynamic) | `'post'` | any public post type | Source content type. |
| `taxonomy_filter` | text | `''` | `taxonomy:term,term` | Filter by terms (e.g. `category:news,tech`). |
| `taxonomy_relation` | radio | `'IN'` | `IN` `AND` `NOT IN` | Match any / all / exclude terms. |
| `include_ids` | text | `''` | CSV of IDs | Cherry-pick posts (overrides taxonomy filter). |
| `exclude_ids` | text | `''` | CSV of IDs | Hide these posts. |
| `author_ids` | text | `''` | CSV of user IDs | Limit to authors. |
| `date_range` | select | `'any'` | `any` `last_7` `last_30` `last_90` `this_year` | Published-date window. |
| `posts_per_page` | short-text | `'6'` | integer (`-1` = all) | Result count per page. |
| `offset` | short-text | `'0'` | integer | Skip N posts. |
| `orderby` | select | `'date'` | `date` `modified` `title` `rand` `comment_count` `menu_order` `meta_value_num` | Sort key. |
| `meta_key` | text | `''` | string | Required for `meta_value_num` ordering. |
| `order` | radio | `'DESC'` | `DESC` `ASC` | Sort direction. |
| `exclude_current` | switch | `'yes'` | `'yes'` \| `'no'` | Hide the post being viewed (for "Related"). |
| `sticky_handling` | select | `'default'` | `default` `pin_top` `ignore` `only` | Sticky-post strategy. |
| `layout_mode` | select | `'grid'` | `grid` `list` `masonry` `slider` | Container arrangement. |
| `card_style` | select | `'standard'` | registry design keys (see Notes) | Per-card design. |
| `columns_desktop` | select/multi-picker | `'3'` | `1`–`6` | Desktop card count (tablet/phone auto-derive). |
| `column_gap` | select | `''` | Gap-Scale preset slug | Horizontal grid gap. |
| `row_gap` | select | `''` | Gap-Scale preset slug | Vertical grid gap. |
| `equal_height` | switch | `'yes'` | `'yes'` \| `'no'` | Match card heights per row (grid). |
| `featured_treatment` | select | `'none'` | `none` `first-post-2x` `first-post-hero` | Special first-post handling (grid). |
| `image_size` | select | `'medium_large'` | `thumbnail` `medium` `medium_large` `large` `full` | Registered image size. |
| `image_ratio` | select | `'ratio-16-9'` | `ratio-16-9` `ratio-4-3` `ratio-3-2` `ratio-1-1` `ratio-2-3` `ratio-auto` | Crop aspect ratio. |
| `fallback_image_url` | text | `''` | URL string | Shown when a post has no featured image. |
| `card_padding` | select | `'regular'` | `none` `compact` `regular` `spacious` | Card density. |
| `text_align` | select | `'left'` | `left` `center` `right` | Card text alignment. |
| `image_width_ratio` | select | `'40-60'` | `30-70` (30% / 70%) `40-60` (40% / 60%) `50-50` (50% / 50%) `60-40` (60% / 40%) | Image / content width ratio (side / alternating / hero card styles). |
| `image_vertical_align` | select | `'stretch'` | `top` `center` `stretch` | Image vertical align (side / alternating card styles). |
| `content_vertical_align` | select | `'top'` | `top` `center` `bottom` `space-between` (Justify) | Content vertical align (side / alternating card styles). |
| `slider_arrows_position` | select | `'outside'` | `inside` `outside` `above` `hidden` | Slider arrow position (slider layout). |
| `slider_dots_position` | select | `'below'` | `below` `overlay-bottom` (Overlay) `hidden` | Slider dots position (slider layout). |
| `slider_autoplay` | switch | `'no'` | `'yes'` \| `'no'` | Slider autoplay (slider layout). |
| `slider_interval` | short-text | `'5000'` | integer (ms) | Slider autoplay interval (slider layout). |
| `slider_loop` | switch | `'yes'` | `'yes'` \| `'no'` | Slider loop (slider layout). |
| `element_order` | addable-box | image, cats, title, meta, excerpt, readmore | array of `{slug,enabled}` | Reorder/toggle card blocks. |
| `title_tag` | select | `'h3'` | `h2` `h3` `h4` `h5` `div` | Title HTML tag. |
| `meta_items` | checkboxes | `{date:true,author:true}` | map of `date` `author` `comments` `reading_time` | Meta bar contents. |
| `meta_layout` | select | `'inline-dot'` | `inline-dot` (Inline · dot) `inline-pipe` (Inline \| pipe) `inline-icons` (Inline with icons) `stacked` (one per line) | Meta bar layout. |
| `cat_position` | select | `'above-title'` | `above-title` `below-title` `in-meta` `image-overlay-top-left` `image-overlay-top-right` `image-overlay-bottom-left` `image-overlay-bottom-right` | Where the category badges sit. |
| `card_style_mobile` | select | `'inherit'` | `inherit` (from desktop) + any `card_style` key | Mobile Card Style Override. |
| `date_format` | select | `'wp'` | `wp` (WordPress default) `relative` (e.g. "2 days ago") `long` (March 5, 2026) `short` (05/03/2026) | Post date format. |
| `excerpt_length` | short-text | `'25'` | integer (words) | Excerpt trim length. |
| `readmore_style` | select | `'text-link'` | `button` `text-link` `arrow-only` | Read-more style. |
| `readmore_text` | text | `'Read more'` | string | Read-more label. |
| `pagination_type` | image-picker | `'none'` | `none` `numeric` `prev_next` `ajax_loadmore` `infinite` | Pagination strategy. |
| `pagination_position` | select | `'below-grid'` | `below-grid` (Below grid) `above-grid` (Above grid) `both` | Pagination position (numeric / prev_next). |
| `pagination_align` | select | `'center'` | `left` `center` `right` | Pagination alignment (numeric / prev_next / ajax_loadmore). |
| `filters_position` | select | `'above-grid'` | `above-grid` `left-sidebar` `right-sidebar` | AJAX filter bar position (when `live_filters` on). |
| `cache_hours` | select | `'12'` | `1` (1 hour) `6` (6 hours) `12` (12 hours) `24` (24 hours / 1 day) | Cache lifespan (when `cache_output` on). |
| `live_filters` | switch | `'no'` | `'yes'` \| `'no'` | AJAX category filter bar. |
| `cache_output` | switch | `'no'` | `'yes'` \| `'no'` | Cache rendered HTML in a transient. |
| `no_results_text` | text | `'Sorry, no posts matched your criteria.'` | string | Empty-state message. |

## Ready-to-use example (the atts object)
```json
{
  "post_type": "post",
  "posts_per_page": "9",
  "orderby": "date",
  "order": "DESC",
  "layout_mode": "grid",
  "card_style": "standard",
  "columns_desktop": "3",
  "image_ratio": "ratio-16-9",
  "element_order": [
    { "slug": "image",    "enabled": "yes" },
    { "slug": "cats",     "enabled": "yes" },
    { "slug": "title",    "enabled": "yes" },
    { "slug": "meta",     "enabled": "yes" },
    { "slug": "excerpt",  "enabled": "yes" },
    { "slug": "readmore", "enabled": "yes" }
  ],
  "meta_items": { "date": true, "author": true },
  "pagination_type": "none"
}
```

## Notes
- The largest option surface in the set; every att has a sensible default, so a minimal atts object (post_type + count + layout + card_style) renders fine — the rest fall back.
- `card_style` is one of the registry designs: `standard`, `side-left`, `side-right`, `overlay`, `minimal`, `hero-split`, `alternating`, plus `gradient`, `listicle`, `newslist`, `editorial`, `polaroid`, `timeline`, `tile`, `circular`, `accent`, `cover`, `quote`, `postcard`, `badge`, `filmstrip`, `diagonal`, `glass`.
- Switch values are **strings** (`'yes'`/`'no'`), including the `enabled` flag inside each `element_order` entry.
- `include_ids` overrides `taxonomy_filter` when both are set. `fallback_image_url` is a plain URL string, not a WP upload object.
- Don't combine `cache_output` with `ajax_loadmore` / `live_filters` — the transient key doesn't vary on AJAX params and can serve stale HTML.
- Colors + spacing live on the shared Styling block (`text_color`, `bg_color`, `font_size_preset`) — see `README.md`.
