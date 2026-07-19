# `image_box` — Image Box

An image paired with an optional eyebrow, title, text, icon and button — a portfolio tile, team card, feature box or hover-overlay panel. The look is chosen with a Design **family** picker (Stacked / Side / Overlay / Card / Frame), each revealing its own variation fields. Leaf node: `{ type:'simple', shortcode:'image_box', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | attachment object | The box image. |
| `image_alt` | text | `''` | string | Alt override. Empty = media-library alt. |
| `subtitle` | text | `''` | string | Small eyebrow line above the title. |
| `title` | text | `''` | string | Main heading. Empty = image-only box. |
| `title_tag` | select | `'h3'` | `h2` `h3` `h4` `h5` `h6` `span` `p` | Semantic tag for the title. |
| `text` | wp-editor | `''` | HTML string (WYSIWYG) | Optional description below the title. |
| `icon` | icon-v2 | see Notes | icon-v2 object | Optional icon (over image / above title). |
| `custom_icon` | hidden | `''` | legacy string | Retired; leave `''`. |
| `button_style` | select | `'none'` | `none` `button` `link` `arrow` | CTA render style under the text. |
| `button_label` | text | `'Read More'` | string | Label on the button/link. |
| `design_settings` | multi-picker (popover) | `{family:'stacked'}` | `{ family, <family>:{…} }` | Design family + its variation sub-options (see Notes). |
| `image_ratio` | select | `'ratio-4-3'` | `original` `ratio-1-1` `ratio-4-3` `ratio-3-2` `ratio-16-9` `ratio-3-4` `ratio-2-3` | Force the image to a fixed crop. |
| `content_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Align eyebrow/title/text/button. |
| `image_size` | short-select | `'full'` | `full` `large` `medium` `small` `xsmall` | Image size (image-top families). |
| `image_mask` | multi-picker | `{mask:'none'}` | mask key + `custom` reveal | Clip the image to a shape (see Notes). |
| `hover_effect` | select | `'zoom-in'` | `none` `zoom-in` `zoom-out` `grayscale` `blur` `shine` `lift` `tilt` | Hover motion / image effect. |
| `transition_speed` | select | `'normal'` | `fast` `normal` `slow` | Hover transition speed. |
| `link_behavior` | select | `'none'` | `none` `url` `lightbox` `video` | What a click does. |
| `link_url` | text | `''` | URL | Used by `url` / `video` behaviors. |
| `link_target` | switch | `'_self'` | `_blank` \| `_self` | Open URL in a new tab. |
| `box_style` | box-style picker | see Notes | box-preset object | Card border/shadow/fill preset. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Box background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `subtitle_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Eyebrow color. |
| `content_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Body text color. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon color (font icons only). |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Button / arrow / frame accent (`kind: bg`). |

## Ready-to-use example (the atts object)
```json
{
  "image": "",
  "image_alt": "",
  "subtitle": "Case Study",
  "title": "Project California",
  "title_tag": "h3",
  "text": "A short description shown below the title.",
  "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "custom_icon": "",
  "button_style": "arrow",
  "button_label": "View Project",
  "design_settings": { "family": "stacked", "stacked": { "stacking": "img-title-text" } },
  "image_ratio": "ratio-4-3",
  "content_align": "",
  "image_size": "full",
  "image_mask": { "mask": "none" },
  "hover_effect": "zoom-in",
  "transition_speed": "normal",
  "link_behavior": "url",
  "link_url": "https://example.com/project",
  "link_target": "_self",
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "title_color": { "predefined": "", "custom": "" },
  "subtitle_color": { "predefined": "", "custom": "" },
  "content_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `design_settings` is a **popover multi-picker** keyed by family. Each family reveals its own sub-object: `stacked` → `{ stacking }` (`img-title-text` `title-img-text` `title-text-img` `text-img-title`); `side` → `{ image_side:'left'|'right', panel:'yes'|'no', media_width:'33'|'40'|'50'|'60' }`; `overlay` → `{ reveal, overlay_color, overlay_opacity }` (reveal: `scrim` `cover` `overlap` `bar` `fade` `slide` `center` `frame`); `card` → `{ style:'card'|'caption-below' }`; `frame` → `{ style:'polaroid'|'postcard'|'badge'|'photo-stack' }`.
- `image_mask` is a multi-picker; masks include `rounded` `circle` `squircle` `arch` `hexagon` `star` `heart` … and `custom` (which reveals `custom_svg` / `custom_upload` / `custom_clip`). Shape masks force a square crop.
- `icon` uses the **icon-v2** shape (see `icon-box.md`). `text` is WYSIWYG — keep it clean semantic HTML with no classes on `<p>`/`<li>`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
