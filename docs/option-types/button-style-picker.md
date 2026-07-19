# button-style-picker
A `<select>` replacement that previews each choice as a real button. Used by the button element to pick a button preset (`.btn-<id>`) or a size (`.btn-lg`). Drop-in for a plain select.

## Stored value shape
```json
"btn-primary"
```
The value is a **single string** — the chosen button preset/size class (e.g. `btn-primary`, `btn-lg`), or `""` for None.

## Fields
| key | type | notes |
|---|---|---|
| (value) | string | one choice key from `choices` (a `.btn-*` class), or `""` when None is allowed/selected. |

## Notes / gotchas
- **Default is `""`.** On save the value is whitelisted against `choices`; unknown values fall back to the default.
- `""` is only accepted when `allow_none` is true (default). The Button Style field sets `allow_none:false` so a button always has a real preset.
- The value IS the full class string — identical to what a plain select stored, so consuming views need no change.
