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

## Ad-hoc: `probe.mjs` / `shot.mjs` — DON'T hand-roll a Playwright script

The tools above compare **fixed regions** (header/footer/hero) against a known selector map. For the
90% case — *"what's the fontSize / margin / width of element X, and how does it differ from the
source?"* — **run `probe.mjs` instead of writing a one-off `.mjs`**. Writing bespoke launch→goto→measure
scripts is the single biggest source of wasted work in a build; these two cover it.

Both use `playwright-core` + system Chrome (`channel:'chrome'`), so they run from this folder OR the
capture service with **no bundled-browser install**.

```
# measure one element (by visible text or CSS selector) — JSON out
node probe.mjs "http://localhost/<site>/" --text "Second Home" --props "fontSize,fontWeight,color,margin"
node probe.mjs "http://localhost/<site>/" --sel "footer h3"

# SOURCE-vs-BUILD diff — prints ONLY the props that differ (positional url = build, --vs = source)
node probe.mjs "http://localhost/<site>/" --text "Reserve a Spot" --vs "https://source.example/"

# screenshot: viewport / full page / a single region (auto-scrolls off-screen regions into view)
node shot.mjs "http://localhost/<site>/" --full --out page.png
node shot.mjs "http://localhost/<site>/" --text "24/7 Care" --pad 20 --out card.png
```

`--text` matches the **smallest** element containing that string (so it grabs the leaf, not a wrapper).
If either tool returns empty matches or a "This site can't be reached" title, the local server is down —
start XAMPP/Apache, not the tool. Reach for a hand-written probe only when you need something these
genuinely can't express.
