# addable-popup

A repeater like addable-box, but each entry is edited in a **modal popup** (bigger forms). Stored as an **array of entry objects**. The canonical use is Header/Footer builder columns, where each entry is an "element" (`element_type` picker + per-type fields). Also `addable-popup-full` = same, full-width backend.

## Stored value shape
An array of entry objects, each shaped by the popup's `popup-options`:
```json
[
  { "element_type": { "element": "cta_button",
                      "cta_button": { "cta_text": "Get Started", "cta_link": "#" } },
    "visibility": [], "element_css_class": "" },
  { "element_type": { "element": "menu_area",
                      "menu_area": { "menu_location": "primary" } },
    "visibility": [], "element_css_class": "" }
]
```

## Fields
| aspect | notes |
|---|---|
| top-level value | a plain **array** of entry objects, in display order (sortable). |
| entry keys | the ids of `popup-options`. In Header/Footer columns that's `element_type` (a multi-picker: `{element:'<type>', '<type>':{…fields…}}`), plus `visibility` (image-picker multiple → array of `hide-xs`/`hide-sm`/`hide-md`) and `element_css_class` (text). |
| `element_type.<type>` | per-element fields; `{}` for elements with no reveal fields (logo, search, social_icons, spacer, divider). |

## Notes / gotchas
- Set/replace the **whole array**; entries are positional, no top-level keys.
- Each entry's inner values follow their own option-type shapes (a nested `multi-picker` → picker-key + chosen-group; `icon-v2` → icon hash; upload → upload value).
- `limit` caps entries; `size` (`small`/`medium`/`large`) is the modal width (UI config, not stored).
- A Header/Footer BAR renders when any of its left/center/right columns has ≥1 entry — there's no separate enable switch.
