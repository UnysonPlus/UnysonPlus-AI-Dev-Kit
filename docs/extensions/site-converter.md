# site-converter extension

Bring an AI-generated / existing website into WordPress — imports media, styling presets, theme settings, pages and menus (piecemeal or as a one-shot bundle) and can generate a matching header/footer child theme. Converts **from a URL** (via a local capture service) or **from a file** (upload an AI-builder export, auto-detected). **Active by default:** no (enable it under Extensions). Version: 1.3.1.

## Provides

- **Shortcodes:** none — it's an importer toolkit, not builder elements (it *emits* page-builder trees + presets that shortcodes consume).
- **Admin page:** Unyson+ → **Convert**. Tools: Media scanner/importer, Styling Presets importer, Theme-settings importer, Pages importer, Menu importer, one-shot **Convert bundle** (`.zip`), and a **header/footer Theme Generator** (child or standalone). Two conversion methods (URL / file) with auto-detected source adapters + an optional **"Use AI"** fidelity pass and a human-in-the-loop "Review mapping first" editor.
- **Reusable engines (`includes/`, all static):** `FW_Site_Converter_Media`, `_Presets`, `_Theme_Settings`, `_Pages`, `_Menus`, `_Bundle`, `_Theme_Generator`, `_Stitch` (Google Stitch ingest, deterministic no-AI), `_Sources` (source adapter registry).
- **Public hooks/filters:** `fw_site_converter_sources` (register a builder adapter). The AI backend + capture service live **outside WordPress** (local `unysonplus-site-capture` service — `/capture`, `/ai-convert`).

## Notes / gotchas

- **Who edits the converter (important).** A **site build must never fork the shared converter to fix one page** — close that site's delta with native options / `misc_custom_css` instead. Improving the converter *algorithm* (so a whole class of misses goes away for everyone) is a **contributor** task: it needs the converter repos and the change must be **upstreamed** (and mirrored across the JS URL path + the PHP file path). As a site builder, **record the miss in the conversion report** and, with the site owner's consent, **share that (anonymized) report upstream** — the report is the intended feedback artifact, not a code fork. (Report-sharing is opt-in and consent-gated; anonymized structural data only — no raw third-party content.)
- The deterministic no-AI algorithm exists **twice** (PHP here for the file path; JS in the capture-service repo for the URL path) — keep both in sync (see the workspace CLAUDE.md rule).
- **Full detail lives in the extension's own `AGENTS.md`** + `docs/site-conversion-playbook.md` (Theme-Settings-first demo conversion) + `docs/stitch-to-unysonplus.md`. Read those before working on conversion logic.
- Carried CSS must be scoped `body:not(.wp-admin)` (the asset optimizer absorbs `misc_custom_css` into a bundle that also loads in wp-admin); `misc_custom_css` is a `multi` option (`{ "custom_css": "…" }`, never a raw string).
- Media import is content-hash de-duped; per-shortcode att keys in emitted `pages.json` are exact (`text_block` → `text`, column `width` is top-level) — clone shapes from a real export.
