# portfolio extension

A full portfolio module: a `fw-portfolio` custom post type (with Categories, optional Tags) plus per-project galleries, details and related-project rows, and two builder elements for displaying projects. **Active by default:** no (enable it under Extensions). Version: 1.0.16.

## Provides

- **Shortcodes:** `[portfolio]` (a dependency-free, filterable project grid with category filter buttons — no Isotope) and `[project_gallery]` (renders one project's image gallery with a vanilla-JS lightbox) → `../shortcodes/` for atts. Grids of projects can also use the generic `[posts post_type="fw-portfolio"]`.
- **CPT / taxonomies:** registers the `fw-portfolio` post type + `fw-portfolio-category` (and, when enabled, a non-hierarchical Tags taxonomy); both declare `show_in_rest`.
- **Settings/options:** an extension **Settings** tab (`settings-options.php`, house box+group layout). Key ids: `archive_columns`, `archive_per_page`, `orderby`, `order`, `featured_first`; feature switches `enable_gallery`, `enable_project_details`, `enable_tags`; single-view `show_gallery_single`, `single_columns`, `show_meta_single`, `enable_related`, `related_count`, `related_heading`. Read with `fw_get_db_ext_settings_option('portfolio', '<key>')` or the class wrappers `->get_setting()` / `->feature_enabled()`.
- **Per-project meta:** a Project Details box (client, URL, completion date, services, summary) + a Featured switch. Featured is mirrored to a queryable `_fw_portfolio_featured` post-meta on save so archives can float featured projects first.

## Notes / gotchas

- Shared render helpers keep the single view and the shortcodes identical: `fw_ext_portfolio_render_gallery()`, `get_project_meta`, `render_project_meta`, `get_related`, `render_related`, `render_card`, `render_grid`.
- **Read settings on `init` or later, never during extension boot** — an early read forces Unyson's option-types init before page-builder registers its `page-builder` option type (the 1.0.14 "Undefined option type" regression).
- `config.php` declares two image sizes: `featured-image` (223×139) and `gallery-image` (700×455).
- The old jQuery NivoSlider + its assets were removed (1.0.13, breaking) in favor of the CSS-grid gallery + accessible lightbox.
