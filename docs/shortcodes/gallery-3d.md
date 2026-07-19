# `gallery_3d` — 3D Gallery

An animated 3D image showcase — a set of images arranged into a rotating/scrolling 3D scene (Carousel Ring, Panorama Wall, Card Sphere, Orbit Globe). **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'gallery_3d', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `images` | multi-upload | `[]` | array of `{ attachment_id, url }` | The cards of the 3D scene (order = display order). |
| `design_settings` | multi-picker | `{design:'carousel_ring'}` | see Notes | Chosen 3D design + that design's controls. |
| `as_background` | section-background switch | `'no'` | `'yes'` \| `'no'` | Fill the parent Section and sit behind its content (Stage Height ignored; always auto-animates). |
| `box_style` | box-style picker | box-preset object | box-preset picker object | Reusable Box Preset (border/fill/hover) on each card. |
| `shadow` | box-shadow | `{x:0,y:6,blur:16,spread:-4,color:'rgba(0,0,0,0.35)',inset:false}` | box-shadow object | Card drop shadow. |
| `captions` | select | `'none'` | `none` `hover` `below` | Show a caption per card. |
| `caption_source` | select | `'caption'` | `caption` `title` `alt` `description` | Which Media field feeds the caption. |
| `click_action` | select | `'none'` | `lightbox` `none` | Open the full image in the lightbox on card click. |

## Ready-to-use example (the atts object)
```json
{
  "images": [
    { "attachment_id": "", "url": "https://example.com/1.jpg" },
    { "attachment_id": "", "url": "https://example.com/2.jpg" },
    { "attachment_id": "", "url": "https://example.com/3.jpg" }
  ],
  "design_settings": {
    "design": "carousel_ring",
    "carousel_ring": {
      "drive": "auto", "allow_drag": "yes", "speed": 16, "direction": "left",
      "hover_behavior": "slow", "drag_momentum": "yes",
      "tilt": -28, "ring_opening": 55, "roll": 0, "ring_size": 80, "spacing": 100,
      "perspective": 18, "back_fade": 70,
      "card_size": 21, "card_ratio": "1-1", "corner_radius": 6, "padding": 0,
      "height": { "value": 730, "unit": "px" },
      "background": { "predefined": "", "custom": "" }
    }
  },
  "as_background": "no",
  "shadow": { "x": 0, "y": 6, "blur": 16, "spread": -4, "color": "rgba(0,0,0,0.35)", "inset": false },
  "captions": "none",
  "caption_source": "caption",
  "click_action": "none"
}
```

## Notes
- `design_settings` is a **multi-picker**: `{ "design": "<slug>", "<slug>": { …that design's controls… } }`. Only the active branch is required; the safe generator emits all four defaulted plus the active one. Designs: `carousel_ring` `panorama_wall` `card_sphere` `orbit_globe`.
- **Shared per-design controls** (present in every branch): `drive` (motion — `auto`/`continuous` + `scroll`/`static`), `allow_drag` (`'yes'`/`'no'`), `speed` (loop seconds), `direction` (`left`/`right`, Panorama also `alternate`), `hover_behavior` (`none`/`pause`/`slow`), `drag_momentum` (`'yes'`/`'no'`), `card_ratio` (`1-1` `4-3` `3-4` `16-9` `9-16`), `corner_radius`, `padding`, `height` (unit-input `px`/`vh`), `background` (compact color, `kind: bg`).
- **Per-design fields:** `carousel_ring` → `tilt` `ring_opening` `roll` `ring_size` `spacing` `perspective` `back_fade` `card_size(21)`. `panorama_wall` → `rows(5)` `columns(11)` `curvature(-100)` `tilt(0)` `gap(5)` `edge_fade(0)` `perspective(68)` `card_size(20)` `card_ratio('16-9')`. `card_sphere` → `globe_size(70)` `gap(2.5)` `back_fade(55)` `tilt(0)` `perspective(55)` `card_size(20)` `card_ratio('16-9')`. `orbit_globe` → `globe_size(50)` `gap(2.5)` `back_fade(55)` `tilt(27)` `card_size(28)` `card_ratio('1-1')` (no perspective/padding).
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- Colors (`background`, `box_style`) use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- Captions/alt read from each image's Media Library fields (per `caption_source`), not from the atts.
