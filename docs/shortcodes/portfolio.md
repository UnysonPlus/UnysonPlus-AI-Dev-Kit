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
| `columns` | select | `'3'` | `1`–`6` | Desktop column count. |
| `gap` | short-text | `'24'` | px string | Gap between cards. |
| `image_size` | select | `'large'` | `thumbnail` `medium` `medium_large` `large` `full` | Thumbnail image size. |
| `show_filters` | switch | `'yes'` | `'yes'` \| `'no'` | Show the category filter buttons above the grid. |
| `show_summary` | switch | `'no'` | `'yes'` \| `'no'` | Show each project's short summary under its title. |
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
  "columns": "3",
  "gap": "24",
  "image_size": "large",
  "show_filters": "yes",
  "show_summary": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `categories` is a **multi-select** auto-populated from the portfolio category taxonomy (`fw-portfolio-category`); values are category term slugs. Leave `[]` to include all.
- Switch atts store the string `'yes'`/`'no'`, not booleans; `count`, `gap`, `columns` are stored as strings.
- The `text_color` / `bg_color` / `font_size_preset` atts (the shared Styling tab) exist only when the shortcodes helpers are loaded. Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
