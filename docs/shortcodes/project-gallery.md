# `project_gallery` — Project Gallery

The image gallery of a single portfolio project — as a responsive grid with optional lightbox and captions. Requires the **`portfolio`** extension active. Leaf node: `{ type:'simple', shortcode:'project_gallery', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `project_id` | select | `'current'` | `current` \| a project post ID | Which project's gallery to show (`current` = auto, inside a single-project template). |
| `no_results_text` | text | `''` | string | Shown when the project has no gallery images (empty = render nothing). |
| `columns` | select | `'3'` | `1`–`6` | Desktop column count. |
| `columns_tablet` | select | `'2'` | `1`–`4` | Tablet column count. |
| `columns_mobile` | select | `'1'` | `1` `2` | Mobile column count. |
| `gap` | short-text | `'16'` | px string | Space between images. |
| `ratio` | select | `'4-3'` | `16-9` `4-3` `3-2` `1-1` `2-3` `auto` | Thumbnail crop ratio (`auto` = natural). |
| `image_size` | select | `'large'` | `thumbnail` `medium` `medium_large` `large` `full` | Registered image size for the grid thumbnails. |
| `lightbox` | switch | `'yes'` | `'yes'` \| `'no'` | Open images in a full-screen lightbox on click. |
| `captions` | switch | `'no'` | `'yes'` \| `'no'` | Show each image's title beneath its thumbnail. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "project_id": "current",
  "no_results_text": "",
  "columns": "3",
  "columns_tablet": "2",
  "columns_mobile": "1",
  "gap": "16",
  "ratio": "4-3",
  "image_size": "large",
  "lightbox": "yes",
  "captions": "no",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `project_id` choices are `current` (pulls the gallery of the project being viewed — use inside a single-project template) plus one entry per published portfolio project, keyed by post ID (string).
- The lightbox always opens the full-size image regardless of `image_size` (which only sizes the grid thumbnails).
- Switch atts store the string `'yes'`/`'no'`, not booleans; `gap` and the column counts are stored as strings.
- The `text_color` / `bg_color` / `font_size_preset` atts (the shared Styling tab) exist only when the shortcodes helpers are loaded. Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
