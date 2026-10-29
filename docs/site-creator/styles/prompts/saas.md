<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — SaaS (Minimalist Modern)

A design-system brief for an AI agent building or restyling an Unyson+ site in the Minimalist Modern
preset. Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the
codebase.

Adapted from a public design-system prompt written for React/Tailwind/Framer Motion. The mapping
table in [`monochrome.md`](monochrome.md) — design-system concept → where it lives in Unyson+ —
applies unchanged, as do the regeneration steps.

Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Minimalist Modern

#### Philosophy

**Restraint in quantity, confidence in execution.** Few elements, each sized boldly. This is not the
sterile minimalism that strips a page until it is forgettable — it is minimalism that makes a
statement: where another system would reach for a safe grey, this one uses a single electric blue;
where another would centre everything, this one is deliberately asymmetric.

The register sits between a high-precision SaaS product and a creative agency's portfolio.
Professional but alive; refined but not cold.

**It is not:** sterile, generic, busy, flat or corporate.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Canvas | `#FAFAFA` | Warm off-white, not pure white |
| Ink | `#0F172A` | Deep slate — also the inverted-section background |
| Muted surface | `#F1F5F9` | Secondary fills |
| Muted text | `#64748B` | Descriptions, metadata |
| Accent | `#0052FF` | Electric blue — the signature |
| Accent 2 | `#4D7CFF` | The gradient endpoint |
| Border | `#E2E8F0` | Hairlines |
| Card | `#FFFFFF` | Pure white, for lift against the warm canvas |

**Measured — and the first version of this brief got it wrong.** Ink on canvas is ~16:1 and the
accent is **5.37:1** on the canvas, so accent *text* is safe. But the **gradient** runs to `#4D7CFF`,
and **white on that light end is 3.72:1** — it fails at normal size. Computing against the dark stop
alone gives a comfortable 5.70:1 and is simply the wrong end to check.

So: **anything carrying white text uses a darker pair** (white on `#2563EB` is 5.12:1), and the
lighter stop stays for non-text uses — icon tiles, borders, accent bars.

Two more to watch:

- **Muted text is 4.50:1** on the canvas — exactly the AA threshold with no margin.
- **Muted text on the muted surface is 4.34:1** and fails. If a muted paragraph sits on the tinted
  section rather than on white, it needs a darker ink.

**The general rule this produced:** always contrast-check a gradient against its *lightest* stop for
light text and its *darkest* for dark text. One end of a gradient passing tells you nothing about the
other.

#### The signature gradient

`linear-gradient(to right, #0052FF, #4D7CFF)` is the heartbeat of the system. It appears on primary
buttons, icon containers, featured card borders, accent bars, and as a **text fill** on one key word
of a headline via `background-clip: text`.

A gradient reads as more alive than a flat fill and signals importance without shouting. Use it
deliberately and in few places; everywhere, it becomes wallpaper.

#### Typography

A **dual-font system**, and the pairing is the identity:

- **Calistoga** — display only (h1/h2). Warm, characterful, slightly playful. The *personality* voice.
- **Inter** — everything else: body, cards, UI. The *clarity* voice.
- **JetBrains Mono** — section labels and badges only.

Hero headline ~5.25rem desktop with `letter-spacing: -0.02em` and `line-height: 1.05`; body relaxed at
1.625–1.75. Section labels 12px uppercase mono, tracked `0.15em`.

#### Shape, surface and shadow

Radius `12px` (cards, buttons) to `16px` (large containers). Rounded, never pill — pills belong to the
section-label badges, which are `rounded-full`.

Shadows are soft and layered, and one of them is **accent-tinted**:

```
sm   0 1px 3px rgba(0,0,0,0.06)
md   0 4px 6px rgba(0,0,0,0.07)
lg   0 10px 15px rgba(0,0,0,0.08)
accent      0 4px 14px rgba(0,82,255,0.25)
accent-lg   0 8px 24px rgba(0,82,255,0.35)
```

The accent-tinted shadow on a primary button is what makes it feel lit rather than merely coloured.

#### Signature elements

1. **Gradient text** on one key word per headline — never the whole line.
2. **An inverted section** on the deep slate, with a dot-grid texture at ~3% opacity.
3. **The section-label badge**, repeated at the head of every section: a pill with a tinted border, a
   small accent dot (optionally pulsing) and uppercase mono text.
4. **Asymmetric grids** — `1.1fr / 0.9fr` for the hero, `1.2fr / 0.8fr` for feature splits. Never 50/50.
5. **Radial accent glows** — large blurred circles at 3–6% opacity in section corners.
6. **Elevated featured tier** — the highlighted pricing card floats above its siblings.
7. **Gradient borders** on featured cards, via a 2px gradient wrapper around an inset white panel.

#### Motion

Smooth and purposeful, never jarring. `200ms ease-out` for interactions; entrance fades of 700ms with
a 0.1s stagger. Hover lifts are small (`translateY(-2px)`) and pair with a deepened, accent-tinted
shadow. Buttons scale to `0.98` on press. Continuous motion — a pulsing dot, a slow float — stays
gentle and must stop under `prefers-reduced-motion`.

#### Accessibility

- Muted text is at the AA boundary (above) — treat it as a floor, not a target.
- Focus: a 2px accent ring at 2px offset, with the offset colour matching the surface behind it.
- Touch targets ≥44px; primary CTAs 48–56px tall.

### The defects this style produces

1. **Gradient on everything.** Applied to every heading and button it stops signalling importance and
   becomes the background noise it was meant to rise above.
2. **Muted text drifting below AA** when the canvas is tweaked — it starts with zero margin.
3. **Symmetric grids**, which quietly removes the "designed" quality the asymmetry provides.
4. **An element inside the inverted slate section inheriting that section's light text** — the
   recurring failure across every preset here. Set its ink explicitly.
5. **Shadow without the accent tint on the primary CTA**, which reads as unfinished.

### Non-negotiables

1. Warm off-white canvas, never pure white.
2. The dual-font pairing — display face for h1/h2 only.
3. Gradient text on exactly one word per headline.
4. One inverted section with dot texture.
5. The section-label badge at the head of every section.
6. Asymmetric grids.
7. Accent-tinted shadow on primary CTAs.
8. Small hover lifts; `scale(0.98)` on press.
9. Muted text re-measured if any surface changes.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php saas
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
