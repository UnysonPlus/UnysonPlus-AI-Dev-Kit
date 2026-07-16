# Design parity checklist + measurement algorithm

How to verify the dev site matches the mockup **numerically**, not by eye.

## The algorithm

1. Render **mockup** and **dev** at the **same width** (default 1440; also check 768 tablet).
2. Extract a fixed metric set from each DOM (below).
3. Diff dev − mockup; **fail** anything outside tolerance.
4. Fix fails, re-run. Don't advance a phase while its metrics fail.

Run it:

```
node tools/measure/measure.mjs "file:///D:/Web Dev/test-sites/<site>/mockup/index.html" "http://localhost/<site>/" --width 1440
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
