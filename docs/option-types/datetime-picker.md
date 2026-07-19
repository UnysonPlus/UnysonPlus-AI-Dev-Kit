# datetime-picker

A single date-and-time field (xdsoft datetimepicker + moment.js). The value is a formatted datetime string.

## Stored value shape
```json
"2026/07/18 14:30"
```
A datetime **string** in the configured `format` (default `Y/m/d H:i`). Empty (`""`) when unset.

## Fields
| key | type | notes |
|---|---|---|
| (the value itself) | string | Datetime formatted per the option's `datetime-picker.format` (default `Y/m/d H:i`). On save it is **validated** against `format` (plus any `extra-formats`) and against `minDate`/`maxDate`; a value that fails falls back to the option default. |

## Notes / gotchas
- **Default `value` is `""`.** The `datetime-picker` config sub-array (NOT stored — render/validation only) holds: `format` (`Y/m/d H:i`), `moment-format` (`YYYY/MM/DD HH:mm`), `extra-formats` (array, extra accepted parse formats), `minDate`/`maxDate` (default `false`), `timepicker`/`datepicker` (default `true`), `defaultTime` (`12:00`).
- Because the string is in a PHP-`date()` style format, consumers parse it against that same `format` — it is not a timestamp or ISO string.
- `extra-formats` only widen what's accepted on save; the stored value is normalized to `format`.
