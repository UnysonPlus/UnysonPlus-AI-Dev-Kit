# `image_content` — Image + Content

An image and a WYSIWYG content block side by side (or stacked) — the classic zig-zag "media + copy" row. Leaf node: `{ type:'simple', shortcode:'image_content', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | attachment object | The image shown beside/above the content. |
| `content` | wp-editor | `''` | HTML string (accepts shortcodes) | The text content — can nest headings/buttons. |
| `image_link` | text | `''` | URL | Optional link wrapping the image. |
| `image_link_target` | switch | `'_self'` | `_blank` \| `_self` | Open the image link in a new tab. |
| `layout` | image-picker | `'image-left'` | `image-left` `image-right` `image-top` | Image position relative to content. |
| `column_ratio` | column-split | `'1/3'` | fraction string (image share of 12) | Image / content split (Image Left/Right layouts). |
| `vertical_align` | image-picker | `'align-items-center'` | `align-items-start` `align-items-center` `align-items-end` | Vertical alignment within the row. |
| `content_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal alignment of the content. |
| `gap` | short-select | `'4'` | gap-scale slug (`''` = default) | Gutter between image and content. |
| `mobile_order` | select | `'image-first'` | `image-first` `content-first` | Which column stacks first on mobile. |
| `breakpoint` | select | `'md'` | `sm` `md` `lg` | Width below which the two stack. |
| `stack_image_width` | unit-input | `{value:'',unit:'px'}` | units `px % rem` | Image Top only — cap image width. |
| `stack_image_align` | alignment | `'center'` | `left` `center` `right` | Image Top only — image alignment. |
| `image_fit` | select | `'contain'` | `contain` `cover` | How the image fills its column. |
| `image_ratio` | select | `''` | `''` `1x1` `4x3` `3x2` `16x9` `3x4` | Force a fixed aspect-ratio box. |
| `image_radius` | select | `'rounded-0'` | `rounded-0` `rounded-2` `rounded-3` `rounded-4` `rounded-circle` | Image corner radius. |
| `image_shadow` | select | `''` | `''` `shadow-sm` `shadow` `shadow-lg` | Image drop shadow. |
| `content_max_width` | unit-input | `{value:'',unit:'ch'}` | units `ch px rem em %` | Cap the content width for readability. |
| `content_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Body content color. |
| `content_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Background behind the content (`kind: bg`). |
| `content_padding` | spacing (padding) | see README | spacing object | Inner padding of the content panel. |

## Ready-to-use example (the atts object)
```json
{
  "image": "",
  "content": "<h2>A headline beside the image</h2><p>Supporting copy that explains the feature.</p>",
  "image_link": "",
  "image_link_target": "_self",
  "layout": "image-left",
  "column_ratio": "1/2",
  "vertical_align": "align-items-center",
  "content_align": "",
  "gap": "4",
  "mobile_order": "image-first",
  "breakpoint": "md",
  "stack_image_width": { "value": "", "unit": "px" },
  "stack_image_align": "center",
  "image_fit": "cover",
  "image_ratio": "4x3",
  "image_radius": "rounded-3",
  "image_shadow": "shadow",
  "content_max_width": { "value": "", "unit": "ch" },
  "content_color": { "predefined": "", "custom": "" },
  "content_bg": { "predefined": "", "custom": "" }
}
```

## Notes
- `column_ratio` stores the IMAGE's column span as a fraction of 12 (e.g. `1/3`, `1/2`) — snap-stops are twelfths plus fifths, capped at `11/12`. Applies to the Image Left/Right layouts; `layout` picks which side.
- `content` is WYSIWYG and accepts nested shortcodes — keep it clean semantic HTML with no classes on `<p>`/`<li>`.
- `content_bg` + `content_padding` turn the text side into a tinted card panel.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
