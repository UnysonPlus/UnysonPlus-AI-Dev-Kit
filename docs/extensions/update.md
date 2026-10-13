<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# update extension

Keeps the framework, extensions, and theme up to date — the update-service backbone for in-place upgrades. **How you get it:** ships **in the core-only plugin zip** (one of only two extensions that do, with `blog`); not in the theme's `supported_extensions` — an infrastructure extension. Version: 1.0.20.

## Provides

- **Shortcodes:** none.
- **Update sources (`extensions/`):** three bundled sub-extensions provide update transports — `github-update`, `bitbucket-update`, and `custom-update` — so an extension/theme declaring a repo can be offered in-place upgrades.
- **Settings/options:** no user settings page (surfaces available updates in the admin, driven by each project's `github_update` / version markers).
- **Public hooks/filters:** — (internal update-service plumbing).

## Notes / gotchas

- **Distinct from the plugin's own release delivery.** The core plugin ships as one **core-only** GitHub-release ZIP (`unysonplus.zip`: framework + `blog` + this `update` extension) delivered by the **Plugin Update Checker in `unysonplus.php`** (keyed off the **core** `Version:`), not by this extension. Every other extension is downloaded through the **Extensions manager** (Unyson+ → Extensions) from its own `UnysonPlus-<Name>-Extension` repo's tagged release. This extension is the generic Unyson update framework; the core version gate is what actually ships changes to live sites.
- Each extension/theme opts into updates via its manifest `github_update` (`UnysonPlus/UnysonPlus-<Name>-Extension`).
- Never downgrade a version number — it breaks the auto-updater's cached update state.
