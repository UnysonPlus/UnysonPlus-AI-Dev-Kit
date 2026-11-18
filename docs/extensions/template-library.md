<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# template-library extension

A browsable catalog of premade page-builder templates — sections, columns and whole pages — that install into the builder's Templates menu ready to drop in. **Active by default:** no (enable it under Extensions).

## Provides

- **Shortcodes:** none — it feeds premade layouts into the page builder's **Templates** menu (it does not register elements of its own).
- **Admin/UI:** a template catalog (browse + install). Installing a template makes it appear under the builder's Templates menu, ready to insert. Bundled template JSON lives in the extension's `templates/` folder.
- **Settings/options:** — (a catalog/install UI, no settings-options tab).
- **Public hooks/filters:** `fw_tpl_lib_catalog_url` (the catalog.json address; point it at a local copy to test a staged library).

## Starter pages and their pictures

- The catalog has **full starter pages** (`kind: "full"`: `starter-cafe`, `starter-business`, `starter-portfolio`) beside
  sections. A full template's `json` is an array of root items (sections); a section template's is one section.
- **Template pictures ship with the template**: in its builder JSON a picture is the relative path `assets/<file>`
  (an image option's `url`, or any string). On install, `fw_tpl_lib__import_assets()` (includes/installer.php) downloads
  each from `<base_url><slug>/assets/<file>`, adds it to the Media Library with `media_handle_sideload()` (titled
  "<Template> template", meta `_fw_tpl_lib_source` = its source URL, so a second install reuses it), and rewrites the
  template to the attachment (url + `attachment_id`) before saving it under uploads. A failed download aborts the
  install with an error naming the file.
- Starter pages use only theme-driven styling (section `variant` alt/dark, button styles, the default Box Presets), so
  they follow Theme Settings colours and fonts.
- Library repo layout: `templates/catalog.json`, `templates/<slug>/<slug>.json` (the `_fw_template_export` envelope),
  `templates/<slug>/thumb.jpg`, `templates/<slug>/assets/*.webp`. Photos are CC0.
- Building a template programmatically: make the items with the AI Assistant's schema (`FW_AI_Schema::validate_items`)
  and wrap them in `{ _fw_template_export: { format_version: 2, kind, builder_type: "page-builder" }, title, json }`.
- Test a staged library locally with the `fw_tpl_lib_catalog_url` filter (point it at a local `catalog.json` whose
  `base_url` is the local folder) and delete the `fw_tpl_lib_catalog` transient.

## Notes / gotchas

- **Downloaded templates are stored in the uploads folder**, not inside the plugin, so the plugin stays lean.
- Requires the `shortcodes` + `page-builder` extensions (its output is builder trees, so it only makes sense alongside them — both are pulled in when it's activated).
- Related but distinct: the **snippets** extension provides *reusable/global* content by reference; template-library provides *starter* layouts you insert and then own.
