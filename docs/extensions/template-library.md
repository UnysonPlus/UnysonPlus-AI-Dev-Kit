# template-library extension

A browsable catalog of premade page-builder templates — sections, columns and whole pages — that install into the builder's Templates menu ready to drop in. **Active by default:** no (enable it under Extensions). Version: 1.0.9.

## Provides

- **Shortcodes:** none — it feeds premade layouts into the page builder's **Templates** menu (it does not register elements of its own).
- **Admin/UI:** a template catalog (browse + install). Installing a template makes it appear under the builder's Templates menu, ready to insert. Bundled template JSON lives in the extension's `templates/` folder.
- **Settings/options:** — (a catalog/install UI, no settings-options tab).
- **Public hooks/filters:** — (self-contained).

## Notes / gotchas

- **Downloaded templates are stored in the uploads folder**, not inside the plugin, so the plugin stays lean.
- Requires the `shortcodes` + `page-builder` extensions (its output is builder trees, so it only makes sense alongside them — both are pulled in when it's activated).
- Related but distinct: the **snippets** extension provides *reusable/global* content by reference; template-library provides *starter* layouts you insert and then own.
