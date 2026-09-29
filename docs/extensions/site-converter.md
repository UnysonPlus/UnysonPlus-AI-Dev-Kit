<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# site-converter extension

Bring an AI-generated / existing website into WordPress — imports media, styling presets, theme settings, pages and menus (piecemeal or as a one-shot bundle) and can generate a matching header/footer child theme. Converts **from a URL** (via a local capture service) or **from a file** (upload an AI-builder export, auto-detected). **Active by default:** no (enable it under Extensions).

## The mechanism — deterministic class→value TRANSLATION (this is THE job, not an aspiration)

A conversion is a **translation**, not a design task. The source is already a finished design: every value
exists as a captured **Tailwind class** (`py-10`, `rounded-full`, `shadow-xl`, `bg-[#ff6b8b]`,
`max-w-3xl`) or its resolved **computed style**. The converter's entire job is to **translate** each
captured class into a native option / Theme-Settings preset / scoped CSS — deterministically, with **no AI
at runtime**. So when a converted value is wrong, the fix is **never** to measure the rendered page and
hand-tune it — it is to **fix the class→value rule in the converter** (both paths, JS + PHP) and re-prove
it. (Everything under "Target architecture" below is the *fuller* form of this; the translation itself is
not aspirational — it is the mechanism.)

### Prove a translation with a browser-free class-string fixture (the primary conversion proof)

The proof that a class→value translation is correct is a **class-string fixture**, run offline with **no
browser**: a captured class string in, the expected native option out. The reference harness is
**`tailwind-matrix.test.mjs`** (capture service, `tools/design-capture/`): it feeds every step of
Tailwind's official scales through the real `toPages()` pipeline and fails loud on

- **CLAMP** — a Tailwind step lands past the UnysonPlus scale ceiling (distinct sizes collapse to the max), or
- **COLLIDE** — two >8px-apart Tailwind steps snap to the **same** slug (the scale is too coarse there).

This is what "prove `py-10` → `40px`" means. **When you teach or fix a translation rule, add/extend a
fixture case and re-run it** — that is the regression guard, not a rendered screenshot diff. The rendered
`fidelity-check.mjs` lenses are only the *secondary* check that the translated options assembled correctly.

### A chrome rule needs a fixture on BOTH sides — PHP is authoritative for an import

`tailwind-matrix.test.mjs` and `header-chrome-parity.test.mjs` exercise the **JS** twin. That is only
half the guard for anything that lands in **theme-settings** (header/footer chrome), because
`FW_Site_Converter_Bundle::import_dir()` re-runs `build_from_html()` and **overwrites** the JS-produced
`theme-settings.json` so pages and design come from one engine. On a bundle import — the path the admin
"Convert" button takes — **the PHP twin is what actually runs**, and a JS-only fixture guards the side
nobody executes.

So a chrome translation rule lands with a case in **both**:

| path | fixture | run with |
|---|---|---|
| JS (`to-theme-settings.mjs`) | `header-chrome-parity.test.mjs` (capture service) | `node header-chrome-parity.test.mjs` |
| PHP (`class-fw-site-converter-stitch.php`) | `tests/chrome-parity-test.php` (site-converter) | `php D:/xampp/wp-cli.phar --path=D:/xampp/htdocs/testsite --allow-root eval-file "<path>"` |

The PHP fixture feeds synthetic HTML carrying the capture stamps (`data-sc-cs`, `data-sc-header`,
`data-sc-scrolled`, `data-sc-footer`) through the real `build_from_html()` and asserts the emitted
options. This is not a theoretical split: the `saturate`-pinning rule once shipped in **PHP only**, and a
`header_shadow_depth` regex bug shipped in **both** — neither was caught until a fixture existed.

**Before recording a converter gap as closed, run `tools/option-reachability/check.mjs`.** It reports, per
header/footer theme option id, whether BOTH twins emit it, one only, or neither. A theme option nothing emits
is not a closed gap — gap G3 was recorded `CLOSED in unysonplus-theme 2.5.90` while neither twin had ever
emitted one of its options. JS-only drift is the failing case (a bundle import discards it); PHP-only is a
ledger entry, since PHP is what runs on import.

**Both fixtures pin a NEGATIVE per rule** (signal absent → option not emitted). That half is what keeps a
default conversion unchanged, and it is the half that protects already-converted sites from drift.

### The fix loop (per wrong value)

`captured class → converter translation → is the value right?` → **no →** fix the class→value rule in
**BOTH** paths (JS `capture-extract`/`to-pages` **and** PHP `Mapper`/`Stitch`/`Tailwind`, kept in sync) →
**re-run the class-string fixture** → repeat until it passes. A site-builder (no repos) instead **flags**
the systematic miss via `--share` (below) and closes only this site's residual with native options /
`misc_custom_css`. Either way: **you never hand-measure the render to derive the value.**

## Structural model — column-first, with a PARTIAL single-level flexbox overlay (CURRENT REALITY)

The page builder now defaults to the **flexbox "Div"** container (see
[`../shortcodes/README.md`](../shortcodes/README.md) / [`../shortcodes/flexbox.md`](../shortcodes/flexbox.md)),
but **the converter has only PARTIALLY adopted it.** Document the current behavior honestly — the
converter does **not** yet duplicate the source tree as nested flexbox Divs with no `fw-row`s. That is
an aspiration with open code gaps, not what it emits today.

**PHP file-upload path (`class-fw-site-converter-mapper.php`) — a HYBRID:**

- It builds classic **`column`** nodes first, then **opportunistically rewrites a SINGLE level of clean
  rows** into a `flexbox` Div via `n_flexbox()` + `column_to_flexbox_cell()`, gated by `row_flex_safe()`:
  a row flexes only when it has **≥2 cells**, **no** `inner_class` box wrapper, and **no**
  `element_position`. The row becomes one `flexbox` (`display:flex`, `direction:row`, `wrap:yes`) whose
  cells are child `flexbox` Divs carrying their Width as a 12-col span.
- **Sections and containers are NEVER flexed** — they stay classic `n_section()` / `n_container()`.
- **Non-recursive:** `column_to_flexbox_cell()` passes the cell's `_items` through **unchanged**, so any
  **nested grid stays nested `column`s**. So boxed-card rows (`inner_class`), floating-card rows
  (`element_position`), single-cell rows, and **any depth ≥2** nesting still emit `fw-row` / `fw-col`.

**JS URL/capture path — now at PARITY for the single-level overlay.** `to-pages.mjs` carries the
byte-faithful twins (`nFlexbox` / `flexWidthPreset` / `slugToSpan` / `rowFlexSafe` /
`columnToFlexboxCell`) and `atom-templates.json` now has the `flexbox` atom, so a clean row emits one
`flexbox` row of `flexbox` cells — the same overlay as the PHP path — instead of loose columns. Verified
on shared captures (flexbox nodes now appear where the JS path previously emitted zero). Keep the PHP
`n_flexbox`/`row_flex_safe`/`column_to_flexbox_cell` and their `to-pages.mjs` twins **in lockstep**.

**Nesting is recursive.** `column_to_flexbox_cell` / `columnToFlexboxCell` run each cell's `_items`
through `flexify_items()` / `flexifyItems()` (a mutually-recursive pass that flexes every run of ≥2
clean `column` siblings at any depth), so a nested grid becomes a nested flexbox — depth ≥ 2 is mirrored
now, not reverted to `fw-row` (verified to flexbox nesting depth 4 on a nested capture).

**Net:** a clean multi-cell row — nested or not — converts to a flexbox Div (no `fw-row`) on **both**
paths. What is **still** classic `column`/`fw-row`: sections/containers (never flexed), and boxed-card /
floating-card / single-cell rows (`row_flex_safe` fallback — the box lives on the column's inner
wrapper, so relaxing it needs visual verification). A nested-grid cell the extractor didn't split still
decomposes to nested `column`s (PHP) or a `code_block` (JS). Those specific shapes remain a KNOWN GAP.

## Provides

- **Shortcodes:** none — it's an importer toolkit, not builder elements (it *emits* page-builder trees + presets that shortcodes consume).
- **Admin page:** Unyson+ → **Convert**. Tools: Media scanner/importer, Styling Presets importer, Theme-settings importer, Pages importer, Menu importer, one-shot **Convert bundle** (`.zip`), a **header/footer Theme Generator** (child or standalone), and **"Duplicate as landing page"** (a verbatim, non-decomposed mirror import — see engines below). Two conversion methods (URL / file) with auto-detected source adapters + an optional **"Use AI"** fidelity pass and a human-in-the-loop "Review mapping first" editor.
- **Reusable engines (`includes/`, all static):** `FW_Site_Converter_Media`, `_Presets`, `_Theme_Settings`, `_Pages`, `_Menus`, `_Bundle`, `_Theme_Generator`, `_Stitch` (deterministic no-AI section decompose + block recognizers), **`_Mapper`** (block → shortcode / Theme-Settings-preset mapping — the counterpart of the JS `to-pages`), **`_Tailwind`** (Tailwind class → CSS compiler **and** class → design-token translation: arbitrary `[…]` values, the full default colour palette, `shadow-*`), **`_Blocks`** (emits WordPress **core-block** markup from the section/block intermediate — the PHP twin of the capture service's `to-blocks.mjs` — so a conversion can output a portable **block-theme** page body; unmapped blocks degrade to a scoped `core/html` block), **`_Landing`** (the **"Duplicate as landing page"** action: imports a verbatim site mirror — capture service `GET /mirror` → `mirror.mjs` — into `uploads/unysonplus/landing/<slug>/` as a single `section → column → code_block` on the no-chrome **Landing Page** template; a frozen, deliberately non-decomposed WebGL-friendly copy), `_Sources` (source adapter registry).
- **Public hooks/filters:** `fw_site_converter_sources` (register a builder adapter). The AI backend + capture service live **outside WordPress** (local `unysonplus-site-capture` service — `/capture`, `/capture-file` (renders an uploaded Stitch `.zip` / HTML through the same engine as a URL), `/ai-convert`).
- **Training harness (`tools/converter-trainer/`):** a token-cheap loop for improving the converter against a corpus of demo sites (AI-generated demo sites / any URL list). `bash train.sh` batch-captures a `sites/*.txt` list (per-slug dirs so the shared capture slug doesn't collide), then runs each capture through `Stitch::html_to_mapping` + `Mapper::build_pages` headlessly and prints a **ranked list of fidelity flags** (`LIGHT_OVERLAY_WASH`, `LOW_CONTRAST_TEXT`, `NO_HERO_BG`, `EMPTY_SEC`, `VERBATIM`, `FEW_SECTIONS`) → `batch/_audit.csv`. After a converter edit, `train.sh <list> --audit-only` re-scores the existing captures in seconds (no browser) so you see whether flags cleared. Content signals read the MAPPING (heading text lives in a block's `text`), background/overlay signals read the BUILT tree. See its `README.md`.
- **Training harness (`tools/converter-trainer/`):** a token-cheap loop for improving the converter against a corpus of demo sites (AI-generated demo sites / any URL list). `capture.mjs` batch-captures a `sites/*.txt` list into per-slug dirs (no slug collision); `audit.php` runs each capture through Stitch+Mapper **headlessly** (no browser) and prints a ranked list of fidelity flags (`LIGHT_OVERLAY_WASH`, `LOW_CONTRAST_TEXT`, `NO_HERO_BG`, `EMPTY_SEC`, `VERBATIM`, …) + a CSV; `train.sh` orchestrates capture+audit, with `--audit-only` for a fast re-score after a converter edit. See its `README.md`. Use it to find WHICH sites regressed/drift before spending time looking at any — content signals come from the mapping, background/overlay from the built tree.

## Notes / gotchas

- **Custom local models (capture service 1.11.68).** `/local-ai/pull` runs every name through
  `normalizeModelRef()` (local-runner library names and URLs, public model-hub GGUF repo references and
  model-hub URLs; anything else → 400). `/local-ai/import` → `importGguf()` goes through the local runner's HTTP
  API, not the CLI (works when the runner's program is not on PATH): sha256 the file, `POST /api/blobs/sha256:…`
  (skipped when `HEAD` says the runner has it), `POST /api/create { model, files }`; progress shares
  `pullStatus()` with `kind: 'import'`. `/local-ai/check` → `checkModel()`: a schema-constrained two-item FAQ
  task graded ready / weak / fail. A one-field task was too easy: a 135M toy model passed it; with the FAQ
  task it grades weak and the recommended 8B model ready. `localAiStatus().custom` = pulled models not on the shortlist.
  The dashboard skips its 8 s redraw while a field in the section has focus (it wiped typing).

- **Hosted sites: the BROWSER talks to the capture service, never PHP (1.10.15).** A hosted server's
  `localhost` is itself, so any `wp_remote_*` to the service only works when WordPress runs on the same
  machine. Block-theme output now fetches `GET /capture?target=block-theme` in the browser and uploads it
  as `fw_sc_block_bundle` (PHP `bundle_file` opt, before the Node / HTTP fallbacks); **Duplicate as landing
  page** fetches `GET /mirror?zip=1` (capture service 1.11.60 — a `minimal-zip` of the mirror folder) and
  uploads `mirror_zip` → `FW_Site_Converter_Landing::from_zip()`. The landing script's `svcUrl()` now reads
  the `#fw-sc-ai-svcurl` field / `fw_sc_capture_service` localStorage (it silently used 8787 before). Still
  server-side (optional, degrade silently on a host): the Mapper's `/ai-animations` and `/ai-preloader-js`.

- **⛔ Button and box STYLES live on their PRESET, never on the shortcode (REQUIRED, both engines).** A converted
  button's / card's look — the resting fill, border, radius, shadow, type, the hover fill / transform / shadow / filter,
  its `::before` / `::after` layers, their hover states and the `@keyframes` they animate with — belongs in the
  **Theme Settings preset's Custom CSS** (`button_colors[].custom_css` / the Box Preset's `custom_css`, `{{SELECTOR}}`-
  scoped), so **every element wearing that preset renders identically on every section and page**, and a later edit of
  the preset changes them all. The shortcode's own Advanced → Custom CSS carries ONLY what is per-instance by nature
  (this button's alignment / width / spacing; a card's own inset), never a copy of the preset's skin. A per-element
  copy is a duplicate in the wrong place, and its `!important` would outrank any later preset edit. Concretely:
  `n_button` / `buttonBlockNode` emit hover CSS on the element only for a button **no colour preset owns** (the
  safety-net path); a preset-owned button takes neither the verbatim hover nor a substituted library fx — the preset
  is the whole hover. The same holds for icon-box / panel skins → Box Presets (`register_box_preset` ↔
  `buildBorderPresets`). Golden `[R]` + `nocturnal-parity.test.mjs` guard it.
- **Who edits the converter (important).** A **site build must never fork the shared converter to fix one page** — close that site's delta with native options / `misc_custom_css` instead. Improving the converter *algorithm* (so a whole class of misses goes away for everyone) is a **contributor** task: it needs the converter repos and the change must be **upstreamed** (and mirrored across the JS URL path + the PHP file path). As a site builder, **record the miss in the conversion report** and, with the site owner's consent, **run `node capture.mjs <url> --share`** — it POSTs the anonymized report to the maintainer's Google Form (already wired in `share-config.json`; inspect first with `--share-preview`) — the report is the intended feedback artifact, not a code fork. **Flag only a *systematic* miss** (one that would recur on other sites — a `code_block` fallback with a clear shortcode fit, an `opportunity`/`styling-drop` row, a wrong mapping); do NOT flag a bespoke widget that's correctly verbatim or a one-off site delta. Send **anonymized structural data only** (source type, `element → got vs. expected`, the report row, `systematic? y/n`) — no raw third-party content. (Same consent-gated artifact as the opt-in `--share` upstream flow. Full criteria: `site-build-protocol.md` → "What a SITE-BUILDER flags".)
- The deterministic no-AI algorithm exists **twice** (PHP here for the file path; JS in the capture-service repo for the URL path) — keep both in sync (see the workspace CLAUDE.md rule).
- **Full detail lives in the extension's own `AGENTS.md`** + `docs/site-conversion-playbook.md` (Theme-Settings-first demo conversion) + `docs/stitch-to-unysonplus.md`. Read those before working on conversion logic.
- **Carried CSS is auto-scoped away from wp-admin (since 2026-08-01) — you no longer have to hand-scope `body`/`html`.** `misc_custom_css` folds into the shared presets stylesheet the page builder also loads in wp-admin (canvas WYSIWYG), so an unscoped global `body`/`html` rule used to repaint the *editor* chrome. `upw_ts_custom_css()` now runs the CSS through **`fw_admin_safe_custom_css()`**, which rewrites top-level `body`→`body:not(.wp-admin)` and `html`→`html:not(:has(.wp-admin))` (leaving `.class`/`#id`/descendant rules untouched so they still skin the canvas; idempotent). This applies to ALL Custom CSS — converter-emitted OR hand-written — so a global rule can't leak into the admin regardless of source. `misc_custom_css` is still a `multi` option (`{ "custom_css": "…" }`, never a raw string).
- Media import is content-hash de-duped; per-shortcode att keys in emitted `pages.json` are exact (`text_block` → `text`, column `width` is top-level) — clone shapes from a real export.
- **CSS completeness invariant — the global `util_css` bucket must carry EVERY page-matching utility (fixed capture-service v1.7.78 / site-converter v1.3.36).** The capture categorizer (`capture-extract.mjs` → `walkRules`) buckets a source sheet's rules into `base` / `util` / `header` / `footer`. The bug: it only promoted **global (`:root`/`body`) and header/footer-scoped** selectors to the global buckets, and fed `util` almost entirely from sheets whose **filename matched `VENDOR_RE`** (`tailwind`, `bootstrap`, …). A Tailwind/JIT source that ships utilities from an **inline `<style>` or a hash-named bundle** (e.g. `index-Cd4aA-AH.css`) is classified as first-party, so its **body-section** utilities (`.py-5`, `.feature-card`, card `.shadow`) fell through to per-section CSS only — and when the raw-chrome mirror theme was generated with an empty per-section merge, **every below-the-header section shipped unstyled** (the `freshpaws` "~10% done" conversion: hero styled, feature grid / CTA / footer bare). The fix promotes every **page-matching, non-global, non-chrome** selector into the global `util` bucket too (gated by `matchesPage()` so only used utilities are carried), making stylesheet-**filename** detection non-load-bearing for completeness. **Rule going forward: a section that renders must carry its full CSS at theme-generation time — never let completeness depend on the source's stylesheet filename or on a later per-section merge.** (The PHP upload path already carries the whole reproduced CSS blob, so it was already complete — but the invariant holds on both sides.)

## CSS Class Mapper & box columns (deterministic decompose — rules to keep)

> **Note on the container node.** The box-owner / grid-mapping rules below are written against the
> classic **`column`** node, which is still the converter's **primary** structural output (see
> "Structural model" above). The **modern target** for a grid cell is a **flexbox Div child with a
> `width` span** — and the PHP path already rewrites a *clean* multi-cell row into that (via
> `column_to_flexbox_cell()`, which carries `border_preset`, `align_self`, content-layout, etc. onto the
> Div). But the rewrite is gated (`row_flex_safe`): a cell that OWNS a box via `inner_class` or is a
> positioned floating-card ancestor is **exactly what disqualifies** the row from flexing, so those box
> cases stay `column`/`fw-row`. Read "column owns the box" below as "the column **or** its equivalent
> flexbox cell owns it" — but the actual output is a `column` whenever a box wrapper is involved.

The deterministic decompose maps a source element's utility classes into ONE clean **semantic class**
(`compile_class_set()` in `class-fw-site-converter-tailwind.php` → `FW_Site_Converter_Mapper::box_style_class()`),
so the converted DOM stays clean instead of carrying raw utilities.

- **Detect a box.** `FW_Site_Converter_Mapper::is_box_class()` / `cs_is_box()` / `read_card_skin()` flag a
  column/card as a *box* when it has a border / shadow / background / rounded — anything that reads as a card
  container.
- **The box is ALWAYS a real Box Preset, never a bare `box` class + Custom CSS.** Register the captured skin
  with **`register_box_preset( $cardBox )`** (keyed by a hash of the normalized skin, so identical cards
  share one preset; emitted in Theme Settings by `Stitch::build_box_presets()`), then point the native option
  at the returned `boxp-<slug>`. Do **not** use `box_preset_slug()` for a freshly captured skin — that only
  matches *pre-existing* theme presets (the box-lookup), so a fresh capture silently degrades to one-off CSS.
  (This bit four card paths — Steps cards, counter grids, stacked cards, nested grids — all switched to
  `register_box_preset` on 2026-08-24; `box_preset_slug` is retired.)
- **Who OWNS the box — decide by DECOMPOSITION COUNT, not by re-sniffing content (the key rule, 2026-08-24):**
  the converter already knows how many shortcodes a card cell becomes, so key the owner off that:
  - Card collapses to **ONE `icon_box`** (icon + title + content, nothing else) → the **icon_box owns it**
    via **`box_style = boxp-<slug>`** (self-contained + portable on export).
  - Card becomes **TWO OR MORE shortcodes** (icon_box + `feature_list` / `button` / …, e.g. a "Loan Types"
    card with a nested list) → the **column owns it** via **`border_preset = boxp-<slug>`** on the inner
    wrapper (`column atts['border_preset']`), so the box wraps EVERY child.
  - **N boxed icon_boxes in one column** → **each icon_box owns its own** `box_style` (the column boxes
    nothing — it would wrap them all).
  This is the content-type rule (list/button → column) expressed structurally: a card is 2+ shortcodes
  *because* it holds content the icon_box can't represent. Rationale logged in Design Decisions
  ("box-preset owner by decomposition count").
- **Fallback (only when no preset can be registered — a trivial/empty skin).** The compiled `.box` class
  rule is GLOBAL (not under `.sc-tw`), so the Tailwind preflight doesn't reach it: when there's a
  `border-width`, also emit `border-style:solid` and `box-sizing:border-box` — otherwise the border renders
  as `0px none`. De-dup by declaration set — identical cards share ONE `.box` class (`.box`, `.box-2`, …).
- **Inline buttons / inline cells (side-by-side).** A page-builder COLUMN is
  `display:flex;flex-direction:column`, so two buttons in a column STACK. Lay them side-by-side with the
  column's **native `content_direction: 'row'` + `content_gap`** option — NOT a `.btn-row` CSS wrapper
  (removed 2026-07-31), and NOT per-button `alignment` (that wraps each button in its own block
  `.sc-btn-align` div and stacks them). This is the general rule for ANY inline cell: a source cell that is
  a flex-**row** container is replayed via `content_direction:row` + `content_gap` (nearest Gap-Scale slug:
  4px→1, 8px→2, 16px→3, 24px→4, 48px→5), with `content_order:reverse` for `row-reverse`. Both a CTA
  button-group (JS `to-pages` cell loop / PHP `Mapper::group_buttons` + the cell-column case) and any
  captured flex-row cell (JS `capture-extract` `cell.flex` / PHP `grid_cols` reading `data-sc-cs`) go
  through this. `content_h`/`content_v` are left to the existing heuristics (direction-dependent semantics).
- **Open question (don't action without asking):** whether to add a native *button* option to the
  `icon_box` shortcode (so a card+CTA stays one element) vs. the current icon_box + button + Inner-Wrapper
  approach. The wrapper approach needs no schema/doc/screenshot changes, so it's the default for now.

- **Card WITH a nested feature list → don't flatten it (2026-08-24).** A card cell whose body is
  icon + heading + description **followed by a grid/flex of icon+text rows** (e.g. a converted source's "Loan Types
  Available" card) must NOT collapse into one `icon_box` — that drops the list. `grid_cols()` detects the
  nested list (`cell_wraps_icon_text_list`) and decomposes the cell into an `icon_box` HEADER block +
  a native `feature_list` block; `build_cell_items()` renders both. The card's box then lands on the
  **column** (2+ shortcodes → column owns it, per the box-owner rule above).
- **Inline link strip → ONE centered `text_block` (2026-08-24).** A flex row whose children are all short
  inline `<a>` links + `<=3`-char separators (`•`/`|`/`/`), e.g. a footer policy-links line, is claimed by
  the `inline_links` recognizer (priority 93, above `card_grid`) as a single centered text_block with the
  anchors (href + text) and separators preserved — instead of a `card_grid`/`layout_row` splitting each link
  into its own 1/1-column text_block (which dropped the separators + inline flow).
- **Feature list — carry source label size + icon↔text gap (2026-08-24).** `n_feature_list` maps the label
  span's font-size to `font_size_preset`; when no theme text preset is within ±1.5px (a 14px `text-sm` label
  falls between the 12px Caption and 16px Small presets), it pins the exact size via scoped
  `selector .fw-fl__text{font-size:Npx}`. The per-item icon↔label gap (`gap-2`) rides as
  `selector .fw-fl__item{gap:Npx}` when it differs from the skin default.
- **Testimonials footer stat → the `extra` field (2026-08-24).** A testimonial card's bordered footer stat
  (a muted label + emphasized value, e.g. "Total savings" → "$14,200") maps to the shortcode's repeatable
  **Extra Texts** `{label,value}` field (`testimonial_extra()` — two leaf texts, else split a single
  "Label $Figure" run), and `n_testimonials` pins Card Rows with the `extra` slot — instead of cramming the
  stat into the author role line. JS `capture-extract` `testimonialItem` + `to-pages` `testimonialsNode`.
- **Heading-group → ONE `special_heading` with NATIVE options (2026-07-31).** A wrapper `[pill?, h, p]`
  collapses to a single `special_heading`, and its Tailwind layout/spacing classes are **translated to
  native options, not left as dead classes**: `text-center`→`alignment`, `space-y-N`→`element_spacing`,
  `max-w-{scale}`→`block_max_width`, `mb-N`→`spacing.margin.bottom` as a **scale-slug utility class**
  (`mb-16`→`mb-7`=4rem — a raw `4rem` would land as a dead class), and an arbitrary accent
  `text-[#hex]`→inline color. JS `to-pages` `headingNode` + PHP `Mapper::heading_layout`/`n_heading`.
- **Section band → native section options (2026-08-01).** A section's computed background + padding →
  `bg_color` / `padding_top` / `padding_bottom` (px→spacing-scale slug), and its computed **margin** is
  folded into the padding — a section that separates itself with `mt-24`/`mb-16` has no margin lever in
  the section shortcode, so the margin becomes `padding_*` (the "no padding" miss). JS `to-pages`
  `sectionLayout` + capture-extract `sectionComputed` (now captures `margin`) / PHP `Mapper::n_section`.
- **Section bands → `section_style_presets` (2026-07-25).** On top of the per-section native mapping above,
  the converter now distills the page's **distinctive** bands into reusable Section Style presets: it scans
  every section's skin (background + text/heading colour + border/radius/shadow from `diag`), **skips plain
  bands** (they're the theme default), **clusters** near-identical bands into one preset, carries a
  text/heading colour only when it **differs from the page base** (or the band is dark), and names by
  luminance (Alt / Light / Dark). Emits the `section_style_presets` key (shape =
  `unysonplus_default_section_style_presets()`); the importer writes it via the preset-store seam, so it
  surfaces under Components → Section Styles. JS `to-presets.mjs` `sectionStyles()` (+ `to-presets.test.mjs`
  fixture) / PHP `Stitch::build_section_style_presets()`. Per-section PADDING stays a native option, so the
  preset leaves padding empty. **Note the importer store fix (2026-07-25):** the preset engine reads the
  theme-scoped store post-migration, so the importer now writes via `unysonplus_preset_store_set()` (was
  writing to the legacy extension store → imported presets were invisible on migrated sites). The whitelist
  also gained `section_style_presets`, `image_styles`, `background_patterns`.
- **Overline detail → native options (2026-08-01).** Beyond pill + color, the converter maps the overline's
  **case** (`overline_uppercase` = yes when the source is `text-transform:uppercase` OR its text is literally
  all-caps, else no — a normal-case overline is NOT force-uppercased) and a leading/trailing overline
  **`<svg>` icon** → the native `overline_icon` (inline-svg, kept OUT of the text, with `overline_icon_position`).
  JS `to-pages` `headingNode` + capture-extract (overline `textTransform`/`iconSvg`) / PHP `Mapper::n_heading`.
- **Product-card grid → `wc_products` (2026-07-31; rows 2026-08-01; GATED 2026-08-21).** A grid whose cells
  are product cards (an `<img>` + a price token / a `.product`/`type-product` card, ≥60% of cells) maps to ONE
  `wc_products` placeholder grid — not N static `icon_box`es — emitting the **`card_rows`** designer (default
  four rows; empty slots/rows collapse) so the converted grid reproduces a modern card. (`wc_products` is
  **rows-only** since 2026-08-01 — the old `card_layout` Classic/Slot att was removed.) JS `to-pages`
  (`cellIsProduct`/`wcProductsNode`) + PHP `Mapper::cell_is_product`/`n_wc_products`.
  - **Gated (2026-08-21) by the "Map to WooCommerce" convert option** so a non-store site never ships an
    unrenderable `[wc_products]`. The option (Convert panel checkbox) is `disabled` unless WooCommerce is
    active; the build reads it as `map_woocommerce` and threads it to `Mapper::set_map_woocommerce()`. The
    mapping fires only when **all three** agree: the option is on, WooCommerce is active, AND the source scans
    as a store (`FW_Site_Converter_Sources::is_woocommerce_source()` — scores `woocommerce`/price/add-to-cart/
    `data-product_id`/WC-Blocks/`Product` JSON-LD/store URLs). Otherwise the product grid degrades to the
    normal static `image_box` cards. Design rationale logged at `/decisions/woocommerce-conversion-detect-and-gate`.
  - **Routing fix (2026-08-21):** when the option is on, `is_image_grid` DEFERS a product grid
    (`grid_is_product_grid`) so it reaches the `card_grid → columns → wc_products` path instead of becoming a
    gallery of static tiles. `cell_is_product` also recognises a DECOMPOSED product card (the parser drops the
    raw price span but the `.product` class + image survive) — the live `[wc_products]` feed supplies real prices.
- **Email-signup form → `newsletter` (2026-08-21).** A `<form>` with a text/email input (excluding login /
  search forms) maps to the native `newsletter` shortcode instead of losing the input + degrading the submit
  button to a text block. Maps the email (+ optional name) placeholder, submit label, alignment, field
  roundness, and the submit button's real bg/text colours (the view hard-codes white button text, so a light
  source button is re-asserted via scoped CSS). The section heading/copy stay as their own `special_heading`
  above it. PHP recognizer `is_newsletter_form`/`newsletter_build` + `Mapper::n_newsletter`; JS `to-pages`
  `newsletterNode` parity.
- **Icon-box icon detail → native (2026-08-01).** A feature/icon card maps its icon's rendered **color**
  → `icon_color` and its filled **chip** (e.g. `bg-pink-100 rounded-lg`) → `icon_badge` (shape from the
  chip's border-radius: full→`solid-circle`, rounded→`solid-rounded`, none→`solid-square`) +
  `icon_badge_color` (the chip fill) — so a converted feature card keeps its coloured icon badge instead
  of a plain glyph. JS `capture-extract` (icon `iconColor`/`iconBadge`/`iconBadgeColor`) + `to-pages`
  `iconBoxNode` / PHP `Mapper::n_icon_box` (resolves the chip class via the Tailwind compiler).
- **Component presets fully derived — Box / Text / Image / Background Patterns + Table preteach (2026-08-02).**
  On top of the section-styles + buttons + colours already derived, the converter now distils the source into
  the remaining Theme Settings → Components presets. All use the same DOM→Tailwind-compile→cluster pattern as
  `build_button_presets`/`build_section_style_presets`, and land through the preset-store seam via the
  already-whitelisted keys (`border_presets`, `font_sizes`, `image_styles`, `background_patterns`):
  - **Box Presets** (`border_presets`) — `Stitch::build_box_presets()` (PHP) / `box-presets.mjs`
    `buildBorderPresets()` (JS, fed by a browser **box census** over every element) reads each box's
    **COMPUTED skin** (not just Tailwind) — **FILL** + border + corner radius + shadow + **backdrop-filter**,
    plus the **hover** state (bg / border / shadow / lift / scale — nothing dropped). Fill is in the cluster
    key so red vs green tint cards stay distinct; ALL kinds are kept (glass panels, tinted cards, chips,
    pills — not just icon-box cards), up to 12, **on top of** the 4 defaults. Each element then **references**
    its preset — a column via `border_preset` (renders on the inner wrapper → the gutter spaces a row of
    boxes), an icon_box via `box_style` — instead of one-off CSS. A **local-AI naming pass** renames the
    generic Card/Tinted/Glass into role names (Feature Card / Glass Stat Box / Problem Card), then the slug
    map is recomputed so references stay valid. All of it is explicit in Live progress (detect → name →
    assign). Applied via the card/column Box Style / Border Preset picker (`boxp-{slug}`).
  - **Text Styles** (`font_sizes`) — `Stitch::build_text_styles()` reads h1–h6 for the **display size scale**
    (largest rendered size per level across breakpoints + line-heights → `Display 1..N`, class `display-N`)
    and the **Eyebrow/overline** (uppercase + tracking → `.font-eyebrow`).
  - **Image Styles** (`image_styles`) — `Stitch::build_image_styles()` reads each `<img>` (+ its wrapper) for
    corner radius / circle, aspect-ratio and colour filter; clusters; appends to the `.imgs-*` library.
  - **Background Patterns** (`background_patterns`) — JS `to-presets.mjs` `backgroundPatterns()` turns the
    captured per-section decorative backgrounds (`findPattern`: SVG data-URIs + repeating gradients) into
    pattern presets; emitted only when the source has one (else the 12 default patterns stand). A section's
    backdrop is usually a `::before`/`::after` overlay (a faint diagonal-stripe `repeating-linear-gradient`) —
    `getComputedStyle(el)`, and so the PHP stitch reading rendered.html, can't see a pseudo. **The capture now
    STAMPS it as `data-sc-pattern` (+ `data-sc-pattern-opacity`) onto the hosting section block** (`capture.mjs`,
    mirroring the `data-sc-hover` button-pseudo harvest), so BOTH paths apply it: PHP `detect_section_pattern`
    reads `data-sc-pattern` first, `apply_section_pattern` registers the preset (`pattern_preset_entry` → a
    `.pat-<id>` layer painting the gradient) and sets the section's Background Pattern option. A gradient carries
    commas, so it MUST ride the preset (never `selector{…}` custom_css, which silently voids on a comma).
  - **Icon Badge Presets** (`icon_badge_presets`) — `Stitch::build_icon_badge_presets()` (PHP) /
    `box-presets.mjs` `buildIconBadgePresets()` (JS, fed by each icon_box's harvested `_badge` tile skin)
    clusters the distinct icon-chip designs (shape · fill · radius · border) and appends them to the default
    Circle / Soft Tile / Outline Ring library. Applied via the icon_box Icon Badge picker.
  - **Tables (preteach)** — a verbatim `<table>` is wrapped in the default `.tbl-{slug}` Table Preset skin
    (whose CSS targets `> table > thead/tbody…`), so a raw source table renders styled without fragile
    per-site table derivation. PHP `Mapper::n_code` + JS `to-pages` `codeBlock`. **A table has no separate
    preset detector — its FRAME (border/radius/fill) reuses the Box Presets**; the converter only needs to
    detect the `<table>` element (it does, during decompose) and skip cleanly when the source has none.

  **Component-preset DETECTOR status — check every new source for these (REQUIRED when updating detectors):**

  | Preset / component | Detector | Status |
  |---|---|---|
  | Colors · Typography · Text Styles · Spacing | `toThemeSettings` / `build_*` | ✅ built |
  | Section Styles (+ local-AI naming) | `build_section_style_presets` / `nameSectionStyles` | ✅ built |
  | Box Presets (fill · hover · all kinds · AI-named · assigned) | `build_box_presets` / `buildBorderPresets` + box census | ✅ built |
  | Button Presets | `build_button_presets` | ✅ built |
  | Image Styles | `build_image_styles` | ✅ built |
  | Background Patterns (SVG data-URIs + repeating gradients) | JS `to-presets.mjs` `backgroundPatterns()` (`findPattern`); PHP reads the capture's `data-sc-pattern` stamp | ✅ built (both paths — the capture stamps the section's `::before` pattern as `data-sc-pattern` so the PHP stitch sees it too) |
  | Icon Badge Presets | `build_icon_badge_presets` / `buildIconBadgePresets` | ✅ built |
  | Tables | reuse Box Presets on the frame; detect `<table>` in decompose | ✅ (no separate preset) |
  | Background Patterns — APPLIED to their section | `detect_section_pattern` → `apply_section_pattern` (PHP) / `to-pages` overlay (JS) | ✅ built (inline-CSS overlay; `url(data:…)` unquoted so it survives the style attr) |
  | Shape Dividers (wave / tilt / curve / triangle SVG at a section's top/bottom edge) | `detect_section_divider` → `apply_section_divider` (PHP) / `findDivider` → `to-pages` (JS) → native `divider_top`/`divider_bottom` | ✅ built — classifies the path silhouette by curve-command count (≥3 C→wave, 1–2→curve, lines→triangle/tilt), reads height/color/flip/placement. **Verified on a synthetic fixture** (all 4 shapes classify; end-to-end sets the option). Real-world robustness still wants a source that uses dividers. |

  **Shape Dividers — IMPLEMENTED (verified on a synthetic fixture; wants a real source to harden).** For the
  record, here is how it works / how to extend it. A shape divider is an inline
  `<svg>` (or a `background-image` SVG) pinned to a section's TOP or BOTTOM edge (`position:absolute; bottom:0`
  / `top:0`, full width, a wave/slant/curve `<path>`). The theme already has a **Section Dividers** option
  (top/bottom shape + height + flip + color), so the detector's job is: (1) find a section-edge absolute SVG,
  (2) classify the path shape (wave / tilt / curve / triangle) — a coarse match of the path's silhouette
  against the built-in divider set, (3) read its height + fill + flip, (4) set the section's divider option
  (NOT a preset). Build it in the same DOM-walk pass as the pattern detector. **Needs a source that actually
  uses shape dividers to verify** — the conversion test corpus's closest candidate is a `bg-gradient-to-b`
  overlay, NOT a divider, so it can't
  validate this. Ask the user for a source URL with visible top/bottom section dividers before building.
  - **section-styles bug fix** — `sectionStyles()` read the always-empty `background` shorthand instead of
    `backgroundColor`, so pure colour-fill bands were dropped; fixed (+ `to-presets.test.mjs` fixture).
- **Arbitrary-value SPACING is lossless + registered (2026-08-02).** `to-pages`/`Mapper` `sectionLayout`
  emits a scale slug when the captured px is on the Bootstrap-aligned scale, else an exact Tailwind-style
  **arbitrary** token (`pt-[40px]`) — no ±12px snap. The plugin renders these via per-page dynamic CSS, and
  on import `unysonplus_register_arbitrary_spacing_scale()` (called from `Mapper`/`Pages`) registers each
  arbitrary value as a named Spacing-Scale preset (`[40px]`), so it shows in Components → Spacing and is
  durable in the section dropdown. **We keep the Bootstrap-aligned scale — no renumber** (it stayed
  compatible so pasted Bootstrap markup still works); arbitrary values cover everything off-scale.

### Deterministic global-token + chrome detection rules (2026-08-09)

The converter now derives these GLOBAL design-system tokens + header/footer chrome details straight from the
source's stamped computed styles (`data-sc-cs`) and emits them as native Theme-Settings values — no AI, no
hand-tuning. Each reads the source, decides only on a real signal (else leaves the theme default), and is
graded by the parity report (below). Implemented in `class-fw-site-converter-stitch.php`:

| ID | Detection → emitted setting |
|----|------------------------------|
| **D1** | modal control/card corner radius → `general_layout.layout_roundness` (sharp/subtle/rounded/soft) |
| **D2** | modal border/divider colour → `general_layout.layout_border_color` (`--color-border`, ~21 consumers) |
| **D3** | median `<section>` vertical padding → `general_layout.layout_section_spacing` (compact/cozy/spacious) |
| **D4** | in-text link `text-decoration` → `general_typography.body_link_underline` (always/never) |
| **H3** | nav-item fill/border/underline + padding → `header_menu.menu_item_style` / `menu_item_bg` / `menu_link_padding_x/y` |
| **H4** | dropdown panel bg/link/radius/width/border → `header_menu.menu_dropdown_*` (only when a real submenu exists) |
| **H5** | all-anchor (`#id`) nav → `header_layout.nav_scrollspy:yes` (one-page Scroll Spy) |
| **H6** | mark-only brand (no wordmark/image) → `header_logo` `logo_layout:icon-only` |
| **H11** | header flex row `align-items`/`gap` → `header_layout.header_valign` / `header_element_gap` |
| **G1** | `cs_decls()` synthesises `display:flex` whenever it emits `align-items`/`justify-content`/`gap` (lockup flex bug-guard) |
| **F1** | footer link columns → atomic native footer elements: a **`heading`** element (the column title) + one **`link`** element per row (inline `{label,url}` — no `menu_id`, links can't vanish), not an HTML `<ul>` blob. (Replaced the old compound `links` element, removed 2026-08.) |
| **P1** | `conversion-parity.json` — a pass/fail scorecard grading every emitted global token / chrome vs the re-measured source (`{score, passed, total, checks[]}`) |

**Parity gate (P1).** Every conversion now writes `conversion-parity.json` alongside `theme-settings.json`.
It re-derives each source signal and compares it to what was emitted, so any new detection rule is
automatically graded. Use it as the objective "is the base faithful?" check — a scandi-haven-shop convert
scores 100 (7/7). A check is only counted when the SOURCE carries that signal (a borderless source doesn't
fail the border check).

### The deterministic header audit: rows by geometry, nothing inherited from the last conversion (2026-09-12)

Converting a second source on a test site produced the FIRST source's header shape (a two-row masthead) with the
second source's content — "the converter keeps the last header". The audit found the real causes; every fix is a
measured rule in both engines (golden `[M]` ↔ `header-audit-parity.test.mjs`), and the report is
`site-converter-header-audit.docx`:

- **rows by geometry** — the two-row detector walked the header's children in DOM order, so a classic one-row
  masthead (logo · links · actions as flex siblings) read as a nav row under a brand row and the menu went to the
  Bottom Bar; the capture now stamps each zone's `x:` / `y:` and `header_rows` ↔ `header.rows` require the nav box to
  lie below / above the brand box (no stamps → the container's own layout decides);
- **secondary text links** — a plain "Sign in" sharing a parent with a button-styled CTA → a native `list_item` ahead of
  the CTA in the right zone with its own colour / size / weight + hover (`header_text_links` ↔ `header.textLinks`);
- **menu typography by MODE across visible links** (a hidden drawer's 16px/400 list, or a "Sign in", was the first
  anchor sampled); the odd colour is the active item only as a minority of one among ≥ 3 links;
- **clean colour values** — a utility framework's `rgb(255 255 255 / var(--tw-text-opacity, 1))` (truncated by the
  capture) was stored as-is; in the theme's generated `:root{}` its unbalanced parenthesis swallowed every later token
  (menu colour / size, logo rules) and the nav fell back to the brand primary. `clean_color_value` ↔ `cleanColor`
  strip the var() alpha and rebalance; the theme's `unysonplus_hf_css_val` drops any unbalanced value;
- **a one-page anchor nav is never "current"** — WordPress marks `/#features` items `current-menu-item` on the page they
  point into and the whole nav took the active colour; the theme now strips the current classes from any `#` link;
- **the tagline follows the source on every path** — the admin build imports from a JSON-only temp dir (no
  `rendered.html`), so the tagline stayed from the previous site; the source `<title>` now rides theme-design.json
  (`site_title`) and the importer reads it first;
- **nothing inherited by omission** — the importer replaced only the chrome containers it owns and merged the rest, so a
  key the new source had no signal for (drawer / mobile-bar colours, footer border, scroll accent, …) kept the previous
  conversion's value; `OWNED_KEYS` (47 keys, the union both engines can emit) reset to the theme's DECLARED default when
  a full conversion's payload lacks them.

Verified through the real admin Convert: source A → B → A again each gets its own header (1440px screenshots); the
corpus's genuine two-row header still converts as two rows. `masthead.test.mjs` no longer names any site — its sample
list lives in a gitignored `masthead-sample.local.txt`.

### The nocturnal audit: bento grids, toolbar rows, plain-CSS mirrors, the whole button (2026-09-16)

A plain-CSS (non-utility) dark source converted through the admin Convert; every gap is a general measured rule in both
engines (golden `[R]` ↔ `nocturnal-parity.test.mjs`; 764 / 0 and 67 / 0), verified on the live reconvert:

- **bento grids** — the capture stamps every grid child's desktop `track-frac` + `track-y`; a 12-track grid whose tiles
  span 8 / 4 tracks through a stylesheet class across several visual rows (no per-item class or computed grid-column to
  read) was one row of six 1/12 slivers. `bento_split` ↔ `bentoRowsOf` group the cells by y into rows, each cell keeping
  its measured span on the 12-grid and the tile's measured height as its min-height;
- **toolbar rows** — a flex row of short labels / empty painted dots spread by `justify-content` (a code window's title bar:
  dots · label · LIVE) was flattened into stacked kickers; `is_toolbar_row` keeps it whole and the structural mirror now
  carries a flex container's `justify-content` / `align-items`, a single-side hairline, its computed padding (a plain-CSS
  source has no utility class to compile), a faint tint (alpha ≥ .02 is a fill on a dark page), and empty painted
  dots as inline dots;
- **mirrored leaves** — a `<pre>` / `white-space: pre*` keeps its line breaks while a plain label's source line break is
  collapsed (wpautop rendered it as `<br>`); a short inline label never wraps; a flex-row item drops the theme's paragraph
  margin (the key / value rows sat off their vertical centre); a leaf's own font family rides when it differs from its
  parent's;
- **the intro's padding** — a hero paragraph's `padding-bottom:240px` (the gap before the CTAs) adds to the folded
  subtitle's below gap, in both engines;
- **a header-less source** — the theme reads the per-page `page_header = d-none` select, not the legacy `hide_site_header`
  switch; the page importer maps one onto the other (and resets it on re-import);
- **a flat footer link row** — a `flex gap-14 justify-end` row of pill links stacked vertically in the theme's list; the
  flat-link fallback now records the container's layout + the link's pill skin and emits the list as a horizontal,
  end-justified row of pills (PHP path);
- **styles live on the preset, never the shortcode** — a preset-owned button no longer receives a per-element copy of its hover / pseudo CSS (the Notes / gotchas rule above); the element keeps only what is per-instance (alignment, width, spacing);
- **the whole button** — the capture's hover harvest walks NESTED rules (a utility framework's `@media (hover: hover)`
  inside `@layer`; a headless browser reports no hover-capable pointer, so pointer media queries count as matching)
  and collects the `@keyframes` a pseudo layer animates with; the button presets carry the source's `::before` /
  `::after` layers, the hover state of each, the hover shadow / filter / tracking and the keyframes verbatim (positioned +
  clipped), and a preset-owned button with a captured hover transform takes NO library fx on top (a Lift substitute
  doubled the lift and painted its own shadow over the source's glow).

Not a converter rule: a source that TYPES its copy with JavaScript is captured mid-animation, so the typed text is
whatever had appeared when the capture ran.

### The feed after the tuple + fixture contract: 89 findings, 24 fixtures, first batch (2026-09-17)

The reporting contract works: every one of the 89 findings since the sheet was cleared carries the tuple, 24 arrived with
a sandbox fixture + a general-rule `solution` ("SANDBOX REPRO"). `pull-findings.mjs --fixtures=<dir>` + a harness that runs
each fixture through `build_from_html` (`fx-run.php` in the maintainer scratch) gives a fixed / open table in minutes.
Fixed as rules this pass: the container gutter measured without a stamp and only from container-sized boxes, subtracted
from a measured OUTER width (a fixture-sized page: 1280 → 1232); a folded subtitle keeps its measured case / tracking /
weight / family on `.heading-subtitle` (`subtitle_case_css`); a standalone measured PILL text (`text_is_pill`: pill radius +
side padding + a content-sized placement) hugs its text instead of stretching the pill skin across the band; the fixture
sanitiser keeps the `<html>` site stamps (content width / gutter). Confirmed fixed by earlier rules: the outline button's
translucent fill, the marquee, the `hidden lg:flex` column (the tier fix; the agent's fixture cut the column without its
band, so it cannot prove it). Open, in priority: card grids that fall to `code_block` (feature cards with a rotated icon tile,
program cards, a review card = testimonial with name / role lines, a masonry `columns-3` gallery, creator cards with an
overlay), a 3-up "how it works" grid with 96 px ghost numerals, a bento with `grid-rows-[…]`, product / article grids on a
site without WooCommerce / posts, the body font when the source stack is `ui-sans-serif`.

### The feed's first batch, second pass: content cards, ghost numerals, walls, the system body (2026-09-17)

Six more of the 24 fixtures became rules, each locked in golden `[W]` (944/0), all general:

- **A lone content card decomposes as a panel** (`is_content_card` ignores a transparent ring / an all-zero shadow;
  the content-card branch tries `panel_build` first and takes it when the blocks carry text and no code): an icon
  tile + h3 + p card wearing `border-4 border-transparent` fell to a `code_block`. The card's title keeps its measured
  weight / ink (the theme heading default was reported on three sites).
- **A ghost numeral survives** (`salvage_dropped`: a bare 1–3 digit run set ≥ 40 px is a design element): the 96 px
  `01` of a "how it works" step was dropped as an index.
- **A system body stack never takes the heading's Google face** (`detect_typography` → `body.system`; the design
  config's `$body_system`): with `ui-sans-serif, system-ui` on the body the converter used to hand the body the ONE
  Google face it found (the heading's).
- **A `columns-N` wall is an image grid → the gallery's Masonry design** (`is_image_grid` accepts `columns-[2-6]` /
  a computed `column-count`; `wall_columns` reads the LARGEST breakpoint of `columns-1 md:columns-2 lg:columns-3`, or
  the stamped `column-count` — the first match was the phone tier, a 1-column masonry).
- **Fixtures keep their repeats** (`make-fixture.mjs`): over the cap it prunes every run of same-class siblings to
  its first 3 (innermost first, tightening until the SCRUBBED fixture fits) instead of cutting mid-tag — a one-tile
  fixture reproduces a different construct (the lone image), so its rule can't be locked. The cap is 32 KB (was 8:
  the stamps ARE the fixture — a band with a 3-tile grid runs ~25 KB; a Sheets cell holds 50 KB).
- **The dashboard tab opens once** (`ensure-open.mjs`): a restart on code-version drift (a package bump between two
  CLI captures) re-opened `localhost:4600` on EVERY capture; now only a forced launch or a restart with no tab in the
  last 30 min opens one. Agents scripting the converter run `DASHBOARD_AUTO_OPEN=0 node capture.mjs …` +
  `FW_Site_Converter_Bundle::import_dir()` (AGENTS.md).

Still open from the batch (fixtures on file): the bento with `grid-rows-[…]` + an absolute cover image, creator cards
(image + overlay pills → `code_block`), product / article grids on a site without WooCommerce / posts, the testimonial
name / role lines, the 3-column steps grid on the real page, `image_box` price + button, a widget kept verbatim, the
gradient CTA card, the announcement bar, the floating cart button — and the JS twin's parity for these PHP-only rules.

### The feed, rows 101–167: ten more sites, the recurring misses (2026-09-17)

Sixty-seven new rows (44 with fixtures) from ten sites; the misses that recurred across them became rules, locked in golden
`[X]` (958/0). All general:

- **The outer container wins** (`outer_container_wins`, capture.mjs twin): the stamp is the heaviest centred width by area,
  so a `.container max-w-7xl px-6` (1280) whose bands centre a `max-w-6xl` (1152) block inside it stamped 1152 and the
  Container Width came out 128 px UNDER (the feed's "regression"). When every element measuring the stamp sits inside a
  centred box of a wider width (≤ 1.25×) spanning as many bands, the wider box is the site container.
- **A mobile-first button row** (`group_buttons`): `flex flex-col sm:flex-row` + `w-full sm:w-auto` buttons — the stamp
  (desktop) says row — is a column on phones and a row from md up (`content_direction_resp`); its buttons are not
  full-width. Five sites reported "hero buttons stacked full-width".
- **Image-led product tiles are cards, not a gallery** (`is_image_grid`): a tile whose cell has ≥ 2 in-flow text leaves
  (category, name, price — none of them headings) or a priced leaf is a card; half the tiles → card_grid. Three shops lost
  every name and price to a gallery.
- **A rating is ≥ 3 stars** (`testimonial_rating`): a lone `lucide-star` in a 64 px icon tile made a 3-up service grid a
  testimonials block.
- **The image box carries the card** (`n_image_box`, parity with `n_icon_box`): the body's colour → Content Colour when it
  differs from the card's ink (a `text-muted-foreground` p rendered in the section accent — six sites), the title / body
  measured sizes, the card's lucide icon (`detect_lucide_in` now reads `<svg class="lucide lucide-x">`, the lucide-react
  shape), the link's own skin, a trailing lucide arrow → the arrow style, the body inset (`div.p-8` → `.imgbox__body`), a
  fixed media height (`h-64` → `.imgbox__media{height}`), a filled block anchor → the Button style.
- **Every heading part derives its metrics + ink from its stamp** (`n_heading`): a heading built by `heading_cta` (an h2 +
  p beside a link) lost its subtitle's muted colour and 16 px to the theme defaults (RECURS x5); `heading_of` now also
  takes the kicker span before the h-tag as the overline.
- **A text link is not a padded button** (`n_button` btn-link): no padding in the stamp means none (the capture stamps
  only non-defaults) — padding 0, no border, no underline.
- **`×` and `°` are counter suffixes** (`3.2×` leaked into the label); **an h3+ with its tagged subtitle folds as one
  heading** (both fold loops); **a row marker survives** (`is_row_marker`: a short ordinal leading a flex row beside a
  heading) and **a marker row is a 2-column row** (`is_layout_row`: `span.01 + div(h3 + p)`, `svg + div(h4 + p)`).
- **Never a column**: a `<style>` / `<script>` / `<template>` child (`el_children` skips them — an inline media rule
  rendered as a CSS text block) and an empty absolutely-positioned glow layer (`is_empty_positioned_layer`).
- **A split band's half-width cover image is an image column** (`section_bg_image` path 3: the layer must span ≥ 70 % of
  the band), never the section backdrop.
- **A container holding a `<form>` is not the form** (`is_newsletter_form`): a name / email / message form is a
  `contact_form`, the grid around it keeps its details column, and a form makes a panel (`is_panel` content tags) so the
  white rounded card keeps its skin.
- **The measured pill ink wins** (`overline_pill_skin_css`): `border-primary/20 bg-primary/10 text-primary` compiled the
  label to the ring's 20 % alpha token.

Still open from these rows: the event card's two-line date badge, category tiles with an overlay caption, a card's coloured
96 px header band, the footer split into three bars + `import_dir` not resetting chrome keys absent from a new bundle,
process rows losing their skin, the pricing plan names / thousands, testimonial `card_rows`, the header cart-count badge
read as a CTA, bare testimonial columns given the card skin, the newsletter button width, the hero 45/55 split band, tab
chips' size, the gradient-text sibling span, the stale menu on a slug collision — and the JS twin's parity for the
PHP-only rules above. The faint radial glow layer a hero carried as its first child is no longer a column but is not yet
lifted to the section background either.

### The feed, rows 168–284: twenty sites, the second batch of recurring misses (2026-09-17)

Eighty-four findings (82 fixtures) from twenty sites; the rules, locked in golden `[Y]` (974/0):

- **A black band keeps its fill.** The alpha-0 test `/,\s*0\s*\)$/` also matched `rgb(0, 0, 0)`, so every BLACK section
  (and every black table cell / header fill) rendered transparent — eight sites of the same regex, now rgba-only.
- **Titles assert their case** (`heading_weight_css`): a title whose stamp says text-transform none emits
  `text-transform:none` — a site-wide heading style sampled from an all-caps wordmark re-cased every h2 (three sites).
- **Every form item carries `info`** (`n_contact_form`): the form-builder views read it unguarded and the built page
  printed `Undefined array key "info"` as visible text (three sites); a label ending in `*` is required.
- **The conversion's identity is the FULL source URL** (`purge_previous_conversion`): the manifest `source` (path +
  query), not theme-design's origin — every page of a preview host shared the origin, so the previous page's menu
  stayed on the primary location (16 sightings); the boxed-footer keys joined OWNED_KEYS so they reset too.
- **A count badge is never the header CTA** (`header_actions` + the single-CTA reader): a bag icon's absolute "0"
  became a 'Get Started' button labelled 0 (three sites); cart / bag / account controls are skipped by class.
- **Pill CTAs are buttons** (`is_badge`): an anchor ≥ 40px tall with ≥ 14px text and a real inset, or one in a flex row
  of anchors, is a button whatever its radius — two hero pills became badge ×2.
- **`items-center` on a row at desktop is vertical** (`section_center`): `flex-col lg:flex-row items-center` no longer
  centres a left-aligned hero (the stamp's flex-direction decides).
- **A React FAQ of toggle-only cards is an accordion** (`plain_toggle_items`): ≥ 2 buttons with a chevron / plus svg,
  their closed panels unmounted (no aria) — six Q/A rows fell to code blocks; the answers come from the FAQ JSON-LD when
  the page carries it. The fixture sanitiser now keeps `aria-expanded` / `aria-controls` / `open` / `required`.
- **`animate-scroll-fade-up` is a reveal, not a marquee** (three regexes): `` after `animate-scroll` matched the
  reveal utility and a section's centred heading block became a full-bleed marquee code block (three sites); the
  heading block is a special_heading at its desktop 48px.
- **Testimonial authors** (`author_candidates`, both the grid and the single card): a quote glyph is never the name, an
  initials disc (2–3 uppercase letters in a ≤ 72px rounded box) is the avatar, the heavier / uppercase line is the name
  and the small one the role, `div` lines count — three author defects in a row.
- **`24/7` keeps its `/7`** (a counter suffix, like `×` / `°`); **a stat card** (`card_from_cell`: a display-size number
  leaf ≥ 2× the small heading) takes the number as its title, the heading as its overline, the description as content.
- **A floating card's three lines** (`floating_card_block`): the heaviest / largest line is the title, a small first line
  the overline, the rest content — "15+Years of Excellence" was one concatenated title, a label was the title.
- **The icon box carries its title's measured weight** (`font-weight … !important` — the theme's 700 won on nine sites),
  **its body ink WITH its alpha** (`ink_value`: rgba stays rgba — flattened to the card ink it was never carried, eleven
  sites) and **no icon when the card has none** (a placeholder glyph, five sites). The image box shares the alpha rule.
- **The body font never comes from a display-size `<p>`** (`detect_typography`: paragraphs > 28px are skipped; the
  `<body>` stamp's face wins) — a 48px serif hero line had set the whole site's body.
- **Pricing** (`pricing_table_block`): the plan name from the card's first short line (never "Plan" or the "Most
  Popular" badge), the price with its thousands separator, the period verbatim ("/ per program") or NONE (a ticket
  price was rendered "$15 /mo"), the paragraph between price and features as the subtitle.
- **A container's own padding wins over a stamped gutter that disagrees** (`declared_container_gutter`): a 1400
  `.container px-6` stamped gutter 48 rendered a 1304 rail; measured 24 inside → 1352.
- **A sticky / fixed header, or one holding a nav of ≥ 3 links, is never a hero** (`is_hero_header`): a sticky masthead
  with a serif h1 wordmark under a `min-h-screen` wrapper became page section 1 with its nav duplicated.

Still open: the full-bleed image sibling of the container (80vh band), the bento gallery with `auto-rows` + spans, image
cards whose hover overlay icons were promoted over the photo (page-context), overlay captions over images (image_box
overlay design — four sightings now), the trust strip's intrinsic-width card, the social-proof row, a band after a grid
folded into it, accordion rows' hairlines, the header mobile overlay, stat cards' skin in a 2×2, the product scroller,
the hero's double vertical padding (page-context), the mobile-first card padding — and the JS twin's parity.

### A cinematic dark landing, audited end to end (2026-09-19)

A real-site conversion on `http://localhost/` (a nature-themed preview page: a video hero with a diagonal edge, glass cards,
a 12-track photo wall, a footer signup), captured with the CLI and imported with `import_dir`, then measured section by section
against the source (Playwright + `verifyUrls`). After the pass: every band ≤ 4.3 % pixel drift except the two video-hero bands
(the video frame differs by the second), section heights within a few px, content edge at x 128 everywhere the source has it.
Site Converter 1.9.52, golden `[AC]` (1011/0). The rules, all general:

- **Header.** The wordmark link (`<a href="#">BRAND</a>`, the row's first child ahead of a ≥ 3-link cluster) is the logo and
  never a `list_item` beside the CTA (`header_text_links`). A blur class the page's script toggles (`backdrop-blur-xl` in the
  markup, no `backdrop-filter` in the REST stamp, one in the SCROLLED stamp) is glass on scroll only — `header_glass: no`,
  `scroll_glass: yes` (a 24px frost had sat over the hero's top).
- **Containers.** `declared_container_gutter` reads the container's DESKTOP tier (`px-6 md:px-12` → 48, the base tier is the
  phone's 24; the stamped shorthand wins), so the site container is the content width (1184 + 48), and `cap_content_px` makes
  every measured cap a CONTENT measure (max-width less the box's own equal side padding — `max-w-4xl px-4` → 864); the
  mapper's fallback cap (`set_site_container_width`) subtracts an inside gutter too. A row that IS the band's container
  (`row_is_container_box`: a centred cap ≥ 1000 whose side padding equals the site gutter) keeps its top inset but drops its
  side padding — the container provides it (the hero's copy had sat 48px off the source's edge).
- **Hero band.** The section's own `clip-path` (polygon / inset / ellipse / circle) rides the section. A vertically centred
  viewport band (`column_valign: center` = a flex column) keeps its direct flexboxes at `width:100%` (the centring had shrunk
  the copy | stats row to its content, 1093px). A `<iconify-icon><svg>` hosted BEFORE the label is a leading icon
  (`icon_is_leading` counts the host that holds the glyph). An absolutely positioned wrapper of ≥ 2 icon links
  (`absolute bottom-8 left-12 flex gap-6`, a social strip) is ONE pinned row (`pinned_icon_row` recognizer → a row flexbox with
  the native Position option); a side with a responsive variant (`left-6 md:left-12`) resolves to the computed px
  (`element_position_from`), not the phone tier's class.
- **Badge cards.** A card body's leaf no recognizer claims: a bare `<a>` text link (with a trailing glyph) is a btn-link CTA
  (`body_stack_blocks` fallback → `button_block`), any other leaf its text (the "Secure Spot" links were dropped). A one-line
  chip's title takes the chip's own stamp (9px tracked uppercase — it had drawn as the theme's 24px serif h4; `n_icon_box`
  accepts ≥ 8px and a lone title carries no trailing margin); `floating_card_pos_css` carries the chip's hairline border and
  blur. The composite photo carries its `img_extra_css` (`mix-blend-mode`, a filter).
- **Grids.** The bento X-split needs a spanner markedly TALLER (≥ 1.4×) than the cell that starts inside it — a `mt-6`
  staggered card of the same height is a plain 2×2 (it had become two lopsided stacks). A tile's `col-span` is read at the
  DESKTOP tier (`tile_span`: `col-span-12 md:col-span-8` → 8, up to 12); a many-track mosaic whose spans change by row
  (`grid-cols-12`: 8|4 then 4|8 at `auto-rows-[240px]`) is a METRO on the gcd-reduced tracks (12 / 4 = 3 columns, spans
  2|1 / 1|2, `spanDiv` divides in the mapper) — four tiles had rendered in one row at 10/40/40/10.
- **Footer.** The brand column's status chip (a skinned inline pill with a dot, no link) → a text element whose pill wears the
  measured skin through the misc css (`detect_footer_brand_chip`). A signup column's label is a footer HEADING like its
  siblings (the widget's own title had rendered in the display face); an icon-only submit keeps an arrow (`→`), never an
  invented "Subscribe"; the field / button / description wear the source skin (`footer_newsletter_css` → `.footer .fw-nl__*`);
  a small `<p>` in the column that holds the email field is the signup's copy, never a copyright disclaimer (it had doubled
  into the © bar).

JS twin: the header brand exclusion and icon position already matched; the gallery / footer chip / signup rules are PHP-only
(the JS twin has no image-grid path).

### A glass "liquid" landing, audited end to end (2026-09-19)

A second real-site conversion on `http://localhost/` (an abstract preview page: a fixed round video portal the page scrolls
over, a left-anchored hero intro under a fixed nav, a `grid-cols-12` bento of glass tiles), captured with the CLI, imported
with `import_dir`, measured against the source with Playwright + `verifyUrls`. After the pass: page height 1706 = the
source's; the bento's tiles on the source's exact tracks (920 / 448 / 566 / 802 at x 24 / 968 / 614); hero band 640 = 512 +
128; band drift ≤ 1.4 % outside the video bands; the phone render no longer overflows (main 390 wide). Site Converter
1.9.53, builder 1.3.6, capture service 1.11.30, kit 1.9.51, golden `[AD]` (1029/0), JS tests 72/0. The rules, all general:

- **Bands + chrome.** A `<header>` INSIDE `<main>` that holds the h1 / h2 is the first content band, never the site chrome
  (`is_hero_header` — the hero had been dropped). A FRAMED fixed layer behind the page (`position:fixed; border-radius:50%;
  z-index:-1`, a round video portal) is the site background video (`page_backdrop_layer_of`) with its own geometry —
  `page_backdrop_css` emits top / left, width = height for a 50% radius, the radius, `overflow:hidden`, the video covering
  it — instead of a section video inside the first band.
- **Clearance + gutter.** `<main class="pt-48">` under a 92px fixed nav: #main's own top padding (carried by `main_style`)
  IS the clearance — `heroTopPad` stays 0 when it exceeds the overlay height (the band had gained the nav's 92px again). When
  `main_style` makes #main the container (a max-width + horizontal padding), a band's flexbox with no cap of its own takes
  the FULL width (`$main_is_container` → content_width 100% + `max-width:100% !important`) — the site cap had shaved a
  second 24px gutter. `main_style` now runs BEFORE the bands map so `build_section` sees the flag. A left-anchored root cap
  (`max-w-5xl`, no auto margins) rides as `sectionLeftCap` → a left-aligned content width (`wide`) on the band's flexbox.
- **The 12-track bento.** A run of cells whose desktop spans TILE lines of exactly 12 (8|4 then 5|7) is a native 12-track
  grid (`cells_span_lines` → `display:grid; grid_columns:12`, the cells keep their `fw-span-N` → `grid-column:span N`,
  responsive tiers included, phones collapse to one column) — a wrapping flex row ran one gap short per line. Builder css
  fix that this exposed: `.fw-grid > [class*="fw-span-"]{width:auto}` — a grid child kept its flex-row percentage width
  (66.67% of an 8-track area) and drew a third short of its tracks. The grid's row minimum (`auto-rows-[minmax(320px,auto)]`,
  stamped as `grid-auto-rows` by capture ≥ 1.11.30, read from the utility for older captures) is every cell's minimum
  height when it declares none (`cell_geometry`) — a two-line quote tile sat 96px short of its row. JS twin: `cellsSpanLines`
  (both row paths) + the cell `minH` from `gridAutoRows`.
- **The card's inset, once.** A cell's `pad` and its `cardBox.padding` read the SAME element's padding: the box owns it. The
  responsive tiers ride the card's box class (`pad_on_box` → `selector .sc-cb-x{…}` + its media tiers), the column carries
  no bare padding, the box no `padding:` shorthand; a preset-owned box drops the column pad (`apply_cell_pad`). Golden [X]'s
  form column check was pinning the double and is now the opposite. `split_col_css` is media-aware: a `selector .CLS{}` rule
  inside an `@media{}` moves to the inner wrapper WITH its wrapper (base rules first, media tiers after), an emptied media
  block is dropped — it had left `@media (min-width:768px){}` on the track and every tier painted the desktop inset. The
  scoped-class box gets `height:100%` so it fills a stretched grid track.
- **A distributed column.** A cell (or its ONE full-height in-flow flex-column child — `cell_flex_column_box`, the wrapper's
  height ≥ 90 % of the cell's content box from the stamped `padding` shorthand) laid out `flex-col justify-between` carries
  `vjustify`. Its leading label that is its own flex item ahead of the title's group is set APART (`mark_apart_label`,
  leading `paint` blobs skipped): the mapper flushes it as an overline-only block, never the next title's overline (it had
  sat on the title instead of at the card's top). A flattened `mt-auto` wrapper carries `mtAuto` (+ its own padding-top as
  `mtAutoPad`) → `margin-top:auto !important` (+ the padding) on its first block, never the one-screen computed px; golden
  [hero strip] now expects that. A ROW of decorative bars (`flex gap-4` of `h-1 rounded-full` fills) is ONE verbatim block
  (`is_decorative_bar_row`, inter-tag whitespace stripped so wpautop seeds no `<br>`), and a `decorBar` block is exempt from
  the code builder's content-less drop. A subtitle whose stamp omits its (zero) margin-bottom with no `mb-*` utility takes
  mb-0 (the theme's 18px had leaked under a hero intro whose gap lives on the next block's `mt-14`).
- **Phones.** The TITLE's phone size (`text-7xl md:text-9xl` → the `-sm` stamp's 72px) rides the heading as a
  `max-width:767px` rule on `selector.heading .heading-title` (outranking the desktop size), and `registered_css` emits every
  `@media (max-width:…)` rule LAST — the section styler had keyed the phone rule before its desktop twin, so at equal
  specificity + `!important` the 128px desktop rule won and the one-word line pushed #main (a flex item) past the viewport.
  A LABEL ROW in the structural mirror (≤ 3 short leaves — a kicker and a status dot) sets `responsive_collapse: no` — the
  phone collapse had stretched the 8px dot into a full-width bar.

Known gap, not a converter rule: the source's theme toggle is an EMPTY `<div>` skinned by a `::before` knob and driven by
script (no markup, no stamped pseudo) — nothing to reproduce deterministically; it is absent from the header.

### Two live reports: the site video behind a black body, a logo strip's marks after their names (2026-09-20)

- **The site background video vanished** on a banking-style page (a body-level `position:fixed` video the converter
  correctly makes the theme's site background video). It played (readyState 4) but was invisible: the source's inline
  `html,body{background-color:black}` reached the root as `:root, .sc-tw{…}`, and once BOTH html and body carry a
  background the body's paints on its own box — in the root stacking context that is ABOVE a `z-index:-1` fixed layer.
  Two fixes, both general: `mirror_inline_css` keeps a `:root` / `html` rule at the root for its **custom properties
  only** (a shell rule's `background` / `margin` never reaches the root — the body half still scopes to `.sc-tw`, and
  body shell rules ride `page_shell_css` as `body:not(.wp-admin)`); and the theme (2.6.3) prints the layer at
  `z-index:0` with `.site{position:relative;z-index:1}` lifted above it, so a child theme or custom CSS that sets both
  backgrounds can no longer bury the video. Site Converter 1.9.56, kit 1.9.55, golden `[AE]` (1042/0).
- **A logo strip's marks drew after their names**, the strip in full colour: the structural mirror emitted an element's
  own text runs BEFORE its element children, so `<span class="flex items-center gap-2"><iconify-icon/> Name</span>`
  became label + icon. `mirror_el` now walks child nodes in DOCUMENT order (text runs between elements flush as their
  own text blocks). The row's own effect — `opacity-70 grayscale hover:grayscale-0` — rides as `row_fx_css` (`fx` on the
  row block → the row flexbox's scoped CSS, with the hover restore and the transition) on both the section-row and the
  nested-row paths. Two more misses on the same strip: an EQUAL side inset carried onto a capped flexbox (a flattened
  `px-4` wrapper's `mxAdd` → `ms-[16px] me-[16px]`) is a gutter the cap's `100% − 2·gutter` already keeps — as margins
  it beat the cap's auto centring, so the centred strip sat at the left edge (the content-width push now clears
  symmetric side margins; golden [story] updated); and a text RUN that is a flex-row item (the label beside the icon)
  now wears the element's own type (`mirror_text_decls` → `font-size` / `weight` / `line-height` / `color`) and
  `margin:0` (the theme's `* + p` rhythm had dropped the label 8px under its icon at the body size).
- **The pinned hero strip, exactly.** The `mt-auto pt-24 pb-12` strip of the same hero sat 96px under the CTA (the source:
  152). Three carries: the `text` builder now runs `carry_wrap_margins` (mtAdd / mbAdd / the `mt-auto` push — only the
  heading paths had it); an `mt-auto` block starts its OWN buffered column with `margin-top:auto` (`$mt_auto_col`) and
  `flexify_items` never joins that column into a wrapping flex row (its auto margin had nothing to push against there);
  the section-row builder runs `carry_wrap_margins` on the row too (the strip's `pb-12` → the logo row's `mb-5`). The
  cell path marks a cell whose first block is `mtAuto` the same way. Measured: button bottom 624 / caption 776 on both.
- **A flex-row footer → Auto Width + Distribution.** A footer whose main row is a content-sized flex row
  (`flex justify-between items-center`: brand left, tagline right) maps to the footer builder's own Auto Width +
  Distribution (`footer_flex_distribution`: `between` / `around` / `center` / `start` / `end` from the computed
  `justify-content`; a start-packed row whose cells fill the width stays a fixed split) — a 50 / 50 split had left the
  right-aligned tagline ending mid-row. The main section's inset is the row's measured margin + padding snapped to the
  spacing scale (`main_footer_padding` through Custom Styling: `pt-0 / pb-0` here, `pb-7` under a `mb-16` link grid) —
  the theme's default 1rem each had made a 133px footer 165; the container choice now MERGES into Custom Styling instead
  of replacing it. A plain footer glyph (no tile) drops the header mark's frame entirely (`border:0; padding:0` too — the
  framed mark's hairline drew a square). Site Converter 1.9.57, kit 1.9.56, golden `[AE]` (1046/0).
- **Footer link hover = the NATIVE option; a utility token never shadows it.** The capture measures the hover with a
  real pointer (`data-sc-footer` → `link-hover:<colour>`) and it rides `footer_link_hover_color` (theme
  `--footer-link-hover`). The old `hover:text-<token>` path ALSO emitted `.footer-column .footer-link:hover{color:
  var(--color-<token>)}` — at (0,3,0) it out-ranked the native `.footer a:hover`, and for a token the palette lacks
  (`brand`) the undefined var resolved to the resting colour, so a source's green hover never showed (a real-site
  report). Now: a measured hover → native only, no scoped rule (`footer_stamp_has`); no stamp → the token rule only
  for a token the theme defines, through `palette_var_for_token()` / JS `paletteVarForToken()` (aliases `brand`→
  `primary`, `background`→`bg`, `foreground`→`text`; `emerald-400` → nothing). The logo title hover token takes the
  same resolver. Site Converter 1.9.58, capture 1.11.33, kit 1.9.57, golden footer-link checks (1049/0).

### A lender landing page, 2026-09-21: nine rules from one real-site audit (golden `[AF]`, fixture 4)

A full source-vs-converted audit of a lender landing page (the conversion test corpus; fixture
`tests/fixtures/golden-fixture-4-lender.html`, brand-neutral) — every finding a GENERAL rule:

- **A content-sized cap on a widget is the widget's.** `wrapper_maxw()` now stamps `capW` / `capCenter` onto every
  widget block (a columns row, an accordion, a list, a table, tabs, steps, a timeline, pricing, a gallery,
  testimonials, a logo strip, a panel) — both a claimed element's OWN cap (`grid … max-w-5xl mx-auto`) and a flattened
  wrapper's (`<div class="max-w-3xl mx-auto">` around a FAQ). The mapper's `apply_block_cap()` (inside
  `apply_block_anim` + on the columns band) scopes `max-width … !important` with auto side margins when centred —
  `!important` because the section's content-width rule (`.section--cw-* > .fw-container > *`) and a widget's own base
  margin out-rank a unique-class rule. The recurring "section container width" report: a 2-col grid and a FAQ list had
  run the full 1368px container.
- **Two-column flex rows stacked (builder 1.3.8 + core `css-tokens.php`).** The span-width calc subtracts the ROW's gap,
  but a cell carrying its own `fw-gap-*` (its column gap) redefined the inherited `--fw-flex-gap` on itself, so a
  32px-gap row of 16px-gap cells subtracted 16, overflowed by 16px and wrapped to one column. The row now publishes its
  gap to direct children as **`--fw-parent-gap`** (`.fw-gap-N > *`, md / lg tiers too) and `frontend-grid.css` reads
  `var(--fw-parent-gap, var(--fw-flex-gap, 0px))` — a child-only var a cell's own gap class can never shadow.
- **A nav's dropdown-trigger `<button>` is a nav item.** `find_menu_group()` disqualified any container holding a
  `<button>` (a CTA / the mobile toggle), so a `<nav>` with a "More ▾" trigger (`aria-haspopup`, unfilled, a chevron) lost
  its `gap:32px` and the links rendered 4px apart. `is_menu_trigger_button()` exempts it.
- **A glass card in a bare `relative` wrapper is framed once.** `cell_card_skin()` reads the skin one wrapper down; the
  `skin_below` guard that keeps it off the column only counted `1 === count($cblocks)` — the absolute corner badge
  (a `-top-4 -right-4` chip carried as a positioned code block) made it two, so the wrapper AND the panel wore the glass
  (double frame, washed-out tiles). `block_is_floater()` excludes pinned blocks from that count, and
  `anchor_abs_overlays()` now also marks a two-node FLEXBOX cell `position:relative` (native Position) when it holds
  such a chip, so the badge pins to the card, not the band.
- **A logo strip's caption and measured marks.** `logo_strip_build()` resolves the strip ROW (`logo_strip_row()`: the
  marks' common ancestor) inside a matched wrapper; text siblings ("Trusted by buyers of leading manufacturers") ride as
  their own text blocks (they were dropped); an `<img>` strip's `iconSize` is the image's measured height (`h-8` = 32px,
  not the 48px default); a per-ITEM `opacity-80` dim counts when the strip carries none. JS twin: `logoStripTreatment`.
- **Step cards.** `steps_block()` captures the numeral element's stamp + its DECLARED corner sides (`numCs` / `numPos`:
  `top-4 right-4` → top/right only, never all four computed offsets), the title / body typography (`titleCs`, `titleMb`,
  `textCs`); `detect_steps_design()` adds the badge's size (`markerSize`: width, else height — the stamp drops an
  unremarkable width), the glyph's ink read from the `<svg>`'s first stamped child (`markerText`), and the card's inset +
  shadow on the box skin. `n_steps()` scopes them: `.fw-steps__num-inline` (absolute, 60px, faded), `--st-size`,
  `marker_text_color`, and `selector.fw-steps .fw-steps__item{padding}` at (0,3,0) because the Cards design sheet loads
  after the page CSS. A 60px faded "01" had rendered as a 14px chip beside an invisible white-on-tint icon.
- **Testimonial look.** `testimonial_look()` measures the avatar (`avatarPx`), quote / name / role / footer-stat
  typography (`cs_text_decls`) and the footer row's rhythm; `n_testimonials()` picks the nearest native `avatar_size`
  AND pins the exact px (the view inlines its own width/height), puts the role colour on `author_job_color`, scopes the
  rest, and drops the theme blockquote inset. A `w-12` portrait had drawn 128px.
- **Muted = muted TEXT ink.** The theme's `--color-muted` paints `.text-muted` (captions, meta, a testimonial's role);
  a shadcn `muted` token is the muted SURFACE. The palette picker prefers `muted-foreground` / `on-surface-variant`, and
  replaces a surface-light pick (`is_surface_light`, luminance ≥ .8) with `sample_muted_ink()` — the page's most common
  `text-muted-foreground` / `text-muted` / mid-grey utility colour. The role line had been invisible.
- **A ≥7-column footer keeps the source's tracks.** `footer_track_css()` pins each Auto-Width column to its measured
  grid track (a `col-span-2` brand = 2 tracks + the gap: 318px beside 143px links) and the gap, desktop-only
  (`@media (min-width:783px)`), so a ninth column wraps exactly where the source wraps; flushed into the misc CSS on
  every main-bar path (`flush_footer_track_css`). The theme's even 1.7 : 1 split had drawn the brand 214px.
- **A comparison column's eyebrow keeps its stamp** (`overlineCs` → `overline_cs` → native uppercase / letter-spacing).

Site Converter 1.9.59, builder 1.3.8, capture 1.11.34, kit 1.9.58; golden `[AF]` (1066/0), JS 72/0; render-verified
on `localhost/` (band verify overall drift 7.6%).

### A diner landing page, 2026-09-21: the second real-site refinement of the day (golden `[AG]`, inline)

- **Self-hosted `@font-face` reaches the child theme.** The PHP rebuild (`raw_chrome_split`) reads only inline `<style>`;
  a licensed display face declared in an external stylesheet was invisible, so every heading fell back. `import_dir()`
  now carries the JS capture's `chrome.base_css` @font-face rules (families the PHP design lacks, gstatic ones excluded)
  into `theme_design.raw_chrome.base_css`, and `rehost_fonts()` downloads the file (`fonts/sc-font-N.otf`).
- **The nav's own face → Header → Menu → Menu Font Family** (`detect_menu_styles` tallies `font-family`; set when it is
  not the `<body>` face). **The masthead stamp** (`data-sc-header`) is read off a stamped DESCENDANT when the wrapper
  `<header>` carries none (a ticker bar + a fixed `<nav>`), so `header_layout.min_height` lands. **A Simple image logo
  carries its rendered width** (`image_width` → `simple.width`); the measured height beats the phone `h-16` class.
- **A section-level heading rule never paints a card's heading.** `#sec h3{color … !important}` (an id beats every
  class) had painted a card's red h3 white on its white card: the profile selector is now `h3:not([class*="boxp-"] *)`.
- **Times and ranges are not statistics** (`counter_cell_parse`: `4–10 PM`, `11:30 AM–10 PM`, `9:00 - 17:00`).
  **A panel of ≥2 short text lines decomposes** (`cell_is_decomposable`: an 11-character tile had fallen to the verbatim
  mirror and drew its box twice). **A cell's own `text-center` rides the cell record** (`cell_geometry` → `align`; the
  mapper read only the cell's classes, empty on that path).
- **A feature list's orientation is the MEASURED flex direction** (`flex flex-col sm:flex-row` is a row at 1440), and a
  horizontal list carries its `justify-content` + `column-gap` (`selector.fw-fl--orient-horizontal{…}`).
- **Wrapper margins reach buttons, panels and painted rule bars** (`carry_wrap_margins` in the button / panel / paint
  builders): a card's `p-12` bottom inset (mbAdd on the last block), a `max-w-3xl mx-auto mb-16` card wrapper, a heading
  wrapper's `mb-14` under its rule bar.
- **A full-width banner crop** (`img_own_box`: `w-full h-64 object-cover` → `selector img{width:100%;height:256px;
  object-fit:cover}`) instead of the natural size inset in the card.
- **Gallery captions keep their typography + inset** (`captionCs` / `captionPad` → `.fw-gallery__overlay-text`).

Site Converter 1.9.60, kit 1.9.59; golden `[AG]` (1077/0). JS twins for this batch are still pending (the PHP engine is
what a bundle import runs).

### A home-goods storefront, 2026-09-21: the third real-site audit of the day (golden `[AH]`, inline)

- **The mega-menu extension activation is self-verifying.** `import_dir()` activated `megamenu` through the manager, but
  on the reported install it never persisted, so the imported mega panel rendered as a plain dropdown of blank column
  rows ("the megamenu not working"). After activating, the bundle now checks `fw()->extensions->_get_db_active_extensions(
  'megamenu')` and writes the extension straight into the framework's active-extensions option when it did not land
  (`mega_activation` in the result). A reconvert of the SAME site keeps its existing WP menu — delete the
  `<Site> Header` menu to rebuild it from the new nav tree.
- **A display-size text wordmark is the brand, not a menu item** (`links_in`: a ≥22px, ≤2-word home link is skipped —
  it had become the first item of both the header and footer menus).
- **Image tiles.** A non-native photo aspect (`aspect-[4/5]`) → the NEAREST `image_ratio` choice + the exact
  `aspect-ratio` scoped on `.imgbox__media` ("the WooCommerce images not tall enough"). A corner CHIP pinned on the frame
  ("Featured" / "New": absolute, short, filled) → an `.imgbox__media::before` pseudo-element carrying its fill / ink /
  type / inset (`image.badge`); a hover-revealed pill (`opacity-0`) is never a badge. An `<svg>` inside a `<button>` or an
  absolute overlay is a CONTROL (`is_control_glyph`) — the wishlist heart had become the card's icon. The card's
  eyebrow (category line) → the image_box `subtitle` with its type, and the body size is read from the description,
  not the 11px kicker; a hover-revealed line (`opacity-0`) is neither eyebrow nor body.
- **Photo cards in NESTED rows are image boxes** (the nested-row cell path always built `n_icon_box` — a bento of six
  collection tiles lost every photo). A tile whose title sits INSIDE the frame on an absolute layer (`textOverlay`) →
  the image_box OVERLAY family (reveal `scrim`) with the source gradient on `.imgbox__scrim` and the overlay inset.
- **The hero aspect-box hoist needs a band-wide, single box** (`section_bg_image` 3b): a collection tile's
  `aspect-[16/9]` photo with an overlaid h3 (one of six, 774 of 1440px) had been hoisted as the whole section's
  background.
- **A page container's width is never a content cap** (`stamp_cap`: ≥ 1400px is the section's content width) — the
  `max-w-[1600px]` cap had overridden the theme gutters and a 4-up product row ran edge to edge.
- **An intro row's kicker is the overline ONCE** (`heading_cta_row_build`: the first `<p>` is a subtitle only when it is
  not the kicker and follows the heading), and the row keeps its own `mb-14` (`apply_block_margins`).

Site Converter 1.9.61, kit 1.9.60; golden `[AH]` (1090/0), JS 72/0; render-verified on `localhost/` (mega panel opens
on hover; 4:5 tiles with badges; six overlay tiles; square 6-up gallery).

#### Follow-up (Site Converter 1.9.62, shortcodes 1.15.18–19): image corners come from the SOURCE, never a shortcode default

Two shortcode defaults were drawing 6px corners over a sharp-edged source and could not be removed:

- **Image Box** — `.imgbox__media{border-radius:var(--imgbox-radius)}` defaulted to 6px, and because the Image Style
  preset renders INSIDE that frame a square-cornered preset could never override it. The base is now `--imgbox-radius:0`
  (the preset owns corners; the `card`/`badge` designs still read the variable). No converter change: the mapper carries
  no radius onto image boxes (only onto their badge).
- **Gallery** — the mapper hard-coded `rounded`, and since `rounded` was an UNDECLARED att the builder dropped it on
  render, so every converted grid drew the 6px default. The gallery now declares a **Corners** option (Square / Rounded
  6px / Rounded large 12px, square by default, ignored when an Image Style is set), and Stitch stamps **`tileRadius`**
  (the first tile's measured `border-radius` — the tile, its clipping wrapper, or the img) which `n_gallery` maps to
  `rounded-0` (0) / `rounded` (≤8px) / `rounded-lg` (>8px). Golden `[AI]` (three checks; 1093/0). JS twin: the JS path
  builds no galleries yet (pending with the [AG]/[AH] twins).

#### Follow-up (Site Converter 1.9.63): a hero SCROLL CUE is the native `scroll_indicator`, pinned — and a wrapper's bottom inset lands on the last IN-FLOW block

- **`scroll_cue_of()`** (Stitch recognizer, priority 99): an out-of-flow element anchored to the bottom (`bottom-*` or the
  nearer computed edge) whose content is at most a three-word label plus ONE glyph (svg / icon-font), cue-ish by label
  (scroll / descend / explore / down / more) or by glyph (`chevron-down`, `arrow-down`, `mouse`, `animate-bounce`) → block
  `scroll_cue` (`abs:true`) with the label + its `cs_text_decls`, the glyph markup / lucide id / measured size, the glyph's
  ink (its own `text-white/50` utility first — svgs are never stamped — then the nearest stamped ancestor), the layout
  (label above / glyph above / inline / icon-only), an anchor `#target`, `pinCls`/`pinCs`, the transform and the gap.
- **`n_scroll_cue()`** (mapper builder): `finalize_widget('scroll_indicator', …)` with text / icon / layout / target /
  `icon_size` / `icon_color` / `text_color`; the label's measured type on `selector .sc-scroll-cue__label{…}`, the gap on
  `.sc-scroll-cue`, the native Position option from the pin (`anchor_abs_overlays` makes the section its containing block)
  and `transform:translateX(-50%)` for `-translate-x-1/2`.
- **Flattened wrapper insets skip floaters:** the `mbAdd` a flattened wrapper carries (its `pb-28`) now lands on the last
  in-flow block (`block_is_floater` walk-back), not on a pinned cue at the end of the wrapper — the hero content had sat
  ~70px lower than the source because the 112px inset rode the cue instead of the CTA row.
- Golden `[AJ]` (four checks; 1097/0). JS twin: pending (`scrollCueOf`).

### The shared-report feed's ranked themes, 2026-09-23 (golden `[AK]`, inline)

`aggregate-reports.mjs` over the published feed returned **155 reports · 39 sites · 115 agent findings** (0 fallbacks,
0 opportunities — every failure was a confident-but-wrong map). Re-tested against the build of the day, four themes were
already fixed (the container rail/gutter and the body font-size, an invented icon_box glyph and its body size, sibling
inline leaves running together); the rest became rules:

- **This import owns `primary`** (`FW_Site_Converter_Menus::claim_primary`). A menu's location was inferred from its NAME,
  so a nav called "<Brand> Menu" — or just "<Brand>" — was created and left unassigned while `primary` still carried the
  PREVIOUS conversion's menu. 35 sites in the feed, hand-fixed every time. Naming can't be exhaustive, so the rule is
  structural: when no menu in the import claimed `primary`, the first imported menu that has items and is not a footer menu
  takes it. (`infer_location` also knows "menu" now.)
- **A kicker HEADING over the headline is one heading** (`transform_kicker_headings`): when the first of two adjacent
  headings is ≤ 60 % of the second's computed size — or uppercase / tracked / a different family and smaller — it is the
  overline and the larger one the title, whatever the tag order (`h2` then `h3`). The section loop also learned
  build_cell_items' "a heading following a pending eyebrow is its title" rule, which is what folds the pair.
- **A chip/kicker keeps its gap** (`block_gap_below` → `overline_gap_css`): the measured `margin-bottom` it held below
  itself rides the folded overline as `selector .heading-overline{margin-bottom:…}` (the pill had sat 8px above an h1 the
  source spaced 24–32px away).
- **A third face loads** (`extra_faces`): the named families the page really uses beyond heading/body — ranked by how much
  text wears them, ≥ 2 leaves each, at most two — are appended to the generated Google-Fonts URL (de-duplicated). The
  converter already carried the family onto those nodes; without the stylesheet they fell back to Courier.
- **An `<img>` that pins its own box keeps it** (`media_box_css_el` fallback): `w-full h-[740px] object-cover rounded-2xl`
  with no wrapper class → `height:740px;object-fit:cover` + the measured radius / shadow, instead of `height:auto`.
- **An author block makes a testimonial** (`has_author_block`): a flex ROW holding a round ≤ 80px avatar (an image or a
  1–3 letter monogram disc) beside two short stacked lines whose first is heavier/larger. Requiring the row is what keeps
  service cards and product tiles out. `author_candidates` now also skips a ONE-letter monogram — but only inside the disc,
  so an all-caps role like "CTO" stays a role.
- **A button's preset follows its COMPUTED fill:** an alpha-tinted background (< 0.9) skips the semantic-class shortcut, so
  `bg-primary` and `bg-primary/10` resolve to two presets instead of both taking the solid one.

Site Converter 1.9.65, kit 1.9.64; goldens 1105/0 + 20/0 + chrome parity, JS 73/0; render-verified on `localhost/`
(the reconverted storefront keeps its own nav on `primary`).

**JS twins (capture service 1.11.35)** — `feed-themes-parity.test.mjs` guards them:
`coalesceHeadingGroups` folds a kicker heading into the next heading's overline (size / uppercase / tracking / family
test) and carries its `marginBottom`; `imgSkin` stamps `pinnedH` for an `<img>` that pins its own cropping box and
`mediaImageNode` emits it; `button-match`'s `presetFor` drops the semantic-class shortcut for an alpha-tinted fill;
`testimonialsOf` accepts a card that ends in an author ROW (round ≤ 80px avatar + a heavier line over a lighter one)
and `testimonialItem` never seats a disc monogram as the name.

**The JS path's two missing elements (capture service 1.11.36)** — it now has them:

- **`galleryBlockOf()`** (extractor): ≥ 3 sibling tiles that each hold one image and no real text, on a grid / flex row
  → a `gallery` block with the images, the tiles' measured corner radius, the column count, gap and tile aspect. A tile
  carrying more than a 40-character label is a CARD, not a gallery tile, and keeps its old path.
- **`galleryNode()`** (mapper): the native `gallery` — media source, `design_settings.grid` (columns / gap snapped to the
  shortcode's scale / nearest ratio) and **Corners** from the measured radius (0 → `rounded-0`, ≤ 8px → `rounded`,
  larger → `rounded-lg`), the same thresholds as the PHP `n_gallery`.
- **`scrollCueOf()` / `scrollCueNode()`**: the twin of the PHP scroll cue — label + glyph (library id when the svg is a
  lucide), the label's measured type on `.sc-scroll-cue__label`, the native Position option from the source's placement
  and the `-translate-x-1/2` half-width centring.
- **The fidelity guard learned about galleries.** A media-bearing section with no `row`/`testimonials` block is kept
  VERBATIM so decomposition can't drop its images; a `gallery` block now counts as a clean decomposition too, because the
  photos ARE the block. Without that the native Gallery could never appear on a real page. A hero whose photo is a
  background (the scroll-cue case) still stays verbatim by design — the cue survives inside the mirrored markup.
- End-to-end on a real capture: the JS path now emits `gallery×1` (6 images, `rounded-0`, 6 columns, 1:1) where it used
  to emit one `code_block` for the whole band; fallbacks 4 → 3. Guarded by `feed-themes-parity.test.mjs` (23 checks).

### A boutique storefront, 2026-09-23: the fifth real-site audit (golden `[AL]`, inline)

Source vs converted on `localhost/`: the converted page ran **19 % taller** than the source (5033px against 4245).
Six general rules later it is **within 0.7 %** (4273px), and every band matches structurally:

- **A band header is a ROW** (`is_heading_cta_row` / `heading_cta_row_build`): the heading-side test used
  `getElementsByTagName`, which excludes the element ITSELF, so `<div class="flex justify-between"><h2>…</h2><a>View
  all</a></div>` — the commonest band-header shape there is — counted zero headings, was rejected, and the link folded
  under the heading as its subtitle. Both the gate and the builder now count a child that IS the heading.
- **A photo TILE belongs to its photo** (`image_tile_of`, priority 87, above `panel`): a filled / framed box whose only
  real content is one image (hover overlays ignored) → one `image` block carrying the fill, inset, radius and measured
  height, with the photo contained at its own cap. Claimed as a panel, the tile shipped as an empty coloured box with
  the photo floating beside it.
- **A price is not a statistic** (`counter_cell_parse`): a currency figure written to the cent with no caption and no
  unit ("$11.00") is a price — a product card's `370ml | $11.00` meta row had turned the grid into animated counters.
- **A hover-revealed label is never resting content** (`is_hover_revealed`, shared): the hidden layer is usually the
  WRAPPER (`<div class="absolute inset-0 opacity-0 group-hover:opacity-100"><span>Quick View</span></div>`), so checking
  the leaf alone let it through as the card's permanent eyebrow. The helper walks ancestors.
- **A card's CTA can be a `<button>`** (or a `cursor-pointer` row): generated sources rarely use `<a>` for "Add to cart",
  and the whole row was dropped. A short-labelled button element is the card's button, its trailing glyph its icon.
- **A card's META ROW is body copy**: a `justify-between` row of short leaves after the title becomes the card's text
  (joined with a separator) when it has no other description — the card used to ship with an empty body.
- **A block-flow numbered list is VERTICAL** (`detect_steps_design`): `<div class="mt-8 space-y-6">` has no `flex-col`
  and no grid, so three stacked steps fell through to the horizontal/cards branch — and `step_card_of` took the
  NUMERAL's own round chip as the step card's box, so they rendered as a row of circles. The card must now hold the
  step's content, and a numeral the source sets inline at the item's start (`numInline`) is left-aligned instead of
  pinned to the item's right edge by the element's "big faded number" convention.

Site Converter 1.9.68, kit 1.9.67; goldens 1118/0 + 20/0 + chrome parity, JS 73/0; render-verified on `localhost/`.

#### The header is a ROW MODEL, not a class hunt (golden `[AM]`)

The header detectors asked their questions of Tailwind class NAMES — `text-xs` for "is this a utility bar?",
`flex-col` for "is this the centered design?" — and generated sources answer in arbitrary values (`text-[11px]`) and
block flow. `header_row_model()` now reads the header's **visible desktop rows** and measures each one: its height,
its computed type size, whether it holds the nav (a `<nav>`, or ≥3 links that are not the brand) and whether its brand
sits at the header's horizontal centre (from the capture's `data-sc-zone` box). Everything else derives from it:

- **Top bar:** a first row that is short — smaller MEASURED type than the main row, or its own fill / hairline —
  above the row holding the nav. `text-[11px]` with no fill used to fail the gate and the whole bar was dropped.
- **Centered design:** the brand centred in one row with the nav in another IS `centered`, whatever the rows are laid
  out with (a block-flow header has no `flex-col` to find).
- **Ownership:** `header_topbar_row()` is shared, so a control that rides the bar (ship-to, search, cart) is never ALSO
  a header CTA — each of them used to render a second time as a bordered button beside the nav. A control in a row the
  source hides at desktop (`md:hidden`, or a row whose stamp computes `display:none`) is not a desktop action either.
- **The bar's own groups** are its direct children when the bar itself is the flex row (descending blindly into the
  first child made the LEFT group the container and dropped the rest), it inherits the header's fill and ink when it
  paints none of its own, its brand cell is dropped (the theme's logo renders it), and several controls in one cell are
  kept apart instead of running together ("SearchCart (0)").

#### Footer + list items (same batch)

- A footer `<h3>` that is the BRAND wordmark is not a "lead CTA heading" (`brand_text_of()` + a home-link ancestor
  test): the brand column had taken the lead branch and dropped its logo, its description paragraph and its newsletter.
- A newsletter's title can be a styled `<span>` / `<label>` — small and uppercase or tracked — not only an h-tag or a
  `<p>`; and the BRAND is never the form's title or description.
- A two-leaf item splits by **weight** as well as by size: `font-semibold uppercase` 12px over an 11px line is a title
  over its description (it had run together as "WORLDWIDE SHIPPINGDelivered cold…").
- A testimonial's rating takes the source's measured star ink and size, on the rendered `.ts-card__rating
  .sc-rating__fill` markup — the element's default amber repainted stars a source draws in its page ink.

#### Verify with the TOOLS, not with your eyes (the discipline this batch was missing)

Three artefacts already exist for every capture and answer "how close is it?" without guessing. Use them before
reading any PHP:

- **`verify.mjs` → `verifySections({ sourceUrl, convertedUrl })`** — START HERE (capture 1.11.38). It aligns the two
  pages by SECTION (`<section>` / `<header>` / `<footer>` / `.fw-section`, matched by id then by order) and, inside
  each matched pair, diffs the ELEMENTS: text leaves matched by text, images matched by file name → alt → order
  (the importer sideloads media under its own name). Positions are measured RELATIVE to the section's own top, so a
  section that starts 50px lower does not report every child as moved. Output is a per-section bug list: `missing`,
  `img-missing`, `img-box` (with both boxes), `joined`, `moved` (dx/dy/dw/dh), `img-fit`, `type`, `extra`, plus each
  section's height delta. Hover-only content (a wrapper at `opacity:0`) is skipped on both sides, so a source's
  "Quick View" overlay is not reported as dropped.
- **`verifyChrome({ sourceUrl, convertedUrl, scope })`** — the same element diff for one region (header / footer).
  It matches leaves between the two pages by their TEXT and compares boxes, reporting `missing` / `joined` / `moved` /
  `type` / `extra` with the pixel deltas. This is the one that sees what the eye sees: a band score of 8.4 % said the
  header was fine while its utility links sat on the wrong row, 639px off — `verifyChrome` printed exactly that.
  Run it on `header` and `footer` after every chrome change; a finding IS the bug report.
- **`verifyUrls({ sourceUrl, convertedUrl, bands })`** — per-band pixel drift plus the height delta. It says WHICH
  bands are wrong, so the work is ordered by measured damage — but it can only ever point at a band, never at an
  element: a few small controls in the wrong place are a rounding error in a 1440×425 band.
  Over HTTP: `POST /verify {source_url, converted_url, width?, bands?, lens?}` — `lens` `bands` (default, this answer),
  `sections` (`verifySections`) or `both` (`{ok, lens, bands, sections}`, service 1.11.78+; the AI Assistant's `visual_check`).
- **`conversion-parity.json`** (written by the capture) — a scored checklist: container width, border colour,
  roundness, section count, header/footer presence, never-drop classes. A failing row is a converter bug with a number.
- **`conversion-drops.json` / `capture-residue.csv` / `class-coverage.json`** — what the converter itself knows it
  dropped, and which source properties never made it across.

Then measure the specific elements in the browser (Playwright: box, font-size, letter-spacing, x-centre) rather than
comparing screenshots by eye. Every header rule below came from a measurement that contradicted what the screenshots
seemed to say.

#### The header, continued (golden `[AM]`, Site Converter 1.9.69)

- **A row that carries the BRAND is the masthead, never the top bar.** Mapped as a top bar it split one source row
  (utility · wordmark · utility) into two converted rows. The masthead's own groups now ride `header_main`'s three
  zones — left group, centred logo, right group — rendered through the same cell builder the top bar uses.
- **A two-row masthead is recognised when the brand is a TEXT link.** `header_rows()`'s brand test wanted an `<img>`,
  a logo class or a stamped svg; a styled `<a href="/">Brand</a>` matched none, so the nav row never reached the
  theme's Bottom Bar and was pushed into the main row's end column.
- **A menu row is not a row of buttons.** `cs_is_button()` is satisfied by the mere presence of `background-color:` in
  the stamp (the capture writes it on nearly everything), so every plain nav link read as a button and the row failed
  the links-only test. A link counts as a button only when it PAINTS: a non-transparent fill, a real border width, or
  a radius. The same test now separates header CTAs from plain text controls.
- **A two-line wordmark is split by measurement.** `detect_logo()` matched a leaf whose text equals the glued lockup
  text — which no leaf does — so the whole lockup took the `<a>` wrapper's type (11px sans instead of the source's
  24px tracked serif) and the sub-line ran into the title. The largest text leaf is the wordmark, the smaller one the
  tagline, and the tagline's own size / tracking / family / colour ride `.site-logo__sub`.

Measured after: the converted header is two rows like the source (masthead + bottom-bar nav), the wordmark renders
24px Cormorant at 5.28px tracking and the sub-line 9px at 2.7px — both exactly the source's values.

#### …and what the band score still could not see (Site Converter 1.9.70)

`verifyChrome` on the same header returned eleven findings the band score had hidden:

- **A three-zone masthead keeps CLASSIC**, not `centered`. The centered design lays the main row out as a COLUMN, so
  a `utility · wordmark · utility` row had its side groups stacked above and below the wordmark (measured: left group
  27px above the brand, right group 47px below). `centered` is for a logo ABOVE a nav with no side zones.
- **Each control in a masthead group is its own element** (a `list_item` carrying its link), not one flattened HTML
  string: "Search" and "Cart (0)" had become a single run-on node that could neither align nor space like the source.
  A control's own leaves are joined with a single space, so "Ship to:" + "USA" reads "Ship to: USA".
- **The menu links' own horizontal padding is carried.** The theme insets every link; a source spacing its nav with
  `gap-10` sets none, so every converted item measured 32px wider and the menu ran 160px wide.

Measured after: findings 11 → 6, every nav item and both utility groups within tolerance on the correct row.

#### A photo TILE on a card (Site Converter 1.9.71 — found by `verifySections`)

`verifySections` compared the product grid element by element and printed the defect as numbers: the source's jar
renders **199×290** (portrait, contained in its cream tile), the conversion **302×227** (landscape, cropped). The
band score had called that band "17.1 % drift" and the eye called it "the jar looks a bit zoomed".

The card's photo frame was only recognised when the source declared an `h-*` class or the image was `h-full`. A
PAINTED frame (`bg-[#F2EDE6] p-8 flex items-center justify-center`) whose height simply measures 354px is a media
frame too, and an `object-contain` / `max-h-[…]` photo sits INSIDE it at its own size. `card_from_cell` now carries
`frameHeight` / `frameBg` / `framePad` / `imgMaxH` for that case and `n_image_box` emits the frame (fill, inset,
height, centred) plus a contained image capped at its measured height. Measured after: the four product images fall
within tolerance and the section's height delta goes −100px → +28px.
Known remaining on this source: the two-row header (a utility top bar over a centred wordmark) collapses to one row and
its utility links render as bordered buttons; the hero's round seal badge and vertical SCROLL rail are dropped; the video's
play overlay renders beside the frame rather than centred on it and its caption is dropped; testimonial stars take the
theme's amber rather than the source's ink; a CTA band's icon + title + description items run together; the footer's brand
description and newsletter label are dropped and its social links move into the brand column. JS twins pending.

### The feed, 2026-09-19: a glass "liquid" page's twelve findings (six fixtures) → rules (2026-09-19)

One conversion reported 11 findings this morning (10 systematic, 6 with a sandbox fixture + a general solution). Three
were already closed by the liquid audit above (the left-anchored `max-w-*` section, the doubled gutter inside `#main`'s
container, the fixed video layer as the site backdrop). The rest became rules — all general, locked in golden `[AE]`
(1040/0) on `tests/fixtures/golden-fixture-3-glass.html` (the six fixtures joined, neutral), each render-verified on
localhost (Playwright measurements of the imported page). Site Converter 1.9.54, capture service 1.11.31, kit 1.9.52.

- **The video anchor, refined.** An OFFSET unframed fixed layer (three or four stamped offsets, at least two non-zero, no
  width) keeps ITS box: `page_backdrop_css` emits the offsets + `width/height:auto` (the theme's inline 100vw × 100vh
  yields), the layer's `filter` (a drop-shadow glow), its running `animation` with the `@keyframes` verbatim (a `data-sc-anim`
  without a scroll timeline), and the video's own resting transform. It had been normalised to `inset:0`.
- **Page-level decor layers.** An empty, painted, absolutely / fixed positioned child of `<main>` / `<body>` (a 180vw blurred
  radial glow, blend screen, z-index −1) → `page_decor_layers_css`: up to two, as `main.site-main::before` / `::after` with the
  full `decor_layer_block` css (misc css), never a band. `is_decor_layer` now reads the computed position too (a plain-CSS
  `.optical-flare{position:absolute}` has no `absolute` utility), and a `<main>` holding nothing but such layers claims no
  band. A band whose blocks are ALL decor layers gets zero padding (`pt-[0px]` / `pb-[0px]`, no theme inset around a blur).
- **`decor_layer_block` carries the whole box.** `mix-blend-mode`; the transform from the utility first (`-translate-x-1/2`
  → `translateX(-50%)`, `rotate-N`), else a non-identity 2-D matrix; percent size utilities (`w-[200%]`, `h-full`) over the
  stamp's one-screen px; a fraction offset (`left-1/2` → 50 %); both horizontal offsets when there is no width at all
  (`left:-576px; right:-576px`). A `w-[200%] h-[200%] left-1/2 -translate-x-1/2` overlay had collapsed to 0 × auto.
- **A translucent tint IS a fill.** `color_to_hex`'s alpha gate (and `rgba_quad`'s, and the JS `to-theme-settings` twin's) is
  ZERO only — `oklch(… / 0.02)` on a frosted panel or button had rounded to "no colour", so the glass drew clear.
- **The box's long tail, on both paths.** `box_extra_css` adds a resting 2-D `transform` (a `-skew-x-3` panel; the identity
  and a mid-animation matrix3d are skipped) and a content-hugging width for `w-max` / `w-fit` / a bare `inline-block`
  (`width:max-content; max-width:100%`). The scoped-class (glass) card box now appends `cardBox.extra` (clip-path, an accent
  `border-left`, a mask) and `overflow:hidden` when the source clips — the preset path had them, this path dropped them
  (the hex panel lost its clip and accent edge).
- **Text effects.** `heading_text_fx_css`: a `text-shadow` glow and a resting skew on the title / subtitle / overline ride
  as scoped rules; a glowing RUN inside a title gets the `sc-glow` class in the stitch scrub and the mapper's
  `extract_glow_css` moves its `text-shadow` into `selector .sc-glow{…}` (kses strips text-shadow inline); `text_block`
  already carried a `skew-x-2` transform.
- **Button presets.** The skin records `clip` (clip-path) and `backdrop` (backdrop-filter); the preset's Custom CSS carries
  them, and the layered-shadow rule accepts an oklch alpha (`/`). `button_preset_for` matches an **oklch / hsl hairline**
  border (the colour regex only knew rgb / hex, so every such button fell to the `sc-btn-*` transplant).
- **Auto-fit tracks.** A `0px` track in a stamped `grid-template-columns` (`584px 584px 0px` = a collapsed auto-fit slot) is
  not a column — `grid_col_count` / `grid_px_tracks` skip it (two cards had a third each). JS twin: measured widths already.
- **`:root` stays at the root.** `mirror_inline_css` never prefixes `:root` / `html` (a `:root{--x}` token block under
  `.sc-tw` left every `var(--x)` consumer outside a wrapper invalid — the page rendered white); `body` still scopes.

JS twin: the alpha gate. The decor-layer block, the page pseudo-layers, the button skin, the heading effects and the inline
CSS scoping are PHP-only paths.

### Open items closed: the strip, the rows, the process, the event card, the split band (2026-09-17)

Golden `[AA]` (994/0, JS twin tests 71/0), each render-verified on localhost (Playwright measurements). Site Converter
1.9.51, capture service 1.11.28.

- **The trust strip.** A skinned `inline-flex` strip of ≥ 3 children is a layout row, not an avatar group (the whole
  card had been claimed as one); an avatar stack that is a MEDIA-only, non-decomposable cell gets its native block before
  the verbatim mirror (`layout_cols` → `avatar_group_build`; it had come out as four code blocks). An UNSTAMPED `<svg
  class="lucide lucide-star">` — the capture keeps only its class and an empty `<path>` — is a LIBRARY icon
  (`lone_icon_block` / the mirror's svg path carry `lucide`; `n_lone_icon` prefers `lucide/<name>` when the inline svg has
  no geometry), sized by its `w-N h-N` / `size-N` utility, inked by the nearest stamped ancestor's colour. Five 20px amber
  stars measured — they drew nothing at the default size.
- **Accordion-style rows.** The row marker may TRAIL the text (`h3 + svg.chevron` in a `justify-between` row); a cell
  that IS an h1–h6 is substantial; the parent wrapper's hairline (`read_edge_skin` / `read_card_skin` of a single-child
  parent) rides the row as its `rowBox`; the lone icon takes the svg's own `w-7 h-7` over the inherited font-size. Five
  125px rows, hairline each, a 28px arrow at the right.
- **Process rows** (`grid [80px_1fr_auto]`, fixture-056): the bento X-split needs ≥ 2 real rows — a CENTRED single
  row (every cell's vertical centre on one line) has staggered tops but no spanner (it had folded the third cell under the
  second). `cells_track_list`: a NARROW track (≤ 120px, beside a track > 240) is a fixed px measure, the wide tracks
  split the rest as fr (`80px 1fr 73.4px` — as an fr the pill shrank and wrapped). A FIXED SMALL BOX cell (`layout_cols`
  `fixedBox`: 20–96px both ways; a `rounded-full` box with no stamped width is as wide as it is tall) → the column's
  inner wrapper takes the box's size and centres the glyph (`carry_cell_geometry` → `.sc-fixbox`); the cell that IS the
  text leaf strips its copy of the skin (two nested pills had wrapped the label) and a one-line leaf (`height` fits one
  leading) is `nowrapText`. The Box Preset's PER-CORNER radius (`20px 20px 0px 0px`) rides the preset CSS in both
  registrars (PHP `reg_rad`, JS `buildBorderPresets`). Measured: disc 52×52, row 1152×127 with the radius, pill 73×33.
- **The event card** (fixture-048, recurring on two sites): a card whose photo carries a floating badge
  (`card_photo_badge`) is not a card grid's image box — the cell decomposes in `grid_cols`: the photo composite
  (`image_composite_decompose`) in a RELATIVE frame stack at the frame's height (`rel` / `frameH`, the media image covering
  it), then the body's leaves through `body_stack_blocks` (a flex ROW child of ≥ 2 blocks stays a content-sized row with
  its justify — the `time | link` line) in a padded stack (`pad`, `grow` = `flex-grow justify-between`).
  `floating_card_block`: a `flex-col` chip is the `top-title` layout, centred when `items-center`; `floating_card_pos_css`
  carries `min-width` and the stack's own gap (none → `.icon-box__inner{gap:0}`). `n_icon_box` reads the title's size,
  a `leading-none` line-height and margin from its stamp when the card carries none, and an overline with NO stamped
  margin takes the title's `mt-*` as its gap (not the theme's 8px). `is_heading_cta_row` never claims a flex COLUMN
  (a `flex-col justify-between` body had built null and vanished). A salvaged `<a>` text leaf keeps its link
  (`leaf_text_html`) and its own ink / decoration (`linkCs` = its stamp → `selector a{color !important}`; no stamped
  underline = none). An ACCENT EDGE (`border-2 border-t-[accent]`): the sides whose colour differs from the top's ride
  the preset CSS with `!important` (`box_extra_css` / JS `boxExtraOf`; the extra whitelist admits `!`). Measured: badge
  64×50 pinned bottom-left over a 391×224 photo, month over day, the body's chip / title / copy / time / indigo link,
  the red top edge only.
- **The split band** (fixture-011): a CSS-painted photo cell (`bg_photo_url`: `bg-cover` + a url, no `<img>`, ≥ 120px)
  is a substantial cell and a cover media image at its box (`bg_photo_block`; it had vanished as empty). A section that
  IS the grid with tracks spanning the viewport and no padding is full-bleed (`is_fullbleed_split_hero` edge branch; the
  mapper's full-bleed flexbox drops the site gutter). A modern stamp (it carries `display:`) with NO padding declaration
  is a ZERO section padding (the theme's 64px had grown a 600px band to 728). A bottom-only border (`bottom_only_border`)
  is a CTA link's underline, never an outline button (`cs_is_button` / `button_kind`); `button_block` reads
  `justify-center` as centring only in a flex ROW (a column centres vertically — the link had been centred). Measured:
  section 1440×600, photo 720×600 at x 720, the link left at x 96 with its 1px white underline.
- **The hero's double padding** (fixture-024): the overlay-header clearance now reads the hero's INNER container
  padding (the first flexbox child's largest `padding-top` tier) — the nav height is added only when the source's own
  clearance is smaller.

JS twin parity for the pass: `lucide` on lone icons, the fixed px tracks, the per-corner radius, the accent-edge sides.

**The JS twin's structural parity (capture service 1.11.29, `badge-card-parity.test.mjs`, 72/0):** `rowCols` carries
`fixedBox` / `nowrapText` (the leaf's copy of the skin cleared), a CSS-painted photo cell as `cell.image` (`bgPhotoOf` — the
cell filter keeps image / paint cells, so a section that IS the grid with a photo half is a row, not verbatim), and
`cardPhotoBadgeOf` → the relative frame stack (`rel` / `frameH`, `t:'floating_card'` items) + `bodyStackBlocks` (`padPx`,
`grow`); `floatingCardOf` reads its lines like the PHP (heaviest = title, small first = overline with the title's margin as
its gap, `titleExtra` for the title's size / leading, a `flex-col` chip = `top-title` centred, `minWidth`, `innerGap`);
`stepMarker` / `collectCards` never read a number inside an absolute chip as a step (a date badge had made an event grid a
`steps` block). `to-pages`: `stackNode` pad / grow / rel, the fixed-box inner wrapper, `mediaImageNode` bgPhoto, a
`floating_card` block, an image / block-only cell is never dropped as empty. Verified on a live styled page
(`http://localhost/fx/aa-live.html`) — the JS pages.json now holds the same tree the PHP path builds from its capture.

**The mobile drawer header** (feed row 80 of the second pull; golden `[AB]`): a `fixed inset-0 … md:hidden` drawer holding
the same links at 32px is never a header bar — one 84px row of logo | menu | CTA, an empty bottom bar (it had become a
900px bottom bar). Closed by `header_row_hidden` (`*:hidden` classes, `fixed inset-0` / ≥ 500px overlays).

Nothing from the feed is open.

### Open items closed: caption tiles, the bleed picture, the bento, the social-proof row (2026-09-17)

Golden `[Z]` (978/0), each render-verified on localhost (Playwright measurements):

- **A caption tile is the image box's OVERLAY family** (`caption_tile_block` in the image_overlay recognizer and in
  `grid_cols` for a grid of tiles; the mapper's `image_box` builder): one photo + an absolute caption layer (a heading /
  a line / a link) + an optional empty scrim layer → title / text / link over the photo, the SOURCE scrim exactly on the
  design's `.imgbox__scrim` layer (a `bg-black/10` tint, a gradient — the design's own gradient paints at full opacity
  whatever the option says, so it is replaced or hidden), the caption's placement (bottom / centre / top), alignment,
  inset and ink; a hover-only caption (`opacity-0 group-hover`) → the Fade reveal. Four sightings had dropped the
  caption leaves; a grid of tiles is no longer a card grid (the caption landed under the photo).
- **A bleed picture** (`image_wrapper`): a `w-full h-[80vh] overflow-hidden` cover frame carries its height (the vh the
  source wrote, else the px) and cover; a frame that is a direct child of the band beside the container breaks out of
  the content width in its own column (the marquee's full-bleed rule). Measured 1440×720 at x 0, no horizontal
  overflow — it rendered 1024×544 inside the container.
- **A bento keeps its geometry** (`image_grid_build` → `gridGeo` + per-tile `rspan`; the mapper's metro branch): the
  `auto-rows-[300px]` row height (the design's square-row pseudo off), gap 0, each tile's col/row span as scoped
  `nth-child` rules over a reset of the design's pattern. Measured 1280×1200 with 853×600 / 427×300 / 427×600 /
  853×300 tiles — seven equal tiles at natural aspect had made a 3436px band.
- **An avatar stack beside its rating is one row** (`avatar_group_build`): a nowrap row with the source gap and vertical
  centring instead of two stacked block rows.
- Fixture-sanitiser: `aria-expanded` / `aria-controls` / `open` / `required` / `disabled` are kept (a React accordion
  fixture had arrived as toggle-only cards).

Still open: the trust strip's intrinsic-width card, a band after a grid folded into it, accordion rows' hairlines, the
header mobile overlay, stat cards' skin in a 2×2, the product scroller, the hero's double vertical padding and the
mobile-first card padding (both page-context), a full-bleed gallery (the bento sat in the content width) — and the JS
twin's parity for the PHP-only rules.

### A second random corpus page, and the first page's open items (2026-09-17)

The first page's open items closed: the **floating dock** (`detect_floating_dock` — a page-level `position:fixed`,
edge-anchored, ≤ 120 px pill of ≥ 2 icon-only links → ONE fixed-positioned row of icon tiles with the native Position
option, left 50 % + the centring translate, the pill's measured skin; appended to the first section), and the **JS
gutter stamp** (the extraction ran before the stamps existed — `capture.mjs` re-reads `data-sc-content-width` /
`-gutter` / `-gutter-inside` into the data; the gutter fallback read the declared cap's empty bucket). A second page
(a SaaS landing: video hero with a `hidden lg:block` dashboard panel, a 4-up stats strip, a dark CTA card) measured
hero 1187 → 900, features 717, CTA 661 (source 900 / 720 / 643). Its rules, golden `[V]` (934/0):

- **Responsive-hide tiers** (measured, both twins): hide-xs = the 390 pass, hide-sm = the 820 pass, hide-md = the 1440
  stamp — the keys sat one tier off, so a `hidden lg:block` desktop panel vanished on desktop.
- **A pill is never a layout row** (`is_layout_row` yields to `is_badge`): a hero badge split into an icon cell + a
  text cell.
- **A hero over a bg video is left-flushed only when its copy is NOT in a centred cap** (`band_has_centred_cap` →
  `contentCentred` on the bg block): a `max-w-7xl mx-auto` grid was pinned to the viewport edge.
- **Feature-list columns** read the LARGEST breakpoint (`grid-cols-2 md:grid-cols-4` → 4) or the measured tracks; the
  shortcode's Columns option now goes 1–6 (was 1–3) — a 4-up stats strip laid out 2-up.
- **A top-level card row wears its rowBox**: the band path dropped the row's own Box Preset (the dark CTA card
  vanished); a cell that is ONLY skinned links decomposes into native buttons; a `flex-col` button group keeps its
  column direction with full-width buttons.
- **Stat rows** (closed): an icon-text row whose text holder is a VALUE leaf over a LABEL leaf (≥ 1.3× the size) makes
  the value the feature-list item text and the label its sub-line, the sub-line's measured size / colour on
  `.fw-fl__sub`; a compound counter unit ("20k+") keeps its sign (it leaked into the label as "+Teams worldwide").

### A random corpus page audited to the pixel: twelve discrepancies, twelve general rules (2026-09-17)

A dark gallery landing (a hero over a masked video, an editorial two-column, a telemetry panel, a marquee, a quote + orb
band) converted through the admin path and measured band by band (`verify.mjs` + a per-section geometry probe: top,
height, container width, gutter, headings, buttons). Before: page height +23 %, hero centred, stats stacked, marquee a
column of giant lines, an orb button split into two text lines. After: all five bands identical in top / height /
container (0 / 900 / 1485 / 2365 / 2829; 1376 px at a 32 px gutter), `height_delta 0 %`. Golden `[V]` (930/0) locks each:

- **A bare `max-w-*` column is not the centred band** (`cap_is_centred`): only `mx-auto` / `container` / a computed
  auto margin / a centring parent makes a cap the band; the hero's `max-w-3xl` text column stays LEFT.
- **`display:block` spans in a heading are lines**: the split-word collapser skips them, the scrub keeps `display:block`.
- **A measured pill** (a `.glass` sheet class: fill + hairline + blur in the stamp, no `bg-*`/`border` class) is a badge
  when it precedes a heading or carries a dot / svg; its measured skin rides the overline pill (bg, border, backdrop);
  the dot may be a text-node label's sibling. A pill container only when the pill has a skin.
- **A faint watermark by ink alpha** (`text-white/[0.06]`) is pinned like one by opacity.
- **A measured grid's cells are its columns** (`is_layout_row`): with ≥ 2 px tracks, any cell with text / a control /
  media counts — the label + value stat cell and the lone-orb cell used to fail "substantial".
- **Unequal tracks** (`[1.2fr_.8fr]` → 796 / 531): shares by largest remainder (`track_shares`, shared by
  `layout_cols` / `grid_cols` / `bento_split`), the exact px kept so the mapper renders a native `fr` grid.
- **A designed panel height**: a sheet-declared height, or a sole `h-full flex-col justify-between` wrapper → the
  measured height as `min-height` + `justify_content: between`.
- **A measured marquee**: a nowrap flex row whose running `data-sc-anim` translates on X is a marquee whatever its
  class; `marquee_strip` claims ahead of `chip_row`; the loop's duration is read from the stamp.
- **A stacked button label** (an eyebrow over a serif word in a 224 px orb): the lines as block spans with their own
  type, the square box as the node's CSS; a cell that IS one wrapped button decomposes; a button's own skin never
  paints its cell (`skin_below`).
- **Unitless class leading** (`leading-none`) resolves through the measured px in the mirror.
- **Lossless native margins / paddings**: `spacing_px_to_slug` keeps an exact step's slug and turns anything else into
  the arbitrary `[Npx]` token (a 40 px `mt-10` snapped to 48 on every block).
- **Two outline presets with the same border** are told apart by their ink (`match_button_color`).
- **The container gutter is measured** from the bands' equal side padding when no `calc()` rule declares it (JS
  `capture.mjs` + PHP `declared_container_gutter`), and a gutter that is the container's own PADDING is subtracted from
  the Container Width (the theme's is a content width — the feed's RECURS ×3 "+48 px per band").
- Flexbox gained a native **Content Width Alignment** (`content_align`: center / left / right).
- Left open on this page: the fixed bottom icon dock (page-level chrome, not a section) and the hero video's crop.

### The open feed items, reproduced on a real capture (2026-09-17)

The four items the notes could not reproduce were run against a fresh capture of a real source (a dark gallery
landing: pill buttons, a tracked sans footer label under a serif heading font). Two reproduced and are fixed as
general rules, proven live (computed values on the built page) and by golden `[U]` (916/0):

- **Button presets "ignore" weight / case / tracking** — the preset DID carry them; the shortcodes' static `.btn`
  skin (`font-weight:400`, a grey hairline) loads after the generated tokens and, at equal specificity, its order won.
  Core `css-tokens.php` now emits the preset rule DOUBLED (`.btn-x.btn-x`, 0,2,0) for the base, the states and the
  preset's Custom CSS. Live: 400 → 700 on both hero actions.
- **A ghost action fell to the grey outline fallback** — a padded, rounded `<button>` with no fill and no border was
  skipped by the preset builder ("nothing to match by colour"). It registers a **Ghost** role now (its ink, no border,
  its type + hover ink); the mapper matches a fill-less, border-less button to it by ink. Live: `btn-ghost`, 0px border.
- **Footer column titles in the theme heading font** — `footer_heading_css` wrote `.footer-links-title{font-family…}`
  but the theme generator's site-wide `:is(h1,…,h6){font-family:… !important}` outranked it. The measured footer type
  is `!important` now and the generator's rule excludes `.hf-heading`. Live: serif → the source's 10px tracked sans.
- **`import-summary.json`** on the same run: media `imported 0 / reused 3 / available 3` — the "0" the feed reported.
- Still open (no capture reproduces them): watermark opacity, a duplicate footer list, a marquee strip between
  sections, a hero video at 0×0. They need the tuple — which `send-finding.mjs` now REFUSES to send without.

### The findings feed, second batch: the sheet is pulled, not downloaded (2026-09-17)

The shared sheet is a **published CSV** now (`share-config.json` → `feed.publishedCsv`), so nobody downloads it by hand:
`node pull-findings.mjs [--since <ISO date>] [--json | --csv]` fetches it and prints the findings grouped by ref, with
the tuple fields when a row carries them. (598 rows at this pass; **0 rows in the tuple format** — the agents run
1.11.17 but file free-text notes; the contract in `site-build-protocol.md` stands, the wire format accepts both.) The
recurring items, fixed as general rules — each proven by golden `[U]` (913/0) and a synthetic probe:

- **A status lockup (bare dot + label, no pill skin) before a heading** was a "toolbar row" (a code_block dot + a
  text cell; the pulse and glow dropped, three conversions). `is_badge` accepts a flex row of exactly one painted dot
  (≤ 12 px, rounded, filled, LEADING the label — a `justify-between` row is still a toolbar) + one short label whose
  next sibling is an h1–h6 → the heading's overline, the dot its svg mark; `pill_parts` carries the dot's running
  animation (`loop_anim_of`) and box-shadow, the mapper writes them on `.heading-overline__icon` (`overline_dot_css`).
- **Body size over-measured / inflated on the built page** (11 findings): two causes — `detect_typography` read the
  paragraph mode where the `<body>` stamp is the root size (now the root size, 12–22 px, wins) and the theme's fluid
  `clamp()` grew a 16 px body to ~18.4 px on a wide screen. Theme 2.6.2: **Typography → Type Scale → Fluid Sizes**
  (`type_fluid_enable`, default on); the converter sets it `no` so a measured size renders as measured. Body
  letter-spacing is carried only when the mode covers ≥ 60 % of the paragraph text (one tracked paragraph no longer
  tracks the whole site).
- **Footer 12-col spans / nested grids** (13): `footer_measured_split` derives the column segments from the cells'
  `col-span-N` / `track-frac` when the px track count ≠ the column count (a nested grid splits evenly), and returns
  only when the count matches.
- **Logo ring frame** (6): `detect_logo` reads a bordered tile (`frame_border`, `frame_size`); the header logo maps
  `logo_icon_frame` on a border as well as a fill, with `.site-logo__mark--framed{border…;background:transparent}`.
- **Header gradient ground** (6): `bg_gradient` from the header's background-image →
  `.site-header:not(.is-stuck){background-image:…}`; a translucent resting glass keeps its alpha as `scroll_bg_color`.
- **Menu item style "pill" by default** (4): `item_style = 'none'` is set explicitly when no fill / border /
  underline signal exists.
- **Pill nav → menu items AND three CTA buttons** (RECURS ×6): `nav_pill_sibling` — a skinned nav link whose
  siblings are skinned ALIKE (same fill / border) is a menu item; only the link skinned unlike every sibling is the
  CTA. Shared by `header_actions`, the single-CTA fallback, `detect_menu_styles` (which now reads the pill skin from
  those links) and `nav_links`. A home link (`/`, the origin) never doubles as a text link beside the logo.
- **A floating centred pill bar read as a vertical-left rail** (2): a rail is taller than wide with a column nav; a
  wide + short header with a row nav (≥ 3 links) is `top`.
- **A 1 px accent line lost its width** (RECURS): a painted hairline (≤ 4 px tall, measured width) is a paint block
  that keeps `width:<measured>` (+ `margin:auto` centring) unless it spans its parent.
- **`data-sc-anim` / keyframes stored in a heading title** (2): `scrub` removes EVERY `data-sc-*` stamp at the DOM
  level; an `<i>` / `<em>` the source reset to roman keeps `font-style:normal` inline.
- **A tinted circle icon tile dropped from icon boxes** (3): `el_is_icon_tile` — the icon's wrapper is a tile when
  its MEASURED style paints it (fill / gradient / border / shadow) at ≤ 120 px, whatever its classes.
- **"media.imported 0"** (3): a reconvert REUSES the library copies. The import writes **`import-summary.json`**
  beside the capture (media imported / reused / failed / available, presets, theme-settings, pages created / updated,
  the sections run) — the once-per-site summary reads that, not the JS-side stats.
- Not reproducible from the notes (no capture attached): button presets "ignoring" weight / case / tracking (both
  twins and the theme carry all three — see golden `[U]`'s probe), footer headings on the theme font
  (`.footer-links-title{font-family…}` outranks the theme's `h3` rule), watermark opacity, a marquee strip between
  sections. A finding that names the construct + a capture path gets fixed; one that names a symptom gets a probe.

### The shared findings feed, triaged: the recurring items other agents filed (2026-09-17)

The agents converting with the kit stream findings to the shared sheet (`send-finding.mjs`). 133 findings over nine
conversions; the ones marked RECURS / systematic were fixed as general rules — each traced to its cause, not its symptom:

- **Every converted page 16–24 px taller per section** ("theme section gap", 5 sites): builder sections are direct children
  of `.entry-content`, so the theme's prose flow gap (`.entry-content > * + *`) landed between them. Theme:
  `.entry-content.fw-page-builder-content > * + * { margin-top: 0 }` — sections own their rhythm.
- **"Tried to sideload the page URL itself"** (4 sites): the JS `videoBlockOf` absolutized an EMPTY `webm` / `poster`
  attribute to the page URL, and the media harvest took every `url` key in the builder tree (a link's too). Fixed at the
  root (an empty attribute stays empty), the harvest takes media keys only and never the page / a bare origin / an
  `/api/` route; the PHP media scanner and `import_urls` skip the same.
- **Scroll-reveal FROM-states as resting style** (opacity 0 + translate, 3 sites, both twins): a GSAP / observer reveal
  writes its from-state INLINE, which the stamp recorded as the look. The capture now treats a hidden content element that
  is inline-hidden or below the fold as a from-state: no opacity / transform / filter stamped, a `data-sc-reveal` instead.
- **Two-line lockup reversed / blogname from a logo glyph / stale tagline** (3 findings): the document `<title>` orders
  the identity — a lockup whose two lines are the `<title>`'s segments reversed follows the title; a glyph lockup (no
  letters) yields to the first segment; `blogdescription` is reset before every conversion.
- **A contact form mapped to the newsletter** (textarea dropped, the copy column swallowed): a form with a message
  `<textarea>` (or ≥ 3 text-like fields) is a `contact_form` (forms extension) — `is_contact_form` / `contact_form_build`
  → `n_contact_form`: the fields in source order as form-builder items (label / placeholder / required / half-width from
  the measured widths / select choices), the submit label, the form's measure, the underline-input and submit skins as
  scoped CSS; the importer activates `forms`. A non-form container that also holds a heading is never a newsletter.
- **A framed video hoisted to the section background**: a bleed layer must COVER the section (≥ 70 % of its height, not
  inside a `data-sc-col` cell) to be its Background video.
- **The absolute-bottom scroll cue lost / an icon-only link dropped** (2 sites): an icon-only `<a>` tile is a lone icon;
  a pin on the tile or a sole-child wrapper (`absolute bottom-12 left-1/2 -translate-x-1/2`) → the native Position
  option (fraction utilities `left-1/2` → 50 %) + the centring transform; `anchor_abs_overlays` hoists it to the band.
- **Copyright family truncated to its first token / uppercase dropped**: the H/F typography carries the whole family
  stack (each family quoted) and a `text-transform`; the converter passes both.
- **`oklch(… / 0.4)` colours stripped**: the shortcodes colour sanitiser keeps the alpha `/`.
- **Menu Letter Spacing option out-specified** by `.site-header--uppercase-nav … { letter-spacing: .04em }`: the fixed
  value is now that rule's default (`var(--menu-link-letter-spacing, .04em)`).
- **Two previews on one host + path overwrote each other**: the capture out-dir slug carries a query signature (a
  `?slug=` selects the page); one `site-slug.mjs` shared by capture.mjs and serve.mjs.
- **`full.png` blank below the fold**: the screenshot follows a scroll-through.
- **"The report describes a build the import didn't execute"**: the bundle import writes the PHP engine's own
  `conversion-report-php.csv` (+ `conversion-drops.json`, `class-coverage.json`) beside the service's JS report.
- **The finding wire format** carries the reporting contract tuple (`region` · `property` · `got` · `expected` ·
  `construct` · `path` · `twin` · `loss` · `recurs`; 120-char values), and every capture writes `share-stats.json` for the
  once-per-site `--summary` (the documented `design-config.json` had no stats, so the aggregate arrived empty).
- Fixtures: golden `[T]` grew a scroll cue + a contact form (904/0); fixture 2 20/0; JS 70/0.
- Still open from the feed (need a repro): a stats grid / 3-card grid emitted without its row wrapper (cells stack); an
  overline's mono typography leaking into an icon_box title / body; responsive utility variants flattened to the desktop
  value; `@supports` wrappers stripped; a two-row masthead merged; equal-height grid cards collapsing in a flex column.

### The outpost page: a data table becomes its own Table Preset, content-sized rows, one-sided rules, a status pill, a ring emblem, a dot-grid overlay (2026-09-17)

A dark "telemetry" page whose centrepiece is a data `<table>` (a tracked-uppercase header row, `divide-y` hairlines
between body rows, a bold first column, mono value columns, coloured status words, translucent badge chips, a
right-aligned last column, a row hover), beside a status pill over the h1 with an outlined word, a two-stat row with a
1px divider, three columns ruled on top only, a CTA with a ring emblem over a dot-grid overlay and a 3-track grid signup,
and a footer whose "social" slot holds terminal / cpu / activity glyph tiles.

- **A table wears its MEASURED skin as a real Table Preset** (`table_style_evidence` → `register_table_preset` →
  `build_table_presets` · JS `tableEvidence` / `tableSkinOf` / `buildTablePresets`): the mode of the body cells (the
  `<tbody>` stamp is the text base the cells inherit) and the header cells → cell padding, grid lines (a second row's
  top rule = a `divide-y` source), the header's rule / colour / weight / case, the body's size / colour, the row hover
  (`data-sc-hover`), zebra fills, the frame (the table's own or a sole-child wrapper's border / radius / shadow), the
  caption. What the fields can't hold (the header's face / 11px / tracking / own padding, the body's 300 weight, no rule
  under the last row) rides the preset's own Custom CSS (`{{SELECTOR}}` descendant selectors — the field strips `>`).
  Named `Table <hash>` on top of the built-in library; the node's `table_preset` = `tbl-table-<hash>`.
  Before, the converter only PICKED a built-in by name — and wrote the bare slug, which never matched the emitted
  `.tbl-<slug>` rule, so no converted table ever wore a preset at all.
- **Each cell carries only its diff** (`table_cell_html` · JS `tableCellHtml`): the cell's colour / face / weight /
  size / tracking / case that differ from the table base wrap the content in a `<span style>`; a badge inside a cell
  keeps its own fill / padding / type inline and stays `inline` (its padding paints without growing the row). Colours
  are HEX — `#rrggbb` / 8-digit `#rrggbbaa` — because `wp_kses`'s style filter drops `rgb()` / `rgba()` values.
  A column's measured `text-align` → the native column alignment. The shortcode's own zebra / hover / frame toggles
  go OFF when a preset applies (they painted light-grey stripes over the dark table), and css-tokens zeroes the base
  cell borders under any preset (a "none" preset showed the theme's `#ddd` rules before).
- **The capture's animation stamp split `cubic-bezier(0.4, 0, 0.6, 1)` at its commas** → `cubic-bezier(0.4` with an
  unclosed paren swallowed EVERY page rule after it in the combined stylesheet (the stat sizes, the h2 measure, the
  whole page's scoped CSS looked "lost" — they were parsed away). Fixed at the source (a top-level comma split) and
  guarded in `loop_anim_of` (an unbalanced function falls back to `ease`).
- **Content-sized flex rows** (`row_is_content_sized` / `divider_cell_size` · capture stamps desktop `track-frac` on
  flex-row children and `width` on empty painted leaves): no cell declares a width and the measured tracks fill ≤ .75
  → the cells are AUTO (`flex:0 0 auto`, no 12-grid span) and a `w-px h-10` hairline is a 1×40 painted cell; the even
  split had a nowrap label overflowing a 4-span cell.
- **A full-width lone cell carries no `fw-span-12`** — a span child turns a block parent into an auto flex row
  (frontend-grid's `:has(> [class*=fw-span-])`), which set a hero's pill beside its heading; it fills through
  `width:100%` instead (a flex-column section would shrink a span-less child).
- **`cs_decls` synthesises `border` only when every edge matches** (an older top-only stamp keeps the legacy read): a
  `border-t` hairline on a column was compiled into a four-sided `.box` frame. A card's eyebrow `<span>` is the
  Overline once, not also the first body line.
- **A status pill is a badge, never a toolbar row** (`is_toolbar_row` yields to `is_badge`): the dot + label
  inline-flex pill was mirrored as a full-width oval beside the h1 instead of folding into its overline.
- **An outlined word** (`-webkit-text-stroke` + transparent fill) keeps a `sc-outline` span; the stroke is hoisted
  into the heading's scoped CSS (`extract_outline_css` — kses would strip it inline). Mirrors the gradient-text path.
- **A lone glyph in a painted tile** (`lone_icon_block` tile → `chip_skin_from` → an Icon Badge Preset): a 64px ring
  over a CTA is the icon's own badge preset, the same one an icon_box chip gets; `mx-auto` centres it.
- **A covering child layer with a TILE pattern** (capture `data-sc-pattern` now reads an `absolute inset-0` child
  whose gradient is tiled by a small `background-size`, with the wrapper chain's opacity and blend as
  `data-sc-pattern-extra`) → the section's Background Pattern preset with `background-size` / `mix-blend-mode`.
- **A 3-track grid signup is INLINE** (the field spanning two beside a `w-full` button in the third — the button
  fills its TRACK, not the form); the form's own `max-w-md` caps the element (`width:100%` so a centred column
  doesn't shrink it).
- **A label-only heading group** (`n_head_node`: an overline with no title / subtitle) is a text block wearing the
  label's measured type — not an empty-titled `<h2>`. Fixture 2's stat values ("100%" over a caption) follow.
- **Footer**: an icon-only link row with NO named network (terminal / cpu / activity glyphs) becomes the social
  profiles with their own inline glyphs — never the theme's default Facebook / X / Instagram set; the row's chip
  skin (36px outlined square) → `social_style`; the brand tagline is no longer doubled into the copyright bar as a
  "disclaimer"; a status dot before the bottom-bar label rides inline (`status_dot_html`).
- Fixtures: golden `[T]` (17 checks; suite 900/0) · fixture 2 20/0 · JS suite 70/0. Verified live through the admin
  Convert: the table 329.5px tall with 72px rows, header / badge / rules identical to the source; the pill overline,
  the outlined word, the stat pair with its divider, the top-ruled stages, the ring emblem, the dot grid, the inline
  form, the glyph tiles and the status dot.
- **Follow-up (the reports, 2026-09-17).** Reading the service's own reports after the audit: the JS twin still kept the
  hero VERBATIM (its root row counted the absolute bg-video wrapper and the scroll arrow as cells; the twin had no
  section-background-video path at all), the dot-grid wrapper fell to `code_block`, the emblem's shadow was a
  "styling drop", and `animation-report.csv` listed the pulse as a low-confidence *suggestion* beside two bogus
  "pinned for ~3600px" traces (the fixed nav). Closed: `rootRow` ignores absolute children (a single in-flow child →
  the lone-column path); `sec.bgVideo` (a covering `<video>` + its scrim) → the section's Background-Pro video +
  Overlay (`blocksSectionNode`); `isPatternLayer` skips a tiled covering layer (or its opacity / blend wrapper) and
  `findPattern` reads it — `blend` rides the preset css; `loneIconOf` reads the glyph's tile (`_badge` for the
  presets pass + the tile drawn as scoped CSS on `.sc-icon-glyph`); a band's own edge rules / shadow / radius ride
  the section css and leave the drop diag; a fixed / sticky element is never a trace target; a stamped infinite
  loop reports as "CARRIED as-is". Result on the page: 21 elements, 0 fallbacks, 0 styling drops, 100 % coverage.
- Known gaps: the hero's scroll-arrow (an absolute centred link with a glyph) is dropped; the inline signup renders
  narrower than its 448px cap on the admin path; the JS twin still lacks badge-vs-toolbar, one-sided border
  synthesis, the outline span, the label-only head and content-sized rows (the capture stamps are shared).

### The biome page: body-tag shell rules, running class animations, a card masthead's inset, root-grid heroes, utility-fill progress bars (2026-09-17)

A dark glass page (layered radial gradients and a fixed grid pattern painted on the `<body>` by tag, a floating glass card
masthead inset by the bar's padding, a hero `<section>` that is itself a `.46fr .54fr` grid with an absolute hairline as a
third child, a pill overline with a pulsing dot, stat cards captioned above the number, a masked organic video shell with
a scroll-driven grow, a second band whose overline + h2 wrapper reveals as one, a `flex-1` card beside a `w-[32rem]` card
of progress bars built from `w-[96%]` fills).

- **Bare element rules are shell rules too** (`bare_element_css` in `page_shell_css` · JS `pageShellCss` bareRe): a source that
  styles `body{background: radial-gradient(…), #05070b}` / `body::before{position:fixed;…grid…}` by TAG (no class) carried
  nothing — only class-keyed rules were looked up. Now `body` / `body::before` / `main` rules ride Misc Custom CSS with the
  same drops (the body's type → Typography; the wrapper's layout dropped) — except a **pseudo layer keeps its placement**
  (`position:fixed; inset:0; z-index:-1` IS the design of a `::before` grid).
- **Running class animations** (capture `data-sc-anim` + `data-sc-keyframes` · `loop_anim_of` / `apply_loop_anim` / the mirror
  wrapper `mirror_loop_anim` · JS `loopAnimOf` / `applyLoopAnim`): the capture stamps any element whose computed animation is
  INFINITE or scroll-driven (`animation-timeline: view()`, with its `animation-range`) with the resolved shorthand + its
  `@keyframes` (a one-shot run is an entrance = the reveal stamp's job). Every block, cell and mirrored node carries it on its
  own Custom CSS; a video shell's runs ride the `media_video` shape rule (`media_shape_css`). `strip_capture_attrs` keeps
  these two stamps for the mirror. A pulsing dot pulses, a scroll-grown shell grows.
- **A card masthead keeps its placement** (`header_design_sub` card): the bar's top padding → the native Top Offset, its side
  padding → a residual side inset on the card (`margin-left/right`, `flex:1 1 auto`, the source cap as `max-width`, auto
  margins once the viewport exceeds cap + insets). The card sat flush before.
- **A section that IS the grid** (`section_content_max_width` / `grid_px_tracks`): the in-column guard now checks the section
  ROOT too (an arbitrary `grid-cols-[…]` counts), so a video shell's `max-w-[880px]` inside a track never caps the band; the
  px track list is matched against the IN-FLOW children (an absolute hairline takes no track) → the native two-track grid.
- **Progress bars from utility fills** (`bar_percent` · JS `barPercent`): a `w-[96%]` / `w-3/4` fill inside a short (≤ 16px)
  clipped / rounded track is a bar (the inline `width:%` was the only form). A **skinned panel cell with no heading** is
  decomposable (`cell_is_decomposable`), so the panel recognizer builds it (its bars → the progress widget) instead of a
  verbatim mirror of raw markup.
- **Captions keep their side of the number** (`counter_cell_parse` → `labelFirst` · JS `labelFirst`): "ENERGY STATE" over "98%"
  emits the caption block BEFORE the counter.
- **Stacked heading parts fold** (the `stack` builder): a flattened `overline + h2` wrapper that became two stacked items
  builds as one run → ONE special_heading (each part once, overline → title → subtitle order).
- **Pill overlines from the stamp** (`overline_pill_skin_css` + `transform_badge_overlines` → `overline_pill_cs`, `pillDot`): the
  translucent `bg-white/[0.03]` fill and `tracking-[0.3em]` the class compile misses come from the pill's computed stamp; a pill
  without a fill of its own says `background:transparent`; the rule targets `.heading-overline--pill .heading-overline__label`
  (it lost to the theme's pill tint at equal specificity); a painted dot beside the label becomes the overline's svg mark.
- **Measured fractions for flex rows** (`layout_px_fractions`): every cell's `track-frac` decides the 12-grid spans (a `flex-1`
  card at .62 beside a `w-[32rem]` card = 7 / 5); `w-[Nrem]` counts as an arbitrary width.
- **`section_center` ignores a `<button>`'s UA centre** (it centred the hero). `col_span` reads the widest breakpoint variant.
- **Follow-up (same day):** the body shell rules are scoped to the FRONT END (`body:not(.wp-admin)` — Misc Custom CSS also loads
  in the builder's admin page, where the page ground and the fixed pattern bled over the editor); a card / pill masthead's
  min-height is the floating surface's CONTENT height (the theme adds the card's padding + offsets — the whole bar's height
  stacked the gaps twice, a 122px bar became 181px) and the card keeps its own padding; a video shell's `aspect-[.95]` +
  `max-w-[880px]` ride the media_video as `--vid-aspect` on the ratio box (`[data-ratio]` selector, outranking the box's own)
  + a `!important` cap (a 700×733 shell had shrunk to 578×325 in the shortcode's 600px 16:9 box).
- **Decor layers** (recognizer `decor_layer` (71) → the `paint` builder · `layout_cols` stash + `rootDecor`): the capture's
  coverage report flagged a section's `background-image` lost — an absolute, blurred radial GLOW blob (`left-[20%] top-0 h-72
  w-72 blur-3xl`) and the hero grid's 1px `light-river` gradient hairline (an absolute grid CELL, dropped as empty). Both are
  native empty Divs now: the paint + blur + radius, the measured size (a `w-N` utility / a round blob's height when the stamp has
  no width), the declared sides (`bottom-0` → `bottom:0`, a horizontal stretch → `left:0;right:0`), `pointer-events:none`; an
  absolute cell takes no grid track and rides beside the row; the section holding one becomes `position:relative`.
- Housekeeping: a `\b` in three patch-written regexes had become a raw backspace byte (the body-face read from the body
  stamp, the pseudo-layer gate) — fixed; the container-width cluster loop nulled a cluster through a reference — fixed.
- Fixtures: golden `[Z]` (14 checks; suite 884/0) · `[W]` accepts the token ink as hex (the editor cell now decomposes as a
  panel) · JS suite 70/0. Verified live: the body gradients + grid pattern, the card 40px in / 20px down, the pill at 0.03
  alpha with 3.3px tracking and its dot pulsing, captions above the stats, three native bars at 96 / 82 / 91, the hero grid
  at its .46 / .54 tracks with the shell's scroll-driven grow.

- **Follow-up (JS twin parity + the reports told the truth, 2026-09-17).** The service's own conversion report for
  the biome page showed what the PHP fix loop had not: the JS twin kept the hero VERBATIM (its video half was an
  `html` cell) and the second band's cells sat unmapped. Closed in the twin: `videoBlockOf` carries `shapeCss`
  (radius / mask / filter / clip / a shaped aspect as the `--vid-aspect` rule + cap / the running animation) and
  `videoNode` wears it as Custom CSS; `rowCols` decomposes a CONTENT cell (a heading, ≥ 20-char prose, or a skinned
  panel) and a LONE-VIDEO cell into blocks (PHP `cell_is_decomposable` / `cell_is_lone_video`); the counter caption may
  be a short leaf `div` / `span`; `stackNode` folds an overline → heading → subtitle run into ONE heading. PHP gained
  `decor_layer` (recognizer 71): an absolute, empty, painted child of a band (a glow blob, a hairline) becomes a
  `paint` block with `decorLayer` + `position:relative` on the band, stashed through `layout_cols` → `layout_row_build`
  → `section_root_row` `rootDecor` — the coverage report had flagged that `background-image` as lost.
  Report tooling: `to-style-report` counts a property the BUILT output carries natively (`BUILT_KEYS`: a fill, a
  radius, a shadow, a padding on an option) as covered, with a `how` column (`css` / `option` / `preset`); a
  native flexbox / decor `div` no longer reads "unmapped" in `why`; `coverage-verification.csv` is rewritten on every
  run (header-only when nothing is missing — a stale file used to survive a clean run). After the patch the service
  reports 9 elements, 0 fallbacks, style coverage 100 % for the page. JS suite 70/0; golden 885/0.

### The canvas page: a site-background video anchor, grid-row bands, a label-only blended masthead, paint frames, price rows (2026-09-17)

A section-less page whose `<main>` is a 12-track grid canvas (the hero copy on tracks 1–7 beside a sculpted product card on
8–11, a square card on 2–6 beside a small tile on 9–11), a fixed right-anchored 60vw video the whole page scrolls over, a
fixed link-less masthead of three labels blended with `mix-blend-mode:difference`.

- **A page-backdrop video that is NOT full-bleed is still the site background's fixed video** (`page_backdrop_layer_of` /
  `page_backdrop_css` · JS `pageFixedVideo` backdrop branch): a `position:fixed`, viewport-tall, UNFRAMED (no radius — a
  framed one is a floating portal) layer behind the content (z-index ≤ 1 / pointer-events none), anchored to one side at a
  partial width, outside any section. It was the first section's Background-Pro video before (scrolling away with the
  hero, full width, no mask). Now it rides General → Layout → Site Background (fixed), and its own geometry (`width:60vw;
  left:auto;right:0`), its mask, the video's filter and a decor glow sibling (`::after`, blend mode) ride Misc Custom CSS on
  `.site-bg-video` with `!important` (the theme prints the layer `inset:0` inline). A measured px width becomes its
  viewport share (60vw). The section-bg path skips such a layer.
- **Grid-canvas bands keep their columns** (`stamp_band_placement` / `group_canvas_rows` / `band_placement_of` /
  `apply_section_placement`): a segmented `<main>` that is a GRID stamps each band's placement (`data-sc-band-place`:
  frac / x / content width); bands whose track-y spans overlap (each read from ABOVE its own top margin) become ONE
  synthetic flex-row band (the grid gap, `align-items:flex-start`, a phone stamp of one track and a tablet stamp of N), each
  cell keeping its own top margin (`mt-40` sits lower than the copy beside it) and a `margin-left` for a col-start offset
  beyond its neighbour (a percent of the canvas width; `cell_geometry` → `ml`, carried from the tablet tier up). A band
  alone on its row keeps a percent width + offset on the section's top-level items. `col_span` reads the WIDEST breakpoint
  variant (`col-span-12 md:col-span-7` = 7). The container's vertical padding, handed to its first / last band, is zeroed on
  the container (`band_padding_handed_over`) so `main_style` does not pad `#main` a second time.
- **A boxed tile with any text is a content band** (`is_content_band`): a sculpted card holding two short labels and no
  heading was dropped from the canvas (< 120 chars, no heading, no media).
- **A card skin read one wrapper down is painted once** (`layout_cols`): the grid item's column no longer wears the skin
  its single panel / mirrored block already carries (double fills + doubled inset shadows).
- **A link-less `<header>` inside `<main>` is the hero copy** (`header_root` · JS `_linklessHeroHeader`): a heading with no
  link / nav at all is never the masthead (its h1 became the site title, its CTA the header button); the fixed `<nav>` beside
  it is. A `<button>`'s own UA `text-align:center` never centres a band (`section_center`).
- **A label-only masthead** (`header_label_zones` / `title_matched_brand_leaf`): a fixed bar of plain labels and no link →
  no `menu_area` (the theme would print the WP primary menu where the source had none); the label that starts with the
  `<title>`'s brand segment is the wordmark (wherever it sits — the leftmost slot is a status label), the others ride as
  chips (`list_item` + `header_chip_css`) in the zone their DOM position gives them; a `mix-blend-mode` on the bar rides
  `.site-header` (the labels' legibility over light and dark). JS: a label-only fixed `<nav>` is accepted as the masthead.
- **Empty painted blocks in flow** (recognizer `paint_block` (72) → builder `paint` · JS `paintBlockOf` / `paintNode`): a
  card's gradient frame (`w-full h-full my-6`, no text / media, a fill / gradient / border, ≥ 40px) is a native empty Div
  wearing the paint, its radius / border / shadow, a child's backdrop blur, and its height — or `flex:1 1 auto` + the
  measured minimum when it grew (`h-full` / `flex-1`).
- **A label + button row** (recognizer `label_cta_row` (78) · JS `labelCtaRowOf`): a flex row of ≤ 2 short text leaves and
  a button ("$2,450 | Acquire") is one `row` of content-sized cells on the row's raw justify; walked flat it stacked the
  price over the button — and the price was DROPPED: `salvage_dropped` now keeps a priced / unit-bearing value (`$`, `%`,
  `°`, `+`, a 1–3 letter unit), never a bare number / index.
- **An empty painted CONTAINER in the mirror** (`mirror_paint_box` / `mirror_paint_decls`): a 64px ring holding a blurred
  32px dot (a tile's emblem) rendered as raw utility-class markup (nothing); now one self-scoped `<span class="sc-paint">`
  with the ring's fill / radius / inset shadow / size + flex centring, each empty child a nested painted span.
- Fixtures: golden `[Y]` (16 checks; suite 871/0) · fixture 2 updated (a "100%" stat value is now kept: 20/0) · JS suite
  70/0. Verified live: the video pinned right at 60vw under the whole page with its mask and glow, the hero copy at 7/12 with
  the card beside it at 4/12 (h1 at 208px like the source), the square card + tile on the second row at their tracks, the
  masthead reading label · wordmark · label blended over the ground, the card's gradient frame, "$2,450" beside "Acquire",
  the ring emblem with its blurred dot.

### The telemetry page: the header lockup is the identity, row-spanning bento tiles, panel header rows, mono stats, scrubbed mirror leaves (2026-09-16)

A heritage-survey page (a compass glyph beside an eyebrow-over-title lockup, an oklch-filled pill CTA, a filtered bg video,
a 4-track bento whose scan panel spans two rows beside two small cards over a wide one, a footer whose © line is a `<div>`)
exposed rules across the importer, the bento, the counter and the mirror.

- **The header lockup IS the site identity** (bundle importer + `apply_converted_site_title`): the parent theme keeps
  `blogname` ⇄ the header's `site_title` and `blogdescription` ⇄ its `tagline_text` identical (identity-sync pulls a
  diverging core value INTO the header field). The importer used to set blogname from the design name and blogdescription
  from the `<title>` suffix AFTER the theme-settings import — which pulled the design name over the converted wordmark and
  the `<title>` tail over its eyebrow (the design name over an eyebrow-titled wordmark). Now the measured custom
  wordmark owns both core options (title stripped of accent markup; the `<title>` suffix only when the header carried no
  tagline), and the theme-name pass runs only when the importer set nothing.
- **Row-spanning bento tiles** (`bento_split` / `bentoRowsOf`): a `row-span-2` panel overlaps cells that start on
  DIFFERENT rows, so the vertical-overlap grouping folded the whole grid into one row of slivers. When the capture stamps
  `track-x` (+ `track-h`) on every cell, a cell that other cells start INSIDE splits the grid by X: the spanner's column |
  the rest as its own stack of rows (widths re-measured inside that column, 6/6 or a uniform grow). Capture stamps
  `track-x` / `track-h` beside `track-frac` / `track-y`.
- **The counter panel's header row**: rows before the panel's heading (a lone glyph | a boxed chip, `justify-between`)
  are walked as blocks; a flex row becomes a `row` block carrying the RAW `justify-content` (the row builder maps it —
  native Justify + content-sized cells); a text item of that row is `contentSized`.
- **A boxed short label stays content-sized**: a chip that sat as a flex item / inline-block / `fit-content` wears its
  Box Preset at `display:inline-block;width:max-content` on the block — a block-level text block stretched the fill
  across the cell.
- **A nested block's own face** (`set_body_face` / `nested_face_decl` / `ownFaceOf`): the page's body face (the body
  stamp, else `detect_computed_fonts`) is handed to the mapper; a nested / boxed text block whose first family differs
  (a mono chip or caption inside a sans card) carries `font-family` on the block, since no section styler reaches it.
- **Lone glyphs** (recognizer `lone_icon` (70) + `n_lone_icon` / `loneIconBlockOf`): an `<iconify-icon>` (with its
  inlined svg), a bare `<svg>` or an icon-font `<i>` standing alone as a block — never inside a link / button / heading /
  label lockup — is the native icon shortcode (inline svg or font class, measured size, ink, centring).
- **Counters keep the digits' treatment** (`counter_number_treatment` / `counter_label_node`): Stitch carries the number
  leaf's and the caption's whole stamps (`numberCs` / `labelCs`); the number / prefix / suffix fonts take the measured
  weight (400, not the 700 default) and the digits' own family; the caption is a text block through the same treatment
  as any leaf (a tracked uppercase 9px → the Eyebrow Text Style, the mono face on the block) — never an inline style.
- **Scrubbed markup reaching the mirror**: a cell the scrub already folded into inline `style` (classes + stamps gone)
  lifts each element's `style` into `data-sc-cs` before mirroring, and a leaf face is compared against the BODY face when
  the parent carries none — a card's mono 3xl value mirrored as a bare default paragraph before.
- **A filtered bg video paints nothing of its own** (`videoBg`): on the effect path (a `media_video` in section-background
  mode) a source `<video>` stamped transparent adds `background:transparent` to the `.video-el` rule, so the media_video's
  default black under-paint never turns a hero black while the clip loads.
- **oklch / oklab / hsl colours match button presets** (`rgba_quad` / `rgbaQuad`): a CTA filled `oklch(0.94 0.04 70 / 0.6)`
  resolves to `btn-fill` (it fell to no style before).
- Fixtures: golden `[X]` (13 checks; suite 855/0) · JS suite 70/0. Verified live: the lockup reads the eyebrow over the
  wordmark, the CTA filled, the hero video plays (a branded Chrome — headless Chromium cannot decode H.264, which
  read as a black / transparent hero during measurement), the scan panel at 6 columns beside the small-card rows, the chip
  content-sized in mono, the stats in mono 400 with tracked mono captions, the © bar with its status tail.

### The haven page: page-shell rules, chip rows, code listings, watermarks, glyph stats, label-titled footer columns (2026-09-16)

An editorial-dark page (a scroll-driven background shift declared on `<main>`, numbered chip rows, a mock editor of
`<code>` lines, a faint absolute watermark heading, a serif quote with an accent span, a 4-stat band with a glyph value,
a footer whose link columns are titled by label divs) exposed rules that had only seen section-level content.

- **The page shell's own rules** (`page_shell_css` / `pageShellCss`): the source `<body>` / `<main>` can wear stylesheet
  rules of their OWN (not resolvable utilities): a scroll-driven background shift (`view-timeline-name` +
  `animation-timeline` + its `@keyframes`), a page-wide blend or filter. They belong to no section, so they ride
  **Misc Custom CSS** re-targeted at the theme's `body` / `main.site-main` — the rule + its keyframes verbatim, the
  wrapper's own layout (display / position / size / spacing / overflow) dropped, the body's type (Typography owns it)
  dropped. A class is never dropped: `main.site-main{view-timeline-name:--section-scroll;animation:bg-shift linear
  both;animation-timeline:--section-scroll} @keyframes bg-shift{…}` plays live (the main's background darkens as the page
  scrolls, exactly as on the source; a browser without scroll-driven animations resolves it as the source did).
- **Body face = the measured paragraph face**, never the Google URL's second font: `detect_computed_fonts` keeps a body
  face that equals the heading face (one family for both is a design, not a mislabel — blanking it handed the body to the
  site's mono), and the Typography pass reads the measured families before the URL order.
- **Chip rows** (`mirror_label_row`): a numbered chip ("01" in a 48px ring) | a `flex-1` hairline | a tracked label is
  ONE label row: the chip keeps its ring box + measure (`mirror_box_css` on the label), the hairline is a GROWING separator
  (the following label flexes, its `::before` takes the slack), a zero-padded 1–2 digit value is a marker, never a counter.
  `mirror_dot_of` accepts a 1px-tall, growing separator.
- **Code listings** (recognizer `code_listing` (87) + the mirror's `mirror_code_listing`): a container of ≥ 2 `<code>` /
  `<pre>` children → ONE code block holding a `<pre class="sc-code">` — lines joined by `<br>` (a newline is doubled by
  the editor's autop), `white-space:pre` keeps the indents, `&nbsp;` → spaces, each token span keeps its measured ink,
  the container's mono family / size / leading / inset scoped, left-aligned; non-code children (a footer row of chips)
  follow. **A code_block prints its code BARE** (no wrapper carries the unique class) — `code_self_scoped` puts `u<uid8>`
  on the element and writes `selector{…}` so the rule lands (the terminal-window dots' skins never applied before).
- **Watermark headings** (`watermark_of` / `n_watermark_heading`): an out-of-flow heading at opacity ≤ .25 (a 10vw
  "ARCHIPELAGO" at 5%) never joins a heading group — its own special_heading on the native Position option (the declared
  `top-40` = 10rem), its opacity, no pointer, behind, one line, `aria-hidden`.
- **Any inline run whose ink differs from its parent's** (`scrub`): an accent "mirror" inside a heading, a keyword in a
  line — measured, not only the token vocabulary; alpha kept (`color_keep_alpha`).
- **Stat bands with a glyph value** (`stat_word_cell`): "∞" over "Creativity" counts as a stat cell (a big short leaf
  without digits over a caption) → the 4-column counter row survives, the glyph as a heading over its caption.
- **Footer columns titled by label divs** (`footer_label_heads`): a short uppercase / tracked leaf `<div>` that OPENS a
  column of ≥ 2 links is a column title (the source never used a heading tag); `footer_heading_css` reads THOSE titles
  (10px tracked lantern), not the lead h2. A newsletter "column" titled by the footer's LEAD heading is the lead column
  itself (the form joins it, title / description blank). The © bar's status lockup (a dot + one label) is its right
  column. The footer newsletter element now writes the theme's keys (`newsletter_title` / `newsletter_desc` /
  `newsletter_email_ph` / `newsletter_button`) — the old keys were ignored, so every converted footer form said "Subscribe".
- Fixtures: golden `[W]` (11 checks) · JS suite (34/0). Verified live: the shell rule plays (main background L .17 → .06
  down the page), the chip rows, the listing in mono and left-aligned, the watermark at 5% behind the title, "mirror" in
  lantern, four stats in a row, footer 3 columns with the form under the lead and "Connect" on the button.

### The console page: items-center bento, square cards, glued units, terminal bars, lean steps, spec rows, social columns (2026-09-16)

A sharp-cornered console design (a 12-track `items-center` grid, radius-0 bordered cards, a terminal window, key / value
rows, a titled icon column in the footer) converted 1,350px too tall with its cards stacked, its stats and terminal
bar read as counters, its node cards flattened to a steps flow, and its Telemetry column dropped. Each was a rule that
had only ever seen rounded, top-aligned, class-named sources.

- **Bento rows by vertical OVERLAP** (`bento_split` / `bentoRowsOf`): an `items-center` grid offsets a shorter cell's top
  (a 348px copy column beside a 487px card grid sits 69px down) — grouping by top made two rows (cards first). Cells
  whose vertical spans overlap by ≥ half the shorter one are one row.
- **A square card is a card** (`read_card_skin` / `cardSkinOf` / `boxSkinOf`): radius 0 with a padded fill, a FULL
  border (top + bottom — a one-sided hairline stays an edge skin) or a shadow qualifies. `is_panel` yields to
  `is_toolbar_row` (a filled, padded title bar of dots + labels is a toolbar, not a panel).
- **A cell that IS a card grid** (`claim_element`): a grid of icon / title / copy cards nested in a layout cell is
  claimed as the card grid (it was decomposed to heading + text per card, icons and skins lost). `cell_card_skin`
  descends into a child only when that child holds ≥ 80% of the text (a wrapper) — never one card of a grid of siblings.
- **Counters** (`counter_cell_parse`): `<`, `>`, `≈`, `≤`, `≥` read as a prefix ("< 1.2ms"); a unit written onto the digits
  inside the number's own leaf is the suffix ("1.2ms", "24h"); a number glued into a word (`kernel_v4.sh`) or mixed with
  words in a SMALL leaf ("TTY // 1") is never a stat. A stat cell's one-sided accent rule + inset (`border-l-2 pl-4`)
  rides the cell (`cell_geometry` edge rule; a card skin owns its own border, so the rule never fires beside one).
- **The steps gate** (`step_card_is_lean`): a card carrying text leaves beyond marker / title / copy (a "01 / NODE"
  label, a "Status: …" footer line) is not a steps flow — the steps shortcode would drop them. The card grid keeps them:
  the label as the Overline, a leaf `<div>` line as its own paragraph in the copy with its treatment vs the card's.
- **Toolbar rows** (`is_toolbar_row`): a mixed cluster (empty painted dots + ONE leaf label — the three window dots
  beside a filename) counts as a label. The mapper takes a toolbar block BEFORE the rule-bar probe, and `n_rule_bar`
  never reads a dot (round, or no wider than twice its height) as an accent rule.
- **Spec rows** (`mirror_label_row`): the row's OWN box (its hairline + inset via `mirror_box_css`), a label whose ink /
  weight / family differs from the first (`selector p>.sc-label:nth-child(N){…}`), and the row's vertical margin on
  Spacing (exact token ladder). A verbatim cell now keeps its `data-sc-*` stamps for the mirror (`n_code` strips them
  from anything stored), so the rows read the measured hairline and ink rather than an unresolvable class.
- **The footer SOCIAL column** (`detect_footer_columns` kind `social`): a heading over ≥ 2 icon-only links is its own
  column (heading + social icons), the brand column carries none; `detect_footer_social` keeps the whole icon row in
  DOM order — a glyph no network names (a terminal / cpu mark) becomes a profile with its inline svg.
- **The page-wide FIXED pattern layer** (`detect_page_fixed_pattern` / `pageFixedPattern`): a body-level fixed inset-0
  decorative wrapper painting a gradient grid / a data-URI tile → Theme Settings → General → Layout → Site Background
  Pattern, backed by a registered Background Pattern preset carrying the tile's `background-size`. A blurred glow blob is a
  fill, not a tile.
- Also: a `w-full sm:w-auto` signup button (full width on phones only) keeps the newsletter INLINE; a span's own font
  FAMILY survives the scrub (a mono gradient run inside a grotesk h1); `cell_has_display_heading` is measured too (a 36px+
  h1 / h2 is a display heading whatever its classes); the instagram handle regex used `#` inside its own delimiter.
- Fixtures: golden `[V]` (14 checks) · the JS suite (bento / card skin / newsletter / pattern parity). Verified live: page
  height 4703 vs the source's 4628 (was 5980); the Enclave row at 1161 / 1052 vs 1137 / 1114, the terminal at 1960 vs
  1912, the nodes at 2611 vs 2567, the matrix at 3310 vs 3248, the footer at 4425 vs 4316; the grid pattern prints fixed
  behind the page; all three Telemetry icons render.

### Measured type → the Text Style preset; an inline label row → one text block of spans (2026-09-16)

A mirrored leaf label (the structural mirror's toolbar rows, key / value cells) shipped its whole treatment as an inline
`style=""` on the `<p>` — 12px · uppercase · 1.2px tracking · 16px leading · an 0.8-alpha ink — repeated per label,
uneditable from the Styling tab, and outranking any later preset edit. A separator dot was a code block with its skin
inline and an unused `.sc-dot` class. Three elements in a flexbox for one line of text.

- **The full-treatment Text Style match** (`text_style_for` / `textStyleFor`, both twins): a text's measured size +
  transform + tracking + weight → the Text Style whose declared properties ALL agree (size ±1.5px, transform equal,
  tracking within 0.2px with an em preset scaled by its size, weight equal when both set). A tracked uppercase 12px label
  matches the **Eyebrow** (a class-less style is picked by its name slug, `font-eyebrow` — the class the Text Style
  dropdown offers), never the 11px Caption the size-only match (`text_preset_for`) would pick; that size-only match stays
  the fallback for body roles. `n_text` / `textBlock` try the full treatment first. What the matched style OWNS (its size,
  and the weight / tracking / transform / leading it declares) is not repeated on the block.
- **The mirror leaf on native options**: `mirror_text_decls` (the facts `mirror_text_style` read, as prop ⇒ value) feeds
  `n_text` → native Text Style / Text Color / alignment; the leftovers (a margin, `white-space`, a family, an unowned
  leading) ride the block's own Custom CSS `selector p{…}`. No inline style on the paragraph.
- **The inline label row** (`mirror_label_row`): a horizontal flex row of nothing but short leaf labels (≤ 4 words) and
  painted dots → ONE text block `<p><span class="sc-label">A</span><span class="sc-label">B</span></p>` (a text block
  may hold spans — but the editor (TinyMCE) unwraps an attribute-less span and deletes an empty one, so every label wears a
  class and the separator dot is NOT an element: it is a `::before` on each label after the first, `selector
  p>.sc-label+.sc-label::before{…}`, with the gap as its margin; the row must be label (dot label)* or labels only): the first label's type on the native Text Style + Text Color, the row's margin on Spacing, and on the block's
  Custom CSS the flex line (`gap`, `justify-content` from the row's own justify or its inherited text-align), no wrapping
  mid-label, the unowned leading, the dot's skin (per instance, since each dot has its own size / tint; not Misc Custom
  CSS, which is site-wide). A row holding a link / button / image / icon is not this shape.
- **The painted dot** (`mirror_dot_css`) as a lone leaf: a bare `<span class="sc-dot">` in the code block, its skin on the
  block's Custom CSS.
- JS `lsPx` keeps the `px` unit on a captured letter-spacing (a bare number reads as EM by the Text Style consumer — the
  Eyebrow's 1.2 rendered as 1.2em); PHP `$ls_px` already did.
- Fixtures: golden `[U]` (the label row: 3 checks) + `[R]` pre-wrap on the block CSS · JS `sectionless-page-parity.test.mjs`
  (+3). Verified live: the wrapper wears `font-eyebrow` + the native colour, computed 12px / uppercase / 1.2px / 16px,
  the line centred (514–926 around 720), the dot 4×4.

### CSS-class entrance reveals → Scroll Motion; the sequence (stagger) rides the delay (2026-09-16)

A source animates its entrances with a CLASS PAIR — a hidden rule (`.reveal-up{opacity:0;transform:translateY(30px);
transition:opacity 1.2s cubic-bezier(…), transform 1.2s …}`) and a shown rule (`.reveal-up.active` / `.active .reveal-up`
/ `.is-visible`), plus per-element `transition-delay` helpers (`.delay-100/200/300`) that SEQUENCE a title → paragraph →
form, or the three cards of a grid. Nothing in that is a framework hook (`anim_intent` reads AOS / animate.css / WOW /
`data-animate`), so the motion was dropped and every element landed at rest.

- **Capture** (`capture.mjs`, the `data-sc-reveal` stamp): every stylesheet rule that sets `opacity:0` + a `transition`
  is paired with its shown rule (`.cls.state`, `.state .cls`) and stamped on each matching element as measured facts,
  never names — `dir` (from the rest transform's sign: up / down / left / right / none), `distance` (px), `scale` (a
  scaled-in entrance), `duration` + `delay` (the COMPUTED transition, so a `.delay-200` helper reads as `delay:0.2`) and
  the `ease` (the timing function verbatim). Iconify shadow SVGs are inlined into the light DOM first (`data-sc-iconify`).
- **Stitch / capture-extract** (`reveal_of` / `revealOf`): the stamp → a block's `reveal` (on the recogniser's output),
  a heading GROUP keeps the FIRST part's (the title's stamp rides the `special_heading`), a grid CELL's own stamp → the
  cell's `reveal` (`cell_geometry` / rowCols) — a staggered card animates as a whole, so the reveal belongs on the COLUMN,
  not the icon_box inside it.
- **Mapper / to-pages** (`apply_reveal` / `applyReveal`): → the node's Scroll Motion **`gsap_motion` REVEAL**:
  `direction` = dir, `distance` = the exact px, `delay` = the measured delay (the whole sequence survives: 0 / 0.1 / 0.2),
  `style` by the rest scale (no scale → Subtle, ≥ .95 → Standard, smaller → Dramatic; the duration snaps to the preset's
  — the Style owns it), the CSS timing function → the nearest GSAP ease (`gsap_ease_of`: the expo-like
  `cubic-bezier(0.16,1,0.3,1)` → `expo.out`, `ease-out` → `power2.out`, …) under Advanced → Custom, `once` + run-on-mobile
  on. A reveal already on the node is never overridden. `column_to_flexbox_cell` carries `gsap_motion` through the
  flexbox-cell rebuild (the columns lost it). The build records `require_extension('animation-engine')`, so the importer
  activates the engine when the source needs it — the key exists on the defaults only while it's active, hence the
  mapper writes it regardless.
- **The pill wrapper's OWN :hover** (`field_hover` / `fieldHover`): a glass newsletter row that brightens under the
  pointer (`hover-self{background / border-color / box-shadow}` on the wrapper stamp — the JS twin reads the stylesheet
  rules itself, `hoverDeclsOf`, since extraction runs before the stamp) → `selector .fw-nl__fields:hover{…}` (Capsule) /
  `.fw-nl__input:hover` + a 0.3s transition. Only the paint properties; colours as captured.
- Not carried (no measurable rule): a scroll-linked hero parallax driven by JS, a nav caret glyph, an arrow glyph inside
  a button label.
- Fixtures: golden `[U]` (+4 checks) · JS `sectionless-page-parity.test.mjs` (+4). Verified live: the six reveals stamp
  `data-upw-g="reveal" … data-upw-g-delay … data-upw-g-ease="expo.out"`, the heading is at opacity 1 by ~400ms, the
  three cards enter 0 / 0.1 / 0.2 apart as they scroll in, and the pill's hover paints `oklch(1 0 0 / 0.7)`.

### The section-less video page: nav-masthead, site-background video, capsule signup, card-grid roots (2026-09-16)

Site Converter 1.9.25 · Capture Service 1.11.5 · Shortcodes 1.15.12. An AI page with a `<nav>` masthead, a body-level
fixed video, a `<main>` with no `<section>` and a brand-only footer converted with the first menu item as the site
title, no header CTA, a black hero, an equal-split single-column card list, a fabricated © line and a signup form whose
input and button sat apart. Every gap is a general rule, both twins:

- **Masthead = the `<nav>`.** Every `href="#"` menu link is "in nav", so the first one became the brand. When the
  only home-anchor candidates sit in a link cluster (a parent with ≥ 2 anchors), the link-less brand block that PRECEDES
  the cluster (icon + wordmark span) is the brand (`detect_logo` / JS logoDetail). A `<button>` directly in a
  nav-masthead counts as a CTA when it is a skinned button (`header_actions` — nested `<nav>`s still exclude it).
- **Iconify glyphs.** `<iconify-icon>` renders in shadow DOM, so rendered.html carried empty hosts and every card /
  step icon vanished (only the logo had a shadow read). The capture now copies each rendered `<svg>` into the light DOM
  (`data-sc-iconify`) BEFORE extraction and stamping; both engines read it as an inline svg. A glyph's ink comes from the
  nearest STAMPED ancestor (an `<svg>` is never stamped) — but only when the svg carries no `text-*` class of its own
  (the class path resolves that token). The chip detection steps over the host to the real tile.
- **Page-wide fixed video → Site Background video (FIXED).** The theme already renders
  `general_layout.site_background.video{position:fixed}` once behind every transparent section
  (`unysonplus_render_site_bg_video`); `el_is_page_fixed_layer` now also recognises a stylesheet `inset:0` (all four
  stamped offsets 0, no utility class), and the same layer is no longer ALSO attached to the first section (it painted
  twice and forced a 100vh hero). JS: `home.pageFixedVideo` → to-theme-settings.
- **Section-less `<main>`: band padding + heights.** `segment_bands` hands the container's own vertical padding to
  the first / last band (`band_inherit_padding` → the band's data-sc-cs; JS `_scPadTopAdd`) and marks them
  `data-sc-band-of`; a segmented band under a page backdrop is content-tall (`min_height: auto`), never 100vh. The
  JS twin now segments too (it used to emit ZERO sections for this shape).
- **The root IS the row.** A band whose root is the card grid itself is built as the card_grid recognizer would
  (`section_root_row` → cells → icon_boxes wearing Box Presets + Icon Badge presets), not as generic layout columns
  that fell to the panel path. Its own margin rides ONCE — Pass #5 folds a section's margin into its native padding, so
  the class-compiled margin is dropped from the section rule and the root row's mt/mb are zero (a `mt-40` grid
  rendered 160px three times). `section_content_max_width` also reads the ROOT's own cap (a `max-w-4xl mx-auto`
  hero wrapper → Container Width Medium, so the 88px title wraps where the source wraps).
- **track-frac = width / the parent's CONTENT box.** A padded grid (`px-6`) made a full-width phone cell 0.877 of the
  border box → an 11/12 phone column. Both capture passes now subtract the parent's padding.
- **Capsule signup.** The newsletter shortcode gained the `capsule` design (Shortcodes 1.15.12). The converter picks it
  when the skinned field wrapper HOLDS the button (`is_ancestor($wrap, $btn)`): the wrapper's skin rides
  `.fw-nl__fields`, the input keeps only its type + inset, the wrapper's max-width + margin-top ride the element, a
  Tailwind `placeholder-white/90` becomes the rgba placeholder tint. Newsletter + toolbar blocks now carry their own
  mt/mb (`apply_block_margins`) — the hero's `mt-10` form and `mt-8` label row had lost their gaps.
- **Toolbar rows.** A leaf dot (`w-1 h-1 rounded-full`, no children) counts as a separator; `is_layout_row` yields to
  `is_toolbar_row` (a 24-char label counted as a "substantial cell" and split the row into 4/4 columns); a toolbar
  label must be a LEAF (a cell of tag spans is a chip row).
- **Brand-only footer.** A footer with a wordmark / logo + ONE disclaimer paragraph and no links shipped with no bar and a
  fabricated ©. Now: the brand column (+ the paragraph in its own column when the band lays them side by side), the ©
  bar OFF when the source has no © line (`chrome_mapping_faithful` accepts that), and the footer's OWN lockup measured
  over the reused header logo (`footer_brand_css`: an unframed 20px mark + 14px wordmark).
- Fixtures: golden `[U]` (18 checks) · JS `sectionless-page-parity.test.mjs`. Verified on the live reconvert: hero
  rhythm identical (h1 at 240, form at 521, labels at 621, cards at 790), page height 1327 vs 1337.

### The boxed footer: a panel around the rows, the eyebrow, the label bar (2026-09-16)

Site Converter 1.9.24, theme 2.5.97. A footer whose rows sit in ONE inset panel (a
  hairline-bordered, tinted, padded shell with a width cap and a decor strip) used to flatten to plain bars: the
  panel, the eyebrow over the lead heading, the paragraph under it (the 14-word subtitle cap), the bottom-aligned
  grid, the bottom label bar (dropped, then a fabricated "© year Site" line) and the multi-layer footer gradient
  all went missing. Now, all measured, both twins: (1) `detect_footer_shell` — a single-child chain from
  `<footer>` reaching an element with ≥ 2 content rows that paints a skin (border / fill / gradient / shadow)
  AND carries padding → the theme's NEW **Footer → Layout → Boxed Body** (`footer_body_box`: max width from the
  WIDE pass = 1920 − 2 × xl-margin, gutter from the base margin, padding y/x, one linear gradient natively or a
  multi-layer stack verbatim, a uniform four-edge border WITH its alpha (`color_keep_alpha` — a hairline
  rgba(255,255,255,.08) no longer flattens to solid white; the same fix covers every band border / fill / ©
  typography colour), the first shadow layer, radius, "copyright inside" when the © / label bar is one of the
  shell's rows). Every bar inside goes Full Width; the theme's 1rem bar padding is replaced by the rows' own measured
  box (main 0, bottom bar margin-top 34 + padding-top 22) in `misc_custom_css`; an empty absolutely-positioned
  decor child (a gradient "roofline") rides as `.footer--boxed .footer__body::before`. (2) The main row's
  `align-items:end` → the NEW per-bar **Column Alignment** (`main_footer_valign`). (3) A **measured split**
  from the row's grid tracks (747.5 / 552.5 → 57 / 43) when the track count matches, before the equal / wide-brand
  heuristic. (4) A **label bar** — the footer's LAST row, a flex/grid of ≥ 2 short (≤ 8 words) small (≤ 14px) text
  cells and nothing else — is the copyright band (`band_is_label_bar`): its cells become the Copyright bar's
  columns as-is (a flex space-between row → Auto Width + Between), its hairline / 12px translucent tracked type →
  `copyright_custom_styling`, case / tracking / line-height as a scoped rule; NO fabricated © line. A computed top
  hairline on a later row is now a band-split signal like the `border-t` class. (5) The lead lockup carries the
  EYEBROW (`footer_lead_eyebrow_el`: the previous sibling, ≤ 40 chars, ≤ 13px or uppercase → `<span class="footer-lead-eyebrow">`
  + its type), the subtitle cap is 40 words, the title's font-family is joined with ';' (it was glued to the next
  declaration, voiding the rule), and the lockup's ZERO margins are asserted so no theme h3 margin opens under the
  display heading. (6) A gradient footer background: one linear layer → the native `footer_background.gradient`,
  a stack → verbatim on `.footer` (the theme now paints a gradient-only `footer_background` — `footer--has-bg-image`
  used to require an image). Theme fix on the way: auto-width footer columns inherited the grid's 24px
  `--fw-gutter-y` top margin (the bottom bar measured 65px, not 41). Fixtures: golden [S] (boxed footer) + [T]
  (card states / eyebrow / inner inset / measure); JS `footer-box-parity.test.mjs` + `card-states-parity.test.mjs`.

### Reconverting a second source on a reused install: stacked zones, menu assignment (2026-09-12)

Converting site A, then B, then A again broke A's header: (1) the capture now stamps every zone's x / y, so a STACKED masthead (a full-width ticker over a full-width brand bar) produced two zone stamps that the segmented-header rule read as side-by-side slats — the ticker's red fill landed on a 1440px start column and the menu collapsed; segments must share the row's y and never span the row. (2) The generated theme assigns its header menu once behind a `<fn>_header_menu_assigned` flag; the different-site cleanup purges the previous menus (clearing the location) but the flag from A's earlier run survived, so A's rebuilt menu was never assigned and the header rendered with no nav. The bootstrap now re-assigns whenever the location is empty / dangling (a location pointing at another existing menu is the user's choice), the cleanup drops the flags, and an existing menu carrying DUPLICATE top-level labels (two runs appended) is rebuilt. Golden `[M]` +1.
### No class dropped: wrapper spacing, strip labels, icon chips, preset variants (2026-09-12)

A second source converted through the admin Convert surfaced seven fidelity gaps; each is a general measured rule in both
engines (golden `[Q]` ↔ `spacing-strip-parity.test.mjs`, 747 / 0 and 66 / 0), verified on the live reconvert — the hero's
content, its "trusted by" strip and the pricing heading gap now measure identically to the source at 1440:

- **a flattened wrapper's margin AND padding ride its boundary blocks** — `collect_blocks` / the decompose dive stamp
  `mtAdd` on the first block and `mbAdd` on the last from the wrapper's margin + padding (`text-center mb-20` under a
  section heading = 80px; a `mt-auto pt-24 pb-12` strip = 152 above / 48 below); the section-level heading flush, the
  cell-level flush, the logo-strip caption and every own-column native (`carry_wrap_margins` ↔ `carryWrapMargins`)
  put them on the node's Spacing. An inner part's explicit zero (`mb-0`) never blocks the group's gap. The heading's
  h-tag section rule no longer re-applies them (a hero h1 sat 48 + 48 px under the header);
- **an overline-only heading keeps its own bottom margin** (a kicker's `mb-8` over a logo strip), and a lone title asserts
  its captured `margin-top` (zero included) so the theme's default hN margin cannot double a carried gap;
- **a button inherits a wrapper's margin only when that wrapper holds nothing but buttons** — a hero column's `mt-12`
  belongs to the column, not the CTA;
- **hero header clearance reads only the first in-flow child** — a bottom-pinned strip's `pt-24` is its own spacing;
- **an icon chip is the card's icon, never decoration** — an empty painted box that holds an `<iconify-icon>` / `<i>` /
  custom element / svg / img is excluded from the `sc-deco-N` hooks (`holds_icon_or_media` ↔ `decorBoxesOf`);
- **icon brand strips keep their names** — an `<iconify-icon>` mark beside visible text is a mark, not a wordmark, so the
  logo_grid shows the labels (`label` on the strip items); the JS engine now captures svg / iconify strips at all, and both
  carry the strip's measured desktop gap (`md:gap-16` = 64, not the bare phone class), the mark size, opacity, grayscale,
  and the item's own gap / padding / label typography as scoped CSS (the shortcode's `.35rem` item padding grew a 28px
  row to 35);
- **a role's second distinct button skin becomes its own preset** — "Outline" (the common slate plan buttons) and
  "Outline 2" (the white-bordered header CTA with its brand hover); a semantic class still resolves to the winner, only a
  colour match reaches a variant, so the header CTA renders `btn-outline-2` with the source's border and hover;
- **a frosted overlay header shows its fill** — the theme's `.site-header--transparent` utility rule now honours
  `--header-bg` (a translucent `bg-slate-950/40` bar over the hero rendered transparent);
- **a stale per-page `hide_site_footer` / `hide_site_header` is reset** on re-import when the new source has that chrome.

### Utility-class probe, batch 2 + the CSS probe closed + the golden fixtures green (2026-09-12)

The CSS probe reaches **35 / 35 in both engines** and the utility-class probe **48 / 55 at render level** (from 42); the
corpus's water and contact bands are now exact at 390 / 820 / 1440, and both golden fixtures are green (717 / 0, 20 / 0 —
the nine carried failures were stale shapes: the hero rating cluster is kept verbatim again, the [13] hero checks read
flexbox cells, fixture 2's signup is the native Newsletter). Every rule is measured, in both engines:

- **child rhythm** — the SECOND paragraph's top margin / hairline + padding (a `space-y-*` / `divide-y` card) →
  `.icon-box__content p + p` (`bodyRhythm`);
- **a side-by-side card** — a cell that computes `flex-direction:row` with the heading block and the paragraph as its
  children → the icon_box inner becomes a row from the tier the source is a row at, the title first or last as the source
  orders it (`card_row_layout` ↔ `cardRowOf`; targets `.icon-box__head` and the top style's `.icon-box__inner>.icon-box__title`);
- **a form field's `:focus` skin** — the capture resolves `:focus` / `:focus-visible` / `:focus-within` rules (Tailwind's
  `--tw-ring-*` vars → a literal ring) and stamps `data-sc-focus`; the newsletter input's `:focus` carries it (`field_focus` ↔ `fieldFocus`);
- **empty painted boxes inside a card** (an aspect-ratio placeholder, a pattern tile, a colour swatch) → a class hook
  `<div class="sc-deco-N">` in the description in document order + scoped CSS; an inline-SVG data URL rides with its tags
  percent-encoded (the custom-CSS scrubber strips raw `<` `>`), and the capture CSS-escapes a `;` inside `url()` so the
  stamp's `;`-list survives (`bodyDecor` ↔ `decorBoxesOf`; the JS text-card path emits a raw box);
- **a stray inline label** (a `<span class="label">` outside any `<p>`) → its own paragraph, and an inline element's own
  treatment that differs from its parent (writing-mode + `display:inline-block`, tracking, case, size, weight, decoration)
  → kses-safe inline style (`scrub($node, $parent_cs)` ↔ `rawHtmlOf` inline bits);
- **the WIDE tier** — a fourth capture viewport (1920 → `data-sc-cs-xl`, the `2xl:` tier): section padding, a card's inset
  and its title / description size ride `@media (min-width:1536px)` rules (`sectionCsXl`, `cardCsXl`, `*CsXl` ↔ `computedXl`, `padXl`, `*FsXl`);
- **a layout-centred card** (`grid place-items-center`, `flex flex-col items-center`; the capture stamps `justify-items`) reads as centred;
- **a band's inset per tier** — a wrapper's measured 390 / 820 inset (`el_inset_x_tier` ↔ `insetXOf` tiers) rides
  `max-width:767px` / 768–991px `selector[class]` rules beside the desktop token, and a SKINNED wrapper (or the sole child
  of one) no longer adds its padding to its children's inset (the panel's preset already carries it — the corpus's water
  band was inset twice, 1056px for 1224px);
- **a chip row that stays a row on phones** (the 390 stamp keeps it a flex row) → `responsive_collapse:no` (`keepRowSm`);
- **the phone gutter override** is `!important` (the theme's generated `:root{--container-gutter}` came later in the combined stylesheet and won).

Five latent regexes in the PHP engine carried a literal backspace where `\b` was meant (`<header\b`, `\b(footer|colophon|
site-info)\b`, `\bgrid-cols-[2-9]\b`) — repaired; patch scripts must be written with the Write tool, never a heredoc.
Still differing on the utility probe: a lone input inside a card, `odd:` / `first:` list variants, a link inside a card
that becomes the box link, and a hover shadow's second-layer colour. Fixtures: golden `[U2]` (10) ↔
`utility-probe-parity.test.mjs` batch 2 (9).

### Utility-class probe: generated classes are reproduced from measurements, never from a list (2026-09-12)

There is no finite list of utility classes (a utility grammar × values × stacked variants is unbounded), and the
converter does not keep one: for a CAPTURED site the runtime-generated stylesheet is carried whole, scoped under
`.sc-tw` (every `md:` / `dark:` / `print:` / `has-[]` / `aria-[]` / `before:` / arbitrary-value rule), and every
DECOMPOSED element is rebuilt from the computed values the capture stamps. A 36-card probe page of utility families ×
variants, graded on the RENDERED result (source vs converted computed values, 55 checks at 390 / 820 / 1440 / 1920),
went from 24 to 42 matches through general rules, each fixed in both engines:

- a coloured card's inherited ink (a brand-filled `text-white` tile) → the native Title / Content Colour when the title's /
  description's colour differs from the PAGE ink (the body stamp; `prime_mapper` → `set_page_ink` ↔ `titleInk` / `bodyInk`);
- a utility-built shadow computes with two transparent ring placeholders FIRST — `visible_shadow` drops placeholder layers
  before judging (four gates had rejected every real `shadow-[…]` / `shadow-lg` behind them);
- a card's hover INK (`hover:text-white`) and a child's own / GROUP hover (`.group:hover .title`: the capture stamps the
  descendant with `data-sc-hover-group`, and MERGES the several `:hover` rules that target one block) → `selector:hover
  .icon-box__title{…}` (`child_hover_decls` ↔ `hoverGroupOf`); the stamp hover now merges into a class-only hover;
- the card title's / description's tracking, case and a truncate (`letter-spacing` / `text-transform` / `text-overflow`, the
  capture stamps `text-overflow`) ride `.icon-box__content`; their measured 390 / 820 font sizes ride `max-width:767px` /
  768–991px rules (`titleCsSm/Md`, `bodyCsSm/Md` ↔ `titleFs*` / `bodyFs*`);
- a card image's own box + radius (a `size-16 rounded-full` avatar; the capture stamps an `<img>`'s rendered width) → the
  image keeps 64px / 9999px, and an own-sized image_box drops its forced crop ratio (`img_extra_css` ↔ `imgExtraOf`);
- the grid's MEASURED track count at 820 / 390 (`tracksMd` / `tracksSm` on every grid row block) → each cell's tablet /
  phone device width, a N-track tablet rule (`repeat(N,minmax(0,1fr))`) for a Grid, and a cell's own tablet fraction
  (`track-frac`, stamped for grid / flex-row children) wins over the equal split (a `md:col-span-2` card);
- a cell hidden per TIER (`md:hidden`, `lg:hidden`: display at 1440 / 820 / 390) → the native Responsive Hide per tier;
- a thin accent-bar pseudo (a 4px `before:` rule: one side ≥ 24px, the other ≥ 2px) qualifies as a decor layer, thin sides
  stay px, and a SMALL layer paints ABOVE the fill (`above:1` → `z-index:1`; the source's own `z` when set).

Two theme-side bugs surfaced by the render grade: the image_box crop ratio never applied (`imgbox--ratio-ratio-16-9` — the
option value's own `ratio-` prefix was doubled) and `.imgbox__img{height:100%}` lost to a page-level `.woocommerce-page img
{height:auto}` (now `.imgbox .imgbox__img`). Still open on the probe: a focus ring on an input inside a card, `divide-y` /
`odd:` / `first:` child utilities, a card that is itself a `md:flex-row`, `place-items`, and the 1536px (`2xl:`) tier.
Fixtures: golden `[U]` (18) ↔ `utility-probe-parity.test.mjs` (17).

### JS engine: a rounded / framed image stays a native media_image (2026-09-12)

The JS decomposer sent any `<img>` with a border-radius, box-shadow or a border / ring / rounded class to a VERBATIM
code block ("nothing dropped"), so its object-position / filter long tail (and the editable element) were lost there
while the PHP engine kept the image native. The media_image builder already reproduces radius / shadow / filter /
object-position on `selector img`; `imgSkin` now also reads the image's own uniform border and outline (+ offset), so
the verbatim fallback is reserved for what the element cannot express — a decorative `blob` class or a per-side border.
Probe: JS 33 / 35, level with PHP. Fixture: `long-tail-parity.test.mjs` (+1).

### Tablet tier + phone gutter: the responsive pass completes (2026-09-12)

The phone pass grew a TABLET viewport (820px → `data-sc-cs-md`, diffed against desktop like the phone stamp) feeding the md
tier of the same options (section padding / cell padding / cell min-height), so 768–991px no longer inherits the phone tier;
and a ONE-track grid at 820px (a source that stacks at its own 900px breakpoint while the theme grid only collapses below
768) gets a 768–991px rule that stacks the row (`apply_tablet_stack` ↔ `applyTabletStack`; `tracks_count_at` ↔ `tracksMd`).
The container's PHONE gutter (the shell's resolved 390px margin → `data-sc-content-gutter-sm`; PHP `declared_container_gutter_sm`
falls back to the winning shell class's phone stamp) rides a `max-width:767px` `--container-gutter` override in the misc
CSS, because the native Container Gutter is one value. Measured on the corpus (source → converted, section heights): 390px
story 1097 → 1068, fields / core exact, water 898 → 964; 820px story / fields / core / contact EXACT, slider 1016 → 992,
water 712 → 787; 1440px unchanged. Fixtures: golden `[V]` (+3) ↔ `phone-pass-parity.test.mjs` (+3).

### The phone pass: a second capture viewport, first cut (2026-09-12)

The capture sampled ONE viewport (1440), so every `@media` rule a source wrote for phones was invisible — the
converted page relied on the theme's own responsive behaviour plus a 112px clamp guess on section padding. Now
`capture.mjs` renders the page at 390px BEFORE the extraction, records a small property set per element
(padding / margin / font-size / line-height / gap / display / flex-direction / grid tracks / text-align / max-width /
min-height) and keeps only the values that DIFFER from desktop as `data-sc-cs-sm`, plus a page flag
`data-sc-phone-pass` so an engine can tell "no diff" from "no pass". Both engines consume it (PHP `sectionCsSm` /
`csSm` / `el_padding` / `cell_geometry` / `phonePass` ↔ JS `computedSm` / `fontSizeSm` / `padWithPhone` / `minHSm` /
`phonePass`), always into something the theme already expresses responsively:

- **Section rhythm**: `padding_top/bottom` BASE tier = the measured phone value, desktop on `lg`. When the pass ran
  and found no difference, the base is the EXACT desktop value — the 112px clamp is gone for phone-passed captures.
- **Cell padding**: the pad record's base tier = phone, desktop on `lg` (`apply_cell_pad` already emits the
  `min-width:992px` tier; JS `padLgCss` now does the same for panels / rows).
- **Cell min-height**: the flexbox Min Height's own tiers — base = the phone minimum or NONE (`min-height:auto` at
  390px), desktop on `lg`. This alone fixed the corpus story band on phones (a 640px desktop card minimum was
  stretching the stacked image cell to 640px).
- **Type**: a heading's / paragraph's / folded subtitle's phone font-size (+ line-height) → a `max-width:767px`
  rule; a fluid `clamp()` size needs no phone tier (it already scales). Also fixed a damaged regex in the
  section-level subtitle fold that never captured `subtitle_lh`.
- **Cover-fill images** only fill beside their text: the fill rides `min-width:992px`, so a stacked phone image sits
  at its natural height like the source.
- **Hidden on phones**: an element (or cell) that is `display:none` at 390px → the native Responsive Hide
  (`hide-xs` + `hide-sm`), desktop visible — including a salvaged lone leaf (a chip).

Measured on the corpus at 390px (source → converted, section heights): story 1097 → 1068, fields 2427 → 2427,
core 743 → 743, slider 1280 → 1294, water 898 → 964, contact 509 → 551; desktop (1440 / 1920) unchanged. Fixtures:
golden `[V]` (10) ↔ `phone-pass-parity.test.mjs` (9). Still open at phone: the theme's Container Gutter is one
value (the source uses 16px on phones, 24px above), chip rows that wrap differently, and tablet (768–991) which
inherits the phone tier for cell padding — a third viewport would settle it.

### The CSS long tail: 35-feature coverage audit → capture stamps + carriers in both twins (2026-09-12)

A probe page with one card per modern CSS feature (35 features), captured through the real pipeline and graded on
each card's output node + the Box Preset it points to, scored **2 / 35** on the PHP engine. Root cause: the PHP path
only ever sees a property the capture stamps into `data-sc-cs` (38 properties), so 22 features were never stamped;
5 were stamped but dropped; 3 are structural (one viewport). After this change: **PHP 31 / 35, JS 30 / 35**. The probe
site + grader live in the session scratchpad and re-run in about a minute; re-run them after any stamp change.

- **Capture** (`capture.mjs` PROPS + `skip` defaults, non-default values only): opacity, filter, clip-path, mask-image,
  mix-blend-mode, text-shadow, font-style, text-decoration thickness / offset / colour, -webkit-line-clamp, column-count /
  -gap, writing-mode, text-wrap, text-indent, hyphens, font-variant-numeric, font-feature-settings, white-space,
  -webkit-text-stroke, outline (+offset), LEFT / RIGHT border sides, border-image, background-size / position / repeat,
  object-position, translate / rotate / scale, aspect-ratio, min-width, order, align-self. `width` is deliberately NOT
  stamped (every element has one; it would read as a cap everywhere). A second HOVER pass stamps `hover-self{…}` on any
  sizeable block a `:hover` rule targets (the first pass only looked at buttons), so a card's lift survives.
- **Carriers (PHP ↔ JS)**: `box_extra_css` ↔ `boxExtraOf` (box-level long tail → the Box Preset's own CSS, and the slug /
  skin key now includes the resting shadow, the extra string and a lift / border / shadow hover — so an opacity card, a
  lift-only card and a plain card are DIFFERENT presets; before, the first-registered plain preset won and the lift /
  inset shadow vanished); `read_card_skin` ↔ `boxSkinOf` read the 1–4 value padding SHORTHAND first (padding-inline /
  -block used to collapse to the top value); `text_long_tail_props` + `block_rule_fixups` ↔ `textLongTailOf` (prose
  profiles, icon_box title / content via `titleCs` / `bodyCs` ↔ `titleExtra` / `bodyExtra`, text cards via
  `longTail` / `subtitleLongTail`; line-clamp brings `display:-webkit-box; -webkit-box-orient; overflow`; a
  background-image is kept ONLY as gradient text); `img_extra_css` ↔ `imgExtraOf` (filter / object-position /
  aspect-ratio → the image's `<img>` on media_image, icon_box and image_box); `cell_geometry` ↔ rowCols placement
  (order → native Order, align-self → native Align Self, min-width / sticky → cell CSS; the card grid now carries
  geometry too). `color_to_hex` ↔ `_csrgb` parse `color(srgb …)` (what the browser computes for `color-mix()`; wide
  gamuts folded to sRGB). JS also gets its OWN card skin on every cell (`boxSkinOf`) — before, a plain heading+text card
  lost its box entirely (the audit's side finding) — and the derived Box Preset cap rises from 12 to 40 (PHP is unbounded).
- **Still not carried (by design / next tier)**: an EMPTY painted box inside a card (an aspect-ratio placeholder, a
  pattern tile); inline elements inside prose (an `<a>` with its own underline metrics, a `<span>` with writing-mode);
  a paragraph colour inside a card; and anything that only exists at another viewport (`@media`, `@container`,
  `prefers-*`) — the second-viewport capture is a separate plan.

Fixtures: golden `[T]` (11 — padding shorthand, keyed opacity preset, accent bar + outline, inset multi-shadow,
color(srgb), lift-only hover, title / description long tail, cell order / align-self) ↔ `long-tail-parity.test.mjs`
(13, + image filter / object-position and a text card's title / subtitle long tail). No golden regressions (666 / 9
pre-existing); the corpus page measures unchanged at 1440 and 1920.

### Sweep pseudo-layers: an animated `::before` / `::after` rides its declared rule + keyframes (2026-09-12)

Question: can the deterministic engine map a moving pseudo-element such as `.silk::after{inset:-120%; background:
linear-gradient(120deg, transparent 44%, rgba(255,255,255,.78) 50%, transparent 56%); transform:translateX(-140%)
rotate(12deg); animation:sheen 8s ease-in-out infinite; mix-blend-mode:screen}`? It could not: the decor-pseudo
stamp read only the COMPUTED style (one mid-animation frame — a matrix, not the author's transform), dropped any
layer covering ≥90% of its box as "a scrim" (a sweep is larger than the box), and carried no transform / animation /
blend / keyframes. Rule, both twins; fixtures golden `[K]` (9) ↔ `sweep-pseudo-parity.test.mjs` (9):

- **Capture** (`capture.mjs` for PHP, `capture-extract.mjs` for JS — shared helper text): `declaredPseudoRule(el, pe)`
  reads the DECLARED stylesheet rule of `el::pe` (last matching rule wins, applying `@media` entered), rebuilding the
  animation shorthand NAME-FIRST from the longhands (the browser serialises it name-last); `keyframesFor(name)`
  returns the `@keyframes` block's cssText. `sweepLayerOf()` accepts a painted (gradient) pseudo that MOVES (a declared
  transform and/or animation), read BEFORE the covering gate, and records inset / edges / size / background /
  transform / animation / blend / opacity / filter / radius + `clip` (the host's `overflow:hidden|clip`). Stamped as
  `sweep:1;…` in `data-sc-decor-pseudo` and the keyframes in `data-sc-keyframes` (per element, de-duplicated).
- **Where it lands**: a card's own layers now ride the card (`card_from_cell` → `decor`; JS `cardOf` → `decor`) into
  `n_icon_box` / `iconBoxNode`, next to the existing panel (`panel_build`) and grid-cell paths.
- **Emit** (`Mapper::sweep_pseudo_css` ↔ `to-pages sweepPseudoCss`): host `position:relative; isolation:isolate` (+
  `overflow:hidden` when the source clipped), pseudo `content:""; position:absolute; pointer-events:none` + the declared
  inset / geometry / gradient / transform / animation / mix-blend-mode — painting ABOVE the content like the source (no
  `z-index:-1`). The animation and its `@keyframes` are renamed to a per-element `sc-<name>-<md5(keyframes)[0:6]>` so two
  converted sites' "sheen" never collide; both twins derive the same hash. Every value is whitelisted; keyframes are
  scrubbed (no `<`, `url(`, `expression(`, `javascript:`, `@import`) and capped at 4000 chars; unreadable or
  mismatched keyframes → the static layer stays with NO dangling animation. The theme's element-CSS scrubber keeps
  `@keyframes`, so the block renders from the page's scoped CSS.

Verified on a fixture site captured through the real pipeline and imported into a test install: the converted card's
`::after` computes `animation-name: sc-sheen-983495`, 8s, infinite, `mix-blend-mode: screen`, host `overflow:hidden`,
and the renamed keyframes are present in the page stylesheet.

### Admin path parity: one mapper setup, declared container shells, the native Container Gutter (2026-09-12)

An admin URL convert (Convert → prepare → build) rendered every band edge-to-edge while the SAME source imported
through `import_dir` capped at the source container. Audit of the two paths found three gaps, all fixed:

1. **One mapper setup for both paths — `Stitch::prime_mapper( $html, $hifi )`.** The bundle path primed the
   mapper inline (style config + semantic colours, hi-fi, Section Style / Box / Button / Text presets, the SITE
   CONTAINER WIDTH); the admin build step re-created only style config + hi-fi + assets + source URL + entrance
   flags, so `Mapper::build_pages` ran with a ZERO site width — the flexbox band fallback cap (`content_width`)
   never fired — and without the preset links. Both paths now call `prime_mapper`. The prepare→build stash also
   carries the UNCAPPED source html (`html_full`; the 120k-char `html` cap is only for the AJAX payload), so a
   bigger page's trailing `<style>` — its declared container rule, presets, colours — survives into the rebuild.
2. **A DECLARED container shell is not an inset.** `.section-shell{width:min(1440px, calc(100% - 48px));
   margin:0 auto}` computes to `margin:0 24px` at the 1440 capture viewport and read as a 24px inset (the band
   inset rule above) — correct at 1440, wrong on a wider screen where the source stays 1440 wide and centred.
   `el_inset_x()` now reads the DECLARED stylesheet rule first (`stylesheet_decl` width / max-width / auto
   margins): a declared width, cap or auto side → 0/0; the band's measure rides its Content Width cap instead.
   JS twin `insetXOf` already read `sheetDecl` the same way.
3. **The declared gutter → the native Container Gutter.** `declared_container_rule()` (shared by
   `declared_container_cap` / `declared_container_gutter`) also reads the `100% - Gpx` of the winning shell rule
   (per side = G/2) → Theme Settings `general_layout.layout_container_gutter` (24px) → `--container-gutter`. The
   flexbox Content Width renders `max-width:min(cap, 100% - 2×gutter); margin:auto`, so a converted band keeps
   the source's exact inset BELOW the cap and its exact centred cap ABOVE it. JS: `capture.mjs` stamps
   `data-sc-content-gutter` from the same rule; `capture-extract` exposes `contentGutter` + `contentWidth`;
   `to-theme-settings` emits the gutter, and falls back to the stamped site width when the header / footer carry
   no container of their own.

Fixtures: golden `[W]` (6 — declared shell → no band margin, `wide-xxl` cap, gutter 24 + width 1440 in
theme-settings, `build_pages` after `prime_mapper` keeps the cap) ↔ `band-inset-parity.test.mjs` (+3).
Measured on the corpus: every band 24+1392 at 1440 AND 240+1440 at 1920, both equal to the source shells; the
core ring stays centred. Verified through the real admin Convert flow, not only `import_dir`.

### Band inset: a flattened shell wrapper's side margin / padding rides onto its band (2026-09-12)

A manual reconvert showed every band running edge-to-edge (0 → 1440) while the source sat 24px in. Cause: the
section shortcode renders a flexbox child DIRECTLY (no `.fw-container`), so the only thing holding a band off the
viewport edge is the source's plain-CSS shell (`.section-shell{margin:0 24px}`, `.core-shell`, `.footer-shell`) — a
styling-free single-child wrapper that `collect_blocks` / the JS dive flattens, and whose horizontal inset was
dropped (only its vertical margin was carried as `mtAdd` / `mbAdd`). Rule, both twins; fixtures golden `[I]` (8) ↔
`band-inset-parity.test.mjs` (9): `el_inset_x()` / `insetXOf()` read the wrapper's own left/right margin + padding
(Tailwind `mx-/ml-/mr-/px-/pl-/pr-` first, else the computed shorthand) and stamp it on every block the wrapper
produced as `mxAdd {l,r}`; nested wrappers ADD UP (shell 24 + `px-6` 24 → 48). A centred cap is NOT an inset —
`mx-auto` / `container` / `max-w-*`, a computed max-width or fixed width, an `auto` side, or a margin beyond a
quarter of the viewport returns 0/0 (its resolved auto margins are centring; the measure rides `maxWidth`).
`apply_inset_x()` / `applyInsetX()` then put it on the node's native Spacing margin as `ms-*` / `me-*` tokens
(off-scale → `ms-[24px]`, rendered by the dynamic-CSS arbitrary-spacing rule) — on a section-level row band, a
nested row (via `_row_lay.mx`), a heading group's special_heading (both flushes), and every block through
`apply_block_anim` / `blockToNode`; a node with no Spacing option gets scoped `margin-left/right` CSS. A
SELF-CENTRED block (a capped panel with auto side margins — the core ring) ignores the inset, else the side margin
would override its centring and shove it left. Measured on the corpus at 1440: every band now sits at 24+1392 like
the source shells, the ring stays centred (384+672 vs 391+659).

### Chrome presence: no source footer / header → the page's native Hide switches (2026-09-12)

A source with NO `<footer>` (its last band carries the brand line itself) still grew the theme's default footer
(the 414px colophon) under the converted page. Rule, both twins; fixtures golden `[P]` (4) ↔
`chrome-presence-parity.test.mjs` (3): `source_chrome()` (a `<header>` / `<nav>` / `role=banner`; a `<footer>` /
`role=contentinfo`) rides on the page spec as `chrome`; `chrome_page_options()` turns a missing footer into
`page_options.hide_site_footer = 'yes'` (a missing header → `hide_site_header`), and the pages importer sets each
`page_options` key with `fw_set_db_post_option` — the theme's own per-page switches (Page → Layout), so the editor
shows them and they can be flipped back. JS: `page_options` on the page entry from `capture.footer` /
`capture.header`. A source with a footer asks for nothing; the theme-settings footer content is still generated
(a user can un-hide it).

### Signup lockups → the native newsletter form: gate, field skin, preset button, field icon (2026-09-12)

Contact-section pass — a form-LESS signup: a `space-y-3` div holding a paper-pill FIELD wrapper (gradient,
hairline, blur 26, inset + drop shadow, radius 999, padding 12/16, an `iconify ph:envelope-simple` glyph beside a
transparent email input) and a full-width silk submit 12px below (54px, 14px sentence-case). The existing
newsletter path (`newsletter` recognizer → `n_newsletter` → `require_extension('newsletter-crm')`, which the
importer auto-activates) never fired: its gate wanted a `<form>`, a form-named class, or ≥2 controls. The field
went verbatim and the button became a text line. Now equal to the source (form column 615 × 116 at y=75, field
615 × 50, button 615 × 54, section 344) and a test submission lands in the Newsletter CRM's subscriber table.
Rules, both twins; fixtures golden `[N]` (11) ↔ `newsletter-signup-parity.test.mjs` (10):

- **A SIGNUP LOCKUP is a form.** `is_newsletter_form` (JS `signupLockup`) also accepts an anonymous container with
  exactly ONE email / text input, ONE labelled submit-shaped button and no other substantial content (no heading /
  prose / media; a "search" placeholder or a password field still rejects). The multi-control and named gates stay.
- **Design from geometry.** The button on its own row (a column stack, a `w-full` / 100%-wide button, a grid) →
  `stacked` (the shortcode's stacked design = a full-width submit); beside the field → `inline`. The stack gap
  (the button's margin-top, else the container gap) → `.fw-nl__fields{gap}`.
- **The FIELD WRAPPER is the field.** The nearest ancestor of the input (inside the container) with a skin or a
  radius decides the roundness (`pill` ≥ 40px) and its skin — gradient / fill, hairline, shadow, backdrop blur,
  padding, height, plus the input's font-size / colour — rides on `.fw-nl__input` (scoped; only a flat fill has the
  native `field_bg`). The placeholder colour comes from the `placeholder:text-[…]` utility (JS: `::placeholder`).
- **The submit through the shared Button Preset matcher.** `button_preset_for(cls, cs)` (JS `_buttonPresetFor`) →
  the native `button_preset` (colour + size slug; the view now sanitizes per token) and no one-off accent; the
  submit's OWN type (font-size, transform, tracking, line-height, weight, height) is re-asserted as scoped CSS
  because the preset carries the site's button font (the header's 11px uppercase CTA) while this one is 14px
  sentence-case.
- **The field icon is native.** New shortcode options `field_icon` (icon-v2) + `field_icon_color` (rendered by
  `sc_icon_render` in a `.fw-nl__field--icon` wrapper). The converter maps the glyph before the input: an inline
  `<svg>` verbatim, `lucide:<name>` / `data-lucide` → `lucide/<name>`, a font `<i>` class → icon-font, and
  `icon_semantic_lucide()` (JS `iconSemanticLucide`) for another set's id by MEANING (`envelope|mail` → `mail`,
  `phone`, `user`, `search`, `send`, …) — the theme bundles FA / Lucide / Tabler, not Phosphor. Colour → hex.
- **A cell that IS a signup form is claimed whole** (`newsletter` joins the `claim_element` content-row list).
- Also fixed on the way: `el_padding` cascade (an unset `lg` inherits `md`, not the base — `p-6 md:p-8` stayed 24
  at desktop), and the newsletter live region takes no room while empty (`.fw-nl__msg:empty`).

### Horizontal scroll strip, no-wrap rows, capped cells, cells that ARE rows (2026-09-12)

Slider-section pass — a header row (`flex; justify-content:space-between; align-items:flex-end; gap:22`; eyebrow +
fluid h2 left, a `.slider-head p{max-width:400px}` intro right) over a `.strip` (`grid-auto-flow:column;
grid-auto-columns:minmax(78%, 980px); gap:18; overflow-x:auto; scroll-snap-type:x mandatory`) of three strip
cards, each a `.95fr 1.05fr` grid (radius 38, gradient, hairline, shadow, clipped, min-height 360) of a 34px copy
cell + a painted image half. It converted as three squeezed icon boxes in a 3-column grid with the intro dropped
under the heading. Now equal to the source (section 789; header 970/400 at x=1016; three 1086px cards, 515/569
tracks, h3 44/41.8/-2.2, meta at 604). Rules, both twins; fixtures golden `[X]` (13) ↔
`slider-strip-parity.test.mjs` (12):

- **A horizontal SCROLL STRIP is a row that scrolls.** Recognizer `scroller` (92, above card_grid; JS `scrollerOf`
  on the row block): a grid / flex with `overflow-x:auto|scroll` and a column auto-flow, a scroll-snap, or
  computed tracks wider than the box → the `layout_row` block carries `scroll:{item, snap, pad_b}`, the item width
  being the sheet's `grid-auto-columns` (`minmax(78%, 980px)` → `max(78%, 980px)` — a strip track is at least its
  min) or the computed track share. `apply_scroll_strip` (JS `applyScrollStrip`): the row flexbox gets `wrap:no`
  (native) and scoped `overflow-x:auto; scroll-snap-type; scrollbar hidden; >*{flex:0 0 <item>; width:<item>;
  scroll-snap-align}` with content-sized cells — never a squeezed N-column grid.
- **A row that does not wrap keeps one line.** `layout_row` records `nowrap` (the computed `flex-wrap` is
  `nowrap`, or a grid); the mapper sets the native `wrap:no` (both the section-level and the nested `_row_lay`
  paths; JS `rowBlk.nowrap`). Before, every converted row wrapped and a capped intro dropped under its heading.
- **A capped cell in a justify row is size-frozen.** `freeze_capped_cell` (JS inline): a cell carrying a
  `max-width` cap — on itself or on its sole inner wrapper (a two-node cell) — gets `flex-shrink:0` and the row
  gets `>*{flex:0 1 auto;min-width:0}`, so the uncapped cells absorb the shrink exactly as the source's flex does
  (400 stays 400; the heading takes 970). `element_max_width()` now reads the computed / cascade-matched sheet
  value (`.slider-head p{max-width}`) before the legacy rightmost-compound scan.
- **A cell that IS a row is claimed whole.** `claim_element` accepts `scroller` / `layout_row` too, so a strip
  card (itself a grid) becomes one nested `row` block inside its cell — `rowBox` on that row, the cell keeps no
  `cardBox` and no duplicate padding (`$as_row`). JS: `rowCols` runs `decompose(c, …, selfOnly)` on the cell and
  `rowBlockToItems` builds a nested row from a cell's blocks (`c.blocks` with a `row` → `rowBlockToItems`,
  the rest one group).
- **A nested heading keeps its exact size.** `heading_metrics_css` also emits the computed `font-size` (a nested
  h3 fell to the theme's h3 size); JS `headingNode` pins the source px alongside a display preset (44 stayed 44,
  not the preset's 48) — a fluid title keeps its clamp() instead.
- Admin: `define( 'FW_SITE_CONVERTER_ALL', true )` in `wp-config.php` lists the roadmap outputs as enabled without
  the badge — a recording / showcase switch only, no emitter behind it (a Convert still runs the Page Builder
  output). The first output is now labelled **Unyson+ Page Builder** (child theme).

### Rounded shell band: media-aware sheet reading, multi-layer fills, row layout, stack cells, edge skins (2026-09-12)

Water-section pass — a 1392px rounded SHELL (`width:min(1440px, calc(100% - 48px))`, radius 48, clipped, a radial
glow over a linear wash, shadow; an inner wrapper pads 82/84/42) holding a `1.1fr .9fr` grid (gap 56,
`align-items:end`) of a copy column and a single-track stack (gap 16) of two glass stat cards (label + 42px
serif value), then a footer row (`margin-top:64; padding-top:26; border-top` hairline; `space-between`) with a
brand line left and three plain tag spans right. Now equal to the source on every row (section 590, shell
1392×494, tracks 642/526, cards 526×121, footer 1224×48, tags at x=1108). Rules, both twins; fixtures golden
`[S]` (18 checks) ↔ `water-band-parity.test.mjs` (16):

- **The stylesheet reader honours @media.** `sheet_unwrap_at_rules()` unwraps the at-rules the capture viewport
  (SHEET_VW = 1440) satisfies and blanks the rest (`@media (max-width:768px)` no longer hands a mobile
  `.shell{width:…}` to the desktop reading); JS `mediaApplies` = `window.matchMedia`.
- **A multi-layer background is not "a linear gradient".** `parse_linear_gradient` / `parseLinearGradient` return
  null for more than one gradient layer, so the whole stack rides verbatim in the Box Preset CSS (the radial
  glow stayed) instead of the native field keeping only the linear layer. `read_card_skin` reads `overflow`
  from the sheet too (`css_or_decl`) so a clipped shell clips.
- **A shell-expression panel IS the section container.** A panel whose declared width is the site's own cap
  (`min(Npx, calc(100% - Gpx))` and friends) drops the width — the section container already provides it (a
  nested cap subtracted the gutter twice: 1344 for 1392). `shell:true` on the block.
- **A panel absorbs a sole plain wrapper's padding** (`.shell > .inner{padding:82px 84px 42px}` — the wrapper
  is flattened, so its inset rode nowhere) and **counts block children carrying text as content** (a stat card's
  label + value divs); **a skinned panel is a substantial stack child** (two glass cards → `stack`, gap 16).
- **A row keeps its own layout in the nested path.** `layout_row` records `justify` (space-between / around /
  center / end) and its own `pad`; `carry_row_skin` stashes gap / valign / justify / mt / mb / pad as `_row_lay`
  and `flexify_items` applies them (native Gap / Align Items / Justify with CONTENT-sized cells, Spacing,
  padding CSS); every cell of one source row shares a `_row_id` so two stacked rows never merge into one run.
  `column_to_flexbox_cell` carries `_row_lay`. JS: `rowBlockToItems` reads `justify` / `valign` / `pad` / mt / mb.
- **An EDGE skin.** `read_edge_skin()` (JS `edgeSkinOf`): a one-sided hairline with no radius / fill → a Box
  Preset whose `border_sides` is that side (`sides` keys `box_slug` / `skinSig`).
- **A cell that IS a content row is claimed whole.** `cell_is_decomposable` accepts a media-free cell that a
  CONTENT-ROW recognizer claims as a whole (`claim_element`: stack / chip_row / counter_grid / icon_text_list /
  inline_links / text_list — never the media / collage / card recognizers, which salvaged strays) or a bare text
  leaf (a brand line → one text block); `cell_geometry` records `stack_gap` (a single-track grid cell) →
  `content_gap` on the column (JS `cell.stackGap`).
- **A plain tag row is a chip row.** `is_chip_row` / `chipRowOf` accept a flex row whose leaves are ALL unboxed
  short text (a gap, no `space-*` justify, span/div/li leaves) → text blocks with typography and the gap, no
  Box Preset; `collapse_word_split_spans` leaves a flex container with a gap alone (its spans are a row, not a
  split line); the `row_flex_safe` heading-stack veto ignores a heading that sits inside a nested panel.
- **A big-display word is a stat value** (`is_stat_number`: 'High' beside '84%', ≥36px, ≤2 words) so both cards
  fold as label → value headings. **A nested title keeps its computed line-height / letter-spacing**
  (`heading_metrics_css`; JS `headingNode`) — no section-scoped rule reaches a heading inside a panel — and
  **a title with no subtitle keeps its own bottom margin, zero included** (the card grew 16px on the theme
  default). A nested text block emits its computed line-height at normal specificity (`nested` flag; JS
  already did).

### Skinned panels: a ring / card that HOLDS content, decor layers, descendant selectors (2026-09-12)

Core-section pass — a centred grid shell → a 672px RING (radial fill, hairline, glow + inset shadow,
`width:min(78vw,42rem)`, `aspect-ratio:1`, an inner hairline `::before` + a blurred bloom `::after`,
`place-items:center`) → a 620px translucent CARD (padding 26/28, radius 32, hairline, shadow, text centred)
→ eyebrow → a fluid h2 declared as `.core-copy h2{font-size:clamp(…)}` → p → a centred row of three chip
SPANS. It converted as a flat, full-width column with the chips as a stray subtitle line. Now equal to the
source on every measured row (1440 and 1920). Rules, both twins; fixtures golden `[R]` (16 checks) ↔
`core-panel-parity.test.mjs` (15):

- **A skinned wrapper around content is a PANEL.** Recognizer `panel` (86; JS `panelOf`): a div/article/aside/
  section/figure with a fill, gradient, border or shadow whose subtree holds block content (heading / p / list /
  media, or ≥80 chars) and whose children are not all inline (a pill / badge is not a panel). A skinned ROW keeps
  its `layout_row` path (rowBox), a chip row its own, the legacy opaque content-card verbatim path its claim.
  Block `{t:'panel', box, pad, width, maxw, aspect, align, self_center, center_h, center_v, decor[], mt, mb,
  blocks}`; the `panel` builder (JS `panelNode`) emits ONE flexbox column wearing the Box Preset
  (`register_box_preset` / the JS census via `_box`), its padding (`apply_cell_pad`), the sheet's own
  `width` / `max-width` / `aspect-ratio` expressions as scoped CSS (no native field holds an expression),
  `margin-left/right:auto` when the parent centres it (`justify-items` / `place-items` / a centred flex /
  auto margins), native `align_items` / `justify_content` center when the panel centres its content, native
  `text_align`, the decor layers, and its blocks built as ONE group (eyebrow + title + intro coalesce) and
  flexified. Nested panels recurse (ring → card).
- **The stylesheet reader matches like a browser.** `stylesheet_decl()` now parses every rule's selector list
  into compounds (tag / #id / .class, descendant and child combinators), matches the last compound on the element
  and the earlier ones on its ancestors, and picks the HIGHEST SPECIFICITY (sheet order breaks ties) — so
  `.core-copy h2{font-size:clamp(…)}` reaches the h2 and Tailwind's later `h1,h2{font-size:inherit}` cannot
  beat it. `css_or_decl()` reads a computed value when stamped, else the sheet (place-items / justify-items are
  not in the captured property set but decide centring). JS already matched via `el.matches`.
- **Every decor pseudo-layer survives — bordered ones too.** The capture stamps ALL qualifying layers of a box
  joined with `||` (`before…||after…`), and a layer qualifies when painted OR bordered (a border / box-shadow
  with no paint: an inner hairline ring); the stamp carries `border:` and `shadow:` parts. PHP
  `parse_decor_pseudos()` (list) + `decor_pseudo_css()` emits border / box-shadow; JS `decorPseudosOf` /
  `decorPseudoCss` mirror it. The cell path keeps the first layer.
- **A non-linear fill rides in the preset CSS.** Background-Pro's gradient is linear-only; a radial / conic /
  multi-layer `gradient` skin is emitted verbatim as `{{SELECTOR}}{background-image:…}` in the Box Preset's
  custom CSS (both the scanned and the registered branches; JS `rawGradOf` keys the signature too).
- **Boxed spans are chips, never split-text.** `collapse_word_split_spans` (PHP-only pre-pass that unwraps
  ≥3 short leaf spans as an animation word-split) now skips a span with its own padding / fill / border
  (`span_is_boxed`), so a `.core-tags` row of three pill spans reaches `chip_row`.
- **The eyebrow→title gap is exact, zero included.** `title_mt_px` is recorded whenever the title's style was
  captured (a capture omits a zero margin, so absent = 0) and the overline rule emits `margin-bottom:` = the
  overline's own margin-bottom + the title's margin-top — the theme's 16px default no longer opens a gap the
  source doesn't have. JS: `overlineMarginBottom` + the same emission.

### A fluid heading keeps its relative metrics (2026-09-12)

"The section heading looks smaller than the source" — only on a screen wider than the capture. The source
declares `font-size:clamp(2.9rem,5.6vw,6rem); line-height:.9; letter-spacing:-.06em`; the heading node
already carried the clamp() (fluid-title rule), but the SECTION-SCOPED prose styler (`#fields h2 {…}` from
`style_profiles`) pinned the computed 80.64px / 72.576px / -4.8384px snapshot with `!important` on top of
it, so the title froze at the 1440 capture size (96px in the source at 1920). Rules, both twins; fixtures
golden `[G4]`+`[F]` ↔ `heading-rhythm-parity.test.mjs`:

- **A fluid font-size wins everywhere.** `collect_section_style()` swaps the profile's computed `font-size`
  for `fs_decl` when the block carries one; JS `exactHeadingSize` / display-preset snapping are skipped for
  a `fsDecl` heading (no px, no preset).
- **Its line-height and letter-spacing scale with it.** Stitch `fluid_relative_decls()` (JS
  `fluidRelativeDecls`) reads the sheet's own RELATIVE declaration (unitless / em / %) and otherwise derives
  the ratio from the computed pair (72.576 ÷ 80.64 → `.9`; -4.8384 ÷ 80.64 → `-0.06em`) → `lh_decl` /
  `ls_decl` (JS `lhDecl` / `lsDecl`), emitted with the clamp() in both the section rule and the heading's
  `.heading-title` rule. A static-px heading is untouched.
- Note the source's `bloom` reveal (`transform: scale(.98)` until the block scrolls into view,
  `animation-timeline: view()`) makes its heading measure 2% smaller while off-screen — that is animation,
  not type; in view both sites measure identical at 1440 (80.64 / 145.1) and 1920 (96 / 172.8).

### Band stack: zero padding, shell width, single-track stack, band cards with painted panels (2026-09-12)

Fields-section pass — a `pt-0` section whose 896px heading sits over a single-track grid (22px gap, 120px
above) of three full-width band CARDS, each a `.8fr/1.2fr` grid of an EMPTY gradient-painted "visual" cell +
a 36px-padded copy cell (flex column, space-between; eyebrow → h3 → p). Now measures equal to the source on
every planned row (bands 1392×302, tracks 556/834, radius 38, shadow, clipped; panel 556×300 with its three
gradient layers; copy 834×300 pad 36; h3 42/39.9/-2.1; p 640 @ 16/30.4). Rules, both twins; fixtures golden
`[F]` (21 checks) ↔ `band-stack-parity.test.mjs`:

- **Zero padding is a value.** A section whose COMPUTED padding is exactly `0px` on a side gets the explicit
  `pt-[0px]` / `pb-[0px]` token (Pass #5); an empty value fell back to the theme's default 64px. JS:
  `sectionLayout`.
- **The section container is the shell, not a sibling's cap.** `section_content_max_width()` skips a capped
  block that has CONTENT SIBLINGS (a `max-w-4xl` heading beside a full-width card stack) — that cap is the
  block's own measure. `wrapper_maxw()` now also reads a LEFT-aligned cap (no `mx-auto`, or the computed
  max-width) and the wrapper-inherit pass carries it as `block_max_width` (safe: it only centres when the
  alignment is center) — the golden "no mx-auto → no max-width" negative was inverted accordingly.
- **A single-track grid is a stack.** `is_single_track_stack()` (a computed one-track grid / `grid-cols-1` /
  a flex column, no wider responsive override); `is_card_grid` rejects the GRID form (a flex-column card
  container keeps its historic claim — golden fixture 2). Recognizer `stack` (91, above card_grid) claims a
  stack that spaces ≥2 substantial children with a gap → `{t:'stack', gap, mt, mb, items}`; the `stack`
  builder emits a flexbox COLUMN with the gap + margin, building + flexifying EACH item on its own (so two
  band rows never merge into one). JS: `stackOf` + `stackNode`; the section row-cell loop was lifted into
  `rowBlockToItems()` so a nested row uses the same cell logic.
- **A painted empty panel is content.** `is_painted_panel()` (no text / media, a gradient or colour
  background, ≥80px tall) counts as a substantial cell and `layout_cols` keeps it as `{paint}`;
  `apply_panel_paint()` puts one linear layer on the flexbox's native Background gradient, a multi-layer
  stack as the cell's scoped `background-image`. JS: `isPaintedPanel` / `cell.paint`.
- **A band row wears its card.** `layout_row` carries the row's own `read_card_skin()` as `rowBox` (+ `clip`
  when a cell is painted — the panel reaches the card edge) and its `min-height`; `carry_row_skin()` stashes
  them on every column and `flexify_items` registers the Box Preset + min_height on the row flexbox. JS:
  `rowBox` / `minh` → `_row_box` / `_row_minh` → `_box` on the row (the census assigns `border_preset`).
- **The copy cell keeps its layout.** `el_padding()` gained a computed-shorthand fallback (`.copyzone{padding:
  36px}`), applied via `apply_cell_pad()` in nested rows too; `cell_geometry` → `vjustify` (space-between /
  around / end) → `content_v` between / around / bottom (`content_layout_over` maps them). A `heading` (h3+)
  that follows a pending overline-only head becomes that head's TITLE, so `label → h3 → p` fold into ONE
  special heading; the nested-row loop now builds `blocks` cells (they were dropped).

### Card shadows, heading rhythm, decorative glows (2026-09-12)

Story-section pass, steps 3 / 5 / 6 — the section now measures equal to the source on every planned row
(cards 737×640 / 627×640, two shadow layers, clipped glow, cover-filled tile, eyebrow / title / copy / pills at
+154 / +185 / +353 / +445, title fluid 80.6px@1440 → 56px@1000). Rules, both twins; fixtures golden `[G2]`
(shadow), `[G4]` (rhythm), `[G5]` (glow) ↔ `grid-geometry-parity.test.mjs` + `heading-rhythm-parity.test.mjs`:

- **Multi-layer box shadow (step 3).** `build_box_presets`: `$shadow_layers()` splits a shadow on top-level
  commas (transparent / all-zero layers dropped); the native Box Shadow field takes the MOST VISIBLE layer
  (`$parse_shadow` — a non-inset drop over an inset highlight, then the widest blur; the first-listed layer of
  `inset 0 1px 0 …, 0 22px 60px …` was only the 1px highlight) and `$shadow_css()` puts the FULL value in the
  preset CSS as `{{SELECTOR}}{box-shadow:… !important;}` (the native state rule is `!important` too; this
  lands later in source order). The derived census keeps `shadow_full` beside its most-visible `shadow`. The
  button-preset rule, applied to boxes. JS: `shadowLayersOf` / `parseShadow` / `shadowCss` in `box-presets.mjs`.
- **Heading rhythm (step 5).** (a) `is_pill()` (the eyebrow gate) is framework-agnostic: computed
  `text-transform:uppercase` + `letter-spacing ≥ 1px` + `font-size ≤ 14px`, a text leaf, NOT boxed — a
  plain-CSS `.section-label` div folds into the native Overline (JS `isOverline` computed branch). (b) The
  overline's exact type + the title's own `margin-top` as the gap under it → scoped `.heading-overline{…}`
  (no native size field). (c) The title→subtitle gap may live on the SUBTITLE's `margin-top` (`subtitle_mt_px`
  → `title_mb_px` fallback → the exact `.heading-title{margin-bottom}` rule + `element_spacing`). (d) A subtitle
  at the BODY size (no Text Style preset matches) carries `font-size:16px;line-height:32px` explicitly — the
  heading's subtitle scale would otherwise enlarge it. (e) An explicit ZERO subtitle bottom margin → the block's
  outer margin `mb-0` (the next row's margin-top carries the gap; the theme default doubled it). (f) A FLUID
  title: the heading recognizer reads the declared `font-size` from the source stylesheet (`stylesheet_decl`
  now reads the `<style>` blocks off the owner document) and, when it is `clamp()` / `min()` / `max()` / vw,
  carries the expression as `.heading-title{font-size:…}` so the title scales with the viewport (JS:
  `sheetFontSizeDecl` → `fsDecl`).
- **Decorative pseudo-layer (step 6).** `capture.mjs` stamps a NON-covering, painted, text-free
  `::before/::after` on any section/main element as `data-sc-decor-pseudo` — offsets on the two nearest edges +
  size as PERCENTAGES of the box (so it scales), background, filter, opacity, radius. `Stitch::cell_geometry`
  → `parse_decor_pseudo` → `Mapper::carry_cell_geometry` → `decor_pseudo_css()`: `selector{position:relative;
  isolation:isolate;}selector::before{…;z-index:-1}` — under the content, over the card's fill. A glow that
  reaches OUTSIDE the box (negative offset, or offset + size > 100%) sets the card skin's `clip`, so its Box
  Preset carries `overflow:hidden` like the source. `read_card_skin` also reads a stamped computed
  `overflow:hidden|clip` into `clip`. JS: `cell.decorPseudo` (`capture-extract`) → `decorPseudoCss` (`to-pages`).

### Chip row: pill labels → a flex row of boxed Text Blocks (2026-09-12)

Story-section pass, step 4 (taken ahead of the shadow step). `.inline-metrics > .metric × 3` — a flex row
of 10px uppercase tracked labels in 50%-white pills — was claimed by `layout_row` as a 3-column grid: each
pill became a bare 18px text_block in a third-width cell (the verbatim path stripped the skin; the long
label wrapped). Rules, both twins; fixtures golden `[G3]` ↔ `chips-parity.test.mjs`:

- **Recognizer `chip_row` (priority 83, above `layout_row` 82).** Gate `is_chip_row()`: a flex container
  (computed `display:flex` / `inline-flex` or the utility, not a column) with 2–12 element children, EVERY one
  a short text leaf (own text 1–40 chars; no link / button / media / heading / paragraph / list inside; an
  empty dot/pip div is allowed) that is BOXED (`Mapper::text_is_box` — a fill, gradient, border or shadow) or
  pill-shaped (radius ≥ 40px). Emits `{ t:'chips', gap, align, mt, mb, items:[ text blocks ] }` — each item
  the same `{t:'text', cls, cs, text, html}` shape `collect_blocks` uses for a leaf. JS: `chipRowOf()` +
  the walker's `chips` branch in `capture-extract`; the text-leaf fields were factored into
  `textLeafBlock()` so a chip and a plain paragraph share one builder.
- **Builder `chips`.** A wrapping flex row (`display:flex`, `wrap`, `align_items:center`, the source gap
  via `gap_slug`, `justify_content` from the row's `justify-content`, the source margin via
  `spacing_token`) whose cells are the chips themselves through the **`text` builder** — so the existing
  boxed-text rule gives each a Box Preset on its native Box Style (fill / border / radius / padding — the
  three share one preset) and the base carries only typography (10px, uppercase, tracked). Chips size to
  content (a flex item's default), so nothing wraps. JS: `chipsNode()` + `textBlock()` per chip; the skin
  rides `_box` → the capture.mjs census assigns `box_style`.
- Measured on the corpus source at 1440px: 188 / 135 / 204 × 41px pills, 12px gap, 28px above, radius
  999, 50% white, hairline, 10px / 2.2px uppercase — all equal to the source.

### Framed photo tile: cell box → clipping Box Preset, lone image → media_image FILL (2026-09-11)

Story-section pass, step 2. A grid cell that is itself a card (radius + fill / gradient / border) and holds
ONE image that fills it (`.split-right` — 627×640, radius 42, gradient, hairline, shadow, `<img>` at
100%/100% object-fit cover) rendered as an unframed, letterboxed 455px image: the verbatim cell path
strips computed styles, so the structural mirror unwrapped to a bare `<img>`. Rules, both twins;
fixtures golden `[G2]` ↔ `grid-geometry-parity.test.mjs` "framed photo tile":

- **A cell's OWN card skin rides on every cell shape.** `layout_cols` now reads `read_card_skin($cell)`
  (the cell element only, no descent) once and attaches `cardBox` to the image-composite, lone-video and
  verbatim cells too (the decomposed content column already had it). JS: `cell.cardBox` in the
  `cell.image` path (`capture-extract`), carried through `columnToFlexboxCell` as `_box` (single- and
  two-node cells) and assigned by the capture.mjs census as `border_preset` on a **flexbox** cell as on a
  column.
- **Lone image in a card → native `media_image` in FILL mode.** `cell_is_lone_image()` (one `<img>`, no
  text / video / svg) + `image_fills_cell()` (computed `object-fit: cover` — stamped by capture ≥1.10.82 —
  or `object-cover` / `w-full h-full`, or the image as tall as its frame within 4px) → an `image` block
  with `fill`, on a column with `stretch` (`content_v = top` → a flex column, `justify start`). The
  builder appends `selector{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}selector
  img{flex:1 1 auto;width:100%;min-height:0;object-fit:cover;display:block;}` — scoped, because the core
  image helper honours `object-fit` only with an aspect ratio (width+height both set → contain). A lone
  image with NO card box stays verbatim on purpose (organic-blob masks ride the Tailwind path).
- **A media frame clips.** `cardBox.clip` (set for lone-image / lone-video cells) → `register_box_preset`
  stores it, `box_slug()` keys it (only when set, so text-card slugs are unchanged), and
  `build_box_presets` emits `{{SELECTOR}}{overflow:hidden;}` in the preset CSS — a tile preset is
  distinct from the same skin on a text card. JS: `skinSig` + the derived-preset `ccss`.
- Capture PROPS gained `object-fit` (skip `fill`) and `overflow` (skip `visible`).
- Measured on the corpus source at 1440px: tile 627×640 with radius 42 / gradient / hairline / clip,
  image 625×638 object-fit cover — all matching the source (was: no frame, 682×455, fit fill).

### Grid cell geometry: unequal tracks, card min-height, vertical centring (2026-09-11)

Story-section pass, step 1 (a two-card split band: 1.08fr / .92fr glass panel + image tile, 640px tall,
content centred). Rules, both twins; fixtures golden `[G]` ↔ `grid-geometry-parity.test.mjs`:

- **Unequal source tracks → a native Grid with the exact track list.** `Stitch::grid_px_tracks()` reads the
  parent's computed `grid-template-columns` (a plain px list matching the child count) and stamps each
  cell's track on its column (`track`); the mapper's `cells_track_list()` turns a run whose tracks differ
  by more than 2% into `display:grid` + `grid_columns = "1.08fr 0.92fr"` (each = track/sum × N; the flexbox
  view accepts a raw template natively and still collapses to one column on phones) and drops the cells'
  12-span widths. Equal tracks keep the span / equal-grid paths. Applied in both row assemblers
  (`flexify_items` and the section-level hybrid row). JS: `capture-extract` `cell.track` (rendered width),
  `to-pages` `trackList()` in `flexifyItems` + the section row.
- **A cell's fixed min-height and vertical centring ride on the cell.** `Stitch::cell_geometry()` reads the
  cell's computed `min-height` (px, ≥120) and `display:flex; flex-direction:column; justify-content:center`;
  `Mapper::carry_cell_geometry()` puts `min_height_px` / `content_v = middle` on every column shape (counter
  row, nested grid, section row), and `column_to_flexbox_cell` emits the flexbox `min_height` (px; on the
  inner Div of a two-node cell, since the card is the inner) while `content_layout_over` turns `content_v`
  into a flex column with `justify_content: center`. JS: `cell.minH` + `flex.dir/justify` →
  `min_height_px` / `content_v` in the cell replay, consumed by `columnToFlexboxCell`.
- Measured on the corpus source at 1440px: tracks 736.5 / 627.5 (source 736.5 / 627.5), both cards 640px,
  left content centred — all three were 682 / 682 / 577 / top-aligned before.

### Full-width header inset + pseudo-element scrims (2026-09-11)

- **A header with NO wrapper is Full Width, at the source's own inset.** `detect_chrome_container($root,
  $bare_is_fluid)`: a plain-CSS wrapper now counts by its COMPUTED max-width alone (≥900px, no utility class
  needed); when the bar has no container class and no capped wrapper at all it returns `'fluid'` (opt-in from
  `detect_header_chrome_styles`, and only when the header is not a floating pill — a hug-width pill also has
  no wrapper and must not stretch). `header_layout.container = container-fluid` + the bar's own side padding
  (`hstyle.pad_x`: the header's `padding-left`, else the first padded row within 3 levels) →
  `.site-header .header-main .fw-container-fluid{padding-left/right:Npx}`; a two-row header's Bottom/Top Bar
  inner container goes flush (`padding:0`) because the bar row already carries the source padding. Before,
  the theme's default fixed container put the logo 80px in where the source had 28px. JS: `to-theme-settings`
  fluid branch (bar `max-width:none`) + `rows.brand_pad_x` / `bar.padding`. Fixtures: golden `[H]` (3 new
  checks) ↔ `header-chrome-parity.test.mjs`.
- **Pseudo-element scrim → native overlay + scoped remainder.** A hero tint painted by `.hero::after{inset:0;
  background: radial-gradient(…), linear-gradient(…)}` lives in no DOM element, so the converter never saw it.
  `capture.mjs` now stamps a covering `::before`/`::after` (absolute/fixed, inset 0 or ≥90% of the box, a
  gradient background without `url()` or a translucent colour) as `data-sc-scrim` (+ `data-sc-scrim-opacity`);
  `capture-extract` records the same as `section.pseudoScrim`. PHP `pseudo_scrim_of($el)` (element + 4
  ancestors, alpha scaled by the layer opacity) is the fallback in `media_bg_overlay()` and both video-band
  readers. The mapper's `overlay_layers()` splits the value on top-level commas: the first linear gradient /
  colour is the NATIVE `background.overlay` (editable), every other layer (a radial vignette) rides as
  `selector::after{…background-image:<rest>}` via `append_overlay_rest_css()` — `z-index:1` on a video band
  (above the video, under the lifted content), `z-index:-1` + `isolation:isolate` on an image band. Nothing
  dropped, nothing painted twice; the flat 35% fallback is skipped when the source scrim was only non-native
  layers. Fixture: golden `[V]`. Known JS gap: `to-pages` has no section-background-video path (it emits a
  `media_video` element), so `pseudoScrim` is captured for parity but not yet emitted there.

### Site container width = the DECLARED cap, not the viewport-limited measurement (2026-09-11)

The capture stamps `data-sc-content-width` = the browser-MEASURED main content width. That measurement is
viewport-limited: a `.shell{width:min(1440px, calc(100% - 48px))}` container measures 1392px at the 1440px
capture viewport, so the converted site's Container Width (`general_layout.layout_container_width.lg`, the
flexbox `content_width` push, `--container-max-desktop`) was pinned at 1392 and never reached the design's
1440 on a wider screen. Both twins now prefer the source's DECLARED cap when it is larger:

- **PHP** `Stitch::declared_container_cap($html, $measured)` (used by `detect_site_content_width`, so both the
  theme-settings emit and the mapper's site-width seed agree): root-level stylesheet rules (every `@media`
  block is brace-stripped — a responsive `.container` ladder is the container-ladder emit's job) declaring
  `width:min(Npx, …)` / `max-width:min(Npx, …)` / `max-width:Npx` on a single-class selector that ≥2
  elements carry (a per-section shell), with `measured ≤ N ≤ 1.25 × measured` (the measurement IS the
  declared cap squeezed by the viewport, so they must agree — an unrelated wide rule can't hijack it). Most
  occurrences wins. Fixture: golden `[W]` (1392 stamp + `min(1440px…)` shell → 1440; no rule → 1392; a
  1900px rule → not trusted → 1392).
- **JS** `capture.mjs` stamp: after the heaviest-bucket measurement, the winning bucket's elements are matched
  against the CSSOM's root-level rules with the same three declaration forms and bounds; the stamp becomes
  N when larger. `capture-extract.mjs` `containerMax` also parses `min(Npx…)` / `width:min(Npx…)` (its
  `parseFloat` read `min(` as NaN and never saw such a shell).

### Two-row masthead, every header CTA, header chips (2026-09-11)

Header structure rules in `tokens_to_theme_settings_chrome` (PHP `detect_header` → `ctas` / `rows` / `chips`;
JS `capture-extract` `header.ctas` / `header.rows` / `header.chips` → `to-theme-settings`). Fixtures: golden
`[H]` ↔ `header-chrome-parity.test.mjs` "two-row masthead". Verified against a two-row glass masthead in the
conversion corpus (brand row 78px over a 38px links-only nav row).

- **Two-row masthead → the native Bottom Bar (or Top Bar).** `header_rows()` finds a header direct-child row that
  is LINKS-ONLY (≥2 short non-button links, no image/button, the row's whole text = its links) beside a distinct
  BRAND row (an image / `data-sc-logo-svg` / a `brand|logo` class). The brand row keeps logo · chips · CTAs;
  the nav row's menu lands in `header_bottombar.bottombar_{left|center|right}` by the row's `justify-content`
  (a nav row ABOVE the brand row → `header_topbar`, unless a utility top bar already claimed it). The row's
  rule line → `bottombar_custom_styling` `bottombar_border` (width/style/colour — an `rgba()` hairline keeps
  its alpha, never flattened to a hex) + `bottombar_border_sides` = the edge FACING the brand row; its fill →
  `bottombar_background`; its exact padding / min-height / link line-height / item gap (no native fields) →
  scoped rules in the chrome residual (`.site-header .header-bottombar{…}`, `.header-row{min-height:0}`,
  `.primary-menu{gap}`). `header_layout.min_height` = the BRAND row's height (78), not the two rows stacked
  (117) — the theme lays the bar out as its own row. Hidden rows (bare `hidden`, `md:hidden`, display:none) are
  skipped so a mobile drawer never reads as a nav row. Negative: a one-row header keeps `menu_area` in the main
  row and an EMPTY bottom bar (always emitted, so a prior conversion's bar can't persist).
- **EVERY masthead action → a `cta_button`.** `header_actions()` lists all actions in DOM order (≤4): a
  `<button>` outside the nav with a text label (no `aria-controls`/`aria-haspopup` — those are dropdown
  triggers), a button-styled `<a>` (class `is_button` OR computed `cs_is_button`), a `tel:` link. Each resolves
  through the SHARED resolver `FW_Site_Converter_Mapper::button_preset_for()` / `button-match.mjs` to the
  colour + size preset matching its OWN skin (`cta_style` = `btn-{slug}`, `cta_size` = `btn-{slug}`) — the
  button presets are now built beside `header_main` and handed to the mapper, not only at the pages step.
  Fallbacks: no style match → the first CTA's fill-class role, else `''` (the bare `.btn`); no size match →
  `btn-lg` only when a Large preset EXISTS, else `btn-md` (the old "any sizes → btn-lg" hack is gone).
- **Translucent (glass) skins match their preset.** The resolver compared opaque triplets only — an
  `rgba(255,255,255,.2)` fill on an `rgba(95,73,42,.08)` hairline was "no fill" on both sides and every glass
  button fell to the bare `.btn`. Both twins now compare RGBA quads (`rgba_quad` / `rgbaQuad`; alpha weighted
  ×400 so a .1 alpha step ≈ the 40-unit colour tolerance). `button-match.mjs` is the one JS resolver (to-pages
  body buttons + to-theme-settings header CTAs share it).
- **Decorative text chip → `list_item`.** `header_chips()`: an element in the header with its OWN short text
  (≤80 chars) that is not a link/button/nav item/brand and is pill-shaped (radius ≥40px) or a filled padded
  box → a `list_item` (`li_text`, `li_link_type:none`); a tiny empty child (≤12px, own fill) → an inline SVG
  circle `li_icon` in its colour; the source's `@media (max-width:N){.chip{display:none}}` → the element's
  `visibility` (`≤767` → `hide-xs`, wider → `hide-xs`+`hide-sm`; never `hide-md`, which would hide every
  desktop); `element_css_class` = `sc-hdr-chip` and its pill skin (only properties the source set: gap,
  padding, radius, fill, colour, type, border) + the dot's size/glow ride as scoped CSS on the theme's own
  `.list-item` / `.list-item__icon` markup. Two-row header → the chip sits in `main_center`; one-row → ahead
  of the icons/CTAs in `main_right`.
- **Header hairline from the source sheet + its exact colour.** `detect_header_chrome_styles` falls back to
  `stylesheet_decl($html, $chrome, 'border-bottom')` — the header's own `.class{border-bottom:1px solid …}`
  rule — when the computed stamp carries no bottom border (captures before 1.10.78 stamped `border-top-*`
  only; `capture.mjs` PROPS now include `border-bottom-*`). A known hairline colour (computed or declared)
  → `.site-header.site-header--border{border-bottom:1px solid <colour> !important}` so a faint translucent
  rule reads like the source instead of the theme's default tint (JS: `header.element.borderBottom*`).
- **Menu hover from the captured `:hover`.** `detect_menu_styles` reads `data-sc-hover` `hover-self{color:…}`
  on the nav links (the source's own `a:hover{color}` rule, any framework) and it BEATS the "odd colour =
  active" guess. JS: `hoverStyle()` falls back to scanning the stylesheets' `:hover` rules that match the link.
- **Padding-less nav links pin the theme inset to 0 + carry the gap.** ≥2 nav links with NO padding (a flex
  row spaced by `gap`) → `menu_link_padding_x/y = 0` and `.site-header .primary-menu{gap:Npx}`; the theme's
  default 0.5rem × 1rem inset otherwise inflated a 15px source row to 36px. Links WITH padding keep the
  median inset (JS now ports the PHP H3 padding rule too).

### Header chrome + faithful-base fixes (2026-08-21)

Header chrome (all in `class-fw-site-converter-stitch.php` `tokens_to_theme_settings_chrome` + the theme
generator; verified against a split-nav luxury source):

- **Logo picks the image/brand, not a nav link.** `detect_logo` ranks home-href anchors: an anchor
  containing an `<img>` (image logo) wins, else one OUTSIDE `<nav>`, else the first — fixing the "logo renders
  the word HOME" bug (it used to grab the first `<a href="/">`, which was the "Home" nav item).
- **Logo image survives import.** The theme-settings media step blanked a media value's whole `{url,
  attachment_id}` before the sideloader could re-attach it (so the logo dropped to site-title text). `strip_media`
  now blanks only the source `attachment_id` and KEEPS the url, so `localize_media` sideloads it — a general fix
  for every theme-settings image/background, not just the logo.
- **Split nav → Primary + Secondary.** `extract_menus` now emits a `primary` menu (first `<nav>` cluster) AND a
  `secondary` menu (the rest) when a header has ≥2 clusters around a centered logo (`header_nav_clusters` /
  `nav_links`). The chrome assembly places menu-left · logo-center (`detect_logo_centered`) · secondary-menu +
  icons-right; the theme generator bootstraps a Secondary WP menu (both raw + native paths), and the header's
  inline menu renderer is location-aware so the secondary renders inline (`.primary-menu`), not a bulleted block.
- **Header icons.** `detect_header_icons` maps an icon-only search button → the native `search` element and a
  cart/bag icon → a `custom_html` element carrying the source SVG (no native cart element). The theme's `search`
  element now renders an **icon that toggles a field popover** (navigation.js) instead of an always-open box.

Faithful-base / re-assertion fixes (the source is authoritative — see the re-assertion decision at
`/decisions/source-reassertion-vs-overrule-detector`):

- **Dark canvas.** `parse_tokens` returns an empty colour map for a Tailwind-v4 (external-stylesheet) source, so
  `$tokens['colors']` is now enriched with `extract_semantic_colors`; `token_color` falls back to `color_to_hex`
  for `rgb()` values; and the site-background lookup includes the `bg`/`canvas` keys — so a dark source finally
  gets a dark `<body>` (was always white).
- **Copyright font + border.** The converter now maps the © line's typography (`detect_copyright_typography`),
  and its `copyright_custom_styling` is nested under `copyright_settings.yes` (where the theme reads it). The
  theme's footer-bar custom-styling selectors were bumped to (0,3,0) so a custom copyright border beats the
  footer-divider rule.
- **Inline links + spans.** A `btn-link` CTA re-asserts the source's transform / tracking / size / weight /
  padding (not just colour). A heading's nested `<span>` with an out-of-palette shadcn token (e.g.
  `text-muted-foreground`) has its computed colour baked inline in `scrub()` before the class is stripped.
- **Text Style tracking unit.** The Lead/body Text Styles keep the `px` unit on captured letter-spacing (a bare
  number is read as em by the consumer → a `0.5px` source would render `0.5em`).
- **Card title weight + button hover.** A product/card title re-asserts its captured `font-weight` (`titleWeight`
  → scoped `.imgbox__title`). `build_button_presets` seeds its token map with the semantic palette (+ `muted`≈
  `secondary`) so an inverting `hover:bg-muted hover:text-foreground` resolves instead of going white-on-white.
- **Text Style colour.** A derived body Text Style carries its source `color` when it's a distinctive mid-tone
  (a muted subtitle → its muted colour), skipping near-white/near-black ink (`is_near_bw`).

### Inner-page vs homepage awareness (2026-08-21)

A single-URL convert used to hard-code the page as the site's FRONT page (`front => true`) with a slug from the
`<title>` — so converting an inner page (`/services`) hijacked the homepage pointer and re-derived the whole
child theme + chrome. The build now infers the target from the source URL PATH (available as the `source_url`
build opt): **root** (`/`, `/index.*`, `/home`) → the homepage (blank slug → `home`, set as front page); **any
inner path** → a NEW page under the clean path-segment slug (`/services` → `services`), `front:false`, homepage
untouched (idempotent by slug, so a re-convert updates that page, never Home). The Convert panel's **"Set as
homepage"** checkbox (`set_as_homepage` opt — auto-ON for root, auto-OFF for inner) always overrides; typing an
inner URL also auto-unchecks Create-child-theme / Capture-header / Capture-footer (content-only import) unless
the user touched them. Rationale: `/decisions/inner-page-conversion-infer-from-url-path`.

### Ambient backgrounds + Preloader → Animation Engine, with AI fallback tiers (2026-08-29)

Two site-wide/section chrome features now translate deterministically (in `class-fw-site-converter-stitch.php`),
each with an **AI tier** for the ambiguous long tail. Both require/activate `animation-engine` (added to
`theme-design.json` `needs_extensions`, so the importer auto-activates it, like `animation_cursor`).

- **Ambient section backgrounds → stacked `bg_effect` slots.** `detect_section_bg_effects($node)` scans a
  section's subtree for DECORATIVE, descriptively-named particle/ambient layers (a `<canvas>`, aria-hidden,
  a `fg`/`particle`/`layer` marker class, or absolute/fixed position) and keyword-maps them to the nearest
  built-in effect: leaf/leaves/sakura/petal→`snow`(petals), ember→`snow`(embers), snow/rain/starfield/
  confetti/bubbles/fireflies/meteors/particles/grain→`noise`/matrix/aurora… De-duped, capped at 4. Stashed as
  `$sec['bgEffects']`; `apply_section_bg_effects()` (mapper) writes `bg_effect`, `bg_effect__2`, … on the
  section. **JS parity:** `findBgEffects()` (capture-extract) + `to-pages` apply. **AI tier:** an unnamed
  animated backdrop (raw WebGL/three.js canvas) becomes a `bgFxCandidate` (tokens + engine hint); `bgFxMicroTask`
  (to-ai) picks the closest catalog effect (or none) via the local model / the cloud AI — non-destructive, only where
  deterministic found nothing. *Verified on kage:* `fg-leaves`+`fg-sakura` → one `snow/petals` layer.

- **Preloader → Preloader module "Custom (code)" style.** `detect_preloader($html)` finds a source loading
  overlay — a NAME match (`preload`/`loader`/`splash`/terse `#pre`/`.pre-*`) AND an overlay trait (a hide-state
  class like `done`/`loaded`, or the source CSS positions it fixed/absolute — the capture's `data-sc-cs` omits
  position, so read the source sheet). It fills `animation_preloader.enable=yes` + `preloader_style` = `custom`
  with: **HTML** (outer markup, `data-sc-*` stripped via DOM, hide-state class/inline opacity removed so it
  renders), **CSS** (`extract_scoped_css` — only rules referencing the overlay subtree's `#id`/`.class` + the
  `@keyframes` they animate), **JS** (`extract_preloader_js` — a self-contained loader script if present; `''`
  when intertwined with the app). **AI tier (Part 3):** when JS is empty and "Refine with AI" is on
  (`Mapper::$entrance_anim_ai` + `$entrance_anim_svc`), `Mapper::ai_preloader_js()` POSTs `{html,css}` to the
  capture service's **`/ai-preloader-js`** (→ `synthesizePreloaderJs` in to-ai) for a cosmetic loader script
  (animate the bar/counter, cycle phrases, call `window.upwPreloaderDone()`). Best-effort; stays JS-less on any
  failure. *Verified on kage:* html 588B, css scoped to `#pre`/`.pre-*`, js `''` (welded to three.js → AI tier).
  Detection is **PHP-only** (like `animation_cursor` — the JS capture path never mirrored chrome detection).

### Decorative image-layer scenes → the Parallax Scene shortcode (2026-08-30)

The `decorative_scene` recognizer now emits an EDITABLE **`parallax_scene`** element instead of a frozen
code_block when a scene decomposes into clean image layers. `scene_image_layers($el)` (stitch) turns each
`<img>` into a layer, reading its wrapper for the entrance direction (`data-fg-in`), sway (a `sway` class),
and flip (a `flip` class); z-order + a staggered delay come from DOM order; the capture omits layer POSITION
so the anchor is inferred (entrance side; a wall/hill/backdrop → full-width). `n_parallax_scene()` (mapper)
builds the node — a back-to-front parallax depth gradient, per-layer width by anchor, `placement:in_flow`,
`source:scroll`. Falls back to the verbatim code_block when there aren't ≥2 real image layers. *Verified on
kage:* 4 scenes → 4 `parallax_scene` nodes with their temple/tree/lantern layers; golden fixtures 362/0 + 20/0.
The `parallax_scene` shortcode itself (shortcodes ext) is self-contained (own parallax/entrance/sway runtime).

### Word/line/char text reveals → Text Effects split_reveal (2026-08-30)

`text_split_intent($el)` (stitch) detects a word/line/char SPLIT-reveal on source text — `.word-reveal`,
`.mask-line`, SplitText/Splitting.js, or per-word/char span lockups — returning `words` | `lines` | `chars`.
It's carried as the block's `text_fx`; `apply_block_anim` (mapper) and the `special_heading` builder (via the
shared `text_effect_from_cls()`) then set the Text Effects **`split_reveal`** att (`{ split_by, direction:'up' }`)
so the heading animates piece-by-piece — RICHER than the whole-element entrance (`anim_intent`), which it
replaces when present. Requires animation-engine. *Verified on kage:* `.display … word-reveal` h2 → words,
`.mask-line word-reveal` → lines; golden fixtures 362/0 + 20/0. PHP-only (the JS to-pages path has no
block-animation mapping).

### Scroll-animation capture tool (2026-08-30)

`tools/design-capture/scroll-capture.mjs` (capture service) scrolls a page in N steps and records (a) a
**filmstrip** of screenshots and (b) per-element **transform/opacity keyframes** across the scroll, then flags
the elements that actually animate on scroll (transform/opacity varies). Emits `scroll-animation.json` (a
machine-readable timeline — each animated element with its keyframes per scroll %) + `scroll-report.html`
(filmstrip + table). CLI: `node scroll-capture.mjs <url> [outDir] [--steps N]`; or `import { captureScroll }`.
Each animated element now carries a **`sig`** (tag + kept classes + text snippet, for matching to a converter
node) and a **`suggest`** — a Scroll-Motion-shaped classification: `reveal` (with `direction` + `trigger` scroll %),
`parallax`, or `motion` (validated: a fade+slide box reveals `up @22%`, another `up @78%`). NEXT: the converter
matches `sig` → source node and sets the scroll-reveal / parallax att from `suggest`.
**Scope:** it reads the DOM, so it captures DOM-driven scroll animation (GSAP ScrollTrigger, CSS scroll-timeline,
transform/reveal-on-scroll) — validated on a synthetic page (3 fade+slide reveals detected with clean
opacity 0→1 keyframes at their trigger %). A `<canvas>`/WebGL scene has no DOM to read (kage: 57 tracked, 0
animated) — the filmstrip still shows the motion, but there are no per-element keyframes. NEXT: map the
timeline → Scroll Motion / Scrollytelling atts, and wire the tool into the capture pipeline.

### Translation rules still to add (known gaps — a conversion needs these; teach them + a fixture case)

- **Segmented masthead (2-3 bordered "cards" instead of one bar)** — the zone boxes carry the design, and
  the theme has per-ROW Custom Styling but **no per-COLUMN styling**, so there is no native target. Carried
  as scoped CSS on `.header-col--*` from a `data-sc-zone` capture stamp. **MEASURED: 1 of 138 corpus sites
  (0.7%)** — corpus A 0/81, corpus B 1/57. So it stays a scoped-CSS fallback and does **NOT** graduate to a
  per-column option; a theme capability for one site in 138 is not worth the option surface. (This entry is
  kept as the worked example of the rule in `AGENTS.md` -> "fix the CLASS, then PROVE it generalises": the
  fix was proposed as the top candidate to graduate on the strength of ONE site, and the corpus count
  reversed that. Measure before you build.)
- **Decorative chrome widgets** (a progress/meter bar, a rule, a status pip beside the CTA) — no text and
  no link, so every text-driven extractor skipped them even though they are often the only colour in the
  header. Now emitted as `custom_html` from a `data-sc-decor` stamp, bar-shaped only (`w >= 3h`) so a
  square icon tile is not duplicated out of the logo.
- ~~**Capture completeness has no gate.**~~ — **LEDGER ADDED (capture-service 1.10.70).**
  `capture-residue.mjs` audits each chrome region for CANDIDATE design properties that are outside
  `data-sc-cs`'s 30-property allow-list and set to something other than their boring default, and writes
  **`capture-residue.csv`** into the bundle plus a one-line summary during the capture. On the worked
  example it surfaces, automatically and in the first rows, the three things that previously took a dozen
  screenshot round-trips to find: `border-bottom/left/right-width` (the allow-list carries only
  `border-top-*`), `width`/`height` 38px (an icon tile and a meter bar), and `min-height` 58px (the zone
  height). It is a LEDGER, not a gate — under-capture is normal; what matters is that it is now VISIBLE
  and countable across a corpus, so the allow-list grows from evidence.
- **Old note, kept for context:** capture completeness has no gate. Several chrome misses were not translation bugs at all — the value
  never reached the bundle (`data-sc-cs` stamps a fixed prop set: no width/height, nothing on the fill
  child of a meter, nothing on a shadow-DOM icon). A translation can only be as good as the capture, and
  nothing currently fails loud when a region is under-captured. Worth a gate of its own.

These are captured-class effects the "rules to keep" list above does **not** yet translate. Each is a
converter-fix opportunity (not a hand-tune), and each should land with a `tailwind-matrix.test.mjs` case:

- **Gradients** — `bg-gradient-to-*` + `from-*`/`via-*`/`to-*` (and arbitrary gradient backdrops) → the
  `background-pro` / `gradient-v2` option (both exist as targets), not a flattened `bg_color`.
- ~~**`backdrop-blur-*` / `backdrop-filter`** → scoped CSS (no native option yet)~~ — **CLOSED
  (theme 2.5.90).** Native now: `header_glass` + `header_glass_blur` + `header_glass_saturate`
  (`--glass-blur` / `--glass-saturate`). The converter emits the measured radius, and pins saturation to
  100 when the source blurs *without* saturating (the theme's frost adds `saturate(1.4)` by default, which
  over-saturates a blur-only source). Guarded by `header-chrome-parity.test.mjs`.
- **`shadow-*` / border / blob radius on a standalone image** — box detection covers card & container skins
  (→ Box Presets) and image radius/aspect/filter (→ Image Styles), and the button preset covers buttons. A
  standalone image that carries a skin `media_image` can't express (border colour/width, box-shadow, an
  organic/blob `border-radius`, ring/outline) is **no longer dropped**: as of 2026-08-02 it is preserved
  **verbatim as a `code_block`** (the `<img>` markup + every class survive, and the flattened source CSS still
  targets it), so `border-8 border-white shadow-2xl blob-shape` all render. A *bare heading* drop-shadow is
  still best carried via a box preset on the wrapper or scoped CSS.
- **`overflow-hidden` / clipping** → `element_overflow` (or scoped CSS). Note the `.imgs-wrap` default is
  now `overflow:visible` (shadows/glows render); only a hover-zoom crop needs `--imgs-overflow:hidden`.
- **Image `max-width` / intrinsic sizing** (`max-w-lg`, `w-[420px]` on an `<img>`) as a general rule, not
  only in the WooCommerce card context.

### Fidelity fixes landed 2026-08-02 (FreshPaws / a second AI-page generator pass — JS capture path)

A real conversion (a a second AI-page generator pet-boarding SPA) drove these converter-algorithm fixes. Each was diagnosed
by **measuring source vs. output** (never eyeballing) and fixed in the deterministic pass — listed here
so the *why* is preserved and so the **PHP `Stitch`/`Mapper` path stays in sync** (see "Keep the no-AI
algorithm in sync" below — these all still need PHP parity where the PHP path diverges).

- **Chrome must use the FAITHFUL mirror, not the lossy Theme-Settings rebuild.** `capture.mjs` set
  `chrome_via_settings=true` whenever any theme-settings existed → it threw away the captured `raw_chrome`
  (the source's real header/footer HTML + CSS) and rebuilt chrome from settings, which cannot express a
  custom logo lockup (icon + multi-tone text), a multi-column footer, or social icons. Now: prefer the
  mirror whenever `raw_chrome.header_html`/`footer_html` was captured (Rule 0.1 — chrome must match).
- **Responsive / variant utilities were silently dropped from carried CSS.** `stripPseudo` treated the
  ESCAPED colon in a Tailwind class (`.md\:flex`, `.lg\:hidden`, `.hover\:*`) as a pseudo-class and
  stripped it → the selector matched nothing → every `md:`/`lg:`/`hover:` rule vanished → a `hidden md:flex`
  desktop nav never un-hid (permanent hamburger). Fix: negative-lookbehind so an escaped `\:` is preserved.
  A cross-origin CDN stylesheet that becomes CORS-unreadable at extraction time is now re-fetched + inlined
  before extract so its rules are readable.
- **Dark `oklch()`/`oklab()`/`hsl()` section backgrounds now apply — the "cream hero" fix (site-converter 1.8.17).**
  The mapper's `rgb_triplet()` (which decides a section's band fill → its native Background colour) parsed only
  `rgb()`/`#hex`, returning null for the `oklch()` palettes AI builders (AI page builders) emit. So a hero whose
  computed `background-color` is `oklch(0.12 …)` (a near-black band) was dropped, the band fell back to the theme's
  LIGHT default, and its white heading went invisible (the burger hero rendered cream-on-cream). `rgb_triplet()` now
  falls back to `Stitch::color_to_hex()` (made public) for oklch/oklab/hsl → hex → triplet, keeping the "solid fill
  only" contract (a modern `oklch(… / .3)` slash-alpha scrim is still skipped). This cascades to every rgb_triplet
  caller (`norm_bg_color`, section-preset matching, button colours), so all oklch colours resolve now.
- **Background-media SCRIM no longer grabs a decorative particle / caption card (site-converter 1.8.17).**
  `media_bg_overlay()` (the legibility scrim carried onto a bg-video/image section's Background → Overlay) accepted
  ANY absolutely-positioned semi-transparent element and picked the highest-alpha one. On the burger hero that was a
  cream `rgba(255,242,216,.9)` — either a `.seed` sesame-dot particle (tiny, high-alpha) or the "Hydro-suspension
  plating" caption card (text-bearing) — so a 90% cream wash covered the whole hero and buried the video + text. A
  real scrim is FULL-BLEED and TEXT-FREE: the candidate must now show a coverage signal (`inset-0`, or `w-full`+`h-full`)
  and carry no text of its own. Particles (not full-bleed) and cards (have text) are rejected; a genuine `inset-0` fade survives.
- **Background-video HALLMARKS — a custom-CSS hero video is hoisted to the section bg (site-converter 1.8.22).**
  A `<video>` whose cover-fill lives in a `<style>` rule rather than an `object-cover`/`w-full h-full` CLASS
  (e.g. regenerative-landscapes' `#heroVideo` — `.hero video{position:absolute;object-fit:cover}`) read `$covers`
  false, so the hero shipped a tiny inline video instead of a full-bleed background. A muted + autoplay + looping,
  no-controls `<video>` is decorative by definition; when it's absolutely/fixed-positioned (itself or via a covering
  ancestor) it is now treated as a section background even without the cover CLASS. Corpus **bg_media 75 → 88**.
- **Header logo wordmark — brand-slot search now RECURSES (site-converter 1.8.24).** `header_brand_block` only
  scanned the header's DIRECT children; when the brand sits inside a wrapper that also holds a status chip + a CTA
  (regenerative-landscapes: `header-top` › `header-brand` + `season-chip` + `header-cta`, so the wrapper's combined
  text overflows the 48-char guard) it returned NULL, the wordmark was dropped, and the theme fell back to the site
  title ("Home"). `find_brand_slot()` now descends into a non-nav wrapper to find the leftmost brand slot inside it
  (a nav / >1-anchor link-cluster is still skipped without recursing). Corpus **logo 82 → 93** (with the trainer's
  logo scorer also updated to count an icon-only inline `<svg>` logo and to read only VISIBLE wordmark text).
- **Container width — loose-text sections no longer render edge-to-edge (shortcodes 1.14.74).** The Site Converter
  names a non-standard site content width as a `content-<px>` container slug (e.g. `content-1392`), and a contained
  band with no `max-w-*` wrapper of its own inherits it as a fallback cap. But that slug is only registered as a
  named preset when the source clustered that exact width, so a section that merely inherited it had no entry in
  `unysonplus_container_width_map()` → the flexbox view's cap silently vanished and the band spanned the full
  monitor (loose-text sections; the "content flush to the edges" complaint). The flexbox view now parses the px
  straight from a `content-<px>` slug, so the cap always resolves. Corpus **container 83 → 100**.
- **Icon-box INNER-wrapper padding → the icon_box's own spacing (site-converter 1.8.28, iconbox_pad 85 → 87).**
  A source card whose inset lives on an INNER content wrapper (`.tile > .inner{padding:18px}`) rather than the
  cell itself (`.tile` — no padding) lost that inset — the icon-box content sat flush against the card edge.
  `card_from_cell` now records `contentPad` (the heading's nearest padded ancestor within the cell), and
  `n_icon_box` applies it to the icon_box `spacing` — but ONLY when the cell carries no box skin (a rounded
  fill/border card's padding rides its Box Preset column, so this avoids double-inset), and never on a minimal
  gap-spaced card (no `contentPad` → correctly untouched, so regenerative stays 0). Still PARTIAL: a site with
  several card LAYOUTS (master-built: `.inner` vs `.tile`) only gets the inner-padded ones — the flat `.tile`
  cards are a separate sub-pattern.
- **HARNESS — bg_media is now DETERMINISTIC (built from the builder, not a rendered video).** The old scorer
  measured a hero video's RENDERED size, which races with autoplay load — the same site swung `bg_media` 100↔0
  run-to-run, inflating the baseline and producing phantom regressions on every diff. Now `import-site.php` reports
  whether the FIRST section got a `background.video`/`image`, matched against a source cover/positioned `<video>`;
  the score is stable. Also raised the importer's PHP `memory_limit` to 1536M (large sites otherwise fataled →
  phantom IMPORT-FAIL regressions).
- **STALE-MENU contamination — a conversion inheriting the PREVIOUS site's nav (site-converter 1.8.45).** Found by
  converting an UNSEEN real site (resend.com) through the improved converter: the hero + dashboard card were
  faithful, but the header showed "Collection / Optics / Archive" — nav items that are NOT resend's (its nav is
  Pricing/Docs/Features/…). Root cause: resend's nav is bare `<a>` links spread across THREE `<header>`s with no
  `<nav>`/`<ul>`, which neither the capture-side nor PHP `extract_menus` reads well, so the conversion produced NO
  `primary` menu — and on a REUSED install the `primary` theme-mod location kept pointing at a PRIOR conversion's
  menu (#61 "Studio Denim Header" = urban-visionary). Fix (bundle Phase 5-guard): after the menu import, when this
  chrome conversion assigned NO `primary`-located menu (with items), CLEAR the stale `primary` location so the
  theme falls back to no/default nav instead of another site's. Verified: resend's `primary` → cleared (stale nav
  gone); a normal site with a real nav is untouched (colosseum keeps "History Header": Hypogeum/Vomitoria/Velarium).
  MENU FALLBACK (site-converter 1.8.46): when the capture bundle carried NO menu, the bundle now falls back to the
  PHP `extract_menus(rendered.html)` for the PRIMARY (masthead) nav, so the header shows the SOURCE's real nav
  ("Pricing" for resend) instead of nothing. QUALITY-GATED: a `//header` parse of a site whose "header" is a HERO
  (getty/the-art-of-living's min-h-screen hero `<header>`) yields bogus empty-title items — so the fallback
  requires EVERY item to carry a non-empty ≤40-char label, else the menu is dropped (→ the stale-guard clears the
  location → no garbage nav). Verified isolated: resend → "Pricing"; getty → (none, bogus rejected); art-of-living
  → "Collection, Materials, Residence"; colosseum → "Hypogeum, Vomitoria, Velarium" (real navs preserved). Menus
  don't affect the scorer dimensions, so no corpus-score risk. Follow-ups: (1) on a REUSED install, re-importing
  the SAME site doesn't re-fire the child theme's `after_switch_theme`, so the theme's BAKED `nav_menu_locations`
  (in the generated functions.php) can override the bundle's assignment with a stale menu — a fresh generation
  (or `switch_theme` away first) assigns correctly; reconciling the theme-generator's baked nav with the bundle
  import is the deeper fix. (2) converter menus ACCUMULATE on a reused install (50+ "* Header"/"* Footer") — a
  cleanup candidate. (3) `extract_menus` still only gets resend's minimal top-level nav (its dropdown/mega items
  aren't reproduced).
- **STATS mis-read as a pricing table + a PORTAL video hijacking the hero (site-converter 1.8.39).** Reported on
  build-products-that-move-money: the hero rendered very poorly — a garbled "$4.2/mo" / "$18240000.00/mo" pricing
  table and a washed-out hero. Two recognizer bugs: (1) `cell_price_parts` read STAT/METRIC numbers ("$4.2B"
  processed volume, "$18,240,000.00" reference ledger) as plan prices, so `is_pricing_table` fired and the pricing
  shortcode FABRICATED a "/mo" (neither "/mo" nor "Plan" exists in the source). Fixed: a currency number with a
  magnitude suffix (`$4.2B`/`$18M`/`$9K`) or a value >= $10,000 is a stat, not a plan price → rejected. (2) The
  video recognizer's bg-hallmarks path promoted a rounded "Portal stream" PIP reel (`div.portal`, radius 40px, an
  autoplay/object-cover video in the right column) to the section BACKGROUND, washing out the hero. Fixed: a video
  whose intermediate wrapper (up to the section, exclusive) is a ROUNDED card (border-radius >= 24px) is CONTENT,
  not a backdrop → not promoted. Rounding is the discriminator, NOT the grid column — a genuine full-bleed hero
  video can fill a `data-sc-col` column via inset-0 + h-full/w-full with SQUARE corners (the-art-of-living), so an
  earlier data-sc-col clause wrongly demoted it and was removed. Corpus overall 99 unchanged, zero regressions;
  build-products hero + real stats restored, verified visually. NB the scorer scored this site 86 while it rendered
  badly — a real BLIND SPOT: per-section metrics passed the 2 surviving sections, and `bg_media` only flags a
  MISSING backdrop, never a wrongly-ADDED one or within-section flattening. Hardening the harness to catch
  structural failures (section-count vs source, hero presence, wrong-promotion, source/converted band diff) is the
  standing follow-up, alongside the computed-layout structure walk + AI-as-classifier direction (see roadmap).
  bleed layer only by the utility classes (`inset-0`, `w-full h-full`); a custom container named for what it is —
  `fullscreen-video-container` (living-architecture) — was missed and its hero shipped with no backdrop. Pass 1
  now also accepts a class matching `fullscreen|video-bg|bg-video|video-background|video-cover`, while still
  excluding a shaped content window (`*-portal`, `*-mask`, `*-shell`). living-architecture **bg_media 0 → 100**,
  visually verified (the video fills the hero at 1440×900). The other bg_media=0 sites (nox-liquid, the-line,
  terraform, national-geographic, reactive-forest, kinetic-fashion, human-centric, build-products) are SHAPED
  content videos the converter correctly leaves as content — the scorer's `srcHeroVideo` heuristic was
  over-flagging them; import-site.php now matches the same promotion criteria (a real backdrop vs a portal/mask/
  shell/column/rounded content clip), so those read bg_media=100 (N/A) honestly.
- **SITE TITLE / logo wordmark — brand from `<title>` for brand-less pages (site-converter 1.8.36).** A single-scene
  page with NO header/nav (fixture-04, fixture-05) has no brand chrome, so `detect_logo`
  returned empty and the masthead rendered the WP "Home" fallback. The site-title now derives the brand from the
  source `<title>`'s first segment (before a `|`/`–`/`—`/`·`/`:` separator — the same derivation the theme NAME
  already uses), so the masthead shows "Aether House" / "Lumina Gen" instead of "Home". **logo 0 → 100** on both;
  fixture-06 (no header AND no `<title>`) legitimately stays the "Home" fallback.
- **HARNESS — spacing excludes heroes + gap-spaced bands (score.mjs).** The metric counted any text section with
  <24px vertical padding as collapsed, but a HERO uses min-height + vertical centering (fixture-02's
  1083px bg-video hero) and a `section--gap-<n>` band uses child GAP for rhythm (fixture-03's `section--gap-32px`) —
  both legitimately have ~0 section padding. Now a tall centered/flex/min-height/full-bleed-media section and a
  `section--gap-≥16` band are N/A for the padding-collapse check (the gap px is read from the class, since the gap
  often sits on an inner flexbox and `cs.rowGap` reads 0). Cleared the false collapses (fixture-02 0→100,
  fixture-04 75→100, fixture-03 33→67); a genuinely flush content band still counts.
- **SECTION-LEVEL bg-video hoist — inset-0 layers AND self-absolute `video-bg` videos (site-converter 1.8.31).**
  A hero `<video>` (autoplay+muted hallmarks) that lives inside a section — either wrapped in an `absolute/fixed
  inset-0` (or `w-full h-full`) text-free bleed LAYER, or as the video ITSELF being the full-bleed backdrop
  (carrying a `video-bg`/`bg-video` class, or self-positioned absolute/fixed) — was previously DROPPED as decor
  before the per-element video recognizer ran, so the hero shipped with no backdrop. New `detect_section_bg_video($node)`
  (in `html_to_mapping`, called per section BEFORE block collection, mirroring `section_bg_image`) detects it, pulls
  `<source>`/poster/scrim, REMOVES it from the DOM, and returns a bg-video descriptor set as the section's
  `sectionBgVideo` (mapper → `apply_bg_video`). Pass 2 EXCLUDES a rounded (`border-radius ≥ 24px`) card or a
  grid-column-scoped (`data-sc-col`) panel unless it has a bg class — so nox-liquid's tilted, rounded `video-portal`
  content video in a 2-column [text|video] hero is correctly left as CONTENT, not promoted. Corpus **bg_media 76 → 85**,
  overall **93 → 94**, zero regressions; the-seed/biophilic/colosseum each **+14/+15**. The remaining `bg_media` gap
  is the genuine content-video-in-column framings (nox-liquid, terraform, reactive-forest, the-line) which are NOT
  section backgrounds — the scorer's `srcHeroVideo` heuristic over-flags them; promoting them would be wrong.
- **HEADER BRAND — stacked TWO-LINE text wordmark + tagline (site-converter 1.8.33).** A brand that stacks a short
  wordmark over a tagline as plain `<div>`/`<span>` lines — no `<b>`/`<i>`, no `tagline`-ish class — was dropped:
  the combined string ("Vesta Atelier Curated Living Spaces" = 5 words) blew the ≤4-word wordmark guard, so BOTH
  lines fell and the theme rendered the WP "Home" fallback. `detect_logo` now, when there's no `<b>/<strong>`
  primary, gathers the innermost text LEAVES of the brand slot in document order and splits the first SHORT line
  (≤24 chars, ≤3 WHITESPACE tokens — so a dotted acronym "S.P.Q.R." counts as ONE token, not 4 as
  `str_word_count` reads it) off as the wordmark, keeping the second as the tagline. Fixes art-of-living
  ("Vesta Atelier"/"Curated Living Spaces") + colosseum ("S.P.Q.R."/"Roma Antiqua") — **logo 0 → 100** each,
  visually verified. NB the remaining logo=0 sites (fixture-06, fixture-05) are genuinely BRAND-LESS sources
  (no header/nav/logo/img/title) — the "Home" fallback is the honest result, not a fixable defect.
- **IMAGE BOX — arbitrary VIEWPORT-unit card heights recovered (site-converter 1.8.33).** `box_decl_from_classes`
  (both Stitch + Mapper twins) now recovers `h-[Nvh]`/`h-[Nvw]`/`h-[N%]`/`h-[Nem]` in addition to `h-[Npx|rem]`,
  so an `object-cover` image in a viewport-height card (`min-w-[40vw] h-[80vh]` — urban-visionary's parallax
  lookbook) stops collapsing to 0 height (the "empty white gap"). The card gets the height; the image fills + crops.
- **ICON-BOX — inner-wrapper padding now applies to BOX-SKINNED cards too (site-converter 1.8.34).** `n_icon_box`
  dropped the `contentPad` inset (the source card's padding on an INNER content wrapper — `card_from_cell` records
  it, stopping AT the cell boundary so it never captures cell-ROOT padding) whenever the card was box-skinned,
  on the assumption its padding "rode a Box Preset column." But a rounded fill/border card carries its SKIN, not
  the inner wrapper's padding, so the gate dropped exactly the cards that most need the inset and their text ran
  flush to the rounded edge (regenerative/master-built: `.copyzone{padding:36px}` inside a rounded `article.band`).
  The gate is removed — `contentPad` applies in both cases, and since it only ever holds inner-wrapper (never
  cell-root) padding there is no Box-Preset double-inset; the per-side `empty($pad[...])` guards still never
  overwrite a real value. master-built **ibpad 25 → 100**, visually verified (no double-inset). NB a few
  image-topped `band` cards (regenerative, crystal) still don't populate `contentPad` — a deeper `card_from_cell`
  heading/cell resolution issue for image+copyzone bands — remaining minor lead.
- **HARNESS — iconbox_pad only penalises a VISUAL BOX (score.mjs).** The metric counted ANY `.fw-icon-box` with
  <1px horizontal padding as a miss, but a FLAT gap-spaced card (transparent, no border/radius — the-seed/the-line
  stack icon+heading+text with `gap-*` and NO inner padding) legitimately has none, and a top-only `border-t` RULE
  (solitary/regenerative: a thin top line + `pt-8`) is not a box either. Now only a card with a FILL or a
  `border-radius ≥ 4px` is measured; flat + top-ruled cards are N/A. This cleared the false penalties (the-seed,
  the-line, solitary → 100) and ISOLATED the genuine defects (rounded/filled cards actually missing padding), the
  same de-noising discipline as the contrast fix.
- **HARNESS — honest contrast (score.mjs) + min-sample guard.** Contrast is now judged ONLY over a MEASURABLE
  colour backdrop: samples are restricted to text INSIDE a `<section>` (chrome — a stale/shared footer, skip-to-content
  a11y links — is excluded), and text over a bg `<video>` (headless never paints it), a background-IMAGE/gradient,
  or an absolutely-positioned media caption is SKIPPED (its real backdrop can't be luma-judged, so it produced
  systematic FALSE low-contrast that swamped real defects). A min-sample guard (`contN >= 4`, else N/A) stops a
  media-heavy page's tiny sample from whipsawing 0↔100 run-to-run. Honest corpus contrast **92 → 97**; the former
  "outliers" (urban-visionary 51, cloud-forest, art-of-living) render FINE — their misses were all false positives.
  NB: the full-corpus run itself is FLAKY (sequential imports under MySQL load → theme-gen failures read as logo/
  contrast regressions); VERIFY any apparent regression with a deterministic `--only` re-run before trusting it.
- **CONTRAST cluster is RENDER-CORRECT — the residual dings are scorer false positives (verified 2026-09-07).**
  The remaining contrast<100 sites (the-art-of-the-burger, the-line, payment-operations, bespoke, cosmic, lumina,
  perspective, rebalancing) were investigated end-to-end and **render CORRECTLY** — `detect_body_background` DOES
  resolve the source's dark `oklch(0.12 …)` page canvas (`color_to_hex` → `#140000`), the body + sections paint
  dark, and white text sits legibly on dark (burger + the-line screenshotted and confirmed clean). The scorer's
  low reading has two harness causes, NOT a converter defect: (a) RENDER TIMING — the theme + generated preset CSS
  + web fonts land after `domcontentloaded`, so an early measure caught an unstyled (white) page → white-on-white
  false reading; `score.mjs` now waits for `document.fonts.ready` and polls until the body background is actually
  painted before measuring. (b) DEEP NESTING — `bgLuma`'s 8-ancestor walk can fall back to the body on very deeply
  nested text; harmless when the body is dark, but a residual source of noise. Net: the converter handles dark-theme
  sites correctly; do NOT "fix" contrast by forcing colours. (Earlier a blanket token-canvas guard was tried and
  measurement-REJECTED — that instinct was right to distrust.) Genuinely light bands with mis-applied white text
  would still be a real defect, but none survived visual verification in the current corpus.
- **HERO-HEADER mistaken for the masthead → hero swallowed (site-converter 1.8.42).** The FIRST defect the new
  `structure` metric surfaced: getty-images rendered its hero band with NO headline. Root cause — its hero is a
  `<header class="">` nested inside `<div class="… min-h-screen">` (the full-viewport height is on the header's
  ANCESTOR, not the header), with no separate `<nav>`. `is_hero_header` only checked the element's OWN class/cs,
  so it read the header as short → `header_root` took it as the MASTHEAD (its no-nav fallback `return $header`
  kept a hero as chrome), and the hero h1 never became a body section. Two fixes: (1) `is_hero_header` now also
  treats an element as a hero when a near ANCESTOR (≤3 levels) is full-viewport (`min-h-screen`/`h-screen`/
  `h-[≥60vh]`), gated by the existing h1/h2 requirement; (2) `header_root`'s no-nav fallback returns NULL (no
  masthead → the theme's default header) when the only `<header>` is a hero, so the hero flows into the body
  sections and its headline renders. **structure 55 → 100 on getty**, and the SAME latent bug fixed
  adaptive-high-fidelity-architecture (**+14**) and dark-forest-misty-morning (**+6**); corpus overall held at 99
  with ZERO regressions — no real masthead was misclassified (the h1/h2 gate protects that). Visually verified
  (getty's "Mastering the Optical Breach" hero now renders centered on its full-screen band).
- **HARNESS — container flush ignores a horizontal MARQUEE (score.mjs).** getty's "FORMAT FIDELITY · SPECTRAL
  PRECISION…" ticker spans far wider than the viewport by design (text L≈−80 → R≈5900), which read as a flush
  container defect. The flush check now only counts a text band that is ~viewport-width (`R−L ≤ 1.4·vw`), so a
  wide overflow scroller isn't a false flush. getty container 75 → 100; no other site affected (only getty had a
  wider-than-viewport text band).
- **HARNESS — a STRUCTURE dimension catches failures the per-section metrics miss (score.mjs).** The deepest
  lesson from build-products: the scorer scored a badly-broken page 86 because every per-section metric passed
  the 2 surviving sections — the harness was blind to the failures the USER hits (buried hero, flattening,
  wrongly-added backdrop). New `structure` dimension (weight 1.3). Calibrated across the full corpus, only ONE
  signal survived clean: **hero-present** (the first content section must lead with a prominent, >=28px, visible
  heading) → `structure` 55 when absent. It flagged exactly one site — **getty-images**, whose hero renders with
  NO visible headline (a genuine defect that scored 100 before) — with zero false positives. Two prototyped
  signals were CUT after calibration because they false-flagged healthy sites: `flattened` (rendered h2/h3 count
  can't tell a healthy 5-card features section from a real mega-section — false-flagged nox-liquid + das-wesen)
  and `wrongBg` (a rounded video WRAPPER alone isn't a wrong promotion — financial-infrastructure's rounded
  full-bleed hero video renders correctly). Both are still COMPUTED + reported (`php.wrongBg`, `m.flattened`) for
  triage, just not scored, so they can't cause false regressions. Better inputs (a source-band vs rendered-section
  comparison for flattening; video SIZE not just rounding for wrongBg) are the follow-up to make them scorable.
  NB getty-images' missing hero is now a KNOWN real defect the hardened harness surfaced — a fix candidate.
- **AI-AS-CLASSIFIER — structure verdicts advise the deterministic engine (PROTOTYPE, opt-in, site-converter 1.8.40).**
  The antidote to whack-a-mole: instead of adding another class-name heuristic per site, let a model make the few
  AMBIGUOUS structural calls that vary infinitely across markup, and keep the deterministic engine as the builder +
  validator. Pipeline: PHP `FW_Site_Converter_Stitch::structure_summary($html)` emits a COMPACT per-section signal
  summary (stable `sig` = first-heading slug, `dollars[]`, `hasPeriod`, `hasFeatureList`, per-video `{rounded,inColumn,
  cover}`, `bands`) → `classify-structure.mjs` (capture-service; the local runner offline OR the cloud AI, schema-constrained JSON via
  `askModel`) returns a per-section verdict `{sig, kind, pricing, video_role}` to `ai-structure.json` → the bundle
  importer loads it (gated: `FW_SC_AI_STRUCTURE` constant/`fw_sc_ai_structure` filter/env) and `set_ai_structure()`
  installs it; `is_pricing_table()` and the video recognizer then consult `ai_verdict_for($el)` (walks to the section,
  matches `structure_sig`) — ADVISORY: a verdict corrects the call, no verdict → heuristics decide. **Default OFF →
  the deterministic path is byte-identical.** Verified end-to-end on build-products: both the 4B local model AND the cloud AI return
  `pricing:false` (correctly reading "$4.2B"/"$18.24M" as STATS, not plan prices — the semantic win heuristics miss)
  and `video_role:content`; flipping a verdict provably flips the converter's decision (the-art-of-living hero bg
  video true→false on `video_role:content`). KEY FINDING: the AI wins the **semantic** call (stats-vs-pricing — both
  models nailed it), while a **mechanical** computed-style fact (rounded frame → content) is more reliable as a crisp
  rule than fuzzy reasoning (both models first said "background" until the prompt made the rounded→content rule
  explicit). So the division is: **AI for semantic judgment, deterministic for mechanical facts.** The `background`
  override is intentionally guarded by `in_card` (the AI can't force a clearly-rounded reel to full-bleed).
  CORPUS MEASUREMENT (site-converter 1.8.44, the 8B local model offline, 67 sites / 247 sections vs the deterministic
  ground-truth proxy): **pricing 98.8%, video_role 96.8%, both 95.5%, 0 failures** — a small OFFLINE model
  reproduces the ambiguous structural calls reliably enough to be a useful advisory tier (validator/fallback covers
  the residual). The residual splits into: 3 pricing over-calls on number-heavy sections (apple-card/lumina-arctic/
  planetary — exactly where the deterministic stat-guard catches it) and a handful of ambiguous bare-video cases.
  SIGNAL ENRICHMENT that lifted it: `structure_summary`'s per-video signals gained `bleed` (a full-viewport inset-0/
  fullscreen backdrop layer on the video OR a positioned ancestor) and a COMPUTED `object-fit:cover` check — the
  class-only `cover` under-reported a container-styled backdrop reel (living-architecture read `cover:false` →
  mislabelled; now `bleed:true` → correctly `background`). The canonical video_role rule (both prompt + truth):
  rounded → content; else bleed → background; else cover → background; else content.
  AUTO-WIRED INTO CAPTURE (capture-service 1.10.61): `capture.mjs` now, after writing a site's capture-out folder,
  runs the classifier and writes `ai-structure.json` automatically — gated on env `FW_SC_AI_STRUCTURE` (opt-in;
  unset = capture is byte-identical to before), best-effort (needs an AI backend + PHP/WP via env; any failure is
  logged and skipped, never blocks capture). So capture → convert now carries the advisory verdicts with no manual
  step, behind the same flag the importer reads. The classifier CLI now DEFAULTS to the selected LOCAL model
  (`selectedLocalModel()`) rather than the cloud AI: this task is schema-constrained and the local runner's `format` grammar
  GUARANTEES valid JSON, whereas the command-line agent path returns free text that missed the shape ("classifier returned
  no sections"); `--model` still overrides, and with no local model selected it falls back to the active backend.
  The pricing override is a one-directional VETO — `is_pricing_table` honors `pricing:false` (suppress a wrong
  table) but NEVER `pricing:true`, so the model's 3 pricing false-positives can't fabricate a pricing table or
  regress a stat site; the `background` override is `in_card`-guarded. This is what makes AI-on SAFE to enable.
  Next: run the same measurement on the cloud-AI backend for a quality ceiling; expand verdicts to section-split + a
  full role map; measure AI-on vs AI-off rendered scoring (expected ~neutral on the tuned corpus — heuristics are
  already correct — with the lift landing on UNSEEN sites where heuristics fail).
- **ROADMAP — improve the LOCAL-AI tier (local-runner backend in `to-ai.mjs`).** The local models (4B/8B, `to-ai.mjs`)
  are the free/offline tier and, per the code, "well below" the cloud AI. The cheap win is already in — the local-runner calls
  pass a JSON **schema to `format`** (constrained decoding → always-valid JSON, `think:false, temp 0`), so the model
  never emits malformed JSON. Remaining levers, cheapest first: (1) **few-shot / retrieval** — inject 2–3 similar
  SOLVED mappings from the corpus into the prompt before each call (no training, big lift for a small model on a
  patterned task; probably not wired yet). (2) **base/quant** — a bigger local model if the hardware allows. (3) **fine-tune
  via distillation** (the deep step, only after 1–2 plateau) — run the cloud AI over the corpus for gold outputs, LoRA-tune
  a local model with a fast single-GPU fine-tuning framework that exports GGUF (avoid thin, unproven
  wrappers over such frameworks), export GGUF → serve via the existing local-runner backend → validate with the converter-trainer
  harness. Determinism is unaffected (this only powers the optional AI-assist tier). The real cost is building +
  maintaining the distillation dataset as the builder-JSON schema evolves; a larger captured corpus directly helps.
- **Container max-width — content no longer sits flush to the screen edges (site-converter 1.8.21 + core presets).**
  Three linked gaps made converted sections span the full monitor width: (1) `unysonplus_container_width_map()`'s
  safety net only guaranteed `narrow`/`medium`/`wide`, so a section mapped to `wide-l`/`wide-xl`/`wide-xxl`/`small`/
  `prose` (e.g. a `max-w-7xl` = 1280 → `wide-xl`) resolved to NOTHING when the source had no `max-w-*` wrapper to
  cluster that width → the band rendered edge-to-edge; the safety net now guarantees all **eight** standard slugs,
  and the converter seeds the full scale in `build_container_width_presets` so they're registered + labelled.
  (2) `--container-max-desktop` was left EMPTY when a capture carried no `data-sc-content-width` stamp AND no
  header/footer `.container` chrome (apple-card) — `tokens_to_theme_settings_chrome` now ALWAYS resolves a width:
  stamped → header/footer box → the dominant centered content max-width across the body (`detect_dominant_container_width`)
  → 1280 default. (3) A section whose content is a root **flexbox** renders it full-width (the items-corrector skips
  the section's own `.fw-container` for a self-managed flex band), so the cap must live on the flexbox's own
  `content_width`; when the section had no detectable container (full-width flex + px gutters, no `max-w-*`), the
  mapper now falls back to the SITE container width (`Mapper::set_site_container_width`, gated on `!$hero_fullbleed`
  so bg-media heroes stay full-bleed). Verified: apple-card / build-products went from edge-to-edge to a centred
  1280px column at 1920px viewport.
- **Computed `position` is now stamped (capture 1.10.57) so custom-CSS full-bleed media is detectable.** The
  capture's `data-sc-cs` never carried `position`, so the recognizers' `sc_css($el,'position')` calls (video /
  image full-bleed detection) always read '' — a hero `<video class="w-full h-full object-cover">` whose
  full-bleed positioning lives in a `<style>` rule (`.portal-container{position:absolute}`) was invisible to the
  detector and dropped. Now a NON-default position (absolute/fixed/sticky only — static/relative skipped to
  avoid bloat) is stamped, so a cover-fill hero video/image in a custom-CSS **section-level** absolute container
  is hoisted to the section background.
- **PAGE-LEVEL fixed backdrop video → the first hero section's background (site-converter 1.8.16).** Some
  hand-authored sources pin a `position:fixed` (or `absolute inset-0`/`w-full h-full`) `<video>` as a body-level
  SIBLING of the content — a viewport-wide backdrop that shows behind the hero (high-performance-automotive-dynamics's
  car loop, payment-operations). Because it lived OUTSIDE every `<section>`, the per-section video-bg recognizer never
  saw it and the hero shipped with no background (a flat dark band). `detect_page_bg_video()` (in `html_to_mapping`)
  now finds that page-level backdrop — a positioned, essentially text-free layer, outside all section roots, carrying a
  `<video>` — pulls its `<source>`/poster + any gradient/rgba scrim, REMOVES it from the DOM, and attaches it to the
  FIRST section as `sectionBgVideo`; the mapper feeds that into the existing `apply_bg_video` (so it frames as a real
  hero with the scrim as the Background → Overlay). Only fires when the hero has no in-flow bg video of its own.
  Videos only — a page-level fixed `<img>`/oval-mask portal (national-geographic's SVG-clipped video) is a separate
  bespoke pattern the capture-service (verbatim) path handles better.
- **Logo wordmark carried for a longer multi-word brand (site-converter 1.8.14 / capture 1.10.56).** A div-based
  logo lockup (`<div class="nav-logo"><div class="logo-rect">[icon]</div> NATIONAL GEOGRAPHIC CONSERVATION
  TECHNOLOGY</div>`, no `<a>` link) whose wordmark is a 4-word / 43-char label was classified **icon-only** — the
  brand-block detector (`header_brand_block` / `_mkBrandBlock`) and the wordmark guard both capped brand text at
  24 chars (a limit meant to reject a glued nav row), so the long-word brand fell through to the whole header →
  too much text → dropped. Both now allow up to 48 chars WHEN the text is genuinely multi-word (≥2 space-
  separated words); a single glued token (`BrandFinancingResources…`) stays capped at 24. Verified:
  national-geographic now renders `inline-left` icon+wordmark (was icon-only, site_title "Home"). NB: a two-line
  brand (`<br>` between the lines) still glues without a space in the extracted text — a minor known nit.
- **Gradient text on the HEADING element itself is now carried (site-converter 1.8.13).** A hero heading whose
  gradient-text is on the `<h1>` DIRECTLY (`bg-clip-text text-transparent bg-gradient-to-r from-white via-gray
  to-[oklch]`) with a colour override in an inner span (swiss-luxury: "Orange Sapphire." gradient + "<span
  text-white>Absolute Fusion.</span>") rendered the direct text INVISIBLE — the Tailwind classes are dead on the
  body (transparent fill, but the gradient + clip never apply). `extract_gradtext_css` only handled gradient
  `<span>`s (crystal-universe's "Glass."), not a heading-level gradient. New `heading_self_gradtext_css($h)`
  reads the source heading's computed gradient from `title_cs` and emits a scoped `.heading-title` gradient-text
  rule (`background-image + clip:text + fill:transparent`), re-asserting any inline-coloured child span's own
  colour (`-webkit-text-fill-color:currentColor`) so it isn't swallowed. Verified: swiss "Orange Sapphire." shows
  the white→gray→orange gradient, "Absolute Fusion." stays white; crystal's span gradient unaffected.
- **Section-less `<main>` no longer collapses to ZERO sections (site-converter 1.8.12).** A `<main>` that holds
  the whole page as plain divs with NO `<section>` tags AND isn't a full-viewport hero (the-global-destination's
  `<main class="fractal-container pt-32">`) fell through `walk_section_roots` entirely — the dive found no
  section roots → **SEC=0, a totally blank conversion**. Now a semantic `<main>` with no `<section>`s is always
  segmented: ≥2 content bands → claim each; exactly 1 → claim it; a hero with no inner bands → whole; and a
  `<main>` with no detectable bands is claimed whole rather than dived-and-lost. Verified: the-global-destination
  SEC 0→3 (hero + product cards + copy render); payment-operations (2) and crystal (3, section-based) unchanged.
  This generalizes the full-viewport-hero segmentation below to any section-less `<main>` content wrapper.
- **Section-less full-viewport `<main>` is SEGMENTED into bands (content-drop fix, site-converter 1.8.11).** An
  AI-page `<main class="min-h-[120vh]">` that holds the hero PLUS a feature grid / gallery / CTA as sibling
  `<div>`s (no `<section>` tags) was claimed as ONE band by `walk_section_roots`, dropping everything after the
  first screen (payment-operations lost its 3-card feature grid; anime-environment-engine collapsed to 1
  section). New `segment_bands()` detector: when such a container splits into ≥2 content bands, each is claimed
  as its own section; a genuine single hero (no inner bands) stays whole. Helpers `is_content_band()` (heading /
  grid-cols / ≥3 media-or-paragraphs / ≥120 chars) and `is_decor_layer()` (an absolute/fixed bg-glow-scrim with
  no heading and <30 chars rides as background, not a band). Verified via builder JSON: payment-operations
  1→2 sections with all feature cards; anime 1→4; crystal (section-based) unchanged (the detector's trigger —
  section-less + full-viewport + ≥2 bands — never fires on a normal `<section>` page, so no regression).
- **Consolidated AI-page audit (66-site list, 35 captured/analysed 2026-09-06).** The dominant remaining
  decomposition gap is the **verbatim `code_block` fallback**: ~2-3 sections/site fall back, dominated by
  `detected=html`/`section-html` — whole sections (`py-NN relative overflow-hidden bg-*`) that match no
  section recognizer (52 cases / 22 sites) — and `image-composite` cards (an image + text-overlay card kept
  verbatim so its overlay anchors to the image). These render through the incomplete `.sc-tw` reproducer, so
  they read as low-fidelity / partially-dropped. NOTE on audit method: a rapid reset→import→screenshot sweep
  gives UNRELIABLE per-page RENDER metrics — `reset()` breaks the `page_on_front` linkage so a later screenshot
  can show a STALE prior conversion (measure the builder JSON per post, or convert one site and verify before
  the next, instead). The reliable signals are the per-section `conversion-report.csv` `fallback`/`why` columns
  and the source `rendered.html` — not a shared-homepage screenshot.
- **Hero CTA-button pair no longer mis-detected as TABS (capture-service 1.10.55).** The capture's tab-bar
  normalizer treated any div whose only children are 2-5 `<button>`/`<a href="#">` as a tablist — so a hero's
  CTA pair ("Deploy habitat" + "View logistics map") got wrapped into an sc-tabs widget, hiding the hero
  heading + image + badges inside an inactive tab panel (red-planet-architecture rendered with NO visible
  "Ares Logistics" heading; crystal-universe lost "Universes in Glass."; contemplative-realms too). Fix: after
  clicking each candidate tab and capturing its panel, REJECT the group when EVERY panel is identical — a real
  tabs widget TOGGLES content (clicking renders a different panel), a CTA/nav button row toggles nothing. The
  detection markers are stripped on rejection so nothing downstream sees tabs. Verified: red-planet/crystal
  heroes decompose to `special_heading` + real buttons (0 tab markers); a genuinely-toggling tab set (distinct
  panels) still normalizes to sc-tabs. This was the biggest single hero-fidelity bug in the AI-page corpus —
  most "tabs" detections there were CTA/nav button rows, not real tabs.
- **2-col media hero decomposes instead of falling back verbatim.** A hero's content column (heading + CTA
  buttons + a rating/social-proof row) collapsed to one `text` block (dropping the buttons) and its image+
  floating-badge column classified as nothing → the whole section stayed a verbatim `code_block`. Now the
  cell classifier decomposes a rich content column, emits a button GROUP as real button blocks, and a residual
  bespoke row (the rating) stays a CONTAINED code_block (not the whole section). **Absolute overlays are no
  longer discarded as decoration** (as of 2026-08-02): if a floating overlay on an image-dominant cell carries
  real content (a "24/7 Care" badge — text or an icon), the WHOLE cell is kept **verbatim as a `code_block`**
  (image + blob + badge, with positioning) instead of collapsing to a bare `image`; only an image with no
  meaningful overlay becomes the native `media_image`. Report: 0 fallbacks.
- **Full-bleed background layer → section background.** A CTA whose green band is painted by an inner
  `absolute inset-0 bg-primary` (section's own bg transparent) lost its background; `sectionComputed` now
  reads a full-bleed absolute layer's colour as the section `bg_color`.
- **Dark site canvas → Site Background (capture-service 1.10.54 + site-converter 1.8.10).** A dark AI page
  (AI-page: apple-vision-pro / orbital-horizon / the-art-of-the-burger / red-planet) converted with a WHITE
  body below the hero — its light body text then invisible in every uncovered gap. Root causes, all fixed:
  (1) the capture stamped computed styles on `body *` but **never on `<body>`/`<html>`**, so the page canvas
  (a `class="dark"` theme, an `oklch()` body rule, a CSS var, or a dark full-bleed wrapper div) was never
  recorded — `capture.mjs` now stamps the effective canvas (body → html → largest full-bleed wrapper) onto
  `<body>`/`<html>` data-sc-cs; (2) the capture's palette normalizer (`normc`) + `isDark` only parsed hex/rgb,
  so an `oklch()`/`hsl()` palette colour was dropped and `--color-bg` defaulted WHITE (white bg + white text)
  — both now convert oklch/oklab/hsl→rgb (mirrors PHP `color_to_hex`); (3) PHP `tokens_to_theme_settings`
  now reads the **rendered `<body>`/`<html>` canvas FIRST** (ground truth, resolves oklch) and only falls
  back to the palette `bg`/`canvas` token (which the builder sometimes mis-defaults to white); (4) a
  **light-text ⟹ dark-canvas safety net** — when no canvas is detectable (a fixed/WebGL/full-page-video
  backdrop) but the resolved body ink reads light, infer a neutral near-black Site Background so light text
  stays legible. Result on the 10-site AI-page audit: 9/10 now get a correct canvas (was ~2/10). A residual
  theme CSS-delivery quirk can still leave one dark site white even though the correct `site_background` is
  written — the conversion output is correct; the cascade/asset-optimizer delivery is the follow-up.
- **Full-viewport `<main>` / `<div>` hero with NO `<section>` → claimed as a band (capture reliability, site-converter 1.8.7).** An AI-page shape `body > (bg layers) > nav > main.min-h-[120vh] (the hero, holding the h1, zero nested `<section>`s) > footer` captured **0 elements**: `walk_section_roots` only claimed `<section>` / hero-`<header>` and dived through `<main>`, reaching no sections (the AI-page `payment-operations` hero — heading came out empty). Now `walk_section_roots` also claims a `<main>`/`<div>` child that is `is_hero_header()` (full-viewport-tall AND leads with a heading) **AND contains no nested `<section>`** (else it's a page-wrapper `<main>` — dive in for those). The hero heading then decomposes onto a real band instead of vanishing. NB: a page-LEVEL full-bleed `bg-video-container` that is a *sibling* of the hero (not inside it) IS now hoisted onto the first hero section's background video (`detect_page_bg_video`, site-converter 1.8.16 — see the page-level-fixed-backdrop note above); before that fix the dark band rendered on its solid fallback colour.
- **Heading FONT from a real heading, not the logo.** The heading-font picker sampled the logo's `<a>`
  wrapper (which computes to the BODY font) first → mis-detected Inter when every `<h1>/<h2>` is Nunito.
  Priority is now section heading → brand sample → logo.
- **Heading COLOUR = the dominant ink, plus per-heading overrides.** `colors.heading` sampled a coloured
  `<span>` inside a heading → set every heading green (turning an ink hero title green AND making a
  white-on-green CTA heading invisible). Now the theme default heading colour = the first real section
  heading's own colour (ink), and each decomposed `special_heading` carries its OWN colour via `title_color`
  (a white CTA heading stays white; a two-tone hero keeps its ink base + the span's carried `.text-primary`).
- **Heading SIZE snaps to the nearest Display preset by px.** The old `≥60px → display-1` threshold turned
  a 72px source h1 into the theme's 96px display-1; now it snaps to the nearest of the theme's display sizes
  (96/88/72/56/48), so a 72px h1 lands on display-3 exactly.
- **Decomposed BUTTONS carry the source fill.** `buttonBlockNode` emitted only label/link → every button
  collapsed to the theme's one default style. It now classifies the button (opaque fill → primary; white/
  transparent + border → outline; parity with PHP `button_style_class`) and carries the source utility
  classes so the carried section CSS paints the exact fill (green solid vs. white outline).
- **Card SKIN (box preset) carried onto the icon_box.** A feature card's wrapper skin (`bg-* rounded-* border
  p-*`) was dropped; the icon_box now carries the card wrapper's classes so the carried CSS paints the card.
- **Container width = the DESIGN MAX across breakpoints, not the value at one capture viewport.** A
  Tailwind `.container` is RESPONSIVE (its max-width steps up per breakpoint to a 1536px cap at `2xl`).
  Reading `getComputedStyle(.container).maxWidth` at the 1440px capture viewport returned **1280** (the
  `xl` step) and shipped a too-narrow site that mismatched the source on any ≥1536px screen. Fix: the
  container algorithm now collects every `max-width` declaration across ALL stylesheet rules (incl. inside
  `@media`) and takes the LARGEST rule an element matches → 1536px (the true design container). PHP parity:
  the theme-generator also pins the **mirror** header/footer `.container` to the same captured width
  (`body .sc-tw .container{max-width:… !important}`) — the parent theme's `body .container` (specificity
  0,1,1) otherwise beat the carried Tailwind `.container` rules and collapsed the mirror chrome to the
  parent's default (1218px) while the body sat at 1536 → a header/body misalignment.

### Heading: reproduce EVERY class effect — nothing dropped (2026-08-02)

> **Governing invariant (whole converter, both seams — REQUIRED).** No source content is silently
> dropped and every source class's *effect* is carried. When a node can't be mapped to a specific
> shortcode/option it **falls back to a verbatim `code_block`** (exact markup + all classes survive;
> the flattened source CSS still targets them) — never a silent `continue`/`return`. This holds in
> BOTH the capture **extractor** (`capture-extract.mjs`) and the PHP **mapper**
> (`class-fw-site-converter-mapper.php`). Skinned images (border/shadow/ring/blob), decorative
> flourishes with a class or inline style, absolute overlays carrying content (a floating badge),
> and standalone `<svg>` / non-provider `<iframe>` are all preserved verbatim, not dropped. Class
> filters strip ONLY whole-token animation/slider-library markers, never loose prefixes that eat
> semantic names (`slide-title`, `initiatives`). The only sanctioned drops are user-driven
> (`include:false` / `skip`) and non-content tags (script/style/noscript/template/header/footer/nav).
> Mirrored in the extension `AGENTS.md`. See also **Target architecture** below.

Principle: a translator must never silently drop a class — every class's *effect* lands in a native
option or the element's custom CSS. A decomposed heading was dropping `mb-6` (margin) and `leading-[1.1]`
(line-height): `headingNode` only translated `mb-*`/`space-y-*` from the heading-GROUP wrapper class, never
the heading's OWN class. Now a decomposed heading reproduces its FULL computed style:

- **Native options:** font-size → `display_size` (nearest preset), colour → `title_color`, align → `alignment`.
- **Advanced Custom CSS on `.heading-title`** (no exact native option): `font-weight` (beyond the display
  preset — font-extrabold/black), `line-height` (leading-*), `letter-spacing` (tracking-*), and the title's
  own `margin-top`/`margin-bottom` (mt-*/mb-*). `!important` beats the shortcode's defaults (e.g. the title's
  default `margin-bottom:1em`). Computed values are used, so the exact source rendering is reproduced.

Verified: H1 matches source on margin-bottom (24px), line-height (72px) and weight (800).

**Extended to text blocks & overlines (2026-08-02).** The same "nothing dropped" rule now covers every
decomposed **text** and **overline** block, not just headings. `capture-extract` records the leaf's
computed `fontSize`/`color`/`lineHeight`/`letterSpacing`/`marginBottom`/`textAlign`/`fontWeight` (+
`textTransform` for overlines), and `textBlock(html, style)` reproduces them: colour → the `text_block`
shortcode's native `text_color`, everything else → its Advanced Custom CSS (`selector{…!important}`) at
the exact computed values (only non-default props emitted). Verified on the CTA subtitle — reproduces
`text-align:center; font-size:20px; line-height:28px; margin-bottom:40px` + `color:rgba(255,255,255,.8)`.

### Rating / social-proof cluster recognizer (2026-08-02)

A hero social-proof cluster (overlapping avatars + stars + "4.9/5 from 500+ happy pet parents") was a
verbatim code_block. Now `ratingClusterOf` recognizes it (a `4.9/5` / `out of` score OR ≥3 star icons in
a short cluster) and splits it:

- **Avatars → the `avatar` shortcode in GROUP mode** (stacked, overlapping) — the source faces become
  editable `people[]`, and a "+N / 500+" social-proof `extra_count` is pulled from the caption.
- **Stars + score text → a verbatim code_block** (the source's own star glyphs + exact wording) —
  chosen over re-drawing stars via the `star-rating` shortcode because it's an exact visual match. (The
  `star-rating` node is still available as `ratingNode` for callers that prefer the native shortcode
  with its AggregateRating JSON-LD; it's the fallback when no source HTML was captured.)

Both are laid out in a `content_direction:row` column, like the source. The default att shapes for both
shortcodes were pulled from the live shortcodes (`fw_get_options_values_from_input`), and partial atts
are fine (the builder merges option defaults).

### Image-composite wrapper: keep the cell's FULL class list + fill the column (2026-08-03)

The hero image's blob backdrop wasn't full-width and the image wasn't centred, because the verbatim
image-composite's rebuilt wrapper was CLASS-LESS. `cardOf`… no — the row-cell's `cls` is `colClasses()`,
which keeps ONLY Bootstrap `col-*` classes, so the cell's own `relative flex items-center justify-center
lg:h-[600px]` were all dropped. Two fixes:

- **Capture the cell's full class list.** Added `fullCls` (the complete `className`) alongside `cls` on
  each row cell; the image-composite wrapper now rebuilds from `fullCls`, so the flex-centring + relative
  positioning + height classes ride along (code_block HTML isn't class-sanitized, so `lg:h-[600px]`
  survives). The image centres and the `inset-0` blob fills the cell again.
- **Fill the builder column with `width:100%`.** The builder column is `d-flex flex-row`, so the wrapper
  is a flex ITEM that shrinks to its content (the 512px image) instead of filling the ~700px column — the
  blob then couldn't span it and there was no room to centre. The wrapper's inline style is now
  `position:relative;width:100%`, so it fills the column; the image centres (86px each side) and the blob
  spans the full column. Verified: wrapper 684px, image centred, blob 650px.

### Hero image column: max-w-lg cap + decomposed-section @keyframes (2026-08-03)

Two fixes for the hero's image column (a verbatim image + a floating "24/7 Care" badge):

- **`max-w-lg` was captured but not winning.** The class + rule were carried, but a decomposed section's
  carried CSS is emitted GLOBAL + un-important, so `.max-w-lg` (0,1,0) lost to the theme/plugin element
  reset `.woocommerce img { max-width:100% }` (0,1,1) and the image rendered full-width (684px) instead of
  its 512px cap. Fix: `importantifyMaxSize()` re-asserts carried `max-width`/`max-height` with `!important`
  in the section CSS (source intent; still responsive — `w-full` keeps it fluid below the cap). Image now
  512px. (The mirror path wins this via `.sc-tw` scoping; decomposed sections needed this instead.)
- **`animate-bounce` set an animation with NO frames.** The badge got `animation-name: bounce` (the
  `.animate-bounce` rule carried) but did NOT move — the per-section CSS harvest keeps only STYLE rules
  (siteRules), so `@keyframes bounce` was dropped (they match no element). A named animation with no
  keyframes is silent. Fix: `missingKeyframes()` scans each section's content HTML + carried CSS for a
  known Tailwind animation (`animate-bounce`/`pulse`/`spin`/`ping` or `animation:<name>`) and, if the
  matching `@keyframes` isn't already present, appends the standard definition (same `TW_KEYFRAMES` the
  mirror path uses) to the section's custom_css — `@keyframes` are global, so one definition makes the
  badge run. Verified: `@keyframes bounce` now defined, badge animates (name bounce, 3s).

### Structural-pseudo selectors dropped from carried CSS (space-y-*, :not, :nth) (2026-08-03)

Tailwind's `space-y-*` inter-item margin (`.space-y-3 > :not([hidden]) ~ :not([hidden])` → 12px top margin
between siblings) was silently dropped, so carried lists/columns lost all their vertical spacing (a footer's
link columns and contact items had 0px between rows vs the source's 12/16px). Cause: the carried-CSS
harvester keeps a rule only if `matchesPage(stripPseudo(selector))` finds it used, and `stripPseudo`
stripped ALL pseudos — including STRUCTURAL ones — so `:not([hidden])` vanished and the selector became an
invalid `.space-y-3 > ~`, which `querySelector` rejects → rule dropped. `stripPseudo` now strips ONLY state
pseudo-classes (`:hover`/`:focus`/`:checked`/…) and pseudo-ELEMENTS (`::before`/…), and KEEPS structural
pseudo-classes (`:not`/`:is`/`:where`/`:has`/`:nth-*`/`:first-child`/…) so those selectors stay valid and
match. Verified: the footer's `space-y-3`/`space-y-4` rules now carry (`.sc-tw .space-y-3 > :not([hidden]) ~
:not([hidden])`) and render 12/16px between items. This was a TRANSLATION bug, not a capture failure — the
source's Tailwind bundle WAS read (external sheets are fetched + inlined before extraction); the rule was
seen and then discarded by the pseudo-strip.

### Mirror footer titles rendered dark-on-dark (heading colour inheritance) (2026-08-03)

A mirrored dark footer's column titles ("Quick Links" / "Services" / "Contact Info") were INVISIBLE —
`rgb(41,61,54)` (theme ink) text on the dark footer. It looked like the titles were "not mapped" and the
columns were mis-spaced, but the titles were present and every footer spacing class resolved correctly
(padding 64/32px, grid gap 40px, title `mb` 16px, `mt-20` all matched the source). The only defect was
COLOUR: the source footer is `text-white` and its `<h3>` titles inherit that white, but the parent theme's
global `h1–h6 { color: <ink> }` sets colour EXPLICITLY, so it beat the footer's inherited white inside the
mirror. Fix (theme-generator, PHP): emit `.sc-tw :is(h1,h2,h3,h4,h5,h6){ color:inherit; }` — mirrored
headings inherit their container's colour (the source design) instead of the theme heading ink; specificity
(0,1,1) outranks the theme's `h1–h6` (0,0,1), and an explicit source colour class (carried + `!important`)
still wins. Lesson: a "titles missing / spacing off" report in a MIRROR can be a colour-inheritance leak,
not a mapping or spacing bug — measure before assuming.

### Dropped spacing: standalone-button skin + carried-HTML spacing collision (2026-08-03)

Two spacing "dropped class" bugs on the CTA section:

- **Standalone buttons lost their padding.** The button-GROUP capture branch grabs `pad` / `fontSize` /
  `fontWeight` / inline-SVG icon / border-width, but the SINGLE-button branch captured only a minimal
  shape — so a CTA button's `px-10 py-4` was dropped and it fell to the shortcode's `.btn` default
  (`10px 24px` instead of `16px 40px`). The standalone branch now captures the same skin fields.
- **Carried HTML spacing classes collide.** A text_block's inner `<p>` kept its source `mb-10` verbatim
  in the content HTML (which is NOT class-sanitized), and the plugin's own `.mb-10` = `var(--spacer-10)`
  = 96px collided with Tailwind's 40px — so the subtitle→button gap ballooned to 96px. `textBlock` now
  runs the content HTML through `stripSpacingInHtml()`, which strips NUMERIC/arbitrary spacing utilities
  (`mb-10`, `p-8`, `px-[12px]`, `gap-4`, `space-y-2`) from every `class="…"` while KEEPING `-auto`
  (mx-auto centring) — the real margin is already reproduced from the computed value on the wrapper.

Verified: CTA button padding 16px 40px, subtitle→button gap 40px — both matching the source.

### Standalone button carries its horizontal alignment (2026-08-02)

A centred CTA button ("Reserve a Spot Now" under a `text-center` block) rendered LEFT — `buttonBlockNode`
captured the button's `text-align` but never set the shortcode's `alignment`. Now a standalone button sets
`alignment` from its captured align (center/right; left is default). GUARDED by `!b.groupRow` so a hero
flex-ROW group is still positioned by its row column (content_direction/content_h) rather than wrapping
each button in a centring div. Verified: the CTA button centres (cx 720) while the hero pair stays
side-by-side.

### Feature section: heading size, icon-box alignment, box padding, backdrop layering (2026-08-02)

Four fixes from the FreshPaws "Why Pets Love" feature section:

- **Heading font-size no longer balloons.** The display-preset snap (`display-1..5` = 96/88/72/56/48px)
  promoted ANY heading ≥30px to the nearest preset — so a 36px SECTION heading snapped up to display-5
  (48px). Now the snap only fires when the source size is within **7px** of a preset (a genuine hero/
  display heading); otherwise the EXACT size is reproduced in the title's custom_css. 36px stays 36px.
- **Icon-box alignment is captured.** `cardOf` now reads the card's computed `text-align`; `iconBoxNode`
  sets `icon_align` / `title_align` / `content_align`. Source feature cards are usually LEFT-aligned while
  the icon_box top-title layout CENTRES by default — that mismatch is gone.
- **Box padding collision fixed.** The card's `p-8` was carried in `css_class` and collided with the
  plugin's own `.p-8` = 72px `!important` utility (32px → 72px, the "too much spacing"). `iconBoxNode` now
  strips spacing utilities from the carried class and reproduces the computed padding (32px) in custom_css.
- **Decorative backdrop layered BEHIND content (`decorNode`).** A CTA band went blank: its `absolute
  inset-0` green fill + dot-pattern were emitted as plain code_blocks that, being positioned, painted OVER
  the non-positioned heading/text/button. Decor blocks now route through `decorNode`, which wraps them at
  `z-index:-10; overflow:hidden; pointer-events:none`; the section gets `position:relative; isolation:
  isolate` so the negative z stays behind the content but in front of the section's own bg. This also
  supersedes the earlier section-only `overflow:hidden` clip (the wrapper now clips too), and covers decor
  nested inside a content column, not just top-level.

**Box Presets ARE now detected on the URL/JS path (2026-08-02).** Previously the box-preset detection
(`build_box_presets`) existed only in the PHP file-upload path; the JS capture-service now has its own
counterpart in **`box-presets.mjs`**:

- **`cardOf` captures each card's box SKIN** — bg / border (width/style/colour) / corner radius / shadow /
  hover-lift — as resolved computed values (source-framework-agnostic, no Tailwind compile).
- **`iconBoxNode` routes the skin to NATIVE options:** the fill → `bg_color`; the border/radius/shadow →
  a Box Preset (`box_style`); the skin utilities (bg-*, rounded-*, border*, shadow-*) + spacing are
  STRIPPED from `css_class`. The raw skin is stashed on a temp `_box` att for the clustering pass.
- **`buildBorderPresets(skins)`** (mirror of PHP `build_box_presets`) clusters the distinct skins across
  the page, emits the top few as derived `border_presets` (named Card/Elevated/Outline/Rounded, ids
  `b000000101`+) on top of the 4 plugin defaults, and returns a `boxpFor()` lookup.
- **`capture.mjs` post-pass** collects every icon_box's `_box`, builds the presets, sets each
  `box_style`, drops `_box`, and merges `defaults + derived` into `themeSettings.values.border_presets`
  (the theme-settings importer REPLACES the option, so the defaults must be included).

**CRITICAL — `box_style` must use the SLUG, not the id.** css-tokens keys the `.boxp-{slug}` rules by a
friendly slug derived from `preset_name` (deduped in order across the whole list — a second "Outline"
becomes `outline-2`), NOT the preset id. `buildBorderPresets` mirrors `unysonplus_border_preset_slug_map()`
and returns `boxp-{slug}`; setting `box_style = boxp-{id}` renders NOTHING (the class `.boxp-b000000101`
has no rule — the rule is `.boxp-outline-2`). Verified: the FreshPaws cards render border 1px + radius 32px
via the derived "Outline" preset, bg via `bg_color`, padding via custom_css — pixel-matching the source.

**Still PHP-only:** the font-size-preset detection (`build_text_styles` → `font_sizes` + `icon_box.
font_size_preset`). The font-size TRANSLATION is already correct (display-preset tolerance snap), so this
is a lower-priority follow-up.

### Decorative backdrop must be clipped by its section (no horizontal scrollbar) (2026-08-02)

Preserving a decorative full-bleed backdrop verbatim (the `decor` block, above) surfaced a horizontal
scrollbar: the backdrop's inner blobs are intentionally oversized (`absolute … w-[800px]`, one at
`right-0`, one at `-left`), so they extend past the viewport. In the source that's fine — the hero
section clips them with its own `overflow:hidden`. The decomposed section didn't inherit that, so the
blobs pushed the document width out (1440 → 1707) and the page scrolled sideways.

Fix (JS `to-pages`): a section that carries a `decor` block gets `position:relative; overflow:hidden`
appended to its Custom CSS, re-asserting the source's clip so the backdrop clips at the section edges.
Document width is back to the viewport. (No PHP-path mirror needed — the PHP path DROPS empty decorative
layers rather than preserving them verbatim, so it never emits an overflowing backdrop.)

### Hero decomposition: mixed cells + anchored image-overlay composites (2026-08-02)

A hero's "clean-hero" gate was all-or-nothing: if ANY part wasn't cleanly mappable, the WHOLE section
stayed verbatim (one `code_block`). Two structures common to modern heroes tripped it and dragged an
otherwise-decomposable hero down: a full-bleed **decorative background layer** (`div.absolute.inset-0`)
emitted as a top-level `html` block, and an **image column with a content-bearing overlay** (a floating
"24/7 Care" badge over the photo) kept verbatim. Either one forced the clean text column (heading +
buttons + rating) into a single opaque code_block too.

Fixes so a hero decomposes with **mixed cells** — text column → shortcodes, the hard parts → contained
verbatim:

- **`decor:true` on decorative backdrops.** A full-bleed absolute bg/glow layer is flagged and no longer
  counts against the clean-hero gate (`every(b => b.t !== 'html' || b.decor)`); it rides as a contained
  code_block.
- **`imgComposite:true` on image+overlay cells.** An image whose only text sits in an absolute overlay is
  flagged; `cleanCell` accepts it, so it stays a CONTAINED verbatim leaf instead of failing the section.
- **The composite is wrapped in a positioned container.** The verbatim cell html is the cell's INNER html,
  so the source's `div.relative.lg:h-[600px]` wrapper was dropped — the absolute overlays (`inset-0` blob,
  `top-10 -left-6` badge) then lost their anchor and flew to the section corner / ballooned full-bleed.
  to-pages now wraps the composite in `<div class="{source cell classes}" style="position:relative">…` so
  the overlays anchor to the image. (code_block html is exempt from the class sanitizer, so `lg:h-[600px]`
  / `blob-shape` survive intact.)

Verified: the hero decomposes (special_heading + button-row + rating-row) while the image+badge composite
renders with the "24/7 Care" badge correctly over the image and the blob tint contained behind it.

### The 3-tier style-translation strategy (native → CSS Class → Custom CSS) (2026-08-02)

How the converter reproduces a source element's styling, in priority order — **prefer the earliest tier
that can carry the effect faithfully:**

1. **Native shortcode option** — best (semantic, responsive, editable): size→`display_size`, colour→
   `title_color`, align→`alignment`, etc.
2. **The CSS Class option** (generic `css_class`, or the Special Heading part-class options) — carry the
   source's OWN utility class; it renders via the **section's carried CSS**. Only for classes that are:
   - **sanitizer-SAFE** — no `:` `/` `[` `]`. WP's class sanitizer strips those characters, so a responsive
     (`md:text-xl`), opacity (`text-foreground/70`) or arbitrary (`leading-[1.1]`) class survives only as a
     MANGLED dead token (`mdtext-xl`, `text-foregroun`) that no longer matches the carried CSS;
   - **non-colliding** — not a `p*/m*/gap/space` spacing utility (those collide 1:1 by name with the
     plugin's own `!important` utilities on a different scale, e.g. `.px-8`→72px, `.mb-6`→56px);
   - not out-specificity'd by a preset (see tier 3).
3. **Custom CSS `!important` with the COMPUTED value** — the last resort, and the ONLY tier that survives
   all three failure modes: mangled classes, spacing collisions, and specificity (a plain class at 0,1,0
   loses to a preset's `:root .display-N` at 0,2,0). Emitted only for the residue tiers 1–2 can't carry.

Rule of thumb: **tier 2 is the default for plain, well-behaved utilities; tier 3 is mandatory for anything
the WP sanitizer mangles or a preset/utility out-ranks.** "Just use the CSS class for everything" was
considered and rejected — it silently drops exactly the responsive/opacity/arbitrary classes that matter
(proven: a subtitle routed purely to `subtitle_class` rendered 18px/opaque instead of 20px/70%). The
computed-value Custom CSS is what makes the residue pixel-exact.

#### Native option AND an exact-CSS override — not either/or (when our preset only *approximates* the source)

Tiers 1 and 3 are **not mutually exclusive**. Some options are *enums / presets* — they express an
**intent** (Header → **Translucent / Glass**, a **Box Preset**, a card **hover**) but bake in one fixed
look (e.g. the theme's glass frosts to ~72% of `--header-bg` with a set blur). When the source expresses
the **same intent** with **different exact values** (its glass is `background: rgba(24,24,27,.5)` +
`backdrop-filter: blur(8px)`, not our default frost), do **both**:

1. **Set the native option** (`header_glass = yes`, `box_style = boxp-<slug>`) — so the intent is
   semantic, the Theme-Settings / builder UI reflects it, and the user can keep editing it natively.
2. **Write the source's EXACT CSS as a scoped, low-specificity override** in the child theme's stylesheet
   (`header_css` for chrome, a Box Preset's `custom_css` for a card, the section's `custom_css` for a
   band). Because it is scoped and low-priority, it **nails the exact source look** while the option still
   wins if the user changes it later.

This is the whole point of the **hi-fi editable base**: *every override for one of our options lives in
the child stylesheet, layered on top of the native option — never instead of it.* The option carries the
meaning and the editability; the child CSS carries the last mile of pixel fidelity. Applied examples:
- **Frosted glass** — a `glass-card`'s `backdrop-filter: blur()` has no native Box-Preset field, so it
  rides in the preset's `custom_css` on top of the translucent fill (so the card reads as real frosted
  glass, not a flat translucent tint); a **glass header** sets `header_glass = yes` and carries the
  source's exact `background` + `backdrop-filter` as scoped `header_css`.
- **Box skins / hover** — the native Box Preset carries fill/border/radius/shadow/hover; a residual with
  no field (a `group-hover:scale`, an exact padding) rides in the preset's `custom_css`.

When you find a source look our option only approximates, **reach for this pattern before widening the
option's schema** — the native option + scoped override is faithful today and stays fully editable.

### Special Heading: translate classes via the native part-class options, not Custom CSS (2026-08-02)

The Special Heading shortcode exposes **Overline Class / Title Class / Subtitle Class** (text fields
appended to `.heading-overline` / `.heading-title` / `.heading-subtitle`). The converter now routes each
part's source utility classes into its option instead of synthesizing per-effect Custom CSS — the source
classes resolve via the **section's carried CSS** (the capture bundles it, incl. arbitrary values like
`.leading-[1.1]{line-height:1.1}`), so the effect renders from the source's OWN class. `coalesceHeadingGroups`
now carries `overlineCls`/`subtitleCls` off the folded overline/subtitle blocks; `headingNode` sets
`title_class` / `overline_class` / `subtitle_class` via a `routeClass()` filter.

Two classes of exception stay out of the option (documented so the split is intentional):

- **`text-{size|colour|align}`** is dropped from `title_class` — the native `display_size` / `title_color`
  / `alignment` cover it *better* (display_size also carries the responsive `lg:text-7xl` step, which the
  carried CSS omits). Subtitle keeps its `text-*` (no native subtitle colour/size option).
- **Spacing utilities (`m*`/`p*`/`gap`/`space`)** are dropped — they collide 1:1 BY NAME with the plugin's
  own `!important` spacing utilities on a DIFFERENT scale (`.mb-6` → 56px, not Tailwind's 24px).

**Custom CSS is now the LAST RESORT — only what a carried class provably can't win:** the title's own
vertical margins (no native option + the class collides), and — *when a display preset is set* — weight
and line-height, because the preset emits at `:root .display-N` (specificity 0,2,0) which outranks a plain
carried class (0,1,0), so those two need an `!important` a class can't carry. Without a display preset the
carried classes win alone and nothing is emitted.

Verified: hero H1 matches source exactly — 72px / weight 800 / line-height 72px / margin-bottom 24px /
Nunito — with `title_class="font-heading font-extrabold leading-[1.1]"`, `overline_class` carrying the
pill classes, `subtitle_class="text-lg md:text-xl text-foreground/70 leading-relaxed"`, and custom_css
trimmed to just `font-weight/line-height/margin-bottom`. Report still 0 fallbacks.

### Hero button group: side-by-side row + spacing-utility collision (2026-08-02)

The hero CTA pair (`Book a Stay` / `Take a Tour`, source `<div class="flex flex-col sm:flex-row gap-4">`)
rendered **stacked** and **oversized** (padding blew up to `24px 72px`). Two independent bugs:

- **Row grouping was lost inside content columns.** The section loop grouped a flex-row button group into
  one `content_direction:row` column, but a hero button pair lives in a grid CELL's `c.blocks`, which was
  mapped by a plain `.map(blockToNode)` — no grouping, so the CTAs came out as stacked siblings. Factored
  the grouping into `blocksToNodes(blocks)` and used it for the content-column path too. Now the pair sits
  in a nested row column, side-by-side with the source gap.
- **`groupRow` read the wrong viewport.** It was computed from the container's LIVE `flexDirection`, but the
  responsive re-measure pass can leave the page at a phone width where `sm:flex-row` hasn't applied (reads
  `column`). Now `groupRow` is derived from the container CLASS (`flex-row`, incl. `sm:/md:/lg:flex-row`) —
  viewport-independent desktop intent — with the live value only as a fallback.
- **Tailwind↔plugin spacing-utility collision.** The button carried its source `px-8 py-4` into `css_class`,
  which collide 1:1 BY NAME with the plugin's own `!important` `.px-8`/`.py-4` utilities — but those resolve
  to the plugin's spacer scale (`--spacer-8` = 72px, `--spacer-4` = 24px), and being equal-specificity but
  LATER in the cascade they beat even the button's `custom_css !important` padding. Fix: `stripSpacingUtils()`
  removes `p*/m*/gap-*/space-*` (incl. responsive/negative/arbitrary variants) from any carried class list —
  the real padding is already reproduced from the computed value in `custom_css`, so nothing is lost.

Verified: hero buttons render side-by-side (parent `flex`, gap 16px) at `16px 32px` padding / 194×61 &
167×61 — matching the source (194×62 / 166×62), report still 0 fallbacks.

### Heading with a decorative inline SVG + weight (2026-08-02)

A hero H1 `text-5xl lg:text-7xl font-extrabold … <span class="text-primary">Second Home<svg…><path d="M0
5 Q 50 10 100 5"/></svg></span>` (a green accent word with a hand-drawn yellow underline squiggle) lost
the underline and rendered under-weight. Fixes:

- **`richHeading` keeps an inline `<svg>` VERBATIM.** It rebuilt a heading from TEXT + bold/accent spans
  only, so the `<svg>`'s `<path>` was dropped (the squiggle became empty spans). An inline SVG in a
  heading is a decorative graphic (underline / highlight) — now carried whole, classes and all.
- **`sc_kses_svg()` (new helper) lets the SVG survive render.** `wp_kses_post` in the special_heading
  title stripped `<svg>`/`<path>`; the new helper allows the safe SVG shape+presentation set (no
  `<script>`/`on*`) AND restores the case-sensitive `viewBox`/`preserveAspectRatio` that `wp_kses`
  lowercases (which would break scaling). Used by the special-heading title.
- **Heading weight carried.** `font-extrabold` (800) / `font-black` (900) exceed the Display presets'
  700; the source weight is now carried onto `.heading-title` (`!important`) so the heading isn't
  under-weighted. Verified: H1 matches source on size, weight (800), two-tone colour, AND the yellow
  underline.

### Decomposed button translation (2026-08-02)

A hero CTA group (`<div class="flex sm:flex-row gap-4"><a class="bg-primary … px-8 py-4 …">Book a Stay
<svg…arrow/></a><a class="bg-white … border">Take a Tour</a></div>`) was translating wrong on four axes;
all fixed in the JS decomposer (`capture-extract` button-group branch + `to-pages` `buttonBlockNode`):

- **Padding + width.** `px-8 py-4` collided with the plugin's own `.px-8`/`.py-4` `!important` utilities
  (32/16px → 72/24px) and stretched the button full-width (684px). The button now re-asserts its COMPUTED
  padding + `width:auto; display:inline-flex` via the shortcode's Advanced Custom CSS (`selector{…!important}`).
- **Fill / text / border.** The plugin's `.btn` base + button preset beat the carried Tailwind classes (which
  also get `:`-sanitizer-mangled), so a white "Take a Tour" rendered white-on-white with an orange preset
  border. The button now asserts the source's captured `background` / `color` / `border` (or `border:0` for a
  borderless solid) `!important`, reproducing the exact source look.
- **Inline SVG icon.** A lucide `arrow-right` inside "Book a Stay" was dropped (only font-icon class tokens
  were kept). The inline `<svg>` is now captured verbatim → the button's svg icon option.
- **Side-by-side layout.** A button GROUP whose flex-direction is `row` (`sm:flex-row`) is now collected into
  ONE row column (`content_direction:row`, auto-width), instead of the default stacked full-width column.

### Region targeting — reconvert ONE region, leave the rest intact (2026-08-02)

Re-run the converter for just the header, just the footer, or just specific body sections, and the
**rest of the live site is untouched** (no whole-page replace, no whole-theme clobber). End-to-end:

- **Capture flags:** `--only-header`, `--only-footer`, `--only-sections=0,2`. These write a
  `convert_scope = { header, footer, sections:[…] }` into the bundle (design-config / theme-design), and
  mark the page **partial** with `scope_sections` = the original s_index of each emitted section (so the
  importer can merge by position). The full chrome is still captured (the theme needs the complete CSS);
  the scope only tells the importer what's in scope. (`--skip-*` is the inverse — "reconvert everything
  EXCEPT". `--only-*` is exclusive.)
- **Import gating (`Bundle::import_dir`):** when a `convert_scope` is present it **skips the design-system
  phases** (presets / theme-settings / style guide — already applied), runs the **theme (chrome) phase only
  if header/footer is in scope**, and the **pages (body) phase only if sections are in scope**.
- **Pages MERGE (`Pages::merge_partial_tree`):** a partial page is merged INTO the existing page's builder
  tree by original index — the reconverted sections replace their slots, every other section is left
  exactly as it was. (Was a full `page-builder` option replace, which deleted the non-reconverted
  sections.)
- **Chrome PRESERVE (`Theme_Generator::write_files`):** on a header-only (or footer-only) run the
  OUT-of-scope chrome template (`template-parts/header-builder.php` / `footer-builder.php`) is NOT
  overwritten if it already exists, and is excluded from the stale-file sweep — so reconverting the header
  never clobbers a hand-edited footer, and vice-versa.

Verified on FreshPaws: `--only-sections=0` re-imported → page still 3 sections (hero merged, others intact,
chrome untouched); `--only-header` → theme regenerated, body untouched, footer template preserved (md5
identical); `--only-footer` → header template preserved.

### Mirror chrome robustness (2026-08-02, cont.)

- **Carried Tailwind utilities were losing to the plugin's SAME-NAMED utilities.** The mirror keeps the
  source's classes (`px-6`, `py-2.5`, …); UnysonPlus ships its OWN `.px-6` etc. on a different scale
  (`1.5rem`/24px in Tailwind vs `3.5rem`/56px here) AND emits them with `!important`, so the source's
  header CTA rendered 56px-wide instead of 24px. Fix (theme-generator `scope_selectors`): the carried
  util/header/footer CSS is now **prefixed with `.sc-tw`** (the mirror wrapper — boosts specificity,
  confines the source CSS to the chrome) AND the **spacing/size** declarations (padding/margin/gap/
  font-size — exactly the properties the plugin's `!important` utilities target) are re-asserted
  `!important` so the source value wins. Colours/backgrounds/transitions stay clean.
- **Admin-bar offset for the mirror header.** The logged-in WordPress admin bar (32px / 46px mobile)
  clipped the fixed mirror header, because the offset rule targeted `.sc-header` / `#masthead` /
  `header[role="banner"]` — none of which the bare mirror `<header>` has. Added `.admin-bar .sc-tw header
  { top: 32px !important }` (46px on mobile) so the mirror header sits below the bar (`!important` beats
  the carried `.top-0`; `top` on a static header is inert, so it's unconditionally safe).
- **Sticky-header SCROLL STATE.** A fixed header commonly swaps its look on scroll (transparent → a
  solid/blurred bar, tighter padding) via a JS class toggle; the mirror captured only the top state.
  Now `capture.mjs` measures the header at scroll 0 vs. scrolled and, if it changed, stores
  `raw_chrome.header_scroll = { top, scrolled }`. The theme-generator emits a `.sc-tw header.sc-scrolled`
  rule (bg/backdrop/shadow/padding/border) and the interactivity script toggles `.sc-scrolled` past a
  threshold — the header's own `transition-*` animates it. Reproduces the FreshPaws transparent→white/90
  blur-on-scroll header.
- **Standalone image skin.** A decomposed `media_image` now carries the source `<img>`'s own
  `border-radius` (incl. organic blob `60% 40% …`), `object-fit` and shadow via the shortcode's Advanced
  Custom CSS (`selector img{…}`) — so a hero photo the source crops into a blob no longer ships as a bare
  rectangle.

### Live dashboard front-end (`dashboard/`)

The capture service ships a **local dashboard** — the tool's front-end for watching a conversion run.
`node dashboard/server.mjs [--out <capture-out>] [--port 4600]` serves a single-page UI that: takes a URL
and starts a conversion, streams the **live pipeline timeline** (each `step()` is logged to
`progress.json`/`progress.jsonl` and the theme polls it), and — once done — shows the captured **design
tokens with their provenance** (e.g. "heading font sampled from an `<h1>`, not the logo"; "container =
largest max-width across breakpoints"), the **per-section conversion report** (mapped / mirror / fallback),
and a **source-vs-result compare**. It's how a human sees exactly which stage + tool is running and where
every captured value came from, instead of trusting a silent CLI.

### Doc-sync blind spot (maintainers)

`sync.mjs` resolves this doc's source to the extension's **`manifest.php` only** — the converter *engines*
(`class-fw-site-converter-mapper.php`, `_tailwind.php`, `_stitch.php`) are **not** hashed, so a change to
the class→value translation logic will **not** flag this doc STALE. Update this doc by hand when you change
those engines, and `node docs/sync.mjs stamp extensions/site-converter.md` after editing.

- **Product-card SKIN + hover + ribbon → wc_products (2026-08-01).** Beyond mapping a product grid to a
  `wc_products` placeholder, the converter now translates each source card's **wrapper skin** (bg / border /
  radius / rest shadow, from the wrapper's computed style) and its **hover** (`hover:shadow-*` →
  `.upwc-product:hover` box-shadow, `hover:-translate-y-N` → `translateY(-N*4px)` lift) into **scoped CSS**
  (`.upwc-products .upwc-product` — the section's Advanced → Custom CSS on the JS path; the `$style_css`
  aggregator on the PHP path — NOT new shortcode options, since the card skin is CSS-only by design). It
  also **detects a badge pill** in the cards (a small uppercase `rounded-full` span) and flips
  `show_ribbon:'yes'` + emits `.upwc-product__badge.ribbon` skin. The ribbon TEXT is per-product
  `_upwc_ribbon` meta (a placeholder grid can't carry it). Was the gap that dropped the source card's
  `hover:shadow-xl hover:-translate-y-2` (flat card) and its "Best Seller" badge. JS `capture-extract`
  `rowCols` (`cell.wrap`/`cell.ribbon`) + `to-pages` `wcCardCss`/`wcProductsNode`; PHP `Stitch` grid-cell
  capture + `Mapper::register_wc_card_css`/`n_wc_products`. Proof: the browser-free
  `wc-products.test.mjs` fixture (`hover:-translate-y-2` → `translateY(-8px)`, badge → `show_ribbon:'yes'`).

**Keep this algorithm in sync across BOTH implementations** — the PHP `Mapper`/`Stitch`/`Tailwind`
(file-upload path) and the JS `capture-extract`/`to-pages` (URL path) — so both produce consistent output.

## Audit what the converter writes into Theme Settings

`tools/settings-audit/audit.php` takes every value a conversion writes, finds the control that will render
it, and **round-trips it through that control's own `get_value_from_input()`**. A value that cannot survive
that trip is one the control cannot hold, so the moment the user opens the tab and saves, it is replaced.
Empirical, so it needs no per-type knowledge and catches every class at once.

```
php D:/xampp/wp-cli.phar --path=D:/xampp/htdocs --allow-root eval-file     "…/tools/settings-audit/audit.php" [<capture-dir> …]
```

With capture dirs it audits what those conversions WOULD write; with none, what is stored on the site.

It reports only values actually LOST — a `multi` legitimately fills in defaults for sub-options the stored
value omits, `0` and `"0"` are the same value, and a multi-picker drops the branch of the choice that is not
selected. Counting those as loss produced 18 false positives on the first run.

**What it found, and the rules that came out of it:**

| Symptom | Rule |
|---|---|
| `{predefined,custom}` written to a plain `color-picker` -> `""` | the compact shape is only for `sc_color_field_compact()` fields; a plain picker takes a STRING |
| `rgba()` in a `typography` colour -> **`#000000`** | that field parses hex only — flatten the alpha, never pass rgba |
| a per-heading `variation` with an empty `family` -> `false` | a variation is a property of a family; fall back to the Heading Font's family |
| a colour string written to a compact field -> lands in `predefined` | `predefined` holds a palette SLUG, not a colour |
| a measured column split -> snapped on save | snap to the `split-slider`'s own denominator up front, or the layout reflows under the user |
| the UNSELECTED multi-picker branch populated | it is dropped on save; filling it is not a convenience, and it was the one place an un-sideloaded source URL survived |

Run it after any change to what the converter writes into Theme Settings.

## Never hand a SELECT a value it cannot hold

A Theme Settings option backed by a `select` can only store one of its own choice strings. Give it a computed
equivalent and it renders fine — and is then silently discarded the next time the user saves that tab.

Reported as *"the top spacing of the entire footer disappears when I edit the footer settings"*. Footer Padding
Top / Bottom are selects built from the site's spacing scale. The converter tested the measured px against a
HARDCODED scale and, on a hit, wrote a computed rem string. Both halves were wrong: the real scale is the
SITE's (a converted site carries whatever the source used), and a length can be on that scale as the literal
string `40px` while the converter writes `2.5rem`. Measured: saving the Footer tab took the footer from
80px/40px to 80px/24px.

**The rule:** carry the exact measurement on the `*_custom` unit-input — it holds any value, survives a save,
and the theme applies it AFTER the select (theme-vars.php). Set the select only when the value really is one
of its choices, via `Stitch::spacing_scale_choice()`, which compares NUMBERS and returns the scale's OWN
string. A miss there costs nothing because the override already carries the truth.

This generalises: any converter write into a `select` must go through the option's real choice list. Guarded
by golden `[BJ]`.

## A price LIST is not a price GRID (pricing layout)

`pricing_table` used to take its column count from the number of PLANS — which says nothing about how the
source arranged them, so a four-item price list became a four-across card grid with the price stacked under a
wrapped, centred title.

Measured with the converter's own `is_pricing_table` over the capture corpus: of the priced groups whose
container carries a measured `display`, most are **list**-shaped, not grids. Before this, every one of them
converted to a grid — a **26%** layout match. Reading the source's geometry instead takes it to **100%**, and
fixes 10 grids whose column count the plan count had wrong.

**The rule:** the layout and the column count come from the source's measured container, never from the plan
count. `Stitch::pricing_layout()` reads the stamped `display` (+ `grid-template-columns`):

| Source container | Layout |
|---|---|
| `grid` with 2+ tracks | `grid`, columns = the source's tracks |
| `grid` with one track | `list` |
| `flex`, `flex-direction: column` | `list` |
| `block` / flow | `list` |
| `flex`, row | `grid` |
| nothing stamped | `grid` (the old behaviour) |

`Stitch::pricing_row_metrics()` then measures the LIST's rhythm — whether a rule separates the rows, their
spacing (the container's gap, else the cells' sibling margin), their own padding, and the price element's own
size / weight / family. Defaulting those was visibly wrong: a flush, rule-less menu rendered with a hairline
on every row and 16px of padding it never had, each row 87px against the source's 56px.

**Shortcode side:** LAYOUT is a separate axis from DESIGN. Design is a skin on shared markup; layout owns its
own render partial under `views/layouts/`. Note it is deliberately NOT `views/designs/` — `fw_sc_designs()`
treats that filename as the shortcode's one design registry and would prefer it over `views/parts/registry.php`,
silently replacing the existing Design picker (and every installed skin pack) with the layout list.

Back-compat: the layout lives under a NEW option id (`design_settings/layout`), so the legacy scalar `design`
is untouched and anything saved before layouts existed falls back to `grid` and renders exactly as it did.

Guarded by golden `[BI]`.

## Multi-page: the SITE is the unit of conversion

A site is **one** conversion, not one per page. Converting pages separately made every import re-derive the
site-level design from whichever page ran last, so the last page converted decided how the whole site looked.

**Capture.** `capture.mjs <url> <outdir>` now crawls the front page's nav (up to `MAX_PAGES`, default 10) and
writes ONE bundle:

```
capture-out/<site>/
  rendered.html                  the front page (unchanged — where it has always been)
  pages/<slug>/rendered.html     one DOM snapshot per page, including the front page
  pages-manifest.json            [ { slug, url, front, rendered }, ... ]
  theme-design.json  presets.json  theme-settings.json  media.json   ONE site-level design
```

`--single-page` (or `UPW_SINGLE_PAGE=1`) captures only the URL given — what a targeted re-convert of one page
wants. A bundle with no `pages-manifest.json` imports exactly as before.

**Import.** `FW_Site_Converter_Bundle::import_dir()` runs the SITE phases once (media, presets, theme settings,
theme generation, style guide) and then loops the page snapshots (`pages:multi` in the result's `sections`).
Ordering matters and is now fixed: **pages → extra pages → menus → permalinks**, so every page a nav item
points at exists before the menu is built, and the permalink structure is settled once at the end.

Measured end-to-end from a hostile start (three pages deleted, permalinks on the PATHINFO structure, all three
URLs 404): one capture (39s, 4 snapshots) + one import → all four pages 200 with their own content, the site's
theme untouched, and `settings skipped: 0`.

### Converting a whole site from the Convert panel

There are TWO pipelines, and both are multi-page now:

| Path | Route | Review screen |
|---|---|---|
| **Bundle import** | a `convert-bundle.zip` -> `looks_like_bundle()` -> `import_dir()` | skipped |
| **Review path** | URL / paste -> `Stitch::build_bundle()` -> review -> `Mapper::build_pages()` | shown |

The panel is the review path, and it used to be single-page by construction: `/capture?html=1` returned one
rendered HTML string, and `build_bundle` with an `html` input pushed exactly one screen. Now:

- **`/capture?url=…&pages=all`** returns `{ pages: [ { slug, url, front, html } ] }` for every page the run
  captured, from the manifest it already writes. `&max=N` caps the crawl, `&also=url,url` adds pages the nav
  does not link to, `&single=1` captures only the URL given. Falls back to the single-HTML response when a run
  captured one page, so an older plugin is unaffected.
- **`Stitch::build_bundle( [ 'screens' => [ … ] ] )`** takes them all and produces ONE mapping holding N pages.
  `Sources::build_from_screens()` is the entry point; source identity is read from the FRONT page, since every
  page of a site comes from the same generator. The `html` branch is untouched.
- **`screen_identity( $url )`** is the one rule for slug + front: the site root is the front page with a blank
  slug; any other path is an inner page under its last path segment. `build_bundle` then normalises to exactly
  one front page, so a payload claiming several (or none) can never produce two homepages.
- **The Convert panel's PAGES box** chooses the scope: *This page + linked pages* (default, with a max), *Just
  this page*, and a textarea for extra URLs.

### The review screen with several pages

One tab per page, labelled `Title · <section count>`, the front page marked. **Chrome is NOT in the tabs** —
the header and footer are site-level and reviewed once, above the strip; a per-page header would invite the
"which page's header wins" bug the importer had. Each tab carries an **Omit page** checkbox, the same verb as
`Omit section` one level down, which sets `mapping.pages[p].omit`; `build_pages()` then skips it exactly as
`build_section()` skips an omitted section.

A tab's tree is built the first time it is OPENED, not up front. That is a performance requirement: ten page
trees rendered at once is the same main-thread stall a single huge options tab caused. With one page the
review renders exactly as it always did, with no tab strip.

### The rules this depends on

- **An inner page contributes CONTENT, not a site design.** The generated theme is named after the capture, so
  converting three inner pages once built three child themes named after them and ACTIVATED each in turn. The
  theme phase is skipped when the capture is an inner page AND a converter-generated theme is already active
  (`capture_is_inner_page()` + `converter_theme_active()`). A first conversion — front page, or an inner page on
  a site with no converted theme — still generates and activates one.
- **A manifest is DATA.** A `rendered` path that is absolute, drive-qualified, or climbs out of the bundle is
  refused; a listed-but-missing or style-less snapshot is REPORTED, never silently treated as converted.
- **Change permalinks through `$wp_rewrite`, not `update_option()`.** The global keeps its own copy of the
  structure, so writing the option alone leaves it stale and the flush regenerates rules for the structure you
  just replaced — the pages stay 404 until something flushes a second time. Use
  `$wp_rewrite->set_permalink_structure()` then `flush_rules()`.
- **Baseline the settings guard over everything the converter owns**, at the end of the whole import. Stamping
  only the *imported* keys left cleared keys and keys that later phases rewrite carrying a stale stamp, so the
  next conversion read the converter's own work as a user edit and skipped it — and a skipped key was never
  re-stamped, so it stayed skipped forever. Measured: a clean run (0 skipped) followed by one reporting 26.

Guarded by `tests/multipage-bundle-test.php` (15 assertions).

### Still open

- **Chrome is taken from the front page**, not from a consensus across pages. With one bundle there is no
  contention — one capture derives it once — so this is a refinement, not a live bug: a site whose inner pages
  carry a genuinely different header would want per-page overrides.
- **Cross-page settings skips remain.** Importing the SAME bundle repeatedly is stable (0 skipped every time),
  but importing different single-page bundles in sequence still reports skips. The multi-page path avoids it by
  construction; the single-page sequence does not.

## Keep the no-AI conversion algorithm in sync (PHP ↔ JS)

The deterministic ("no AI") converter exists in **two** implementations — the plugin for the
**file-upload** path (`class-fw-site-converter-stitch.php` + `class-fw-site-converter-mapper.php`, PHP)
and the capture service for the **URL** path (`capture-extract.mjs`, `to-pages.mjs`,
`to-design-config.mjs`, JS). Whenever you change the conversion logic in one — what counts as a page
section, how sections map to shortcodes, what's **chrome** (header/footer/nav) vs. content, token/design
extraction — **apply the equivalent change to the other** so both paths produce consistent output.
(E.g. header/footer/nav are CHROME handled by the generated theme, NOT page-builder content —
`capture-extract.mjs` excludes them from body sections; the PHP `section_roots()` matches.) When in
doubt, the capture service's extraction is usually the more-complete reference.

## Extension points — correct ONE site without patching shared code

Three seams, so a site owner (or their agent) can fix their own conversion in their own code. All three
live in the PHP path, which is the authoritative one on a WordPress bundle import. They are WordPress
hooks, so they belong in a child theme or `framework-customizations/` — never in the plugin, which an
update replaces. Guarded by `tests/extension-points-test.php` (17 assertions).

**1. `FW_Site_Converter_Stitch::register_recognizer( $id, $priority, $match, $build )`** — claim a DOM
element and emit your own block. Built-in priorities span 25–99 (so 100+ to outrank every built-in; note
several built-ins tie at 99, and ties have no defined order). Re-use a built-in's id to REPLACE it;
`unregister_recognizer( $id )` removes one; `recognizer_ids()` lists them, highest first. Register on the
`fw_site_converter_recognizers` action, which fires after the built-ins are installed — so a subscriber can
inspect, replace or remove one by id.

> **This registry had a defect that made the documented path catastrophic, and it is worth knowing why.**
> The built-ins were installed under `if ( ! self::$recognizers )`. A third party registering ONE recognizer
> before the first conversion therefore left the set non-empty, and the built-ins were never installed at
> all: **measured at 54 recognizers down to 1**, producing a near-empty conversion with no error to explain
> it. Doing exactly what the docs invited broke everything, silently. The fix is a separate
> `$builtins_registered` flag, plus re-applying anything registered early so a deliberate id replacement
> still wins. The lesson generalises: *"is the collection empty" is not the same question as "has
> initialisation run"*, and conflating them turns any early caller into a silent saboteur.

**2. `apply_filters( 'fw_site_converter_block_nodes', null, $b, $css_id )`** — claim a stitched block and
supply its builder nodes. Return `null` to fall through to the built-in mapping, an array of nodes to use
instead, or an **empty array** to drop the block deliberately. The mapping is an ordered if/continue chain
rather than one dispatch table, so this is the single point where a block can be intercepted without editing
that chain. Returned nodes go into their own full-width column, after the pending text buffer is flushed so
they land in source order.

**3. `apply_filters( 'fw_site_converter_theme_settings', $incoming, $replace_chrome, $force )`** — the
values a conversion is about to write, as `option id => value`. Add, change or unset keys. The
fingerprinting and the user-edit guard apply to the *result*, so a value set here is still never written
over one the user has since edited by hand. This is where a site-specific Theme Settings correction belongs.

**Two notes for anyone writing a test against these.** `build_pages()` stamps a fresh random `unique_id` on
every node, so two builds of identical input are never byte-equal — normalise the ids before comparing, or a
pass-through assertion fails against nondeterminism rather than against the code. And `html_to_mapping()`
produces *blocks*; blocks become *nodes* in the mapper, so a test of hook 2 has to run `build_pages()`. Both
mistakes were made writing that suite, and each looked like a dead hook.

**No JS twin.** These are WordPress hooks, and the JS path (`to-pages.mjs`) has no filter system. A
correction made through them applies on WordPress import, which is the authoritative path — but it will NOT
show up in a capture-service-side conversion, so don't reach for them to fix a discrepancy between the twins.

## Is the kit beside this install actually current? (`FW_UPW_KIT_PATH`)

`kit-manifest.json`'s `bump_triggers` record which Site Converter and Capture Service versions the kit's
docs were written against. Nothing verified that pairing, so a kit could sit several converter versions
behind while its pages described behaviour that had since changed — and the only symptom was an agent
confidently following stale guidance. `FW_Site_Converter_Kit` checks it and reports in the converter's
**Diagnostics** tab. Guarded by `tests/kit-check-test.php` (18 assertions).

It is opt-in through a **constant**, in `wp-config.php`:

```php
define( 'FW_UPW_KIT_PATH', 'D:/Web Dev/UnysonPlus-AI-Dev-Kit' );
```

**Why a constant and not a setting.** The kit is a developer's local download; on a normal host it is not on
the WordPress filesystem at all, so a settings field would be blank or wrong nearly everywhere and would
invite an admin to point the plugin at an arbitrary directory. A constant lives in `wp-config.php`, is out of
reach of a compromised admin account, and says "developer machine only" without needing documentation. With
the constant undefined — every normal install — the class does nothing and prints nothing.

Three verdicts: `current`, `kit_behind` (the kit's docs predate this converter — pull the kit), and
`plugin_behind` (the kit documents a converter this install does not have yet — update the plugin). The
agreeing case still prints one quiet line, because a check that only ever speaks up to complain leaves the
reader unable to tell "verified current" from "never ran".

It reads exactly one known filename, resolved with `realpath()` and required to sit inside the configured
root, size-capped, and every failure — missing file, unparseable JSON, no `bump_triggers`, no recorded
converter version — degrades to silence rather than to a warning the reader cannot act on. The Capture
Service version is reported as what the kit *expects*; the running version comes from the Diagnostics health
check, since only the browser can reach the service.

> **This check was written because the drift it detects had already happened, unnoticed.** The converter was
> at 1.10.13 while the kit's recorded trigger still read 1.10.10 — because the script meant to update it
> matched `'Site-Converter'` against a key actually spelled **`site_converter_extension`**, so the loop
> matched nothing and updated nothing while printing the value it intended to write. Three consecutive
> "trigger updated" reports were false. A string match against a key name is not a check; the bump helper now
> asserts the key exists before writing it.

## The conversion sandbox — a site's own corrections, where nothing deletes them

The extension points above are the seam; this is where a site's corrections LIVE.
`FW_Site_Converter_Sandbox` loads one PHP file per correction from `wp-content/unysonplus-sandbox/entries/`,
each returning `array( id, summary, fragment, expected, probe, apply )`. Guarded by `tests/sandbox-test.php`
(37 assertions, most of them negatives).

**Why `wp-content/`, and not `framework-customizations/`.** The obvious home for user code is
`framework-customizations/`, which a plugin update never touches — but it sits inside the THEME, and a new
conversion **deletes the previous conversion's generated child theme** (`cleanup_previous_conversion()`). A
sandbox stored there would be destroyed by the next conversion, which is exactly when the corrections matter
most. `wp-content/unysonplus-sandbox/` survives a plugin update, a theme swap and a reconversion alike. The
scaffold writes a README, an inert example entry, and an `index.php` + `.htaccess` so the folder cannot be
browsed (the files are `include`d by PHP, never served).

**Entries retire themselves.** Each may carry a `probe` answering one question: *is the defect I exist for
still present?* `maybe_probe()` runs on `admin_init` and re-probes once per converter version — a converter
update being precisely when a correction may have become unnecessary. A probe returning `false` retires the
entry: it stops applying and is listed as safe to delete. Without this a site accumulates corrections that
fight fixes it has already received, and a hook that "corrects" an already-correct value IS the bug.

Three asymmetries in the retirement logic, each deliberate, because the costs are not symmetric:

- **No probe → never retired.** "I don't know" must not read as "safe to drop".
- **A probe that THROWS → entry stays active.** An inconclusive probe that retired its entry would silently
  un-fix the site; keeping a correction one version too long is much cheaper.
- **`revive( $id )`** exists because a probe can be wrong, or a regression can come back.

**Nothing an entry does can break the site.** Loading, `apply()` and `probe()` each run in their own
try/catch; a bad entry is disabled and reported through `errors()`. `boot()` is idempotent, so being called
from `_init()` and again before a conversion cannot double-register a filter.

**`report()`** renders the set as shareable text — each entry's source fragment plus what was expected,
which is the reproducible-case shape a maintainer can turn into a permanent fix, with the case-not-a-patch
and privacy cautions included. The result panel mentions the sandbox only when entries exist, and says how
many are now handled upstream.

### Two defects this cost, both silent

**`method_exists( $ext, 'manifest' )` is always false** — `manifest` is a *property* on `FW_Extension`, not
a method. `converter_version()` therefore returned `'unknown'` every time, and since `maybe_probe()` compares
the stored version against it, the probes would have run exactly once and then never again: every entry
frozen as permanently needed, forever. A unit test with a mocked version would have passed. Running the thing
against a real install is what caught it, and the suite now asserts the version both is not `'unknown'` and
*looks like* a version, so a change to it can actually be detected.

**`glob( '*' )` does not match dotfiles.** The sandbox test's own cleanup left `.htaccess` behind, `rmdir()`
failed silently, and the run leaked a temp directory while reporting success — caught only because the last
assertion checks that the directory is gone. Use `scandir()` when a directory must actually be empty.

## The full-bleed hero, and five ways to miss one

A real conversion put a hero's backdrop photo on the page as a small content tile, squeezed the headline
into a fifth of the band so it wrapped one word per line, and measured **88% pixel drift** on that band --
the worst region on the page and the first thing a visitor sees. Five separate defects produced it, and
each is general rather than particular to that source.

**1. The poster was detected by class name, not by computed style.** Every path in `section_bg_image()`
keyed on Tailwind utilities (`absolute`, `inset-0`, `object-cover`) or a CSS `background-image:url()`. The
source was hand-written CSS: `<picture class="hero-poster"><img>` where the img carried **no class at all**
and only computed `position:absolute; object-fit:cover; width:1440px; height:900px`. Reading class names
where a computed value is available is the same mistake as testing whether a property is PRESENT in a
computed-style dump -- it asks "was this built with the framework we expected?" when the question is "does
this element cover the band?".

**2. Removing the image left its wrapper.** A responsive backdrop is `<picture><source><img></picture>`, so
lifting just the `<img>` left a hollow `<picture>` in the flow -- and an empty element is still a child, so
the row builder handed it a column. Most of the squeeze the lift was meant to cure survived it.

**3. `muted` is a DOM property, not an attribute.** `detect_section_bg_video()` required
`hasAttribute('muted')`, but browsers require `video.muted = true` for autoplay and that is how React and
most hand-written players set it -- so the captured markup has no such attribute. `controls` is the sturdier
discriminator: a backdrop never has them, a player almost always does.

**4. The in-column test asked the element about itself.** The capture stamps `data-sc-col` on every direct
child of a flex/grid container, so a backdrop sitting directly under the `<section>` carries the stamp too.
The walk started at the video, saw its own stamp, and concluded it was content in a column -- meaning a
hero's background video could never be promoted when written the commonest way.

**5. "Rounded means content" assumed square sections.** The video was refused because its `border-radius`
was 25px, over a fixed 24px threshold -- but the `<section>` itself was a 25px rounded card, and a backdrop
follows the shape of the box it fills. Roundness only distinguishes a panel *relative to its band*.

### Out-of-flow children are not columns -- carefully

The browser gives `position:absolute` / `fixed` children no track, so counting them as columns is a layout
error rather than a judgement call. The hero had six children and only ONE was in flow; each of the others
took a column, and the content layer was left with 2/12 of the band.

`el_takes_no_track()` is that rule, shared by **both** column builders -- the first version lived in
`layout_cols()` alone and changed nothing, because this hero's row came from `grid_cols()`. A rule that
applies to one of several builders is a rule that silently does not apply.

It is deliberately narrow, and the goldens are why:

- **Only the `hidden` ATTRIBUTE, never computed `display:none`.** A `md:hidden` card computes `display:none`
  at the captured width and is visible on phones; the pipeline turns that into Responsive Hide. Dropping it
  deleted a card a golden expects to survive.
- **Media is kept.** A backdrop should have been promoted before this point; if it was not, dropping it here
  would lose it silently.
- **Paint is kept.** An absolutely-positioned painted layer -- a 1px "light river" hairline, a glow blob, a
  scrim -- is decor that later paths lift out as its own layer. Dropping it first lost the paint, which
  another golden caught.

Both restrictions cost fidelity on the hero above (its scrim is still a column) and both are correct: the
narrow rule loses a little layout, the wide one lost content.

## Setting expectations, and handing the rest to an agent

A conversion gets a site most of the way and leaves finishing to do. Everything below exists because a
first-time user met none of that: a page of options, a one-minute wait, a front end that did not match the
source, and no idea whether that was the tool working or the tool failing.

### The panel that never appeared

`render_next_steps()` bails when `fw_sc_last_result` is empty, and that option is only written when
`conversion-parity.json` / `conversion-drops.json` exist in the bundle. `build_bundle()` emits them as a
side effect — and the admin's "Build the site from this mapping" path does not use it, it calls
`build_pages()` directly. So the primary conversion path produced **no self-assessment at all**, and the
punch list and agent brief had never once rendered on the path almost everyone uses. The path now calls
`FW_Site_Converter_Stitch::self_assessment( $html, $values, $pages )` — one method rather than two public
builders, so a caller cannot take half the assessment and believe it has the whole thing.

*The lesson worth keeping:* a feature whose entry condition is "some file exists" fails silently on any
path that does not produce that file, and looks identical to a feature nobody triggered.

### `text_coverage` — the audit that shares no code with the builder

`conversion-drops.json` carries a `text_coverage` block: every **visible phrase the source renders**,
checked for presence in the built pages + theme settings.

It exists because the drop log beside it **structurally cannot see a whole class of loss**. That log is
fed by the generic decompose walker, so it only ever records nodes *that walker* declined to emit. A node
discarded because a **recognizer claimed its ancestor and then ignored it** never reaches the walker at
all. On a real source the accordion recognizer claimed a services band and silently dropped the trailing
call-to-action link and the entire `<figure>` beside it (image + caption), while the drop report showed 15
drops — all from an unrelated FAQ group, none of them these. The instrument said the conversion was fine.

So the audit deliberately reads the source DOM and the output as two bags of text and asks one question:
is each source phrase somewhere in the output? That catches the whole class at once, whatever the cause —
a recognizer over-claiming, a walker skip, or text **glued** to a neighbour so the phrase no longer exists
as itself (`"01Complete home renovations"`).

| Field | Meaning |
|---|---|
| `checked` | source phrases tested (2+ real words) |
| `missing` / `items[]` | content we should have kept and did not |
| `out_of_scope[]` | text we deliberately did not carry, each with a `reason` |
| `coverage_pct` | `(checked - missing) / checked` |

**`items` and `out_of_scope` are different claims and are kept apart on purpose.** A consent/cookie banner
is a plugin's UI (the converted site gets its own consent plugin) and a skip link is an a11y affordance the
theme provides itself — neither is a loss. Folding them into `missing` would have put 7 non-findings in
front of 11 real ones on the first source this ran on.

Deliberately **not** reported, because they would be false positives: `display:none` / `hidden` /
`aria-hidden` subtrees (sources routinely ship a mobile *and* a desktop copy of a band with one hidden —
dropping the hidden twin is correct), `script`/`style`/`svg`, and phrases under two real words.

Two traps worth keeping in mind, both of which bit during the build:

- **Scope the out-of-scope classifier to an actual container.** Complianz stamps `cmplz-*` on `<html>` and
  `<body>`, so an ancestor climb that includes them matches *every* phrase on the page. The first run
  declared a services figcaption and a footer email address to be consent-banner text and reported **100%
  coverage with zero findings**. The climb now stops at `<body>`. A signature broad enough to match
  everything is not a signature.
- **`build_from_html()` returns `files`, not `pages`.** There is no top-level `pages` / `theme-settings`
  key; they are `files['pages.json']` and `files['theme-settings.json']`. A harness that reads the wrong
  key passes empty arrays and the audit reports ~6% coverage — a harness artifact that looks exactly like a
  catastrophic converter regression.

It is attached in `build_bundle()` (after `pages.json` and `theme-settings.json` are written, which is why
it cannot sit beside `build_drop_report()`), so **every** conversion carries it, not only the admin path
that calls `self_assessment()`.

Guarded by `tests/text-coverage-test.php`.

### Text glue: a boundary is a computed `display`, not a tag

DOM `textContent` concatenates with **no separator**, so anything reading it flattens stacked lines into
one word. `space_block_boundaries()` fixes that, and got it wrong twice in ways worth recording:

1. **It judged the boundary by tag name.** A source stacked its wordmark as
   `<span>NORTH RIDGE<small>HOME STUDIO</small></span>` — `<small>` is inline *by tag* and
   `display:block` *as measured*, so the tag list walked past it and the brand kept reading back glued long
   after a golden named "stacked wordmark lines are NOT glued" was passing. That golden was not a false
   pass; it only ever tested `<div><div>`, which the tag list already handled. The capture stamps `display`
   on every element — read it, and keep the tag list only as the fallback for an unstamped element.
2. **The space went only *after* the block.** An inline sibling followed by a block —
   `<span>01</span><h3>Complete home renovations</h3>` in an accordion toggle — is glued at the **front**,
   which a trailing-only space cannot reach. The separator now goes on both sides.

**Order matters:** `text_no_icons()` must space the boundaries **before** calling `scrub()`, because
`scrub()` strips `data-sc-cs` — and that attribute is where the measured `display` lives.

The JS twin is free: `capture-extract.mjs` runs in the browser, where `innerText` already honours layout,
so the wordmark reads through a `vtxt()` helper rather than `textContent`.

### Page discovery: the sitemap, not just the nav

`navPageUrls()` read exactly one source — `homeCapture.header.nav`, the links inside the header element,
filtered to labels under 30 characters. On a source whose `robots.txt` points at a sitemap listing **133
URLs**, it found 1, so the conversion produced **2 pages and reported success**. When the nav is your only
source, "the nav had one link" and "the site has one page" are the same observation, and a drawer that is
closed at capture time or a mega-menu that mounts on hover produces the first while looking like the second.

`discover.mjs` unions four sources, cheapest and most authoritative first:

| Source | Why it is there |
|---|---|
| **sitemap** | `robots.txt`'s `Sitemap:` lines, then `/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`; a sitemap index is followed one level. Authoritative, complete, one fetch, no browser render. |
| **nav** | What the old code used. Still the best signal for *which pages are primary*, so it drives the default selection. |
| **footer** | Where sites put what the header omits — legal, about, contact. |
| **page** | Same-origin anchors anywhere on the rendered home page; the catch-all. |

Every URL records **which sources produced it**, because that provenance is what lets a picker pre-select
sensibly instead of presenting 133 equal-looking checkboxes. Hashes and query strings normalise away (one
page with filters is one page), assets and `wp-*` internals are dropped.

Guarded by `discover.test.mjs`, deliberately network-free — the judgement lives in the pure functions, and a
test that needs the internet is a test that gets skipped.

### The page picker, and the batch that says what it left out

`/pages?url=` on the capture service answers the admin's **Check Pages** button. It is a separate, cheap
call rather than part of `/capture` on purpose: the point is to show the real list and let someone choose
**before** anything is captured.

The picker is full width, because a real site does not fit in a fifth column, and it **groups by path
prefix** — that source's 133 URLs are not 133 equal pages; 107 sit under one prefix (one template, many
landing pages). Three ordering lessons, each of which was a bug first:

1. **Sort groups by size descending and you rebuild the problem.** The panel opened with 107 near-identical
   rows and pushed the dozen real pages off screen — the exact failure grouping exists to prevent,
   reproduced by the sort meant to present it. Order is now: `Top level` first, then groups the nav points
   at, then **small before huge**.
2. **A top-level page is not its own group.** Grouping purely by first path segment gave `/about` a heading
   and a "select" button of its own, so a dozen real pages arrived as a dozen single-item groups —
   technically grouped, practically noise. A group is only drawn for a sub-tree (`depth > 1`).
3. **Cap the big groups, never the important one.** Large groups render 12 rows plus "+N more"; `Top level`
   renders up to 40, because truncating *that* hides real pages behind a "+4 more" while twelve rows of one
   template sit below it.

Selection is capped at **Max pages** and the panel states plainly how many are not in this batch. The chosen
set rides to the capture as **`only=`** — not `pages=`, because `pages=all` already means "return every
captured page in the response", and one parameter with two unrelated jobs is a bug waiting to happen. When
`only=` is present the capture **skips discovery entirely**: the user has reviewed that list, and
re-deriving it could only disagree with what they approved.

Pages the site already holds are marked **already converted** (matched against existing WP slugs) — marked,
never hidden, since someone may want to re-convert one and hiding it would look like discovery had missed
it. When any are found, **"Replace existing site" is unticked automatically**: that reset rebuilds Theme
Settings from the same source, so on a second round it is pure churn, and leaving it ticked invites the
reading that each round starts from scratch. It leaves pages alone either way, so nothing from round one is
ever at risk — batching is safe, and this is about not implying otherwise.

### Re-running ONE page

A conversion was all-or-nothing. One page wrong meant hand-fixing it (lost on the next conversion) or
reconverting the whole site — which re-derives the design system and discards every other page's state.
Neither is proportionate to "this one page is wrong", and neither helps in the common case: a converter
fix only reaches a page once that page is rebuilt.

It could not be offered before for a plain reason: **a converted page carried no record of the URL it was
built from.** The bundle knew which URL produced which page and dropped it. Pages now store
`_upw_source_url`, set in one place — `build_bundle()` takes `url` from each screen, and the single-page
callers already passed it as `source_url`, so the front page and every per-page snapshot get it for free.

`FW_Site_Converter_Rerun` then does the narrow thing:

- rebuilds **one** page's content from a fresh capture of its own source URL;
- does **not** re-derive the design system, theme, chrome, menus or Theme Settings — re-deriving those per
  page is exactly what made "the last page converted decides how the whole site looks";
- **does** overwrite that page's builder content, so the UI says so before running rather than letting the
  reader discover it afterwards. Corrections that must survive belong in the sandbox.

**It is the deterministic converter, not an AI pass.** Same source + same converter = same page (proven:
identical output once the per-build `unique_id` / `u<hash>` values are normalised). The AI refine pass
(`/refine-visual`) is the other tool — it writes CSS on top and keeps it only when measured drift improves.
Re-run fixes what the converter got wrong; refine fixes what the converter cannot express.

**The browser captures, not WordPress.** The admin endpoint takes a post id and HTML — never a URL. A
WordPress admin endpoint that fetches an arbitrary URL because a form said to is an SSRF report waiting to
happen, and fetching is the capture service's job.

Two bugs from building it, both of which failed *silently* and are now pinned by `rerun-test.php`:

- `import_json()` takes a JSON **string**; it was called with an **array**. PHP stringified it to `"Array"`,
  nothing was written, and the re-run reported success. `import()` is the array-taking entry point.
- The success check accepted an empty result as success — which is how a re-run that did nothing got
  reported as "Rebuilt". Success now requires a **page ID** as proof.

The list lives on the Convert panel, not the post-conversion results screen: that screen only renders
immediately after an import, and a page most often needs re-running days later.

### Refining ONE page — and why the CSS is scoped

Beside each page's **Re-run** sits **Refine (AI)**, and the two are named apart on purpose: they fail
differently and are worth reaching for at different times.

| | Re-run | Refine (AI) |
|---|---|---|
| engine | the deterministic converter | `/refine-visual` |
| does | rebuilds the page from a fresh capture | writes CSS on top |
| keeps | always — it is the converter's output | only when measured drift drops |
| for | what the converter got wrong | what the converter cannot express |

**The CSS is confined to the page it was measured on.** The refine loop measures ONE page and keeps CSS
only when THAT page improved. Writing it to the child theme unscoped would apply it to every page on the
site, where it was never measured and can only make things worse — a pass that improves one page by 4% and
quietly degrades eight others is not an improvement, and nothing downstream would notice.

`FW_Site_Converter_Rerun::scope_css()` prefixes every selector with `body.page-id-N`. The care is in the
cases that are not plain selectors, each of which silently breaks something if handled naively:

- **Every selector in a list**, not just the first — `.a,.b` prefixed only on `.a` leaks `.b` site-wide.
- **`@media` / `@supports` are recursed into**, not prefixed: prefixing the at-rule itself yields dead CSS.
- **`@keyframes` / `@font-face` pass through untouched** — their contents are not selectors, and scoping
  `from` / `0%` destroys the animation.
- **`body` / `html` / `:root` are rewritten, not descended from** — `body.page-id-7 body` matches nothing,
  so a whole-page background rule would vanish. What follows the tag decides how it rejoins: whitespace is
  a descendant combinator (`body .x` → `<scope> .x`), while `.` / `:` / `#` / `[` is a compound on the same
  element (`html.dark` → `<scope>.dark`). Reading only the first character conflates them, which turned
  `body .x` into `<scope>.x` — a rule matching nothing. That bug was caught by its own test.
- **Unbalanced CSS yields nothing**, rather than half a rule.
- **No scope yields nothing** — never unscoped CSS.

The block is labelled per page and replaced on a re-run rather than stacked, so repeated refines of the
same page converge. Verified end to end: two refines of one page leave exactly one block carrying the
second result, and empty CSS is a no-op success (the pass keeping nothing is a normal outcome, not a
failure). Guarded by `rerun-test.php`.


### Every page, not just the home page

Two instruments had the same blind spot, and it was the expensive kind: they looked thorough.

**The coverage audit** was wired into the bundle with `$screens[0]` — the home page — while its haystack
held every built page. An inner page could lose its entire body and the report would still say 100%. The
audit built to catch silent content loss was itself silent about every page but one. `build_text_coverage_all()`
now audits each captured page and tags every finding with the page it came from, because "we lost the
pricing table" and "we lost it on /pricing" are different amounts of information and only the second is
actionable.

**The layout lenses** (`verifySections`, `verifyUrls`) each take ONE source/converted pair, and nothing
looped them — so every layout claim about a conversion was a claim about its home page. `verify-site.mjs`
runs the section lens per page and ranks the result worst-first, exposed as `/verify-site` on the service.

Measured on one real conversion, the first time either ran site-wide:

| | home page alone | whole site |
|---|---|---|
| coverage | 97.7% | **97.4%** over 11 pages, worst page **83.8%** |
| missing items (section lens) | 17 | **158** across 7 pages |

The home page was about a tenth of the problem, and the two worst pages — a form page losing its trust
badges, reassurance copy and a heading, and a calculator page — were ones nobody had opened. The two
instruments agree on which pages are worst, which is the useful part: they share no code.

`planPages()` is pulled out and tested without a browser. The home page always leads (everything else is
judged against it), duplicates collapse, and the cap is applied LAST so it trims the tail rather than
dropping `/` when a caller passes a full list and a small limit.

*The lesson worth keeping:* a lens you have to aim will only ever be aimed at the easy page. Loop it, rank
the output, and the pages nobody looks at stop being the pages where problems accumulate.

### Time budgets: why a capture died at 300s with nothing to show

A conversion failed with `capture exceeded 300s watchdog — aborted`. The obvious reading was "too many
pages". The log said otherwise:

```
[161.2s] local AI (8B local model) → naming box presets…
[281.2s] [box-names] local naming skipped: Could not reach the local runner … (aborted due to timeout)
[294.1s] local AI (8B local model) → naming sections…
[300.0s] FAILED: capture exceeded 300s watchdog
```

**One optional, cosmetic pass burned 120 seconds and produced nothing**, then the next began six seconds
before the deadline. Every AI pass read `AI_TIMEOUT_MS || 120000` *independently*, against a single 300s
whole-capture watchdog — so any one of them could spend 40% of the budget, and two in a row could end the
run. All 294 seconds of completed work (typography, presets, accordions, patterns) were discarded.

Three separate defects, all of which made the failure harder to read than it needed to be:

**1. No shared budget.** `setAiDeadline()` now opens one budget per capture — a third of the watchdog,
capped at 90s — and `aiTimeout(def)` returns `min(own default, AI_CALL_MAX_MS (30s), budget remaining)`.
When the budget is spent it returns `1ms`, so the fetch aborts at once and each call site's existing catch
reports a skip. *Skipping a naming pass costs a nicer preset label; overrunning the watchdog costs the
whole conversion.* Guarded by `ai-budget.test.mjs`.

**2. A flat watchdog for a variable amount of work.** One watchdog covers the design system *plus every
page in the batch*, so 300s meant "comfortable for one page, a coin flip for ten". That was invisible while
discovery only ever found one or two pages; the moment discovery started finding what sites really publish,
it mattered. It now scales: `300s + 60s per extra page` (`CAPTURE_PER_PAGE_MS`), and the budget is printed
at the top of every run so a deadline is never a mystery.

| pages | watchdog | AI share |
|---|---|---|
| 1 | 300s | 90s |
| 3 | 420s | 90s |
| 10 | 840s | 90s |

**3. The error named the wrong cause.** An `AbortSignal.timeout` rejection and a refused connection both
printed *"Could not reach the local runner … — is it running?"*. On this run the runner **was** running and
serving; the model was simply slower than the deadline. That message sends someone to check a service that
is already up. `ollamaError()` now separates the two: a timeout says the model did not answer in time and
points at `AI_CALL_MAX_MS` or a smaller model.

**4. A deadline that discarded the work it was protecting.** Every output file is written in one block at
the very end, so aborting at the watchdog left `error.txt` and nothing else. There are now **two**
deadlines: a **soft** one, reached first, after which the capture stops *taking on* new optional work and
heads for the write phase with what it has; and the **hard** watchdog, unchanged, for a stage that truly
hangs. `CAPTURE_RESERVE_MS` (default 45s) is what the write phase needs.

Past the soft line the capture stops adding pages and skips animation tracing — a bundle with four of six
pages and no motion findings is useful; one that spent its last minute tracing motion and wrote nothing is
not. Crossing it is **not an error and not silent**: the run reports how many pages it dropped and why, so
a short bundle is never mistaken for a complete one.

*The lesson worth keeping:* an optional enhancement must never be able to spend the budget the required
work needs. Give the optional part its own allowance, and make the failure name the thing that actually
failed — otherwise the diagnosis goes to the most visible number (page count) rather than the real cause.

### Container width: one setting must not mean two things

Every body section on every converted site rendered `2 × gutter` narrower than the header and footer, and
sat 16px further in. The cause was a **double containment**, not a bad measurement:

```
main.site-content    w=1400 x=20  padL=16  maxW=1400px   <- correct: content 1368 at x=36 (= the source exactly)
  .fw-page-builder-content  w=1368 x=36                  <- correct
    section                 w=1368 x=36                  <- correct
      .fw-flexbox           w=1336 x=52                  <- capped a SECOND time
```

The page wrapper has already applied the site container **and** its gutter. The flexbox's content-width cap
then took `100% - 2*gutter` **of that**. The `100% - 2*gutter` term is a *viewport* safety gutter and is
right when `.fw-contained` is used standalone, so it is scoped off rather than deleted: an ancestor that has
already spent the gutter declares `--fw-inner-gutter: 0px`, and the cap reads
`var(--fw-inner-gutter, var(--container-gutter, …))`. `.fw-full-bleed` reads `--container-gutter` directly
and is unaffected.

Verified by measuring the real text margins on both sides, which is the only claim that matters:
**source `36 → 1404` (span 1368), converted `36 → 1404` (span 1368)** — and heading after heading matching
to the pixel (`285/398`, `813/398`, `336/768`, `272/896`).

*The lesson worth keeping:* the theme's own comment said it plainly — "Container Width is the CONTENT width:
the gutter lives OUTSIDE it". `.fw-container` implemented that; `.fw-contained` and the flexbox cap treated
the same value as an outer box. One setting meaning two things renders as a site whose body never lines up
with its own chrome, and it is invisible until you measure both.

### One accordion title derivation, whichever shape the source used

`accordion_block()` has three branches (`<details>`, unannotated toggles, `aria-expanded`) and each derived
its title differently — only the middle one stripped the `+`/`−` glyph. On an aria-expanded source whose
toggle is `<span>01</span><h3>Title</h3><span aria-hidden="true">−</span>`, that produced
`"01Complete home renovations−"`, which reads as **missing content** to anything looking for the source's
own phrases. A cosmetic defect and real content loss were indistinguishable.

All three now call `toggle_title()`: drop icon spans and space block boundaries, drop a decorative
`aria-hidden` subtree that carries **no letters or digits** (a glyph — one carrying words is content
someone chose to hide from AT, so it stays), then strip a leading/trailing toggle glyph. **The ordinal is
kept** (`"01 Complete home renovations"`) — it is text the source renders, and dropping it would be content
loss of exactly the kind this fix exists to prevent.

### The first-run briefing (`FW_Site_Converter_Intro`)

A modal, once per user, suppressed by `FW_SITE_CONVERTER_DEV`. The page already carried a beta notice and
it did nothing — one of five notices on a screen that opens with a wall of options, so the user scrolled
past their own warning. The copy is deliberately specific rather than reassuring: *content comes across
reliably, layout and spacing usually need a pass, convert somewhere you can throw away.* "Results vary by
source" tells a reader nothing they can act on. Naming the weak spot costs a little enthusiasm and buys the
difference between "this is rough" and "this lied to me".

Two rendering traps it hit, both worth knowing:

- **It must render OUTSIDE `.wrap`.** WordPress relocates every admin notice into `.wrap`, immediately
  after the first heading it finds — so a modal rendered inline was that heading, and unrelated notices
  (the theme's welcome, update nags) were injected **inside the dialog box**. It renders on `admin_footer`.
- **Dark mode is the Admin Skin's, not the OS's.** The skin publishes `html[data-upa-mode]` = light | dark
  | system. Keying only off `prefers-color-scheme` produced a white dialog on a dark admin whenever the OS
  was set to light, and an explicit `light` has to win over a dark OS — so the light case is stated rather
  than left to the default.

### The handoff, in four states

The AI Assistant ships **inactive**, so "not activated" is the default a first-time user meets, not an edge
case. The results panel therefore offers: *Enable the AI Assistant* → *Set up* → *Fix these with the
assistant* → and, once declined, a quiet link that never asks again. It never activates the extension
itself: silently switching on something that ships an MCP server and five write abilities spends trust that
cannot be earned back, to save about two seconds.

The three routes are ranked **by the job**, not by which is the newest feature. For a whole-site pass an
external agent that can measure both pages and iterate is the better tool — the assistant's own UI says a
local model is "best for one section at a time" — so presenting the copy-able brief as a fallback for people
without the assistant would mis-rank it and set up a second disappointment.

### A converted site is not a new site

The parent theme's first-run checklist assumes a site with nothing set up. A conversion creates the menu,
the homepage and the footer, so straight after one the theme greeted its owner with items already ticked,
pointing at generic setup, while the converter's results panel sat beside it with the specific list. Two
onboarding surfaces talking over each other at the moment someone is deciding whether the tool worked.

The theme now exposes **`unysonplus_show_onboarding_notice`** and the converter answers it, so neither has
to learn about the other. Keyed on *has this site ever been converted* rather than a time window — the
checklist's premise does not become true again a week later. Getting Started stays reachable from
Appearance; only the nag goes.

## Telling the user what a long build is doing

"Build the site from this mapping" takes a few seconds on a small page and close to a minute on a large
one. For all of that time the only thing that changed was a disabled button reading "Building…", several
screens below the indicator that was supposed to report progress — so the page read as hung. The indicator
existed; nobody could see it.

**`FW_Site_Converter_Progress`** reports the pipeline's real phases: pages, media, presets, Theme Settings,
theme generation, content, finish. `start()` declares the whole ordered list, `step()` marks the one now
running, `finish()` / `fail()` close the run. Guarded by `tests/progress-test.php` (16 assertions).

**Why a transient and not a property.** The reader is a *different HTTP request* — the browser polls
`wp_ajax_fw_sc_progress` while the build POST is still in flight, so the two processes share nothing but
the database. Verified across two real wp-cli processes: a writer stepping every two seconds and a reader
polling once a second, with the reader observing each transition live.

**Why named steps and not a percentage.** The existing `loading()` bar eases asymptotically toward 99% over
a 7-second estimate, so on a 60-second build it reaches ~99% in about fifteen seconds and then sits there
for forty-five more — which reads as frozen rather than slow, and is worse than showing nothing. A step
list cannot lie that way: each step has either finished or not.

**`done` is derived from the declared ORDER, not from a matching finish() call.** A phase that returns
early, throws, or is skipped by an option therefore cannot leave a spinner attached to work nothing is
doing. The test asserts exactly this case.

**The panel renders next to the button that started the build**, not at the top of the panel, and scrolls
itself into view. The elapsed counter appears only after five seconds, so a quick build stays quiet and a
slow one says "23s — large pages can take about a minute" instead of looking stuck. A failed run keeps its
step list (it says how far it got), stops every animation, and names the step it stopped on. Motion is the
signal, so `prefers-reduced-motion` gets a static equivalent rather than nothing.

## The result panel — the conversion tells the user what it already knows

Every conversion grades itself: `build_parity_report()` writes `conversion-parity.json` (the structural
checks, each pass/fail with its source and converted value) and the drop log writes
`conversion-drops.json`. Both used to land in a capture folder the user never opens, so a conversion that
knew exactly where it was weak reported none of it, and the user found out by scrolling.

**`FW_Site_Converter_Bundle::remember_result( $dir, $files = null )`** persists a compact record to the
option `fw_sc_last_result` — the score, the failed checks (id, label, source, converted, note) and the
drop counts, with the source URL read from `theme-design.json`. It is called from two places, and the
order matters: early in `import_dir()` (a bundle carrying its own reports but never rebuilt still has
something to say) and again from `write_executed_report()`, which overwrites it with the PHP engine's own
numbers — those are what the site was actually built from, so they are the authoritative ones.

**`FW_Extension_Site_Converter::render_next_steps()`** renders it under the import notice, turning ONE
findings list into the three things a reader might want:

- a plain-language punch list — each failed check as a symptom plus where it is fixed (`$guide` maps check
  id → symptom + Theme Settings path; an unmapped id still lists using the check's own label, because an
  unnamed finding beats a silent one),
- a copy-able brief for an AI agent, pre-filled with this conversion's own numbers and the source/converted
  URLs — the condensed form of [converter-fix-my-site-prompt.md](../converter-fix-my-site-prompt.md),
- a line pointing at the **AI Assistant** extension when it is active, since it can edit the converted
  pages directly and every change it makes is undoable.

Two deliberate choices:

**It is result-aware.** A clean conversion is told it is clean and given the review order; it is not asked
whether it is disappointed. A panel that says the same thing to a good and a bad result teaches the reader
to ignore it, and priming someone to hunt for failure is a poor way to set expectations.

**The brief asks for the finding to be SHARED, and says what for.** An agent told only to "report back"
reports to the person in the room and the finding dies there — the next site of the same shape gets solved
by hand again. Told that a source fragment plus the wrong output *is a test case*, and that one shared case
is fixed once for everybody, it writes something a maintainer can act on. The ask is narrow on purpose:
**the case, not the patch.** A patch tuned to a single source is exactly what the converter must not take;
a reproducible case can be run against the corpus, which is the only way to tell a general rule from a
coincidence. Privacy limits (no client names, no private URLs, the owner's consent) are stated in the ask
rather than left to the agent.

When you add a parity check, add its `$guide` entry in the same edit — otherwise the panel names the check
but cannot say where to fix it.

## Conversion-report analysis → improve the converter

Each `node capture.mjs <url> [outdir]` run emits a **conversion report**
(`<outdir>/<site>/conversion-report.csv` + `.html`) tracing every source element → the shortcode it
became, flagged `fallback` (code_block catch-all), `opportunity` (a richer role detected but not
mapped), `styling drop`, and `over-large`/under-segmentation. To analyze a batch (captures accumulate
under `capture-out/`): aggregate the CSVs, rank the **systematic** failures (most-common fallbacks,
recurring styling drops, over-large sections), then **improve the converter** — mirroring any change to
BOTH the JS (`to-pages`/`capture-extract`) and PHP (`Mapper`/`Stitch`) paths (a JS-path report is a
great way to catch JS↔PHP drift; e.g. cards/counters mapped to `icon_box`/`counter` in PHP but
code_blocked in JS). For new shortcode atoms, use the **live plugin defaults** (dump via a WP-loaded PHP
script writing to a FILE — stdout gets eaten — then store the full default-att shape in
`atom-templates.json` so generated nodes carry no missing nested atts). **Delete each analyzed site
folder from `capture-out/` when done** (captures regenerate; deleting prevents re-analysis).

### How to report a discrepancy so the converter can be fixed (the reporting contract for agents)

The reports are only useful when they name what the RULE needs, not what the eye saw. A report that says "the hero
looks different" fixes nothing; one that says "hero video shell 578×325 vs. source 692×728, the shell's `aspect-[.95]`
+ `max-w-[880px]` were not carried, the cell was an `html` fallback" is a one-rule fix. Every report an agent writes
about a conversion — the service's CSVs, a chat summary, a .docx audit — follows this contract:

1. **Measure against the BUILT page, never against the data.** The page-builder JSON being right proves nothing (a
   dropped padding falls back to the theme's default silently; a stale combined CSS hides a new rule). Reconvert
   through the real path (`FW_Site_Converter_Bundle::import_dir` / the admin Convert), purge the caches, and read
   computed values with Playwright — the branded Chrome channel when the source has H.264 video (Chromium has no
   codec, so a `<video>` measures as an empty box).
2. **Every discrepancy = a measured pair + the source cause + the converter path.** `region · property · source
   value · converted value · the source construct that produced it (the class / rule / tag) · the converter path
   that lost it (verbatim fallback, dropped declaration, wrong recognizer, a theme default winning)`. The source
   construct is what turns one page's bug into a GENERAL rule; the path is where the rule goes.
3. **Separate the three kinds of loss.** *Not captured* (the capture never stamped it — fix `capture.mjs` PROPS or a
   stamp), *captured but dropped* (the stitch / extract read it and threw it away — fix the carrier), *carried but
   overridden* (the CSS reached the page and lost to the theme — fix the selector / `!important` / the native
   option). The fix lives in a different file for each; a report that does not say which sends the next agent to
   the wrong twin.
4. **Name the twin.** State whether the PHP path (`Stitch` / `Mapper`, what the admin Convert runs) or the JS path
   (`capture-extract` / `to-pages`, what the service's own report measures) produced the loss, and whether the
   other twin has the rule. A JS-only report can pass while the admin import still fails, and vice versa.
5. **Never trust silence.** A report file that did not change is not a clean result — check the run stamp; a
   Playwright probe that returns nothing may be the login page (check `document.title`); a `0 fallbacks` line means
   nothing fell to `code_block`, not that every value is right — the style-coverage and the measured diff are
   what say that.
6. **Say what was NOT verified.** A region skipped, a breakpoint not measured, an animation not observed: list it.
   "Satisfactory" with a known-gaps list is a usable report; "done" without one is not.
7. **Write the general rule, not the page.** The recommendation names the measured construct ("an absolute, empty,
   painted child of a band" / "a `body::before` fixed layer"), never the site, and proposes where the rule lands
   (recognizer number / builder / capture stamp) plus the golden check that would prove it. Site and brand names
   never appear in kit artifacts.
8. **The wire format is the tuple, and the sender enforces it.** `send-finding.mjs` refuses (exit 2) a finding
   without `region` · `property` · `got` · `expected` · `construct` · `path` (the `capture-out/<site>` folder) ·
   `twin` · `loss`; the refusal prints the shape. This exists because 528 findings arrived as free text and the ones
   that stayed open were exactly the ones without a construct or a capture path. `pull-findings.mjs` reads the
   published sheet back (`share-config.json` → `feed.publishedCsv`) and prints the tuple fields when present.
9. **A repro fixture beats a description.** `make-fixture.mjs capture-out/<site> "<selector>"` cuts the failing construct
   out of `rendered.html` with its stamps, rebuilds only its band + the ancestors on the path, and scrubs it to structure
   (`fixture.mjs`: every text run → a neutral word of the same length, `src`/`href`/`poster` → `#`, other attributes
   dropped, ≤ 32 KB — over that the tool keeps 3 of every run of same-class siblings instead of truncating). The finding carries it as `fixture` (`@file` inlined by the sender) with a `solution` that states the
   general rule; `pull-findings.mjs --fixtures=<dir>` writes them out as `fixture-NNN.html` + `.json` for the harness. The
   agent's own per-site fix lives in its child theme and is never the report — the sender refuses a `#id{…}` patch.
10. **A fixture is proven, not guessed.** Run it through the PHP twin and put the output in `twin_shows` ("code_block ×4, 0
    gallery"). When the twin's output is not the page's miss, the fixture reproduces a DIFFERENT construct — a one-tile cut of
    a grid takes the lone-card path (a grid rule needs ≥ 3 repeats; `make-fixture.mjs` keeps 3 per run) — so re-cut it, and
    check it kept its text and icons. The sender refuses a `fixture` without `twin_shows`.
11. **"Fixed per-site" is not a report.** The patch the agent wrote in its child theme is the most valuable artefact: state
    it as the general rule in `solution` (which construct → which converter path / selector / option). The sender refuses
    a note that says "fixed per-site / in chrome.css / natively" without a `solution`.
12. **Rank it.** `severity`: `layout` (a band / column lost or moved) · `content-loss` (text / image / link gone) · `style`
    (a colour / size / weight / spacing off) · `cosmetic` (≤ 2 px, a hover state, a divider). The maintainer orders a batch
    by it; without it a dropped image half and a 1 px divider arrive with the same weight.
13. **`computed` settles the cascade.** For every `overridden` loss give what `getComputedStyle` returned on the BUILT page
    and which rule won (selector + specificity, or "the emitted rule is absent from the combined CSS"). Twice a "theme rule
    outranks the preset" turned out to be a stale combined-CSS cache.
14. **No POSITIVE rows.** What the converter got right is one line in the once-per-site summary
    (`--summary --positives="hero cover + 3 icon boxes + pricing 3 plans"`); a POSITIVE finding row carries nothing a rule
    can use and the sender refuses it. Seven per site were padding the feed.
15. **Resolve the PRESETS before calling anything dropped.** A card's skin lives on the column's Box Preset
    (`border_preset` → `theme-settings.json` → `border_presets[].custom_css` / `states`), a button's on its Button Preset
    (`button_colors[].custom_css`), a heading's type on a Text Style preset — not on the element's `custom_css`. A
    `twin_shows` that reads only `custom_css` reports a preset-carried skin as "dropped" (the glass hero panel of
    2026-09-19: backdrop, clip and shadow were all on the preset; only the 2 % fill and the skew were missing). Read the
    builder node's preset references and the preset's own fields, then name what is actually absent.
16. **`expected` is the source's COMPUTED value, never an inference.** Read it off the stamp / `getComputedStyle` on the
    source at the same viewport. "3 tracks of ~518" for a `repeat(auto-fit, minmax(350px,1fr))` grid was a guess; the
    stamp said `584px 584px 0px` — two tracks. A wrong `expected` sends the fix the wrong way.
17. **The fixture must CARRY the property the finding names.** Before sending, grep the fixture for the property in
    `expected` (`mask-image`, a `::before` `background`); if the stamp lacks it, the loss is *not captured* (item 3) —
    report it as a capture gap (`capture.mjs` PROPS / the hover stamper), not as a converter drop, and say so.
18. **Report against the CURRENT converter.** Check `kit-manifest.json` (`bump_triggers`) / the service `/health`
    against the feed's last close-out before filing; a batch filed on a stale converter re-reports rules that shipped
    that morning (3 of 11 on 2026-09-19). If a re-run on the new version changes a finding, file a `CORRECTION
    (refine)` row that names the original ref.
19. **A systematic finding ships a fixture.** `systematic: true` without a `fixture` is a claim the maintainer cannot
    prove or golden; cut one with `make-fixture.mjs` even when the construct is typography or CSS scoping (a heading with
    its `text-shadow` stamp, a `<style>` with the `:root` block) — the fixture-less rows of a batch are the ones that wait.

What each service report is for — read them in this order: `conversion-report.csv` (per element: which shortcode,
`fallback` / `why` — the structural verdict), `style-coverage.csv` + `coverage-verification.csv` (per section: which
significant properties reached the built page and HOW — `css` / `option` / `preset`; the verification file lists
the losses with the reason, header-only when clean), `animation-report.csv` (what the source animates, what the
converter carried as a stamp vs. only suggested), `capture-residue.csv` (source constructs the capture saw but no
rule claimed), `conversion-parity.csv` (JS twin vs. PHP twin per section — a drift here is a twin bug, not a page
bug). Then the measured diff (`verify.mjs` `verifyUrls` bands, or a per-element computed-style probe) is the final
word; the CSVs point at where to look, the measurement decides.

## Contrast review — detect + ask, never auto-adjust the brand

Every created OR converted site must pass the a11y/SEO/perf **score-keeping standards** (contrast
≥ 4.5:1, links-not-color-only, heading order, `alt`, structured data) — see the plugin's
`site-converter/docs/seo-performance-accessibility-standards.md` (run its **§0 ship gate** before
calling a site done). The converter emits a **contrast review** that flags low-contrast brand pairs
and suggests an AA-compliant shade — but it **never changes the user's colors**. A converted palette
is the user's brand: **detect + surface it, ask; do not auto-adjust.**

## Target architecture — capture EVERY element's full style + states, then map (don't curate)

**Class→value translation is already THE mechanism (above); what's still expanding is its COVERAGE** —
capturing *every* element's full style + states so nothing is curated away. The converter still
**code_blocks** some bespoke pieces and can drop per-element detail (`:hover`, `text-decoration` wavy
underlines, `animation`, `box-shadow`, `transform`); closing that is broadening the same translation, not a
different model. The full model:

1. **Capture — walk every container/element** and dump its **full computed style** PLUS its interaction
   states (`:hover`, `:focus`, `:active`). Resting styles come from `getComputedStyle`; states come from
   resolving the element's `hover:*`/`focus:*` utilities (arbitrary `[#hex]` parsed directly; named via a
   probe of the page's compiled CSS — see `hoverStyle()` in `capture-extract.mjs`) or by scanning the
   stylesheets for `:hover`/`:active` rules that match the element.
2. **Map — translate, don't drop.** Known design properties → the matching **builder option / Theme
   Settings preset / element `CSS Class`** (colors→palette, type→typography, buttons→Buttons builder incl.
   its **Hover** state, spacing→spacing scale, boxes→box presets). Everything the builder can't express —
   a wavy `text-decoration`, a keyframe `animation`, a one-off `transform` — becomes **scoped element
   CSS** (Misc → Custom CSS / the child theme), keyed off the element's `css_class`. **Nothing captured
   is dropped**: it's either a builder option or scoped CSS.

This keeps the tension honest: full capture = fidelity; the map step keeps it editable/on-brand where it
can, and only falls to scoped CSS for the genuinely un-expressible. **Prove a translation with the
browser-free class-string fixture** (`tailwind-matrix.test.mjs`) as above; the rendered comparison tool
(`tools/measure/fidelity-check.mjs`, which diffs the *full* per-element computed style — text-decoration,
animation, box-shadow, transform, letter-spacing) is the **secondary assembly check** that flags a missing
wavy underline or bounce — not the place a value is derived.

### Implementation status (per-element full-style + state capture)

- **Capture — DONE.** `capture-extract.mjs`'s `styleOf()` now records the full per-element style incl.
  `text-decoration`, `animation`, `transform`, `transition`, and the element's `:hover` (via
  `hoverStyle()`), on every decomposed node (verified: nodes carry animation/hover/transform). Plus the
  brand button's hover → `tokens.brandHover` → design-config `hover_bg/color/border`.
- **Emit (mirror path) — DONE.** `to-mirror.mjs` `stylesToCss()` emits those props, and `klass()` also
  pushes a `.scm-x:hover{…}` rule from the node's hover + the `@keyframes` for known Tailwind animations
  (bounce/pulse/spin/ping) once. Verbatim `code_block` sections already keep the source's `hover:`
  classes + CSS, so hover is preserved there too.
- **Shipped 2026-07-31 (both paths, JS + PHP, kept in sync — see the extension's `CONVERSION-ALGORITHM-SYNC.md`):**
  the "map a captured design prop → a **builder option**" follow-on is now substantially real, not always scoped CSS:
  - **Tailwind class → design-token translation.** JS `capture-extract` attaches `styles.tw` (shadow/radius/
    border/spacing/font scale) + a site-level `tailwind` flag; the PHP `_Tailwind` compiler resolves arbitrary
    `[#hex]` values, the full default colour palette (`pink-200`…), and `shadow-xl/2xl`.
  - **Button Colour/Size Presets from the source skin** → `button_colors` + `button_sizes` Theme-Settings
    presets (bg/text/border/`box_shadow` per state; padding/radius/font). `buildButtonPresets()` (JS) /
    `FW_Site_Converter_Stitch::build_button_presets()` (PHP).
    - **Size algorithm (both twins, fixtures `[B6]` PHP / §6 JS).** (1) *Cluster*: every short-text `a`/`button`
      skin is bucketed by (font-size ±1px, padding-x ±3, padding-y ±3, fixed height ±3) so noisy computed values
      collapse to one preset; each property's value is the cluster MODE. (2) *Rank* by the box a reader perceives —
      a fixed height (`.btn{height:58px}` / `h-11`), else `font-size × 1.3 + 2 × padding-y` — with font-size, then
      frequency, as tie-breaks. Size = the box, not the type: a 58px pill with 10px uppercase text ranks above a
      padded 54px button with 14px text. (3) *Name*: **the source's own size names win** (`btn-sm` / `btn-lg` /
      `button--large` / `btn-xl`, majority vote per cluster); otherwise **the most-used size is "Default"**
      (slug `md`) and every other size is named by where it sits relative to it — bigger → Large, X-Large,
      2X-Large; smaller → Small, X-Small, 2X-Small (7-step ladder, ids `0000010000`–`0000010006`). So one size
      → *Default*; two → *Default + Large* or *Default + Small*; three → *Small / Default / Large*, or *Default /
      Small / X-Small* when the default is the biggest. A source-named most-used size keeps its name and is
      marked "(Default)". The previous fixed ladder always started at "Large", so a lone size was "Large" and
      the ladder said nothing about which size the site actually used.
  - **Boxed text + floating chips (both twins, fixtures `[C3]` PHP / `boxed-text-parity.test.mjs` JS).** A text
    element that *is* a box — a visible fill (solid or gradient), a real border, or a shadow (`text_is_box()`; an
    inert `border-radius:0px` doesn't count) — is never folded into a heading's subtitle: a subtitle can't carry
    a box. It becomes a `text_block` wearing a **real Box Preset** on its native `box_style` (the skin read from
    the computed style: fill, gradient, border, radius, shadow, 1–4-value padding, backdrop blur → `register_box_preset()`),
    with the preset owning those properties and the block keeping its OWN line-height at normal specificity
    (the section-level text styler would otherwise average it with the band's chips). An **out-of-flow** text
    (`position:absolute` — a note pinned over a hero) also gets the native **Position** option
    (`element_position`): the sides the source DECLARED (Tailwind `left-[8%] top-[18%]` compile to exact lengths,
    a `%` stays a `%`; else the computed offsets anchored to the nearer edge per axis), z-index from the source
    or `2` (above a band's media z:0 / overlay z:1). Such a chip is **hoisted** to be a direct child of its
    section: the section becomes Position: relative (the source's containing block), and — because the theme
    positions every direct child of a media band and would turn the chip's auto container into a zero-height
    containing block — the section's Custom CSS frees just that container (`selector > .fw-container:has(.u{id8})
    {position:static !important}`). A floating badge inside a *card* keeps the column as its anchor, as before.
    Capture stamps `top/right/bottom/left/z-index` (`capture.mjs` PROPS) so non-Tailwind sources work too.
  - **Structural testimonials detection** (a flex/grid of quote-cards → `testimonials`, no class name needed).
  - **Fewer `code_block` fallbacks** — an unrecognised text cell → editable `text_block`. A **genuinely
    styleless** empty cell (no class, no inline style, nothing to render) is dropped; a decorative flourish
    that carries a class or inline style (a blob / gradient overlay) is **preserved verbatim as a `code_block`**
    (as of 2026-08-02) so its visual survives — nothing with content or style is dropped.
  - **Flex-row cell → native `content_direction` + `content_gap`** (replaces the old `.btn-row` CSS wrapper).
- **Shipped 2026-08-02 (both paths, JS + PHP, kept in sync):**
  - **File uploads use the URL engine.** With the capture service running, a Stitch `.zip` / pasted
    `code.html` is POSTed to the service's new **`/capture-file`** (unzip → render `code.html` in headless
    Chrome via a `pathToFileURL` file:// URL → the SAME `capture-extract` engine as a live URL), so a file
    gets full computed-CSS fidelity (dynamic header/footer, real colors/fonts) instead of the static parse;
    the offline PHP `_Stitch` parser is the fallback. Two engine fixes made CDN-driven exports capture:
    retry `page.evaluate` when a late CDN runtime (Tailwind Play) destroys the execution context, and
    **wait until styling is APPLIED** (a real stylesheet exists / the font swapped) not just network-idle.
  - **AI scoped to MAPPING-ONLY.** `/ai-convert` now returns only a corrected mapping (fix roles / mark
    `skip` / flag a bespoke widget as one verbatim `code` block) — **never CSS or chrome**; the deterministic
    engine owns all output. The AI↔draft diff is distilled into **local learned rules**
    (`distill_from_ai()`) the offline path consults first — 100% local, no telemetry. (Earlier
    AI-authored-stylesheet behavior was removed: two engines both writing CSS fought each other.)
  - **"Attach media" uploader → hero BACKGROUND video** (starts closing the hero/media gap below). A
    full-screen `<video>` (absolute + object-cover) is flagged **`bg`** by both engines (`videoBlockOf` in
    `capture-extract.mjs`; the `<video>` recognizer in `_Stitch`), and the mapper pulls it out of the
    content and wires it into the **section background video** (`Mapper::apply_bg_video` → the section
    `background.video` layer, autoplay/muted/loop) instead of a content `media_video`. The Convert box's
    optional media uploader sideloads real files (`FW_Site_Converter_Media::sideload_upload`) into a
    basename→attachment map (`Mapper::set_assets` / `upload_val`), so a hero video the source only
    references via an external CDN is provided directly + matched by filename — and matched
    `media_image`/`media_video` URLs are swapped to the Media-Library copy.
- **Remaining follow-ons:** emit hover on the **to-pages decomposed** path (not just the mirror path); the
  **hero / media-bearing** sections still fall to verbatim `code_block` for non-video heroes (fidelity-
  preserving; background-video heroes now map to a section bg video, see 2026-08-02 above); broaden
  token→option mapping beyond buttons (typography, spacing, boxes).

### 2026-09-23 — pinned overlays, glyph fidelity, the product tile and the five-column footer

A section-by-section audit of a converted source (see
[converter-training-prompt.md](../converter-training-prompt.md)) took the page from **138 → 107**
element-level findings. Each fix is a general rule with a golden ([AN]–[AP], now 1142 assertions):

- **A pinned LABEL over a photo** (`absolute top-6 left-6`, no fill, no radius) is a third overlay class
  beside the floating card and the decorative blob. `img_pinned_labels_css()` folds it onto the media
  node as `::after`, anchored to whichever computed edge is **nearer** (so it holds for a source with no
  utility classes) and wearing the innermost leaf's own face. It must be ONE leaf — a stacked lockup
  would glue into `"BRAND1923COUNTRY"`, since a pseudo-element's `content` is a single string.
- **A grid CELL that IS a photo frame is claimed whole.** The cell path only ran `claim_element()`, which
  applies the claim rules but never the recognizers, so the frame was split into a bare image plus a
  stray paragraph.
- **A control's inline glyph survives a shortcode with no icon slot.** `Mapper::svg_mask_css()` paints it
  as a `currentColor` **mask** pseudo-element, at the glyph's *rendered* size (its `w-3.5` class, not the
  svg's own 24px attribute), so it follows the control's colour and hover colour. `iconSvg` previously
  held only an arrow MARKER string, so every other glyph was discarded.
- **A control whose source border is not uniform on four edges keeps those edges** (and its
  `justify-content`) instead of taking a Button Preset's full box.
- **A card's meta row keeps two cells**, each with its own measured type — and a colour is written as
  **hex**, because WordPress's `safecss_filter_attr` drops an inline `rgb()` colour outright and keeps a
  hex one. (The data was right and the render was wrong: only the rendered check caught it.)
- **A five-column footer carries its measured tracks as scoped CSS.** The theme's fifths picker can only
  express compositions summing to five units, so five physical columns have no native choice but equal —
  which drew the brand column 162px too narrow, wrapped its wordmark and shifted every link column.
- **A social link that shows a TEXT label belongs to its column**, not the social icon row; only a
  glyph-bearing one is a social chip. Both the detector and the column's link filter now agree.

**Parity:** the pinned-label rule has its JS twin (`pinnedLabelOf` in `capture-extract.mjs` +
`mediaImageNode` in `to-pages.mjs`, guarded by `feed-themes-parity.test.mjs`). The **product-tile rules
are PHP-only** — the JS path has no `image_box` builder and no card meta-row reader at all, so there is
nothing to keep in sync until one exists; the same is true of the footer column rules (chrome detection
has always been PHP-only).

**Lens work in the same pass** (capture service `verify.mjs`): `verifySections()` now models element
**skin** (fill, border, radius, shadow, weight, tracking, case, alignment), **icons and painted boxes**,
**cross-section relocation**, the **pinned-vs-flow** position model, **pseudo-element text and mask
glyphs**, and ancestor visibility via `checkVisibility()`. Each was added because a real defect — or a
real non-defect — was invisible to it.

### 2026-09-23 (later) — responsive tiers, the card's default layout, and a second pinned-overlay class

The same audit continued to **138 → 99** findings. New general rules, goldens `[AN]` extended (1146 assertions):

- **A `text-*` utility is read at the DESKTOP tier.** `align_at_desktop()` takes an explicit `lg:`/`xl:`/`2xl:`
  class first, then the MEASURED `text-align` (the capture stamps computed styles at desktop width), and only
  then the base class. A CTA written `text-center lg:text-left` is centred on a phone alone; reading the base
  class centred a headline and its button the source left-aligns. The button's own ancestor climb uses the
  same resolver, and an ancestor that states an explicit LEFT now ENDS the climb — that is an answer, not a
  miss.
- **A play control pinned over a picture.** A round painted button holding one glyph, centred by a full-bleed
  layer, matched no overlay class — so the frame stopped being a composite and the button rendered in the
  flow, landing at the top of the NEXT section. It now rides `::before` on the media node: the circle is the
  pseudo's fill, the glyph a background image over it (one slot carries both, leaving `::after` for a caption
  label), and `currentColor` is resolved to the control's measured ink, since a data URI has no cascade.
- **A row already consumed as the ATTRIBUTION is not also an "extra" fact.** The attribution row is itself
  `border-t`, so the footer scan claimed it and every testimonial printed its author twice.
- **The testimonial card rows are pinned whenever the source is not centred.** The pin used to ride on the
  presence of a footer stat, so removing a spurious stat silently handed the card back to the shortcode's
  centred default — a fix in one place became a regression in another.
- **A preset is only used at its own size.** Within tolerance but not equal (a 12px label against an 11px
  Caption), the preset is kept for theme-wide editability and the measured size is pinned on top.
- **The signup's TITLE keeps its measured type**, like its description already did; an **icon-only submit
  keeps its glyph** (via the same current-colour mask) instead of inventing the word "Subscribe".
- **The copyright bar follows the source's distribution.** Its bottom row is a `space-between` flex; content-
  sized columns packed the legal links against the © line and wrapped them onto a second row.

**Lens work:** `verifySections()` learned that a `text-transform` difference only matters when it CHANGES the
rendered text (a source writing literal capitals with `transform:none` reads identically to a converter that
uppercases — five findings about nothing), and that a pseudo-element glyph can be painted as a background
image as well as a mask.

### 2026-09-23 (cont.) — the step badge, the spine, and a gutter that was not one

Continuing the same audit, **99 → 98** findings, goldens 1147:

- **A numeral drawn as a painted BADGE in its own leading cell is the native step MARKER**, which every design
  lays beside the body — the source's two-column step. Emitted as a body ROW it stacked above the title and
  lost its circle entirely. Its measured shape, size and outlined skin ride with it, because the shortcode's
  marker paints a solid accent fill with white text, which is rarely what the source drew. Detection needed
  one extra fact: the capture drops an *unremarkable* width, so a `w-8 h-8` chip stamps only its height — the
  badge is square by construction, so the height is its width.
- **The spine is only drawn when the source draws one** (a thin, tall painted element between the badges).
  This exposed a genuine **shortcode bug**: `connector: none` was offered by the option but the per-design
  sheets turned the spine back on, so choosing None still drew the line. Fixed in the steps stylesheet with a
  rule that out-ranks them (shortcodes 1.15.27).
- The `[AL]` golden's numeral assertion was **rewritten, not kept**: it encoded the older, less faithful
  "numeral in a left-aligned body row" mapping, which is exactly the rendering this fix replaces.

**A negative result worth recording.** Four images render 30–52px narrower than the source, and the obvious
reading — "the container gutter is wrong" — is false. The source caps its container at `max-w-[1400px]
mx-auto`; the 20px side margin that shows at a 1440px viewport is *centring*, not a gutter. Its bands then
differ: text bands carry `lg:px-16` (the 64px the converter reads), while the media bands carry **no padding
at all**, so their pictures reach the container edge. The fix therefore belongs at the BAND level (a section
whose container has no side padding must render edge-to-edge inside the cap), not in the site-wide gutter.
Two attempts to fix it globally — preferring the container's margin in the capture stamp, and again in
`declared_container_gutter()` — were **reverted**: both broke four goldens that correctly encode the
padding-is-the-gutter case, because an `mx-auto` margin and a real gutter are indistinguishable by value
alone.

### 2026-09-23 (cont.) — the spacing assessment: why a gap can vanish while every position test passes

A reader spotted that the hero's buttons had no air beneath them. Measuring the two pages side by side
explained why no lens had reported it:

| | source | converted |
|---|---|---|
| button row height | 46px | **78px** (+32) |
| gap after it | **73px** | **25px** (−48) |
| next block's top | 742 | 746 |

**Two errors that cancel.** The row was 32px too tall and the gap 48px too short, so the next block landed
within 4px of where the source puts it and every position comparison passed. This is the structural blind
spot of a position-based lens, and the kit has always specified a "Lens 4 — vertical-spacing diff" that
`verifySections()` never implemented.

**The lens** now compares the GAP between consecutive matched elements (`kind: 'gap'`, tolerance `dgap`),
which is nesting-independent and sees each error on its own. A per-leaf BOX-HEIGHT comparison was tried
beside it and **removed**: a source `<span>` inside a button matches a converted `<a>` that IS the button,
so all 7 of its findings measured nesting rather than spacing.

**Two converter causes, both general:**

- **A wrapper's margin was folded onto each CHILD.** Folding a lone button's wrapper margin onto the button
  is right; inside a flex ROW it inflates the row instead of moving it. The margin now rides the button
  GROUP and the children carry none.
- **A row rebuilt by the bento splitter lost its margins.** Each rebuilt row is zeroed because a MULTI-row
  split hands the margins to the wrapping stack — but the SINGLE-row return has no wrapper, so the margin
  was dropped in silence. The hero's benefit row lost the 48px above it, which is why the hairline rule rode
  up under the buttons. Its own padding absorbed the difference, hiding it from every position check.

Result: row 46px and gap 73px, **exactly** matching the source. Goldens `[AQ]` guard both.

**Band gutters (the deferred item, now fixed).** A source rarely uses one gutter throughout: the same
`max-w-[1400px] mx-auto` container takes `lg:px-16` on the TEXT bands and nothing on the MEDIA bands, whose
pictures run to the cap's edge. The theme applies one site gutter everywhere, so those bands came out ~88px
narrow with the picture 44px off the edge. `section_container_flush()` measures the band's own container and
`sectionNoGutter` re-states the cap without the gutter for that band alone. `img-box` findings 4 → 1; the
flavors picture is now pixel-identical (x20 / 700×672 on both sides). This supersedes the earlier note that
the fix "belongs at the band level" — it now is there.

**`verifyPixels()` — the catch-all lens.** Every other lens reports only what it models; a gradient that
lost its angle, a shadow or a font fallback is invisible to all of them. This aligns by section, crops each
pair to their common height, diffs on a cell grid and flood-fills adjacent hot cells into CLUSTERS, so it
names distinct places rather than one place six times. Two calibrations were needed and are worth recording:
`diffMask: true` (pixelmatch otherwise draws the diff over a dimmed copy, so every pixel reads as different
and every cell as 100 % hot), and a deliberately HIGH `minPct` of 45 (at a low bar every cell qualifies from
sub-pixel text shifts, the clusters merge into one section-sized blob, and the lens points at everything).

**Parity:** the steps rules now have their JS twin — `detectStepsDesign` emits `numInline` / `numBadge` /
`numShape` / `numBadgeCs` / `connector`, and `stepsNode` maps the badge to the native marker with its skin,
guarded by `feed-themes-parity.test.mjs`.

### 2026-09-23 (cont.) — a self-capped image, and margins that had nowhere to go

Continuing from the spacing assessment, **97 → 90** findings. Three more rules, goldens `[AR]` (1155):

- **A self-capped image keeps its cap.** `max-h-[620px] w-auto object-contain` is a picture whose HEIGHT is
  the fixed dimension. With the cap dropped it filled its cell — 515×673 against the source's 474×620 — and
  because the copy column beside it is vertically centred, the hero grew 53px AND every line in that column
  sat 26px low. **One defect, three symptoms**, which is why it read as three unrelated findings. The cap is
  read MEASURED first (the capture stamps `max-height` from 1.11.46) with the utility class as the fallback
  at the DESKTOP tier, and only applied when the rendered height really is at the cap. `img_self_cap_css()`
  is shared by `img_own_box()` and the composite path — the hero jar has a blur blob and a pinned label, so
  it is a composite and never reached the former.
- **A native widget built into a CELL keeps its own measured margin.** `apply_block_margins()` ran on the
  section-level path only, so the same steps list kept its `mt-8` in one place and lost it in the other.
- **The source's own step RHYTHM overrides the design's defaults** — item gap, title-to-copy gap and the
  body's marker inset, all measured. Each needs `!important`, because the per-design stylesheet loads AFTER
  the page CSS; without it the rules were emitted correctly and simply lost the cascade, which looks exactly
  like a converter that never emitted them.
- The footer signup's own top margin is carried the same way (`blockMt` → `.footer .fw-nl`), taking the
  footer from 31px short to 7px.

Result: the hero is **exactly** 781px (was +53) with the jar at 474×620; flavors is exact (673px, 11 → 5
findings); every step gap matches. The gap lens found all of it — no position test could, because each error
is absorbed by a neighbour's padding.

### 2026-09-23 (cont.) — the marks a masthead and a lockup carry

Three more rules, goldens `[AS]` (1160 assertions):

- **A masthead utility keeps its own glyph.** These are drawn as `[glyph] Label` ("magnifier Search",
  "bag Cart (0)"); only the label survived, so the header lost both marks. The native list item has an icon
  slot — the same one the header chips use for their dot — and a recognised Lucide id rides as a library
  reference, anything else as inline markup.
- **The footer lockup's own second line is restated.** The theme reuses the HEADER's logo in the footer, so a
  source whose footer carries a longer sub-line ("· 1923 · France" against the masthead's "· 1923 ·") simply
  lost the difference. One native tagline serves both, so the footer's own text is carried on its sub-line.
  Written with `JSON_UNESCAPED_UNICODE`, because CSS `content` takes the literal character — a JSON
  `\u00b7` escape is not a CSS escape and prints as the escape text itself.
- **…and a footer wordmark written as an `<h2>` is now found at all.** `footer_brand_css()` scanned only
  span/div/a/p/strong/b, so a heading wordmark made it bail on the first pass — the footer's own brand
  typography was never carried either, on any source that writes it as a heading.
- The product tile's cart row also carries its own top margin (`mt-4`).

Measured: the header renders both utility glyphs, the footer lockup reads "· 1923 · FRANCE", and the page is
at 91 findings — of which 22 are `icon-swapped` (a glyph drawn by a different library at the right place,
benign) and 2 are gaps.

### 2026-09-23 (cont.) — the wordmark's face, and an icon that was mistaken for weather

Two defects reported on a second conversion, both with a general cause. Goldens `[AT]` (1165).

**A brand wordmark set in its own face rendered in the theme's.** The converter measured the family all
along, but Header → Identity had Site Title *Size*, *Weight* and *Colour* and **no Font Family**, so the face
could only ride the residual `logo_custom_css` — which deliberately carried a DISTINCTIVE stack only (serif /
mono / a quoted name) to avoid needlessly overriding the theme. A display sans such as `Syncopate,
sans-serif` fails that test, so it was skipped and the wordmark inherited the body face. The right fix was
the missing option, not a looser residual: **`title_font`** (a `typography` field, family only) now sits with
the other Site Title controls, emits `--site-title-font`, and `.site-title / .navbar-brand` consume it
falling back to `--font-heading`. The converter sets it from the measured face every time, and the residual
no longer restates it — one owner, and the user's later edit is not outranked by `!important` CSS. The
`dropped_chrome` parity gate accepts the native option as carrying the family.

**A card icon rained on a whole section.** Ambient-effect detection reads a layer's class/id for an effect
keyword, gated by "does this read as decorative?". Icon libraries name their glyphs exactly like the effects
— `lucide-droplets`, `-snowflake`, `-sparkles`, `-leaf`, `-star` — and ship `aria-hidden="true"`, which on
its own cleared that gate. A barbershop's "Hot Towel Shave" icon therefore matched `droplets` and put a Rain
background behind its services section. **An icon is content, never an ambient layer**: glyph tags
(`svg`/`i`/`use`/`path`/…) and icon-library class prefixes are now excluded outright, while `<canvas>` — the
genuine layer shape — stays. A real named layer (`fg-rain`, empty, `inset-0`) is still detected, which the
golden asserts as a negative so the fix cannot over-correct. JS twin patched identically in
`capture-extract.mjs`.

Theme 2.6.11 carries the new option; the earlier conversion re-measures unchanged at 91 findings.

### 2026-09-23 (cont.) — glass at rest vs glass on scroll  *(SUPERSEDED — see 2026-09-24 below)*

A scrolled header came out opaque, and its white CTA turned near-white on white. Two causes, one in each
codebase. Goldens `[AU]` (1170).

**The glass detector could not tell two headers apart.** Both declare `backdrop-blur-*` in their class list,
neither records `backdrop-filter` in the REST stamp (the utility resolves through a CSS var the capture
often misses), and both record one in the SCROLLED stamp. The old guard read the blur alone and called both
"glass on scroll only", which is right for one and wrong for the other. **The fill separates them:**

| | scrolled `background-color` | correct verdict |
|---|---|---|
| clear at top, frosted on scroll | `rgba(7,17,30,0.8)` — a fill **appears** | glass OFF at rest (else a 24px frost sits over the hero) |
| permanently glass | `rgba(0,0,0,0)` — **unchanged** | glass ON at rest (else the header loses its translucency) |

Both cases are now goldens, each the other's negative, so a future "simplification" back to the blur-only
test fails immediately.

**A blur-only scrolled state was given an OPAQUE substitute.** That branch hands the frost something to tint
when the source's own scrolled fill is transparent — but an opaque colour turns a glass bar solid on scroll.
It is now translucent, at the alpha the source's own utility states (`bg-background/80` → `0.8`), which the
computed stamp misses for the same var-resolution reason.

**Theme (2.6.12): a button keeps its own text colour on scroll.** The scrolled-link rule recoloured every
`a` in the header, including a CTA that carries its own fill — and with `--header-scroll-link` unset the
declaration resolves to `inherit`, painting a white-filled button in the header's near-white text. Buttons
are excluded (`:not(.btn):not(.header-cta-btn)`). This one is not converter-specific: any site using the
On-Scroll group with a header CTA had it.

### 2026-09-24 — the captured class list is the SCROLLED state (correcting the entry above)

The glass rule written yesterday was **wrong**, and the way it was wrong is the lesson. A converted header
frosted at the top when the source leaves it bare there; the reader reported it as "the instance is wrong".

Yesterday's reasoning assumed that a `backdrop-blur-*` in the captured class list describes the RESTING
header. It does not. A framework header computes its own className from scroll state —

```jsx
className={`fixed … ${scrolled ? 'border-b bg-background/80 backdrop-blur-md py-4' : 'border-transparent py-6'}`}
```

— and the capture serialises the DOM **after** its scroll pass, so the classes in `rendered.html` are the
**scrolled** ones while `data-sc-cs` holds the **rest** computed style. The padding proves it beyond doubt:

| | padding |
|---|---|
| class list (`py-4`) | 16px |
| REST stamp | **24px** (`py-6`) |
| SCROLLED stamp | **16px** ← matches the class list |

So the ORIGINAL guard — blur in the scrolled stamp and none in the rest stamp means glass on scroll only —
was right all along, and both of yesterday's replacements were wrong: the first read the class list as the
rest state, the second replaced that with a fill test that reached the same wrong verdict by another route.
Reverted, with the reasoning recorded in the code so it is not "fixed" a third time.

**The same mistake had a twin.** The class-list fallback for the header BORDER read `border-b` from that same
scrolled class list and drew a hairline under a header the source leaves clean. It now yields whenever the
REST stamp measured a transparent border: **a measurement beats a class**.

Kept from yesterday (these were right): the scrolled fill substituted for a blur-only state is TRANSLUCENT
at the source's own alpha, not opaque.

**Theme 2.6.13 — a legacy stuck shadow.** `style.css` carried an unconditional
`.site-header.header-sticky.is-stuck { box-shadow: var(--header-shadow) }` that predates the two-state chrome
in `header-footer-builder.css`. It painted a shadow on headers whose Header Shadow AND Shadow-on-scroll are
both off, and — because box-shadow does not stack across rules — it overwrote the Border hairline, which is
an inset shadow, so the scrolled rule vanished. It now yields whenever the explicit chrome options own the
stuck look. Like the CTA-colour fix, this affects any site using the On-Scroll group, not just conversions.

Result, measured against the source: rest = transparent, no blur, no rule; scrolled = `blur(12px)` + hairline
+ a translucent fill. One honest remaining delta — the source's scrolled bar is blur-ONLY with no fill at
all, while the converted one carries `rgba(20,20,20,0.8)`; that substitute exists so the frost has something
to tint, and over a dark page the two read the same.

### A converted colour is stored as HEX when it is opaque (2026-09-24)

A converted `h1` carried an inline `color: rgb(245, 245, 245)` while every entry in the generated palette
beside it was hex. Three things made that more than cosmetic: the Theme Settings colour **picker**
round-trips hex (a value it cannot parse is a value the user cannot edit in the UI that owns it); the palette
**de-dupe compares strings**, so `rgb(245, 245, 245)` and `#f5f5f5` survive as two separate colours; and it
was already inconsistent *within one value* — a golden compared an overline colour of `rgb(255, 45, 85)`
against a subtitle colour of `#737373` from the same heading.

**Rule: an OPAQUE colour is normalised to hex; a TRANSLUCENT one keeps its `rgba()` / `hsla()` form.**
`#rrggbbaa` is valid CSS but the picker does not round-trip it, so normalising alpha would trade one
uneditable format for another. Implemented in `clean_color_value()` (which every colour writer routes
through) and `ink_value()` on the PHP side, and in `toHex()` in `to-presets.mjs` on the JS side — the two
paths agree, and the goldens assert hex.

**A literal is NOT rebound to a Color Preset.** The tempting version — "if the measured colour equals a
palette entry, emit `predefined: '<slug>'`" — binds on a *coincidence of value*, not on intent. The palette
roles (Ink, Primary, Muted) are **inferred** from the source, so a wrong inference would propagate to every
element sharing that colour, and a later palette edit would move headings the user never linked to it. The
honest signal for a preset reference is that the **source itself** said the colour was semantic (it wrote
`text-primary` / `var(--foreground)` rather than a literal) — that lives in the capture and is future work.

**The bug this uncovered.** The JS preset builder mapped the palette entry named **Black** to the site's ink
when no `--dark` token existed (`'Black': vars['--dark'] || colors.ink`). On a dark source the ink is
near-white, so `Black` held `rgb(245, 245, 245)` and every `var(--color-black)` reference — in the theme or
in a user's own CSS — resolved to near-white. The PHP path never did this: it gives the ink its own `Ink`
role and leaves `Black` literal. The JS path now matches it.

### A converted colour BINDS to the palette the conversion generated (2026-09-24, supersedes the note above)

The hex note above concluded that a literal should *not* be rebound to a Color Preset, on the reasoning that
matching a palette entry binds on a "coincidence of value". **That reasoning was wrong and is superseded.**
It is not a coincidence: the palette is *derived from the source* — `Ink` IS the source's body ink, `Primary`
IS its brand colour — so binding re-attaches a value to the role the converter itself assigned moments
earlier. Leaving the literal made the generated palette decorative: editing Ink in Theme Settings moved
nothing.

**Rule: an emitted colour that exactly matches a palette entry is stored as a preset reference.** A colour
with no entry stays a literal — that is the deliberately-unique colour, and inventing a preset for it would
bloat the palette with one-offs. Implemented as ONE post-pass over the finished bundle
(`Stitch::bind_palette_colors`, JS twin `bindPaletteColors` in `to-pages.mjs`) rather than at each of the ~65
colour writers: it is guaranteed to run after the palette exists and cannot miss a writer.

Four guards, each load-bearing:

- **The `predefined` half is a PREFIXED CLASS** (`text-ink` on an ink, `bg-ink` on a fill), emitted verbatim
  by the consumer — so the wrong prefix paints the wrong CSS property. Only keys whose kind is unambiguous
  bind; `border_color` and friends keep their literal until their option's own `kind` is verified.
- **The halves are MUTUALLY EXCLUSIVE** (the preset wins in `sc_normalize_color_value`), so binding CLEARS
  `custom` rather than leaving a stale literal behind it.
- **Only an OPAQUE exact match binds.** A translucent value has no preset form.
- **The palette itself is never rewritten** to reference itself.

**The binding was inert until a second, deeper bug was fixed.** Measured in the browser: with the heading
bound to `Ink`, changing Ink to `#ff8800` left the heading at `#f5f5f5`. The section styler was emitting

```
#hero h1:not([class*="boxp-"] *) { color: rgb(245,245,245) !important }
```

from the **same stamp** the heading node reads for its native Title Colour — one property written from two
places, and this one (an ID selector, `!important`) outranks both the option's own output and the palette
class. So the section rule no longer carries `color` for a heading whose stamp declares one; it keeps the
type (face, size, weight, tracking, case) that has no per-heading field. This also fixes a bug that predates
presets entirely: **the builder's Title Colour field was inert on every converted heading** — the user
changed it and the page did not move. Re-measured after the fix: Ink → `#ff8800` moves the heading to
`rgb(255, 136, 0)`; restored, it returns to `rgb(245, 245, 245)`.

Guarded by goldens `[AV]` (binding + its four negatives) and `[AW]` (the section rule keeps the type, drops
the colour, and the heading owns it), plus `palette-binding-parity.test.mjs` on the JS side.

**Known gap:** the JS `to-presets.mjs` palette is materially poorer than the PHP one on the same source — no
`Ink`, no `Light`, an `Accent` that duplicates `Primary`, and a stock `Muted` instead of the page's own. The
PHP palette is the one that lands through `import_dir`, so this is latent, but the two should agree.

### Three defects a one-page source exposed (2026-09-24)

A converted one-page source measured 20–40% band drift with the layout looking broadly right. Three
general rules were wrong, each reachable only by measuring.

**1. A `<br>` is a word boundary.** DOM `textContent` concatenates text nodes and drops element nodes, so
`HIGH IN<br>PROTEIN` read back as `HIGH INPROTEIN`. The converter reads `textContent` in dozens of places,
so one source using `<br>` for a two-line lockup corrupted four card titles, the site `<title>`, the header
logo and the footer logo at once. Fixed **once**, in `load_dom()`: every `<br>` is replaced with a newline
text node as the tree is built, so every present and future reader is correct by construction rather than
each call site having to remember. Golden `[AX]`.

**2. A one-page site links its brand to a section, not to "/".** The brand-anchor test accepted only `''`,
`'#'`, `'/'` or a bare origin. A single-page source has no "/" to link home to — its wordmark points at
`#hero` — so no brand anchor was found at all and detection fell through to the header's leftmost block,
harvesting the utility cluster. The site title, header logo and footer logo all shipped as the glued label
`AccountCART (1)`, and the wordmark's FACE came out as the body font because the face was read off the
wrong element. Any `#fragment` is now a brand candidate; the menu links beside it are fragments too, but
they sit inside `<nav>` and the existing non-nav ranking already prefers the brand. Skip-links are excluded.
Golden `[AY]`.

**3. Whose padding the gutter is decides whether it is INSIDE the content width.** The capture tallied the
container's own padding and, when it had none, the ancestor SECTION's — then stamped
`data-sc-content-gutter-inside` for both. But a container's own padding is inside its border box (so the
measured width includes it), while a section's padding is outside the content box (the measured width is
already inset by it). A full-width `section` with `80px` side padding at a 1440 viewport leaves content
measuring 1280; subtracting the 80 again gave **1120**, so every converted container was 160px narrow and
headings rewrapped onto an extra line in two sections. The two are now tallied separately, plus an
arithmetic cross-check that needs no DOM opinion: when `width + 2×gutter ≈ viewport`, the gutter is outside.
`container-gutter-stamp.test.mjs` exercises it in a real browser, since it is browser-side layout logic.

**Measured:** every container 1120 → **1280** (exact parity with the source); `blogname` `AccountCART (1)`
→ the source’s own wordmark; wordmark face body-font → the source's display face; `nutrition` section height
delta 7 → **0**; `collections` −84 → **−30**.

### The lenses gained a container-level view (2026-09-24)

Three tool defects surfaced in the same audit:

- **A column count is a property of the container, so only the container can report it.** When a 3-up card
  row collapsed to a 1-up stack, the element lens reported only leaves that moved — and 45 of that section's
  57 findings were star glyphs, burying the cause entirely. `verifySections` now measures each section's
  repeated group and emits **`grid-cols`** (`a 3-up group renders 1-up`) ahead of the leaf findings, because
  it explains them. It fires only when both sides found a group with the SAME item count; otherwise the two
  sides are describing different groups and the comparison is meaningless (a hero reported "1-up renders
  2-up" from `items:3` vs `items:2` — a false positive, now suppressed).
- **Repeated identical icon findings roll up** to one carrying a `count`, so a section's list describes its
  distinct defects rather than its element count (a page went 130 → 78 findings with nothing real lost).
- **Every lens now answers `.findings`.** `verifyUrls` returned `bands`, `verifyChrome` returned `findings`
  and `verifySections` returned `sections[].findings` — reading the wrong key reported a clean run on a page
  carrying 130 real findings. A flat `findings` array now sits beside the per-section one.

### Three more general rules from the same one-page source (2026-09-24)

**1. A block's design is read from its OWN section, never from a neighbour's.** The testimonial design scan
walks up to two ancestors, because slider machinery often lives on a wrapper — and an ancestor's
`saveHTML()` carries all of its descendants. On a flat one-page DOM two levels clear the section entirely
and read its siblings, so a `divide-y` belonging to a **different** section's four-column feature row (its
vertical rules) matched the STACKED test: a three-up testimonial grid rendered as a one-up editorial list,
**200px taller** than the source. Any marquee, snap track or slider lib that belongs to the block is inside
its section too, so clamping the walk at the section boundary costs nothing and removes a whole class of
cross-section false positives. Measured: reviews Δh **+200 → −36**, `grid-cols` finding gone. Golden `[AZ]`.

**2. The media frame keeps its own fill and its own inset.** The image box paints a placeholder fill
(`.imgbox__media{background:#f1f3f5}`) so an unloaded photo is not a hole — invisible behind an image that
covers its frame, and plainly wrong behind a transparent cut-out shown with `object-contain`, where the
source's own band should show through. Four product cut-outs the source sits directly on its orange band
rendered on pale grey tiles. The frame's **padding** was dropped in the same place, so each picture filled
its frame edge-to-edge and every tile read larger than the source's. The converter measures the frame, so it
now carries what the frame declares — a real fill when there is one, `transparent` when there is none, and
the inset either way. Measured: `img-box` findings **10 → 3**. Golden `[BA]`.

**3. A one-page brand link is an in-page fragment** — see the 2026-09-24 entry above; the same source proved
it on the site title, header logo and footer logo at once.

**A tool regression the corpus step caught.** Scrubbing corpus names out of the trainer replaced the literal
capture-directory name with a placeholder in three files where it was a real **filesystem path**, not prose
(`score/import-site.php`, `class-coverage.mjs`, `audit.php`). Every site then scored `no-rendered` and the
corpus diff read as a clean 99 → 0 collapse on every dimension. No real change degrades eleven independent
dimensions to zero at once, so that shape is always a broken harness — the prompt now says so explicitly.
All three now RESOLVE the capture dir at either depth instead of naming it.

### Chrome and footer rules from the same one-page source (2026-09-24, cont.)

**A bar that paints nothing still has a colour behind it.** A header nested inside a coloured band
(`<section class="bg-[#f5c344]"><header class="w-full …">`) is transparent in its own right, so the emitted
fill fell back to the theme's default WHITE and a yellow masthead converted to a white one — the most
visible defect on that conversion. What a reader sees is the nearest painted ANCESTOR, so the converter
reads that instead of guessing. Guarded to bars in NORMAL FLOW: a fixed/absolute/sticky header floats over
the page, where the transparency IS the design (the overlay/glass path owns it) and inheriting the hero's
fill would paint a solid bar across a photo the source deliberately shows through. Golden `[BB]`.

**A footer's trust row survives, and the brand lockup is not a legal link.** Both bottom-bar readers are
anchored on the copyright element — legal links and the bottom tagline are found among ITS siblings. A
footer whose copyright sits up in the brand column and whose bottom row holds two plain LABEL groups matched
neither, so the whole row was dropped. Worse, the brand lockup sharing that copyright column was collected
AS a legal link, which both rendered a stray wordmark in the copyright bar and made the legal branch match,
hiding the real bottom bar. Now: a link in the copyright band whose label is the brand and which points home
or at the top of the page is the footer logo, not a legal link; and a trailing two-group `space-between` row
of text-only groups is read as the bottom bar. It outranks the TAGLINE branch deliberately — the tagline
reader takes any short text sibling of the copyright, which on a brand column is the brand BLURB. Golden
`[BC]`.

**Measured across both rounds on that source:** mean band drift **≈29.3% → ≈20.6%** (band 1 34.9 → 16.5,
band 8 42.4 → 14.4, band 9 31.2 → 7); container width 1120 → **1280** (exact); parity score **70 → 80**;
reviews Δh **+200 → −36**; `img-box` findings **10 → 3**; nutrition Δh **7 → 0**.

**A false positive worth recording.** A floating "English" language switcher on the converted page was filed
as "a third-party overlay baked in as content". It was **TranslatePress**, active on the test install, and
absent from the source capture entirely. The install's own plugins render on every page; confirm a visible
defect exists in the SOURCE capture before blaming the converter for it.

### OPEN: a reproducible corpus regression in `contrast` and `media_retention` (2026-09-24)

Running `score.mjs` over the corpus after this session's rules reports, **reproducibly** (identical numbers
on a repeat run, so not the known flaky-contrast mode):

```
contrast         100 → 9    (crafter-station 18 · red-planet-architecture 0)
media_retention  100 → 50   (crafter-station 0)
overall          100 → 84
```

**What was established.** On `red-planet-architecture` every element renders light type
(`rgb(255,255,255)` and `rgba(255,255,255,.4-.7)`) while `body` AND every `section` compute
`background-color: rgba(0,0,0,0)` — light text on nothing, hence contrast 0. The theme settings are
correct (`site_background = #0a0a0f`, no colour bound to a preset), and the generated CSS does define
`--site-bg-color:#0a0a0f` with `body{background-color:var(--site-bg-color,#ffffff)}`.

**The hypothesis, unconfirmed.** The source's ambient backdrop is carried verbatim as
`body:not(.wp-admin){background:radial-gradient(…),radial-gradient(…)}`. A `background` SHORTHAND with no
colour resets `background-color` to transparent, and that carried rule lands after the converter's own.
Painting the canvas on `html` (which the browser uses whenever `body` is transparent) was tried and did
**not** move `crafter-station`'s score, so it was reverted rather than left in as speculative code.

**It is NOT caused by any of this session's work — established by A/B against a PRE-BINDING tree.**
The first attempt compared against the pushed **1.9.84**, which was the wrong baseline: the colour binding
shipped IN 1.9.83/84, so that comparison measured the bug against itself and proved nothing. Checking out
**1.9.65** (`bind_palette_colors` absent) and rescoring `crafter-station` gives the IDENTICAL result —
`contr 18`, `media 0`, overall 80, −19 — so the regression predates the binding and everything after it.
Swapping the two changed includes plus the manifest is enough for the A/B; the lesson is to pick a
baseline that predates ALL of the work in question, and to verify the suspect code is actually absent
from it (`grep` for the function) rather than trusting the version number.

**Next step:** import one affected site, diff its generated child-theme CSS against the baseline's, and
find which rule zeroes the canvas. Run the scorer in a terminal **unredirected** — stdout to a file is
block-buffered, which makes a working run look stalled and has already caused healthy runs to be killed.

### A preset DEFINITION holds a literal (2026-09-24)

The colour binding attaches an emitted colour to the palette entry it matches. Inside a **preset
definition** that is circular — the preset is the thing other values point AT — and worse: a preset's
consumer generates CSS **from the literal**, so a class name in `predefined` produces no declaration at
all. The palette (`theme_colors`) was exempt from the start; every other preset COLLECTION needed the same
exemption and did not have it.

Reported as: *editing the header CTA's text makes the button small and all white*. The edit was a red
herring — `cta_style` and `cta_size` were unchanged from what the converter emitted. The Primary BUTTON
preset's `bg_color` had been bound to `bg-primary`, so the generated preset CSS carried **no background**,
and the button fell back to unstyled: no fill, no padding, its black label invisible on white. It only
surfaced after an edit because until then nothing had re-read the preset.

Exempt collections: `theme_colors`, `button_colors`, `box_presets`, `table_presets`,
`section_style_presets`, `container_width_presets`, `badge_presets`, `card_presets`. Values that POINT at
these presets still bind — only the definitions are skipped. Golden `[BD]`, JS twin in
`palette-binding-parity.test.mjs`.

**Measured:** `button_colors[Primary].bg_color` `{predefined:"bg-primary",custom:""}` → `rgb(255,255,255)`;
the rendered CTA `bg rgb(255,255,255)` / `color rgb(0,0,0)` / padding `10px 24px`, with the user's own
edited label in place. Not the cause of the corpus `contrast` regression — tested, unchanged at 18.

### Converting a SECOND page of the same site (2026-09-25)

Three defects surfaced from one report: *"I converted the site, then /services. I changed the header and
footer text and it got changed back."*

**1. A conversion may overwrite a value it wrote itself; it must not overwrite one the user has since
changed.** The full design import rewrote every theme-settings key from the fresh capture, so chrome the
user corrected after the first conversion silently reverted. `Theme_Settings::import` now fingerprints
what it writes (`fw_sc_settings_fingerprint`) and, on a later import, skips any key whose stored value no
longer matches — the same guard the page importers use with `_upw_import_hash`. `import_dir` re-stamps at
the END of the run, because later phases legitimately rewrite values the theme-settings phase already
fingerprinted; without that a key the converter itself changed would be protected forever. `force_chrome`
re-applies everything when that is what you want.

**2. The first captured URL is not necessarily the home page.** It was labelled `home` + `front: true`
unconditionally, so capturing a sub-page on its own produced a bundle claiming to be the front page — and
importing `…/services` REPLACED the home page instead of creating a services page. The PHP path already
derived this from `source_url`, but the folder rebuild never received the real one: with no manifest
`source` it scraped an ORIGIN out of the media URLs (often a CDN host), and an empty path reads as the
root. It now prefers the capture's own recorded page URL (`design-capture.json` → `url`). A sub-page also
takes its title from the path, because its `<title>` is usually all brand — every sub-page was arriving
titled after the site. Covered by `page-identity.test.mjs`.

**3. A card that paints nothing keeps its section behind it.** A plan card only received `card_bg` when the
source card carried a fill. A source whose cards paint nothing — they sit straight on the section, which is
where their ink was chosen to read — left it unset, so the shortcode's default WHITE plan card rendered and
the captured near-white titles and prices were invisible on it (`.fw-pt__plan` painted rgb(255,255,255)
under rgb(245,245,245) text). The absence is now carried explicitly. Golden `[BE]`.

**Measured:** `/services`, `/shop` and `/about` each import as their own page (`front_page:false`, correct
slug and title) with the home page untouched; a second conversion reports the edited chrome keys as
`skipped` and leaves them alone; the services plan cards render transparent on the dark section with every
title and price legible.

### An inner page has to be REACHABLE (2026-09-25)

After the inner-page fixes above, `/services`, `/shop` and `/about` existed as real pages and still
returned **404**. The site's `permalink_structure` was the PATHINFO variant
(`/index.php/%year%/%monthnum%/%day%/%postname%/`), which WordPress falls back to whenever it decides at
install time that mod_rewrite is unavailable. The pages were only reachable at `/index.php/services/`,
while the converted menus and in-page links all point at `/services`.

A one-page conversion never notices — everything lives at `/`. The moment a conversion creates INNER pages
it matters, so `import_dir` now calls `ensure_inner_pages_reachable()` when it created one: a structure
that ALREADY cannot serve clean URLs — empty (plain `?p=`) or `/index.php`-prefixed — is switched to
`/%postname%/` and the rules flushed. The change is reported as `permalinks` in the import result rather
than made silently.

A site with its own clean scheme is never touched: `/%category%/%postname%/`, a dated structure, anything
custom, is a deliberate and SEO-bearing choice. **Measured both ways:** with the PATHINFO structure,
`/services/` goes 404 → 200 and the result reports `/%postname%/`; with `/%category%/%postname%/` set, the
import reports unchanged and the structure is left exactly as it was.

Note for local XAMPP work: passing a leading-slash permalink to `wp rewrite structure` through Git Bash
gets MSYS path-converted (`/%postname%/` became `/C:/Program Files/Git/%postname%/`). Set it with
`update_option` under `MSYS_NO_PATHCONV=1` instead.

### The converted nav pointed at the ORIGINAL site (2026-09-29)

Four defects, found by asking the plainest question about a clone — *do the menus work?* — and then clicking
one. Each one had been invisible because the thing it broke still returned HTTP 200.

**1. "Internal" was judged against the wrong site.** `FW_Site_Converter_Menus::resolve_target()` decided
whether a link was internal by comparing its host to `home_url()` — the DESTINATION. Every link the source
made to its own pages therefore classified as *external* and was imported verbatim, so the converted site's
primary menu pointed at the live original. Clicking "Financing" on the converted site navigated away to the
source domain, and a status check on that URL returned 200 — from the source. Nothing looked broken.

Internal has to be judged against the site the markup **came from**. `set_source_origin()` now receives the
origin from theme-design's `source_url` (with a fallback that reads the hosts recorded on the converted
pages' own `_upw_source_url`, so the answer is right regardless of import order). Guarded by
`tests/menus-test.php`, including a NEGATIVE that a genuinely third-party link is still left alone — the way
to get this fix wrong is to swallow every outbound link.

Worth noting the near miss: two menus existed. The theme's generated `functions.php` built a correctly
localized one and then **declined to claim the `primary` location** because a menu was already assigned
there — the converter's own, with absolute source URLs. The correct menu sat unused beside the broken one.

**2. The logo was a nav item.** Logo detection took the first header link carrying any text. On a header whose
brand is not a link — plenty render the wordmark as plain markup, e.g. `Mod` plus a `<span>Fii</span>` in a
div — the first text link is the first MENU item. So the brand came out as "Financing" *and* the nav silently
lost its first entry: two wrongs from one loose test. Candidates now exclude anything inside `<nav>`, exclude
button-shaped links (an action, not a brand), prefer a root-href link, and otherwise take the largest type —
20px/700 is what separates a wordmark from a 14px menu label. When no brand LINK exists, the wordmark is read
out of the markup by the same type-size rule.

**3. A disclosure control was captured as a destination.** An overflow toggle ("More") is a `<button>` carrying
`aria-haspopup` / `aria-expanded`. It was captured as a menu item pointing at the site root, giving the
converted nav a dead entry. SPA nav buttons that really do route carry neither attribute, so they still pass.
Both rules are guarded by `header-logo.test.mjs`, in a real browser, because they read computed style and DOM
relationships — exactly what the old tag-and-order tests could not see.

**4. An explicit page list was silently trimmed to nine.** `--pages=` exists so a caller can enumerate the
pages it wants, and `capture.mjs` then applied `slice(0, MAX_PAGES - 1)` to it — capturing 9 of 132 and
reporting `pages: 9 chosen by the caller`, which reads as though nine were all that was asked for. Compounding
it, `--max-pages` matched `\d{1,2}`, so `--max-pages=133` failed the pattern and fell through to the default
10 without a word. An explicit list is no longer capped; the flag accepts three digits and *says* when a value
is unusable; and the watchdog now sizes itself from the count that will actually be captured, because budgeting
a 132-page run off `MAX_PAGES` gave it a ten-page deadline.

**The shape all four share:** silence read as success. A menu link to the wrong site returns 200; a trimmed
page list reports a count that sounds like the request; a missing nav item leaves a nav that still renders.
None of them surfaces in a check that only asks "did it work?" — each needed a check that asked "did it do the
thing I asked, and to what?"

**Caveat on the offline harness.** `rendered.html` must be loaded with **JavaScript disabled** to reproduce a
captured DOM (the page's own scripts re-run and wipe it — 38 elements with JS on, 463 with it off). But with
JS off the stylesheet often does not apply, so computed styles are degenerate and any *style-based* rule
cannot be adjudicated there. Style rules must be verified against the live source; the offline path is for
structure only. This limits `path-parity.mjs`'s JS half in the same way.

### Two more, from importing all 133 pages of the same source (2026-09-29, cont.)

**5. Three source pages were silently overwritten by slug collision.** `slugFromUrl()` kept only the LAST path
segment, so `/construction-loans/fha` and `/modular-home-financing/loan-options/fha` both became `fha` —
likewise `usda` and `va`. The second import of each pair overwrote the first, and 132 source paths produced
129 distinct slugs. What makes this one worth remembering is how it *passed verification*: a per-slug check
finds a page for every path, because each path's leaf slug does resolve — the two paths just share one page.
The check had to count DISTINCT slugs before the loss was visible. Slugs are now assigned against a set held
for the whole batch, and a collision climbs the path one ancestor at a time (`loan-options-fha`), so the first
claimant keeps the readable slug and the other says where it came from. Non-colliding paths are untouched, so
no existing permalink moves. Guarded by `slug-unique.test.mjs`, written against the real colliding paths.

**6. A 133-page bundle import reached 9 GB of resident memory and wedged at page 37.** Not slowness —
thrashing. Measured in isolation the same pages cost about 3 MB each to build and import (≈510 MB for all
133), and the per-page result retained by the snapshot loop is 0.2 KB, so the growth is somewhere else in the
monolithic `import_dir` path and is **still unidentified**. Two hypotheses were checked and discarded rather
than assumed. The clone was completed instead by importing inner pages in batches of 20, one fresh PHP
process per batch, which peaked at 124–166 MB and is resumable because it skips slugs that already exist.
Treat the batched path as the way to import a large bundle until the leak is found; a single-process
`import_dir` is fine for a handful of pages and is not safe for a hundred.

**What the 133-page report says about fidelity** (3846 elements): 406 verbatim `code_block` fallbacks (10.6%)
and 286 opportunities. Of the 286 "unrecognized cell" fallbacks, **216 are `<svg>`-led** — by far the largest
single defect on this source. A rule for icon-scale svg cells had been written earlier and then REVERTED,
because proof-by-disabling against a 9-capture corpus showed it changed nothing; the case simply was not in
that corpus. The lesson cuts both ways: disabling proved the code was inert *on the sample available*, which
is not the same as inert. It also showed the rule as written was too narrow — only 24 of the 216 carry text
beside the icon, so the dominant shape is a LONE icon cell needing the `icon` shortcode, not `icon_box`.

### The clone passed verification and was still wrong (2026-09-29, cont.)

**7. A source-URL match proves a page is LABELLED right, not that it IS right.** The verifier matched every
converted page to its source by `_upw_source_url` and reported 132/132, PASS. Comparing RENDERED TEXT then
showed `fha` and `loan-options-fha` were byte-identical, while the two source pages genuinely differ (9122 vs
13848 characters). The slug collision had struck at CAPTURE time as well: both URLs wrote to
`pages/fha/rendered.html`, so the second overwrote the first's snapshot while the manifest still labelled that
entry `/construction-loans/fha`. The page carried one source's content under another's name, and every
identity check agreed with it.

Capture-side collision is the worse half: it destroys the evidence before any import runs, so no amount of
import-side care recovers it. Both sides are now guarded (`uniqueSlugFromUrl` for one batch,
`unique_page_slug` for pages arriving across separate captures), and `content-audit.mjs` compares rendered
text to the source each page claims — including a check for two pages sharing identical content, which is the
signature this produces.

**8. Manufacturer-archetype pages lose about a fifth of their content, and the converter already knew.**
A random 24-page content audit: mean 94.4% word coverage, 7 pages below 95% — and every one of the seven is a
`/manufacturers/*` page (77.5%–81.8%). The missing text is absent from the builder JSON entirely, so it is
DROPPED at build time, not kept as a verbatim fallback. It is present in the captured snapshot, so this is a
Stitch/Mapper defect, not a capture gap.

What goes missing falls into two general shapes:

- **A multi-step form.** "What are you looking to do?" plus its option list, "Property ZIP code", "Check My
  Rates Instantly". The same loss explains `/get-started` at 76.3% — anything carrying that widget loses it.
- **A card's spec list**: the `label: value` pairs ("Square Feet:" / "1,800", "Bedrooms/Baths:" / "3 bed / 2
  bath", "Starting Price:" / "$500,000+"), the model names beside them, and the SECTION HEADINGS above those
  regions ("About …", "Key Features & Benefits", "Certifications & Standards", "Popular … Models").

The converter's own `text_coverage` audit reports this page at **72.2%, 32 missing phrases**, and names every
one of them. The instrument was right and unread: a bundle-level average washed a 72% page out against 130
pages near 100%. Read coverage PER PAGE, worst first — the ranking is the finding.

### A card has one heading; a region has several (2026-09-29, cont.)

The largest content loss found while training on a real multi-page source, and the converter had been
reporting it all along.

`is_card_cell()` accepted a grid cell as a card if it contained ANY heading, and `card_from_cell()` then
keeps the FIRST heading plus its text and **discards the rest of the cell**. So a content column holding
several `<h2>` bands — About, Key Features, Certifications, Popular Models — was flattened into one card
and the remainder of the page was thrown away. The page still rendered; it was simply missing most of
itself, which is the worst shape this failure can take: nothing errors, nothing looks broken, and the
only signal is a coverage number nobody reads.

**The signal existed.** `text_coverage` reported those pages at **72.2%** and named all 32 missing
phrases. A bundle-level average washed that out against a hundred pages near 100%. Read coverage
PER PAGE, worst first — the ranking is the finding.

**The rule.** An `<h2>` is a section heading, so two of them mean a region rather than a card. Chosen from
data, not instinct: across 84 captures, 1354 heading-bearing containers carry no `<h2>` and 425 carry
exactly one; only 92 carry two or more, and those are regions — several hold an entire nav bar. Below the
line nothing changes; above it the cell decomposes into its bands.

**Measured on 129–131 pages of a real source, by disabling the rule and re-running:**

| | mean text coverage | worst archetype |
|---|---|---|
| before | 88.5% | ~70% |
| after | **95.7%** | **~93%** |

And a shortcode census confirms the structure was RECOVERED, not traded away — the obvious way to get
this wrong is a rule that rescues text by turning every card into loose headings:

| | icon_box | special_heading | button | feature_list |
|---|---|---|---|---|
| before | 1146 | 1418 | 778 | 402 |
| after | **1386** | **1738** | **938** | **473** |

Everything rises, because the recovered regions contain cards of their own.

Guarded by golden `[RC]`, whose NEGATIVE is the one that matters: an ordinary three-card grid must still
map to cards. An early version of that fixture put one region beside a single card and asserted the card
survived as a card — it does not, and correctly so: one card is not a card *grid*, and the row decomposes.
The fixture was wrong, not the rule; the corpus census is what settled it.

### A testimonial has no section heading of its own (2026-09-29, cont.)

Same shape as the card/region fix, in a different recognizer, found by reading coverage worst-first.

`is_single_testimonial()` (priority 93, above everything) already bowed out when a descendant was a
testimonials GRID — but a band holding ONE quote was still claimed whole, and `single_testimonial_item()`
takes the longest paragraph in the element as the quote and discards the rest. On a real page a
"Why Choose …" band — its heading, five trust badges and a customer quote — collapsed to the quote alone.
The page produced **four nodes for an entire page** and read **66.2%** coverage.

The existing guards (no `<h1>`, no `<button>`, no button-like anchor, a star rating, a quoted long line)
all passed, because a mid-page band legitimately has none of those.

**The rule:** a quote may itself be marked up as a heading — `single_testimonial_item()` reads h2/h3/h4 as
quote candidates — so the test is not "has a heading" but **"has a heading that is NOT the quote"**. Such a
heading titles a band, and the band must decompose. Rejecting is strictly better than claiming: a rejected
band yields its heading, its content AND its testimonial, where claiming yields only the quote.

Measured: `/get-started` **66.2% → 75.7%**, 4 nodes → 24. Corpus mean 95.7% → 95.8% (one page was
carrying nearly all of this particular loss). No suite regressions.

Guarded by golden `[TS]`, and the guard was verified by DISABLING the fix: (a) and (b) then fail with the
real symptoms while (c) and the NEGATIVE stay green. That check mattered — the first version of the
fixture used `<span class="star">` for the rating, but `testimonial_rating()` counts `<svg>`/`<i>` carrying
a `star` class, so the recognizer never fired and every assertion passed with OR without the fix. A test
that cannot go red guards nothing.

### An avatar is a person; a round icon tile is not (2026-09-29, cont.)

**What went wrong.** `has_author_block()` treated *any* round disc of portrait size as an avatar, including an
empty one. So the shape "round tile + a heavier label over a lighter sublabel" — which is every option row,
feature row and numbered step card ever drawn — read as an author attribution, and the cell containing it then
qualified as a testimonial card. On one measured page a "how to get started" band holding a steps list *and* a
multi-step form was claimed as testimonials, emitting step titles as people:

```
{ quote: "Complete our 2-minute form…", name: "Pre-Qualify Online", role: "Compare Lender Offers" }
```

and discarding the rest of the band. The page read **79.1%** text coverage.

**The rule.** A disc whose content is an **icon** (an `<svg>` or an `<i>` glyph) is not an avatar. An `<img>`
still is; a monogram (1–3 capitals) still is; and a *textless, iconless* disc still is, because that is how a
CSS `background-image` portrait presents. The distinction is what the disc *contains*, not what it looks like —
size and border-radius are identical in both cases, which is exactly why the old test could not tell them apart.

**Result.** That page went **79.1% → 98.2%** (missing phrases 23 → 2). Corpus mean over 129 pages 95.8% → 95.9% —
small in aggregate, which is the point: this is an archetype failure, not a broad one, and only the per-page
ranking surfaces it. The shortcode census confirmed the content was *recovered*, not traded for loose headings.

**This is the same antipattern as the two entries above it** — a recognizer claiming an ancestor and discarding
its subtree — arriving for the third time through a different predicate. When a recognizer is about to claim a
container, the question worth asking is always "what am I throwing away by claiming this?"

**Two things the golden for this taught, both about tests rather than converters:**

- The first version of `[BG]` was an end-to-end page fixture, and it **passed with the fix disabled** — it never
  reproduced the defect, so it guarded nothing while looking like it did. `has_author_block()` was made public
  and the golden now asserts on the predicate, which *is* the whole rule.
- The predicate takes the **card**, and looks for the attribution row among its *descendants*. A fixture that
  hands it the row itself scans the row's children and finds no flex row at all — every case returns `false`,
  including the ones that should be `true`. Always confirm a new golden goes **red** with the fix disabled;
  here that proof caught two separate fixture bugs before the golden was trusted.

### A revealed tab panel must be stamped (2026-09-29, cont.)

**What went wrong.** The computed-style pass runs once, over `body *`, while only the **active** tab panel
exists in the DOM. `revealTabPanels()` then clicks each tab and keeps the markup it finds — but those nodes
are rendered *after* the pass, so they carried no `data-sc-cs`, and an unstamped subtree is invisible to the
mapper. Measured on a captured menu page: panel 0 was **459/459** stamped, panel 1 was **5/301**, and 3,780
characters of the second panel never reached the converter.

**The rule.** The stamping pass is now a named function (`stampComputedStyles`) and runs a second time after
the tab reveal, with `onlyUnstamped: true` — its selector becomes `body *:not([data-sc-cs])`. Confining the
second run to elements the first never saw means no existing capture's output can change.

**This is an ORDER defect, not a rule defect**, and that decides what can test it. Every other stamp test here
re-implements the decision in-browser and asserts on the copy; such a test passes whether or not the pass is
run twice. The guard is therefore `tab-restamp.test.mjs`, which serves a tab widget on localhost, runs the
**real `capture.mjs`**, and counts stamps in the emitted `rendered.html`. With the second run disabled it
reports `second panel stamped 0/16`.

Two mechanical notes that cost time: `execFileSync` blocks the event loop, so an in-process fixture server can
never answer the capture it just launched — await the child instead. And an element's stamp is read by taking
the **first** match of each property, so a `data-sc-cs` that declares `font-weight` twice silently ignores the
second; a fixture must declare each property once.

### An instrument that cannot follow a reference measures its own blind spot (2026-09-29, cont.)

**What went wrong.** `n_tabs()` moves a rich panel into a `snippet` CPT and leaves `[snippet id="N"]` in the
page. The text coverage audit read only the page tree and theme settings, so every word of that panel counted
as **lost**. On the page above: **120 of 216 phrases "missing", 44.4% coverage** — and all 120 sat intact in
the snippet the page pointed at. That made it the worst-ranked page in the whole corpus, and the ranking is
what the training follows, so it sent the work after a defect that did not exist.

**The rule.** `build_text_coverage()` now scans its own haystack for `[snippet id="N"]` and folds each
referenced snippet's builder tree in before matching. Same page: **91.2%**, missing 19.

**The general point, which is worth more than the fix.** A false miss costs more than a missed one, because a
false miss is the one that gets *acted on*. This is the second instrument defect in this corpus (after an
empty capture scoring 1.0), and both had the same shape: the instrument reported confidently about something
it had no way to see. Before trusting a ranking, it is worth asking where the content could legitimately have
gone that the measurement does not look.

The `[SN]` golden in `text-coverage-test.php` carries a NEGATIVE for the opposite failure — a haystack widened
until nothing can ever be reported lost. Following a reference must not blind the audit.

### A recognizer block nested in a cell must still be built (2026-09-29, cont.)

**What went wrong.** `build_cell_items()` dispatches a nested widget by its `t` through a hand-kept list
(`table`, `accordion`, `tabs`, `steps`, `timeline`, `progress`, `pricing`, `gallery`, plus explicit branches
for `feature_list` and `card`). Anything not on it falls to the role-router's default of `'code'` — and a
block that carries `items` and no `html` becomes an **empty code block**. A testimonials wall one level down,
inside a stack beside the band's own heading row, disappeared entirely that way: every quote, name and title.

**Measured.** That one block was 8,906 characters; its section kept 2 of its 12 phrases. Adding the
`testimonials` branch took the page from **57.5% → 80.8%** (missing 51 → 23), corpus mean 87.5% → 87.8%.

A corpus tally of nested blocks that no cell branch handles put `testimonials` at 8,906 characters and the
only other real candidate, `svg_draw`, at 26 — so this was one missing branch, not a general gap. Worth
re-running that tally whenever a recognizer is added: the cell path is a **parallel hand-maintained list**,
and the section loop is the one that gets updated.

### A tightening that is right in principle and wrong in the measurement (2026-09-29, cont.)

Worth recording because the instinct to keep it was strong.

`looks_quote_card()` treats *any* dash before a capitalised word as an attribution, which is equally the shape
of a feature row: `Fast global payments — Use your card worldwide with competitive interbank rates.` On a
captured page that made four **feature panels** read as a testimonials grid; each panel then yielded one
"quote" and its sibling rows were discarded — 20 lost phrases.

So the dash rule was tightened: the tail after the last dash had to be short (≤48 chars, ≤6 words), free of
sentence punctuation, and sitting in the last 40% of the text — a name, after a quote. It correctly rejected
all four panels. **The page then got worse: 80.8% → 73.3%.** Corpus-wide, a wash: 87.8% → 87.7%.

The reason is the [TS] lesson pointing the other way. There, rejecting a band beat claiming it, because a
rejected band still yields its heading, its content *and* its testimonial. Here the path a rejected feature
panel falls to keeps **less** than the wrong-but-partial claim did, so removing the wrong claim removed
content with it.

**Reverted, with the measurement left in the code comment.** The real defect is not the predicate: it is that
claiming a card discards its siblings, and that is where a fix belongs. Re-tightening this without first
making the fallback at least as good as the claim will lose content again.

The general discipline: *a rule being conceptually correct is not evidence that it improves the output.* Two
rules were reverted this way earlier in the same corpus (the PHP and JS icon rules, both dead on fresh data).
Measure the change, on the page and on the corpus, before believing it.

### A suite that asserts on GLOBAL state cannot be run beside another (2026-09-29, cont.)

The PHP suites are run in parallel across `testsite` / `testsite2` to keep the loop short. `rerun-test` then
began failing intermittently on **"the fixture cleaned up after itself"** — and passed in isolation every
time, which is the signature worth recognising.

It asserted `$count_pages() === $before_count`: the install's whole page count. Any suite running beside it
creates a page, so it reported a cleanup defect that was really another test doing its job. Scoped to
`! get_post( $pid )` — its own fixture — it is green under concurrency and still goes red when the
`wp_delete_post` is removed, so it lost no power.

The general point: **an assertion about global state cannot tell its own leak from someone else's work.** When
a suite passes alone and fails in company, suspect the assertion's scope before the code under test.

### On a page with no `<section>` at all, the `<div>`s ARE the bands (2026-09-29, cont.)

**What went wrong.** `walk_section_roots()` claims a band-shaped `<div>` only when it sits among **two or
more sibling `<section>` elements**. That guard asks "is this an interstitial between real sections?" — a
sensible question for a page that has sections, and one a page without any can never answer. A WordPress
**block theme** emits none: the bands are `div.wp-block-group` siblings of a `<main>` that itself wraps only
one of them. Every band failed the guard, was dived into, yielded nothing, and was dropped outright.

**Measured.** A captured block-theme page produced **one** section out of six and read **11.8%** coverage —
hero, services, product grid and footer content all gone, emitted as 12 loose text blocks. After: **73.5%**,
five sections. Corpus mean 87.8% → **90.2%** over 83 pages.

**The rule.** When the document carries no `<section>` anywhere, count **band-shaped siblings** instead —
the same question in the vocabulary the page actually uses. A second, smaller fix rode with it: the height
gate treated an *unstamped* wrapper (`0.0`) as "shorter than 40px", and a block theme stamps no height on
these wrappers at all, so bands holding a thousand characters were rejected as too short. Absent is not zero.

The walk is top-down, so the **outermost** qualifying level claims and never descends — that is what stops
this re-splitting the same content further in. The `[BT]` NEGATIVE pins it: a page that *has* sections must
not gain extra bands, because over-claiming here is how a six-section page once became twenty-four.

**The census is what makes this believable.** Across the corpus every shortcode count went up or stayed
equal — `text_block` +31, `counter` +14, `media_image` +13, `special_heading` +8, `image_box` +5, `icon_box`
+4 — and none went down. Recovered content came back as real elements, not as a pile of loose text, and
nothing already working was traded for it.

### The coverage haystack: wide enough to be fair, narrow enough to mean something (2026-09-29, cont.)

The converted header and footer are built from `theme-design.json`, so a nav label there **is** carried —
yet the audit read only the pages and theme settings and reported every one as lost.

Folding the file in wholesale took that page to 94.1%. **That number was a lie.** `theme-design` also carries
`conversion_map` — a *record of the source*, body copy included — and 85 KB of `custom_css`. Flattening it
puts the source's own text into the haystack the source is being checked against, and the audit then approves
of anything: body phrases the page genuinely dropped were sitting in `conversion_map` and scored as carried.
Narrowed to `header`, `footer` and `site_title` — the only keys that are **output the converted site renders**
— the honest figure is **73.5%**, and the phrases still reported missing are real footer content that never
reached the native footer settings. `raw_chrome` is excluded on the same principle: it is a copy of the
capture, so counting it would hide a header that was never converted into real settings.

**This is the third instrument defect in this corpus**, and the first where the fix could have caused a worse
one. The `[CH]` golden therefore pins **both** directions — too narrow and the positive fails, too wide and
the negative fails. Any change to what an audit counts as "carried" should be guarded that way: a measurement
that cannot report failure is not a measurement.

### Classify the losses, don't pick the pages (2026-09-29, cont.)

Working down the worst-page ranking finds whatever those pages happen to be. Once the obvious archetypes
were fixed, a better question was what the converter is *systematically* unable to carry — so all 397
remaining missing phrases were classified by the shape of the element they came from:

| Bucket | Share |
|---|---|
| **footer** | **27.7%** |
| short label | 23.7% |
| other | 16.1% |
| button | 7.3% |
| link / list item | 11.6% |
| form, header, article, label, carousel | the rest |

That immediately redirected the work. A separate scan had shown card **tag rows** (chips a card carries
that `card_from_cell()` has no slot for) at 7.8% of the loss — but 24 of those 31 phrases sat on a single
page, so it is one page's shape, not an archetype. The footer bucket was ~3 phrases on each of 74 pages:
small per page, systematic across all of them, and invisible to any per-page ranking.

**The finding.** `theme-design`'s `footer.copyright` was the hardcoded literal `'All rights reserved.'`,
so every conversion replaced a source's real line — `© 2026 <name>. All rights reserved.` — with boilerplate.
`detect_footer_copyright()` already existed, already read the real line, already normalised the year to
`{{current_year}}` and already repaired the `©` mojibake, and was already used by the theme-settings path.
It was simply never wired into theme-design. (I had begun writing a second copy of it before checking —
worth searching for an existing helper before adding one.)

**Result.** Corpus mean **90.2% → 91.8%**, and pages under 95% fell from **50 to 33** — a large drop in
failing pages for a small mean movement, which is the signature of a fix that lands once on every page.

One instrument note rode along: a carried copyright is stored as `{{current_year}}` on purpose, so the audit
compared that literal against the source's `2026` and still called it lost. The rendered site resolves the
token, so the audit now resolves it too before matching. A capture whose source year is *not* the current
one will still report a miss — that is the substitution being visible, which is the honest result.

### A converted background video: playable, and not a blank rectangle (2026-09-29, cont.)

A converted hero backdrop took several seconds to appear on a live host. Three separate causes, only one
of which was the hosting.

**Measured first.** The source clip and the converted copy were byte-identical — 2,600,807 bytes, HEVC,
1280×720, 5s, 4.2 Mbps — because the sideloader copies media verbatim. Fetched from one machine at one
moment: **0.70 s** from the source's CDN, **12.68 s** from the converted site's shared host. TTFB was
~0.27 s on both, so it is throughput, not latency. (One paired measurement; the file 404'd before it could
be repeated, so treat it as strong evidence rather than an average.)

**1 · The codec.** HEVC-in-MP4 decodes in Safari; Chrome and Firefox manage it only on some platforms. A
converted site therefore inherited a backdrop that simply does not play for many visitors. The sideloader
now probes with ffprobe and transcodes anything outside `h264 / vp8 / vp9` to H.264 (CRF 24, 1080p cap,
`+faststart`). An already-H.264 file is left alone — re-encoding costs quality for little.

**2 · Nothing on screen while it loads.** Neither the source nor the converter supplied a poster, so the
hero was empty for the whole download. The sideloader now cuts one frame per video (at 0.5 s — frame 0 of a
fade-in is usually black), stores it as its own attachment, and links it by `_sc_video_poster`. The mapper
runs long before any media exists, so the *import* fills the option (`fill_video_poster`), and only when the
source supplied none.

**3 · The converter deferred bytes it was about to need.** `n_video()` emitted `preload="metadata"` for every
video including autoplaying backdrops: the browser fetches the header, stops, and only then goes back for the
media. Now `auto` when `autoplay` is yes, in **three** places that all had to agree — the PHP mapper, the JS
twin in `to-pages.mjs`, and the two renderers (`unysonplus-theme` layout.php for the site-wide backdrop,
`background.init.js` for a section one). A click-to-play clip still defers; there is no reason to spend a
visitor's bandwidth before they ask.

**Result, verified on a real reconvert and read off the rendered page** (not the data):

| | before | after |
|---|---|---|
| codec | HEVC | **H.264** |
| bytes | 2,600,807 | **395,115** (−85%) |
| poster | none | generated, 116 KB |
| markup | `preload="metadata"`, no poster | `preload="auto" poster="…"` |

At the host rate measured above that is **12.4 s of blank → 1.9 s, with a poster from the first paint**.

**Entirely optional.** No ffmpeg, `exec` disabled, or any failure at all → the original file imports exactly
as before. A conversion must never fail because a host lacks ffmpeg.

**Three things this cost time on, all worth remembering:**

- The sideloader **de-dupes by source URL**, so re-importing the same video reuses the old attachment and no
  new code runs. A media change is only observable after deleting the cached attachment.
- `import_dir` imports the **bundle's** `pages.json`, which the *JS* engine wrote at capture time. Changing
  only the PHP mapper leaves the observable output unchanged — the twin must move with it.
- `media_video`'s self-hosted shape names the mp4 **`video_file`**, while Background-Pro names it
  `source_mp4`. A poster lookup that knows only one of them silently fills nothing.

And a golden that had to be rewritten: `[VP]` first asserted *"no metadata OR has auto"*, which passes when
the fixture emits **no preload key at all** — and it did, because a plain background video takes the
Background-Pro path, which carries no preload. The golden went green with the fix disabled. It now asserts
the key is present *and* correct, and the fixture carries a wrapper `filter` so it reaches the `media_video`
path that actually has one.

### An existing site is repaired by its next conversion, not by a migration tool (2026-09-29, cont.)

Video normalisation landed in `sideload()` — but the **de-dup path returns before any of it runs**. A site
converted earlier keeps the file copied verbatim at the time (HEVC, no poster), and re-converting would
never fix it: the reuse short-circuits first. That is worth noticing in general — *any* improvement placed
after a cache hit is invisible to everything already imported.

Rather than ship a separate "re-normalise my media" tool, the reuse path now tops the attachment up:
transcode if the codec is unsafe, cut a poster if there is none. An existing site is repaired by its next
conversion, with nothing to discover or run.

Deliberately conservative:

- the file is rewritten **in place, keeping its name**, so every URL already stored in a page still resolves
  — a converted site is full of references to it;
- which means only a `.mp4` is transcoded. Re-containering a `.webm` would change the extension, and the URL
  with it;
- the replacement is written to a temp file and only moved over the original once ffmpeg has succeeded, so a
  failed transcode cannot leave a site holding a truncated video.

Verified against a planted legacy attachment: `#456 hevc 2,600,807 B, no poster` → `#456 h264 395,115 B,
poster #457`, **same id, same path**. Then run twice more: unchanged, one poster file, ~0.35 s (the probe
alone). Idempotent by construction — once transcoded the codec is safe, once a poster exists the meta is set.

One testing note. The first version of that check reported the right numbers for the wrong reason: it
planted the de-dup meta under a guessed key, so `find_by_source` missed, the fresh-download path ran, and a
**new** attachment was created. The output looked like a pass. The check only became real once it also
asserted *the same attachment id came back* — the thing that distinguishes the path under test from the one
that happens to produce the same answer.

### Scope an assertion to what the code under test did (2026-09-29, cont.)

`rerun-test`'s `no extra page was created` compared a global page count before and after, so any suite
running beside it moved the number underneath. It failed about **one batch in three** at 14-way concurrency
and passed alone every time — the signature worth recognising.

It now compares the **set** of page ids and asks only what was *added*, which is the actual question and is
immune to what anyone else creates or deletes. Four consecutive concurrent batches green, and it still fails
— naming the id — when a stray page is planted inside the measured window.

That is the second assertion in this suite with the same defect (the first was `the fixture cleaned up after
itself`). The general rule: **an assertion about global state cannot tell its own effect from someone else's.**

And the reason it stayed anonymous for so long was my own batch runner piping results through `tail -1`,
which kept the summary line and discarded the `✗` line naming the assertion. A flake you cannot name is a
flake you cannot fix.

### A rule that can never match looks exactly like a rule that found nothing (2026-09-29, cont.)

Found by accident while adding a new regex: a `\b` in the source had become a literal **BACKSPACE byte**
(0x08). An edit that passes through a layer which resolves escapes — a shell heredoc, a language whose
string literals treat `\b` as a control character — writes the byte instead of the two characters. The file
still parses. Every test still passes. The rule simply never matches again.

A sweep found **eight**, all previously shipped:

| Regex | What it silently stopped doing |
|---|---|
| `/<(?:script\|foreignObject)\b/i` | an SVG sanitiser guard could no longer see a script tag |
| `/<svg\b[^>]*>/i` (theme) | an SVG attachment's aspect ratio always returned 0 |
| `/\bh-\[(\d+)px\]/`, `/\bmax-h-\[(\d+)px\]/` | measured heights never read |
| `/\bmx-auto\b/` (capture service) | a centred tile never detected by class |
| a time-format test | — |

**Why no test caught it, and why that is the interesting part.** Every one of those rules had callers, and
every caller behaved "correctly" — it just took the other branch, forever. A regex that matches nothing is
indistinguishable, from the outside, from a rule that correctly found nothing. This is the same shape as the
instrument defects above, one level down: the code was reporting confidently about something it had no way
to see.

`source-hygiene-test.php` now fails on any stray control character in source and names the file and line —
with a calibration assertion, because a hygiene check that cannot detect the thing it exists for is the
defect it is guarding against.

**Measured honestly:** repairing all eight moved corpus text coverage by **0.1** (91.8% → 91.9%). The rules
they govern are about SVG ratios and layout classes, which a *text* coverage metric cannot see. They are
worth fixing on correctness, not because this number moved — and saying so is better than claiming the
credit that belongs to the next entry.

### A site-builder watermark is not the customer's content (2026-09-29, cont.)

Classifying the remaining losses by the structure they sit in (rather than by which page they are on) put
"overlay on media" top: 29 phrases across **26 different pages**, max 4 on any one — the profile of a real
archetype. Looking at all 29 rather than the first three: **24 were the same builder watermark badge**,
pinned to the page and linking back to the tool that built the site.

Carrying that into someone's WordPress site would advertise the tool they are leaving, so the converter
deliberately drops it — which makes it `out_of_scope`, not a loss. Corpus mean **91.9% → 92.9%**, pages
under 95% from 33 to 30.

The rule is narrow by construction, per the consent-banner lesson: it needs **both** an attribution phrasing
(`made/built/powered by …`) **and** a container naming itself branding or watermark. The `[WM]` golden
carries a negative for each half alone, because "Made in Italy" on a product card is real content and a
`badge` class means nothing on its own.

**Two method notes worth more than the fix.** First: *look at the whole bucket, not the first three samples*
— three samples suggested an archetype, all 29 showed one badge repeated. Second: **page concentration is
the test for whether a bucket is an archetype at all.** Card tag rows were 7.8% of all loss, which sounds
systematic, but 24 of those 31 phrases sat on a single page; the watermark was 3-per-page across 26 pages.
A bucket's size tells you how much is there; its spread tells you whether it is a rule or a page.

### Where the footer loss actually is (and two things it is not) (2026-09-29, cont.)

After the copyright fix, footers were still the largest named bucket — 45 of the 279 phrases the corpus
loses. Two plausible archetypes were measured and **both were rejected**, which is the useful part:

- **A navigation column whose items are `<button>` rather than `<a>`.** Real, and a real gap — the footer
  column builder only understands links, so a router-driven button column is dropped whole. But it is
  **2 phrases on 1 page**. A page, not a rule.
- **Whole footer columns going missing.** Of 36 captured footers that have a column grid, only **2** build
  fewer columns than the source. The column builder (logo / heading / list_item / text) works on 34 of 36.

What is left is diffuse: the largest single shape is a paragraph inside a footer grid column, 13 phrases
across 13 pages, and no shape below it exceeds six. That is a long tail, not an archetype.

**So this is a stopping point rather than a fix**, and worth saying plainly: the systematic gaps this corpus
could show have been found. Chasing the remainder means building per-shape handling that the evidence does
not support as general — exactly the trade the reverted dash rule warned about.

One more confirmation while here: the footer column content that *is* lost sits in `theme-design`'s
`raw_chrome` only — a copy of the capture, not editable output — so excluding `raw_chrome` from the audit
haystack was correct, and these 45 are real losses rather than another false miss.

**Corpus at the end of this round: mean text coverage 92.9% over 83 pages (from 84.8%), 30 pages under 95%
(from 50).** Goldens 1226 → 1311, plus a source-hygiene suite.

### Put the work on the machine that can do it (2026-09-29, cont.)

Video normalisation was added to `sideload()` — the WordPress host. It worked perfectly in development and
would have done **nothing** where it mattered: the transcode and the poster both need ffmpeg, and a shared
host almost never has it. `media.json` was a list of URLs, so the host downloaded and processed every asset
itself; the one machine guaranteed to be able to do the job — the developer's, running the capture service —
was doing none of it.

So the work moved to capture time. `normalize-media.mjs` downloads each video once, transcodes anything
outside `h264 / vp8 / vp9` to H.264 (CRF 24, 1080p cap, `+faststart`), cuts a poster at 0.5s, and ships both
in the bundle. `media.json` gains an optional `local` map of source URL → bundled file + poster; the import
prefers it. Measured on one real capture: **15 videos normalised, 14 transcoded from HEVC**, the hero going
2,600,807 → 395,115 bytes.

The import side is now also *faster* where ffmpeg does exist — 0.68s → **0.07s** for that asset, because it
stops re-doing work the capture already did (`$already_normalized`).

**The assertion that matters** runs with `fw_sc_video_normalize` filtered off, simulating a host that cannot
normalise at all: the file and its poster still arrive. Without that case the suite would only ever prove the
thing that was never in doubt.

**Three things this turned up, worth keeping:**

- The bundled file must carry the **original URL** as a second `SOURCE_META` value. Without it the page keeps
  pointing at the remote original even though the file is already in the library — de-dup and `localize()`
  both key on that URL.
- `media.json` arrives inside an **uploaded zip**, so the `local` map is untrusted input that names files to
  read off disk. `bundle_path()` realpaths both sides and refuses anything that escapes the bundle; the
  traversal negatives are the most important assertions in that suite.
- The first version of the test used **fake media** — text with an `.mp4` name. WordPress verifies a
  sideloaded file's true type, rejected it, and the code correctly fell back to the URL. The suite failed and
  it looked like a bug in the code under test. A fixture that cannot survive the real validation tests the
  fallback, not the feature.

### A second axis: what the converter gives up on (2026-09-29, cont.)

Text coverage plateaued around 93%, and the remaining losses are a long tail. But coverage measures only
whether the WORDS survived — it is blind to whether they arrived as something a user can edit. A
`code_block` is the converter saying so out loud: a region emitted as raw HTML because nothing native fit.
Every one of them is content the builder cannot touch, and coverage scores them as a perfect success.

**Measured: 105 code_blocks across 21 of 89 pages** — roughly a quarter of pages contain at least one.

| Shape | Count |
|---|---|
| EMPTY — no text, no media | **49 (47%)** |
| SVG only | 22 (21%) |
| short text | 21 (20%) |
| a list, ~1000 chars each | 10 (10%) |
| a grid of headed cells | 3 |

**The empties are not a bug.** They are decorative shapes — an accent rule under a heading
(`w-16 h-1 bg-… rounded-full`), a scroll dot, a separator dot — carried as a raw span with scoped CSS
*instead of vanishing*. That is a deliberate fidelity trade, and the right one. 32 of the 49 are
converter-generated `sc-dot`, concentrated on 5 pages (21 on a single glossary page), so the cost is
lumpy rather than spread.

Worth noting the codebase already found a better answer for one case: separator dots between labels are
rendered as a `::before` on each label rather than as elements, because the editor strips a bare empty span
anyway. Generalising that to standalone decorative dots would remove most of these blocks without losing
the design — the technique exists, it is the application that is narrow.

**The genuinely actionable item is the smallest bucket**: 10 list-shaped blocks carrying ~1,000 characters
each — real product content sitting in raw HTML rather than an accordion or feature list. They are
concentrated on three pages of one site, so by the spread test that is a page shape, not an archetype.

**The method point.** Adding this axis took an afternoon and immediately showed something coverage could
never report: on a quarter of pages the converter silently hands the user something they cannot edit. When
a metric plateaus, the next move is usually a different metric rather than a harder push on the same one —
a plateau often means the instrument has stopped discriminating, not that the work is done.

### A rule's thickness is a measurement, not a class name (2026-09-29, cont.)

Following the code_block axis to its largest bucket found something better than the bucket suggested. The
"empty decorative" blocks were not all dots: `mirror_dot_css()` claims 244 elements corpus-wide, and while
**173 (71%) are genuine round dots across 33 pages**, **39 (16%) are horizontal RULES** — an A–Z glossary's
letter separators, an accent underline beneath a heading.

`n_rule_bar()` already exists to turn exactly those into a native `divider`, and it is already tried first.
It was declining them: it read the bar height only from the **class table**, and Tailwind's `h-px` (a
one-pixel height) is not in it. Thickness scored zero, the rule was refused, and it fell through to the
empty-dot path — one raw, uneditable code_block per rule, 21 of them on a single glossary page.

The stamp said `height:1px` the whole time.

**One line of fallback**, and the corpus moved exactly as it should: **code_block 105 → 83 (−22), divider
7 → 29 (+22)**. An exact swap — nothing lost, 22 raw blocks became editable dividers.

**A wrong guess, recorded because the checking is the point.** I first assumed the colour was the problem
(`bg-border`, a custom token) and was ready to patch the colour path. `catalog_el_bg()` resolved it fine.
Printing each gate in turn took two minutes and pointed at a different one.

**And a golden that had to be rewritten.** The end-to-end fixture produced no divider at all: a rule only
reaches `n_rule_bar()` from inside a MIRRORED subtree, and a small hand-built page decomposes natively
instead, so the fixture never exercised the changed code. It would have failed for a reason unrelated to
the rule, which is worse than not testing it — so `[RB]` asserts on the predicate, with negatives for a
round dot, a tall box and an unpainted hairline.

This is the third time in this corpus that the defect was **reading a class name where a computed value was
already stamped**. It is worth treating as the first hypothesis, not the third.
