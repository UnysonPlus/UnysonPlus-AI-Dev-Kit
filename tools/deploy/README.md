<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# tools/deploy — put a site on its host with no manual uploads

Thin clients of the site's **AI Assistant MCP tools**. They package files on your computer and send
them; every write happens on the site through the plugin's tools (same permission checks, same undo).
Nothing here talks to the database or the filesystem of the site directly.

Set the connection once per shell:

```
export UPW_SITE=https://example.com
export UPW_AUTH=<base64 of "user:application password">   # Users → Profile → Application Passwords
```

The site needs **AI Assistant → Settings → Outside AI programs: write** (and **allow PHP writes** if a
child theme with PHP files is pushed file by file). On hosts that turn file editing off, `push-theme`
still works: it goes through WordPress's own theme installer.

| Tool | Does | Site tool it calls | Status |
|---|---|---|---|
| `mcp.mjs <tool> [json\|@file]` | Calls any MCP tool; also the client the others import | — | works today |
| `export-content.php <dir> [types=… category=… users=… menus=loc:slug short-links files=…]` (run with `wp eval-file` on the SOURCE install) | Reads posts of any type (with terms, featured image and Unyson post options), authors with their photos, menus and short links into `<dir>/content.json` + `<dir>/files/` — domain-free | — | works today |
| `push-theme.mjs <theme-folder> [--activate]` | Zips the theme (bsdtar, forward slashes) and installs it in 1 MB pieces | `install_theme` (file data) | works with AI Assistant 1.0.46+ |
| `push-content.mjs <dir> [--only=files,users,posts,menus,links]` | Sends an export: files → users → posts → menus → short links; re-runs only fill gaps | `upload_media` (`keep_path`), `user_upsert`, `content_upsert`, `menu_set`, `short_links_import` | works with AI Assistant 1.0.46+ |
| `push-file.mjs <file> <path-in-child-theme> [--confirm]` | Writes one child-theme file (two-step: preview, then `--confirm`) | `child_theme_files` | works (verified on WP Engine with 1.0.45) |

## Deploy order (a new site)

1. **Theme Settings + presets** — `update_theme_settings`, `save_preset` (with `mcp.mjs`).
2. **Child theme** — `push-theme.mjs <child> --activate` (registers custom post types the content needs).
3. **Content** — `export-content.php` on the source, then `push-content.mjs`.
4. **Pages** — `create_page` / `insert_items`, then `reading_settings {front_page}`.
5. **Motion** — `manage_extension animation-engine activate`, then `animation_apply`.
6. **Check** — `render_check`, and the `tools/measure/` lenses against the live URL.

Gotchas (seen on the first full run):

- **Roles:** the site's `user_upsert` refuses any role that can manage the site, so `export-content.php`
  carries editors and administrators as `author`.
- **Short-link prefix:** exported slugs already carry their folder (`go/…`, `play/…`), so `push-content` sends
  `clear_prefix: true` (AI Assistant 1.0.48+), which blanks the Short Links prefix (undoable).
- **Theme code on hosts that block it (WP Engine):** such hosts refuse to create `.php` files from an API
  request but allow it from wp-admin. `push-theme` then gets `queued`: an administrator clicks **Install**
  on the "theme update ready" notice in wp-admin (one click, nothing to upload), and
  `push-theme.mjs --status <upload_id>` reports the result. CSS / JS / JSON / images are not affected.
- **Status:** `content_upsert` defaults a missing status to draft; the exporter always writes `publish`.

Plugin and parent-theme fixes are not deployed here: they reach every site through the release updater.
