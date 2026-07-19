# Theme Settings — General

The **General** tab holds site-wide layout, base polish, sidebar, and (in their own docs) color/typography/font options. Every option below is enumerated with all valid values.

> **Colors, Typography, Fonts, Spacing/Component presets** live in their own reference docs (and are edited under Theme Settings → Components, owned by the plugin). This doc covers **Layout**, **Base**, and **Sidebar** only.

Compact color controls (`sc_color_field_compact`) save as `{ predefined: '<text-slug>|<bg-slug>', custom: '#hex' }` — `predefined` wins when both set; empty = inherit/transparent. The available preset slugs come from the live palette (Theme Settings → Components → Colors); see the Colors doc. `kind:'bg'` yields `bg-{slug}` choices, `kind:'text'` yields `text-{slug}`.

---

# General → Layout — `general_layout`

Stored under the `general_layout` multi key. Groups are editor-only wrappers; leaf ids stay top-level.

## Group: Site Container — `group_container`

### Site Width Mode — `site_width_mode`
- **Type**: multi-picker (inline), picker id `mode`, image-picker
- **Default**: `{ mode: 'full' }`
- **Choices** (picker `mode`):

| value | label |
|---|---|
| full | (Full-width, edge to edge) |
| boxed | (Boxed, centered fixed-width column) |
| framed | (Framed, colored border around viewport) |

- **Revealed sub-options by choice**:
  - `boxed` reveals `site_boxed_width`, `site_boxed_alignment`, `site_boxed_margin`
  - `framed` reveals `site_frame_width`, `site_frame_color`
  - `full` reveals nothing
- **Saved value shape**: `{ mode: '<full|boxed|framed>', boxed: {...}, framed: {...} }` (only chosen mode's sub-values present)

#### site_boxed_width — `site_boxed_width` (revealed by mode=boxed)
- **Type**: slider · **Default**: `1320` · min 980, max 1920, step 10 (px)

#### site_boxed_alignment — `site_boxed_alignment` (revealed by mode=boxed)
- **Type**: image-picker · **Default**: `center`
- **Choices**:

| value | label |
|---|---|
| left | Left |
| center | Center |
| right | Right |

#### site_boxed_margin — `site_boxed_margin` (revealed by mode=boxed)
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'2.5', unit:'rem' }` · min 0

#### site_frame_width — `site_frame_width` (revealed by mode=framed)
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'1.25', unit:'rem' }` · min 0

#### site_frame_color — `site_frame_color` (revealed by mode=framed)
- **Type**: compact color (kind bg) · **Default**: empty (blank = default dark frame) · **Saved shape**: `{ predefined, custom }`

### Site Background — `site_background`
- **Type**: background-pro
- **Default**: empty
- **Saved value shape**: background-pro object (Color / Gradient / Image layers stack; color under, gradient over, image over). Video is NOT applied site-wide.
- **Notes**: background behind all content (body).

### Site Background Pattern — `site_background_pattern`
- **Type**: multi-picker (popover), picker id `pattern`, image-picker
- **Default**: `{ pattern: 'none' }`
- **Choices** (dynamic — `unysonplus_pattern_imagepicker_choices()`):

| value | label |
|---|---|
| none | None |
| `<pattern-preset-id>` | each pattern's name (one entry per preset defined in Theme Settings → Components → Background Patterns) |

- **Saved value shape**: `{ pattern: 'none' | '<preset-id>' }`
- **Notes**: reusable CSS/HTML pattern drawn as a fixed full-page layer. For a tiling image use Site Background → Image instead.

## Group: Spacing System — `group_spacing`

### Content Density — `layout_section_spacing`
- **Type**: radio · **Default**: `cozy`
- **Choices**:

| value | label |
|---|---|
| compact | Compact |
| cozy | Cozy (default) |
| spacious | Spacious |

- **Notes**: global vertical-rhythm density (compact 0.75×, cozy 1×, spacious 1.5×). Does NOT override a section's own Top/Bottom Spacing.

### Container Gutter — `layout_container_gutter`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'', unit:'rem' }` · min 0
- **Notes**: blank = responsive default (~12px phones to ~24px desktop).

