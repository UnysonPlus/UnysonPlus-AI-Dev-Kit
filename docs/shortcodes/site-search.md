# `site_search` — Search

A site search form. `inline-form` is always visible; `icon-toggle` shows a magnifier button that reveals the form on click. A header/footer element. Leaf node: `{ type:'simple', shortcode:'site_search', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `style` | select | `'inline-form'` | `inline-form` (always visible) `icon-toggle` (expands on click) | Form display mode. |
| `placeholder` | text | `'Search …'` | string | Input placeholder text. |

## Ready-to-use example (the atts object)
```json
{
  "style": "inline-form",
  "placeholder": "Search …"
}
```

## Notes
- The form is a `GET` form pointing at the site home URL — a standard WordPress search.
- `icon-toggle` adds a magnifier button and a hidden panel; its JS toggles visibility + `aria-expanded`, closes on outside-click / Escape, and focuses the field on open.
- This shortcode has only a Content tab + the shared Advanced tab (no Styling/Animations tabs).
