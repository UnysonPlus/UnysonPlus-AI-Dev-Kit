# `bleed_section` — Bleed Section

A split section: content on one side and a full-bleed image on the other that extends to the viewport edge. Leaf node: `{ type:'simple', shortcode:'bleed_section', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `bleed_image` | upload | `''` | image upload object (images only) | Image that fills one half and bleeds to the viewport edge. Served responsively (srcset) when a Media-Library attachment id is present. |
| `bleed_image_alt` | text | `''` | plain text | Alt-text override. Blank = the media item's own alt; empty = decorative. |
| `bleed_image_side` | select | `'right'` | `right` `left` | Which side the image sits on (desktop). |
| `bleed_image_ratio` | select | `'5-7'` | `1-11` `2-10` `3-9` `4-8` `5-7` `6-6` `7-5` `8-4` `9-3` `10-2` `11-1` | Image vs. content column split (each pair sums to 12). |
| `bleed_image_position` | select | `'center'` | `center` `top` `bottom` `left` `right` `left top` `right top` `left bottom` `right bottom` | Which part stays visible when the image is cropped to fill. |
| `bleed_image_lazy` | switch | `'no'` | `'yes'` \| `'no'` | Lazy-load the image. Off (default) = eager, best when the section is near the top (LCP). |
| `bleed_mobile_stacking` | select | `'content-first'` | `content-first` `image-first` | Which half comes first when stacked on mobile. |
| `bleed_min_height` | select | `'none'` | `none` `sm` (40vh) `md` (60vh) `lg` (80vh) `full` (100vh) | Minimum section height, to read as a hero even with short content. |
| `is_fullwidth` | switch | `false` | `true` \| `false` | On: content side uses the full-width container. Off: standard site container width. |
| `background` | background-pro | `''` | background-pro object | Background for the CONTENT side (color / gradient / image); bleeds to the viewport edge behind the content. |
| `bleed_overlay_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind: bg`) | Tint/scrim laid over the bleed image. |
| `bleed_overlay_opacity` | slider | `0` | `0`–`100` (step 5) | Overlay opacity; only used when `bleed_overlay_color` is set. |
| `bleed_vertical_align` | select | `'align-items-center'` | `align-items-start` `align-items-center` `align-items-end` | Vertical alignment of the content within the section (pairs with `bleed_min_height`). |
| `bleed_content_padding` | select | `'3rem'` | `0` `2rem` `3rem` `5rem` | Vertical padding above/below the content (None / Small / Medium / Large). |

## Ready-to-use example (the atts object)
```json
{
  "bleed_image": { "url": "https://example.com/wp-content/uploads/panel.jpg", "attachment_id": "" },
  "bleed_image_alt": "",
  "bleed_image_side": "right",
  "bleed_image_ratio": "5-7",
  "bleed_image_position": "center",
  "bleed_image_lazy": "no",
  "bleed_mobile_stacking": "content-first",
  "bleed_min_height": "none",
  "is_fullwidth": false,
  "background": "",
  "bleed_overlay_color": { "predefined": "", "custom": "" },
  "bleed_overlay_opacity": 0,
  "bleed_vertical_align": "align-items-center",
  "bleed_content_padding": "3rem"
}
```

## Notes
- The image ALWAYS bleeds to the viewport edge regardless of `is_fullwidth`; only the content side's container width changes.
- `bleed_image_ratio` values are column pairs summing to 12; there is no free-form ratio — pick the nearest preset.
- `background` (background-pro) styles the CONTENT half, not the image half — the image half is `bleed_image`.
- Use a high-resolution `bleed_image`: it is cropped `cover` to its half, so edge detail may be trimmed depending on the ratio; steer the crop with `bleed_image_position`.
- On mobile the two halves stack; `bleed_mobile_stacking` decides which one appears first.
- `bleed_min_height` makes it a hero; combine with `bleed_vertical_align` to position the content within the taller section.
- `bleed_overlay_color` + `bleed_overlay_opacity` darken/tint the image (e.g. for a caption or brand wash over it).
```
