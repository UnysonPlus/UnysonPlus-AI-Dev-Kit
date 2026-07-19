# gradient-v2

Advanced gradient picker: unlimited color stops, linear/radial mode, angle control, HEX + RGBA colors, live preview. Blank by default (zero stops = "no gradient", so no separate enable switch is needed).

## Stored value shape
```json
{
  "type": "linear",
  "angle": 90,
  "stops": [
    { "color": "#2a7b9b", "position": 0 },
    { "color": "rgba(237,221,83,0.5)", "position": 100 }
  ]
}
```

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | `"linear"` or `"radial"`. Default `"linear"`. Anything else coerces to `"linear"`. |
| `angle` | int | 0–360 (degrees), clamped. Default `90`. Used for linear only. |
| `stops` | array | Ordered color stops. **Default `[]` (empty = no gradient).** Each stop is `{ color, position }`. A gradient needs **≥ 2 valid stops**; fewer collapses back to `[]`. |
| `stops[].color` | string | A `#hex` (3 or 6 digit) OR an `rgba()`/`rgb()` string. Invalid stops are dropped. |
| `stops[].position` | float | 0–100 (percent), clamped. |

## Notes / gotchas
- **`type` and `angle` are ALWAYS present** even when `stops` is empty; emptiness is signalled purely by `stops: []`.
- Fewer than 2 valid stops → `stops` is stored as `[]` (not forced to the default) so blank stays blank.
- Input arrives as a JSON string in one hidden field; the option decodes + validates it (regex-checks each color, clamps angle/position).
- Compile to CSS with the static helper `FW_Option_Type_Gradient_V2::to_css($value)` → e.g. `linear-gradient(90deg, #abc 0%, #def 100%)`, or `''` when empty. Stops are sorted by position at compile time.
- The starter gradient offered when opening a blank editor (`starter_stops()`) is NOT the saved default — the value stays empty until the user interacts.
