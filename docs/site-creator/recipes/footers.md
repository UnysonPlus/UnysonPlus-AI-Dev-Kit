<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Footers

The last thing on every page. **Chrome, like the navbar** — Theme Settings, site-wide, applied with
`fw_set_db_settings_option()`. See the chrome note in [`README.md`](README.md); the `upw_*` helpers do
not apply here.

| Variant | Reach for it when |
| --- | --- |
| [Link columns](#1--link-columns) | the site has real sections to navigate — the workhorse |
| [Minimal bar](#2--minimal-bar) | a handful of pages; a tall footer would be padding |
| [Contact-led](#3--contact-led) | a local business: where, when, how to reach you |
| [Newsletter-led](#4--newsletter-led) | the list is the point and the footer is where you ask |

**Count the destinations first.** Fewer than about six links is a **Minimal bar**; a four-column grid
holding two links per column is a footer pretending the site is bigger than it is.

---

## The elements you can actually use

A footer column holds elements from a fixed picker. The current list is:

`logo` · `footer_logo` · `menu` · `menu_area` · `heading` · `list_item` · `cta_button` · `search` ·
`social_icons` · `newsletter` · `custom_html` · `text` · `widget_area` · `back_to_top` ·
`builder_section` · `snippet`

Item shape, same as the header's: `array('element_type' => array('element' => '<type>', '<type>' => array(...)))`.

Three that save real work, and are easy to miss:

- **`heading`** (`heading_text`, `heading_level`, `heading_icon`) — the column title. Prefer it over a
  `text` element containing `<h2>`: it keeps the heading level a *setting* rather than markup you have
  to police.
- **`newsletter`** — a native sign-up. Prefer it over `custom_html` with a hand-written `<form>`.
- **`list_item`** (`li_text`, `li_icon`, `li_link_type` = `none`|`url`|`email`|`phone`, `li_link`,
  `li_target`) — one contact or info row. `li_link_type => 'phone'` makes a tappable number; `'none'`
  renders plain text, which is what an address line wants.

> **`icon_text` is not in the picker.** It still *renders* for pages that saved one, so you will meet it
> in existing sites and in older docs — but it cannot be chosen in the UI and should not be written into
> new work. `list_item` is its replacement.

---

## 1 · Link columns

### When to use it

The default for a site with sections worth navigating: a brand column plus two or three link columns.

### The composition

```php
$el = function ( $e, $s = array() ) {
    return array('element_type' => array('element' => $e, $e => $s));
};

$mf = array(
  'count' => '4',
  '4' => array(
    'main_footer_auto'  => 'no',                      // 'yes' IGNORES the split — see the gotcha
    'main_footer_split' => array(                     // widths must sum to 100
      array('w' => 40, 'name' => ''), array('w' => 20, 'name' => ''),
      array('w' => 20, 'name' => ''), array('w' => 20, 'name' => ''),
    ),
    'main_footer_col_1' => array(
      $el('footer_logo'),
      $el('text', array('text_content' => '<p>{{brand_blurb}}</p>')),
      $el('social_icons'),                            // profiles come from Theme Settings → Social
    ),
    'main_footer_col_2' => array(
      $el('heading', array('heading_text' => '{{col_2_title}}', 'heading_level' => 'h2')),
      $el('menu', array('menu_id' => '{{footer_menu_id}}')),
    ),
    // …columns 3 and 4, same shape
  ),
);
fw_set_db_settings_option('main_footer_columns', $mf);
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{brand_blurb}}` | one or two sentences | omit the `text` element; the logo alone is fine |
| `{{col_N_title}}` | 1–3 words | omit the `heading`; an untitled link column is a guessing game |
| `{{footer_menu_id}}` | a **menu term ID** | the column renders empty |

**`main_footer_auto => 'yes'` ignores your split entirely.** It makes the columns content-sized and
distributes them by `main_footer_justify` instead. That is the right choice when the source hugs its
content with `space-between` — and a silent surprise when you set careful widths and then leave auto on.
Pick one.

Two more the source settles, and neither is visible in the UI:

- **Seven or eight columns are ALWAYS auto-width**, whatever split you write. The twelfths grid cannot
  express sevenths or eighths, so the renderer forces content-sized columns at those counts. If your
  widths are being ignored, count the columns before debugging anything else.
- **`main_footer_split` may arrive as a JSON string** rather than an array (the renderer decodes either).
  Write the array; just do not be surprised reading an existing site back.

### The motion

**None.** Nobody scrolls to a footer to watch it arrive, and a reveal there delays the links the person
scrolled down to use.

### The presets

Footer styling goes in **`main_footer_custom_styling`**, not child-theme CSS — background, typography,
link colour, padding and borders all live there, per bar (`pre_footer` / `main_footer` / `post_footer` /
`copyright`). A `.footer .builder-text-element{…}` rule in the child theme is invisible to whoever later
opens Theme Settings looking for it.

`footer_background` carries the full `{ color, gradient, image, video, advanced }` shape.

### The preview

*Pending* — see [heroes.md § Previews](heroes.md#previews).

---

## 2 · Minimal bar

### When to use it

A handful of pages. One row: logo, a few links, copyright. A four-column footer on a five-page site is
whitespace with headings in it.

### The composition

One column, auto-width, with the copyright doing the second row:

```php
$mf = array('count' => '1', '1' => array(
  'main_footer_auto' => 'yes',                        // content-sized, distributed
  'main_footer_col_1' => array(
    $el('footer_logo'),
    $el('menu_area', array('menu_location' => '{{footer_menu_location}}')),
    $el('social_icons'),
  ),
));
fw_set_db_settings_option('main_footer_columns', $mf);

$cp = array('enabled' => 'yes', 'yes' => array('copyright_columns' => array(
  'count' => '1', '1' => array(
    'copyright_auto'  => 'no',
    'copyright_split' => unysonplus_footer_equal_split(1),   // the helper, not a hand-written array
    'copyright_col_1' => array($el('text', array('text_content' => '<p>{{copyright_line}}</p>'))),
  ),
)));
fw_set_db_settings_option('copyright_settings', $cp);
```

Here `main_footer_auto => 'yes'` is the point rather than a trap: one row of content-sized items is
exactly what it is for.

### The motion / presets

As variant 1 — none, and `main_footer_custom_styling`.

### The preview

*Pending*.

---

## 3 · Contact-led

### When to use it

A local business. The footer's job is where you are, when you are open, and how to reach you — the
three things people scroll down for.

### The composition

Columns 2 and 3 become `list_item` stacks:

```php
'main_footer_col_2' => array(
  $el('heading', array('heading_text' => 'Visit', 'heading_level' => 'h2')),
  $el('list_item', array('li_text' => '{{street}}',  'li_link_type' => 'none')),
  $el('list_item', array('li_text' => '{{city}}',    'li_link_type' => 'none')),
),
'main_footer_col_3' => array(
  $el('heading', array('heading_text' => 'Contact', 'heading_level' => 'h2')),
  $el('list_item', array('li_text' => '{{phone}}', 'li_link_type' => 'phone', 'li_link' => '{{phone_raw}}')),
  $el('list_item', array('li_text' => '{{email}}', 'li_link_type' => 'email', 'li_link' => '{{email}}')),
),
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{phone_raw}}` | the dialable number, digits and `+` only | the row renders as plain text — a phone number nobody can tap on the device most likely to be used |

**An address is `li_link_type => 'none'`.** Only the phone and email rows are links. Wrapping an address
line in a link with nowhere to go is the most common version of this variant going wrong.

### The motion / presets

As variant 1.

### The preview

*Pending*.

---

## 4 · Newsletter-led

### When to use it

The list is the point: publishing, hospitality, anything with a recurring reason to write. The sign-up
takes the widest column and the links get what is left.

### The composition

```php
'main_footer_split' => array(array('w' => 50, 'name' => ''), array('w' => 25, 'name' => ''), array('w' => 25, 'name' => '')),
'main_footer_col_1' => array(
  $el('heading', array('heading_text' => '{{list_pitch}}', 'heading_level' => 'h2')),
  $el('text', array('text_content' => '<p>{{list_detail}}</p>')),
  $el('newsletter'),                                  // the NATIVE element — dump its options, do not guess
),
```

**Use the native `newsletter` element**, not `custom_html` with a hand-written form. A hand-written form
in a footer is a form on every page of the site: its markup, its validation and its accessibility are
yours to maintain forever, and it will not match the site's inputs. Dump the element's own options
rather than inventing sub-keys.

### The motion

None — and in particular nothing on the input. A footer field that animates on focus, on every page, is
a tic.

### The presets

As variant 1. The submit button follows the footer bar's styling block.

### The preview

*Pending*.

---

## Verifying a footer

The bar in [`README.md`](README.md), plus four that only apply to a footer:

1. **Check it under a SHORT page.** A footer is almost always built under a long one. Under a thin page
   it can land mid-viewport with blank space beneath, which no amount of internal padding fixes — that is
   a page-layout problem the footer reveals.
2. **Phone width.** Columns stack; confirm the order still reads (brand first, legal last) and that the
   tap targets are not shoulder to shoulder.
3. **Press every link.** Footers are where dead links accumulate, because nobody looks. A `menu_id` that
   points at a deleted menu renders an empty column that looks like a styling bug.
4. **Heading levels.** Column titles via `heading_level` must sit below the page's `h1` and not compete
   with section headings — see the heading-order rule in
   [`architecture/theme-internals.md`](../../architecture/theme-internals.md).

## And the thing a footer recipe cannot verify for you

A footer is the most-rendered region on the site: every page pays for it. If a variant here needs a
`custom_html` block, ask once more whether a native element does it — because whatever you put there
ships on every page, forever, and `custom_html` runs `do_shortcode()`.
