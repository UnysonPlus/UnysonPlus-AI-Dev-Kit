# physics — Physics Effects (Animation Engine)

Physics-driven motion (spring / verlet, no library) applied to any page-builder node. Rides the node
`fx` **`physics`** slot (picker key `effect`, off = `none`). Requires the `animation-engine`
extension to be **ACTIVE**.

## Effects / styles

27 effects, grouped in the picker: **Drag** — `draggable` · `slingshot`. **Pointer** (skipped on
touch) — `attract` · `tilt_inertia` · `orbit_cursor` · `repel` · `rubber_band` · `spring`.
**Ambient** (continuous) — `breathing` · `drift` · `float` · `levitate` · `orbit` · `pendulum` ·
`sway` · `wobble`. **Entrance** (one-shot on scroll-in) — `gravity` · `rise` · `pop` · `ragdoll` ·
`sag`. **Reaction** (hover/click) — `bounded` · `jelly` · `spin` · `recoil` · `shake` · `squash`.

## Value shape

```json
"physics": { "effect": "float", "float": { "amount": 12, "speed": 1, "rotate": "yes" } }
```

## Params (per effect; key = default; params are sliders unless noted)

| Effect | Params |
|---|---|
| `draggable` | `return` spring `[spring/free]`, `stiffness` 0.15, `axis` both `[both/x/y]` |
| `slingshot` | `power` 0.7 |
| `spring` | `strength` 0.25, `stiffness` 0.12 |
| `attract` | `strength` 0.6, `stiffness` 0.15 |
| `repel` | `radius` 120, `strength` 0.6 |
| `orbit_cursor` | `radius` 26, `speed` 1 |
| `rubber_band` | `strength` 0.4 |
| `tilt_inertia` | `max_tilt` 14 |
| `float` | `amount` 12, `speed` 1, `rotate` `yes` (switch) |
| `levitate` | `rise` 20, `bob` 8 |
| `sway` | `angle` 6, `speed` 1 |
| `pendulum` | `angle` 8, `speed` 1, `anchor` top `[top/left]` |
| `wobble` | `amount` 3, `speed` 1 |
| `breathing` | `amount` 0.06, `speed` 1 |
| `drift` | `amount` 14, `speed` 1 |
| `orbit` | `radius` 20, `speed` 1 |
| `gravity` / `rise` | `drop` 120, `bounce` 0.5 |
| `sag` | `drop` 60 |
| `ragdoll` | `drop` 120 |
| `pop` | `bounce` 0.6 |
| `bounded` | `speed` 1 |
| `jelly` / `squash` / `shake` | `intensity` 0.5, `trigger` hover `[hover/click]` |
| `recoil` | `distance` 14, `trigger` click `[hover/click]` |
| `spin` | `speed` 1, `trigger` hover `[hover/click]` |

## Notes

- Each scalar option is stamped `data-phys-<key>`; wrapper carries `sc-phys sc-phys--<effect>`.
  Runtime enqueued only when an effect renders; one shared RAF ticker drives all active elements;
  ambient effects pause off-screen and on tab-hide.
- Reduced motion → **all** effects skipped (every one is motion). `disable_on_mobile` honoured;
  pointer-following effects skipped on touch.
- The runtime overwrites the element `transform` each frame, so a physics effect and an entrance
  transform on the SAME element don't compose (physics wins). Different elements are fine.
