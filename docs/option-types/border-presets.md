# border-presets
A manager for reusable column/card "box" border skins — each preset is a named style (border, radius, padding, background, box-shadow) with Default + Hover state tabs, producing a `.boxp-<name>` class. Lives in Theme Settings; columns consume it via a `border_preset` picker.

## Stored value shape
An **array of preset entries**, one per box preset:
```json
[
  {
    "id": "abc123",
    "preset_name": "Card",
    "border_sides": "all",
    "border_radius": { "value": "8", "unit": "px" },
    "padding": { "padding": { "all": "", "top": "p-3", "right": "", "bottom": "p-3", "left": "" } },
    "transition": "200",
    "hover_fx": ["lift", "glow"],
    "custom_css": "{{SELECTOR}} { }",
    "states": {
      "default": {
        "background": { "...background-pro value..." : "" },
        "border_style": "solid",
        "border_width": { "value": "1", "unit": "px" },
        "border_color": { "predefined": "border-muted", "custom": "" },
        "box_shadow": { "...box-shadow value..." : "" }
      },
      "hover": { "border_style": "solid", "border_width": { "value": "1", "unit": "px" }, "border_color": { "predefined": "", "custom": "#000" }, "background": {}, "box_shadow": {} }
    }
  }
]
```

## Fields
| key | type | notes |
|---|---|---|
| `id` | string | `unique` id per preset. |
| `preset_name` | string | label → slugified into the `.boxp-<slug>` class. |
| `border_sides` | string | `all`\|`top`\|`end`\|`bottom`\|`start` (default `all`). |
| `border_radius` | object | `unit-input` `{ value, unit }`. |
| `padding` | object | `spacing` value (mode `padding`) — per-side Bootstrap-style class map under `padding`. |
| `transition` | string | milliseconds (default `"200"`). |
| `hover_fx` | array | `multi-select` of `lift`\|`zoom`\|`tilt`\|`glow`\|`shine` (default `[]`). |
| `custom_css` | string | `code-editor` CSS, `{{SELECTOR}}`-aware. |
| `states` | object | keyed `default` + `hover`; each holds the per-state skin (see below). |
| `states.<state>.background` | object | `background-pro` value (color/gradient/image; video disabled). |
| `states.<state>.border_style` | string | ``\|`solid`\|`dashed`\|`dotted`\|`double`. |
| `states.<state>.border_width` | object | `unit-input` `{ value, unit }`. |
| `states.<state>.border_color` | object | compact color picker `{ predefined, custom }`. |
| `states.<state>.box_shadow` | object | `box-shadow` value. |

## Notes / gotchas
- **Default value is an empty array `[]`.** `null` input = defaults; any non-array = empty list; a `'~'` sentinel string marks an empty list on submit and is skipped.
- Each leaf is parsed by ITS OWN option type — nested shapes (`unit-input`, `spacing`, compact color, `background-pro`, `box-shadow`) follow their own docs.
- `border_color` uses the compact preset picker → `{ predefined, custom }`, NOT a raw hex string.
- Preset `padding` emits WITHOUT `!important` so a column's own Margin & Padding overrides it.
- Slimmed clone of `button-presets`; the two share structure but differ in fields.
