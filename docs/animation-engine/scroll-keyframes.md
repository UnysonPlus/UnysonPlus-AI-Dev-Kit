# scroll-keyframes — Scroll Keyframes (Animation Engine)

The builder's **motion timeline**: an element interpolates between a **Start**, an optional **Middle**
and an **End** state (transform / opacity / blur) as you scroll — a mini keyframed scrub. The progress
source is automatic: **inside a Scroll Story** stage it scrubs across THAT scene's beat slice (reusing
the story's published progress), so it plays across the pinned range; **anywhere else** it scrubs as the
element travels the viewport (the shared `upwScrollProgress` helper). **Per-element**: attaches from every
element's **Animations** tab through the **"Add Animation" inserter** (key **`scroll_keyframes`**, category
"Scroll"). Rides the shared frame loop, honours reduce-motion + mobile, and loads only on pages that use
it. Requires the `animation-engine` extension **ACTIVE**. No GSAP.

## Field (Animations → Add Animation → "Scroll Keyframes")

A **popover multi-picker** (picker id `mode`, default `none`, one `keyframes` tile) — so it sits in the
inserter collapsed until added, like every other per-element animation. Adding it sets `mode: keyframes`
and reveals a group (`group_scroll_keyframes`) whose options flatten under the `keyframes` key:

**Each state (`start` / `mid` / `end`) has the same 8 animatable props** (identity defaults, so an unset
prop simply doesn't move):

| Param (per `<state>`) | Default | Range / step | Notes |
|---|---|---|---|
| `<state>_x` | `0` | −300…300, step 5 | translate X (px) |
| `<state>_y` | start `40`, else `0` | −300…300, step 5 | translate Y (px) |
| `<state>_scale` | `1` | 0…3, step 0.05 | scale |
| `<state>_rotation` | `0` | −360…360, step 1 | rotate (deg) |
| `<state>_rotationX` | `0` | −180…180, step 1 | rotateX (deg) |
| `<state>_rotationY` | `0` | −180…180, step 1 | rotateY (deg) |
| `<state>_opacity` | start `0`, else `1` | 0…1, step 0.05 | opacity |
| `<state>_blur` | `0` | 0…40, step 1 | blur (px) |

Plus the timeline controls:

| Param | Default | Notes |
|---|---|---|
| `mid_enable` | `no` | switch — add a third state the element passes through |
| `mid_at` | `50` | 5…95, step 5 — where the middle keyframe sits (% of the range) |
| `mid_ease` | `out` | ease into the middle |
| `end_ease` | `out` | ease into the end |
| `run_on_mobile` | `yes` | switch — run the scrub on mobile |

Ease choices (`mid_ease` / `end_ease`): `linear`, `out` (Ease Out, default), `in`, `inout`, `back`
(Overshoot), `sine`. **Default preset = a fade-up** (Start: `y 40`, `opacity 0` → End: natural), so
enabling it does something useful immediately.

## Value shape

```json
"scroll_keyframes": {
  "mode": "keyframes",
  "keyframes": {
    "start_x": 0, "start_y": 40, "start_scale": 1, "start_rotation": 0, "start_rotationX": 0, "start_rotationY": 0, "start_opacity": 0, "start_blur": 0,
    "mid_enable": "no", "mid_at": 50, "mid_ease": "out",
    "mid_x": 0, "mid_y": 0, "mid_scale": 1, "mid_rotation": 0, "mid_rotationX": 0, "mid_rotationY": 0, "mid_opacity": 1, "mid_blur": 0,
    "end_ease": "out",
    "end_x": 0, "end_y": 0, "end_scale": 1, "end_rotation": 0, "end_rotationX": 0, "end_rotationY": 0, "end_opacity": 1, "end_blur": 0,
    "run_on_mobile": "yes"
  }
}
```

`mode: "none"` (the default) = not added. The `mid_*` props are ignored unless `mid_enable` is `"yes"`.

## What it emits / how it runs

- When active (and the start state actually differs from the end, or a middle keyframe is enabled), the
  element wrapper gains the class **`sc-scroll-kf`** plus **`data-upw-skf`** = base64-encoded JSON
  `{ "kf": [ { "at", "v": { x, y, scale, rotation, rotationX, rotationY, opacity, blur }, "ease" }, … ] }`
  — a `start` keyframe at `at:0`, an optional `mid` at `mid_at/100`, and an `end` at `at:1`. When
  `run_on_mobile` is `no`, `data-upw-skf-mobile="0"` is also stamped. A wrapper is forced to exist
  (`sc_needs_wrapper`) when Scroll Keyframes is the only non-default animation setting.
- **Nothing is stamped** when there's no middle keyframe and the Start state equals the End state (no
  motion to run).
- Runtime (`static/js/scroll-keyframes.js`) enqueues **only on pages that render at least one** such
  element (flagged in `wp_footer`). It rides the shared frame scheduler (`window.upwAnimRaf` +
  `upwScrollProgress` + `upwReduceMotion` + `upwIsMobile`) and interpolates the transform/opacity/blur
  between keyframes per the element's scroll progress. Honours reduced motion (config
  `window.upwSkfCfg.reducedMotion`, from Theme Settings → Animation Engine → *Respect reduced motion*).
- **Global master switch:** Theme Settings option `animation_scroll_keyframes` `{ enable: 'yes'|'no' }`
  (defaults to enabled, like every module).
