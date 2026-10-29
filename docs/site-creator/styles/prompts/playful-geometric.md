<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Playful Geometric

A design-system brief for an AI agent building or restyling an Unyson+ site in the Playful Geometric
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/playful-geometric.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Playful Geometric

#### Philosophy

The antidote to sterile corporate minimalism, built on one structural idea: **stable grid, wild
decoration.** The content — text, forms, anything to be read — stays in clean readable areas, while
the world around it is alive with shape and movement. It references the Memphis Group and then cleans
it up for a screen: the energy without the chaos.

It should feel like a playground or a well-organised sticker book. It invites clicking.

**It is not:** corporate, muted, austere, or chaotic. The grid underneath has to stay stable or the
decoration reads as mess rather than play.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Page | `#FFFDF5` | warm cream, a paper feel — never white |
| Ink | `#1E293B` | slate, softer than black — **14.36:1** |
| Violet | `#8B5CF6` | the brand accent, *as the spec gives it* |
| Pink | `#F472B6` | pop |
| Amber | `#FBBF24` | optimism |
| Mint | `#34D399` | freshness |

Pink, amber and mint rotate as decoration — shapes, icons, an emphasised word — to make a confetti
effect. That rotation is the style's signature and is also why their contrast matters less: they are
**fills behind shapes, not beds for text**.

**The trap, measured — and it is the brand colour itself.** The spec pairs
`accent: #8B5CF6` with `accentForeground: #FFFFFF`, and that is **4.23:1 — it fails AA**. Worse, the
slate ink on the same violet is **3.45:1**, so the fill fails in *both* directions at normal size;
there is no text colour that rescues it. The same violet used as *text* on the cream is **4.16:1** and
fails too.

**`#7C3AED` — one step darker — fixes all three at once:** 5.70:1 under white, 5.60:1 as text on the
cream. That is the value the preset uses for the role, and `#8B5CF6` keeps its job as a decorative
fill, which is what it is good at.

The three confetti colours all fail under white and pass under the slate:

| Fill | White | Slate ink |
|---|---|---|
| Pink `#F472B6` | 2.65:1 | **5.52:1** |
| Amber `#FBBF24` | 1.67:1 | **8.76:1** |
| Mint `#34D399` | 1.92:1 | **7.61:1** |

So anything that carries text on one of them carries the slate.

#### Typography

**Outfit** for headings (700/800) — a geometric sans whose rounded corners read as friendly — and
**Plus Jakarta Sans** for body (400/500). The scale is a 1.25 major third: melodic rather than
dramatic, because the drama here is in the shapes.

#### Shape, shadow and pattern

- Radii **8 / 16 / 24px and full**, deliberately mixed. A "blob" is three corners rounded and one
  square; an arch is a full top with a flat bottom.
- **Borders 2px** — chunky by default.
- **The pop shadow**: `4px 4px 0 #1E293B` with no blur, growing to `6px 6px` on hover and collapsing
  to `2px 2px` when pressed. Solid offset colour, never a soft shadow — that is what makes an element
  read as a sticker rather than a card.
- **Patterns**: a dot grid in strict formation, squiggles as dividers or heading underlines, small
  confetti shapes positioned behind content blocks.

### The defects this style produces

1. **White on the brand violet** (4.23:1) — and darkening the text does not help, because the slate on
   it is 3.45:1. The fill itself has to change.
2. **White on any of the three confetti colours.**
3. **A soft shadow**, which turns a sticker into a card.
4. **Decoration over the content area**, which breaks the stable grid the whole style rests on.
5. **One radius used everywhere**, which removes the mixed-corner play.
6. **All four colours at equal weight**, which reads as noise; one leads and the others confetti.

### Non-negotiables

1. Warm cream page, never white.
2. The violet one step darker as the role; the bright one stays decorative.
3. Slate ink on every confetti fill.
4. Mixed radii, including at least one blob or arch.
5. 2px borders.
6. Hard offset shadows that grow on hover and collapse on press.
7. A visible pattern — dots, squiggles or confetti.
8. The content area stays clean.
9. Outfit over Plus Jakarta Sans, both at their heavier end for headings.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `playful-geometric`. Applying it writes the palette,
the type stack and scale, the radius, the three surfaces, the measure, the footer chrome and the page
colour, and it carries the 2px border and the hard offset shadow as preset CSS, since neither is a
Theme Settings value. The dot grid, the squiggles and the confetti shapes are markup and stay here.
