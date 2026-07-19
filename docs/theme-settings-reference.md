---
type: reference
name: theme-settings-options-reference
audience: AI agents setting Theme Settings values via fw_set_db_settings_option() without reading source
canonical: parent theme (unysonplus-theme). Header & Footer options are catalogued separately.
---

# Theme Settings — complete option reference (General / Colors / Typography / Site-wide UX / Misc / Blog / Pages)

Exhaustive per-option catalogue so an agent can set any Theme Setting **without reading the PHP
source**. Companion to:
- **`AGENTS.md`** (this folder) — the schema / storage / CSS-mapping **guide** (read it for the big picture).
- **Header & Footer** — the **# HEADER & FOOTER** section at the end of this file (`header_logo`, `header_layout`, `header_menu`, `header_main`, `footer_*`, `main_footer_columns`, `copyright_settings`, element types).

## How to set / read

All settings live in one wp_option (`fw_theme_settings_options:unysonplus`), keyed by top-level id.
```php
$typ = fw_get_db_settings_option( 'typography' );      // read a whole multi-container
$typ['body']['family'] = 'Inter';
fw_set_db_settings_option( 'typography', $typ );        // write it back
```
- Each **top-level id is a `multi` container** storing a nested array. `group` / `box` / `tab`
  containers are **display-only and flatten** — their ids are NOT stored, so the leaf ids below are
  the real persisted keys.
- **addable-box** keys (`custom_fonts`, `social_profiles`, `theme_colors`) store an **array of row
  objects** — set the whole key to the array.
- **Per-post** options (`post_options`, `page_options`) use `fw_set_db_post_option( $post_id, $key, $value )`.

### Recurring value shapes
- **switch** → `'yes'` / `'no'` (NOT boolean `true` — the check is `=== 'yes'`).
- **unit-input** → `{ value:'<num-string>', unit:'<unit>' }`
- **responsive** → `{ base:{value,unit}, md:{…}, lg:{…} }` (mobile-first; blank device inherits smaller)
- **typography** (v2) → `{ family, variation, size, 'line-height', 'letter-spacing', color }` (only enabled `components` stored)
- **compact color** (`sc_color_field_compact`) → `{ predefined:'text-<slug>'|'bg-<slug>'|'', custom:'#hex'|'' }` (preset wins; tolerates a legacy plain string)
- **background-pro** → `{ color:{value:{predefined,custom}}, gradient:{data:{type,angle,stops}}, image:{src,position,repeat,size,attachment}, video:{…}, advanced:[] }`
- **multi-picker** (inline/popover) → `{ '<picker_id>':'<choice_key>', '<choice_key>':{ …revealed… } }`
- **image-picker** single → `'<choice_key>'`; `multiple:true` → array of keys
- **checkboxes** → `{ '<choice_key>': true|false, … }`
- **select / radio** → one choice-key string

---

## Colors — `theme_colors` (the palette; lives in the plugin)

**Storage key: `theme_colors`** — an **addable-box**, array of `{ name, color }` rows. Defined by the
Unyson+ Shortcodes extension (`includes/theme-settings/components-color.php`, default
`unysonplus_default_color_presets()`), surfaced at **Theme Settings → General → Colors** (the theme's
General→Colors tab is a pointer to it). Each row `name` → slug → a `.text-{slug}` / `.bg-{slug}`
utility + a **`--color-{slug}`** CSS variable. **`Primary` drives `btn-primary` + `--color-primary`.**

Default rows (set the whole `theme_colors` array to override; change a `color` to re-brand):

| name | slug | default color | name | slug | default color |
|---|---|---|---|---|---|
| Primary | `primary` | `#0d6efd` | White | `white` | `#fff` |
| Secondary | `secondary` | `#6c757d` | Gray | `gray` | `#636c72` |
| Accent | `accent` | `#fd7e14` | Red | `red` | `#dc3545` |
| Muted | `muted` | `#adb5bd` | Green | `green` | `#5cb85c` |
| Black | `black` | `#000` | Orange | `orange` | `#ff9800` |

…plus Light Gray, Pink, Purple, Deep Purple, Indigo, Blue, Light Blue, Cyan, Teal, Light Green, Lime,
Yellow, Amber, Deep Orange, Brown, Blue Gray. **To re-brand:** read the defaults, change the `Primary`
row's `color`, write the whole array back:
```php
$presets = unysonplus_default_color_presets();
foreach ( $presets as &$p ) { if ( $p['name'] === 'Primary' ) { $p['color'] = '#f97316'; } }
fw_set_db_settings_option( 'theme_colors', $presets );   // → --color-primary + btn-primary go orange
```

---

## `general_layout` — General → Layout

