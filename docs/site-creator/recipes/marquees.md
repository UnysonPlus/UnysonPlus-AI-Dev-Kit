<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Marquees

Moving strips: a running word band, a logo ticker. Page sections, so [`README.md`](README.md) applies
in full — but this is the one archetype with a **hard accessibility rule**, so read the next section
before the variants.

| Variant | Reach for it when |
| --- | --- |
| [Logo strip](#1--logo-strip) | client or partner logos — and it needs **no** Animation Engine |
| [Word strip](#2--word-strip) | a phrase as a graphic band between sections |
| [Vertical ticker](#3--vertical-ticker) | a narrow column of rolling items beside content |

---

## The rule that comes first

**Auto-moving content that runs for more than five seconds must have a way to stop it.** That is
WCAG 2.2.2, and a marquee is the canonical example: it starts on its own, never ends, and sits in the
reading path.

So in every variant below, **`controls` is `yes`**. It renders a real `<button>` that is
keyboard-focusable. `pause_on_hover` defaults to `yes` and is *not* a substitute — it does nothing for
a keyboard or touch user, who are precisely the people a pause button is for.

**Reduced motion: the strip does not move.** Not slower — stopped, showing its content statically. A
marquee is pure decoration; when someone has asked for less motion, there is nothing to preserve.

If a variant cannot carry a pause control, the answer is not to ship it without one. It is to use a
static strip.

---

## 1 · Logo strip

### When to use it

Client, partner or press logos. The common instinct is to put an Animation Engine marquee on a row of
images — **don't**. `logo_grid` has a native marquee layout, and the native option wins: it handles the
cloning, the spacing and the responsive count for you.

### The composition

```php
upw_div_section(array(
  upw_element('special_heading', array(
    'title' => '{{band_title}}', 'heading' => 'h2', 'alignment' => 'center',
  )),
  upw_element('logo_grid', array(
    'logos'       => '{{logos}}',      // addable-popup: an array of logo objects — see the element's Notes
    'design'      => 'marquee',        // NATIVE. No fx block, no animation-engine dependency.
    'columns'     => '5',              // for marquee/carousel this is how many are VISIBLE at once
    'gap'         => '4',
    'logo_height' => 48,
    'grayscale'   => 'yes',
    'show_labels' => 'no',
  )),
), array('variant' => '{{surface}}'));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{logos}}` | the logo objects (image + name + optional link) | an empty strip — there is no graceful degradation here, so omit the whole band |
| `{{band_title}}` | "Trusted by", or similar | drop the heading; a bare strip is fine |

**`columns` means *visible at once* in marquee mode**, not a grid column count. Five visible with eight
logos scrolls; five visible with five logos has nothing to scroll and sits still, which looks broken.
**A marquee needs meaningfully more items than it shows.**

`grayscale => 'yes'` is the usual choice and does real work: a row of full-colour logos in different
palettes is visual noise that competes with the page.

### The motion

The layout *is* the motion. Add nothing on top — no reveal on the band, no hover effect on the logos
beyond the built-in grayscale-to-colour.

Because this is `logo_grid`'s own layout rather than the Animation Engine module, its pause affordance
is the element's, not the module's `controls` switch — **verify a stop mechanism exists on the rendered
page** before shipping it, and if there is none, use `design => 'grid'` instead. A static logo grid is
not a worse band; it is a calmer one.

### The presets

The surface only. Logos are content.

### The preview

*Pending* — see [heroes.md § Previews](heroes.md#previews).

---

## 2 · Word strip

### When to use it

A phrase as a graphic band between sections — a studio's disciplines, a restaurant's dishes. It is
typography as texture, so it wants large type and a short phrase with a separator.

This one **does** use the Animation Engine `marquee` module, on the element's `fx` block.

### The composition

```php
upw_div_section(array(
  upw_element('special_heading', array(
    'title'   => '{{phrase}}',
    'heading' => 'h2',          // still a real heading in the outline — see the verification note
    'marquee' => array('mode' => 'left', 'left' => array(
      'speed'          => 'normal',    // slow | normal | fast
      'gap'            => 40,          // px between repeats
      'separator'      => '{{separator}}',   // '•' or '—'; keeps repeats legible
      'pause_on_hover' => 'yes',
      'controls'       => 'yes',       // REQUIRED — WCAG 2.2.2
      'edge_fade'      => 'yes',       // the strip fades at the edges instead of being cut
      'scroll_reactive'=> 'no',
      'draggable'      => 'no',
      'custom_speed'   => 0,           // 0 = use the speed preset
      'text_style'     => 'outline',   // hollow letters — text only
      'skew_h' => 0, 'skew_v' => 0, 'tilt' => 0, 'bend' => 0, 'curve' => 0, 'wave' => 0,
    )),
  )),
), array('variant' => '{{surface}}'));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{phrase}}` | a few words, repeated by the module | the recipe does not apply |
| `{{separator}}` | `•` / `—` | repeats run together and read as one long string |

`mode` is the direction (`left` · `right` · `up` · `down`) and `none` turns it off. The options live
**under the mode key** — `marquee.left.speed`, not `marquee.speed`. Writing them flat is the usual way
this silently does nothing.

**`skew_h` / `tilt` / `bend` / `curve` / `wave` all default to 0, and should usually stay there.** They
are available for matching a measured source. A band that is skewed *and* tilted *and* waving is four
ideas in a strip whose entire content is three words.

### The motion

The marquee is the one idea. Do not also give the section a reveal.

**Reduced motion:** stopped, phrase legible. Check this explicitly — `text_style: 'outline'` on a
stopped strip must still be readable against the surface.

### The presets

The surface. The type scale comes from Theme Settings → Typography; a word strip that needs its own
size usually needs the site's display size.

### The preview

*Pending*.

---

## 3 · Vertical ticker

### When to use it

A narrow rolling column beside content — recent items, a list of names. Rare, and easy to overuse: a
vertical marquee next to body copy pulls the eye away from the thing it is next to.

### The composition

As the word strip, with a vertical mode and the extra option it unlocks:

```php
'marquee' => array('mode' => 'up', 'up' => array(
  'speed'            => 'slow',          // vertical reads faster; slow it down
  'gap'              => 24,
  'controls'         => 'yes',
  'edge_fade'        => 'yes',           // more important vertically — the cut-off edge is at eye level
  'text_orientation' => 'horizontal',    // vertical modes only: horizontal | sideways | upright
  'pause_on_hover'   => 'yes',
)),
```

`text_orientation` exists only for `up` / `down`. `horizontal` keeps the lines readable and stacks
them — the right default; `sideways` and `upright` rotate the glyphs, which is a graphic choice, not a
legible one.

### The motion / presets

As variant 2.

### The preview

*Pending*.

---

## Verifying a marquee

The bar in [`README.md`](README.md), plus four — and the first two are not negotiable:

1. **Stop it with the keyboard.** Tab to the pause control, press it, confirm the strip stops and the
   button's state is announced. No control, no ship.
2. **Turn on reduced motion and reload.** The strip must be still and its content readable. Test it in
   the OS setting, not by reasoning about the code.
3. **Count the items against `columns`.** A marquee showing as many items as it has does not move.
4. **Heading order.** A word strip built on `special_heading` is in the document outline. Either give it
   a level that fits (and accept a decorative phrase in the outline), or use a text element. Do not
   leave an `h2` of three decorative words sitting between two real sections — a screen-reader user
   navigating by heading lands on it expecting a section.

## One honest caution

A marquee is the archetype most likely to be chosen because it looks modern and least likely to be
needed. Every variant here auto-plays in the reading path and costs an accessibility obligation. Before
reaching for one, check whether a static strip says the same thing — a logo grid usually does.
