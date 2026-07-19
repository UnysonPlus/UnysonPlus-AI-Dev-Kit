# icon

The icon picker. The `icon` id has been RECLAIMED to run the canonical modern engine (icon-v3): merged Icons/Custom tabs, Emoji, Animated (Lottie), SVG upload, favorites. The stored value is a typed object whose keys depend on `type`.

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
| `type` | string | The icon kind: `none` \| `icon-font` \| `custom-upload` \| `emoji` \| `svg` \| `lottie`. Default `"none"`. Drives which other keys are present. |
| `icon-class` | string | **icon-font only.** The font-icon class, e.g. `"fa fa-star"`, `"dashicons dashicons-book"`. (On the resolved/render value the engine also adds `icon-class-without-root`, `pack-name`, `pack-css-uri`.) |
| `attachment-id` / `url` | int \| string | **custom-upload (and svg upload) only.** WP attachment id + its URL (`false` when unset). |
| `char` | string | **emoji only.** The emoji character. |
| `svg-source` | string | **svg only.** `library` \| `upload` \| `inline`. Plus `svg-id` (library pick), `markup` (sanitized inline/uploaded SVG), and `attachment-id`/`url` when applicable. |
| `src` / `trigger` / `speed` | string / string / float | **lottie only.** Animation URL; `trigger` ∈ `loop`\|`once`\|`hover`\|`click` (default `loop`); `speed` 0–8 (default `1`). |

## Notes / gotchas
- **Default value is `{ "type": "none" }`** (the `_get_defaults` array also seeds empty `icon-class`/`pack-*` keys, but the effective empty state is `type:none`).
- **Legacy scalar tolerated (this is the v1 vs v2 difference).** The original stock `icon` type stored a **bare class STRING** (e.g. `"fa fa-star"`). `normalize_value()` bridges any string on load/render to `{ type:'icon-font', 'icon-class': <string> }` (and `""` → `{ type:'none' }`), so old saved values and legacy string defaults keep working with no migration.
- `icon`, `icon-v2`, and `icon-v3` all share ONE picker instance / engine — they differ only in `get_type()`. `icon-v2` is the same modern engine under a distinct id; only truly ancient data ever exists as the bare-string form.
- When used as a multi-picker picker, the value may arrive as a decoded array rather than a JSON string — the engine handles both.