Site width mode, background/pattern, spacing system. Merged with sidebar/preloader/scroll by `unysonplus_layout_get()`.

| Key (stored path) | Label | Type | Default | Choices / value-shape | What it does |
|---|---|---|---|---|---|
| `site_width_mode[mode]` | Site Width Mode | multi-picker → image-picker | `{mode:'full'}` | `full`,`boxed`,`framed` | Overall site-container layout |
| `site_width_mode[boxed][site_boxed_width]` | Boxed Width | slider | `1320` | 980–1920 step 10 | Max boxed width (px) |
| `site_width_mode[boxed][site_boxed_alignment]` | Boxed Alignment | image-picker | `center` | `left`,`center`,`right` | Boxed container align |
| `site_width_mode[boxed][site_boxed_margin]` | Site Top/Bottom Margin | unit-input | `{value:'2.5',unit:'rem'}` | rem/px/em | Space above/below boxed |
| `site_width_mode[framed][site_frame_width]` | Frame Width | unit-input | `{value:'1.25',unit:'rem'}` | rem/px/em | Viewport border thickness |
| `site_width_mode[framed][site_frame_color]` | Frame Color | compact color (bg) | `{predefined:'',custom:''}` | palette | Frame border color |
| `site_background` | Site Background | background-pro | — | bg-pro (no video) | Body background |
| `site_background_pattern[pattern]` | Site Background Pattern | multi-picker (popover) | `{pattern:'none'}` | pattern choices | Fixed full-page pattern layer |
| `layout_section_spacing` | Content Density | radio | `cozy` | `compact`(0.75×),`cozy`,`spacious`(1.5×) | Global vertical rhythm |
| `layout_container_gutter` | Container Gutter | unit-input | `{value:'',unit:'rem'}` | rem/px/em | Content side padding |
| `layout_container_width` | Container Width | responsive → unit-input | `{base:{100,%}, md:{720,px}, lg:{1170,px}}` | px/rem/em/% | Max content width per device |
| `layout_roundness` | Border Roundness | radio | `subtle` | `sharp`,`subtle`,`rounded`,`soft` | `--radius` token |
| `layout_prose_width` | Reading Width (no sidebar) | unit-input | `{value:'',unit:'rem'}` | rem/px/em | Caps sidebarless content width |

## `general_base` — General → Base

Selection color, content-protection, custom scrollbar, focus outline (all opt-in).

| Key | Label | Type | Default | What it does |
|---|---|---|---|---|
| `base_selection_bg` / `base_selection_color` | Selection Background / Text | compact color | `{'',''}` | Text-selection colors |
| `base_disable_text_selection` / `base_disable_right_click` / `base_disable_copy` | Disable Selection/Right-Click/Copy | switch | `no` | Content-protection deterrents |
| `base_scrollbar_color` / `base_scrollbar_width` | Scrollbar Color / Width | compact color / unit-input(px) | `{'',''}` / `{10,px}` | Custom WebKit scrollbar (set color to enable) |
| `base_focus_color` / `base_focus_width` | Focus Outline Color / Width | compact color / unit-input(px) | `{'',''}` / `{'',px}` | Keyboard focus ring |

## `typography` — General → Typography

**`typography.body.family` default = `Open Sans`.** Set `body.family` + `heading_font.family` to change the site typeface (the theme auto-loads the Google font). `typography_presets` is a preset-loader (writes into this group, stores nothing).

| Key (stored path) | Label | Type | Default | What it does |
|---|---|---|---|---|
| `heading_font` | Heading Font | typography (family only) | `{family:''}` | Headings font (blank inherits body) |
| `body` | Body Font & Text | typography (full) | `{family:'Open Sans', variation:'regular', size:16, 'line-height':1.6, 'letter-spacing':0, color:''}` | Main content typography |
| `body_link` / `body_link_hover` | Body Link / Hover Color | compact color (text) | `{'',''}` | Content link colors (blank=primary) |
| `body_link_underline` | Body Link Underline | select | `hover` | `hover`,`always`,`never` |
| `h1`…`h6` | Per-Heading Override | typography (full) | h1 `{'',regular,36,1.15,-0.7,''}` … h6 `{…,16,1.45,0,''}` | Fine-tune each heading (blank keeps preset scale) |

## `custom_fonts` — General → Typography → Custom Fonts (addable-box)

Array of rows: `{ family (text), woff2 (upload), woff (upload), weight ('100'…'900', default '400'), style ('normal'|'italic') }`. Each registers into the font pickers.

## `general_sidebar` — General → Sidebar

