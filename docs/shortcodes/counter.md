# `counter` — Animated Counter

An animated running number that counts from a start value to a target when it scrolls into view. A focused number widget: the optional prefix/suffix double as inline left/right captions — there is no label and no icon (put those in a separate `text_block`/`special_heading`). Leaf node: `{ type:'simple', shortcode:'counter', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `number` | text | `'100'` | numeric string | Target value; non-digits (commas) stripped for the count. |
| `start` | text | `'0'` | numeric string | Value the count begins at. |
| `prefix` | text | `''` | string | Text before the number (e.g. `$`); also the left caption. |
| `suffix` | text | `''` | string | Text after the number (e.g. `+`, `%`, `k`); also the right caption. |
| `decimals` | select | `'0'` | `'0'` `'1'` `'2'` `'3'` | Decimal places shown. |
| `separator` | select | `'yes'` | `'yes'` \| `'no'` | Insert thousands separators (`45,280`). |
| `duration` | text | `'2000'` | ms | Count-up animation length. `0` = no animation. |
| `easing` | select | `'ease-out'` | `'ease-out'` `'linear'` `'ease-in-out'` | Count easing. |
| `alignment` | alignment | `''` (inherit) | `''` `left` `center` `right` | Block alignment. |
| `number_font` | typography-v2 | weight 700, 42/46 | typography object | Number font/size/weight/spacing. Script + Color disabled. |
| `number_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Number color (`kind: text`). |
| `prefix_font` | typography-v2 | weight 700, 24/28 | typography object | Prefix font. Script + Color disabled. |
| `prefix_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Prefix color (`kind: text`). |
| `suffix_font` | typography-v2 | weight 700, 24/28 | typography object | Suffix font. Script + Color disabled. |
| `suffix_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Suffix color (`kind: text`). |

## Ready-to-use example (the atts object)
```json
{
  "number": "45280",
  "start": "0",
  "prefix": "",
  "suffix": "+",
  "decimals": "0",
  "separator": "yes",
  "duration": "2000",
  "easing": "ease-out",
  "alignment": "center",
  "number_font": { "family": "", "style": "normal", "weight": "700", "size": 42, "line-height": 46, "letter-spacing": 0 },
  "number_color": { "predefined": "", "custom": "" },
  "prefix_font": { "family": "", "style": "normal", "weight": "700", "size": 24, "line-height": 28, "letter-spacing": 0 },
  "prefix_color": { "predefined": "", "custom": "" },
  "suffix_font": { "family": "", "style": "normal", "weight": "700", "size": 24, "line-height": 28, "letter-spacing": 0 },
  "suffix_color": { "predefined": "", "custom": "" }
}
```

## Notes
- A minimal atts set is fine — the view null-guards every key, so a generator can emit just `number` / `suffix` + `unique_id`.
- The animation runs once per element, the first time it's ≥40% in view, and honors `prefers-reduced-motion`. No-JS shows the final formatted number.
- Keep the visible units in `prefix`/`suffix`; the numeric target is extracted from `number` by stripping non-numeric characters.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
