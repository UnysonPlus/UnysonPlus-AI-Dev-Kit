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

### The fix loop (per wrong value)

`captured class → converter translation → is the value right?` → **no →** fix the class→value rule in
**BOTH** paths (JS `capture-extract`/`to-pages` **and** PHP `Mapper`/`Stitch`/`Tailwind`, kept in sync) →
**re-run the class-string fixture** → repeat until it passes. A site-builder (no repos) instead **flags**
the systematic miss via `--share` (below) and closes only this site's residual with native options /
`misc_custom_css`. Either way: **you never hand-measure the render to derive the value.**

## Provides

- **Shortcodes:** none — it's an importer toolkit, not builder elements (it *emits* page-builder trees + presets that shortcodes consume).
- **Admin page:** Unyson+ → **Convert**. Tools: Media scanner/importer, Styling Presets importer, Theme-settings importer, Pages importer, Menu importer, one-shot **Convert bundle** (`.zip`), and a **header/footer Theme Generator** (child or standalone). Two conversion methods (URL / file) with auto-detected source adapters + an optional **"Use AI"** fidelity pass and a human-in-the-loop "Review mapping first" editor.
- **Reusable engines (`includes/`, all static):** `FW_Site_Converter_Media`, `_Presets`, `_Theme_Settings`, `_Pages`, `_Menus`, `_Bundle`, `_Theme_Generator`, `_Stitch` (deterministic no-AI section decompose + block recognizers), **`_Mapper`** (block → shortcode / Theme-Settings-preset mapping — the counterpart of the JS `to-pages`), **`_Tailwind`** (Tailwind class → CSS compiler **and** class → design-token translation: arbitrary `[…]` values, the full default colour palette, `shadow-*`), `_Sources` (source adapter registry).
- **Public hooks/filters:** `fw_site_converter_sources` (register a builder adapter). The AI backend + capture service live **outside WordPress** (local `unysonplus-site-capture` service — `/capture`, `/capture-file` (renders an uploaded Stitch `.zip` / HTML through the same engine as a URL), `/ai-convert`).

## Notes / gotchas

- **Who edits the converter (important).** A **site build must never fork the shared converter to fix one page** — close that site's delta with native options / `misc_custom_css` instead. Improving the converter *algorithm* (so a whole class of misses goes away for everyone) is a **contributor** task: it needs the converter repos and the change must be **upstreamed** (and mirrored across the JS URL path + the PHP file path). As a site builder, **record the miss in the conversion report** and, with the site owner's consent, **run `node capture.mjs <url> --share`** — it POSTs the anonymized report to the maintainer's Google Form (already wired in `share-config.json`; inspect first with `--share-preview`) — the report is the intended feedback artifact, not a code fork. **Flag only a *systematic* miss** (one that would recur on other sites — a `code_block` fallback with a clear shortcode fit, an `opportunity`/`styling-drop` row, a wrong mapping); do NOT flag a bespoke widget that's correctly verbatim or a one-off site delta. Send **anonymized structural data only** (source type, `element → got vs. expected`, the report row, `systematic? y/n`) — no raw third-party content. (Same consent-gated artifact as the opt-in `--share` upstream flow. Full criteria: `site-build-protocol.md` → "What a SITE-BUILDER flags".)
- The deterministic no-AI algorithm exists **twice** (PHP here for the file path; JS in the capture-service repo for the URL path) — keep both in sync (see the workspace CLAUDE.md rule).
- **Full detail lives in the extension's own `AGENTS.md`** + `docs/site-conversion-playbook.md` (Theme-Settings-first demo conversion) + `docs/stitch-to-unysonplus.md`. Read those before working on conversion logic.
- **Carried CSS is auto-scoped away from wp-admin (since 2026-08-01) — you no longer have to hand-scope `body`/`html`.** `misc_custom_css` folds into the shared presets stylesheet the page builder also loads in wp-admin (canvas WYSIWYG), so an unscoped global `body`/`html` rule used to repaint the *editor* chrome. `upw_ts_custom_css()` now runs the CSS through **`fw_admin_safe_custom_css()`**, which rewrites top-level `body`→`body:not(.wp-admin)` and `html`→`html:not(:has(.wp-admin))` (leaving `.class`/`#id`/descendant rules untouched so they still skin the canvas; idempotent). This applies to ALL Custom CSS — converter-emitted OR hand-written — so a global rule can't leak into the admin regardless of source. `misc_custom_css` is still a `multi` option (`{ "custom_css": "…" }`, never a raw string).
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
- **Product-card grid → `wc_products` (2026-07-31; rows 2026-08-01).** A grid whose cells are product
  cards (an `<img>` + a price token, ≥60% of cells) maps to ONE `wc_products` placeholder grid — not N static
  `icon_box`es — emitting the **`card_rows`** designer (default four rows; empty slots/rows collapse) so the
  converted grid reproduces a modern card. (`wc_products` is **rows-only** since 2026-08-01 — the old
  `card_layout` Classic/Slot att was removed, so the converter no longer emits it.) JS `to-pages`
  (`cellIsProduct`/`wcProductsNode`) + PHP `Mapper::cell_is_product`/`n_wc_products`.
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
  - **Box Presets** (`border_presets`) — `Stitch::build_box_presets()` walks every box-like element
    (cards / containers / image frames), compiles its Tailwind → border / corner radius / shadow + the
    **hover** shadow & lift, clusters the distinct designs, and appends them to the default library
    (Card / Outline / Soft Shadow …). **Closes the old "box → global `.box` CSS" gap** — boxes are now
    editable on-brand Box Presets, applied via the card/column Box Style picker (`boxp-{slug}`).
  - **Text Styles** (`font_sizes`) — `Stitch::build_text_styles()` reads h1–h6 for the **display size scale**
    (largest rendered size per level across breakpoints + line-heights → `Display 1..N`, class `display-N`)
    and the **Eyebrow/overline** (uppercase + tracking → `.font-eyebrow`).
  - **Image Styles** (`image_styles`) — `Stitch::build_image_styles()` reads each `<img>` (+ its wrapper) for
    corner radius / circle, aspect-ratio and colour filter; clusters; appends to the `.imgs-*` library.
  - **Background Patterns** (`background_patterns`) — JS `to-presets.mjs` `backgroundPatterns()` turns the
    captured per-section decorative backgrounds (`findPattern`: SVG data-URIs + repeating gradients) into
    pattern presets; emitted only when the source has one (else the 12 default patterns stand). This one is
    JS-side because patterns live in computed CSS the PHP stitch can't see.
  - **Tables (preteach)** — a verbatim `<table>` is wrapped in the default `.tbl-{slug}` Table Preset skin
    (whose CSS targets `> table > thead/tbody…`), so a raw source table renders styled without fragile
    per-site table derivation. PHP `Mapper::n_code` + JS `to-pages` `codeBlock`.
  - **section-styles bug fix** — `sectionStyles()` read the always-empty `background` shorthand instead of
    `backgroundColor`, so pure colour-fill bands were dropped; fixed (+ `to-presets.test.mjs` fixture).
