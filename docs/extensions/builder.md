# builder extension

The base **Page Builder** option type — the drag-and-drop `builder` option that the page-builder (and Forms' form builder) are built on top of. **Active by default:** yes (core). Version: 1.2.72.

## Provides

- **Shortcodes:** none directly — it supplies the `builder` option type + canvas; the page-builder extension registers the actual layout/content elements.
- **Settings/options:** no settings page; it registers the builder option type, its JS (`builder.js` / `initialize-builder.js`), the backend grid CSS, and the full-page **Templates** system.
- **Public hooks/filters:** builder AJAX endpoints (nonce-gated): `fw_builder_fullscreen_set/unset_storage_item`, `fw_builder_templates_render`, `fw_builder_templates_full_load/_save/_delete/_export/_import`. Grid classes `fw-col-*-{15,25,35,45}` + offsets expose the fifths column family.

## Notes / gotchas

- **Grid supports fifths:** widths 1/5, 2/5, 3/5, 4/5 (20/40/60/80%) in addition to twelfths — fifths use `fw-col-sm-{15,25,35,45}`. Twelfths can't express 40/60/80%.
- `.fw-row` gutters read Bootstrap's native `--bs-gutter-x/y` (legacy `--fw-gutter-x/y` kept as fallback) so Theme Settings → Default Gap takes effect; `.row` and `.fw-row` are interchangeable for gap utilities.
- **Smart placement:** click-to-add and drag-and-drop auto-build the missing container scaffold (section → column) and drop elements into a valid parent instead of stranding them at root.
- Full-page template export uses an `_fw_template_export` envelope; export `format_version` is 2 (per-element Custom CSS now rides inside the builder `json`).
- Much of the recent changelog is drag-helper-drift fixes — the reorder hierarchy guard constrains `simple` items to commit only inside a column.
