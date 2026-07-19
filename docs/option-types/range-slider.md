# range-slider

A dual-handle (double) ion.rangeSlider for picking a numeric **from/to** range. Stores both endpoints as an object.

## Stored value shape
```json
{ "from": 20, "to": 80 }
```
An object with two numeric endpoints. Values are floats (`floatval` on save), so integers when the step is whole.

## Fields
| key | type | notes |
|---|---|---|
| `from` | number | lower handle. Clamped into `[min, max]` on render. |
| `to` | number | upper handle. Clamped into `[min, max]` on render. |

## Notes / gotchas
- Default `value` = `{ from: min, to: max }` from `properties` (default `properties` min `0`, max `100`, step `1`).
- On save the input arrives as a `"from;to"` string and is split → `floatval` each into `from`/`to`.
- If `properties.values` (a discrete labels array) is set, endpoints store the **matched values** from that array rather than raw numbers (the slider indexes into `values`).
- Out-of-range saved endpoints are snapped back to `min`/`max` at render time.
- `properties` (min/max/step/grid_snap/values/…) are option DEFINITION settings, not part of the saved value.