### Container Width — `layout_container_width`
- **Type**: responsive (inner: unit-input, units px, rem, em, %)
- **Default**: `{ base:{value:'100',unit:'%'}, md:{value:'720',unit:'px'}, lg:{value:'1170',unit:'px'} }`
- **Saved value shape**: `{ base:{value,unit}, md?:{value,unit}, lg?:{value,unit} }` (mobile-first; blank device inherits smaller). Device tabs: Phone(base)/Tablet(md)/Desktop(lg).
- **Notes**: 100% = full width. Full-Width containers ignore it.

### Border Roundness — `layout_roundness`
- **Type**: radio · **Default**: `subtle`
- **Choices**:

| value | label |
|---|---|
| sharp | Sharp (square) |
| subtle | Subtle (default) |
| rounded | Rounded |
| soft | Soft |

- **Notes**: drives the `--radius` tokens on cards, buttons, inputs, images.

### Reading Width (no sidebar) — `layout_prose_width`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'', unit:'rem' }` · min 0
- **Notes**: caps content width of single posts/pages with no sidebar. Blank = none.

---

# General → Base — `general_base`

Small site-wide polish styles. Stored under the `general_base` multi key. Every field is opt-in (empty/Off = browser/theme default).

## Group: Text selection — `group_base_selection`

### Selection Background — `base_selection_bg`
- **Type**: compact color (kind bg) · **Default**: empty · **Saved shape**: `{ predefined, custom }`
- **Notes**: highlight color for selected text. Empty = browser default.

### Selection Text Color — `base_selection_color`
- **Type**: compact color (kind text) · **Default**: empty · **Saved shape**: `{ predefined, custom }`
- **Notes**: text color inside a selection. Empty = keep text's own color.

## Group: Content protection — `group_base_protection`

### Disable Text Selection — `base_disable_text_selection`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | On |
| no | Off |

- **Notes**: deterrent only (adds `up-noselect` body class); form fields stay selectable.

### Disable Right-Click — `base_disable_right_click`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | On |
| no | Off |

- **Notes**: blocks context menu (`up-nocontext` body class). Deterrent only.

### Disable Copy — `base_disable_copy`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | On |
| no | Off |

- **Notes**: intercepts copy/cut (`up-nocopy` body class). Deterrent only; form fields stay copyable.

## Group: Custom scrollbar — `group_base_scrollbar`

### Scrollbar Color — `base_scrollbar_color`
- **Type**: compact color (kind bg) · **Default**: empty · **Saved shape**: `{ predefined, custom }`
- **Notes**: scrollbar thumb color. Setting it enables the custom scrollbar (`custom-scrollbar` body class); empty = browser default.

### Scrollbar Width — `base_scrollbar_width`
- **Type**: unit-input (units: px only) · **Default**: `{ value:'10', unit:'px' }` · min 0
- **Notes**: WebKit thickness; only used when Scrollbar Color is set.

## Group: Focus outline — `group_base_focus`

### Focus Outline Color — `base_focus_color`
- **Type**: compact color (kind bg) · **Default**: empty · **Saved shape**: `{ predefined, custom }`
- **Notes**: keyboard-focus ring color. Empty = primary color.

### Focus Outline Width — `base_focus_width`
- **Type**: unit-input (units: px only) · **Default**: `{ value:'', unit:'px' }` · min 0
- **Notes**: blank = default 2px. Keep a visible ring for accessibility.

---

# General → Sidebar — `general_sidebar`

Theme-wide sidebar placement, per-context defaults, responsive/sticky behavior, styling. Stored under the `general_sidebar` multi key.

## Group: Placement — `group_sidebar`

### Default Sidebar Position — `layout_sidebar_position`
- **Type**: image-picker · **Default**: `right`
- **Choices**:

| value | label (svg) |
|---|---|
| none | No sidebar |
| left | Left |
| right | Right |

### Single Posts — `layout_sidebar_context_post`
- **Type**: select · **Default**: `inherit`
- **Choices**:

