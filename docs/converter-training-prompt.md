<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Training the deterministic converter — the audit prompt

A "convert this source and fix what's wrong" request is only as good as the **proof** it demands. Asked
loosely ("do a full audit and update the converter"), an agent will read PHP, open one or two screenshots,
and report a list that is really a restatement of its own guesses. The audit then misses exactly the
defects a human sees instantly — an overlay that lost its pinning, a bare row that became a bordered
button, a centred headline that should be left-aligned.

The prompt below is the fix. It is written to make three things non-optional: **run the tools**,
**look at every section yourself**, and **treat any gap between the two as a bug in the tools**.

> Every audit produces TWO kinds of fix: a **converter** fix (a general rule, proven by a golden) and a
> **tool** fix (the tool that failed to see it). An audit that only produced converter fixes did not
> actually check the tools.

## The prompt (copy this)

```text
I converted <SOURCE URL> to <CONVERTED URL>. Audit the two and improve BOTH the deterministic
site converter and the verification tools. Work in this order and do not skip a step.

1. RECONVERT FIRST, from the current code.
   Re-run the capture if capture-out/ is stale, then reimport with the FULL bundle
   (FW_Site_Converter_Bundle::import_dir on the whole capture-out folder — never pages.json alone),
   purge the WP cache + the asset-optimizer combined CSS, and confirm the page you are auditing is
   the one the current converter produces.

2. RUN EVERY TOOL AND PASTE THE NUMBERS.
   - verifyUrls()      -> per-band drift %
   - verifyChrome()    -> header, then footer
   - verifySections()  -> per-section element findings
   - the capture's own reports: conversion-parity.json, conversion-drops.json,
     class-coverage.json, capture-residue.csv
   Report the actual output. "I ran the tools" without numbers does not count.

3. LOOK AT EVERY SECTION YOURSELF.
   Produce one side-by-side crop per matched section (source left, converted right, same width),
   then OPEN EVERY CROP and write what you see in it. Not a summary of the tool output — what is
   visibly different: missing overlays, wrong alignment, a button that gained or lost a border, an
   icon that replaced a text link, a caption that vanished, different image cropping.
   If you did not open a crop, say so; never present tool output as something you saw.

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
   - Tools: for each blind spot in 4(a), extend or add the tool so it WOULD have reported it,
     and for each false positive, tighten it. Add a fixture/test for the tool too.
   Say which fixes you deferred and why.

6. PROVE IT WITH MEASUREMENTS, NOT CLAIMS.
   Reconvert, re-run every tool, re-crop, re-open the crops. Report before/after numbers
   (band drift, findings per section, section heights). Run the full golden suites + the JS
   tests and give the pass counts. A fix is "done" when a measurement moved, not when the code
   looks right.

7. HOUSEKEEPING.
   Bump the Site Converter manifest, the capture-service package.json and the kit manifest as the
   rules require; mirror the plugin to the localhost installs (never core-upgrade); no source-site
   or brand name anywhere in code, docs, goldens, commits or release notes — use a neutral id.
   End with the "Edited:" line.
```

## Why each clause is there

| Clause | The failure it prevents |
|---|---|
| "Reconvert first" | Auditing a page built by older code, so half the findings are already fixed. |
| "Paste the numbers" | "I ran the tools" as a claim; the tools were never run. |
| "Open every crop" | Presenting tool output as visual review — the single most common dishonesty in these audits. |
| "Tool blind spots" | The tools only report what they model, so every defect they cannot express stays invisible forever unless the audit is required to name it. |
| "General rule + golden" | A fix keyed to one source, which the next conversion re-breaks. |
| "Measurements, not claims" | "Fixed" declared from reading the diff rather than the render. |

## The standing lesson

**A band score can only point at a band.** Element-level, section-aligned diffs are what expose layout
defects — and even those only see what they are built to model (text leaves and images, at first). Each
audit is therefore also a chance to widen what the tools can express: paint/skin diffs, non-text and
icon elements, cross-section relocation, position model (pinned vs flow). Keep widening them; the
converter can never be more correct than the lens used to judge it.

See also: [fidelity-verification.md](fidelity-verification.md) (the four lenses),
[site-build-protocol.md](site-build-protocol.md) (the capture-first gate),
[extensions/site-converter.md](extensions/site-converter.md) (PHP↔JS parity rules).
