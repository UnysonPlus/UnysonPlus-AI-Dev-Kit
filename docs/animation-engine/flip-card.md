# flip-card — 3D Flip Card (Animation Engine)

Flips a page-builder node in 3D to reveal a built back face. Rides the shared `fx` block on the **`flip_card`** slot (added to the element's Animations tab). Requires the `animation-engine` extension ACTIVE (ships inactive). Pure CSS 3D transforms, no library; loads only on pages that use it.

## Effects / styles
One `multi-picker` (picker id **`mode`**, off = `off`). 7 flip styles, **all sharing the same back-face option group**: `flip` · `cube` · `fold` · `door` · `diagonal` · `pop` · `carousel`.

## Value shape
```json
"flip_card": { "mode": "flip", "flip": {
  "trigger": "hover", "auto_interval": 3, "direction": "h", "min_height": 260,
  "duration": 0.6, "perspective": 1400, "easing": "smooth", "radius": 0, "back_align": "center",
  "back_heading": "", "back_text": "", "back_image": [], "back_btn_text": "", "back_btn_url": "",
  "back_bg": { "predefined": "", "custom": "#2f74e6" },
  "back_color": { "predefined": "", "custom": "#ffffff" } } }
```

## Params
| key | type | default | notes |
|---|---|---|---|
| `trigger` | select | `hover` | `hover` / `click` (tap) / `scroll` (once on view) / `auto` (loop) |
| `auto_interval` | slider | `3` | seconds; Auto trigger only (1–12) |
| `direction` | select | `h` | `h` horizontal/Y axis · `v` vertical/X axis (Diagonal ignores) |
| `min_height` | slider | `260` | px, both faces share it (80–600) |
| `duration` | slider | `0.6` | flip seconds (0.2–1.5) |
| `perspective` | slider | `1400` | 3D depth px, lower = more dramatic (500–2600) |
| `easing` | select | `smooth` | `smooth` / `spring` (overshoot) / `out` / `linear` |
| `radius` | slider | `0` | corner radius px (0–48) |
| `back_align` | select | `center` | `top` / `center` / `bottom` |
| `back_heading` | text | `""` | back-face heading |
| `back_text` | textarea | `""` | back-face body |
| `back_image` | upload | `[]` | optional cover image behind back content |
| `back_btn_text` | text | `""` | back-face button label |
| `back_btn_url` | text | `""` | back-face button URL |
| `back_bg` | compact color | `{custom:'#2f74e6'}` | back background (kind `bg`) |
| `back_color` | compact color | `{custom:'#ffffff'}` | back text color (kind `text`) |

## Notes
- Front face = the element's own content; the back face is built entirely from the options above.
- Colors accept the compact `{predefined,custom}` shape; preset slug resolves to `var(--color-<slug>)`.
- Global on/off: Theme Settings → Animations (setting `animation_flip_card`).
