# Theme Settings → Footer

Authoritative reference for every Footer option (Theme Settings → Footer). Sub-tabs: **Footer Layout** (overall), **Pre-Footer**, **Main Footer**, **Post-Footer**, **Copyright**. (Footer Widgets is the legacy widgetized layout, documented last.) Every choice value below is verbatim.

---

## Mapping a design's footer to the four bars (do this FIRST)

The footer is **four stacked bars, top→bottom: Pre-Footer → Main Footer → Post-Footer → Copyright.** Before setting any option, break the source/design footer into its **bands** (full-width horizontal strips) and assign each to a bar.

**Two hard rules:**
1. **Order is sacred** — bars always render Pre→Main→Post→Copyright, so assign bands so the design's *top-to-bottom order is preserved*. Never reorder.
2. **Copyright = the LAST band** (© line / legal links) — always its own bar (`copyright_settings.enabled='yes'`). Copyright auto-aligns by column count: **1 col = centered · 2 cols = left + right · 3 cols = left + center + right** (e.g. legal `text` left + a policy `menu` right = 2 columns).

**Anchor on Main Footer, fill outward:** the primary content band (the biggest multi-column grid — logo + link columns / widgets) → **Main Footer**; a band *above* it → **Pre-Footer**; a band *below* it (above ©) → **Post-Footer**.

| Bands (incl. ©) | Pre | Main | Post | Copyright |
|---|---|---|---|---|
| **1** (just ©) | — | — | — | ✓ |
| **2** (grid + ©) | — | grid | — | ✓ |
| **3** | top band | grid | — | ✓ *(or Main + Post + © if the band is below the grid)* |
| **4+** | top band | grid | secondary rows | ✓ |

**More bands than bars?** First stack several **single-column** bands as **vertical elements inside one bar's single column** (elements stack). Only when you have **5+ structurally-distinct (multi-column) grids** above the copyright that can't stack — register **extra bars** (see *Extra footer bars* below); never cram a distinct band into the Copyright tab.

