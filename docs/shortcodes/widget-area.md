# `widget_area` — Widget Area

Renders a registered WordPress sidebar (widget area) inline inside a page-builder layout. Leaf node: `{ type:'simple', shortcode:'widget_area', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `sidebar` | select | `''` | registered sidebar ID | The sidebar to render. Choices are populated dynamically from all registered sidebars when the modal opens. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "sidebar": "sidebar-1",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `sidebar` choices are **environment-specific** — populated from `$wp_registered_sidebars` at the moment the modal opens. An ID that exists on one site may not exist on another; a missing sidebar renders nothing.
- The widgets themselves live in WordPress's widget store (edited under Appearance → Widgets), **not** in the page-builder JSON. Sharing a template shares the slot, not the widget contents.
- Sidebars registered after `widgets_init` may not appear in the dropdown.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
