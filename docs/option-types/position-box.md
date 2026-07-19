# position-box

A compact, Elementor-style inline row of four unit inputs — Top / Right / Bottom / Left — for CSS position offsets. Each side is a nested `unit-input` sub-control (number field + unit dropdown).

## Stored value shape
```json
{
  "top":    { "value": "20", "unit": "px" },
  "right":  { "value": "",   "unit": "auto" },
  "bottom": { "value": "",   "unit": "px" },
  "left":   { "value": "",   "unit": "px" }
}
```
An x/y-style position object: exactly the four side keys, each a `unit-input` `{ value, unit }` pair.

## Fields
| key | type | notes |
|---|---|---|
| `top` / `right` / `bottom` / `left` | object | one `{ value, unit }` per side. Always all four present (missing sides are normalized in). |
| `<side>.value` | string | blank or numeric (a non-numeric value is coerced to `''` on save). |
| `<side>.unit` | string | one of the configured `units` — default `px`, `%`, `em`, `rem`, `vh`, `vw`, `auto`. Falls back to the first unit if invalid. |

## Notes / gotchas
- Default `value` = all four sides `{ value: '', unit: 'px' }`.
- **`auto` unit ignores the number** — that side compiles to the CSS keyword `auto` regardless of `value`.
- Compile to CSS with the static helper `FW_Option_Type_Position_Box::css_map($value)` → `['top'=>'20px','right'=>'auto','bottom'=>'','left'=>'']` (blank sides → `''`, skip them).
- Each side delegates to the `unit-input` option type for render + sanitize, so per-side sanitize mirrors unit-input.
- Backend width type is `full`.
