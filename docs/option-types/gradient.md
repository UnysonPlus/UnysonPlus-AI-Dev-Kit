# gradient

The legacy two-color gradient picker (a `primary` + `secondary` hex pair). For the modern multi-stop / angle / linear-radial control use `gradient-v2` instead.

## Stored value shape
```json
{ "primary": "#2a7b9b", "secondary": "#eddd53" }
```

## Fields
| key | type | notes |
|---|---|---|
| `primary` | string | Start colour — a 3- or 6-digit `#hex`. Default `""`. Malformed → falls back to the option default's `primary`. |
| `secondary` | string | End colour — a 3- or 6-digit `#hex`. Default `""`. When missing/invalid it falls back to `primary` (or `false`). |

## Notes / gotchas
- **Both keys always present.** Default value is `{ "primary": "", "secondary": "" }` — both empty = "no gradient".
- Only plain hex (`#abc` / `#aabbcc`) is accepted — no rgba, no angle, no extra stops. It is the simple/legacy type.
- A non-array input on save is rejected back to the option default.
- For angle, radial mode, rgba stops, and unlimited color stops, use `gradient-v2`.
