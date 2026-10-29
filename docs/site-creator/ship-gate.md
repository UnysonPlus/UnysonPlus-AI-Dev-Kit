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

## Running it

```bash
# spacing and collisions, desktop + phone — no source needed
node tools/measure/layout-audit.mjs <url>

# the style's container width actually rendered
node tools/measure/container-check.mjs <url>

# look at it — full page and per band
node tools/measure/shot.mjs <url> --full
```

Then the standards document's own §0 run (Lighthouse mobile, the three targets above).

## The bar

A page that fails the gate does not ship. Not "ships with a note" — a created page has no source to
excuse a gap against, so a failure here is simply a page that is not finished.

And the last step is the one that cannot be automated, same as everywhere else in this kit: **open the
page and look at it**, at desktop and at phone width, with the real content in it.
