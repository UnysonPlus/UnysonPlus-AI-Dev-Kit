<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# admin-skin extension

A token-driven skin over the **real** wp-admin: grouped sidebar, slim top bar, card tables, quiet notices, light / dark / system modes with a per-user accent, and a skin package format the Skin Library installs into. It is **not** a replacement admin app — every screen (core, UnysonPlus, WooCommerce, any plugin) keeps its own markup and is restyled at once, so nothing needs an adapter. **Active by default:** yes — seeded once on a fresh install by `fw_upw_seed_default_extensions()` (`framework/includes/default-extensions.php`, guarded by the `unysonplus_default_extensions_v1` option). The seed runs **once** on purpose: an "always ensure active" version could never be switched off, because the next admin page load would turn it back on. After the seed the user owns the setting, and deactivating sticks. It only seeds what is present on disk, so the core-only public zip is a no-op until the extension is installed from the Extensions manager. Version: 1.1.51. Repo: `UnysonPlus-Admin-Skin-Extension`.

## Provides

- **Settings/options:** its own settings page (Unyson+ → Extensions → Admin Skin → Settings), two boxes:
  - **Skin** — `skin` (select, from the registry), `default_mode` (`light` / `dark` / `system`), `density` (`comfortable` / `compact`), `accent` (colour-picker; empty = the skin's own), `allow_user_prefs` (switch).
  - **Layout** — `group_menu`, `sidebar_search`, `notice_tray`, `apply_to_editor`, `skin_customizer`, `skin_login`, `dark_canvas`, `show_wp_logo` (switches), `hide_design` / `hide_fonts` (selects: `auto` / `yes` / `no`) and `account_placement`.

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

### Density — one token had to be connected up first

`density` (site) and a per-user override in the Appearance menu. The registry derives the compact set from whatever the skin declares in `skin.json`, stepping lengths down with floors so a compact skin stays usable; a skin may declare its own `density_compact` and have the last word. It is emitted as an `html[data-upa-density="compact"]` override beside `:root`, so switching is one attribute and needs no reload — the same trick the modes use.

Worth knowing: **`--upa-row-h` was declared by every skin and consumed by nothing**, so list tables ignored density entirely — the one place the setting earns its keep. List-table cell padding is now `calc((var(--upa-row-h) - 28px) / 2)`, which is identical to the constant it replaced at the default 52px.

### Notices that stay dismissed

Each notice in the tray carries a mute control; muted ones are kept out of the count and hidden until the footer offers them back. Keyed by a hash of the notice's own **text** (digits normalised, so "3 updates available" does not mint a new key weekly) — there is nothing else stable to key on, since notices rarely carry an id and share their classes with every plugin. Reworded text is a different notice and returns, which is the safer direction. Stored per user, capped at `MUTED_MAX` (200). Muted notices stay in the DOM rather than being deleted, so muting is recoverable from the one screen that knows the notice exists.

### Command Palette

Core ships the palette (6.3+); this registers UnysonPlus entries in it rather than building a second one. Navigation commands (Theme Settings, Extensions, Admin Skin settings) are built in **PHP behind capability checks** — a screen the viewer cannot open is never sent, so it can never be offered and then refused — and are filterable via `fw_ext_admin_skin_commands`. Two commands act instead of navigating (toggle mode, toggle density) and save through the same AJAX endpoint the Appearance menu uses. Nothing registers when `wp-commands` is not registered.

### Housekeeping worth knowing about

`primitives.css` carried a **1,090-line duplicated region** — a whole block of rules pasted twice, where the later copy silently won and shadowed fixes made in the earlier one. It is gone (4,807 → 3,717 lines; 148 overriding duplicate selectors → 8), verified behaviourally neutral by diffing computed styles across nine admin screens before and after. Three dead account-block rules in `structure.css` went with it. If you edit this CSS, run a duplicate check before assuming a rule "isn't working".

The Site Converter's admin UI used to be recoloured for dark mode from the skin's side, by attribute-matching its inline colour literals (`[style*="background:#f6f7f7"]` and ~80 more). Those literals are now the converter's own `--sc-*` tokens, so the compensation is deleted and the converter themes itself.

### One screen: Unyson+ → Admin Skin (Settings / Admin Menu tabs)

`FW_Admin_Skin_Settings_Page`, page slug `fw-admin-skin`. The extension's settings form and the menu editor are **tabs on one page**, and the Extensions-manager card's Settings link is pointed here via `fw_ext_manager_settings_url` — the same shape SEO, Shortcodes, Site Converter and WooCommerce already use, so there is one settings screen rather than two that can disagree. Settings remain the extension's own `settings-options.php` schema and `fw_get_db_ext_settings_option()` store; only the route changed.

Both tabs post to this screen and both saves are handled in `_action_maybe_save()` on `load-`, each behind its own nonce — the menu tab's handler (`FW_Admin_Skin_Menu_Layout::maybe_save()`) is dispatched when `fw_admin_skin_menu_nonce` is present, so neither form can be submitted through the other's. The menu save redirects back to `#menu_tab` rather than dropping the user on the first tab.

### Admin Menu editor (the second tab)

`FW_Admin_Skin_Menu_Layout`, option `fw_admin_skin_menu_layout`, keyed by **role**: `[ map, order, hidden, labels, slugs ]`. The screen lists every top-level item with a group select, drag-to-reorder and a Hide box, plus renameable group names.

The split that matters: **grouping and order are presentation**, merged into the config the existing client-side grouping pass already consumes (one implementation, not two — the saved `map` goes first because `menu-groups.php` matches its keys in order). **Hiding is server-side** — `remove_menu_page()` plus a redirect — because an item removed only in the browser is still a working screen.

Four things that bit during the build:

- **The guard runs on `admin_init`, which is before `admin_menu`**, so there is no live menu to look a slug up in. The slug is therefore stored *with* the layout.
- **A menu slug has three shapes** and one string comparison only handled the first: a plugin page (`fw-extensions`), a core file (`upload.php`), and a core file whose query is part of its identity (`edit.php?post_type=snippet` — matching `edit.php` alone would redirect Posts too). `request_matches()` handles all three.
- **`$menu` is keyed by position**, so its natural array order is registration order. `ksort()` is what makes the screen list items the way the sidebar shows them.
- **A menu title carries its count bubble as nested markup**, so a non-greedy strip to the first `</span>` leaves a tail behind ("Comments 0 Comments in moderation"). Everything from the bubble onwards goes.

A user with several roles gets the first of their roles that has a layout saved — merging two would produce an order nobody chose. Hiding is **not** access control and the screen says so.

**The lifeline rule.** This screen lives *under* the Unyson+ menu, so hiding that menu would take the editor away with it and leave the database as the only way back. `is_lifeline()` refuses the Unyson+ row's Hide box — but only for a role that could open this screen at all (`get_role( $role )->has_cap( 'manage_options' )`). Hiding it from an editor or an author is exactly what the feature is for and stays allowed. Enforced in `maybe_save()` as well as in the markup, since a disabled checkbox is a hint rather than a rule.

### The login screen runs its own path too

Same shape as the Customizer, for a different reason: `is_enabled()` requires `is_user_logged_in()`, and on `wp-login.php` nobody is. `is_login_enabled()` + `_action_enqueue_login()` + `_action_login_mode_script()` hang on `login_enqueue_scripts` / `login_head`, with `login_body_class` adding `upa upa-skin-<slug>` (and `upa-login-icon` when the site has an icon). Setting: `skin_login` (default on). Filter: `fw_ext_admin_skin_login_enabled`.

Four things worth knowing before editing it:

- **The hooks are registered ABOVE the `is_admin()` guard in `_init()`.** `wp-login.php` is not `is_admin()`, so hooks added after that guard never register there — the first version of this feature looked completely inert for exactly that reason.
- **Only the tokens and `static/css/login.css` load.** `structure.css` / `primitives.css` are written against `#adminmenu`, `#wpadminbar` and `.postbox`, none of which exist here, and they restyle shared classes (`.button`, `.notice`) for a layout that screen was never measured against.
- **Site defaults, never per-user.** There is no viewer yet, so `get_mode()` / `get_accent()` fall through to the site settings on their own (`get_user_prefs()` returns `[]` for user 0). A per-user mode on a logged-out screen is not a thing that can exist.
- **Core styles several login controls through ID selectors**, which no class-scoped rule can outrank: `#login form p` (the paragraph gaps — miss it and the Lost Password button welds itself to its input) and `#pass1:focus` / `#pass1.strong` (the password field). More usefully, logged out there is **no admin colour scheme**, so `--wp-admin-theme-color` falls back to stock blue; `login.css` redefines that variable from `--upa-accent` on `body.login.upa`, which corrects every control core themes through it at once rather than one ID at a time.

The mark above the form is the **site icon** when one is set, the **site name** when not, and links to `home_url()` rather than wordpress.org (`login_headerurl` / `login_headertext`). The interim-login modal core renders inside wp-admin on session expiry is the same form, so it inherits everything and only loses the outer padding and card shadow.

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
- Planned (not in 1.0.0): Overview dashboard cards, ⌘K command palette, the Skin Library screen + `admin-skins/` catalog in `UnysonPlus-Library`, a CSSOM dark engine for third-party dark mode. (The skinned login page shipped in 1.1.45. A custom login address was moved out of this extension on purpose: it changes behaviour, and the Admin Skin is on by default — it lives in the off-by-default `security` extension, whose login step the skin styles automatically.)
