# compact-color (`predefined-colors-color-picker-compact`)

A compact one-row control: a palette-**PRESET dropdown** + an inline **custom color picker** (mutually exclusive). The exact control the Styling tab's Text Color / Background Color use. Built via `sc_color_field_compact(['kind'=>'text'|'bg'])`. Keeps element colors tied to Theme Settings → Colors (live-linked) instead of one-off hex.

## Stored value shape
```json
{ "predefined": "text-red", "custom": "" }
```
A HASH, not a plain hex string. Examples: `{predefined:"bg-primary",custom:""}`, `{predefined:"",custom:"#f97316"}`, empty `{predefined:"",custom:""}`.

## Fields
| key | type | notes |
|---|---|---|
| `predefined` | string | the CSS **class name** verbatim: `text-<slug>` (kind `text`) or `bg-<slug>` (kind `bg`), or `''`. **WINS when both are set.** Slugs come from the live palette (`unysonplus_color_preset_slug_map()`). |
| `custom` | string | a hex/rgba string, or `''`. Only used when `predefined` is empty. |

## Notes / gotchas
- **`predefined` wins** (mutual exclusion). To use a custom hex, leave `predefined` empty.
- **Legacy-string tolerance:** a bare hex string is rescued into `{predefined:<string>,custom:''}`. Resolvers tolerate the string, so both shapes funnel through one path.
- Two consumer resolvers: class/inline-style → `sc_normalize_color_value($value,$kind)` → `{class,style}`; CSS-var/JS-hex → `sc_color_to_css()` → `predefined` becomes `var(--color-{slug})` (**strip** the `text-`/`bg-` prefix), or a real hex via the slug→hex map for Three.js.
- **EXCEPTION:** the palette-DEFINITION UI stays a raw `color-picker` (you can't pick a preset to define a preset). This type is for CONSUMING colors on elements.
- Migrating an existing `color-picker` (hex string) to this type is a value-shape change (string → hash).
