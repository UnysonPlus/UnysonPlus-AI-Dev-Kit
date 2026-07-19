# shortcodes extension

The core drag-and-drop content-element system — the parent that owns every UnysonPlus page-builder element and the shared styling/animation/icon helper layer. **Active by default:** yes (hidden parent; pulled in automatically by `page-builder` + `wp-shortcodes`, which the theme auto-activates). Version: 1.11.64.

## Provides

- **Shortcodes:** the full element catalog (special_heading, text_block, button, icon_box, accordion, tabs, gallery, posts, pricing_table, testimonials, section, column, flexbox, container, and dozens more) — each element is a folder under this extension's `shortcodes/`. Per-element atts + recipes: `../shortcodes/` (one page per element; `../shortcodes/README.md` documents the page-builder node model / JSON tree). `display => false` (never shown as a standalone extension row).
- **Bundled sub-extensions:** `extensions/page-builder` (the visual builder + `page-builder` option type — its own repo) and `extensions/wp-shortcodes` (classic-editor shortcode inserter).
- **Settings/options:** an extension **Settings** page. Key id: `smooth_scroll_global` (site-wide Lenis inertia scroll; per-page control overrides it) under the `smooth_scroll_box`. Read via `fw_get_db_ext_settings_option('shortcodes', '<key>')`.
- **Shared helper layer (`includes/`):** the styling helper (`sc_color_field_compact`, `sc_normalize_color_value`, `sc_build_wrapper_attr`, spacing/alignment field helpers), the central icon renderer (`sc_icon_render`, SVG sanitizer), background-pro, and the animation-field registry that the **Animations** tab and the Animation Engine plug into.
- **Public hooks/filters:** many — e.g. `sc_needs_wrapper`, `sc_build_wrapper_attr` (priority-ordered wrapper builder), `sc_section_background_effects`, `sc_anim_collection_items`, `unysonplus_editor_list_formats`, and the color/preset resolvers. Requires the base `builder` extension.

## Notes / gotchas

- This is a **framework, not a single feature** — most day-to-day work happens in the individual `shortcodes/<name>/` folders; read each element's own `AGENTS.md` before editing (the shortcodes recipe).
- Colors on elements must use `sc_color_field_compact()` (preset picker), never a raw `color-picker` — see the workspace color-option rule.
- Its GitHub repo is `UnysonPlus-Shortcodes-Extension`; the nested page-builder maps to the separate `UnysonPlus-PageBuilder-Extension`.
- The changelog in `manifest.php` is the running record of element features — skim it to see what each element can already do before adding capability.
