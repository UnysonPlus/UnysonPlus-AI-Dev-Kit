# snippets extension

Reusable page-builder content — author a block once as a snippet and embed it anywhere, plus Global Sections/Columns that update every page that references them. **Active by default:** yes (listed in the theme's `supported_extensions`). Version: 1.0.13.

## Provides

- **Shortcodes:** `[snippet id="…"]` (inline embed of a saved snippet) and `[global_section]` (renders a referenced snippet **bare** — no wrapper — so a reused section lands at the builder root with zero nesting) → `../shortcodes/`.
- **Admin UI:** a `snippet` CPT admin that doubles as a **Template Library**: a "Template Kind" selector (Block / Section / Column) plus a Kind column + filter. Block snippets are inline embeds; Section/Column snippets appear in the page builder's **Templates** manager as Global Sections / Global Columns.
- **Builder integration:** the page builder's Save Section / Save Column modal gains a **"Save as Global Template"** switch (shown only when this extension is active) → stores the tree as a published `snippet` and inserts it by **reference** (`fw_builder_global_template_save` AJAX; a live canvas skeleton preview via `fw_global_section_preview`). Editing the snippet updates every reference; references carry a GLOBAL badge + an "Edit Global Template" pencil.
- **Public hooks/filters:** — (mostly builder AJAX + the `_fw_global_kind` meta tag; no headline public filter).

## Notes / gotchas

- Snippet builder-tree JSON is stored in the snippet post's page-builder post-meta (same store as a page); rendering a column-kind snippet **bypasses the items-corrector** so it emits bare `[column]…[/column]` with no extra row/column nesting.
- `disable_root_correction` on `[snippet]` / `[global_section]` is what lets a root-level (section) reference render without an auto-generated section wrapper.
- Requires the `shortcodes` extension.
