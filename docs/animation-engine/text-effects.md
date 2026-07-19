# text-effects — Text Effects (Animation Engine)

A typographic animation applied to an element's text (split-text reveal, decode, typewriter,
gradient, shimmer, wave, glitch, variable-font weight…). Rides the node **`fx.text_effect`** slot
(picker key **`effect`**; "off" value `none`). Per-element (attaches from every element's Animations
tab). Self-contained (no GSAP), honours "reduce motion". Requires the **animation-engine extension
ACTIVE**.

## Effects / styles

39 `effect` keys, grouped in the picker:
- **Reveal:** `blur` · `mask` · `split_reveal` · `slide` · `skew` · `fill_sweep` · `image_mask` ·
  `outline_fill` · `strikebox` · `marker`
- **Motion:** `bounce` · `float` · `wave` · `jitter` · `letter_jump` · `scale` · `breathing` ·
  `kinetic` · `magnetic`
- **Decode & Type:** `scramble` · `random` · `matrix` · `typewriter` · `splitflap` · `countup` ·
  `rotating_words`
- **Color & Glow:** `chromatic` · `color_wave` · `gradient_flow` · `neon` · `rainbow` · `shimmer` ·
  `glitch`
- **Type & 3D:** `expand_spacing` · `vf_weight` · `width_sweep` · `flip3d`

## Value shape

```json
"text_effect": { "effect": "shimmer", "shimmer": {
  "color_a": { "predefined": "", "custom": "#8a8f98" },
  "color_b": { "predefined": "", "custom": "#ffffff" },
  "speed": 3
} }
```

**Reveal group** (shared by `blur`/`mask`/`flip3d`/`scale`/`slide`/`bounce`/`random`/`skew`):
`split_by` (`chars`/`words`/`lines`), `stagger` (0.03), `duration` (0.6), `sequence`
(`together`/`cascade`), `trigger` (multi image-picker, default `["view"]` — `view`/`load`/`click`/`hover`).
`slide` adds `direction` (`left`). `split_reveal` uses `split_by` `words` + `direction` `up`.

## Params

| Effect | Params (key = default) |
|---|---|
| `split_reveal` | `split_by` `words`, `direction` `up` `[up/down/left/right]`, `stagger` 0.03, `duration` 0.6, `trigger` `["view"]` |
| reveal family | reveal group (`split_by` default `chars`; `mask` = `lines`, `skew` = `words`) |
| `scramble` | `duration` 1.2, `trigger` `["view"]` |
| `typewriter` | `speed` 55 (ms/char), `caret` `yes`, `loop` `no`, `trigger` `["view"]` |
| `shimmer` | **`color_a` COLOR** #8a8f98, **`color_b` COLOR** #ffffff, `speed` 3 |
| `gradient_flow` | **`color_a`** #ff6b6b, **`color_b`** #6a8dff, **`color_c`** #17c964, `speed` 4 |
| `wave` | `amplitude` 6, `speed` 1.4 |
| `glitch` | `trigger` `hover` `[hover/always]`, `intensity` 3 |
| `vf_weight` | `from` 300, `to` 800, `trigger` `hover` `[view/hover]` |
| `rainbow` | `speed` 4 |
| `neon` | **`glow_color` COLOR** #6aa6ff, `speed` 2.5 |
| `breathing` | `speed` 3 |
| `jitter` | `intensity` 2 |
| `float` | `distance` 8, `speed` 3 |
| `marker` | **`color` COLOR** #ffe066, `trigger` `view` `[view/hover]` |
| `strikebox` | `shape` `strike` `[strike/underline/box]`, **`color` COLOR** `""`, `trigger` `view` |
| `outline_fill` | **`color` COLOR** `""`, `trigger` `view` |
| `chromatic` | `intensity` 2 |
| `width_sweep` | `from` 75, `to` 125, `trigger` `hover` |
| `rotating_words` | `words` `""` (comma-separated), `interval` 1.8 |
| `countup` / `splitflap` / `matrix` | `duration` 1.6 / 1.4 / 1.4, `trigger` `["view"]` |
| `fill_sweep` | **`color` COLOR** #2f74e6, `trigger` `hover` |
| `letter_jump` | `height` 6 |
| `expand_spacing` | `amount` 6 |
| `color_wave` | **`color` COLOR** #2f74e6, `trigger` `hover` |
| `magnetic` | `strength` 0.4 |
| `image_mask` | `image` (upload) |
| `kinetic` | `intensity` 4 |

## Notes

- COLOR params use the compact preset shape `{predefined,custom}` (via `upw_text_color_field`);
  `predefined` slug → `var(--color-<slug>)`, else `custom` hex, else a computed default.
- Multi-select `trigger` (reveal family, scramble, typewriter, countup, splitflap, matrix) accepts
  several of `view`/`load`/`click`/`hover`; single-select `trigger` (marker, strikebox, outline_fill,
  width_sweep, fill_sweep, color_wave, vf_weight) is one of `view`/`hover`.
- `gradient_flow` *is* "the gradient" effect — there is no separate `gradient`.
