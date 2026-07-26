# Build a UnysonPlus site from a prompt

The orchestration layer: how to go from *"build me a &lt;kind&gt; site"* to a finished, editable
UnysonPlus site. It ties together the reference docs (per shortcode / option / module / extension),
the build tooling ([building-pages.md](building-pages.md)), and the [conventions](conventions.md).

> Prerequisite: a WordPress with the UnysonPlus plugin + parent theme active, and Classic Editor
> active (the builder assumes the classic editor). See [START-HERE.md](../START-HERE.md).

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
theme starter ships polished chrome so this is mostly tuning. Measure, don't eyeball, if a mockup
exists (`tools/measure/`).

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
| "Like &lt;some site&gt;" / a screenshot | Extract tokens (colors, type, spacing) and reproduce them **as Theme Settings presets**; for a live URL, prefer the Site Converter pipeline (see the converter docs) over hand-building. |
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
