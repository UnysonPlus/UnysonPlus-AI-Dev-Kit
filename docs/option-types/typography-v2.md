# typography-v2

**Same option type as [`typography`](typography.md) — see that page for the full value shape, fields, and gotchas.** `typography-v2` is a deprecation alias: it saves identically and requires no data migration (the type string isn't stored, so v2-authored values load unchanged under `typography`).

## Stored value shape
```json
{ "family": "", "variation": "", "size": {}, "line-height": "", "letter-spacing": "", "color": "" }
```
Identical to `typography`: `{ family, variation, size, line-height, letter-spacing, color }` (plus `style`/`weight`/`google_font`/`subset` metadata). Only the enabled `components` are meaningfully stored.

## Notes / gotchas
- Everything in [`typography.md`](typography.md) applies verbatim — most importantly `size` is polymorphic (legacy int / `{value,unit}` hash / JSON string); always resolve via `fw_typography_size_css($size,'px')`.
- Treat `typography-v2` and `typography` as interchangeable; prefer `typography` in new code.
