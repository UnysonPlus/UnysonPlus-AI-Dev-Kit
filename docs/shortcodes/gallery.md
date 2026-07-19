# `gallery` — Gallery

A multi-image gallery with 20+ layout designs (grid, masonry, carousel, coverflow, …), lightbox, captions and per-card box styling. Leaf node: `{ type:'simple', shortcode:'gallery', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `images` | multi-upload | `[]` | array of `{ attachment_id, url }` | The gallery images (order = display order). |
| `design_settings` | multi-picker | `{design:'grid'}` | see Notes | Chosen design + that design's layout options. |
| `container_type` | select | `''` | `''` `container` `container-fluid` | Outer width wrapper. |
| `click_action` | select | `'lightbox'` | `lightbox` `file` `attachment` `none` | Behavior on image click. |
| `captions` | select | `'none'` | `none` `hover` `below` | Show a caption per image. |
| `caption_source` | select | `'caption'` | `caption` `title` `alt` `description` | Which Media field feeds the caption. |
| `rounded` | select | `'rounded'` | `rounded-0` `rounded` `rounded-lg` `rounded-circle` | Image corner radius. |
| `hover_zoom` | switch | `'yes'` | `'yes'`\|`'no'` | Scale each image on hover. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Reusable Box Preset on each card. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |
| `caption_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Caption text color. |

## Ready-to-use example (the atts object)
```json
{
  "images": [
    { "attachment_id": "", "url": "https://example.com/1.jpg" },
    { "attachment_id": "", "url": "https://example.com/2.jpg" },
    { "attachment_id": "", "url": "https://example.com/3.jpg" }
  ],
  "design_settings": {
    "design": "grid",
    "grid": { "columns": { "count": "3", "3": {} }, "gap": "3", "ratio": "1-1" }
  },
  "container_type": "",
  "click_action": "lightbox",
  "captions": "none",
  "caption_source": "caption",
  "rounded": "rounded",
  "hover_zoom": "yes",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "caption_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `design_settings` is a **multi-picker**: `{ "design": "<slug>", "<slug>": { …that design's options… } }`. You only need the branch object for the chosen design; the safest generator emits the full set of branches (all defaulted) plus the active one — that's what the proven `gallery()` helper does. Designs: `grid` `masonry` `justified` `metro` `carousel` `polaroid` `showcase` `cards` `slideshow` `thumbslider` `coverflow` `marquee` `filmstrip` `spotlight` `honeycomb` `accordion` `flipcards` `stack`.
- **`grid` columns is nested** (a footer-style multi-picker): `columns: { "count": "3", "3": { } }`. For unequal/featured widths add `col_ratio` inside the count branch: `"3": { "col_ratio": [ { "w":25 }, { "w":50 }, { "w":25 } ] }` (ratios only for 2/3/4/6 columns; 5 and 1 are fixed equal). Other designs use a **plain** `columns: "3"` scalar.
- Common design fields: `gap` (Gap Scale slug, default `'3'` = 1rem), `ratio` (`1-1` `4-3` `3-2` `16-9` `3-4` `original`). Carousel-family designs add `per_view`, `carousel_autoplay`/`_interval`/`_loop`/`_arrows`/`_dots`/`_pause_hover` (switches as `'yes'`/`'no'`). Tablet/phone column counts are derived automatically.
- `images` is a **multi-upload** array of `{ attachment_id, url }`; leave `attachment_id:''` when generating from URLs. Captions/alt come from each image's Media Library fields (per `caption_source`), not from the atts.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
