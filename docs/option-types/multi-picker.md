# multi-picker

A "pick one, then reveal its sub-options" control. Ubiquitous in Theme Settings & shortcode atts wherever a choice unlocks a nested group (site width mode, header design, copyright toggle, Animation Engine effect pickers, min-height presets).

## Stored value shape
```json
{
  "<picker_id>": "<choice_key>",
  "<choice_key>": { "...revealed sub-option values for the chosen key...": "" }
}
```
Concrete (a min-height picker whose `custom` choice reveals a unit-input):
```json
{ "preset": "custom", "custom": { "min_h": { "value": "60", "unit": "vh" } } }
```

## Fields
| key | type | notes |
|---|---|---|
| `<picker_id>` | string | the selection — the picker sub-option's id (e.g. `preset`, `mode`, `effect`, `enabled`). Value = one non-empty choice key. |
| `<choice_key>` | object | the revealed sub-values for the currently-selected choice. Only choices that reveal something have a key. Values for OTHER choices persist too (switching never loses them). |

## Notes / gotchas
- **Choice keys must be NON-EMPTY strings** — use `'auto'`/`'none'`, never `''`.
- **Label placement flips by mode** (the #1 mistake): **inline** picker (plain select/switch/image-picker, no popover) → label/desc live on the PICKER sub-option, top level is `label:false,desc:false`. **Popover** picker (`popover:true`, tile grid) → OPPOSITE: label/desc on the TOP level, picker sub-option `label:false`.
- Only the chosen key's group is required to be present; a preset that reveals nothing is simply omitted from the array.
- Converting an existing scalar option to a multi-picker is a **breaking value-shape change** — a legacy string hitting the picker's `_render` throws *illegal string offset* → blank "error:" modal on pre-existing page-builder items. Needs a JS-side migrator in the item's `scripts.js`.
- Saved shape is the same for inline and popover — the label rule is purely presentational.
