# `team_member` — Team Member

A single team-member card: photo + name + job title + short description. Leaf node: `{ type:'simple', shortcode:'team_member', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | `{ attachment_id, url }` | The member's photo. Square headshots line up most consistently in a row. |
| `name` | text | `''` | string | Person's name — the most prominent line in the card. |
| `job` | text | `''` | string | Role / job title, shown under the name. Keep it to one line. |
| `desc` | textarea | `''` | plain text / HTML | Short bio or specialty line (rendered raw). |
| `box_style` | box-style picker | see Notes | box-preset picker object | Card border/shadow/fill preset. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Wrapper text color. |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Card background (`kind: bg`). |
| `font_size_preset` | font-size preset | `''` | preset slug | Named body font-size preset. |

## Ready-to-use example (the atts object)
```json
{
  "image": { "attachment_id": 0, "url": "https://example.com/headshot.jpg" },
  "name": "Jane Doe",
  "job": "Marketing Director",
  "desc": "Leads brand strategy and content across every channel.",
  "box_style": "",
  "text_color": { "predefined": "", "custom": "" },
  "bg_color": { "predefined": "", "custom": "" },
  "font_size_preset": ""
}
```

## Notes
- `image` is a WP upload **object** (`{ attachment_id, url }`), not a URL string. When you only have a URL, set `attachment_id` to `0`.
- The card has a fixed layout (image on top, then name / job / desc). For more layout control use `icon_box` with `style: top-title`, or wrap several cards in a multi-column row to build a team grid.
- No built-in social links — put icons inline in `desc` (raw HTML) or compose adjacent icon elements.
- `box_style` is a Box Preset picker (Theme Settings → Components → Box Presets). Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
