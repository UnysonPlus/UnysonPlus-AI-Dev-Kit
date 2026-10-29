<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Neumorphism

A design-system brief for an AI agent building or restyling an Unyson+ site in the Neumorphism
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/neumorphism.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Neumorphism

#### Philosophy

Soft UI: every element is **extruded from the background rather than placed on it**. There is one
surface colour in the whole design, and shape comes only from light — a pale shadow on one side, a
darker one on the other, inverted when something is pressed.

**It is not:** layered, outlined, colourful, or high-contrast by construction.

#### Palette

| Role | Value | Measured on the surface |
|---|---|---|
| Surface | `#E0E5EC` | the one background, everywhere |
| Ink | `#3D4852` | **7.38:1** |
| Light shadow | `#FFFFFF` | — |
| Dark shadow | `#BABECC` | — |

**The traps, measured — and this style has the hardest version of them**, because a near-white
surface is the least forgiving ground there is:

| Spec value | As text on the surface | Under white |
|---|---|---|
| Accent `#6C63FF` | **3.41:1** | **4.32:1** |
| Teal `#38B2AC` | 2.04:1 | **2.58:1** |
| Muted `#6B7280` | **3.82:1** | — |

All three fail. This is the recurring failure of soft-UI palettes: the colours are chosen against a
mid grey in a design tool and then used on a near-white page. The preset uses `#5048D6` (5.12 / 6.48),
`#246B67` (4.92 / 6.22) and `#55606E` (5.05).

There is a second, structural problem the style itself creates: **an extruded element has no border
and no fill difference**, so its boundary is carried entirely by the shadows. That is fine for a
decorative panel and not fine for a control — if the shadows are removed (high-contrast mode, print,
a forced-colours setting) the control disappears. Anything interactive needs a real boundary
underneath the extrusion.

#### Typography

**Plus Jakarta Sans** for headings, **DM Sans** for body. Both are geometric and quiet, which suits a
style where nothing else is competing for attention.

#### Shape and light

Radius **16px** — generous, because a soft extrusion needs a soft corner to look moulded.

```
raised   6px 6px 14px #BABECC, -6px -6px 14px #FFFFFF
pressed  inset 5px 5px 10px #BABECC, inset -5px -5px 10px #FFFFFF
```

The light is fixed top-left. Every element in the design obeys it; a single element lit from the
other side looks broken rather than varied.

### The defects this style produces

1. **All three of the spec's own colours**, failing on its own surface.
2. **A control that exists only as a shadow**, with nothing underneath it.
3. **A second surface colour**, which defeats the extrusion — there is one surface.
4. **The light highlight on a dark band**, where it reads as a halo.
5. **A sharp corner**, which makes the extrusion look like a bug rather than a material.

### Non-negotiables

1. One surface colour everywhere.
2. Every accent re-measured against it.
3. Two shadows, inverted on press.
4. 16px radius.
5. Light fixed top-left.
6. Interactive elements with a boundary that survives without shadows.
7. Quiet geometric type.
8. No outlines competing with the extrusion.
9. Dark bands get their own shadow treatment.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `neumorphism`, and it carries the two-shadow
extrusion, the pressed state and the dark-band correction as preset CSS. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
