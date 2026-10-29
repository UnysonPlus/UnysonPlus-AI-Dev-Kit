<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Botanical

A design-system brief for an AI agent building or restyling an Unyson+ site in the Botanical preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/botanical.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Botanical

#### Philosophy

Rice paper, pressed leaves and a herbarium plate. The palette is drawn from plant matter rather than
from a colour wheel — forest, sage, clay, stone — and the page is quiet enough that a single
photograph or illustration carries it.

**It is not:** bright, cool-toned, glossy, or busy.

#### Palette

| Role | Value | Measured on the paper |
|---|---|---|
| Paper | `#F9F8F4` | warm alabaster, not stark white |
| Forest | `#2D3A31` | **11.22:1** — the ink, softer than black |
| Sage | `#8C9A84` | 2.79:1 |
| Clay | `#DCCFC2` | a surface, 1.44:1 |
| Stone | `#E6E2DA` | borders, very low contrast by design |

**The trap, measured.** The spec names the sage as *"Primary/Accent — for buttons, highlights,
icons"*, and the sage **cannot be a role**: 2.79:1 as text on the paper, 2.97:1 under white, 4.01:1
under the forest ink. It fails every way round at normal size.

The spec's own primary **button** is deep forest with white at **11.92:1**, which is the giveaway —
forest is the role, and the sage is what it actually is: a surface, a border, an illustration colour.
Secondary text takes a deeper sage, `#5A6B55` (**5.39:1**).

#### Typography

**Playfair Display** for headings and **Source Sans 3** for body — a transitional serif against a
humanist sans, classic and modern at once. Generous leading; the measure stays short.

#### Shape and texture

**Pills** — the primary button is `rounded-full` — with thin 1px borders in stone. A fine fractal
noise at low opacity gives the paper a tooth; without it the warm off-white reads as a flat tint
rather than as a sheet.

### The defects this style produces

1. **Sage as a text or button colour** — it fails in all three directions.
2. **A cool grey anywhere.** Every neutral here is warm; one cool grey reads as a different page.
3. **Pure white**, which removes the paper.
4. **Sharp corners**, which fight the organic register.
5. **A second bright colour**, which turns a herbarium into a garden centre.

### Non-negotiables

1. Warm paper, never white.
2. Forest as the role; sage as a surface.
3. Secondary text darkened until it measures.
4. Pills.
5. Thin stone borders.
6. Paper texture present.
7. Playfair over Source Sans.
8. Short measure, generous leading.
9. Warm neutrals only.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `botanical`. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
