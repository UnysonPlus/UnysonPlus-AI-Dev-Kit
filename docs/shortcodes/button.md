# `button` — Button

A single call-to-action link styled from Theme Settings button presets, with icon, size, shape, width, alignment and hover-animation controls. Leaf node: `{ type:'simple', shortcode:'button', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `label` | text | `'Submit'` | plain string | Button text. Empty = icon-only button. |
| `link` | text | `'#'` | URL / path / `#anchor` / `mailto:` / `tel:` | Destination. |
| `target` | switch | `'_self'` | `_self` \| `_blank` | Open in a new window (`_blank`). |
| `icon` | icon-v2 | none | icon-v2 object (see Notes) | Optional icon beside the label. |
| `icon_position` | select | `'after'` | `before` \| `after` | Icon before or after the label. |
| `style` | button-style-picker | first preset (e.g. `btn-primary`) | preset slug, e.g. `btn-primary` `btn-secondary` `btn-outline-*` `btn-link` | Button style from Theme Settings → Buttons. |
| `size` | button-style-picker | `''` | size slug, e.g. `btn-sm` `btn-lg` | Button size preset. |
| `shape` | image-picker | `'default'` | `default` `pill` `rounded` `square` | Corner rounding override. |
| `width` | multi-picker | `{mode:''}` | see Notes | Auto / full-width / custom width. |
| `alignment` | select | `''` | `''` `left` `center` `right` | Align button within its container. |
| `state` | select | `''` | `''` (normal) `active` `disabled` | Visual button state. |
| `hover_animation` | button-hover-animation | `''` | effect slug (or `''`) | Hover/focus motion effect. |

## Ready-to-use example (the atts object)
```json
{
  "label": "Start free trial",
  "link": "#",
  "target": "_self",
  "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/arrow-right" },
  "icon_position": "after",
  "style": "btn-primary",
  "size": "btn-lg",
  "shape": "default",
  "width": { "mode": "", "custom": { "custom_width": { "value": "", "unit": "px" } } },
  "alignment": "",
  "state": "",
  "hover_animation": ""
}
```

## Notes
- `icon` is a full **icon-v2** object. No icon = `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`; a library SVG = `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- `width` is a **multi-picker**. Default `{ "mode": "" }` = auto (fit content); `{ "mode": "w-100" }` = full width; custom = `{ "mode": "custom", "custom": { "custom_width": { "value": "200", "unit": "px" } } }` (units `px % rem em vw`). The known-good verbose shape is `{ "mode": "", "custom": { "custom_width": { "value": "", "unit": "px" } } }`.
- `style` / `size` slugs are the Bootstrap-style class names the Theme Settings presets emit (`btn-primary`, `btn-secondary`, `btn-outline-*`, `btn-link`, `btn-sm`, `btn-lg`, …). `style` defaults to the first configured preset; there is no "None" — use the link preset for text-only.
- `target` uses `_self` / `_blank` as its literal values (a switch, not `yes`/`no`). For links to an **external host**, set `_blank`.
- `shape` overrides only the border-radius the `size` preset would apply (e.g. a pill CTA at any size).
- Padding comes from the `size` preset; the shared `spacing` block controls **margin only** on a button.
