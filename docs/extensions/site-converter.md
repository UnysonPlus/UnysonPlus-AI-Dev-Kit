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
- **Training harness (`tools/converter-trainer/`):** a token-cheap loop for improving the converter against a corpus of demo sites (openhero/wegic/any URL list). `bash train.sh` batch-captures a `sites/*.txt` list (per-slug dirs so the shared capture slug doesn't collide), then runs each capture through `Stitch::html_to_mapping` + `Mapper::build_pages` headlessly and prints a **ranked list of fidelity flags** (`LIGHT_OVERLAY_WASH`, `LOW_CONTRAST_TEXT`, `NO_HERO_BG`, `EMPTY_SEC`, `VERBATIM`, `FEW_SECTIONS`) → `batch/_audit.csv`. After a converter edit, `train.sh <list> --audit-only` re-scores the existing captures in seconds (no browser) so you see whether flags cleared. Content signals read the MAPPING (heading text lives in a block's `text`), background/overlay signals read the BUILT tree. See its `README.md`.
- **Training harness (`tools/converter-trainer/`):** a token-cheap loop for improving the converter against a corpus of demo sites (openhero/wegic/URL list). `capture.mjs` batch-captures a `sites/*.txt` list into per-slug dirs (no slug collision); `audit.php` runs each capture through Stitch+Mapper **headlessly** (no browser) and prints a ranked list of fidelity flags (`LIGHT_OVERLAY_WASH`, `LOW_CONTRAST_TEXT`, `NO_HERO_BG`, `EMPTY_SEC`, `VERBATIM`, …) + a CSV; `train.sh` orchestrates capture+audit, with `--audit-only` for a fast re-score after a converter edit. See its `README.md`. Use it to find WHICH sites regressed/drift before spending time looking at any — content signals come from the mapping, background/overlay from the built tree.

## Notes / gotchas

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
  icon + heading + description **followed by a grid/flex of icon+text rows** (e.g. modfii's "Loan Types
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
  uses shape dividers to verify** — modfii's §9 is a `bg-gradient-to-b` overlay, NOT a divider, so it can't
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
  (to-ai) picks the closest catalog effect (or none) via the local model / Claude — non-destructive, only where
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
  (0.7%)** — wegic 0/81, openhero 1/57. So it stays a scoped-CSS fallback and does **NOT** graduate to a
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

### Fidelity fixes landed 2026-08-02 (FreshPaws / Wegic pass — JS capture path)

A real conversion (a Wegic pet-boarding SPA) drove these converter-algorithm fixes. Each was diagnosed
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
  `rgb()`/`#hex`, returning null for the `oklch()` palettes AI builders (openhero, v0, …) emit. So a hero whose
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
  page with NO header/nav (crafting-the-nocturnal-web, synthetic-light) has no brand chrome, so `detect_logo`
  returned empty and the masthead rendered the WP "Home" fallback. The site-title now derives the brand from the
  source `<title>`'s first segment (before a `|`/`–`/`—`/`·`/`:` separator — the same derivation the theme NAME
  already uses), so the masthead shows "Aether House" / "Lumina Gen" instead of "Home". **logo 0 → 100** on both;
  homex (no header AND no `<title>`) legitimately stays the "Home" fallback.
