# hover — Hover Interactions (Animation Engine)

Pointer/hover effects on a page-builder node. Rides the shared `fx` block on the **`interaction`** slot — plus **`interaction__2` / `interaction__3` / `interaction__4`**, so up to **four** hover effects stack on one node (same shape in each slot). Picker key **`effect`**, off = `none`. Requires the `animation-engine` extension ACTIVE (ships inactive). Rendered wrapper carries `sc-hover sc-hover--<effect>` (one modifier class per applied slot).

## Effects / styles
Pick per slot. Colors use the compact `{predefined,custom}` shape (**COLOR** below). `lift` and `shine` also work param-less (`{effect:"lift"}`).

## Value shape
```json
"interaction": { "effect": "spotlight", "spotlight": {
  "style": "glow", "glow_color": { "predefined": "", "custom": "#6aa6ff" },
  "color_b": { "predefined": "", "custom": "#a06bff" }, "glow_size": 40 } }
```
Stack a second effect in `interaction__2`, e.g. `{ "effect": "lift", "lift": { "style": "lift", "distance": 6, "shadow": "yes" } }`.

## Params (key = default; COLOR flagged; `[choices]`)
| effect | params |
|---|---|
| `spotlight` | `style` `glow` `[glow/gradient]`, **`glow_color`** #6aa6ff, **`color_b`** #a06bff, `glow_size` 40 |
| `lift` | `style` `lift` `[lift/tilt/sink]`, `distance` 6, `shadow` `yes` |
| `shine` | `style` `sheen` `[sheen/holographic]`, **`shine_color`** #ffffff, `speed` 3 |
| `tilt` | `max_tilt` 12, `hover_scale` 1, `glare` `no`, `invert` `no` |
| `magnetic` | `mode` `pull` `[pull/push]`, `strength` 0.3 |
| `glow_border` | **`glow_color`** #6aa6ff, `mode` `steady` `[steady/pulse]` |
| `scale` | `direction` `in` `[in/out]`, `scale_to` 1.04 |
| `color_shift` | **`shift_color`** #6aa6ff, `target` `background` `[background/text/border]` |
| `underline_grow` | **`line_color`** "" (→text), `position` `under` `[under/over/through]`, `origin` `left` `[left/center]` |
| `image_reveal` | `reveal_style` `zoom_gray` `[zoom/grayscale/zoom_gray/shine/blur/duotone]`, `zoom` 1.06 |
| `bounce` | `style` `up` `[up/drop/squash]`, `height` 10 |
| `jelly` | `strength` 1 |
| `pulse` | `style` `scale` `[scale/glow/opacity]`, `strength` 1 |
| `push` | `style` `press` `[press/inz]`, `depth` 5 |
| `rotate` | `style` `flat` `[flat/flip3d]`, `angle` 6 |
| `shake` | `style` `horizontal` `[horizontal/vertical/rotate]`, `strength` 1 |
| `skew` | `axis` `x` `[x/y/both]`, `angle` -6 |
| `squash` | `strength` 1 |
| `ripple` | **`ripple_color`** #6aa6ff, `origin` `pointer` `[pointer/center]` |
| `shockwave` | **`color`** #6aa6ff |
| `blur` | `amount` 4, `direction` `rest` `[rest/hover]` |
| `brightness` | `filter` `brightness` `[brightness/contrast/saturate]`, `mode` `brighten` `[brighten/dim]`, `amount` 20 |
| `grayscale` | `filter` `grayscale` `[grayscale/sepia/invert/hue/saturate]`, `amount` 100 |
| `glitch` | `style` `rgb` `[rgb/slice/jitter]`, `strength` 1 |
| `border_draw` | **`line_color`** #6aa6ff, `start` `corner` `[corner/center]`, `thickness` 2 |
| `corner_brackets` | **`bracket_color`** #6aa6ff, `style` `pop` `[pop/draw]`, `bracket_size` 18 |
| `gradient_border` | **`color_a`** #6aa6ff, **`color_b`** #a06bff, `speed` 3 |
| `marching_ants` | **`line_color`** #6aa6ff, `speed` 0.5 |
| `outline` | **`line_color`** #6aa6ff, `style` `solid` `[solid/dashed/double]`, `offset` 6, `thickness` 2 |
| `letter_spacing` | `amount` 3 |
| `magnetic_letters` | `strength` 1 |
| `text_scramble` | `duration` 0.8 |
| `text_swap` | `swap_text` "", `mode` `slide` `[slide/fade/flip]`, `direction` `up` `[up/down]` |
| `blob` | **`color`** #6aa6ff, `size` 70 |
| `cursor_trail` | **`color`** #6aa6ff, `size` 10 |
| `flashlight` | `size` 90, `darkness` 82 |
| `depth_layers` | `strength` 1 |
| `arrow_slide` | **`arrow_color`** "" (→text) |
| `bg_pan` | **`color_a`** #2f74e6, **`color_b`** #a06bff, `angle` 120, `speed` 3 |
| `fill_sweep` | **`fill_color`** #2f74e6, `direction` `left` `[left/right/up/center/diagonal]` |
| `peel` | **`color`** "", `size` 22 |
| `goo` | `speed` 4 |
| `webgl_displace` | `style` `both` `[both/refract/liquid]`, `strength` 0.35, `chroma` 0.4, `speed` 0.6, `trigger` `hover` `[hover/always]` |

## Notes
- Use distinct effects across the four slots to stack (e.g. spotlight + lift + shine).
- COLOR params: blank falls back to a computed default (often the element's text color); preset slug live-links to `var(--color-<slug>)`.
