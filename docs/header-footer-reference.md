# UnysonPlus Header & Footer — complete option reference

The exhaustive catalogue of every **Header** and **Footer** Theme-Settings option in
`unysonplus-theme`. **Read this before styling chrome.** If a look is in here, use the
option — do **not** write child CSS for it.

All settings live in one wp_option (`fw_theme_settings_options:unysonplus`), keyed by
top-level id. Each tab/section top-level id is a `multi` container storing a nested
array; `group` and `box` containers are display-only and **flatten** (their ids are
NOT stored), so the leaf ids below are the real persisted keys.

## Set an option programmatically

```php
$hm = fw_get_db_settings_option( 'header_menu' );
$hm['menu_item_style'] = 'pill';                       // native active-item pill
fw_set_db_settings_option( 'header_menu', $hm );
```

## "Use the option, not CSS" — common cases I used to hack

| Want | ❌ don't CSS | ✅ native option |
|---|---|---|
| Active menu item = filled pill | `.current-menu-item{background…}` | `header_menu → menu_item_style = 'pill'` (also `box`,`outline`,`highlight`,`underline`…) |
| Header as a floating card / pill | wrap + radius CSS | `header_layout → header_mode[top][header_design][design] = 'card'` (or `'pill'`,`'centered'`) |
| Logo display size | `.site-logo{height…}` | `header_logo → logo_type[simple][width]` (+ `sticky_shrink_height`) |
| Hairline under header | `border-bottom` | `header_layout → header_border = 'yes'` |
| Header shadow / glass | `box-shadow` / `backdrop-filter` | `header_layout → header_shadow` / `header_glass` |
| Uppercase nav | `text-transform` | `header_layout → header_uppercase_nav = 'yes'` |
| Gap between logo & menu | margins | `header_layout → header_element_gap` |
| Header width (boxed/full) | container CSS | `header_layout → container` = `container` / `container-fluid` |
| Header height | min-height CSS | `header_layout → min_height` (default `5rem`) + `mobile_min_height` |
| Sticky / hide-on-scroll / transparent | JS/CSS | `header_layout → header_behavior` |
| Footer top border (full / container / custom width) | CSS | `footer_border_top` + `footer_border_sides` + `footer_border_top_extent` |
| Menu link / hover / dropdown colours | CSS | `header_menu → menu_link_color`, `menu_link_hover_color`, `menu_dropdown_*` |

**Recurring value shapes:**
- **switch** → `'yes'` / `'no'`
- **unit-input** → `{ value: '<num-string>', unit: '<unit>' }`
- **compact color** (`sc_color_field_compact`) → `{ predefined: 'text-<slug>'|'bg-<slug>'|'', custom: '#hex'|'' }` (preset wins; tolerates a legacy plain-hex string)
- **background-pro** → `{ color:{value:{predefined,custom}}, gradient:{data:{type,angle,stops:[{color,position}]}}, image:{src,position,repeat,size,attachment}, overlay:{…} }` (video layer disabled in H/F contexts)
- **typography** → `{ family, size, weight, line-height, letter-spacing, color, … }`
- **multi-picker** (inline) → `{ '<picker_id>': '<choice_key>', '<choice_key>': { …revealed sub-values… } }`
- **image-picker** single → `'<choice_key>'`; `multiple:true` → array of keys
- **addable-popup** (a H/F column) → array of element rows: `{ element_type:{ element:'<type>', '<type>':{…} }, visibility:[], element_css_class:'' }`

---

## HEADER

Storage keys per sub-tab: `header_logo`, `header_layout`, `header_menu`, `header_topbar`, `header_main`, `header_bottombar`.

### Header → Identity (`header_logo`)

`logo_type` is an image-picker multi-picker revealing Simple (image) or Custom (icon+text). Favicon always visible. Two-way synced with WP Custom Logo / Site Icon.

