# date-picker

A single date field (bootstrap-datepicker). The value is a plain date string in the picker's display format.

## Stored value shape
```json
"18-07-2026"
```
A date **string** exactly as the picker formats/displays it (default input format `d-m-Y`). Empty (`""`) when nothing is chosen.

## Fields
| key | type | notes |
|---|---|---|
| (the value itself) | string | The chosen date as a display-format string. No validation/normalization on save — whatever the (read-only) input holds is stored verbatim; `null` input falls back to the option default. |

## Notes / gotchas
- Not a timestamp and not ISO — a display string, so consumers must parse it against the configured format.
- **Default `value` is `""`.** Config keys (not part of the value): `monday-first` (bool, default true), `min-date` (default = current day, format `d-m-Y`, `null` = no min), `max-date` (default `null`).
- Input is rendered `readonly` — the user can only pick via the calendar widget.
- For a date **and** time, use `datetime-picker`; for a start/end pair, use `datetime-range`.
