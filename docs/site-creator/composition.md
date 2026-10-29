<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Composition

A catalogue of parts is not a site. The [recipes](recipes/README.md) say what a section is and the
[styles](styles/README.md) say what it looks like; this file is the **sequencing layer** that turns a
brief into a coherent page.

It does not replace the build protocol — it feeds it. The order below is the protocol's fresh-build
path ([`site-build-protocol.md`](../site-build-protocol.md)), and a generator is no more allowed to
skip to "write sections" than a careful human build is.

## The order, and why it is not negotiable

```
design system  →  chrome  →  sections, region by region  →  motion  →  ship gate
```

**Design system first.** The style writes Theme Settings — palette, type, buttons, shape, surfaces,
rhythm — *before* a single section exists. Build sections first and every one of them acquires values
that then fight the design system when it arrives, and the result is a site where changing the primary
colour changes nine of fourteen buttons.

**Chrome second.** The header and footer are on every page, so they are the thing the whole site is
judged by, and they constrain the pages: a transparent header decides what the first section of every
page may look like. See [`recipes/navbars.md`](recipes/navbars.md) and
[`recipes/footers.md`](recipes/footers.md) — both are Theme Settings, not page sections.

**Sections third, one region at a time.** Finish a band before starting the next. A generator that
emits all nine sections and then fixes them is doing the thing the protocol exists to prevent.

**Motion fourth, and sparingly.** One idea per section, and the style's register decides how much.
Motion added while composing becomes motion nobody chose.

**The ship gate last** — [`ship-gate.md`](ship-gate.md). It is a gate, not a report.

## Page shapes

Which archetypes a page wants, in sequence. These are defaults to start from, not a straitjacket: a
page with nothing to say in a slot omits it rather than padding it.

### Home

```
hero → feature grid → [proof] → [secondary feature grid] → CTA
```

The most common mistake is length. A home page is an index, not a brochure: every section after the
CTA is read by fewer people than the one before it. If the brief gives you enough for ten sections, the
answer is usually a home page of five and an inner page for the rest.

*Proof* is testimonials, logos or numbers — whatever the brief actually supports. **Omit it if the
brief supports none.** An invented testimonial is not a placeholder, it is a lie, and it is the single
worst thing a generator can emit.

### About

```
editorial hero → narrative text → [team] → [values as a feature grid] → CTA
```

Longer measure than the home page; this is the one page people genuinely read.

### Services / Products

```
hero → feature grid (the services) → [pricing] → [FAQ] → CTA
```

When there are more than six services, this becomes an index page linking to one page each, not a
longer grid.

### Pricing

```
compact hero → pricing table → [FAQ] → CTA
```

The pricing table's layout comes from the offer's shape: plans with feature lists are a **grid**; a
service menu with a price per line is a **list**. Reading the page shape off the content rather than
defaulting to cards is the same rule the converter learned the hard way.

### Contact

```
compact hero → form + details side by side → [map]
```

No CTA band — the page *is* the CTA. A "Get in touch" block at the bottom of the contact page is the
tell of a generator following a template instead of reading the page.

## The rules that make a page cohere

**Alternate surfaces, do not decorate with them.** Light → Alt → Light → Dark, where the Dark band is
the CTA. Surface changes are the page's rhythm; a different surface on every band is noise and the CTA
stops reading as a moment.

**One `h1`, and the outline descends.** The hero is the `h1`; each band's heading is `h2`; items inside
a band are `h3` via `title_tag`. A grid of `h2`s under an `h2` is the most common accessibility defect
in generated pages.

**Vary the shape of adjacent bands.** Two card grids in a row read as one long grid. If the content
genuinely wants both, put something of a different shape between them, or merge them.

**The CTA earns its contrast.** It gets the inverted surface *because* it is the decision point. If
three bands on the page are inverted, none of them is.

**Repeat the archetype, vary the content — not the reverse.** A page using the icon row twice with
different content is coherent. A page using five different grid variants to avoid repetition is a
sampler.

## Choosing variants

The style decides, not the composer. Each style file carries a **section treatments** table naming the
variant it prefers for every archetype — that table is the whole mechanism by which a style's
personality reaches the page. Read it before picking a hero.

Where a style has no opinion, default to the recipe's own first variant: it is first because it is the
most-reached-for.

## Where this hands off

| Step | Document |
| --- | --- |
| The phases and gates | [`site-build-protocol.md`](../site-build-protocol.md) |
| What a section is | [`recipes/README.md`](recipes/README.md) |
| What it looks like | [`styles/README.md`](styles/README.md) |
| How a page is stored | [`building-pages.md`](../building-pages.md) |
| Whether it may ship | [`ship-gate.md`](ship-gate.md) |

## The failure this layer exists to prevent

A generator with a good catalogue and no sequencing produces pages that are *locally* correct and
globally wrong: every section well-built, the page as a whole arbitrary — three CTAs, no rhythm, a
hero that does not set up the section under it.

That failure is invisible in the data and obvious on the page, which is why the composition step ends
the same way every other step in this kit does: **render it and look at it.**
