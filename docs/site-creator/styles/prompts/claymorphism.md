<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Claymorphism

A design-system brief for an AI agent building or restyling an Unyson+ site in the Claymorphism
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/claymorphism.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Claymorphism

#### Philosophy

**Digital clay.** Objects that feel dense and substantial rather than hollow — not the extruded
plastic of neumorphism, and not flat vector art with rounded corners. The difference is the lighting:
a soft diffused source above and to the left, deep ambient occlusion beneath each object, and a gentle
specular highlight along its upper ridge.

The physics are the style, and they come in two states:

- **Convex — the bulge.** Buttons, stat orbs, feature cards push *out* toward the viewer. They catch
  light on the top-left edge and drop a soft coloured shadow below.
- **Concave — the press.** Inputs, active buttons, open panels are pressed *into* the surface with
  inset shadows on the top edge and light caught on the bottom lip.

Interaction is exaggerated and physical: buttons squish (`scale(0.92)` plus a pressed shadow), cards
lift toward the viewer, everything gives feedback.

**It is not:** flat, sharp, monochrome, neumorphic, or subtle.

#### Palette

| Role | Value | Measured on the canvas |
|---|---|---|
| Canvas | `#F4F1FA` | pale cool lavender-white — never pure white |
| Ink | `#332F3A` | soft charcoal — **11.69:1** |
| Muted | `#635F69` | **5.58:1** |
| Violet | `#7C3AED` | **5.10:1** |
| Hot pink | `#DB2777` | 4.12:1 |
| Sky | `#0EA5E9` | 2.48:1 |
| Emerald | `#10B981` | — |
| Amber | `#F59E0B` | — |

The spec gets its two text colours **right**, and says so for the right reason: *"never go lighter
than this value"* about the muted grey. That is unusual in this set and worth keeping.

**The trap is the primary button, and it is a gradient.** The spec specifies
`from #A78BFA to #7C3AED` with white on it:

| Stop | White |
|---|---|
| `#A78BFA` (light end) | **2.72:1** — fails badly |
| `#7C3AED` (dark end) | 5.70:1 — passes |

So white is safe on half the button and invisible on the other half. A Theme Settings button is a flat
fill, which sidesteps it — but anywhere the gradient *is* used, check it against the **light** end.
The general rule, same as every gradient in this set: a gradient's contrast is its worst stop, not its
average.

Two more:

- **Sky blue is 2.48:1 on the canvas** — it is a blob and a background colour, not a text colour, and
  white on it is 2.77:1 while the charcoal is 4.71:1.
- **Gradient text** is specified for the hero. Keep it large (40px+), where the 3:1 large-text
  threshold applies, and check it against the lightest stop.

#### Typography

**Nunito** for headings (700/800/900) — the rounded terminals are what make the type match the clay —
and **DM Sans** for body (400/500). Headlines go to `font-black` with tight tracking and a 1.1
line-height; body stays at a relaxed 1.625 with a 60–75 character measure.

#### Shape — the super-rounded rule

Absolute values only, and generous: **48–60px** on large containers, **32px** standard cards, **24px**
medium elements, **20px** buttons and inputs, full circles for stat orbs.

**Never 4–6px.** A small radius reads as generic and instantly undoes the material.

Keep a nested element 8px *less* than its parent, so the curves nest rather than fight.

#### Shadows — the engine

Four layers, every time: a soft **coloured** drop shadow defining distance; a top-left **highlight**;
an inner **rim light**; and, for pressed states, an **inset** pair. A clay button's drop shadow is
tinted with its own hue — `12px 12px 24px rgba(139,92,246,.3)` under a violet button — which is what
separates this from a grey neumorphic panel.

### The defects this style produces

1. **White on the light end of the button gradient** (2.72:1).
2. **A small radius anywhere**, which flattens the clay into an ordinary rounded card.
3. **A neutral grey shadow**, which is neumorphism, not clay.
4. **Sky blue as a text colour.**
5. **Pure white canvas**, which removes the tint the lighting model depends on.
6. **A single flat shadow layer**, which loses the bulge — the object stops looking dense.

### Non-negotiables

1. Tinted canvas, never `#FFFFFF`.
2. Flat fills measured at their worst stop if a gradient is used.
3. Muted text no lighter than `#635F69`.
4. 20px buttons, 32px cards, 48–60px containers; never 4–6px.
5. Nested radii 8px smaller than their parent.
6. Coloured, multi-layer shadows.
7. Convex by default, concave for inputs and pressed states.
8. Squish on press, lift on hover.
9. Nunito over DM Sans.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `claymorphism`. Applying it writes the palette, the
type stack and scale, the 20px button radius, the three surfaces, the measure, the footer chrome and
the page colour, plus the convex clay shadow and the press as preset CSS. The four-layer shadow stack
on cards, the gradient orbs and the background blobs are markup and stay here.
