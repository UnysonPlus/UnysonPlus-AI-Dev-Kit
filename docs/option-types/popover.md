# popover

**Container option.** A compact trigger field that reveals its inner option(s) in an anchored, in-flow disclosure panel (optionally tabbed). Stores nothing of its own — either passes ONE inner option's value straight through, or a keyed hash of several.

## Stored value shape
Depends on how many inner options it hosts:
```json
// PASSTHROUGH — exactly one flat inner option, no tabs:
// the value IS that inner option's value, unchanged.
"large"                       // e.g. wrapping a select
{ "preset": "custom", "custom": { … } }   // e.g. wrapping a multi-picker

// MULTI — 2+ inner options and/or tabs:
// a hash keyed by inner option id (like `multi`).
{
  "<inner_option_id_1>": "<that option's value>",
  "<inner_option_id_2>": "<that option's value>"
}
```

## Fields
| key | type | notes |
|---|---|---|
| (passthrough) | (inner option's shape) | with ONE flat inner option and no tabs, the popover is transparent — its value equals the wrapped option's value. A drop-in replacement for that option. |
| `<inner_id>` | (per inner option) | with 2+ inner options (or tabs), one key per hosted option, each holding that option type's own value. Tabs are visual grouping only — ids must be unique across all tabs, and the value stays flat. |

## Notes / gotchas
- **Pure display container** — no value of its own. Passthrough (single inner option) or a `multi`-style keyed hash (2+ options / tabs).
- **Default value is `null`**; it resolves to the inner option(s)' defaults on first save.
- **Passthrough idempotency:** re-saving an already-stored value (e.g. page-builder Update) arrives WITHOUT the inner-id wrapper key — the code detects this and passes the value through directly, so complex inner values aren't reset to default. (Relevant when wrapping a `multi-picker`.)
- Tabs (`tabs` config, Background-Pro style) only group inner options visually; the persisted value is flat/unnested regardless of tab.
- `summary` / `summary_key` / `reflect` / `autoclose` / `trigger_label` are display config controlling the trigger label and panel behavior — not part of the stored value.
- Distinct from the modal `popup` type — `popover` is an anchored inline disclosure (like the color picker's collapsed dropdown).
