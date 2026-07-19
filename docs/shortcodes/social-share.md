# `social_share` — Social Share

Share-to buttons (Facebook, X/Twitter, LinkedIn, Pinterest, WhatsApp, Telegram, Reddit, Email, Copy link) in five styles × three shapes × three sizes. (Distinct from `social_icons`, which are profile links.) Leaf node: `{ type:'simple', shortcode:'social_share', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `networks` | multi-select | `['facebook','twitter','linkedin','pinterest','email','copy']` | any of `facebook` `twitter` `linkedin` `pinterest` `whatsapp` `telegram` `reddit` `email` `copy` | Which share buttons, in saved order. |
| `share_source` | select | `'current'` | `current` (this page) `custom` | Which URL to share. |
| `custom_url` | text | `''` | URL string | Used when `share_source=custom`. |
| `share_text` | text | `''` | string | Title/text for networks that support it. Blank = page title. |
| `design` | image-picker | `'brand'` | `brand` `mono` `outline` `soft` `text` | Button style. |
| `shape` | select | `'circle'` | `circle` `rounded` `square` | Button shape (ignored by `text`/minimal). |
| `size` | select | `'md'` | `sm` `md` `lg` | Button size. |
| `show_label` | switch | `'no'` | `'yes'` \| `'no'` | Show the network name (always on for `text`). |
| `layout` | select | `'inline'` | `inline` (wrap) `stacked` (full width) | Button arrangement. |
| `align` | alignment | `'left'` | `left` `center` `right` | Alignment. |
| `custom_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | One color for every button (overrides brand colors). |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon / label color (for minimal / outline). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "networks": ["facebook", "twitter", "linkedin", "pinterest", "email", "copy"],
  "share_source": "current",
  "custom_url": "",
  "share_text": "",
  "design": "brand",
  "shape": "circle",
  "size": "md",
  "show_label": "no",
  "layout": "inline",
  "align": "left",
  "custom_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `networks` is a multi-select **array of keys**; render order = the array order. Unknown keys are filtered out.
- `share_source=current` shares the page the shortcode renders on; the builder/editor preview may show the editor URL but it resolves correctly on the front-end.
- The Copy-link button uses the Clipboard API (with a textarea fallback); Email is a plain `mailto:`; the rest open a centered popup.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
