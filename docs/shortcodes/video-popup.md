# `video_popup` — Video Popup

A poster image with a play button that opens a YouTube / Vimeo / self-hosted video in a lightbox. Leaf node: `{ type:'simple', shortcode:'video_popup', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `poster` | upload | `''` | `{ attachment_id, url }` | Image shown before the video plays. |
| `video_url` | text | `''` | URL | YouTube/Vimeo page URL or a direct `.mp4` / `.webm` file. |
| `play_label` | text | `''` | string | Optional text beside the play button (e.g. "Watch the film"). |
| `caption` | text | `'Play video'` | string | Screen-reader label for the button. |
| `design` | image-picker | `'classic'` | `classic` `pulse` `outline` `soft` `minimal` | Play-button style. |
| `ratio` | select | `'ratio-16-9'` | `original` `ratio-16-9` `ratio-4-3` `ratio-1-1` `ratio-21-9` | Poster aspect ratio. |
| `play_size` | select | `'md'` | `sm` `md` `lg` | Play button size. |
| `rounded` | select | `'rounded'` | `rounded-0` `rounded` `rounded-lg` | Poster corner radius. |
| `overlay` | switch | `'yes'` | `yes` \| `no` | Darken the poster. |
| `hover_zoom` | switch | `'yes'` | `yes` \| `no` | Zoom the poster on hover. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Play button color (`kind: bg`). |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Play icon color. |
| `overlay_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Overlay tint (`kind: bg`). |
| `label_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Play label color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "poster": { "attachment_id": 0, "url": "https://example.com/poster.jpg" },
  "video_url": "https://youtu.be/XXXXXXXXXXX",
  "play_label": "Watch the film",
  "caption": "Play video",
  "design": "classic",
  "ratio": "ratio-16-9",
  "play_size": "md",
  "rounded": "rounded",
  "overlay": "yes",
  "hover_zoom": "yes",
  "accent_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "overlay_color": { "predefined": "", "custom": "" },
  "label_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `video_url` is parsed at render into `[type, src]`: a YouTube id, a Vimeo id, or a file URL. Examples: `https://youtu.be/XXXX`, `https://vimeo.com/123456`, `https://example.com/clip.mp4`.
- One shared lightbox handles playback: an autoplay `<iframe>` (YouTube/Vimeo) or `<video controls autoplay>` (file). Esc / backdrop / × close it and clear the media (stops playback).
- The `pulse` design animates rings, gated behind `prefers-reduced-motion`.
- `poster` is a WP upload **object** (`{ attachment_id, url }`) — use `attachment_id: 0` with a URL only. Colors use the **compact color-preset** shape `{ predefined, custom }`. See `README.md`.
