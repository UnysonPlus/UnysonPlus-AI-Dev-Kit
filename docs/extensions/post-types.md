# post-types extension

A no-code custom **post type + taxonomy** creator — build CPTs and taxonomies from the WordPress admin, no PHP required. **Active by default:** no (enable it under Extensions). Version: 1.0.12.

## Provides

- **Shortcodes:** none.
- **Admin page:** Unyson+ → **Post Types** (custom `add_submenu_page` + `render_page`, not a settings-options tab). Two Unyson `addable-popup` lists:
  - **Post Types** — one row per CPT: name, key/slug, supported editor features, archive/hierarchy/menu settings.
  - **Taxonomies** — one row per taxonomy; each declares which post-type key(s) it attaches to (a taxonomy can be shared across several types).
- **Settings/options:** the two lists are stored in the extension settings store under the `post_types` and `taxonomies` option ids (WP option `fw_ext_settings_options:post-types`). Each saved row is registered on `init` via `register_post_type()` / `register_taxonomy()`.
- **Public hooks/filters:** — (self-contained; no notable public filters).

## Notes / gotchas

- **Reserved keys are never registered over** — a curated `$reserved` / `$reserved_tax` blocklist (`post`, `page`, `attachment`, `category`, `fw-portfolio`, WP internal types, …) protects the core editor and other CPTs.
- CPTs created here can be **targeted by the Custom Fields extension** and displayed by the generic `[posts]` element.
- This extension is the **submenu "anchor"** — it orders the Unyson+ submenu so Post Types / Custom Fields / Shortcodes / Component Presets always appear in that sequence regardless of extension load order.
- The admin page is a bespoke management UI, so it does **not** use the metabox-holder + group settings layout (it hand-builds the two addable lists).
