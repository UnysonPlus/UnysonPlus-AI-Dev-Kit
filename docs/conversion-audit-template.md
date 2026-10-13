<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# The conversion audit template — what gets checked, every time

A discrepancy audit is only as complete as its checklist. Working from memory produces a list of whatever
happened to catch the eye, which is how a dropped 1px rule or an 8px gutter survives three rounds of
"looks right now". This is the checklist. Every row is checked for every band, and every row gets a verdict:
**MATCH**, **DIFF** (with both values), or **N/A** (the source has no such thing).

Three rules govern the whole thing:

1. **A value is MATCH only when a lens printed the same number on both sides**, or one of the three
   permitted non-differences applies (notation · a mismatched element pair · an equivalent mechanism with
   the same resulting box). "Looks the same" is not a verdict.
2. **Check the TOOL before believing the tool.** Every lens here has produced a false reading at least once.
   When a number looks surprising, re-measure the same thing a second way before writing it down — and if
   the tool was wrong, fix or calibrate the tool, then re-run it.
3. **Absence is a discrepancy.** A missing dot, hairline, icon, arrow or overlay is a DIFF even though no
   text lens and no size lens will ever report it.

---

## 0 — Setup

| | |
|---|---|
| Source URL | |
| Build URL | |
| Capture | `capture-out/<slug>/` — re-captured? |
| Widths audited | 1440 · 820 · 390 (all three, always) |
| Reveals settled | entrance animations forced before any screenshot |
| Counters settled | count-up elements allowed to finish before reading values |

---

## 1 — Page level

- [ ] Total page height (source vs build, px)
- [ ] Page canvas background (fill / gradient / image)
- [ ] Band ORDER — every band present, in the source's order
- [ ] Band COUNT — none invented, none merged, none duplicated
- [ ] Horizontal overflow at each width (none)
- [ ] Scroll behaviour (sticky, scroll-snap, smooth)

## 2 — Container & grid, PER BAND

The source's gutter is **not** one global value — it commonly differs band to band. Record each.

