# `blockquote` — Blockquote

A styled pull-quote with optional author, role/source, source link, and a decorative quote mark. Leaf node: `{ type:'simple', shortcode:'blockquote', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `quote` | textarea | `'Design is not just what it looks like and feels like. Design is how it works.'` | string (basic inline HTML allowed) | The quote text. |
| `author` | text | `''` | string | Who said it (optional). |
| `role` | text | `''` | string | Author role / source, e.g. "CEO, Acme" or a book title (optional). |
| `source_url` | text | `''` | URL | Makes the author a link (optional). |
| `show_mark` | switch | `'yes'` | `'yes'` \| `'no'` | Show the decorative quote mark. |
| `design` | image-picker | `'classic'` | registry-driven (e.g. `classic`, plus skins) | Quote visual treatment. Choices from `views/parts/registry.php`. |
| `align` | alignment | `'left'` | `left` `center` `right` | Text alignment. |
| `max_width` | text | `''` | e.g. `700px` | Constrain width. Blank = full width. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Card border/shadow/fill preset. |
| `quote_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Quote text color. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Border / quote mark accent (`kind: bg`). |
| `author_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Author text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "quote": "Simplicity is the ultimate sophistication, and the hardest thing to get right.",
  "author": "Ada Reynolds",
  "role": "Head of Design, Northwind",
  "source_url": "",
  "show_mark": "yes",
  "design": "classic",
  "align": "left",
  "max_width": "",
  "quote_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" },
  "author_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `show_mark` is string `'yes'`/`'no'`, not a boolean.
- `quote` allows basic inline HTML (bold, italic, links) but no block markup.
- `design` choices are registry-driven; `classic` is the default.
- `box_style` uses the card box-style picker (same family as `icon_box`'s `box_style`); leave the default for the design's own styling.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
