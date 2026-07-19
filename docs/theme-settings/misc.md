# Theme Settings — Miscellaneous

Site-wide developer/utility settings: Custom CSS, custom scripts, analytics, 404 handling, performance tweaks, custom image sizes, maintenance mode, export/import, reset, and developer tools. Most are stored theme-scoped under a `multi` container whose leaf keys keep their feature prefix.

## Custom CSS

### Custom CSS — `misc_custom_css`
- **Type**: `multi` container wrapping one `code-editor` leaf `custom_css` (`mode: css`, height 400).
- **Default**: `''` (empty).
- **Saved value shape**: `{ "custom_css": "…css text…" }`. The `multi` parent key `misc_custom_css` holds an object with the single `custom_css` string.
- **Notes**: THE canonical custom-CSS field. Emitted into the plugin's combined presets stylesheet, which loads after all theme + plugin styles so it wins the cascade. Rules are scoped under `body:not(.wp-admin)` (front-end only). Same key the theme historically used — values carry over, no migration.

## 404 Page — `misc_404`

`multi` container. Saved value shape: `{ "404_page_id": "", "404_show_search": "yes", "404_show_recent_posts": "no" }`.

### Use this page as the 404 — `404_page_id`
- **Type**: select
- **Default**: `''`
- **Choices**: dynamic — built from published pages.

  | value | label |
  |---|---|
  | `''` | — Use default 404 template — |
  | `<page ID>` | `<page title>` (one entry per published page) |
- **Notes**: Pick a regular WordPress page to render in place of the default 404 template. Works on any active theme (template_include handler).

### Show search form (default template only) — `404_show_search`
- **Type**: switch
- **Default**: `yes`
- **Choices**:

  | value | label |
  |---|---|
  | `yes` | On |
  | `no` | Off |