- **HARNESS — spacing excludes heroes + gap-spaced bands (score.mjs).** The metric counted any text section with
  <24px vertical padding as collapsed, but a HERO uses min-height + vertical centering (autonomous-supply-chain's
  1083px bg-video hero) and a `section--gap-<n>` band uses child GAP for rhythm (obsidian's `section--gap-32px`) —
  both legitimately have ~0 section padding. Now a tall centered/flex/min-height/full-bleed-media section and a
  `section--gap-≥16` band are N/A for the padding-collapse check (the gap px is read from the class, since the gap
  often sits on an inner flexbox and `cs.rowGap` reads 0). Cleared the false collapses (autonomous 0→100,
  crafting 75→100, obsidian 33→67); a genuinely flush content band still counts.
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
  visually verified. NB the remaining logo=0 sites (homex, synthetic-light) are genuinely BRAND-LESS sources
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
  cover}`, `bands`) → `classify-structure.mjs` (capture-service; Ollama offline OR Claude, schema-constrained JSON via
  `askModel`) returns a per-section verdict `{sig, kind, pricing, video_role}` to `ai-structure.json` → the bundle
  importer loads it (gated: `FW_SC_AI_STRUCTURE` constant/`fw_sc_ai_structure` filter/env) and `set_ai_structure()`
  installs it; `is_pricing_table()` and the video recognizer then consult `ai_verdict_for($el)` (walks to the section,
  matches `structure_sig`) — ADVISORY: a verdict corrects the call, no verdict → heuristics decide. **Default OFF →
  the deterministic path is byte-identical.** Verified end-to-end on build-products: both qwen3:4b AND Claude return
  `pricing:false` (correctly reading "$4.2B"/"$18.24M" as STATS, not plan prices — the semantic win heuristics miss)
  and `video_role:content`; flipping a verdict provably flips the converter's decision (the-art-of-living hero bg
  video true→false on `video_role:content`). KEY FINDING: the AI wins the **semantic** call (stats-vs-pricing — both
  models nailed it), while a **mechanical** computed-style fact (rounded frame → content) is more reliable as a crisp
  rule than fuzzy reasoning (both models first said "background" until the prompt made the rounded→content rule
  explicit). So the division is: **AI for semantic judgment, deterministic for mechanical facts.** The `background`
  override is intentionally guarded by `in_card` (the AI can't force a clearly-rounded reel to full-bleed).
  CORPUS MEASUREMENT (site-converter 1.8.44, qwen3:8b local/offline, 67 sites / 247 sections vs the deterministic
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
  (`selectedLocalModel()`) rather than Claude: this task is schema-constrained and Ollama's `format` grammar
  GUARANTEES valid JSON, whereas the Claude CLI path returns free text that missed the shape ("classifier returned
  no sections"); `--model` still overrides, and with no local model selected it falls back to the active backend.
  The pricing override is a one-directional VETO — `is_pricing_table` honors `pricing:false` (suppress a wrong
  table) but NEVER `pricing:true`, so the model's 3 pricing false-positives can't fabricate a pricing table or
  regress a stat site; the `background` override is `in_card`-guarded. This is what makes AI-on SAFE to enable.
  Next: run the same measurement on the Claude backend for a quality ceiling; expand verdicts to section-split + a
  full role map; measure AI-on vs AI-off rendered scoring (expected ~neutral on the tuned corpus — heuristics are
  already correct — with the lift landing on UNSEEN sites where heuristics fail).
- **ROADMAP — improve the LOCAL-AI tier (Ollama backend in `to-ai.mjs`).** The local models (Qwen3 4B/8B, `to-ai.mjs`)
  are the free/offline tier and, per the code, "well below Claude." The cheap win is already in — the Ollama calls
  pass a JSON **schema to `format`** (constrained decoding → always-valid JSON, `think:false, temp 0`), so the model
  never emits malformed JSON. Remaining levers, cheapest first: (1) **few-shot / retrieval** — inject 2–3 similar
  SOLVED mappings from the corpus into the prompt before each call (no training, big lift for a small model on a
  patterned task; probably not wired yet). (2) **base/quant** — bigger Qwen3 if the hardware allows. (3) **fine-tune
  via distillation** (the deep step, only after 1–2 plateau) — run Claude over the corpus for gold outputs, LoRA-tune
  a Qwen3 with **Unsloth** (fastest single-GPU + GGUF export) or **LLaMA-Factory** (NOT the `Soup` repo — it's a thin,
  unproven wrapper over these), export GGUF → serve via the existing Ollama backend → validate with the converter-trainer
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
  separated words); a single glued token (`ModFiiFinancingResources…`) stays capped at 24. Verified:
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
  openhero `<main class="min-h-[120vh]">` that holds the hero PLUS a feature grid / gallery / CTA as sibling
  `<div>`s (no `<section>` tags) was claimed as ONE band by `walk_section_roots`, dropping everything after the
  first screen (payment-operations lost its 3-card feature grid; anime-environment-engine collapsed to 1
  section). New `segment_bands()` detector: when such a container splits into ≥2 content bands, each is claimed
  as its own section; a genuine single hero (no inner bands) stays whole. Helpers `is_content_band()` (heading /
  grid-cols / ≥3 media-or-paragraphs / ≥120 chars) and `is_decor_layer()` (an absolute/fixed bg-glow-scrim with
  no heading and <30 chars rides as background, not a band). Verified via builder JSON: payment-operations
  1→2 sections with all feature cards; anime 1→4; crystal (section-based) unchanged (the detector's trigger —
  section-less + full-viewport + ≥2 bands — never fires on a normal `<section>` page, so no regression).
- **Consolidated openhero audit (66-site list, 35 captured/analysed 2026-09-06).** The dominant remaining
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
  panels) still normalizes to sc-tabs. This was the biggest single hero-fidelity bug in the openhero corpus —
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
  (openhero: apple-vision-pro / orbital-horizon / the-art-of-the-burger / red-planet) converted with a WHITE
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
  stays legible. Result on the 10-site openhero audit: 9/10 now get a correct canvas (was ~2/10). A residual
  theme CSS-delivery quirk can still leave one dark site white even though the correct `site_background` is
  written — the conversion output is correct; the cascade/asset-optimizer delivery is the follow-up.
- **Full-viewport `<main>` / `<div>` hero with NO `<section>` → claimed as a band (capture reliability, site-converter 1.8.7).** An AI-page shape `body > (bg layers) > nav > main.min-h-[120vh] (the hero, holding the h1, zero nested `<section>`s) > footer` captured **0 elements**: `walk_section_roots` only claimed `<section>` / hero-`<header>` and dived through `<main>`, reaching no sections (the openhero `payment-operations` hero — heading came out empty). Now `walk_section_roots` also claims a `<main>`/`<div>` child that is `is_hero_header()` (full-viewport-tall AND leads with a heading) **AND contains no nested `<section>`** (else it's a page-wrapper `<main>` — dive in for those). The hero heading then decomposes onto a real band instead of vanishing. NB: a page-LEVEL full-bleed `bg-video-container` that is a *sibling* of the hero (not inside it) IS now hoisted onto the first hero section's background video (`detect_page_bg_video`, site-converter 1.8.16 — see the page-level-fixed-backdrop note above); before that fix the dark band rendered on its solid fallback colour.
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
