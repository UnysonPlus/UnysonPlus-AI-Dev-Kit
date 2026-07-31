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

## Rule 2 — Verify with FOUR independent lenses (per region, before advancing)

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
4. **Vertical-spacing diff (Lens 4)** — the gaps between stacked rows and a block's bottom margin
   (overline→title→subtitle rhythm; heading-block→next-element gap), ranked biggest-delta-first.
   Vertical rhythm is the **most-visible dimension and the one x-position/typography checks are blind
   to** — the recurring "spacing is off / the gap below the heading collapsed" miss. **`fidelity-check.mjs`'s
   exit code is driven by this lens**, so it is not optional.

**Gate:** advance to the next region only when all FOUR pass for the current one. Grep/element-presence
is NOT a lens — every recurring failure passed a presence check and still looked wrong.

## Rule 2.5 — RUN the tools and LOOP until PASS (hard gate — this is a test, not a glance)

Treat each region as a **test that must go green**. You do not "eyeball and move on"; you **run the
comparison tools, read the result, fix, and re-run — repeating until it PASSES.** No region advances on
a red result.

**The loop (per region):**
```
run fidelity-check.mjs (source vs build)  →  PASS?  ── yes ──▶ advance
        ▲                                     │
        └────────── fix from the measured diff ── no ──┘   (re-run; repeat)
```

**"PASS" is defined — not a vibe:**
- **Lens 1 (content/type):** every source element has a matching build element — **zero unexplained
  MISSING/EXTRA** — and **no material property diff left** (size / weight / color / font / text-transform /
  text-decoration / animation / **icon-kind**). "Material" = a human would notice.
- **Lens 2 (geometry):** **no sibling overlaps**, and column x-starts aligned within tolerance.
- **Lens 3 (pixel):** mismatch under the region's target (**≈ ≤8%** for normal content regions; a
  photo-heavy or full-bleed section runs higher because the box framing inflates it — judge the *content*,
  not the frame).
