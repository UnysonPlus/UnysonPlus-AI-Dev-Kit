<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Swiss grid

Follows the model in [`README.md`](README.md).

## The idea

International Typographic Style: a visible grid, a neutral grotesque at few sizes, flush-left ragged-right
text, generous white space, and one primary colour used structurally rather than decoratively.
Everything aligns to the same columns, and that alignment is the design. It suits design studios,
architecture, consultancies, conferences, and any site whose credibility comes from precision.

**Reach for a different one** when the content is irregular — the style punishes a page whose sections
do not share a rhythm, and most marketing pages do not. It also needs real white space; squeezed, it
reads as plain rather than as composed.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | White ground, `#111111` text, one primary (`#d8232a` is the canonical red; any single saturated hue works), muted `#767676` |
| **Type** | One neutral grotesque throughout, at **three sizes only** — display, subhead, body. `variation: 500` for headings, `regular` for body, `line-height: 1.5`. Flush left, never justified, never centred |
| **Buttons** | `border_radius: 0`. Primary is the colour; secondary is a 1px rule. Text is never centred inside them at display size |
| **Shape** | `border_presets`: radius `0`, border `1px`, shadow none |
| **Surfaces** | White, and one Primary band used once |
| **Rhythm** | **The grid is the style.** `gap_scale` consistent everywhere, `container_width_presets` at **Wide**, and every section uses the same track count so columns line up down the page |
| **Motion** | **Instant** — or one restrained fade at most. Movement undermines a style whose claim is stillness |

Values follow [`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md),
structurally as in [`monochrome.md`](monochrome.md); the regen step applies.

**Three type sizes, and no more.** The temptation is a fourth for "a bit smaller here". That is the
decision that turns a Swiss grid into an ordinary page with a red accent.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial**, flush left, aligned to the grid's first column | Centred |
| [Navbar](../recipes/navbars.md) | **Classic bar**, `static` | Pill, card, centred |
| [Feature grid](../recipes/feature-grids.md) | **Icon row** at the page's track count — 3 or 4, never 5 | Bento (it breaks the grid) |
| [CTA](../recipes/ctas.md) | **Centred block** on the Primary band | Dual action |
| [Footer](../recipes/footers.md) | **Link columns** on the same tracks as the page | Minimal bar |
| [Marquee](../recipes/marquees.md) | None | — |

The bento exclusion is the one to respect: a deliberately irregular tile layout is the opposite of this
style's argument.

## Where it comes from

**No existing skill matches.** `minimalist` shares the restraint but not the grid discipline, and
`brutalist` shares the grid but inverts the refinement. A full entry.
