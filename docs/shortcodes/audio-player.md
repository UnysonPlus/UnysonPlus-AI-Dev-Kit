# `audio_player` — Audio Player

A styled HTML5 audio player for a single track or a multi-track playlist, with several design skins. Leaf node: `{ type:'simple', shortcode:'audio_player', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `tracks` | addable-popup | `[]` | array of track objects (see below) | One track per entry. Add several for a playlist. |
| `design` | image-picker | `'classic'` | registry-driven (e.g. `classic`, plus card/playlist skins) | Player skin. Choices come from `views/parts/registry.php`. |
| `autoplay` | switch | `'no'` | `'yes'` \| `'no'` | Autoplay on load (most browsers block audio autoplay until interaction). |
| `loop` | switch | `'no'` | `'yes'` \| `'no'` | Repeat the track / restart the playlist after the last track. |
| `show_volume` | switch | `'yes'` | `'yes'` \| `'no'` | Show the volume control. |
| `show_download` | switch | `'no'` | `'yes'` \| `'no'` | Show a download button. |
| `rounded` | select | `'rounded'` | `rounded-0` `rounded` `rounded-lg` | Corner radius (Square / Rounded / Large). |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Controls / progress accent (`kind: bg`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Player background (`kind: bg`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color. |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

### `tracks` entry (popup-options)
| key | type | default | what it does |
|---|---|---|---|
| `audio` | upload | `''` | Audio file (mp3, m4a, ogg, wav, aac). |
| `audio_url` | text | `''` | Direct URL fallback used if no file is chosen. |
| `title` | text | `'Untitled'` | Track title. |
| `artist` | text | `''` | Artist / subtitle. |
| `cover` | upload | `''` | Optional cover artwork (used by Card / Playlist designs). |

## Ready-to-use example (the atts object)
```json
{
  "tracks": [
    { "audio": "", "audio_url": "https://example.com/media/intro.mp3", "title": "Intro Theme", "artist": "House Band", "cover": "" },
    { "audio": "", "audio_url": "https://example.com/media/verse.mp3", "title": "Verse Two", "artist": "House Band", "cover": "" }
  ],
  "design": "classic",
  "autoplay": "no",
  "loop": "no",
  "show_volume": "yes",
  "show_download": "no",
  "rounded": "rounded",
  "accent_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- Switches are string `'yes'`/`'no'`, not booleans.
- Each `tracks` entry needs either an `audio` upload (attachment id/URL) or an `audio_url` fallback.
- `design` choices are registry-driven; `classic` is the default. Card / Playlist skins use each track's `cover`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
