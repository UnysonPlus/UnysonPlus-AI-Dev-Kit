# sidebars extension

Multiple, dynamically-assignable sidebars — create more than one sidebar and show different sidebars on different pages/contexts. **Active by default:** no (enable it under Extensions). Version: 1.0.26.

## Provides

- **Shortcodes:** none.
- **Settings/options:** a **Sidebars** admin UI (bespoke management page — add/rename sidebars, save/load presets, and set conditional replacement rules that swap the theme's default sidebar for a chosen one on matching pages). Backed by its own AJAX endpoints (`add_new`, `autocomplete`, `save_preset`, `remove_preset`, `delete`, `load_preset`).
- **Public hooks/filters:** — (registers dynamic sidebars via `register_sidebar` and filters the active sidebar per request; no headline public API).

## Notes / gotchas

- Registered sidebars become normal widget areas under Appearance → Widgets; the extension's job is registration + the per-page **replacement** logic.
- All 6 AJAX endpoints are CSRF-nonce protected (`check_ajax_referer('fw_sidebars')`); JS callers send a `_nonce` field.
- Requires framework `min_version` 2.2.2.
