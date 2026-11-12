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
| `img_crops` | responsive (select; devices `lg` `md` `base`) | all `''` | `{ base, md, lg, xl }`; each `''` (same as the larger screen) · `original` · `16/9` `3/2` `4/3` `1/1` `4/5` `3/4` `2/3` `9/16` | **Crop Slides on Smaller Screens**: crop every slide to this shape per device, around each slide's `img_focal`. Desktop-first: `xl` is always the photo as-is. E.g. `{ base:'3/4', md:'4/3', lg:'', xl:'' }` for a tall hero. See Notes → Per-device images. |
| `heading_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Slide heading color (`kind: text`). |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Slide paragraph color (`kind: text`). |

### slide object (`slides[]`)
`image` (upload), `image_mode` (`'background'` = text overlaid hero / `'inline'` = image above text; default `'background'`), `heading` (text), `text` (textarea), `button_label` (text), `button_link` (text, default `'#'`), `link` (text — whole-slide click when there's no button), `content_align` (`'left'`/`'center'`/`'right'`, default `'center'`), `img_focal` (9 positions `left top` … `right bottom`, default `'center center'` — kept in view by the per-device crops), `img_images` (responsive upload, devices `md` + `base`: `{ base: {attachment_id,url}|'', md: …|'', lg:'', xl:'' }` — a different photo for phones/tablets; `''` = crop the slide's own image).

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

## Per-device images (crops + tablet/phone photo)

Since shortcodes 1.16.3 every slide image renders through `fw_image_tag()` with an `art` spec built from `img_crops` (slider-wide) + the slide's `img_focal` / `img_images`. When a device differs, the slide gets a `<picture>` with one `<source>` per breakpoint (phone < 768, tablet < 992, desktop < 1200), each a srcset of real pre-cropped files, so a phone downloads e.g. a 1100×1467 portrait crop instead of a stretched 768×512 landscape file. Leave everything empty and the output is a plain `<img>`, as before.

- **Pick the crop that matches the slide box on that device**: a full-height phone hero ≈ `9/16`, a shorter one `3/4`. A far-off shape is re-cropped by `object-fit` and can look soft.
- **First slide**: always eager, `fetchpriority="high"`, plus one `<link rel="preload" … media=… data-fw-hoist>` per device range (the Asset Optimizer 1.1.75+ hoists them into `<head>`).
- **Later slides**: `src`/`srcset` parked in `data-fw-lazy-*` (on `<source>` and `<img>`); `scripts.js` restores them (sources first, then the img) for the active slide and its neighbours on every move.
- Needs Media Library images (an `image` with an `attachment_id`); a bare URL renders the old single `<img>`.
- Reference: docs.unysonplus.com → For Developers → Responsive images; shared fields `sc_responsive_image_fields()` / `sc_responsive_image_art()` in `framework/extensions/shortcodes/includes/responsive-image-fields.php`.

## Autoplay is governed, not just configured

`static/js/scripts.js` -> `governAutoplay( splide, el )`, applied after every mount:

- **Off-screen carousels pause.** An `IntersectionObserver` on the `.splide` element calls
  `splide.Components.Autoplay.pause()` / `.play()`. This is a BANDWIDTH rule, not a motion one:
  with `lazyLoad: 'nearby'` every advance fetches the next slide, so an autoplaying hero keeps
  pulling full-bleed photos long after the reader scrolled past, queued ahead of the content
  images further down. Measured on a real site: 1.6 MB of hero slides vs 260 KB for every other
  image on the page, slides still arriving 10 s in. A/B on a tall page: scrolled away, 4/4 slides
  (~1200 KB) before, 2/4 (~600 KB) after; staying on the hero is unchanged at 4/4.
- **`prefers-reduced-motion: reduce` suppresses autoplay entirely** (WCAG 2.2.2); arrows, dots and
  drag still work. Honours a live `change` on the media query.

Gotchas: a carousel with `autoplay` false is left alone; without `IntersectionObserver` the old
behaviour stands. Note `preloadPages: 1` means slide 2 loads on mount regardless of autoplay - a
reduced-motion visitor still fetches 2 slides, not 1, and that is correct.

Do not pass `{autoplay:false}` to the `Splide` constructor to achieve this: Splide assigns
`data-splide` OVER constructor options, so the data attribute wins. Control the Autoplay
component after mount instead.
