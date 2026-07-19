# multi-select

Select multiple values from a source — a custom `choices` array, or live posts / taxonomy terms / users (with autocomplete). Stores a flat array of the selected keys/ids.

## Stored value shape
```json
["value1", "value3"]
```
Concrete examples:
```json
// population: array — the picked choice keys
["small", "large"]

// population: posts / taxonomy / users — the selected IDs (as strings)
["42", "108", "7"]
```

## Fields
| index | type | notes |
|---|---|---|
| `[]` | string | each element is one selected value: a `choices` key (`population: array`), or a post / term / user **ID** (`population: posts`/`taxonomy`/`users`). Order = selection order. |

## Notes / gotchas
- **The stored value is a plain array of the selected keys/ids** — NOT objects. Titles/labels are resolved at render time from the source, never stored.
- **Default is `[]`** (empty array = nothing selected).
- **Wire-format detail:** on the form the value travels as a single `/*/`-joined string and is `explode('/*/')`-ed back into an array on save. An empty submission becomes `[]`. You never store the joined string — the persisted DB value is the array.
- IDs from `posts`/`taxonomy`/`users` populations come back as **strings** (they pass through the text field), so compare loosely if you need ints.
- `limit` (max selectable, default 100), `prepopulate`, `population`, `source`, `show-type` are option config — they shape the picker, not the stored value.
- Contrast with `multi-upload` (array of `{attachment_id,url}` objects) and `multi` (a keyed hash of inner-option values) — `multi-select` is the only one that stores a bare array of scalar keys.