**Column setup per bar:**
- **Multi-column grid** → set Number of Columns + ratio. If the columns are *content-sized with `space-between`* (a brand block beside content-hugging link lists — the 12-grid can't express it), turn **Auto Width On** (`<prefix>_auto='yes'`) + set **Distribution** (`<prefix>_justify`, usually `between`).
- **Single content row** (badge strip, centered link cloud, disclaimer box) → **1 column** (auto-centers), one element per band, stacked.

**Common footer shapes:** *Minimal* (© only) → Copyright. *Classic corporate* (column grid + ©) → Main + Copyright. *CTA/brand on top* → Pre + Main + Copyright. *Secondary bottom row* (social/lang/app-badges) → Main + Post + Copyright. *Compliance-heavy* (columns + badges + disclaimer + ©) → Main + Post (stacked) + Copyright.

---

## Footer Layout (`footer-layout.php`) — overall footer chrome

Top-level leaves plus grouped sections (`group_footer_mode`, `group_footer_colors`, `group_footer_border`, `group_footer_spacing`; group ids are containers only, not stored).

### Overlay on Last Section — `footer_overlay_last_section` (`group_footer_mode`)
- **Type**: `switch` — `yes` / `no`
- **Default**: `no`
- **Notes**: When `yes`, the footer is pinned to the bottom of the page's LAST full-height section and **overlaid** on it (adds `footer--overlay` to `#colophon`), instead of rendering as a separate band below the page — removing any blank tail after a pinned last section (cinematic / scroll-story pages). A tiny inline runtime measures the footer height (`--footer-overlay-h`) and only engages (`footer--overlay-on`, which pulls the footer up + sets `z-index`) when the last section is **≥ 70vh tall**; otherwise it stays a normal band. Changes POSITIONING only — the footer background defaults to **transparent** in overlay mode (the scene shows through), so set a `footer_background` scrim + `footer_text_color`/`footer_link_color` for legibility, and make the last section hold (not fade) at its end.

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
- **Auto Width (fit to content)** — `<prefix>_auto` (**Type** `switch`, default `no`) + `<prefix>_justify` (**Type** `image-picker`, default `between`). When `<prefix>_auto = 'yes'` the Column Ratio above is **ignored**: columns become content-sized flex (`footer-col--auto`) and the row (`footer-row--auto`) distributes them by `<prefix>_justify`. Use this when the source columns **hug their content with `space-between`** (a brand block beside content-sized link lists) — the twelfths split-slider and fifths picker can only express *fixed fractions*, so they can't reproduce "one wider column beside content-hugging ones".
  - `<prefix>_justify` choices: `between` (space-between — default) · `around` (space-around) · `center` · `start` (flex-start) · `end` (flex-end). Thumbnails diagram each.
  - **Saved value** adds `<prefix>_auto` + `<prefix>_justify` under the count `N`, alongside `<prefix>_split`. Setting it: `main_footer_columns['4']['main_footer_auto']='yes'`, `['main_footer_justify']='between'`.
- **Content columns**: `<prefix>_col_1` … `<prefix>_col_N` — each an `addable-popup` (footer column; element popup below). Column 1 may carry a default (Copyright uses it for the copyright line).

*(Legacy helper `unysonplus_footer_ratio_picker` provides an alternate curated twelfths image-picker for 2–5 columns; the split-slider/fifths pickers above are what the sections actually use.)*

---

## Extra footer bars — the `unysonplus_footer_extra_bars` filter

The four fixed bars (Pre / Main / Post / Copyright) cover almost every footer, and overflow **single-column** bands just stack as elements in one bar's column. But a design with **5+ structurally-distinct (multi-column) bands** above the copyright runs out of bars — do **not** cram one into the Copyright tab. Instead register **extra bars**: they appear as sub-tabs **between Post-Footer and Copyright** (Copyright stays pinned last) and render in that same order, each with the **full columns control** (count + ratio + Auto Width + elements — full parity with the built-ins).

**Register via the filter** — return `id => { label, max }` (`max` 1–6, default 6; ids are `sanitize_key`'d and the reserved `pre/main/post/copyright/layout` are dropped):

```php
add_filter( 'unysonplus_footer_extra_bars', function ( $bars ) {
    $bars['row4'] = array( 'label' => 'Footer Row 4', 'max' => 6 );
    $bars['row5'] = array( 'label' => 'Footer Row 5', 'max' => 6 );
    return $bars;
} );
```

**WHERE to put that filter (REQUIRED — this is site config, not framework code):**
- **Site has a child theme** → the **child theme's `functions.php`** (the canonical home). Check `get_option('stylesheet') !== get_option('template')` — if they differ, a child theme is active.
- **No child theme** (`stylesheet === template`) → a small **mu-plugin** at `wp-content/mu-plugins/<name>.php` (`<?php` + the `add_filter`). It auto-loads and is theme-independent.
- **Never** in the **parent theme** (`unysonplus-theme`) `functions.php` — that ships the bars to *every* site — and **never** in the shipped **`unysonplus-theme-child`** template child theme (same reason). Per-site bars belong to that site's child theme (or mu-plugin), not the products.

**Storage & keys:** each bar stores under **`footer_x_<id>_columns`** in `fw_theme_settings_options:unysonplus`, the same shape as `main_footer_columns` (`{count,'N':{…}}`). Its prefix is `footer_x_<id>`, so `<prefix>_split` / `<prefix>_auto` / `<prefix>_justify` / `<prefix>_col_i` all apply exactly as documented above.

**How it wires (parent theme — already built; you only register the filter):** `unysonplus_footer_extra_bars()` (`inc/includes/footer-builder.php`) normalizes the filter list → `id => {label,max,prefix}`; `footer-settings.php` splices one sub-tab per bar (built from `unysonplus_footer_columns_field(prefix,max,1)`) before Copyright; `template-parts/footer-builder.php` loops the **same** list, rendering each `unysonplus_render_footer_section()` between Post-Footer and Copyright. One list drives tabs + render (never desync), and Copyright is appended **after** the loop in both, so it's structurally always last.

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

### Picking the element type — do NOT default to Custom HTML (REQUIRED)

The **Element** picker defaults to **`custom_html`**, so it's tempting to paste everything as raw HTML. **Don't.** Classify each piece of column content and pick the semantic element; **Custom HTML is the last resort**, only for bespoke markup no element covers.

| Column content | Correct element |
|---|---|
| A list of links / a nav | **Menu** — a registered WP menu (Appearance → Menus), picked via `menu_id` — best when the same menu is reused/managed centrally. Or **Links** — an *inline* `{label,url}` list (heading + rows) stored on the element itself, so the links can never vanish from a missing menu object. The Site Converter maps footer link columns to **Links** for exactly that reason. Never custom HTML for links. |
| A logo image | **Footer Logo** (or Logo) |
| A heading, paragraph, brand blurb, rich text, the © line | **Text** (`wp-editor`; `wpautop` preserves block tags like `<h5>`) |
| A row of social icons | **Social Icons** |
| An email signup form ("Stay Connected" + email field + button) | **Newsletter** — the working AJAX signup (`newsletter` shortcode); set Heading / Email Placeholder / Button Label. Never Custom HTML for a signup. |
| Phone / email / address with an icon | **Icon Text** (or Phone) |
| A search box | **Search** · a registered widget area → **Widget Area** · a whole builder section → **Builder Section** · a reusable snippet → **Snippet** |
| Bespoke markup no element covers (e.g. an image/badge strip) | **Custom HTML** — only here |

Rule of thumb: **links → Menu, words → Text, logo → Footer Logo; Custom HTML only when nothing else fits.** Tag any element needing CSS with its **CSS Class** field (`element_css_class`) — it lands on the `.footer-element` wrapper (`.footer-element.<class>`) — rather than wrapping the content in a classed `<div>`. Menu elements render `.builder-menu-list`; Text elements render `.builder-text-element`, so target those (scoped by your element class) in Custom CSS.

*Worked example — a link column* = **Text** (`<h5>Bingo</h5>`, class `fcol-title`) **+ Menu** (the "Footer — Bingo" menu, class `fcol-links`). A compliance-badge strip stays **Custom HTML** (an image row has no element). The © bar = **Text** (© line) + **Menu** (a "Footer Legal" menu).

### Element — `element_type` (multi-picker, picker `element` = select)
- **Default**: `custom_html`
- **Choices**:

| value | label |
|---|---|
| `logo` | Logo |
| `footer_logo` | Footer Logo |
| `menu` | Menu |
| `menu_area` | Menu Area |
| `links` | Links (inline `{label,url}` rows; heading via `links_title`, rows via `links_items`) |
| `cta_button` | CTA Button |
| `icon_text` | Icon Text |
| `search` | Search |
| `social_icons` | Social Icons |
| `newsletter` | Newsletter |
| `custom_html` | Custom HTML |
| `text` | Text |
| `widget_area` | Widget Area |
| `back_to_top` | Back to Top |
| `builder_section` | Builder Section |
| `snippet` | Snippet |

**Addon-registered elements** also appear here when their extension is active — e.g. the WooCommerce extension adds a **Mini Cart** (`mini_cart`, context `both`). Extensions register via the `unysonplus_hf_elements` filter (`{label, context:'header'|'footer'|'both', options}`) and render via `add_action('unysonplus_render_hf_element_<slug>', …)`. See [extensions/woocommerce.md](../extensions/woocommerce.md) for the reference implementation.

- **Saved value shape**: `[ 'element' => 'text', '<element>' => {…sub-options…} ]`
- **Per-element sub-options**:
  - `cta_button` → `cta_text` (text, default `Get Started`), `cta_link` (text, default `#`), `cta_style` (`button-style-picker` from Theme Settings → Buttons; fallback select `filled` Filled/`outline` Outline/`pill` Pill (Rounded)), `cta_size` (`button-style-picker` sizes).
  - `icon_text` → `icontext_icon` (icon-v2), `icontext_text` (text), `icontext_link_type` (select: `none` No link, `url` Website URL, `email` Email (mailto:), `phone` Phone (tel:); default `none`), `icontext_link` (text).
  - `custom_html` → `custom_html_content` (textarea).
  - `menu` → `menu_id` (select; existing WP nav menus).
  - `menu_area` → `menu_location` (select; default `primary`; `primary` Primary menu, `secondary` Secondary menu, `footer` Footer menu, + registered locations).
  - `text` → `text_content` (`wp-editor`; supports `{{current_year}}`).
  - `widget_area` → `sidebar_id` (select; default `sidebar-right`; registered sidebars incl. `footer-1..5`).
  - `footer_logo` → `footer_logo_image` (upload), `footer_logo_width` (unit-input `rem`,`px`,`em`, default `{value:'12.5',unit:'rem'}`), **`footer_logo_show_title`** (switch, default `no` — show the site title as a wordmark beside the image, an image+text **lockup** like the header logo), **`footer_logo_title`** (text, default `''` — optional wordmark text; empty = the Site Title). Re-resolved from `attachment_id` on the current site at render (portable, no cross-site 404 — see the logo-portability note in `theme-settings/header.md`); falls back to the text logo when the attachment isn't present here. SVG supported. **Renders**: `.footer-logo-link` (+ `.footer-logo-link--lockup` when the title is on) wrapping `img.footer-logo-img` + `span.footer-logo-title`. Use this for a brand mark **+ wordmark** footer column — do NOT hand-build it as a `text` element with an inline `<img>` (that's a hack; this is the editable native element).
  - `back_to_top` → `back_to_top_text` (text, default `Back to Top`; empty = arrow only).
  - `builder_section` → `builder_post_id` (select; saved layouts).
  - `snippet` → `snippet_id` (select; published Snippets).
  - `logo`, `search`, `social_icons` → no extra options.

- **Saved value shapes for programmatic construction** (what a build script must write, not just the type name):
  - `icon_text` → `icontext_icon` is an **icon-v2** whose stored value is `{ 'type' => 'icon-font', 'icon-class' => '<class>' }`; the renderer reads `icontext_icon['icon-class']`. The theme ships **Font Awesome**, so use FA classes: `fas fa-location-dot` (address), `fas fa-phone`, `fas fa-clock`, `fas fa-moon`, `fas fa-envelope`. `icontext_link_type`+`icontext_link` make it a real `mailto:`/`tel:`/URL link.
    Example item: `['element_type' => ['element' => 'icon_text', 'icon_text' => ['icontext_icon' => ['type'=>'icon-font','icon-class'=>'fas fa-phone'], 'icontext_text' => '+1 (555) …', 'icontext_link_type' => 'phone', 'icontext_link' => '']]]`.
  - `social_icons` → no per-element options; it renders the profiles from **Theme Settings → Social** (`general_social` — each item `{ 'icon' => ['type'=>'icon-font','icon-class'=>'fab fa-instagram'], 'url' => '…' }`). Set the profiles there first, or no icons render.
  - `menu` → `menu_id` is the WP menu **term id** (or the menu **name/slug** `wp_get_nav_menu_object()` accepts). Create the menu with `wp_create_nav_menu()` + `wp_update_nav_menu_item()` first, then reference it.
  - `cta_button` → `cta_style`/`cta_size` are a **button-style-picker** storing the chosen preset slug (e.g. `'filled'`/`'outline'`/`'pill'`); the picker's choices come from Theme Settings → Buttons.
  - `text` → `text_content` is raw WYSIWYG HTML; runs through `wpautop`+`do_shortcode`. A footer column **title** is an `<h2>` here (styled small via CSS), and links belong in a **Menu** element, not typed as `<ul>` in Text.
  - `custom_html` → `custom_html_content` runs `do_shortcode()` (so `[wc_mini_cart …]` etc. work). Reserve it for markup with no native element (e.g. a newsletter `<form>`).

- **Rendered output / CSS hook per element** (every element is wrapped in `.footer-element.footer-element--<type>` + your `element_css_class`; target the inner node):
  | element | renders | inner hook |
  |---|---|---|
  | `logo` / `footer_logo` | the site logo lockup / footer image | `.site-logo` / `.footer-logo img` |
  | `menu` | the chosen WP menu as a `<ul>` | `.builder-menu-list` |
  | `menu_area` | the theme menu at a location (primary → inline nav) | `.builder-menu-list` / theme nav |
  | `text` | WYSIWYG HTML (`wpautop`+`do_shortcode`) | `.builder-text-element` |
  | `icon_text` | `<i class="icon-class">` + text, optionally linked (`mailto:`/`tel:`/URL; external → new tab) | `.icon-text` (icon `<i>` + `<span>`) |
  | `social_icons` | Theme Settings → Social profiles as icon links | `.social-icons a` |
  | `cta_button` | a themed button | `.btn` (+ chosen style/size classes) |
  | `search` | a WP search form | `.search-form` |
  | `custom_html` | raw HTML, `do_shortcode`'d | `.footer-custom-html` |
  | `widget_area` | a registered sidebar's widgets | `.widget` |
  | `back_to_top` | a scroll-to-top link (arrow + optional text) | `.footer-back-to-top` |
  | `builder_section` | a saved page-builder layout, `do_shortcode`'d | `.up-builder-section` |
  | `snippet` | a published Snippet's output | (snippet markup) |
  - **Shared per item:** `visibility` (device hide checkboxes) and `element_css_class` (lands on the `.footer-element` wrapper). The header uses the SAME element set + shapes (see [header.md](header.md)); differences are only the extra header-only types (`phone`, `spacer`, `divider`).

### visibility — `visibility`
- **Type**: `checkboxes`. **Default** `[]`. **Choices**: `hide-xs` Mobile (< 768px), `hide-sm` Tablet (768–991px), `hide-md` Desktop (≥ 992px).

### CSS Class — `element_css_class`
- **Type**: `text`. **Default** `''`. Lands on the element's `.footer-element` wrapper.
- **Use it for per-element spacing AND alignment via utility classes** instead of child CSS:
  - **Spacing** — spacing-scale classes (`mt-3`=1rem, `mt-4`=1.5rem, `mt-5`=3rem; `mt-`/`mb-`/`pt-`/`pb-`,
    names `0`–`12`), e.g. `mt-4` on a `social_icons` element for a gap above it.
  - **Alignment** — the **copyright bar auto-aligns by column count** (1 col = centered, 2 = left|right,
    3+ = left|center|right) via `unysonplus_copyright_auto_align_class()`, so a `© …` line needs no
    class. Override one column with a text-align utility on its `element_css_class` (`text-start` /
    `text-center` / `text-end`, Bootstrap, theme-shipped) — deeper in the DOM, so it wins. Widget
    columns keep their natural left alignment (no count-based auto-align).
  - Every header/footer element has this field — reach for it + a utility to space/align/tweak an
    element, rather than a `.footer .builder-… {…}` rule in the child theme.

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
  - `{prefix}_border_extent` — `multi-picker` (inline), default `{mode:'full'}`. Picker `mode` **Choices**: `full` Full Width, `container` Container Width, `custom` Custom Width. `custom` reveals `{prefix}_border_extent_width` (unit-input `px`,`rem`,`em`,`%`). **Gotcha:** `container`/`custom` render the top/bottom line as a **centered `::before`/`::after` pseudo-element** capped at the max width (the section's own `border-top` stays `0` — verify the *pseudo*). Use this to reproduce a source's container-width `border-t` divider (e.g. a copyright hairline).
- `{prefix}_grp_advanced`:
  - `{prefix}_css_class` — `text`, default `''`.

### The 7 blocks — prefix → option key (header + footer share the same builder)

| Section | `$prefix` | Option key | Builder |
|---|---|---|---|
| Header main bar | `main` | `main_custom_styling` (in `header_main`) | `unysonplus_hf_custom_styling('main')` |
| Header topbar | `topbar` | `topbar_custom_styling` (in `header_topbar`) | `unysonplus_hf_custom_styling('topbar')` |
| Header bottombar | `bottombar` | `bottombar_custom_styling` (in `header_bottombar`) | `unysonplus_hf_custom_styling('bottombar')` |
| Footer — pre | `pre_footer` | `pre_footer_custom_styling` | `unysonplus_footer_custom_styling('pre_footer')` |
| Footer — main | `main_footer` | `main_footer_custom_styling` | `unysonplus_footer_custom_styling('main_footer')` |
| Footer — post | `post_footer` | `post_footer_custom_styling` | `unysonplus_footer_custom_styling('post_footer')` |
| Footer — copyright | `copyright` | `copyright_custom_styling` | `unysonplus_footer_custom_styling('copyright')` |

### Programmatic value shapes (build-script — the `yes` group leaves flatten, groups are NOT stored)

`fw_set_db_settings_option('<option key>', [...])` with:
```php
[ 'enabled' => 'yes',
  'yes' => [
    '<prefix>_container'  => 'container',            // or 'container-fluid'
    '<prefix>_padding'    => [ /* spacing: 'top'/'right'/'bottom'/'left' => e.g. 'pt-9' (scale slug) */ ],
    '<prefix>_background'  => [ 'color' => [ 'value' => [ 'predefined' => '', 'custom' => '#fdf2f8' ] ],
                               'gradient' => [ 'data' => [ 'type'=>'linear','angle'=>90,'stops'=>[] ] ],
                               'image' => [ 'src'=>[], 'position'=>'center center', 'size'=>['selected'=>'cover','custom'=>''], 'repeat'=>'no-repeat', 'attachment'=>'scroll' ],
                               'advanced' => [] ],
    '<prefix>_typography'  => [ 'family'=>'Quicksand', 'variation'=>'regular', 'size'=>14,
                               'line-height'=>1.6, 'letter-spacing'=>0, 'color'=>'rgba(157,23,77,.8)' ],
    '<prefix>_link_color'  => [ 'predefined' => 'text-primary', 'custom' => '' ],   // compact color (or a hex in custom)
    '<prefix>_border'      => [ 'width'=>['value'=>'','unit'=>'px'], 'style'=>'solid', 'color'=>['predefined'=>'','custom'=>''] ],
    '<prefix>_border_sides'=> [ 'top' ],
    '<prefix>_border_extent' => [ 'mode' => 'full' ],   // full | container | custom(+ _border_extent_width)
    '<prefix>_css_class'   => '',
  ],
]
```
- **This is where a header/footer bar's TEXT size/color, LINK color, BACKGROUND, PADDING and BORDERS belong** — not a `.footer .builder-text-element{…}` child rule. Resolved to CSS by `inc/includes/hf-custom-css.php` (scoped to that section), so it's editable + rebrandable.
- Set `<prefix>_typography` to the source's *measured* footer text spec (size/weight/color) — e.g. the source Pinky Bites footer is `14px / rgba(157,23,77,.8)` body, so that goes in `main_footer_custom_styling.yes.main_footer_typography`, not child CSS.

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
