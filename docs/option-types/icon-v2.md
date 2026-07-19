# icon-v2

An icon PICKER: choose a Font-Awesome / pack glyph, an uploaded image, an emoji, or an SVG (library / pasted / uploaded). Used for logo icon, `icon_text`/`icon_box` icons, social profile icons, menu toggles. Shares its value shape with `icon-v3` (which only adds `lottie`); the legacy `icon` type stored a bare class string.

## Stored value shape
An array keyed by `type` (NOT a bare string):
```json
{ "type": "icon-font", "icon-class": "fas fa-star",
  "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }
```
Per-type variants:
```json
{ "type": "svg", "svg-source": "library", "svg-id": "arrow-right", "markup": "<svg …>…</svg>" }
{ "type": "custom-upload", "url": "https://…/icon.png", "attachment-id": 123 }
{ "type": "emoji", "char": "🚀" }
{ "type": "none" }
```

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | `none`\|`icon-font`\|`custom-upload`\|`emoji`\|`svg`. Determines which extra keys are present. |
| `icon-class` (+`pack-*`) | string/bool | `icon-font`: the glyph class + optional pack metadata. |
| `svg-source` | string | `svg`: `library`\|`upload`\|`inline`. |
| `svg-id` / `markup` / `url` | string | `svg`: a **library** pick stores `svg-id` (e.g. a Lucide name) AND is enriched to `markup` at save via `fw_icon_lucide_markup()`; inline stores sanitized `markup`; upload stores `url`. |
| `url` / `attachment-id` | string/int | `custom-upload`: image. |
| `char` | string | `emoji`: the emoji character. |

## Notes / gotchas
- Value is an **array keyed by `type`** — never a bare string on new saves.
- **Legacy scalar bridge:** an old bare class string (`'fa fa-linux'`) is normalized to `{type:'icon-font','icon-class':…}` so `$value['type']` never throws.
- Render with `sc_icon_render($value,$args)` (shortcodes extension; guard `function_exists`); it emits `<i>`/`<img>`/emoji `<span>`/inline `<svg>` and tolerates the legacy string.
- **Lucide library picks** carry `svg-source:'library'` + `svg-id`; the markup is resolved from the id (so id-only values still preview/render). Enqueue non-FA packs before render or the glyph is a blank box.
