# `announcement_pill` — Announcement Pill

A compact rounded badge with an optional leading sub-tag, a message, markers/icons, and an optional link — the "New / Beta / We just shipped" strip. Leaf node: `{ type:'simple', shortcode:'announcement_pill', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `tag_text` | text | `'New'` | string | The small leading badge text (e.g. "New", "Beta", "Pro"). Empty = no sub-tag. |
| `message` | text | `'We just shipped v2.0'` | string | The main pill text. |
| `link` | text | `''` | URL / path | Makes the whole pill a link. External `https://` opens in a new tab automatically. Empty = non-clickable. |
| `leading` | select | `'none'` | `none` `dot` `pulse` `icon` | Small marker before the sub-tag. `pulse` animates (live/now-available); `icon` uses `leading_icon`. |
| `leading_icon` | icon-v2 | see Notes | icon-v2 object | Icon used only when `leading` = `icon`. |
| `trailing_icon` | icon-v2 | see Notes | icon-v2 object | Optional icon after the message (e.g. an arrow on a linked pill). |
| `style` | image-picker | `'soft'` | `soft` `outline` `solid` `subtle` `ghost` `gradient` `glass` | Pill visual treatment. Colors come from the Styling tab. |
| `shape` | select | `'pill'` | `pill` `rounded` `square` | Corner rounding. |
| `size` | select | `'md'` | `sm` `md` `lg` | Pill size. |
| `align` | select | `'start'` | `start` `center` `end` | Horizontal alignment. |
| `tag_style` | select | `'filled'` | `filled` `soft` `outline` `none` | How the leading sub-tag is drawn. |
| `hover` | select | `'lift'` | `none` `lift` `glow` `slide` | Hover feedback (most noticeable when linked). `slide` nudges the trailing icon. |
| `pill_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Drives fill / border / text. Empty = neutral grey. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Message text color override. |
| `tag_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Sub-tag color. Empty = the Pill Color. |
| `gradient_from` | color-preset | `{predefined:'',custom:''}` | compact color object | Gradient start (Gradient style only). |
| `gradient_to` | color-preset | `{predefined:'',custom:''}` | compact color object | Gradient end (Gradient style only). |
| `link_target` | select | `'auto'` | `auto` `_self` `_blank` | Where the link opens. External links always get `rel="noopener noreferrer"`. |
| `rel_nofollow` | switch | `'no'` | `'yes'` \| `'no'` | Adds `rel="nofollow"`. |
| `rel_sponsored` | switch | `'no'` | `'yes'` \| `'no'` | Adds `rel="sponsored"` (paid/affiliate links). |
| `rel_ugc` | switch | `'no'` | `'yes'` \| `'no'` | Adds `rel="ugc"` (user-generated content). |
| `aria_label` | text | `''` | string | Fuller screen-reader label. Empty = the visible message. |
| `title_attr` | text | `''` | string | Native hover tooltip. |
| `dismissible` | switch | `'no'` | `'yes'` \| `'no'` | Adds a × that hides the pill and remembers the choice in the browser. |
| `dismiss_id` | text | `''` | string | Unique key so dismissal is remembered independently. Required for Dismissible. |
| `schema_enable` | switch | `'no'` | `'yes'` \| `'no'` | Emit schema.org SpecialAnnouncement JSON-LD. Use only for a genuine announcement. |
| `schema_name` | text | `''` | string | Announcement name for structured data. Empty = the message. |
| `schema_date` | text | `''` | ISO date, e.g. `2026-06-28` | Date posted for structured data. |

## Ready-to-use example (the atts object)
```json
{
  "tag_text": "New",
  "message": "Version 2.0 is here",
  "link": "",
  "leading": "pulse",
  "style": "soft",
  "shape": "pill",
  "size": "md",
  "align": "center",
  "tag_style": "filled",
  "hover": "lift",
  "pill_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" },
  "tag_color": { "predefined": "", "custom": "" },
  "link_target": "auto",
  "rel_nofollow": "no",
  "rel_sponsored": "no",
  "rel_ugc": "no",
  "dismissible": "no",
  "dismiss_id": "",
  "schema_enable": "no"
}
```

## Notes
- Switches are string `'yes'`/`'no'`, not booleans.
- `leading_icon` / `trailing_icon` use the **icon-v2** shape. No icon: `{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`. Lucide: `{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`.
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- The Gradient style reads `gradient_from` / `gradient_to`; other styles read `pill_color`.
- Only enable `schema_enable` for a real announcement — misused structured data can hurt SEO.
