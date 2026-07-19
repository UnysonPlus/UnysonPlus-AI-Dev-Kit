# `divider` — Divider

A visual separator — a styled horizontal line (optionally with inline text or an icon), a decorative SVG shape, or pure whitespace. Leaf node: `{ type:'simple', shortcode:'divider', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `style` | multi-picker | see Notes | `{ruler_type, line?, shape?, space?}` | Outer mode. `ruler_type`: `line` `shape` `space`. The nested block matching the mode carries its settings. |
| `margin_top` | text | `''` | px integer | Space above the divider. |
| `margin_bottom` | text | `''` | px integer | Space below the divider. |
| `width` | text | `'100'` | % integer | Divider width as % of its container. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `line_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Line color (border / gradient). Falls back to `currentColor`. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Centered icon color (when `content_type = icon`). |
| `divider_text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Centered text color (when `content_type = text`). |

### `style` nested blocks
- **`line`**: `line_design` (`std` `gradient` `ornament` `shadow`), `content_type` (`none` `text` `icon`), `title` (text — when `text`), `icon` (icon — when `icon`), `alignment` (`center` `left` `right`).
- **`shape`**: `shape_style` (`waves` `wave` `curve` `tilt` `triangle` `zigzag` `arrow`, default `waves`), `shape_height` (text px, default `60`), `shape_flip_x` (`yes`/`no`), `shape_flip_y` (`yes`/`no`).
- **`space`**: `height` (text px, default `50`).

## Ready-to-use example (the atts object)
```json
{
  "style": {
    "ruler_type": "line",
    "line": {
      "line_design": "std",
      "content_type": "text",
      "title": "OR",
      "alignment": "center"
    }
  },
  "margin_top": "16",
  "margin_bottom": "16",
  "width": "60",
  "bg_color": { "predefined": "", "custom": "" },
  "line_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "divider_text_color": { "predefined": "", "custom": "" }
}
```

## Notes
- The `style` multi-picker keeps its **nested** shape — do not flatten it. Its default is `{ ruler_type:'line', line:{ line_design:'std', content_type:'none', alignment:'center' } }`; without it the view falls through to an invisible whitespace branch.
- `ruler_type: space` inserts an invisible vertical gap (`space.height` px) to space sections apart; `ruler_type: shape` renders a full-width decorative SVG boundary.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
