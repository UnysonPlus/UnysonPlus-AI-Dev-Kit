# `tooltip` — Tooltip

An inline trigger (text, button, or icon) that reveals a positioned tooltip on hover/focus or click. Leaf node: `{ type:'simple', shortcode:'tooltip', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `trigger_type` | select | `'text'` | `text` `button` `icon` | What the visitor interacts with. Text shows a dotted underline. |
| `trigger_text` | text | `'hover me'` | string | Label for the Text and Button triggers. |
| `trigger_icon` | icon-v2 | see Notes | icon-v2 object | Icon for the Icon trigger (defaults to `?` if empty). |
| `tip_title` | text | `''` | string | Optional bold heading inside the tooltip. |
| `tip_content` | textarea | `'Helpful text goes here.'` | basic HTML | The tooltip body (links, bold, etc. allowed). |
| `design` | image-picker | `'dark'` | `dark` `light` `accent` `gradient` | Tooltip theme. |
| `position` | select | `'top'` | `top` `right` `bottom` `left` | Preferred side (auto-flips on overflow). |
| `event` | select | `'hover'` | `hover` `click` | Open on hover/focus, or on click/tap. |
| `arrow` | switch | `'yes'` | `yes` \| `no` | Show the pointer arrow. |
| `max_width` | text | `'240px'` | CSS length (e.g. `240px`, `60vw`) | Tooltip max width. |
| `tip_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Tooltip background (`kind: bg`). |
| `tip_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tooltip text color. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Button / icon trigger accent (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "trigger_type": "text",
  "trigger_text": "hover me",
  "trigger_icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "tip_title": "",
  "tip_content": "A short, helpful explanation shown on demand.",
  "design": "dark",
  "position": "top",
  "event": "hover",
  "arrow": "yes",
  "max_width": "240px",
  "tip_bg": { "predefined": "", "custom": "" },
  "tip_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `trigger_icon` uses the **icon-v2** shape. No icon: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- `position` is a preference — the tooltip auto-flips once if it would overflow the viewport.
- `tip_content` allows basic HTML (`wp_kses_post`); keep it short so it fits the `max_width`.
- Colors resolve to CSS variables (`--tt-bg`, `--tt-color`, `--tt-accent`) on the trigger. They use the **compact color-preset** shape `{ predefined, custom }`. See `README.md`.
