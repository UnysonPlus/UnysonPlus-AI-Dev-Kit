# `text_expander` — Text Expander

An inline "read more / read less" toggle that hides part of a paragraph behind a button. Leaf node: `{ type:'simple', shortcode:'text_expander', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `visible_content` | wp-editor | `''` | HTML string | Always-visible content. In Merge mode, only the LAST paragraph stitches to hidden. |
| `hidden_content` | wp-editor | `''` | HTML string | Revealed on Show More. In Merge mode, only the FIRST paragraph stitches to visible. |
| `btn_show` | text | `'Show More'` | string | Collapsed-state label. Use `{count}` to insert the hidden word/char count. |
| `btn_hide` | text | `'Show Less'` | string | Expanded-state label. Same `{count}` token. |
| `show_btn_position` | image-picker | `'inline'` | `inline` `block_left` `block_center` `block_right` | Where the Show More button sits. |
| `hide_btn_position` | image-picker | `'inherit'` | `inherit` `inline` `block_left` `block_center` `block_right` | Show Less placement. `inherit` = match above, after expanded text. |
| `merge_boundary` | switch | `'no'` | `yes` \| `no` | Stitch the last visible + first hidden paragraph into one `<p>`. |
| `show_ellipsis` | switch | `'no'` | `yes` \| `no` | Append `…` via CSS while collapsed (a11y-safe). |
| `count_mode` | select | `'none'` | `none` `words` `chars` | Append a count to the button labels (drives `{count}`). |
| `click_anywhere` | switch | `'no'` | `yes` \| `no` | Make the whole visible region clickable to expand. |
| `native_details` | switch | `'no'` | `yes` \| `no` | Render as native `<details>`/`<summary>`. Overrides button position, icon, animation, click-anywhere, count. |
| `btn_color` | color-picker | `''` | hex / rgba string | Free-form color for both buttons. Overridden by the preset button colors. |
| `visible_color` / `hidden_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Color presets for the visible / hidden paragraphs. |
| `btn_show_color` / `btn_hide_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Preset per button; overrides `btn_color`. |
| `toggle_icon` | select | `'none'` | `none` `chevron` `plus-minus` | Icon next to the label. Chevron rotates on expand. Bypassed in native mode. |
| `initially_open` | switch | `'no'` | `yes` \| `no` | Render expanded on first paint (maps to `[open]` in native mode). |

## Ready-to-use example (the atts object)
```json
{
  "visible_content": "<p>Our platform brings your whole workflow into one place.</p>",
  "hidden_content": "<p>From planning to delivery, every step is connected so nothing falls through the cracks.</p>",
  "btn_show": "Show More",
  "btn_hide": "Show Less",
  "show_btn_position": "inline",
  "hide_btn_position": "inherit",
  "merge_boundary": "no",
  "show_ellipsis": "no",
  "count_mode": "none",
  "click_anywhere": "no",
  "native_details": "no",
  "btn_color": "",
  "visible_color": { "predefined": "", "custom": "" },
  "hidden_color": { "predefined": "", "custom": "" },
  "btn_show_color": { "predefined": "", "custom": "" },
  "btn_hide_color": { "predefined": "", "custom": "" },
  "toggle_icon": "none",
  "initially_open": "no"
}
```

## Notes
- `visible_content` / `hidden_content` are WYSIWYG — keep them plain semantic HTML with no classes on `<p>`/`<li>` (see `text-block.md`).
- The `{count}` token only produces a number when `count_mode` is `words` or `chars`; otherwise it renders as literal text.
- With `native_details: yes`, button position, toggle icon, click-anywhere, and count are all bypassed — you can omit them.
- `merge_boundary` only joins the boundary paragraphs; other paragraphs stay separate.
- `btn_color` is free-form hex/rgba; the preset button colors win when both are set. Preset fields use the **compact color-preset** shape `{ predefined, custom }`. See `README.md`.
