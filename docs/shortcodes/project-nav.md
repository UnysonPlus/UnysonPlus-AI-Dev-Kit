# `project_nav` — Project Prev/Next

Previous / next project navigation with thumbnails, direction labels and the project titles as link text. Single-project **template part** — renders **only on single-project pages** (adjacency comes from the viewed project). Requires the **`portfolio`** extension. Leaf node: `{ type:'simple', shortcode:'project_nav', _items:[], atts:{…} }` (+ shared wrapper blocks → `README.md`).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `same_category` | switch | `'no'` | `'yes'` \| `'no'` | Constrain previous/next to projects sharing a portfolio category. |

## Ready-to-use example (the atts object)
```json
{ "same_category": "no" }
```

## Notes
- Renders nothing outside a single project, or when there is no adjacent project. Same markup as the default single view's nav (`fw_ext_portfolio_render_prevnext()`), so use this element when building the project page yourself and turn off the extension's `enable_prevnext` setting to avoid doubles.
