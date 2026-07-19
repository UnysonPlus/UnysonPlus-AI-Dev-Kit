# `before_after` — Before / After

A two-image comparison: either the classic draggable before/after slider or a cursor-following circular "spotlight" reveal. Leaf node: `{ type:'simple', shortcode:'before_after', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `before_image` | upload | `''` | attachment id/URL | Base image. Comparison = the "before" side; Spotlight = what shows normally. |
| `after_image` | upload | `''` | attachment id/URL | Revealed image. Comparison = the "after" side; Spotlight = revealed under the cursor. |
| `type` | multi-picker | `{type:'comparison'}` | inline multi-picker (see below) | Chooses Comparison vs Spotlight and reveals that type's options. |
| `as_background` | section-background | see Notes | section-background object | Fill the parent Section and sit behind its content. Ignores Ratio / Max Width / Radius when on. |
| `ratio` | select | `'ratio-16-9'` | `original` `ratio-1-1` `ratio-4-3` `ratio-3-2` `ratio-16-9` `ratio-3-4` `ratio-2-3` | Crop both images to a consistent shape (object-fit cover). |
| `max_width` | text | `''` | e.g. `800px` / `80%` | Constrain width. Blank = full width. Ignored in background mode. |
| `rounded` | select | `'rounded'` | `rounded-0` `rounded` `rounded-lg` | Corner rounding. Ignored in background mode. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Base font size for the labels. |
| `divider_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Divider line color (Comparison only). |
| `handle_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Knob background (Comparison only, `kind: bg`). |
| `handle_icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Arrows inside the knob (Comparison only). |
| `label_bg` | color-preset | `{predefined:'',custom:''}` | compact color object | Before/After label background (Comparison only, `kind: bg`). |
| `label_text` | color-preset | `{predefined:'',custom:''}` | compact color object | Before/After label text (Comparison only). |

### `type` — Comparison fields (`choices.comparison`)
`design` (image-picker, registry-driven, default `classic`), `orientation` (select `horizontal` \| `vertical`, default `horizontal`), `interaction` (select `drag` \| `hover` \| `toggle`, default `drag`), `start_position` (slider 0–100, default `50`), `auto_intro` (switch, default `yes`), `handle_size` (select `sm` \| `md` \| `lg`, default `md`), `show_labels` (switch, default `yes`), `before_label` (text, default `Before`), `after_label` (text, default `After`).

### `type` — Spotlight fields (`choices.spotlight`)
`spotlight_radius` (slider 60–700, default `240`), `spotlight_softness` (slider 0–95, default `55`), `smooth_follow` (switch, default `yes`), `reveal_on_load` (switch idle reveal, default `yes`).

## Ready-to-use example (the atts object)
```json
{
  "before_image": "",
  "after_image": "",
  "type": {
    "type": "comparison",
    "comparison": {
      "design": "classic",
      "orientation": "horizontal",
      "interaction": "drag",
      "start_position": 50,
      "auto_intro": "yes",
      "handle_size": "md",
      "show_labels": "yes",
      "before_label": "Before",
      "after_label": "After"
    }
  },
  "ratio": "ratio-16-9",
  "max_width": "",
  "rounded": "rounded",
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `type` is an **inline multi-picker**: saved shape is `{ type:'comparison'|'spotlight', comparison:{…} | spotlight:{…} }`. Store the active type's fields under the matching key.
- Switches are string `'yes'`/`'no'`, not booleans.
- Use two images with the SAME dimensions/framing so they line up pixel-for-pixel; `ratio` crops both.
- `as_background` fills the parent Section — give the Section a min-height; the Ratio / Max Width / Radius options are then ignored.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. Divider/handle/label colors apply to Comparison only. See `README.md`.
