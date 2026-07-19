# `call_to_action` — Call To Action

A focused promotional block: a title + rich-text message on one side and a single button on the other. Lighter than an `icon_box`. Leaf node: `{ type:'simple', shortcode:'call_to_action', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `title` | text | `''` | string | Headline above the message. Can be blank. |
| `message` | wp-editor | `''` | HTML string (WYSIWYG) | Body content. Sanitized with `wp_kses_post` inside one `<p>` wrapper. |
| `button_label` | text | `'Click'` | string | Button text. Empty = no button rendered. |
| `button_link` | text | `'#'` | URL / `#anchor` | Button href. Replace the default `#`. |
| `button_target` | switch | `'_self'` | `'_blank'` \| `'_self'` | Open the button link in a new tab. |
| `column_split` | column-split | `'3/4'` | `"n/d"` fraction string | The **content's** share of the row (button takes the rest). Snaps to twelfths and fifths; drives each side's `flex-grow`. Stacks below 576px. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `message_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Message/body color. Editor label is "Content Color"; the key stays `message_color` for back-compat. |

## Ready-to-use example (the atts object)
```json
{
  "title": "Ready to get started?",
  "message": "<p>Join thousands of teams already building faster with our platform.</p>",
  "button_label": "Get Started",
  "button_link": "#signup",
  "button_target": "_self",
  "column_split": "3/4",
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "title_color": { "predefined": "", "custom": "" },
  "message_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `message` is HTML, not plain text — emit valid markup (`<p>`, `<a>`, …) and keep it clean/semantic with no classes on `<p>`/`<li>` (see `text-block.md`).
- `column_split` accepts any denominator; the view parses `n/d` as content = `n`, button = `d - n`.
- There is no button-style control — the button uses a fixed theme style. For full control, place a separate `button` next to a `special_heading` instead.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
