<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Retro Desktop

A design-system brief for an AI agent building or restyling an Unyson+ site in the Retro preset. The
mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/retro.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Retro Desktop

#### Philosophy

The desktop computer interface of the mid-nineties, rebuilt honestly: a silver chassis, bevelled
controls, a navy title bar, pure-hue links, and the yellow notepad panel. It is not a filter over a
modern page — the whole interface language is four border colours and a 2px bevel.

**It is not:** rounded, shadowed, gradient-heavy, or subtle.

#### Palette

| Role | Value | Measured on the silver |
|---|---|---|
| Chassis | `#C0C0C0` | the button-face grey |
| Ink | `#000000` | **11.54:1** |
| Link blue | `#0000FF` | **4.72:1**, and 8.59:1 under white |
| Navy | `#000080` | 8.80:1 |
| Panel yellow | `#FFFFCC` | the notepad surface |
| Bevel light | `#FFFFFF` | top and left |
| Bevel dark | `#808080` | bottom and right |

**What the spec gets right.** It says plainly: *"no grays for body text."* That is correct and
measurable — `#808080` on the silver chassis is **2.17:1**. The grey exists for the bevel's dark
edge and for nothing else.

**The traps:**

1. **Pure red `#FF0000` is 2.20:1** on the chassis. It is an emphasis colour for the white and yellow
   panels, never body text and never a link on the silver.
2. **The hyperlink blue works both ways** — 4.72:1 as text, 8.59:1 under white — which is why it
   survives as the one accent role. Pure yellow `#FFFF00` at 1.69:1 is a highlight fill with black on
   it, nothing more.

#### Typography

**Archivo Black** for headings stands in for the heavy grotesques of the era, and a plain sans at
14–16px for body — never smaller, which was the one thing the originals got wrong.

#### Shape and the bevel

**Radius 0 everywhere.** The control language is the **2px bevel**:

```
raised   border-color: #FFFFFF #808080 #808080 #FFFFFF
pressed  border-color: #808080 #FFFFFF #FFFFFF #808080
```

White on the top and left, grey on the bottom and right; inverted when pressed. That is the whole
interface, and it is also a genuine affordance — the bevel tells you what is pressable without using
colour at all.

### The defects this style produces

1. **Grey body text** (2.17:1).
2. **Red as a link or body colour** on the silver.
3. **A rounded corner or a soft shadow**, either of which breaks the era instantly.
4. **A bevel that does not invert on press**, which throws away the affordance.
5. **A coloured control on the navy band**, where a blue button separates from its background at
   2.44:1 — the authentic control there is the silver face with black text.

### Non-negotiables

1. Silver chassis; black body text, never grey.
2. The blue as the one accent role.
3. Radius 0.
4. The 2px bevel, inverted on press.
5. Navy title bars; yellow notepad panels.
6. Heavy display type; plain sans body at 14px or more.
7. Red kept to white and yellow panels.
8. No shadows, no gradients outside a title bar.
9. The silver control on dark bands.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `retro`, and it carries the bevel, the inverted
press state and the dark-band control as preset CSS. Verified by rendering on `localhost/testsite/`
and running a contrast pass over every visible text node.
