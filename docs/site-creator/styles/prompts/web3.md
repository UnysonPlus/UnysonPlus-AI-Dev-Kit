<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Web3 / Digital Gold

A design-system brief for an AI agent building or restyling an Unyson+ site in the Web3 preset. The
mapping table in [`monochrome.md`](monochrome.md) applies unchanged.

Source prompt: `unysonplus-website/presets/web3.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Web3 / Digital Gold

#### Philosophy

Precision engineering, cryptographic trust and digital gold. **Not generic dark mode** — a deep void
in which data structures glow with orange heat and gold brilliance, like mining rigs humming in the
dark.

Five ideas carry it:

1. **Luminescent energy.** Light comes *from* interactive elements. Shadows are tinted orange and
   gold, never neutral black.
2. **Mathematical precision.** 1px borders, monospace figures, a visible grid under everything.
3. **Layered depth.** Glass panels — `backdrop-blur` over a 5% white fill — floating in Z-space.
   Digital depth, not skeuomorphism.
4. **A textured void.** The background is never flat: a network grid, radial energy fields, grain.
5. **Trust through design.** High contrast and clear hierarchy are the message, not a constraint on it.

**It is not:** flat, neutral, pastel, playful, or grey.

#### Palette

| Role | Value | Measured on the void |
|---|---|---|
| Void | `#030304` | the deepest ground in this whole set |
| Dark matter (surface) | `#0F1115` | — |
| Pure light | `#FFFFFF` | **20.62:1** |
| Stardust (muted) | `#94A3B8` | **8.04:1** — unusually generous for a spec's muted token |
| Dim boundary | `#1E293B` | 1.41 — structure, not contrast |
| Bitcoin orange | `#F7931A` | **8.98:1** |
| Burnt orange | `#EA580C` | 5.79:1 |
| Digital gold | `#FFD600` | **14.60:1** |

**The trap, measured — and it is the signature itself.** The gradient
`linear-gradient(to right, #EA580C, #F7931A)` is specified for primary buttons, and white on it is:

| Stop | White | Void |
|---|---|---|
| `#EA580C` (dark end) | **3.56:1** fails | 5.79:1 passes |
| `#F7931A` (light end) | **2.30:1** fails badly | **8.98:1** passes |
| `#FFD600` (gold end) | **1.41:1** | **14.60:1** |

So **white never sits on the signature gradient**; the void colour does, and it passes at every point
along it. The same gradient as *text* on the void (via `background-clip: text`) is 8.98–14.60 and is
excellent — which is why the error is easy to make: the gradient genuinely is high-contrast, just not
in the direction the spec assumes.

Second, subtler: **a glass panel's contrast is set by what is behind it.** `bg-white/5` with blur over
the void is effectively the void, but the same panel over one of the radial orange glows is much
lighter. Measure a glass panel against the brightest thing it can float over, not against the page.

#### Typography

- **Space Grotesk** — headings. Geometric with technical character.
- **Inter** — body.
- **JetBrains Mono** — stats, prices, badges, nav. Uppercase with wide tracking.

Dramatic display-to-body contrast: heroes at 36–72px, body comfortable at 16–18px, tight leading on
headings and relaxed on body.

#### Shape, glow and texture

- Cards `12–16px`; **buttons fully round (pill)**; inputs `8px` or a bottom border only.
- Borders are `1px` at **10% white** at rest, orange at 50% on hover, full orange when active.
- **Tinted glows**, never black: `0 0 30px -5px rgba(247,147,26,.6)` on a CTA,
  `0 0 50px -10px rgba(247,147,26,.1)` as ambient card elevation.
- **The grid** — 50px lines at `rgba(30,41,59,.5)`, masked by a radial gradient so it fades out
  toward the edges. This is the most recognisable texture in the style.
- **Radial blur fields** — a large accent circle at ~10% opacity under `blur(120px)`.

### The defects this style produces

1. **White on the orange gradient** — the signature error, failing at every stop.
2. **A neutral black shadow**, which flattens the luminescence into ordinary dark-mode depth.
3. **Glass measured against the page** rather than against the glow behind it.
4. **A flat background**, with no grid and no field, which removes the whole "textured void" premise.
5. **A rectangular button**, which breaks the pill rule the style leans on.
6. **Gradient on everything** — once every surface is orange, nothing is lit.

### Non-negotiables

1. True void background, never a soft charcoal.
2. Void text on every orange or gold fill; white never on the gradient.
3. Tinted shadows only.
4. Pill buttons; 12–16px cards.
5. 1px borders at 10% white, orange on interaction.
6. The masked grid present.
7. At least one radial glow field.
8. Mono for every figure.
9. Glass re-measured against what sits behind it.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php web3
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
