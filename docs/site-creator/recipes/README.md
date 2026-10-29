<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Section recipes — the format

The shape every recipe in this folder follows. A **recipe** is one section archetype — a hero, a navbar,
a feature grid — written so an agent can place it on a page without reading plugin source, and so the
result is an ordinary Unyson+ page the person can open in the builder and edit. This file is the contract;
the sibling files are the catalogue.

A recipe is **not** a prompt and **not** a code sample. It is a composition the kit can execute, with the
reasons attached, because the reasons are what stop the next agent from quietly doing the wrong thing.

## Why the format is strict

The output has to be *native*. Anything that emits React, or bakes a colour onto an element, or invents a
shortcode that does not exist, produces a page that looks right in a screenshot and is a burden in the
builder — which is the exact failure mode of every prompt-to-site tool we are not trying to be.

So each recipe states five things, in this order, and nothing else is required:

| Section | Answers |
| --- | --- |
| **When to use it** | the job this section does on a page, and when to reach for a different one |
| **The composition** | the exact arrangement, as code the kit can run |
| **The motion** | which Animation Engine effect pairs with it, and the restrained default |
| **The presets** | which Theme Settings presets it expects — never a baked colour |
| **The preview** | a link to our own demo page showing it live |

## 1 · When to use it

Two or three sentences in plain language: the job, and the nearest alternative. "A centred hero for a
single clear proposition; reach for the split hero instead when there is a product shot worth the space."

Write it for someone choosing between archetypes, not for someone admiring one. If a recipe cannot say
when **not** to use it, it is probably the same section as its neighbour.

## 2 · The composition

**Real code, against the real helpers** — `tools/upw-build-pages.php`, documented in
[`docs/building-pages.md`](../../building-pages.md). That file is the authority on the builder's storage
rules; recipes use its helpers and never hand-write builder meta.

