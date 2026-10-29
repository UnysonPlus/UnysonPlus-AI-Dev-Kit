<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Terminal

Follows the model in [`README.md`](README.md).

## The idea

A console: monospace throughout, a near-black ground, phosphor-green or amber text, square everything,
and chrome that reads as a prompt rather than as a navbar. It suits developer tools, security products,
CLIs, and side projects whose audience lives in a terminal all day and reads this as home.

**Reach for a different one** for anything with a non-technical buyer. Monospace at body size is
genuinely harder to read — the uniform widths that make code scannable make prose slower — so a terminal
site with three paragraphs of marketing copy costs its own argument. Use it where the audience is right,
not where the aesthetic is fun.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | Ground `#0c0f0d`, text `#c8d3c8`, Accent phosphor `#39ff88` (or amber `#ffb000` — pick one and keep it), muted `#5f6b5f` |
| **Type** | **One monospace family**, everywhere. Headings `variation: 700` and larger; body `size: 15`, `line-height: 1.7` — monospace needs more leading than a proportional face |
| **Buttons** | `border_radius: 0`, 1px accent rule, transparent fill; hover inverts to solid accent with dark text. Labels in `[brackets]` or with a `$` prefix if the brand carries it that far |
| **Shape** | `border_presets`: radius `0`, border `1px` in a dim green-grey (`#1e2a22`), shadow none |
| **Surfaces** | Ground, and a slightly raised `#121714` for blocks |
| **Rhythm** | Container **Medium** — a terminal is a column, not a canvas. Consistent `gap_scale`, no generous air; density is the point |
| **Motion** | **Instant.** A caret blink at most, and only if it is a real caret |

Values follow [`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md),
structurally as in [`monochrome.md`](monochrome.md); the regen step applies.

### Two things to get right

- **Contrast on phosphor.** `#39ff88` on `#0c0f0d` passes comfortably, but accent-coloured *body* text
  does not stay comfortable for long. Keep the accent for headings, links and marks; body stays
  `#c8d3c8`.
- **Monospace body size.** 15px monospace reads roughly like 16px proportional. Going smaller for
  authenticity costs real legibility, and the people who like this style are the ones reading the most.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial**, flush left — a prompt line, not a billboard | Media-backed |
| [Navbar](../recipes/navbars.md) | **Classic bar**, `sticky` | Pill or card |
| [Feature grid](../recipes/feature-grids.md) | **Card grid** with the 1px dim rule — they read as output blocks | Bento |
| [CTA](../recipes/ctas.md) | **Banner strip** — a single command line | Centred block |
| [Footer](../recipes/footers.md) | **Minimal bar** | Link columns |
| [Marquee](../recipes/marquees.md) | None | — |

## Where it comes from

**No existing skill matches.** `brutalist` is the nearest in hardness but is print-derived and light-ground;
this is screen-derived and dark. A full entry.
