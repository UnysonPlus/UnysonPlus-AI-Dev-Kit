# `text_block` — Text Block

A rich-text (WYSIWYG) content block with color, size, alignment, column, drop-cap and readability controls. Leaf node: `{ type:'simple', shortcode:'text_block', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `text` | wp-editor | `''` | HTML string (WYSIWYG) | The block's rich-text content. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object (see `README.md`) | Body text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Block background color. |
| `link_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Color for links inside the block. |
| `font_size_preset` | font-size preset | `''` | preset slug (see `README.md`) | Named body font-size preset. |
| `text_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Horizontal text alignment (output as `text-*` class). |
| `max_width` | multi-picker | `{preset:'full'}` | see Notes | Constrain block width for readability. |
| `columns` | select | `'1'` | `'1'` `'2'` `'3'` | Flow text into newspaper columns. |
| `balance` | switch | `'no'` | `yes` \| `no` | CSS `text-wrap: balance` to even out line lengths. |
| `line_height` | select | `''` | `''` `tight` `snug` `normal` `relaxed` `loose` | Line height (class on wrapper). |
| `para_spacing` | select | `''` | `''` `sm` `md` `lg` | Vertical gap between paragraphs. |
| `lead` | switch | `'no'` | `yes` \| `no` | Enlarge the first paragraph as a lead-in. |
| `link_underline` | select | `''` | `''` `always` `hover` `none` | Underline behavior for links. |
| `dropcap` | multi-picker | `'no'` (see Notes) | `'no'` or full object | Drop-cap on the first paragraph. |

## Ready-to-use example (the atts object)
```json
{
  "text": "<p>Streamline operations, connect your teams, and make confident decisions every day.</p>",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "link_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "text_align": "center",
  "max_width": { "preset": "read" },
  "columns": "1",
  "balance": "no",
  "line_height": "",
  "para_spacing": "",
  "lead": "no",
  "link_underline": "",
  "dropcap": "no"
}
```

## Notes
- `text` is **WYSIWYG HTML** — use plain semantic tags (`<p>`, `<ul>`/`<li>`, `<a>`, `<em>`, `<strong>`). **Do NOT put `class="…"` on `<p>` / `<li>`** inside the editor content (keeps the DOM clean); to attach a class use the block's CSS Class (`common.css_class`) and split into multiple `text_block`s when you need separately-classed wrappers.
- `max_width` is a **multi-picker**. Preset shape: `{ "preset": "full" }` where preset ∈ `full` `narrow` `read` `medium` `wide` `custom`. For `custom`, add the revealed field: `{ "preset": "custom", "custom": { "custom_width": { "value": "680", "unit": "px" } } }` (units `px rem em % ch vw`).
- `dropcap` is a **multi-picker**. Off = the string `"no"` (or `{ "enabled": "no" }`). On = `{ "enabled": "yes", "dropcap_style": "dropped|accent|boxed|outline", "dropcap_font": "", "dropcap_lines": 3, "dropcap_chars": 1, "dropcap_gap": "md", "dropcap_color": { "predefined": "", "custom": "" } }`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- Prefer the Styling atts (`text_color`, `font_size_preset`, `text_align`) over inline HTML styling so the block stays theme-consistent.
