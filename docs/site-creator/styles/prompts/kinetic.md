<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Kinetic Typography

A design-system brief for an AI agent building or restyling an Unyson+ site in the Kinetic preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind/Framer Motion. The mapping table
in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/kinetic.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Kinetic Typography

#### Philosophy

Typography is not decoration — it is the entire visual structure. Text becomes image, the headline is
the hero, and motion is rhythm. The page is a poster brought to life: festival graphics, protest
posters, underground zines.

**The scale ratio is the style.** Where ordinary web design puts 2× between headline and body, this
puts 8–10×. Soften that and the design becomes generic dark mode with a yellow button.

**It is not:** subtle, gentle, centred, rounded, or shadowed.

#### Palette

| Role | Value | Measured on the ground |
|---|---|---|
| Ground | `#09090B` | Rich black, not pure |
| Foreground | `#FAFAFA` | Off-white — **~15:1** |
| Muted text | `#A1A1AA` | **7.7:1** |
| Accent | `#DFE104` | Acid yellow — **14.1:1** |
| Border | `#3F3F46` | Structural lines only |

Black on the accent is **14.9:1**. Unusually for these presets, every pairing here is safe — the risk
in this style is motion, not contrast.

#### Typography

**Space Grotesk** (Inter as fallback). ALL display text uppercase with `tracking-tighter` and
`leading-[0.8]`. Body stays sentence case and **larger than normal web** — 18–24px.

Scale, stated plainly:

- display `clamp(3rem, 12vw, 14rem)` — at least one headline must use viewport units
- decorative numerals `6rem`–`12rem`, used as graphic shapes rather than as text
- body `text-lg` to `text-2xl`

#### Shape

`0` radius (2px at the absolute most). Borders `2px` solid in the subtle zinc, never in the foreground
colour. **No shadows at all** — depth comes from colour layering and from oversized muted numerals
sitting behind content.

#### Signature elements

1. **Marquees that run continuously** — at least two, one fast (stats) and one slower (quotes). No
   gradient edge fade; the raw edge is part of it.
2. **Viewport-width typography** — one headline at 10vw or more.
3. **Massive background numerals** in the muted tone, as shapes.
4. **Hard colour inversion on hover** — the card floods accent, text flips black, in one step.
5. **`gap-px` grids** — a coloured container showing through as hairline dividers.
6. **Sticky stacking cards** that slide over one another on scroll.

#### Motion — and the contradiction in the source spec

The source brief says, under anti-patterns: *"Never stop the marquees or add pause-on-hover — motion
is constant."* Its accessibility section says to wrap marquees in a `prefers-reduced-motion` guard.

**These conflict, and the accessibility rule wins.** Constant motion that cannot be stopped is a
vestibular hazard, and "it's the style" is not a reason to ignore the preference. Under reduced
motion: the marquee stops and shows its content statically, the scroll transforms are removed, and the
layout still reads.

Everything else is snappy: 200–300ms, marquees linear, no spring.

### The defects this style produces

1. **Marquees that ignore the motion preference** — the contradiction above.
2. **A marquee that overflows the page** rather than being clipped, widening the document.
3. **Softened scale** — a 3× ratio instead of 8×, which quietly removes the style.
4. **An element inside an inverted card keeping its own colour** — the recurring failure here.
5. **Muted colour used for hierarchy by opacity**, which flattens contrast; use the colour scale.

### Non-negotiables

1. One headline in viewport units.
2. At least two continuous marquees — stopped under reduced motion.
3. Oversized muted numerals as graphics.
4. Hard inversions, never fades.
5. Uppercase display with tight tracking.
6. 8–10× scale ratio.
7. Sharp corners, 2px zinc borders, no shadows.
8. Body text large (18–24px).
9. Marquees clipped so they cannot widen the page.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php kinetic
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.

**Note the third surface.** It is an inversion — an acid band with black type — rather than a darker
step, so a primary button on it would be yellow on yellow. The preset inverts it there, for the same
reason monochrome inverts on its dark band.
