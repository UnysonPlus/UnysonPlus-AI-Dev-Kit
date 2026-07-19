# `menu_toggle` — Menu Toggle

A hamburger / dots button that opens an off-canvas navigation drawer. Leaf node: `{ type:'simple', shortcode:'menu_toggle', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `target` | text | `'primary-navigation-drawer'` | drawer element id | The id of the off-canvas drawer to open. Default = the theme's built-in drawer. |
| `label` | text | `'Menu'` | string | Screen-reader label for the button. |
| `icon_style` | select | `'bars'` | `bars` `dots` | Button glyph — bars (≡) or dots (⋮). |

## Ready-to-use example (the atts object)
```json
{
  "target": "primary-navigation-drawer",
  "label": "Menu",
  "icon_style": "bars"
}
```

## Notes
- `target` must match the `id` of an existing off-canvas drawer; leave it at the default to drive the theme's built-in navigation drawer.
- This element has only Content and Advanced tabs — no dedicated Styling/Design options.
