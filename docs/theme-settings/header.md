# Theme Settings → Header

Authoritative reference for every Header option (Theme Settings → Header). Sub-tabs: **Identity**, **Layout**, **Menu**, **Mega Menu** (only when the Mega Menu extension is active, spliced right after Menu), **Top Bar**, **Main Header**, **Bottom Bar**. Every choice value below is verbatim.

---

## Identity (`header-identity.php`, stored under `header_logo`)

`header_logo` is a `multi` wrapper containing two groups (`group_logo`, `group_favicon` — container ids only, not stored).

### Logo Type — `logo_type`
- **Type**: `multi-picker` (inline; picker sub-option `logo_type` = `image-picker`)
- **Default**: `simple` if the site already has a WP Custom Logo (`get_theme_mod('custom_logo')`), else `custom`
- **Choices**:

| value | label |
|---|---|
| `custom` | Custom Logo Layout (icon + text) |
| `simple` | Simple Logo (image) |

- **Saved value shape**: `[ 'logo_type' => 'simple'|'custom', 'simple' => {…}, 'custom' => {…} ]` — only the chosen branch's sub-options are populated.
- **Notes**: Simple = uploaded image (two-way synced with WP Custom Logo). Custom = text wordmark + optional icon lockup. Frontend reads via `unysonplus_header_logo_cfg()` (flattens nested + legacy flat).

