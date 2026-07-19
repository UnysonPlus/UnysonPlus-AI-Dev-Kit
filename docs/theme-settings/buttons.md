# Theme Settings → Components → Buttons

Authoritative reference for the three Button option groups (Presets, Sizes, Hover Animations) — every choice, saved-value shape, seeded default, and the CSS class each emits — so an AI agent can wire the Button shortcode without reading source.

The Button shortcode composes these three: `class="btn btn-primary btn-lg btnfx-c-pulse-ring"` = base `.btn` + one preset (`.btn-{id-slug}`) + one size (`.btn-{size-slug}`) + optionally one custom hover animation (`.btnfx-c-{name-slug}`).

## button_colors box

### Button Presets — `button_colors`

- **Type**: `button-presets` (custom option type; a repeatable list of color/skin presets with per-state options and a live preview).
- **Default**: the 13 seeded presets from `unysonplus_default_button_color_presets()` (enumerated below).
- **Choices**: not a fixed choice list — each preset row is user-defined. Color fields are compact-picker values whose `predefined` references a **Color Preset slug** (always-present slugs: `white`, `gray`, `light-gray`, `blue`, `green`, `cyan`, `amber`, `red`, `black`; the seeds also use `primary`, `secondary`, `indigo`, `teal`, `light-blue`, `orange`, `pink`).
- **Saved value shape** — array of preset rows, each:

```json
{
  "id": "0000000002",
  "color_name": "Primary",
  "states": {
    "default":  { "text_color": {"predefined":"white","custom":""}, "bg_color": {"predefined":"primary","custom":""}, "border_color": {"predefined":"primary","custom":""}, "border_width": {"value":"2","unit":"px"}, "border_style": "solid", "gradient": { "type":"linear", "angle":135, "stops":[{"color":"#667EEA","position":0},{"color":"#764BA2","position":100}] } },
    "hover":    { "bg_color": {"predefined":"indigo","custom":""}, "border_color": {"predefined":"indigo","custom":""} },
    "active":   {},
    "focus":    {},
    "disabled": {}
  }
}
```

- **Notes**: emits **`.btn-{slug}`** where slug = `color_name` lower-cased, non-alphanumerics → `-`, trimmed (e.g. `Primary` → `.btn-primary`, `Primary Outline` → `.btn-primary-outline`; collisions get `-2`/`-3`). Empty `color_name` falls back to the sanitized `id`. The map is `unysonplus_button_preset_slug_map()` — the single source of truth shared by CSS generation, the Button shortcode's Style dropdown, and the admin preview. Consumed by the Button shortcode as `class="btn btn-primary"`.

#### Per-state sub-fields (each of `default` / `hover` / `active` / `focus` / `disabled`)

Empty states (`active`/`focus`/`disabled` when `{}`) inherit the `default` look at render time. Recognized color/skin fields on a state:

| sub-field | type | shape / values |
| --- | --- | --- |
| `text_color` | compact color-picker | `{ "predefined": "<color-preset-slug>", "custom": "<#hex>" }` (preset wins; empty = `{"predefined":"","custom":""}`) |
| `bg_color` | compact color-picker | same shape as `text_color`; empty = transparent/inherit |
| `border_color` | compact color-picker | same shape |
| `border_width` | unit-input | `{ "value": "2", "unit": "px" }` |
| `border_style` | select | `solid` / `none` (CSS border-style keywords; seeds use `solid` and `none`) |
| `gradient` | Background Gradient (V2) | `{ "type":"linear", "angle":135, "stops":[{"color":"#hex","position":0},…] }` — sits on a state's background; gradients don't CSS-transition, so hover typically swaps stops. |