Sidebar placement/width/gap/sticky + styling. Key ids: `layout_sidebar_position` (image-picker `none`/`left`/`right`, default `right`), per-context `layout_sidebar_context_{post,archive,search,404}` (select `inherit`/`none`/`left`/`right`), `layout_sidebar_width` (`{18.75,rem}`), `layout_sidebar_gap` (`{2.5,rem}`), `layout_sidebar_sticky` (switch), `layout_sidebar_sticky_offset` (`{24,px}`), `layout_sidebar_mobile_order` (`below`/`above`), `layout_sidebar_mobile_hide` (switch), `layout_sidebar_collapse_bp` (`lg`/`md`), `layout_sidebar_bg`/`_padding`/`_border`/`_radius`, `layout_sidebar_widget_spacing`/`_widget_title_size`/`_weight`/`_uppercase`/`_color`.

## Social — `social_style` + `social_profiles`

- **`social_style`** (the look): `social_icon_style` (image-picker `bare`/`circle`/`circle-outline`/`rounded`/`square`/`square-outline`, default `bare`), `social_icon_size` (`{2.25,rem}`), `social_icon_gap` (`{0.5,rem}`), `social_icon_brand` (switch), `social_icon_color`/`_bg`/`_hover_color`/`_hover_bg` (compact color), `social_icon_hover_fx` (`none`/`lift`/`scale`/`fill`). `social_presets` is a preset-loader.
- **`social_profiles`** (addable-box): rows `{ name (text), link (text), icon (icon-v2), new_tab (switch, default 'yes') }`. Seeded with Facebook/X/Instagram.

## `general_pages` — General → Pages

| Key | Type | Default | Choices |
|---|---|---|---|
| `default_header_preset` / `default_footer_preset` | select | `''` | `''`=Default + up_header/up_footer presets |
| `default_page_layout` | select | `default` | `default`,`sidebar-right`,`sidebar-left`,`full-width`,`boxed-narrow` |
| `pages_show_breadcrumbs` | switch | `no` | yes/no |
| `pages_show_featured_image` | switch | `yes` | yes/no |

---

## Site-wide UX & Miscellaneous

### `misc_custom_css` — Global Custom CSS ← **bespoke per-design CSS goes here**
Storage key **`misc_custom_css`**; leaf **`misc_custom_css[custom_css]`** — a **code-editor (CSS)**, value = **raw CSS string**. Defined by the plugin (`shortcodes/includes/theme-settings/miscellaneous-custom-css.php`), rendered at **Miscellaneous → Custom CSS**, emitted after all styles so it wins the cascade, and captured by design export. Set with:
```php
fw_set_db_settings_option( 'misc_custom_css', array( 'custom_css' => "/* bespoke rules */" ) );
```

### `misc_dark_mode` — Site-wide UX → Dark Mode
`dark_mode_enable` (switch `'yes'`/`'no'`, default `no`), `dark_mode_default` (radio `auto`/`light`/`dark`, default `auto`), `dark_mode_position` (`bottom-left`/`bottom-right`/`top-left`/`top-right`, default `bottom-left`), `dark_mode_show_label` (switch, default `no`). **Uses Bootstrap `data-bs-theme`.**

### `misc_scroll_top` — Site-wide UX → Scroll to Top
`scroll_top_enable` (switch), `scroll_top_position` (`right`/`left`), `scroll_top_design` (`rounded`/`circle`/`square`/`pill`/`outline`/`ring`), `scroll_top_size` (`small`/`medium`/`large`), `scroll_top_offset` (`{300,px}`, units px/vh), `scroll_top_text` (text), `scroll_top_bg_color`/`_text_color` (compact color).

### `general_preloader` — Site-wide UX → Preloader
`layout_preloader_style` (image-picker `none`/`spinner`/`logo`, default `none`), `layout_preloader_bg_color` (compact color bg).

### `general_scroll` — Site-wide UX → Scrolling
`layout_smooth_scroll` (switch), `layout_scroll_progress` (switch), `layout_scroll_progress_color` (compact color bg, fallback `#0d6efd`).

### `misc_dev_tools` — Miscellaneous → Developer Tools
`dev_show_demo` (switch, default `no`) — reveals the option-type showcase "Demo" tab.

### Other Misc (defined by the plugin, read via back-compat map)
`misc_custom_scripts[custom_head_scripts|custom_body_open_scripts|custom_footer_scripts]`; `misc_analytics[analytics_ga4_id|analytics_gtm_id|analytics_meta_pixel_id|analytics_clarity_id]`. **These are excluded from design export** (operational keys).

---

## Blog & Post

