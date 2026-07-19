# `icon` — Icon

A single standalone icon (font icon, Lucide SVG, emoji or custom SVG) with an optional tooltip/label. Leaf node: `{ type:'simple', shortcode:'icon', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `icon` | icon-v2 | see Notes | icon-v2 object | The glyph to display — the main content of the shortcode. |
| `title` | text | `''` | string | Optional hover tooltip; also the accessible label. Leave empty for decorative icons. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color behind the icon (`kind: bg`). |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Color applied to the title text (`kind: text`). |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon glyph color (font icons only, `kind: text`). |
| `icon_size` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Glyph size. Scales both font icons and inline SVGs. Empty = theme default. |

## Ready-to-use example (the atts object)
```json
{
  "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/star" },
  "title": "",
  "bg_color": { "predefined": "", "custom": "" },
  "title_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "icon_size": { "value": "", "unit": "px" }
}
```

## Notes
- `icon` uses the **icon-v2** shape. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`. No icon: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Emoji/custom SVG are other `type`s from the same picker.
- `icon_color` recolors font icons and `currentColor` SVGs; pasted emoji have fixed colors.
- `icon_size` normalises inline SVGs to `1em`, so one control resizes either icon kind.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
