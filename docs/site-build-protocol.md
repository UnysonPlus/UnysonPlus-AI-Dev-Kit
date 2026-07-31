# Site-build protocol (STRICT — read before building ANY site)

The strict rules for reproducing a source (a screenshot, a URL, a template) as a UnysonPlus site.
**Applies to every build — a demos subsite, a local `testsite`, or an actual live/production site.**
It exists because the same mistakes keep recurring, above all **shipping an incomplete
header/footer** and **hand-building a conversion instead of running the converter**. Follow it in
order; do not skip steps. The narrative how-to is [build-a-site.md](build-a-site.md); this is the
enforceable checklist + the exact value shapes.

> ## ⛔ RULE 0 — NEVER hand-build or hand-translate a conversion. The converter is the source of truth.
>
> On a **conversion** (any source to reproduce — see the trigger below) you **must not**:
> - **hand-measure** the source (Playwright/devtools) and type geometry into a tree, OR
> - **hand-translate** Tailwind/CSS into option values or scoped CSS by eye, OR
> - **hand-author** the section tree in a `build-<slug>.mjs` factory as if from scratch.
>
> The deterministic converter (capture service / Site Converter extension) already does all of that —
> it maps each block to the right shortcode with **native options**, compiles Tailwind → tokens, and
> falls back to `code_block` only for the genuinely bespoke. **Run it first; start from its output.**
> Hand-work is allowed for **one thing only: the residual delta** the converter couldn't express — and
> even then it is `native options → misc_custom_css`, never a from-scratch rebuild, and every
> *systematic* miss is **flagged to make the converter smarter** (Rule −1), so next time there is even
> less to touch. **The mission: every hand-fix you're tempted to make is a converter improvement you owe
> upstream. If you find yourself measuring or eyeballing a class, STOP — you skipped Phase 1.**
> (This is not new — it is the explicit, unmissable statement of the capture-first gate + Rule 4 below.
> The pinky-bites builder heading is the cautionary tale: hand-built, it shipped an emoji for a captured
> SVG and mis-measured gaps; the converter would have emitted the correct `special_heading` + native
> options in one pass.)