| value | label |
|---|---|
| inherit | Inherit global default |
| none | No Sidebar |
| left | Left |
| right | Right |

### Blog & Archives — `layout_sidebar_context_archive`
- **Type**: select · **Default**: `inherit` · **Choices**: same as Single Posts (inherit / none / left / right)

### Search Results — `layout_sidebar_context_search`
- **Type**: select · **Default**: `inherit` · **Choices**: same as Single Posts (inherit / none / left / right)

### 404 Page — `layout_sidebar_context_404`
- **Type**: select · **Default**: `inherit` · **Choices**: same as Single Posts (inherit / none / left / right)

### Sidebar Width — `layout_sidebar_width`
- **Type**: unit-input (units: rem, px, em, %) · **Default**: `{ value:'18.75', unit:'rem' }` · min 0

### Content / Sidebar Gap — `layout_sidebar_gap`
- **Type**: unit-input (units: rem, px, em, %) · **Default**: `{ value:'2.5', unit:'rem' }` · min 0

## Group: Responsive & Sticky — `group_sidebar_responsive`

### Sticky Sidebar — `layout_sidebar_sticky`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | Yes |
| no | No |

- **Notes**: desktop only.

### Sticky Offset — `layout_sidebar_sticky_offset`
- **Type**: unit-input (units: px, rem, em) · **Default**: `{ value:'24', unit:'px' }` · min 0

### Mobile Order — `layout_sidebar_mobile_order`
- **Type**: select · **Default**: `below`
- **Choices**:

| value | label |
|---|---|
| below | Below content |
| above | Above content |

### Hide on Mobile — `layout_sidebar_mobile_hide`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | Yes |
| no | No |

### Stack Below — `layout_sidebar_collapse_bp`
- **Type**: select · **Default**: `lg`
- **Choices**:

| value | label |
|---|---|
| lg | 992px (tablet & phone) |
| md | 768px (phone only) |

## Group: Styling — `group_sidebar_style`

### Sidebar Background — `layout_sidebar_bg`
- **Type**: compact color (kind bg) · **Default**: empty (transparent) · **Saved shape**: `{ predefined, custom }`

### Sidebar Padding — `layout_sidebar_padding`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'', unit:'rem' }` · min 0

### Border — `layout_sidebar_border`
- **Type**: multi-inline (border row: Width · Style · Color)
- **Default**: `{ width:{value:'',unit:'px'}, style:'solid', color:{predefined:'',custom:''} }`
- **Saved value shape**: `{ width:{value,unit}, style, color:{predefined,custom} }`
- **Choices** — sub-option `width`: unit-input (units px, em, rem), min 0. Sub-option `style` (select):

| value | label |
|---|---|
| solid | Solid |
| dashed | Dashed |
| dotted | Dotted |
| double | Double |

- Sub-option `color`: compact predefined-colors-color-picker (palette choices; kind text).
- **Notes**: leave width 0 for no border.

### Corner Radius — `layout_sidebar_radius`
- **Type**: unit-input (units: px, rem, em) · **Default**: `{ value:'', unit:'px' }` · min 0

### Widget Spacing — `layout_sidebar_widget_spacing`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'', unit:'rem' }` · min 0

### Widget Title Size — `layout_sidebar_widget_title_size`
- **Type**: unit-input (units: rem, px, em) · **Default**: `{ value:'', unit:'rem' }` · min 0

### Widget Title Weight — `layout_sidebar_widget_title_weight`
- **Type**: select · **Default**: `''` (Default)
- **Choices**:

| value | label |
|---|---|
| (empty) | Default |
| 400 | Normal (400) |
| 500 | Medium (500) |
| 600 | Semibold (600) |
| 700 | Bold (700) |

### Uppercase Widget Titles — `layout_sidebar_widget_title_uppercase`
- **Type**: switch · **Default**: `no`
- **Choices**:

| value | label |
|---|---|
| yes | On |
| no | Off |

### Widget Title Color — `layout_sidebar_widget_title_color`
- **Type**: compact color (kind text) · **Default**: empty (inherit body heading color) · **Saved shape**: `{ predefined, custom }`
