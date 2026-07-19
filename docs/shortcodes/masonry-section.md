# `masonry_section` — Masonry Section

A section that packs its child columns of any width into a masonry (tetris-style) grid — no fixed column count. Container node: `{ type:'section', shortcode:'masonry_section', _items:[ /* columns */ ], atts:{…} }`. Drop columns of any width (`1_2`, `1_3`, `2_3`, `1_4` …) inside `_items`; each keeps its width and they stack to fill gaps. Carries the shared wrapper blocks (`common`, `fx`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `gap` | select | `''` | `''` `0.5rem` `1rem` `1.5rem` `2rem` `3rem` | Space between items. `''` = default section gutter. |
| `is_fullwidth` | switch | `'no'` | `yes` \| `no` | On: span full container-fluid width. Off: site container width. |
| `background` | background-pro | see Notes | background-pro object | Color / gradient / image / video background layers. |
| `padding_top` | text | `''` | e.g. `40px` or `3rem` | Section top padding. |
| `padding_bottom` | text | `''` | e.g. `40px` or `3rem` | Section bottom padding. |

## Ready-to-use example (the atts object)
```json
{
  "gap": "1.5rem",
  "is_fullwidth": "no",
  "background": { "type": "none" },
  "padding_top": "",
  "padding_bottom": ""
}
```

## Notes
- This is a **section** (container) node, not a leaf — put `column` nodes in `_items`. Columns of mixed widths pack vertically to fill gaps like masonry blocks.
- `background` is the **background-pro** option type (layered color over gradient over image/video); it replaces the old flat background-color field.
- `gap`, `padding_top` and `padding_bottom` take raw CSS length values (`rem`/`px`), not spacing-scale slugs.
