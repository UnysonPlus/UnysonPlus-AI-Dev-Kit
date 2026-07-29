# `project_results` — Project Results

A portfolio project's results/metrics band ("+38% — Conversion rate") from its Project Details `project_results` repeater. Single-project **template part**. Requires the **`portfolio`** extension. Leaf node: `{ type:'simple', shortcode:'project_results', _items:[], atts:{…} }` (+ shared wrapper blocks → `README.md`).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `project_id` | select | `'current'` | `'current'` \| project ID string | Whose metrics to display. |

## Ready-to-use example (the atts object)
```json
{ "project_id": "current" }
```

## Notes
- Renders nothing when no metrics are filled in. Metrics are `{value,label}` rows on the project's Project Details box (e.g. value `+38%`, label `Conversion rate`).
