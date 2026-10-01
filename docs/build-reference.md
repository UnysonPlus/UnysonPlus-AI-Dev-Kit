<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Build reference — value shapes, translation tables, known misses

> **This is REFERENCE, not authority.** The single protocol — the phases, the gates, the order of work —
> is [`site-build-protocol.md`](site-build-protocol.md). Nothing here overrides it; look things up here
> when the protocol sends you.
>
> Merged into this file: the value-shape rules formerly in the protocol (Rules 0.1-5), plus the former
> `design-parity-checklist`, `fidelity-verification` and `build-a-site` docs, which used to state their
> own competing verification doctrine. Their factual content is preserved verbatim below; their claims to
> be "the" gate are not -- that was the source of a direct contradiction (one doc forbade looking at a
> screenshot without permission while another required opening every band image).

---

## Part 1 — Chrome, capture, translation and value shapes


## Rule 0.1 — The header and footer MUST look EXACTLY like the source

Non-negotiable, and near-first because it is the rule most often broken (numbered 0.1 to sit alongside
Rule 0 / 0.5 / 0.6 — it is not a second "Rule 0"). A build is **not done** until its **header and footer
faithfully match the source**. For a **conversion** the chrome is emitted by the converter's theme
generator and its class→option translation, and the residual check is the class-string fixture; for a
**fresh build** verify each region by comparison against the mockup. Either way, confirm at the region
level (a side-by-side, not a DOM grep for an element).

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

