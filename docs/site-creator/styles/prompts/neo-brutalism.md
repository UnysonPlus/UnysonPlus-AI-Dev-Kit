<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Neo-brutalism

A design-system brief for an AI agent building or restyling an Unyson+ site in the Neo-brutalist
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/neo-brutalism.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Neo-brutalism

#### Philosophy

The digital punk rebellion against polished SaaS design. Raw structural honesty crossed with Pop Art
saturation and the sticker culture of the early web.

**If it does not have a border, it does not exist.** Structure is enforced with thick black lines, and
shadows are solid blocks of ink offset at 45° with zero blur. Elements behave like physical objects:
buttons **press down** into their own shadow, cards **lift**, stickers sit at slight angles.

It is "ugly-cool" — ugly by polished standards, deliberate by intention. Confidence is required; there
is no room for timidity.

**It is not:** minimal, smooth, subtle, polished, or corporate.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Canvas | `#FFFDF5` | Warm cream, like aged newsprint |
| Ink | `#000000` | Pure black — every border, every shadow, every word |
| Accent | `#FF6B6B` | Hot red |
| Secondary | `#FFD93D` | Vivid yellow |
| Muted | `#C4B5FD` | Soft violet |

**The trap, measured.** The source spec lists white as the text colour for *"black sections and accent
buttons"*. On a black section that is right. **On the accent colours it is not:**

| Fill | White | Black |
|---|---|---|
| Red `#FF6B6B` | **2.78:1** fails | **7.6:1** passes |
| Yellow `#FFD93D` | **1.38:1** fails badly | **15.3:1** passes |
| Violet `#C4B5FD` | fails | **11.4:1** passes |

The style's own rule — *"never use subtle grays; it's black or a colour"* — points the right way:
**black on every colour fill, white only on the black sections.** These are highlighter colours, and
highlighters are meant to be written on in black.

#### Typography

**Space Grotesk**, heavy weights only: Black (900) for headings, Bold (700) for body and buttons.
Regular is effectively forbidden — lightness reads as timid here.

Display 96–128px with `leading-[0.85]` and tight tracking. Uppercase for headings, labels and buttons.
**Text stroke** (`-webkit-text-stroke: 2px black` with transparent fill) for hollow display type.

#### Shape and shadow

`0` radius — or `rounded-full` for a pill badge. Nothing between.

Borders **4px black** by default; 2px for minor separators, 8px for major divisions.

Hard shadows, zero blur, always down-right: `4px`, `8px`, `12px`, `16px`.

#### The physics — the part that makes it work

- **Buttons press**: `active:translate(2px,2px)` with the shadow removed, so the element moves into
  the space its own shadow occupied.
- **Cards lift**: `hover:translateY(-4px)` with the shadow *growing*.
- **Stickers rotate**: 1–3° on badges and text blocks, so the grid never feels mechanical.

#### Texture (required)

Never a flat background: halftone dots, a graph-paper grid, or SVG noise. The density is the point.

### The defects this style produces

1. **White text on a colour fill** — the table above.
2. **A soft shadow**, which instantly reverts the style to ordinary card design.
3. **A mid-grey** anywhere — it must be black or a colour.
4. **Rotation without a counter-rotation** on content that needs to read straight.
5. **An element inside the black section keeping its own colour** — the recurring failure here.

### Non-negotiables

1. 4px black borders on everything visible.
2. Hard offset shadows only, never blurred.
3. Black text on every colour fill.
4. Buttons press into their shadow; cards lift.
5. Heavy weights only.
6. Sharp corners or full pills, nothing between.
7. Visible background texture.
8. Slight rotations on stickers and badges.
9. Cream canvas, never white.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php neo-brutalism
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.

**One thing the preset solves with scoped CSS rather than a role.** The same Primary drives both the
button fill and the site title, and this Primary is a highlighter red: 2.72:1 as text on the cream.
It cannot be darkened, because a colour dark enough to read on cream is too dark to carry the black
label the style requires. So the fill keeps the red and the two chrome elements take the ink.
The 4px border and the hard offset shadow also ship as preset CSS, since neither is a Theme Settings
value.
