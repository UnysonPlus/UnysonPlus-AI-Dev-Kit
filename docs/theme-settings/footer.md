# Theme Settings → Footer

Authoritative reference for every Footer option (Theme Settings → Footer). Sub-tabs: **Footer Layout** (overall), **Pre-Footer**, **Main Footer**, **Post-Footer**, **Copyright**. (Footer Widgets is the legacy widgetized layout, documented last.) Every choice value below is verbatim.

---

## Footer Layout (`footer-layout.php`) — overall footer chrome

Top-level leaves plus three grouped sections (`group_footer_colors`, `group_footer_border`, `group_footer_spacing`; group ids are containers only, not stored).

### Background — `footer_background`
- **Type**: `background-pro` (`disable: ['video']`)
- **Default**: empty
- **Notes**: Color + gradient + image (position/size/repeat/scroll). For an image overlay, layer a semi-transparent color/gradient on top. Consumed as `--footer-bg-*`; legacy `footer_bg_color`/`image`/`overlay` still honored as fallback.

### Text Color — `footer_text_color` (`group_footer_colors`)
- **Type**: `predefined-colors-color-picker-compact` (kind `text`; fallback `color-picker`)
- **Default**: `{predefined:'',custom:''}`
- **Saved value shape**: `{predefined:'text-{slug}',custom:'#hex'}` (legacy hex string tolerated)
- **Notes**: Default text color for the whole footer. Choices = live palette presets.

### Link Color — `footer_link_color` (`group_footer_colors`)
- **Type**: same compact color (kind `text`)
- **Default**: `{predefined:'',custom:''}`
- **Notes**: Default link color for the whole footer.

### Border — `footer_border_top` (`group_footer_border`)
- **Type**: `multi-inline` (via `unysonplus_hf_border_row_field`; fallback plain `unit-input`)
- **Default**: `{ width:{value:'',unit:'px'}, style:'solid', color:{predefined:'',custom:''} }`
- **Choices** (the `style` child, `select`):

| value | label |
|---|---|
| `solid` | Solid |
| `dashed` | Dashed |
| `dotted` | Dotted |
| `double` | Double |

- **Saved value shape**: `{ width:{value,unit}, style, color:{predefined,custom} }`. `fw_multi_options`: `width` (unit-input `px`,`em`,`rem`), `style` (above), `color` (compact color-preset).
- **Notes**: One shared border (CSS-shorthand style). Shows only when both a width and a color are set. Stored under legacy `footer_border_top` key; consumed as `--footer-border-top-*`.

### Border Sides — `footer_border_sides` (`group_footer_border`)
- **Type**: `image-picker` `multiple:true` (via `unysonplus_hf_border_sides_field`)
- **Default**: `['top']`
- **Choices**:

| value | label |
|---|---|
| `top` | Top |
| `right` | Right |
| `bottom` | Bottom |
| `left` | Left |

- **Saved value shape**: array of checked side keys, e.g. `['top','bottom']`. Legacy single-select strings (`top`/`bottom`/`both`) tolerated (`both` → `['top','bottom']`).
- **Notes**: Which edges the border applies to. Mapped to `.footer--b{t,r,b,l}`.

### Border Extent — `footer_border_top_extent` (`group_footer_border`)
- **Type**: `multi-picker` (inline; picker sub-option `mode` = `select`)
- **Default**: `{ mode: 'full' }`
- **Choices** (picker `mode`):

| value | label |
|---|---|
| `full` | Full Width |
| `container` | Container Width |
| `custom` | Custom Width |

- **Saved value shape**: `[ 'mode' => 'full', 'custom' => { footer_border_top_extent_width:{value,unit} } ]`
- **Notes**: How far the border runs horizontally. `custom` reveals `footer_border_top_extent_width` (`unit-input`, units `px`,`rem`,`em`,`%`, default `{value:'',unit:'px'}`).

