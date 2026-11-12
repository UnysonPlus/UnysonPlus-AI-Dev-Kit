<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# The design jury — how good is this page, actually

The [ship gate](ship-gate.md) can tell you a created page is fast, reachable and indexed. It cannot
tell you the page is any **good**. A site can pass every number in that file and still be a competent,
forgettable template — and a generator left alone will produce exactly that, forever, because nothing
in the pipeline ever disagrees with it.

This file is the missing half. It is the standard the industry design juries use, re-authored for a
page-builder site, and it ends the ship gate's one unautomatable instruction — *open the page and look
at it* — with something you can actually score, defend and argue with.

> **Where the thinking comes from.** The weighting and the method are the public award-jury model, the
> same one the open design-prompt libraries encode. Everything here is re-authored in our own
> vocabulary: those libraries describe React components and hand-written WebGL, ours describes Theme
> Settings, presets, recipes and the Animation Engine. We take the rubric, not the words, and not a
> line of their code.

## The rubric

| Criterion | Weight | What it measures here |
| --- | --- | --- |
| **Design** | 40% | Hierarchy, type, colour intent, spacing, and whether the detail holds on *every* page — not just the home hero |
| **Usability** | 30% | Where-am-I within three seconds, speed, phone layout, keyboard, reduced motion |
| **Creativity** | 20% | One idea that could not be moved to another business without breaking |
| **Content** | 10% | Real copy and real imagery, art-directed rather than dropped in |

Two consequences drive every decision below, and they are the two a generator gets wrong:

**Design and Creativity are 60%, but Usability at 30% is what kills a page.** A beautiful site that
loads slowly, breaks on a phone or hides its navigation scores below a plain one that works. Usability
is a *design constraint you build inside*, not a pass you run at the end — which is why the ship gate's
numbers belong in the composing loop, not after it.

**Creativity is one idea, not twenty effects.** Scattered motion reads as noise and loses points in
Design *and* Usability simultaneously. The page needs a single thing a visitor would describe out loud,
and the discipline to keep everything around it quiet.

## Theatre levels — the bar never moves, the spectacle does

The single most common way to get this wrong is to read "award-grade" as "maximum animation" and put a
cinematic hero on a loan application. **Craft is always at full. Theatre is matched to what the site is
for.** A page is scored against the same rubric at every level; what changes is which moves are
available to earn the points.

| Level | Default for | What it buys |
| --- | --- | --- |
| **Full** | Brand launches, portfolios, studios, hospitality, property, anything whose job is to be *felt* | A signature moment with real machinery, page transitions, scroll choreography, a considered entrance |
| **Measured** | **Most commercial sites** — finance, loans, legal, medical, trades, B2B, local services | The same craft in type, layout, colour and pacing, and **one** signature moment that *serves comprehension* rather than decorating it |
| **Quiet** | Only when the person asks: "simple", "basic", "minimal", "just the pages" | Entrances and state feedback only. No signature moment required |

### Choosing the level

Route on the brief, in this order — the first match wins:

1. **The person said so.** "Simple", "basic", "minimal", "nothing fancy", "just get it online" →
   **Quiet**. "Blow me away", "premium", "award-winning", "make it stunning" → **Full**. An explicit
   request always outranks the table.
2. **The vertical's own register.** Trust-and-conversion verticals default to **Measured**;
   brand-and-feeling verticals default to **Full**. See the vertical's file in
   [`verticals/`](verticals/).
3. **No signal at all** → **Measured**. It is the level that is never wrong: a measured site under-
   promises and still scores, where a cinematic one on the wrong brief actively loses points.

**State the level and the reason in one line** before building, the same way the stack is named in the
build protocol. "Measured — a loan comparison site is a trust purchase, so the spectacle budget goes
into the rate explainer, not the hero."

### Measured is not a lesser build

This is the level most sites land on, so it is worth being explicit about what it still owes. A
measured site has a design system, a considered type scale, a deliberate colour story, real content,
a signature moment and a phone layout that was designed rather than squeezed. What it does not have is
a loader, a three-dimensional hero, or motion competing with the thing the visitor came to do.

A measured car-loan site earns its Creativity points on a **scroll-driven rate explainer** that makes
the numbers legible, or a comparison that assembles as you read it — an idea that makes the subject
clearer. That scores; a particle field over an application form does not, because the jury reads it as
spectacle hiding a thin product, and the visitor reads it as a site that is not serious about money.

## The signature moment

**Exactly one per site.** Not one per page, not one per section. Everything else stays quiet and
precise, and that restraint is the thing that makes the one moment land.

