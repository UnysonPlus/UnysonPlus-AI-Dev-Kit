# icon-v2

An icon PICKER: choose a Font-Awesome / pack glyph, an uploaded image, an emoji, or an SVG (library / pasted / uploaded). Used for logo icon, `icon_text`/`icon_box` icons, social profile icons, menu toggles. `icon`, `icon-v2` and `icon-v3` all run ONE modern engine (they differ only in `get_type()`), so they share a value shape; the animated kinds (`lottie`/`rive`) light up when the Animated Icons extension is active. The legacy `icon` type stored a bare class string, still tolerated.

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
{ "type": "lottie", "src": "https://…/anim.json", "trigger": "loop", "speed": 1 }
{ "type": "rive", "src": "https://…/anim.riv", "trigger": "loop" }
{ "type": "none" }
```
> `lottie`/`rive` only exist when the opt-in **Animated Icons** extension is active.

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | `none`\|`icon-font`\|`custom-upload`\|`emoji`\|`svg`\|`lottie`\|`rive`. Determines which extra keys are present. (`lottie`/`rive` add `src`/`trigger`[/`speed`] and require the Animated Icons extension.) |
| `icon-class` (+`pack-*`) | string/bool | `icon-font`: the glyph class + optional pack metadata. |
| `svg-source` | string | `svg`: `library`\|`upload`\|`inline`. |
| `svg-id` / `markup` / `url` | string | `svg`: a **library** pick stores `svg-id` (e.g. a Lucide name) AND is enriched to `markup` at save via `fw_icon_lucide_markup()`; inline stores sanitized `markup`; upload stores `url`. The sanitizer allowlist (`sc_icon_sanitize_svg()`) supports full brand SVGs: shapes, `defs`, linear/radial gradients + `stop`, `text`/`tspan`, `use`/`symbol`, `mask`/`clipPath`, `opacity`/`transform` — scripts, event handlers and non-`#fragment` `href`s are always stripped. Sanitization happens at SAVE time, so widening the allowlist requires re-saving previously stored markup. Illustrator exports are handled automatically: `sc_icon_flatten_svg_css()` inlines the `<style>` block's `.stN` classes + inline `style=""` lists as presentation attributes before sanitizing. Media-Library `.svg` uploads are allowed for administrators and rewritten through the same sanitizer+flattener at upload (`wp_handle_upload_prefilter`). |
| `url` / `attachment-id` | string/int | `custom-upload`: image. |
| `char` | string | `emoji`: the emoji character. |

## Notes / gotchas
- Value is an **array keyed by `type`** — never a bare string on new saves.
- **Legacy scalar bridge:** an old bare class string (`'fa fa-linux'`) is normalized to `{type:'icon-font','icon-class':…}` so `$value['type']` never throws.
- Render with `sc_icon_render($value,$args)` (shortcodes extension; guard `function_exists`); it emits `<i>`/`<img>`/emoji `<span>`/inline `<svg>` and tolerates the legacy string.
- **Lucide library picks** carry `svg-source:'library'` + `svg-id`; the markup is resolved from the id (so id-only values still preview/render). Enqueue non-FA packs before render or the glyph is a blank box.
