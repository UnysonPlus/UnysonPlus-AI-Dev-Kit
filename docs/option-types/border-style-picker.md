# border-style-picker
A `<select>` replacement that previews each border preset as a real bordered box. Used by columns to pick a `border_preset` (a `.boxp-<slug>` class). Drop-in for a plain select.

## Stored value shape
```json
"boxp-card"
```
The value is a **single string** — the chosen preset's full CSS class (e.g. `boxp-card`), or `""` for the "— None —" row.

## Fields
| key | type | notes |
|---|---|---|
| (value) | string | one choice key from `choices` (a `.boxp-<slug>` class), or `""` when None is selected/allowed. |

## Notes / gotchas
- **Default is `""`.** On save the input is whitelisted against `choices`; unknown values fall back to the default.
- `""` is only accepted when `allow_none` is true (the default).
- The value IS the full preview class (no separate `preview_base`) — mirrors `button-style-picker`, which differs only in that detail.
- Consuming views need no change vs. a plain select — same stored string.