A signature moment qualifies when all four hold:

1. **It belongs to this business.** Move it to another company in the same industry and it should
   break. A fade-up is not a signature moment; it is a default. The idea comes from the subject's own
   world - what the product *does*, the thing the owner is proud of - never from this season's effects.
2. **It is on the path the visitor already takes.** It happens where they were going to look anyway —
   the hero, the moment a price resolves, the transition into a case study. A moment nobody scrolls to
   did not happen.
3. **It survives its own failure.** Reduced motion, keyboard, a slow phone and JavaScript-off all end
   somewhere legible. The fallback is specified at the same time as the effect, never afterwards.
4. **It is built from what the framework has.** Animation Engine modules, a Kinetic Scene, the Motion
   Gallery, Scroll Motion, a page transition — not a bespoke script bolted beside the page builder,
   which the person then cannot edit. See [the build rules](../../skills/create-site/build-rules.md)
   §1: an output nobody can edit is not done.

### The strongest moment is usually something the visitor *does*

Scroll-triggered motion is the obvious form and the weakest one. The moments that actually separate an
award-grade page from a well-made one tend to be **participatory and specific to the subject**: a
keyboard site that lets you type on the product, a loan site whose rate explainer moves when you drag
the term, a studio site where the work assembles under the cursor.

Test it against rule 1 and the difference is obvious. A fade-up transplants to any business in ten
seconds. A thing the visitor *operates*, built out of the subject itself, cannot be transplanted at
all - which is the entire Creativity criterion, stated as a build instruction.

It also costs less here than it looks, because the interactive surfaces are already elements:
a form that computes, a [flip card](../animation-engine/flip-card.md), the
[Motion Gallery](../shortcodes/README.md), a [cursor](../animation-engine/cursor.md) treatment, a
tabbed or stepped recipe. **Prefer the version the visitor can touch** over the version that merely
plays at them, and reserve the scroll-driven option for when the idea genuinely is a sequence.

One warning, because this is where it goes wrong: an interaction nobody notices is worse than a static
section. Label it, place it on the path, and make its first state obviously operable.

> **The advantage worth using.** The open libraries hand-roll every one of these in a 3D library from
> scratch, which is why their sites are beautiful and unmaintainable. The machinery is already in the
> framework and already editable in the builder — so the cost here is *choosing well*, not building it.

**Where it lives per style:** each file in [`styles/`](styles/README.md) names the moves its direction
actually wants, under *The signature moment*. A cinematic reveal on a Swiss grid is not a brave choice,
it is a style error.

## Scoring a page

Score **0–10 per criterion**, weight them, and write one line of evidence per score. A number with no
sentence under it is a number somebody made up.

```
Design     8  — type scale holds across all five pages; the Alt/Dark band rhythm is deliberate;
                  card radius drifts on the pricing page (-1)
Usability  7  — nav is clear, 94 mobile; the phone hero needs two scrolls before the CTA (-2)
Creativity 8  — the rate explainer assembles as you read it, and belongs to this business
Content    6  — copy is real; three images are generic stock that fight the art direction
                                                                      WEIGHTED: 7.5
```

**The floor is 7.0 weighted, and no single criterion below 6.** A page under either does not ship — the
ship gate's existing language applies unchanged: a created page has no source to excuse a gap against,
so a failure here is a page that is not finished.

### Scoring honestly

A self-scored rubric drifts into a ritual that flatters itself: score your own page an 8, ship it,
nothing changed. Three rules keep it honest.

- **Score the whole site, not the hero.** Design is 40% and the word in the rubric is *every* page. The
  inner pages are where a generated site falls apart, and they are what a jury opens second.
- **Every point lost gets a named defect.** "Usability 7" is not a score, it is a shrug. "-2, the phone
  hero needs two scrolls before the CTA" is a score, because somebody can go and fix it.
- **Separate scoring from building where you can.** A review-only pass over a finished site — no
  permission to change it — produces a more honest number than the one written by whoever just built
  it. Run it as its own step, even in the same session.

### Calibration

A score means nothing without anchors, so the numbers are pinned to pages you can open rather than to
an idea of quality. Keep scored examples — a build at roughly 7, one at roughly 8.5, and one honest
failure — and when a score is in doubt, open them and compare rather than reasoning about adjectives.

## What this does not cover

Performance, accessibility and SEO targets are **not** restated here. They live in the Site Converter's
`docs/seo-performance-accessibility-standards.md`, §0 is the gate, and that document stays canonical —
their numbers feed the Usability score, they do not duplicate it. This file adds Design, Creativity and
Content, which nothing in the pipeline measured before.
