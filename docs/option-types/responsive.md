<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# responsive

A generic per-device WRAPPER around a single inner control (image-picker, select, unit-input, …). It renders that inner control once per device layer — Phone (base) / Tablet (md ≥768) / Desktop (lg ≥992) / Large Desktop (xl ≥1200) — and stores one value per layer. Mobile-first / Bootstrap-native. Used for content alignment, container width per device, position/overflow, and any option that varies by breakpoint.

## Stored value shape
```json
{ "base": "<val>", "md": "<val|''>", "lg": "<val|''>", "xl": "<val|''>" }
```
Concrete (inner = image-picker of alignments):
```json
{ "base": "center", "md": "start", "lg": "", "xl": "end" }
```
Concrete (inner = unit-input, so each layer is itself a hash):
```json
{ "base": { "value": "100", "unit": "%" },
  "md":   { "value": "720", "unit": "px" },
  "lg":   { "value": "1170", "unit": "px" },
  "xl":   { "value": "1320", "unit": "px" } }
```

## Fields
| key | type | notes |
|---|---|---|
| `base` | inner-value | applies at ALL widths (mobile-first). Required layer. |
| `md` | inner-value or `''` | Tablet+ (≥768) override; `''` = inherit the smaller (base). |
| `lg` | inner-value or `''` | Desktop+ (≥992) override; `''` = inherit the smaller (md→base). |
| `xl` | inner-value or `''` | Large-desktop+ (≥1200) override; `''` = inherit the smaller (lg→md→base). |

## Notes / gotchas
- **Each layer holds the INNER control's own value shape** — a scalar for select/image-picker, or a hash (`{value,unit}`) for a unit-input inner. Match the inner type.
- **Empty `md`/`lg`/`xl` = inherit** the smaller layer; nothing is emitted for a blank layer.
- The type is token-agnostic — it stores raw values, and the consuming shortcode maps each layer to whatever breakpoint-infixed class fits (`*-md-*`, `*-xl-*`, etc.).
- The tier list lives in one place per consumer: `const DEVICES` (this type + spacing), `fw_device_tabs_definition()` (the device tabs + their builder slugs), `fw_sc_bp_layers()` / `fw_sc_resp_value()` (the shortcode-view readers), and the `@media` emitters. The `xl` (≥1200px) layer was added across all of them; a view's own per-element `@media` emitter must carry an explicit `-xl → 1200` branch or the computed xl value is silently dropped.
- **`xl` is additive — no migration.** A value saved before `xl` existed simply has no `xl` key, which inherits `lg`. (The builder's device-preview toolbar gained a matching 4th "Large Desktop" button so the xl tab drives the canvas.)
- Legacy tolerance: a bare saved SCALAR — or a legacy COMPOSITE array with none of the device keys (e.g. a pre-responsive multi-picker `{position,…}` or unit-input `{value,unit}`) — folds into `base`, so converting an option to responsive never loses the existing pick.
