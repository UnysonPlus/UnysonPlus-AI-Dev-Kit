# `scroll_to_top` — Scroll to Top & Progress

A fixed back-to-top button and/or a reading-progress bar, both tied to page scroll. Place once per page. Leaf node: `{ type:'simple', shortcode:'scroll_to_top', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `show_button` | switch | `'yes'` | `'yes'` \| `'no'` | Show the back-to-top button. |
| `show_progress` | switch | `'no'` | `'yes'` \| `'no'` | Show the reading-progress bar. |
| `icon` | icon-v2 | see Notes | icon-v2 object | Button icon. Left as `none` → an up-arrow. |
| `position` | select | `'bottom-right'` | `bottom-right` `bottom-left` | Button corner. |
| `shape` | select | `'circle'` | `circle` `rounded` `square` | Button shape. |
| `show_after` | text | `'300'` | integer (px) | Button fades in after this scroll distance. |
| `progress_position` | select | `'top'` | `top` `bottom` | Progress bar edge of the viewport. |
| `progress_height` | text | `'4'` | integer (px) | Progress bar thickness. |
| `accent_color` | color-preset | `{predefined:'',custom:''}` | compact color object (`kind:bg`) | Button background + bar fill. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Button icon color. |
| `button_size` | select | `'md'` | `sm` `md` `lg` | Button size. |

## Ready-to-use example (the atts object)
```json
{
  "show_button": "yes",
  "show_progress": "no",
  "icon": { "type": "none", "icon-class": "", "icon-class-without-root": false, "pack-name": false, "pack-css-uri": false },
  "position": "bottom-right",
  "shape": "circle",
  "show_after": "300",
  "progress_position": "top",
  "progress_height": "4",
  "accent_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "button_size": "md"
}
```

## Notes
- The button is hidden until the page is scrolled past `show_after`, so it looks empty on the builder canvas — that's expected.
- Intended as a single per-page instance; multiple instances each work but their fixed elements overlap.
- Leaving `icon` as `type:'none'` renders a default up-arrow; set a specific glyph with the icon-v2 shape (see `icon-box.md`).
- This shortcode has no Styling/Animations spacing tab beyond the ones listed — only General + Styling + Advanced.
- Colors use the compact color-preset shape `{ predefined, custom }` — see `README.md`.
