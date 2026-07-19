# box-shadow
A structured CSS box-shadow builder (offset X/Y, blur, spread, color, inset) with a live preview. Reusable anywhere an option needs a box-shadow value; used in `border-presets`/`button-presets` state skins.

## Stored value shape
```json
{ "x": 0, "y": 0, "blur": 0, "spread": 0, "color": "", "inset": false }
```
Concrete:
```json
{ "x": 5, "y": 5, "blur": 19, "spread": 5, "color": "rgba(0,0,0,0.32)", "inset": false }
```

## Fields
| key | type | notes |
|---|---|---|
| `x` | int | offset-X in px (may be negative). |
| `y` | int | offset-Y in px (may be negative). |
| `blur` | int | blur radius in px, clamped `>= 0`. |
| `spread` | int | spread in px (may be negative). |
| `color` | string | hex or `rgba()`; invalid/empty is stored as `""`. |
| `inset` | bool | inset shadow flag. |

## Notes / gotchas
- **Default = all-zero, empty color, `inset:false`** (i.e. no shadow).
- Input may arrive as a JSON string — it's decoded, then sanitized/clamped; non-array falls back to default.
- `to_css()` returns `""` when x/y/blur/spread are all 0 (no visible shadow); otherwise builds `"[inset ]<x>px <y>px <blur>px <spread>px <color>"`, defaulting color to `rgba(0,0,0,0.2)` if blank.
- The color field reuses the `rgba-color-picker` stack.
