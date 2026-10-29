<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Navbars

The site header. **This is chrome, not a section** — it lives in Theme Settings, it is applied with
`fw_set_db_settings_option()`, and editing it changes every page at once. See the chrome note in
[`README.md`](README.md) before writing one.

The engine already names the archetypes: `header_mode` picks the *shape* of the header, and within the
default `top` mode, `header_design` picks its *treatment*. A recipe's job is to say **which to choose
and why**, and to get the composition right.

| Variant | `header_design` | Reach for it when |
| --- | --- | --- |
| [Classic bar](#1--classic-bar) | `classic` | the header should be furniture — read once, then ignored |
| [Floating pill](#2--floating-pill) | `pill` | the header is part of the design and the page scrolls under it |
| [Elevated card](#3--elevated-card) | `card` | a pill's shape fights a wide nav, but you still want it lifted |
| [Centered](#4--centered) | `centered` | the logo is the brand statement and the nav splits around it |

Three more live one level up, at `header_mode`, and are **not** `top` designs: `vertical` (a fixed side
rail — portfolios, galleries, anything where horizontal space is cheap and vertical is not),
`off-canvas-only` (a hamburger at every width) and `overlay` (a full-screen menu). Reach for those when
the *shape* is wrong, not the treatment.

---

## The composition, once

All four variants share one composition and differ only in `header_design` and a handful of values, so
it is written once here rather than four times.

```php
// 1 · The three slots. Each is an addable-popup element list; the item shape is
//     ['element_type' => ['element' => '<type>', '<type>' => [...sub]]].
$hm = (array) fw_get_db_settings_option('header_main', array());
$hm['main_left']   = array(array('element_type' => array('element' => 'logo')));
$hm['main_center'] = array(array('element_type' => array(
    'element'   => 'menu_area',
    'menu_area' => array('menu_location' => '{{menu_location}}'),   // a REGISTERED location, not a menu name
)));
$hm['main_right']  = array(array('element_type' => array(
    'element'    => 'cta_button',
    'cta_button' => array(
        'cta_text'  => '{{cta_label}}',
        'cta_link'  => '{{cta_href}}',
        'cta_style' => 'btn-primary',    // the preset class WITH the btn- prefix (see the gotcha below)
        'cta_size'  => 'btn-sm',
    ),
)));
fw_set_db_settings_option('header_main', $hm);

// 2 · The treatment — this is the only line that differs between the four variants.
$hl = (array) fw_get_db_settings_option('header_layout', array());
$hl['group_header_layout']['header_mode'] = array('mode' => 'top');
$hl['group_header_layout']['header_design'] = array('design' => '{{design}}');   // classic|pill|card|centered
$hl['group_header_layout']['header_position'] = '{{position}}';                  // static|sticky|overlay
fw_set_db_settings_option('header_layout', $hl);

// 3 · Menu type belongs to header_menu, not to the slot.
$hmenu = (array) fw_get_db_settings_option('header_menu', array());
$hmenu['menu_link_color']     = array('predefined' => '{{link_color_preset}}', 'custom' => '');
$hmenu['menu_link_font_size'] = array('value' => '{{menu_size}}', 'unit' => 'rem');  // unit-input, not a scalar
fw_set_db_settings_option('header_menu', $hmenu);
```

| Slot | Expects | Absent |
| --- | --- | --- |
| `{{menu_location}}` | a **registered theme location** (`primary`, …) | the menu area renders empty — this is the most common broken header |
| `{{cta_label}}` / `{{cta_href}}` | the header's single action | omit the whole `main_right` entry; do not leave an empty CTA |
| `{{design}}` | `classic` · `pill` · `card` · `centered` | `classic` |
| `{{position}}` | `static` · `sticky` · `overlay` | `static` |
| `{{link_color_preset}}` / `{{menu_size}}` | a colour preset slug / a bare number for the `rem` unit-input | theme defaults |

### Three gotchas that are not obvious

- **`cta_style` needs the `btn-` prefix.** `'btn-primary'` works; `'primary'` is **dropped silently** and
  the CTA falls back to a bare `.btn`. The header CTA is the one button on every page, so this is a
  site-wide defect that looks like a theming mistake.
- **`menu_location` is a location, not a menu.** A menu that exists but is not *assigned* to the
  location renders nothing. Check Appearance → Menus has the assignment before blaming the recipe.
- **The menu size option is `menu_link_font_size`, and it is a `unit-input`.**
  `programmatic-setup.md` abbreviates the `header_menu` keys as “`menu_link_color`/`_hover_color`/`_font_size`”,
  which reads as `menu_font_size` and does not exist. Writing a bare string to it is also wrong — the value
  is `array( 'value' => '0.875', 'unit' => 'rem' )`. Verified against `theme/options/header-menu.php`.
- **`custom_html` runs `do_shortcode()`.** That is how a mini-cart or a search form rides in the header
  (`[wc_mini_cart …]`). It also means whatever you put there executes — never interpolate a slot into it
  unescaped.

---

## 1 · Classic bar

**When to use it.** The default, and the right default. A logo, a nav, one action, on a solid bar. Use
it whenever the header's job is to be found rather than admired — which is most sites, and nearly every
site with more than six nav items. Reach for **Floating pill** only when the header is genuinely part of
the design language.

`'design' => 'classic'`, `'position' => 'sticky'`. Nothing else differs from the composition above.

---

## 2 · Floating pill

**When to use it.** The header is part of the design and the page scrolls *under* it. Suits short navs
(three to five items) on sites with generous whitespace. It fails loudly with a long nav: the pill grows
until it is a bar with rounded ends, which reads as a mistake rather than a choice.

```php
$hl['group_header_layout']['header_design'] = array(
    'design' => 'pill',
    'pill'   => array(
        'pill_width'  => 'hug',      // hug | fixed  — hug is what makes it read as a pill
        'pill_radius' => 'full',     // full | large | medium
        'pill_inset'  => 'small',    // none | small | large
        'pill_shadow' => 'soft',     // soft | medium | strong
    ),
);
$hl['group_header_layout']['header_position'] = 'sticky';
```

Three numeric overrides exist — `pill_offset`, `pill_radius_custom`, `pill_inset_custom` — and **win
over the presets when filled**. Leave them empty unless you are matching a measured source; a recipe
that fills them has pinned a value the design system can no longer move.

> The design variables (`--header-design-radius` / `-inset` / `-offset` / `-shadow`) are written onto
> the header **element**, deliberately. Do not re-emit them as `:root` values — a `:root` value loses
> the cascade to the preset every time.

---

## 3 · Elevated card

**When to use it.** You want the floating treatment but the nav is too wide for a pill to look
deliberate. A card keeps the lift and the inset while staying rectangular, so six or eight items still
read as a header.

```php
$hl['group_header_layout']['header_design'] = array(
    'design' => 'card',
    'card'   => array('card_radius' => 'medium', 'card_shadow' => 'medium'),   // small|medium|large · soft|medium|strong
);
```

Same rule on the overrides (`card_offset`, `card_radius_custom`): empty unless measured.

---

## 4 · Centered

**When to use it.** The logo is the brand statement and the nav splits around it — fashion, hospitality,
editorial. It costs horizontal room, so it wants a short nav and a wordmark that survives being the
widest thing in the header.

```php
$hm['main_left']   = array(array('element_type' => array('element' => 'menu_area',
    'menu_area' => array('menu_location' => '{{menu_location}}'))));
$hm['main_center'] = array(array('element_type' => array('element' => 'logo')));
$hm['main_right']  = array(array('element_type' => array('element' => 'cta_button', 'cta_button' => array(
    'cta_text' => '{{cta_label}}', 'cta_link' => '{{cta_href}}', 'cta_style' => 'btn-primary-outline', 'cta_size' => 'btn-sm'))));

$hl['group_header_layout']['header_design'] = array(
    'design'   => 'centered',
    'centered' => array('centered_gap' => 'normal'),   // tight | normal | roomy
);
```

Note the slots change here — the logo moves to `main_center` — which is why this is a variant rather
than a setting.

---

## The motion

**One idea, and for a header it is usually `sticky` plus nothing.** `header_position => 'sticky'` is
already motion: the header changes state on scroll. Adding a reveal on top of that gives the person two
things moving at once in the region they use to navigate.

`header_hide_on_scroll` (Sticky / Overlay only) slides the header away on scroll down and back on scroll
up. It buys vertical room on long pages and costs discoverability on short ones — on a page the person
can see the end of, the header disappearing is pure loss. Default it off and turn it on deliberately.

**Reduced motion:** a sticky header still sticks — that is position, not animation. What must not run is
the shrink transition and any hide-on-scroll slide: the header should simply be in its final state.

## The presets

- The CTA wears a **button preset** (`cta_style`, with the `btn-` prefix). Never a colour on the element.
- Menu link colours come from `header_menu`'s colour options, which take **colour preset slugs**.
- Bar styling — a blur, a hairline, a translucent fill — goes in **that section's Custom Styling block**,
  not in child-theme CSS. The header has its own scoped styling slot for exactly this, and CSS written
  elsewhere is a rule the Theme Settings UI cannot show the person who later wants to change it.

## Verifying a navbar

The bar in [`README.md`](README.md), plus four that only apply to chrome:

1. **Check it on a page it did not design for.** A header tuned against the homepage hero is the classic
   way to ship one that collides with a short page's first heading, or loses contrast over a dark band.
   Open a long page, a short page, and one with a photographic hero.
2. **Phone width, with the real menu.** The nav collapses to the off-canvas drawer; confirm the drawer
   opens, traps focus, and closes — and that the CTA is still reachable, since it is often the only
   action on the page.
3. **`overlay` position: check the first section.** A transparent header over a light hero is invisible.
   That is a contrast failure on every page at once, which is the thing chrome gets wrong most expensively.
4. **One `h1` still.** The header must not emit one — see the heading-order rule in
   [`architecture/theme-internals.md`](../../architecture/theme-internals.md). If it does, every hero in
   [`heroes.md`](heroes.md) must drop to `h2`.

## The preview

*Pending* — scheduled under **Phase 7, the style gallery** (see [heroes.md § Previews](heroes.md#previews)).
Chrome needs a demo site whose header it can own, so a navbar preview is a whole style demo rather than a
region of one — which is what the per-style demo page already is.