#### Simple Logo sub-options (revealed when `logo_type = simple`)
- `image` — **Type** `upload` (images_only). Main logo; two-way synced with WP Custom Logo.
- `image_2x` — **Type** `upload` (images_only). Retina/2× version (srcset).
- `sticky_image` — **Type** `upload` (images_only). Alternate logo when header sticks.
- `mobile_image` — **Type** `upload` (images_only). Logo below 768px.
- `transparent_image` — **Type** `upload` (images_only). Logo while header transparent/overlaying hero.
- `alt` — **Type** `text`. **Default** `''`. Alt text; falls back to Site Title.
- `width` — **Type** `unit-input` (units `px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Empty = auto to header height.

> **Logo images are portable (no cross-site 404s).** Every logo image — Simple `image`/`image_2x`/`sticky`/`mobile`/`transparent`, and the Footer Logo element — is **re-resolved from its `attachment_id` on the CURRENT site at render time** (`unysonplus_upload_option_src()`), never the URL stored at save time. If the attachment isn't present on this site (cloned/migrated/deployed), the logo falls back to the **text logo** instead of emitting a dead URL. **Implication for builders:** to ship a logo with a demo / cloned / starter site, **sideload the image into the target site's Media Library** (so a real `attachment_id` exists there) — do NOT rely on a hardcoded URL or an attachment id from another install. **SVG logos are fully supported**: uploads are sanitized + flattened (Illustrator `<style>`/class exports → presentation attributes), PostScript font names normalized, negative radii fixed, and SVG attachments get metadata/preview (shortcodes ext ≥ 1.12.7). Outline text in Illustrator (Type → Create Outlines) for font-independent fidelity.

#### Custom Logo Layout sub-options (revealed when `logo_type = custom`)
- `site_title` — **Type** `text`. **Default** `get_bloginfo('name')`. Synced with Settings → General → Site Title.
- `tagline_text` — **Type** `text`. **Default** `''`. Synced with Settings → General → Tagline.
- `logo_icon` — **Type** `icon-v2`. Optional brand mark (inline SVG).
- `logo_layout` — **Type** `image-picker`. **Default** `inline-left`. `blank:false`. **Choices**:

  | value | label |
  |---|---|
  | `icon-only` | Icon only (no text) |
  | `inline-left` | Inline — icon left |
  | `inline-right` | Inline — icon right |
  | `stacked-left` | Stacked — icon left |
  | `stacked-right` | Stacked — icon right |
  | `eyebrow-left` | Eyebrow — icon left |
  | `eyebrow-right` | Eyebrow — icon right |

  Icon only = just the Logo Icon, no visible text (the Site Title renders as a screen-reader-only accessible name; falls back to the text wordmark when no icon is picked); Inline = icon+title only (no tagline); Stacked = title with tagline under it; Eyebrow = small uppercase tagline above title.
- `logo_icon_frame` — **Type** `image-picker`. **Default** `none`. `blank:false`. **Choices**:

  | value | label |
  |---|---|
  | `none` | None (plain icon) |
  | `rounded` | Rounded box |
  | `squircle` | Squircle |
  | `circle` | Circle |
  | `square` | Square |
  | `hexagon` | Hexagon |

- `title_size` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'rem'}`.
- `title_weight` — **Type** `select`. **Default** `''`. **Choices**:

  | value | label |
  |---|---|
  | `` | Default |
  | `300` | Light (300) |
  | `400` | Regular (400) |
  | `500` | Medium (500) |
  | `600` | Semibold (600) |
  | `700` | Bold (700) |
  | `800` | Extrabold (800) |
  | `900` | Black (900) |

- `color` — **Type** `predefined-colors-color-picker-compact`. **Default** `{predefined:'',custom:''}`. **Saved shape** `{predefined:'text-{slug}',custom:'#hex}`. Choices = palette presets (`text-{slug}` from `unysonplus_option_color_palette()`, live).
- `tagline_color` — same as `color` (palette-preset compact). Header tagline color.
- `logo_icon_color` — same as `color`. Empty = inherit Site Title Color. Also sets the frame's border color (`currentColor`).
- `logo_icon_frame_bg` — **Type** `predefined-colors-color-picker-compact`. **Default** `{predefined:'',custom:''}`. Fill color of the **frame tile** (when `logo_icon_frame` ≠ `none`) — e.g. a **white "app-icon" tile** behind a colored mark. Emitted as `background-color` on `.site-logo__mark--framed`, so an image-based mark (set via `logo_custom_css` `background-image`) shows on top of the tile. Empty = the default subtle tint. (The frame itself uses `background-color` — not the `background` shorthand — so it never wipes a mark's `background-image`.)
- `logo_icon_size` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'em'}`. Empty ≈ 1.4em. Drives the frame tile size (`2.2em` of this).
- `logo_custom_css` — **Type** `code-editor` (`mode:css`). **Default** `''`. Hooks: `.site-logo__mark`, `.site-logo__mark--framed`, `.site-logo__eyebrow`, `.site-logo__sub`, `.site-title-text`, `.site-title`.

### Favicon / Site Icon — `favicon`
- **Type**: `upload` (images_only)
- **Default**: empty
- **Notes**: Square 512×512 recommended. Two-way synced with WP Site Icon. Shared by both logo types.

---

## Layout (`header-layout.php`)

### Header Presets — `header_presets`
- **Type**: `preset-loader` (`preset_group: header_layout`). Loads a whole-header look, then fine-tune below.

`header_layout` is a `multi` wrapper with one group `group_header_layout`.

### Header Layout Mode — `header_mode`
- **Type**: `multi-picker` (inline; picker sub-option `mode` = `image-picker`)
- **Default**: `{ mode: 'top' }`
- **Choices**:

| value | label |
|---|---|
| `top` | Top |
| `vertical` | Vertical Menu |
| `off-canvas-only` | Off-Canvas |
| `overlay` | Overlay |

- **Saved value shape**: `[ 'mode' => 'top', '<mode>' => {…revealed sub-options…} ]`
- **Notes**: Top = standard horizontal. Vertical = fixed side rail. Off-Canvas Only = hamburger always visible, no top bar. Overlay = hamburger opens fullscreen menu. Read via `unysonplus_header_layout_get()`.

#### `top` reveal → `header_design` (nested multi-picker, inline)
- `header_design` — **Type** `multi-picker`. **Default** `{ design: 'classic' }`. Picker `design` = `image-picker`. **Choices**:

  | value | label |
  |---|---|
  | `classic` | Classic |
  | `pill` | Floating Pill |
  | `card` | Elevated Card |
  | `centered` | Centered |

  **Saved shape** `[ 'design' => 'pill', 'pill' => {…} ]`. Each non-classic design reveals its own selects:
  - `pill` → `pill_radius` (`full` Full (pill) / `large` Large / `medium` Medium; default `full`), `pill_inset` (`none` None / `small` Small / `large` Large; default `none`), `pill_shadow` (`soft` Soft / `medium` Medium / `strong` Strong; default `medium`).
  - `card` → `card_radius` (`small` Small / `medium` Medium / `large` Large; default `medium`), `card_shadow` (`soft`/`medium`/`strong`; default `medium`).
  - `centered` → `centered_gap` (`tight` Tight / `normal` Normal / `roomy` Roomy; default `normal`).

#### `vertical` reveal → `vertical_side` + `vertical_width`
- `vertical_side` — **Type** `multi-picker` (popover). **Default** `{ side: 'left' }`. Picker `side` = `image-picker`. **Choices**: `left` (Left), `right` (Right). Read via `unysonplus_header_vertical_side()`.
- `vertical_width` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'16.25',unit:'rem'}`. Width of the fixed side rail.

#### `overlay` reveal → 5 fields
- `overlay_style` — **Type** `multi-picker` (popover). **Default** `{ style: 'panel' }`. Picker `style` = `image-picker`. **Choices**:

  | value | label |
  |---|---|
  | `panel` | Panel |
  | `radial` | Radial |
  | `concentric` | Concentric |

  Panel = plain centered list; Radial = items wrap a circular disc (reveals `radial_disc_bg` = `background-pro`, video disabled — the disc fill); Concentric = nested filled rings from a corner (reveals `overlay_corner`).
  - `overlay_corner` (revealed by `concentric`) — **Type** `select`. **Default** `tr`. **Choices**: `tr` Top Right, `tl` Top Left, `br` Bottom Right, `bl` Bottom Left.
- `overlay_color_mode` — **Type** `select`. **Default** `shade`. **Choices**:

  | value | label |
  |---|---|
  | `shade` | Shade |
  | `tint` | Tint |
  | `aurora` | Aurora |
  | `rainbow` | Rainbow |
  | `mono` | Mono |
  | `duotone` | Duotone |
  | `alternating` | Alternating |
  | `glass` | Glass |

- `overlay_duotone_color` — **Type** `predefined-colors-color-picker-compact` (kind `bg`; fallback `color-picker` default `#ec4899`). Inner-ring color for Duotone mode.
- `overlay_bg_opacity` — **Type** `slider`. **Default** `100`. `min:20, max:100, step:5`. Ring opacity.
- `overlay_background` — **Type** `background-pro` (video disabled). Overlay menu background (color/gradient/image).

### Off-Canvas / drawer (always present in `group_header_layout`)
- `offcanvas_content` — **Type** `addable-popup` (a header column; see "Header column element popup" below). Drawer/mobile panel content. Empty = default Off-Canvas menu (falls back to Primary).
- `offcanvas_trigger_icon` — **Type** `multi-inline`. **Default** `{ open:'', close:'' }`. `fw_multi_options`: `open` (icon-v2, title "Open"), `close` (icon-v2, title "Close"). **Saved shape** `[ 'open' => <icon>, 'close' => <icon> ]`. Empty open = hamburger bars; empty close = `×`.

### Structure & dimensions
- `container` — **Type** `select`. **Default** `container`. **Choices**: `container` Fixed Width, `container-fluid` Full Width.
- `container_width` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. (2026-08-02) The header bar's **CONTENT** width in Fixed-Width mode, independent of the site-wide Container Width — so the masthead can be narrower than the body (a common source pattern) without touching the global. Like the global setting it's the content width (gutter outside); empty = align with the global. Emitted as a header-scoped `--header-container-max` consumed by the `.site-header .fw-container` rule in `style.css` (falls back to `--container-max-desktop` when empty).
- `min_height` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'5',unit:'rem'}`. Main header row min height.
- `mobile_min_height` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`. Below 768px; empty reuses desktop.
- `mobile_breakpoint` — **Type** `select`. **Default** `lg`. **Choices**: `lg` Below 992px (tablet & phone), `md` Below 768px (phone only).

