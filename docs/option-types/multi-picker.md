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
| `<choice_key>` | object | the revealed sub-values. **Only the SELECTED choice's group is persisted** — on save the picker prunes every other choice's reveal values (they're dead weight for a single-select, and storing all of them bloats the value, e.g. an entrance-effect picker would keep a block for all ~56 effects). Falls back to collect-all only when the selection isn't a clear scalar. A choice that reveals nothing has no key at all. |

## Notes / gotchas
- **Choice keys must be NON-EMPTY strings** — use `'auto'`/`'none'`, never `''`.
- **Label placement flips by mode** (the #1 mistake): **inline** picker (plain select/switch/image-picker, no popover) → label/desc live on the PICKER sub-option, top level is `label:false,desc:false`. **Popover** picker (`popover:true`, tile grid) → OPPOSITE: label/desc on the TOP level, picker sub-option `label:false`.
- Only the chosen key's group is required to be present; a preset that reveals nothing is simply omitted from the array.
- Converting an existing scalar option to a multi-picker is a **breaking value-shape change** — a legacy string hitting the picker's `_render` throws *illegal string offset* → blank "error:" modal on pre-existing page-builder items. Needs a JS-side migrator in the item's `scripts.js`.
- Saved shape is the same for inline and popover — the label rule is purely presentational.
- **React control** (`framework/static/js/controls/src/controls/multi-picker.jsx`) — used in Gutenberg block sidebars. The picker, with the revealed options indented beneath it. `hide_picker` hides the picker but keeps the revealed fields (a schema hides the picker when the choice is decided elsewhere, not to hide what it controls).
- This type **DOES** run each child's `_get_value_from_input()` — picker and selected branch alike — so children must emit the **wire** format (`'true'` for a switch, a delimited string for a multi-select), not the stored one. Rendering them through the shared control registry is what guarantees that.
- **Only the selected branch is stored.** The pruning is load-bearing: before it existed, the Entrance picker's value carried a settings block for all ~56 Animate.css effects (~70KB) and exhausted memory in the page builder. Switching choices and back therefore loses what was typed in the branch you left — in both renderers.
- The `for` / `options` shared-block shorthand is expanded by `prepare_choices()` before validation, and the React control expands it identically; skipping that would render fields the server does not accept.
