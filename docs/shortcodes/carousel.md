<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `carousel` — Carousel / Slider

A touch-friendly carousel (built on Splide) of configured slides — supports hero sliders (full-bleed background image with overlaid text) and multi-slide strips. Leaf node: `{ type:'simple', shortcode:'carousel', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `slides` | addable-popup | `[]` | array of slide objects (see below) | The slides. Each is one entry. |
| `per_page` | select | `'1'` | `'1'`–`'6'` | Slides per view on desktop. |
| `per_page_tablet` | select | `'2'` | `'1'`–`'6'` | Slides per view ≤ 992px. |
| `per_page_mobile` | select | `'1'` | `'1'`–`'6'` | Slides per view ≤ 576px. |
| `as_background` | switch | `'no'` | `'yes'` \| `'no'` | **Use as Section Background**: the carousel fills its parent Section and sits behind the Section's content (shared `sc-bg-fill` runtime). Ignores per-view counts, `gap`, `height`, `arrows`, `pagination`, `drag` and `pause_hover`. |
| `gap` | text | `'1rem'` | any CSS length | Gap between slides. Empty = none. |
| `height` | text | `''` | CSS length (e.g. `600px`, `80vh`) | Fixed slide height. Empty = size to content. |
| `arrows` | switch | `'yes'` | `'yes'` \| `'no'` | Show prev / next arrows. |
| `pagination` | switch | `'yes'` | `'yes'` \| `'no'` | Show pagination dots. |
| `autoplay` | switch | `'yes'` | `'yes'` \| `'no'` | Auto-advance slides. |
| `interval` | text | `'5000'` | ms | Delay between slides. |
| `speed` | text | `'600'` | ms | Transition duration. |
| `pause_hover` | switch | `'yes'` | `'yes'` \| `'no'` | Pause autoplay on hover. |
| `loop` | switch | `'yes'` | `'yes'` \| `'no'` | Wrap last → first slide. |
| `drag` | switch | `'yes'` | `'yes'` \| `'no'` | Allow mouse drag / touch swipe. |
| `effect` | select | `'slide'` | `'slide'` `'fade'` | Fade forces 1 slide per view; with Fade, `loop` rewinds to the first slide. |
| `slow_zoom` | switch | `'no'` | `'yes'` \| `'no'` | Background images ease from 1× to 1.08× while their slide shows (lasts `interval` + `speed`). Off under `prefers-reduced-motion`. |
| `overlay` | switch | `'yes'` | `'yes'` \| `'no'` | Darken background images for text legibility. |
| `overlay_opacity` | slider | `45` | int 0–90 (step 5) | Overlay darkness (%). |
| `heading_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Slide heading color (`kind: text`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Slide paragraph color (`kind: text`). |

### slide object (`slides[]`)
`image` (upload), `image_mode` (`'background'` = text overlaid hero / `'inline'` = image above text; default `'background'`), `heading` (text), `text` (textarea), `button_label` (text), `button_link` (text, default `'#'`), `link` (text — whole-slide click when there's no button), `content_align` (`'left'`/`'center'`/`'right'`, default `'center'`).

## Ready-to-use example (the atts object)
```json
{
  "slides": [
    { "image": "", "image_mode": "background", "heading": "Build Faster", "text": "Ship in days, not months.", "button_label": "Learn More", "button_link": "#", "link": "", "content_align": "center" },
    { "image": "", "image_mode": "inline", "heading": "Scale Easily", "text": "Grow without the rewrite.", "button_label": "", "button_link": "#", "link": "", "content_align": "center" }
  ],
  "per_page": "1", "per_page_tablet": "2", "per_page_mobile": "1",
  "gap": "1rem", "height": "", "arrows": "yes", "pagination": "yes",
  "autoplay": "yes", "interval": "5000", "speed": "600", "pause_hover": "yes",
  "loop": "yes", "drag": "yes", "effect": "slide",
  "overlay": "yes", "overlay_opacity": 45,
  "heading_color": { "predefined": "", "custom": "" },
  "text_color": { "predefined": "", "custom": "" }
}
```

## Notes
- All runtime options are serialized to the `.splide` element's `data-splide` JSON; the JS just mounts Splide.
- Background-mode slides render the image as an absolutely-positioned `<img>` (not a CSS background) so importers can re-point `src`. With an `attachment_id`, each gets the Media Library `srcset` (`sizes` 100vw for one slide per view), so phones fetch a small file. Only the first slide loads up front; later slides use Splide's `data-splide-lazy` (+ `-srcset`) with `lazyLoad:'nearby'`, so each loads just before it shows. (With Fade, all slides are stacked in view, so the browser's own `loading="lazy"` would fetch every one at once.)
- Slides render as `<div>`s (not `<ul>`/`<li>`), because Splide's `role="group"` slides are not valid list items. A carousel with `as_background` is `aria-hidden="true"` (decorative backdrop).
- Colors use the **compact color-preset** shape `{ predefined, custom }`, NOT a raw hex string. See `README.md`.

## Background slideshow (hero)
Put the carousel **inside the Section** whose background it should be, next to the Section's own heading / text / buttons, and turn on `as_background`. Use image-only, `image_mode:'background'` slides (no heading / text / button of their own — the Section's content is what shows on top), `effect:'fade'`, `autoplay:'yes'`, `loop:'yes'`, and optionally `slow_zoom:'yes'`. Give the Section a min-height. The first slide's image loads with `fetchpriority="high"` (it is usually the page's largest image); the rest lazy-load.
```json
{
  "slides": [
    { "image": { "attachment_id": "12", "url": "https://example.com/pool.jpg" }, "image_mode": "background", "heading": "", "text": "", "button_label": "", "button_link": "", "link": "", "content_align": "center" },
    { "image": { "attachment_id": "13", "url": "https://example.com/bedroom.jpg" }, "image_mode": "background", "heading": "", "text": "", "button_label": "", "button_link": "", "link": "", "content_align": "center" }
  ],
  "as_background": "yes", "effect": "fade", "autoplay": "yes", "interval": "4000", "speed": "1200",
  "loop": "yes", "slow_zoom": "yes", "overlay": "yes", "overlay_opacity": 35
}
```
A slideshow of a few photos is far lighter than a background video of the same photos (a 14-second 1080p clip is several MB; the photos as WebP are a fraction of that), and the photos stay editable.

