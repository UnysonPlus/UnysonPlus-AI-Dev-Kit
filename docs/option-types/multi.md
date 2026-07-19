# multi

**Container option.** Groups several inner options into one logical unit rendered as stacked rows. It stores nothing of its own — just a flat map of its inner-options' values keyed by their ids.

## Stored value shape
```json
{
  "<inner_option_id_1>": "<that option's value>",
  "<inner_option_id_2>": "<that option's value>"
}
```
Concrete (a `multi` grouping a `text` id `label` and a `select` id `size`):
```json
{ "label": "Read more", "size": "large" }
```

## Fields
| key | type | notes |
|---|---|---|
| `<inner_id>` | (per inner option) | one key per option in `inner-options`. Each value is exactly what THAT option type stores (a string for `text`, an array for `upload`, etc.). |

## Notes / gotchas
- **This is a pure display/grouping container** — it has no value shape of its own. The saved array is the flattened values of its `inner-options`, keyed by each inner option's id.
- Default value is `{}` (empty array); it fills in as inner options save their own defaults.
- The inner ids sit at the SAME nesting level — `multi` does not add a wrapping key. So an inner id must be unique within the multi.
- On save each inner value is round-tripped through its own option type's `get_value_from_input`, so every inner option's normal value shape and default behavior applies unchanged.
- Contrast with `multi-picker` (choose-one-then-reveal) and `multi-select` (array of choice keys) — `multi` always renders and stores ALL its inner options together.
