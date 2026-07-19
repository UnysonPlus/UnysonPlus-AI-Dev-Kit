# scroll-text-highlight — Scroll Text Highlight (Animation Engine)

Lights up an element's text **word-by-word (or char-by-char)** as it scrolls through the viewport —
each word scrubs from muted to full as the reader passes it. Rides the node
**`fx.scroll_text_highlight`** slot (picker key **`mode`**; "off" value `off`). Per-element (attaches
from the Animations tab). Requires the **animation-engine extension ACTIVE**; global on/off in Theme
Settings → Animations → Effects.

## Effects / styles

20 `mode` keys, all sharing the same option group:
`fill` · `fade` · `blur` · `marker` · `dim` · `desaturate` · `spotlight` · `gradient` · `sweep` ·
`glow` · `neon` · `rise` · `scale` · `skew` · `track` · `underline` · `pill` · `outline` · `strike` ·
`shimmer`.

## Value shape

```json
"scroll_text_highlight": { "mode": "fill", "fill": {
  "split": "word",
  "active_color": { "predefined": "", "custom": "" },
  "duration": 0.5,
  "once": "yes"
} }
```

## Params

| Param | Type | Default | Notes |
|---|---|---|---|
| `split` | select | `'word'` | `word` / `char` — light up one word or one letter at a time. |
| `active_color` | color `{predefined,custom}` (kind `text`) | blank | Highlight color; blank → CSS default (`--sth-active`). |
| `duration` | slider | `0.5` (0–1.5) | Per-word ease (seconds). |
| `once` | switch | `'yes'` | Stay lit once revealed; `no` re-dims when scrolled back up. |

## Notes

- Runtime splits text into word/char spans and scrubs an `.is-on` class from a passive,
  rAF-throttled scroll check — no library.
- Wrapper class `sc-sth sc-sth--<mode>`; emits `--sth-dur` / `--sth-active` CSS vars and
  `data-sth-split` / `data-sth-once` attributes.
- Color resolves via the compact preset: `predefined` slug → `var(--color-<slug>)`, else `custom` hex.
- Honours "reduce motion" (shows everything lit) and loads only on pages that use it.
