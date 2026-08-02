# Build a UnysonPlus site from a prompt

The orchestration layer: how to go from *"build me a &lt;kind&gt; site"* to a finished, editable
UnysonPlus site. It ties together the reference docs (per shortcode / option / module / extension),
the build tooling ([building-pages.md](building-pages.md)), and the [conventions](conventions.md).

> **⛔ THIS FILE IS THE FRESH-BUILD PATH ONLY. A source exists? It's a CONVERSION — stop and use the
> converter.** If the request references or supplies **anything to reproduce** — a URL, a screenshot, a
> PDF/Figma, an HTML/CSS dump, a named template — it is a **conversion**, and a conversion is a
> **translation** job: run the capture/converter pipeline and follow
> [`site-build-protocol.md`](site-build-protocol.md) (Rule 0). Do **NOT** use the measure-and-extract
> steps below to hand-reproduce a source — every value already exists as a captured class; you translate
> it, you don't measure it. The measuring/eyeballing this file describes is legitimate **only** when there
> is nothing to reproduce.

> Prerequisite: a WordPress with the UnysonPlus plugin + parent theme active, and Classic Editor
> active (the builder assumes the classic editor). See [README.md](../README.md) → "First: a WordPress to build into".
>
> **Install + activate the Classic Editor plugin FIRST — before installing/activating the UnysonPlus
> plugin.** For any UnysonPlus site setup (a fresh install, a demo/test build, or automated
> provisioning), the sequence is: install & activate **Classic Editor**, *then* install & activate the
> **UnysonPlus** plugin, then the parent theme. The page builder assumes the classic editor; bringing
> UnysonPlus up first against the block editor can leave the builder's editor UI in a bad state.
> Automate it (`wp plugin install classic-editor --activate` before the UnysonPlus plugin, or bundle
> it as a required plugin) — never rely on it being there.

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