- **Lens 4 (vertical spacing):** the per-row gaps (overline→title→subtitle) **and the block's gap-to-next**
  match the source within **~4px** — no oversized or collapsed gap. This is the tool's exit driver; an
  un-waived spacing delta is a FAIL (it's the miss that keeps slipping through the other lenses).

**Every residual diff must be one of two things — fixed, or a JUSTIFIED WAIVER you write down:**
a decorative flourish you deliberately skipped ("dashed halo — out of scope"), or a known tool artifact
("WP rewrote the emoji to `<img class=emoji>`, so Lens 1 reads icon-kind emoji→none — visually present").
An un-waived red item is a FAIL — fix it. Silence is not a pass.

**Run more than one tool when the region warrants it:** `fidelity-check.mjs` per region always;
`compare.mjs` (geometry + pixel + perceptual + structure ensemble) for a second opinion on a stubborn
region; `contrast.mjs` / the capture **contrast-review** before the ship gate. The region is done only
when the tools are green (or every residual is a written waiver) — **not** when the build "looks right."

## Rule 2.6 — Three levels of gate: each region, AND the whole page at the end

The loop above runs at **two** granularities, and neither replaces the other:

1. **Per-region gate (during the build).** **Phase 3:** the **header** and the **footer** are each their
   own gated region — header PASSES, then footer PASSES. **Phase 4:** **every section** is its own gated
   region — it PASSES before you build the next one.
2. **Overall full-page gate (after ALL sections).** Once every region is green, run **one final pass on
   the ASSEMBLED page** — the whole thing, source vs build — before the ship gate. Compare the **full-page
   screenshot** (the capture's `full.png` vs a full-page shot of your build) with `compare.mjs` /
   pixel+perceptual, and scan for what only shows when assembled: **inter-section spacing & rhythm**,
   **cross-section consistency** (a heading size / brand color that drifted between sections), the
   **sticky header overlapping** the first section, overall **page height / proportion**, and any z-index
   or full-width bleed that a cropped region hid. A per-region PASS does **not** imply a whole-page PASS —
   the wall can be crooked even when every brick is square. Same rule: loop until PASS or written waiver.

## Rule 2.7 — Capture the FULL computed-style set, and TRANSCRIBE the source's values (don't guess)

The compounding failure this session: eyeballing a button as "close enough" and, when I finally measured,
capturing only a **partial** property set (font + color) — so the real misses (pill vs rounded-rect radius,
chunky vs thin padding, dark vs white text) survived pass after pass. Two hard rules:

1. **Measure the FULL property set for any styled/interactive element** (button, badge/pill, card, input,
   icon), not just typography. At minimum, per element, diff: `backgroundColor`, `color`, `padding`,
   `borderRadius`, `borderWidth`, `borderColor`, `boxShadow`, `fontSize`, `fontWeight`, `fontFamily`,
   `letterSpacing`, `lineHeight`, `textTransform`, and — for icon buttons — the **child icon's** `width`/
   `height` and the **gap** between text and icon. Print a **property × {source, build, match?}** table and
   fix every non-trivial DIFF. A partial capture reads "ok" while the element is visibly wrong.
2. **Transcribe the SOURCE's measured value — never invent one.** Select the source's actual element
   (the real `<a>`/`<button>`/`<img>`, matched by text/role), read its computed value, and set the build to
   **that exact number** — through the framework option that OWNS the property (a **Button Size/Color
   Preset**, a **column option**, a **typography token**), not a per-section CSS patch. E.g. source button
   = `border-radius: 9999px; padding: 16px 32px; color: #fff` → set the Size Preset to those values, not a
   guessed "looks chunky." Applies to sizes too: the hero image was `object-cover w-[420px]` → set the build
   image to **420px**, not "smaller-ish."
3. **Row/column vertical alignment is a measurable property.** For a two-column row (text + media), compute
   each column's **vertical center** (`(top+bottom)/2`) and diff them — a large offset means the media is
   top-pinned, not centered. Fix with the **column's own vertical-align / content-position option**, not a
   `margin-top` nudge. (Here: source image-vs-text center offset was −24px; the build was −97px until the
   media column's vertical centering was set.)

**Why partial capture is dangerous:** the same element can pass a font/color check and still be the wrong
*shape* (radius), *weight* (padding/height), or *ink* (a base `.btn{color:inherit}` overriding a preset on
load order). If you can measure a property, you have no excuse to guess it.

## Rule 2.8 — A FIX is not done until you re-measure it against the source (post-fix comparison pass)

**Applying a change is not fixing it. Confirming it now matches the source is.** After every fix —
especially a reactive one to a reported issue — **re-run the DOM computed-style + geometry diff against
the source for the element(s) you touched, and only declare it done when the numbers match.** "I added
the CSS / it looks better in a screenshot" is not evidence; a re-measured `demo == source` is.

- Do the pass **before saying "fixed"**, every time — this is the step that keeps a user from having to
  tell you the same design is still wrong. A fix that "looks close" routinely lands 40px off (title→sub
  gap) or 0px where it needs 64 (block→card), and only a re-measure catches it.
- Re-measure the **exact properties + gaps** that were wrong, not just "does it render". For a heading
  block that means: overline→title gap, title→subtitle gap, block→next-element gap, and each element's
  `fontSize`/`fontWeight`/`letterSpacing`/`color` — vs the source/replica.
- If a margin/gap "didn't take", it's usually applied to the wrong node — the special-heading and the
  next element are **separate wrapper siblings**, so the gap goes on the sibling (`.cupcake-builder`
  `margin-top`), not inside `.heading`. Re-measuring is how you find that; eyeballing is how you miss it.
- Batch fixes → **one comparison pass over all of them** at the end, then report only what the numbers confirm.

## Rule 3 — The order (ties into the region loop)

Header → Footer → sections top-to-bottom (see the protocol's region-loop). For **each** region:
`capture source spec → build to spec → run the 3 lenses → fix from measured values → re-run → advance`.

## Rule 3.5 — You MUST diff against the SOURCE, per region — NEVER "verify" against memory

The single failure this whole doc exists to prevent: declaring a region done after looking at **your
build alone** and comparing it to what you *remember* the source looking like. That is not verification —
it is guessing, and it silently misses whole elements. (Real miss: the header was "verified" from a
build-only screenshot and shipped **without the source's announcement topbar** — a full band of content —
because the source was never captured for a side-by-side.)

- **Capture the SOURCE every time.** Screenshot the source region (or run `fidelity-check.mjs`, which
  captures BOTH source and build) and put the two **side-by-side**. If you did not open the source in
  this verification pass, you did not verify.
- **The header and footer are REGIONS** — run the checker on them exactly like body sections. Chrome is
  where the recurring misses hide: a topbar, a right-side cart button treatment, a widget column.
- **Run the tool, don't just eyeball.** `node tools/measure/fidelity-check.mjs <srcUrl> <sel> <buildUrl>
  <sel>` for each region. Lens 1 lists **missing/extra elements** (it would have printed the topbar as
  MISSING); Lens 2 catches geometry; Lens 3 gives the pixel-mismatch %. A region is done only when its
  lenses pass — not when your build "looks right" on its own.
- **Also confirm webfonts actually LOADED**, not just declared. `getComputedStyle().fontFamily` shows the
  *declared* stack even when the font never downloaded — check `document.fonts.check('700 20px <Family>')`
  and that a Google-Fonts/`@font-face` request for the family is present. A declared-but-unloaded font
  falls back to a system sans and reads as "the font is wrong".

## Tooling (in the kit — `tools/measure/`)

- **`tools/measure/fidelity-check.mjs`** — the per-element **4-lens** runner: **Lens 1** diffs the
  **full computed style** per element matched by text — font size/weight/color/family/text-transform
  **plus text-decoration, animation, box-shadow, transform, letter-spacing** (a comprehensive diff, NOT
  a curated subset, so a wavy underline or a bounce animation is *flagged*, not silently missed) + icon
  kind + missing/extra; **Lens 2** geometry (column x, overlap); **Lens 3** pixel (pixelmatch %);
  **Lens 4 VERTICAL SPACING** — anchors on the region's heading, uses its parent block, and diffs the
  **gaps between the block's children (overline/title/subtitle rhythm) + the gap BELOW the block**
  (the `mb-16`-style container spacing), **ranked biggest-delta-first** so a VERY-obvious 44px miss
  is reported above a subtle 2px one. This lens exists because x-positions + typography are blind to
  vertical rhythm — the single most-visible dimension and the one that kept slipping through by eye.
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
