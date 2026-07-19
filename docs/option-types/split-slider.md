# split-slider

A visual N-pane width control (1–5+ segments obeying the 100%-rule): a full-width bar split into panes by draggable dividers, with +/− to add/remove panes and an optional editable name per pane. Generalises `column-split` (the fixed 2-pane case) to any number of named percentage-width columns.

## Stored value shape
```json
[
  { "w": 20, "name": "Logo" },
  { "w": 55, "name": "Details" },
  { "w": 25, "name": "CTA" }
]
```
Widths always sum to exactly 100. Default: `[ {"w":50,"name":""}, {"w":50,"name":""} ]`.

## Fields
| key | type | notes |
|---|---|---|
| `w` | int | segment width as a whole-number percentage. All segments in the array sum to exactly 100 (rounding drift is corrected on the largest segment; `denominator>0` snaps to grid fractions). |
| `name` | string | optional per-segment label; falls back to its 1-based index in the UI when empty. |

## Notes / gotchas
- **Empty array `[]` = AUTO** (equal columns) — the value is stored empty until the user actually sets widths; the UI previews `auto_count` equal panes.
- Accepts a legacy shape on input: a plain array of numbers (`[50,50]`) or a JSON string; both are normalized to the `{w,name}` array. A bare number becomes `{w:<n>,name:''}`.
- Segment count is clamped to `[min, max]` (defaults 1–5); each segment is at least `min_width`% (default 10).
- `denominator` config (default 0): when >0, widths snap to whole grid units (e.g. 12) via largest-remainder, so an equal split renders truly equal (16.6667% each for 6 cols) instead of a fat first column from integer rounding.
- Config-only keys (`min`/`max`/`step`/`min_width`/`allow_names`/`auto_count`/`locked`/`denominator`) are NOT stored — only the segment array persists.
