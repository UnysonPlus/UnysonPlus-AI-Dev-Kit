# `model_viewer` — 3D Model Viewer

An interactive 3D model element (glTF / GLB) built on Google's `<model-viewer>` — orbit, zoom, auto-rotate, IBL lighting, ground shadow, embedded-clip playback, AR and pinned hotspots. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'model_viewer', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `model_url` | text | `''` | URL to `.glb`/`.gltf` | Direct link to the model (the primary source; GLB recommended). |
| `model_file` | upload | `''` | media `{ attachment_id, url }` | Media-library pick (`.glb`/`.gltf`); if set, wins over `model_url`. |
| `alt` | text | `''` | string | Alt text for screen readers / load failure. |
| `poster` | upload | `''` | media object | Shown while streaming / as the no-3D fallback. |
| `height` | text | `'520'` | px | Height of the viewer area. |
| `variants_show` | switch | `'no'` | `'yes'` \| `'no'` | Show a swatch row for the model's built-in material variants. |
| `variant_default` | text | `''` | variant name | Variant shown first (must match a baked-in name). |
| `camera_controls` | switch | `'yes'` | `'yes'` \| `'no'` | Let visitors orbit / drag / zoom. |
| `disable_zoom` | switch | `'no'` | `'yes'` \| `'no'` | Keep orbit but block scroll/pinch zoom. |
| `auto_rotate` | switch | `'yes'` | `'yes'` \| `'no'` | Slowly spin when idle. |
| `rotation_speed` | slider | `30` | 0–120 (°/sec) | Auto-rotate speed. |
| `auto_rotate_delay` | slider | `3000` | 0–10000 (ms) | Idle time before auto-rotate resumes. |
| `camera_orbit` | select | `'three_quarter'` | `three_quarter` `front` `side` `top` | Starting camera angle. |
| `field_of_view` | select | `'auto'` | `auto` `narrow` `normal` `wide` | Field of view. |
| `disable_pan` | switch | `'no'` | `'yes'` \| `'no'` | Block two-finger / right-drag panning. |
| `min_fov` | text | `''` | e.g. `15deg` | Zoom-in limit (blank = none). |
| `max_fov` | text | `''` | e.g. `45deg` | Zoom-out limit (blank = none). |
| `min_orbit` | text | `''` | `theta phi radius` | Advanced lower orbit bound (blank = none). |
| `max_orbit` | text | `''` | `theta phi radius` | Advanced upper orbit bound (blank = none). |
| `environment` | select | `'neutral'` | `neutral` `legacy` `custom` `none` | Image-based environment lighting. |
| `env_image` | text | `''` | `.hdr` URL | Custom HDR map (used when `environment: custom`). |
| `skybox` | switch | `'no'` | `'yes'` \| `'no'` | Use the environment map as an immersive backdrop. |
| `tone_mapping` | select | `'auto'` | `auto` `neutral` `commerce` `aces` `agx` | HDR → screen tone mapping. |
| `exposure` | slider | `1` | 0–2 | Exposure. |
| `shadow_intensity` | slider | `0.6` | 0–1 | Soft ground contact shadow (0 = none). |
| `shadow_softness` | slider | `1` | 0–1 | Shadow softness. |
| `animation_autoplay` | switch | `'no'` | `'yes'` \| `'no'` | Play the model's baked animation clips (looping). |
| `animation_name` | text | `''` | clip name | Play a specific named clip (blank = first). |
| `interaction_prompt` | select | `'auto'` | `auto` `none` | Idle "drag to rotate" hint. |
| `ar` | switch | `'no'` | `'yes'` \| `'no'` | Add a "View in your space" AR button on supporting phones. |
| `ar_placement` | select | `'floor'` | `floor` `wall` | AR surface. |
| `ar_scale` | select | `'auto'` | `auto` `fixed` | AR sizing (resizable vs real size). |
| `hotspots` | addable-popup | `[]` | array — see Notes | Pinned callouts on the model. |
| `hotspot_hide_backside` | switch | `'yes'` | `'yes'` \| `'no'` | Fade hotspots that rotate to the far side (needs a Normal). |
| `background` | select | `'transparent'` | `transparent` `solid` | Viewer background. |
| `bg_color` | color-preset | `{predefined:'',custom:'#f4f5f7'}` | compact color object | Solid background color (`kind: bg`), used when `background: solid`. |
| `choreo_enable` | switch | `'no'` | `'yes'` \| `'no'` | **Scroll Choreography.** Pin the model in a fixed, transparent, z-indexed layer and drive its position / rotation / scale / opacity from scroll via `choreo_keys`. When on, auto-rotate and drag-to-orbit are disabled (scroll owns the motion) and `interpolation-decay` is lowered so the camera tracks tightly. |
| `choreo_layer` | slider | `2` | −5 … 50 | z-index of the fixed 3D layer. A section with a higher z-index sits in front of the model; lower/negative puts the model behind normal content. |
| `choreo_size` | slider | `60` | 15 … 100 (%) | Base model-box size, as a % of the smaller screen side (`vmin`). Each keyframe's `scale` multiplies this. |
| `choreo_travel` | slider | `3` | 1 … 10 (screens) | How many screen-heights the whole choreography spans, measured from where the element sits. |
| `choreo_smooth` | slider | `18` | 0 … 90 | Scroll smoothing/damping. 0 = locked to the scrollbar (frame-perfect); higher glides toward the scroll target. |
| `choreo_guide` | switch | `'no'` | `'yes'` \| `'no'` | **Authoring aid** (turn off before publishing). Renders a marker in the scroll at each keyframe (`① 0%`, `② 22%`…) plus a live HUD of the current scroll % and the model's interpolated pose — so you can scroll your real page to find the exact `at` for each keyframe. |
| `choreo_keys` | addable-popup | *(4 defaults)* | array — see Notes | Keyframes: the model's pose at each scroll %. Interpolated between, sorted by `at`. |

