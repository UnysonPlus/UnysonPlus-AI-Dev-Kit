<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# chrome-survey — corpus-scale header + footer survey, with theme-settings coverage

Every other tool in `tools/measure/` compares **one page against one other page** (source vs build).
This one walks a **list of N source sites** and records how each builds its header **and footer**, then
scores what it found against the UnysonPlus theme's Header and Footer settings.

It answers the question you have *before* any conversion work starts:

> What do these 120 headers and footers actually **do** — and can Theme Settings express it without
> custom CSS?

It never touches localhost, WordPress or a database, so it is **safe to run while another session holds
the converter / score harness**.

## Run it

```bash
npm i                                  # or rely on tools/measure's playwright-core
node survey.mjs --urls ../converter-trainer/sites/wegic.txt --out out/wegic.json
node digest.mjs out/wegic.json                       # the report
node digest.mjs out/wegic.json out/openhero.json     # two corpora, one pass
node digest.mjs out/wegic.json --format md > report.md
```

`survey.mjs` reads the same list format as `converter-trainer/sites/*.txt` — a full URL per line, or
`category|slug` for an openhero.art preview, `#` comments ignored. Useful flags: `--sample 30`,
`--limit 10`, `--concurrency 8`, `--no-interact` (skips hover + drawer click; roughly 2× faster),
`--headed`.

## Token discipline

The JSON is **for `digest.mjs`, not for reading into context** (~2.5 KB per site — a 120-site corpus is
~300 KB, which is exactly the "work from the report, not the raw tree" trap in
[`../README.md`](../README.md)). `survey.mjs` prints a one-line summary; `digest.mjs` prints a report
that fits in a couple of screens. Reach into the JSON only for a specific site, with `Grep`.

## Header and footer, one visit

Both site-chrome regions are measured in the same page visit. The footer is read after
scrolling to the bottom (so reveal-on-scroll content is laid out) and is resolved by the same
kind of scored search as the masthead — generated sites often close with a `<div class="footer">`,
and a `<footer>` tag sometimes wraps only the copyright strip rather than the whole block.

The footer question that actually decides fidelity is the **column ratio**, not the column count:
the theme drives each footer row from a split-slider (count + widths + names, up to 6 columns, any
ratio), so a wide brand column beside narrow link columns is reproducible exactly — but only if you
know the ratio. `survey.mjs` records the normalised width ratio and an `equal` flag, and `digest.mjs`
reports the distribution.

## What one page visit measures

Structure (masthead tag/class/position/z-index, DOM node count and depth, the L/C/R slot roles with
x-positions so a *visually centred* nav is detected), chrome (background, gradient, backdrop-filter,
border, shadow, padding, container max-width, font stack), **both scroll states** (at rest, stuck at
700px, and 2400px to catch hide-on-scroll), the **real hover treatment** on a nav link including
`::before`/`::after` (animated underlines live in the pseudo-elements — a plain style diff misses
them), and mobile at 390px including an **actual hamburger click** to measure the opened drawer.

For the footer: resolved element and whether the `<footer>` tag was it, height, node count, stacked
row count (the theme models Pre / Main / Post / Copyright), the column band's count + width ratio +
gap + `grid-template-columns`, background, top border, padding, alignment, and the content signals
(logo, social, newsletter form, back-to-top, copyright line, column headings, tel/mailto).

### Why the masthead search is scored, not `querySelector('header')`

On the OpenHero corpus the masthead is a `<nav>` on **72%** of pages and `<header>` is the **hero**
band. `document.querySelector('header')` therefore returns a full-height video section on a quarter of
those pages and nothing at all on half. `survey.mjs` scores every candidate near the viewport top on
tag, `role=banner`, class name, `position`, link density and node count instead. If you are writing
anything that needs "the header" of an arbitrary site, reuse that approach.

## capability-map.json — the part that saves the most time

Maps each detectable construct to the **option that reproduces it**, the file that defines that option,
and a verdict:

| Verdict | Meaning |
|---|---|
| `EXACT` | a settings field reproduces the source value as-is |
| `NEAR` | the option exists but its value is fixed or quantised (a boolean, or a 3-value preset) — visually close, not identical |
| `CSS` | no option covers it; needs a custom declaration |

It exists so an agent never again greps ~2,900 lines of header + footer option PHP to answer "can the
theme do this?". It also carries the standing **gap list** (`G1`–`G8`) with the concrete fix and file for each.

**Maintenance:** when a header or footer option is added or changed in `unysonplus-theme`, update the matching
entry, refresh `verified_against`, and bump `version`. Detection logic lives in `digest.mjs`; option
ids, files, verdicts and gaps live in the map.

A few constructs refine their verdict from the measured value — a `blur(10px)` glass is `EXACT` because
that is what the theme emits, `blur(40px) saturate(1.5)` is `NEAR`. Those conditionals are in
`digest.mjs` and described as `exact_when` in the map.

## `--strict-mobile`

Some generated corpora hide their nav links on mobile with no drawer at all. That is a **source
defect**, not a fidelity target: the theme supplies a real hamburger and drawer, so the rebuild improves
on the original. By default those sites are not counted as misses. `--strict-mobile` counts them, which
swings the headline hard (on OpenHero: 11% → 97% of sites "needing custom CSS"), so state which mode a
number came from whenever you quote one.
