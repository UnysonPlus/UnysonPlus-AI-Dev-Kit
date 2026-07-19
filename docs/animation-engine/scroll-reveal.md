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

- Triggered by a passive scroll check when the element enters view; no library.
- Honours "reduce motion" (shows instantly) and loads only on pages that use it.
- Canvas styles suit images (pixel/dissolve resolve); wipes suit any element.
