<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Bauhaus

A design-system brief for an AI agent building or restyling an Unyson+ site in the Bauhaus preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The original expresses every
decision as a utility class — `border-4`, `shadow-[8px_8px_0px_0px_black]`, `bg-[#D02020]` — which is
exactly the shape Unyson+ must *not* store it in: a site whose colours are welded to each element
cannot be re-themed, which is the whole reason the preset model exists. The mapping table in
[`monochrome.md`](monochrome.md) applies unchanged here; this file covers what is specific to Bauhaus.

Preview: `create.unysonplus.com/design-presets/bauhaus/`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md) — a frontend engineer and typographic designer working in
**WordPress with the Unyson+ framework**, applying a design system through **Theme Settings and
presets**, never as styling attached to individual elements.

The governing rule is identical and worth repeating, because this style tempts you to break it more
than most: with three loud colours in play it is very easy to start writing `#D02020` onto buttons.
Put it in the palette role and let the buttons reference it.

### Design system: Bauhaus

#### Philosophy

Constructivist modernism. The page is not laid out, it is **constructed** — from circles, squares and
triangles, in three primaries, bordered in black and stacked with hard offset shadows. Think a 1920s
Bauhaus poster brought to life: bold, asymmetric, architectural, unapologetically graphic.

The discipline is in the limits, not the loudness. Three colours and no fourth. Two radii and nothing
between. No gradient, no blur, no soft effect anywhere — everything is direct and declarative.

**It is not:** soft, friendly, gradient-based, subtle, or a generic framework page with bright colours
dropped in.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Page | `#F0F0F0` | Off-white canvas, not pure white |
| Ink | `#121212` | Text and **every** border |
| Red | `#D02020` | Primary |
| Blue | `#1040C0` | Secondary |
| Yellow | `#F0C020` | Accent |
| Muted | `#E0E0E0` | Quiet fills |

**The one trap, and it is a real failure rather than a nicety.** Measured against these exact values:
white on the red is **5.4:1** and on the blue **8.4:1** — both clear AA. White on the yellow is
**1.7:1**, which fails outright. **Yellow blocks always carry black text.** Decide the text colour from
the block, never from a habit of "white on colour".

#### Typography

One face: **Outfit** (400/500/700/900). Its circular letterforms are the typographic equivalent of the
shapes, which is why the pairing is single rather than a display/body split.

- Headlines: weight **900**, uppercase, `letter-spacing: -0.03em`, `line-height: 0.9`
- Subheadings: weight 700, uppercase
- Body: weight **500** — 400 is too light against this much black
- Labels: weight 700, uppercase, tracked `0.14–0.18em`

Scale is extreme: a display line reaching ~6rem on desktop down to ~2.5rem on a phone.

#### Shape

**Binary radius: `0` or a full circle. Nothing between.** The absence of a gentle 8px corner is what
keeps the page architectural rather than merely colourful, and a single rounded-lg element will undo
it. Apply the zero to every button size and every surface preset.

#### Borders and shadows

- Borders: **2px** on small elements and mobile, **4px** on major divisions and desktop — always
  `#121212`, never a tint.
- Every major section is separated by a **4px black rule**. This horizontal rhythm is the structure;
  without it the colour blocks read as unrelated panels rather than one composition.
- Shadows are **hard offsets**, never blurred: `4px 4px 0 0`, `6px 6px 0 0`, `8px 8px 0 0` in black.
  A blur implies diffuse light and this style has a single hard source — depth is stacking, not glow.

#### Colour blocking

Whole sections commit to one primary; the next section changes it. A page that uses the primaries only
for buttons and small shapes has not implemented this style — **all three must carry a section**, or
the central claim is being made by two colours out of three.

A workable rhythm: paper hero → yellow stats → paper → blue → red → paper → white → yellow close →
near-black footer.

#### Composition

Decorative elements are built from the three primitives and nothing else — overlapping circles, squares
rotated 45°, triangles via `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)`. This is composition, not
stock illustration, and it is the part most often skipped.

The brand mark is the three primitives in the three primaries: the whole system in one object.

**Rotation:** when rotating a container 45°, **counter-rotate its content** so a numeral or label stays
upright. A rotated "3" reads as a mistake.

#### Components

- **Buttons** — solid fill (red, blue, yellow or white), 2px black border, 4px hard shadow, uppercase
  bold tracked. Square or full pill, chosen deliberately. The signature interaction is the **press**:
  `translate(2px, 2px)` with the shadow removed, so the element moves into the space its own shadow
  occupied. Anything softer breaks the illusion.
- **Cards** — white, 4px black border, 8px hard shadow, lifting a few pixels on hover. A small
  geometric mark in the top-right corner, rotating through the three shapes and three colours so no
  two adjacent cards repeat.
- **Accordion** — closed: white with a black border. Open: red header with white text, body on light
  yellow (`#FFF9C4`) above a 4px top border.
- **Stats** — numerals inside bordered geometric containers (circle, square, rotated square).

#### Motion

Mechanical and snappy: **200–300ms**, `ease-out`, no organic easing. The button press, a small card
lift, a chevron rotation. No float, no parallax, no animated patterns. Honour
`prefers-reduced-motion` by dropping the transforms, not merely shortening them.

#### Accessibility

Beyond the yellow rule above:

- Focus is a hard offset ring, switching to white on the red, blue and near-black blocks.
- Touch targets ≥44px.
- The shapes are decorative — keep them out of the accessibility tree (`aria-hidden`).

### The defect this style produces, every time

**An element inside a coloured block inherits that block's text colour.** A white box placed in the
blue section renders a white numeral on white, and a black-bordered button on a black panel disappears
entirely. Both were found on the specimen page, and in both cases the resting measurement looked
perfectly correct.

So: **set the ink colour explicitly on anything whose own background differs from its block**, and
check interactive states by driving them, not by reading the stylesheet.

A second, subtler one: `display: flex` on a list item turns a `<b>` lead-in and the text after it into
two *separate anonymous flex items*, so the bold phrase becomes its own column. Wrap the text in a
single element.

### Non-negotiables

1. Three primaries, no fourth colour.
2. Radius `0` or full circle — nothing between.
3. 4px black rule between every major section.
4. Hard offset shadows only; no blur anywhere.
5. All three primaries carry at least one whole section.
6. Geometry composed from circles, squares and triangles — not stock art.
7. Black text on yellow, always.
8. The button press moves into its own shadow.
9. Counter-rotate content inside rotated containers.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php bauhaus
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
