# scroll-loop — Infinite Scroll Loop (Animation Engine)

Turns a run of consecutive full-height **Sections** into a seamless terminal infinite scroll loop
(powered by Lenis + Lenis Snap). **Section-only** — injected into the Section's Animations tab (not a
node `fx` slot; hooked via `fw_shortcode_get_options` for the `section` tag). Value key **`scroll_loop`**,
picker key **`mode`** (off = `off`). Requires the `animation-engine` extension to be **ACTIVE**.

## Effects / styles

One style: **`loop`** — mark 2+ full-height sections in a row at the bottom of the page; the first
re-appears seamlessly after the last (a clone of the first is appended for a pixel-seamless wrap).
The loop is **terminal**: content above the first marked section scrolls normally; anything placed
after the loop group is unreachable by design. Add the Scroll Motion → Parallax effect to media
inside for the classic depth-drift look.

## Value shape

```json
"scroll_loop": { "mode": "loop", "loop": {
  "snap": "yes", "snap_duration": 0.8, "run_on_mobile": "yes" } }
```

## Params

| Param | Default | Notes |
|---|---|---|
| `snap` | `yes` | On = one section per scroll gesture, eased into place; Off = free continuous smooth scroll (switch) |
| `snap_duration` | `0.8` | eased glide-to-section seconds (0.4–1.5) |
| `run_on_mobile` | `yes` | disable loop + smooth scroll on phones (< 768px) if heavy (switch) |

## Notes

- Emits `data-upw-loop="1"`, `data-upw-loop-snap`, `data-upw-loop-snap-dur`, `data-upw-loop-mobile`.
  Runtime enqueues Lenis (+ Lenis Snap only when snapping) only when a loop section rendered — pages
  without a loop ship none of it.
- Loop sections default to `min-height:100svh` (an explicit inline Section `min-height` wins).
- Bails to native scroll (no clone, nothing hidden) in the builder, for reduced-motion visitors,
  when `run_on_mobile` off + viewport < 768, with fewer than 2 marked sections, or if Lenis is
  missing. Single global Lenis instance shared with Scroll Motion.
