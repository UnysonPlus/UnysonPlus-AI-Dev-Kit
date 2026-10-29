<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Sketchbook

A design-system brief for an AI agent building or restyling an Unyson+ site in the Sketchbook preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/sketch.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Sketchbook

#### Philosophy

A page torn from a notebook: warm paper, a soft pencil line, a red correction marker and a blue
ballpoint. Nothing is machine-straight — borders are thick and variable, corners wobble, cards sit a
degree or two off true.

The discipline is that the *content* stays perfectly readable while the *container* looks hand-made.

**It is not:** crisp, corporate, geometric, or flat.

#### Palette

| Role | Value | Measured on the paper |
|---|---|---|
| Paper | `#FDFBF7` | warm, never white |
| Pencil | `#2D2D2D` | **13.33:1** — soft black, never pure |
| Erased | `#E5E0D8` | old-paper fill |
| Ballpoint | `#2D5DA1` | **6.37:1** |

**The trap, measured.** The correction-marker red `#FF4D4D` **fails three ways** at normal size:
**3.16:1** as text on the paper, **3.27:1** under white, **4.21:1** under the pencil ink. No
combination works, which is the signature of a colour picked for vibrancy on screen and never
measured.

**`#D63333`** keeps the marker quality — the saturation stays, the lightness comes down — at
**4.64:1** as text and **4.79:1** under white.

#### Typography

**Kalam** for headings and **Patrick Hand** for body: two handwriting faces, not one, so a heading
reads as a title scrawled across the top rather than as the same pen throughout. Body runs a point or
two larger than usual, because a handwriting face at 16px is harder work than a text face at 16px.

#### Shape — the wobble

A **2px minimum** border in pencil, 3–4px for emphasis, and an **irregular radius**: four different
corner values so no two corners match, swapping on hover so the line appears redrawn. A uniform
radius here reads as an ordinary card with a funny font, which is the whole failure mode of the
style.

Cards rotate a degree on hover. Keep the text inside them upright.

### The defects this style produces

1. **The marker red at its given value**, failing in all three directions.
2. **A uniform radius**, which removes the hand.
3. **A thin border.** 1px is a printed rule, not a pencil line.
4. **Rotating text**, which makes it harder to read for no gain.
5. **Pure white or pure black**, either of which breaks the paper illusion instantly.

### Non-negotiables

1. Warm paper; soft pencil ink.
2. The marker red darkened until it measures.
3. 2px minimum borders.
4. Four different corner radii.
5. Two handwriting faces.
6. Body type a size up.
7. Rotation on containers only.
8. Blue ballpoint for links.
9. Erased-paper fills for quiet surfaces.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `sketch`, and it carries the 2px pencil border and
the irregular radius as preset CSS, since neither is a Theme Settings value. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
