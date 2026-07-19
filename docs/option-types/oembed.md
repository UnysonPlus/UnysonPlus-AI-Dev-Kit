# oembed

A single URL field for an oEmbed-able resource (YouTube, Vimeo, Twitter, etc.) with a live embed preview. Stores just the URL string.

## Stored value shape
```json
"https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

## Fields
| — | type | notes |
|---|---|---|
| (the value) | string | the raw oEmbed URL the user entered. Cast to string on save. |

## Notes / gotchas
- **The stored value is a plain URL string** — nothing else. The embed HTML/iframe is generated at render time (via `wp_oembed_get` / `fw_oembed_get`), never stored.
- **Default is `""`** (empty string).
- The `preview` config (`width`, `height`, `keep_ratio`) and the `attr.placeholder` are option settings that shape the admin preview iframe — they are NOT part of the stored value.
- Because it is a bare string, no value-shape migration concerns apply — consumers just read the URL.
