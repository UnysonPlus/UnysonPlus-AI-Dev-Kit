# typography

Rich typography control: font **family / style / weight / size / line-height / letter-spacing / color** (+ Google-font subset & variation). The canonical type (promoted from `typography-v2`, which is now a thin alias saving identically). Used for body/heading fonts, per-heading overrides, menu font, footer typography, and shortcode text options.

## Stored value shape
```json
{
  "family": "Open Sans",
  "style": "normal",
  "weight": "400",
  "size": { "value": "16", "unit": "px" },
  "line-height": "1.6",
  "letter-spacing": "0",
  "color": "#111111",
  "google_font": true,
  "subset": "latin",
  "variation": "regular"
}
```
(Only the enabled `components` are meaningfully stored; a family-only picker stores just `{family:''}`.)

## Fields
| key | type | notes |
|---|---|---|
| `family` | string | font family name (theme auto-loads the Google font). |
| `style` | string | `normal`\|`italic`. |
| `weight` | string | `100`…`900`. |
| `size` | object OR int OR json-string | **`size_format:'unit'` (default) → `{value,unit}`.** `size_format:'number'` → bare px integer. |
| `line-height` | string | unitless or with unit. |
| `letter-spacing` | string | em/px. |
| `color` | string | hex (default `color_format:'picker'`). |
| `google_font`/`subset`/`variation` | mixed | Google-font subset/variation metadata. |

## Notes / gotchas
- **Size is polymorphic** — may be a legacy int, a `{value,unit}` hash, OR a JSON string. ALWAYS resolve via `fw_typography_size_css($size,'px')`; never concatenate `$size.'px'`.
- `typography-v2` is a deprecation alias — same value shape, no data migration; the type string isn't stored so v2 saves load unchanged.
- Other slots are plain: `color`=hex, `family`/`weight`/`line-height`/`letter-spacing` as saved.
- When setting only a family, a `{family:'Inter'}` partial is valid.
