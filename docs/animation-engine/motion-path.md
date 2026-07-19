# motion-path — Motion Path (Animation Engine)

Sends a node travelling along an SVG path instead of a straight line — scrubbed by scroll, looped, or played once on view. Rides the shared `fx` block on the **`motion_path`** slot (appended to every element's Animations tab). Picker key **`mode`** = the path shape, off = `none`. Requires the `animation-engine` extension ACTIVE (ships inactive). Pure SVG geometry + one runtime; honours "reduce motion" (stays put); loads only on pages that use it.

## Effects / styles
37 preset shapes **all share one option group**; `custom` adds a raw SVG path field on top.

Shapes: `wave` · `arc` · `loop` · `s_curve` · `zigzag` · `spiral` · `circle` · `incline` · `figure8` · `double_loop` · `knot` · `triangle` · `square` · `diamond` · `pentagon` · `hexagon` · `octagon` · `star` · `stairs` · `steps_down` · `l_corner` · `chevron` · `lightning` · `u_turn` · `bounce` · `pendulum` · `helix` · `corkscrew` · `swoosh` · `comet` · `ricochet` · `heart` · `teardrop` · `petal` · `ribbon` · `line` · `drift` · `custom`

## Value shape
```json
"motion_path": { "mode": "wave", "wave": {
  "drive": "scrub", "duration": 4, "path_size": 300, "start_offset": 0,
  "direction": "no", "align": "no", "easing": "ease-in-out" } }
```
`custom` adds `"custom_d": "M0,50 C25,0 75,100 100,50"` (SVG path `d` in a 0–100 box).

## Params
| key | type | default | notes |
|---|---|---|---|
| `drive` | select | `scrub` | `scrub` (tied to scroll) / `loop` (travels forever) / `view` (once on enter) |
| `duration` | slider | `4` | seconds for Loop / On-view (0.5–20) |
| `path_size` | slider | `300` | px box the shape travels within (40–1200) |
| `start_offset` | slider | `0` | begin part-way along path, % (0–100) |
| `direction` | switch | `no` | `no` forward / `yes` reverse |
| `align` | switch | `no` | rotate element to the path tangent (noses along curve) |
| `easing` | select | `ease-in-out` | `linear` / `ease-in` / `ease-out` / `ease-in-out` (Scroll drive stays linear) |
| `custom_d` | textarea | `"M0,50 C25,0 75,100 100,50"` | `custom` mode only — SVG path `d` in a 0–100 coordinate box |

## Notes
- Each preset `d` lives in a normalized 0–100 box, scaled to `path_size`; the element moves relative to its natural layout position (starts where it sits, travels the shape from there).
- Global on/off: Theme Settings → Animations (setting `animation_motion_path`).
