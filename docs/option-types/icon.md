# icon

**THE icon option type** — `icon-v2` and `icon-v3` are retired, so `'type' => 'icon'` is the only one to use. It runs the canonical modern picker (merged Icons/Custom tabs, Emoji, SVG upload, favorites, and — with the Animated Icons extension — Animated/Lottie/Rive). The engine class (`FW_Option_Type_Icon`) lives in the `icon` folder and extends `FW_Option_Type` directly — its internal asset handles / CSS classes / `wp.template` names still carry a legacy `-v3` prefix, but that's a naming leftover, not a separate type. The stored value is a typed object whose keys depend on `type`.

## Stored value shape
```json
{ "type": "icon-font", "icon-class": "fa fa-star" }
```
Empty / unset:
```json
{ "type": "none" }
```

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | The icon kind: `none` \| `icon-font` \| `custom-upload` \| `emoji` \| `svg` \| `lottie` \| `rive`. Default `"none"`. Drives which other keys are present. (`lottie`/`rive` require the Animated Icons extension.) |
| `icon-class` | string | **icon-font only.** The font-icon class, e.g. `"fa fa-star"`, `"dashicons dashicons-book"`. (On the resolved/render value the engine also adds `icon-class-without-root`, `pack-name`, `pack-css-uri`.) |
| `attachment-id` / `url` | int \| string | **custom-upload (and svg upload) only.** WP attachment id + its URL (`false` when unset). |
| `char` | string | **emoji only.** The emoji character. |
| `svg-source` | string | **svg only.** `library` \| `upload` \| `inline`. Plus `svg-id` (library pick), `markup` (sanitized inline/uploaded SVG), and `attachment-id`/`url` when applicable. |
| `src` / `trigger` / `speed` | string / string / float | **lottie & rive.** `src` = the `.json` (lottie) or `.riv` (rive) URL; `trigger` ∈ `loop`\|`once`\|`hover`\|`click` (default `loop`); `speed` 0–8 (default `1`, **lottie only**). Both kinds require the Animated Icons extension. |

## Notes / gotchas
- **Default value is `{ "type": "none" }`** (the `_get_defaults` array also seeds empty `icon-class`/`pack-*` keys, but the effective empty state is `type:none`).
- **Legacy scalar tolerated (this is the v1 vs v2 difference).** The original stock `icon` type stored a **bare class STRING** (e.g. `"fa fa-star"`). `normalize_value()` bridges any string on load/render to `{ type:'icon-font', 'icon-class': <string> }` (and `""` → `{ type:'none' }`), so old saved values and legacy string defaults keep working with no migration.
- **Only `icon` is registered now** (`FW_Option_Type::register( 'FW_Option_Type_Icon' )`); there is no separate `icon-v2`/`icon-v3` class or folder. The picker's internal handles / CSS classes / `wp.template` names still carry a `-v3` prefix, but that's an internal naming leftover, not a second option type. Only truly ancient data ever exists as the bare-string form.
- When used as a multi-picker picker, the value may arrive as a decoded array rather than a JSON string — the engine handles both.