### Scroll behavior
- `header_behavior` — **Type** `select`. **Default** `static`. **Choices**:

| value | label |
|---|---|
| `static` | Static (scrolls away with the page) |
| `sticky` | Sticky (follows scroll) |
| `sticky-shrink` | Sticky + Shrink on scroll |
| `hide-on-scroll` | Sticky, hide on scroll down / reveal up |
| `transparent-overlay` | Transparent over the first section |

- `sticky_shrink_height` — **Type** `unit-input` (`px`,`rem`). **Default** `{value:'',unit:'px'}`. Shrunk logo height (default 40px).

### Appearance / chrome
- `bg_color` — **Type** `predefined-colors-color-picker-compact` (kind `bg`; fallback `rgba-color-picker` default `''`). Main Header Background. Empty = transparent. **Saved shape** `{predefined:'bg-{slug}',custom:'#hex'}`.
- `header_border` — **Type** `switch`. **Default** `no`. right `yes`/On, left `no`/Off. Hairline rule under header.
- `header_shadow` — **Type** `switch`. **Default** `no`. Same switch shape. Soft drop shadow.
- `header_glass` — **Type** `switch`. **Default** `no`. Frosted/translucent backdrop blur.
- `header_uppercase_nav` — **Type** `switch`. **Default** `no`. Uppercase primary menu links.

*(All four toggles share the same switch: `right-choice {value:'yes',label:'On'}`, `left-choice {value:'no',label:'Off'}`.)*

