# multi-inline

**Container option.** Renders N small child controls side-by-side on ONE row (e.g. a border's Width · Style · Color, spacing T/R/B/L, or a pair of icon pickers Open · Close). Stores a hash of its children's values keyed by sub-option id.

## Stored value shape
```json
{
  "<sub_option_key_1>": "<that child option's value>",
  "<sub_option_key_2>": "<that child option's value>"
}
```
Concrete (a border row: width `unit-input`, style `select`, color compact-preset):
```json
{
  "width": { "value": "2", "unit": "px" },
  "style": "solid",
  "color": { "predefined": "text-red", "custom": "" }
}
```

## Fields
| key | type | notes |
|---|---|---|
| `<sub_key>` | (per child) | one key per entry in the option's `fw_multi_options`. Each value is exactly what THAT child option type stores (unit-input → `{value,unit}`, select → choice string, compact-color → `{predefined,custom}`, icon-v2 → icon value). |

## Notes / gotchas
- **This is a display/grouping container** — no value of its own; it stores the flattened values of its children, keyed by the child keys declared under **`fw_multi_options`** (NOT `options`).
- The top-level `value` seeds each child key's default (e.g. `'value' => ['open' => '', 'close' => '']`).
- **Each child is round-tripped through its own option type's `get_value_from_input`** on save, so a nested unit-input's JSON decodes to `{value,unit}`, a select validates against its choices, etc. The child value shapes are unchanged from their standalone form.
- **Save path is generic; render path is a hardcoded whitelist.** A child type the `view.php` render switch doesn't know **saves fine but draws a blank row** (no error). Supported render types: `short-text`, `text`, `color`, `rgbacolor`, `short-select`, `select`, `unit-input`, `predefined-colors-color-picker-compact`/`compact-color`, `icon-v2`/`icon`. Adding a new child type requires a render branch in `view.php`.
- Child caption comes from `$cfg['title']`, NOT `'label'`.
- Prefer `multi-inline` over the legacy off-convention `fw-multi-inline` alias in new code (same value shape).
