# `media_image` — Image

A single responsive image with sizing, loading priority, and an optional link. Leaf node: `{ type:'simple', shortcode:'media_image', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | `{ attachment_id, url }` (or `''`) | The image. See Notes for the value shape. |
| `width` | unit-input | `{value:300,unit:'px'}` | units `px % vw rem em` | Display width. |
| `height` | unit-input | `{value:200,unit:'px'}` | units `px % vh rem em` | Display height. Blank number = follow width (keep ratio). |
| `fetchpriority` | select | `'auto'` | `auto` `high` | `high` for above-the-fold/hero (better LCP); `auto` lazy-loads. |
| `link` | text | `''` | URL | Wrap the image in a link. Empty = plain image. |
| `target` | switch | `'_self'` | `'_blank'` \| `'_self'` | Open the link in a new window. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |

## Ready-to-use example (the atts object)
```json
{
  "image": { "attachment_id": "", "url": "https://example.com/photo.jpg" },
  "width": { "value": "600", "unit": "px" },
  "height": { "value": "", "unit": "px" },
  "fetchpriority": "high",
  "link": "",
  "target": "_self",
  "bg_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `image` is an **upload** value: `{ "attachment_id": "<id>", "url": "<url>" }`. When generating without a real media ID, leave `attachment_id:''` and set `url` — importers can sideload the URL. An empty image is `''`.
- **Cropping rule:** when BOTH `width` and `height` are in `px`, the source is cropped to that exact size (can stretch if the ratio differs). To keep aspect ratio, set `width` and leave `height`'s number blank (`{ value:'', unit:'px' }`).
- `target` stores the literal `'_blank'`/`'_self'` (not a boolean). For external hosts use `'_blank'`.
- `fetchpriority:'high'` only for the hero/first image; use `'auto'` further down the page.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
