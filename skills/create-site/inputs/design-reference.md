<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Input: a design reference

*"Make it look like this."* — a screenshot, a mockup, a Figma export, a photo of a page.

## What this route extracts, and what it does not

**Reads the look**: palette, type pairing and scale, spacing rhythm, corner radius, border and shadow
language, the treatment of sections — everything the [style model](../../../docs/site-creator/styles/README.md)
calls the seven slots.

**Does not reproduce**: the reference's content, its photographs, its logo, or a layout distinctive
enough to belong to it. You are building the person's site in that *register*, not rebuilding that
page.

The difference is easier to hold here than on the [URL route](url.md), because a screenshot gives you
no copy to accidentally ship — but the distinctive-layout line still needs judgement. A two-column hero
is a pattern; a particular diagonal split with a specific illustration is somebody's design.

## The job

1. **Read the image into the seven slots.** Palette first (sample it, do not guess from memory), then
   type, then shape, then rhythm. Write them as a style: either match an existing
   [library entry](../../../docs/site-creator/styles/README.md) and note the departures, or produce a
   custom one in `brand.style_notes`.
2. **Say which existing style is closest** and why. A reference that is 90% `modern-dark` should
   *become* `modern-dark` with two overrides, not a new one-off — the library exists so a look can be
   edited later.
3. **Get the content separately.** The reference supplies no facts. Everything in `business`, `pages`
   and `proof` comes from the person, and whatever they do not give you goes in `missing[]`.
4. **Build and compare.** `tools/measure/shot.mjs` your result and put it beside the reference. The
   question is *does it read the same*, not *is it pixel-identical* — it is a different page with
   different content.

## Reading a palette honestly

Sample the actual pixels. An eye estimate of "dark blue" lands somewhere plausible and wrong, and the
whole style then sits on a colour nobody chose.

Then **check the contrast before adopting it**. References are often screenshots of hero sections where
text sits over an image, and the apparent text colour has no contrast against the flat surface you are
about to build. The [ship gate](../../../docs/site-creator/ship-gate.md) checks this, but catching it at
extraction saves rebuilding the palette.

## The limit to state out loud

A design reference gives you **one page, at one width, in one state**. It says nothing about the mobile
layout, the hover states, the focus rings, the empty states or the other eight pages.

So the output is a style and a starting page, and everything else is your judgement applied in that
register. Say that when you hand it over — the person who supplied a beautiful screenshot is often
expecting a pixel match of a thing that only exists as one picture.

## Set on the spec

`source: "design-reference"`, the derived style in `brand`, and the reference itself recorded in the
build notes so the comparison can be re-run later.
