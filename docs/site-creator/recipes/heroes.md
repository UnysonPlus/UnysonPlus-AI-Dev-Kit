<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Heroes

The band at the top of a page: what this is, who it is for, what to do next. Four archetypes, and the
whole catalogue follows the format in [`README.md`](README.md).

| Variant | Reach for it when |
| --- | --- |
| [Centred](#1--centred) | one clear proposition, nothing to show |
| [Split](#2--split) | there is a product shot worth half the band |
| [Editorial](#3--editorial) | the words *are* the design — long headline, no CTA race |
| [Media-backed](#4--media-backed) | a photograph carries the mood and the text sits on it |

**One thing before the code.** A hero's eyebrow, headline and standfirst are **one element**, not three:
`special_heading` carries `overline`, `title` and `subtitle` together, aligned as a set. Three stacked
elements give you three spacing decisions, three alignment decisions and a heading order to police.
Use `text_block` in a hero only for a genuine paragraph.

---

## 1 · Centred

### When to use it

One proposition, stated once, with a single action. The default when there is nothing to show — a
service, a consultancy, an app whose screenshot says less than its sentence. Reach for **Split** instead
the moment there is an image worth half the band, and **Editorial** when the headline is long enough
that centring would make it a wall.

### The composition

```php
upw_div_section(array(
  upw_flexbox(array(
    upw_element('special_heading', array(
      'overline'  => '{{eyebrow}}',          // optional — absent renders nothing
      'title'     => '{{headline}}',
      'subtitle'  => '{{standfirst}}',
      'heading'   => 'h1',                   // the page's ONLY h1
      'alignment' => 'center',
    )),
    upw_element('button', array(
      'label' => '{{cta_label}}', 'link' => '{{cta_href}}',
      'style' => 'btn-primary', 'size' => 'btn-lg', 'alignment' => 'center',
    )),
  ), array(
    'direction'     => array('base' => 'column', 'md' => '', 'lg' => ''),  // stacked, not side by side
    'align_items'   => array('base' => 'center'),
    'gap'           => array('base' => 'gap-4'),
    'content_width' => array('preset' => 'narrow'),   // measure: a centred line past ~60ch is hard to read
    'content_align' => 'center',
  )),
), array(
  'min_height'  => array('base' => array('value' => 70, 'unit' => 'vh')),
  'align_items' => array('base' => 'center'),         // min_height does nothing without this
  'text_align'  => 'center',
  'variant'     => '{{surface}}',                     // '' | alt | light | dark — a Section-Style preset
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{eyebrow}}` | 1–4 words | the overline is not rendered — **never** fill it with "Welcome" |
| `{{headline}}` | the proposition, one sentence | the recipe does not apply; a hero needs one |
| `{{standfirst}}` | one or two lines of support | no subtitle line, spacing closes up |
| `{{cta_label}}` / `{{cta_href}}` | the single action | omit the whole `button` node, not an empty label |
| `{{surface}}` | a Section-Style slug, or `''` | the Default surface |

### The motion

One idea: the stack fades up as a set.

```php
$d = upw_effect_defaults('special_heading');     // never guess an att shape — dump it
$gsap = $d['gsap_motion']; $gsap['effect'] = 'fade-up';
```

Put it on the **heading only** and let the button arrive with it. A hero where the eyebrow, headline,
standfirst and button each animate on their own stagger reads as a demo reel, and the person waits
through four beats to learn what the site is.

**Reduced motion:** the text is at its final position and opacity, immediately. A hero is the one band
where a missed reveal means an empty screen.

### The presets

`btn-primary` + `btn-lg` for the action; `variant` for the surface. No colour, font or spacing literal
anywhere in the composition — if the hero needs a particular dark treatment, that is a Section-Style
preset, so every dark band on the site moves together when it changes.

### The preview

*Pending* — see [Previews](#previews).

---

## 2 · Split

### When to use it

There is a product shot, a screenshot or a portrait that does real work. Not for a stock photograph
chosen to fill the space: an image with nothing to say costs half the band and the LCP both. If that is
what you have, use **Centred** and drop the image.

### The composition

```php
upw_div_section(array(
  upw_grid(array(
    upw_flexbox(array(
      upw_element('special_heading', array(
        'overline' => '{{eyebrow}}', 'title' => '{{headline}}', 'subtitle' => '{{standfirst}}',
        'heading'  => 'h1', 'alignment' => 'left',
      )),
      upw_element('button', array(
        'label' => '{{cta_label}}', 'link' => '{{cta_href}}',
        'style' => 'btn-primary', 'size' => 'btn-lg', 'alignment' => 'left',
      )),
    ), array(
      'direction'   => array('base' => 'column', 'md' => '', 'lg' => ''),
      'align_items' => array('base' => 'start'),
      'gap'         => array('base' => 'gap-4'),
    )),
    upw_element('media_image', array(          // the tag is media_image — `image` renders as literal text
      'image'         => array('attachment_id' => '', 'url' => '{{image_url}}'),
      'image_ratio'   => '4/3',
      'fetchpriority' => 'high',               // it IS the LCP element; do not let it lazy-load
    )),
  ), '1fr 1fr'), 
), array(
  'min_height'  => array('base' => array('value' => 70, 'unit' => 'vh')),
  'align_items' => array('base' => 'center'),
  'variant'     => '{{surface}}',
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{image_url}}` | the shot, already sized for a half-band | **use Centred instead** — a split hero with no image is a narrow column beside a hole |
| *(others)* | as Centred | as Centred |

Pass `'2fr 3fr'` or `'3fr 2fr'` to `upw_grid` when the copy and the image do not deserve equal halves.
Text left is the default for a reason: the headline should not wait for the image on a phone, where the
grid collapses to one column in source order.

### The motion

The copy fades up; **the image does not move.** Reduced motion: both final, immediately.

A hero image that slides, scales or parallaxes is the single most common way to lose the LCP you just
set `fetchpriority: 'high'` to protect — the browser paints it, then your script moves it.

### The presets

As Centred. The image carries no preset: it is content, and a border or shadow on it belongs to a Box
Preset (`box_style` on the element — **not** `border_preset`, which is the layout Divs' att; the README
has the split).

### The preview

*Pending* — see [Previews](#previews).

---

## 3 · Editorial

### When to use it

The headline is the design: a long, specific sentence, set large, with no competing CTA. Common on
studio, agency and writing sites. Choose it over **Centred** when the sentence runs past roughly a dozen
words — centring a long line makes every row start in a different place and the eye loses the entry
point.

### The composition

```php
upw_div_section(array(
  upw_flexbox(array(
    upw_element('special_heading', array(
      'overline' => '{{eyebrow}}', 'title' => '{{headline}}',
      'heading'  => 'h1', 'alignment' => 'left',
    )),
    upw_element('text_block', array('text' => '<p>{{standfirst}}</p>')),   // a real paragraph, so a real text_block
    upw_element('button', array(
      'label' => '{{cta_label}}', 'link' => '{{cta_href}}',
      'style' => 'btn-link', 'alignment' => 'left',                        // a quiet link, not a slab
    )),
  ), array(
    'direction'     => array('base' => 'column', 'md' => '', 'lg' => ''),
    'align_items'   => array('base' => 'start'),
    'gap'           => array('base' => 'gap-5'),
    'content_width' => array('preset' => 'medium'),
    'content_align' => 'left',
  )),
), array(
  'min_height'  => array('base' => array('value' => 80, 'unit' => 'vh')),
  'align_items' => array('base' => 'end'),      // the type sits low in the band — the editorial signature
  'variant'     => '{{surface}}',
));
```

Here `{{standfirst}}` is its own `text_block` rather than the heading's `subtitle`, because in this
variant it is a paragraph that may run to several sentences, not a single supporting line.

### The motion

A line-by-line reveal on the headline only — this is the one variant where a stagger is the point rather
than decoration, because the sentence *is* the content. Keep it fast; a long headline revealed slowly is
a long wait.

**Reduced motion:** all lines visible, no stagger.

### The presets

`btn-link` for the action. The type scale belongs to Theme Settings → Typography, not to this recipe:
an editorial hero that needs a bigger headline needs a bigger H1 across the site, or it is inconsistent
by the second page.

### The preview

*Pending* — see [Previews](#previews).

---

## 4 · Media-backed

### When to use it

A photograph carries the mood and the text sits on it — hospitality, venues, travel, anything whose
first job is atmosphere. **The hardest variant to get right**, and the one to talk a client out of when
the only available photograph is busy: text over a busy image is unreadable at every size.

### The composition

```php
upw_div_section(array(
  upw_flexbox(array(
    upw_element('special_heading', array(
      'overline' => '{{eyebrow}}', 'title' => '{{headline}}', 'subtitle' => '{{standfirst}}',
      'heading'  => 'h1', 'alignment' => 'center',
    )),
    upw_element('button', array(
      'label' => '{{cta_label}}', 'link' => '{{cta_href}}',
      'style' => 'btn-primary', 'size' => 'btn-lg', 'alignment' => 'center',
    )),
  ), array(
    'direction'     => array('base' => 'column', 'md' => '', 'lg' => ''),
    'align_items'   => array('base' => 'center'),
    'gap'           => array('base' => 'gap-4'),
    'content_width' => array('preset' => 'narrow'),
  )),
), array(
  'full_width'  => 'yes',                        // the photograph goes edge to edge, the text stays inset
  'min_height'  => array('base' => array('value' => 85, 'unit' => 'vh')),
  'align_items' => array('base' => 'center'),
  'text_align'  => 'center',
  'background'  => '{{background}}',             // background-pro: image + scrim layers (see Notes below)
));
```

**The scrim is not optional.** `background` is a *background-pro* value whose layers stack, so the
readable version is **image, then a colour or gradient layer over it** — not a CSS filter on the photo,
which dulls the image everywhere instead of only behind the words. Dump the shape before writing it
(`upw_effect_defaults` is for effects; for this, read
[`shortcodes/flexbox.md`](../../shortcodes/flexbox.md) → Notes → background-pro) rather than inventing
layer keys.

No `variant` here: the surface is the photograph, and a Section-Style preset would paint over it.

### The motion

**None on the background.** A parallaxing hero photo is the classic LCP and jank combination, and on a
phone it mostly reads as drift. If the band needs life, give the *text* a single fade-up and leave the
image still. Reduced motion: text final immediately.

### The presets

`btn-primary` + `btn-lg`. Check the button against the *darkest and lightest* parts of the photograph,
not the average — if it only works over one region, the scrim is too weak, and that is a fix on the
scrim, not a per-instance button colour. A button colour written onto this one hero is exactly the
duplicate-in-the-wrong-place the format forbids.

### The preview

*Pending* — see [Previews](#previews).

---

## A note on the slugs these recipes name

The vocabularies above are the **shipped defaults**, and two of them are derived, not fixed:

- `gap-0` … `gap-5` are the Gap Scale slugs.
- `narrow` / `medium` / `wide` are the three built-in Container Widths (768 / 896 / 1024px). Their **slugs derive from the preset NAMES**, so a site whose Container Width library has been renamed or extended has different slugs — read the site's own library rather than assuming these three.
- `btn-primary` / `btn-link` / `btn-lg` are Theme Settings → Buttons presets, which a site may also rename.

A slot that names a preset the site does not have renders unstyled, not broken — which is easy to miss in data and obvious on the page. One more reason the verification bar ends at *look at it*.

## Verifying a hero

The bar in [`README.md`](README.md) applies to all four, plus three that are specific to a band that
sits at the top of the page:

1. **One `h1` per page.** All four set `'heading' => 'h1'`. If the page's Theme Builder header already
   emits one, these become `h2` — a second `h1` is a real accessibility defect, not a style preference.
2. **Measure the LCP element.** In Split and Media-backed it is the image; confirm it is not lazy-loaded
   and not animated. "It looks fast" is not the measurement.
3. **Phone width, with the real headline.** A hero is the band most often checked with placeholder text
   that happens to fit. Put the actual sentence in at 390px before calling it done.

## Previews

Every recipe needs a link to a demo page **we** host, rendered with real content — a recipe with no
preview is unfinished, because the preview is how a person chooses and how we notice when a recipe has
rotted. The four above are written and verified against the element docs but **not yet built onto a
page**, so their links are pending.

They are scheduled, not undecided: the roadmap’s **Phase 7 — the style gallery** settles it. Each
seeded style gets one native Unyson+ page rendering the same content through that style’s presets, and
each gets a card on the demos home grid, per the house rule that a demo is never reachable only by a
direct URL. So a recipe’s preview is a region of a style demo rather than a page of its own — which is
also the cheaper answer, since it shows the recipe and the style together.
