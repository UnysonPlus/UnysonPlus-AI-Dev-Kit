# slider

A single-handle ion.rangeSlider for picking one number. Stores a single numeric value.

## Stored value shape
```json
50
```
A single number (`floatval` on save — an integer when the step is whole, otherwise a float). Default `value` is `0`.

## Fields
| key | type | notes |
|---|---|---|
| (whole value) | number | the handle position, within `[min, max]`. |

## Notes / gotchas
- Default `value` = `0`; default `properties` min `0`, max `100`, step `1`.
- `_get_value_from_input` returns `floatval($input_value)` (or the default when the input is null).
- If `properties.values` (a discrete labels array) is set, the stored value is the **matched value** from that array (the slider indexes into `values`).
- `properties` (min/max/step/grid_snap/values/…) are option DEFINITION settings, not part of the saved value.
- The `short-slider` option type extends this class and shares the same single-number value shape.
