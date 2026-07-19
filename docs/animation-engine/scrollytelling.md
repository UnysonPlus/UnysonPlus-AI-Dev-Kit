# scrollytelling — Scrollytelling (Animation Engine)

Pins one column as a **media panel** while the other column's steps scroll past — the pinned media
swaps to match the active step (pinned-media narrative). Rides the Section's
**`fx.scrollytelling`** slot (picker key **`mode`**; "off" value `off`). **Section only** — injected
into the Section's Animations tab, not offered on grid collections. Requires the **animation-engine
extension ACTIVE**; global on/off in Theme Settings → Animations → Effects.

## Effects / styles

28 `mode` keys (transition between media states):
`crossfade` · `slide` · `zoom` · `clip_wipe` · `blur` · `ken_burns` · `parallax` · `pixelate` ·
`push` · `cover` · `curtain` · `split` · `flip` · `cube` · `tilt` · `iris` · `barn` · `blinds` ·
`dissolve` · `glitch` · `flash` · `duotone` · `zoom_blur` · `page_turn` · `scan` · `color_shift` ·
`frame_sequence` · `horizontal_track` · `liquid`.

**Directional styles** (`slide` · `push` · `cover` · `clip_wipe` · `curtain`) add a `direction`
sub-option; all others use the shared group only.

## Value shape

```json
"scrollytelling": { "mode": "crossfade", "crossfade": {
  "pin_side": "left",
  "media_height": 100,
  "pin_offset": 0,
  "activate_at": 50,
  "transition": 0.6,
  "intensity": 0.5,
  "progress": "dots"
} }
```

Directional styles prepend `"direction": "auto"`.

## Params

| Param | Type | Default | Notes |
|---|---|---|---|
| `pin_side` | select | `'left'` | `left` / `right` / `top` (stacked). Which column is the pinned media. |
| `media_height` | slider | `100` (60–100) | Pinned panel height (vh). |
| `pin_offset` | slider | `0` (0–160) | Top gap where the panel pins (clear a sticky header). |
| `activate_at` | slider | `50` (20–80) | Viewport % where a step becomes active. |
| `transition` | slider | `0.6` (0.2–1.2) | Crossfade / transition seconds. |
| `intensity` | slider | `0.5` (0–1) | Style strength (zoom / parallax / blur / drift). |
| `progress` | select | `'dots'` | `dots` / `bar` / `none`. |
| `direction` | select | `'auto'` | Directional styles only: `auto` / `up` / `down` / `left` / `right`. |

## Notes

- Build the Section with **two columns**: one stacks N media layers, the other holds N step blocks.
  Media layers map to steps by index (step 1 → media 1, …).
- Pure CSS sticky + IntersectionObserver; honours "reduce motion" (media shows statically above each
  step) and loads only on pages that use it.
