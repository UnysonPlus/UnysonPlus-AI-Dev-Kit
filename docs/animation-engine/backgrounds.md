<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# backgrounds — Animated Backgrounds (Animation Engine)

Renders an animated canvas/CSS background layered *behind* a container's content. It rides the element's **Animations tab** as a **multi-instance card** (`sc_animation_fields`), so several effects **stack** on one element (e.g. petals + rain + embers). Gated to CONTAINERS ONLY — a `fw_shortcode_get_options` filter prunes the card off non-container shortcodes (`upw_bg_containers()` = `section` / `bleed-section` / `masonry-section` / `row`). Requires the `animation-engine` extension ACTIVE (ships inactive). Global on/off: Theme Settings → Animations → Backgrounds. Honours "reduce motion" (static frame) and pauses off-screen.

## Effects / styles
One `multi-picker` (picker id **`effect`**, off = `none`) — **multi-instance** (`anim_meta['multi']=true`). Slots pre-declare as `bg_effect`, `bg_effect__2`, `bg_effect__3`, … up to `multi_max` (default **12**, filterable via `apply_filters('upw_bg_max_layers', 12)` — no hard cap). 35 styles grouped Gradient&Glow / Particles / Geometric / Motion&Fluid / Digital FX. Each style reveals its own params (color params use the compact `{predefined,custom}` shape via `upw_bg_color_field(kind='bg')`; `speed` is seconds).

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

## Rendering (single vs stacked)
- **One** active effect → stays on the container wrapper: `class="sc-bg sc-bg--<effect>"` + `data-bg` (+ per-style `--bg-*` CSS vars / `data-bg-*` attrs). Lighter markup.
- **Two or more** → wrapper gets `class="… sc-bg sc-bg--stack"` + **`data-bg-layers`** (a JSON array `[{effect,attrs,style}, …]`, back-to-front). The core JS `expandStacks()` builds one absolute `.sc-bg-layer` child per effect before the render loop, then lifts real content above. **Pass `data-bg-layers` RAW** — `fw_attr_to_html` escapes once; a second `esc_attr()` double-encodes the quotes and breaks `JSON.parse`.

## Page-wide background (Page Settings → Animations)
The theme's **Page Settings → Animations** tab is the SAME `animation-stack` inserter shortcodes use, filtered to page-scope modules by **`upw_page_animation_fields()`** (Entrance `animation`, Scroll Motion `gsap_motion`, Background `bg_effect` — multi/stackable). The Background card saves under the same `bg_effect`/`bg_effect__N` keys as a shortcode. On the front end the theme renders those keys as a **fixed page-wide host** via **`upw_bg_page_host($slots, $fixed)`** (backgrounds-render.php) at `wp_body_open` — a full-viewport `.upw-page-bg` div (`position:fixed/absolute; inset:0; z-index:-1`) carrying `data-bg`/`data-bg-layers`, recording each style's assets. The `page_bg_fixed` toggle pins it (still scene). Entrance/Scroll are applied to a `.upw-page-anim` wrapper around the content via `sc_build_wrapper_attr`. The Layout tab also gained a `page_bg_image_fixed` (parallax) toggle. Sections must be transparent for the fixed effect to show through.

## Notes
- Colors resolve preset slug → `var(--color-<slug>)`, else the custom hex, else a per-style default.
- On-demand assets: only the chosen styles' JS partials load (each stacked effect records via `upw_anim_use_asset`) — never the whole 35-style bundle.
- **Site Converter:** `detect_section_bg_effects()` (stitch) maps a source's DESCRIPTIVELY-NAMED ambient layers (`fg-leaves`/`fg-sakura`→`snow/petals`, `#grain`→`noise`, snow/rain/starfield/…) to stacked `bg_effect` slots on the section; unnamed WebGL/particle backdrops become a `bgFxCandidate` the AI tier (`bgFxMicroTask`) maps to the nearest effect. See `extensions/site-converter.md`.
