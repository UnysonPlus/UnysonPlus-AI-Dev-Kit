# preloader — Preloader (Animation Engine)

A full-screen loading screen shown until the page is ready, then faded away. **Site-wide** —
configured in Theme Settings → Animations → Preloader (not a node `fx` slot). Front end only.
Requires the `animation-engine` extension to be **ACTIVE**.

## Effects / styles

The `preloader_style` picker (key **`style`**, default `spinner`): `spinner` · `dual_ring` ·
`gradient` (ring) · `dots` (bouncing) · `dots_fade` · `orbit` · `bars` (equalizer) · `grid`
(pulsing) · `pulse` · `ripple` · `square` (flip) · `bar` (progress) · `progress_ring` (%) ·
`counter` (%) · `curtain` · `logo` (logo pulse — needs a logo set).

## Value shape

Theme Settings options (enable lives in the `animation_preloader` multi; the rest are sibling options):

```json
"animation_preloader": { "enable": "no" },
"preloader_style": { "style": "spinner" },
"preloader_bg": { "predefined": "", "custom": "#0b1220" },
"preloader_accent": { "predefined": "", "custom": "#2f74e6" },
"preloader_logo": [],
"preloader_min": 0.4,
"preloader_fade": 0.5
```

## Params

| Param | Default | Notes |
|---|---|---|
| `enable` | `no` | Master switch (`yes`/`no`) |
| `preloader_style` | `spinner` | Loader style (multi-picker, key `style`) |
| **`preloader_bg` COLOR** | `#0b1220` | Background (compact `{predefined,custom}`) |
| **`preloader_accent` COLOR** | `#2f74e6` | Spinner / bar / dots / counter colour |
| `preloader_logo` | `[]` | Optional logo (upload); centred for the `logo` style |
| `preloader_min` | `0.4` | Minimum display seconds so it never just flashes (0–4) |
| `preloader_fade` | `0.5` | Fade-out seconds (0.2–1.5) |

## Notes

- Ships disabled by default; front end only. `logo` style requires `preloader_logo` to be set.
- All colours use the compact color-preset shape, staying live-linked to Theme Settings → Colors.
