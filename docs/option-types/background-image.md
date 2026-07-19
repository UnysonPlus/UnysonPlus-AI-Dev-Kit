# background-image
Picks a background image as EITHER a predefined preset (from `choices`) OR a custom uploaded image. Used for section/hero/box background image fields.

## Stored value shape
```json
{
  "type": "predefined | custom",
  "predefined": "<choice_key>",
  "custom": "<attachment_id>",
  "data": { "icon": "<preview url>", "css": { "background-image": "url(\"...\")" } }
}
```
Concrete (custom upload):
```json
{ "type": "custom", "predefined": "", "custom": "42",
  "data": { "icon": "http://.../bg.jpg", "css": { "background-image": "url(\"http://.../bg.jpg\")" } } }
```
Concrete (predefined preset `pattern-1`):
```json
{ "type": "predefined", "predefined": "pattern-1", "custom": "",
  "data": { "icon": "http://.../pattern-1.png", "css": { "background-image": "url(\"...\")" } } }
```

## Fields
| key | type | notes |
|---|---|---|
| `type` | string | `predefined` (chose a preset) or `custom` (uploaded). Defaults to `predefined` when `choices` exist, else `custom`. |
| `predefined` | string | the selected preset's choice key; empty for a custom image. |
| `custom` | string | attachment id of the uploaded image; empty for a predefined choice. |
| `data` | object | render-ready payload — `icon` (preview URL) + a `css` map (usually `{ "background-image": "url(...)" }`). Rebuilt on save; not authored by hand. |

## Notes / gotchas
- **Default value is `''` (empty string)** when nothing chosen — non-array input collapses to the option's `value`.
- `data` is DERIVED on save (`_get_value_from_input`): for `custom` it resolves the attachment URL; for `predefined` it copies the choice's stored `css`. Treat it as read-only output.
- `predefined` and `custom` are mutually exclusive — the non-active one is blanked on save.
- With no `choices` configured the option is effectively upload-only (`type` forced to `custom`).
