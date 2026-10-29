<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Maximalism

A design-system brief for an AI agent building or restyling an Unyson+ site in the Maximalism preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/maximalism.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Maximalism

#### Philosophy

More, louder, and on purpose. Five saturated accents over a cosmic purple-black, stacked hard
shadows in two or three colours at once, type at poster scale. The void is what makes it work — it is
the only quiet surface, and everything pops because it has somewhere to pop *from*.

The discipline, and it is a real one: **chaos in the decoration, order in the contrast.** The spec
says this itself — white on the void for all critical text, 19.5:1 — and it is right.

**It is not:** restrained, pastel, soft, or blurred.

#### Palette

| Role | Value | As text on the void | Under white |
|---|---|---|---|
| Void | `#0D0D1A` | — | — |
| White | `#FFFFFF` | **19.27:1** | — |
| Magenta | `#FF3AF2` | 6.55:1 | **2.94:1** |
| Cyan | `#00F5D4` | 13.78:1 | **1.40:1** |
| Yellow | `#FFE600` | 15.21:1 | **1.27:1** |
| Orange | `#FF6B35` | 6.80:1 | **2.84:1** |
| Purple | `#7B2FFF` | 3.39:1 | 5.69:1 |

**The trap, measured, and it is beautifully symmetrical.** Of the five accents, **only the purple
carries white**. The other four fail badly under it — and all five read well as *type on the void*.

So the rule here is absolute and easy to remember: **a colour is either a fill with the void on it,
or it is type on the void. Never white on a fill.** The purple is the single exception, which is why
it is the right colour for the one place a white label is unavoidable.

#### Typography

**Unbounded** for headings — wide, loud, and built for this — with **DM Sans** for body, which stays
deliberately plain so the text remains readable inside the noise. Outfit is an acceptable substitute
for the headings; Bungee and Bangers belong in decoration, not in a paragraph.

Headings run to 96px and beyond.

#### Shape and shadow

**Radius 0.** The **stacked hard shadow** is the whole visual argument: two or three solid offsets in
different accents, with no blur, so an element appears to have been printed three times in
misregistration.

```
8px 8px 0 #7B2FFF, 16px 16px 0 #FFE600
```

A blur anywhere turns it back into an ordinary card, and the style has nothing else to lean on.

Patterns — dot grids, gradient bars across three accents, repeating marquees — fill what the stacked
shadows leave.

### The defects this style produces

1. **White on any fill but the purple.**
2. **A blurred shadow.**
3. **A rounded corner.**
4. **Using every accent at once in one view**, which produces mud rather than maximalism — a view
   needs one dominant colour and the rest as support.
5. **Letting the chaos reach the body text.** The paragraph is the one place that stays plain.

### Non-negotiables

1. Cosmic void background.
2. White on the void for all critical text.
3. The void colour on every fill except the purple.
4. Radius 0.
5. Stacked hard shadows in accent colours.
6. Unbounded for display, DM Sans for body.
7. Poster-scale headings.
8. A visible pattern.
9. One dominant accent per view.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `maximalism`, and it carries the stacked hard shadow
and the press as preset CSS. Verified by rendering on `localhost/testsite/` and running a contrast
pass over every visible text node.
