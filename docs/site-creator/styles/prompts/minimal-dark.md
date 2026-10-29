<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Minimalist Dark

A design-system brief for an AI agent building or restyling an Unyson+ site in the Minimalist Dark
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/minimal-dark.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Minimalist Dark

#### Philosophy

**Atmospheric depth.** Interest comes not from saturation or pattern but from carefully stacked layers
of darkness, with a single warm amber glowing in it like an ember. The page breathes — the spacing is
as much the style as the colour.

It feels like working in a perfectly lit room at night: everything visible, nothing straining, a sense
of calm focus.

**It is not:** pure black, harsh, colourful, cold, flat, or editorial. In particular it is **not** the
other two minimalisms in this set — it has a colour accent (unlike Monochrome) and no blue gradients
or heavy rounding (unlike Minimalist Modern).

#### Palette

| Role | Value | Measured on the canvas |
|---|---|---|
| Canvas | `#0A0A0F` | deep slate, warmer than black |
| Raised | `#12121A` | slightly elevated surfaces |
| Card | `#1A1A24` | solid card ground |
| Ink | `#FAFAFA` | **18.92:1** |
| Amber | `#F59E0B` | **9.20:1** |
| Border | `rgba(255,255,255,0.08)` | very subtle by instruction |

**The traps, measured.**

1. **`mutedForeground: #71717A` fails on both of its own surfaces** — **4.09:1** on the canvas and
   **3.57:1** on the card. The spec calls it "secondary text — zinc-500" without measuring it. The
   preset uses **`#8D8D99`** (6.02:1 and 5.26:1). Note the card is *lighter* than the page, so a
   secondary grey that scrapes by outside a card fails inside one — the same trap Bold Typography has.
2. **White on the amber is 2.15:1.** The spec's own `accentForeground: #0A0A0F` is correct at 9.20:1,
   and it is worth saying out loud because an amber button looks dark and is not.
3. **Glow is not contrast.** The ambient glows are the signature, and they are decoration: a blurred
   halo adds no measurable separation. Every pairing has to pass before the glow is applied.

#### Typography

**Space Grotesk** for display, **Inter** for body, **JetBrains Mono** for labels and metadata.
Headlines take `-0.025em`; labels take `+0.025em`. Hierarchy comes from size and weight, never from
colour variation — that is what keeps the page calm.

#### Shape, surface and glow

- Radius **8px** default, 12px cards, 16px hero elements. Softer than sharp, nowhere near a pill.
- **Glass cards**: a semi-transparent fill with backdrop blur and a 10–15% border. The layered,
  floating effect depends on the fill staying *low*, because a glass panel over a glow is much
  lighter than the same panel over the canvas.
- **Ambient glows**, not drop shadows: `0 0 20px` of amber at ~40% on hover, soft orbs behind hero
  elements. Light bleeding through darkness rather than an object casting a shadow.
- **Generous breathing room.** Large section padding; content floats rather than crowds. Taking the
  spacing out is the quickest way to lose the premium quality.

### The defects this style produces

1. **The spec's muted grey**, which fails on both surfaces.
2. **White on the amber.**
3. **Glow standing in for contrast.**
4. **Pure black**, which flattens the layered-slate depth into an ordinary dark theme.
5. **Tightening the spacing**, which removes the calm the style is made of.
6. **A second accent.** One warm colour against cool darkness is the whole idea; two make it a theme.

### Non-negotiables

1. Deep slate, never `#000000`.
2. Canvas colour on the amber, never white.
3. Secondary text re-measured against *both* the page and the card.
4. Soft rounding, 8–16px.
5. Glass fills kept low, measured against the glow behind them.
6. Ambient glows, not drop shadows.
7. Generous section padding.
8. One accent only.
9. Hierarchy by size and weight, not colour.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `minimal-dark`. Applying it writes the palette, the
type stack and scale, the radius, the three surfaces, the measure, the footer chrome and the page
colour. The glass fills, the ambient glow orbs and the backdrop blur are markup, not stored values, so
they stay here for the agent to build.
