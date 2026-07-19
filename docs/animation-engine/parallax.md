# parallax — Parallax Depth Layers (Animation Engine)

Pointer/scroll-driven multi-layer depth parallax (vanilla JS, one shared RAF loop, no library).
Rides the node `fx` **`parallax`** slot (picker key **`role`**, off = `none`). Requires the
`animation-engine` extension to be **ACTIVE**.

## Effects / styles

Two roles: **`scene`** — the tracking stage/container. **`layer`** — a moving child, given a depth.
A `layer` finds its `scene` via `closest('[data-pl-scene]')`; with no scene ancestor it falls back to
a synthetic window scene (tracks the whole viewport), so a few depth layers work without marking a
stage.

## Value shape

```json
"parallax": { "role": "scene", "scene": { "source": "mouse", "intensity": 40, "smoothing": 50 } }
```
```json
"parallax": { "role": "layer", "layer": {
  "depth": 30, "axis": "both", "direction": "with", "scale_far": "no", "blur_far": "no" } }
```

## Params

| Role | Param | Default | Notes |
|---|---|---|---|
| `scene` | `source` | `mouse` | `mouse` (pointer) / `scroll` / `both` |
| `scene` | `intensity` | `40` | px the deepest layers travel at full pointer/scroll (8–140) |
| `scene` | `smoothing` | `50` | higher = smoother, more lag (0–100) |
| `layer` | `depth` | `30` | how much this layer moves; 0 = fixed (0–100) |
| `layer` | `axis` | `both` | `both` / `x` / `y` |
| `layer` | `direction` | `with` | `with` / `against` the pointer ("against" = classic background-recedes feel) |
| `layer` | `scale_far` | `no` | deeper layers sit slightly larger (switch `yes`/`no`) |
| `layer` | `blur_far` | `no` | depth-of-field blur growing with depth (switch `yes`/`no`) |

## Notes

- Wrapper carries `sc-parallax-scene` / `sc-parallax-layer` + `data-pl-*` attrs; runtime enqueued
  only when a role renders. `.sc-parallax-scene` is `position:relative` (anchor for absolutely-placed
  layers).
- Reduced motion + `disable_on_mobile` skip everything (layers stay put). The **pointer** source is
  skipped on touch; a scene set to `scroll` still moves. Off-screen layers are culled; loop pauses on
  tab-hide.
- The runtime overwrites each layer's inline `transform` every frame, so a parallax layer and an
  entrance/physics transform on the SAME element don't compose. Works on normal-flow children (subtle
  drift) or absolutely-positioned layers inside a `position:relative` scene.
