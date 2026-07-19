# table-style-picker

A popover dropdown that previews each choice as a REAL mini `<table>` (styled by the enqueued `.tbl-<slug>` preset CSS). A drop-in replacement for a plain `<select>` that picks one Table Preset. Stores just the class string.

## Stored value shape
```json
"tbl-striped"
```
Default: `""` (nothing selected / None).

## Fields
| key | type | notes |
|---|---|---|
| *(the value itself)* | string | one of the configured `choices` keys — a Table-Preset class like `tbl-striped`, or `''` for None. |

## Notes / gotchas
- The stored value is a **single class string**, not an object — mirrors `border-style-picker`.
- On save the value is whitelisted against `choices` (like a `<select>`): an unknown value falls back to the option's `value`. `''` is allowed only when `allow_none` is true (default).
- `choices` (value→label, typically from `sc_get_table_preset_choices()`), `placeholder`, and `allow_none` are config, not stored.
- Apply the class to the table wrapper on the frontend; the `.tbl-<slug>` rules come from the Table Presets → `css-tokens.php`.
