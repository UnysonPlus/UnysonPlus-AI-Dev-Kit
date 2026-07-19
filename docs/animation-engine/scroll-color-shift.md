# scroll-color-shift — Scroll Color Shift (Animation Engine)

As each marked **Section** crosses the middle of the viewport, the page (`body`) background — and
optionally text — smoothly morphs to that section's colour (the agency-site "scroll colour shift").
**Section-only** — injected into the Section's Animations tab (not a node `fx` slot; hooked via
`fw_shortcode_get_options` for the `section` tag). Value key **`scroll_color_shift`**, picker key
**`mode`** (off = `off`). Requires the `animation-engine` extension to be **ACTIVE**.

## Effects / styles

One style: **`shift`** — set a target page colour (and optional text colour) per section. Give
several sections their own colour for a smooth scroll-driven palette. Best on full-bleed, transparent
sections so the morphing page colour shows through.

## Value shape

```json
"scroll_color_shift": { "mode": "shift", "shift": {
  "bg_color": { "predefined": "", "custom": "#0b1220" },
  "text_color": { "predefined": "", "custom": "" },
  "duration": 0.6 } }
```

## Params

| Param | Default | Notes |
|---|---|---|
| **`bg_color` COLOR** | — | The page background this section morphs to. **Required** — a blank target no-ops the effect |
| **`text_color` COLOR** | blank | Optional — also shift the body text colour to stay readable |
| `duration` | `0.6` | CSS transition seconds (0.2–2) |

Colors use the compact `{predefined,custom}` shape (`predefined` slug → `var(--color-<slug>)`;
otherwise `custom` hex).

## Notes

- Emits `sc-colorshift` class + `data-cs-bg`, `data-cs-text` (only when set), `data-cs-dur`. One
  passive, rAF-throttled scroll check picks the section crossing the viewport middle and transitions
  `body` colours via a pure CSS transition. Runtime + CSS enqueue only on pages that used a shift.
- Honours reduced motion (global `respect_reduced_motion`). Global master switch:
  Theme Settings → Animations → Scroll Color Shift (`animation_color_shift`, defaults enabled).
