# button-hover-animation
A select-like dropdown whose panel is a 3-column grid of live buttons, each previewing a hover effect. Selecting writes the effect's CSS class. Used on the button element / button presets for the hover-animation field.

## Stored value shape
```json
"btnfx-lift"
```
The value is a **single string** — the chosen effect's class (e.g. `btnfx-lift`), or `""` for None.

## Fields
| key | type | notes |
|---|---|---|
| (value) | string | one choice key from `choices` (a `.btnfx-<effect>` class), or `""` for None. |

## Notes / gotchas
- **Default is `""`.** On save the value is whitelisted against `choices`; `""` (None) is always allowed; unknown values fall back to the previously-saved value.
- The consuming view just appends the class to the button's `<a class="btn ...">`.
- A dedicated type (not a `button-style-picker` reuse) purely so its `_enqueue_static` reliably loads the `fx_css` stylesheet defining `.btnfx-*` in the options modal.
