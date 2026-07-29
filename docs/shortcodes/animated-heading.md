# `animated_heading` — Animated Heading

A **self-contained rotating headline** (no Animation Engine required): static before/after text and a rotating set of words, animated with one of several effects (typewriter / fade / slide / flip / zoom / clip / blur / 3D-rotate). Leaf node: `{ type:'simple', shortcode:'animated_heading', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

> **When to use this vs. the Animation Engine Text Effects.** This shortcode is the go-to for a *rotating headline* and works with the engine **off** (it's inactive by default). To apply typewriter / scramble / wave / glitch / 30+ effects to **any** text element, use the Animation Engine → Text Effects (`text_effect` on the Animations tab; requires the engine active). Don't apply an Engine text effect to this element too — they'll fight.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `before_text` | text | `'We build'` | string | Static text before the rotating words. |
| `words` | textarea | `"websites\nbrands\nideas"` | newline-separated string | The rotating words / phrases, one per line. |
| `after_text` | text | `''` | string | Static text after the rotating words. |
| `tag` | select | `'h2'` | `h1` `h2` `h3` `h4` `h5` `h6` `p` `div` | Semantic tag for the heading (the wrapper IS the heading). |
| `anim` | image-picker | `'typewriter'` | `typewriter` `fade` `slide` `flip` `zoom` `clip` `blur` `rotate3d` | The rotation effect (from the design registry). |
| `speed` | select | `'normal'` | `slow` `normal` `fast` | Rotation / type-delete timing. |
| `highlight` | select | `'color'` | `none` `color` `underline` `marker` `gradient` `pill` | How the rotating word is emphasised. `gradient` blends `accent_color` → `text_color`. |
| `loop` | select | `'forever'` | `forever` `once` | `once` stops on the last word instead of cycling. |
| `pause_hover` | switch | `'no'` | `'yes'` \| `'no'` | Pause the rotation while hovering the heading. |
| `randomize` | switch | `'no'` | `'yes'` \| `'no'` | Shuffle the word order instead of cycling in sequence. |
| `align` | alignment | `'left'` | `left` `center` `right` | Text alignment. |
| `caret_show` | switch | `'yes'` | `'yes'` \| `'no'` | Show the typewriter caret (Typewriter animation only). |
| `caret_style` | select | `'bar'` | `bar` `block` `underscore` | Caret shape (Typewriter only). |
| `caret_color` | compact color | `{predefined:'',custom:''}` | compact color object | Caret color (→ `--ah-caret`); blank inherits text color. |
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
  "loop": "forever",
  "pause_hover": "no",
  "randomize": "no",
  "align": "left",
  "caret_show": "yes",
  "caret_style": "bar",
  "caret_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "accent_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `words` is a plain newline-separated string (one word/phrase per line) — NOT a JSON array. A single-word list does not rotate.
- `anim` values come from the design registry; the eight built-ins are `typewriter` / `fade` / `slide` / `flip` / `zoom` / `clip` / `blur` / `rotate3d`.
- The caret atts (`caret_show` / `caret_style` / `caret_color`) only affect the `typewriter` animation.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- `accent_color` drives the word highlight; it only shows when `highlight` is not `none`.
- `prefers-reduced-motion` falls back to a plain word swap (typewriter shows a static caret), so don't rely on the effect being visible for all visitors.
