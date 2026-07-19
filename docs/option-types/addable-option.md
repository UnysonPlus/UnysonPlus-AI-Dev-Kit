# addable-option
A repeatable single option — an "Add" button that appends more instances of ONE inner option type (text, select, image, …). Used wherever a variable-length list of a single field is needed.

## Stored value shape
```json
[ "<inner value>", "<inner value>", "..." ]
```
Concrete (inner `option` is a `text` field, three rows added):
```json
[ "First item", "Second item", "Third item" ]
```
Concrete (inner `option` is an `image` upload — each entry is that type's own shape):
```json
[ { "attachment_id": "42", "url": "http://.../a.jpg" }, { "attachment_id": "51", "url": "http://.../b.jpg" } ]
```

## Fields
| key | type | notes |
|---|---|---|
| (array items) | mixed | A flat, ordered array. Each element is the full stored value of the configured inner `option` type (`option['option']['type']`), produced by that type's own `get_value_from_input`. |

## Notes / gotchas
- **Default is an empty array `[]`.** Non-array input falls back to the option's `value` default.
- The element shape is entirely determined by the **inner option type** — a `text` inner gives strings, an `image`/`multi-picker`/etc. inner gives that type's object shape.
- `sortable` (default `true`) controls drag-reordering only; the array order is the saved order.
- This is the SINGLE-option repeater. For a repeater of a whole option *group*, that's `addable-box`/`addable-popup`, not this type.
