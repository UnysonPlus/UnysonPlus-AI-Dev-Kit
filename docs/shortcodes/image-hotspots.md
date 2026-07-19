# `image_hotspots` — Image Hotspots

A base image with positioned interactive pins that reveal a tooltip (title, text, link) on hover or click. Leaf node: `{ type:'simple', shortcode:'image_hotspots', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | attachment object | The base image the pins sit on. |
| `hotspots` | addable-popup | `[]` | array of pin objects (see Notes) | The pins and their tooltip content. |
| `design` | image-picker | `'pulse'` | `pulse` `dot` `numbered` `icon` | Pin style. |
| `trigger` | select | `'hover'` | `hover` `click` | How the tooltip opens (click suits touch). |
| `pin_size` | select | `'md'` | `sm` `md` `lg` | Pin size. |
| `rounded` | select | `'rounded'` | `rounded-0` `rounded` `rounded-lg` | Image corner radius. |
| `pin_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Pin color (`kind: bg`). |
| `pop_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Tooltip background (`kind: bg`). |
| `pop_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tooltip text color. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Link / accent color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "image": "",
  "hotspots": [
    {
      "x": 30, "y": 45,
      "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
      "title": "Feature one",
      "text": "A short description shown in the tooltip.",
      "link_label": "Learn more",
      "link_url": "https://example.com",
      "link_target": "_blank"
    },
    { "x": 70, "y": 60, "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "title": "Feature two", "text": "", "link_label": "", "link_url": "", "link_target": "_self" }
  ],
  "design": "pulse",
  "trigger": "hover",
  "pin_size": "md",
  "rounded": "rounded",
  "pin_color": { "predefined": "", "custom": "" },
  "pop_bg": { "predefined": "", "custom": "" },
  "pop_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Each `hotspots` item: `x` / `y` are 0–100 percent positions; `icon` is an icon-v2 object (used by the `icon` pin design, defaults to `+`); `title`, `text`, `link_label`, `link_url` strings; `link_target` is `_blank` | `_self`.
- The `numbered` design labels pins by their order in the array; the `icon` design uses each pin's `icon`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
