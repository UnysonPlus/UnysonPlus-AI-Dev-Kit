# wp-editor

The WordPress TinyMCE / Quicktags rich-text editor as an option. Stores an HTML string — nothing more.

## Stored value shape
```json
"<p>Rich <strong>HTML</strong> content.</p>"
```
Default: `""` (empty string).

## Fields
| key | type | notes |
|---|---|---|
| *(the value itself)* | string | the editor's HTML markup. |

## Notes / gotchas
- The stored value is a **plain HTML string**, not an object.
- When `wpautop` is `true` (default), the value is run through `wpautop()` (with literal newlines stripped) on save, so paragraphs/line-breaks are baked into the saved markup.
- Config-only keys (`size`, `editor_height`, `editor_type`, `wpautop`, `dynamic_content`, `shortcodes`) affect the editor UI, not the value shape.
- If shortcodes are enabled, shortcode text lives inline in the same HTML string; it is not resolved until render (`do_shortcode`).
- Output is raw HTML — escape/sanitize on the consuming side as appropriate.
