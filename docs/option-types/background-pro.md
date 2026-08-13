# background-pro

Composite background field with five stacking layers (bottom → top): **color → gradient → image → overlay → video**. One field replaces separate color + image + gradient controls. Used for site background, section/column backgrounds, header/footer backgrounds, box-preset fills.

## Stored value shape
```json
{
  "color":    { "value": { "predefined": "#286090", "custom": "" } },
  "gradient": { "data": { "type": "linear", "angle": 90, "stops": [] } },
  "image":    { "src": [], "position": "center center",
                "size": { "selected": "cover", "custom": "" },
                "repeat": "no-repeat", "attachment": "scroll" },
  "overlay":  { "color": "", "gradient": { "type": "linear", "angle": 90, "stops": [] } },
  "video":    { "enabled": "no", "external_url": "", "source_mp4": [], "source_webm": [],
                "poster": [], "fallback": [], "loop": "yes", "autoplay": "yes",
                "mute": "yes", "playsinline": "yes", "allow_interaction": "no" },
  "advanced": []
}
```

## Fields
| key | type | notes |
|---|---|---|
| `color.value.predefined` | string | **a usable COLOR value (hex like `#286090`), NOT a preset slug.** Wins over `custom`. |
| `color.value.custom` | string | fallback hex when `predefined` empty. |
| `gradient.data.type` | string | `linear`\|`radial`. |
| `gradient.data.angle` | int | degrees. |
| `gradient.data.stops` | array | `[]` = off. A gradient is "on" at ≥2 stops. Each stop `{color:"#hex\|rgba()", position:0-100}`. |
| `image.src` | array/obj | `[]` until chosen; when set it's an upload value — read `image.src.url`. |
| `image.position` | string | e.g. `center center`. |
| `image.size.selected` | string | `auto`\|`cover`\|`contain`\|`custom`; use `size.custom` when `custom`. |
| `image.repeat` | string | `no-repeat`\|`repeat`\|`repeat-x`\|`repeat-y`\|`space`\|`round`. |
| `image.attachment` | string | `scroll`\|`fixed`\|`local`. |
| `overlay.color` | string | rgba tint rendered OVER image/gradient/color (keeps text legible on hero images). `''` = off. |
| `overlay.gradient` | obj | gradient-v2 data (`{type,angle,stops}`) layered on top; `stops:[]` = off. |
| `video.enabled` | string | `'yes'`/`'no'`. Other video keys are uploads/switches. |
| `video.allow_interaction` | string | `'yes'`/`'no'`; lets pointer events reach the `<video>` (default off). |
| `advanced` | array | reserved; usually `[]`. |

## Notes / gotchas
- **No built-in `to_css()`** — consumers build CSS themselves. Enable logic: color when `predefined\|\|custom`; gradient when `count(stops) >= 2`; image when `image.src.url`; overlay when `overlay.color` set or `overlay.gradient.stops` has ≥2; video when `video.enabled === 'yes'`.
- `disable` config drops layers (e.g. box presets use `disable:'video'` since a CSS class can't host a `<video>`); in header/footer contexts the video layer is disabled too.
- Resolve the color layer via the theme's `unysonplus_get_option_color_picker(value.color.value)` (predefined-or-custom).
