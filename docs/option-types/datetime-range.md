# datetime-range

A start/end pair of date-and-time fields (two linked datetime-pickers). The value is a `{from, to}` object of formatted datetime strings.

## Stored value shape
```json
{ "from": "2026/07/18 09:00", "to": "2026/07/20 17:00" }
```

## Fields
| key | type | notes |
|---|---|---|
| `from` | string | Start datetime, formatted per the `from` picker's `format` (default `Y/m/d H:i`). Default `""`. |
| `to` | string | End datetime, same format. Default `""`. |

## Notes / gotchas
- **Both keys always present.** Default value is `{ "from": "", "to": "" }`.
- On save each side is validated by the underlying `datetime-picker`; the whole value is **rejected back to the option default** if `from`/`to` is missing, either side is empty, or `from` is after `to` (also rejects an identical from==to when it carries a time-of-day).
- Each side's format follows its picker config: `timepicker:false` → `Y/m/d`; `datepicker:false` → `H:i`; otherwise `Y/m/d H:i`. Configured under `datetime-pickers.from` / `datetime-pickers.to` (render/validation only, not stored).
- Default `minDate`/`maxDate` bound the range to `1970/01/01`…`2038/01/19`.
