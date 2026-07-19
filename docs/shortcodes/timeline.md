# `timeline` — Timeline

A sequence of milestones (date, title, text, marker icon, image, link) in a vertical or horizontal layout. Leaf node: `{ type:'simple', shortcode:'timeline', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `items` | addable-popup | `[]` | array of `{ date, title, text, icon, image, link_label, link_url, link_target }` | The milestones. |
| `items[].date` | text | `'2024'` | string | Date / label shown with the milestone. |
| `items[].title` | text | `'Milestone'` | string | Milestone heading. |
| `items[].text` | textarea | `''` | plain text / HTML | Milestone body. |
| `items[].icon` | icon-v2 | see Notes | icon-v2 object | Marker icon (shown when Marker Style is Icon). |
| `items[].image` | upload | `''` | `{ attachment_id, url }` | Optional image at the top of the card. |
| `items[].link_label` | text | `''` | string | Link text; blank hides the link. |
| `items[].link_url` | text | `''` | URL | Link target. |
| `items[].link_target` | switch | `'_self'` | `_self` \| `_blank` | Open the link in a new tab. |
| `design` | image-picker | `'alternating'` | `alternating` `left` `right` `horizontal` | Overall layout. |
| `marker` | select | `'dot'` | `dot` `icon` `number` | Marker style (`number` = 1-based index; `icon` uses the per-item icon). |
| `card_style` | select | `'card'` | `card` `outline` `plain` | Card treatment (shadow / bordered / no box). |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Line + markers (`kind: bg`). |
| `line_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Connector line color. |
| `card_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Card background (`kind: bg`). |
| `date_color` / `title_color` / `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Per-part text colors. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "items": [
    { "date": "2021", "title": "Founded", "text": "The company opens its first office.", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "image": "", "link_label": "", "link_url": "", "link_target": "_self" },
    { "date": "2023", "title": "10k customers", "text": "A major growth milestone reached.", "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false }, "image": "", "link_label": "Read more", "link_url": "/story/", "link_target": "_self" }
  ],
  "design": "alternating",
  "marker": "dot",
  "card_style": "card",
  "accent_color": { "predefined": "", "custom": "" },
  "line_color": { "predefined": "", "custom": "" },
  "card_bg": { "predefined": "", "custom": "" },
  "date_color": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `items[].icon` uses the **icon-v2** shape. No icon: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- `link_target` stores the anchor `target` value literally (`_self` / `_blank`), not `yes`/`no`.
- `alternating` places items left/right of a centre line and collapses to a left rail on narrow screens; `horizontal` is a scroll-snap row.
- `image` and `items[].image` are WP upload **objects** (`{ attachment_id, url }`) — use `attachment_id: 0` with a URL only.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
