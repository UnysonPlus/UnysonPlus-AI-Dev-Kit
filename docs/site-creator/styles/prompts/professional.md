<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Professional Editorial

A design-system brief for an AI agent building or restyling an Unyson+ site in the Professional
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/professional.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Professional Editorial

#### Philosophy

Editorial gravitas — the register of a serious publication rather than a product page. **Playfair
Display is the cornerstone**: its high contrast between thick and thin, its ball terminals and its
classical proportions establish authority without raising the voice.

Structure comes from **fine rules**, not from boxes. Hairlines create rhythm the way a well-set page
does, and they are warm rather than neutral grey — that single detail is what stops the ivory reading
as a cheap off-white.

**It is not:** loud, colourful, trendy, or boxy.

#### Palette

| Role | Value | Measured on the ivory |
|---|---|---|
| Ivory | `#FAFAF8` | warmer than white |
| Rich black | `#1A1A1A` | **16.65:1** — deep, not harsh |
| Warm grey | `#6B6B6B` | 5.10:1 |
| Muted surface | `#F5F3F0` | warmer than the page |
| Card | `#FFFFFF` | pure white, for lift |
| Hairline | `#E8E4DF` | warm, never neutral |

**The trap, measured.** The spec pairs `accent: #B8860B` with `accentForeground: #FFFFFF`, and the
burnished gold **fails in both directions**: **3.11:1** as text on the ivory and **3.25:1** under
white. There is no label that rescues it, because a single-accent style needs the same value to serve
the link, the rule and the button fill.

**`#8C6A0A`** — the same burnished gold a few steps down — is **4.81:1** as text and **5.02:1** under
white, so one value does all three jobs. The lighter `#D4A84B` stays for gradients and hover, where
nothing has to be read on it.

#### Typography

**Playfair Display** for headings, **Source Sans 3** for body, **IBM Plex Mono** for the small
uppercase labels. Headings stay at regular weight — the face already has presence, and bolding it
turns gravitas into shouting.

#### Shape and structure

Radius **6px** — "not too round, not too sharp." Cards carry a **thin top border** rather than a full
outline, which puts the visual weight at the top of the element the way a rule above a column does.
Everything else is hairlines in the warm border colour.

### The defects this style produces

1. **The spec's own gold**, failing both ways.
2. **A neutral grey hairline**, which makes the ivory look like a mistake rather than a choice.
3. **Bolding Playfair**, which loses the stroke contrast that is the whole point of it.
4. **Boxing content** instead of ruling it.
5. **A second accent.** One gold, used sparingly, or the editorial register collapses.

### Non-negotiables

1. Warm ivory, never white.
2. One gold, dark enough to read as text and to carry white.
3. Warm hairlines.
4. Playfair at regular weight.
5. 6px radius.
6. Rules rather than boxes.
7. Pure white cards for lift.
8. Mono for small labels only.
9. Generous leading on body.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `professional`. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
