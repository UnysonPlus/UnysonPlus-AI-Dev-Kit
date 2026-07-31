# site-converter extension

Bring an AI-generated / existing website into WordPress — imports media, styling presets, theme settings, pages and menus (piecemeal or as a one-shot bundle) and can generate a matching header/footer child theme. Converts **from a URL** (via a local capture service) or **from a file** (upload an AI-builder export, auto-detected). **Active by default:** no (enable it under Extensions).

## Provides

- **Shortcodes:** none — it's an importer toolkit, not builder elements (it *emits* page-builder trees + presets that shortcodes consume).
- **Admin page:** Unyson+ → **Convert**. Tools: Media scanner/importer, Styling Presets importer, Theme-settings importer, Pages importer, Menu importer, one-shot **Convert bundle** (`.zip`), and a **header/footer Theme Generator** (child or standalone). Two conversion methods (URL / file) with auto-detected source adapters + an optional **"Use AI"** fidelity pass and a human-in-the-loop "Review mapping first" editor.
- **Reusable engines (`includes/`, all static):** `FW_Site_Converter_Media`, `_Presets`, `_Theme_Settings`, `_Pages`, `_Menus`, `_Bundle`, `_Theme_Generator`, `_Stitch` (deterministic no-AI section decompose + block recognizers), **`_Mapper`** (block → shortcode / Theme-Settings-preset mapping — the counterpart of the JS `to-pages`), **`_Tailwind`** (Tailwind class → CSS compiler **and** class → design-token translation: arbitrary `[…]` values, the full default colour palette, `shadow-*`), `_Sources` (source adapter registry).
- **Public hooks/filters:** `fw_site_converter_sources` (register a builder adapter). The AI backend + capture service live **outside WordPress** (local `unysonplus-site-capture` service — `/capture`, `/ai-convert`).

## Notes / gotchas

- **Who edits the converter (important).** A **site build must never fork the shared converter to fix one page** — close that site's delta with native options / `misc_custom_css` instead. Improving the converter *algorithm* (so a whole class of misses goes away for everyone) is a **contributor** task: it needs the converter repos and the change must be **upstreamed** (and mirrored across the JS URL path + the PHP file path). As a site builder, **record the miss in the conversion report** and, with the site owner's consent, **run `node capture.mjs <url> --share`** — it POSTs the anonymized report to the maintainer's Google Form (already wired in `share-config.json`; inspect first with `--share-preview`) — the report is the intended feedback artifact, not a code fork. **Flag only a *systematic* miss** (one that would recur on other sites — a `code_block` fallback with a clear shortcode fit, an `opportunity`/`styling-drop` row, a wrong mapping); do NOT flag a bespoke widget that's correctly verbatim or a one-off site delta. Send **anonymized structural data only** (source type, `element → got vs. expected`, the report row, `systematic? y/n`) — no raw third-party content. (Same consent-gated artifact as the opt-in `--share` upstream flow. Full criteria: `site-build-protocol.md` → "What a SITE-BUILDER flags".)
- The deterministic no-AI algorithm exists **twice** (PHP here for the file path; JS in the capture-service repo for the URL path) — keep both in sync (see the workspace CLAUDE.md rule).
- **Full detail lives in the extension's own `AGENTS.md`** + `docs/site-conversion-playbook.md` (Theme-Settings-first demo conversion) + `docs/stitch-to-unysonplus.md`. Read those before working on conversion logic.
- Carried CSS must be scoped `body:not(.wp-admin)` (the asset optimizer absorbs `misc_custom_css` into a bundle that also loads in wp-admin); `misc_custom_css` is a `multi` option (`{ "custom_css": "…" }`, never a raw string).
- Media import is content-hash de-duped; per-shortcode att keys in emitted `pages.json` are exact (`text_block` → `text`, column `width` is top-level) — clone shapes from a real export.

## CSS Class Mapper & box columns (deterministic decompose — rules to keep)

The deterministic decompose maps a source element's utility classes into ONE clean **semantic class**
(`compile_class_set()` in `class-fw-site-converter-tailwind.php` → `FW_Site_Converter_Mapper::box_style_class()`),
so the converted DOM stays clean instead of carrying raw utilities.

- **Detect a box.** `FW_Site_Converter_Mapper::is_box_class()` flags a column/card as a *box* when it
  has a border / shadow / background / rounded — anything that reads as a card container.
- **Where the box class goes (the key rule):**
  - Card content is **only icon + title + content** (fits the `icon_box` shortcode) → put the box class
    on the **`icon_box`'s own `css_class`**.
  - Card has **extra content the icon_box can't hold** (most commonly a button, e.g. "Explore →") →
    render `icon_box + button` in the column and put the box class on the **column's Inner Wrapper Class**
    (`column atts['inner_class']`) so it wraps BOTH. That option exists precisely for boxed columns whose
    contents exceed the icon_box.
- **Self-contained box CSS.** The compiled `.box` rule is GLOBAL (not under `.sc-tw`), so the Tailwind
  preflight doesn't reach it: when there's a `border-width`, also emit `border-style:solid` and
  `box-sizing:border-box` — otherwise the border renders as `0px none`.
- **De-dup by declaration set** — identical cards share ONE `.box` class (`.box`, `.box-2`, …).
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

- **Heading-group → ONE `special_heading` with NATIVE options (2026-07-31).** A wrapper `[pill?, h, p]`
  collapses to a single `special_heading`, and its Tailwind layout/spacing classes are **translated to
  native options, not left as dead classes**: `text-center`→`alignment`, `space-y-N`→`element_spacing`,
  `max-w-{scale}`→`block_max_width`, `mb-N`→`spacing.margin.bottom` as a **scale-slug utility class**
  (`mb-16`→`mb-7`=4rem — a raw `4rem` would land as a dead class), and an arbitrary accent
  `text-[#hex]`→inline color. JS `to-pages` `headingNode` + PHP `Mapper::heading_layout`/`n_heading`.
- **Product-card grid → `wc_products` (2026-07-31).** A grid whose cells are product cards (an `<img>` +
  a price token, ≥60% of cells) maps to ONE `wc_products` placeholder grid — not N static `icon_box`es.
  JS `to-pages` (`cellIsProduct`/`wcProductsNode`) + PHP `Mapper::cell_is_product`/`n_wc_products`.

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

The converter today **curates** a few tokens (brand color, one button style, typography) + decomposes
sections to shortcodes + **code_blocks the rest** — which silently DROPS per-element detail (`:hover`,
`text-decoration` wavy underlines, `animation`, `box-shadow`, `transform`). The right model, and the
standing target, is:

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
can, and only falls to scoped CSS for the genuinely un-expressible. **Verify with the comparison tool**
(`tools/measure/fidelity-check.mjs`) which now diffs the *full* per-element computed style — text-decoration,
animation, box-shadow, transform, letter-spacing — not a curated subset, so a missing wavy underline or
bounce is **flagged**, not silently skipped.

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
  - **Structural testimonials detection** (a flex/grid of quote-cards → `testimonials`, no class name needed).
  - **Fewer `code_block` fallbacks** — an unrecognised text cell → editable `text_block`; an empty/decorative
    cell is dropped (13→4 on the pinky-bites reference).
  - **Flex-row cell → native `content_direction` + `content_gap`** (replaces the old `.btn-row` CSS wrapper).
- **Remaining follow-ons:** emit hover on the **to-pages decomposed** path (not just the mirror path); the
  **hero / media-bearing** sections still fall to verbatim `code_block` (fidelity-preserving, but the biggest
  remaining decomposition gap); broaden token→option mapping beyond buttons (typography, spacing, boxes).
