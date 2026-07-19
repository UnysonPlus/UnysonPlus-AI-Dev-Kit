# predefined-colors

A swatch grid bound to a hidden `<select>`. Clicking a swatch selects that color; with `blank => true` a swatch can be deselected. Stores the **single chosen color value** as a plain string.

## Stored value shape
```json
"#f97316"
```
A plain STRING — the `value` of the chosen swatch (whatever the `choices` map's values are, typically a hex). Empty string `""` when nothing is selected (deselected / blank).

## Fields
| key | type | notes |
|---|---|---|
| (whole value) | string | the selected swatch's value verbatim, or `''`. |

## Notes / gotchas
- Default `value` is `''`.
- `choices` is a `label => color-value` map (e.g. `'Orange' => '#f97316'`); the stored string is the **value** side, not the label.
- `blank => true` (the default) adds an empty `<option value="">`, so the field is deselectable → stored `''`.
- Not a `{predefined,custom}` object — that hybrid is the separate `predefined-colors-color-picker` type, which embeds THIS control for its `predefined` half.
- Backend width type is `auto`.
