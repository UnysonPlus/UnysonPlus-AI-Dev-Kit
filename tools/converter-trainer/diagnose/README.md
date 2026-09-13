<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `diagnose/` — Site Converter fidelity toolkit

A small, reusable toolkit for diagnosing how faithfully the deterministic Site Converter reproduces a source
site. It is the **distilled, parameterized form** of the hundreds of one-off `probe*` / `shot*` / `measure*` /
`dbg-*` scripts that earlier conversion work kept re-writing per site — same handful of operations
(screenshot a page, probe its section structure, dump the builder JSON behind it), now as clean tools any
agent can point at a new list of sites.

> **Golden rule (house standard): a converter fix is not done until the RENDERED page matches source.**
> Checking the data (builder JSON) is necessary but NOT sufficient — dropped padding, invisible captions, and
> stale CSS caches all pass a data check while looking wrong. Always `shot.mjs` it and LOOK.

## The three tools

| Tool | What it answers | Replaces the old… |
|------|-----------------|-------------------|
| **`probe.mjs`** | *Where does the rendered page drift?* Per-section height, padding, headings, image count/size, column layout (`Ncells/Mrows`), and **runaway-height flags**. | `probe*`, `measure-*`, `structcheck`, `find-height`, `divscan` |
| **`shot.mjs`** | *What does it look like?* Full-page (or per-section) screenshot of the converted page, optionally alongside the source URL. | `shot*`, `fullshot`, `cmpshots`, `hero-shot` |
| **`dump-builder.php`** | *What did the converter actually produce?* The section → flexbox → column tree with width presets + block types — the ground truth behind the render. | `dump*`, `dbg-*`, `sec-atts`, `pbstruct` |

For a **rigorous per-section source-vs-converted band diff**, use the capture service's `verify.mjs`
(`assembled/UnysonPlus-Capture-Service/tools/design-capture/verify.mjs`) — these three are the fast inner loop.

## Workflow for a new list of sites

1. **Capture** each URL with the capture service (writes `<slug>/rendered.html` + the bundle):
   ```
   cd assembled/UnysonPlus-Capture-Service/tools/design-capture
   node capture.mjs <url> <batch-dir>
   ```
2. **Baseline the corpus** with the scorer (one row per site, 11 fidelity dimensions). Namespace it so it
   never clobbers another corpus's baseline:
   ```
   cd tools/converter-trainer
   OUT=<batch-dir> node score.mjs --baseline --corpus <name>     # e.g. --corpus wegic
   OUT=<batch-dir> node score.mjs --corpus <name>                # re-run = DIFF vs that baseline
   OUT=<batch-dir> node score.mjs --corpus <name> --only siteA,siteB   # fast loop on a few
   ```
   The lowest dimensions + any site that dropped tell you where to look. `import-site.php` (called by the
   scorer) imports ONE site into the localhost root and sets it as the front page.
3. **Diagnose the worst offenders** — import one site, then:
   ```
   cd diagnose
   node probe.mjs                         # overview: which section is wrong (look for ⚠ RUNAWAY, bad cols, imgs 0)
   node probe.mjs --section 6             # deep-dive that section's child tree (w×h + span classes)
   php  dump-builder.php --grep "Pricing" # the builder tree that produced it
   node shot.mjs --section 6 --out s6.png # LOOK at it; add --source <url> to shoot the source too
   ```
   (Import a specific capture without the scorer: `php dump-builder.php --import <batch-dir>/<slug>` — it
   reconverts the full bundle, then dumps. Then `probe.mjs` / `shot.mjs` against `http://localhost/`.)
4. **Fix the converter** (`unysonplus/framework/extensions/site-converter/…`), **mirror to the localhost root
   install** (the converter runs the *installed* copy — see the mirror rule in the workspace `CLAUDE.md`),
   reconvert, and re-`probe`/`shot` until the render matches source.
5. **Guard against regressions:** re-run `score.mjs --corpus <name>` over the whole corpus — the diff must not
   regress other sites. Only then is the fix done.

## Conventions

- **URL** defaults to `http://localhost/` (the root test install the scorer imports into). Override with
  `--url` or the `URL` env.
- **Playwright** resolves from a local install, falling back to `D:/Web Dev/pw-screens/node_modules/playwright`
  (same as `score.mjs`). **PHP / WP:** `dump-builder.php` needs the XAMPP php and reads `WP_LOAD`
  (default `D:/xampp/htdocs/wp-load.php`).
- Every tool prints its own one-liner usage in the header comment; `--json` on `probe.mjs` gives machine output.
- These tools **read** a rendered/imported page — they don't convert. Importing/reconverting is
  `score.mjs` / `import-site.php` / `dump-builder.php --import`.

## Improving the toolkit

This is meant to grow. When a NEW diagnostic need recurs across sites, add it here as a parameterized tool (or
a flag on an existing one) with a README row — do **not** start a new throwaway script. Keep each tool single-
purpose, parameterized (no hard-coded site/slug), and self-documented in its header.
