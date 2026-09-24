<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Training the deterministic converter — the audit prompt

A "convert this source and fix what's wrong" request is only as good as the **proof** it demands. Asked
loosely ("do a full audit and update the converter"), an agent will read PHP, open one or two screenshots,
and report a list that is really a restatement of its own guesses. The audit then misses exactly the
defects a human sees instantly — an overlay that lost its pinning, a bare row that became a bordered
button, a centred headline that should be left-aligned.

The prompt below is the fix. It makes five things non-optional: **use the tools that already exist**,
**paste their numbers**, **look at every section yourself**, **treat any gap between the two as a bug in
the tools**, and **check the fix against the whole corpus, not just the site in front of you**.

> Every audit produces TWO kinds of fix: a **converter** fix (a general rule, proven by a golden) and a
> **tool** fix (the tool that failed to see it). An audit that only produced converter fixes did not
> actually check the tools.

> And every converter fix is a change to a **general rule**, so it lands on every site — including the
> ones nobody is looking at. One site's audit cannot tell you whether the rule you just generalised
> improved the corpus or quietly cost it. Only the corpus score can.

> **Do not hand-roll a Playwright script.** `tools/measure/` already contains the general forms of every
> one-off an agent reaches for — screenshot, probe an element, diff computed properties, split a page into
> sections, check a container width. Several of those tools say so in their own headers, because they were
> written after the same one-offs were rewritten for the tenth time. An audit that opens with a bespoke
> `shot.mjs` has already gone wrong: the bespoke script measures only what its author already suspected,
> which is precisely the blind spot the audit is supposed to find.

## The prompt (copy this)

