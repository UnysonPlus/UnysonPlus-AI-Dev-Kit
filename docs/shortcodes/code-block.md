# `code_block` — Code Block

Raw HTML/CSS/JS that either **runs** on the page (embeds/widgets) or is **shown** as syntax-highlighted code. Leaf node: `{ type:'simple', shortcode:'code_block', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `code` | code-editor | `''` | raw HTML/CSS/JS string | The markup. Output verbatim (unescaped). |
| `render_as_code` | switch | `false` | `'yes'` \| `'no'` (also `true`/`false`) | ON = show escaped code in a Prism `<pre><code>`; OFF = execute/render it. |
| `beautify` | switch | `true` | `'yes'` \| `'no'` (also `true`/`false`) | Re-indent markup before showing (only when `render_as_code` is on). |
| `code_language` | select | `'auto'` | `auto` `markup` `css` `javascript` `php` `json` `bash` | Prism `language-*` class (only when `render_as_code` is on). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "code": "<div class=\"orx-dash\"><h3>Operations overview</h3></div>",
  "render_as_code": "no",
  "beautify": "yes",
  "code_language": "auto",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- **Switch values are the strings `'yes'`/`'no'`** in the proven build path (the option's `right-choice`/`left-choice` are the booleans `true`/`false`, but generators emit `'yes'`/`'no'` and the view tolerates both). Match the reference: `render_as_code:'no', beautify:'yes'`.
- **Two modes:** OFF (default) → `code` is output raw and **runs** via `do_shortcode` (use for embeds, custom widgets, HARD-to-map markup). ON → the markup is beautified (when `beautify` is on, markup only), HTML-escaped, and wrapped for Prism so visitors **see** the code.
- **Never hand-paste entity-escaped HTML** (`&lt;table&gt;…`) to "show code" — re-saving the builder decodes it and it then renders. Always use `render_as_code:'yes'` with **raw** markup.
- Keep `code` a **single line** (no newlines) when it feeds a layout region — `wpautop` can otherwise inject `<p>`/`<br>` and break the markup. Use HTML entities (`&#8593;`) instead of literal newlines.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