- **Arbitrary-value SPACING is lossless + registered (2026-08-02).** `to-pages`/`Mapper` `sectionLayout`
  emits a scale slug when the captured px is on the Bootstrap-aligned scale, else an exact Tailwind-style
  **arbitrary** token (`pt-[40px]`) — no ±12px snap. The plugin renders these via per-page dynamic CSS, and
  on import `unysonplus_register_arbitrary_spacing_scale()` (called from `Mapper`/`Pages`) registers each
  arbitrary value as a named Spacing-Scale preset (`[40px]`), so it shows in Components → Spacing and is
  durable in the section dropdown. **We keep the Bootstrap-aligned scale — no renumber** (it stayed
  compatible so pasted Bootstrap markup still works); arbitrary values cover everything off-scale.

### Translation rules still to add (known gaps — a conversion needs these; teach them + a fixture case)

These are captured-class effects the "rules to keep" list above does **not** yet translate. Each is a
converter-fix opportunity (not a hand-tune), and each should land with a `tailwind-matrix.test.mjs` case:

- **Gradients** — `bg-gradient-to-*` + `from-*`/`via-*`/`to-*` (and arbitrary gradient backdrops) → the
  `background-pro` / `gradient-v2` option (both exist as targets), not a flattened `bg_color`.
- **`backdrop-blur-*` / `backdrop-filter`** → a scoped-CSS translation keyed off the element's `css_class`
  (no native option yet; emit the CSS, don't drop it).
- **`shadow-*` on a plain heading / standalone image** — box detection now covers card & container skins
  (→ Box Presets) and image radius/aspect/filter (→ Image Styles), and the button preset covers buttons, but a
  drop-shadow on a *bare* heading or a standalone image (no box wrapper) is still dropped. Translate via a box
  preset on the wrapper or scoped CSS.
- **`overflow-hidden` / clipping** → `element_overflow` (or scoped CSS). Note the `.imgs-wrap` default is
  now `overflow:visible` (shadows/glows render); only a hover-zoom crop needs `--imgs-overflow:hidden`.
- **Image `max-width` / intrinsic sizing** (`max-w-lg`, `w-[420px]` on an `<img>`) as a general rule, not
  only in the WooCommerce card context.

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
  - **Structural testimonials detection** (a flex/grid of quote-cards → `testimonials`, no class name needed).
  - **Fewer `code_block` fallbacks** — an unrecognised text cell → editable `text_block`; an empty/decorative
    cell is dropped (13→4 on the pinky-bites reference).
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
