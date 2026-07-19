# addable-box

A repeater: an add/remove/reorder list of "boxes", each box being a fixed set of sub-options. Stored as an **array of row objects**. Used for palettes (`theme_colors`), custom fonts, social profiles, and any "list of structured rows" setting.

## Stored value shape
An array of rows; each row is an object keyed by the box's leaf option ids:
```json
[
  { "name": "Primary",   "color": "#0d6efd" },
  { "name": "Secondary", "color": "#6c757d" }
]
```
Real example (`social_profiles`):
```json
[
  { "name": "Facebook", "link": "https://facebook.com/…",
    "icon": { "type": "icon-font", "icon-class": "fab fa-facebook" }, "new_tab": "yes" }
]
```

## Fields
| aspect | notes |
|---|---|
| top-level value | a plain **array** (list) of row objects — set the whole key to the array to write it. |
| row object keys | the ids of the `box-options` leaf options; each value follows THAT option type's own shape (text→string, switch→`'yes'`/`'no'`, icon-v2→icon hash, upload→upload value). |
| order | array order = display/render order (sortable). |

## Notes / gotchas
- Set/replace the **whole array** — there is no per-row keying at the top level; rows are positional.
- Each row field carries its sub-option's value shape (a `switch` inside a row is still `'yes'`/`'no'`; a compact-color inside a row is still `{predefined,custom}`).
- `limit` caps row count; `box-duplicate` adds a clone control (both are UI config, not stored).
- Distinct from `addable-popup`: addable-box edits rows inline; addable-popup edits each row in a modal and wraps it as `element_type`-style entries.
