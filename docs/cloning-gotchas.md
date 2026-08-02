# Cloning gotchas — the recurring fixes (quick reference)

The concrete fixes that keep coming up when cloning a source into UnysonPlus, each generalized from
real misses. Skim this before and during a clone; the detail lives in the linked docs.

> **Governing rule — a clone is a TRANSLATION, not a measure-and-hand-tune.** A clone/convert IS a
> conversion: every value already exists as a captured Tailwind class / computed style, so you **translate
> the captured class** into a native option (Rule 0.6), and when a value is wrong you **fix the converter's
> class→value rule and prove it with the browser-free class-string fixture** (`tailwind-matrix.test.mjs`) —
> you do **not** read a number off the source render to type in by hand. The fixes below are phrased as
> "measure X" because that's how the miss was *diagnosed*; the **durable fix is a converter rule**, and any
> hand value is only the residual delta the converter can't yet express. Measuring-to-create is legitimate
> only on a **from-scratch** build. See [site-build-protocol.md](site-build-protocol.md) Rule 0 +
> [fidelity-verification.md](fidelity-verification.md).

## Design system
- **Container width** — the theme default desktop container is **1170px**; match the source's content
  max-width (`max-w-7xl`=1280, `max-w-6xl`=1152) in Theme Settings → Layout, or every section is off.
- **Type scale** — set the source's measured H1–H6 sizes via the **per-heading overrides** in Theme
  Settings → Typography (`h1`–`h6`), not scoped CSS. Heading LEVEL = outline position; SIZE = CSS.
