<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Bold Typography

A design-system brief for an AI agent building or restyling an Unyson+ site in the Bold Typography
preset. The mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/bold-typography.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Bold Typography

#### Philosophy

**Poster design translated to the web.** Typography is not decoration — it is the entire visual
language. Colour exists to create contrast, space exists to frame letterforms, and interaction exists
to reveal typographic detail.

Five rules carry it:

1. **Type as hero.** A well-set 96px headline is more compelling than any stock photograph.
2. **Extreme scale contrast.** 6:1 or greater between the h1 and body text. The gap is the drama.
3. **Deliberate negative space.** The margin is the frame, not leftover room.
4. **Strict hierarchy.** No two elements compete. Headline → subhead → body → action.
5. **Restrained palette.** Black, white and one accent. More dilutes the typographic impact.

The register is a gallery exhibition or a magazine spread, not friendly SaaS.

**It is not:** rounded, shadowed, playful, colourful, or decorated.

#### Palette (dark)

| Role | Value | Measured on the canvas |
|---|---|---|
| Canvas | `#0A0A0A` | near-black, never pure |
| Ink | `#FAFAFA` | **18.97:1** |
| Muted surface | `#1A1A1A` | — |
| Card | `#0F0F0F` | 1.03:1 from the canvas — a tone, not a boundary |
| Border | `#262626` | 1.31:1 — barely-there by design |
| Accent | `#FF3D00` | **5.58:1** |

**The trap, measured — and the source spec states it wrong twice.**

| | Spec claims | Actually |
|---|---|---|
| Muted text `#737373` on the canvas | 5.3:1 ✓ | **4.18:1 — FAILS AA** |
| Accent `#FF3D00` on the canvas | 5.4:1, "AA for large text" | **5.58:1 — passes at any size** |

So the one value the spec vouched for is the one that fails, and the one it hedged on is fine. Secondary
text moves to **`#8C8C8C` (5.89:1)**. Note too that muted text on the *card* tone is worse than on the
canvas (4.04:1 at `#737373`), because the card is lighter — a secondary colour that only just passes on
the canvas fails inside every card.

White on the accent is **3.40:1** and fails; the spec's own `accentForeground: #0A0A0A` is right at
5.58:1. **Never white on the vermillion.**

#### Typography

- **Inter Tight** — headlines. Tighter by default, which is the point.
- **Playfair Display** — pull quotes and testimonials only, for contrast against the sans.
- **JetBrains Mono** — labels, stats, technical detail.

Scale runs 12px to 160px, and the hero statement lives at **128px**. Tracking is `-0.06em` on display,
`-0.04em` on large headings, and **`0.1em`–`0.2em` on all-caps labels** — the wide/tight split is as
much the identity as the size. Line-height `1` for single-line headlines, `1.1` multi-line, `1.6` body.

#### Shape, shadow and depth

**Radius 0 everywhere.** Sharp edges match sharp typography.

**No shadows at all.** Depth is typographic instead:

- **layered type** — oversized muted text behind smaller bright text;
- **a 1–2px offset duplicate** in the border colour, which reads as dimension without a shadow;
- **accent bars** — a 4px × 64px vermillion rule as a visual anchor;
- **full-width dividers** rather than boxes.

A 1.5% fractal-noise grain over the whole page gives the dark ground a tactile quality.

#### Buttons — the signature

The primary button is **text only with an animated underline**: no fill, accent text, uppercase, wide
tracking, a 2px accent rule beneath that scales from `100%` to `110%` on hover and presses `1px` down
on click. The secondary is a 1px outline that **fully inverts** on hover (ink fill, canvas text). The
ghost is muted text whose hairline underline grows from zero.

An underline is the primary interactive affordance throughout — not a pill, not a fill.

#### Layout and motion

Container 1200px. Section padding 80 / 112 / 160px. Grids **7/5 or 8/4, never 6/6**, with staggered
alignment so elements do not all start at the same top edge.

Motion is **fast and decisive**: 150ms micro-interactions, 200ms transitions, `cubic-bezier(0.25,0,0,1)`
— fast out, crisp stop. No bounce, no lift, no scale, no glow. Entrances fade and rise 20px over 500ms
with an 80ms stagger.

### The defects this style produces

1. **Muted text at the spec's own value**, which fails — and fails worse on cards than on the canvas.
2. **White text on the vermillion** (3.40:1).
3. **A shadow** anywhere, which contradicts the entire depth strategy.
4. **A rounded corner**, same.
5. **A symmetric grid**, which removes the deliberate quality.
6. **Decorative oversized type causing horizontal scroll on mobile** — it must be hidden or shrunk,
   not merely clipped.

### Non-negotiables

1. Near-black canvas, never pure black.
2. Secondary text re-measured against **every** surface it sits on.
3. Black on the accent, never white.
4. Radius 0 and no shadows anywhere.
5. The scale gap between h1 and body at 6:1 or more.
6. Tight tracking on display, wide tracking on labels.
7. Underline-based buttons; full inversion on the outline button.
8. Asymmetric grids.
9. 150–200ms, no bounce.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php bold-typography
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