- **Capture service** (`assembled/UnysonPlus-Capture-Service/tools/design-capture`): `capture.mjs
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

Many modern sources (a second AI-page generator, Framer exports, most React/Next landing pages) are **Tailwind**. Reproducing
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

## Rule 2.5 — Media: sideload the source's REAL assets so the output matches

The converter exists to make the output the **same as the source** — so its media handling **sideloads
the source's actual assets** (logo, hero/section images, product photos, video, avatars) into the WP
**Media Library**, and references them as real, **user-replaceable** elements/options (never hot-linked,
never baked into CSS/markup as the only path). Pixel-parity now; the user swaps in their own brand media
later through the builder (that's the converter's promise — see [conventions.md](conventions.md) §4).
Do this for **every** image the source uses, the **logo included** — treating the logo differently from
the other media breaks "output = source".

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

> **A PASS from a lens is a hypothesis, not a verdict — see `AGENTS.md` → "The tool must agree with your
> own eyes — or the TOOL is the bug".** Before you accept any region as done, LOOK at it. A box metric
> (height, container width, section count) can match perfectly while the type inside is wrong; a pixel
> diff over a thin band of flat fill is dominated by the background and cannot see its content. If you
> can see a difference the lens does not report, the lens is the defect — fix it in the SAME pass, with a
> golden that includes a NEGATIVE proving it can still fail on the thing it exists to catch.

- After writing settings outside the normal save flow: call **`unysonplus_hf_regenerate_css()`** and
  clear the optimizer/generated caches (`uploads/**/asset-optimizer/*`, `unysonplus-generated.css`,
  `presets-*.css`, `unysonplus/css/*.css`).
- **Verify one region at a time, IN ORDER, and do not advance until the current region PASSES:**
  **header → footer → then each section top-to-bottom.** For the region you're on, run a tight
  **run `fidelity-check.mjs` → fix from the measured diff → re-run** loop and repeat *until it PASSES*
  (see [build-reference.md](build-reference.md) Rule 2.5 for the PASS definition + waiver
  rule) — then move to the next region. Do NOT fix scattershot across regions; finish the header before
  touching the footer, finish the footer before the first section, etc. (This ordering is deliberate:
  the header/footer are the chrome the whole site is judged by, so they get locked first.)
- **THREE levels of gate** (Rule 2.6): **Phase 3** — header PASSES, then footer PASSES (each its own
  gated region); **Phase 4** — every section PASSES before the next; **then an OVERALL FULL-PAGE PASS**
  on the assembled page before the ship gate (source `full.png` vs a full-page build shot, via
  `compare.mjs`) — it catches inter-section spacing/rhythm, cross-section drift, sticky-header overlap,
  and proportion that per-region checks can't. A per-region PASS does not imply a whole-page PASS.
- **Where a wrong value comes from — the two modes (this is the crux; do NOT conflate them):**
  - **CONVERSION (a source exists): the value already exists as a captured Tailwind class / computed
    style. NEVER measure the render to hand-tune it.** Every value is produced by **translating the
    source's class list (Rule 0.6)** into native options. If fidelity-check flags a box-model/spacing/type
    miss, the cause is a **skipped or partial Tailwind translation** — so **FIX THE CONVERTER'S
    class→value translation** and **prove the fix with the browser-free class-string fixture**
    (`tailwind-matrix.test.mjs`: `py-10` → `40px`, `max-w-3xl` → `48rem`), no browser. The rendered lenses
    only *confirm* that the translated options assembled correctly; they are not where a value is derived.
    If you find yourself reading a computed number off the source to type into an option, STOP — you
    skipped the translation (Rule 0) and are re-deriving a value the class already encodes.
  - **FROM-SCRATCH (no source): drive every value from your measured mockup / chosen spec — measuring is
    legitimate here** (there is no class to translate). Never eyeball or guess a number; measure it.
- **Either mode — LOOK per region, don't grep.** A grep that finds an element in the DOM is NOT
  verification — the recurring failures (empty footer, bare logo, mis-wrapped grid) all passed
  element-presence checks and still looked wrong. Use a **region-cropped side-by-side** + pixel-mismatch
  score; for each element (matched by text) compare font, box model, icon fidelity, and list **missing**
  elements the build dropped. (For a conversion, a flagged miss routes back to the converter per the
  first bullet; it is never a licence to hand-measure-and-patch.)

## Rule 5 — Store detection

Cart/basket buttons + per-item prices + a Shop/Menu nav ⇒ it's a **WooCommerce** store: activate the
`woocommerce` extension, create real products + a `wc_products` grid + `wc_mini_cart`/`wc_cart_link`
chrome. Don't build a store as static cards. See [extensions/woocommerce.md](extensions/woocommerce.md).

## The recurring-miss checklist (tick before declaring a site done)

> **Scope: this is the CHROME + whole-site SHIP checklist.** It is **not** the section-build list — for
> each section you run **[THE PER-SECTION CHECKLIST](#-the-per-section-checklist--run-all-of-these-for-every-section-the-authoritative-gate)**
> (the authoritative per-section gate). The two are complementary, not competing: the per-section checklist
> gates each section as you build; this one is the final header/footer/whole-site pass. (The other lists in
> the kit — the "ordered major steps" phase table above, and `build-reference.md` — are the same
> discipline at a coarser grain; where any differ, the per-section checklist + this ship checklist win.)

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


---

## Part 2 — Fresh builds (nothing to reproduce)


## The order that works (tokens → chrome → pages → motion → verify)

Build **top-down and incrementally**, verifying each layer before the next. Doing it big-bang is how
sites come out wrong; component-by-component they come out right.

### 1. Establish the brand in Theme Settings first
Before any page, set the **design tokens** so every element can consume them
([conventions](conventions.md) §1):
- **Colors** → define the palette in Theme Settings → Colors (these become the preset choices).
- **Typography** → base font families/sizes/scale.
- **Buttons, boxes/cards, spacing** → the presets elements will reference.
See `docs/theme-settings/` for every tab's options and choices.

### 2. Lock the chrome (header / footer / container)
Header, footer, and the container width are **theme chrome**, not page-builder content. Set them from
Theme Settings (and the header/footer builder) and get them ~right before building bodies — the child-
theme starter ships polished chrome so this is mostly tuning. **On a fresh build, measure your mockup
rather than eyeballing** (`tools/measure/`). *(If a source **exists**, you're converting — don't measure
it; translate its captured classes via the converter. See the gate at the top of this file.)*

> **When reproducing a source, the header and footer must match it EXACTLY** (applies to any site —
> demo, test, or live):
> - **Footer = widget columns, not just the copyright line.** Setting only the copyright bar and
>   calling the footer done is the single most common miss. If the source footer has N columns
>   (brand+social / links / contact / newsletter…), build **N columns** (`main_footer_columns`), plus
>   `footer_background` (light vs dark) to match. Footer column titles are `<h2>` styled small (never a
>   deeper tag to look small).
> - **Header = the whole lockup:** the logo (icon + title + tagline as the source has it, via
>   `header_logo` `logo_type=custom` — not a bare text logo), the exact nav items, AND the right-side
>   element (CTA / cart / search), plus an announcement topbar if the source has one.

> **Match the container width to the source — it's a first-class token, not an afterthought.** If a
> reference exists, read its content container's max-width and set **Theme Settings → General → Layout →
> Container Width** (`general_layout.layout_container_width`, responsive `{base,md,lg}`) to it *before*
> building sections. The theme default desktop width is **1170px**; a Tailwind mockup's `max-w-7xl` is
> **1280px**, `max-w-6xl` is 1152px, etc. Skip this and *every* section is off by the difference and no
> amount of per-section CSS lines it up. This is the single most common "why doesn't it match" cause.

### 3. Compose each page, section by section
Use [building-pages.md](building-pages.md) — `upw_build_page()` with a sections/columns/elements tree.
For each section:
- Pick the right **shortcode** for the role (see `docs/shortcodes/`). A hero → `special_heading` +
  `button`s; a feature grid → columns of `icon_box`; stats → `1_5` columns of `counter` + label; etc.
- Keep media **replaceable** ([conventions](conventions.md) §4) — real elements/options, not baked-in
  markup.
- Respect **heading order** and **link** rules ([conventions](conventions.md) §3) as you go.
Verify the page renders after each page (or each major section), then move on.

### 4. Layer in motion (Animation Engine)
Add effects **after** the layout reads correctly, so motion enhances a working page rather than hiding
a broken one. Effects are per-element atts on the same tree:
- **Entrance / scroll reveal** → `gsap_motion`, `scroll_reveal`.
- **Keyframed movement over scroll** → `scroll_keyframes` (`upw_skf()` — the builder's mini motion
  timeline; Start / optional Middle / End with easing).
- **Section-level** → backgrounds, sticky stacks, horizontal scroll, scrollytelling, scroll color
  shift; **site-wide** → smooth scroll, cursor, page transitions, scroll progress, preloader.
See `docs/animation-engine/` for each module's options and the effect att shapes; dump exact shapes
with `upw_effect_defaults()`. Keep motion tasteful and honor reduced-motion (the engine does by
default).

### 5. Verify (the ship gate)
Before calling it done ([conventions](conventions.md) §7):
- Front end renders, effects animate, **no console errors / PHP notices**.
- **Heading outline** descends without gaps; links are descriptive; **contrast ≥ 4.5:1**; images have
  `alt`; structured data where relevant.
- Every page opens in the **visual builder** and every image/text is **replaceable**.

## Mapping a prompt to a build

| The prompt says… | Do this |
| --- | --- |
| A brand/industry ("law firm", "SaaS", "cafe") | Pick palette + type that fit; set them as Theme Settings tokens first. |
| "Like &lt;some site&gt;" / a screenshot / a template / an HTML dump | **This is a CONVERSION, not a fresh build — a source exists.** Run the capture/Site Converter pipeline and follow [`site-build-protocol.md`](site-build-protocol.md); the converter **translates** the source's captured classes → Theme Settings presets + native options deterministically. Don't hand-extract/measure tokens — that re-derives values the classes already encode (Rule 0). |
| A **store** — "Add to Cart"/"Basket" buttons, per-item **prices**, a Shop/Menu nav, product cards | It's an e-commerce site: build it on **WooCommerce**, not static cards. Activate the `woocommerce` extension, create real products, and use the `wc_products` grid + `wc_mini_cart` / `wc_cart_link` chrome. Detecting these cues early avoids rebuilding a "brochure" into a store later. See [extensions/woocommerce.md](extensions/woocommerce.md). |
| Specific pages ("home, about, pricing, contact") | One `upw_build_page()` per page; reuse section patterns across them. |
| "Animated" / "modern motion" | Add engine effects in step 4 — start with entrance + a scroll-keyframed hero, add section-level motion where it earns its place. |

## Guardrails

- **Incremental, verify each step** — never big-bang a whole site; build → verify → next.
- **Consume, don't hardcode** — if you're writing child-theme CSS for something Theme Settings could
  own, add/extend the option and use the preset instead ([conventions](conventions.md) §1).
- **Ask before destructive or outward-facing actions** — overwriting hand-edited pages, pushing to
  production, etc. Local builds and test pages are fine to iterate on freely.
- **Convert, don't recreate** — for an existing site, the Site Converter / capture pipeline is the
  right tool; this workflow is for building fresh.


---

## Part 3 — Parity metrics and the measurement algorithm


## The algorithm

1. Render **mockup** and **dev** at the **same width** (default 1440; also check 768 tablet).
2. Extract a fixed metric set from each DOM (below).
3. Diff dev − mockup; **fail** anything outside tolerance.
4. Fix fails, re-run. Don't advance a phase while its metrics fail.

Run it:

```
node tools/measure/measure.mjs "file:///<abs-path-to>/mockup/index.html" "http://localhost/<site>/" --width 1440
```

The selector map in `measure.mjs` (`METRICS`) is editable per project — tune the
mockup/dev selectors so each metric resolves on both sides.

## Metric set (default)

| Metric | Tolerance | Why |
|---|---|---|
| `container_maxwidth` | ±4px | The single most important frame number. Wrong here and everything drifts. |
| `header_height` | ±3px | Chrome must be locked first. |
| `logo_width` / `logo_height` | ±4px | The recurring miss — measure the **visible glyph**, not the PNG box. |
| `footer_height` | ±8px | Structure, looser tol (content varies). |
| `h1_fontsize` | ±2px | Type scale anchor. |
| `body_fontsize` | ±1px | Base rhythm. |

Extend per project: section padding T/B, row gaps, sidebar width, button height,
key colors (compare computed `color`/`background-color`).

## Region-by-region parity — the ENSEMBLE (`compare.mjs`)

`measure.mjs` gates the *frame* (7 numbers). `compare.mjs` compares the page **one region at a
time, matched by role and order** — header ↔ header, section 1 ↔ section 1, … , footer ↔ footer —
using **four independent signals**, aggregated **fail-loud** (a region PASSes only if *every*
signal passes). No single tool is enough; each catches a different failure class:

```
npm i    # in tools/measure — installs playwright, pixelmatch, pngjs, resemblejs
node tools/measure/compare.mjs "<mockup>" "<dev-url>" --width 1440 --out ./parity
```

| Signal | Engine | Catches | Blind spot |
|---|---|---|---|
| **GEOMETRY** | built-in | too tall / short / **missing / extra** bands; section count | content-blind (an *empty* header passes on height alone) |
| **PIXEL** | **pixelmatch** | visual/layout/color diffs (+ a pink diff PNG per region) | **video/animation** (a screenshot catches a different frame) |
| **PERCEPTUAL** | **Resemble.js** | mismatch %, anti-alias tolerant (second opinion + diff PNG) | same video noise |
| **STRUCTURE** | DOM diff | **missing/extra links, buttons, icons**; missing text tokens | counts, not looks — can't judge finish/spacing |

**STRUCTURE is the one that can't be fooled** — it's why "header: 1 link vs the mockup's 7"
hard-FAILs where pixel-only tools (and my earlier SSIM) wrongly passed it.

**Two limits baked into the tool — know them:**
- **Reference fidelity (use the LIVE source URL).** Pixel/perceptual are only as good as how
  faithfully the reference renders. A saved mockup HTML that hot-links a hero `<video src="/…">`
  or CDN icons won't render them offline → false diffs. Prefer the **live source URL** (or serve
  the mockup folder over http). `compare.mjs` is **video-aware**: a region that contains a
  `<video>` or is a transparent overlay while the page has video is marked **`vid`** and pixel/
  perceptual are **skipped** (geometry + structure decide) — so a correct video hero isn't
  red-flagged for frame timing.
- **Section matching is by INDEX.** "Your section *i*" is compared to "mockup band *i*". If the
  source's DOM bands don't segment 1:1 with your page-builder sections, structure counts (esp.
  icons/images) can drift. Trust the **body-section count** line + eyeball the per-region diff
  PNGs before acting on a lone structural delta.

Optional heavier alternative: **BackstopJS** (per-selector scenarios + HTML before/after/diff
report) — same pixel engine, nicer report, its own browser stack. Reach for it when you want the
report; `compare.mjs` is the zero-config default.

## Full-body PROPERTY diff (`props.mjs`)

The deepest check — and the one that catches what pixels and eyeballs miss. It walks both bodies,
captures each element's **computed style + geometry**, and reports **named property deltas**:

```
node tools/measure/props.mjs "<mockup>" "<dev-url>" --width 1440 --out ./parity
```

Two matchers (the DOMs differ, so no 1:1 tree diff):
- **Container** — per region, diff the region element's own box/background/border/padding.
- **Text-anchored** — match elements by their visible **text** (identical across source and a
  faithful rebuild), then diff typography/colour. Output reads `"get started now" font-size: mock
  16px → dev 20px` — located to the text you can see, with the exact property.

It reported *"every element `font-family: Inter → Open Sans`"* on this project — a **site-wide wrong
typeface** the frame metrics, the pixel ensemble, and manual review all sailed past. That's the
point of it: **it compares values, not counts or pixels.** Reads a `props-diff.json` to `--out`.

Noise control built in: `text-align: start ≡ left`, px tolerance ±1.5, border-colour skipped when
the border width is 0. Known false positive: **padding on an inner container vs the section
element** reads as a delta though it's visually equivalent — cross-check with `container_maxwidth`.
Use the **live source URL** so the reference's computed styles are real.

## Manual checklist (per section, in build order)

**Container / chrome (Phase 1 — must pass before sections):**
- [ ] container max-width matches (±4px)
- [ ] header height, background, border/shadow match
- [ ] logo size correct — small, even top/bottom gap; measure the glyph
- [ ] nav alignment + item style (plain/pill/underline) match
- [ ] footer columns/ratio, background, border, padding match
- [ ] copyright row matches

**Sections (Phase 2):**
- [ ] one section per mockup band, correct order
- [ ] section padding T/B within tolerance
- [ ] column widths + gaps match the mockup grid

**Elements (Phase 3):**
- [ ] simple elements placed; hard ones as `code_block` placeholders
- [ ] element typography/spacing polished last

## Logo sizing (the specific fix)

The logo reads "small" when sized by a guessed px or when the PNG has transparent
padding. Correct procedure:
1. Measure the **plaque/inner container** height.
2. Measure the logo's **visible glyph** bounds (trim transparent padding — inspect the
   rendered image, not the file's box).
3. Target: glyph fills the plaque minus a **small, equal** top/bottom gap (≈8–12% each).
4. Prefer the native `logo_type[simple][width]` option; use CSS only for the plaque
   overhang (which has no option — an enhancement candidate).
5. Re-measure `logo_width`/`logo_height` to tolerance.


---

## Part 4 — Lens discipline (what each lens can and cannot see)


## Rule 1 — Capture-first: build to a measured SPEC, never a screenshot

Before building a region, **capture the source's real values** and build to them. A screenshot has no
font sizes, weights, colors, or the exact text/emoji — so building from one is guessing.

- Run the **capture service** (`capture.mjs <url>` in `assembled/UnysonPlus-Capture-Service/tools/design-capture`) — it extracts per-region
  **computed styles** (`fontFamily`/`fontSize`/`fontWeight`/`color`/`textTransform`), bounding boxes,
  and the rendered text (emoji included), plus a design config and conversion report. Or capture
  ad-hoc with Playwright `getComputedStyle`.
- The output is the **build spec**: for each text node, `{ text (incl. emoji), fontSize, fontWeight,
  color, fontFamily, textTransform, bbox, iconKind }`. Reproduce those exactly.
- **Icons by kind** (see [site-build-protocol.md](site-build-protocol.md) Rule 0.5): **emoji →
  reproduce the character verbatim; inline SVG → copy the markup / map to lucide; font-icon → the ONLY
  kind that needs swapping** to the target's icon system. Don't swap emoji↔font-icon.

## Rule 2 — Verify with FOUR independent lenses (per region, before advancing)

No single lens is sufficient — each catches a different class of miss:

1. **DOM computed-style diff** — match elements by **text** (not index) and compare `fontSize`,
   `fontWeight`, `color`, `fontFamily`, **`textTransform`**, box **SHAPE** (square / rounded / pill /
   circle, classified from `border-radius` vs the box's short side), and the **exact text/emoji**. Catches
   "18px vs 13px", "title-case vs uppercase", **"pill vs rounded-rect"** (a badge/button whose corners are
   too square), "emoji vs FA icon", wrong color/font, and **missing** elements (a badge/description/rating
   the build dropped). *This is the lens that would have caught the footer titles + emoji + the pill badge.*
2. **Geometry / layout diff** — compare **bounding boxes**: element x-positions, **column widths**,
   spacing/padding, and **overlap** (siblings whose boxes intersect). Catches the column-overlap and
   spacing/padding misses that typography checks miss.
3. **Pixel diff** — region-anchored `pixelmatch`/`resemble` side-by-side + mismatch %, cropping each
   logical region by its own bounds (robust to different page heights). Catches "does it *look* the
   same" — decorative details the DOM diff can't express.
4. **Vertical-spacing diff (Lens 4)** — the gaps between stacked rows and a block's bottom margin
   (overline→title→subtitle rhythm; heading-block→next-element gap), ranked biggest-delta-first.
   Vertical rhythm is the **most-visible dimension and the one x-position/typography checks are blind
   to** — the recurring "spacing is off / the gap below the heading collapsed" miss. **`fidelity-check.mjs`'s
   exit code is driven by this lens**, so it is not optional.

**Gate:** advance to the next region only when all FOUR pass for the current one. Grep/element-presence
is NOT a lens — every recurring failure passed a presence check and still looked wrong.

## Rule 2.5 — RUN the tools and LOOP until PASS (hard gate — this is a test, not a glance)

Treat each region as a **test that must go green**. You do not "eyeball and move on"; you **run the
comparison tools, read the result, fix, and re-run — repeating until it PASSES.** No region advances on
a red result.

**The loop (per region):**
```
run fidelity-check.mjs (source vs build)  →  PASS?  ── yes ──▶ advance
        ▲                                     │
        └────────── fix from the measured diff ── no ──┘   (re-run; repeat)
```

**"PASS" is defined — not a vibe:**
- **Lens 1 (content/type):** every source element has a matching build element — **zero unexplained
  MISSING/EXTRA** — and **no material property diff left** (size / weight / color / font / text-transform /
  text-decoration / animation / **icon-kind**). "Material" = a human would notice.
- **Lens 2 (geometry):** **no sibling overlaps**, and column x-starts aligned within tolerance.
- **Lens 3 (pixel):** mismatch under the region's target (**≈ ≤8%** for normal content regions; a
  photo-heavy or full-bleed section runs higher because the box framing inflates it — judge the *content*,
  not the frame).
- **Lens 4 (vertical spacing):** the per-row gaps (overline→title→subtitle) **and the block's gap-to-next**
  match the source within **~4px** — no oversized or collapsed gap. This is the tool's exit driver; an
  un-waived spacing delta is a FAIL (it's the miss that keeps slipping through the other lenses).

**Every residual diff must be one of two things — fixed, or a JUSTIFIED WAIVER you write down:**
a decorative flourish you deliberately skipped ("dashed halo — out of scope"), or a known tool artifact
("WP rewrote the emoji to `<img class=emoji>`, so Lens 1 reads icon-kind emoji→none — visually present").
An un-waived red item is a FAIL — fix it. Silence is not a pass.

**Run more than one tool when the region warrants it:** `fidelity-check.mjs` per region always;
`compare.mjs` (geometry + pixel + perceptual + structure ensemble) for a second opinion on a stubborn
region; `contrast.mjs` / the capture **contrast-review** before the ship gate. The region is done only
when the tools are green (or every residual is a written waiver) — **not** when the build "looks right."

## Rule 2.6 — Three levels of gate: each region, AND the whole page at the end

The loop above runs at **two** granularities, and neither replaces the other:

1. **Per-region gate (during the build).** **Phase 3:** the **header** and the **footer** are each their
   own gated region — header PASSES, then footer PASSES. **Phase 4:** **every section** is its own gated
   region — it PASSES before you build the next one.
2. **Overall full-page gate (after ALL sections).** Once every region is green, run **one final pass on
   the ASSEMBLED page** — the whole thing, source vs build — before the ship gate. Compare the **full-page
   screenshot** (the capture's `full.png` vs a full-page shot of your build) with `compare.mjs` /
   pixel+perceptual, and scan for what only shows when assembled: **inter-section spacing & rhythm**,
   **cross-section consistency** (a heading size / brand color that drifted between sections), the
   **sticky header overlapping** the first section, overall **page height / proportion**, and any z-index
   or full-width bleed that a cropped region hid. A per-region PASS does **not** imply a whole-page PASS —
   the wall can be crooked even when every brick is square. Same rule: loop until PASS or written waiver.

## Rule 2.7 — Capture the FULL computed-style set, and TRANSCRIBE the source's values (don't guess)

The compounding failure this session: eyeballing a button as "close enough" and, when I finally measured,
capturing only a **partial** property set (font + color) — so the real misses (pill vs rounded-rect radius,
chunky vs thin padding, dark vs white text) survived pass after pass. Two hard rules:

1. **Measure the FULL property set for any styled/interactive element** (button, badge/pill, card, input,
   icon), not just typography. At minimum, per element, diff: `backgroundColor`, `color`, `padding`,
   `borderRadius`, `borderWidth`, `borderColor`, `boxShadow`, `fontSize`, `fontWeight`, `fontFamily`,
   `letterSpacing`, `lineHeight`, `textTransform`, and — for icon buttons — the **child icon's** `width`/
   `height` and the **gap** between text and icon. Print a **property × {source, build, match?}** table and
   fix every non-trivial DIFF. A partial capture reads "ok" while the element is visibly wrong.
2. **Transcribe the SOURCE's measured value — never invent one.** Select the source's actual element
   (the real `<a>`/`<button>`/`<img>`, matched by text/role), read its computed value, and set the build to
   **that exact number** — through the framework option that OWNS the property (a **Button Size/Color
   Preset**, a **column option**, a **typography token**), not a per-section CSS patch. E.g. source button
   = `border-radius: 9999px; padding: 16px 32px; color: #fff` → set the Size Preset to those values, not a
   guessed "looks chunky." Applies to sizes too: the hero image was `object-cover w-[420px]` → set the build
   image to **420px**, not "smaller-ish."
3. **Row/column vertical alignment is a measurable property.** For a two-column row (text + media), compute
   each column's **vertical center** (`(top+bottom)/2`) and diff them — a large offset means the media is
   top-pinned, not centered. Fix with the **column's own vertical-align / content-position option**, not a
   `margin-top` nudge. (Here: source image-vs-text center offset was −24px; the build was −97px until the
   media column's vertical centering was set.)

**Why partial capture is dangerous:** the same element can pass a font/color check and still be the wrong
*shape* (radius), *weight* (padding/height), or *ink* (a base `.btn{color:inherit}` overriding a preset on
load order). If you can measure a property, you have no excuse to guess it.

## Rule 2.8 — A FIX is not done until you re-measure it against the source (post-fix comparison pass)

**Applying a change is not fixing it. Confirming it now matches the source is.** After every fix —
especially a reactive one to a reported issue — **re-run the DOM computed-style + geometry diff against
the source for the element(s) you touched, and only declare it done when the numbers match.** "I added
the CSS / it looks better in a screenshot" is not evidence; a re-measured `demo == source` is.

- Do the pass **before saying "fixed"**, every time — this is the step that keeps a user from having to
  tell you the same design is still wrong. A fix that "looks close" routinely lands 40px off (title→sub
  gap) or 0px where it needs 64 (block→card), and only a re-measure catches it.
- Re-measure the **exact properties + gaps** that were wrong, not just "does it render". For a heading
  block that means: overline→title gap, title→subtitle gap, block→next-element gap, and each element's
  `fontSize`/`fontWeight`/`letterSpacing`/`color` — vs the source/replica.
- If a margin/gap "didn't take", it's usually applied to the wrong node — the special-heading and the
  next element are **separate wrapper siblings**, so the gap goes on the sibling (`.cupcake-builder`
  `margin-top`), not inside `.heading`. Re-measuring is how you find that; eyeballing is how you miss it.
- Batch fixes → **one comparison pass over all of them** at the end, then report only what the numbers confirm.

## Rule 2.9 — Verification discipline: distrust your OWN probes (a "not found" is a suspect, not a fact)

The rules above assume your *measurement* is trustworthy. The most dangerous failure isn't a wrong build —
it's a wrong **check** that reports a false negative with false confidence. A hand-written one-off
`page.evaluate` that filters too narrowly, or returns the FIRST match and stops, will say "no pattern /
no border / not there" — which really means *"my throwaway script didn't find one."* Reported as fact
("I checked, it's not there"), that manufactures confidence and sends the whole task down a wrong path.
(Real case: a probe declared a CTA section "just a gradient, no pattern" — it had filtered for the wrong
thing and early-returned before reaching the pattern div; the converter's `findPattern` had seen it the
whole time.)

- **Verify against the ACTUAL detector code, not a re-implementation.** To confirm what the converter sees,
  *run the real function* (`findPattern`, `build_box_presets`, `backgroundPatterns`, the tailwind fixture) —
  don't re-code the detection in a probe that can silently drift from it.
- **A negative is a suspect, not ground truth.** If a probe says "not there", assume the PROBE is wrong
  until confirmed by the real detector OR a second, independent method. Never report a negative as a fact
  on one narrow query.
- **Probes collect EXHAUSTIVELY — never first-match-and-return.** Gather all candidates and report the set;
  an early `return` is how the pattern div got skipped.
- **When something "isn't showing", trace build → import → render**, not just the first layer. The
  background pattern was *detected and applied* yet invisible — the data URL was silently dropped between
  `pages.json` and the rendered HTML by a `url("…")` double-quote inside a double-quoted `style="…"`. Only
  tracing each layer (with temporary logging) found it; checking the render alone would have "confirmed" it
  was never applied.
- **Visual claims go through the cache-busted `section-audit.mjs`** (which disables HTTP cache), not a
  bespoke DOM query — and remember the generated child-theme CSS caches under a stable URL, so a stale
  stylesheet reads as "no improvement" (hard-refresh / cache-disable before judging).
- **State your confidence explicitly** in the report: *verified by running the real detector* vs *verified
  by a probe* vs *code-logic only, needs a live run*. Don't let "should work" read as "works".

## Rule 3 — The order (ties into the region loop)

Header → Footer → sections top-to-bottom (see the protocol's region-loop). For **each** region:
`capture source spec → build to spec → run the 4 lenses → fix from measured values → re-run → advance`
(from-scratch path; on a conversion the primary loop is `translate captured class → run the class-string
fixture → fix the converter → re-run`, with the lenses as the assembly check).

## Rule 3.5 — You MUST diff against the SOURCE, per region — NEVER "verify" against memory

The single failure this whole doc exists to prevent: declaring a region done after looking at **your
build alone** and comparing it to what you *remember* the source looking like. That is not verification —
it is guessing, and it silently misses whole elements. (Real miss: the header was "verified" from a
build-only screenshot and shipped **without the source's announcement topbar** — a full band of content —
because the source was never captured for a side-by-side.)

- **Capture the SOURCE every time.** Screenshot the source region (or run `fidelity-check.mjs`, which
  captures BOTH source and build) and put the two **side-by-side**. If you did not open the source in
  this verification pass, you did not verify.
- **The header and footer are REGIONS** — run the checker on them exactly like body sections. Chrome is
  where the recurring misses hide: a topbar, a right-side cart button treatment, a widget column.
- **Run the tool, don't just eyeball.** `node tools/measure/fidelity-check.mjs <srcUrl> <sel> <buildUrl>
  <sel>` for each region. Lens 1 lists **missing/extra elements** (it would have printed the topbar as
  MISSING); Lens 2 catches geometry; Lens 3 gives the pixel-mismatch %. A region is done only when its
  lenses pass — not when your build "looks right" on its own.
- **Also confirm webfonts actually LOADED**, not just declared. `getComputedStyle().fontFamily` shows the
  *declared* stack even when the font never downloaded — check `document.fonts.check('700 20px <Family>')`
  and that a Google-Fonts/`@font-face` request for the family is present. A declared-but-unloaded font
  falls back to a system sans and reads as "the font is wrong".

## Tooling (in the kit — `tools/measure/`)

- **`tools/measure/fidelity-check.mjs`** — the per-element **4-lens** runner: **Lens 1** diffs the
  **full computed style** per element matched by text — font size/weight/color/family/text-transform
  **plus text-decoration, animation, box-shadow, transform, letter-spacing** (a comprehensive diff, NOT
  a curated subset, so a wavy underline or a bounce animation is *flagged*, not silently missed) + icon
  kind + missing/extra; **Lens 2** geometry (column x, overlap); **Lens 3** pixel (pixelmatch %);
  **Lens 4 VERTICAL SPACING** — anchors on the region's heading, uses its parent block, and diffs the
  **gaps between the block's children (overline/title/subtitle rhythm) + the gap BELOW the block**
  (the `mb-16`-style container spacing), **ranked biggest-delta-first** so a VERY-obvious 44px miss
  is reported above a subtle 2px one. This lens exists because x-positions + typography are blind to
  vertical rhythm — the single most-visible dimension and the one that kept slipping through by eye.
  `node tools/measure/fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>` — run it **per region**.
  Deps (`npm i` in `tools/measure`): playwright, pngjs, pixelmatch, sharp.
- **`tools/measure/compare.mjs`** — the region-level **ensemble** (geometry + pixel + perceptual +
  DOM-structure counts), aggregated fail-loud. Complements the per-element tool above.
- **Capture service** (`assembled/UnysonPlus-Capture-Service/tools/design-capture`) — the source of truth for the design spec (per-element
  styles + button `:hover` via `hoverStyle()`); prefer it over hand-measuring.

## Why this exists (the failures it prevents)

Every one of these shipped because I eyeballed instead of measured: footer titles 13px uppercase (source
18px title-case), FA icons where the source used emoji, columns overlapping, a bare product card where
the source had a badge/heart/description/rating. All are caught by Rule 2 lens 1 or 2 in seconds — *if
you run them per region before declaring done.*
