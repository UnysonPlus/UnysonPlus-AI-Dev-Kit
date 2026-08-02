# live-editor extension

Front-end inline editing of page-builder pages — an Avada/Elementor-style visual editor layered over the existing Page Builder: hover sections/columns/elements to select them, edit their options in place, add/move/delete items, and save back to the same builder JSON. **Active by default:** yes. Version: 0.2.44.

## Provides

- **Shortcodes:** none — it is an editor over the existing Page Builder, not an element.
- **Entry points:** the **"Edit Live"** button in the admin bar (front end AND the wp-admin post-edit screen), a button in the post-edit **Publish** box (`post_submitbox_misc_actions`), and a hover **row action** in the Pages/Posts list tables (like "Edit with Elementor").
- **Architecture:** an ISOLATED IFRAME canvas. Visiting a builder page with `?fw-live-editor=1` swaps the theme template for a minimal editor **shell** (`views/editor-shell.php` — toolbar + canvas chrome) that embeds the same page in an `<iframe>` loaded with `?fw-live-editor-frame=1`; the two documents talk over `postMessage`, so editor CSS/JS never collide with theme CSS/JS. The data model is the EXISTING page-builder post option — the live editor and the classic backend builder are two front-ends over one source of truth.
- **Editing / saving (AJAX endpoints in `class-fw-extension-live-editor.php`):** load an item's options (`_item_options`), render a single item (`_render_item`) or the whole page (`_render_page`), create a new item / section / column (`_new_item` / `_new_section` / `_new_column`), **save** (`_ajax_save`, writes back via `fw_set_db_post_option`), and an **opcache flush** helper.
- **Autosave + revision history:** a background recovery **autosave** (post meta `_fw_le_autosave`, cleared on real save) plus a shared **revision history** (index meta `_fw_le_rev_index` + one meta per revision, capped at **20**, oldest trimmed, deduped). Revisions are snapshotted on the `fw_post_options_update` hook, so BOTH the live editor's save AND the classic backend builder feed the same history.
- **Settings/options:** none of its own — it reuses each element's existing option schema, rendered in place.
- **Public hooks/filters:** consumes `fw_post_options_update` (revision snapshots) and force-renders wrapper-less leaves in edit mode; otherwise self-contained (drives the page-builder it augments).

## Notes / gotchas

- **Requires `page-builder`** (which pulls in `builder` + `shortcodes`) and framework **≥ 2.1.19** — it only makes sense on top of the builder it augments.
- Editing happens on the live front end (not the wp-admin builder canvas); changes save back to the same builder JSON, so a page edited live and a page edited in the classic builder stay in sync (and share one revision history).
- The `_render_item`/`_render_page` filters register unconditionally and self-gate via `is_edit_render()` — they act inside the iframe (frame request) AND under `admin-ajax` (single-item render), where `is_admin()` is true.
- Still pre-1.0 (`0.2.x`). Standalone, displayed extension with a `thumbnail.svg` icon; its own repo `UnysonPlus-Live-Editor-Extension` with the framework auto-updater (a top-level extension, like Forms).