- **Notes**: Only applies when no page is selected above AND the active theme uses its built-in 404 design (UnysonPlus theme's 404.php).

### Show recent posts (default template only) — `404_show_recent_posts`
- **Type**: switch
- **Default**: `no`
- **Choices**:

  | value | label |
  |---|---|
  | `yes` | On |
  | `no` | Off |
- **Notes**: Same conditions as `404_show_search`.

## Analytics & Tracking — `misc_analytics`

`multi` container. Saved value shape: `{ "analytics_ga4_id": "", "analytics_gtm_id": "", "analytics_meta_pixel_id": "", "analytics_clarity_id": "" }`. All plain text; leave empty to disable each.

### Google Analytics 4 Measurement ID — `analytics_ga4_id`
- **Type**: text
- **Default**: `''`
- **Notes**: Format `G-XXXXXXXXXX`. Empty = disabled.

### Google Tag Manager Container ID — `analytics_gtm_id`
- **Type**: text
- **Default**: `''`
- **Notes**: Format `GTM-XXXXXXX`. Emits both the `<head>` script and the `<noscript>` iframe.

### Meta (Facebook) Pixel ID — `analytics_meta_pixel_id`
- **Type**: text
- **Default**: `''`
- **Notes**: Numeric ID, e.g. `1234567890123456`.

### Microsoft Clarity Project ID — `analytics_clarity_id`
- **Type**: text
- **Default**: `''`
- **Notes**: 10-character alphanumeric ID from clarity.microsoft.com.

## Custom Scripts — `misc_custom_scripts`

`multi` container of three `code-editor` leaves (`mode: htmlmixed`, height 200). Saved value shape: `{ "custom_head_scripts": "", "custom_body_open_scripts": "", "custom_footer_scripts": "" }`. Content is pasted verbatim; wrap JS in `<script>` tags.

### Inside `<head>` — `custom_head_scripts`
- **Type**: code-editor (htmlmixed)
- **Default**: `''`
- **Notes**: Output verbatim before `</head>`.

### After opening `<body>` — `custom_body_open_scripts`
- **Type**: code-editor (htmlmixed)
- **Default**: `''`
- **Notes**: Output immediately after `<body>` opens. Used for tag-manager `<noscript>` fallbacks.

### Before `</body>` — `custom_footer_scripts`
- **Type**: code-editor (htmlmixed)
- **Default**: `''`
- **Notes**: Output before `</body>` closes.

## Performance Tweaks — `misc_performance`

`multi` container of six switches. Saved value shape: `{ "perf_disable_emojis": "no", "perf_disable_embeds": "no", "perf_remove_rsd_wlw": "no", "perf_disable_jquery_migrate": "no", "perf_remove_version_meta": "no", "perf_disable_xmlrpc": "no" }`. WordPress-core tweaks (theme-agnostic).

Every switch below shares the same choices:

| value | label |
|---|---|
| `yes` | On |
| `no` | Off |

### Disable WordPress emojis — `perf_disable_emojis`
- **Type**: switch — **Default**: `no` — Removes emoji detection script + styles from every page.

### Disable oEmbed discovery — `perf_disable_embeds`
- **Type**: switch — **Default**: `no` — Removes WP oEmbed JSON/XML discovery links and the legacy wp-embed.js loader.

### Remove RSD / WLW link tags — `perf_remove_rsd_wlw`
- **Type**: switch — **Default**: `no` — Removes legacy Windows Live Writer + Really Simple Discovery autodiscovery tags.

### Deregister jquery-migrate — `perf_disable_jquery_migrate`
- **Type**: switch — **Default**: `no` — Drops the legacy compatibility shim.

### Remove WordPress version meta tag — `perf_remove_version_meta`
- **Type**: switch — **Default**: `no` — Hides the `<meta name="generator">` tag from front-end source.

### Disable XML-RPC — `perf_disable_xmlrpc`
- **Type**: switch — **Default**: `no` — Turns off the `/xmlrpc.php` endpoint. Disable only if no apps depend on it (Jetpack, mobile apps).

## Media — Custom Image Sizes — `theme_image_sizes`

### Custom Image Sizes — `theme_image_sizes`
- **Type**: `addable-box` (repeatable rows of box-options).
- **Default**: one row — `{ "name": "Custom Size 1", "width": 450, "height": 250, "crop": false, "show_in_editor": "yes" }`.
- **Saved value shape**: array of objects, each `{ "name": string, "width": string, "height": string, "show_in_editor": "yes"|"no", "crop": <crop choice> }`.
- **Box-options / choices**:
  - `name` (text) — shown in the size dropdown; CSS-safe slug derived from it. Avoid reserved names Thumbnail / Medium / Large / Medium Large.
  - `width` (text, px)
  - `height` (text, px)
  - `show_in_editor` (switch, default `yes`):

    | value | label |
    |---|---|
    | `yes` | Yes |
    | `no` | No |
  - `crop` (select, default `false`):

    | value | label |
    |---|---|
    | `false` | No Crop |
    | `true` | Cropped |
    | `top-left` | Top Left |
    | `top-center` | Top Center |
    | `top-right` | Top Right |
    | `center-left` | Center Left |
    | `center` | Center |
    | `center-right` | Center Right |
    | `bottom-left` | Bottom Left |
    | `bottom-center` | Bottom Center |
    | `bottom-right` | Bottom Right |
- **Notes**: Each size is registered via `add_image_size`. `show_in_editor: yes` makes it selectable in media library / block editor dropdowns. New sizes only apply to images uploaded afterwards; regenerate thumbnails for existing images. Read via `fw_get_db_settings_option()`. NOT wrapped in a `multi` container (unlike the other misc sections).

## Maintenance Mode — `misc_maintenance`

`multi` container. Saved value shape: `{ "maintenance_enabled": "no", "maintenance_title": "We'll be right back", "maintenance_message": "…html…", "maintenance_logo": {…upload…}, "maintenance_allowed_roles": ["administrator"] }`. Serves a 503 splash to visitors; admin pages + allow-listed roles pass through.

### Enable maintenance mode — `maintenance_enabled`
- **Type**: switch
- **Default**: `no`
- **Choices**:

  | value | label |
  |---|---|
  | `yes` | On |
  | `no` | Off |

### Title — `maintenance_title`
- **Type**: text
- **Default**: `We'll be right back`

### Message — `maintenance_message`
- **Type**: wp-editor
- **Default**: `Our site is undergoing scheduled maintenance. Please check back shortly.`
- **Notes**: `reinit: true`.

### Logo — `maintenance_logo`
- **Type**: upload
- **Default**: `''`
- **Saved value shape**: Unyson upload value — `{ "attachment_id": <id>, "url": "…" }` (empty string when unset).
- **Notes**: Optional image displayed above the title.

### Roles that bypass the splash — `maintenance_allowed_roles`
- **Type**: multi-select (`population: array`)
- **Default**: `["administrator"]`
- **Saved value shape**: array of role-key strings.
- **Choices**: dynamic — one entry per registered role.

  | value | label |
  |---|---|
  | `<role key>` | `<translated role name>` (e.g. `administrator` → Administrator, `editor` → Editor, `author` → Author, `contributor` → Contributor, `subscriber` → Subscriber, plus any custom roles) |
- **Notes**: Logged-in users with any of these roles see the live site as normal.

## Export / Import — `misc_export_import`
- **Type**: `html-full` (no stored value).
- **Notes**: Renders the export button + import file form from `settings-export-import.php`. Operates on the framework's theme-settings store; works on any theme. Not an option that holds a value.

## Reset Settings — `misc_reset_settings`
- **Type**: `html-full` (no stored value).
- **Notes**: Renders a single "Reset All Theme Settings" button that posts the framework's built-in `_fw_reset_options` flag. Unyson core handles the reset + confirm dialog. Restores every option on every Theme Settings tab to its default. Cannot be undone.

## Developer Tools — `misc_dev_tools`

`multi` container (lives in the theme's `misc.php`, not the plugin). Saved value shape: `{ "dev_show_demo": "no" }`.

### Show Demo Options — `dev_show_demo`
- **Type**: switch
- **Default**: `no`
- **Choices**:

  | value | label |
  |---|---|
  | `yes` | Yes |
  | `no` | No |
- **Notes**: Reveals the "Demo" tab — a reference showcase of every option type, for developers. Keep off on production. Save once to apply.