### Row alignment / spacing
- `header_valign` — **Type** `select`. **Default** `center`. **Choices**: `top` Top, `center` Center, `bottom` Bottom.
- `header_element_gap` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`. Space between elements within a column.

### Mobile
> **Moved.** All mobile/drawer options (`mobile_drawer_side`, the `drawer_*` appearance set, `mobile_min_height`,
> `mobile_breakpoint`, `mobile_hide_topbar/bottombar`, `nav_scrollspy`, `offcanvas_content`, `offcanvas_trigger_icon`)
> were **consolidated into the Header → Mobile & Tablet tab** and are now **top-level keys** (no longer under the
> `header_layout` group). Started clean — no migration. See the **Mobile & Tablet** section below.

---

## Mobile & Tablet (`header-mobile.php`, TOP-LEVEL keys)

Options are organised into FW `group` **containers** (visual boxes only — `group` never nests storage, so
every key stays flat). Each group uses the container's native `title`/`desc` parameters (added to
`FW_Container_Type_Group::_render()` — rendered only when set), not a leading `html` heading. A `preset-loader` (`mobile_presets`, group `header_mobile`) offers ready-made looks:
**Classic Drawer / App Bar / Fullscreen Overlay**. Because the tab's keys are top-level (not one nested
option), `header_mobile` is a **FLAT** preset group (`'flat' => true` in `settings-presets.php`): the apply
handler + `unysonplus_settings_preset_current_json()` read/write each allowed key individually instead of
nesting under the group name (Phase 3).


A dedicated Header sub-tab (registered in `header-settings.php` as `tab_mobile`, sits between Layout and
Menu). Its options are **top-level** Theme Settings keys (read directly via `fw_get_db_settings_option`),
**not** part of the `header_layout` group — so the tab needed no data migration. Phase 1 (v2.4.99):

- `mobile_header_layout` — **Type** `select`. **Default** `default`. **Choices**: `default`
  (Logo left · Toggle right) · `toggle-left` (Toggle left · Logo center) · `center-below` (Logo center ·
  Toggle **below** — a two-row mobile header) · `logo-right` (Logo right · Toggle left). Emits
  `header-mlayout--<key>` on `<header>` (template-parts/header-builder.php); the arrangement is pure CSS on
  the existing columns (logo in `.header-col--start`, toggle in `.header-col--end`), gated per collapse
  width in `header-footer-builder.css`. `default` emits no class.
- `mobile_bar_bg` — **Type** `color-picker`. Mobile collapsed-bar background, distinct from the desktop
  header and the drawer panel. Emitted as `--mobile-bar-bg`; the CSS applies it only below the collapse
  width (unset ⇒ the `var()` is invalid ⇒ declaration ignored ⇒ desktop background kept). **Convert
  mapping** (stitch + `to-theme-settings.mjs`): when the desktop header is transparent/overlay, set a solid
  fill (scrolled bg → site bg → white) so the collapsed mobile bar stays legible over content.
- `mobile_breakpoint_px` — **Type** `unit-input` (px). Custom collapse width overriding the md/lg preset
  (Layout → Mobile). When set (>0), the header carries `header-collapse-custom` and
  `unysonplus_custom_breakpoint_css()` prints a per-request `<style id="unysonplus-header-breakpoint">` in
  `wp_head` reproducing the collapse + mobile bar + mobile layouts at that exact width, so every mobile
  control engages together. Empty ⇒ preset.
- **Mobile logo swap** is NOT here — it already exists under **Identity** (`mobile_image` → `.site-logo--mobile`,
  swapped by CSS below the breakpoint). The tab shows a pointer note (`mobile_logo_note`) instead of duplicating it.

**Hamburger / toggle design** (applies to the built-in bars; a custom Open icon under Header → Layout
overrides all of it). Rendered by `unysonplus_render_menu_toggle()`, styled in `style.css`:
- `mobile_toggle_style` — **Type** `select`. **Default** `bars`. **Choices**: `bars` / `thin` / `dots`.
  Emits `menu-toggle--style-<style>`. Dots do not morph to an X.
- `mobile_toggle_animate` — **Type** `switch`. **Default** `yes`. Off adds `menu-toggle--no-animate`
  (static bars — the bars→X morph is otherwise the default).
- `mobile_toggle_size` — **Type** `unit-input`. Emitted inline as `--toggle-size` (default 44px).
- `mobile_toggle_color` — **Type** `color-picker`. Emitted inline as `--toggle-color` (bars + label).
- `mobile_toggle_label` — **Type** `text`. Optional text beside the icon (e.g. “Menu”); wraps the bars in
  `.menu-toggle__bars` and adds `menu-toggle--has-label` (row layout).

**Drawer submenus.** Surfaced as `primary-navigation-drawer--submenu-<mode>` on the drawer (built in
`template-parts/header-builder.php`); the branch logic is in `navigation.js` (`bindDropdowns` → drawer
path), styling in `style.css`:
- `mobile_submenu_mode` — **Type** `select`. **Default** `accordion`. **Choices**: `accordion` (expand in
  place via the `+`/`−` toggle) · `flyout` (child list slides in as a panel with a `‹ Back` row —
  `.sub-menu` goes `position:absolute` inside the panel, `translateX(100%)` → `0` on `.is-flyout-open`) ·
  `expand-all` (every level shown statically; toggle hidden, `max-height:none`).
- `mobile_submenu_parent_link` — **Type** `switch`. **Default** `yes` (Links). Off adds
  `primary-navigation-drawer--parent-toggle` → tapping a parent row opens its submenu instead of
  navigating. Ignored in expand-all.

**Drawer motion & scrim (Phase 2).** All CSS-var driven (`theme-vars.php` → consumed by
`.primary-navigation-drawer` in `style.css`):
- `drawer_animation` — **Type** `select`. **Default** `slide`. `slide` / `fade` / `fullscreen`. Emits
  `primary-navigation-drawer--anim-<x>` (slide = no class). Fade cross-fades in place; fullscreen = full-width panel + fade.
- `drawer_width` — **Type** `unit-input`. Slide panel width (`--drawer-width`, default `min(360px,85vw)`). Ignored for fullscreen.
- `drawer_radius` — **Type** `unit-input`. Inner-corner radius (`--drawer-radius`; side-aware).
- `drawer_scrim_color` — **Type** `color-picker`. Overlay colour (`--drawer-scrim-color`, default `--scrim-bg` black).
- `drawer_scrim_opacity` — **Type** `slider` 0–100 (default 50). Open-state overlay opacity (`--drawer-scrim-opacity`, /100).
- `drawer_scrim_blur` — **Type** `unit-input` (px). Backdrop blur on the scrim (`--drawer-scrim-blur`).
- `drawer_close_on_click` — **Type** `switch`. **Default** `yes`. Off adds `--no-close-on-click`; `navigation.js`
  otherwise closes the drawer when a real menu link is tapped (submenu openers / `#` / Back excluded).