- [ ] Outer box width · max-width
- [ ] Padding left / right (the gutter) → **content width**
- [ ] Padding top / bottom (the band's vertical rhythm)
- [ ] Full-bleed vs contained
- [ ] Track count (count the source's tracks; never infer from item count)
- [ ] Column widths / spans, and their proportions
- [ ] Column gap · row gap
- [ ] Align-items · justify-content
- [ ] Stacking breakpoint and the order after it stacks

## 3 — Typography, PER ROLE

Roles: overline · title · subtitle · body · list item · label · caption · link · button · nav · price ·
meta. For each role present in the band:

- [ ] font-family
- [ ] font-size
- [ ] font-weight
- [ ] font-style (italic / oblique)
- [ ] line-height
- [ ] letter-spacing
- [ ] text-transform
- [ ] color
- [ ] text-align
- [ ] max-width / measure (the line length)
- [ ] margin above / below

## 4 — Borders, rules and radii

The most-dropped category, and invisible to every text and size lens.

- [ ] Border width **per side** (a one-sided border is a RULE, not a frame)
- [ ] Border style per side
- [ ] Border colour per side — including alpha
- [ ] Border radius **per corner**
- [ ] Divider / hairline between repeated items (present? colour? width? inset?)
- [ ] Divider above / below a band
- [ ] Outline and ring (a Tailwind `ring-*` is a box-shadow, not a border)
- [ ] Table / list separators

## 5 — Backgrounds & effects

- [ ] background-color (including alpha)
- [ ] background-image: gradient type, angle, every stop
- [ ] background image: src, size, position, repeat, attachment
- [ ] Overlay / scrim (present? colour? opacity? direction?)
- [ ] backdrop-filter (blur radius)
- [ ] mix-blend-mode
- [ ] box-shadow — every layer: offset, blur, spread, colour
- [ ] Decorative pseudo-layers (`::before` / `::after` glows, patterns, blobs)

## 6 — Media

- [ ] Every image present (count per band)
- [ ] src resolves (not a placeholder)
- [ ] Rendered width × height
- [ ] object-fit · object-position
- [ ] Aspect ratio
- [ ] Corner radius
- [ ] alt text carried
- [ ] Video / iframe: present, poster, controls
- [ ] SVG icons: present, size, colour, stroke-width

## 7 — Components

- [ ] Buttons: label, trailing glyph (→), fill, border, radius, padding, height, width (pill vs full-width)
- [ ] Links: label, trailing glyph, colour, underline
- [ ] Badges / chips: fill, radius, padding, text style — and the DOT if there is one
- [ ] Cards: skin, padding, inner spacing, the order of their parts
- [ ] Lists: marker/icon per item, gap, indent
- [ ] Forms: every field, its label, placeholder, type, and every `<option>`; the submit button
- [ ] Tables: header, rows, alignment, separators
- [ ] Counters / stats: final settled value, prefix, suffix, label

## 8 — States

- [ ] Hover: fill, colour, border, transform, shadow, filter (probe each separately)
- [ ] Focus-visible
- [ ] Current / active nav item
- [ ] Disabled

## 9 — Chrome

- [ ] Header: position in the DOM (above the hero!), sticky, height, background + **alpha**, blur, border
- [ ] Topbar: present, text, background, height
- [ ] Logo: image/text, size, colour
- [ ] Nav: every item, order, type, spacing, size
- [ ] Header CTA: label, style
- [ ] Footer: column count, headings, every link, legal row, social icons, dividers

## 10 — Content

- [ ] `conversion-drops.json → text_coverage` — print EVERY missing string by name
- [ ] Order of content within each band
- [ ] Nothing duplicated
- [ ] Nothing invented

## 11 — Responsive (repeat 2–7 at 820 and 390)

- [ ] Gutters at each width
- [ ] Stack order
- [ ] Hidden/shown elements per width
- [ ] Type scale at each width

## 12 — The lenses, and whether they were right

| Lens | Ran? | Agreed with a second measurement? | Calibration needed |
|---|---|---|---|
| `container-check.mjs` | | | |
| `compare.mjs` | | | |
| `props.mjs` | | | |
| `probe.mjs` (+ `--hover`) | | | |
| `spacing-audit.mjs` | | | |
| `section-audit.mjs` | | | |
| `shot.mjs --full` | | | |
| text coverage | | | |

**Known lens failures to re-check every time** (each one shipped a false reading):

- `shot.mjs` photographs unrevealed bands blank unless reveals are settled.
- `compare.mjs` / `props.mjs` segment by `<section>`; a div-based source yields one region and the rest
  report PASS having compared nothing.
- `container-check.mjs` can pair the build's HEADER container against the source's BAND container.
- Leaf-only text probes miss values split across sibling spans (suffixes, prefixes).
- A colour compared as a string calls `oklab(…)` and `rgba(…)` different when they are one colour.
- A border colour on an edge whose width is `0px` is not a difference.
- Counters read mid-animation are not a content defect.

### Harness failures found on the audit that produced this list

All nine were fixed in the tool, not worked around. They turned 600 reported rows into 169 real ones,
and three of them were *hiding* genuine defects underneath.

- **A lens must measure both sides the same way.** `container-check.mjs` measured the build by CSS class
  (page-wide widest match = the header's container) and the source per band, and reported "+16px FAIL"
  about two different boxes. Fixing it turned the verdict green AND revealed a real +408px hero column.
- **A full-width `<button>` can be wide enough to be mistaken for a band's content column**, so its
  padding gets reported as the gutter. Exclude interactive and media elements from container picking.
- **Do not climb to the outermost box of equal width.** Wrappers share a width all the way up, so every
  band resolves to the page wrapper, every text leaf is compared in every band, and one row is reported
  nine times. Take the innermost qualifying ancestor.
- **`scrollTo(0,0)` does not mean `scrollY === 0`.** With `scroll-behavior:smooth` it is still animating;
  a `position:sticky` header has `rect.top === 0`, so `rect.top + scrollY` placed it 2297px down the page
  and it read as "the header renders below the hero" — a defect that did not exist. Force
  `scroll-behavior:auto`, assert `scrollY === 0`, and never add `scrollY` to a fixed element's rect.
- **Order bands by DOCUMENT order, not geometric top** — a sticky element distorts the geometry.
- **A band's heading is its highest-level heading, not its first.** Taking the first `h1-h3` paired a
  band against a different one as soon as the build *demoted* a heading (`h3` → `h4`, itself a real
  defect), reporting one matched band as both MISSING and INVENTED and masking three defects inside it.
- **`header` and `footer` pair by TAG, not heading** — a footer's heading is the brand mark and the two
  sides render it differently.
- **Force UTF-8 on the report stream.** A trailing arrow glyph on a CTA raised `UnicodeEncodeError` and
  silently dropped an entire width from the audit.
- **Group rows by root cause before reading them.** 96 rows said "font-family: system stack → Inter" —
  one defect, reported once per element, burying everything else.
- **Refuse to compare a text key that is not unique.** Pairing leaves by their text keeps only the last
  occurrence per side, so the "pair" can be two unrelated elements. Declare it unreliable instead.

### The blind spot that let a visible defect go unlisted

A 169-row audit of one page did NOT contain "the hero text is not vertically centred" — a defect
obvious at a glance, and the first thing a human noticed. The reason is worth building into the
checklist rather than apologising for:

**Nothing in the harness compared WHERE CONTENT SITS INSIDE ITS BAND.** It compared typography per
element, the container and band boxes, buttons, images and borders — all of which were identical on
both sides for that hero. The band was the right height, the column was the right width, every
string matched, every font matched. The content was simply pinned to the top of a box instead of
centred in it, and no lens looked at that.

So §2 gains a row that must be measured, not eyeballed, for every band:

- [ ] **Content offset within the band**: the gap ABOVE the first child and BELOW the last, both
      sides. Equal gaps (±24px) on the source and unequal on the build is a centring defect, and it
      is invisible to every other check here.
- [ ] The wrapper's `display` — an alignment property on a `display:block` box does nothing. If a
      build sets `align-items` or `justify-content` on a non-flex element, that is a defect even
      though the computed alignment value "matches" the source's intent.

The general lesson: **a lens that compares properties will never report a property that is absent.**
When a build's box is right and its text is right, the remaining failure mode is placement, and
placement needs its own measurement.

### A self-check that catches a bad band pairing

Sum the per-band height deltas and compare the total to the page-height delta. They must be equal. On
this audit, `+1332px` of band deltas against a `+1332px` page-height gap is what proved the pairing
sound — and the same check is what exposes a pairing that has silently gone wrong.

## The output

One row per discrepancy, in a flat list, each with: band · category · property · source value · build value ·
how it was measured. Sorted by band, top to bottom. No "misc" bucket — if it does not fit a category above,
the category list is missing a row and gets one.
