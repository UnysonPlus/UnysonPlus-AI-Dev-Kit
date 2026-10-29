<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Modern dark

A design-system brief for an AI agent building or restyling an Unyson+ site in the Modern dark preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind/Framer Motion. The mapping table
in [`monochrome.md`](monochrome.md) applies unchanged — palette roles, button preset states, surface
presets, `misc_custom_css` — and this file covers what is specific to this style.

Preview: `create.unysonplus.com/design-presets/modern-dark/`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Modern dark

#### Philosophy

Precision and depth. The other presets are built from things you can point at — a rule weight, a
primary colour. This one is built from **light**: a near-black canvas layered with a radial gradient,
noise, a faint grid and slow-drifting pools of indigo. The register is premium developer tooling —
dark but never oppressive, technical but not sterile.

**Take the layering away and what is left is an ordinary dark mode.** That is the test of whether the
style has been implemented or merely approximated.

#### Palette

| Token | Value | Notes |
|---|---|---|
| Canvas | `#050506` | Near-black. **Never** pure `#000000` |
| Deepest | `#020203` | Footer and the lowest layer |
| Raised | `#0a0a0c` | Elevated surfaces, mock interfaces |
| Text | `#EDEDEF` | Off-white, not pure white — ~17:1 on the canvas |
| Muted text | `#8A8F98` | ~6.3:1, comfortable for body |
| Accent (fill) | `#5E6AD2` | Buttons, highlights, glow |
| Accent (text) | `#6872D9` | See below |
| Hairline | `rgba(255,255,255,0.06)` | Borders are *nearly invisible* |

**The trap, measured.** White on the `#5E6AD2` fill is **4.70:1** and clears AA. That same indigo used
**as text** on the canvas is **4.32:1** and does not. Accent type must therefore use the brighter
`#6872D9` at **4.84:1**. Using one accent value for both fill and text is the quiet accessibility
failure in this palette — it looks fine and is not.

Most of the page is monochrome. The accent is for interaction, not decoration; used everywhere it
reads as a theme rather than as light.

#### The background, in four layers

Never a flat fill. In order:

1. **Radial gradient** — `ellipse at top`, `#0a0a0f` → `#050506` → `#020203`. Vertical depth.
2. **Noise** at ~1.5% opacity. This is what stops a wide dark gradient from banding.
3. **Drifting light pools** — large (500–900px), heavily blurred (100–150px), indigo and violet at
   12–25% opacity, floating on an 8–11s ease-in-out loop.
4. **A 64px grid** at ~2% opacity, masked so it fades out down the page.

All four are decorative: paint them on fixed, `aria-hidden` layers behind the content.

#### Typography

**Inter** throughout, with a monospace (JetBrains Mono) for small tracked labels. Headlines at weight
600 with `letter-spacing: -0.03em` and `line-height` near 1.05. Headlines take a **vertical gradient**
(`#fff` → `rgba(255,255,255,0.7)`) via `background-clip: text`, so they have dimension rather than
sitting flat on the canvas.

#### Shape, shadow and glow

Radius: 16px containers and cards, 12px icon boxes, 8px buttons, full pills for badges.

**Never a single shadow.** Every elevated surface stacks three or four:

```
0 0 0 1px rgba(255,255,255,0.06),   /* hairline */
0 2px 20px rgba(0,0,0,0.4),          /* soft diffuse */
0 0 40px rgba(0,0,0,0.2)             /* ambient darkness */
```

The accent CTA adds a glow and an inner top highlight. A card also carries a **1px lit top edge** — a
bright line fading out at both ends. It is nearly invisible and the page looks cheap without it.

#### Interaction

- **Cursor-tracked spotlight.** Cards render a 300px radial pool of accent light at 15% opacity that
  follows the pointer. This is the single effect that makes a surface feel physical.
- Hover: lift **4–8px maximum**, border brightens, glow increases. This is precision, not play.
- Active: `scale(0.98)`.
- Timing: **200–300ms**, expo-out `cubic-bezier(0.16, 1, 0.3, 1)`. Never spring, never bounce.

#### Layout

Asymmetric bento grids — a hero cell spanning four columns and two rows, then varied spans. **Six
equal boxes is the failure mode**; vary the sizes or the grid is just a card list.

Sections separated by a 1px hairline at 6% white. Section padding generous (96–128px).

#### Motion and reduced motion

The drifting light is the style, so `prefers-reduced-motion` must **stop it outright** rather than
shorten it, and remove the lift and scale. Nothing on the page may depend on movement to be understood.

### The defects this style produces

1. **A single shadow instead of a stack.** It looks "nearly right" and reads as pasted-on. Three layers
   is the minimum.
2. **One accent value for both fill and text** — see the contrast note above.
3. **Pure black or pure white**, which reads as harsh next to the layered canvas.
4. **A flat fill behind the content**, which quietly removes the entire style.
5. **Hover movement over 8px**, which turns precision into playfulness.

### Non-negotiables

1. Four background layers, never a flat fill.
2. One accent, for interaction only.
3. Multi-layer shadows on every elevated surface.
4. The 1px lit top edge on raised surfaces.
5. Cursor-tracked light on cards.
6. Asymmetric bento, never a uniform grid.
7. Accent text uses the brighter variant.
8. 200–300ms, expo-out, 4–8px.
9. Reduced motion stops the drift outright.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

The specimen page is built to the brief above, and **`tools/apply-style.php` now applies it**: indigo
`#5E6AD2` as the fill with `#6872D9` as the accent *text* value, `#EDEDEF` ink, surfaces
`#0a0a0c` / `#050506` / `#020203`, 8px radius, and 6% white hairlines. Verified on a rendered page.

Two things the preset gets right that are easy to get wrong, both found by measuring:

- **Primary keeps the shipped white label**, because white on `#5E6AD2` is 4.70:1 and clears AA. There
  is nothing to override on its resting state.
- **Secondary does not.** The shipped preset puts white on the Secondary role, and white on `#8A8F98`
  is **3.25:1**. The canvas colour on that same grey is 6.27:1, so Secondary takes dark text.

What the preset still does **not** emit: the **four background layers** (radial gradient, noise,
drifting light pools, masked grid) and the **gradient headline fill**. Those are markup and animation,
not Theme Settings values, so a generated page gets a flat near-black canvas and a section that wants
the light pools still has to bring them.
