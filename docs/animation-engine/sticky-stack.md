# sticky-stack — Card Stack (Animation Engine)

Turns a Section's stacked child cards (its columns) into the "deck of cards" scroll effect: each
card pins to the top in turn, and as the next slides up the covered card eases per the chosen style.
Rides the Section's **`fx.sticky_stack`** slot (picker key **`mode`**; "off" value `off`). **Section
only** — injected into the Section's Animations tab (inside the animation-stack organizer), not
offered on grid collections. Requires the **animation-engine extension ACTIVE**; global on/off in
Theme Settings → Animations → Effects.

## Effects / styles

11 `mode` keys, all sharing the same option group:
`stack` · `scale_fade` · `fade` · `blur` · `tilt` · `fan` · `messy` · `side` · `peel` · `push` ·
`grow`.

## Value shape

```json
"sticky_stack": { "mode": "stack", "stack": {
  "top_offset": 40,
  "gap": 18,
  "intensity": 0.5
} }
```

## Params

| Param | Type | Default | Notes |
|---|---|---|---|
| `top_offset` | slider | `40` (0–200) | Pin offset px — gap from top of viewport where each card pins. |
| `gap` | slider | `18` (0–80) | Stagger px — how much each stacked card peeks below the one above. |
| `intensity` | slider | `0.5` (0–1) | Strength of the chosen style — scale / dim / blur / tilt angle / fan spread / offset. |

## Notes

- Build the Section with **2+ full-width columns** as the cards.
- Pure CSS `position:sticky` + one passive scroll listener for the transform; no library.
- Wrapper class `upw-sticky-stack`; emits `data-ss-style` / `data-ss-offset` / `data-ss-gap` /
  `data-ss-intensity`. Only the chosen style's per-card JS partial loads.
- Honours "reduce motion" (cards just stack normally) and loads only on pages that use it. Never
  stamped on grid collections (Gallery, …).
