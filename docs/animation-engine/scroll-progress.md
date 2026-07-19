# scroll-progress — Scroll Progress (Animation Engine)

A **site-wide** reading-progress indicator (16 styles). This is NOT a per-node `fx` slot — it is a
page-level indicator configured in **Theme Settings → Animations → Scroll Progress**, saved to the
settings options `animation_scrollprog` (on/off) + `scrollprog` (style). Requires the
**animation-engine extension ACTIVE**, and only renders on the front end when enabled.

## Effects / styles

Style picker (`scrollprog.kind`, popover image-picker). 16 choices:
`bar` · `gradient` · `glow` · `segments` · `pill` · `labeled` · `under_nav` · `liquid` · `edge` ·
`ring` · `ring_number` · `gauge` · `battery` · `counter` · `reading_time` · `dots`.

Only the chosen style's CSS+JS family loads site-wide (`bar` / `circle` / `battery` / `chip` /
`dots`), so it stays ~4–6 KB.

## Value shape

```json
"animation_scrollprog": { "enable": "no" },
"scrollprog": {
  "kind": "bar",
  "bar": {
    "position": "top",
    "color": { "predefined": "", "custom": "#2f74e6" },
    "thickness": 4,
    "hide_top": "yes"
  }
}
```

Each style key holds its own option sub-array (only the chosen style's is read).

## Params

| Param | Type | Default | Applies to | Notes |
|---|---|---|---|---|
| `animation_scrollprog.enable` | switch | `'no'` | all | Master on/off (front end only). |
| `kind` | picker | `'bar'` | — | Which style renders. |
| `position` | select | `'top'` (bars) | bar-family | `top` / `bottom`. |
| `color` | color `{predefined,custom}` | `#2f74e6` | all | Primary color. |
| `color2` | color `{predefined,custom}` | `#c56cff` | `gradient` | End color. |
| `thickness` | slider | `4` (2–14) | bars/edge | Bar thickness px. |
| `size` | slider | `56` (32–96) | `ring`/`ring_number`/`gauge`/`battery` | Corner widget px. |
| `segments` | slider | `12` (4–30) | `segments` | Segment count. |
| `offset` | slider | `60` (0–200) | `under_nav` | Top offset px. |
| `wpm` | slider | `220` (120–400) | `reading_time` | Words per minute. |
| `position` (side) | select | `'right'` | `edge`/`dots` | `right` / `left`. |
| `position` (corner) | select | `'br'` | `ring`/`gauge`/`battery` | `br` / `bl`. |
| `position` (4-corner) | select | `'br'` | `counter`/`reading_time` | `br`/`bl`/`tr`/`tl`. |
| `click_top` | switch | `'yes'` | `ring`/`ring_number` | Click to scroll top. |
| `hide_top` | switch | `'yes'` | all | Fade in only after scroll starts. |

## Notes

- Colors resolve via `sc_color_to_css()`; `predefined` (palette slug) wins over `custom` hex.
- Config is emitted to `window.upwScrollProgCfg` as inline JS before the family script.
- Single site-wide choice — not stackable and not attached to page-builder nodes.
