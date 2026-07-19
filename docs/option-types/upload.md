# upload

A WordPress media-library picker (image-only by default, or any-file when `files_ext` is set). Stores the chosen attachment as an id + protocol-relative URL.

## Stored value shape
```json
{
  "attachment_id": 482,
  "url": "//example.com/wp-content/uploads/2026/07/photo.jpg"
}
```
Default: `''` (empty string — nothing selected).

## Fields
| key | type | notes |
|---|---|---|
| `attachment_id` | int | the WP attachment (post) id. |
| `url` | string | the file URL, forced protocol-relative (`//host/…`) so it works over http/https. |
| `sizes` | object | present ONLY when the option config supplies a `sizes` list; maps each requested size name → its `{url,width,height,…}` info from `wp_prepare_attachment_for_js`. |

## Notes / gotchas
- **Empty state is `''` (a string), NOT an empty object** — always check `!empty($v['attachment_id'])` before reading `url`.
- On input the type accepts either a bare numeric attachment id (it resolves `url`/`sizes` itself) OR a full `{attachment_id,url}` array passed directly.
- If the attachment id no longer resolves to a URL, it falls back to the default (`''`).
- Config keys (`images_only`, `files_ext`, `extra_mime_types`, `texts`, `thumb_max_width`, `sizes`) are not stored — only `{attachment_id,url[,sizes]}` persists.
