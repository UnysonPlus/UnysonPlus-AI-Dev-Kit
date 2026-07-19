# fw-multi-inline

Renders N child fields side-by-side on ONE row (short-text / text / color / rgbacolor / select / short-select). Used by the Spacing/Padding T-R-B-L control and similar.

## Stored value shape
```json
{ "<child_key>": "<child value>", "...": "" }
```
A flat object keyed by each child field's id → that child's own stored value. Concrete (a padding control):
```json
{ "top": "10px", "right": "20px", "bottom": "10px", "left": "20px" }
```

## Fields
| key | type | notes |
|---|---|---|
| `<child_key>` | string | One entry per child declared in `fw_multi_options`. The value is whatever that child option type stores (a string for text/select/color). Keys and their order come from `fw_multi_options`. |

## Notes / gotchas
- The value is a **flat map** — the child keys are defined by the `fw_multi_options` config array (each entry has a `type` + `title`, and `choices` for selects). Default value in `_get_defaults` is `{ "firstoption": "select2" }`.
- On save, a non-array input is rejected back to the option default; an array input is stored as-is (no per-child re-validation at this layer).
- Child field types supported: `short-text`, `text`, `color`, `rgbacolor`, `select`, `short-select`. A color child stores a hex string; an rgbacolor child stores an `rgba()` string.
- `groupname` is a render-only attribute (`data-fwmultioptions`), not part of the stored value.
