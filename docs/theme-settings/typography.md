# Theme Settings — Typography

Authoritative reference for the Typography-related Theme Settings options (General → Typography, General → Typography → Custom Fonts, and Components → Text Styles). Every option's full choice set is enumerated verbatim below.

---

## General → Typography

Location: `unysonplus-theme/framework-customizations/theme/options/general-typography.php`. Resolved by `inc/includes/css-tokens.php` (`unysonplus_typography_config`) → emits `--font-heading` / `--font-body` + the h1–h6 scale. Google fonts for the effective families load via `inc/hooks.php`.

### Typography Presets — `typography_presets`

- **Type**: `preset-loader` (meta: `preset_group => 'typography'`)
- **Default**: — (no stored value; a loader control)
- **Choices**: dynamic — lists the saved/curated Typography presets in the `typography` preset group (managed via `settings-presets.php`); also accepts an uploaded preset JSON. Not a fixed enum.
- **Saved value shape**: n/a (picking a preset writes the resolved values into the `typography` group below).
- **Notes**: Curated heading + body pairing + size scale applied to the whole `typography` group in one pick; mirrors Color Presets. Fine-tune the fields below afterward.

### `typography` (container)

- **Type**: `multi` (`label => false`) — a flat container; each inner option's value is stored under its own id.

The inner options:

### Heading Font — `heading_font`

- **Type**: `typography` (components: `family` only — `size`/`line-height`/`letter-spacing`/`color` all `false`)
- **Default**: `{ "family": "" }`
- **Choices**: `family` is a font-family picker — choices are dynamic: standard/websafe families + all Google Fonts + any Custom Fonts registered via `custom_fonts` (through `fw_option_type_typography*_standard_fonts`). Not a fixed enum.
- **Saved value shape**: `{ "family": "<Family Name>" }`
- **Notes**: Font family for all headings (H1–H6). Empty family inherits the body font. Emits `--font-heading`.

### Body Font & Text — `body`

- **Type**: `typography` (components: `family`, `size`, `line-height`, `letter-spacing`, `color` all `true`)
- **Default**: `{ "family": "Open Sans", "variation": "regular", "size": 16, "line-height": 1.6, "letter-spacing": 0, "color": "" }`
- **Choices**:
  - `family` — dynamic font-family list (see Heading Font).
  - `variation` — dynamic; the weight/style variations available for the chosen family (e.g. `regular`, `italic`, `700`, `700italic`, …). Default `regular`.
  - `size` / `line-height` / `letter-spacing` — numeric inputs (no fixed enum). `color` — color string.
- **Saved value shape**: `{ "family": "<Family>", "variation": "<variation>", "size": <px int>, "line-height": <number>, "letter-spacing": <number>, "color": "<hex|''>" }`
- **Notes**: Main content typography (paragraphs/lists). Emits `--font-body` + base body size/line-height/color.

### Body Link Color — `body_link`

- **Type**: `predefined-colors-color-picker-compact` (via `sc_color_field_compact({ kind: 'text' })`); falls back to `color-picker` (value `''`) if the shortcodes styling helper isn't loaded.
- **Default**: — (empty)
- **Choices** (compact preset dropdown, `kind => 'text'`): the `text-{slug}` palette presets from `unysonplus_color_preset_slug_map()` (live palette, not fixed here) plus an inline custom-color picker.
- **Saved value shape**: `{ "predefined": "text-<slug>", "custom": "#hex" }` (preset wins when both set; tolerates legacy plain-hex string).
- **Notes**: Link color inside post/page content. Empty = theme primary color. Resolve via `sc_normalize_color_value($v,'text')` or `var(--color-{slug})`.

### Body Link Hover Color — `body_link_hover`

- **Type**: `predefined-colors-color-picker-compact` (`sc_color_field_compact({ kind: 'text' })`); same fallback as above.
- **Default**: — (empty)
- **Choices**: same `text-{slug}` preset set as `body_link` + custom picker.
- **Saved value shape**: `{ "predefined": "text-<slug>", "custom": "#hex" }`
- **Notes**: Hover color for content links. Empty = reuse the link color.

### Body Link Underline — `body_link_underline`

- **Type**: `select`
- **Default**: `hover`

| value (stored key) | label |
|---|---|
| `hover` | On hover only (default) |
| `always` | Always underlined |
| `never` | Never underlined |

- **Saved value shape**: `"hover" | "always" | "never"`
- **Notes**: Underline style for links inside post/page content.

### Per-Heading Overrides (Advanced) — `h1` … `h6`

Six options (`h1`,`h2`,`h3`,`h4`,`h5`,`h6`), each built by the `$heading_override($label,$size,$lh,$ls)` helper. Kept flat inside the `multi` container so each h1–h6 value is stored individually.

- **Type**: `typography` (components: `family`, `size`, `line-height`, `letter-spacing`, `color` all `true`)
- **Default per heading** (`{ "family": "", "variation": "regular", "size": <size>, "line-height": <lh>, "letter-spacing": <ls>, "color": "" }`):

| id | label | size (px) | line-height | letter-spacing |
|---|---|---|---|---|
| `h1` | H1 Heading (override) | 36 | 1.15 | -0.7 |
| `h2` | H2 Heading (override) | 28 | 1.2 | -0.4 |
| `h3` | H3 Heading (override) | 24 | 1.3 | -0.2 |
| `h4` | H4 Heading (override) | 20 | 1.35 | 0 |
| `h5` | H5 Heading (override) | 18 | 1.4 | 0 |
| `h6` | H6 Heading (override) | 16 | 1.45 | 0 |

