# horizontal-scroll — Horizontal Scroll Section (Animation Engine)

Pins a **Section** while the page scrolls and translates its columns (panels) sideways — a gallery / timeline / feature-strip. It is **not** a node `fx` slot — it is injected into the **Section's Animations tab** (inside the animation-stack organizer) as the `horizontal_scroll` att; Section only. Requires the `animation-engine` extension ACTIVE (ships inactive). Pure `position:sticky` + one passive scroll listener, no library. Honours "reduce motion" (panels flow normally). Global on/off: Theme Settings → Animations → Effects.

## Effects / styles
One `multi-picker` (picker id **`mode`**, off = `off`). 15 styles, **all sharing the same two options**: `standard` · `reverse` · `snap` · `parallax` · `fade` · `coverflow` (Center Focus) · `blur` (Blur Focus) · `grow` (Grow In) · `arc` · `wave` · `zigzag` · `rotate3d` (3D Carousel) · `wall` (Perspective Wall) · `skew` (Velocity Skew) · `drag` (Drag / Flick).

## Value shape
```json
"horizontal_scroll": { "mode": "standard", "standard": {
  "panel_width": "80vw", "intensity": 0.5 } }
```

## Params
| key | type | default | notes |
|---|---|---|---|
| `panel_width` | select | `80vw` | `auto` (natural) / `60vw` (narrow) / `80vw` (wide) / `100vw` (full screen) |
| `intensity` | slider | `0.5` | 0–1; JS maps it to the style's magnitude (scale / tilt / skew / parallax) |

## Notes
- Build the Section with **2+ columns** as the panels.
- Emits `class="upw-hscroll"` + `data-hs-style` / `data-hs-panel` / `data-hs-intensity` on the section wrapper.
- Track-level styles (`standard`/`reverse`/`snap`/`wall`/`skew`/`drag`) run inside the core; the 9 per-panel styles add a small partial. Forces a wrapper when horizontal scroll is the section's only non-default setting.