| Key (stored path) | Label | Type | Default | Choices / shape | What it does |
|---|---|---|---|---|---|
| `logo_type[logo_type]` | Logo Type | image-picker | `simple` if a WP custom_logo exists else `custom` | `custom` (icon+text), `simple` (image) | Which logo builder is revealed |
| `logo_type[simple][image]` | Logo Upload | upload (images) | — | `{attachment_id,url}` | Main image logo (synced w/ WP Custom Logo) |
| `logo_type[simple][image_2x]` | Logo (Retina 2×) | upload | — | upload | Hi-DPI logo via srcset |
| `logo_type[simple][sticky_image]` | Sticky-Header Logo | upload | — | upload | Alt logo once header sticks |
| `logo_type[simple][mobile_image]` | Mobile Logo | upload | — | upload | Logo below 768px |
| `logo_type[simple][transparent_image]` | Transparent-Header Logo | upload | — | upload | Logo while header transparent/overlay |
| `logo_type[simple][alt]` | Logo Alt Text | text | `''` | string | Alt (falls back to Site Title) |
| `logo_type[simple][width]` | **Logo Width** | unit-input | `{value:'',unit:'px'}` | px/rem/em | **Display width of the image logo** |
| `logo_type[custom][site_title]` | Site Title | text | site name | string | Text wordmark |
| `logo_type[custom][tagline_text]` | Tagline Text | text | `''` | string | Sub-line / eyebrow |
| `logo_type[custom][logo_icon]` | Logo Icon | icon-v2 | — | icon-v2 | Optional brand mark (inline SVG) |
| `logo_type[custom][logo_layout]` | Logo Layout | image-picker | `inline-left` | `inline-left/right`, `stacked-left/right`, `eyebrow-left/right` | Arrangement of icon/title/tagline |
| `logo_type[custom][logo_icon_frame]` | Logo Icon Frame | image-picker | `none` | `none`,`rounded`,`squircle`,`circle`,`square`,`hexagon` | Tile behind the mark |
| `logo_type[custom][title_size]` | Site Title Size | unit-input | `{value:'',unit:'rem'}` | px/rem/em | Wordmark size |
| `logo_type[custom][title_weight]` | Site Title Weight | select | `''` | `300…900` | Wordmark weight |
| `logo_type[custom][color]` | Site Title Color | compact color | `{predefined:'',custom:''}` | palette | Wordmark color |
| `logo_type[custom][tagline_color]` | Tagline Color | compact color | — | palette | Tagline color |
| `logo_type[custom][logo_icon_color]` | Logo Icon Color | compact color | — | palette | Icon color |
| `logo_type[custom][logo_icon_size]` | Logo Icon Size | unit-input | `{value:'',unit:'em'}` | px/rem/em | Icon size |
| `logo_type[custom][logo_custom_css]` | Logo Custom CSS | code-editor | `''` | string | Extra CSS for the lockup |
| `favicon` | Favicon / Site Icon | upload | — | upload | Browser-tab icon (synced w/ WP Site Icon) |

### Header → Layout (`header_layout`)

