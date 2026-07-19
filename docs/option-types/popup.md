# popup

Groups a set of sub-options behind an "Edit" button that opens a modal (the `fw.OptionsModal`). Stores the **values of its nested `popup-options`** — a keyed map of leaf option id → that option's saved value.

## Stored value shape
```json
{
  "<popup_option_id>": "<that sub-option's saved value>",
  "...": "..."
}
```
Concrete (a popup wrapping a `text` + a `switch`):
```json
{ "heading": "Our Team", "show_bio": true }
```

## Fields
| key | type | notes |
|---|---|---|
| `<popup_option_id>` | mixed | one entry per leaf option declared in `popup-options`. The value is whatever THAT option type persists (a string, int, bool, nested array, …). |

## Notes / gotchas
- Default `value` is `array()` (empty). Each sub-option's own default fills in when the popup is first saved.
- The map is keyed by the **leaf** option ids inside `popup-options` (via `fw_extract_only_options`), not by the container/group ids — nesting `popup-options` in groups/boxes doesn't change the flat saved keys.
- The `<input>` carries the values as a **JSON string**; `_get_value_from_input` JSON-decodes it, then re-runs `fw_get_options_values_from_input` against `popup-options` so each sub-value is sanitized by its own option type.
- Config keys (`button`, `popup-title`, `size` = `small|medium|large`, `custom-events`) are option DEFINITION settings, **not** part of the saved value.
- Backend width type is `fixed`.
