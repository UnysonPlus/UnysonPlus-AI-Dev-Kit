# radio-text

A radio-button row of preset choices plus a free "custom" text input. Whichever is active, the field stores a **single plain string** — either the selected choice key or the typed custom text.

## Stored value shape
```json
"50"
```
A plain STRING. Either one of the `choices` **keys** (a preset was picked, e.g. `"25"` / `"50"` / `"100"`) or arbitrary custom text (the custom radio was chosen). Default `value` is `''`.

## Fields
| key | type | notes |
|---|---|---|
| (whole value) | string | the chosen choice key, OR the custom free-text value. |

## Notes / gotchas
- Default `choices` are `'25'=>'25%'`, `'50'=>'50%'`, `'100'=>'100%'` — the stored value is the **key** (`25`), not the label (`25%`).
- On save, the internal `predefined` radio is resolved via the `radio` option type; if it equals the hidden custom-choice sentinel, the `custom` text is returned instead — so a consumer just sees one flat string either way.
- The submitted value may arrive as a JSON-serialized string; it's normalized to `{predefined, custom}` internally, but what PERSISTS is a single string.
- Backend width type is `auto`.
