<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Modern dark

Follows the model in [`README.md`](README.md).

## The idea

A dark ground with one saturated accent, soft radii, and light used as the depth cue instead of shadow.
The register of developer tools, AI products and anything that wants to read as technical and current.
It is the most-asked-for direction we meet, and the easiest to do badly.

**Reach for a different one** when the site is content-led rather than product-led: long reading on a
dark ground is tiring, and a dark marketing page that opens into a dark blog loses people. Also avoid it
where photography carries the page — dark surrounds make most photographs look dim rather than dramatic.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | Ground `#0b0d10`, raised surface `#14181d`, text `#e8ecf1`, muted `#9aa3ad`, Accent a single saturated hue (`#3ddc97` here) |
| **Type** | Heading and body **the same** sans; headings `variation: 600`, body `size: 16`, `line-height: 1.7`. Long dark text needs the extra leading |
| **Buttons** | Primary = solid accent with **dark** text (an accent this saturated fails contrast under white); secondary = 1px border in the muted grey. `border_radius: 8px` |
| **Shape** | `border_presets`: radius `12px`, border `1px` in a lifted grey (`#232a31`), **shadow none** — on a dark ground a shadow is invisible; depth comes from the lighter surface |
| **Surfaces** | Ground, Raised (`#14181d`), and one Accent band used sparingly |
| **Rhythm** | Container **Medium** (896px) for text, **Wide** for product shots. Generous `gap_scale` — dark layouts need more air than light ones to avoid reading as a slab |
| **Motion** | **Restrained.** One fade-up per band |

Palette and button code follow the shapes in
[`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md), structurally as in
[`monochrome.md`](monochrome.md). The regen step applies: delete the generated
`uploads/**/unysonplus/css/presets-*.css` and call `unysonplus_hf_regenerate_css()`.

### The two things that go wrong

- **Contrast on the accent button.** A saturated accent is bright enough to fail against white text and
  pass against near-black. Check the real pair, both directions, before shipping — this is the single
  most common defect in dark designs, and it lands on the one element everything funnels to.
- **Pure black and pure white.** `#000` ground with `#fff` text maximises contrast and is *harder* to
  read: it haloes. The values above are deliberately off both ends.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Split** — product shot earns its half here | Editorial |
| [Navbar](../recipes/navbars.md) | **Floating pill** or **Elevated card**, `sticky` | Classic bar |
| [Feature grid](../recipes/feature-grids.md) | **Card grid** on the Raised surface, icon badges in the accent | Icon row |
| [CTA](../recipes/ctas.md) | **Dual action** — "Start free" / "Talk to sales" fits the product shape | Banner strip |
| [Footer](../recipes/footers.md) | **Link columns** on Ground, hairline in the lifted grey | Minimal bar |
| [Marquee](../recipes/marquees.md) | **Logo strip**, `grayscale: yes` — coloured logos on dark are noise | Word strip |

## The signature moment

A dark product site earns its moment by **explaining the product** - the register is precision, so the
one memorable interaction should make something clearer, not merely prettier.

| Reach for | Why it fits |
| --- | --- |
| [Scroll keyframes](../../animation-engine/scroll-keyframes.md) / [scroll timeline](../../animation-engine/scroll-timeline.md) | A product or diagram that assembles as you read - the strongest Creativity move this style has |
| [Sticky stack](../../animation-engine/sticky-stack.md) | Features that hold and replace rather than scrolling past |
| [Backgrounds](../../animation-engine/backgrounds.md) | A slow gradient or noise field, far enough back that type stays at full contrast |
| [Scroll var](../../animation-engine/scroll-var.md) | Drives a glow or accent from scroll position without a second animation system |

**Never:** glow used *as* contrast. The palette trap in
[build rule 10](../../../skills/create-site/build-rules.md) bites hardest here - a halo reads as
brightness to the eye and as nothing to a contrast meter, so every pairing must pass before the glow
goes on.

**Reduced motion:** the assembly renders at its final frame, the sticky stack becomes a plain stacked
sequence, the background holds one still state.

## Where it comes from

**No existing skill matches**, which is why this is a full entry rather than a mapping. `impeccable` is
the refined default and is palette-agnostic; `soft` is the high-end agency look and is warmer and
lighter than this. The dark-product register is a genuine gap in the skill set, and the roadmap's
"seed the high-value styles" names it for that reason.
