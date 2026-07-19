# `site_logo` — Site Logo

Renders the site logo or title. Self-contained (no theme functions) so it works in any theme: a custom uploaded image, else the Customizer custom logo, else the site title text. A header/footer element. Leaf node: `{ type:'simple', shortcode:'site_logo', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | select | `'site_identity'` | `site_identity` (Customizer logo/title) `custom` (upload below) | Where the logo comes from. |
| `custom_image` | upload | `''` | attachment `{attachment_id,url}` | Used only when `source=custom`. |
| `link_home` | switch | `'yes'` | `'yes'` \| `'no'` | Wrap the logo in a link to the home page. |
| `max_height` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Optional max image height (width scales automatically). |
| `alignment` | select | `''` | `''` (default) `start` (left) `center` `end` (right) | Horizontal alignment. |

## Ready-to-use example (the atts object)
```json
{
  "source": "site_identity",
  "custom_image": "",
  "link_home": "yes",
  "max_height": { "value": "40", "unit": "px" },
  "alignment": ""
}
```

## Notes
- `site_identity` uses the logo/title from Appearance → Customize; `custom` uses the `custom_image` upload. When `source=site_identity` you can leave `custom_image` empty.
- The render falls back gracefully: custom image → Customizer logo → site title text (`.sc-site-logo__title`).
- `alignment` maps `start` / `center` / `end` to Bootstrap `text-*` classes.
- This shortcode has only a Content tab + the shared Advanced tab (no Styling/Animations tabs).
