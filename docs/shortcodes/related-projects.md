# `related_projects` — Related Projects

A row of project cards related to the current one (sharing a portfolio category, topped up with recent projects). Single-project **template part** — renders **only on single-project pages**. Requires the **`portfolio`** extension. Leaf node: `{ type:'simple', shortcode:'related_projects', _items:[], atts:{…} }` (+ shared wrapper blocks → `README.md`).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `count` | short-text | `'3'` | number string | How many related projects. |
| `heading` | text | `'Related Projects'` | text | Heading above the row ('' = hide). |
| `heading_tag` | select | `'h2'` | `h2`–`h6` `div` | Heading level — pick by page-outline position, never by size. |

## Ready-to-use example (the atts object)
```json
{ "count": "3", "heading": "Related Projects", "heading_tag": "h2" }
```

## Notes
- Same markup as the default single view's related row (`fw_ext_portfolio_render_related()`); when using this element, turn off the extension's `enable_related` setting to avoid doubles. Hidden-from-archive projects are excluded.
