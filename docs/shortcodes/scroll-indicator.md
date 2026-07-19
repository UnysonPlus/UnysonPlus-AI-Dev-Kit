# `scroll_indicator` — Scroll Indicator

A hero "scroll to descend" cue — a small label plus an animated chevron that smooth-scrolls to the next section on click. Leaf node: `{ type:'simple', shortcode:'scroll_indicator', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `text` | text | `'Scroll to descend'` | string | The cue label. Empty = icon-only cue. |
| `icon` | icon-v2 | see Notes | icon-v2 object | The cue glyph. Left as `none` → a default chevron-down. |
| `target` | text | `''` | anchor (e.g. `#mission`) | On-page target to smooth-scroll to. Empty = scroll down ~90% of the viewport. |
| `layout` | select | `'stacked'` | `stacked` (label above icon) `stacked-reverse` (icon above label) `inline` `icon-only` | Label / icon arrangement. |
| `animation` | select | `'bounce'` | `bounce` `pulse` `nudge` `none` | How the icon animates. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Label color. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon color. |
| `icon_size` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Icon / chevron size (scales font icons and inline SVGs). |

## Ready-to-use example (the atts object)
```json
{
  "text": "Scroll to descend",
  "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "target": "#next-section",
  "layout": "stacked",
  "animation": "bounce",
  "text_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "icon_size": { "value": "", "unit": "px" }
}
```

## Notes
- Leaving `icon` as `type:'none'` renders a default `lucide/chevron-down`. To set a specific Lucide glyph use `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/chevron-down" }` — the icon-v2 shape (see `icon-box.md`).
- With an empty `target` the cue scrolls the viewport down ~90%; with an `#id` it smooth-scrolls to that element. Point `target` at the next section's Advanced → CSS ID.
- The label is always first in the DOM for accessibility; `stacked-reverse` flips only the visual order via CSS.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
