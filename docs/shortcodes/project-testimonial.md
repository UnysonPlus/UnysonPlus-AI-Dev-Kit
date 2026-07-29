# `project_testimonial` — Project Testimonial

The client testimonial (quote + author + company) from a portfolio project's Project Details, rendered as a styled blockquote. Single-project **template part**. Requires the **`portfolio`** extension. Leaf node: `{ type:'simple', shortcode:'project_testimonial', _items:[], atts:{…} }` (+ shared wrapper blocks → `README.md`).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `project_id` | select | `'current'` | `'current'` \| project ID string | Whose testimonial to display. |

## Ready-to-use example (the atts object)
```json
{ "project_id": "current" }
```

## Notes
- Renders nothing when the project has no testimonial quote set (author/company alone don't render).
