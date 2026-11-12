<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# scroll-reveal — Scroll Reveal (Animation Engine)

Un-masks an element as it scrolls into view — an animated **clip-path wipe**, or a Canvas
pixel/dissolve resolve for images. Rides the node **`fx.scroll_reveal`** slot (picker key **`mode`**;
"off" value `none`). Per-element (attaches from every element's Animations tab). Requires the
**animation-engine extension ACTIVE**.

## Effects / styles

22 `mode` keys. Clip-wipe directions (share one option group):
`left` · `right` · `up` · `down` · `iris` · `diagonal` · `diag_tr` · `diag_bl` · `diag_br` ·
`split_h` · `split_v` · `box` · `rounded` · `diamond` · `ellipse` · `corner_iris` · `chevron` ·
`triangle` · `blinds` · `bars`.

Two Canvas styles with their own groups: `pixelate` (pixel-block resolve) · `dissolve` (random-block
reveal).

## Value shape

```json
"scroll_reveal": { "mode": "up", "up": {
  "duration": 0.7,
  "delay": 0,
  "easing": "cubic-bezier(0.22, 1, 0.36, 1)",
  "replay": "no"
} }
```

Canvas styles:

```json
"scroll_reveal": { "mode": "pixelate", "pixelate": {
  "coarseness": 100, "steps": 5, "speed": 80, "replay": "no" } }

"scroll_reveal": { "mode": "dissolve", "dissolve": {
  "block": 24, "speed": 40, "replay": "no" } }
```

## Params

| Param | Type | Default | Applies to | Notes |
|---|---|---|---|---|
| `duration` | slider | `0.7` (0.2–2) | wipes | Seconds. |
| `delay` | number (float) | `0` | wipes | Wait after entering view. |
| `easing` | select | `cubic-bezier(0.22, 1, 0.36, 1)` | wipes | `ease` / `ease-out` / `ease-in-out` / `linear` / smooth default / `cubic-bezier(0.68, -0.55, 0.27, 1.55)` (overshoot). |
| `replay` | switch | `'no'` | all | Re-run on each re-entry. |
| `coarseness` | slider | `100` (20–200) | `pixelate` | Initial block size px. |
| `steps` | slider | `5` (3–8) | `pixelate` | Resolution steps to sharp. |
| `speed` (ms) | slider | `80` (40–300) | `pixelate` | Step speed. |
| `block` | slider | `24` (8–80) | `dissolve` | Block size px. |
| `speed` (ms) | slider | `40` (10–120) | `dissolve` | Batch delay. |

## Notes

- Triggered by a passive, rAF-throttled scroll check on the element's layout box; no library.
  **Not** an `IntersectionObserver`: the element starts clipped to zero area and Chromium folds
  the target's own `clip-path` into the intersection ratio, so a clipped element reports ratio 0
  and never fires. `getBoundingClientRect()` ignores `clip-path`, hence the scroll check.
- **The reveal starts well before the fold, and the runway scales with the wipe's own duration** (`LEAD` in `scroll-reveal.js`,
  overridable with `upwScrollRevealCfg.lead`). This matters more than it looks, and the old value
  of 0.88 was a real defect: the wipe only began once the element was nearly fully on screen, so a
  reader arrived at a section, found a blank box where the picture goes, and watched it open. It
  reads as an image that failed to load — the one thing a reveal must never look like. A real
  report of "blank images when I scroll" turned out to be exactly this, with the images already
  fully loaded.
  Measured by sweeping the lead on a real page (durations 1.2-1.3s), counting how open each image
  was when a reader's eye would land on it: **0.88 → 9 of 46 samples under a quarter open; 1.25 → 3;
  1.6 → none**, with 17 of 46 still caught mid-wipe so the effect stays visible. Past that it only
  costs the animation: at 2.5 nearly everything is already fully open before it is seen.

  **A fixed lead is not enough, which is the part that took two passes to get right.** A fixed lead
  buys a fixed amount of TIME, but the time needed is the duration itself, so a page that had
  raised its durations still showed half-open images. `leadFor( el )` therefore derives the lead
  per element from its own computed `transitionDuration`:
  `1 + min( duration, 2 ) * VH_PER_SEC` (1.1 viewport-heights per second, `cfg.scrollRate`), with
  `cfg.lead` still overriding everything. Re-measured on the same page with real wheel scrolling
  rather than instant jumps — which is what exposed the gap, so **test this with `mouse.wheel`, not
  `scrollTo`**: at a normal ~2,500 px/s, fixed-1.6 left 1 blank and 5 half-open against **0 and 0**
  for duration-aware; at a ~10,000 px/s fling, 10 blanks became 2. Nothing can fully outrun a 1.3s
  wipe at fling speed; the answer there is a shorter duration.
- **Duration is per element** (`--cr-dur`, default **0.7s**). A long value re-creates the problem
  no matter what `LEAD` is, since the blank period scales with it — a page setting 1.3s was what
  surfaced the bug. When diagnosing "the image is late", check `--cr-dur` and the computed
  `clip-path` BEFORE assuming it is image loading; `img.complete` on the element settles it in one
  step.
- Honours "reduce motion" (shows instantly) and loads only on pages that use it.
- Canvas styles suit images (pixel/dissolve resolve); wipes suit any element.
