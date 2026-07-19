# `webgl_object` — WebGL Object

A real-time WebGL element (Three.js) — a refractive 3D object or a full-screen shader, reacting to the pointer and (optionally) scroll. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'webgl_object', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `style_preset` | multi-picker | `{preset:'glass'}` | see Notes | The look (a 3D object or a full-screen shader) + that preset's controls. |
| `scale` | slider | `1` | 0.5–1.6 | Object size. |
| `placement` | multi-picker | `{mode:'inline'}` | see Notes | Inline element (reveals `height`) vs Section background. |
| `color_a` | color-preset | `{predefined:'',custom:'#6aa6ff'}` | compact color object | Primary color / object tint (`kind: bg`). |
| `color_b` | color-preset | `{predefined:'',custom:'#b388ff'}` | compact color object | Secondary color — reflections + gradient background (`kind: bg`). |
| `background` | select | `'gradient'` | `transparent` `solid` `gradient` | Canvas background. |
| `bg_color` | color-preset | `{predefined:'',custom:'#0b0f1a'}` | compact color object | Solid background color (`kind: bg`), used when `background: solid`. |
| `auto_rotate` | slider | `0.3` | 0–1 | Auto-rotate speed. |
| `noise_amount` | slider | `0.45` | 0–1 | Surface wobble / deform amount. |
| `noise_speed` | slider | `0.5` | 0–1 | Wobble speed. |
| `scroll_link` | switch | `'yes'` | `'yes'` \| `'no'` | Rotate / scale as the page scrolls. |
| `pointer_follow` | switch | `'yes'` | `'yes'` \| `'no'` | Follow the pointer. |
| `pointer_strength` | slider | `0.5` | 0–1 | Pointer influence. |
| `parallax` | slider | `0.3` | 0–1 | Parallax amount. |
| `quality` | select | `'auto'` | `auto` `high` `low` | Render quality (auto drops to low on weak GPUs). |
| `dpr_cap` | select | `'2'` | `1` `1.5` `2` | Pixel-ratio cap on high-DPI screens. |
| `poster` | upload | `''` | media object | Fallback image (no-WebGL / reduced-motion). |

## Ready-to-use example (the atts object)
```json
{
  "style_preset": {
    "preset": "glass",
    "glass": { "ior": 1.45, "iridescence": 0.3 }
  },
  "scale": 1,
  "placement": { "mode": "inline", "inline": { "height": "520" } },
  "color_a": { "predefined": "", "custom": "#6aa6ff" },
  "color_b": { "predefined": "", "custom": "#b388ff" },
  "background": "gradient",
  "bg_color": { "predefined": "", "custom": "#0b0f1a" },
  "auto_rotate": 0.3,
  "noise_amount": 0.45,
  "noise_speed": 0.5,
  "scroll_link": "yes",
  "pointer_follow": "yes",
  "pointer_strength": 0.5,
  "parallax": 0.3,
  "quality": "auto",
  "dpr_cap": "2",
  "poster": ""
}
```

## Notes
- `style_preset` is a **multi-picker**: `{ "preset": "<slug>", "<slug>": { …that preset's controls… } }`. Saved shape stores every preset's sub-group (`preset` selects the active one); the safe generator emits all branches defaulted plus the active one.
  - **3D Objects:** `glass` (`ior` 1.45, `iridescence` 0.3), `metal` (`metalness` 1, `roughness` 0.15), `sphere` (`roughness` 0.6), `particles` (`particle_count` 4000, `particle_size` 0.02), `image_particles` (`image`, `grid_density` 120, `point_size` 6, `repel` 0.5, `radius` 0.35, `drift` 0.4, `jitter` 0.015).
  - **Shaders (full-screen):** `gradient_mesh` (`blend_speed` 0.4, `grain` 0.15), `plasma` (`scale` 3, `flow_speed` 0.5, `contrast` 0.6), `aurora` (`band_count` 3, `drift_speed` 0.4, `softness` 0.5), `fluid` (`viscosity` 0.5, `splat_strength` 0.6), `dots` (`dot_style` `dot`/`halftone`, `grid_density` 40, `dot_size` 0.5), `image_distort` (`image`, `strength` 0.3, `hover_only` `'yes'`).
- `placement` is a **multi-picker**: `{ "mode": "inline"|"background", "inline": { "height": "520" } }`. `inline` reveals a `height` (px) field; `background` reveals nothing — the parent Section's Min Height sizes the canvas.
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string (the view resolves the preset/custom value to a real hex for Three.js). See `README.md`.
