---
name: create-site
description: Build a complete, editable Unyson+ WordPress site from a brief, a reference URL, a design reference or a vertical template. Use when asked to create, generate or build a new website, a landing page set or a site from scratch on Unyson+ / WordPress — including "make me a site for X", "build a site like this one", or "turn this design into a WordPress site".
---

# Create a site

Builds a **native Unyson+ site** — page-builder pages, shortcodes, Theme Settings presets, a child
theme — that the person can open and edit. Not React, not static HTML, not one enormous Custom HTML
block.

## Read first

- [Build rules](build-rules.md) — the non-negotiables. **Read these before anything else**; they are
  what separates a site someone can keep from a demo they have to throw away.
- [The site spec](site-spec.schema.json) — the structured source of truth. The spec is what the build
  reads; a prose brief is only the thing you turn *into* a spec.
- [Composition](../../docs/site-creator/composition.md) — the order, and which archetypes each page
  shape wants.
- [Styles](../../docs/site-creator/styles/README.md) — the design directions and what each one sets.
- [Recipes](../../docs/site-creator/recipes/README.md) — what each section archetype is.
- [The ship gate](../../docs/site-creator/ship-gate.md) — whether it may ship.
- [The build protocol](../../docs/site-build-protocol.md) — the phases and gates this flow runs inside.

## The four ways in

Route on what the person gave you. They are different builds, not different wrappers:

| They gave you | Route | Capture? |
| --- | --- | --- |
| A plain-language brief | [inputs/brief.md](inputs/brief.md) | no — the only path that skips it |
| A reference URL | [inputs/url.md](inputs/url.md) | **yes, first** |
| A screenshot or design file | [inputs/design-reference.md](inputs/design-reference.md) | yes |
| "Start from a template for my industry" | [inputs/vertical.md](inputs/vertical.md) | no |

> **Capture-first is a hard gate.** If the person pointed at a source — a URL, a screenshot, "make it
> look like this" — you capture before you build. Hand-measuring and hand-building before a capture
> exists is a protocol violation, not a shortcut. The brief and vertical paths are the exceptions
> because there is nothing to reproduce.

## How to work

1. **Gather the spec.** Run the intake for the route. Produce a `site-spec.json` validating against
   [the schema](site-spec.schema.json). **Agree it with the person before building** — a spec is cheap
   to change and a built site is not.
2. **Fill `missing` honestly.** Every fact you could not establish goes in `missing[]`. This is the
   field that stops the build inventing: no testimonials, no metrics, no opening hours, no service
   areas that nobody told you. A page whose proof is missing ships *without a proof band*.
3. **Design system first.** Apply the style: palette, type, buttons, shape, surfaces, rhythm — Theme
   Settings, before any page exists. **Measure the palette before you write it** — background against
   foreground, and every role both as a fill and as text (build rule 10). A third of the style briefs
   name an accent that fails as given, so the brief's table is a starting point, not a guarantee.
   Then **regenerate the preset CSS** (see build-rules.md); a
   programmatic write does not rebuild it, and the site will serve Bootstrap's defaults while the
   database holds your palette.
4. **Chrome second.** Header and footer are Theme Settings and site-wide. One of each.
5. **Pages, section by section.** Page shape from composition.md, variant from the style's section
   treatments table, slots from the spec. Finish a band before starting the next.
6. **Motion last**, in the style's register. One idea per section.
7. **The ship gate.** [ship-gate.md](../../docs/site-creator/ship-gate.md). A page that fails does not
   ship — and a created page has no source to excuse a gap against.
8. **Report what you did not do.** The `missing` list, in plain language, as the last thing you say.
   "I left the testimonials out because you have not given me any" is a useful sentence; silently
   shipping three invented ones is the worst outcome this skill can produce.

## After the site exists

Growing it is a different flow with its own gates: [content.md](content.md) — research and recommend,
approve, draft and optimize, approve again, publish. It reads the site and its spec rather than re-asking
for facts the build already established.

## What this skill does not do

- **It does not publish.** Pages are created as drafts until the person asks otherwise.
- **It does not touch a live site** without being pointed at one explicitly.
- **It does not invent content.** See build-rules.md — this is the rule most likely to be quietly
  broken, because invented content makes a demo look better.
- **It does not re-implement the converter.** The URL and design-reference routes hand off to the
  capture service and Site Converter and then refine; they do not parse HTML themselves.
