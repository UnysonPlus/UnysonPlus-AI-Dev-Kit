# code-editor
A syntax-highlighted code field wrapping WordPress core's bundled CodeMirror (HTML/CSS/JS/PHP/JSON/XML). Used for Custom CSS fields (button/border presets), the Code Block shortcode, and any raw-code option.

## Stored value shape
```json
"{{SELECTOR}} { color: red; }"
```
The value is a **plain string** — the raw code, exactly as typed (no wrapping object).

## Fields
| key | type | notes |
|---|---|---|
| (value) | string | the raw code text, verbatim. |

## Notes / gotchas
- **Default is `""`.** `null` input (field absent) falls back to the option's `value`.
- **Storage is identical to the `textarea` option type** — switching a `textarea` to `code-editor` is data-shape compatible, no migration needed.
- `mode` (e.g. `htmlmixed`/`css`/`javascript`/`php`/`json`/`xml`), `height` (px), and `placeholder` are config only — they do NOT affect the stored value.
- Falls back to a plain textarea when the user disabled syntax highlighting in their WP profile; the saved string is the same either way.
