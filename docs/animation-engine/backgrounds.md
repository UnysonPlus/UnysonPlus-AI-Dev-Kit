# backgrounds — Animated Backgrounds (Animation Engine)

Renders an animated canvas/CSS background layered *behind* a container's content. It is **not** an `fx`-block slot — it rides the container's **Styling tab** as the `bg_effect` att (injected into `section` / bleed / masonry containers). Requires the `animation-engine` extension ACTIVE (ships inactive). Global on/off: Theme Settings → Animations → Backgrounds. Honours "reduce motion" (static frame) and pauses off-screen.

## Effects / styles
One `multi-picker` (picker id **`effect`**, off = `none`). 35 styles grouped Gradient&Glow / Particles / Geometric / Motion&Fluid / Digital FX. Each style reveals its own params (color params use the compact `{predefined,custom}` shape via `upw_bg_color_field(kind='bg')`; `speed` is seconds).

`aurora` · `borealis` · `bokeh` · `bubbles` · `circuit` · `confetti` · `conic` · `constellation` · `spotlight` · `dots` · `fireflies` · `shapes` · `flow` · `orbs` · `gradient` · `noise` · `grid` · `halftone` · `hexgrid` · `rays` · `matrix` · `mesh` · `blobs` · `nebula` · `orbits` · `particles` · `pgrid` · `rain` · `ripple` · `scanlines` · `meteors` · `snow` · `starfield` · `topo` · `waves`

## Value shape
```json
"bg_effect": { "effect": "aurora", "aurora": {
  "color_a": { "predefined": "", "custom": "#6a8dff" },
  "color_b": { "predefined": "", "custom": "#c56cff" },
  "color_c": { "predefined": "", "custom": "#00d4c8" }, "speed": 8 } }
```

## Params (per style, key = default)
| style | params |
|---|---|
| `aurora` / `conic` | `color_a` #6a8dff/#2f74e6, `color_b`, `color_c`, `speed` 8/12 |
| `gradient` | `color_a` #2f74e6, `color_b`, `color_c`, `angle` 120, `speed` 10 |
| `mesh` | `color_a`/`color_b`/`color_c`/`color_d`, `speed` 12 |
| `orbs` | `color_a`, `color_b`, `speed` 10 |
| `nebula` | `color`/`color2`/`color3`, `speed` 8 |
| `blobs` / `borealis` | `color`, `color2`, `speed` 6 |
| `spotlight` | `color` #6aa6ff, `size` 260 |
| `rays` | `color` #fff, `angle` 25, `speed` 10 |
| `dots` | `color` #94a3b8, `size` 2, `gap` 26 |
| `grid` | `color` #94a3b8, `gap` 40, `speed` 12 |
| `halftone` | `color`, `gap` 16, `speed` 6 |
| `pgrid` / `hexgrid` / `topo` / `circuit` / `ripple` / `matrix` | `color`, `speed` 6 |
| `particles` / `constellation` / `flow` / `snow` / `bubbles` / `fireflies` / `bokeh` / `rain` / `shapes` / `meteors` / `starfield` / `orbits` | `color`, `density`, `speed` (constellation adds `link_dist` 120; snow adds `variant` snow/petals/embers/ash; orbits `density`=systems 4) |
| `waves` | `color` #2f74e6, `amplitude` 30, `speed` 6 |
| `noise` | `opacity` 0.06, `speed` 1 |
| `scanlines` | `color` #000, `opacity` 0.12, `speed` 6 |
| `confetti` | `density` 60, `speed` 3 |

## Notes
- Emits `class="sc-bg sc-bg--<effect>"` + `data-bg` (and per-style `--bg-*` CSS vars or `data-bg-*` attrs) on the container wrapper.
- Colors resolve preset slug → `var(--color-<slug>)`, else the custom hex, else a per-style default.
- On-demand assets: only the chosen style's JS partial loads (not the whole 35-style bundle).
