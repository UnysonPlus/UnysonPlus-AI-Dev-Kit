# `flexbox` — Flexbox

A self-contained, nestable semantic flex container — the Theme Builder's "Structure" primitive (used to build Header / Body / Footer parts). Arranges its children with full flexbox control, all options responsive. Node: `{ type:'column', shortcode:'flexbox', _items:[ /* children */ ], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

Every layout/placement att is **responsive**: `{ base, md, lg }`, where a blank device inherits the next smaller one.

## atts — Container (how it arranges children)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `direction` | responsive image-picker | `{base:'row',md:'',lg:''}` | `row` `column` | Main axis. Row = side-by-side (give children a Width to split); Column = stacked. |
| `gap` | responsive short-select | `{base:'',md:'',lg:''}` | gap scale slug \| `''` (none) | Spacing between children (site-wide gap presets). |
| `justify_content` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `between` `around` `evenly` | Distribution along the main axis. |
| `align_items` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `stretch` `baseline` | Alignment on the cross axis. |
| `wrap` | responsive switch | `{base:'yes',md:'',lg:''}` | `yes` \| `no` | Allow children to wrap to the next line (rows). |
| `reverse` | responsive switch | `{base:'no',md:'',lg:''}` | `yes` \| `no` | Reverse the layout order (row/column-reverse) without changing markup. |
| `align_content` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `between` `around` | How wrapped lines pack on the cross axis (needs wrap + 2+ lines). |

## atts — Placement (how it sits inside a parent Flexbox)
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `width` | responsive popover | `{base:{preset:'none'},…}` | `{preset:'none'\|'1'..'12'\|'custom', width_custom?}` | This box's own width in a parent Flexbox row. Fractions (`1`=1/12 … `12`=1/1); `custom` reveals a unit-input (`% px rem vw`). |
| `flex_grow` | responsive switch | `{base:'no',md:'',lg:''}` | `yes` \| `no` | Grow to absorb remaining free space (overrides fixed Width when there's room). |
| `align_self` | responsive image-picker | `{base:'',md:'',lg:''}` | `''` `start` `center` `end` `stretch` `baseline` | Override the parent's cross-axis align for just this box. |
| `order` | responsive short-select | `{base:'',md:'',lg:''}` | `''` `first` `0`..`12` `last` | Reorder this box among siblings without changing markup. |

## atts — Styling
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `background` | background-pro | see Notes | background-pro object | Color / gradient / image / video background layers (they stack). |
| `border_preset` | border-style picker | `''` | preset slug | Reusable box style — border, corners, shadow, optional fill + hover. |
| `min_height` | responsive unit-input | `{base:{value:'',unit:'vh'},…}` | units `vh px rem %` | Minimum container height. Pair with `align_items: center` for a hero band. |

## Ready-to-use example (the atts object)
```json
{
  "direction": { "base": "row", "md": "", "lg": "" },
  "gap": { "base": "", "md": "", "lg": "" },
  "justify_content": { "base": "center", "md": "", "lg": "" },
  "align_items": { "base": "center", "md": "", "lg": "" },
  "wrap": { "base": "yes", "md": "", "lg": "" },
  "reverse": { "base": "no", "md": "", "lg": "" },
  "align_content": { "base": "", "md": "", "lg": "" },
  "width": { "base": { "preset": "none" }, "md": { "preset": "none" }, "lg": { "preset": "none" } },
  "flex_grow": { "base": "no", "md": "", "lg": "" },
  "align_self": { "base": "", "md": "", "lg": "" },
  "order": { "base": "", "md": "", "lg": "" },
  "background": { "type": "none" },
  "border_preset": "",
  "min_height": { "base": { "value": "", "unit": "vh" }, "md": { "value": "", "unit": "vh" }, "lg": { "value": "", "unit": "vh" } }
}
```

## Notes
- The flexbox is hidden from normal (non-Theme-Builder) page-builder palettes by an admin-only filter, but it renders everywhere on the front end.
- Nest flexboxes to build structural layouts; children with a `width` fraction split a `row`.
- `background` is a **background-pro** object; consult `../option-types/` for its shape.
