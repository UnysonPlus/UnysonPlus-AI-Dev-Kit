<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# builder extension

The base **Page Builder** option type — the drag-and-drop `builder` option that the page-builder (and Forms' form builder) are built on top of. **Active by default:** yes (core). Version: 1.2.73.

## Provides

- **Shortcodes:** none directly — it supplies the `builder` option type + canvas; the page-builder extension registers the actual layout/content elements.
- **Settings/options:** no settings page; it registers the builder option type, its JS (`builder.js` / `initialize-builder.js`), the backend grid CSS, and the full-page **Templates** system.
- **Public hooks/filters:** builder AJAX endpoints (nonce-gated): `fw_builder_fullscreen_set/unset_storage_item`, `fw_builder_templates_render`, `fw_builder_templates_full_load/_save/_delete/_export/_import`. Grid classes `fw-col-*-{15,25,35,45}` + offsets expose the fifths column family.

## Notes / gotchas

- **Default container = the flexbox "Div", not the Bootstrap grid.** The page-builder now leads with the
  `flexbox` shortcode (Section / Flexbox / Grid tiles under "Layout Elements", palette tab "Structure");
  the classic `section`/`row`/`column`/`container`/`bleed-section` tiles are demoted to a **"Classic"**
  palette tab. Divs emit house `fw-*` utilities (`fw-flex`/`fw-grid`, `fw-span-{bp}-N`, `fw-gap{bp}-*`, …)
  and nest arbitrarily. The `.fw-row`/`fw-col-*`/`--bs-gutter` grid CSS below is the **classic path** —
  generated for classic Column content, NOT for modern flexbox Divs. See
  [`../shortcodes/flexbox.md`](../shortcodes/flexbox.md).
- **Grid (classic) supports fifths:** widths 1/5, 2/5, 3/5, 4/5 (20/40/60/80%) in addition to twelfths — fifths use `fw-col-sm-{15,25,35,45}`. Twelfths can't express 40/60/80%.
- `.fw-row` gutters (classic grid) read Bootstrap's native `--bs-gutter-x/y` (legacy `--fw-gutter-x/y` kept as fallback) so Theme Settings → Default Gap takes effect; `.row` and `.fw-row` are interchangeable for gap utilities. (Flexbox Divs have no row-gutter cascade — they space children with the `gap` option.)
- **Smart placement:** click-to-add and drag-and-drop drop elements into a valid parent instead of stranding them at root. Loose top-level content is now wrapped into a **flexbox `<section>` Div** (`wrap_into_flexbox`); a dropped classic Column still force-synthesizes the `section → row → column` scaffold for back-compat.
- Full-page template export uses an `_fw_template_export` envelope; export `format_version` is 2 (per-element Custom CSS now rides inside the builder `json`).
- Much of the recent changelog is drag-helper-drift fixes — the reorder hierarchy guard constrains `simple` items to commit only inside a column.
