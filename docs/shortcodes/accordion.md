# `accordion` — Accordion / FAQ
A stack of collapsible title+panel items — the standard FAQ / expandable-list element, with optional FAQ rich-snippet schema. Leaf node: `{ type:'simple', shortcode:'accordion', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `tabs` | addable-popup | `[]` | array of `{ tab_title, tab_content, is_open }` | The accordion items. Each row = one collapsible panel; add at least one. |
| `title_tag` | select | `'h3'` | `h2` `h3` `h4` `h5` `h6` | Semantic heading level for every item title. |
| `icon_style` | select | `'plus-minus'` | `plus-minus` `plus-x` `chevron` `arrow` `none` `custom` | Toggle indicator icon. |
| `icon_position` | select | `'left'` | `left` `right` | Icon side within the title bar. |
| `icon_closed_image` | upload | `''` | upload object | Custom closed-state image (Icon Style `custom`). |
| `icon_open_image` | upload | `''` | upload object | Custom open-state image (Icon Style `custom`). |
| `icon_closed_text` | short-text | `'+'` | string / emoji | Closed-state text glyph when no custom image. |
| `icon_open_text` | short-text | `'−'` | string / emoji | Open-state text glyph when no custom image. |
| `numbering` | multi-picker | `{style:'none'}` | picker `style`: `none` `decimal` `decimal-leading-zero` `lower-alpha` `upper-alpha` `lower-roman` `upper-roman` `q-prefix` `custom` | Prefix each title with a number/letter; `custom` reveals `template`. |
| `numbering_start` | short-text | `'1'` | integer string | Number assigned to the first item. |
| `item_spacing` | spacing preset (`sc_spacing_field`) | preset default | `mb-*` preset slug | Vertical gap between items (margin-bottom). |
| `title_alignment` | select | `'left'` | `left` `center` `right` | Alignment of the title row. |
| `initially_open` | select | `'first'` | `first` `none` `all` | Which panels are expanded on load. |
| `collapsible` | switch | `'no'` | `'yes'` \| `'no'` | Allow all panels to be closed at once. |
| `multiple_open` | switch | `'no'` | `'yes'` \| `'no'` | Allow more than one panel open at a time. |
| `hash_linking` | switch | `'yes'` | `'yes'` \| `'no'` | Auto-open item matching URL hash; update hash on toggle. |
| `show_expand_collapse_all` | switch | `'no'` | `'yes'` \| `'no'` | Render Expand All / Collapse All buttons above. |
| `faq_schema` | switch | `'no'` | `'yes'` \| `'no'` | Output FAQPage JSON-LD structured data. |
| `accordion_style` | image-picker | `'bordered'` | `bordered` `separated` `flush` `filled` `ghost` | Overall visual language. |
| `corner_radius` | select | `'md'` | `none` `sm` `md` `lg` | Corner roundness. |
| `elevation` | select | `'none'` | `none` `subtle` `raised` | Drop-shadow depth. |
| `active_accent` | compact color | `{predefined:'',custom:''}` | compact color (`kind: bg`) | Accent for the open item (underline + tint). |
| `title_hover` | switch | `'yes'` | `'yes'` \| `'no'` | Shade a title bar on hover. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `tab_title_color` | compact color | `{predefined:'',custom:''}` | compact color | Title text color. |
| `title_bg_color` | compact color | `{predefined:'',custom:''}` | compact color (`kind: bg`) | Title bar background. |
| `tab_content_color` | compact color | `{predefined:'',custom:''}` | compact color | Panel body text color. |
| `content_bg_color` | compact color | `{predefined:'',custom:''}` | compact color (`kind: bg`) | Panel body background. |
| `icon_closed_color` | compact color | `{predefined:'',custom:''}` | compact color | Toggle icon color, closed state. |
| `icon_open_color` | compact color | `{predefined:'',custom:''}` | compact color | Toggle icon color, open state. |

## Ready-to-use example (the atts object)
```json
{
  "tabs": [
    { "tab_title": "How do I get a refund?", "tab_content": "<p>Contact support within 30 days for a full refund.</p>", "is_open": "no" },
    { "tab_title": "Do you offer a free trial?", "tab_content": "<p>Yes — 14 days, no card required.</p>", "is_open": "no" }
  ],
  "title_tag": "h3",
  "icon_style": "plus-minus",
  "icon_position": "right",
  "numbering": { "style": "none" },
  "numbering_start": "1",
  "title_alignment": "left",
  "initially_open": "first",
  "collapsible": "no",
  "multiple_open": "no",
  "hash_linking": "yes",
  "show_expand_collapse_all": "no",
  "faq_schema": "yes",
  "accordion_style": "bordered",
  "corner_radius": "md",
  "elevation": "none",
  "active_accent": { "predefined": "", "custom": "" },
  "title_hover": "yes",
  "font_size_preset": "",
  "tab_title_color": { "predefined": "", "custom": "" },
  "tab_content_color": { "predefined": "", "custom": "" }
}
```

## Notes
- Switch values are the string `'yes'` / `'no'`, not booleans (the per-item `is_open` too).
- `tab_content` is WYSIWYG — keep it plain semantic HTML with no classes on `<p>`/`<li>` (see `text-block.md`).
- `numbering` is a multi-picker: the saved shape is `{ style:'<choice>' }`, and for `custom` it adds `{ custom:{ template:'Q{n}' } }` (tokens `{n}` `{0n}` `{a}`/`{A}` `{i}`/`{I}`).
- Enable `faq_schema` on only ONE genuine Q&A accordion per page to avoid duplicate FAQ schema.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
