# time-picker

A **time-only** picker (no date). The sibling of [`date-picker`](date-picker.md) and
[`datetime-picker`](datetime-picker.md), built on the same underlying widget with the calendar
half switched off.

## Stored value shape

```json
"14:30"
```

A **string** in the option's configured format — `H:i` (24-hour, zero-padded) by default.
Default: `''`.

## Declaring it

```php
'opens_at' => [
	'type'  => 'time-picker',
	'label' => __( 'Opening Time', 'fw' ),
	'value' => '',
],
```

With a custom format:

```php
'opens_at' => [
	'type'  => 'time-picker',
	'label' => __( 'Opening Time', 'fw' ),
	'value' => '09:00',
	'datetime-picker' => [
		'format'        => 'h:i A',   // what is stored AND displayed
		'moment-format' => 'hh:mm A', // the JS widget's equivalent — keep in sync
		'defaultTime'   => '09:00',
		'step'          => 15,        // minutes between selectable times
	],
],
```

| `datetime-picker` key | Default | Notes |
|---|---|---|
| `format` | `'H:i'` | PHP-style format. **This is what gets stored**, not just displayed. |
| `moment-format` | `'HH:mm'` | The JS widget's format. Must express the same thing as `format`. |
| `extra-formats` | `[]` | Additional formats accepted on input. |
| `timepicker` | `true` | Leave on — it is what makes this a time picker. |
| `datepicker` | `false` | Leave off; turning it on makes this a `datetime-picker`. |
| `defaultTime` | `'12:00'` | Where the widget opens when the field is empty. |
| `minDate` / `maxDate` | `false` | Date bounds — not meaningful here. |

Keys you do not set are merged from the defaults, so a partial `datetime-picker` array is fine.

## Notes / gotchas

- **The format is part of the contract.** Because the stored string is in `format`, changing
  `format` on an option that already has saved values changes how those values parse. Treat it
  as a value-shape change: migrate, or accept both.
- **`format` and `moment-format` must agree.** They are consumed by different layers (PHP and
  the JS widget); if they disagree, the widget writes a string the server then reads
  differently — a bug that only shows up for some times of day.
- **It is a string, not a timestamp.** Combine with a date and a timezone before doing anything
  arithmetic with it. `strtotime( '14:30' )` resolves against *today* in the server's timezone,
  which is rarely what you want.
- For a full date + time in one field use [`datetime-picker`](datetime-picker.md); for a range,
  [`datetime-range.md`](datetime-range.md).

See also: [date-picker.md](date-picker.md) · [datetime-picker.md](datetime-picker.md) ·
[datetime-range.md](datetime-range.md)
