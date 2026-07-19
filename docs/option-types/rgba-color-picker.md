# rgba-color-picker

A color field (Coloris, alpha ON) that emits an **`rgba()`** color string with opacity. A thin variant of `color-picker`. Stores a single color string.

## Stored value shape
```json
"rgba(0, 0, 0, 0.5)"
```
A plain color STRING — `rgba()` (or `rgb()` when the pick is fully opaque), and 3/4/6/8-digit hex is also accepted. NOT a `{predefined,custom}` object. Default `value` is `''`.

## Fields
| key | type | notes |
|---|---|---|
| (whole value) | string | a CSS color literal — `rgba(r,g,b,a)`, `rgb(r,g,b)`, or `#hex` (3/4/6/8). |

## Notes / gotchas
- **Opaque picks emit `rgb()` (no alpha), not `rgba()`** — Coloris (`format:'rgb'`) drops alpha at full opacity. The save validator accepts optional alpha, so a legitimate opaque pick isn't rejected.
- `_get_value_from_input` accepts `rgb()`/`rgba()` + 3/4/6/8-digit hex; anything else reverts to the option default. Empty string is intentionally allowed through.
- Consume the string **directly as a CSS color** (inline style, custom property) — no resolver needed.
- **Largely redundant now.** `color-picker` with `'alpha' => true` also produces `rgba()`; prefer that in new code. This type is kept for back-compat / call sites that explicitly want rgba output.
- Backend width type is `auto`.
