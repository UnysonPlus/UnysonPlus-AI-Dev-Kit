<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Academia / Classical

A design-system brief for an AI agent building or restyling an Unyson+ site in the Academia preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/academia.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Academia / Classical

#### Philosophy

Scholarly gravitas and timeless elegance — a centuries-old university library, a Victorian study hall,
a Renaissance manuscript. It works by combining **material references** (aged parchment, dark mahogany,
polished brass, crimson leather) with **traditional typographic craft** and **measured ornament**.

The promise, and the test of whether it succeeded: *this is not a modern dark theme with serif fonts.*
It is a physical library — pages turning, brass catching the light.

**It is not:** minimal, geometric, neutral, or cool-toned.

#### Palette (library at night)

| Role | Value | Measured |
|---|---|---|
| Mahogany (canvas) | `#1C1714` | — |
| Aged oak (surface) | `#251E19` | one layer up, always |
| Worn leather (tertiary) | `#3D332B` | — |
| Parchment (ink) | `#E8DFD4` | **13.48:1** on mahogany |
| Faded ink (secondary) | `#9C8B7A` | 5.40 on mahogany, 5.00 on oak |
| Wood grain (border) | `#4A3F35` | 1.74 — gentle by design |
| Brass (interactive) | `#C9A962` | **7.90:1** |
| Crimson (emphasis) | `#8B2635` | see below |

**The traps, measured.**

1. **Crimson is a fill, never ink.** `#8B2635` on the mahogany is **2.05:1** — as text, a border or an
   icon it is effectively invisible on this canvas. As a *background* carrying parchment it is **6.57:1**
   and excellent. The spec's own uses (a wax seal, a featured tier, the secondary button's hover) are all
   fills, which is why it never notices; the moment it is used as a colour for type the style breaks.
2. **Faded ink on the worn-leather surface is 3.74:1 and fails.** The spec lists `muted` as a tertiary
   background and `mutedForeground` as secondary text without ever pairing them, but the two names
   invite exactly that pairing. Secondary text belongs on the canvas or the oak surface, not on leather.
3. The spec's own target of "8.5:1 for parchment on mahogany" is **understated** — it is 13.48:1. The
   headroom is there; spend it on the small Cinzel labels, which are the type most at risk.

The brass gradient `linear-gradient(180deg, #D4B872, #C9A962, #B8953F)` carries dark ink at
**6.27:1 at its darkest stop**, so a brass button is safe along its whole length.

#### Typography — three serifs, each with a job

- **Cormorant Garamond** — headings. High-contrast old-style, calligraphic.
- **Crimson Pro** — body. A book face, for extended reading at 1.625 line-height.
- **Cinzel** — labels, buttons, drop caps. Engraved all-caps at `0.2em`–`0.3em` tracking.

Weights stay **regular**: 400–500 for headings, italic rather than bold for emphasis. Heavy weights
collapse the contrast the serif is providing.

Two patterns are not optional, because they carry the period:

- **Drop caps** on an opening paragraph — Cinzel, 72px, floated, brass, with a 2px dark shadow.
- **Roman numerals** as section overlines: "Volume I", "Volume II".

#### Shape, ornament and texture

- Radius **4px**. Traditional, not sharp and not soft.
- **The arch top** — `border-radius: 40% 40% 0 0 / 20% 20% 0 0` — a cathedral window, on images and
  decorative containers. This is the single most identifiable shape in the style.
- **Corner flourishes**: 2px brass brackets at two opposite corners of a frame, 40×40px.
- **The ornate divider**: a hairline that fades in from transparent through wood grain to brass at the
  centre, with a glyph sitting on it in a canvas-coloured gap.
- **Engraved text**: `text-shadow: 1px 1px 1px rgba(0,0,0,.4), -1px -1px 1px rgba(255,255,255,.1)`.
- **Aged paper grain** at 3% and a **vignette** to `rgba(28,23,20,.4)` at the edges.
- Images carry `sepia(0.6) contrast(0.95) brightness(0.9)`, clearing to full colour over 700ms on hover.

#### Motion

Slow and dignified — 300ms for cards, 700ms for the sepia reveal. Cards lift on a warm
`0 8px 24px rgba(0,0,0,.3)` and their border warms toward brass. Nothing bounces.

### The defects this style produces

1. **Crimson as a text or border colour** (2.05:1).
2. **Secondary text on the leather surface** (3.74:1).
3. **A heavy serif weight**, which flattens the old-style contrast into a slab.
4. **Ornament everywhere** — flourishes on every card at once read as clip art; they frame *one*
   thing per view.
5. **A grey**. Every neutral here is warm; one cool grey reads as a different page.
6. **An element inside a brass or crimson fill keeping the page's parchment ink** — the recurring
   failure across every preset in this set.

### Non-negotiables

1. Warm neutrals only, never grey.
2. Crimson as a fill, never as ink.
3. Secondary text on the canvas or the oak surface only.
4. Three serifs, each kept to its role.
5. Regular weights; italic for emphasis.
6. The arch top present somewhere.
7. Drop cap and Roman-numeral overlines.
8. 4px radius everywhere else.
9. Grain and vignette present but barely.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php academia
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.

**Crimson ships as the Secondary role, never as ink** — as a button fill carrying white it is 8.65:1,
while as text on the mahogany it is 2.05:1. The preset also raises the muted text on the leather
surface, where the brief's own secondary value is 3.74:1.