> **ALWAYS ON — this protocol governs EVERY build, whether or not the user mentions a "protocol."**
> It applies to both a **conversion** (reproducing a source — URL, screenshot, template, HTML/CSS) and
> a **fresh build** (from a prompt/brief, no source to reproduce). The only difference: a conversion
> **must** run Phase 1 (capture — see the capture-first gate below); a fresh build **skips Phase 1**
> (there's nothing to capture) and starts at Phase 2, then follows Phases 2–7 exactly the same. Do not
> wait to be told to follow it — following it is the default; *not* following it is the exception you
> must justify.

> **Phase numbering (matches `Site Conversion Protocol.txt`):** **Phase 0 = Setup** (fresh WordPress,
> Classic Editor before UnysonPlus, capture service ready) · **Phase 1 = Capture** · then Design system
> → Chrome → Sections → Report → Motion → Ship gate. "Capture-first" below is the **gate/principle**, not
> a phase number — it lives *inside* Phase 0 and forces Phase 1 before any building.

## ⛔ The capture-first gate — a CONVERSION must run Phase 1 (CAPTURE) before building (hard gate)

**Trigger — detect by SOURCE, not by keyword.** It is a **conversion** whenever the request references or
supplies **an existing design to reproduce** — a **URL**, a **screenshot/image**, a **PDF/Figma**, an
**HTML/CSS dump**, or a **named template/site**. The verb is irrelevant: *"convert / clone / rebuild /
turn this into / make a WordPress version of / like / based on"* all qualify, and so does a request that
merely **points at a source** ("here's the site: …", "match this"). If a source to reproduce exists → it
is a conversion; only a brief with **nothing to reproduce** ("build me a bakery site") is a fresh build.

Once **Phase 0 (Setup)** is done, the very first *build* action — before touching Theme Settings, before
building any section, before ANY hand-measuring — is **Phase 1: run the deterministic converter**:

```
# Capture service — the URL path (JS: capture-extract / to-pages / to-design-config)
node capture.mjs <url> capture-out/     # UnysonPlus-Capture-Service/tools/design-capture
```

> **Who runs what (audience split — see the 2026-07-19 "converter-improvements-via-shared-reports"
> decision).** The capture service and the Site Converter **extension** are two front-ends of the *same*
> deterministic converter (capture service = URL/JS path; extension = HTML-upload/PHP path).
> - **Site-builder (building ONE site):** run the **capture service** → import its output → build Phases
>   2–7. You do **not** separately run or fork the PHP extension; close this site's residual delta with
>   native options / `misc_custom_css`, and — for a *systematic* miss only — **FLAG it to the Gmail
>   report-intake form** (opt-in, consent-gated, anonymized structural data only; = the `--share` upstream
>   artifact). See "What a SITE-BUILDER flags" under Rule −1. **Do not edit the converter.**
> - **Converter maintainer/contributor (has the repos):** ALSO run the **Site Converter extension** on the
>   captured markup, and in **Phase 5** improve **both** paths (JS `to-pages`/`capture-extract` **and** PHP
>   `Mapper`/`Stitch`, kept in sync) from the conversion report — so every conversion makes the tool
>   smarter and saves tokens next time.
>
> A **from-scratch / fresh build** uses **neither** tool — nothing to convert — so it skips Phase 1 and
> starts at Phase 2.

This emits the **source of truth**: `design-config.json` (tokens → Theme Settings), `pages.json`
(per-section shortcode JSON), the **conversion-report** (what fell back / needs work), style-coverage,
`animations.json`, a full screenshot, and a theme bundle.

> **VIOLATION:** Hand-measuring the source with Playwright/devtools and hand-building sections *before*
> a capture exists is a **protocol violation** — it is slow, drifts from the source, and skips the tool
> built for exactly this. If `capture-out/<site>/` does not exist for the source, **STOP and run the
> capture first.** The only exception is a genuinely *fresh* build with no source to reproduce.
>
> **The `.mjs` demo-builder loophole (learned the hard way — pinky-bites, 2026-07-31).** Emitting the
> tree by hand in a `build-<slug>.mjs` factory *feels* like authoring from scratch, so it's tempting to
> skip Phase 1 — **don't.** If the demo **clones a source** (a named template, a URL), it is a
> **conversion**, and the `.mjs` file is only the *import format*, not a licence to hand-measure. Run the
> converter/capture first and let its per-section output (a `special_heading` with **native** options
> below + a `code_block` for anything bespoke) seed the tree; then swap each bespoke `code_block` for the
> real shortcode. Hand-translating Tailwind → guessed scoped CSS is how the pinky-bites builder heading
> shipped with a `🎁` emoji instead of the source's lucide-gift SVG and mis-measured 40/0px gaps.
>
> **Tailwind → native `special_heading` option cheat sheet** (what the mapper already does — reach for
> these BEFORE scoped CSS; a heading block `text-center space-y-4 max-w-3xl mx-auto mb-16` + pill + h2 + p
> is ONE `special_heading`):
>
> | Source class | Native option | Value |
> |---|---|---|
> | `text-center` | `alignment` | `center` |
> | `space-y-4` | `element_spacing` | `relaxed` (=16px) |
> | `max-w-3xl` + `mx-auto` | `block_max_width` | `48rem` (centres itself w/ center align) |
> | `mb-16` | `spacing.margin.bottom` | `4rem` |
> | pill wrapper | `overline_container` | `pill` |
> | `text-[#…]` overline/title/subtitle | `overline_color` / `title_color` / `subtitle_color` | the hex |
> | `text-lg` subtitle | `subtitle_size` | preset |
> | `uppercase` overline | `overline_uppercase` | `yes` |
>
> Only what has **no** native option falls back to scoped CSS: a **custom overline icon** (the marker
> only does dot/line/bar — inline the captured SVG as a currentColor mask), a **non-default pill fill**
> (the theme pill auto-tints; override bg/border for a white pill), and **font weights** (`font-black`
> 900 / `font-medium` 500 have no option). Everything else = a native field.

## Rule −1 — CONVERTER-FIRST region loop: fix the ALGORITHM, not the output (the token-saver + the product)

> **⚠️ WHO this rule is for — read FIRST (it decides whether you edit the converter at all).** "Fix the
> algorithm" is the **MAINTAINER / contributor** path — an agent that **has the converter repos** (the
> `UnysonPlus-Capture-Service` + `UnysonPlus-Site-Converter-Extension` clones) and is authorised to change +
> upstream them. If you are that maintainer, follow this rule in full.
>
> **If you are a SITE-BUILDER agent** (building ONE site for a developer, *without* those repos): you do **NOT**
> edit the converter. Instead — (a) close this one site's residual delta with **native options /
> `misc_custom_css`**, and (b) **FLAG** any *systematic* converter miss and **submit it to the Gmail
> report-intake form** (see "What a site-builder flags" below) so the maintainer can improve the algorithm for
> everyone. The report/flag is the feedback artifact — **never a code fork**. Everything below (measure →
> improve the algorithm → re-run → verify) is the maintainer's loop; a site-builder stops at flag + report.

