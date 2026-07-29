# `portfolio` — Portfolio Grid

A filterable grid of portfolio projects (from the Portfolio custom post type), with category filters, ordering and per-card styling. Requires the **`portfolio`** extension active. Leaf node: `{ type:'simple', shortcode:'portfolio', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `categories` | multi-select | `[]` | array of category slugs (taxonomy) | Limit the grid to these portfolio categories (empty = all). |
| `count` | short-text | `'-1'` | number string (`-1` = all) | Maximum projects to show. |
| `featured_only` | switch | `'no'` | `'yes'` \| `'no'` | Show only projects marked Featured. |
| `orderby` | select | `'date'` | `date` `menu_order` `title` `rand` | Sort field (`menu_order` = custom order). |
| `order` | select | `'DESC'` | `DESC` `ASC` | Sort direction. |
| `pagination` | select | `'none'` | `none` `loadmore` | `loadmore` turns `count` into the page size and adds an AJAX "Load more" button. |
| `link_to` | select | `'project'` | `project` `lightbox` `none` | What a card links to: the project page, the cover image in the shared lightbox (gallery mode across the grid), or nothing. |
| `layout` | select | `'grid'` | `grid` `masonry` `list` | Grid = uniform cells; Masonry = CSS columns with natural image heights; List = full-width rows. |
| `columns` | select | `'3'` | `1`–`6` | Desktop column count. |
| `ratio` | select | `'4-3'` | `1-1` `4-3` `3-2` `16-9` `3-4` `auto` | Card image aspect ratio (`auto` = original). Ignored by Masonry. |
| `hover` | select | `'zoom'` | `zoom` `overlay` `grayscale` `none` | Card hover style (`overlay` slides the caption over the image). |
| `gap` | short-text | `'24'` | px string | Gap between cards. |
| `image_size` | select | `'large'` | `thumbnail` `medium` `medium_large` `large` `full` | Thumbnail image size. |
| `show_filters` | switch | `'yes'` | `'yes'` \| `'no'` | Show the category filter buttons above the grid (AJAX re-query; deep-links via `#pf=<slug>`). |
| `show_summary` | switch | `'no'` | `'yes'` \| `'no'` | Show each project's short summary under its title. |
| `show_category` | switch | `'no'` | `'yes'` \| `'no'` | Show each project's category label above its title. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "categories": [],
  "count": "-1",
  "featured_only": "no",
  "orderby": "date",
  "order": "DESC",
  "pagination": "none",
  "link_to": "project",
  "layout": "grid",
  "columns": "3",
  "ratio": "4-3",
  "hover": "zoom",
  "gap": "24",
  "image_size": "large",
  "show_filters": "yes",
  "show_summary": "no",
  "show_category": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Filtering + load-more are **real AJAX re-queries** (`wp_ajax_fw_portfolio_load`), not render-then-hide — filters cooperate with pagination, and the active filter deep-links via `#pf=<term-slug>`. Grids also respect each project's "Hide from archives" flag.
- Cards use the project's dedicated **card thumbnail** (`project_card_image`) when set, else the cover image.
- `categories` is a **multi-select** auto-populated from the portfolio category taxonomy (`fw-portfolio-category`); values are category term slugs. Leave `[]` to include all.
- Switch atts store the string `'yes'`/`'no'`, not booleans; `count`, `gap`, `columns` are stored as strings.
- The `text_color` / `bg_color` / `font_size_preset` atts (the shared Styling tab) exist only when the shortcodes helpers are loaded. Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
