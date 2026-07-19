# `lottie` — Lottie Animation

Embeds a Lottie / Bodymovin `.json` animation (from a URL or the media library) with playback controls. Leaf node: `{ type:'simple', shortcode:'lottie', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | select | `'url'` | `url` `upload` | Where the JSON comes from. |
| `lottie_url` | text | `''` | URL to a `.json` file | Direct link to a Lottie/Bodymovin JSON (used when `source` = `url`). |
| `lottie_file` | upload | `''` | attachment object (`.json`) | Uploaded animation (used when `source` = `upload`). |
| `trigger` | select | `'autoplay'` | `autoplay` `viewport` `hover` `click` | When the animation plays. |
| `loop` | switch | `'yes'` | `yes` \| `no` | Loop the animation. |
| `reverse_hover` | switch | `'no'` | `yes` \| `no` | Hover trigger — rewind on hover-out. |
| `speed` | slider | `1` | 0.25–2.5 (step 0.25) | Playback speed multiplier. |
| `direction` | select | `'forward'` | `forward` `reverse` | Play direction. |
| `max_width` | text | `'240'` | px number (empty = full width) | Caps the animation width. |
| `alignment` | select | `'center'` | `left` `center` `right` | Horizontal alignment. |

## Ready-to-use example (the atts object)
```json
{
  "source": "url",
  "lottie_url": "https://example.com/animation.json",
  "lottie_file": "",
  "trigger": "viewport",
  "loop": "yes",
  "reverse_hover": "no",
  "speed": 1,
  "direction": "forward",
  "max_width": "240",
  "alignment": "center"
}
```

## Notes
- The source must be a `.json` Lottie/Bodymovin file — not a `.lottie` bundle or GIF.
- `reverse_hover` only applies to the `hover` trigger (play forward on enter, rewind on leave).
- `max_width` is a bare pixel number; leave empty to fill the container width.
