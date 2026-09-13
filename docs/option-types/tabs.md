<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# tabs

**Container option.** Groups nested options into a compact **in-option tab strip** — small uppercase pills, one panel of controls per tab, with an optional green "customized" dot per tab. Extracted from the tab UI `background-pro` uses internally, so any option can reuse it: Scroll Keyframes' Start / Middle / End states, normal / hover pairs, per-breakpoint sets, etc. Stores one value keyed **by tab, then by inner option**.

## When to use (vs. the `tab` container type)
- The framework's **`tab` CONTAINER type** organizes the options *tree* at the modal's top level (Content / Styling / Animations …) and holds **no value**. It can't live inside a value-holding option (a `multi-picker` choice's group, say).
- **`tabs` is a value-holding OPTION type** — it stores a value and can live anywhere an option can, including nested inside another option. Use it for a *compact* tabbed group of controls; use the container `tab` for top-level modal tabs.

## Stored value shape
```json
{
  "<tabId>": { "<innerId>": "<that option's value>", "…": "…" },
  "<tabId2>": { "…": "…" }
}
```
Concrete (Scroll Keyframes' states — a `tabs` with `start` / `mid` / `end`):
```json
{ "start": { "x": 0, "y": 40, "opacity": 0 },
  "mid":   { "enable": "no", "x": 0, "y": 0 },
  "end":   { "ease": "out", "x": 0, "y": 0 } }
```

## Fields (option definition)
| key | type | notes |
|---|---|---|
| `tabs` | array | `{ <tabId> => { title, options } }`. `title` = the pill label; `options` = a standard Unyson options array rendered in that tab's panel (any option types). |
| `dots` | bool | `false` default. When on, each tab shows a "customized" dot when its saved value differs from its inner options' defaults. |
| `value` | array | `{}` default — the stored value (shape above); fills in from inner defaults. |
| `label` | bool/string | usually `false` (the inner options carry their own labels). |

## Notes / gotchas
- **Namespaced per tab** — unlike `multi` (which flattens all inner ids at one level), `tabs` nests: each tab is its own key, then the inner option ids under it. So the same inner id (`x`, `y`, …) can repeat across tabs.
- Each panel renders through `render_options` with `id_prefix` / `name_prefix`, so inner controls keep native label/desc chrome and correctly namespaced inputs; on save each inner value round-trips through its own option type's `get_value_from_input` (normal value shapes + defaults apply).
- **Eager-registered** in `bootstrap.php` (like the other plugin-only composite types), so `'type' => 'tabs'` resolves before any `options.php` uses it.
- **Nested in a tight container** (a `multi-picker` popover panel, an addable-box row) it carries its own margin/gutter so the card never presses flush against the walls — safe to drop inside those.
- Reduce-motion / assets: pulls in every nested control's CSS/JS via `enqueue_options_static`; its own CSS/JS are file-mtime cache-busted so edits show on a normal reload.
- First adopter: **Scroll Keyframes** (Start / Middle / End states). Candidates to migrate later: box / icon-badge / button / table presets, and `background-pro` itself.
