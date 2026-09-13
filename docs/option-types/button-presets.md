<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# button-presets
A manager for reusable button styles — each preset is a named button skin (font + per-state colors/border/shadow) across Default/Hover/Active/Focus/Disabled tabs, producing a `.btn-<id>` class. Lives in Theme Settings → Buttons; the button element consumes it via a style picker.

## Stored value shape
An **array of preset entries**, one per button preset:
```json
[
  {
    "id": "primary",
    "color_name": "Primary",
    "font": { "...typography value (family/weight/letter-spacing/style)..." : "" },
    "transition": "250",
    "custom_css": "{{SELECTOR}}:hover { letter-spacing: 1px; }",
    "states": {
      "default": {
        "bg_color": { "predefined": "bg-brand", "custom": "" },
        "text_color": { "predefined": "text-white", "custom": "" },
        "gradient": { "...gradient-v2 value..." : "" },
        "text_transform": "uppercase",
        "border_color": { "predefined": "", "custom": "" },
        "border_width": { "value": "0", "unit": "px" },
        "border_style": "solid",
        "box_shadow": { "x": 0, "y": 2, "blur": 6, "spread": 0, "color": "rgba(0,0,0,0.2)", "inset": false }
      },
      "hover": { "...same keys..." : "" },
      "active": { }, "focus": { }, "disabled": { }
    }
  }
]
```

## Fields
| key | type | notes |
|---|---|---|
| `id` | string | `unique` id → the `.btn-<id>` class suffix. |
| `color_name` | string | label shown in the Styling dropdown. |
| `font` | object | `typography` value — identity only (family/weight/letter-spacing/style); size & line-height come from the Size axis. |
| `transition` | string | milliseconds (default `"250"`), animates all state changes. |
| `custom_css` | string | `code-editor` CSS, `{{SELECTOR}}`-aware. |
| `states` | object | keyed `default`/`hover`/`active`/`focus`/`disabled`; each is a state skin. |
| `states.<s>.bg_color` / `text_color` / `border_color` | object | compact color picker `{ predefined, custom }` (rgba-capable). |
| `states.<s>.gradient` | object | `gradient-v2` value (optional, layers over bg). |
| `states.<s>.text_transform` | string | ``\|`none`\|`uppercase`\|`lowercase`\|`capitalize`. |
| `states.<s>.border_width` | object | `unit-input` `{ value, unit }`. |
| `states.<s>.border_style` | string | ``\|`none`\|`solid`\|`dashed`\|`dotted`. |
| `states.<s>.box_shadow` | object | `box-shadow` value. |

## Notes / gotchas
- **Row headers auto-flip dark for a LIGHT preview.** The collapsed header *is* the preview button; a white / cream / pale-gradient / translucent-outline preset would vanish into the light (#f6f7f7) header. `framework/static/js/preset-preview-contrast.js` (enqueued by this type and by `addable-box`, so Sizes / Hover Animations rows get it too) measures each preview's effective surface — gradient stops or the background composited over the header, falling back to text + border ink for a transparent outline button — and adds `.is-light-preview` to that header when the luminance is ≥ 0.80 or the contrast ratio to the header is < 1.45; `preset-preview-contrast.css` then paints the header `#2c3338`. Re-evaluates on live edits (debounced MutationObserver). Solid coloured presets (blue / grey / amber / red) keep the light header.
- **Default value is an empty array `[]`.** `null` = defaults; non-array = empty list; a `'~'` sentinel string marks an empty submitted list and is skipped.
- Each leaf is parsed by its OWN option type — nested shapes follow their own docs. Colors are `{ predefined, custom }`, NOT hex strings.
- **Back-compat migration:** presets saved before state tabs (flat `normal_*`/`hover_*` keys, no `states`) are auto-migrated into `states.default`/`states.hover` on read.
- Only SKIN props live per-state; dimensional props (padding, font-size, radius) live on the separate Size axis (`.btn-lg` etc.).
