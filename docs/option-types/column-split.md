# column-split

A visual two-pane split control: a rounded bar with a draggable divider that sets how a row is shared between a LEFT and RIGHT pane (e.g. "Image | Content").

## Stored value shape
```json
"1/2"
```
The LEFT pane's fraction as a lowest-terms `"n/d"` string. The divider snaps to the ordered `fractions` set (default = twelfths `1/12`…`11/12`).

## Fields
| key | type | notes |
|---|---|---|
| (the value itself) | string | Left-pane fraction `"n/d"`, lowest terms, proper (`0 < n < d`). Default `"1/2"`. Consumers derive flex-grow ratios (left = `n`, right = `d - n`) or grid classes from it. |

## Notes / gotchas
- **Self-identifying / legacy-tolerant:** a bare integer (the old shape — left span out of `denominator`, default 12) is still understood and migrated on the fly (it has no `/`). Switching an existing control to the fraction shape needs no data migration.
- Any incoming value is **normalized and snapped** to the nearest allowed fraction; malformed → the option default → `"1/2"`.
- `fractions` (default `null` → twelfths) is the ordered allowed set as `"n/d"` strings; pass a richer set (e.g. twelfths + fifths) to allow stops like `1/5`, `2/5`. Denominators can mix freely.
- `denominator` (default 12) is **only** used to interpret a legacy integer value.
- Config-only keys `show_fraction` (bool) and `panes` (`[ left, right ]`, each `{label, icon}` where `icon` is a `dashicons-*` class or image URL) affect rendering, not the stored value.
