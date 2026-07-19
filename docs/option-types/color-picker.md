# color-picker

A single colour field (powered by Coloris). The value is a plain colour string — a hex, or an `#rrggbbaa` / `rgba()` when opacity is enabled.

## Stored value shape
```json
"#000000"
```
With `alpha => true` (opt-in), an 8-digit hex carrying opacity:
```json
"#00000080"
```

## Fields
| key | type | notes |
|---|---|---|
| (the value itself) | string | A colour string. Accepts a hex of **3 / 4 / 6 / 8 digits** (4 & 8 carry alpha). Empty (`""`) is allowed; anything malformed falls back to the option default. |

## Notes / gotchas
- Not a `{predefined,custom}` hash — just a bare string. Read `$value` directly, no resolver needed.
- **Default `value` is `""`** and **`alpha` defaults `false`** (6-digit hex). Pass `'alpha' => true` to add the opacity slider (then it can hold `#rrggbbaa`).
- Clicking a preset swatch stores the **resolved hex** — it is NOT live-linked to the preset. For palette-linked element colours use `predefined-colors-color-picker-compact` (`sc_color_field_compact()`) instead.
- Flipping an existing option to `alpha => true` needs no migration — the value is already a string that tolerates the extra digits.
- The sibling `rgba-color-picker` stores `rgba(r,g,b,a)` instead of hex.
