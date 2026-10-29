<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Prompt — Newsprint

A design-system brief for an AI agent building or restyling an Unyson+ site in the Newsprint preset.
Hand it over whole, or paste the `<design-system>` block alone if the agent already knows the codebase.

Adapted from a public design-system prompt written for React/Tailwind. The mapping table in
[`monochrome.md`](monochrome.md) — design-system concept → where it lives in Unyson+ — applies
unchanged, as do the regeneration steps. This file covers what is specific to Newsprint.

Slot model: [`../README.md`](../README.md).

---

## The prompt

### Role

As in [`monochrome.md`](monochrome.md): a frontend engineer working in **WordPress with Unyson+**,
applying a design system through **Theme Settings and presets**, never as styling welded to each
element.

### Design system: Newsprint

#### Philosophy

Print journalism, reimagined for the web. Absolute clarity through hierarchy and structure. It
rejects soft shadows, blur and rounded corners outright, and replaces them with **visible grid**,
**high information density** and **typographic drama**.

The register is a publication of record: authoritative, intellectual, urgent, timeless. It should
feel like a fresh morning paper — crisp, organised, information-rich.

**It is not:** soft, friendly, airy, or a blog theme with a serif headline.

#### Palette

| Role | Value | Notes |
|---|---|---|
| Page | `#F9F9F7` | Newsprint off-white. **Not** pure white — the warmth is the point |
| Ink | `#111111` | Text **and** every structural border |
| Divider | `#E5E5E0` | Secondary rules only |
| Editorial red | `#CC0000` | Breaking-news badges, CTAs, link underlines — 99% of the page is black and white |
| Metadata grey | `#737373` | Captions, bylines, dates |

**Measured, because this palette has one hard rule.** Ink on the off-white is about **17.9:1**. The
editorial red on that off-white is **5.54:1** and clears AA. But the same red **on the black** is
**3.11:1** and fails outright — so **never put red on a dark background**. On an inverted section the
accent has to become white or the off-white, not red.

Red is a signal, not decoration: breaking-news badges, one CTA, a link underline. If it is doing
anything decorative, it is being overused.

#### Typography

Four faces, each with a job:

- **Playfair Display** — headlines and display. High-contrast, authoritative.
- **Lora** — body. A reading serif for long-form text.
- **Inter** — UI: navigation, buttons, labels.
- **JetBrains Mono** — data: dates, edition numbers, stats, captions.

Hero headlines run to **8–9rem** on desktop with `line-height: 0.9` and tight tracking; body sits at
14–18px with relaxed leading. The gap between them is the hierarchy. Metadata is 12px, uppercase,
widely tracked, in mono or sans.

Uppercase for navigation, labels, metadata and bylines. Sentence case for headlines and body.

#### Shape and structure

**Radius `0` everywhere. No exceptions.**

Borders are the structure and are meant to be seen:

- `1px` solid ink — standard cell and card borders
- `4px` solid ink — major section dividers

**Collapsed grids.** Adjacent cells share borders: put `border-right` on all but the last column and
`border-bottom` on each row, so the page reads as a newspaper grid rather than a set of floating
cards. Drop the vertical rules on mobile and keep the horizontal ones.

#### Flat, with one exception

No soft shadows anywhere. The single permitted effect is a **hard offset shadow on hover**:

```
box-shadow: 4px 4px 0 0 #111111;
transform: translate(-2px, -2px);
```

A newspaper cutout lifting off the page — not a glow.

#### Texture (required — this is what stops it reading as a generic white page)

- A 4×4px **dot pattern** on the page background at ~4% opacity.
- A fine 3px **graph-paper grid** on major sections at ~2% opacity.
- A **halftone** radial dot pattern inside image placeholders, simulating print screening.
- **Ornamental dividers** between major sections: a centred row of `✶ ✶ ✶` in the display serif,
  widely tracked, in a muted grey.

#### Signature elements

These are what separate it from "a white page with a serif":

1. **Vertical grid dividers** — columns separated by visible rules, not just gaps.
2. **Drop caps** — a floated display-serif initial on the opening paragraph of key sections.
3. **A ticker** — a horizontal scrolling crawl of stats or headlines, black with white text and red
   badges, mimicking a news crawl.
4. **Edition metadata** — "Vol. 1 · <date> · <city> Edition" in the masthead, "Fig. 1.1" on captions.
5. **Justified columns** — multi-column body text set justified for the newspaper look.
6. **Greyscale images**, warming to a slight sepia on hover.
7. **Asymmetric splits** — 8/4 and 5/7, never 6/6.
8. **One inverted section** — black ground, white text, red reserved *out* (see the contrast rule).

#### Motion

Fast and mechanical: `200ms ease-out`. Colour inversions snap. Hard shadows appear on hover. FAQ
markers rotate 45°. Nothing floats, nothing eases gently. Honour `prefers-reduced-motion`.

#### Accessibility

Black on off-white is AAA by a wide margin, so the risks are all at the edges:

- **Never red on dark** (3.11:1 — see above).
- Focus is a 2px ink ring at 2px offset, via `:focus-visible`.
- Touch targets ≥44px, including inside dense grid cells — density must not shrink the tap area.

### The defects this style produces

1. **An element inside an inverted section inheriting that section's text colour** — the recurring
   failure across every preset in this gallery. A white box in the black band renders white-on-white.
   Set the ink colour explicitly on anything whose own background differs from its block.
2. **Double borders** where collapsed cells each draw their own — decide per side and remove the
   duplicate, or the grid gains 2px lines at every junction.
3. **Red on the inverted band**, which looks striking and fails contrast.
4. **A vertical rule left on mobile**, which turns a single column into a page with a stray line.

### Non-negotiables

1. Off-white page, never pure white.
2. Radius `0` everywhere.
3. Visible collapsed grid with shared borders.
4. 4px rules between major sections.
5. Hard offset shadow on hover; no soft shadow anywhere.
6. Texture present — dots, graph grid, halftone.
7. At least one drop cap and one ornamental divider.
8. Red used as a signal only, and never on dark.
9. Four faces, each kept to its job.
10. Styles on presets; nothing coloured per element.

---

## Status of this preset

**`tools/apply-style.php` now ships this preset.** Applying it writes the palette, the type stack and
scale, the button shape, the three surfaces, the measure, the footer chrome and the page colour, and
every button-text decision in it is a measurement rather than a preference. Verified by rendering:

```
WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php newsprint
```

then measuring the computed values on the page and running a contrast pass over every visible text
node against its nearest opaque surface.

What a preset cannot carry is anything that is markup rather than a stored value — textures, layered
backgrounds, decorative shapes, bespoke motion. Those stay in this brief for the agent to build.
