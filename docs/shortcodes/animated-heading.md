# `animated_heading` — Animated Heading

A heading with static before/after text and a rotating set of words, animated with one of several effects (typewriter / fade / slide / flip / zoom / clip). Leaf node: `{ type:'simple', shortcode:'animated_heading', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `before_text` | text | `'We build'` | string | Static text before the rotating words. |
| `words` | textarea | `"websites\nbrands\nideas"` | newline-separated string | The rotating words / phrases, one per line. |
| `after_text` | text | `''` | string | Static text after the rotating words. |
| `tag` | select | `'h2'` | `h1` `h2` `h3` `h4` `h5` `h6` `p` `div` | Semantic tag for the heading (the wrapper IS the heading). |
| `anim` | image-picker | `'typewriter'` | `typewriter` `fade` `slide` `flip` `zoom` `clip` | The rotation effect (from the design registry). |
| `speed` | select | `'normal'` | `slow` `normal` `fast` | Rotation / type-delete timing. |
| `highlight` | select | `'color'` | `none` `color` `underline` `marker` | How the rotating word is emphasised. |
| `align` | alignment | `'left'` | `left` `center` `right` | Text alignment. |
| `text_color` | compact color | `{predefined:'',custom:''}` | compact color object | Base text color (→ `--ah-text`). |
| `accent_color` | compact color | `{predefined:'',custom:''}` | compact color object | Highlight / accent color (→ `--ah-accent`, `kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "before_text": "We build",
  "words": "websites\nbrands\nideas",
  "after_text": "",
  "tag": "h2",
  "anim": "typewriter",
  "speed": "normal",
  "highlight": "color",
  "align": "left",
  "text_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `words` is a plain newline-separated string (one word/phrase per line) — NOT a JSON array. A single-word list does not rotate.
- `anim` values come from the design registry; the seven built-ins are `typewriter` / `fade` / `slide` / `flip` / `zoom` / `clip`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- `accent_color` drives the word highlight; it only shows when `highlight` is not `none`.
- `prefers-reduced-motion` falls back to a plain word swap (typewriter shows a static caret), so don't rely on the effect being visible for all visitors.
