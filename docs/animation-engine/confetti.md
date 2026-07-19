# confetti — Confetti Burst (Animation Engine)

Fires a celebratory Canvas 2D particle burst from an element on a trigger. It is **not** an `fx`-block slot — it is appended to every element's **Animations tab** as the top-level `confetti` att (`sc_animation_fields`). Requires the `animation-engine` extension ACTIVE (ships inactive). One shared full-viewport `<canvas>`, no library. Honours "reduce motion" (no burst); global on/off: Theme Settings → Animations.

## Effects / styles
One `multi-picker` (picker id **`style`**, off = `none`). 26 styles across four tabbed groups; **all styles share one option group**:

- **Classic:** `confetti` · `stars` · `fireworks` · `streamers` · `hearts` · `snow`
- **Realistic & Foil:** `realistic` · `foil_gold` · `foil_silver` · `rose_gold` · `holographic` · `triangles` · `hexagons` · `money` · `serpentine`
- **Nature:** `sakura` · `autumn_leaves` · `realistic_snow` · `rain`
- **Glow & Sparkle:** `glitter` · `bokeh` · `fairy_dust` · `fireflies` · `embers` · `champagne` · `bubbles`

## Value shape
```json
"confetti": { "style": "confetti", "confetti": {
  "trigger": ["view"], "count": 90, "spread": 70, "power": 45,
  "duration": 3, "palette": "brand", "replay": "no" } }
```

## Params
| key | type | default | notes |
|---|---|---|---|
| `trigger` | image-picker (multi) | `["view"]` | any of `view` (scroll into view) / `click` / `load` / `hover` |
| `count` | slider | `90` | particle count (20–400) |
| `spread` | slider | `70` | fan-out degrees (20–360; 360 = all directions) |
| `power` | slider | `45` | initial launch velocity (15–100) |
| `duration` | slider | `3` | particle lifetime seconds (1–7) |
| `palette` | select | `brand` | `brand` / `rainbow` / `gold` / `pastel` / `mono` / `silver` / `natural` (used by colour-flexible styles; themed styles carry own colours) |
| `replay` | switch | `no` | re-fire on every re-entry (view trigger) |

## Notes
- Emits `class="sc-confetti"` + `data-cf-style` / `data-cf-trigger` (space-joined) / `data-cf-count` / `data-cf-spread` / `data-cf-power` / `data-cf-duration` / `data-cf-palette` / `data-cf-replay` on the wrapper.
- Trigger tolerates a legacy scalar save; empty → `["view"]`. Forces an element wrapper when confetti is the only non-default setting.
- One on-demand script serves all 26 styles.
