<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Swiss International

A design-system brief for an AI agent building or restyling an Unyson+ site in the Swiss preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/swiss-minimalist.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Swiss International

#### Philosophy

Objective communication, not personal expression. The design recedes so the content speaks, and every
visual decision has to be justifiable by the content's needs.

**The grid is the authority** — and it is visible, drawn with thick borders and faint background
patterns rather than implied by gaps. Typography is the interface: scale, weight and position create
the entire hierarchy, because the typeface itself is a neutral vessel.

The register is architectural: a well-engineered building, a museum wall, a transit map.

**It is not:** decorative, centred, soft, gradient-based or expressive.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Page | `#FFFFFF` | Pure white — the canvas must be neutral |
| Ink | `#000000` | Pure black. **21:1** |
| Muted | `#F2F2F2` | Secondary surfaces for rhythm |
| Swiss Red | `#FF3000` | The **only** signal colour |

**The trap, measured.** Swiss Red on white is **3.70:1**. That clears the 3:1 bar for *large* text and
non-text indicators, and **fails AA for normal-size text**. So:

- Red is correct for **large headlines**, section numerals at display size, rules, and focus rings.
- Red is **wrong** for the small uppercase labels the style loves — a 12px red label on white fails.
- A red button with **white** text is also 3.70:1 and fails. **Black on red is 5.67:1** and passes, so
  the red fill carries black text.

This is counter-intuitive, because red-on-white *looks* emphatic. The rule is: red may be **large or
structural**, never small and readable.

#### Typography

**Inter**, used as a neutral grotesque. Weights are heavy — Black (900) and Bold (700) for headings,
Regular/Medium for body. **UPPERCASE** for almost all headings and labels.

Tracking is bidirectional and both ends matter: `tracking-tighter` on large headlines, `0.2em` on
small labels. Scale is extreme — headlines from `text-6xl` on a phone to `10rem` on a desktop. Let
words become images.

#### Shape and structure

`0` radius, strictly. Borders are **thick and visible** — 2px and 4px — and they define the grid
rather than decorating a box. Keep them 4px even on mobile; thinning them is what makes a Swiss
layout look like a generic one.

#### Texture (required — this is how depth happens without shadows)

No drop shadows at all. Depth comes from four CSS patterns, applied to muted surfaces and never to
black or red areas:

- **grid** 24px lines at ~3%
- **dots** 16px radial matrix at ~4%
- **diagonals** 45°, 10px, ~2%
- **noise** fractal SVG at ~1.5%, applied globally

#### Signature elements

1. **Numbered section labels** — `01. System`, `02. Method`. Numerals in red at a size large enough to
   clear contrast; the words beside them in black.
2. **Asymmetric column ratios** — 8:4, 7:5, 5:7. Never 6:6.
3. **Massive responsive headlines**, scaling to `10rem`.
4. **Geometric compositions** — circles, rectangles and lines arranged deliberately.
5. **Full colour inversion on hover** — a card flips to black or red wholesale, never a gentle fade.
6. **Visible grid patterns** on muted sections.

#### Motion

Instant, mechanical, precise: `150–200ms`, `ease-out` or linear. Colour inversions snap. Icons rotate
90°. Nothing eases gently and nothing springs. Honour `prefers-reduced-motion`.

### The defects this style produces

1. **Small red text** — the 3.70:1 failure above, in the exact place the style most wants it.
2. **White on the red fill**, also 3.70:1. Use black.
3. **Thin borders on mobile**, which quietly converts the style into an ordinary responsive page.
4. **Symmetric columns**, which removes the dynamic tension the asymmetry exists to create.
5. **An element inside an inverted block inheriting that block's colour** — the recurring failure
   across every preset here.

### Non-negotiables

1. Pure white, pure black, one red.
2. `0` radius; 2–4px visible borders at every breakpoint.
3. Red large or structural, never small and readable.
4. Black text on red fills.
5. Asymmetric ratios only.
6. Uppercase headings with bidirectional tracking.
7. At least one visible background pattern.
8. Inversions snap; no soft fades.
9. Numbered section labels throughout.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php swiss
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