### Padding Top — `footer_padding_top` (`group_footer_spacing`)
- **Type**: `select` (Spacing-Scale steps via `unysonplus_footer_spacing`; falls back to `unit-input` [`rem`,`px`,`em`] when no scale)
- **Default**: `''` (Default (theme))
- **Choices**: `''` = "Default (theme)", then one entry per live Spacing Scale step (value = the step's size string e.g. `1.5rem`; a `0` step is labeled "None"). Choices depend on Theme Settings → General → Spacing.
- **Notes**: Space above the footer content (above Pre-Footer). Consumed as `--footer-pad-*`.

### Padding Bottom — `footer_padding_bottom` (`group_footer_spacing`)
- **Type**: same spacing-scale select
- **Default**: `''`
- **Notes**: Space below Post-Footer, above the Copyright bar.

### Custom CSS Class — `footer_css_class`
- **Type**: `text`. **Default** `''`. Class(es) on the footer wrapper.

---

## The columns control (`unysonplus_footer_columns_field`)

Pre-/Main/Post-Footer and Copyright each use one `multi-picker` columns control. Signature per section: `(prefix, max, default_count[, col1_default])`.

### Number of Columns — picker `count`
- **Type**: `select`
- **Default**: the section's `default_count` (see each section)
- **Choices**: `1` … `max` — labeled "1 Column", "2 Columns", … "N Columns". `max` = 6 for footer rows, 3 for Copyright.
- **Saved value shape**: `{ count:'N', 'N':{ <prefix>_split OR <prefix>_layout, <prefix>_col_1..N:[items] } }`

Each count `N` reveals:
- **Ratio control**:
  - `N = 1` → none (full width).
  - `N = 2,3,4,6` → `<prefix>_split` — **Type** `split-slider` (twelfths, `denominator:12`, `locked`, `min=max=N`). **Default** N equal segments summing to 100. Value = list of `{w:int,name:''}`. Names optional (`allow_names`).
  - `N = 5` → `<prefix>_layout` — **Type** `image-picker` (fifths grid, `unysonplus_footer_fifth_ratio_field`). **Default** `5-equal`. **Choices** (label = the `u/5` composition):

    | value | composition |
    |---|---|
    | `5-equal` | 1/5 + 1/5 + 1/5 + 1/5 + 1/5 |
    | `f5-2-1-1-1` | 2/5 + 1/5 + 1/5 + 1/5 |
    | `f5-1-2-1-1` | 1/5 + 2/5 + 1/5 + 1/5 |
    | `f5-1-1-2-1` | 1/5 + 1/5 + 2/5 + 1/5 |
    | `f5-1-1-1-2` | 1/5 + 1/5 + 1/5 + 2/5 |
    | `f5-3-1-1` | 3/5 + 1/5 + 1/5 |
    | `f5-1-3-1` | 1/5 + 3/5 + 1/5 |
    | `f5-1-1-3` | 1/5 + 1/5 + 3/5 |
    | `f5-2-2-1` | 2/5 + 2/5 + 1/5 |
    | `f5-2-1-2` | 2/5 + 1/5 + 2/5 |
    | `f5-1-2-2` | 1/5 + 2/5 + 2/5 |
    | `f5-4-1` | 4/5 + 1/5 |
    | `f5-1-4` | 1/5 + 4/5 |
    | `f5-3-2` | 3/5 + 2/5 |
    | `f5-2-3` | 2/5 + 3/5 |

    A composition with fewer parts renders fewer physical columns.
- **Content columns**: `<prefix>_col_1` … `<prefix>_col_N` — each an `addable-popup` (footer column; element popup below). Column 1 may carry a default (Copyright uses it for the copyright line).

*(Legacy helper `unysonplus_footer_ratio_picker` provides an alternate curated twelfths image-picker for 2–5 columns; the split-slider/fifths pickers above are what the sections actually use.)*

---

## Pre-Footer (`footer-pre.php`, stored under `pre_footer_columns`)

Renders only when a column has content.
- `pre_footer_presets` — **Type** `preset-loader` (`preset_group: pre_footer_columns`).
- `pre_footer_columns` — columns control, `max=6`, `default_count=1`. Sub-keys: `pre_footer_split`/`pre_footer_layout`, `pre_footer_col_1..6`.
- `pre_footer_custom_styling` — shared Custom Styling block (prefix `pre_footer`; see below).

## Main Footer (`footer-main.php`, stored under `main_footer_columns`)

Always-on footer body. Renders when a column has content.
- `main_footer_presets` — **Type** `preset-loader` (`preset_group: main_footer_columns`).
- `main_footer_columns` — columns control, `max=6`, `default_count=3`. Sub-keys: `main_footer_split`/`main_footer_layout`, `main_footer_col_1..6`.
- `main_footer_custom_styling` — shared Custom Styling block (prefix `main_footer`).

## Post-Footer (`footer-post.php`, stored under `post_footer_columns`)

Renders only when a column has content.
- `post_footer_presets` — **Type** `preset-loader` (`preset_group: post_footer_columns`).
- `post_footer_columns` — columns control, `max=6`, `default_count=1`. Sub-keys: `post_footer_split`/`post_footer_layout`, `post_footer_col_1..6`.
- `post_footer_custom_styling` — shared Custom Styling block (prefix `post_footer`).

## Copyright (`footer-copyright.php`, stored under `copyright_settings`)

Bottom-most strip. Enabled by default. `multi-picker` gated by an enable switch.

### Enable Copyright Section — picker `enabled`
- **Type**: `switch`. **Default** `yes`. right `{value:'yes',label:'Yes'}`, left `{value:'no',label:'No'}`.
- **Saved value shape**: `[ 'enabled' => 'yes', 'yes' => { copyright_columns:{…}, copyright_custom_styling:{…} } ]`

When `yes`:
- `copyright_columns` — columns control, `max=3`, `default_count=1`, with a Column 1 default: one `text` element `&copy; {{current_year}} <site name>. All rights reserved.` Sub-keys: `copyright_split` (2–3 cols), `copyright_col_1..3`.
- `copyright_custom_styling` — shared Custom Styling block (prefix `copyright`).
- `copyright_presets` — **Type** `preset-loader` (`preset_group: copyright_settings`) — sits above `copyright_settings`.

---

## Footer column element popup (`unysonplus_footer_column` → `addable-popup`)

Each footer column is an `addable-popup`. Per added item:

### Element — `element_type` (multi-picker, picker `element` = select)
- **Default**: `custom_html`
- **Choices**:

| value | label |
|---|---|
| `logo` | Logo |
| `footer_logo` | Footer Logo |
| `menu` | Menu |
| `menu_area` | Menu Area |
| `cta_button` | CTA Button |
| `icon_text` | Icon Text |
| `search` | Search |
| `social_icons` | Social Icons |
| `custom_html` | Custom HTML |
| `text` | Text |
| `widget_area` | Widget Area |
| `back_to_top` | Back to Top |
| `builder_section` | Builder Section |
| `snippet` | Snippet |

- **Saved value shape**: `[ 'element' => 'text', '<element>' => {…sub-options…} ]`
- **Per-element sub-options**:
  - `cta_button` → `cta_text` (text, default `Get Started`), `cta_link` (text, default `#`), `cta_style` (`button-style-picker` from Theme Settings → Buttons; fallback select `filled` Filled/`outline` Outline/`pill` Pill (Rounded)), `cta_size` (`button-style-picker` sizes).
  - `icon_text` → `icontext_icon` (icon-v2), `icontext_text` (text), `icontext_link_type` (select: `none` No link, `url` Website URL, `email` Email (mailto:), `phone` Phone (tel:); default `none`), `icontext_link` (text).
  - `custom_html` → `custom_html_content` (textarea).
  - `menu` → `menu_id` (select; existing WP nav menus).
  - `menu_area` → `menu_location` (select; default `primary`; `primary` Primary menu, `secondary` Secondary menu, `footer` Footer menu, + registered locations).
  - `text` → `text_content` (`wp-editor`; supports `{{current_year}}`).
  - `widget_area` → `sidebar_id` (select; default `sidebar-right`; registered sidebars incl. `footer-1..5`).
  - `footer_logo` → `footer_logo_image` (upload), `footer_logo_width` (unit-input `rem`,`px`,`em`, default `{value:'12.5',unit:'rem'}`).
  - `back_to_top` → `back_to_top_text` (text, default `Back to Top`; empty = arrow only).
  - `builder_section` → `builder_post_id` (select; saved layouts).
  - `snippet` → `snippet_id` (select; published Snippets).
  - `logo`, `search`, `social_icons` → no extra options.

### visibility — `visibility`
- **Type**: `checkboxes`. **Default** `[]`. **Choices**: `hide-xs` Mobile (< 768px), `hide-sm` Tablet (768–991px), `hide-md` Desktop (≥ 992px).

### CSS Class — `element_css_class`
- **Type**: `text`. **Default** `''`.

---

## Shared "Custom Styling" block (`{prefix}_custom_styling`)

Footer sections call `unysonplus_footer_custom_styling($prefix)` (alias of `unysonplus_hf_custom_styling`). A `multi-picker` gated by an enable switch.

### Enabled — picker `enabled`
- **Type**: `switch`. **Default** `no`. right `{value:'yes',label:'Yes'}`, left `{value:'no',label:'No'}`.
- **Saved value shape**: `[ 'enabled' => 'yes'|'no', 'yes' => { …4 groups… } ]`

When `yes`, reveals 4 container-only groups:
- `{prefix}_grp_layout`:
  - `{prefix}_container` — `image-picker`, default `container`. **Choices**: `container` Fixed Width, `container-fluid` Full Width.
  - `{prefix}_padding` — `spacing` (mode `padding`, responsive utility classes).
- `{prefix}_grp_appearance`:
  - `{prefix}_background` — `background-pro` (video disabled).
  - `{prefix}_typography` — `typography` (family/size/weight/line-height/letter-spacing/color).
  - `{prefix}_link_color` — compact color (kind `text`).
- `{prefix}_grp_borders`:
  - `{prefix}_border` — `multi-inline` border row: `{ width:{value,unit}, style, color:{predefined,custom} }`; `style` select **Choices** `solid` Solid, `dashed` Dashed, `dotted` Dotted, `double` Double. Shows only when width+color set.
  - `{prefix}_border_sides` — `image-picker` multiple, default `['top']`. **Choices**: `top` Top, `right` Right, `bottom` Bottom, `left` Left.
  - `{prefix}_border_extent` — `multi-picker` (inline), default `{mode:'full'}`. Picker `mode` **Choices**: `full` Full Width, `container` Container Width, `custom` Custom Width. `custom` reveals `{prefix}_border_extent_width` (unit-input `px`,`rem`,`em`,`%`).
- `{prefix}_grp_advanced`:
  - `{prefix}_css_class` — `text`, default `''`.

---

## Footer Widgets (`footer-widgets.php`, stored under `footer_widgets`) — legacy widgetized layout

A `multi-picker` gated by an enable switch. (Separate legacy control; not one of the five sub-tabs above.)

### Footer Widgets — picker `enabled`
- **Type**: `switch`. **Default** `yes`. right `{value:'yes',label:'Yes'}`, left `{value:'no',label:'No'}`.
- **Saved value shape**: `[ 'enabled' => 'yes'|'no', 'yes' => { widget_group:{ style:{…}, container:'…' } } ]`

When `yes` → group `widget_group`:

### Style — `style` (nested multi-picker, picker `selected` = select)
- **Type**: `select`. **Default** `col-md-4`
- **Choices**:

| value | label |
|---|---|
| `col-md-12` | 1 column |
| `col-md-6` | 2 equal columns |
| `col-md-6-a` | 2 columns (2/3 + 1/3) |
| `col-md-6-b` | 2 columns (1/3 + 2/3) |
| `col-md-4` | 3 equal columns |
| `col-md-4-a` | 3 columns (1/4 + 1/2 + 1/4) |
| `col-md-4-b` | 3 columns (1/4 + 1/4 + 1/2) |
| `col-md-4-c` | 3 columns (1/3 + 1/6 + 1/2) |
| `col-md-3` | 4 equal columns |
| `col-md-5` | 5 equal columns |

### Container — `container`
- **Type**: `image-picker`. **Default** `container`
- **Choices**:

| value | label |
|---|---|
| `container` | (Fixed-width container thumbnail) |
| `container-fluid` | (Full-width container thumbnail) |

- **Notes**: Container layout for the widget rows. Column content is filled from WordPress footer widget areas (`footer-1..5`).