## Ready-to-use example (the atts object)
```json
{
  "model_url": "https://example.com/model.glb",
  "model_file": "",
  "alt": "Product model",
  "poster": "",
  "height": "520",
  "variants_show": "no",
  "variant_default": "",
  "camera_controls": "yes",
  "disable_zoom": "no",
  "auto_rotate": "yes",
  "rotation_speed": 30,
  "auto_rotate_delay": 3000,
  "camera_orbit": "three_quarter",
  "field_of_view": "auto",
  "disable_pan": "no",
  "min_fov": "", "max_fov": "", "min_orbit": "", "max_orbit": "",
  "environment": "neutral",
  "env_image": "",
  "skybox": "no",
  "tone_mapping": "auto",
  "exposure": 1,
  "shadow_intensity": 0.6,
  "shadow_softness": 1,
  "animation_autoplay": "no",
  "animation_name": "",
  "interaction_prompt": "auto",
  "ar": "no",
  "ar_placement": "floor",
  "ar_scale": "auto",
  "hotspots": [],
  "hotspot_hide_backside": "yes",
  "background": "transparent",
  "bg_color": { "predefined": "", "custom": "#f4f5f7" },
  "choreo_enable": "no",
  "choreo_layer": 2,
  "choreo_size": 60,
  "choreo_travel": 3,
  "choreo_smooth": 18,
  "choreo_guide": "no",
  "choreo_keys": [
    { "at": 0,   "x": 0,   "y": -55, "scale": 80,  "yaw": -40, "pitch": 12, "opacity": 0,   "ease": "out" },
    { "at": 25,  "x": 0,   "y": 0,   "scale": 100, "yaw": 0,   "pitch": 0,  "opacity": 100, "ease": "out" },
    { "at": 60,  "x": -28, "y": 8,   "scale": 92,  "yaw": 130, "pitch": -4, "opacity": 100, "ease": "inout" },
    { "at": 100, "x": 34,  "y": 30,  "scale": 66,  "yaw": 240, "pitch": 0,  "opacity": 100, "ease": "inout" }
  ]
}
```

## Notes
- **Source precedence:** `model_file` (media pick) wins over `model_url` (text). No source → renders nothing. `.glb` uploads may be blocked by WordPress's mime rules, so the URL field is the reliable primary source.
- `hotspots` is an **addable-popup** repeater; each item: `{ label, detail, link, position, normal }`. `position` (required) is the 3D `x y z`, e.g. `"0.1 0.25 0.05"` — get it from the free model-viewer editor. `normal` (optional `x y z`) lets a hotspot hide when it faces away.
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- `bg_color` uses the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- **Scroll Choreography (`choreo_keys`)** is an **addable-popup** repeater; each keyframe: `{ at, x, y, scale, yaw, pitch, opacity, ease }`. `at` = scroll % (0–100). `x`/`y` = screen offset from center in `vw`/`vh` (negative = left/up). `scale` = % of `choreo_size`. `yaw` spins the turntable (camera orbit θ, can exceed ±360 across keys for multiple turns); `pitch` tilts (mapped to orbit φ = `90 − pitch`). `opacity` 0–100. `ease` (`linear`/`inout`/`out`/`in`) is the easing **into** that pose. The runtime interpolates between keys, damps toward the scroll target (`choreo_smooth`), and pins the model in a fixed, `pointer-events:none` layer so page sections scroll over/under it (`choreo_layer` z-index). Reduced-motion rests at the final pose without scrubbing. Place the element where the choreography should begin, then build the sections it travels across below it; roughly match `choreo_travel` to how many screens those sections occupy. This is the no-code path to the "pinned hero product that moves/rotates through every section."