| Key | Label | Type | Default | Choices / shape | What it does |
|---|---|---|---|---|---|
| `header_mode[mode]` | Header Layout Mode | image-picker | `top` | `top`,`vertical`,`off-canvas-only`,`overlay` | Overall layout mode |
| `header_mode[top][header_design][design]` | **Header Design** | image-picker | `classic` | `classic`,`pill`,`card`,`centered` | **Structural treatment (Top mode)** |
| `header_mode[top][header_design][pill][pill_radius]` | Roundness | select | `full` | `full`,`large`,`medium` | Pill radius |
| `header_mode[top][header_design][pill][pill_inset]` | Side Inset | select | `none` | `none`,`small`,`large` | Pill inset |
| `header_mode[top][header_design][pill][pill_shadow]` | Shadow | select | `medium` | `soft`,`medium`,`strong` | Pill shadow |
| `header_mode[top][header_design][card][card_radius]` | Corner Radius | select | `medium` | `small`,`medium`,`large` | Card radius |
| `header_mode[top][header_design][card][card_shadow]` | Shadow | select | `medium` | `soft`,`medium`,`strong` | Card shadow |
| `header_mode[top][header_design][centered][centered_gap]` | Spacing | select | `normal` | `tight`,`normal`,`roomy` | Centered spacing |
| `header_mode[vertical][vertical_side][side]` | Rail Side | image-picker | `left` | `left`,`right` | Vertical rail side |
| `header_mode[vertical][vertical_width]` | Vertical Header Width | unit-input | `{value:'16.25',unit:'rem'}` | rem/px/em | Side-rail width |
| `header_mode[overlay][overlay_style][style]` | Overlay Style | image-picker | `panel` | `panel`,`radial`,`concentric` | Fullscreen overlay style |
| `header_mode[overlay][overlay_color_mode]` | Color Mode | select | `shade` | `shade`,`tint`,`aurora`,`rainbow`,`mono`,`duotone`,`alternating`,`glass` | Overlay coloring |
| `header_mode[overlay][overlay_bg_opacity]` | Background Opacity | slider | `100` | 20–100 step 5 | Ring opacity |
| `header_mode[overlay][overlay_background]` | Overlay Background | background-pro | — | bg-pro | Overlay backdrop |
| `container` | Container | select | `container` | `container` (Fixed), `container-fluid` (Full) | Header width |
| `min_height` | Main Header Height | unit-input | `{value:'5',unit:'rem'}` | rem/px/em | Main row min-height |
| `mobile_min_height` | Mobile Header Height | unit-input | `{value:'',unit:'rem'}` | rem/px/em | Header height on phones |
| `mobile_breakpoint` | Collapse to Mobile Menu At | select | `lg` | `lg` (<992), `md` (<768) | Inline menu → hamburger point |
| `header_behavior` | Header Behavior | select | `static` | `static`,`sticky`,`sticky-shrink`,`hide-on-scroll`,`transparent-overlay` | Scroll behavior |
| `sticky_shrink_height` | Shrunk Logo Height | unit-input | `{value:'',unit:'px'}` | px/rem | Logo height when shrunk |
| `bg_color` | Main Header Background | compact color (bg) | — | palette | Header bg (empty = transparent) |
| `header_border` | Header Border | switch | `no` | yes/no | Hairline under header |
| `header_shadow` | Header Shadow | switch | `no` | yes/no | Drop shadow |
| `header_glass` | Translucent / Glass | switch | `no` | yes/no | Frosted backdrop blur |
| `header_uppercase_nav` | Uppercase Navigation | switch | `no` | yes/no | Uppercase primary links |
| `header_valign` | Vertical Alignment | select | `center` | `top`,`center`,`bottom` | Vertical align in rows |
| `header_element_gap` | Element Gap | unit-input | `{value:'',unit:'rem'}` | rem/px/em | Gap between elements in a column |
| `mobile_drawer_side` | Mobile Menu Side | select | `right` | `right`,`left` | Drawer slide-in side |
| `nav_scrollspy` | Scroll Spy | switch | `no` | yes/no | One-page nav highlight + smooth scroll |
| `mobile_hide_topbar` | Hide Top Bar on Mobile | switch | `no` | yes/no | Hide Top Bar <768 |
| `mobile_hide_bottombar` | Hide Bottom Bar on Mobile | switch | `no` | yes/no | Hide Bottom Bar <768 |

### Header → Menu (`header_menu`)

