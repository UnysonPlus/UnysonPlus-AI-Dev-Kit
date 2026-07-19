# `tabs` — Tabs

A horizontal or vertical tabbed-content widget; each tab has a title and a body panel. Leaf node: `{ type:'simple', shortcode:'tabs', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `tabs` | addable-popup | `[]` | array of `{ tab_title, tab_content, badge, is_active }` | The tab entries, rendered in order. |
| `tabs[].tab_title` | text | `''` | string | Label on the clickable tab button. |
| `tabs[].tab_content` | wp-editor | `''` | HTML string | Panel body shown when the tab is selected. |
| `tabs[].badge` | text | `''` | string | Optional small pill beside the title (e.g. "Save 20%"). |
| `tabs[].is_active` | switch | `'no'` | `yes` \| `no` | Marks the tab open on load. If several are `yes`, the first wins. |
| `tab_style` | select | `'tabs'` | `tabs` `pills` `underline` `segmented` | Nav style. `segmented` is a compact toggle switcher. |
| `justified` | switch | `'no'` | `yes` \| `no` | Stretch tab buttons to fill the container width. |
| `alignment` | select | `'start'` | `start` `center` `end` | Horizontal alignment of the tab nav (ignored when justified). |
| `orientation` | select | `'horizontal'` | `horizontal` `vertical` | Tabs above content, or beside it in a side column. |
| `fade` | switch | `'no'` | `yes` \| `no` | Soft cross-fade between panels instead of an instant swap. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `tab_title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tab nav-button text color. |
| `tab_content_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Tab panel body text color. |

## Ready-to-use example (the atts object)
```json
{
  "tabs": [
    { "tab_title": "Overview", "tab_content": "<p>A quick summary of what this section covers.</p>", "badge": "", "is_active": "yes" },
    { "tab_title": "Details", "tab_content": "<p>Deeper information for readers who want more.</p>", "badge": "", "is_active": "no" },
    { "tab_title": "Pricing", "tab_content": "<p>Plans and what each one includes.</p>", "badge": "New", "is_active": "no" }
  ],
  "tab_style": "tabs",
  "justified": "no",
  "alignment": "start",
  "orientation": "horizontal",
  "fade": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "tab_title_color": { "predefined": "", "custom": "" },
  "tab_content_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `tab_content` is a WYSIWYG (`wp-editor`) field — keep it plain semantic HTML with no classes on `<p>`/`<li>` (see `text-block.md`).
- `is_active` is per-item, not a global setting. Set exactly one entry to `yes`; if none is set the first tab opens by default.
- `orientation: vertical` uses horizontal space for the nav sidebar — place it in a wide enough column.
- `segmented` and `underline` styles suit a Monthly / Yearly-style toggle and quiet editorial strips respectively.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
