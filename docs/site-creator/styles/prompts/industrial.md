<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Industrial Control

A design-system brief for an AI agent building or restyling an Unyson+ site in the Industrial preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/industrial.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Industrial Control

#### Philosophy

The front panel of a well-made machine: a moulded chassis, physical keys, recessed data slots, a
single red alert. Everything is objective and functional, in the Braun / Dieter Rams sense — nothing
is decorative and every control looks pressable.

The lighting is fixed: **a source above and to the left**, so a raised control carries a white
highlight on that side and a dark shadow on the other. That single rule produces the whole look.

**It is not:** flat, colourful, soft, or expressive.

#### Palette

| Role | Value | Measured on the chassis |
|---|---|---|
| Chassis | `#E0E5EC` | the moulded surface |
| Recessed | `#D1D9E6` | slots and wells |
| Ink | `#2D3436` | **10.02:1** |
| Label grey | `#4A5568` | **5.94:1** |
| Highlight | `#FFFFFF` | the lit edge |
| Shadow | `#BABECC` → `#A3B1C6` | the unlit edge |

**The trap, measured.** The alert red `#FF4757` **fails every way** at normal size: **2.64:1** as text
on the chassis, **3.34:1** under white, **3.80:1** under the ink. In a control-panel style the red
*is* a signal, so being unreadable is not a cosmetic problem — it is the one colour that must work.

**`#B82430`** holds the signal quality at **4.98:1** as text and **6.30:1** under white.

#### Typography

**Inter** for everything structural, **JetBrains Mono** for readouts, specifications, status text and
anything numeric. The split is functional: if it is a value a machine produced, it is monospace.

Hero headings take an embossed treatment — a 1px white text shadow below — so the type looks moulded
into the chassis rather than printed on it.

#### Shape and depth

Radius **12px**, consistently. The depth is entirely in the shadows:

```
raised   6px 6px 12px #BABECC, -6px -6px 12px #FFFFFF
pressed  inset 4px 4px 8px #A3B1C6, inset -4px -4px 8px #FFFFFF
```

**Two shadows, never one.** One shadow is a card with a drop shadow, which is the thing this style
defines itself against — the second, lighter shadow on the opposite side is what makes the surface
read as moulded.

### The defects this style produces

1. **The alert red at its given value**, failing in all three directions.
2. **A single shadow**, which collapses the extrusion into an ordinary card.
3. **A dark band keeping the light highlight**, where it reads as a halo rather than as a lit edge.
4. **Sans-serif readouts**, which lose the instrument quality.
5. **A second accent colour.** One red, and only where something needs attention.

### Non-negotiables

1. The chassis grey, never white.
2. The alert red dark enough to read.
3. Two shadows on every raised control, inverted when pressed.
4. 12px radius throughout.
5. Mono for every value.
6. Inter for everything else.
7. Embossed hero type.
8. A recessed surface for data.
9. The light stays top-left everywhere.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `industrial`, and it carries the two-shadow
extrusion, the pressed state and the dark-band correction as preset CSS. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