The option type also supports **typography**, **box**, **shadow**, and **custom CSS** per preset (per the option's `desc`: "Default / Hover / Active / Focus / Disabled states, typography, box, shadow and custom CSS are all supported"); the seeded defaults populate only the color/border/gradient fields above and leave typography/box/shadow/custom-CSS empty (inherited from `.btn` / the chosen size).

#### Seeded default presets (13)

| id | color_name | slug (`.btn-`) | kind | default text / bg / border | hover |
| --- | --- | --- | --- | --- | --- |
| 0000000002 | Primary | `primary` | solid | white / primary / primary | bg+border → indigo |
| 0000000001 | Secondary | `secondary` | solid | white / secondary / secondary | bg+border → gray |
| 0000000003 | Success | `success` | solid | white / green / green | bg+border → teal |
| 0000000004 | Info | `info` | solid | white / cyan / cyan | bg+border → light-blue |
| 0000000005 | Warning | `warning` | solid | black / amber / amber | bg+border → orange |
| 0000000006 | Danger | `danger` | solid | white / red / red | bg+border → pink |
| 0000000011 | Secondary Outline | `secondary-outline` | outline (2px solid, transparent bg) | secondary text+border | fill: bg→secondary, text→white |
| 0000000012 | Primary Outline | `primary-outline` | outline | primary text+border | fill: bg→primary, text→white |
| 0000000013 | Success Outline | `success-outline` | outline | green text+border | fill: bg→green, text→white |
| 0000000014 | Info Outline | `info-outline` | outline | cyan text+border | fill: bg→cyan, text→white |
| 0000000015 | Warning Outline | `warning-outline` | outline | amber text+border | fill: bg→amber, text→black |
| 0000000016 | Danger Outline | `danger-outline` | outline | red text+border | fill: bg→red, text→white |
| 0000000031 | Gradient | `gradient` | gradient (white text, no border) | linear 135° #667EEA→#764BA2 | reversed: #764BA2→#667EEA |
| 0000000021 | Link | `link` | link (text only, no bg/border) | primary text | text → indigo |

## button_sizes box

### Sizes — `button_sizes`

- **Type**: `addable-box` (sortable; add-button text "Add More Sizes"; row template `<span class="btn btn-size-preview-{{id}}">{{size_name}}</span>`).
- **Default**: the 5 seeded sizes from `unysonplus_default_button_size_presets()`.
- **Choices**: none fixed — each row is user-defined. Per-row sub-fields:

| box-option | type | choices / units | default |
| --- | --- | --- | --- |
| `id` | unique | (auto) | auto |
| `size_name` | text | — | `""` |
| `slug` | text | becomes the class suffix (`sm` → `.btn-sm`) | `""` |
| `font_size` | unit-input | units `px` / `em` / `rem`, min 0 | — |
| `line_height` | short-text | unitless (e.g. `1.5`) or a unit | `""` |
| `padding_y` | unit-input | units `px` / `em` / `rem`, min 0 | — |
| `padding_x` | unit-input | units `px` / `em` / `rem`, min 0 | — |
| `border_radius` | unit-input | units `px` / `%` / `em` / `rem`, min 0 | — |
| `min_width` | unit-input | units `px` / `%` / `rem` / `em`, min 0 (optional) | — |
| `max_width` | unit-input | units `px` / `%` / `rem` / `em`, min 0 (optional) | — |

- **Saved value shape** — array of size rows (unit-input fields carry `{value,unit}`; `line_height` is a plain string):

```json
{ "id": "0000010004", "size_name": "Large", "slug": "lg", "font_size": {"value":"20","unit":"px"}, "line_height": "1.4", "padding_y": {"value":"12","unit":"px"}, "padding_x": {"value":"20","unit":"px"}, "border_radius": {"value":"8","unit":"px"} }
```

- **Notes**: emits **`.btn-{slug}`** controlling dimensions only (border-width is NOT a size concern — it lives on the Button Preset skin). Pair with a preset: `class="btn btn-primary btn-lg"`.

#### Seeded default sizes (5)

| id | size_name | slug | font_size | line_height | padding_y | padding_x | border_radius |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0000010005 | Extra Large | `xl` | 22px | 1.4 | 14px | 24px | 10px |
| 0000010004 | Large | `lg` | 20px | 1.4 | 12px | 20px | 8px |
| 0000010003 | Medium | `md` | 16px | 1.4 | 8px | 16px | 6px |
| 0000010002 | Small | `sm` | 13px | 1.4 | 6px | 12px | 5px |
| 0000010001 | Extra Small | `xs` | 12px | 1.4 | 2px | 6px | 3px |

## button_animations box

### Hover Animations — `button_animations`

- **Type**: `addable-box` (sortable; add-button text "Add Animation"; row template `<span class="btn btn-primary btnfx-preview-{{id}}">{{name}}</span>`).
- **Default**: the 5 seeded sample animations from `unysonplus_default_custom_hover_animations()`.
- **Choices**: none fixed — user-defined. Per-row sub-fields:

| box-option | type | details | default |
| --- | --- | --- | --- |
| `id` | unique | (auto) | auto |
| `name` | text | — | `""` |
| `css` | code-editor | mode `css`, height 160; tokens `{{BTN}}` = this button, `{{ANIM}}` = a unique @keyframes name | placeholder scale-pulse snippet |

- **Saved value shape**:

```json
{ "id": "0000020001", "name": "Pulse Ring", "css": "{{BTN}}:hover { animation: {{ANIM}} 1.1s ease infinite; }\n@keyframes {{ANIM}} { … }" }
```

- **Notes**: each entry appears in the Button shortcode's Hover Animation dropdown and emits **`.btnfx-c-{slug}`** (slug = `name` sanitized, `-2`/`-3` dedupe, via `unysonplus_custom_hover_animation_slug_map()`). At render `{{BTN}}` → `.btnfx-c-{slug}`, `{{ANIM}}` → a unique keyframes name. Consumed as `class="btn btn-primary btnfx-c-pulse-ring"`. These are user SAMPLES; the 22 built-in effects live in `hover-fx.css` and are separate.

#### Seeded default hover animations (5)

| id | name | slug (`.btnfx-c-`) | effect |
| --- | --- | --- | --- |
| 0000020001 | Pulse Ring | `pulse-ring` | expanding box-shadow ring, infinite 1.1s |
| 0000020002 | Swing | `swing` | rotate wobble from top-center, 0.7s |
| 0000020003 | Rubber Band | `rubber-band` | non-uniform scale bounce, 0.8s |
| 0000020004 | Squeeze | `squeeze` | scale squash 1.1×0.85, 0.45s |
| 0000020005 | Raise & Glow | `raise-glow` | translateY(-4px) + drop shadow on hover |
