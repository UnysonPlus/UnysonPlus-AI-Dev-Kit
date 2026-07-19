# `countdown` — Countdown Timer

A live countdown to a target date & time — days / hours / minutes / seconds, ticking once a second in the browser. Use it for launches, sales and event starts. Leaf node: `{ type:'simple', shortcode:'countdown', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `target` | datetime-picker | `''` | string `Y/m/d H:i` | The moment counted down to, parsed in the **site timezone** → a UTC ms `data-target`. Empty ⇒ treated as already finished. |
| `show_days` | switch | `'yes'` | `'yes'` \| `'no'` | Render the Days unit. |
| `show_hours` | switch | `'yes'` | `'yes'` \| `'no'` | Render the Hours unit. |
| `show_minutes` | switch | `'yes'` | `'yes'` \| `'no'` | Render the Minutes unit. |
| `show_seconds` | switch | `'yes'` | `'yes'` \| `'no'` | Render the Seconds unit. |
| `label_days` | text | `'Days'` | string | Days caption. |
| `label_hours` | text | `'Hours'` | string | Hours caption. |
| `label_minutes` | text | `'Minutes'` | string | Minutes caption. |
| `label_seconds` | text | `'Seconds'` | string | Seconds caption. |
| `on_complete` | select | `'message'` | `'message'` `'zeros'` `'hide'` | What happens at zero. |
| `complete_text` | text | `'This event has ended.'` | string | Message shown when `on_complete = message`. |
| `alignment` | alignment | `''` (inherit) | `''` `left` `center` `right` | Block alignment. |
| `number_font` | typography-v2 | see Notes | typography object | Digits font/size/weight/spacing. Script + Color disabled. |
| `number_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Digit color (`kind: text`). |
| `label_font` | typography-v2 | see Notes | typography object | Unit-label font. Script + Color disabled. |
| `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Unit-label color (`kind: text`). |
| `box_preset` | border-style picker | `''` | preset slug | Wraps each unit in a Box Preset (`.boxp-{slug}`). None = plain numbers. |

## Ready-to-use example (the atts object)
```json
{
  "target": "2026/12/31 23:59",
  "show_days": "yes", "show_hours": "yes", "show_minutes": "yes", "show_seconds": "yes",
  "label_days": "Days", "label_hours": "Hours", "label_minutes": "Minutes", "label_seconds": "Seconds",
  "on_complete": "message",
  "complete_text": "This event has ended.",
  "alignment": "center",
  "number_font": { "family": "", "style": "normal", "weight": "400", "size": "", "line-height": "", "letter-spacing": 0 },
  "number_color": { "predefined": "", "custom": "" },
  "label_font": { "family": "", "style": "normal", "weight": "400", "size": "", "line-height": "", "letter-spacing": 0 },
  "label_color": { "predefined": "", "custom": "" },
  "box_preset": ""
}
```

## Notes
- `target` is interpreted in the **site timezone**; an empty/invalid value yields `data-target=0`, which the JS treats as already finished.
- Keep `*_color` empty to let the theme style the digits/labels. Typography defaults are intentionally empty so a default countdown emits a clean DOM (visual defaults live in CSS — numbers ~700/40px, labels ~600/13px).
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