- **Colors** — child `:root` aliases must **consume** `var(--color-primary/secondary/accent/text)`, not
  re-hardcode brand hex (else a rebrand won't propagate).
- **Logo icon frame — MEASURE the source's logo tile, don't guess.** If the source logo mark sits on a
  tile/chip, read the **wrapping element's** computed box and map it to the frame options — never
  eyeball a fill/shape (a white-on-white guess renders an *invisible* frame):
  - `border-radius` → `logo_icon_frame`: `9999px`/`50%` = **circle**, `~8–16px` = **rounded**, `0` =
    **square**; no visible container (transparent bg, no border/shadow) = **none**.
  - `background-color` → **`logo_icon_frame_bg`** (e.g. a pink `#fce7f3` tile, NOT assumed white).
  - `border` color → the frame ring via **`logo_icon_color`** (the framed mark's ring is `1px solid
    currentColor`; the icon glyph is hidden when the mark carries a background-image, so this only
    colors the ring). *Gap:* the ring width is fixed at 1px — a source with a 2px ring is ~matched, not
    exact; add a dedicated frame-border option if pixel-exactness matters.
  - Example (Pinky Bites, measured): tile = `background:#fce7f3; border:2px solid #fbcfe8; border-radius:9999px`
    → `logo_icon_frame:circle`, `logo_icon_frame_bg:#fce7f3`, `logo_icon_color:#fbcfe8`.
- **Cards / buttons / band tints / rounded media** — belong in **Box / Button / Section-style / Image-
  style presets** (`components-*`), consumed by elements — not hand-rolled `.card{}`/`.btn{}` child CSS.
- **Spacing — the converter TRANSLATES the source's spacing class; it's not yours to eyeball.** The
  source's spacing is a captured class (`py-10`, `gap-8`, `mt-24`) or its resolved computed value; the
  converter snaps it to the nearest **spacing-scale** slug and sets it via the element's CSS Class (`mt-3`)
  or the section's Custom Styling **Padding** (`{ padding: ['pt-4'] }`). The scale (px): `1`=4 · `2`=8 ·
  `3`=16 · `4`=24 · `5`=48 · `6`=56 · `7`=64 · `8`=72 · `9`=80 · `10`=96 · `11`=112 · `12`=128. It jumps
  24→48 (no 32); when a value lands between steps, the converter prefers the **tighter** one (users dislike
  over-spacing). **If a section's spacing is wrong, it's a converter translation miss — fix the class→slug
  rule and prove it with `tailwind-matrix.test.mjs`** (which sweeps every official Tailwind step through
  the real pipeline and fails on a CLAMP/COLLIDE), not a hand-typed px read off `getComputedStyle`.
  `tools/measure/fidelity-check.mjs` still *diagnoses* the miss ("blurb→social is 24px, source is 16px"),
  but the durable fix lives in the converter, not the page. *(On a **from-scratch** build there's no class
  to translate — measure your mockup and set the slug directly.)*

## Lockups & icon rows — `align-items` / `gap` do nothing unless `display` is flex

A logo lockup (mark + site-title) or a social-icon row that looks *almost* right — the title a few
px low, the mark and text touching, an icon nudged — is almost always a **layout** bug, not an
asset bug. **Measure it, and don't blame the image first.**

- **`align-items` and `gap` are silently IGNORED on `display:inline` (or `block`).** A rule like
  `.footer-logo-link--lockup { align-items:center; gap:12px; }` no-ops entirely if the element
  isn't `flex` / `inline-flex`: the title drops to the text baseline (a few px low) and the gap
  collapses to 0. Fix = add `display:inline-flex`. This exact bug hit the pinky-bites footer — the
  lockup had `align-items:center; gap:.55rem` but no `display`, so the title sat **11px below** the
  mark centre with a **0px gap**; `inline-flex` restored centred alignment + the 12px gap.
- **A font-icon glyph does NOT auto-centre in its badge — the icon element itself needs flex.** A
  flex-centred *parent* circle is not enough: the glyph is baseline-positioned inside its line box,
  so a solid letter-mark (Font Awesome `fa-facebook-f`) sits **high** while an outline glyph next
  to it (`fa-instagram`) looks fine — which reads as "one icon is off". Fix = put
  `display:flex; align-items:center; justify-content:center` on the `<i>` / `<svg>` glyph itself.
  Do **not** swap the icon or the icon set to "fix" this; the glyph is fine, its centring isn't.
- **A 0,0 bounding-box offset does NOT prove it LOOKS centred — LOOK at a crop.** The glyph's *box*
  can be centred while the *visible* glyph inside it is not (font metrics, a letter-mark's weight).
  On pinky-bites the social icons measured a perfect 0,0 offset, so I called them fine and chased
  the wrong things (the logo, the icon set) — the real fix was one line of glyph-centring CSS.
  When something looks off, **capture a high-DPI element crop and view it** before theorising:
  geometry numbers are a starting point, not proof. And for a lockup, check the mark's vertical
  centre **==** the title's and the gap matches the source — **diagnose the layout before touching
  the asset.**

## Box-shadow / glow looks hard-cut = an ancestor with `overflow:hidden` (check this FIRST)
- **Tell:** an image (or card) box-shadow — or a decorative backdrop glow — has a **straight, hard cut-off
  edge** instead of a smooth falloff. No `box-shadow` value change fixes it; you'll burn rounds tweaking
  blur / opacity / spread while the value was never wrong.
- **Cause:** an ancestor **clips** it. **`.imgs-wrap` no longer does** — its overflow is
  `var(--imgs-overflow, visible)`, so image shadows/glows render out of the box (the `<img>` keeps its own
  `border-radius`, so it stays rounded without the clip). But **any other container** with `overflow:hidden`
  (a column, a card, a section wrapper) still clips.
- **`.imgs-wrap` hover-zoom note:** it only clips when you set `--imgs-overflow:hidden` — needed for a
  hover-**zoom** crop (`:hover img{transform:scale(...)}`) so the zoom stays inside the frame. A hover-zoom
  image and a shadowed image therefore conflict (zoom wants the clip, shadow wants it off).
- **Fix (other wrappers):** `overflow: visible` on the clipping ancestor (scoped), NOT a shadow tweak. Safe
  when the element keeps its own `border-radius`. (A box-shadow on a wrapper *element itself* renders fine
  under `overflow:hidden` — only a shadow on a **child** is clipped — so moving the shadow to the wrapper
  is the other fix.)
- **Diagnose before theorising:** when a shadow looks cut, inspect the shadowed element's ancestors for
  `overflow:hidden` FIRST. And use a **side-by-side element crop** — a clipped shadow is instantly obvious
  visually but invisible in a `box-shadow` computed-value read (the value is correct; it's the rendering
  that's clipped).

## Emojis look flat / wrong vs a non-WordPress source — disable wp-emoji

WordPress rewrites every native emoji into a **Twemoji image** (`<img class="emoji"
src="https://s.w.org/images/core/emoji/…svg">`, via the `wp-emoji` script). Twemoji's glyphs differ
from the OS/native set — most visibly the **geometric** ones: `⚪` renders as a **shiny pale pearl**
natively but a **flat grey circle** in Twemoji; `⚫`, `🔘`, `▪` similar. So an emoji that should match a
**non-WordPress source** (Next.js / static / React — which render *native* emojis) looks wrong on the WP
clone. "The emoji was captured wrong" is a red herring here: the character is correct (`⚪` = U+26AA),
WordPress is swapping the **rendering**.

- **Tell:** inspect the node — the emoji is an `<img class="emoji">`, not a text glyph.
- **Fix:** disable wp-emoji so the browser renders native emojis (then they match the source). Scope it
  to the one site via the **child theme's `functions.php`**:
  `remove_action('wp_head','print_emoji_detection_script',7);`
  `remove_action('wp_print_styles','print_emoji_styles');` (+ the feed / `wp_mail`
  `wp_staticize_emoji*` filters and `add_filter('emoji_svg_url','__return_false')`).
- It fixes **every** emoji on the page at once — the whole set reverts to native, matching the source.

## Icons — match by kind (only font icons get swapped)
- **Emoji** (🏠 📞 ⏰ 💤) → reproduce the character verbatim. **Inline SVG** → copy markup / map to
  lucide. **Font icons** (`fas fa-…`) → the ONLY kind that needs translating to the target's icon set.
  Never swap emoji↔font-icon (the "Visiting Us used emoji, I used Font Awesome" miss).

## Header / footer (chrome)
- **Match the source exactly** — logo lockup, nav, right-side element, footer WIDGET columns (not just
  the copyright line). See [site-build-protocol.md](site-build-protocol.md) Rules 2–3.
- **Footer columns → NATIVE elements**, not `custom_html` for everything: `menu` (link columns),
  `icon_text` (FA-icon contact lines) OR a `text` element with emoji lines (when the source uses emoji),
  `social_icons`, `text`. `custom_html` only for bespoke markup (a newsletter form). See
  [theme-settings/footer.md](theme-settings/footer.md).
- **Footer background → Theme Settings `footer_background` (the whole footer, uniformly), NOT a child
  `.footer { background: … !important }` rule.** A hardcoded `!important` bg in the child theme shadows
  the setting and — because it hits the widget area but the copyright section has its own bg — can leave
  the copyright bar a **different shade** than the widgets. Set `footer_background` (light vs dark to
  match the source) and delete any child-CSS footer bg override.
- **A bar's text size / color / link color / background / padding / borders → its `Custom Styling`
  block** (`<prefix>_custom_styling`), NOT child CSS. Set the source's *measured* footer text spec
  there (e.g. `main_footer_custom_styling.yes.main_footer_typography = {size:14, color:rgba(157,23,77,.8)}`).
- **The copyright is a SEPARATE section** — its Custom Styling is `copyright_custom_styling`, **nested
  under `copyright_settings.yes`** (not a top-level option). A separate section = separate styling.
- **Logo = the source's real image, sideloaded** — not an emoji/generic icon. For an image **+ wordmark**
  footer brand, use the **`footer_logo` element with `footer_logo_show_title`** (default off = logo only),
  not a `text` element with an inline `<img>`.
- **Social icons → Theme Settings → Social** (`social_profiles` list + `social_style.social_icon_style`),
  not hardcoded icon markup. Set the exact profiles the source has (e.g. Instagram + Facebook only).
- **Per-element spacing / alignment / tweaks → the element's `CSS Class` field + a utility**, not a
  child-CSS rule. Every header/footer element has an `element_css_class` field:
  - **Spacing** — spacing-scale classes (`mt-4`, `mb-3`, `pt-9`…), e.g. `mt-4` on the social-icons
    element to space it below the brand blurb.
  - **Alignment** — the **copyright bar auto-aligns by column count** (1=center, 2=left|right,
    3+=left|center|right), so a `© …` line needs no class; override one column via `text-start`/
    `text-center`/`text-end` on its `element_css_class`. Want a lone LEFT copyright? Use 2 columns
    (content in col 1, col 2 blank). Widget columns stay left. See site-build-protocol Rule 3.1.
- **Announcement topbar** — its content is a `custom_html` element (runs `do_shortcode`); if it's over-
  padded, the theme's row padding stacks on your element padding — zero the outer, keep one layer.

## WooCommerce / store
- Store cues (cart buttons, prices, Shop/Menu nav) ⇒ build on WooCommerce; product grid = `wc_products`.
- Richer cards come from `wc_products` options: `show_excerpt`, `show_ribbon` (per-product `_upwc_ribbon`
  meta), `show_wishlist`, `add_to_cart_text`, `show_rating` (seed `_wc_average_rating`).
- **Multisite**: WC network-activation does NOT create a subsite's WC tables — run `WC_Install::install()`
  (+ `create_pages()`). Grid float-vs-flex: neutralize WooCommerce's `li.product{float;width;margin}`.

## Layout
- **Horizontal scrollbar from a fixed off-canvas panel.** A `position:fixed` panel hidden with
  `transform: translateX(100%)` (a slide-out drawer/menu) parks itself off the right edge — and a
  fixed element sitting off-screen **extends the page's scroll width**, so you get a horizontal
  scrollbar. `overflow-x:hidden`/`clip` on `html`/`body` does **not** clip it (fixed elements aren't
  clipped by ancestor overflow). The robust pattern (used by the mini-cart's Drawer mode) is a fixed,
  viewport-sized **clipper** (`position:fixed; inset:0; overflow:hidden`) **portaled to `<body>`** that
  holds the sliding panel: portaling escapes any transformed/`backdrop-filter` ancestor (which would
  otherwise capture the fixed panel as its containing block — e.g. a glassy header), and the clipper's
  `overflow:hidden` contains the off-screen slide → zero page overflow. (A plain contained
  `position:absolute` dropdown avoids the issue entirely when you don't need a drawer.) To find the
  culprit: scan for elements whose `getBoundingClientRect().right > clientWidth`; toggling the suspect to
  `display:none` and seeing `scrollWidth` drop confirms it. Also offset fixed overlays below the WP
  **admin bar** (`body.admin-bar`) when logged in.
- **The spacing + gap scales skip 2rem (32px) and 2.5rem (40px).** Both scales jump `1.5rem → 3rem`
  (`framework/includes/presets/spacing-presets.php`), so the two most common modern/Tailwind steps —
  `mt-8`/`gap-8` = **32px** and `pt-10` = **40px** — are **not expressible** by a native slug (section
  padding, column `content_gap`, and `special_heading` `element_spacing` are all coarse: tight 4px /
  relaxed 16px / normal ~48px). A faithful conversion of a Tailwind source therefore needs scoped CSS
  for its dominant vertical rhythm. Measure the source's resolved spacing (`getComputedStyle` = the
  Tailwind value) and set the exact px; **flag the scale gap** to the maintainer rather than rounding to
  24/48. (Adding 32/40 natively means appended slugs — you can't renumber 0–12 without breaking saved pages.)
- **Section "Gap" sets `--bs-gutter-y`, which cascades and double-stacks.** The Section Gap option emits
  `.section--gap-{slug} .row` (a **descendant** combinator) setting BOTH `--bs-gutter-x` and
  `--bs-gutter-y`; the gutter-y (a) cascades into a column's **nested** sub-column rows and (b) **adds** to
  any explicit `margin-top` on those children — so a 48px column gap silently injects 48px between stacked
  buttons/stats too. `gap_y:'0'` does **not** fix it (same specificity 0,2,0 as `gap`, and the `gap` rule
  is emitted later → wins the tie). For a column gap with no vertical side-effects: **skip the section-gap
  mechanism** — set `--bs-gutter-x` on the **top row only** via a child combinator
  (`.hero > .fw-container > .fw-row { --bs-gutter-x: 3rem; }`), zero `--bs-gutter-y` on the hero's rows,
  and control vertical rhythm with explicit margins.
- **Overriding the section's default padding needs 0,2,0.** `.fw-page-builder-content > section` (0,1,1)
  sets `padding: calc(4rem * var(--section-spacing-scale,1))`. A scoped `.my-section { padding-top:… }`
  (0,1,0) **loses** — double the class (`.my-section.my-section { … }`) to win order-independently.

## Badges / pills / chips (the `badge` shortcode — renamed from `announcement_pill`)
- **The shortcode is `badge`** (folder `badge`, tag `[badge]`, title "Badge"). It was `announcement_pill`
  until 2026-07-31 (direct rename, no migration — it had no saved usage). Its internal CSS classes stay
  `.fw-announce` / `.ap-pill` and the Site Converter's internal recognizer/role token stays
  `announcement_pill`; only the emitted shortcode is `badge`. Use it for status badges, "what's new" chips,
  eyebrow labels and announcement bars.
- **Match the pill spec in px, not the size preset.** A source pill/badge is typically `14px / 700 /
  padding 8px 16px / gap 8px / radius 9999px`. The `badge` size presets resolve in `rem` and land smaller
  (`sm` ≈ 12.48px·4px·9.9px, `md` ≈ 14px·6.4px·13.6px), and `special_heading`'s **pill overline**
  hard-derives its own tint (`background: hsl(from currentColor h s 94.4%)`) + `.35em .75em` padding. So
  pick the nearest size (`md` = 14px + 8px gap) for what it gets right, then set exact padding /
  letter-spacing / bg in scoped CSS — raising specificity to beat the preset:
  `.hero .heading-overline--pill .heading-overline__label` (0,3,0) beats the pill default (0,2,0).
- **Never emit a bare `.badge` class** — Bootstrap ships `.badge`; keep the namespaced `.fw-announce` /
  `.ap-pill`.
- **Floating badges over an image → position by CENTRE, via `calc()` from the centred image.** A rotated
  badge pinned by a corner drifts under rotation, and its offsets depend on the media box (bigger than the
  image). Since the image is centred in its column, its edges are always at `50% ± halfWidth`. Measure the
  source badge's centre as a % of the image, then:
  `.badge-top { left: calc(50% - Xpx); top: calc(50% - Ypx); transform: translate(-50%,-50%) rotate(-12deg); }`
  — `translate(-50%,-50%)` pins the centre, rotate about it. Rotation-invariant and media-box-independent.
- **`width: max-content` on the absolute badge.** An absolutely-positioned badge whose `left` sits near the
  container's right edge shrinks-to-fit the remaining space, and the pill's `text-overflow:ellipsis` then
  clips the label ("Sweet Valley Favo…"). `width:max-content` (+ `.ap-pill__msg { overflow:visible }`) keeps
  it full.

## Process
- **Regenerate**: after settings written outside the save flow, call `unysonplus_hf_regenerate_css()` +
  clear the optimizer/generated caches.
- **Extend, don't hack**: if an element can't do what the source needs (e.g. `footer_logo` had no title),
  add the option to the framework so it stays user-editable — don't bury it in child markup.
- **Verify per region with the 4-lens tool** (`tools/measure/fidelity-check.mjs`) before advancing: it
  catches font/size/color/**textTransform**/emoji, **overlap/geometry**, pixel, and **vertical-spacing**
  diffs — the classes of miss an eyeball skips. On a conversion this is the *assembly* check; the primary
  proof of a value is the class-string fixture (`tailwind-matrix.test.mjs`) — see the governing rule up top.

## :hover / :focus states — the converter drops them (capture-side gap)

The capture service extracts **resting** computed styles + the raw HTML, but it does **not** read
`:hover` / `:focus` computed styles — so a source's interaction states (button hover color, link hover,
card lift) are **not** translated into Theme Settings. Symptom: buttons look right at rest but the hover
is wrong/missing. Until the converter captures hover:
- **Read the hover from the captured HTML.** Tailwind sources carry it as `hover:*` utilities in the
  captured markup (e.g. a primary button `bg-[#ff6b8b] hover:bg-[#ff85a1]` → hover bg **#ff85a1**, a
  *lighten*, not a darken; nav `hover:text-[#ff6b8b]`; social `hover:bg-[#ff6b8b] hover:text-white`).
- **Set it in the right place** — the theme's **Buttons builder has Default / Hover / Active / Focus
  state tabs**, so button hover belongs there (Theme Settings), not child CSS. Menu hover = Header →
  Menu → Hover/Active color. Only genuinely un-expressible hovers go to child CSS.
- **Converter status:** the capture service now **captures button hover** — `capture-extract.mjs`
  resolves the brand-filled button's `hover:*` utilities (arbitrary `[#hex]` parsed directly, named via
  a probe of the page's compiled CSS) into `tokens.brandHover`, and `to-design-config.mjs` emits it as
  the button token's `hover_bg` / `hover_color` / `hover_border` (verified: `hover_bg:#ff85a1`). **Still
  to wire:** (1) emit that into the generated theme's button styling / Buttons-preset **Hover** state so
  it's applied (the converter currently emits buttons mostly as child CSS — extend that emit); (2) menu
  link hover; (3) the **PHP `Mapper`** mirror for the file-upload path. Until (1)–(3) land, hand-set the
  hover from `design-config.json`'s `hover_bg` (or the captured markup).
