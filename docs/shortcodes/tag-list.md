# `tag_list` — Tag List

A row of short items rendered as pills / chips, or an inline dot-separated list. Leaf node: `{ type:'simple', shortcode:'tag_list', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `items` | textarea | 5 sample lines | text, one item per line | The tags. A bare line is plain text; `Label | https://example.com` (or `Label | /path/`) turns that tag into a link. Blank lines are ignored. |
| `design` | image-picker | `'soft'` | `soft` `outline` `solid` `subtle` `line` | The look. `line` = no pill, dot-separated inline text. |
| `shape` | select | `'pill'` | `pill` `rounded` `square` | Corner rounding (ignored by `line`). |
| `size` | select | `'md'` | `sm` `md` `lg` | Font size + padding. |
| `align` | select | `'start'` | `start` `center` `end` | Horizontal alignment (`justify-content`) of the row. |
| `gap` | select | `'sm'` | `sm` `md` `lg` | Space between tags (Tight / Normal / Roomy). |
| `marker` | select | `'none'` | `none` `dot` | Optional leading dot before each tag (not for `line`). |
| `hover` | switch | `'no'` | `yes` \| `no` | Subtle lift + accent on hover (most visible on linked tags). |
| `tag_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Drives fill / border / text of every tag. Empty = neutral grey. |

## Ready-to-use example (the atts object)
```json
{
  "items": "Layout\nContent\nMedia | /media/\nInteractive\nComponents",
  "design": "soft",
  "shape": "pill",
  "size": "md",
  "align": "start",
  "gap": "sm",
  "marker": "none",
  "hover": "no",
  "tag_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `items` is parsed line-by-line: `explode('|', $line, 2)`. Everything before the `|` is the label, everything after is the URL.
- External links (a different host than the site) open in a new tab automatically (`target="_blank" rel="noopener noreferrer"`); internal/relative links stay in the same tab.
- `tag_color` resolves to one CSS custom property (`--tl-color`) on the wrapper — a preset becomes `var(--color-<slug>)` so it tracks the brand; a custom hex is used literally. Every design derives its fill/border/text from that one variable.
- Output is clean: `.fw-tag` (or `a.fw-tag`) with the design class on the wrapper — no per-item classes, no inline-styled prose. Prefer this over hand-coding pills inside a Text Block.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
