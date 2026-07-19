# marquee — Marquee (Animation Engine)

Scrolls a node's content in a seamless, never-ending loop (a ticker / running-text banner). Rides the shared `fx` block on the **`marquee`** slot (added to the element's Animations tab). Picker key **`mode`** = the scroll direction, off = `none`. Requires the `animation-engine` extension ACTIVE (ships inactive). Content is cloned so the loop has no jump; pure CSS animation, no library; loads only on pages that use it.

## Effects / styles
`mode` is the direction: **`left`** · **`right`** · **`up`** · **`down`**. Horizontal (`left`/`right`) share one option set; vertical (`up`/`down`) add `text_orientation` (inserted after `gap`). Best on a heading / large type.

## Value shape
```json
"marquee": { "mode": "left", "left": {
  "speed": "normal", "gap": 40, "separator": "", "pause_on_hover": "yes",
  "edge_fade": "no", "scroll_reactive": "no", "draggable": "no", "custom_speed": 0,
  "text_style": "normal",
  "skew_h": 0, "skew_v": 0, "tilt": 0, "bend": 0, "curve": 0, "wave": 0 } }
```
Vertical (`up` / `down`) add `"text_orientation": "horizontal"`.

## Params
| key | type | default | notes |
|---|---|---|---|
| `speed` | select | `normal` | `slow` / `normal` / `fast` |
| `gap` | slider | `40` | px between repeats (0–200) |
| `separator` | text | `""` | optional text between repeats (e.g. `•`) |
| `pause_on_hover` | switch | `yes` | |
| `edge_fade` | switch | `no` | soft fade at container edges |
| `scroll_reactive` | switch | `no` | speed up as visitor scrolls |
| `draggable` | switch | `no` | grab & flick with momentum |
| `custom_speed` | number | `0` | px/s override; 0 = use preset |
| `text_style` | select | `normal` | `normal` / `outline` (hollow letters, text only) |
| `text_orientation` | select | `horizontal` | **up/down only:** `horizontal` (stacked lines) / `sideways` / `upright` |
| `skew_h` / `skew_v` | slider | `0` | slant left-right / up-down (-100–100) |
| `tilt` | slider | `0` | rotate the whole banner (-100–100) |
| `bend` | slider | `0` | 3D-perspective tilt (-100–100) |
| `curve` | slider | `0` | arc text along a real curve (text only; overrides Bend for text) |
| `wave` | slider | `0` | undulate up/down as it scrolls (0–100) |

## Notes
- Global on/off: Theme Settings → Animations. Honours "reduce motion".
