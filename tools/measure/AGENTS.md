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

## Auditing a CONVERSION section-by-section — `section-audit.mjs` (DON'T paste screenshots)

When you're checking a converted site against its source and want to *see* what's off band-by-band —
header, then footer, then each section — **run `section-audit.mjs`, don't ask the user for screenshots
and don't hand-roll per-section shots.** It loads BOTH the live source and the build in system Chrome,
auto-splits each into `<header>` / every `<section>` / `<footer>`, matches them by heading text, and
writes ONE labelled PNG per band (SOURCE stacked above CONVERTED). You then `Read` each PNG top-to-bottom
and conclude — one image per section, both versions in view.

```
# every band (writes NN-<label>.png + manifest.json into ./section-audit)
node section-audit.mjs --source https://source.example/ --converted http://localhost/

# just some bands (matches the heading text or header/footer keyword)
node section-audit.mjs --source https://source.example/ --converted http://localhost/ --only header,footer
node section-audit.mjs --source https://source.example/ --converted http://localhost/ --only losing,standards
```

- The **source must be reachable** (it screenshots the live URL, not the captured HTML — the capture has
  no CSS assets, so it can't be re-rendered faithfully). If the source is offline, fall back to the
  capture's `full.png` and crop by hand.
- This is the **VISUAL** counterpart to `compare.mjs` (which returns pass/fail METRICS on ONE named
  region). Use `section-audit.mjs` for the "what's visibly different across the whole page" sweep, then
  `probe.mjs --vs` / `fidelity-check.mjs` to pin the exact numbers on the band that looks wrong.
- A band with no build-side match is written source-only and tagged `(no converted match)` — usually a
  section the converter dropped or merged; investigate that.
