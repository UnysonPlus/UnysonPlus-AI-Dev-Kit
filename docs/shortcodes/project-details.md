# `project_details` — Project Details

A portfolio project's details list (client, date, role, industry, services, tools, repository, website) as a definition list. One of the five single-project **template parts** — drop it anywhere to build a custom project page in the builder. Requires the **`portfolio`** extension. Leaf node: `{ type:'simple', shortcode:'project_details', _items:[], atts:{…} }`. This file lists only the shortcode-specific atts (shared `common`/`fx`/`spacing` wrapper blocks → `README.md`).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `project_id` | select | `'current'` | `'current'` \| project ID string | `current` reads the project being viewed (use inside a single-project layout); otherwise a specific project's ID. |
| `heading` | text | `''` | text | Optional heading above the list ('' = none). |
| `heading_tag` | select | `'h2'` | `h2`–`h6` `div` | Heading level — pick by page-outline position, never by size. |

## Ready-to-use example (the atts object)
```json
{ "project_id": "current", "heading": "Project details", "heading_tag": "h2" }
```

## Notes
- Renders nothing when the chosen project has no details filled in. Only non-empty fields produce rows; the website/repository rows open in a new tab with `rel="noopener noreferrer"`.
- Fields live on the project's **Project Details** box (extension per-post options).
