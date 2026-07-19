# switch

A two-state toggle (an on/off pill with left/right labels). Stores ONE of the two configured choice values — nothing else.

## Stored value shape
```json
"yes"
```
The value is exactly the `left-choice.value` or `right-choice.value` you configure. Framework defaults are booleans:
```json
false   // left-choice (label "No")  — the default
true    // right-choice (label "Yes")
```
In this codebase the common convention is `'no'` / `'yes'` strings (set via `left-choice.value` / `right-choice.value`).

## Fields
| key | type | notes |
|---|---|---|
| *(the value itself)* | scalar | one of the two choice values. Whatever type you set them to — `bool`, `'yes'`/`'no'`, `1`/`0`, arbitrary strings — is what is stored and returned. |

## Notes / gotchas
- Not an object — the stored value is a **single scalar**, equal to one of the two `*-choice.value` settings.
- Default value (`'value' => null`) resolves to `left-choice.value` (i.e. the "off"/No side) on save.
- The `<input>` carries a JSON-encoded value for legacy JS; the SAVED option value is the plain choice value, not JSON. Prefer reactive options over reading the input's JSON in JS.
- If a submitted value isn't one of the two configured choices, it falls back to the option's `value` (or `left-choice.value`).
- `left-choice` / `right-choice` (label, value, optional `#hex` color) are config, not stored.