- **Choices**: `family` empty = inherit the Heading Font / preset; otherwise dynamic family list. `variation` dynamic (default `regular`).
- **Saved value shape**: `{ "family": "<Family|''>", "variation": "<variation>", "size": <px>, "line-height": <number>, "letter-spacing": <number>, "color": "<hex|''>" }`
- **Notes**: Fine-tune individual headings on top of the Preset / Heading Font. Any empty field keeps the preset scale / theme default; empty family inherits the Heading Font. These defaults are the no-preset baseline (progressive taper, negative tracking on the three largest headings).

---

## General → Typography → Custom Fonts — `custom_fonts`

Location: `general-fonts.php`. Self-hosted web fonts. `inc/includes/custom-fonts.php` emits `@font-face` into the generated stylesheet AND registers each family name into the typography pickers so it becomes selectable for headings/body/per-section typography.

- **Type**: `addable-box` (`label => false`, template `{{- family }}`)
- **Default**: `[]` (empty list)
- **Saved value shape**: array of rows — `[ { "family": "<Name>", "woff2": <upload>, "woff": <upload>, "weight": "<100..900>", "style": "normal|italic" }, … ]`

Per-row sub-fields (`box-options`):

| id | type | default | choices |
|---|---|---|---|
| `family` | text | `''` | — (free text; the name shown in the font selectors, e.g. "Brand Sans") |
| `woff2` | upload | — | — (.woff2 file; recommended modern format) |
| `woff` | upload | — | — (optional .woff fallback) |
| `weight` | select | `400` | see table below |
| `style` | select | `normal` | see table below |

`weight` choices:

| value (stored key) | label |
|---|---|
| `100` | 100 |
| `200` | 200 |
| `300` | 300 |
| `400` | 400 (normal) |
| `500` | 500 |
| `600` | 600 |
| `700` | 700 (bold) |
| `800` | 800 |
| `900` | 900 |

`style` choices:

| value (stored key) | label |
|---|---|
| `normal` | Normal |
| `italic` | Italic |

- **Notes**: After saving, each `family` becomes selectable in all Typography font pickers via `fw_option_type_typography*_standard_fonts`.

---

## Components → Text Styles — `font_sizes`

Location: `unysonplus/framework/extensions/shortcodes/includes/theme-settings/components-typography.php`. A Text Style is a named, reusable typographic token: a size PLUS optional weight / line-height / letter-spacing / transform. Every property is opt-in — a blank field INHERITS from the element's tag token. Stored under the legacy `font_sizes` key. Populates the "Text Style" dropdown in shortcode Styling tabs.

- **Type**: `addable-box` (meta: `sortable => true`, `box-duplicate => true`, `width => full`, `size => medium`, `add-button-text => "Add another text style"`)
- **Default value**: `unysonplus_default_font_size_presets()` (6 rows):

| name | size | class |
|---|---|---|
| Display 1 | 96 | `display-1` |
| Display 2 | 88 | `display-2` |
| Display 3 | 72 | `display-3` |
| Display 4 | 56 | `display-4` |
| Display 5 | 48 | `display-5` |
| Lead | 22 | `lead` |

- **Saved value shape**: array of rows — `[ { "name": "<str>", "size": "<px|''>", "weight": "<''|300..900>", "line_height": "<''|number>", "letter_spacing": "<''|number|len>", "transform": "<''|none|uppercase|lowercase|capitalize>", "class": "<literal-class|''>" }, … ]`

Per-row sub-fields (`box-options`):

### Name — `name`
- **Type**: text · **Default**: `''` · Free text. The dropdown label.

### Size — `size`
- **Type**: text · **Default**: `''` · Optional pixels without the `px` unit. Blank keeps the element's own size (a style-only preset).

### Weight — `weight`
- **Type**: `select` · **Default**: `''`

| value (stored key) | label |
|---|---|
| `` (empty) | Inherit (tag default) |
| `300` | 300 · Light |
| `400` | 400 · Regular |
| `500` | 500 · Medium |
| `600` | 600 · Semibold |
| `700` | 700 · Bold |
| `800` | 800 · Extrabold |
| `900` | 900 · Black |

Blank keeps the heading/tag weight.

### Line height — `line_height`
- **Type**: text · **Default**: `''` · Optional unitless (e.g. 1.1) or a length. Blank inherits.

### Letter spacing — `letter_spacing`
- **Type**: text · **Default**: `''` · Optional. Bare number read as em (e.g. -0.02 = tight); or include a unit (0.15em, 1px). Blank inherits.

### Transform — `transform`
- **Type**: `select` · **Default**: `''`

| value (stored key) | label |
|---|---|
| `` (empty) | Inherit |
| `none` | None |
| `uppercase` | UPPERCASE |
| `lowercase` | lowercase |
| `capitalize` | Capitalize |

### Class — `class`
- **Type**: text · **Default**: `''` · Optional literal CSS class (e.g. `display-1` to override Bootstrap's `.display-1`). If blank, auto-derived as a safe `.font-<NAME>` class.

- **Notes**: Each style becomes a `.font-{slug}` utility (or the literal `class` you set). Only filled properties are emitted, scoped to that class; blank properties inherit from the element's tag token. Mobile sizes are auto-reduced by `unysonplus_mobile_font_size_scale()` (tiered: ≥60px → ×0.60, ≥32px → ×0.75, ≥20px → ×0.85, else ×1.00; floor 14px; body-size text stays desktop-size). Live presets are read via `unysonplus_get_font_size_presets()` (saved rows override the defaults).
