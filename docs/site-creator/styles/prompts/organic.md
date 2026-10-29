<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Organic

A design-system brief for an AI agent building or restyling an Unyson+ site in the Organic preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/organic.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Organic

#### Philosophy

Earth materials and soft edges: moss, terracotta, sand, raw timber, deep loam. Nothing is rectangular
if it can be rounded, and nothing is saturated if it can be weathered. The feeling is handmade and
unhurried.

**It is not:** sharp, synthetic, cool-toned, or glossy.

#### Palette

| Role | Value | Measured on the paper |
|---|---|---|
| Paper | `#FDFCF8` | rice paper off-white |
| Loam | `#2C2C24` | **13.70:1** |
| Moss | `#5D7052` | **5.24:1** |
| Terracotta | `#C18C5D` | 2.85:1 |
| Sand | `#E6DCCD` | a surface |
| Stone | `#F0EBE5` | a quieter surface |
| Timber | `#DED8CF` | borders |

**What is unusual here, and what still needs fixing.**

**Moss works both ways** — 5.24:1 as text on the paper and 5.38:1 under white. That is rare in this
set: one value serves the link, the icon and the button fill with nothing to reconcile, which is why
it can be the role.

**Terracotta does not** — 2.85:1 as text, 2.93:1 under white — but it passes comfortably under the
loam ink at 4.81:1, so it stays what the spec uses it as: a secondary surface, an outline, a fill
carrying dark text.

The spec's muted `#78786C` is **4.35:1** and just misses AA; `#6B6B60` is 5.25:1.

#### Typography

**Fraunces** for headings — a variable serif with soft axes, old-style warmth in a modern shape — and
**Nunito** for body, where the rounded terminals are essential to match the shapes. Quicksand works
equally well for body if Nunito is unavailable.

#### Shape and texture

**Highly rounded** — pills for buttons, large radii on containers, and blob shapes wherever a
rectangle is not required. A visible paper grain keeps the off-white from reading as a flat tint.

Borders are soft timber at low opacity; cards lift gently rather than snapping.

### The defects this style produces

1. **Terracotta as a text colour or under white.**
2. **The spec's muted grey**, which misses AA by a hair.
3. **A cool grey anywhere.** Every neutral is warm; one cool grey reads as a different page.
4. **Sharp corners**, which contradict the whole premise.
5. **Saturation.** These colours are weathered; brightening one makes the set look synthetic.

### Non-negotiables

1. Rice-paper page, never white.
2. Moss as the role — it is the one colour that works both ways.
3. Loam ink on terracotta.
4. Muted text darkened until it measures.
5. Pills and large radii.
6. Paper grain present.
7. Fraunces over Nunito.
8. Warm neutrals only.
9. Gentle lifts, no snap.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `organic`. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