**This governs every conversion and overrides any instinct to hand-build or hand-patch.** The Site Converter
(capture service = URL/JS path **+** the **extension** = HTML/PHP path) is a *product* whose promise is: it
converts a source into a UnysonPlus site — **child theme, header, footer, and every section — with NO AI at
runtime.** So during a build the AI's job is NOT to produce a pretty page; it is to **make the deterministic
converter smarter until it produces that page itself.** Priority order of *why*:
1. **Save tokens** — the deterministic pass does the bulk once; the AI improves the algorithm once and every
   future site reuses it. Hand-matching a site property-by-property (what NOT to do) burns tokens that buy
   nothing for the next site.
2. **Marketability** — a converter that needs an AI to finish each site is not the product; one that converts
   perfectly on its own is. Every deterministic win is a selling point.

**The loop (per conversion):**
1. **Phase 1 — run the converter for EVERYTHING.** Capture service **and** the Site Converter extension on the
   captured markup → it scaffolds the **child theme**, **header**, **footer**, and **all sections**. That is the
   whole build; you do **not** hand-author the tree.
2. **AI review, REGION BY REGION, in order** (header → footer → each section top-to-bottom). For the current region:
   - **a. Measure** source vs the converter's output with the fidelity tools (computed-style + geometry + pixel).
   - **b. Classify** each diff: **deterministic** (a rule derivable from the captured markup/styles) or **AI-only**
     (needs judgment not present in the source).
   - **c. If deterministic → fix the CONVERTER algorithm** (JS `capture-extract`/`to-pages` **and** PHP
     `Mapper`/`Stitch`, kept in sync), then **re-run the converter for THAT region only** and re-measure.
     **Did the converter itself emit your fix?** No → refine and re-run. **Loop until the region PASSES.**
   - **d. If AI-only → report it to the user.** Look together for a deterministic rule; if one emerges, bake it in
     (back to c). If none emerges, **mark it a WAIVED "AI-only residual"** in the converter's known-limitations
     ledger and move on.
   - **e.** Advance to the next region only when it PASSES or is waived.
3. **NEVER hand-fix the converter's OUTPUT to pass a region** — no bespoke `misc_custom_css` patch, no manual
   preset tweak *to make this one site look right*. The output is disposable; the algorithm is the product. The
   test for an allowed fix: **does the NEXT site get it for free?** A framework/shortcode bug fix qualifies (e.g.
   the `:where()` button-preset override); a site-specific DB patch does not.

**Prerequisites & discipline:**
- **Per-region re-run** must exist (run just the header / footer / section N) so the verify loop is cheap;
  if it doesn't yet, adding it is the FIRST converter improvement.
- **Track every waiver** in an "AI-only residuals" ledger — honest marketing + a backlog of future determinism wins.
- **Verification stays deterministic** — the same measurement tools gate every region; "did the fix work" is objective.
- **Bootstrapping an already-hand-built site:** start the loop from a FRESH capture + scratch page and treat the
  hand-built version as the answer key (its DB patches do NOT count as converter progress).

### What a SITE-BUILDER flags (and how) — the report is the feedback, not a code fork

A site-builder agent does **not** edit the converter; it **flags systematic misses** so the maintainer can. The
one test: **"would fixing this help the NEXT site too?"** Yes → it's *systematic* → flag it. Only-this-site → fix
it locally (native options / `misc_custom_css`) and move on, don't flag.

- **DO flag** (source them from the **conversion report** — it already tags these): a `code_block` **fallback**
  where a real shortcode clearly fits (a pricing table → `pricing_table`, a steps list → `steps`, a testimonials
  grid mapped to plain columns); an **`opportunity`** row (a richer role detected but not mapped); a **styling
  drop** where a builder option/token exists to carry it; a **wrong mapping** (element → wrong shortcode); an
  **over-large / under-segmented** section. Rank by how often the miss recurs.
- **DON'T flag** (these are NOT converter bugs): a bespoke/interactive widget with no shortcode equivalent
  (correctly kept **verbatim** — e.g. a custom cupcake-builder); a one-off, site-specific delta; a subjective
  design-judgment call (an AI-only residual).
- **How — run `--share`; it submits to the Google Form (already wired, no setup).** `node capture.mjs <url>
  --share` sanitizes the conversion report to **structural-only** JSON (`to-share.mjs`) and POSTs it to the
  maintainer's Google Form (`share-config.json` → `.../formResponse`; intake `unysonplus@gmail.com`). Inspect
  first with `--share-preview` (writes `share-report.json`, sends nothing). **Always get the site owner's
  consent** before sharing a client site's report. **Anonymized structural data ONLY** — source *type*, the
  miss as `element → got vs. expected`, the report row, `systematic? y/n`; **no raw third-party content**.
  Full setup + field ids: the capture service's `docs/report-sharing.md`; the maintainer ranks submissions via
  `aggregate-reports.mjs`.

