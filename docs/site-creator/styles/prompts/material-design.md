<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Material You (Material Design 3)

A design-system brief for an AI agent building or restyling an Unyson+ site in the Material You
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/material-design.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Material You

#### Philosophy

Personal, adaptive, spirited. A move away from the rigid paper-and-ink metaphor toward **tonal
surfaces**, organic shapes and generous rounding. Friendly and approachable rather than clinical;
colour arrives through whole tinted surfaces rather than through accent highlights alone.

**It is not:** stark, rectangular, harsh, or white.

#### Palette (purple seed `#6750A4`)

| Role | Value | Measured |
|---|---|---|
| Surface | `#FFFBFE` | Warm off-white — **never pure white** |
| On surface | `#1C1B1F` | ~16.8:1 |
| Primary | `#6750A4` | carries white at **6.4:1** |
| Secondary container | `#E8DEF8` | with `#1D192B`: **13.3:1** |
| Tertiary | `#7D5260` | carries white at **6.4:1** |
| Surface container | `#F3EDF7` | cards |
| Outline | `#79747E` | borders |

**The trap is the tonal system itself.** `#F3EDF7` against `#FFFBFE` is **1.12:1** — a boundary that
is essentially invisible. The source spec says to separate containers with tone and *not* with
borders, which means the **elevation shadow is doing the accessibility work, not the decoration**.

So: a card may rely on tone *plus* shadow, but **tone alone is not a boundary**. If a surface has no
shadow — a flat section, a printed stylesheet, a high-contrast mode that strips shadows — add the
outline. Treat "no border by default" as "no border *in addition to* elevation".

#### Typography

**Roboto**, 400/500/700. Medium (500) as the default for headings keeps the friendly register —
heavy weights read as a different system entirely.

Display 56px, headline 48/32, title 24, body 16/20, label 14/12. Line-height 1.2–1.3 for display,
1.5–1.6 for body.

#### Shape — the most recognisable thing about it

Generous and consistent:

- **All buttons `rounded-full`.** Pills. Not "quite rounded". This is the single most identifiable
  Material You trait.
- Cards `24px`; hero and major containers `32–48px`; icon containers `12–16px`.
- Inputs are the filled text field: **top corners rounded, bottom corners square**, with a 2px bottom
  border that turns primary on focus.

#### State layers

Hover and press are **opacity overlays**, not colour swaps:

- solid fills: hover = base at 90%, active = 80%
- transparent elements: hover = primary at 10%, focus = 5%

Easing is `cubic-bezier(0.2, 0, 0, 1)` — "emphasised decelerate" — at 200–300ms, with
`scale(0.95)` on press for tactile feedback.

#### Signature elements

1. **Organic blur shapes** — large circles and pills, heavily blurred, in primary/secondary/tertiary
   at 10–30%, positioned partly off-canvas. Without them the surfaces look flat.
2. **Tonal layering** — background → surface container → surface container low.
3. **Pill buttons** everywhere.
4. **Large radii** on major containers — architectural, not merely rounded.
5. **Asymmetric elevation** — the featured tier lifts above its siblings.

### The defects this style produces

1. **Tone as the only boundary** — the 1.12:1 problem above.
2. **Rectangular or lightly-rounded buttons**, which removes the clearest marker of the style.
3. **Pure white backgrounds**, which breaks the tonal system at its root.
4. **Colour swaps on hover** instead of state layers.
5. **Missing blur shapes**, leaving the tinted surfaces looking like flat pastel blocks.

### Non-negotiables

1. Warm off-white surface, never `#FFFFFF`.
2. Every button a pill.
3. Tone plus elevation for boundaries — never tone alone.
4. 24px cards, 32–48px major containers.
5. State layers, not colour changes.
6. Organic blurred shapes present.
7. Filled text fields with a square bottom edge.
8. `cubic-bezier(0.2, 0, 0, 1)`, 200–300ms, `scale(0.95)` on press.
9. Roboto at Medium for headings.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php material-design
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.

**Radius ships as `999`** so every button is a true pill at any height — the single most identifiable
trait of the system — and the preset adds an outline on the tonal surfaces, because tone alone (1.12:1)
is not a boundary.
