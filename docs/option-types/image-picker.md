# image-picker

A grid of clickable image tiles — pick one choice key (or several with `multiple`). Used everywhere a visual choice is nicer than a select: layout modes, header/menu/dropdown designs, logo layout, alignment, icon frames, sidebar position, etc.

## Stored value shape
Single (default):
```json
"boxed"
```
Multiple (`multiple:true`):
```json
["top", "bottom"]
```
The value is simply the chosen **choice key(s)** — a bare string, or an array of keys.

## Fields
| config | type | notes |
|---|---|---|
| `value` | string/array | selected choice key; array of keys when `multiple`. |
| `blank` | bool | if true, tiles can be deselected (value can be `''`). |
| `multiple` | bool | if true, several tiles toggle on → value is an array of keys. |
| `choices` | object | `key => imgUrl` or `key => {small,large,label,data}`; a `{label,choices}` entry becomes an `<optgroup>` category. |
| `search` / `layout` / `show_label` | mixed | live search box; `grid` (default) vs `tabs` categories; show captions under tiles. |

## Notes / gotchas
- Value is **just the choice key**, never an object. Choice keys are the units you set (e.g. `full`, `boxed`, `left`, `right`, `pill`, `card`).
- Choice keys should be non-empty; an unrecognized saved key is coerced back to the option's default (or first tile) on save.
- `multiple` value is a de-duped array of valid keys, in click order; stored as a JSON array internally but persisted as a PHP array.
- Grouped choices (`{label,choices}`) still store only the leaf key — the group is presentational.
