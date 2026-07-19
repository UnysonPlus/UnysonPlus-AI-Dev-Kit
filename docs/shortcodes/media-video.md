# `media_video` — Video

An embedded (YouTube/Vimeo/oEmbed) OR self-hosted (MP4/WebM) video. Leaf node: `{ type:'simple', shortcode:'media_video', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source_type` | multi-picker | `{source:'embed'}` | see Notes | Chooses Embed vs Self-hosted and reveals that source's fields. |
| `width` | unit-input | `{value:600,unit:'px'}` | units `px % vw rem em` | Max width of the video (shared by both sources). |
| `ratio` | select | `'16x9'` | `16x9` `4x3` `1x1` `21x9` `9x16` `3x4` | Aspect ratio (shared). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |

### `source_type` revealed fields — **Embed** (`source:'embed'`)
| key | type | default | choices | |
|---|---|---|---|---|
| `url` | text | `''` | oEmbed page URL | YouTube/Vimeo page URL (not the raw .mp4/iframe). |
| `youtube_nocookie` | switch | `'no'` | `'yes'`\|`'no'` | Privacy no-cookie embed. |
| `lazy_facade` | switch | `'no'` | `'yes'`\|`'no'` | Click-to-load poster + play button. |
| `poster` | upload | `''` | `{attachment_id,url}` | Facade still. |

### `source_type` revealed fields — **Self-hosted** (`source:'self_hosted'`)
| key | type | default | choices | |
|---|---|---|---|---|
| `video_file` | upload | `''` | `{attachment_id,url}` | The MP4. |
| `video_webm` | upload | `''` | `{attachment_id,url}` | Optional WebM source. |
| `video_url` | text | `''` | URL | External CDN file (used if no upload). |
| `poster` | upload | `''` | `{attachment_id,url}` | Poster still. |
| `autoplay` | switch | `'no'` | `'yes'`\|`'no'` | Autoplay (needs `muted:'yes'`). |
| `muted` | switch | `'no'` | `'yes'`\|`'no'` | Start muted (required for autoplay). |
| `loop` | switch | `'no'` | `'yes'`\|`'no'` | Loop for seamless bg clips. |
| `controls` | switch | `'yes'` | `'yes'`\|`'no'` | Native play/seek/volume bar. |
| `playsinline` | switch | `'yes'` | `'yes'`\|`'no'` | Inline (no iOS fullscreen). |
| `preload` | select | `'metadata'` | `metadata` `auto` `none` | How much to fetch before play. |
| `object_fit` | select | `'contain'` | `contain` `cover` | Fit vs fill/crop. |

## Ready-to-use example (the atts object)
```json
{
  "source_type": {
    "source": "self_hosted",
    "self_hosted": {
      "video_file": { "attachment_id": "", "url": "https://example.com/hero.mp4" },
      "video_webm": "",
      "video_url": "",
      "poster": { "attachment_id": "", "url": "https://example.com/poster.jpg" },
      "autoplay": "yes", "muted": "yes", "loop": "yes",
      "controls": "no", "playsinline": "yes",
      "preload": "metadata", "object_fit": "cover"
    }
  },
  "width": { "value": "100", "unit": "%" },
  "ratio": "16x9",
  "bg_color": { "predefined": "", "custom": "" }
}
```

## Notes
- `source_type` is a **multi-picker**: `{ "source": "embed" | "self_hosted", "<source>": { …that source's fields… } }`. Only include the branch object matching `source`. For an embed: `{ "source":"embed", "embed": { "url":"https://youtu.be/…", "youtube_nocookie":"no", "lazy_facade":"no", "poster":"" } }`.
- **Self-hosted is the only way** to get a muted, looping, autoplaying background/hero clip — for that combo set `autoplay:'yes'`, `muted:'yes'`, `loop:'yes'`, `controls:'no'`, `object_fit:'cover'`.
- Switch values are the strings `'yes'`/`'no'`. Upload values are `{ attachment_id, url }` (leave `attachment_id:''` when generating from a URL; empty upload = `''`).
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
