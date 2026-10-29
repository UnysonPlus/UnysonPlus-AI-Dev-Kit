<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# CTAs

The band that asks. Three variants, deliberately — the format says a small number of genuinely distinct
shapes, not every arrangement that could exist, and a CTA is a simple thing that goes wrong by being
over-designed. Page sections, so [`README.md`](README.md) applies in full.

| Variant | Reach for it when |
| --- | --- |
| [Centred block](#1--centred-block) | the default: a line, a button, its own surface |
| [Banner strip](#2--banner-strip) | the ask is secondary and should not stop the page |
| [Dual action](#3--dual-action) | there are genuinely two audiences at this point |

---

## The element choice, up front

There are two ways to build a CTA, and the obvious one is usually wrong.

**`call_to_action` is a single element** with `title`, `message`, `button_label`, `button_link` and a
`column_split` that divides content from button. Convenient — but **it has no button-style control.**
Its button takes a fixed theme style, so you cannot put a Button Preset on it. Its own doc says as much:
*"For full control, place a separate `button` next to a `special_heading` instead."*

That matters here more than anywhere else on the page. A CTA's button is the one element whose
appearance is doing a job, and the format's rule is that a button's look lives on its **preset**. So:

- **Composing `special_heading` + `button` is the default** for variants 1 and 3 — full preset control,
  and the button matches every other primary action on the site.
- **`call_to_action` is right for variant 2**, the inline strip, where the fixed style is acceptable
  precisely because the ask is secondary and should not shout.

Reaching for `call_to_action` because it is one element, then fighting its button with custom CSS, is
the failure this section exists to prevent.

---

## 1 · Centred block

### When to use it

The default. A short line, one button, its own surface so the band reads as a decision point rather
than more page. Use it to close a page, or once in the middle of a long one.

### The composition

```php
upw_div_section(array(
  upw_flexbox(array(
    upw_element('special_heading', array(
      'title'     => '{{ask}}',
      'subtitle'  => '{{reassurance}}',     // "No card required." — the line that removes the objection
      'heading'   => 'h2',
      'alignment' => 'center',
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
    'content_align' => 'center',
  )),
), array(
  'variant'    => '{{surface}}',     // a DIFFERENT surface from the band above it — that is the signal
  'text_align' => 'center',
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{ask}}` | the action, as a sentence | the recipe does not apply |
| `{{reassurance}}` | the objection-remover, one short line | omit the subtitle; do not pad it |
| `{{cta_label}}` | a verb phrase — "Start a project", not "Submit" | the recipe does not apply |
| `{{surface}}` | a Section-Style slug, different from the neighbouring band | the CTA blends into the page and stops reading as a decision point |

**`{{surface}}` is load-bearing here.** A CTA on the same surface as the section above it is just more
page. The contrast is what makes it a moment. That is a Section-Style preset, never a colour literal.

### The motion

**One fade-up on the whole block, or nothing at all.** A CTA is the last thing a person reads before
deciding; it should be *there*, not arriving. Never animate the button separately — a button that moves
as the pointer approaches is the most irritating motion on the web.

**Reduced motion:** visible immediately.

### The presets

`btn-primary` + `btn-lg`, and the surface. Nothing else. If this button needs to look different from
every other primary button on the site, the question is whether the site's primary button is wrong —
not whether this one should be special.

### The preview

*Pending* — see [heroes.md § Previews](heroes.md#previews).

---

## 2 · Banner strip

### When to use it

The ask is secondary: a newsletter line under an article, a "talk to us" bar between sections. It should
read as an offer in passing, not a wall. This is where `call_to_action` earns its place — content left,
button right, one row.

### The composition

```php
upw_div_section(array(
  upw_element('call_to_action', array(
    'title'         => '{{ask}}',
    'message'       => '<p>{{detail}}</p>',     // wp-editor: HTML, sanitized with wp_kses_post
    'button_label'  => '{{cta_label}}',
    'button_link'   => '{{cta_href}}',          // the default is '#' — replace it
    'button_target' => '_self',
    'column_split'  => '3/4',                   // content 3, button 1 — stacks below 576px
  )),
), array(
  'variant' => '{{surface}}',
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{detail}}` | one sentence of HTML | omit `message`; the title alone is a fine strip |
| `{{cta_label}}` | a short verb phrase | **the button is not rendered at all** — an empty label removes it |

Two things the element does that will surprise you: `button_link` defaults to `'#'`, so a strip with a
forgotten link looks finished and goes nowhere; and `column_split` is parsed as *content = n, button =
d − n*, so `'3/4'` means three quarters content. It stacks below 576px regardless.

### The motion

**None.** A strip that animates competes with the content it interrupts.

### The presets

The surface only — and remember the button here wears the **fixed theme style**, by design. If that is
unacceptable for this ask, it is not a secondary ask, and it wants variant 1.

### The preview

*Pending*.

---

## 3 · Dual action

### When to use it

There are genuinely two audiences at this point in the page — "Start free" and "Talk to sales", "Book"
and "See the menu". **Not** for giving one audience two ways to do the same thing: a second button
beside the first halves the first one's weight and measurably lowers the chance either is pressed.

### The composition

Variant 1, with a second button in a row:

```php
upw_flexbox(array(
  upw_element('button', array(
    'label' => '{{primary_label}}', 'link' => '{{primary_href}}',
    'style' => 'btn-primary', 'size' => 'btn-lg',
  )),
  upw_element('button', array(
    'label' => '{{secondary_label}}', 'link' => '{{secondary_href}}',
    'style' => 'btn-primary-outline', 'size' => 'btn-lg',   // outline: visibly second
  )),
), array(
  'direction'       => array('base' => 'column', 'md' => 'row', 'lg' => ''),   // stacked on phones
  'justify_content' => array('base' => 'center'),
  'align_items'     => array('base' => 'center'),
  'gap'             => array('base' => 'gap-3'),
));
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{secondary_label}}` | the *other* audience's action | drop the second button and use variant 1 |

**The two buttons must not be peers.** `btn-primary` and `btn-primary-outline` — one filled, one
outlined. Two filled primaries is the single most common CTA mistake: it looks balanced and it tells the
visitor nothing about which to choose.

Note `'direction' => array('base' => 'column', 'md' => 'row')`: stacked on phones, side by side from
medium up. Two full-size buttons side by side at 390px leaves each one too narrow for its label.

### The motion

As variant 1 — one fade on the block, nothing on the buttons.

### The presets

`btn-primary` and `btn-primary-outline` from Theme Settings → Buttons. The *relationship* between them
is the design; both are presets, so the pair stays consistent everywhere a dual CTA appears.

### The preview

*Pending*.

---

## When a CTA is really a form

If the ask is an email address rather than a click, none of these three is right — a button that opens
a form adds a step to the one place you cannot afford one. Use the site's form or newsletter element
inline instead, and keep the surrounding band shaped like variant 1.

## Verifying a CTA

The bar in [`README.md`](README.md), plus three:

1. **Check the surface contrast against its real neighbour.** A CTA is verified *in place*, below the
   section that actually precedes it — never on its own. The whole variant depends on that relationship.
2. **Press it with a keyboard.** Tab to the button, confirm a visible focus state, press Enter. A CTA
   that only responds to a pointer fails the people most likely to be using a keyboard deliberately.
3. **Read the label out of context.** "Submit", "Click here" and "Learn more" all pass a glance and fail
   a screen-reader link list, where the label is all there is.
