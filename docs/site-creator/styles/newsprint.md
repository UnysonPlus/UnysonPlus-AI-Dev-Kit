<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Newsprint

Follows the model in [`README.md`](README.md).

## The idea

A newspaper on screen: a warm off-white ground, a condensed serif masthead, dense multi-column text,
hairline rules doing the dividing, and one spot colour used the way a press run uses it — sparingly,
because it used to cost money. It suits publications, long-form writing, event programmes and anything
whose content is genuinely worth reading at length.

**Reach for a different one** when the content is short. Newsprint's whole argument is density, and a
newsprint landing page with four sentences on it looks like a broadsheet nobody wrote. Also avoid it for
products — the style says *archive*, not *buy*.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | Ground `#faf7f0` (warm, never pure white), ink `#1a1a1a`, muted `#6b6b6b`, Accent a single press red `#c0392b` |
| **Type** | Heading: a condensed serif, `variation: 700`, tight tracking. Body: a readable serif at `size: 17`, `line-height: 1.55`. **Serif on serif** — the contrast is width and weight, not family |
| **Buttons** | `border_radius: 0`. Primary is ink-on-ground with a 1px rule; the press red is for *marks*, not for buttons |
| **Shape** | `border_presets`: radius `0`, border `1px` ink, shadow none. Rules, not boxes |
| **Surfaces** | Ground, Ink (inverted, for a masthead band), and a Tint (`#f0ece2`) for pull-outs |
| **Rhythm** | Narrow measure, tight leading between blocks. Container **Medium**; a newspaper column is ~60 characters and so is this |
| **Motion** | **Instant** |

Palette, type and button code follow the shapes in
[`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md), structurally as in
[`monochrome.md`](monochrome.md). The regen step applies: delete the generated
`uploads/**/unysonplus/css/presets-*.css` and call `unysonplus_hf_regenerate_css()`.

**The off-white is load-bearing.** `#ffffff` turns this style into generic minimalism instantly — the
warmth is what makes it read as paper rather than as screen.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial** — a masthead headline, no CTA race | Centred or split |
| [Navbar](../recipes/navbars.md) | **Centred** — the wordmark as masthead, nav split around it | Pill or card |
| [Feature grid](../recipes/feature-grids.md) | **Icon row**, rules between items | Card grid |
| [CTA](../recipes/ctas.md) | **Banner strip** — a classified ad, not a billboard | Centred block |
| [Footer](../recipes/footers.md) | **Link columns**, many, dense | Minimal bar |
| [Marquee](../recipes/marquees.md) | None — a moving strip breaks the conceit | — |

## Where it comes from

**No existing skill matches.** `minimalist` is close in restraint but cool and sparse where this is warm
and dense; the two differ on exactly the axis that matters here. A full entry.
