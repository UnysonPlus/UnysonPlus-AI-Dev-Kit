# page-transitions — Page Transitions (Animation Engine)

A full-screen overlay reveals each page on load and covers it when the visitor navigates, so pages
feel connected. **Site-wide** — configured in Theme Settings → Animations → Page Transitions (not a
node `fx` slot). Front end only. Requires the `animation-engine` extension to be **ACTIVE**.

## Effects / styles

The `transition` picker (key **`transition`**, default `fade`), grouped: **Wipe & Slide** — `wipe` ·
`slide` · `diagonal` · `curtain` · `doors` · `split` · `bars` · `blinds` · `stripes`. **Shape & Iris**
— `reveal` (circle) · `iris` · `shape` · `conic` · `morph`. **Fade & Zoom** — `fade` · `contentfade`
· `zoom`. **3D & FX** — `flip` · `rotate` · `glitch` · `pixels` · `checkerboard` · `ripple`.

## Value shape

Theme Settings option `animation_pt` (a `multi`):

```json
"animation_pt": {
  "enable": "no",
  "transition": { "transition": "slide", "slide": { "direction": "up" } },
  "color": { "predefined": "", "custom": "#0e1524" },
  "duration": 0.6,
  "loader": "no",
  "loader_style": "spinner" }
```

## Params

| Param | Default | Notes |
|---|---|---|
| `enable` | `no` | Master switch (`yes`/`no`) |
| `transition` | `fade` | Transition style (multi-picker, key `transition`) |
| **`color` COLOR** | `#0e1524` | Overlay colour (compact `{predefined,custom}`) |
| `duration` | `0.6` | Overlay seconds (0.2–1.5) |
| `loader` | `no` | First-visit loading indicator, once per session (`yes`/`no`) |
| `loader_style` | `spinner` | `spinner` / `bar` / `dots` |

Per-transition reveals (only these carry sub-options):

| Transition | Sub-option (default) |
|---|---|
| `slide` | `direction` up `[up/down/left/right]` |
| `wipe` | `direction` left `[left/right/up/down]` |
| `curtain` / `split` | `split`/`direction` vertical `[vertical/horizontal]` |
| `reveal` | `origin` center `[center/tl/tr/bl/br]` |
| `diagonal` | `direction` tlbr `[tlbr/trbl]` |
| `shape` | `shape` circle `[circle/square/diamond]` |
| `flip` | `axis` y `[y/x]` |
| `blinds` | `direction` vertical `[vertical/horizontal]`, `count` 6 (3–10) |
| `checkerboard` | `density` 12 (8–20) |
| `pixels` | `density` 14 (8–20) |

## Notes

- Ships disabled by default; front end only (no effect in the builder/editor).
- Overlay colour and all transition SVG tiles resolve through the compact color-preset shape where
  applicable, staying live-linked to Theme Settings → Colors.