```text
I converted <SOURCE URL> to <CONVERTED URL>. Audit the two and improve BOTH the deterministic
site converter and the verification tools. Work in this order and do not skip a step.

Use the tools in UnysonPlus-AI-Dev-Kit/tools and the capture service's verify.mjs. Do NOT write
one-off Playwright scripts — the general form of each already exists (see the inventory below).

1. RECONVERT FIRST, from the current code.
   Re-run the capture if capture-out/ is stale, then reimport with the FULL bundle
   (FW_Site_Converter_Bundle::import_dir on the whole capture-out folder — never pages.json alone),
   purge the WP cache + the asset-optimizer combined CSS, and confirm the page you are auditing is
   the one the current converter produces.
   Do NOT reconvert any OTHER source into the same install while auditing — a regression check that
   reimports a different site silently replaces the page under audit.
   To see what the converter actually PRODUCED (not what rendered):
     php tools/converter-trainer/diagnose/dump-builder.php

2. RUN EVERY TOOL AND PASTE THE NUMBERS. "I ran the tools" without numbers does not count.
   Fidelity lenses (capture service, tools/design-capture/verify.mjs):
     verifyUrls()      -> per-band drift %
     verifyChrome()    -> header, then footer
     verifySections()  -> per-section element findings, incl. grid-cols
     verifyPixels()    -> per-section cell-grid heat (the catch-all)
   Region + property measurement (tools/measure/):
     node measure/container-check.mjs <convertedUrl> <sourceUrl>
        -> the CONTENT width each side. A gutter counted on the wrong side of the box silently
           narrows every band and rewraps headings; nothing else reports it as a number.
     node measure/compare.mjs <sourceUrl> <convertedUrl>
        -> region-by-region ensemble: geometry Δ%, pixel diff, per-region pass/fail.
     node measure/props.mjs <sourceUrl> <convertedUrl>
        -> full-body NAMED property deltas (font-weight, colour, spacing). This is the lens that
           catches "the text is the right words in the wrong weight", which pixel and geometry
           lenses both miss.
     node measure/fidelity-check.mjs <srcUrl> <srcSel> <convUrl> <convSel>
        -> 4 independent lenses on ONE region, when a region needs a verdict of its own.
   Coverage + reachability:
     node tools/converter-trainer/class-coverage.mjs --keep
        -> which SOURCE classes the converter consumed vs ignored. An ignored class that carries
           layout is a defect no visual lens can name, because nothing rendered for it.
     node tools/option-reachability/check.mjs
        -> every header/footer option emitted by BOTH twins, ONE-SIDED, or NEITHER. One-sided is a
           bug: PHP wins a bundle import, so a JS-only rule silently loses.
   The capture's own reports: conversion-parity.json, conversion-drops.json, class-coverage.json,
   capture-residue.csv, style-coverage.csv.

3. LOOK AT EVERY SECTION YOURSELF.
     node measure/section-audit.mjs --source <sourceUrl> --converted <convertedUrl>
   splits both pages into their natural bands, matches them by heading, and writes ONE labelled
   side-by-side PNG per band. Use it instead of writing a cropping script.
   Then OPEN EVERY IMAGE and write what you see in it. Not a summary of the tool output — what is
   visibly different: missing overlays, wrong alignment, a button that gained or lost a border, an
   icon that replaced a text link, a caption that vanished, different image cropping, a background
   colour that changed.
   For anything you cannot identify from the image:
     node measure/probe.mjs <convertedUrl> --text "<the text>" --vs <sourceUrl>
   prints only the properties that DIFFER between source and build. Use it rather than guessing.
   If you did not open an image, say so; never present tool output as something you saw.
   NOT EVERYTHING ON THE CONVERTED PAGE CAME FROM THE CONVERTER. The install carries its own
   plugins and theme chrome, which render on every page — a floating language switcher, a cookie
   bar, an admin bar. Before filing something you can see as a conversion defect, confirm it exists
   in the SOURCE capture (grep rendered.html) or is absent from the converted HTML's plugin markup.
   An audit that blames the converter for another plugin's widget wastes the fix.

4. CROSS-CHECK, SECTION BY SECTION.
   For each section give three columns: what the tools reported | what I actually see |
   agreement. Then list, explicitly:
     (a) defects I can see that NO tool reported  -> TOOL BLIND SPOTS
     (b) tool findings that are noise or misleading -> TOOL FALSE POSITIVES
   This list is the deliverable of the audit. An audit with an empty (a) and (b) is suspect —
   say why you believe the tools are complete.

5. FIX BOTH SIDES.
   - Converter: fix the GENERAL rule, never the one source. State the rule in one sentence
     ("a control that paints nothing is a text link, not a CTA"), and add a golden assertion
     (PHP tests/golden-fixture-1-test.php) plus its JS twin so it cannot regress.
     Find the cause before writing the rule:
       php tools/converter-trainer/diagnose/dump-builder.php   what the converter produced
       node tools/converter-trainer/diagnose/probe.mjs --section N   how it rendered
     Before generalising a CHROME rule, measure how common the pattern actually is:
       node tools/chrome-survey/survey.mjs --urls <corpus list> --out out/<corpus>.json
       node tools/chrome-survey/digest.mjs out/<corpus>.json
     so "sources do X" is a share of a corpus, not an impression from this one site.
     After adding or emitting a theme option, re-run option-reachability/check.mjs — an option only
     one twin emits is a bug, and a capability that ships unemitted never fires on a conversion.
   - Tools: for each blind spot in 4(a), extend or add the tool so it WOULD have reported it,
     and for each false positive, tighten it. Add a fixture/test for the tool too.
   Say which fixes you deferred and why.

6. PROVE IT ON THIS SITE WITH MEASUREMENTS, NOT CLAIMS.
   Reconvert, re-run every tool from step 2, re-run section-audit.mjs, re-open the images. Report
   before/after numbers (band drift, findings per section, container width, section heights,
   parity score). Run the full golden suites + the JS tests and give the pass counts.
   A fix is "done" when a measurement moved, not when the code looks right. If a headline number
   did NOT move, say so plainly and say which number did.

7. PROVE IT ON THE CORPUS — a general rule lands on every site.
     node tools/converter-trainer/score.mjs --corpus <id> [--sample N]
   Report the per-dimension deltas and, explicitly, EVERY SITE THAT WENT DOWN. A fix that improves
   the audited site while lowering the corpus score is not done — either narrow its trigger
   condition until it stops firing where it should not, or say plainly that you are trading those
   sites away and why.
   For a chrome or styled-primitive rule, grade the capability directly:
     node tools/training/grade-chrome.mjs     header/footer slot ROLES preserved
     node tools/training/grade-styled.mjs     button/box fill, border, radius, shadow, hover
   (Both read the source truth CSVs from tools/training/extract.mjs — regenerate those first if the
   extractor changed.)
   A REGRESSION IS NOT YOURS UNTIL YOU HAVE A/B'd IT. Before hunting a cause, install the last PUSHED
   version of the extension (the clone under Github Repository/) and rescore one affected site. Swapping
   the changed includes plus the manifest is enough. Identical numbers mean the regression predates your
   work — say so and stop, rather than "fixing" the converter until someone else's number moves.
   Re-baseline (--baseline) only once the numbers are the ones you intend to keep, and never in
   the same run that you measure.
   NOTE: the corpus scorer CONVERTS EACH SITE INTO THE SAME LOCALHOST INSTALL, so it necessarily
   replaces the page step 6 just measured. That is why this step comes last. If you need to look at
   the audited site again afterwards, reimport it first (step 1) — every number you quote must come
   from a page you know is the one on screen.
   RUN IT ON AN OTHERWISE IDLE MACHINE, and treat a run that prints NO site lines as stalled, not slow:
   under concurrent browser load the per-site import can outrun its deadline, and that deadline does not
   reliably fire on Windows, so the loop stops rather than skipping the site. Stop it and re-run rather
   than waiting it out.
   SANITY-CHECK THE HARNESS BEFORE BELIEVING A REGRESSION. A run where every site reports
   `no-rendered` / `no-import`, or where the diff is a clean collapse to zero (99 -> 0 on every
   dimension at once), is a BROKEN HARNESS, not a converter regression — no real change degrades
   eleven independent dimensions to zero simultaneously. Check the capture paths resolve, then
   re-run. Report the diff only once the scored-site count matches the sample size.

8. HOUSEKEEPING.
   Bump the Site Converter manifest, the capture-service package.json and the kit manifest as the
   rules require; mirror the plugin to the localhost installs (never core-upgrade); no source-site
   or brand name anywhere in code, docs, goldens, commits or release notes — use a neutral id.
   End with the "Edited:" line.
```

