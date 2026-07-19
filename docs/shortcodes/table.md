# `table` — Table

A spreadsheet-style data table (or a pricing table). Leaf node: `{ type:'simple', shortcode:'table', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `table` | table (custom option) | see Notes | opaque `{header_options, cols, rows, content}` | The whole table data model. `header_options.table_purpose` (`tabular` \| `pricing`) picks the render mode. |
| `style_striped` | switch | `'yes'` | `yes` \| `no` | Zebra-stripe body rows (tabular only). |
| `style_hover` | switch | `'yes'` | `yes` \| `no` | Highlight the row under the cursor. |
| `style_bordered` | switch | `'no'` | `yes` \| `no` | Draw borders around every cell. |
| `style_condensed` | switch | `'no'` | `yes` \| `no` | Tighter cell padding. |
| `sticky_header` | switch | `'no'` | `yes` \| `no` | Keep the header row visible while scrolling. |
| `caption` | text | `''` | string | Optional table caption. |
| `caption_position` | select | `'bottom'` | `bottom` `top` | Caption above or below the table. |
| `enable_sort` | switch | `'no'` | `yes` \| `no` | Let visitors sort by clicking a header (no merged cells). |
| `enable_search` | switch | `'no'` | `yes` \| `no` | Show a filter box. |
| `enable_pagination` | switch | `'no'` | `yes` \| `no` | Show a limited number of rows per page. |
| `pagination_length` | text | `'10'` | integer string | Rows per page when pagination is on. |
| `enable_length_change` | switch | `'yes'` | `yes` \| `no` | Let visitors change rows-per-page. |
| `enable_info` | switch | `'yes'` | `yes` \| `no` | Show the "Showing X to Y of Z" line. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "style_striped": "yes",
  "style_hover": "yes",
  "style_bordered": "no",
  "style_condensed": "no",
  "sticky_header": "no",
  "caption": "",
  "caption_position": "bottom",
  "enable_sort": "no",
  "enable_search": "no",
  "enable_pagination": "no",
  "pagination_length": "10",
  "enable_length_change": "yes",
  "enable_info": "yes",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- The `table` field is **opaque** — its `{header_options, cols, rows, content}` shape is managed by the spreadsheet editor UI. Build table payloads from a real exported `.json` rather than synthesising the shape by hand.
- Two render modes are selected **by data**: set `table.header_options.table_purpose` to `tabular` (data table) or `pricing` (pricing table with button rows). There is no separate pricing shortcode.
- The sort/search/paginate enhancer is only active when one of those is on **and** the table has no merged (colspan/rowspan) cells.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
