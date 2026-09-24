<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Site Converter — Training Harness

A token-cheap loop for **improving the deterministic Site Converter against a corpus of
demo sites** (corpus-01, corpus-02, or any URL list). Instead of screenshotting every demo,
it captures a list once, runs each site through the *real* PHP converter headlessly, and
prints a **ranked list of fidelity flags** — so you only open the sites that actually
have a problem.

```
sites/corpus-01.txt   category|slug (or full URLs), one per line   ← the corpus
capture.mjs          batch-capture → per-slug dirs (no slug collision), skip existing
audit.php            run each capture through Stitch+Mapper → fidelity flags → CSV  (data-only, fast)
score.mjs            import + RENDER each site headless → per-dimension 0–100 score vs a baseline
train.sh             orchestrator: capture (skip existing) + audit
score/               import-site.php (per-site importer) + _baseline[.corpus].json / _scores[.corpus].json
diagnose/            probe.mjs · shot.mjs · dump-builder.php — the reusable per-site diagnostic toolkit (see diagnose/README.md)
```

**Multiple corpora, one harness.** `score.mjs` takes `--corpus <name>` so each corpus keeps its OWN
baseline (`_baseline.<name>.json`) and can't clobber another's — e.g. `--corpus corpus-02` alongside the default
corpus-01. It enumerates both capture layouts: corpus-01's nested `<slug>/shared-capture-dir/rendered.html`
and the capture service's normal `<slug>/rendered.html` (point it at any batch with `OUT=<batch-dir>`).

**When a site scores low, diagnose it** with `diagnose/` (the distilled form of the hundreds of one-off
probe/shot/dump scripts): `probe.mjs` (where the render drifts), `shot.mjs` (look at it), `dump-builder.php`
(the builder tree behind it). Full workflow in [`diagnose/README.md`](diagnose/README.md).

Two layers: **`audit.php`** is a fast, browser-free triage (does the *data* look wrong?);
**`score.mjs`** is the golden-regression gate (does the *rendered page* actually look right?).
Use audit to spot candidates cheaply; use score to prove a fix helped and didn't regress the corpus.

## The loop (this is the point)

1. **Capture once** (slow, background): `bash train.sh` — captures every site in the list
   that isn't already captured, then audits. Re-runs skip captured sites, so it's cheap to
   resume after an interruption.
2. **Read the ranked flags** (the console table + `batch/_audit.csv`). Sites are sorted
   most-severe first. Open only the flagged ones.
3. **Fix the converter** (`class-fw-site-converter-stitch.php` / `-mapper.php`), mirror to
   the localhost root install.
4. **Re-audit only** (fast, no browser): `bash train.sh sites/corpus-01.txt --audit-only` —
   re-runs the converter over the *existing* captures and shows whether the flags cleared.
   This is the tight iteration step; a full round costs seconds, not a capture.

## Scoring — the golden-regression gate (`score.mjs`)

The gate that ends "partial fixes." It imports each corpus site into the localhost root install,
**renders it headless at a monitor viewport (1920px)**, and scores seven dimensions 0–100, then
diffs the corpus against a stored baseline so **no converter edit ships that regresses the corpus.**

```bash
export NODE_PATH="/d/Web Dev/pw-screens/node_modules" WP_LOAD="D:/xampp/htdocs/wp-load.php" PHP="/d/xampp/php/php.exe"

node score.mjs --baseline            # score ALL captured sites, SAVE as the baseline (do this on a known-good state)
node score.mjs                       # score all, print the DIFF vs baseline (improved / regressed / unchanged)
node score.mjs --only regenerative-landscapes,apple-card-...   # score just these (fast loop while fixing)
node score.mjs --sample 12           # a fixed structurally-varied sample for a quick read
node score.mjs --viewport 1440       # test flush at a different width
```

| Dimension | 100 means | Measured from |
|---|---|---|
| `container` | text sections are capped, not flush to the screen edges | render (per-section content L/R vs viewport, minus full-bleed bg bands) |
| `spacing` | sections have real vertical padding (not collapsed) | render (paddingTop+Bottom ≥ 24px) |
| `logo` | header shows a real wordmark/image, not the "Home" fallback | render (logo text/img, generic-fallback rejected) |
| `iconbox_pad` | icon-boxes have horizontal padding | render (paddingLeft+Right) |
| `contrast` | text is legible against its background | render (text luma vs nearest opaque bg luma) |
| `bg_media` | a source hero bg-video was promoted to the section background | **builder data** (deterministic — hero section `background.video`/`image` vs a source cover/positioned `<video>`) |
| `verbatim` | no `code_block` (raw-HTML) fallbacks | builder JSON (`html` nodes / section count) |
| `structure` | the hero is present (first content section leads with a prominent, visible heading) | render — a structural-fidelity check that catches a MISSING/BURIED hero the per-section metrics score 100 on (found getty-images). Two further signals (`flattened`, `wrongBg`) are computed + reported for triage but NOT scored yet — they need better inputs (source-band comparison / video size) to avoid false-flagging healthy sites. |

