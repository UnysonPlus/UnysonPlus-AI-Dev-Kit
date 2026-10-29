<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Feature grids

The band that answers *what do I get*. Three or six short promises, each an icon or a number with a
line of support. Back to page sections, so the format in [`README.md`](README.md) applies in full —
`upw_*` helpers, not Theme Settings.

| Variant | Reach for it when |
| --- | --- |
| [Icon row](#1--icon-row) | three or four capabilities, a line each — the workhorse |
| [Card grid](#2--card-grid) | each feature needs a paragraph, a link, or its own surface |
| [Numbered steps](#3--numbered-steps) | the items are a **sequence**, not a set |
| [Bento](#4--bento) | one feature genuinely outranks the others |

**Count first, then choose.** Three items want a row; six want a 3×2 grid; five want you to find a sixth
or drop to four, because a 3+2 grid leaves a hole that reads as a mistake. Seven or more is not a
feature grid — it is a list, and `feature_list` renders it better.

---

## 1 · Icon row

### When to use it

The default. Three or four capabilities, one line of support each, no card. Reach for **Card grid**
the moment any item needs a second sentence or its own link — an icon row with a paragraph in one cell
and a line in the others looks broken rather than varied.

### The composition

```php
upw_div_section(array(
  upw_element('special_heading', array(
    'overline' => '{{eyebrow}}', 'title' => '{{band_title}}',
    'heading'  => 'h2', 'alignment' => 'center',
  )),
  upw_grid(array(
    upw_element('icon_box', array(
      'icon'          => array('type' => 'svg', 'svg-source' => 'library', 'svg-id' => 'lucide/{{icon_1}}'),
      'title'         => '{{title_1}}',
      'title_tag'     => 'h3',                     // under the band's h2 — keep the outline in order
      'content'       => '<p>{{body_1}}</p>',      // content is a wp-editor: HTML, not plain text
      'style'         => 'top-title',
      'icon_align'    => 'center',
      'title_align'   => 'center',
      'content_align' => 'center',
    )),
    // …items 2 and 3, same shape
  ), 3, array(
    'gap'                 => array('base' => 'gap-4'),
    'responsive_collapse' => 'yes',               // the default; stacks on phones
  )),
), array(
  'variant' => '{{surface}}',
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{band_title}}` | what the set is about | drop the `special_heading` node entirely |
| `{{icon_N}}` | a **Lucide name** (`zap`, `shield-check`) | use `{"type":"none", …}` — see the icon-v2 note below |
| `{{title_N}}` | 1–4 words | the box renders icon-only, which is a different design; fill it |
| `{{body_N}}` | one line | the box is title-only, which is fine and often better |
| `{{surface}}` | a Section-Style slug or `''` | Default |

**The icon value is an object, not a string.** `'icon' => 'zap'` silently renders nothing. Lucide is
`{ "type":"svg", "svg-source":"library", "svg-id":"lucide/<name>" }`; no icon is
`{ "type":"none", "icon-class":"", "icon-class-without-root":false, "pack-name":false, "pack-css-uri":false }`.
Both shapes are in [`shortcodes/icon-box.md`](../../shortcodes/icon-box.md) → Notes; dump them rather
than typing from memory.

### The motion

A **short** stagger across the row — this is the one place a stagger earns its keep, because the items
are peers and the eye reads them in order anyway. Keep the whole sequence under about half a second;
a three-item row that takes two seconds to assemble has made the visitor wait to read three lines.

**Reduced motion:** all boxes visible, no stagger. Not "faster" — off.

### The presets

Icons wear an **Icon Badge preset** (`icon_badge_preset` → `iconb-<slug>`) when they need a tile behind
them. The retired `icon_badge` / `icon_badge_color` pair still renders for old pages but must not be
used in new work. No card preset here — an icon row has no card; if it needs one, it is variant 2.

### The preview

*Pending* — see [heroes.md § Previews](heroes.md#previews).

---

## 2 · Card grid

### When to use it

Each feature needs a paragraph, a link, or a surface of its own. Also the right choice when the items
have visibly different lengths — a card absorbs that unevenness, a bare icon row advertises it.

### The composition

As the icon row, with two changes:

```php
upw_element('icon_box', array(
  'icon'       => array('type' => 'svg', 'svg-source' => 'library', 'svg-id' => 'lucide/{{icon_1}}'),
  'title'      => '{{title_1}}', 'title_tag' => 'h3',
  'content'    => '<p>{{body_1}}</p>',
  'style'      => 'top-title',
  'box_style'  => '{{box_preset}}',      // the card: border, radius, shadow, fill — from Box Presets
  'box_link'   => '{{href_1}}',          // optional: makes the WHOLE card clickable
  'link_rel'   => 'none',                // default is 'sponsored' — wrong for an internal link
))
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{box_preset}}` | a Box Preset slug | no card — which makes this variant 1 |
| `{{href_1}}` | the card's destination | omit `box_link`, `link_target` and `link_rel` together |

**`link_rel` defaults to `sponsored`.** That is right for a paid placement and wrong for everything
else: leaving the default on an internal card tells search engines the link is an advertisement. Set
`'none'` unless it really is sponsored.

### The motion

One idea, and **hover is the idea** here — a card that lifts or brightens under the pointer. That
belongs to the **Box Preset**, not to the element: a hover written onto this card is a duplicate in the
wrong place, and its `!important` will outrank the preset the next time someone edits it. See the rule
in [`README.md`](README.md) § The presets.

A clickable card (`box_link`) must also show a focus state, not just hover — keyboard users get no
pointer. That too is the preset's job.

### The presets

`box_style` for the card, `icon_badge_preset` for the icon tile. Nothing else.

### The preview

*Pending*.

---

## 3 · Numbered steps

### When to use it

The items are a **sequence** — how it works, what happens next, the three stages of an engagement. If
the order does not matter, this is the wrong variant and the numbers are decoration pretending to be
information.

### The composition

Same grid, with the number carried as the icon:

```php
upw_element('icon_box', array(
  'icon'      => array('type' => 'none', 'icon-class' => '', 'icon-class-without-root' => false,
                       'pack-name' => false, 'pack-css-uri' => false),
  'title'     => '{{step_number}}. {{title_1}}',    // the number is part of the title, so it reads aloud
  'title_tag' => 'h3',
  'content'   => '<p>{{body_1}}</p>',
  'style'     => 'inline-left',
))
```

Putting the number in the title rather than in an icon is deliberate: a number rendered as an
icon or a `::before` is invisible to a screen reader, so the sequence — the entire point of this
variant — is lost for the people most dependent on it being explicit.

If the site has an existing **Steps** element with connectors, prefer it; this variant is for a plain
numbered set inside an ordinary grid.

### The motion

A stagger **in sequence order**, slightly slower than the icon row's, because here the order is the
content. Still under a second end to end.

**Reduced motion:** all steps visible, in order.

### The presets

As the card grid if the steps are carded; otherwise none.

### The preview

*Pending*.

---

## 4 · Bento

### When to use it

One feature genuinely outranks the others and the layout should say so. Reach for it rarely: a bento
whose tiles are all equally important is just a grid with uneven cells, and it reads as indecision.

### The composition

A grid with explicit tracks, one tile spanning:

```php
upw_grid(array(
  upw_flexbox(array( /* the lead feature — bigger title, more room */ ), array(
    'width' => array('base' => array('preset' => '12'), 'md' => array('preset' => '6')),
  )),
  upw_element('icon_box', array(/* … */)),
  upw_element('icon_box', array(/* … */)),
), '1fr 1fr', array(
  'gap'                 => array('base' => 'gap-4'),
  'grid_row_height'     => array('value' => '', 'unit' => 'px'),   // fill only if a tile must span rows
  'responsive_collapse' => 'yes',
));
```

**`responsive_collapse` resets column *and* row placement on phones.** A bento becomes a plain stack
there, in source order — so put the lead tile first in the array, or the phone layout opens with a
secondary feature. This is the detail bento layouts most often get wrong, and it is invisible until you
look at a phone.

### The motion

**None, or one fade on the whole band.** Staggering a bento animates tiles of different sizes at
different times and the band assembles like a puzzle. One idea per section.

### The presets

`box_style` per tile. Resist giving the lead tile a different preset to make it stand out — it is
already bigger; a second signal is noise. If it genuinely needs its own surface, that is a *second* Box
Preset in the library, not a one-off on this element.

### The preview

*Pending*.

---

## Verifying a feature grid

The bar in [`README.md`](README.md), plus three:

1. **Heading order.** The band's `special_heading` is an `h2`; every `icon_box` under it is `h3` via
   `title_tag`. A grid of `h2`s under an `h2` is a flat outline, and it is the most common accessibility
   defect in this shape.
2. **Phone width, in source order.** All four variants collapse to one column. Read the stack top to
   bottom and check it still makes sense — especially the bento, whose visual hierarchy disappears.
3. **The odd-count check.** Count the items against the track count and look at the last row. A hole is
   a design decision; if nobody decided it, fix the count or the tracks.

## The preview

*Pending* — scheduled under Phase 7: see [heroes.md § Previews](heroes.md#previews).
