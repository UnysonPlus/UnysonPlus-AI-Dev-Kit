# icon-v3

> **RETIRED as an id — use [`icon`](./icon.md).** `icon-v3` is no longer a registered option type
> (it resolves to Undefined). The modern engine CLASS still lives in this folder and is what `icon`
> runs, but you declare `'type' => 'icon'`, never `'icon-v3'`. This page documents the engine's value
> shape (which `icon` uses).


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

// type: rive
{ "type": "rive", "src": "https://…/anim.riv", "trigger": "loop" }
```
> `lottie` and `rive` only appear when the opt-in **Animated Icons** extension is active (see its doc). The Animated tab is hidden otherwise; already-saved animated values still render on the front end.

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | the discriminator: `none` / `icon-font` / `custom-upload` / `emoji` / `svg` / `lottie` / `rive`. Default `none`. (`lottie`/`rive` require the Animated Icons extension.) |
| `icon-class` | string | (icon-font) the full CSS class, e.g. `fa fa-star`, `dashicons dashicons-book`. |
| `attachment-id` | int\|false | (custom-upload, and optionally svg-upload) WP media attachment id, or `false`. |
| `url` | string\|false | (custom-upload / svg-upload) the media URL, or `false`. |
| `char` | string | (emoji) the emoji character. |
| `svg-source` | string | (svg) `library` (picked from Lucide), `upload` (media), or `inline` (pasted markup). |
| `svg-id` | string | (svg, library only) the library icon id, e.g. `arrow-right`. Dropped when source is upload/inline. |
| `markup` | string | (svg) the sanitized `<svg>` markup. Stored for inline/upload; resolved from `svg-id` at render for library picks. |
| `src` | string | (lottie) the `.json` animation URL / (rive) the `.riv` URL (esc_url_raw). |
| `trigger` | string | (lottie, rive) `loop` (default) / `once` / `hover` / `click`. |
| `speed` | float | (lottie only) playback speed, `0 < speed <= 8`, default `1`. |

## Notes / gotchas
- **Default is `{ "type": "none" }`** — an empty/unset icon, NOT a missing key.
- **Legacy scalar migration:** the reclaimed `icon` type stored a bare class string (`"fa fa-linux"`). `normalize_value()` upgrades any string → `{ "type": "icon-font", "icon-class": <string> }` (or `{ "type": "none" }` for `""`) so `$value['type']` never throws an illegal-string-offset. Tolerate the legacy string in consumers.
- **Font-icon values get enriched on save**: `_get_db_value_from_json()` adds derived keys `icon-class-without-root`, `pack-name`, `pack-css-uri` (resolved from the packs loader). These are convenience metadata — the source of truth is `icon-class`.
- When used as a **multi-picker picker**, the value arrives as an array (not JSON) and is parsed accordingly.
- **CSS for icon packs is NOT auto-loaded on the frontend** — the theme enqueues it via `fw()->backend->option_type('icon-v3')->packs_loader->enqueue_frontend_css()`.
- The option's own defaults array also carries display-only keys `preview_size` and `popup_size` (option config, not part of the stored value).
- **Animated icons are opt-in.** The Animated tab (Lottie + Rive), their runtimes, and the `.json`/`.riv` upload endpoints are gated behind the **Animated Icons** extension (default OFF), toggled per-technology in **Theme Settings → Icons → Animated**. Two more technologies ride the *existing* value types when the extension enables them: **animated SVG (SMIL)** — the sanitizer keeps `<animate>`/`<animateTransform>` in a `svg` value; and **animated raster** — a `custom-upload` GIF/APNG/WebP the browser animates. Frontend `sc_icon_render()` renders all kinds regardless of the extension's state, so saved animated icons never break when it's toggled off.