## The tool inventory

Everything below already exists. Reach for it before writing anything.

### `tools/measure/` — measure a rendered page

| Tool | Answers |
|---|---|
| `section-audit.mjs` | Splits source and build into bands, matches them by heading, writes labelled side-by-side PNGs. **The step-3 tool.** |
| `compare.mjs` | Region-by-region ensemble — geometry Δ%, pixel diff — aggregated fail-loud. |
| `props.mjs` | Full-body NAMED property deltas. The only lens that sees "right words, wrong weight". |
| `container-check.mjs` | The CONTENT width each side — `max-width` minus gutter, the number a "Container Width = 1280" setting is meant to yield. |
| `fidelity-check.mjs` | Four independent lenses on one region: typography/content, geometry, pixel, structure. |
| `probe.mjs` | One element's computed props, or the diff of the same element across two pages. Replaces every one-off "what's the fontSize of X". |
| `shot.mjs` | Screenshots: full page, viewport, or one region by selector or text. |

### `tools/converter-trainer/` — score and diagnose many conversions

| Tool | Answers |
|---|---|
| `capture.mjs <list>` | Capture a whole corpus into per-slug dirs (idempotent). |
| `score.mjs --corpus <id>` | Score every site on the fidelity dimensions and diff against that corpus's baseline. `--sample N` for a fast, *stable* subset. **The step-7 tool.** |
| `score.mjs --baseline` | Record the current numbers as the new baseline. Never in the same run as a measurement. |
| `score/import-site.php <slug>` | Convert one captured site into localhost, headlessly. |
| `class-coverage.mjs` | Which source classes the converter consumed vs ignored — the lens for defects that rendered nothing. |
| `audit.php <captures-root>` | Per-site detail behind a score that moved, as CSV. |
| `diagnose/dump-builder.php` | The BUILDER JSON the converter produced — ground truth behind what rendered. |
| `diagnose/probe.mjs` | Structural/layout probe of a converted page; `--section N` deep-dives one band. |
| `diagnose/shot.mjs` | Screenshot a converted page, optionally beside its source. |

### `tools/chrome-survey/` — is this pattern actually general?

`survey.mjs` walks a corpus and records header/footer anatomy; `digest.mjs` prints the shares
(`--format md`, `--section anatomy|coverage`). Run it **before** generalising a chrome rule, so the rule
rests on a measured share rather than on the one source in front of you.

