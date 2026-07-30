# Fidelity verification — capture-first + multi-lens comparison

How to verify a cloned/converted site actually matches its source. The recurring failures (13px
uppercase footer titles that should be 18px title-case; Font Awesome icons where the source used
emoji; overlapping columns) all came from **building from a screenshot glance and eyeballing**, then
declaring done. The fix is a discipline, not a tool: **measure the source first, build to the measured
spec, and verify every region with multiple independent lenses before advancing.**

## Rule 1 — Capture-first: build to a measured SPEC, never a screenshot

Before building a region, **capture the source's real values** and build to them. A screenshot has no
font sizes, weights, colors, or the exact text/emoji — so building from one is guessing.

- Run the **capture service** (`capture.mjs <url>` in `UnysonPlus-Capture-Service/tools/design-capture`) — it extracts per-region
  **computed styles** (`fontFamily`/`fontSize`/`fontWeight`/`color`/`textTransform`), bounding boxes,
  and the rendered text (emoji included), plus a design config and conversion report. Or capture
  ad-hoc with Playwright `getComputedStyle`.
- The output is the **build spec**: for each text node, `{ text (incl. emoji), fontSize, fontWeight,
  color, fontFamily, textTransform, bbox, iconKind }`. Reproduce those exactly.
- **Icons by kind** (see [site-build-protocol.md](site-build-protocol.md) Rule 0.5): **emoji →
  reproduce the character verbatim; inline SVG → copy the markup / map to lucide; font-icon → the ONLY
  kind that needs swapping** to the target's icon system. Don't swap emoji↔font-icon.

## Rule 2 — Verify with THREE independent lenses (per region, before advancing)

No single lens is sufficient — each catches a different class of miss:

1. **DOM computed-style diff** — match elements by **text** (not index) and compare `fontSize`,
   `fontWeight`, `color`, `fontFamily`, **`textTransform`**, and the **exact text/emoji**. Catches
   "18px vs 13px", "title-case vs uppercase", "emoji vs FA icon", wrong color/font, and **missing**
   elements (a badge/description/rating the build dropped). *This is the lens that would have caught the
   footer titles + emoji.*
2. **Geometry / layout diff** — compare **bounding boxes**: element x-positions, **column widths**,
   spacing/padding, and **overlap** (siblings whose boxes intersect). Catches the column-overlap and
   spacing/padding misses that typography checks miss.
3. **Pixel diff** — region-anchored `pixelmatch`/`resemble` side-by-side + mismatch %, cropping each
   logical region by its own bounds (robust to different page heights). Catches "does it *look* the
   same" — decorative details the DOM diff can't express.

**Gate:** advance to the next region only when all three pass for the current one. Grep/element-presence
is NOT a lens — every recurring failure passed a presence check and still looked wrong.

## Rule 3 — The order (ties into the region loop)

Header → Footer → sections top-to-bottom (see the protocol's region-loop). For **each** region:
`capture source spec → build to spec → run the 3 lenses → fix from measured values → re-run → advance`.

## Tooling (in the kit — `tools/measure/`)

- **`tools/measure/fidelity-check.mjs`** — the per-element **3-lens** runner: **Lens 1** diffs the
  **full computed style** per element matched by text — font size/weight/color/family/text-transform
  **plus text-decoration, animation, box-shadow, transform, letter-spacing** (a comprehensive diff, NOT
  a curated subset, so a wavy underline or a bounce animation is *flagged*, not silently missed) + icon
  kind + missing/extra; **Lens 2** geometry (column x, overlap); **Lens 3** pixel (pixelmatch %).
  `node tools/measure/fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>` — run it **per region**.
  Deps (`npm i` in `tools/measure`): playwright, pngjs, pixelmatch, sharp.
- **`tools/measure/compare.mjs`** — the region-level **ensemble** (geometry + pixel + perceptual +
  DOM-structure counts), aggregated fail-loud. Complements the per-element tool above.
- **Capture service** (`UnysonPlus-Capture-Service/tools/design-capture`) — the source of truth for the design spec (per-element
  styles + button `:hover` via `hoverStyle()`); prefer it over hand-measuring.

## Why this exists (the failures it prevents)

Every one of these shipped because I eyeballed instead of measured: footer titles 13px uppercase (source
18px title-case), FA icons where the source used emoji, columns overlapping, a bare product card where
the source had a badge/heart/description/rating. All are caught by Rule 2 lens 1 or 2 in seconds — *if
you run them per region before declaring done.*
