<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Components — the parts a build is supposed to use

A generated site reads as generated when it is built from rectangles: a tinted band, a white card, a
photograph, repeat. Every framework ships more than that, and this one ships a great deal more — but
a build only uses what something tells it to use. Nothing did, so builds came out flat while the
library sat one option away, untouched.

This file is the inventory and the rule. It is the counterpart to
[`imagery.md`](imagery.md): that one stopped builds shipping bare text, this one stops them shipping
bare rectangles.

> **The rule.** A band that carries no component — no pattern, no divider, no preset beyond the
> defaults, no motion — **needs a reason**. "I did not know the library was there" is not one, and
> neither is a style's restraint: `swiss` and `monochrome` are *spare*, not *undecorated*, and even
> Quiet gets its surfaces and its box presets chosen rather than defaulted.

## Step 0: turn the Animation Engine on

**The Animation Engine ships INACTIVE in the core plugin.** Every module below — 35 animated
backgrounds, 22 scroll reveals, text effects, marquees, parallax, sticky stacks, page transitions —
is simply absent until the extension is activated, and nothing fails loudly to tell you. A whole
build can complete, pass its gates and ship with the entire motion library switched off.

Activate it with the design system, in step 3, before any page exists:

```php
$opt = get_option( 'fw_active_extensions', array() );
if ( ! isset( $opt['animation-engine'] ) ) {
    $opt['animation-engine'] = array();
    update_option( 'fw_active_extensions', $opt );
}
```

Then verify — `fw()->extensions->get('animation-engine')` must be truthy **in a fresh request**; the
activating request still reports it inactive, which is an easy false negative to believe.

## Before the inventory: a band's background is full-bleed

The first thing that makes a generated page look unfinished is not a missing pattern. It is a
**tinted or coloured band that stops at the container width**, so the page shows down both sides of
it and the band reads as a floating box rather than as a band.

`full_width` on a section-tag Div **defaults to `'no'`**, which contains the whole section
*including its background*. The option's own help calls `'yes'` "the classic full-bleed hero /
colour-band pattern": the background spans the window while the CONTENT stays contained to the
site width. That is what almost every band wants, and it was arriving off by default.

```php
// A band: background edge-to-edge, content contained. upw_div_section() now does this by default.
upw_div_section( $items, array( 'full_width' => 'yes' ) );
```

**When to turn it off.** Rarely, and deliberately: a band genuinely meant to read as a floating card
inset from the page. If you cannot say why this one floats, it should be full-bleed.

The trap to avoid is the opposite extreme — full-bleed does not mean full-width *content*. Text
running the whole 1600px of a desktop window is unreadable; the measure is what `content_width`
(or the site container) is for, and it keeps working underneath the bleed.

## The inventory

Counts are what a stock install registers; a site may add more. Check the live numbers rather than
trusting this table if a decision rests on one.

| Library | Count | Where it attaches | Option |
| --- | --- | --- | --- |
| **Background patterns** | 12 | a band | `background_pattern` → `{pattern: <id>}` |
| **Shape dividers** | 6 | a band's top/bottom edge | `divider_top` / `divider_bottom` |
| **Section styles** (surfaces) | 5 | a band | `variant` → the preset's slugified name |
| **Box presets** | 5 | any flexbox / column | `border_preset` → `boxp-<slug>` |
| **Icon badge presets** | 5 | icon elements | `icon_badge_preset` |
| **Container widths** | 5 | a band | `container_width` |
| **Animated backgrounds** | 35 | **containers only** | `bg_effect` (Animations tab) |
| **Scroll reveals** | 22 | any element | `fx.scroll_reveal` → `{mode: …}` |
| **Animation Engine modules** | 35 docs | varies | see [`animation-engine/`](../../animation-engine/README.md) |

**Patterns:** `dots` · `grid` · `diagonal-stripes` · `vertical-stripes` · `horizontal-stripes` ·
`checkerboard` · `crosshatch` · `triangles` · `chevron` · `circles` · `scales` · `confetti`

**Dividers:** `tilt` · `curve` · `wave` · `triangle` · `layered-wave` · `layered-slants`

**Scroll-reveal modes:** `left` `right` `up` `down` `iris` `diagonal` `diag_tr` `diag_bl` `diag_br`
`split_h` `split_v` `box` `rounded` `diamond` `ellipse` `corner_iris` `chevron` `triangle` `blinds`
`bars`, plus the canvas pair `pixelate` and `dissolve`.

### The one real limitation

**Animated backgrounds (`bg_effect`) are container-only** — `section`, `bleed-section`,
`masonry-section`, `row`. They are pruned off a `flexbox`, which is what the Div-first
`upw_div_section()` builds every band from. So a Div-first page cannot carry one; use a container
band where an animated background is the right answer.

**Patterns and dividers are NOT limited this way.** They are ordinary flexbox options and work on
Div-first bands exactly as they do on containers. (Worth stating because the docs mark them
"section-only", which reads as a restriction and is not one — it means the band must be *tagged* as
a section, which `upw_div_section()` already does.)

## How to reach them

```php
/* A pattern over a band's background. */
array( 'background_pattern' => array( 'pattern' => 'grid' ) )

/* An angled edge. $color is the colour of the band it cuts in FROM — usually the one above. */
array( 'divider_top' => array(
    'shape' => 'tilt',
    'tilt'  => array(
        'color'  => array( 'predefined' => '', 'custom' => '#f8fafc' ),
        'height' => array( 'value' => '90', 'unit' => 'px' ),
        'flip'   => 'no',
    ),
) )

/* Scroll reveal on an element. Stagger peers in a row by delay.
   The att is FLAT. The module doc describes an `fx.scroll_reveal` slot — that is the Kinetic Scenes
   SCENE node format, not a WordPress element; scroll-reveal-render.php reads $atts['scroll_reveal'].
   Wrapping it in `fx` attaches nothing, emits no attribute and raises no error at all. */
array( 'scroll_reveal' => array(
    'mode' => 'up',
    'up'   => array( 'duration' => 0.7, 'delay' => 0.12, 'easing' => 'cubic-bezier(0.22, 1, 0.36, 1)', 'replay' => 'no' ),
) )
```

## Choosing, rather than sprinkling

The failure this file guards against on the other side is a page wearing all of it at once. Build
rules [11](../../skills/create-site/build-rules.md) and 12 still govern: one signature moment, and
everything else deliberately quiet.

A workable budget for a Measured site:

- **One surface treatment** that is not a flat fill — a pattern on the band that needs texture,
  usually the one carrying repeated cards.
- **One edge** — a divider where two bands of very different colour meet, so the change reads as
  designed rather than as a seam.
- **One motion idea**, which is the signature moment: it has to belong to the business, sit on the
  path the visitor already takes, and survive reduced motion.
- **Box and button presets chosen**, not defaulted — the shipped `Card` is a starting point to edit,
  not a thing to accept.

> **Make the motion mean something.** Three cards fading up together is decoration. The *same* three
> staggered 120ms apart, on a broker's site, is offers arriving one after another — the business's
> own argument, told in motion. Same module, same cost, and only one of them is a reason.

## Before reporting the build done

- `fw()->extensions->get('animation-engine')` is truthy in a fresh request.
- Every band either carries a component or has a stated reason not to.
- The signature moment is **named in the hand-over**, in one sentence, as rule 12 requires.
- Reduced motion checked, and the page still makes sense with every animation off.
- Run the [layout audit](../../../tools/measure/README.md) — it reports bands with no component, as
  well as the spacing and alignment defects prose cannot catch.
