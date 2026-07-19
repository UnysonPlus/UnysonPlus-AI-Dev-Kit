# table-presets

A Border-Presets-style repeater for reusable table looks. Each entry is a named preset (→ CSS class `.tbl-<slug>`) with structural fields plus six per-section skins (Header / Body / Striped / Hover / Footer / Caption). Consumed by the `table-style-picker` option, which stores the resulting class.

## Stored value shape
```json
[
  {
    "id": "abc123",
    "preset_name": "Striped Grid",
    "cell_padding_y": { "value": "8", "unit": "px" },
    "cell_padding_x": { "value": "12", "unit": "px" },
    "grid_lines": "horizontal",
    "grid_style": "solid",
    "grid_width": { "value": "1", "unit": "px" },
    "grid_color": { "predefined": "", "custom": "#e5e7eb" },
    "outer_border_style": "solid",
    "outer_border_width": { "value": "1", "unit": "px" },
    "outer_border_color": { "predefined": "", "custom": "#d1d5db" },
    "border_radius": { "value": "8", "unit": "px" },
    "outer_shadow": { "...box-shadow value..." : "" },
    "cell_font_size": { "value": "14", "unit": "px" },
    "transition": "150",
    "custom_css": "{{SELECTOR}} thead th { }",
    "sections": {
      "header":  { "bg_color": {}, "text_color": {}, "font_weight": "600", "text_transform": "uppercase", "border_style": "solid", "border_width": {}, "border_color": {} },
      "body":    { "bg_color": {}, "text_color": {} },
      "striped": { "enabled": "no", "bg_color": {} },
      "hover":   { "bg_color": {}, "text_color": {} },
      "footer":  { "bg_color": {}, "text_color": {}, "font_weight": "", "border_style": "", "border_width": {}, "border_color": {} },
      "caption": { "color": {}, "font_size": {}, "font_style": "normal" }
    }
  }
]
```
Default: `[]` (empty preset list).

## Fields
| key | type | notes |
|---|---|---|
| `id` | string | unique id (`unique` option type), stable across renames. |
| `preset_name` | string | label; produces the CSS class `.tbl-<slug>`. |
| `cell_padding_y` / `cell_padding_x` / `grid_width` / `outer_border_width` / `border_radius` / `cell_font_size` | object | `unit-input` values `{value,unit}`. |
| `grid_lines` | string | `none`\|`horizontal`\|`vertical`\|`both` (default `horizontal`). |
| `grid_style` / `outer_border_style` | string | `''`\|`solid`\|`dashed`\|`dotted`\|`double`. |
| `grid_color` / `outer_border_color` | object | compact color-preset picker `{predefined,custom}`. |
| `outer_shadow` | object/string | `box-shadow` option value. |
| `transition` | string | hover transition in ms (default `'150'`). |
| `custom_css` | string | `code-editor` (CSS); `{{SELECTOR}}` resolves to `.tbl-<slug>`. |
| `sections` | object | six keys (`header`/`body`/`striped`/`hover`/`footer`/`caption`), each an object of that section's skin fields. |

## Notes / gotchas
- Value is an **array of preset objects** (one per box), like a repeater/border-presets list — not a single object.
- Section sub-fields differ per section (see the shape above): `striped.enabled` is a `switch` (`'yes'`/`'no'`, default `'no'`); `caption.font_style` is `normal`\|`italic`.
- Color fields (`*_color`, section `bg_color`/`text_color`/`color`) are compact color-preset pickers → `{predefined,custom}`, NOT hex strings. Resolve with `sc_normalize_color_value()` / `var(--color-<slug>)`.
- All unit fields are `{value,unit}` objects (`unit-input`), never bare numbers.
- `color-choices` (palette) is config passed into the option, not stored per-preset.
- The `'~'` sentinel string in submitted input marks an empty list and is skipped on parse.