### `blog_index` — Blog listing
`blog_layout` (`list`/`grid`/`masonry`, default `list`), `blog_columns` (`1`–`4`, default `2`), `blog_card_style` (`plain`/`boxed`/`bordered`/`overlay`), `blog_featured_image` (switch, default `yes`), `blog_image_ratio` (`original`/`16-9`/`4-3`/`1-1`, default `16-9`), `blog_image_hover` (`none`/`zoom`/`lift`), `blog_category_badge` (switch), `blog_content` (`excerpt`/`full`), `blog_excerpt_length` (`30`), `blog_meta` (checkboxes `{date,author,category,comments,reading_time}`), `blog_meta_position` (`below-title`/`above-title`), `blog_read_more` (`Read more`), `blog_sticky_highlight` (switch `yes`), `blog_first_featured` (switch `no`), `blog_posts_per_page` (text), `blog_pagination` (`numbers`/`prev_next`/`load_more`).

### `blog_single` — Single post defaults
`single_sidebar` (`inherit`/`none`/`left`/`right`), `single_featured_image` (switch `yes`), `single_featured_position` (`above-title`/`below-title`), `single_meta` (checkboxes), `single_author_box` (switch `yes`), `single_related` (switch `yes`), `single_related_count` (`2`/`3`/`4`), `single_related_by` (`category`/`tag`), `single_related_style` (`grid`/`list`/`carousel`), `single_related_ratio` (`16-9`/`4-3`/`1-1`), `single_post_nav` (switch `yes`).

### `blog_single_hero` — Single post header/hero
`single_header_style` (`standard`/`hero`), `single_hero_height` (`small`/`medium`/`large`/`fullscreen`), `single_hero_align` (`top`/`center`/`bottom`), `single_hero_overlay_color` (compact color), `single_hero_overlay_opacity` (slider 0–100, default 45), `single_progress_bar` (switch).

### `blog_single_extras` — Single post elements
`single_breadcrumbs`, `single_toc` (+`single_toc_title` `In this article`), `single_share` (+`single_share_position` `top`/`bottom`/`both`, `single_share_networks` checkboxes `{x,facebook,linkedin,whatsapp,copy}`), `single_tags` (switch `yes`), `single_comments` (switch `yes`).

### `blog_archives` — Archives & Search
`archive_header` (switch `yes`), `archive_show_description` (switch `yes`), `archive_author_bio` (switch `yes`), `archive_layout` (`inherit`/`list`/`grid`/`masonry`), `archive_columns` (`''`/`1`–`4`), `archive_sidebar` (`inherit`/`none`/`left`/`right`), `search_layout` (`inherit`/`list`/`grid`), `search_empty_message` (text).

### `blog_card` — Card design
`blog_card_radius` (`none`/`sm`/`md`/`lg`/`xl`, default `md`), `blog_card_shadow` (`none`/`sm`/`md`/`lg`), `blog_card_padding` (`compact`/`normal`/`roomy`), `blog_card_hover_accent` (switch).

### `post_options` — Per-post overrides (post meta; `fw_set_db_post_option`)
`post_header_style` (`default`/`standard`/`hero`), `post_sidebar` (`default`/`none`/`left`/`right`), and the `$_toggle` selects (`default`/`show`/`hide`): `post_progress_bar`, `post_featured_image`, `post_author_box`, `post_breadcrumbs`, `post_toc`, `post_share`, `post_tags`, `post_comments`, `post_related`, `post_nav`. **"default" = inherit the global.**

---

## Pages & WooCommerce

### `pages_hero` — Pages → Page Title / Hero (GLOBAL)
`default_page_header_image` (upload), `default_page_header_height` (radio `auto`/`small`/`medium`/`large`/`fullscreen`), `default_hero_align` (`top`/`center`/`bottom`, default `center`), `default_hero_overlay_color` (compact color bg), `default_hero_overlay_opacity` (slider 0–100, default 0). Per-page Page Settings → Hero overrides these.

### `pages_layout` — Pages → Layout (GLOBAL)
`default_sidebar` (image-picker `inherit`/`none`/`left`/`right`, default `inherit`), `default_content_width` (image-picker `default`/`narrow`/`wide`/`full`).

### `page_options` — Per-Page Settings (post meta; `fw_set_db_post_option`)
`page_options[body_class]` (text) — the only active leaf. (`hide_title`, `footer_scripts` exist in source but are commented out.)

### `woocommerce` — POINTER TAB ONLY
No stored options. Real shop settings live in the **WooCommerce extension** (Unyson+ → Extensions → WooCommerce), bridged to the theme via `unysonplus_woocommerce_*` filters. Tab only registered when `class_exists('WooCommerce')`.

---

---

# HEADER & FOOTER

> The Header & Footer options. Value shapes (switch → 'yes'/'no', unit-input, compact color, background-pro, the addable-popup element rows) are shared with the sections above.


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

*Complete Theme Settings reference — General/Colors/Typography/Site-UX/Misc/Blog/Pages + Header/Footer. Keep in sync when options change.*