## The ordered major steps (do in THIS order)

| Phase | Do | Detail |
| --- | --- | --- |
| **0 · Setup** | Fresh WordPress ready; confirm conversion vs. fresh build (capture-first gate above); capture service ready; **Classic Editor installed+active *before* the UnysonPlus plugin**. | build-a-site.md |
| **1 · Capture/Convert** | **Conversion only** (fresh builds skip — nothing to convert). Run the **capture service** (`capture.mjs`, URL path) → design-config, pages.json, conversion-report — **the source of truth, never hand-measure**. *Maintainers* also run the Site Converter **extension** (PHP) + improve both paths in Phase 5 (site-builders just import). | Rule 0.5 |
| **2 · Design system** | *(Fresh builds start here.)* Apply the design tokens (captured for a conversion; chosen for the brief on a fresh build) → **Theme Settings** (colors, typography scale, container width, buttons, boxes, spacing). Verify *before* sections. | Rule 1 |
| **3 · Chrome** | Header + footer to **match the source exactly**, from Theme Settings + native elements. Lock first. | Rules 0, 2, 3 |
| **4 · Sections** | Region-by-region top-to-bottom from the **converter's section output**: decompose `code_block` fallbacks into shortcodes + Theme Settings (editable); keep bespoke pieces (custom shortcodes, Woo) hand-crafted; un-expressible decor → `code_block` + scoped child CSS (flag it). Don't advance until each matches. | Rule 4 |
| **5 · Report → improve** | Analyze the conversion-report; improve the converter (JS `to-pages`/`capture-extract` **and** PHP `Mapper`/`Stitch`, kept in sync) so next time has fewer fallbacks. Delete the analyzed capture. | — |
| **6 · Motion** | Add Animation Engine effects from `animations.json`. | build-a-site.md §4 |
| **7 · Ship gate** | a11y/SEO/perf; opens+editable in the builder; verify by looking; version bump; localhost mirror; demos-home card; **doc in the Dev Kit**. | Rule 4 + conventions |

**Cross-cutting rules (throughout):** capture-first (never guess) · framework options > child CSS
(child CSS only for genuine pixel tweaks/decor) · **flag anything that can't translate cleanly** ·
**fixing ≠ redesigning** ([conventions §0](conventions.md)) · don't over-replicate decorative
flourishes · keep it **editable/on-brand** (shortcodes, not raw HTML blobs) · doc everything + keep the
converter's JS↔PHP paths in sync.

## Rule 0 — The header and footer MUST look EXACTLY like the source

Non-negotiable, and first because it is the rule most often broken. A build is **not done** until its
**header and footer faithfully match the source**, verified by **looking at each region** (a
screenshot compared to the source), NOT by grepping the DOM for an element.

- **"Footer set" ≠ setting the copyright line.** The copyright bar is ONE small part. The footer is
  **not done** until the **widget columns** (`main_footer_columns`) are built to match the source —
  brand+social, link columns, contact, newsletter, whatever the source has. Setting only
  `copyright_settings` and calling the footer done is the **#1 recurring bug**. N columns in the
  source ⇒ N columns built, with `footer_background` (light vs dark) + optional `footer_border_top`
  matched too.
- **Header = the whole lockup.** The **logo** (icon + title + tagline as the source has it — via
  `header_logo` `logo_type=custom`, NOT a bare text logo), the exact **nav items**, AND the
  **right-side element** (CTA / cart / search). If the source has an announcement **topbar** or a
  store **cart icon**, build it.

## Rule 0.5 — Capture the source with the real tooling (don't hand-scrape)

Before extracting tokens/sections, capture the source with the established machinery, not an ad-hoc
`devtools.html` dump:

- **Capture service** (`UnysonPlus-Capture-Service/tools/design-capture`): `capture.mjs
  <url> [outdir]` renders the page and emits the **rendered DOM + computed styles**, screenshots, and
  a deterministic **conversion report** (`conversion-report.csv`/`.html`) tracing each source element →
  the shortcode it maps to (with `fallback` / `opportunity` / `styling drop` flags). Computed styles
  are what make color/type/spacing extraction exact — a static `view-source`/`devtools.html` has none.
- **Site Converter extension** (`site-converter`): the deterministic (no-AI) HTML→UnysonPlus converter
  — **file-upload path** in the plugin (`class-fw-site-converter-stitch.php` + `-mapper.php`, PHP),
  **URL path** in the capture service (`capture-extract.mjs` / `to-pages.mjs` / `to-design-config.mjs`,
  JS). Prefer it over hand-building for an existing site; keep the two implementations in sync when you
  change conversion logic, and feed the conversion report back into improving the mapper.
