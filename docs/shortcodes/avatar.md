# `avatar` — Avatar

A single user avatar (image or auto-initials, with an optional presence dot and label) or a stacked avatar group with a "+N" counter. Leaf node: `{ type:'simple', shortcode:'avatar', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `mode_settings` | multi-picker | `{mode:'single'}` | inline multi-picker (see below) | Chooses Single vs Group and reveals that mode's fields. |
| `design` | image-picker | `'plain'` | registry-driven (e.g. `plain`, bordered/ring skins) | Visual treatment for the avatar(s) in either mode. |
| `shape` | select | `'circle'` | `circle` `rounded` `square` | Avatar shape. |
| `size` | slider | `56` | px, min 24 max 240 step 2 | Rendered width/height of each avatar. |
| `show_status` | switch | `'yes'` | `'yes'` \| `'no'` | Master toggle for presence dots (each avatar still needs its own Status). |
| `show_label` | switch | `'no'` | `'yes'` \| `'no'` | Single mode: show Name (and Subtitle) beside the avatar as a chip. |
| `initials_color_mode` | select | `'auto'` | `auto` `theme` | Auto = per-name color; Fixed = uses `initials_bg` from Style tab. |
| `ring_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Ring / border color (`kind: bg`). |
| `initials_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Initials background in Fixed mode (`kind: bg`). |
| `initials_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Initials text color. |
| `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Label text color. |
| `counter_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | "+N" counter background (`kind: bg`). |
| `counter_color` | color-preset | `{predefined:'',custom:''}` | compact color object | "+N" counter text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Label / initials / counter text size. |

### `mode_settings` — Single mode fields (`choices.single`)
`image` (upload), `name` (text), `initials` (text override, auto-derived from name), `subtitle` (text), `link` (text URL), `target` (switch `_blank`/`_self`, default `_self`), `status` (select `''` `online` `away` `busy` `offline`).

### `mode_settings` — Group mode fields (`choices.group`)
`people` (addable-popup: each entry = `image`, `name`, `initials`, `link`, `status`), `max_visible` (text, default `'5'`; 0/empty = show all), `extra_count` (text manual counter override, e.g. "2K+"), `overlap` (slider 0–80, default `35`), `stack_order` (select `first-on-top` \| `last-on-top`, default `first-on-top`).

## Ready-to-use example (the atts object)
```json
{
  "mode_settings": {
    "mode": "single",
    "single": {
      "image": "",
      "name": "Jane Lee",
      "initials": "",
      "subtitle": "Product Designer",
      "link": "",
      "target": "_self",
      "status": "online"
    }
  },
  "design": "plain",
  "shape": "circle",
  "size": 56,
  "show_status": "yes",
  "show_label": "yes",
  "initials_color_mode": "auto",
  "ring_color": { "predefined": "", "custom": "" },
  "initials_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `mode_settings` is an **inline multi-picker**: saved shape is `{ mode:'single'|'group', single:{…} | group:{…} }`. Store the fields for the active mode under the matching key.
- Switches are string `'yes'`/`'no'`; `target` is `'_blank'`/`'_self'`.
- With no image, the avatar shows initials (auto-derived from `name`, e.g. "Jane Lee" → "JL") on a colored circle.
- `design` choices are registry-driven; Bordered/Ring skins read especially well in Group mode.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
