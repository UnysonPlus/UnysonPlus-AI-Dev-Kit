# `notification` — Notification

A Bootstrap-style alert box — eight color schemes, three border treatments, optional icon, dismiss / auto-dismiss, and a display mode that can pin it as a site-wide announcement bar or floating toast. Leaf node: `{ type:'simple', shortcode:'notification', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `message` | textarea | `'Message!'` | HTML string | Alert body. Multi-line / basic HTML allowed (run through `wp_kses_post`). |
| `label_text` | text | `''` | string | Custom bold label. Empty = default label for the Type (e.g. "Success!"). |
| `type` | select | `'info'` | `primary` `secondary` `success` `info` `warning` `danger` `light` `dark` | Color scheme + default label + default icon. |
| `border_style` | select | `'filled'` | `filled` `outline` `accent-left` | Box border treatment. |
| `icon` | icon-v2 | see Notes | icon-v2 object | Icon (font / Lucide SVG / emoji / SVG). Empty = per-type default. Overrides `custom_icon`. |
| `custom_icon` | hidden | `''` | legacy string | Retired; fallback only when `icon` is empty. |
| `layout` | select | `'inline'` | `inline` `stacked` | Inline = one row; stacked = label above message. |
| `dismissible` | switch | `false` | `true` \| `false` | Show a close button. |
| `auto_dismiss` | short-text | `'0'` | seconds (`0` = off) | Auto-close after N seconds. Requires `dismissible`. |
| `display_mode` | select | `'inline'` | `inline` `bar-top` `bar-bottom` `floating` | Pin as an announcement bar / floating toast. Non-inline forces a close button. |
| `persist_dismiss` | switch | `'no'` | `'yes'` \| `'no'` | Remember dismissal (localStorage). Pinned modes only. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Label only — overrides `text_color`. |
| `message_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Message body only — overrides `text_color`. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon glyph color (font icons + `currentColor` SVGs). |

## Ready-to-use example (the atts object)
```json
{
  "message": "Your changes have been saved.",
  "label_text": "",
  "type": "success",
  "border_style": "accent-left",
  "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "custom_icon": "",
  "layout": "inline",
  "dismissible": true,
  "auto_dismiss": "0",
  "display_mode": "inline",
  "persist_dismiss": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "label_color": { "predefined": "", "custom": "" },
  "message_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `icon` uses the **icon-v2** shape. No icon (use the per-type default): `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- `icon` (icon-v2) **overrides** `custom_icon` — the opposite of `icon_box`. `custom_icon` is a retired hidden field kept only for old saves.
- `type` drives color AND the default label/icon when `label_text` / `icon` are empty (e.g. `success`→"Success!", `warning`→"Warning!").
- `auto_dismiss` does nothing unless `dismissible` is `true`. Non-inline `display_mode` forces a close button regardless of `dismissible`; place only ONE bar per page.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not raw hex. See `README.md`.