- Header/footer/nav are **chrome** handled by the generated theme, not page-builder content — the
  converter excludes them from body sections; you build them per Rules 2–3.
- **Match the source's icon by KIND — only font icons need translating.** Classify each source icon:
  - **Emoji** (🏠 📞 ⏰ 💤 🍰 🎀) → **reproduce the exact emoji character** verbatim (in the element's
    text / `text_content`). Trivially portable — NEVER swap an emoji for a font/SVG icon.
  - **Inline SVG** (commonly the open-source **lucide** set — `lucide-sparkles`, `lucide-star`,
    `lucide-heart`, `lucide-shopping-bag`…) → **copy the SVG markup as-is**, or reference the theme's
    lucide library (`logo_icon` `svg-id=>'lucide/<name>'`, the `[icon]`/icon option types). Also easy.
  - **Font icons** (Font Awesome `fas fa-…`, IcoMoon, a custom icon font) → **the ONLY case that needs
    swapping/translation**, because the source's icon *font* isn't present in the target. Map each to
    the nearest icon in the target's system (a lucide SVG, or an `icon-class` in a set the theme ships).
  - So: swap ⇒ font icons only. **Do not swap emoji→font-icon or SVG→emoji** — that mismatches the
    source (the recurring "Visiting Us used emoji, I used Font Awesome" miss). Carry animation classes
    too (a slow-spin sparkle → a CSS `@keyframes` spin, honoring `prefers-reduced-motion`).

## Rule 0.6 — Tailwind sources: DETECT first, then TRANSLATE the class list (don't eyeball computed styles)

Many modern sources (Wegic, Framer exports, most React/Next landing pages) are **Tailwind**. Reproducing
them by *glancing* at a button/card — or even by reading `getComputedStyle` **partially** — silently drops
styles: the `pinky-bites` primary button was `rounded-full font-bold text-lg shadow-lg` and the **`shadow-lg`
was missed** because the computed `box-shadow` was read truncated and the `class` attribute was never read.
The class names are the design-token source of truth; do not skip them.

1. **Detect Tailwind before capturing styles.** Signals: high utility-class density with Tailwind patterns
   (`flex items-center`, `px-8`, `py-4`, `gap-2`, `rounded-full`, `shadow-lg`, `text-lg`), **arbitrary values**
   in brackets (`bg-[#ff6b8b]`, `w-[420px]`), scale colors (`pink-200`, `pink-700`), or a Tailwind
   stylesheet/CDN/`tailwind.config`. If NOT Tailwind → capture full computed styles as normal.
2. **When Tailwind: capture each element's FULL `class` attribute** (never truncate) and **translate the
   utilities to CSS** — via a `tw-to-css` step (recommended lib: `tw-to-css`; alternatives `tailwindcss-to-css`,
   `tailwind-converter`) — then **cross-check against the element's full computed styles** (the lib only knows
   Tailwind's default config; arbitrary `[...]` values + the default scales are covered, a site's custom theme
   is not).
