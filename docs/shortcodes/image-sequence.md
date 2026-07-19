# `image_sequence` — Image Sequence

A scroll-scrubbed image sequence (frame-by-frame "video from stills") — pins full-screen and plays with scroll, or scrubs as it passes the viewport. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'image_sequence', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `frames_source` | multi-picker | `{source:'upload'}` | see Notes | Where the frames come from (uploaded set or numbered URL pattern). |
| `mode` | select | `'pin'` | `pin` `inview` | `pin` holds full-screen while scrubbing; `inview` scrubs as the element passes the viewport. |
| `pin_length` | slider | `2` | 1–6 (screens) | How much scrolling the sequence spans while pinned (higher = slower scrub). |
| `direction` | select | `'forward'` | `forward` `reverse` | Playback direction. |
| `fit` | select | `'cover'` | `cover` `contain` | Cover (fill, crop) vs contain (letterbox). |
| `height` | number | `520` | px (min 160) | Element height in `inview` mode (pinned mode is always full-screen). |
| `bg` | color-preset | `{predefined:'',custom:'#0b0f1a'}` | compact color object | Background color (`kind: bg`). |

## Ready-to-use example (the atts object)
```json
{
  "frames_source": {
    "source": "upload",
    "upload": {
      "frames": [
        { "attachment_id": "", "url": "https://example.com/frame_1.jpg" },
        { "attachment_id": "", "url": "https://example.com/frame_2.jpg" },
        { "attachment_id": "", "url": "https://example.com/frame_3.jpg" }
      ]
    },
    "pattern": { "url_pattern": "", "count": 60, "start": 1, "pad": 0 }
  },
  "mode": "pin",
  "pin_length": 2,
  "direction": "forward",
  "fit": "cover",
  "height": 520,
  "bg": { "predefined": "", "custom": "#0b0f1a" }
}
```

## Notes
- `frames_source` is a **multi-picker**: `{ "source": "upload"|"pattern", "upload": {…}, "pattern": {…} }`. The safe generator emits both branches (defaulted) plus the active `source`.
  - `upload` branch → `frames` (multi-upload array of `{ attachment_id, url }`, in order — use evenly-sized images).
  - `pattern` branch → `url_pattern` (use `%d` where the frame number goes, e.g. `https://site.com/seq/frame_%d.jpg`), `count` (default `60`), `start` (first frame number, default `1`), `pad` (zero-pad digits, `0` = none; `4` → `frame_0007.jpg`). A URL pattern is best for long (100+) sequences.
- `bg` uses the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
