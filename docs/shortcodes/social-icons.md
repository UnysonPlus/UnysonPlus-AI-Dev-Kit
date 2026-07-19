# `social_icons` — Social Icons

A row of social **profile** links. `theme_settings` delegates to the theme's own social-profile renderer (so it matches the site); `manual` renders the list defined in the shortcode. A header/footer element. (Distinct from `social_share`, which are share-to buttons.) Leaf node: `{ type:'simple', shortcode:'social_icons', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | select | `'theme_settings'` | `theme_settings` (delegate to theme) `manual` (list below) | Where the profiles come from. |
| `profiles` | addable-box | `[]` | array of profile objects (see below) | Used only when `source=manual`. |
| `size` | select | `'md'` | `sm` `md` `lg` | Icon size. |

Each **profile** object: `icon` (icon-v2), `link` (text — URL), `label` (text — accessible/screen-reader text, e.g. "Facebook").

## Ready-to-use example (the atts object)
```json
{
  "source": "manual",
  "profiles": [
    { "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/facebook" },  "link": "https://example.com/",  "label": "Facebook" },
    { "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/instagram" }, "link": "https://example.com/",  "label": "Instagram" },
    { "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/linkedin" },  "link": "https://example.com/",  "label": "LinkedIn" }
  ],
  "size": "md"
}
```

## Notes
- With `source=theme_settings` the shortcode reuses the theme's configured profiles and ignores `profiles`; use `manual` to define links inline.
- Each icon uses the **icon-v2** shape (see `icon-box.md`). External links get `target="_blank"` + `rel="noopener noreferrer"` automatically.
- `label` is screen-reader text and should be set for accessibility even though the icon carries the visual meaning.
- This shortcode has only a Content tab + the shared Advanced tab (no Styling/Animations tabs).
