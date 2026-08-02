# measure.mjs — the parity harness (for AI agents)

Run after EVERY change **on a from-scratch build**. It loads the mockup + dev at the same
width, extracts a fixed metric set from each DOM, and prints a pass/fail diff table.

> **Scope — this whole folder is the FROM-SCRATCH / assembly verification path (rendered
> measurement).** For a **conversion** (a real source exists) the PRIMARY proof is the
> browser-free class-string fixture `tailwind-matrix.test.mjs` (in the capture service), because a
> wrong value there is a converter *translation* bug to fix, not a number to hand-tune from the
> render. These rendered tools then only confirm the translated options assembled correctly. See
> [`../README.md`](../README.md) → "Two verification modes" and the protocol's Rule 0.

**One-time setup:** `npm install` in this folder (`tools/measure/`) — installs its own
playwright + pixelmatch / resemblejs / sharp. `node_modules` is gitignored, so a fresh
clone must run this before the tools work. (`fidelity-check.mjs` here is the 4-lens region
runner — typography, geometry, pixel, **and vertical spacing**.)

```
node measure.mjs "file:///<abs-path-to>/mockup/index.html" "http://localhost/<site>/" --width 1440
```

- Tune the `METRICS` selector map so each metric resolves on BOTH the mockup and the
  unysonplus-theme DOM (multiple selectors tried in order).
- Tolerances are in `../../design-parity-checklist.md`. Don't advance a phase while its
  metrics FAIL.
- For the logo: measure the **visible glyph**, not the PNG box (transparent padding
  makes a logo read small even at the "right" px).
