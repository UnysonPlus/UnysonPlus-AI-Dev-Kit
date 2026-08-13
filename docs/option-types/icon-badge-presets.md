# icon-badge-presets

A manager for reusable **icon badge** styles — each preset is a named, shaped *tile* around an icon (a fixed-size circle / rounded / square / hexagon with a centered glyph), with Default + Hover state tabs, producing a `.iconb-<slug>` class. Lives in Theme Settings → Components → Icon Badges; icon-bearing shortcodes consume it via an `icon_badge_preset` picker. A sibling of `border-presets` (Box Presets), reshaped for icons: where a box preset is a content-fit card skin, a badge is a set-size shaped container whose glyph has its own colour + size.

## Stored value shape
An **array of preset entries**, one per icon badge:
```json
[
  {
    "id": "i000000001",
    "preset_name": "Circle",
    "badge_shape": "circle",
    "badge_size": { "value": "48", "unit": "px" },
    "icon_size": { "value": "24", "unit": "px" },
    "border_radius": { "value": "", "unit": "px" },
    "transition": "200",
    "hover_fx": ["lift", "glow"],
    "custom_css": "",
    "states": {
      "default": {
        "background": { "color": { "value": { "predefined": "", "custom": "#0d6efd" } } },
        "icon_color": { "predefined": "white", "custom": "" },
        "border_style": "",
        "border_width": { "value": "", "unit": "px" },
        "border_color": { "predefined": "", "custom": "" },
        "box_shadow": { "x": 0, "y": 4, "blur": 12, "spread": 0, "color": "rgba(0,0,0,0.15)", "inset": false }
      },
      "hover": { "box_shadow": { "x": 0, "y": 8, "blur": 20, "spread": 0, "color": "rgba(0,0,0,0.22)", "inset": false } }
    }
  }
]
```

## Fields
| key | type | notes |
|---|---|---|
| `id` | string | `unique` id per preset (e.g. `i000000001`). |
| `preset_name` | string | label → slugified into the `.iconb-<slug>` class. |
| `badge_shape` | string | `circle`\|`rounded`\|`square`\|`hexagon` (default `circle`). `rounded`/`square` honor `border_radius`; `circle` is always 50%; `hexagon` is clip-path. |
| `badge_size` | object | `unit-input` `{ value, unit }` — the tile's width & height (default `{value:'48',unit:'px'}`). |
| `icon_size` | object | `unit-input` `{ value, unit }` — the glyph inside the tile (default `{value:'24',unit:'px'}`). |
| `border_radius` | object | `unit-input` `{ value, unit }` — corner radius for the `rounded`/`square` shapes (ignored for circle/hexagon). |
| `transition` | string | milliseconds (default `"200"`). |
| `hover_fx` | array | `multi-select` of `lift`\|`pop`\|`glow`\|`shine` (default `[]`). (Note: differs from Box Presets, which offer `zoom`/`tilt` — badges use `pop` instead.) |
| `custom_css` | string | `code-editor` CSS, `{{SELECTOR}}`-aware (→ `.iconb-<slug>`). |
| `states` | object | keyed `default` + `hover`; each holds the per-state tile skin (see below). |
| `states.<state>.background` | object | `background-pro` value — the tile FILL (color/gradient/image; video disabled). Empty = transparent (an outline / ring badge). |
| `states.<state>.icon_color` | object | compact color picker `{ predefined, custom }` — the glyph colour (palette-linked). |
| `states.<state>.border_style` | string | ``\|`solid`\|`dashed`\|`dotted`\|`double` (for ring / outline / bordered tiles). |
| `states.<state>.border_width` | object | `unit-input` `{ value, unit }`. |
| `states.<state>.border_color` | object | compact color picker `{ predefined, custom }`. |
| `states.<state>.box_shadow` | object | `box-shadow` value `{x,y,blur,spread,color,inset}`. |

## Choices / consumption
- Not a fixed choice list — a repeatable list of preset rows managed in Theme Settings.
- `sc_get_icon_badge_preset_choices()` builds the picker choices: `'' => None` plus `iconb-<slug> => <preset name>` for each preset (slug map shared with the CSS generator so class + value + render agree).
- Elements consume it via an **`icon_badge_preset`** option (a `border-style-picker` in **badge preview mode** — each choice renders a real mini tile drawn inline from the preset). The shared field/reader helpers are `sc_icon_badge_preset_field()` / `sc_icon_badge_preset_class( $atts )`.
- **Consumers (9 shortcodes):** `icon_box` (Styling → Icon Badge Preset), `feature_list`, `steps`, `timeline`, `flip_box`, `image_box`, `special_heading`, `pricing_table`, `social_icons`. The picked `iconb-<slug>` class is stamped on the element's icon wrapper.

## Notes / gotchas
- **Default value is an empty array `[]`.** `null` input = defaults; any non-array = empty list; a `'~'` sentinel string marks an empty list on submit and is skipped. (Same contract as `border-presets`.)
- Each leaf is parsed by ITS OWN option type — nested shapes (`unit-input`, compact color, `background-pro`, `box-shadow`) follow their own docs.
- `icon_color` / `border_color` use the compact preset picker → `{ predefined, custom }`, NOT a raw hex string. The tile FILL (`background`) is a `background-pro` value and, like Box Presets, is **not** palette-slug-resolved — put a literal colour in `background.color.value.custom`.
- The generated `.iconb-<slug>` CSS is emitted with `!important` on the structural props (size/shape/icon color/size), so a selected preset fully overrides the element's own Icon Color / Icon Size.
- Live preview: the option type shows Default/Hover state tabs + a live badge swatch, and (since the recent update) a mini badge thumbnail in each item's collapsed header. See `theme-settings/boxes.md` → Icon Badges for the seeded defaults and the emitted class.
- Slimmed clone of `border-presets`; the two share structure but differ in fields (badge adds shape / size / icon colour + size; drops box-only concepts).
