<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Logo

Every site has a brand mark in the header, and on a generated site it is almost always the site title
set in the body font. That is the theme's **fallback**, not a design, and it is the single clearest
signal that nobody finished the job — a visitor reads it before they read anything else.

**`brand.logo` in `missing[]` is a reason to make one, not a reason to skip it.** It belongs with
`content.copy`, not with `proof.testimonials`: a wordmark drawn from the business name asserts nothing
about the business that the business name does not already assert, so
[build rule 4](../../skills/create-site/build-rules.md) does not reach it. A testimonial has to be
given to you. A logotype does not.

> The rule's own test: *could this be wrong about them?* A mark built from their name, in the design
> system's type and colour, cannot be. It is the writing you were asked for, drawn.

## Make it with the design skill, not from scratch

A dedicated **`logo-design`** skill exists in this workspace — mark types, optical refinement, the
16px / one-colour / reversed tests, a classified reference library. Per
[the styles' reuse rule](../styles/README.md), point at it and carry only the mapping. Invoke it,
and bring back an **SVG**.

What this kit adds is the constraint that makes the result belong to *this* site:

- **The logo is part of the design system, so build it after the style and from the style.** Its
  typeface is the heading font already chosen; its colour is a role already in `theme_colors`. A mark
  in a fourth typeface is a second design system fighting the first.
- **Match the style's shape language.** Radius 0 and hairline rules under `swiss` or `monochrome`;
  soft radii under `modern-dark`; geometric solids under `bauhaus`. The logo is the smallest statement
  of the same argument.
- **Scope to the theatre level.** Quiet and Measured briefs get a **logotype** — the name, set and
  spaced deliberately, perhaps with one mark. Full earns a constructed symbol. A pictorial mark on a
  Quiet brief is the enthusiasm failure of build rule 11 in miniature.
- **One mark, two renderings.** The header sits on the page ground, the footer usually on a dark band.
  Produce the mark and a reversed copy, and check both — a dark-ink logotype on a near-black footer is
  the most common way this ships broken.

## Putting it on the site

SVG is supported end to end: uploads are sanitised and flattened, Illustrator `<style>`/class exports
are converted to presentation attributes, PostScript font names normalised, and SVG attachments get
metadata and a preview. See [`theme-settings/header.md`](../../theme-settings/header.md).

1. **Outline the type.** Illustrator *Type → Create Outlines*, or equivalent. A logo referencing a font
   by name renders in whatever the viewer happens to have.
2. **Sideload into the target site's Media Library.** Rule 7 — a hardcoded URL or an attachment id from
   another install renders **nothing**, because the theme re-resolves logos from `attachment_id` on the
   current site at render time.
3. **Set `header_logo` with `logo_type=custom`** and the new attachment. Leaving it on the text logo
   means the upload exists and is not used, which looks identical to never having made one.
4. **Set the footer logo too** — `footer_logo` → `footer_logo_image`, with the reversed rendering. It is
   a native element; do **not** hand-build a `text` element with an inline `<img>`.
5. **Add a favicon** from the same mark, square-cropped. An unset favicon shows the host's default and
   undoes the work in the one place every visitor keeps: their tab bar.

## Check it before moving on

The design skill's tests, applied to the built site rather than to the artboard:

| Check | Looking for |
| --- | --- |
| Header at 100% and at 390px | The mark is legible at its real rendered size, not at the size you drew it |
| Footer band | The reversed copy, on the actual footer colour — not assumed |
| Favicon at 16px | Still a shape. Most logotypes are not, which is why the favicon is usually a monogram |
| Greyscale | Hierarchy survives without colour |
| Page ground and every section surface the header can sit over | A transparent-ground SVG on an Alt band |

Look at each one rendered. A logo verified only as a file is not verified.

## When to leave it as text

Rare, and it is a decision rather than a default:

- The person has a logo and is sending it. Set the text logo, say so, swap it when the file arrives.
- The brand's identity genuinely *is* typographic and the heading font carries it — a few editorial and
  `monochrome` briefs. Then the wordmark is still **composed**: tracking, case and weight chosen, not
  the site title emitted at default body settings.

Either way, say which one happened. "I left the logo as text because you are sending me yours" is a
sentence the person can act on; a default nobody mentions is not.
