# `business_info` — Business Info

A business card block: opening hours (with a live open/closed status), plus address, phone, email, website, and map link. Leaf node: `{ type:'simple', shortcode:'business_info', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `biz_name` | text | `''` | string | Optional heading. |
| `hours` | addable-popup | 7 seeded day rows (see Notes) | array of day objects (see below) | Opening hours, one entry per day. |
| `show_status` | switch | `'yes'` | `'yes'` \| `'no'` | Show a live Open/Closed status computed from site timezone and today's hours. |
| `time_format` | select | `'12'` | `12` `24` | 12-hour (5:00 PM) or 24-hour (17:00) display. |
| `address` | textarea | `''` | string | Business address. |
| `phone` | text | `''` | string | Phone number. |
| `email` | text | `''` | string | Email address. |
| `website` | text | `''` | URL | Website URL. |
| `map_link` | text | `''` | URL | Map / directions URL. |
| `design` | image-picker | `'card'` | registry-driven layouts | Layout skin (labeled "Layout"). Choices from `views/parts/registry.php`. |
| `highlight_today` | switch | `'yes'` | `'yes'` \| `'no'` | Highlight today's row in the hours list. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Accent color (`kind: bg`). |
| `card_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Card background (`kind: bg`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

### `hours` entry (popup-options)
| key | type | default | what it does |
|---|---|---|---|
| `day` | select | `'mon'` | `mon` `tue` `wed` `thu` `fri` `sat` `sun`. |
| `closed` | switch | `'no'` | `'yes'`/`'no'` — mark the day closed. |
| `open` | text | `'09:00'` | Opening time, HH:MM 24h. |
| `close` | text | `'17:00'` | Closing time, HH:MM 24h. |
| `note` | text | `''` | Optional note, e.g. "By appointment". |

## Ready-to-use example (the atts object)
```json
{
  "biz_name": "Riverside Studio",
  "hours": [
    { "day": "mon", "closed": "no", "open": "09:00", "close": "17:00" },
    { "day": "tue", "closed": "no", "open": "09:00", "close": "17:00" },
    { "day": "wed", "closed": "no", "open": "09:00", "close": "17:00" },
    { "day": "thu", "closed": "no", "open": "09:00", "close": "17:00" },
    { "day": "fri", "closed": "no", "open": "09:00", "close": "17:00" },
    { "day": "sat", "closed": "no", "open": "10:00", "close": "14:00" },
    { "day": "sun", "closed": "yes", "open": "", "close": "" }
  ],
  "show_status": "yes",
  "time_format": "12",
  "address": "42 Mill Lane, Riverside",
  "phone": "+1 555 0100",
  "email": "hello@example.com",
  "website": "https://example.com",
  "map_link": "",
  "design": "card",
  "highlight_today": "yes",
  "accent_color": { "predefined": "", "custom": "" },
  "card_bg": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Switches are string `'yes'`/`'no'`, not booleans.
- `hours` seeds a full Mon–Sun week by default (Sat 10:00–14:00, Sun closed); replace with the real schedule.
- The Open/Closed status is computed live from the WordPress site timezone against today's `hours`.
- `design` choices are registry-driven; `card` is the default (the picker is labeled "Layout").
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
