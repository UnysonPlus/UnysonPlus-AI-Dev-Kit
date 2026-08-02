# `team_member` — Team Member

A single team-member card: photo + name + job title + short description. Leaf node: `{ type:'simple', shortcode:'team_member', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `image` | upload | `''` | `{ attachment_id, url }` | The member's photo. Square headshots line up most consistently in a row. |
| `name` | text | `''` | string | Person's name — the most prominent line in the card. |
| `job` | text | `''` | string | Role / job title, shown under the name. Keep it to one line. |
| `desc` | textarea | `''` | plain text / HTML | Short bio or specialty line (rendered raw). |
| `card_rows` | addable-popup (Card Rows) | seeded (image / name+job / desc rows) | array of `{ slots:[…], direction, justify, align }` | **Card Rows** designer (**Card tab**) — arrange the member's slots into rows and set inline / stacked + alignment; a slot shows only when it's in a row and has content. Slots: `media` (Image), `name`, `job`, `desc`. Shared `sc_card_rows_field()` helper (with `testimonials` / `posts` / `wc_products`). The default rows reproduce the classic stacked look, so existing members render unchanged. |
| `box_style` | box-style picker | see Notes | box-preset picker object | Card border/corners/shadow/fill (+ hover) Box Preset, on the **Card tab** (`sc_card_box_style_field()`). |
| `image_style` | image-style picker | `''` | preset slug | Reusable **Image Style** (crop, corners, mask, filter, scrim) applied to the member photo, on the **Card tab**. Manage presets in Theme Settings → Components → Image Styles. |
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
- The card layout is now driven by the shared **Card Rows** designer on the **Card tab** (`card_rows`) — a drag-sortable list of rows, each picking & ordering slots (`media`, `name`, `job`, `desc`) with Direction (inline / stacked) + Distribute + Align, above a **live wireframe card preview**. The default rows reproduce the classic image-on-top / name / job / desc stack, so leaving it untouched keeps the old look. To build a team grid, wrap several cards in a multi-column row.
- No built-in social links — put icons inline in `desc` (raw HTML) or compose adjacent icon elements.
- `box_style` is a Box Preset picker (Theme Settings → Components → Box Presets). Colors use the **compact color-preset** shape `{ predefined, custom }`, not a raw hex string. See `README.md`.
