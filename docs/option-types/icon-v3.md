# icon-v3

A modern multi-source icon picker: font icon, uploaded image, emoji, inline/library/uploaded SVG, or Lottie animation. The canonical icon engine — also backs the legacy `icon` and `icon-v2` ids.

## Stored value shape
```json
{ "type": "icon-font", "icon-class": "fa fa-star" }
```
The stored object is a **discriminated union keyed on `type`**. Only the keys for the active `type` are present:
```json
// type: none (default — no icon)
{ "type": "none" }

// type: icon-font (a font-icon class)
{ "type": "icon-font", "icon-class": "fa fa-star" }

// type: custom-upload (an uploaded raster image)
{ "type": "custom-upload", "attachment-id": 123, "url": "https://…/icon.png" }

// type: emoji
{ "type": "emoji", "char": "🚀" }

// type: svg (source = library | upload | inline)
{ "type": "svg", "svg-source": "library", "svg-id": "arrow-right", "markup": "<svg …>…</svg>" }

// type: lottie
{ "type": "lottie", "src": "https://…/anim.json", "trigger": "loop", "speed": 1 }
```

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | the discriminator: `none` / `icon-font` / `custom-upload` / `emoji` / `svg` / `lottie`. Default `none`. |
| `icon-class` | string | (icon-font) the full CSS class, e.g. `fa fa-star`, `dashicons dashicons-book`. |
| `attachment-id` | int\|false | (custom-upload, and optionally svg-upload) WP media attachment id, or `false`. |
| `url` | string\|false | (custom-upload / svg-upload) the media URL, or `false`. |
| `char` | string | (emoji) the emoji character. |
| `svg-source` | string | (svg) `library` (picked from Lucide), `upload` (media), or `inline` (pasted markup). |
| `svg-id` | string | (svg, library only) the library icon id, e.g. `arrow-right`. Dropped when source is upload/inline. |
| `markup` | string | (svg) the sanitized `<svg>` markup. Stored for inline/upload; resolved from `svg-id` at render for library picks. |
| `src` | string | (lottie) the animation JSON URL (esc_url_raw). |
| `trigger` | string | (lottie) `loop` (default) / `once` / `hover` / `click`. |
| `speed` | float | (lottie) playback speed, `0 < speed <= 8`, default `1`. |

## Notes / gotchas
- **Default is `{ "type": "none" }`** — an empty/unset icon, NOT a missing key.
- **Legacy scalar migration:** the reclaimed `icon` type stored a bare class string (`"fa fa-linux"`). `normalize_value()` upgrades any string → `{ "type": "icon-font", "icon-class": <string> }` (or `{ "type": "none" }` for `""`) so `$value['type']` never throws an illegal-string-offset. Tolerate the legacy string in consumers.
- **Font-icon values get enriched on save**: `_get_db_value_from_json()` adds derived keys `icon-class-without-root`, `pack-name`, `pack-css-uri` (resolved from the packs loader). These are convenience metadata — the source of truth is `icon-class`.
- When used as a **multi-picker picker**, the value arrives as an array (not JSON) and is parsed accordingly.
- **CSS for icon packs is NOT auto-loaded on the frontend** — the theme enqueues it via `fw()->backend->option_type('icon-v3')->packs_loader->enqueue_frontend_css()`.
- The option's own defaults array also carries display-only keys `preview_size` and `popup_size` (option config, not part of the stored value).
