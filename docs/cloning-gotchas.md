# Cloning gotchas — the recurring fixes (quick reference)

The concrete fixes that keep coming up when cloning a source into UnysonPlus, each generalized from
real misses. Skim this before and during a clone; the detail lives in the linked docs. Governing rule:
**measure the source, build to the measured value, verify per region** (see
[fidelity-verification.md](fidelity-verification.md)).

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
- **Spacing — MEASURE it from the capture, don't eyeball.** Load the live source (computed styles) and
  read the actual box model — section padding, column gaps, element margins (e.g. blurb→social,
  title→list, footer top/bottom) — then map each px to the nearest **spacing-scale** step and set it via
  the element's CSS Class (`mt-3`) or the section's Custom Styling **Padding** (spacing value
  `{ padding: ['pt-4'] }`). The scale (px): `1`=4 · `2`=8 · `3`=16 · `4`=24 · `5`=48 · `6`=56 · `7`=64 ·
  `8`=72 · `9`=80 · `10`=96 · `11`=112 · `12`=128. It jumps 24→48 (no 32); when a measured value lands
  between steps, prefer the **tighter** one (users dislike over-spacing) and note the small delta.
  The kit's `tools/measure/fidelity-check.mjs` (`getBoundingClientRect` + `getComputedStyle` on both
  source and yours) turns "the footer feels off" into "blurb→social is 24px, source is 16px → `mt-3`".

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

## Process
- **Regenerate**: after settings written outside the save flow, call `unysonplus_hf_regenerate_css()` +
  clear the optimizer/generated caches.
- **Extend, don't hack**: if an element can't do what the source needs (e.g. `footer_logo` had no title),
  add the option to the framework so it stays user-editable — don't bury it in child markup.
- **Verify per region with the 3-lens tool** (`tools/measure/fidelity-check.mjs`) before advancing: it
  catches font/size/color/**textTransform**/emoji, **overlap/geometry**, and pixel diffs — the classes of
  miss an eyeball skips.

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
