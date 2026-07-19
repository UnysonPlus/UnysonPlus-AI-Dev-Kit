# responsive

A generic per-device WRAPPER around a single inner control (image-picker, select, unit-input, …). It renders that inner control once per device layer — Phone (base) / Tablet (md) / Desktop (lg) — and stores one value per layer. Mobile-first / Bootstrap-native. Used for content alignment, container width per device, and any option that varies by breakpoint.

## Stored value shape
```json
{ "base": "<val>", "md": "<val|''>", "lg": "<val|''>" }
```
Concrete (inner = image-picker of alignments):
```json
{ "base": "center", "md": "start", "lg": "" }
```
Concrete (inner = unit-input, so each layer is itself a hash):
```json
{ "base": { "value": "100", "unit": "%" },
  "md":   { "value": "720", "unit": "px" },
  "lg":   { "value": "1170", "unit": "px" } }
```

## Fields
| key | type | notes |
|---|---|---|
| `base` | inner-value | applies at ALL widths (mobile-first). Required layer. |
| `md` | inner-value or `''` | Tablet+ override; `''` = inherit the smaller (base). |
| `lg` | inner-value or `''` | Desktop+ override; `''` = inherit the smaller (md→base). |

## Notes / gotchas
- **Each layer holds the INNER control's own value shape** — a scalar for select/image-picker, or a hash (`{value,unit}`) for a unit-input inner. Match the inner type.
- **Empty `md`/`lg` = inherit** the smaller layer; nothing is emitted for a blank layer.
- The type is token-agnostic — it stores raw values, and the consuming shortcode maps each layer to whatever breakpoint-infixed class fits (`*-md-*`, etc.).
- Legacy scalar tolerance: a bare saved value folds into `base` so converting an option to responsive never errors.
