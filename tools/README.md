# Tools inventory — the kit's runnable tools (check here BEFORE building your own)

> **REFLEX (read this first).** Before you conclude "the kit doesn't have a tool for X" or start
> writing/installing your own — **check this file.** The kit is meant to already have the tool. The
> classic failure: `require('playwright')` fails in ONE folder → "no playwright, can't verify" — when
> `tools/measure/` has its own playwright installed and documented all along. **Never diagnose a
> capability as missing from a single folder. Map the NEED to the tool below.**

Every tool here is **self-contained**: each JS folder has its own `package.json`, so it gets its **own
playwright** (and pixel/perceptual deps) with one `npm install` in that folder. Nothing is borrowed
from a global install or a personal copy.

## "I need to…" → run this

| When you need to… | Tool | Setup |
|---|---|---|
| **Measure ONE element's computed props** (by visible text or CSS selector), or **diff the same element source-vs-build** — the ad-hoc "what's the fontSize/margin/width of X?" case. **Run this instead of hand-writing a Playwright probe.** | `tools/measure/probe.mjs <url> (--text "…"\|--sel "css") [--props "a,b,c"] [--vs <srcUrl>]` | `npm i` in `tools/measure` (uses `playwright-core` + system Chrome) |
| **Screenshot** a viewport / full page / a single region (auto-scrolls off-screen regions into view) | `tools/measure/shot.mjs <url> [--full\|--sel "css"\|--text "…"] [--out f.png]` | ″ |
| **Read an element's real geometry / type / colour** (stop eyeballing — a 0,0 bbox is not proof) | `tools/measure/measure.mjs <mockupUrl> <devUrl>` | `npm i` in `tools/measure` |
| **Run the fidelity comparison pass** on a region (source ↔ build): typography + box **shape** (square/rounded/pill/circle) + geometry + pixel + **vertical spacing (Lens 4)** | `tools/measure/fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>` | ″ |
| **Verify the container CONTENT width** matches the source (max-width MINUS the gutter — the width that actually holds the design; catches "1280 setting → 1216 content") | `tools/measure/container-check.mjs <buildUrl> <expectedPx\|sourceUrl>` | ″ |
| **Region ensemble** — geometry + pixelmatch + Resemble.js + DOM-structure, fail-loud | `tools/measure/compare.mjs` | ″ |
| **Full-body property diff** — named computed-style deltas across the whole page | `tools/measure/props.mjs` | ″ |
| **Capture / convert a source site** (Phase 1 — the deterministic converter) | `assembled/UnysonPlus-Capture-Service/tools/design-capture/capture.mjs <url> capture-out/` | `npm i` in that folder (its **own** playwright) |
| **Prove a Tailwind class → native-option translation** (the CONVERSION proof — **no browser**) | `assembled/UnysonPlus-Capture-Service/tools/design-capture/tailwind-matrix.test.mjs` | node only (runs `toPages()` in-process) |
| **Colour-contrast / a11y check** (ship gate) | `assembled/UnysonPlus-Capture-Service/tools/design-capture/contrast.mjs` — or read the capture's `contrast-review.csv` | `npm i` in the design-capture folder |
| **Compose UnysonPlus builder pages programmatically** (sections/columns/elements + effects, still editable) | `tools/upw-build-pages.php` (via `wp eval-file`) + `docs/building-pages.md` | WP-CLI on a live install |
| **Record / verify the docs manifest** after editing a doc | `docs/sync.mjs check | stamp <doc> | build` | node (no deps) |

## Work from the REPORT, not the raw trees (token discipline)

A capture's `design-capture.json` / `pages.json` are large (100–300 KB) — loading one into context costs
tens of thousands of tokens for a few facts you could measure. **Default to the small artefacts:** the
conversion report / `contrast-review.csv`, and `probe.mjs` for a specific value. Read a raw tree only
when you genuinely need its structure, and then `Grep`/`Read` a slice — never dump the whole file. The
same goes for verifying fidelity: `probe.mjs --vs` gives you the one differing number, not a page dump.

## Two verification modes — pick by whether a SOURCE exists

The right proof depends on the build type (see [`docs/site-build-protocol.md`](../docs/site-build-protocol.md) Rule 0):

- **CONVERSION (a source exists) → the browser-free class-string fixture is the primary proof.** Every
  value already exists as a captured Tailwind class / computed style, so a wrong value is a **converter
  translation bug**, not a thing to hand-tune. Prove the fix with **`tailwind-matrix.test.mjs`** — it feeds
  Tailwind's official scale steps through the real `toPages()` pipeline **with no browser** and fails loud
  on a CLAMP (a step lands past the UnysonPlus scale ceiling) or COLLIDE (two >8px-apart steps snap to one
  slug). This is what "prove `py-10` → `40px`" means: a class-string in, an expected native option out,
  offline and instant. The rendered `fidelity-check.mjs` lenses are then a *secondary* confirmation that
  the translated options assembled correctly — not the mechanism for deriving a value.
- **FROM-SCRATCH (no source to translate) → the rendered lenses ARE the mechanism.** There is no captured
  class to translate, so you *create* values and verify them by measuring the render (`measure.mjs`,
  `fidelity-check.mjs`, `compare.mjs`). Measuring/eyeballing to create a value is legitimate **only** here.

## Playwright — where it lives (and where it does NOT)

- **`tools/measure/`** — the kit's verification playwright. `npm install` there → its own Chromium.
  `node_modules` is gitignored (root `.gitignore`), so a fresh clone installs cleanly. **This is the
  playwright to reach for when you need to measure/screenshot/verify.**
- **`assembled/UnysonPlus-Capture-Service/tools/design-capture/`** — the capture pipeline's own playwright
  (separate `npm install`, needs network to the source site). Use it for Phase 1 capture, not for
  fidelity checks.
- **NOT in the kit:** a maintainer's personal `pw-screens` / `pw-verify` folders (option-panel doc
  screenshots, ad-hoc probes). Those are personal and may not exist on another machine — **never rely
  on them from kit code.** If a capability there should be public, duplicate it into `tools/` here.

## Adding a tool

Put it under `tools/<name>/` with its own `package.json` (self-contained), add a row to the table
above, and — if it's part of the build/verify loop — cross-link it from the relevant `docs/` page.
Keep `node_modules` out of git (the root `.gitignore` already handles it).
