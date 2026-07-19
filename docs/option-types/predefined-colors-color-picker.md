# predefined-colors-color-picker

A hybrid control: a `predefined-colors` swatch grid alongside a color picker (`color-picker` / `rgba-color-picker`). Selecting one side clears the other. Stores a two-key `{ predefined, custom }` object.

## Stored value shape
```json
{ "predefined": "#f97316", "custom": "" }
```
A HASH with a `predefined` half and a `custom` half. Examples: `{predefined:"",custom:"rgba(0,0,0,.5)"}`, empty `{predefined:"",custom:""}`.

## Fields
| key | type | notes |
|---|---|---|
| `predefined` | string | the value chosen from the swatch grid (the `predefined-colors` sub-value — typically a hex), or `''`. |
| `custom` | string | a free color from the embedded picker (hex or `rgba()`), or `''`. |

## Notes / gotchas
- Default `value` = `{ predefined: '', custom: '' }`.
- Which half each key uses is set by the option's `colors` config (`colors[<key>]['type']` = `predefined` or `custom`); the saved value mirrors those same keys.
- `_get_value_from_input` passes the submitted array straight through (falling back to the default when not an array) — no key-level coercion here; each embedded control governs its own half.
- **Distinct from the `-compact` variant.** This is the FULL two-column swatch-grid-plus-picker control. The commonly-used `predefined-colors-color-picker-compact` (see [compact-color.md](./compact-color.md), built via `sc_color_field_compact()`) is the one-row preset-dropdown + inline picker used on element Styling tabs. Both persist a `{ predefined, custom }` hash, but compact's `predefined` stores a CSS **class name** (`text-<slug>` / `bg-<slug>`) tied to the live palette, whereas this base type's `predefined` stores the raw swatch value. Use the compact variant for consuming colors on elements.
- Backend width type is `auto`.