3. **Map Tailwind scale tokens → framework preset scales**, so intent survives (not just pixels):
   - `rounded-full` → Size Preset `border-radius: 9999px`; `rounded-lg` → the radius token.
   - `shadow-sm/md/lg/xl/2xl` → the Colour Preset **`box_shadow`** per state (Tailwind: `lg` = `0 10px 15px -3px
     rgb(0 0 0/.1)`, `md` = `0 4px 6px -1px …`, `xl` = `0 20px 25px -5px …`; `hover:shadow-xl` → the hover state).
   - `border-2` / `border` → `border_width` `2px` / `1px`; **no border class on a filled button → `border_style:
     none`** (the primary button's 0-width border). `border-pink-200` → `#fbcfe8`.
   - `px-8 py-4` → padding `32px 16px`; `text-lg` → font-size `18px` + line-height `28px`; `font-bold` → `700`;
     `gap-2` → `8px`; `text-white`/`text-pink-700` → `#fff`/`#be185d`.
   Set these through the **owning framework option** (Button Size/Colour Preset, typography token, column
   option) — NOT a per-section CSS patch. The button Colour Preset already exposes `border_width`,
   `border_style`, and `box_shadow` per state; there is nothing to add — just SET them.
4. **This belongs in the converter too (Phase 5):** the capture service should run the tw-translate step when
   Tailwind is detected and emit a per-element `{classes → resolved CSS + token intent}` map, so the build
   maps tokens to presets deterministically instead of by eye. Keep the JS (`capture-extract`) and PHP
   (`Mapper`) paths in sync.

## Rule 1 — Design system FIRST, in this order (never jump to sections)

Set the tokens/chrome before any page body. Split the setup by concern (colors → typography →
header/footer), the way the reference demos do (`<slug>-colors.php` / `-typography.php` /
`-header-footer.php`):

1. **Colors** — `theme_colors` presets (Primary/Secondary/Accent…) by name, to the source palette.
2. **Typography** — `typography`: `heading_font`, `body` (family/size/line-height/color), and the
   **per-heading overrides `h1`–`h6`** (size/line-height/letter-spacing/color) to the source's scale.
   See [theme-settings/typography.md](theme-settings/typography.md).
3. **Container width** — `general_layout.layout_container_width` (responsive `{base,md,lg}`) to the
   source's content max-width. Theme default `lg` is **1170px**; Tailwind `max-w-7xl` = **1280px**,
   `max-w-6xl` = 1152px. Skip this and every section is off by the difference — it is a token, not an
   afterthought. See [theme-settings/general.md](theme-settings/general.md).
4. **Header** — see Rule 2.
5. **Footer** — see Rule 3.
6. **THEN** the page sections. Not before.

## Rule 2 — Header value shapes

- **`header_logo`** — for an icon+title+tagline lockup, set `logo_type` (multi-picker):
  ```php
  $hl['logo_type'] = array(
    'logo_type' => 'custom', 'simple' => array(),
    'custom' => array(
      'site_title' => '…', 'title_weight' => '700', 'color' => array('predefined'=>'','custom'=>'#…'),
      'tagline_text' => '…', 'tagline_color' => array('predefined'=>'','custom'=>'#…'),
      'logo_layout' => 'stacked-left',   // inline-*/stacked-*/eyebrow-*/icon-only; stacked = tagline BELOW title
      'logo_icon' => array('type'=>'svg','svg-source'=>'library','svg-id'=>'lucide/<icon>'),
      'logo_icon_frame' => 'rounded',    // none/rounded/squircle/circle/square/hexagon (the "app-icon" tile)
      'logo_icon_color' => array('predefined'=>'','custom'=>'#…'),
      'logo_custom_css' => "…",          // brand polish: .site-logo__mark, .site-title-text, .site-logo__tagline
    ),
  );
  ```
  Also `update_option('blogname', …)` + `update_option('blogdescription', <tagline>)` (they sync).
  **Clear legacy flat logo keys first** (unset image/site_title/tagline/logo_icon/… on `$hl`).
  - **Logo mark = the source's real image, sideloaded (don't substitute a generic icon).** Matching the
    source means using its actual logo. The `custom` lockup's `logo_icon` takes an **SVG icon**, not a
    raster — so when the source logo is an image, **sideload that image** into the Media Library (same as
    all other media, per the media rule) and set it as the mark via **`logo_custom_css`**:
    `.site-logo__mark svg{display:none} .site-logo__mark{background:url('<sideloaded-url>') center/contain no-repeat;}`
    (match the source's frame — often none). It stays user-replaceable for the later rebrand. Only fall
    back to a generic lucide icon if the source has no logo image.

## Rule 1.6 — Media: sideload the source's REAL assets so the output matches

The converter exists to make the output the **same as the source** — so its media handling **sideloads
the source's actual assets** (logo, hero/section images, product photos, video, avatars) into the WP
**Media Library**, and references them as real, **user-replaceable** elements/options (never hot-linked,
never baked into CSS/markup as the only path). Pixel-parity now; the user swaps in their own brand media
later through the builder (that's the converter's promise — see [conventions.md](conventions.md) §4).
Do this for **every** image the source uses, the **logo included** — treating the logo differently from
the other media breaks "output = source".
- **`header_main`** — `main_left` / `main_center` / `main_right`, each an **addable-popup element
  list**: `array( array('element_type'=>array('element'=>'<type>', '<type>'=>array(...))) )`. Element
  types: `logo`, `menu_area` (`menu_location`=>'primary'), `cta_button`
  (`cta_text`/`cta_link`/`cta_style`/`cta_size`), `custom_html` (`custom_html_content` — **runs
  `do_shortcode()`**, so `[wc_mini_cart …]` / `[wc_cart_link …]` ride in here), `search`,
  `social_icons`, `text`, `snippet`.
- **Primary nav menu** — `wp_create_nav_menu` + `wp_update_nav_menu_item` (custom links to section
  anchors), then `set_theme_mod('nav_menu_locations', ['primary'=>$menu_id])`.
- **`header_menu`** — link color / hover / font-size. **`header_topbar`** — announcement strip (a
  `custom_html` element in `topbar_center`) when the source has one.

## Rule 3 — Footer value shapes

- **`main_footer_columns`** — ALWAYS set (even a no-widget footer sets `count=>'1'` with one empty
  col). For an N-column source footer:
  ```php
  fw_set_db_settings_option('main_footer_columns', array(
    'count' => '4',
    '4' => array(
      'main_footer_auto' => 'no',
      'main_footer_split' => array(  // widths sum to 100; brand col often wider
        array('w'=>40,'name'=>''), array('w'=>20,'name'=>''), array('w'=>20,'name'=>''), array('w'=>20,'name'=>''),
      ),
      'main_footer_col_1' => array($el($brand_html)),  // each col = element list; $el wraps one custom_html
      'main_footer_col_2' => array($el($links_html)),  // …col_3, col_4
    ),
  ));
  ```
  **Use the footer popup's NATIVE element types — do NOT `custom_html` everything.** Each column is an
  element list, and the popup provides `logo`/`footer_logo`, **`menu`** (a real WP menu → link
  columns), **`icon_text`** (icon + text + optional link → address / phone / hours / email lines),
  **`social_icons`** (from Theme Settings → Social), **`text`** (WYSIWYG → brand blurb / headings),
  `cta_button`, `search`, `widget_area`, `snippet`. Build each column from the RIGHT element: a link
  column → `menu`; a contact column → `icon_text` lines; social → `social_icons` (set the profiles in
  Theme Settings → Social); a brand blurb → `text`. Reserve **`custom_html`** for markup that has no
  native element (e.g. a newsletter form). Lumping every column into `custom_html` is a shortcut that
  loses the structured, editable elements — same anti-pattern as hardcoding CSS instead of presets.
  **Footer column titles = `<h2>` styled small via CSS** (heading-order rule — never a deeper tag).
- **`footer_background`** — full shape (`color`/`gradient`/`image`/`video`/`advanced`); match light vs
  dark. Optional **`footer_border_top`**.
- **`copyright_settings`** — multi-picker `enabled` → `yes` → `copyright_columns` (multi-picker
  `count`) → `'<n>'` → `copyright_col_1..n` (element lists). Include a design credit if the source was
  sampled (external link → `target="_blank" rel="noopener noreferrer"`). Its Custom Styling is
  `copyright_custom_styling`, **nested under `copyright_settings.yes`** (a separate section = separate
  styling block) — see the border sub-rule below.

### Rule 3.1 — Copyright columns auto-align by count (col1 left · col2 center · col3 right)

The **copyright bar auto-aligns its columns by count** — a framework default
(`unysonplus_copyright_auto_align_class()` in `footer-builder.php`) that mirrors the header's
left/center/right slots, so a copyright row "just works" with **no per-column control and no CSS**:

- **1 column → centered** (the overwhelming default `© …` line).
- **2 columns → left | right** (classic "© left · links right"; leave col 2 blank for a left-only line).
- **3+ columns → left | center… | right**.

**To override** the default for one column (rare), put a text-align utility on that element's
**`element_css_class`** — it's deeper in the DOM and still wins: `text-start` (force left), `text-center`,
`text-end` (theme ships Bootstrap). Same "use the slot's own option, not a stylesheet" principle as the
spacing utilities (`mt-4`, `pt-9`). **Design decision (why no per-column alignment dropdown):** ~95% of
copyright bars are exactly the count-based defaults, so a dropdown on every column is UI bloat; the
element CSS Class already covers the exceptions. Want a left-only single line? Use **2 columns, content
in col 1, col 2 blank** (col 1 = left) — no override needed.

> This auto-align applies to the **copyright bar only**. The main-footer **widget** columns keep their
> natural left alignment (widget columns don't center by count).

```php
// A centered © line needs NOTHING — 1 copyright column auto-centers:
'copyright_col_1' => array(
  array( 'element_type' => array( 'element' => 'text', 'text' => array( 'text_content' => $copy_html ) ) ),
),
// Override example (force a lone column left instead of centered):
//   ...'text'=>array(...) ), 'element_css_class' => 'text-start' ),
```

### Rule 3.2 — Capture dividers/borders too (Border Sides + extent), don't skip them

A source row often has a **top/bottom divider** (e.g. `border-t border-pink-200`). Reproduce it with the
section's **Custom Styling border**, not child CSS — the value shape (in `<prefix>_custom_styling.yes`):

```php
'<prefix>_border'        => array( 'width'=>array('value'=>'1','unit'=>'px'), 'style'=>'solid',
                                   'color'=>array('predefined'=>'','custom'=>'#fbcfe8') ),
'<prefix>_border_sides'  => array( 'top' ),               // any of top/right/bottom/left
'<prefix>_border_extent' => array( 'mode' => 'container' ), // full | container | custom (centered line)
'<prefix>_css_class'     => 'mt-5 pt-4',                   // the source's mt-12/pt-6 spacing, as utilities
```
`extent=container|custom` renders the top/bottom line as a **centered `::before`/`::after` pseudo-element**
capped at the container width (so the section's own `border-top` reads `0` — verify the **pseudo**, not
the element). A row's border is part of "match the source exactly" — the recurring miss is capturing the
text but not the hairline divider above it.

## Rule 4 — Regenerate + verify REGION-BY-REGION, iterating each until it matches

- After writing settings outside the normal save flow: call **`unysonplus_hf_regenerate_css()`** and
  clear the optimizer/generated caches (`uploads/**/asset-optimizer/*`, `unysonplus-generated.css`,
  `presets-*.css`, `unysonplus/css/*.css`).
- **Verify one region at a time, IN ORDER, and do not advance until the current region PASSES:**
  **header → footer → then each section top-to-bottom.** For the region you're on, run a tight
  **run `fidelity-check.mjs` → fix from the measured diff → re-run** loop and repeat *until it PASSES*
  (see [fidelity-verification.md](fidelity-verification.md) Rule 2.5 for the PASS definition + waiver
  rule) — then move to the next region. Do NOT fix scattershot across regions; finish the header before
  touching the footer, finish the footer before the first section, etc. (This ordering is deliberate:
  the header/footer are the chrome the whole site is judged by, so they get locked first.)
- **THREE levels of gate** (Rule 2.6): **Phase 3** — header PASSES, then footer PASSES (each its own
  gated region); **Phase 4** — every section PASSES before the next; **then an OVERALL FULL-PAGE PASS**
  on the assembled page before the ship gate (source `full.png` vs a full-page build shot, via
  `compare.mjs`) — it catches inter-section spacing/rhythm, cross-section drift, sticky-header overlap,
  and proportion that per-region checks can't. A per-region PASS does not imply a whole-page PASS.
- **Verification is visual and per-region — LOOK, don't grep.** Use a **region-cropped side-by-side**
  (source panel next to build panel) plus a pixel-mismatch score, not a full-page glance and not an
  element-presence grep. A grep that finds an element in the DOM is NOT verification — the recurring
  failures (empty footer, bare logo, mis-wrapped grid) all passed element-presence checks and still
  looked wrong. For each element (matched by text, not index) compare **font** (size/weight/color/
  family/position), the **box model** (padding, height, gap/spacing — the topbar-padding class of
  miss, and check vertical centering), and **icon fidelity** (a source inline `<svg>` vs an emoji/none
  stand-in), and list **missing** elements (badges, descriptions, ratings) the build dropped. **Drive
  every value from the source's computed styles / DOM — never eyeball or guess a number.**
  Approximating (an emoji for an icon, a guessed padding) is the root cause of recurring misses.
  Tooling: a semantic-region visual differ (side-by-side + pixelmatch %) and a text-keyed DOM diff that
  reports font + box-model + icon + missing/extra.

## Rule 5 — Store detection

Cart/basket buttons + per-item prices + a Shop/Menu nav ⇒ it's a **WooCommerce** store: activate the
`woocommerce` extension, create real products + a `wc_products` grid + `wc_mini_cart`/`wc_cart_link`
chrome. Don't build a store as static cards. See [extensions/woocommerce.md](extensions/woocommerce.md).

## The recurring-miss checklist (tick before declaring a site done)

- [ ] Header logo matches source (icon + title + tagline lockup, not bare text)
- [ ] Header nav items + right-side element (CTA/cart/search) match source
- [ ] Announcement topbar present if the source has one
- [ ] **One-page nav?** If the source nav is all `#anchor` links, Scroll Spy is ON (`nav_scrollspy`),
      sections carry matching CSS IDs, and the active item colors via Menu Hover/Active Color
- [ ] Nav link size/weight/color + active color set in **Header → Menu** (not child CSS); logo frame
      (incl. `logo_icon_frame_bg` tile fill) matches the source's logo mark
- [ ] **Footer widget columns built** (not just the copyright line)
- [ ] Footer background/border match source (light vs dark)
- [ ] **Row/column alignment matches source** (col1 left · col2 center · col3 right; a lone centered
      copyright = `text-center`) — set via each element's CSS Class + a text-align utility (Rule 3.1)
- [ ] **Dividers/hairline borders captured** (e.g. copyright `border-t`) via Custom Styling Border
      Sides + extent — not skipped, not child CSS (Rule 3.2)
- [ ] Container width set to the source's max-width
- [ ] Colors + typography (incl. per-heading scale) set as Theme Settings
- [ ] Each region screenshotted and compared to the source — by looking, not grepping
- [ ] `unysonplus_hf_regenerate_css()` called + caches cleared
- [ ] (Distributable child theme) version bumped; (demo) demos-home card added