> **Chrome recipes are the exception, and it is not a small one.** A navbar or a footer is not a
> page section: it is **Theme Settings**, it is **site-wide**, and it is applied with
> `fw_set_db_settings_option()` — not with `upw_*` helpers, which would put chrome inside one page.
> So in `navbars.md` and `footers.md` the composition is an **option-value array** for the relevant
> group (`header_main`, `header_layout`, `main_footer_columns` …), shaped exactly as
> [`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md) documents it.
> Everything else in the format is unchanged — slots, one motion idea, presets not literals, a preview.
>
> The consequence worth stating out loud: **editing a chrome recipe changes every page on the site.**
> That is the point of chrome, and it is also why a chrome recipe must never carry a value that
> belongs to one page.

```php
upw_div_section(array(
  upw_flexbox(array(
    upw_element('special_heading', array('title' => '{{headline}}', 'heading' => 'h1', 'alignment' => 'center')),
    upw_element('text_block',      array('text'  => '<p>{{standfirst}}</p>')),
    upw_element('button',          array('label' => '{{cta_label}}', 'link' => '{{cta_href}}', 'style' => 'btn-primary', 'size' => 'btn-lg')),
  ), array('direction' => array('base' => 'column', 'md' => '', 'lg' => ''))),
))
```

Rules that are not negotiable:

- **Use the real shortcode names.** The image element is `media_image`, not `image`. When unsure, the
  per-shortcode docs in [`docs/shortcodes/`](../../shortcodes/) are authoritative — read, do not guess.
- **A Flexbox defaults to ROW.** A stacked cell must say so, as above, or the heading sits beside its
  copy instead of over it.
- **Slots are `{{double_brace}}` placeholders** — `{{headline}}`, `{{standfirst}}`, `{{cta_label}}`. List
  every slot in a short table under the code, with what it expects and what happens when it is absent. A
  slot that is optional must degrade to *nothing*, never to filler text.
- **No colour, font or spacing literal in the composition.** Those come from the presets in section 4.

## 3 · The motion

Name the effect, give the restrained default, and say what it must do for a visitor who has asked for
less motion.

```php
$d = upw_effect_defaults('special_heading');     // never guess an att shape — dump it
$gsap = $d['gsap_motion']; $gsap['effect'] = 'fade-up';
```

- **One idea per section.** A hero that fades, slides, counts and parallaxes at once reads as a demo.
- **Dump the defaults, then change a key or two.** `upw_effect_defaults()` returns the live option value
  for every module; an invented att shape silently does nothing, and `upw_build_page()` reporting
  `effects in tree: (none)` is the tell.
- **Reduced motion is part of the recipe, not a footnote.** State the degraded state explicitly.

## 4 · The presets

A recipe says which **presets** it expects and lets the design system supply the values:

- **Buttons** — by preset class on the element's `style` / `size`: `btn-primary`, `btn-secondary`,
  `btn-primary-outline`, `btn-link`; `btn-sm`, `btn-lg`. See [`theme-settings/buttons.md`](../../theme-settings/buttons.md).
- **Cards and panels** — by a preset att on the element, from the Box Presets. **The att name differs by
  element and both are real:** `box_style` on content elements (blockquote, feature-list, flip-box,
  gallery), `border_preset` on the layout Divs (flexbox, column). Check the element's own doc before
  writing either. See [`theme-settings/boxes.md`](../../theme-settings/boxes.md).
- **Section surfaces** — by `variant` on the section Div: a Section-Style preset slug (`''` = Default,
  `alt` / `light` / `dark` / …) that themes background and text together as `section--<slug>`.
  **Section-only** — it does nothing on a nested Div.
  > The classic `section` shortcode also has a `variant` att, and there it really is **reserved**
  > (`shortcodes/section.md`). Recipes build on `upw_div_section`, which is a **Flexbox Div**, so the
  > Flexbox meaning is the one that applies — this file said the opposite until a recipe needed it.

> **The rule this exists to enforce:** a button's or card's look lives on its **preset**, never on the
> element. A per-element copy is a duplicate in the wrong place, and its `!important` outranks any later
> edit of the preset — so the person changes the preset, nothing moves, and the page becomes unmaintainable
> in exactly the way we promised it would not be.

## 5 · The preview

A link to a demo page **we** host, showing the recipe rendered with real content. Not a third-party
screenshot, not an external CDN: those carry someone else's brand and someone else's licence.

A recipe with no preview is unfinished — the preview is how a person chooses, and how we notice when a
recipe has rotted.

## Proving a recipe before it ships

The same bar as everything else in this kit, and the same reason: **the data being right does not mean
the page looks right.** A recipe is done when it has been placed on a real page, rendered in a browser,
and looked at.

1. Build it onto a page with `upw_build_page()`, against a local WordPress.
2. Load the page and **look at it** — then measure the thing the recipe claims (the computed value, the
   rendered size), so "it works" is a measurement rather than a hope.
3. Check it at phone width. Horizontal spacing is invisible at desktop width and obvious on a phone.
4. Run the ship gate — accessibility, performance, reduced motion. A recipe that fails it does not enter
   the catalogue; a thin catalogue of good sections is the goal, not a thick one.

## Keeping the catalogue honest

- **Recipes store option VALUES, so they go stale when options change.** This is the same maintenance
  problem as the Preset Library and the documentation screenshots, and it needs the same discipline:
  when a shortcode's options change, the recipes that use it are updated in the same turn.
- **Never name an external site, tool or brand** in a recipe, its slots or its preview. Describe the
  shape ("a barbershop landing page"), never the source.
- **One archetype per file**, named for the archetype (`heroes.md`, `navbars.md`), holding the small
  number of genuinely distinct variants — not every variation that could exist.

## The catalogue

| File | Archetype |
| --- | --- |
| [`heroes.md`](heroes.md) | Hero sections — centred, split, editorial, media-backed |
| [`navbars.md`](navbars.md) | Site header — Theme Settings chrome, not a page section |
| [`feature-grids.md`](feature-grids.md) | Icon-box and card grids |
| [`ctas.md`](ctas.md) | Conversion blocks |
| [`footers.md`](footers.md) | Site footer — Theme Settings chrome, not a page section |
| [`marquees.md`](marquees.md) | Moving logo / word strips |

Order follows measured demand — heroes dominate by a wide margin — not alphabetical tidiness. The plan
these sit under is the [AI Website Creator roadmap](https://docs.unysonplus.com/ai-dev-kit/ai-website-creator).
