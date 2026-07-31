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
| **Read an element's real geometry / type / colour** (stop eyeballing — a 0,0 bbox is not proof) | `tools/measure/measure.mjs <mockupUrl> <devUrl>` | `npm i` in `tools/measure` |
| **Run the fidelity comparison pass** on a region (source ↔ build): typography + geometry + pixel | `tools/measure/fidelity-check.mjs <srcUrl> <srcSel> <buildUrl> <buildSel>` | ″ |
| **Region ensemble** — geometry + pixelmatch + Resemble.js + DOM-structure, fail-loud | `tools/measure/compare.mjs` | ″ |
| **Full-body property diff** — named computed-style deltas across the whole page | `tools/measure/props.mjs` | ″ |
| **Capture / convert a source site** (Phase 1 — the deterministic converter) | `UnysonPlus-Capture-Service/tools/design-capture/capture.mjs <url> capture-out/` | `npm i` in that folder (its **own** playwright) |
| **Compose UnysonPlus builder pages programmatically** (sections/columns/elements + effects, still editable) | `tools/upw-build-pages.php` (via `wp eval-file`) + `docs/building-pages.md` | WP-CLI on a live install |
| **Record / verify the docs manifest** after editing a doc | `docs/sync.mjs check | stamp <doc> | build` | node (no deps) |

## Playwright — where it lives (and where it does NOT)

- **`tools/measure/`** — the kit's verification playwright. `npm install` there → its own Chromium.
  `node_modules` is gitignored (root `.gitignore`), so a fresh clone installs cleanly. **This is the
  playwright to reach for when you need to measure/screenshot/verify.**
- **`UnysonPlus-Capture-Service/tools/design-capture/`** — the capture pipeline's own playwright
  (separate `npm install`, needs network to the source site). Use it for Phase 1 capture, not for
  fidelity checks.
- **NOT in the kit:** a maintainer's personal `pw-screens` / `pw-verify` folders (option-panel doc
  screenshots, ad-hoc probes). Those are personal and may not exist on another machine — **never rely
  on them from kit code.** If a capability there should be public, duplicate it into `tools/` here.

## Adding a tool

Put it under `tools/<name>/` with its own `package.json` (self-contained), add a row to the table
above, and — if it's part of the build/verify loop — cross-link it from the relevant `docs/` page.
Keep `node_modules` out of git (the root `.gitignore` already handles it).