- `drawer_swipe_close` — **Type** `switch`. **Default** `yes`. Off adds `--no-swipe`; `navigation.js` otherwise
  dismisses on a horizontal swipe of the panel toward its edge (side-aware, 60px threshold). (Tapping the scrim
  already closes — the scrim carries `data-drawer-close`.)

**Close button + touch targets + search (Phase 2).** Close rendered by `unysonplus_render_drawer_close()`; a
custom Close icon (Off-Canvas → Trigger & Close Icons) overrides the style.
- `drawer_close_style` — **Type** `select`. `default` (×) / `arrow` (‹) / `text` (“Close”, adds `--text`).
- `drawer_close_position` — **Type** `select`. `in-panel` / `floating` (`--floating`: `position:fixed`, pinned to
  the scrim-side viewport corner — side-aware).
- `drawer_close_size` — **Type** `unit-input`. Inline `--close-size` (glyph font-size).
- `drawer_close_color` — **Type** `color-picker`. Inline `--close-color`.
- `drawer_item_min_height` — **Type** `unit-input`. Min tap-target height on drawer menu links (`--drawer-item-minh`,
  via `theme-vars.php` → generated CSS; aim ≥ 44–48px).
- `drawer_search` — **Type** `switch`. **Default** `no`. Renders `get_search_form()` inside `.drawer-search` at the
  top of the drawer (`unysonplus_render_drawer_content()`).

**Bottom navigation + per-device (Phase 3).** Rendered/hooked in `inc/includes/header-builder.php`
(`unysonplus_render_mobile_bottom_nav()` at `wp_footer`; `unysonplus_mobile_body_classes()` on `body_class`),
styled in `header-footer-builder.css`.
- `mobile_bottom_nav` — **Type** `switch`. **Default** `no`. Fixed bottom tab bar on phones (`.mobile-bottom-nav`,
  body `has-bottom-nav`) built from the first N top-level **Primary** menu items. Shown only below 768px.
- `mobile_bottom_nav_max` — **Type** `select` `3`/`4`/`5`. How many items.
- `mobile_bottom_nav_labels` — **Type** `switch`. Show item text under each tab (off → `--no-labels`, icon-only).
- `mobile_safe_area` — **Type** `switch`. Body `mobile-safe-area` → `env(safe-area-inset-*)` padding on the sticky
  header, drawer panel and bottom bar (notch / home indicator).
- `mobile_disable_sticky` — **Type** `switch`. Body `mobile-no-sticky` → header stays `position:static` below 768px
  even when Sticky on desktop.

**Consolidated from Layout (now top-level keys).** Repointed readers: `theme-vars.php` (drawer `--drawer-*`,
`--header-min-height-mobile`), `template-parts/header-builder.php` (`mobile_breakpoint`→collapse class,
`mobile_hide_*`, `mobile_drawer_side`, `drawer_dividers`), `inc/includes/layout.php` (`nav_scrollspy`→
`body.nav-scrollspy`), `inc/includes/header-builder.php` (`offcanvas_content`, `offcanvas_trigger_icon`), plus
the Site Converter (`stitch` + `to-theme-settings.mjs` now emit these top-level).
- `mobile_breakpoint` — `select` `lg`/`md`. Collapse width preset (Custom Collapse Width overrides it).
- `mobile_min_height` — `unit-input`. Mobile header height (`--header-min-height-mobile`).
- `mobile_drawer_side` — `select` `right`/`left`. Drawer slide side (`primary-navigation-drawer--left`).
- `drawer_bg` / `drawer_link_color` / `drawer_link_active_color` / `drawer_link_size` / `drawer_align` /
  `drawer_item_spacing` / `drawer_dividers` — drawer panel appearance (`--drawer-*`). **Convert mapping**: panel
  bg = resting solid header fill; `drawer_link_color` = source nav colour if it contrasts, else legible ink;
  `drawer_link_active_color` = accent when it reads. PHP↔JS in sync.
- `offcanvas_content` — `addable-popup` (header column). Drawer/off-canvas panel content. Empty ⇒ Primary menu.
- `offcanvas_trigger_icon` — `multi-inline` `{open,close}` icons.
- `mobile_hide_topbar` / `mobile_hide_bottombar` — `switch`. Hide Top/Bottom bar below 768px.

