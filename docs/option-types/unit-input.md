# unit-input

A numeric field + a small unit dropdown (px / em / rem / % / vh / …). Used everywhere a length is set: widths, heights, gaps, paddings, font sizes, offsets, border widths.

## Stored value shape
Always a hash:
```json
{ "value": "24", "unit": "px" }
```
Examples: `{value:"2.5",unit:"rem"}`, `{value:"",unit:"px"}` (blank), `{value:"100",unit:"%"}`.

## Fields
| key | type | notes |
|---|---|---|
| `value` | string | the number as a string: `''` (blank), int, decimal, or leading-minus. Junk is coerced to `''`. |
| `unit` | string | one of the option's configured `units`, else the first configured unit. |

## Notes / gotchas
- **Saved value is the decoded HASH.** The control submits its value as a JSON string, but `_get_value_from_input` decodes it — always consume the saved `{value,unit}` array, never the raw input JSON.
- **Blank guard:** when `value===''` emit nothing (not a lone `px`). Consume via `FW_Option_Type_Unit_Input::to_string($saved)` which already returns `''` for blank.
- `separate` config only changes `to_string()` output (`"24px"` vs `"24 inches"`); it doesn't change the stored shape.
- Inside `multi-inline` (e.g. a border-width row) a unit-input child keeps the same `{value,unit}` shape.
- Migrating a bare number/string option to unit-input is a value-shape change — tolerate the scalar as `{value:n,unit:<default>}` and add a JS migrator for existing page-builder items.
- A typography `size` may be a unit-input hash OR a legacy int OR a JSON string — resolve it via `fw_typography_size_css()`.
