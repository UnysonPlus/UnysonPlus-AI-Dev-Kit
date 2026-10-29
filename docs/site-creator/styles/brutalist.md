<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Industrial brutalist

Follows the model in [`README.md`](README.md).

## The idea

Raw structure made visible: a rigid grid, extreme size contrast between display and body type, one
utility colour against concrete greys, and no attempt to look comfortable. It suits data-heavy
dashboards, portfolios with something to prove, and editorial sites that want to read as documents
rather than products.

**Reach for a different one** for anything that must feel trustworthy to a non-technical visitor —
clinics, finance, local services. Brutalism signals confidence to people who already read design, and
reads as *broken* to people who do not. It also needs real content: the style magnifies whatever is in
it, including emptiness.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | Primary `#0a0a0a`, Secondary `#8a8a8a`, Accent **one** utility colour (`#ff4d00` is the default here) on a `#e8e6e1` concrete ground |
| **Type** | Heading: a grotesque at `variation: 700` and heavy negative tracking; body: the same family at `regular`, `size: 15`, `line-height: 1.5`. **One family, two extremes** — the contrast is size and weight, never a second typeface |
| **Buttons** | `border_radius: 0`, 2px border, no shadow. Primary is the accent; secondary is a bordered box on the ground colour |
| **Shape** | `border_presets`: radius `0`, border `2px solid`, shadow none. Hard edges are the whole language |
| **Surfaces** | Three: Ground (`#e8e6e1`), Ink (`#0a0a0a`), Accent (the utility colour, used **once per page**) |
| **Rhythm** | Tight gutters, wide measure — the opposite of monochrome. Container at **Wide** (1024px+); `gap_scale` low so the grid reads as a grid |
| **Motion** | **Instant.** State changes only |

Values go in the shapes
[`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md) documents; the
palette and button code are structurally identical to
[`monochrome.md`](monochrome.md) with these colours.

> The regen step applies here too: after writing `button_colors` / `button_sizes`, delete the generated
> `uploads/**/unysonplus/css/presets-*.css` and call `unysonplus_hf_regenerate_css()`.

**One accent per page, and it is a signal, not decoration.** The moment the utility colour appears
three times it stops meaning anything and the page is just loud.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial**, headline at maximum scale | Media-backed |
| [Navbar](../recipes/navbars.md) | **Classic bar**, `sticky` | Pill or card — both are softening devices |
| [Feature grid](../recipes/feature-grids.md) | **Card grid** with a 2px bordered Box Preset, or **Bento** | Icon row |
| [CTA](../recipes/ctas.md) | **Centred block** on the Accent surface | Dual action |
| [Footer](../recipes/footers.md) | **Link columns**, many of them, hairline-ruled | Minimal bar |
| [Marquee](../recipes/marquees.md) | **Word strip** — fits the style better than anywhere else | Logo strip |

## Where it comes from

Closest existing skill: **`brutalist`** (rigid grids, extreme type-scale contrast, utilitarian colour,
analog degradation). This entry is the Unyson+ mapping — the seven slots in our values — and does not
restate its design thinking.

Two deliberate departures: we do **not** reproduce the analog degradation effects (scanlines, noise,
misregistration), because they are per-element CSS that cannot live in a preset and so cannot be a
*style*; and the grid comes from the real `gap_scale` and container presets rather than from decorative
rules. Where this file and the skill agree, defer to the skill.
