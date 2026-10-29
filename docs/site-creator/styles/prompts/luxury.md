<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Luxury / Editorial

A design-system brief for an AI agent building or restyling an Unyson+ site in the Luxury preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) — design-system concept → where it lives in Unyson+ — applies
unchanged, as do the regeneration steps.

Source prompt: `unysonplus-website/presets/luxury.txt`. Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to elements.

### Design system: Luxury / Editorial

#### Philosophy

Elegance through restraint. The register is high-end fashion editorial and luxury brand — sophisticated,
timeless, serene, deliberate, tactile.

**Luxury is not decoration added; it is everything unnecessary removed and what remains perfected.**
Three things carry it: more space than feels comfortable, motion slowed to cinematic speeds, and
asymmetry used to break the grid on purpose. The page should feel like expensive paper you want to touch.

**It is not:** fast, bright, rounded, centred, or crowded.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Page | `#F9F8F6` | Warm alabaster. The warm undertone is critical — not white |
| Ink | `#1A1A1A` | Rich charcoal, never pure black |
| Muted surface | `#EBE5DE` | Pale taupe |
| Muted text | `#6C6863` | Warm grey — 4.8:1, holds AA |
| Gold | `#D4AF37` | Accent **only**. Never a large area |

**The trap in this palette, measured.** Gold on the charcoal is about **5.2:1** and is fine. Gold on
the **alabaster** is roughly **2:1** — it fails AA for text *and* the 3:1 minimum for non-text
indicators. So on light sections gold may be a **decorative rule or border**, but never:

- text that has to be read,
- a focus ring,
- an icon that conveys state.

On light sections, focus and emphasis are **charcoal**. Gold as a readable colour belongs on the dark
bands. This is the single easiest way to ship an inaccessible version of this style while believing
the accent is "used sparingly".

#### Typography

- **Playfair Display** — headlines, large quotes, emphasis. High-contrast serif.
- **Inter** — body, labels, UI.

Hero headlines run `4rem`–`8rem` with `line-height: 0.9`. Body sits at 16–18px with `1.625`.

**Letter-spacing is where the luxury actually lives:** uppercase labels at `0.25em`–`0.3em`, buttons at
`0.2em`, headlines tight or default, body **never adjusted**. A 10px uppercase label tracked to `0.3em`
beside a 7rem headline is the whole hierarchy.

#### Shape and line

**Radius `0` everywhere.** Borders are `1px`, and usually a **single side** — `border-top` on a card
rather than a box around it. Dividers are `h-px` rules used as deliberate architectural marks.

#### Shadow

Extremely subtle and layered; never a harsh drop. Depth comes from stacking:

```
cards    0 2px 8px rgba(0,0,0,0.02)   →  0 8px 24px rgba(0,0,0,0.06) on hover
images   0 4px 24px rgba(0,0,0,0.08)  + inset 0 0 0 1px rgba(0,0,0,0.06)
buttons  0 4px 16px rgba(0,0,0,0.15)  →  0 8px 24px rgba(0,0,0,0.25)
```

#### Signature elements

1. **Visible vertical gridlines** — four fixed `1px` lines at 20% opacity spanning the viewport,
   aligned to column boundaries. Architectural, pointer-events off, desktop only.
2. **Paper grain** — an SVG fractal-noise overlay at ~2% opacity across the page.
3. **Grayscale → colour on hover**, over **1500–2000ms**. Ultra-slow is the point: colour is a reward,
   not a response.
4. **Vertical text labels** — `writing-mode: vertical-rl`, uppercase, widely tracked, on image edges.
5. **Drop caps** — a floated Playfair initial at ~7rem on an opening paragraph.
6. **Mixed italic headlines** — one word per headline set in italic, to give a spoken cadence.
7. **The gold slide** — the primary button's gold layer translates in from the left over 500ms with
   `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, text held above it on a higher stacking layer.
8. **Asymmetric offsets** — 7/5 splits and content starting at column 2 or 6, leaving deliberate space.

#### Motion

Cinematic. Nothing snaps:

- interactions **500ms**, colour **700ms**, images **1500–2000ms**
- easing `ease-out` or `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — never `ease-in-out`
- hover is layered: scale *and* colour *and* shadow together

Under `prefers-reduced-motion`, drop the transforms and the slow reveals; keep the colour.

#### Spacing

Section padding `py-24`–`py-32`; components `p-8`–`p-12`; groups `gap-12`–`gap-16`. **If it feels like
too much air, it is probably right.** Max container 1600px with `px-8`–`px-16` gutters.

### The defects this style produces

1. **Gold used as light-surface text or focus** — the contrast failure above. It looks correct in a
   screenshot and fails a contrast check.
2. **Motion that is merely "slow-ish"** — 300ms reads as a sluggish normal transition rather than a
   deliberate cinematic one. Commit to 500ms+ or don't.
3. **Symmetry creeping back in** — centred headings and 50/50 splits quietly remove the editorial
   quality; the asymmetry is the design.
4. **An element inside a dark band inheriting that band's light text** — the recurring failure across
   every preset here. Set its ink explicitly.
5. **Tracking applied to body text**, which destroys readability. Only uppercase labels get it.

### Non-negotiables

1. Warm alabaster and rich charcoal — never pure white or pure black.
2. Radius `0` everywhere.
3. Single-side borders, not boxes.
4. Gold as accent only, and never readable text on light.
5. Visible vertical gridlines and paper grain.
6. Grayscale media warming over 1500ms+.
7. At least one drop cap and one italic headline word.
8. The gold slide on the primary button.
9. Asymmetric splits; nothing centred by default.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php luxury
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
