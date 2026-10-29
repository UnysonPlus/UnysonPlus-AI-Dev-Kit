<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Enterprise SaaS

A design-system brief for an AI agent building or restyling an Unyson+ site in the Enterprise preset.
The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/enterprise.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Enterprise SaaS

#### Philosophy

Professional authority with modern warmth — the register of a platform a company buys rather than an
app it downloads. Depth comes from large blurred gradient orbs behind the content and from a single
indigo-to-violet gradient used on the things that matter.

**It is not:** playful, stark, experimental, or grey.

#### Palette

| Role | Value | Measured on the page |
|---|---|---|
| Page | `#F8FAFC` | a cool near-white |
| Card | `#FFFFFF` | raised elements |
| Ink | `#0F172A` | **17.06:1** |
| Indigo | `#4F46E5` | **6.01:1**, and 6.29:1 under white |
| Violet | `#7C3AED` | 5.45:1, and 5.70:1 under white |
| Emerald | `#10B981` | 2.42:1 |
| Muted | `#64748B` | 4.55:1 |
| Hairline | `#E2E8F0` | — |

**What this palette gets right, and the one thing to watch.** Indigo and violet both work as fills
*and* as text, which is unusual in this set and is what makes the gradient safe to use on a button.
The **emerald does not**: white on it is **2.54:1** while the slate ink is 7.04:1. It is a success
indicator — a tick, a status dot — not a button role, which is how the spec uses it anyway.

Muted text at **4.55:1** sits on the AA line with nothing to spare; the preset darkens it to
`#556175` so a later change to the page tint cannot push it under.

#### Typography

**Plus Jakarta Sans** throughout — geometric with friendly rounded terminals, which is precisely the
balance the style is after. ExtraBold for headings, SemiBold for subheads, regular for body.

#### Shape and depth

Radius **12px**, pills for badges and some buttons. The primary action carries the indigo-to-violet
gradient with a slight shadow, lifting `2px` on hover.

**Background orbs**: large gradient circles under a heavy blur, placed so they tint a section rather
than draw attention. Without them the near-white page reads as empty rather than as spacious.

**Gradient text** on one headline phrase via `background-clip`, never on a whole heading.

### The defects this style produces

1. **White on the emerald.**
2. **Muted text left at the spec's value**, which has no margin.
3. **Gradient on everything**, which turns the signature into wallpaper.
4. **No orbs**, leaving a flat white page.
5. **Grey instead of slate.** The ink and the muted are blue-shifted; a neutral grey beside them
   looks like a bug.

### Non-negotiables

1. Cool near-white page, white cards.
2. Slate ink on the emerald.
3. Muted text with margin.
4. 12px radius; pills for badges.
5. The gradient on primary actions and one headline phrase.
6. Blurred orbs present.
7. Plus Jakarta Sans at three weights.
8. 1px hairlines.
9. A 2px lift on hover, nothing more.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` ships this preset** as `enterprise`. Verified by rendering on
`localhost/testsite/` and running a contrast pass over every visible text node.
