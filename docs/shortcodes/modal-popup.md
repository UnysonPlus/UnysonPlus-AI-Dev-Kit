# `modal_popup` — Modal / Popup

A trigger (button, text link, icon or image) that opens a modal / drawer / fullscreen popup with HTML content. Leaf node: `{ type:'simple', shortcode:'modal_popup', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `trigger_type` | select | `'button'` | `button` `text` `icon` `image` | What the visitor clicks to open the modal. |
| `trigger_label` | text | `'Open'` | string | Label for the Button and Text triggers. |
| `trigger_icon` | icon-v2 | see Notes | icon-v2 object | Icon for the Icon trigger. |
| `trigger_image` | upload | `''` | attachment object | Image for the Image trigger. |
| `modal_title` | text | `''` | string | Optional heading at the top of the modal. |
| `modal_content` | textarea | `'Your popup content goes here. Basic HTML is allowed.'` | HTML string | The modal body (basic HTML allowed). |
| `design` | image-picker | `'center'` | `center` `drawer-right` `drawer-left` `fullscreen` | Modal style. |
| `size` | select | `'md'` | `sm` `md` `lg` | Width of the centered card (drawers/fullscreen ignore this). |
| `open_animation` | select | `'zoom'` | `fade` `zoom` `slide` | Open animation. |
| `open_on_load` | switch | `'no'` | `yes` \| `no` | Open the modal automatically on page load. |
| `open_delay` | text | `'0'` | ms number | Delay before auto-open (when `open_on_load` = yes). |
| `close_overlay` | switch | `'yes'` | `yes` \| `no` | Close when the backdrop is clicked. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Trigger / accent color (`kind: bg`). |
| `overlay_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Backdrop overlay color (`kind: bg`). |
| `modal_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Modal background (`kind: bg`). |
| `modal_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Modal text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "trigger_type": "button",
  "trigger_label": "Open",
  "trigger_icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "trigger_image": "",
  "modal_title": "Newsletter",
  "modal_content": "<p>Sign up for updates.</p>",
  "design": "center",
  "size": "md",
  "open_animation": "zoom",
  "open_on_load": "no",
  "open_delay": "0",
  "close_overlay": "yes",
  "accent_color": { "predefined": "", "custom": "" },
  "overlay_color": { "predefined": "", "custom": "" },
  "modal_bg": { "predefined": "", "custom": "" },
  "modal_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- The open animation att is keyed `open_animation` (NOT `animation`) — `animation` is a reserved att written by the page builder's Animations tab and would collide.
- `trigger_icon` uses the **icon-v2** shape (see `icon-box.md`); it is only used when `trigger_type` = `icon`. `trigger_image` is only used for `trigger_type` = `image`.
- `size` applies to the `center` design; `drawer-right`/`drawer-left`/`fullscreen` ignore it.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
