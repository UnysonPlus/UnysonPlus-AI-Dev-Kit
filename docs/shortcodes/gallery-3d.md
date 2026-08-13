# `gallery_3d` — 3D Gallery

An animated 3D image showcase — a set of images arranged into a rotating/scrolling/scattered 3D scene (Carousel Ring, Panorama Wall, Card Sphere, Orbit Globe, Sphere Cascade, Photo Scatter, Card Stack, Device Cycler). **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved instances render empty). Leaf node: `{ type:'simple', shortcode:'gallery_3d', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `source` | multi-picker | `{kind:'media'}` | `{ kind:'media'\|'posts', media:{images:[…]}, posts:{post_type,count,orderby} }` | Where the cards come from. **Media Library** → `media.images` (multi-upload of `{attachment_id,url}`, order = display order); **Post Type** → builds cards from a post type's featured images (`posts.post_type`, `posts.count` 1–200, `posts.orderby` `date_desc`/`date_asc`/`title`/`menu_order`/`rand`). *(Legacy flat `images` key is still read as a view fallback.)* |
| `design_settings` | multi-picker | `{design:'carousel_ring'}` | see Notes | Chosen 3D design + that design's controls. |
| `as_background` | section-background switch | `'no'` | `'yes'` \| `'no'` | Fill the parent Section and sit behind its content (Stage Height ignored; always auto-animates). |
| `box_style` | box-style picker | box-preset object | box-preset picker object | Reusable Box Preset (border/fill/hover) on each card. |
| `shadow` | box-shadow | `{x:0,y:6,blur:16,spread:-4,color:'rgba(0,0,0,0.35)',inset:false}` | box-shadow object | Card drop shadow. |
| `captions` | select | `'none'` | `none` `hover` `below` | Show a caption per card. |
| `caption_source` | select | `'caption'` | `caption` `title` `alt` `description` | Which Media field feeds the caption. |
| `click` | multi-picker | `{action:'none'}` | `action`: `lightbox` `link` `none` | On card click: **Open Lightbox** (full image in the shared gallery lightbox), **Open Link** (follows each card's link — its post's page for the Post Type source, or the image's "Link URL" for Media Library), or **Do Nothing**. *(Legacy flat `click_action` scalar is still read as a view fallback.)* |

## Ready-to-use example (the atts object)
```json
{
  "source": {
    "kind": "media",
    "media": {
      "images": [
        { "attachment_id": "", "url": "https://example.com/1.jpg" },
        { "attachment_id": "", "url": "https://example.com/2.jpg" },
        { "attachment_id": "", "url": "https://example.com/3.jpg" }
      ]
    },
    "posts": { "post_type": "post", "count": "12", "orderby": "date_desc" }
  },
  "design_settings": {
    "design": "carousel_ring",
    "carousel_ring": {
      "motion": { "mode": "auto", "auto": { "speed": 16, "direction": "left", "hover_behavior": "slow" } },
      "allow_drag": "yes", "drag_momentum": "yes",
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
  "click": { "action": "none" }
}
```

## Notes
- `design_settings` is a **multi-picker**: `{ "design": "<slug>", "<slug>": { …that design's controls… } }`. Only the active branch is required; the safe generator emits all branches defaulted plus the active one. Designs: `carousel_ring` · `panorama_wall` · `card_sphere` · `orbit_globe` · `sphere_cascade` · `photo_scatter` · `card_stack` · `device_cycler`.
- **Shared controls on the spinning designs** (`carousel_ring` · `panorama_wall` · `card_sphere` · `orbit_globe` · `sphere_cascade`): `motion` — an inline multi-picker `{ mode, <mode>:{…} }` whose `mode` is `auto`/`continuous` (branch: `speed` loop seconds, `direction`, `hover_behavior` `none`/`pause`/`slow`), `scroll` (branch: `pin` `'yes'`/`'no'`, `scroll_length` viewports, `direction`), or `static`; `direction` is `left`/`right` (Panorama & Sphere Cascade also `alternate`; Sphere Cascade uses `up`/`down`). Plus `allow_drag` (`'yes'`/`'no'`), `drag_momentum` (`'yes'`/`'no'`), `card_ratio` (`1-1` `4-3` `3-4` `16-9` `9-16`), `corner_radius`, `padding`, `height` (unit-input `px`/`vh`), `background` (compact color, `kind: bg`).
- **Per-design fields** (defaults in parens):
  - `carousel_ring` → `tilt` · `ring_opening` · `roll` · `ring_size` · `spacing` · `perspective` · `back_fade` · `card_size(21)`
  - `panorama_wall` → `rows(5)` [set `rows(1)` + `curvature(0)` = a flat film-strip/marquee horizontal pan] · `columns(11)` · `curvature(-100)` · `tilt(0)` · `gap(5)` · `edge_fade(0)` · `perspective(68)` · `card_size(20)` · `card_ratio('16-9')`
  - `card_sphere` → `globe_size(70)` · `gap(2.5)` · `back_fade(55)` · `tilt(0)` · `perspective(55)` · `card_size(20)` · `card_ratio('16-9')`
  - `orbit_globe` → `globe_size(50)` · `gap(2.5)` · `back_fade(55)` · `tilt(27)` · `card_size(28)` · `card_ratio('1-1')` (no perspective/padding)
  - `sphere_cascade` *(Sphere Cascade — the vertical, spherical sibling of Panorama Wall; columns of cards cascade over a signed-curvature surface: concave bowl → flat grid → full convex sphere)* → `columns(5, 2–5)` · `curvature(-100, −150…150 — negative concave, +150 wraps into a full sphere, 0 flat)` · `tilt(0)` · `gap(5)` · `edge_fade(0)` · `card_size(18)` · `card_ratio('16-9')` · `corner_radius(4)` · `padding(13)`
  - `photo_scatter` *(Stack & Scatter — flat tabletop scatter; no Motion picker, its own `cycle` instead)* → `cycle` multi-picker `{ mode:'scroll_cycle'|'scroll'|'auto'|'click'|'off', auto:{ dwell(6, s), hover_pause('yes') }, scroll_cycle:{ final_organized('yes'), corners('no') } }`. **Modes:** `scroll_cycle` = **scatter in & out on scroll** (a cinematic pile) — each set of `visible` photos flies in from the enter edge, holds, then sweeps back out as the visitor scrolls, one set after another (`pool ÷ visible` = number of sets); `final_organized('yes')` makes the LAST set arrive as a tidy upright grid entering from the bottom (the "search results" resolution), and `corners('yes')` leaves two photos of the set before it lingering in the corners as the grid enters · `scroll` = **scatter→organize** (the single-set morph: one pile untangles into a grid as you scroll) · `auto`/`click` = cycle sets on a timer / click · `off` = one static scatter. Enter/exit apply to every cycling mode: `from` = **Photos enter from** (`edges`/`top`/`bottom`/`sides`/`random`) · `exit` = **Photos exit toward** (`sweep` nearest-edge / `up` / `down` / `sides` / `gather` centre-pile / `fade`). Layout: `visible(3–50, = cards per set; push to 30–50 for a dense edge-to-edge scatter)` · `rotation(12°)` · `size_variance(30%)` · `spread(90%)` · `center_clear('no'/'yes')` · `card_size(18)` · `card_ratio('3-4')` · `corner_radius(4)` · `padding(0)`. `center_clear('yes')` rings the photos around an empty middle so a **centered heading placed over the scatter stays readable** (the per-batch look). All modes are scroll-scrubbed with live, editable cards — nothing baked. **Nesting in a scrollytelling Stage:** a photo_scatter inside a Stage scene reads THAT scene's own scroll slice — in a ranged **persist** layer it remaps to `[from,to]`; in a **normal beat scene** it remaps to that beat's slice, so the scatter flies in/holds/out in sync with when the scene enters and leaves. That's how you build "per-batch" sections: one beat scene = one column holding a centered heading + its OWN scatter (`center_clear:'yes'`, single set = `visible` ≥ image count), each batch with its own images / text / `from`+`exit`.
  - `card_stack` *(Card Stack — a deck of image cards; the top is featured, the rest peek behind it, and the deck advances)* → `cycle` multi-picker `{ mode:'scroll'|'auto'|'off', auto:{ dwell(2.5,s) } }` — **`scroll`** advances the deck one card per scroll (the top card peels away, the next comes forward; scrubs with a parent Scroll Story Stage when nested — reads its own beat/persist slice — best pinned) · `exit` (top card leaves `down`/`up`/`left`/`right`) · `behind` (cards peeking behind, 1–6, default 3) · `stack_offset` (how far each behind card is nudged up, %, default 5) · `stack_scale` (how much smaller each behind card is, %, default 6) · `card_ratio` (default `4-3`) · `card_size` (front card width %, default 40) · `corner_radius` · `padding`. A "use cases" deck of app windows. Each card = one editable image.
  - `device_cycler` *(Device Cycler — a device frame whose SCREEN cycles through your images as view-mode states)* → `device` (`laptop`/`tablet`/`phone`/`browser`/`none`) · `cycle` multi-picker `{ mode:'scroll'|'auto'|'off', auto:{ dwell(3,s) } }` — **`scroll`** steps one screen per scroll (scrubs with a parent Scroll Story Stage when nested; best as a persistent layer) · `transition` (`fade`/`slide_up`/`none`) · `card_ratio` (screen aspect, default `16-9`) · `card_size` (device width %, default 62) · `corner_radius`. Each image = one editable screen.
- Switch atts store the string `'yes'`/`'no'`, not booleans.
- Colors (`background`, `box_style`) use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.
- Captions/alt read from each image's Media Library fields (per `caption_source`), not from the atts.
