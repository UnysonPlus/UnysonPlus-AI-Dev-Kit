# `icon_box` — Icon Box

An icon (or emoji/SVG) paired with an optional title and body content — the standard feature-grid / stat card. Leaf node: `{ type:'simple', shortcode:'icon_box', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `icon` | icon-v2 | see Notes | icon-v2 object | The icon shown. Lucide SVG, font icon, emoji, or custom SVG. |
| `custom_icon` | hidden | `''` | legacy string | Retired field; leave `''` (the picker above supersedes it). |
| `title` | text | `''` | string | Headline next to/above the icon. Empty = icon-only box. |
| `title_tag` | select | `'h3'` | `h3` `h4` `h5` `h6` `span` `p` | Semantic tag for the title. |
| `content` | wp-editor | `''` | HTML string (WYSIWYG) | Optional body text. |
| `style` | image-picker | `'top-title'` | `top-title` `inline-left` `inline-right` `stack-left` `stack-right` `between-title-content` | Icon position / layout. |
| `icon_badge` | image-picker | `'none'` | `none` `solid-square` `solid-rounded` `solid-circle` `outline-square` `outline-rounded` `outline-circle` | **Legacy** — the simple badge shape, RETIRED from the UI (kept render-only for pages built before Icon Badge Presets). Use `icon_badge_preset` instead. |
| `icon_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Icon horizontal align (only for `top-title` / `between-title-content`). |
| `title_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Title text alignment. |
| `content_align` | alignment | `''` (inherit) | `''` `left` `center` `right` | Body text alignment. |
| `mobile_stack` | switch | `true` | `true` \| `false` \| `''` | Force icon to top on mobile. |
| `box_link` | text | `''` | URL / path | Makes the whole box clickable. |
| `link_target` | switch | `false` | `true` \| `false` | Open box link in a new tab. |
| `link_rel` | select | `'sponsored'` | `none` `nofollow` `sponsored` | `rel` on the box link. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Card border/shadow/fill preset. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Box background color (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |
| `title_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Title color. |
| `content_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Body content color. |
| `icon_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Icon color (font icons + `currentColor` SVGs). |
| `icon_size` | unit-input | `{value:'',unit:'px'}` | units `px rem em` | Icon size (default 2rem when empty). Overridden by a selected `icon_badge_preset`. |
| `icon_badge_preset` | border-style picker | `''` | `''` \| `iconb-<slug>` | **Current badge control.** A reusable Icon Badge preset (Theme Settings → Components → Icon Badges) — a shaped tile with its own icon colour/size + hover fx. Stamps `.iconb-<slug>` on the icon wrapper; its `!important` CSS drives shape/fill/colour/size. See [../option-types/icon-badge-presets.md](../option-types/icon-badge-presets.md). |
| `icon_badge_color` | color-preset | `{predefined:'',custom:''}` | compact color object | **Legacy** — paired with the retired `icon_badge` shape; RETIRED from the UI (render-only). Use `icon_badge_preset`. |

## Ready-to-use example (the atts object)
```json
{
  "icon": { "type": "svg", "svg-source": "library", "svg-id": "lucide/zap" },
  "custom_icon": "",
  "title": "Intelligent Automation",
  "title_tag": "h3",
  "content": "Automate repetitive tasks with AI-driven workflows that learn from your team.",
  "style": "top-title",
  "icon_align": "left",
  "title_align": "left",
  "content_align": "left",
  "mobile_stack": "",
  "box_link": "",
  "link_target": false,
  "link_rel": "",
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": "",
  "title_color": { "predefined": "", "custom": "" },
  "content_color": { "predefined": "", "custom": "" },
  "icon_color": { "predefined": "", "custom": "" },
  "icon_badge_preset": ""
}
```

## Notes
- `icon` uses the **icon-v2** shape. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`. No icon: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Emoji/custom SVG are other `type`s from the same picker.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- The proven build helper zeroes the wrapper's baked-in padding via `common.custom_css`: `selector.icon-box__wrapper{padding:0}` (the scope class lands ON the wrapper — use `selector.icon-box__wrapper`, not a descendant selector). Use this when placing an icon_box inside a card whose Box Preset already provides padding.
- `content` is WYSIWYG — keep it plain semantic HTML with no classes on `<p>`/`<li>` (see `text-block.md`).
- For a card + button (content the icon_box can't hold), render `icon_box` + `button` in the column and put the box style on the column's Inner Wrapper Class instead of `box_style`.
- **Icon badges:** the current control is `icon_badge_preset` (a reusable [Icon Badge preset](../option-types/icon-badge-presets.md) → `iconb-<slug>`). When set it fully styles the badge (shape/fill/border/shadow + icon colour & size) and supersedes the retired `icon_badge` shape + `icon_badge_color`. Those two still render for pages that saved them, but new work should use `icon_badge_preset` only.
