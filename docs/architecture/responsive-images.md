<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# responsive-images — `fw_image_tag()`, per-device crops and `<picture>`

**Rule for any element that shows a Media Library image: render it with `fw_image_tag()`, never a hand-built `<img>`.** A photo shown with `object-fit: cover` in a box of a different shape is picked by the box *width* and stretched (a landscape slide in a tall phone hero: 768px file shown at ~1200px). `fw_image_tag()` serves real pre-cropped files and, with `art`, a different crop or photo per device.

Full reference (arguments, output, renditions, roadmap): **docs.unysonplus.com → For Developers → Responsive images** (`unysonplus-site/docs/developers/responsive-images.md`).

## The pieces

| Piece | File | What it does |
|---|---|---|
| `fw_image_tag( $id_or_url, $args )` | `framework/helpers/general.php` | One `<img>`, or a `<picture>` when `art` differs per device. Extra args: `art`, `lazy_attrs`, `preload`, `inline_style`. |
| `fw_image_tag_basic()` | same | The single-`<img>` builder underneath (exact px crop + 2x, ratio crop renditions, WP srcset, URL). |
| `fw_image_crop_renditions( $id, $ratio, $focal )` | `framework/includes/image-crops.php` | Ratio crop around a focal point at widths 320…1600 + full; `uploads/unysonplus/image-crops/`. |
| `fw_image_srcset_data( $id, $ratio, $focal )` | same | `srcset` / `src` / `width` / `height` for one picture (crops, or the attachment's sizes). |
| `fw_image_art_resolve( $main_id, $main_ratio, $focal, $crops, $images )` | same | Desktop-first cascade → `art` (`base`, `md`, `lg` → `source`, `ratio`, `focal`). |
| `sc_responsive_image_fields( $args )` | `framework/extensions/shortcodes/includes/responsive-image-fields.php` | Adds `{prefix}focal`, `{prefix}crops` (responsive select, devices lg/md/base), `{prefix}images` (responsive upload, devices md/base). |
| `sc_responsive_image_art( $atts, $prefix, $main_id, $main_ratio, $override )` | same | Reads those fields back into `art`. |

## Use in an element

```php
// options.php
$options = array( 'image' => array( 'type' => 'upload', 'label' => __( 'Image', 'fw' ) ) )
	+ sc_responsive_image_fields( array( 'prefix' => 'img_' ) );

// view.php
$id  = (int) $atts['image']['attachment_id'];
echo fw_image_tag( $id, array(
	'class' => 'my-el__img',
	'sizes' => '(max-width: 767.98px) 100vw, 50vw',
	'art'   => sc_responsive_image_art( $atts, 'img_', $id, $main_ratio ),
) );
```

## Gotchas

- **Desktop-first.** The main Image (+ its ratio) is the large-desktop picture; smaller screens only override. Do NOT wrap the main Image field in `responsive` (that type is mobile-first, so the saved photo would become the phone image).
- **`<picture>` is inline**: inside an absolutely positioned / flex layout give `.fw-picture` `display: contents`.
- **Box shape follows the file**: with art, the inline `aspect-ratio` is dropped and each `<source>` carries its crop's width/height; keep `height: auto`.
- **Deferred images** (`lazy_attrs`): restore `<source>` `data-fw-lazy-srcset` BEFORE the `<img>`'s, or the browser has already picked the wrong source. The Slider's `scripts.js` `loadPicture()` is the reference.
- **Preloads** (`preload` + `fetchpriority: high`) print `<link rel="preload" as="image" … data-fw-hoist>` per device range; the Asset Optimizer (1.1.75+) hoists them to `<head>` and skips its own guess because that exact substring is present — keep the wording.
- Attachments only; `image_fit: contain` and exact px Width+Height crops ignore `art`.

Elements using it: Carousel / Slider, Image, Before/After (crops + focal only, both photos cut alike), Image Box, Image + Content, Team Member, Bleed Section. Ratio-class boxes: `sc_responsive_image_box_vars( $atts, 'img_', $id, $main_ratio, '--x-ar' )` + max-width media queries in the element CSS; `sc_ratio_from_class( 'ratio-16-9' )` → `16/9`. Next: Gallery, Tabs, Testimonials → CSS backgrounds.
