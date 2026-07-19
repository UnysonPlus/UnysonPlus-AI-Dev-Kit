# `calendar` — Calendar

A month-grid calendar with placed events and an optional upcoming-events list. Leaf node: `{ type:'simple', shortcode:'calendar', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `events` | addable-popup | `[]` | array of event objects (see below) | Each entry is one event placed on its date. |
| `design` | image-picker | `'classic'` | registry-driven skins | Calendar skin. Choices from `views/parts/registry.php`. |
| `start_week` | select | `'mon'` | `mon` `sun` | Which day the week starts on. |
| `show_list` | switch | `'yes'` | `'yes'` \| `'no'` | Show an upcoming-events list beneath the grid. |
| `list_limit` | text | `'5'` | numeric string | Max events in the upcoming list. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Accent for today / nav (`kind: bg`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

### `events` entry (popup-options)
| key | type | default | what it does |
|---|---|---|---|
| `title` | text | `'New event'` | Event title. |
| `date` | date-picker | `''` | The day the event appears on. |
| `end_date` | date-picker | `''` | Optional last day (inclusive) for a multi-day event. |
| `time` | text | `''` | Optional display time, e.g. "8:00 AM". Ignored if All Day is on. |
| `all_day` | switch | `'no'` | `'yes'`/`'no'` — all-day event. |
| `url` | text | `''` | Optional link — makes the event clickable. |
| `color` | select | `'blue'` | `blue` `green` `amber` `red` `purple` `teal`. |

## Ready-to-use example (the atts object)
```json
{
  "events": [
    { "title": "Team Standup", "date": "2026-07-20", "end_date": "", "time": "9:00 AM", "all_day": "no", "url": "", "color": "blue" },
    { "title": "Product Launch", "date": "2026-07-24", "end_date": "", "time": "", "all_day": "yes", "url": "", "color": "green" }
  ],
  "design": "classic",
  "start_week": "mon",
  "show_list": "yes",
  "list_limit": "5",
  "accent_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Switches are string `'yes'`/`'no'`, not booleans.
- `date` / `end_date` use the date-picker's ISO `YYYY-MM-DD` string; leave `end_date` empty for single-day events.
- `time` is a display string only and is ignored when `all_day` is `'yes'`.
- `design` choices are registry-driven; `classic` is the default.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
