<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# The style gallery

One rendered Unyson+ example per [style](styles/README.md), so a person can see before they pick — and
so the gallery doubles as proof of what the creator makes. Built on our own demos network, carded on
the demos home, never a copy of anyone else's preview media.

## The constraint that shapes all of it

**A style is site-wide Theme Settings.** Palette, type, buttons, shape, surfaces and rhythm are not
per-page values — they are the site's design system, which is the entire reason the style library
works the way it does.

So *"a demo page per style"* is not buildable as written: seven styles cannot coexist on one site, and
a page that carried its own palette would be demonstrating the thing the format forbids.

**The gallery is therefore seven demo SITES, not seven pages** — one subsite each on the demos
multisite network, every one running the same content through its own design system.

That is not a workaround. It is the honest demonstration: if the gallery could be built as pages, the
styles would not be real design systems.

## The shape

| | |
| --- | --- |
| **Where** | one subsite per style on the demos network |
| **Content** | the *same* page on every one, so the only difference is the design |
| **The page** | a home shape from [composition.md](composition.md): hero → feature grid → proof → CTA |
| **Discovery** | a card per style on the demos home grid, per the house rule that a demo is never reachable only by a direct URL |

### The content must be identical

This is what makes the gallery informative rather than decorative. Same headline, same three features,
same CTA, same images — so a person comparing `monochrome` with `luxury` is comparing *designs* and
nothing else.

The moment one demo gets a better photograph, the gallery stops answering the question it exists for.

### The content must also be honest

Demo copy is written for a **fictional business that is obviously fictional**, and carries no
testimonials, metrics or claims — the same [build rule](../../skills/create-site/build-rules.md) as a
real build. A gallery full of invented proof teaches the exact habit the creator is built to avoid.

## What a gallery demo doubles as

- **The recipe previews.** Every recipe file currently says *preview pending*. A style demo renders the
  hero, feature grid, CTA, navbar and footer that style prefers — so one demo supplies several recipe
  previews, which is why the recipes defer here rather than each getting a page.
- **A ship-gate sample.** Each demo is a created page and should pass [the gate](ship-gate.md). A style
  whose demo cannot pass is a style with a problem, found before anyone builds a real site on it.
- **Proof of the claim.** "Native, editable output" is checkable here: open a demo in the builder.

## Building one

1. **Create the subsite** on the demos network.
2. **Apply the style** — Theme Settings first, then regenerate the preset CSS. (A programmatic write
   does not rebuild it; skip this and the demo serves Bootstrap's defaults while the database holds the
   palette, which on a *gallery* means showing the wrong design to everyone.)
3. **Build the page** from the shared content, using the variants in that style's section-treatments
   table — the table is how the style's personality reaches the page.
4. **Chrome too.** Header and footer are part of the style; a demo without them shows half of it.
5. **Run the ship gate**, then look at it, desktop and phone.
6. **Card it on the demos home** — `build-demos-home.mjs`, then rebuild and import. A demo that is not
   on the home grid is orphaned.

## Status

**Not built.** This file is the specification; the seven demos are real build work on the demos
network and are tracked as their own roadmap task.

The subsite-not-page correction above is the reason the task was worth specifying before building: the
obvious reading of "a demo page per style" would have produced seven pages fighting one design system,
discovered only after all seven existed.