`overall` is a weighted mean (container + contrast weighted highest). The **workflow**: on a known-good
converter, `--baseline`; make a fix; `--only <affected sites>` for the fast read; before shipping, run the
full `node score.mjs` and confirm the diff shows **improved/unchanged, never regressed**. A fix that raises
one site but drops three is caught here instead of in the next random convert.

> Speed: import+render is ~10–30s/site, so the full 67 is a background run (~30–40 min); use `--only` /
> `--sample` for the tight loop. The score install is the localhost root (each import overwrites the front page).
>
> Reliability notes (both fixed): (1) `import-site.php` raises PHP `memory_limit` to 1536M — a full bundle import
> of a large site otherwise fataled in wpdb (512M), which read as IMPORT-FAIL and produced phantom regressions.
> (2) `bg_media` is measured from the BUILDER, not a rendered autoplay video — a video's rendered size races with
> its load, so the old metric swung 100↔0 run-to-run on the same site and polluted every diff. If MySQL ever
> crashes mid-run (heavy import load), restart it (`mysqld --standalone`) and re-run; imports fail cleanly, not silently.

## Flags the auditor raises

| Flag | Meaning | Typical fix |
|---|---|---|
| `LIGHT_OVERLAY_WASH` | Section Background → Overlay is a light colour at >50% alpha (a cream/white wash over the hero — buries video + white text) | A decorative particle / caption card is being mistaken for a legibility scrim (`media_bg_overlay`) |
| `LOW_CONTRAST_TEXT` | Light section bg + light section text = invisible copy | An `oklch()`/`hsl()` dark band not resolving → falls back to the theme's light default (`rgb_triplet`) |
| `NO_HERO_BG` | First section has no background at all (colour/image/video) | A full-bleed hero media not hoisted, or a page-level fixed backdrop (`detect_page_bg_video`) |
| `EMPTY_SEC:n` | n sections have no text and no media | Content dropped by the section walker, OR a legit decorative spacer band (triage) |
| `VERBATIM:n` | n `code_block` (raw-HTML) fallbacks — uneditable, low-fidelity | A block kind the recognizers don't decompose |
| `FEW_SECTIONS` | ≤1 section decomposed | A single-scene site, or the section-root walker bailed |

Signals come from **two** sources on purpose: content (text/media) from the **mapping**
(heading text lives in each block's `text`), background/overlay from the **built tree**
(where a section's resolved Background lives). Auditing only the built tree undercounts
text — heading titles move into shortcode atts. (This bit an earlier ad-hoc metric.)

## Prereqs / env

- **Capture** needs the capture-service deps: `NODE_PATH` pointing at a Playwright install
  (default `D:/Web Dev/pw-screens/node_modules`). It calls the kit's assembled
  `UnysonPlus-Capture-Service/tools/design-capture/capture.mjs`.
- **Audit** needs a localhost WP with the Site Converter plugin active — it loads
  `wp-load.php` (default `D:/xampp/htdocs/wp-load.php`, override with `WP_LOAD`) and calls
  `FW_Site_Converter_Stitch` / `FW_Site_Converter_Mapper` directly. No browser.
- `PHP` (default `D:/xampp/php/php.exe`), `OUT` (captures root, default the assembled
  capture-service's `batch/`).

## Examples

```bash
# full corpus, background:  capture what's missing + audit
bash train.sh

# quick pass: only 8 new sites
node capture.mjs sites/corpus-01.txt --limit 8
php  audit.php  ../../assembled/UnysonPlus-Capture-Service/tools/design-capture/batch

# after editing the converter — re-score the existing captures (fast)
bash train.sh sites/corpus-01.txt --audit-only

# a different corpus / arbitrary URLs
printf 'https://my-website-h3eknqdj.corpus-02.net/\n' > sites/corpus-02.txt
bash train.sh sites/corpus-02.txt
```

## Adding to the corpus

`sites/corpus-01.txt` is `category|slug` per line (the corpus-01 `/api/preview?category=..&slug=..`
shape). For other sources, put full `https://…` URLs — one per line, `#` for comments.

## Verify visually when a flag is subtle

The harness proves the *data*. For a section that renders wrong without a data flag (a
stale combined-CSS cache, a preset-colour miss), still do the full `import_dir` + screenshot
pass on that one site (see the kit's `docs/extensions/site-converter.md` verify loop). The
harness narrows *which* site — it doesn't replace looking at the hard ones.
