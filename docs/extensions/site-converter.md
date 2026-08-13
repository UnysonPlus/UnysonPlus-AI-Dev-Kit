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
- **CSS completeness invariant — the global `util_css` bucket must carry EVERY page-matching utility (fixed capture-service v1.7.78 / site-converter v1.3.36).** The capture categorizer (`capture-extract.mjs` → `walkRules`) buckets a source sheet's rules into `base` / `util` / `header` / `footer`. The bug: it only promoted **global (`:root`/`body`) and header/footer-scoped** selectors to the global buckets, and fed `util` almost entirely from sheets whose **filename matched `VENDOR_RE`** (`tailwind`, `bootstrap`, …). A Tailwind/JIT source that ships utilities from an **inline `<style>` or a hash-named bundle** (e.g. `index-Cd4aA-AH.css`) is classified as first-party, so its **body-section** utilities (`.py-5`, `.feature-card`, card `.shadow`) fell through to per-section CSS only — and when the raw-chrome mirror theme was generated with an empty per-section merge, **every below-the-header section shipped unstyled** (the `freshpaws` "~10% done" conversion: hero styled, feature grid / CTA / footer bare). The fix promotes every **page-matching, non-global, non-chrome** selector into the global `util` bucket too (gated by `matchesPage()` so only used utilities are carried), making stylesheet-**filename** detection non-load-bearing for completeness. **Rule going forward: a section that renders must carry its full CSS at theme-generation time — never let completeness depend on the source's stylesheet filename or on a later per-section merge.** (The PHP upload path already carries the whole reproduced CSS blob, so it was already complete — but the invariant holds on both sides.)

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

### Translation rules still to add (known gaps — a conversion needs these; teach them + a fixture case)

These are captured-class effects the "rules to keep" list above does **not** yet translate. Each is a
converter-fix opportunity (not a hand-tune), and each should land with a `tailwind-matrix.test.mjs` case:

- **Gradients** — `bg-gradient-to-*` + `from-*`/`via-*`/`to-*` (and arbitrary gradient backdrops) → the
  `background-pro` / `gradient-v2` option (both exist as targets), not a flattened `bg_color`.
- **`backdrop-blur-*` / `backdrop-filter`** → a scoped-CSS translation keyed off the element's `css_class`
  (no native option yet; emit the CSS, don't drop it).
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
