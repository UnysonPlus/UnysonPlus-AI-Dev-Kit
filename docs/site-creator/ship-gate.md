<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# The ship gate, for a created site

A composed page carries exactly the same obligations as everything else we ship. **The standards are
not restated here** — they live in the Site Converter's
`docs/seo-performance-accessibility-standards.md`, §0 is the gate, and that document is canonical:

| Category | Target |
| --- | --- |
| Performance | ≥ 90 mobile |
| Accessibility | 100 |
| SEO | 100 |

What follows is only what is **different** when the page was created rather than converted. Everything
else, read there.

## The difference that changes everything: there is no source

A conversion has ground truth. The source page exists, so "is this right?" is a diff, and
`section-audit.mjs` answers it band by band.

A created page has none. Nothing says the hero is too tall or the palette fails on the CTA, because
there is nothing to compare it to. **The gate is the only ground truth a created page has** — which
means it is not a report at the end, it is the thing standing in for the source throughout.

Practically: the lenses that need a source do not apply, and the self-check lenses become load-bearing.

| Tool | Conversion | Creation |
| --- | --- | --- |
| `section-audit.mjs` | the main lens (source vs build) | **not applicable** — no source |
| `compare.mjs` | props that differ from the source | **not applicable** |
| `layout-audit.mjs` | a secondary check | **primary** — it needs no source |
| `container-check.mjs` | container width vs source | checks the style's own container preset holds |
| `shot.mjs` | screenshots to compare | screenshots to *look at* |

## The four checks a created page needs that a converted one does not

### 1 · The content is real

A created page's content came from a brief, so it can contain things no conversion ever would:
placeholder text, invented statistics, fabricated testimonials, a phone number nobody owns.

- **No lorem, no "Lorem-equivalent"** — filler written to look like content is worse than filler that
  announces itself.
- **No invented proof.** If the brief gave no testimonial, the page has no testimonial section. This is
  the hard one, because a proof band makes any page look better and nobody notices the absence of a
  claim that was never true.
- **Every slot the recipes marked optional is either filled from the brief or omitted** — never filled
  with something plausible. The recipes say this per slot; the gate is where it is checked.

### 2 · The style's own claims hold

Each style file states values; the gate checks they survived contact with a real page.

- **Contrast on the actual palette, in both directions** — see
  [build rule 10](../../skills/create-site/build-rules.md). Every button preset against every surface
  preset it can land on, not just the one the demo used, AND every role used as text on every surface
  it can sit on. The dark styles fail here most often, and they fail on the primary button, which is
  the one element everything funnels toward. Watch the card surface in particular: it is frequently
  lighter than the page, so a secondary colour that passes on the canvas can fail inside every card.
- **The container preset is the one the style named.** A style that says Narrow and renders Wide has
  silently become a different style.
- **The radius language is consistent.** One rounded control in a zero-radius style is the detail that
  reveals a part-applied theme.

### 3 · The presets actually rendered

The failure mode unique to programmatic creation: **preset CSS lives in a generated
`uploads/**/unysonplus/css/presets-*.css` that a programmatic write does not rebuild.** Only the admin
save flow does.

So a created site can hold a perfect palette in the database and serve Bootstrap's blue-and-grey. It
looks like the style failed to apply, and it sends you debugging the wrong layer.

**Check the rendered button, not the stored option.** If it is wrong, delete the generated files and
call `unysonplus_hf_regenerate_css()`.

### 4 · Reduced motion

Every style states its register and every recipe states its degraded state. Turn the OS setting on and
reload:

- nothing moves;
- nothing is invisible — a hero whose reveal was skipped must not be left at `opacity: 0`;
- state changes (hover, focus, a button inversion) still work, because they are not animation.

Test it in the OS setting, not by reading the code.

### 5 · The framework was actually used, and the signature moment is named

Build rule 12 has always been mandatory and has always been skippable, because nothing asked for its
output. It does now, and the answer is **one sentence written down**, not a feeling:

> *The three offers arrive one after another, staggered 120ms — which is what a broker does.*

**No sentence, no pass.** A build with nothing to put here has not been restrained; it has shipped a
template. The moment must satisfy all four tests in [`design-jury.md`](design-jury.md) § The signature
moment — it belongs to this business, it sits on the path the visitor already takes, it survives
reduced motion, and it is built from the framework's own machinery.

Two failures that produce a blank here, both of them silent:

- **The Animation Engine is inactive.** It ships that way in the core plugin, so every motion module
  is absent with no error to show for it. Check it in a FRESH request —
  `fw()->extensions->get('animation-engine')` — because the request that activates it still reports
  inactive, which is an easy false negative to believe.
- **The component library went untouched.** Patterns, dividers, box presets, surfaces
  ([`recipes/components.md`](recipes/components.md)) are one option away from any band, and a build
  that used none of them will look generated whatever its contrast scores say. Name which bands
  carry what, and for each band that carries nothing, why.

### 6 · It is scored, not just measured

Checks 1–5 and the standards run tell you the page is real, consistent and reachable. None of them
tells you it is any **good** — a created page can pass every number here and still be a forgettable
template, and nothing else in the pipeline will ever say so.

So the gate ends with a scored pass against [`design-jury.md`](design-jury.md): Design 40, Usability 30,
Creativity 20, Content 10, each 0–10, each with one line of evidence naming what cost the points.

- **The floor is 7.0 weighted, with no single criterion below 6.**
- **Score the whole site, not the home hero.** Design is weighted on *every* page, and the inner pages
  are where a generated site comes apart.
- **Score it as its own step**, not as a sentence added to the build summary. The number written by
  whoever just finished building is the least honest one available.

This is the check that turns the instruction at the bottom of this file — *open the page and look at
it* — from an aspiration into something with a pass mark.

## Running it

**Run the audit on EVERY page, not the home page.** It is the primary lens for a created site, it
needs no source, and it exits non-zero on a blocking finding so a build step can gate on it. Skipping
it is how a heading ends up 22px under an 80px shape divider — measured, blocking, and invisible to
everyone who merely looked at the screenshot.

```bash
# spacing and collisions, desktop + phone — no source needed. EVERY page.
for p in "" about/ services/ pricing/ contact/; do node tools/measure/layout-audit.mjs <base>/$p; done

# the style's container width actually rendered
node tools/measure/container-check.mjs <url>

# look at it — full page and per band
node tools/measure/shot.mjs <url> --full
```

Then the standards document's own §0 run (Lighthouse mobile, the three targets above), and the
scored pass from check 5 — [`design-jury.md`](design-jury.md) has the rubric and the worked example.

## The bar

A page that fails the gate does not ship. Not "ships with a note" — a created page has no source to
excuse a gap against, so a failure here is simply a page that is not finished. **A page under the
design-jury floor fails for the same reason**: an unremarkable page is not a different category of
outcome from a slow one, it is the same page not being finished.

And the last step is the one that cannot be automated, same as everywhere else in this kit: **open the
page and look at it**, at desktop and at phone width, with the real content in it.
