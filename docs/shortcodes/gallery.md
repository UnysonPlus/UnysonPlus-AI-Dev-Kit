# `gallery` — Gallery

A multi-image gallery with 20+ layout designs (grid, masonry, carousel, coverflow, …), lightbox, captions and per-card box styling. Leaf node: `{ type:'simple', shortcode:'gallery', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | multi-picker | `{kind:'media'}` | see Notes | Where the images come from — **Media Library** (`media`, you pick them) or a **Post Type** (`posts`, featured images pulled automatically). |
| `design_settings` | multi-picker | `{design:'grid'}` | see Notes | Chosen design + that design's layout options. |
| `container_type` | select | `''` | `''` `container` `container-fluid` | Outer width wrapper. |
| `click` | multi-picker | `{action:'lightbox'}` | `lightbox` `link` `file` `attachment` `none` | What happens on image click. `link` uses each image's Media-Library URL (external hosts open a new tab automatically). |
| `captions` | select | `'none'` | `none` `hover` `below` | Show a caption per image. |
| `caption_source` | select | `'caption'` | `caption` `title` `alt` `description` | Which Media field feeds the caption. |
| `image_style` | image-style-picker | `''` | `''` (none) · `imgs-rounded` · `imgs-circle` · `imgs-portrait-card` · `imgs-monochrome` · `imgs-duotone` · `imgs-diagonal` · `imgs-hexagon` · `imgs-cinematic` | Preset visual treatment (shape / filter) applied to each image. Replaces the old `rounded` corner select. |
| `hover_zoom` | switch | `'yes'` | `'yes'`\|`'no'` | Scale each image on hover. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Reusable Box Preset on each card. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |
| `caption_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Caption text color. |

## Ready-to-use example (the atts object)
```json
{
  "source": {
    "kind": "media",
    "media": { "images": [
      { "attachment_id": "", "url": "https://example.com/1.jpg" },
      { "attachment_id": "", "url": "https://example.com/2.jpg" },
      { "attachment_id": "", "url": "https://example.com/3.jpg" }
    ] },
    "posts": { "post_type": "post", "count": "12", "orderby": "date_desc" }
  },
  "design_settings": {
    "design": "grid",
    "grid": { "columns": { "count": "3", "3": {} }, "gap": "3", "ratio": "1-1" }
  },
  "container_type": "",
  "click": { "action": "lightbox" },
  "captions": "none",
  "caption_source": "caption",
  "image_style": "",
  "hover_zoom": "yes",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "caption_color": { "predefined": "", "custom": "" }
}
```

## Site Converter — automatic design detection

The deterministic Site Converter **classifies the source image gallery and picks the closest design** (`FW_Site_Converter_Stitch::detect_gallery_design()`), instead of always emitting the uniform Grid. Conservative — high-confidence structural signals only, else a safe Grid fallback (which still carries the source col-spans as a per-column ratio, so a featured tile stays wider):

| source signal (class / markup) | → design emitted |
|---|---|
| `marquee` / `animate-marquee` / an infinite-scroll animation | `marquee` |
| a slider lib (`swiper`/`slick`/`embla`/`splide`/…), `role[description]=carousel`, `snap-x`, `overflow-x-auto` | `carousel` (`per_view` from item count) |
| `columns-1..6` / `masonry` (CSS multi-column wall) | `masonry` (+ `columns.count`) |
| a grid whose tiles carry VERTICAL spans (`row-span-2…`) — a true bento mosaic | `metro` (+ `columns.count`) |
| a plain image grid (or horizontal col-spans only) | `grid` (col-spans → `col_ratio`) |

Only the chosen `design` + its column/`per_view` count are set; the shortcode fills the rest from its own defaults. `justified`, `coverflow`, `filmstrip`, `slideshow`, `thumbslider`, `spotlight`, `honeycomb`, `polaroid`, `showcase`, `cards`, `accordion`, `flipcards`, `stack` are not auto-selected (they overlap too much with grid/masonry/carousel to detect deterministically) and fall back to `grid`/`masonry`/`carousel`.

## Notes
- `design_settings` is a **multi-picker**: `{ "design": "<slug>", "<slug>": { …that design's options… } }`. You only need the branch object for the chosen design; the safest generator emits the full set of branches (all defaulted) plus the active one — that's what the proven `gallery()` helper does. Designs: `grid` `masonry` `justified` `metro` `carousel` `polaroid` `showcase` `cards` `slideshow` `thumbslider` `coverflow` `marquee` `filmstrip` `spotlight` `honeycomb` `accordion` `flipcards` `stack`.
- **`grid` columns is nested** (a footer-style multi-picker): `columns: { "count": "3", "3": { } }`. For unequal/featured widths add `col_ratio` inside the count branch: `"3": { "col_ratio": [ { "w":25 }, { "w":50 }, { "w":25 } ] }` (ratios only for 2/3/4/6 columns; 5 and 1 are fixed equal). Other designs use a **plain** `columns: "3"` scalar.
- Common design fields: `gap` (Gap Scale slug, default `'3'` = 1rem), `ratio` (`1-1` `4-3` `3-2` `16-9` `3-4` `original`). Carousel-family designs add `per_view`, `carousel_autoplay`/`_interval`/`_loop`/`_arrows`/`_dots`/`_pause_hover` (switches as `'yes'`/`'no'`). Tablet/phone column counts are derived automatically.
- **`source` is a multi-picker.** `media` branch → `source.media.images` is a **multi-upload** array of `{ attachment_id, url }` (leave `attachment_id:''` when generating from URLs). `posts` branch → `source.posts` = `{ post_type, count, orderby }` builds the gallery from a post type's featured images automatically (stays fresh as you publish; only posts WITH a featured image are included). Captions/alt come from each image's Media Library fields (per `caption_source`), not from the atts.
- **`click` is a multi-picker** (`{ action }`): `lightbox` · `link` (uses each image's Media-Library URL — external hosts open a new tab automatically) · `file` (full image, new tab) · `attachment` (attachment page) · `none`. It replaces the old scalar `click_action`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
