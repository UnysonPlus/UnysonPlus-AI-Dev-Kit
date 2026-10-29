<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Cyberpunk / Glitch

A design-system brief for an AI agent building or restyling an Unyson+ site in the Cyberpunk preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/cyberpunk.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Cyberpunk / Glitch

#### Philosophy

**High tech, low life.** A digital dystopia rendered on a failing CRT: neon-drenched, gritty,
volatile. The artefacts of analogue-to-digital conversion — scanlines, chromatic aberration, signal
noise — are features, not bugs; the interface should look like it is struggling to contain its data.

Three ideas carry it:

- **The void versus the light.** The background is not merely dark, it is absolute, so that neon does
  not colour an element but *illuminates* it, casting a physical glow.
- **Industrial brutalism.** Hard, angular, utilitarian. **Chamfered 45° corner cuts via `clip-path`**
  replace friendly rounded rectangles — this is the most recognisable shape in the style.
- **Imperfect technology.** Scanlines, RGB splitting and blueprint/HUD-style rules rather than
  decorative frames.

**It is not:** clean, utopian, soft, pastel, or rounded.

#### Palette

| Role | Value | Measured on the void |
|---|---|---|
| Void | `#0A0A0F` | blue-shifted black |
| Card | `#12121A` | — |
| Chrome | `#1C1C2E` | — |
| Ink | `#E0E0E0` | **14.96:1** — never pure white |
| Neon (primary) | `#00FF88` | **14.73:1** |
| Magenta | `#FF00FF` | 6.30:1 |
| Cyan | `#00D4FF` | 11.16:1 |
| Danger | `#FF3366` | 5.57:1 |
| Border | `#2A2A3A` | 1.40 — decorative only |

**The traps, measured.**

1. **Nothing light may sit on a neon fill.** The ink on the primary neon green is **1.02:1** — the
   two colours are the same luminance, which is to say invisible. On magenta it is 2.38:1. A neon
   element always carries **the void colour** as its text: 14.73:1 on green, 6.30:1 on magenta,
   11.16:1 on cyan. This is the single most likely way to destroy this style, because a glowing
   button *feels* dark and is not.
2. **`mutedForeground: #6B7280` fails on every surface in the system** — 4.09:1 on the void, 3.85 on
   a card, **3.46 on the chrome**. The spec describes it as "reduced contrast" and that is exactly
   what it is: below AA everywhere. Secondary text moves to **`#9AA3B2` (7.76:1)**.
3. **Glow is not contrast.** A `box-shadow` halo reads as brightness to the eye and as nothing at all
   to a contrast checker or a viewer who cannot perceive it. Every glow must sit on top of a pairing
   that already passes without it.

#### Typography

- **Orbitron** — headings. Geometric, robotic, `font-black`, uppercase, widest tracking.
- **JetBrains Mono** — body. The terminal register, relaxed leading, slight tracking.
- **Share Tech Mono** — labels, timestamps, badges, at `0.2em` tracking.

H1 runs 60–128px. Everything structural is uppercase.

#### Shape and effects

- **Radius 0.** Softening happens only at 2px on an input, if at all.
- **The chamfer** — an eight-point `clip-path` cutting 10px off each corner — on cards, buttons and
  panels.
- **Neon glow** as stacked box/text shadows: `0 0 5px`, `0 0 10px` at 25% alpha, `0 0 40px` at 20%
  for a hero element.
- **Chromatic aberration** — the same text offset 1px in magenta and 1px in cyan behind the original.
- **Scanlines** — a `repeating-linear-gradient` at ~3% over the whole page.
- **Circuit traces** as a faint decorative SVG, suggesting the hardware under the page.

#### Motion

Volatile by nature, which makes **`prefers-reduced-motion` non-optional here**: a glitch animation is
exactly the flicker that reduced-motion exists to suppress. Build the glitch so that its *static*
state already looks right — the aberration offsets and the chamfer carry the style without a single
frame of animation — and let motion add to it rather than constitute it.

### The defects this style produces

1. **Light text on a neon fill** (1.02:1 on the green).
2. **The spec's own muted grey**, which fails on all three surfaces.
3. **Glow standing in for contrast.**
4. **A rounded corner**, which removes the chamfer and with it the whole register.
5. **Continuous flicker with no reduced-motion path.**
6. **Neon on everything** — if three accents glow at once, nothing is illuminated; the void has to
   stay mostly empty for the light to mean anything.

### Non-negotiables

1. Void background, ink never pure white.
2. The void colour on every neon fill.
3. Secondary text re-measured — `#6B7280` fails.
4. Chamfered corners, radius 0.
5. Scanlines and aberration present but subtle.
6. Glow layered on top of a pairing that already passes.
7. Uppercase, wide-tracked structural type.
8. A static state that reads correctly with all motion removed.
9. One neon dominant per view.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php cyberpunk
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
