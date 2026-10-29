<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Vaporwave

A design-system brief for an AI agent building or restyling an Unyson+ site in the Vaporwave preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/vaporwave.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Vaporwave

#### Philosophy

An infinite purple-black digital space in which everything floats: chrome text, neon tubes, a grid
receding to a horizon, a sun made of gradient bands. Magenta and cyan are not accents here, they are
the light sources.

**It is not:** rounded, soft, subtle, or warm.

#### Palette

| Role | Value | Measured on the void |
|---|---|---|
| Void | `#090014` | near-black with a purple tint |
| Chrome | `#E0E0E0` | **15.57:1** |
| Glass panel | `#1A103C` | deep purple, often at 80% |
| Magenta | `#FF00FF` | **6.55:1** — the hero colour |
| Cyan | `#00FFFF` | **16.39:1** |
| Sunset | `#FF9900` | 9.60:1, used sparingly |
| Border | `#2D1B4E` | muted purple, non-interactive |

**The trap, measured.** Both hero colours are **bright**: white on the magenta is **3.14:1** and on
the cyan **1.25:1**. The void on them is 6.55 and 16.39. As *text* on the void they measure the same
6.55 and 16.39 — so the same two values serve links and fills, which is convenient, because this
style uses them for both. The rule is simply: **a neon fill carries the void, never white.**

#### Typography

**Orbitron** for headings — geometric, wide, unmistakably of the era — and **Share Tech Mono** for
body, buttons, labels and status text. Headings take wide positive tracking and often a cyan glow;
the mono keeps the whole interface reading as a terminal from a film.

#### Shape and light

**Radius 0.** Aggressively geometric and angular; a full circle appears only for a dot.

**Borders are neon light tubes, not dividers** — which is a statement about width as much as colour.
A hairline cannot read as a tube. Interactive edges go cyan or magenta; everything else takes the
muted purple.

Glass panels use the deep purple at around 80% with a backdrop blur, so the grid behind them shows
through.

### The defects this style produces

1. **White on a neon fill** (3.14:1 and 1.25:1).
2. **A rounded corner**, which removes the geometry the style depends on.
3. **A hairline where a tube belongs.**
4. **Both neons at equal weight everywhere**, which flattens the composition — one leads per view.
5. **A warm background.** The purple tint in the black is what makes the neon read as light rather
   than as paint.

### Non-negotiables

1. Purple-black void, never a neutral black.
2. The void colour on every neon fill.
3. Radius 0.
4. Neon borders with real width.
5. Orbitron over Share Tech Mono.
6. Wide tracking on headings.
7. Glass panels over the grid, not over a flat fill.
8. One hero colour leading per view.
9. Chrome, not white, for body text.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `vaporwave`. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
