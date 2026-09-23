<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# admin-skin extension

A token-driven skin over the **real** wp-admin: grouped sidebar, slim top bar, card tables, quiet notices, light / dark / system modes with a per-user accent, and a skin package format the Skin Library installs into. It is **not** a replacement admin app — every screen (core, UnysonPlus, WooCommerce, any plugin) keeps its own markup and is restyled at once, so nothing needs an adapter. **Active by default:** yes — seeded once on a fresh install by `fw_upw_seed_default_extensions()` (`framework/includes/default-extensions.php`, guarded by the `unysonplus_default_extensions_v1` option). The seed runs **once** on purpose: an "always ensure active" version could never be switched off, because the next admin page load would turn it back on. After the seed the user owns the setting, and deactivating sticks. It only seeds what is present on disk, so the core-only public zip is a no-op until the extension is installed from the Extensions manager. Version: 1.1.5. Repo: `UnysonPlus-Admin-Skin-Extension`.

## Provides

- **Settings/options:** its own settings page (Unyson+ → Extensions → Admin Skin → Settings), two boxes:
  - **Skin** — `skin` (select, from the registry), `default_mode` (`light` / `dark` / `system`), `accent` (colour-picker; empty = the skin's own), `allow_user_prefs` (switch).
  - **Layout** — `group_menu`, `sidebar_search`, `notice_tray`, `apply_to_editor`, `skin_customizer`, `dark_canvas`, `show_wp_logo` (switches), `hide_design` / `hide_fonts` (selects: `auto` / `yes` / `no`) and `account_placement`.

**`account_placement`** (select, default `sidebar`) decides where the account avatar and its menu — profile,
visit site, log out — sit: `sidebar` (bottom left, the app-style position), `bar` (top right, where WordPress
puts it) or `both`. Whichever is chosen, items other plugins add to the account menu come along: they are
**mirrored into the chosen position, not dropped**, so a plugin that hangs its own entry off the account menu
keeps working in either placement.
- **Intro notice:** when the seed activates the extension it sets `unysonplus_admin_skin_intro_notice`, and `_action_intro_notice()` shows a one-time dismissible notice naming both ways back — the profile checkbox (just this user) and Unyson+ → Extensions (the whole site) — plus a link to the skin's own settings. Dismissal is per user (`fw_admin_skin_intro_dismissed` user meta) via AJAX `fw_admin_skin_dismiss_intro` (nonce `fw_admin_skin_intro`).

### The Customizer runs its own path

`is_enabled()` stays **false** on `customize.php`, and the Customizer is skinned by a separate path instead: `is_customizer_enabled()` + `_action_enqueue_customizer()` + `_action_customizer_mode_script()`, hung on `customize_controls_enqueue_scripts` / `customize_controls_print_scripts`. Three things make that separation necessary rather than fussy:

- **The structure layer cannot run there.** `structure.css` rebuilds `#adminmenu` and `#wpadminbar` into a sidebar and top bar; the Customizer has neither, so loading it would restyle nothing and risk breaking the pane's fixed layout. Only the tokens plus `static/css/customizer.css` load.
- **The preview iframe must stay untouched.** `customize_controls_*` hooks fire for the controls document only, and there is deliberately **no `customize_preview_init` counterpart**. The preview renders the front end, so it keeps the visitor's colours — same rule as below.
- **Scope to `body.wp-customizer`, not a class of our own.** `customize_controls_print_scripts` prints in `<head>`, where `document.body` is still null, so a JS-added class arrives too late to style first paint. The stylesheet is only *enqueued* when the skin applies, so its presence is already the condition; `upa-customizer` is still added on `DOMContentLoaded`, but only as a hook for extenders.

`_filter_admin_color` also returns the skin's colour scheme under `is_customize_preview()`, so core's scheme-aware chrome in there matches instead of staying stock blue. The one surface left light on purpose is `.site-icon-preview`, which mocks a browser tab and an app icon — a preview, by the rule below.

### Previews stay light — on purpose

A recurring decision, applied consistently: anything that **previews front-end output** keeps its light surface even in dark mode — the classic editor canvas (hence `dark_canvas` is opt-in and off by default), the Box Style / Table Style / Border Hover Animation picker swatches (`.bsp__preview` / `.tsp__preview` / `.bha__preview`), and the Box Shadow preview. Recolouring them would show a border, shadow or table rule that does not match what a visitor gets. Skin the **chrome** around a preview; never the preview itself.
- **Per-user preferences** (user meta `fw_admin_skin_prefs`): `mode`, `accent`, `off`. Set from the top-bar **Appearance** popover (palette icon), the profile page ("Admin skin" checkbox under Personal Options), and the "Turn on admin skin" bar link that appears when a user has opted out.
- **Skins:** `skins/<slug>/skin.json` (+ optional `fonts/`, `skin.css`) bundled in the extension; installed skins live in `uploads/unysonplus/admin-skins/<slug>/` (via `fw_upw_uploads_dir('admin-skins')`) and shadow a bundled one of the same slug. Ships **Default** (Hanken Grotesk + JetBrains Mono, OFL) and **Classic** (WordPress density: system fonts, 13px, 2px radii, core blue; inherits Default through `base`).
- **Public hooks/filters:**
  - `fw_ext_admin_skin_enabled` — whether the skin applies to the current request (already false on `customize.php`, `site-editor.php`, live-editor / builder canvases, and for users who opted out).
  - `fw_ext_admin_skin_skins` — the discovered skins (`slug => skin.json data`), for a theme/extension registering its own.
  - `fw_ext_admin_skin_menu_groups` — the sidebar grouping config (`groups`, `map`, `cpt_group`, `fallback`); `map` keys are matched by substring against each top-level item's `id`, classes and href.
  - `fw_ext_admin_skin_plugin_partials` — the per-plugin CSS partial slugs loaded for the screen (`woocommerce`, `acf`, … from `static/css/plugins/`).
  - AJAX `fw_admin_skin_prefs` (nonce `fw_admin_skin_prefs`): POST `mode` / `accent` / `off`; GET with `off=0&redirect=1` restores and redirects back.
- **Colour scheme:** registers `unysonplus` with `wp_admin_css_color()` and, while the skin applies, filters `get_user_option_admin_color` to it, so core's scheme-aware chrome (Gutenberg's `--wp-admin-theme-color`, the framework's `--u-accent`) follows the skin. The user's stored scheme is untouched.

## How it is built (for anyone extending it)

| Layer | File | Job |
|---|---|---|
| Tokens | inline `<style>` from `FW_Admin_Skin_Registry::css()` | `@font-face` + `:root` tokens from `skin.json`: `--upa-font-ui/mono`, shape (`--upa-radius-sm/radius/radius-lg/radius-pill`), density (`--upa-font-size`, `--upa-control-h`, `--upa-row-h`, `--upa-sidebar-w`, `--upa-bar-h`), and per mode `--upa-bg/bg2/panel/panel2/hover/border/border2/text/text2/text3/accent/accent2/accent-fg/green/amber/red/blue/pink/shadow/shadow-sm` plus derived `-soft`, `-ring`, `-text` variants. Mode = `html[data-upa-mode]` (`system` is a media query, set before paint from `admin_head` priority 0). |
| Colour scheme | `static/css/colors.css` | Publishes `--wp-admin-theme-color*`; loaded by core as the `colors` handle. |
| Structure | `static/css/structure.css` | `#adminmenu` → sidebar (brand block, search, group headings, user block; folded + responsive states keep core's mechanics), `#wpadminbar` → top bar, `#wpcontent` canvas, screen-meta, block-editor skeleton offsets. |
| Primitives | `static/css/primitives.css` | Page headers, `.subsubsub`, `.tablenav`, `.wp-list-table`, `.postbox`, dashboard, forms, buttons, `.nav-tab-wrapper`, `.wp-filter`, notices + tray, media modal, theme browser, editor bits. |
| Surfaces | `static/css/surfaces.css` | Remaps the framework's `--u-*` admin tokens (Theme Settings, extension settings, option types, Extensions manager) onto `--upa-*`. |
| Plugin partials | `static/css/plugins/<slug>.css` | Loaded only when that plugin is active. |
| Behaviour | `static/js/admin-skin.js` | Vanilla, additive only: brand + search + grouping + user block, top-bar page title + Appearance popover, notice tray (adopts `#wpbody-content` / `.wrap` top-level notices, keeps dismiss buttons working, expands on success/error feedback), a list-table guard that gives a starved primary column a floor, prefs save. |

Selector prefix: **`upa-`** (classes) / **`--upa-`** (tokens). `body.upa` is present only when the skin applies; `body.upa-grouped` when the menu is grouped.

## Notes / gotchas

- **Submenus of non-current items are hidden in the expanded sidebar** (the sidebar scrolls internally, which would clip core's hover flyouts); a click on the parent lands on its first screen where the submenu expands inline. Folded (and auto-folded below 960px) the flyouts return, styled as cards.
- **Hidden notices stay hidden.** Core and plugins ship `.notice.hidden` templates (e.g. the plugins list's auto-update error slot); the primitives layer must never force `display` on `.notice`. Tray adoption skips `.inline`, `.below-h2`, `.hidden`, `.notice-alt` and anything inside a postbox / table / modal.
- **`table-layout: fixed` starves the title column** when several plugin columns declare widths; the JS guard sets `width: 28%` on a primary column measured under 180px and `80px` on any zero-width plugin column. Do not fix this in CSS with a blanket width.
- **Preference saves send the whole state** (`mode` + `accent`) on every change: two quick clicks would otherwise race each other's read-modify-write in `_ajax_save_prefs`.
- **Skin values are CSS fragments:** the registry strips `{ } ;` and newlines but does not otherwise validate them; a skin from the Library is trusted content like a preset.
- **Excluded screens:** Customizer, Site Editor, the framework live editor, Elementor / Bricks canvases. The block editor chrome is skinned (sidebar + bar offsets on `.interface-interface-skeleton`); the editing canvas is never touched. Turn the editor chrome off with `apply_to_editor`.
- Planned (not in 1.0.0): Overview dashboard cards, ⌘K command palette, the Skin Library screen + `admin-skins/` catalog in `UnysonPlus-Library`, a custom login slug + skinned login page, a CSSOM dark engine for third-party dark mode.
