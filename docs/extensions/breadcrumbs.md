# breadcrumbs extension

Renders a simplified navigation trail (home → … → current page) placeable anywhere in the theme, with schema.org structured data. **Active by default:** yes. Version: 1.0.23.

## Provides

- **Shortcodes:** `[breadcrumbs]` — exposes the same argument set as the PHP helpers (separator, prefix, show_home, home_icon, link_last, show_on_front, truncate, post_taxonomy, schema, …).
- **Settings/options:** its own settings page (canonical metabox-holder + `box`→`group` layout), three boxes:
  - **General** — `separator`, `prefix`, `show_home`, `home_icon`, `link_last`, `show_on_front`, `truncate`.
  - **Labels** — `homepage-title`, `blogpage-title`, `404-title`.
  - **Taxonomy & SEO** — `post_taxonomy`, `show_post_type_archive`, `schema` (`microdata` / `json-ld` / `none`).
- **Public hooks/filters:**
  - Helpers `fw_ext_breadcrumbs( $args )` (echo) and `fw_ext_get_breadcrumbs( $args )` (return); the extension's `render()` accepts the same args array (a bare string is still treated as the separator for back-compat).
  - `fw_ext_breadcrumbs_args` / `fw_ext_breadcrumbs_items` — filter the resolved args / trail items.
  - `fw_ext_breadcrumbs_settings_options_default_values`, plus `fw:ext:breadcrumbs:settings-options:before` / `:after`.

## Notes / gotchas

- **This is the canonical settings-page reference** for the metabox-holder + `box`→`group` layout convention (see the workspace rule).
- Structured data migrated from the deprecated data-vocabulary.org markup to **schema.org BreadcrumbList** (Microdata or JSON-LD); output is a semantic `<nav>/<ol>/<li>` trail with an `aria-label`.
- Builder resolves attachments, WooCommerce shop and custom-post-type archives when building the trail.
