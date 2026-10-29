<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Build rules

The non-negotiables. These are not style preferences — each one is a failure that has actually shipped
somewhere, and each separates a site the person can keep from a demo they have to throw away.

## 1 · The output is editable, or it is not done

**Every page is page-builder content**: Div sections, real shortcodes, Theme Settings presets. Never
static HTML, never one enormous Custom HTML block, never a theme file holding the layout.

The test: open the page in the builder and change the headline. If that needs a developer, the build
failed — whatever it looks like in a screenshot.

A bespoke piece with no matching element is the one exception, and it arrives as a small, isolated
`code_block` beside native sections, never as the page.

## 2 · One header, one footer, site-wide

Header and footer are **Theme Settings**, not page sections, so there is exactly one of each and every
page inherits them. A per-page header is a maintenance bill the person pays forever.

See [navbars](../../docs/site-creator/recipes/navbars.md) and
[footers](../../docs/site-creator/recipes/footers.md).

## 3 · Nothing is published until asked

Pages are created as **drafts**. The spec's `build.publish` defaults to `draft` for this reason.

Publishing is the person's decision, and it is the one action that cannot be quietly undone — a page
that went live for ten minutes may be in a search index, a cache or someone's inbox.

## 4 · No invented content. None.

The rule most likely to be broken, because breaking it makes everything look better.

- **No testimonials nobody gave you.** A fabricated quote attributed to a real business is not a
  placeholder, it is a false claim that the business will be held to.
- **No metrics.** "500+ happy clients" invented for a layout is the same thing with a number on it.
- **No pricing**, no opening hours, no service areas, no accreditations, no team members.
- **No lorem**, and no filler written to *read* like content — the second is worse, because it does not
  announce itself and ships unnoticed.

If a slot has no real content, **omit the slot**; if a section has no real content, **omit the
section**. Then list it in `missing[]` and tell the person. The recipes are written so every optional
slot degrades to nothing rather than to filler.

> A page with five honest sections is finished. A page with eight, three of them invented, is a
> liability with a nice screenshot.

## 5 · SEO is configured from real details

Native Unyson+ / theme SEO, filled from the business facts in the spec — not generated plausible text.
A `LocalBusiness` schema with an invented address is worse than no schema: it is structured, machine-read
misinformation about a real place.

Where the spec has `null`, leave it empty and list it in `missing`.

## 6 · Regenerate the preset CSS

**The failure unique to programmatic building.** Preset CSS lives in a generated
`uploads/**/unysonplus/css/presets-*.css` that a programmatic write does **not** rebuild — only the
admin save flow does.

So after writing `button_colors`, `button_sizes` or any Components preset: delete the generated files
and call `unysonplus_hf_regenerate_css()`.

Skip it and the site serves Bootstrap's blue-and-grey while the database holds a perfect palette. It
looks like the style failed to apply, and it sends you debugging the wrong layer entirely.

## 7 · Media is sideloaded, never hotlinked

A logo or image referenced by a URL from somewhere else, or by an attachment id from another install,
renders **nothing** on the target site. Unyson+ re-resolves images from their `attachment_id` on the
current site at render time.

Sideload into the target site's Media Library so a real id exists there. A text logo is a perfectly
good fallback and is what the theme falls back to anyway.

## 8 · Localhost is fair game; anything else is not

Build freely on a local install. A staging or live site is touched only when the person points at one
explicitly, and a destructive step there is confirmed first.

## 9 · Say what you left out

The build ends with the `missing` list in plain language. Not buried — stated.

This is what makes rule 4 survivable: the person can supply the three facts and get the sections, which
is a far better outcome than discovering months later that their site has been quoting a customer who
does not exist.

## 10 · Measure the palette, in both directions

A design system describes colour **per component** — "primary button, violet background, white text"
in one place, "links are violet" in another — and nothing forces those two statements to agree. A
Theme Settings **role** has no such freedom: one value feeds the button fill, the link text and the
icon. So the test is not "is this colour nice" but:

> **A role must pass as a fill carrying a label AND as text on the page. A value that passes in only
> one direction is a decoration, not a role.**

Before building a single section, check the palette you are about to write:

| Check | Threshold |
| --- | --- |
| Ink on the page background | 4.5:1 |
| Muted / secondary text on **every** surface it can land on | 4.5:1 |
| The label on every role used as a fill (button, badge, chip) | 4.5:1 |
| A role used as link or body text, on each surface | 4.5:1 |
| Large text (≥24px, or ≥18.66px bold) and non-text indicators | 3:1 |

Four traps, each of which has produced a real defect:

1. **The card is often lighter than the page.** A secondary grey that scrapes past on the canvas can
   fail inside every card — check the surface, not just the page.
2. **A gradient's contrast is its worst stop**, never its average. White on a sweep is safe at one end
   and invisible at the other.
3. **Glow is not contrast.** A halo reads as brightness to the eye and as nothing to a measurement.
   Apply it on top of a pairing that already passes.
4. **A saturated fill feels dark and usually is not.** Neon, amber, acid yellow, brass, highlighter
   red: they take the *background* colour as their label, not white.

**Where a brief and the measurement disagree, the measurement wins.** This is not a hypothetical: of
the thirty style briefs in `docs/site-creator/styles/prompts/`, a third name an accent that cannot be
used the way the brief itself says to use it — six of them fail in *both* directions, so no text
colour rescues the value and the fill has to move. Each brief records its own measured numbers; read
them before trusting its palette table.

If a style the person asked for cannot carry the contrast, **say so and propose the nearest value that
can** — usually the same hue a step or two darker, which keeps the look. Do not ship it failing and do
not silently substitute a different style.
