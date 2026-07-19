# asset-optimizer extension

Combines enqueued frontend CSS and JavaScript into single minified, cached files to cut HTTP requests and payload. **Active by default:** yes. Version: 1.1.28.

## Provides

- **Shortcodes:** none.
- **Settings/options:** its own settings page under Extensions, three native `tab` containers:
  - **General** — `combine_css`, `combine_js` (master switches), `css_scope` (`site` shared bundle vs `per_page`), `logged_out_only`, `exclude_urls` (one path/line, `*` wildcard).
  - **CSS** — `css_handles` (checkboxes; every discovered stylesheet, all checked by default).
  - **JavaScript** — `js_handles` (checkboxes; only first-party checked by default), `js_defer`, `js_minify`.
- **Public hooks/filters:**
  - `fw:ext:asset-optimizer:css_exclude_handles` / `:js_exclude_handles` — force-exclude handles from combining (passed the handle→src map).
  - `fw:ext:asset-optimizer:preset_css_handles` — the preset-CSS handle list (cascade ordering).
  - `fw:ext:asset-optimizer:settings-options:before` / `:after` — inject settings.
  - Public methods `is_combine_enabled('css'|'js')` and `combine_files($ordered,'css'|'js')` let cooperating extensions fold their own per-page assets into the cached bundle.

## Notes / gotchas

- **Handle discovery** is done by a one-shot internal homepage fetch; behind a full-page cache (e.g. WP Engine) visit any page with `?fw_asset_optimizer_discover=1` to force a fresh scan.
- **Cascade-aware CSS order:** everything in print order, then parent theme, then `unysonplus-presets`, then the child theme LAST (so the theme keeps override authority). The combine pass runs at `wp_enqueue_scripts:99999` (after the theme's stylesheet orderer).
- **JS combining is conservative** — only local footer scripts with no async/defer and no inline/localized data are merged; core/CDN and per-request-data scripts are always left alone even if ticked. JS is always per-page.
- Cached bundles auto-purge on theme switch, plugin activate/deactivate, or any upgrade.
