# Design parity checklist + measurement algorithm

How to verify the dev site matches the mockup **numerically**, not by eye.

## The algorithm

1. Render **mockup** and **dev** at the **same width** (default 1440; also check 768 tablet).
2. Extract a fixed metric set from each DOM (below).
3. Diff dev − mockup; **fail** anything outside tolerance.
4. Fix fails, re-run. Don't advance a phase while its metrics fail.

Run it:

```
node tools/measure/measure.mjs "file:///<abs-path-to>/mockup/index.html" "http://localhost/<site>/" --width 1440
```

The selector map in `measure.mjs` (`METRICS`) is editable per project — tune the
mockup/dev selectors so each metric resolves on both sides.

## Metric set (default)

| Metric | Tolerance | Why |
|---|---|---|
| `container_maxwidth` | ±4px | The single most important frame number. Wrong here and everything drifts. |
| `header_height` | ±3px | Chrome must be locked first. |
| `logo_width` / `logo_height` | ±4px | The recurring miss — measure the **visible glyph**, not the PNG box. |
| `footer_height` | ±8px | Structure, looser tol (content varies). |
| `h1_fontsize` | ±2px | Type scale anchor. |
| `body_fontsize` | ±1px | Base rhythm. |

Extend per project: section padding T/B, row gaps, sidebar width, button height,
key colors (compare computed `color`/`background-color`).

## Region-by-region parity — the ENSEMBLE (`compare.mjs`)

`measure.mjs` gates the *frame* (7 numbers). `compare.mjs` compares the page **one region at a
time, matched by role and order** — header ↔ header, section 1 ↔ section 1, … , footer ↔ footer —
using **four independent signals**, aggregated **fail-loud** (a region PASSes only if *every*
signal passes). No single tool is enough; each catches a different failure class:

```
npm i    # in tools/measure — installs playwright, pixelmatch, pngjs, resemblejs
node tools/measure/compare.mjs "<mockup>" "<dev-url>" --width 1440 --out ./parity
```

| Signal | Engine | Catches | Blind spot |
|---|---|---|---|
| **GEOMETRY** | built-in | too tall / short / **missing / extra** bands; section count | content-blind (an *empty* header passes on height alone) |
| **PIXEL** | **pixelmatch** | visual/layout/color diffs (+ a pink diff PNG per region) | **video/animation** (a screenshot catches a different frame) |
| **PERCEPTUAL** | **Resemble.js** | mismatch %, anti-alias tolerant (second opinion + diff PNG) | same video noise |
| **STRUCTURE** | DOM diff | **missing/extra links, buttons, icons**; missing text tokens | counts, not looks — can't judge finish/spacing |

**STRUCTURE is the one that can't be fooled** — it's why "header: 1 link vs the mockup's 7"
hard-FAILs where pixel-only tools (and my earlier SSIM) wrongly passed it.

**Two limits baked into the tool — know them:**
- **Reference fidelity (use the LIVE source URL).** Pixel/perceptual are only as good as how
  faithfully the reference renders. A saved mockup HTML that hot-links a hero `<video src="/…">`
  or CDN icons won't render them offline → false diffs. Prefer the **live source URL** (or serve
  the mockup folder over http). `compare.mjs` is **video-aware**: a region that contains a
  `<video>` or is a transparent overlay while the page has video is marked **`vid`** and pixel/
  perceptual are **skipped** (geometry + structure decide) — so a correct video hero isn't
  red-flagged for frame timing.
- **Section matching is by INDEX.** "Your section *i*" is compared to "mockup band *i*". If the
  source's DOM bands don't segment 1:1 with your page-builder sections, structure counts (esp.
  icons/images) can drift. Trust the **body-section count** line + eyeball the per-region diff
  PNGs before acting on a lone structural delta.

Optional heavier alternative: **BackstopJS** (per-selector scenarios + HTML before/after/diff
report) — same pixel engine, nicer report, its own browser stack. Reach for it when you want the
report; `compare.mjs` is the zero-config default.

## Full-body PROPERTY diff (`props.mjs`)

The deepest check — and the one that catches what pixels and eyeballs miss. It walks both bodies,
captures each element's **computed style + geometry**, and reports **named property deltas**:

```
node tools/measure/props.mjs "<mockup>" "<dev-url>" --width 1440 --out ./parity
```

Two matchers (the DOMs differ, so no 1:1 tree diff):
- **Container** — per region, diff the region element's own box/background/border/padding.
- **Text-anchored** — match elements by their visible **text** (identical across source and a
  faithful rebuild), then diff typography/colour. Output reads `"get started now" font-size: mock
  16px → dev 20px` — located to the text you can see, with the exact property.

It reported *"every element `font-family: Inter → Open Sans`"* on this project — a **site-wide wrong
typeface** the frame metrics, the pixel ensemble, and manual review all sailed past. That's the
point of it: **it compares values, not counts or pixels.** Reads a `props-diff.json` to `--out`.

Noise control built in: `text-align: start ≡ left`, px tolerance ±1.5, border-colour skipped when
the border width is 0. Known false positive: **padding on an inner container vs the section
element** reads as a delta though it's visually equivalent — cross-check with `container_maxwidth`.
Use the **live source URL** so the reference's computed styles are real.

## Manual checklist (per section, in build order)

**Container / chrome (Phase 1 — must pass before sections):**
- [ ] container max-width matches (±4px)
- [ ] header height, background, border/shadow match
- [ ] logo size correct — small, even top/bottom gap; measure the glyph
- [ ] nav alignment + item style (plain/pill/underline) match
- [ ] footer columns/ratio, background, border, padding match
- [ ] copyright row matches

**Sections (Phase 2):**
- [ ] one section per mockup band, correct order
- [ ] section padding T/B within tolerance
- [ ] column widths + gaps match the mockup grid

**Elements (Phase 3):**
- [ ] simple elements placed; hard ones as `code_block` placeholders
- [ ] element typography/spacing polished last

## Logo sizing (the specific fix)

The logo reads "small" when sized by a guessed px or when the PNG has transparent
padding. Correct procedure:
1. Measure the **plaque/inner container** height.
2. Measure the logo's **visible glyph** bounds (trim transparent padding — inspect the
   rendered image, not the file's box).
3. Target: glyph fills the plaque minus a **small, equal** top/bottom gap (≈8–12% each).
4. Prefer the native `logo_type[simple][width]` option; use CSS only for the plaque
   overhang (which has no option — an enhancement candidate).
5. Re-measure `logo_width`/`logo_height` to tolerance.