`nav_scrollspy` is a top-level key but is **NOT** in this tab — it's not mobile-specific (one-page nav works in
every header mode), so it lives under **Header → Layout → Navigation** (`grp_nav` in `header-layout.php`, still a
flat top-level key). `switch`; read in `inc/includes/layout.php` (`body.nav-scrollspy`), emitted by the converter.
**Convention**: when *every* source nav `href` is a same-page `#fragment` resolving to a section id (a one-page
site), set `nav_scrollspy='yes'`, give each Section a matching CSS ID, point menu items at `#that-id`; the active
item colours via `var(--menu-link-hover)` (Header → Menu). Leave off for multi-page sites.

> Roadmap (not yet built): hamburger/toggle design, submenu modes (Accordion/Flyout/Expand-all), two-tier
> tablet breakpoint, mobile logo swap, search — and consolidating the existing Layout → Mobile options here.
> See `D:\claude-backup\reports\Tablet-Mobile-Header-Proposal.docx`.

---

## Menu (`header-menu.php`, stored under `header_menu`)

### Menu Presets — `menu_presets`
- **Type**: `preset-loader` (`preset_group: header_menu`).

`header_menu` is a `multi` wrapper with groups `group_menu` and `group_submenu`.

### Menu Item Style — `menu_item_style`
- **Type**: `image-picker`
- **Default**: `none`
- **Choices**:

| value | label |
|---|---|
| `none` | None |
| `underline-grow` | Underline |
| `underline` | Underline (static) |
| `pill` | Pill |
| `box` | Box |
| `outline` | Outline |
| `bottom-bar` | Bottom Bar |
| `top-bar` | Top Bar |
| `highlight` | Highlight |

- **Notes**: Value → `body.menu-style-{slug}` class. Fills (Pill/Box/Highlight) use Item Hover/Active Background; Underline & bars use Hover/Active Color.

### Typography & spacing
- `menu_font` — **Type** `typography`. **Default** `{family:''}`. `components`: family only (size/line-height/letter-spacing/color off). Empty inherits Body Font.
- `menu_link_font_size` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`.
- `menu_link_font_weight` — **Type** `select`. **Default** `''` (Default = theme's 500). **Choices**: `''` Default, `300`,`400`,`500`,`600`,`700`,`800`. Emitted as `--menu-link-font-weight` (base rule falls back to 500).
- `menu_link_color` — **Type** `predefined-colors-color-picker-compact` (kind `text`). Menu link color; empty = body text.
- `menu_link_hover_color` — same compact (kind `text`). Hover/active color + Underline/Bar accent; empty = primary.
- `menu_item_bg` — same compact (kind `bg`). Item background (normal state); empty = transparent.
- `menu_item_hover_bg` — same compact (kind `bg`). Fill for Pill/Box/Highlight on hover/active.
- `menu_link_padding_x` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`.
- `menu_link_padding_y` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`.

*(All compact color fields save `{predefined,custom}`; a legacy hex string is tolerated.)*

### Dropdown / submenu (`group_submenu`)
- `menu_dropdown_style` — **Type** `image-picker`. **Default** `classic`. **Choices**:

| value | label |
|---|---|
| `classic` | Classic |
| `elevated` | Elevated |
| `bordered` | Bordered |
| `minimal` | Minimal |
| `top-accent` | Top Accent |

- `menu_dropdown_bg` — compact (kind `bg`). Dropdown panel background.
- `menu_dropdown_link` — compact (kind `text`). Dropdown link color.
- `menu_dropdown_link_hover` — compact (kind `text`). Dropdown link hover/active.
- `menu_dropdown_item_hover_bg` — compact (kind `bg`). Dropdown item hover background.
- `menu_dropdown_width` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Min width (default 220px).
- `menu_dropdown_radius` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Corner radius.

---

## Mega Menu (`header-mega-menu.php`, stored under `mega_menu`) — only when Mega Menu extension active

### Mega Menu Presets — `mega_menu_presets`
- **Type**: `preset-loader` (`preset_group: mega_menu`).

`mega_menu` is a `multi` wrapper with groups: `group_mm_panel`, `group_mm_heading`, `group_mm_items`, `group_mm_behavior`, `group_mm_responsive`. Values fold into `--mm-*` CSS vars.

### Panel (`group_mm_panel`)
- `mm_panel_design` — **Type** `image-picker`. **Default** `classic`. **Choices**: `classic` Classic, `elevated` Elevated, `bordered` Bordered, `minimal` Minimal, `top-accent` Top Accent.
- `mm_panel_bg` — compact color (kind `bg`). Empty = white.
- `mm_panel_radius` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Empty = square.
- `mm_panel_padding` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Default 16px.
- `mm_panel_font_size` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`. Base ≈15px.
- `mm_full_style` — **Type** `select`. **Default** `fullbleed`. **Choices**: `fullbleed` Edge to edge, `boxed` Boxed (centered card).
- `mm_panel_max_width` — **Type** `unit-input` (`px`,`rem`,`%`). **Default** `{value:'',unit:'px'}`. Default 1400px.
- `mm_col_gap` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Default 24px.
- `mm_col_dividers` — **Type** `switch`. **Default** `false`. Vertical line between columns.