| Key | Label | Type | Default | Choices / shape | What it does |
|---|---|---|---|---|---|
| `menu_item_style` | **Menu Item Style** | image-picker | `none` | `none`,`underline-grow`,`underline`,`pill`,`box`,`outline`,`bottom-bar`,`top-bar`,`highlight` | **Hover/active treatment** (→ `body.menu-style-{slug}`) |
| `menu_font` | Menu Font Family | typography (family) | — | — | Menu font family |
| `menu_link_font_size` | Menu Font Size | unit-input | `{value:'',unit:'rem'}` | rem/px/em | Menu link size |
| `menu_link_color` | Menu Link Color | compact color (text) | — | palette | Link color |
| `menu_link_hover_color` | Menu Hover / Active Color | compact color (text) | — | palette | Hover/active/accent |
| `menu_item_bg` | Item Background | compact color (bg) | — | palette | Normal item bg |
| `menu_item_hover_bg` | Item Hover / Active Background | compact color (bg) | — | palette | Fill for pill/box/highlight |
| `menu_link_padding_x` | Link Horizontal Spacing | unit-input | — | rem/px/em | Link L/R padding |
| `menu_link_padding_y` | Link Vertical Spacing | unit-input | — | rem/px/em | Link T/B padding |
| `menu_dropdown_style` | Dropdown Design | image-picker | `classic` | `classic`,`elevated`,`bordered`,`minimal`,`top-accent` | Dropdown look |
| `menu_dropdown_bg` | Dropdown Background | compact color (bg) | — | palette | Dropdown bg |
| `menu_dropdown_link` | Dropdown Link Color | compact color (text) | — | palette | Dropdown link |
| `menu_dropdown_link_hover` | Dropdown Link Hover | compact color (text) | — | palette | Dropdown link hover |
| `menu_dropdown_item_hover_bg` | Dropdown Item Hover Background | compact color (bg) | — | palette | Dropdown item hover bg |
| `menu_dropdown_width` | Dropdown Width | unit-input | `{value:'',unit:'px'}` | px/rem/em | Min dropdown width |
| `menu_dropdown_radius` | Dropdown Corner Radius | unit-input | `{value:'',unit:'px'}` | px/rem/em | Dropdown radius |

