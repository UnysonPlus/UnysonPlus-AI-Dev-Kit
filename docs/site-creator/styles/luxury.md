<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Luxury

Follows the model in [`README.md`](README.md).

## The idea

Restraint read as expense: a near-neutral palette with one muted metallic, a high-contrast serif set
large and loose, enormous white space, and photography given room rather than cropped into cards. The
look of a brand that does not need to raise its voice — hospitality, jewellery, property, private
practice.

**Reach for a different one** when the site must convert quickly or carries a lot of information.
Luxury spends its budget on space, so a dense page cannot have it; and a style whose CTA whispers is
the wrong style for a page that needs the click.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | Ground `#faf8f5` (warm stone), text `#1c1a17`, muted `#8a8278`, Accent a muted metallic `#9c8458` — never a bright gold, which reads as cheap at any size |
| **Type** | Heading: a high-contrast serif, `variation: regular`, large, with **positive** letter-spacing on small caps and overlines. Body: a quiet sans, `size: 16`, `line-height: 1.8` — the leading is where the air lives |
| **Buttons** | `border_radius: 0` or a very small `2px`. Primary is a 1px rule in text colour with a transparent fill; a filled button is louder than this style ever gets |
| **Shape** | `border_presets`: radius `0`–`2px`, border `1px` hairline in `#e4ded4`, shadow none |
| **Surfaces** | Stone, Ink (`#1c1a17`) for one band, and a paler `#f3efe9` |
| **Rhythm** | **The defining slot.** Section padding roughly double the other styles, container **Medium** for text, generous `gap_scale`. If the page feels sparse, it is working |
| **Motion** | **Restrained** — one slow fade-up per band, nothing faster than the eye expects |

Values follow [`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md),
structurally as in [`monochrome.md`](monochrome.md); the regen step applies.

**The space is the style, and it is the first thing a client asks to remove.** Shrinking the padding to
"fit more above the fold" converts this into an ordinary beige site in one edit. If the content needs
more room, the content is too long for the style.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Media-backed** with a strong scrim, or **Editorial** when the photography is weak | Split |
| [Navbar](../recipes/navbars.md) | **Centred** — the wordmark as the brand statement | Pill |
| [Feature grid](../recipes/feature-grids.md) | **Icon row**, no cards, lots of gap | Card grid |
| [CTA](../recipes/ctas.md) | **Centred block** on the Ink band, `btn-secondary` outline | Dual action |
| [Footer](../recipes/footers.md) | **Minimal bar** — a wordmark, a few links, a line | Link columns |
| [Marquee](../recipes/marquees.md) | **Logo strip** for press mentions, `grayscale: yes` | Word strip |

Media-backed is the one hero this style actually wants — and it is also where it most often fails. The
[hero recipe's](../recipes/heroes.md) warning applies doubly here: a busy photograph with text over it
is not luxurious, it is unreadable.

## Where it comes from

Closest existing skill: **`soft`** (the high-end "expensive agency" look). This entry is the Unyson+
mapping — the seven slots in our values — and does not restate its design thinking.

One deliberate departure: we fix the shape language at **zero-to-2px radius**, where the skill is more
permissive. Soft corners plus heavy white space drifts toward a generic wellness aesthetic, and the hard
edge is what keeps it reading as expensive rather than as calm. Where this file and the skill otherwise
disagree, defer to the skill.