### Headings (`group_mm_heading`)
- `mm_heading_style` — **Type** `select`. **Default** `none`. **Choices**: `none` None (plain bold), `underline` Underline, `accent` Accent Underline, `uppercase` Uppercase.
- `mm_heading_color` — compact color (kind `text`).
- `mm_heading_size` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`.
- `mm_heading_weight` — **Type** `select`. **Default** `''`. **Choices**: `` Default, `400` Normal (400), `500` Medium (500), `600` Semibold (600), `700` Bold (700), `800` Extrabold (800).

### Items (`group_mm_items`)
- `mm_item_color` — compact color (kind `text`).
- `mm_item_hover_color` — compact color (kind `text`).
- `mm_item_size` — **Type** `unit-input` (`rem`,`px`,`em`). **Default** `{value:'',unit:'rem'}`.
- `mm_item_gap` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`.
- `mm_desc_color` — compact color (kind `text`).
- `mm_desc_size` — **Type** `unit-input` (`em`,`rem`,`px`). **Default** `{value:'',unit:'em'}`. Default 0.85em.
- `mm_icon_size` — **Type** `unit-input` (`em`,`rem`,`px`). **Default** `{value:'',unit:'em'}`.
- `mm_icon_color` — compact color (kind `text`).

### Behavior (`group_mm_behavior`)
- `mm_animation` — **Type** `select`. **Default** `slide-up`. **Choices**: `fade` Fade, `slide-down` Slide Down, `slide-up` Slide Up, `zoom` Zoom, `none` None (instant).
- `mm_anim_speed` — **Type** `unit-input` (`ms`,`s`). **Default** `{value:'',unit:'ms'}`. Default 180ms.
- `mm_open_on` — **Type** `select`. **Default** `hover`. **Choices**: `hover` Hover, `click` Click.
- `mm_hover_delay` — **Type** `unit-input` (`ms`,`s`). **Default** `{value:'',unit:'ms'}`. `show_if: mm_open_on=hover`.

### Responsive (`group_mm_responsive`)
- `mm_mobile_columns` — **Type** `select`. **Default** `1`. **Choices**: `1` One (stacked), `2` Two (grid).
- `mm_mobile_gap` — **Type** `unit-input` (`px`,`rem`,`em`). **Default** `{value:'',unit:'px'}`. Default 8px.
- `mm_mobile_hide_desc` — **Type** `switch`. **Default** `false`.
- `mm_mobile_hide_icons` — **Type** `switch`. **Default** `false`.

---

## Top Bar (`header-topbar.php`, stored under `header_topbar`)

No Enable switch — renders when any column has an element. `multi` wrapper, group `group_topbar`.

- `topbar_presets` — **Type** `preset-loader` (`preset_group: header_topbar`).
- `topbar_columns_note` — **Type** `html-full` (info note on zone alignment).
- `topbar_left` / `topbar_center` / `topbar_right` — **Type** `addable-popup` (header column; see element popup below).
- `topbar_custom_styling` — the shared Custom Styling block (prefix `topbar`; see below).

---

## Main Header (`header-main.php`, stored under `header_main`)

Always-on row, three inline slots. `multi` wrapper, group `group_main`.

- `main_presets` — **Type** `preset-loader` (`preset_group: header_main`).
- `main_left` — **Type** `addable-popup`. **Default** one `logo` element.
- `main_center` — **Type** `addable-popup`. **Default** empty.
- `main_right` — **Type** `addable-popup`. **Default** one `menu_area` element with `menu_location: primary`.
- `main_custom_styling` — shared Custom Styling block (prefix `main`).

---

## Bottom Bar (`header-bottombar.php`, stored under `header_bottombar`)

No Enable switch — renders when any column has content. `multi` wrapper, group `group_bottombar`.

- `bottombar_presets` — **Type** `preset-loader` (`preset_group: header_bottombar`).
- `bottombar_left` / `bottombar_center` / `bottombar_right` — **Type** `addable-popup` (header column).
- `bottombar_custom_styling` — shared Custom Styling block (prefix `bottombar`).

---

## Header column element popup (`unysonplus_header_column` → `addable-popup`)

Each header column is an `addable-popup` whose `popup-options` add elements. Per added item:

### Element — `element_type` (multi-picker, picker `element` = select)
- **Default**: `logo`
- **Choices**:

| value | label |
|---|---|
| `logo` | Logo |
| `menu` | Menu |
| `menu_area` | Menu Area |
| `heading` | Heading (a single heading; text via `heading_text`, level `h2`–`h6` via `heading_level`, default `h3`) |
| `link` | Link (a single inline link; `link_label`, `link_url`, `link_target` = `_self`/`_blank`) |
| `cta_button` | CTA Button |
| `icon_text` | Icon Text |
| `search` | Search |
| `social_icons` | Social Icons |
| `custom_html` | Custom HTML |
| `text` | Text |
| `widget_area` | Widget Area |
| `builder_section` | Builder Section |
| `snippet` | Snippet |
| `spacer` | Spacer |
| `divider` | Divider |

