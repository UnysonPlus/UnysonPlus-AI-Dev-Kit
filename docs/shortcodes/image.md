<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
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
| `image_ratio` | select | `''` | `''` (original) · `1/1` `4/3` `3/2` `16/9` `3/4` `2/3` `9/16` | Crop into a fixed ratio box. |
| `image_fit` | select | `'cover'` | `cover` `contain` | Cover crops to fill; Contain fits the whole image. Only with `image_ratio`. |
| `focal_position` | select | `'center center'` | `left top` … `right bottom` (9 positions) | Which part to keep when cropping. Only with Fit = Cover. |
| `image_style` | image-style-picker | `''` | `''` (none) · `imgs-rounded` · `imgs-circle` · `imgs-portrait-card` · `imgs-monochrome` · `imgs-duotone` · `imgs-diagonal` · `imgs-hexagon` · `imgs-cinematic` | Preset visual treatment (shape / filter) applied to the image. |

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
- **Ratio crops are real files (server-side):** with `image_ratio` + Fit = Cover on an attachment, `fw_image_tag()` calls `fw_image_crop_renditions()` (`framework/includes/image-crops.php`), which cuts the ratio out of the original around `focal_position` and saves it at 320 / 480 / 640 / 768 / 960 / 1280 / 1600 px (never upscaled; the crop's own width is always included) in `uploads/unysonplus/image-crops/`. The `<img>` gets that `srcset` with `sizes="auto, 100vw"` (lazy) so each device downloads only what it shows. Files are made on first view, re-made when the original or the crop changes, and deleted with the attachment. Filter the widths with `fw_image_crop_widths`; the CSS `aspect-ratio`/`object-fit` stays as a fallback (SVG, plain URL, no image editor). With the Asset Optimizer's *Serve WebP images* on, each crop also gets a WebP copy.
- `target` stores the literal `'_blank'`/`'_self'` (not a boolean). For external hosts use `'_blank'`.
- `fetchpriority:'high'` only for the hero/first image; use `'auto'` further down the page.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