### `tools/option-reachability/` — can a conversion reach this option at all?

`check.mjs` reports every header/footer option as **BOTH** / **ONE-SIDED** / **NEITHER**. Adding a theme
option does not close a converter gap — the option also has to be emitted by both twins. One-sided is a
bug (PHP wins a bundle import, so a JS-only rule silently loses); NEITHER is informational, except right
after someone recorded a gap as closed.

### `tools/training/` — grade a capability across the corpus

`extract.mjs` runs a named extractor over a named list and writes the source-truth CSV;
`grade-chrome.mjs` measures how well header/footer slot ROLES survive; `grade-styled.mjs` measures how
faithfully button and box style features (fill, gradient, border, radius, shadow, hover) survive.

Corpora are keyed by a **neutral internal id** (`corpus-01`, `corpus-02`), and every derived file is
namespaced by that id so two corpora can never clobber each other's numbers. The lists themselves are
gitignored — they hold real source URLs, which never belong in the repository. See
`tools/converter-trainer/sites/README.md`.

## Why each clause is there

| Clause | The failure it prevents |
|---|---|
| "Reconvert first" | Auditing a page built by older code, so half the findings are already fixed. |
| "Don't reconvert another source into the same install" | A regression check that reimports a different site over the page under audit — after which every number quoted describes the wrong site. |
| "Don't hand-roll a Playwright script" | A bespoke script measures only what its author already suspected — exactly the blind spot the audit exists to find. It also skips the lens that would have caught the defect: an agent wrote its own crop + container scripts while `section-audit.mjs` and `container-check.mjs` sat unused. |
| "Paste the numbers" | "I ran the tools" as a claim; the tools were never run. |
| "container-check" | A gutter counted on the wrong side of the box narrows every band and rewraps headings, and no visual lens reports it as a number. |
| "props.mjs" | Pixel and geometry lenses both pass on text that is the right words in the wrong weight. |
| "class coverage" | A source class the converter ignored renders nothing, so no visual lens can report it — the defect is invisible rather than wrong. |
| "option reachability" | A capability that ships emitted by one twin only never fires on a conversion, while the gap reads as closed. |
| "Open every image" | Presenting tool output as visual review — the single most common dishonesty in these audits. |
| "Not everything came from the converter" | Filing the install's own plugin output as a conversion defect. A real audit logged a floating language switcher as "a third-party overlay baked in as content"; it was TranslatePress, active on the test install, and absent from the source entirely. |
| "Tool blind spots" | The tools only report what they model, so every defect they cannot express stays invisible forever unless the audit is required to name it. |
| "General rule + golden" | A fix keyed to one source, which the next conversion re-breaks. |
| "Check chrome rules against the survey" | Generalising from one site's header — the rule then fires on the majority of sources that do the opposite. |
| "Measurements, not claims" + "say which number did NOT move" | "Fixed" declared from reading the diff rather than the render, and headline numbers quietly dropped when they disappoint. |
| "Corpus score + name the sites that went down" | The silent trade: this site improves, five others regress, and nothing in a single-site audit can see it. |
| "A/B before owning a regression" | Chasing a cause in your own changes for a number that was already there. One swap of the pushed tree answers it in a single run. |
| "Sanity-check the harness" | Reading a broken harness as a catastrophic regression — or, worse, "fixing" the converter until a tooling fault goes away. The corpus step also guards the TOOLS: a run that scored nothing is how a path bug in the trainer surfaces at all. |

## The standing lesson

**A band score can only point at a band.** Element-level, section-aligned diffs are what expose layout
defects — and even those only see what they are built to model (text leaves and images, at first). Each
audit is therefore also a chance to widen what the tools can express: paint/skin diffs, non-text and
icon elements, cross-section relocation, position model (pinned vs flow), container column counts. Keep
widening them; the converter can never be more correct than the lens used to judge it.

And **one site cannot tell you a rule is right.** The lenses above judge a conversion; the corpus score
and the capability graders judge the *rule*. Both, every time.

See also: [fidelity-verification.md](fidelity-verification.md) (the four lenses),
[site-build-protocol.md](site-build-protocol.md) (the capture-first gate),
[extensions/site-converter.md](extensions/site-converter.md) (PHP↔JS parity rules).
