# `container` — Container

A lighter, nested band you drop inside a section (the items-corrector lifts it out to render as a sibling of the section's own container). It inherits the useful section styling — background, spacing, min-height and column alignment — but NOT section-identity controls (variant, shape dividers, per-section container width). Node: `{ type:'column', shortcode:'container', _items:[ /* columns */ ], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `is_fullwidth` | switch | `false` | `true` \| `false` | Off = boxed (constrained to site width, `.fw-container`); On = full-width edge-to-edge (`.fw-container-fluid`). |
| `min_height` | multi-picker | `{preset:'auto'}` | `{preset, custom?}` | Min container height. `preset`: `auto` `40vh` `60vh` `80vh` `100vh` `custom`. `custom` reveals `custom_height` (unit-input, units `px % vh vw rem em`). |
| `column_halign` | image-picker | `''` | align glyph choice | Horizontal alignment of columns (shared section align helper). |
| `column_valign` | image-picker | `''` | align glyph choice | Vertical alignment of columns. |
| `reverse_columns` | switch | `''` | `'yes'` \| `''` | Reverse column order. |
| `background` | background-pro | see Notes | background-pro object | Color / gradient / image / video background layers (they stack). |
| `background_pattern` | multi-picker (popover) | `{pattern:'none'}` | `{pattern:'<preset-id>'}` | Decorative CSS/HTML pattern layer behind content. Managed in Theme Settings → Components → Background Patterns. |
| `padding_top` | spacing (responsive) | see Notes | `{base,md,lg}` scale slugs | Top padding, per device. |
| `padding_bottom` | spacing (responsive) | see Notes | `{base,md,lg}` scale slugs | Bottom padding, per device. |
| `gap` | responsive | `{base:'',md:'',lg:''}` | gap scale slugs | Override the site-wide column gap for rows inside (both axes), per device. |
| `gap_x` | responsive | `{base:'',md:'',lg:''}` | gap scale slugs | Horizontal-axis gap override (needs `gap` set). |
| `gap_y` | responsive | `{base:'',md:'',lg:''}` | gap scale slugs | Vertical-axis gap override (needs `gap` set). |

## Ready-to-use example (the atts object)
```json
{
  "is_fullwidth": false,
  "min_height": { "preset": "auto" },
  "column_halign": "",
  "column_valign": "",
  "reverse_columns": "",
  "background": { "type": "none" },
  "background_pattern": { "pattern": "none" },
  "padding_top": { "base": "", "md": "", "lg": "" },
  "padding_bottom": { "base": "", "md": "", "lg": "" },
  "gap": { "base": "", "md": "", "lg": "" },
  "gap_x": { "base": "", "md": "", "lg": "" },
  "gap_y": { "base": "", "md": "", "lg": "" }
}
```

## Notes
- A container renders as a second container injected after the section's own — so a section can hold both a boxed band and a full-width band.
- `min_height` follows the canonical inline multi-picker shape (label on the picker, default in the top-level `value`, non-empty choice keys). Pair a tall min-height with `column_valign` = center to vertically center content.
- `background` is a **background-pro** object; consult `../option-types/` for its shape. Video background relies on the parent section's background scripts (always present).
- Gap / padding values are **spacing-scale slugs**, not px.
