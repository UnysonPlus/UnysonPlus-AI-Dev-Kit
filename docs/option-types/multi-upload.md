# multi-upload

Upload / pick MULTIPLE media items (a gallery of images, or any files) from the WP media library. Stores an array of attachment objects.

## Stored value shape
```json
[
  { "attachment_id": 123, "url": "//example.com/wp-content/uploads/a.jpg" },
  { "attachment_id": 456, "url": "//example.com/wp-content/uploads/b.jpg" }
]
```
With `sizes` requested, each item may also carry a `sizes` map:
```json
[
  {
    "attachment_id": 123,
    "url": "//example.com/wp-content/uploads/a.jpg",
    "sizes": { "thumbnail": { "url": "…", "width": 150, "height": 150 } }
  }
]
```

## Fields
| key | type | notes |
|---|---|---|
| `[]` | object | one entry per selected media item, in gallery order. |
| `attachment_id` | int | the WP media attachment ID (the source of truth). |
| `url` | string | the attachment URL, **protocol-relative** (`http(s)://` stripped to `//`). |
| `sizes` | object | (optional, only when the option declares `sizes`) map of size name → `{ url, width, height, … }` from `wp_prepare_attachment_for_js`. |

## Notes / gotchas
- **Default is `[]`** (empty array = no media).
- **Wire-format detail:** on the form only the array of attachment **ids** (`[123, 456]`) is submitted (the hidden input holds a JSON id list). On save `_get_value_from_input` re-hydrates each id back into the full `{ attachment_id, url }` object via `wp_get_attachment_url()`. So the stored DB value is the array of OBJECTS, not the id list.
- An id whose attachment no longer resolves (`wp_get_attachment_url` returns false) is **dropped** from the saved value.
- Element order is preserved (drag-sortable in the UI).
- `images_only` (default true), `files_ext`, `extra_mime_types`, `texts`, `sizes` are option config — they gate what can be uploaded, not the stored shape.
- Contrast with `multi-select` (array of scalar keys/ids) — `multi-upload` stores an array of `{attachment_id,url}` objects.
