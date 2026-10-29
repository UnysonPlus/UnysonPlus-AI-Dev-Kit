<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Art Deco

A design-system brief for an AI agent building or restyling an Unyson+ site in the Art Deco preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/art-deco.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Art Deco

#### Philosophy

**Maximalist restraint.** Not minimal — every element is ornamental — but each ornament is precisely
placed. The style rejects soft curves for hard edges, sharp angles and geometric repetition, in the
language of the machine age meeting high society.

Verticality and ceremony: skyscraper proportions, bilateral symmetry, content radiating from a centre
line. Where most of these presets prize asymmetry, this one is deliberately **symmetrical** — the
balance is the point, like the facade of a cinema palace.

**It is not:** soft, casual, asymmetric, or understated.

#### Palette

| Role | Value | Measured on the ground |
|---|---|---|
| Ground | `#0A0A0A` | Obsidian |
| Card | `#141414` | Charcoal, one step up |
| Cream | `#F2F0E4` | **17.3:1** |
| Gold | `#D4AF37` | **9.4:1** — comfortable |
| Pewter | `#888888` | **5.6:1** |
| Midnight | `#1E3D59` | Cream on it: **9.7:1** |

Black on gold is **10:1**. Unusually, the *text* pairings here are all safe.

**The trap is a border, not a colour.** The source spec puts the card's resting border at **gold at
30% opacity**. Composited over the charcoal card that is about **2:1** — below the **3:1** minimum for
a non-text indicator, which means a card whose only resting affordance is that border is effectively
unbordered until hovered. **Resting gold borders need ~60% opacity** (≈3.95:1); keep the brightening
on hover as an *enhancement*, not as the thing that first makes the element visible.

#### Typography

- **Marcellus** (or Italiana) — headings. Roman structure with Deco flair.
- **Josefin Sans** — body. Geometric, vintage, readable.

All-caps display with **`tracking-widest` (~0.2em)** — this is fundamental, not optional. Headings
imposing; body comfortable at `text-lg` with relaxed leading.

#### Shape

`0` radius, or `2px` at the absolute most. Borders are thin and precise — `1px`, or doubled. **Stepped
(ziggurat) corners** via pseudo-elements are the signature shape.

#### Effects

**Glows, not drop shadows.** `box-shadow: 0 0 15px rgba(212,175,55,0.2)` — backlit signage rather than
elevation. A metallic sheen on gold elements comes from a linear gradient (light gold → gold → dark
gold), which is the one gradient this style permits.

A faint grain or diagonal crosshatch at 3–5% adds vintage print quality.

#### Signature elements

1. **Rotated diamonds** — icons in 45°-rotated squares, with the content **counter-rotated** so it
   stays upright. A tilted numeral reads as a mistake.
2. **Roman numerals** — I, II, III for steps and tiers, in the display serif.
3. **Corner brackets** — small L-shaped rules at opposite corners of cards, 2px, inset slightly.
4. **Sunburst radials** — gold at 10–20% emanating from the hero's focal point.
5. **Measured dividers** — a short gold rule above and below a section heading, never full width.
6. **Double frames** — a gold outer border with an inset dark inner border around media.

#### Motion

Theatrical and mechanical — elevator doors, not easing curves with personality. 300ms for feedback,
500ms for a reveal, `ease-out`. Cards lift 2px and their border brightens. Honour
`prefers-reduced-motion`.

### The defects this style produces

1. **A 30%-opacity gold border as the resting state** — the ~2:1 failure above.
2. **A rotated container without a counter-rotated child**, so text sits at 45°.
3. **Drop shadows substituted for glows**, which immediately reads as generic dark mode.
4. **Tracking dropped from the display caps**, which is most of what makes it Deco.
5. **An element inside the midnight-blue or gold fill keeping its own colour** — the recurring failure.

### Non-negotiables

1. Obsidian ground, charcoal cards, one gold.
2. `0`–2px radius only.
3. Resting gold borders at ~60%, never 30%.
4. All-caps display with 0.2em tracking.
5. Glows, never drop shadows.
6. Counter-rotated content inside rotated diamonds.
7. Roman numerals for sequences.
8. Corner brackets and measured dividers.
9. Symmetry, deliberately.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php art-deco
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
