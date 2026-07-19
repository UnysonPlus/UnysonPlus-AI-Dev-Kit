# update extension

Keeps the framework, extensions, and theme up to date — the update-service backbone for in-place upgrades. **Active by default:** no (not in the theme's `supported_extensions`; it's an infrastructure extension). Version: 1.0.19.

## Provides

- **Shortcodes:** none.
- **Update sources (`extensions/`):** three bundled sub-extensions provide update transports — `github-update`, `bitbucket-update`, and `custom-update` — so an extension/theme declaring a repo can be offered in-place upgrades.
- **Settings/options:** no user settings page (surfaces available updates in the admin, driven by each project's `github_update` / version markers).
- **Public hooks/filters:** — (internal update-service plumbing).

## Notes / gotchas

- **Distinct from the plugin's own release delivery.** The whole UnysonPlus plugin ships as one GitHub-release ZIP delivered by the **Plugin Update Checker in `unysonplus.php`** (keyed off the **core** `Version:`), not by this extension — per-extension update checking is disabled. This extension is the generic Unyson update framework; the core version gate is what actually ships changes to live sites.
- Each extension/theme opts into updates via its manifest `github_update` (`UnysonPlus/UnysonPlus-<Name>-Extension`).
- Never downgrade a version number — it breaks the auto-updater's cached update state.