- **Saved value shape**: `[ 'element' => 'menu_area', '<element>' => {…sub-options…} ]`
- **Per-element sub-options**:
  - `cta_button` → `cta_text` (text, default `Get Started`), `cta_link` (text, default `#`), `cta_style` (`button-style-picker`, choices from Theme Settings → Buttons; fallback select `filled`/`outline`/`pill`), `cta_size` (`button-style-picker`, sizes from Theme Settings → Buttons).
  - `icon_text` → `icontext_icon` (icon-v2), `icontext_text` (text), `icontext_link_type` (select: `none` No link, `url` Website URL, `email` Email (mailto:), `phone` Phone (tel:); default `none`), `icontext_link` (text).
  - `custom_html` → `custom_html_content` (textarea).
  - `menu` → `menu_id` (select; choices = existing WP nav menus by term_id).
  - `menu_area` → `menu_location` (select; default `primary`; choices `primary` Primary menu, `secondary` Secondary menu, `footer` Footer menu, plus any registered theme locations).
  - `heading` → `heading_text` (text), `heading_level` (select `h2`/`h3`/`h4`/`h5`/`h6`, default `h3`). Renders `<{level} class="footer-links-title hf-heading">`. (Shared with the footer builder; see [footer.md](footer.md).)
  - `link` → `link_label` (text), `link_url` (text — full URL or in-page anchor), `link_target` (select `_self` Same tab / `_blank` New tab, default `_self`). Renders one `<a class="footer-link hf-link">` (New tab adds `rel="noopener noreferrer"`). Stack several under a `heading` to build a link column — the atomic replacement for the removed compound `links` element.
  - `text` → `text_content` (`wp-editor`, tinymce/shortcodes; supports `{{current_year}}`).
  - `widget_area` → `sidebar_id` (select; default `sidebar-right`; choices = registered sidebars incl. `sidebar-right`,`sidebar-left`,`header-1..3`,`footer-1..5`).
  - `builder_section` → `builder_post_id` (select; saved page-builder layouts).
  - `snippet` → `snippet_id` (select; published Snippets, from Snippets extension).
  - `logo`, `search`, `social_icons`, `spacer`, `divider` → no extra options.

### visibility — `visibility`
- **Type**: `checkboxes`. **Default** `[]`. **Choices**: `hide-xs` Mobile (< 768px), `hide-sm` Tablet (768–991px), `hide-md` Desktop (≥ 992px).

### CSS Class — `element_css_class`
- **Type**: `text`. **Default** `''`.

---

## Shared "Custom Styling" block (`{prefix}_custom_styling`)

Used by `topbar`, `main`, `bottombar` (header) via `unysonplus_hf_custom_styling($prefix)`. A `multi-picker` gated by an enable switch.

### Enabled — picker `enabled`
- **Type**: `switch`. **Default** `no`. right `{value:'yes',label:'Yes'}`, left `{value:'no',label:'No'}`.
- **Saved value shape**: `[ 'enabled' => 'yes'|'no', 'yes' => { …groups… } ]`

When `yes`, reveals 4 groups (container-only ids):
- `{prefix}_grp_layout`:
  - `{prefix}_container` — `image-picker`, default `container`. **Choices**: `container` Fixed Width, `container-fluid` Full Width.
  - `{prefix}_padding` — `spacing` (mode `padding`, responsive utility classes).
- `{prefix}_grp_appearance`:
  - `{prefix}_background` — `background-pro` (video disabled).
  - `{prefix}_typography` — `typography` (family/size/weight/line-height/letter-spacing/color).
  - `{prefix}_link_color` — compact color (kind `text`).
- `{prefix}_grp_borders`:
  - `{prefix}_border` — `multi-inline` border row (see below).
  - `{prefix}_border_sides` — `image-picker` multiple, default `['top']`. **Choices**: `top` Top, `right` Right, `bottom` Bottom, `left` Left.
  - `{prefix}_border_extent` — `multi-picker` (inline), default `{mode:'full'}`. Picker `mode` select **Choices**: `full` Full Width, `container` Container Width, `custom` Custom Width. `custom` reveals `{prefix}_border_extent_width` (unit-input `px`,`rem`,`em`,`%`).
- `{prefix}_grp_advanced`:
  - `{prefix}_css_class` — `text`, default `''`.

### Border row (`unysonplus_hf_border_row_field`)
- **Type**: `multi-inline`
- **Saved value shape**: `{ width:{value,unit}, style:'solid', color:{predefined,custom} }`
- `fw_multi_options`: `width` (unit-input `px`,`em`,`rem`), `style` (select: `solid` Solid, `dashed` Dashed, `dotted` Dotted, `double` Double), `color` (compact color-preset). Renders only when both width and color set.
