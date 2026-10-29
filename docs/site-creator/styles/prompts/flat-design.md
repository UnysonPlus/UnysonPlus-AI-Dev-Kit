<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Flat Design

A design-system brief for an AI agent building or restyling an Unyson+ site in the Flat preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/flat-design.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Flat Design

#### Philosophy

No artifice. The Z-axis does not exist: no drop shadows, no bevels, no realistic gradients, no
texture. Hierarchy comes entirely from **size, colour and typography**.

This is not minimalism for its own sake — it is **confident reduction**. Visual interest comes from
solid blocks of colour, strict grid alignment and dramatic scale, in the manner of poster design.

**It is not:** shadowed, blurred, gradient-filled, or floating.

#### Palette — and the problem the source spec gets wrong

| Role | Value |
|---|---|
| Page | `#FFFFFF` |
| Ink | `#111827` |
| Primary | `#3B82F6` |
| Secondary | `#10B981` |
| Accent | `#F59E0B` |
| Muted | `#F3F4F6` |

The source brief says *"White text on Blue 500 is okay, but check carefully with lighter accents."*
**Measured, white is not okay on any of them:**

| Fill | White text | Ink `#111827` text |
|---|---|---|
| Blue `#3B82F6` | **3.68:1** — fails AA | **4.79:1** — passes |
| Emerald `#10B981` | **2.56:1** — fails badly | **9.1:1** — passes |
| Amber `#F59E0B` | **2.15:1** — fails badly | **9.8:1** — passes |

So the rule for this preset is blunt: **dark ink on every vibrant fill, never white.** This is the
single most consequential correction to make, because the style's whole premise is full-bleed colour
sections — and white-on-colour is the reflex that would make every one of them non-compliant.

White remains correct on the **dark** section (`#111827`), where it is ~16.9:1.

#### Typography

**Outfit** — a geometric sans that echoes the shapes. Headings Bold (700) or ExtraBold (800) with
`-0.02em`. Body Regular. Labels Medium/SemiBold, often uppercase and tracked.

#### Shape

`rounded-md` (6px) or `rounded-lg` (8px), used **consistently**. Not pills, except for tags. Borders
are generally absent — background colour defines the edge. Where a border is needed, `2px`, or `4px`
on an outline button for boldness.

#### Shadows

**None. At all.** This is the defining constraint. Depth is impossible, so hierarchy has to be carried
by scale and colour, which is the discipline of the style.

Gradients are permitted only as a faint directional background decoration, never on a button or card,
and never vibrant.

#### Signature elements

1. **Full-section colour blocks** — blue, emerald, amber and a near-black section, in sequence.
2. **Large decorative geometric shapes** at low opacity in section backgrounds — circles and rotated
   squares, poster-style.
3. **Multi-colour stats**, each figure in a different accent.
4. **Icons in solid circles** — a white circle holding a coloured icon.
5. **Scale feedback** — `hover:scale-105` on buttons, `1.02` on cards. Never a shadow.
6. **Thick outline buttons** — `border-4`, filling with their colour on hover.

#### Motion

Digital and snappy: `200ms`, `300ms` for larger transforms. Feedback is scale, colour shift or fill —
never elevation. Honour `prefers-reduced-motion` by dropping the scale.

### The defects this style produces

1. **White on a vibrant fill** — the table above. The reflex is wrong on all three colours.
2. **A shadow creeping back in** to signal elevation, which is the one thing the style forbids.
3. **Focus rings that vanish** — without shadows there is no other affordance, so the ring must be a
   solid high-contrast outline with offset.
4. **An element inside a colour block keeping its own text colour** — the recurring failure here.
5. **Inconsistent radii**, which reads as sloppy rather than deliberate in a style this plain.

### Non-negotiables

1. Zero shadows, anywhere.
2. Dark ink on every vibrant fill.
3. One radius value used consistently.
4. Full-section colour blocking.
5. Decorative geometry at low opacity.
6. Scale, not elevation, as hover feedback.
7. Solid high-contrast focus rings.
8. Bold geometric type.
9. `border-4` on outline buttons.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php flat-design
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.

**One departure from the brief, forced by measurement.** The theme paints the skip link and body
links with the Primary role, so Primary has to work as a fill *and* as text. `#3B82F6` does neither —
it is 3.68:1 on white in both directions and only passes with the ink on it. The preset therefore uses
`#1D4ED8` (6.70:1 either way) as the role, and keeps the brighter blue for the large decorative shapes
the brief describes.