*Sub-label from the item Description is rendered by `unysonplus_nav_menu_item_sublabel()` (see the theme's `inc/menus.php`); styled via `.menu-sublabel`.*

### Header → Top Bar / Main Header / Bottom Bar

`header_topbar` / `header_main` / `header_bottombar` — each a `multi` with left/center/right **addable-popup** columns (element-arrays) + a `*_custom_styling` block. No enable switch — a bar renders when a column has an element. `header_main` defaults: `main_left = [logo]`, `main_right = [menu_area primary]`.

- `header_topbar → topbar_left / topbar_center / topbar_right / topbar_custom_styling`
- `header_main → main_left / main_center / main_right / main_custom_styling`
- `header_bottombar → bottombar_left / bottombar_center / bottombar_right / bottombar_custom_styling`

---

## FOOTER

Storage: `footer_background`/`footer_text_color`/… (Layout), `pre_footer_columns`, `main_footer_columns`, `post_footer_columns`, `copyright_settings`.

### Footer → Layout

| Key | Label | Type | Default | Choices / shape | What it does |
|---|---|---|---|---|---|
| `footer_background` | Background | background-pro | — | bg-pro shape | Footer background |
| `footer_text_color` | Text Color | compact color (text) | — | palette | Default footer text |
| `footer_link_color` | Link Color | compact color (text) | — | palette | Default footer link |
| `footer_border_top` | Border | multi-inline (Width·Style·Color) | `{width:{value:'',unit:'px'},style:'solid',color:{predefined:'',custom:''}}` | style solid/dashed/dotted/double | Footer border shorthand |
| `footer_border_sides` | Border Sides | image-picker `multiple` | `['top']` | `top`,`right`,`bottom`,`left` | Which edges |
| `footer_border_top_extent[mode]` | Border Extent | select | `full` | `full`,`container`,`custom` | How far border runs |
| `footer_border_top_extent[custom][footer_border_top_extent_width]` | Custom Border Width | unit-input | — | px/rem/em/% | Centered max-width (Custom) |
| `footer_padding_top` | Padding Top | select (spacing-scale) | `''` | live spacing sizes | Space above footer |
| `footer_padding_bottom` | Padding Bottom | select (spacing-scale) | `''` | live spacing sizes | Space below footer |
| `footer_css_class` | Custom CSS Class | text | `''` | string | Class on footer wrapper |

### Footer → Pre / Main / Post

Each is a **Footer Columns** field + a `*_custom_styling` block:
- `pre_footer_columns` (default 1 col) · `main_footer_columns` (**default 3**) · `post_footer_columns` (default 1)

### Footer → Copyright (`copyright_settings`)

A **multi-picker**: `copyright_settings[enabled]` (switch, default `yes`) reveals `copyright_settings[yes][copyright_columns]` (Footer Columns, max 3, col 1 pre-filled with a Text element `© {{current_year}} <site>. All rights reserved.`) + `copyright_settings[yes][copyright_custom_styling]`.

### Footer Columns field shape

Each columns control is a multi-picker:
- `count` (select) `'1'..'N'` (N = 6 footer / 3 copyright).
- Under `'<N>'`: a **ratio control** (`<prefix>_split` split-slider of `{w,name}` summing to 100 for 2/3/4/6 cols; `<prefix>_layout` image-picker of fifths for 5 cols), plus content columns `<prefix>_col_1 … _col_N` (each an **addable-popup** element-array).

Example (main footer, 3 cols): `{ count:'3', '3':{ main_footer_split:[{w,name}×3], main_footer_col_1:[…], main_footer_col_2:[…], main_footer_col_3:[…] } }`.

---

## Per-section Custom Styling block (`*_custom_styling`)

A multi-picker whose `enabled` switch (default `no`) reveals: `<prefix>_container` (Fixed/Full), `<prefix>_padding` (spacing), `<prefix>_background` (bg-pro), `<prefix>_typography`, `<prefix>_link_color`, `<prefix>_border` (+ `_border_sides`, `_border_extent`), `<prefix>_css_class`. Prefixes: `topbar`,`main`,`bottombar`,`pre_footer`,`main_footer`,`post_footer`,`copyright`. Stored: `{ enabled:'yes'|'no', yes:{ …leaves… } }`.

---

## Header / Footer Element Types

Each element row: `element_type:{ element:'<type>', '<type>':{…fields…} }` + `visibility:[]` (`hide-xs`/`hide-sm`/`hide-md`) + `element_css_class:''`.

**Header:** `logo`, `menu`, `menu_area`, `cta_button`, `icon_text`, `search`, `social_icons`, `custom_html`, `text`, `widget_area`, `builder_section`, `spacer`, `divider`.
**Footer:** `logo`, `footer_logo`, `menu`, `menu_area`, `cta_button`, `icon_text`, `search`, `social_icons`, `custom_html`, `text`, `widget_area`, `back_to_top`, `builder_section`.

| Element | Stored fields under `element_type[<type>]` |
|---|---|
| `logo` | *(none — reuses Identity logo)* → `{}` |
| `footer_logo` | `footer_logo_image` (upload), `footer_logo_width` (unit-input, `{value:'12.5',unit:'rem'}`) |
| `menu` | `menu_id` (select of Appearance→Menus) |
| `menu_area` | `menu_location` (select, default `primary`; `primary`/`secondary`/`footer` + registered) |
| `cta_button` | `cta_text` (`Get Started`), `cta_link` (`#`), `cta_style` (button-style-picker), `cta_size` |
| `icon_text` | `icontext_icon` (icon-v2), `icontext_text`, `icontext_link_type` (`none`/`url`/`email`/`phone`), `icontext_link` |
| `search` | *(none)* → `{}` |
| `social_icons` | *(none — pulls Social tab `social_profiles`)* → `{}` |
| `custom_html` | `custom_html_content` (textarea) |
| `text` | `text_content` (wp-editor; supports `{{current_year}}`) |
| `widget_area` | `sidebar_id` (select; `sidebar-right/left`, `header-1..3`, `footer-1..5`, …) |
| `builder_section` | `builder_post_id` (select of saved page-builder layouts) |
| `back_to_top` | `back_to_top_text` (`Back to Top`) |
| `spacer` / `divider` | *(no reveal fields)* → `{}` |

Notes: `logo/search/social_icons/spacer/divider` have no reveal fields. CTA style/size ride Theme Settings → General → Buttons (`btn {style} {size}`). `text` is rich (wp-editor); `custom_html` is a plain textarea.

---

*Generated from the option definitions under `unysonplus-theme/framework-customizations/theme/options/` + `inc/includes/header-footer-option-helpers.php`. Keep in sync when options change.*
