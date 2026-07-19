# `logo_grid` — Logo Grid

A set of client / partner logos arranged as a grid, boxed grid, carousel or marquee ticker — the "trusted by" strip. Leaf node: `{ type:'simple', shortcode:'logo_grid', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `logos` | addable-popup | `[]` | array of logo objects (see Notes) | The logos and their links. |
| `design` | image-picker | `'grid'` | `grid` `boxed` `carousel` `marquee` | Layout. |
| `columns` | select | `'4'` | `2` `3` `4` `5` `6` | Columns (grid) or visible logos (carousel/marquee). |
| `gap` | select | `'4'` | gap-scale slug | Space between logos. |
| `logo_height` | slider | `48` | 24–120 (px, step 2) | Logo height. |
| `grayscale` | switch | `'yes'` | `yes` \| `no` | Grayscale → color on hover. |
| `show_labels` | switch | `'no'` | `yes` \| `no` | Show each logo Name as a visible label. |
| `autoplay` | switch | `'yes'` | `yes` \| `no` | Carousel autoplay. |
| `speed` | select | `'normal'` | `slow` `normal` `fast` | Marquee / autoplay speed. |
| `direction` | select | `'left'` | `left` `right` | Marquee direction. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Label + `currentColor` SVG mark color (`kind: text`). |
| `box_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Box background (Boxed design, `kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "logos": [
    { "image": "", "svg": "", "name": "Acme", "no_label": "no", "link_url": "https://example.com", "link_target": "_blank" },
    { "image": "", "svg": "", "name": "Globex", "no_label": "no", "link_url": "", "link_target": "_blank" }
  ],
  "design": "grid",
  "columns": "4",
  "gap": "4",
  "logo_height": 48,
  "grayscale": "yes",
  "show_labels": "no",
  "autoplay": "yes",
  "speed": "normal",
  "direction": "left",
  "text_color": { "predefined": "", "custom": "" },
  "box_bg": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Each `logos` item: `image` (attachment) OR `svg` (raw inline `<svg>` markup — takes priority, use `fill="currentColor"` so `text_color` applies); `name` (alt / label); `no_label` (`yes`|`no` — suppress this logo's text label when Show Names is on); `link_url`; `link_target` (`_blank`|`_self`, default `_blank`).
- `carousel` uses the vendored Splide slider; `marquee` is a continuous CSS ticker.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
