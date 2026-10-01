<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
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
- Tolerances are in `../../build-reference.md`. Don't advance a phase while its
  metrics FAIL.
- For the logo: measure the **visible glyph**, not the PNG box (transparent padding
  makes a logo read small even at the "right" px).

## `lib/` — the shared machinery (edit here, not in each tool)

Every tool in this folder drives the browser through **`lib/browser.mjs`** and picks/reads elements
through **`lib/elements.mjs`**. Before these existed each tool launched its own browser, which left
three different ways of resolving chromium, **two different browsers** (system Chrome in
`probe`/`shot`/`section-audit`, bundled Chromium in the rest) and five different "page has settled"
policies. Numbers from two tools were therefore not strictly comparable — different font
rasterisation, different UA defaults — and nothing said so.

- `launchBrowser()` — one driver decision: `playwright-core` + the **system Chrome** channel when
  present, else bundled `playwright`, else `PLAYWRIGHT_PATH`. Falls back automatically if the Chrome
  channel is missing, so a caller never has to care which it got.
- `openPage(browser, url, { width, height, wait })` — one settle policy (`networkidle` + a fixed
  grace period + a hard timeout). Change the policy here and every tool changes with it.
- `openPair(browser, sourceUrl, buildUrl, opts)` — the source-vs-build shape most of these want.
- `collectElements({ sel, text, props, all })` — the in-page reader. `--text` resolves to the
  **smallest** matching element (the leaf that carries the type, not the wrapper that contains it);
  rects are rounded and `y` is document-relative, so two pages stay comparable when they scroll
  differently.
- `diffElements(source, build, props)` — returns only what actually differs.

`canvas-key.mjs` / `color-key.mjs` are pure functions (no browser) and stay as they are — they are
lenses, not duplicated machinery.

**When adding a tool here, import the session; do not call `chromium.launch` yourself.** A tool with
its own launch silently opts out of the shared browser and its measurements stop being comparable.
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

## Spacing / padding — `spacing-audit.mjs` (the lens the others do not have)

Every other lens here measures **text**: typography compares matched text elements, geometry compares
column x-positions, Lens 4 compares gaps between text rows. Spacing lives on the **containers** — a
section's padding, a wrapper's margin, a flex gap — which carry no text, so nothing matched them and
nothing reported them. A converted page could lose a section's side padding on every band and every
lens would still say PASS. (It did: a converted hero measured 390px-wide content inside a 390px
phone viewport, text touching both edges, while the source kept its 24px gutter. Desktop looked
perfect, because centred content is narrower than the band either way.)

```
node spacing-audit.mjs <sourceUrl> <buildUrl> --src-sel "header" --build-sel "section:first-of-type"
node spacing-audit.mjs <src> <build> --width 390        # ALWAYS re-run at phone width
```

It prints two things:

- **the distribution** — each padding / margin / gap value and how many boxes use it on each side.
  `24px : 2 → 0  ← never used in build` is the signal that a whole class of spacing was dropped.
  Three lines reading `distribution matches` is the pass condition.
- **the per-box walk** — only boxes whose spacing signature differs, plus boxes present on one side
  only, which is how a FLATTENED wrapper shows up.

Read the distribution first. The walk's indices drift apart wherever the two trees differ in depth
(a pill that is `<p>` + `<span>` here and `<div>` + `<span>` there), so a run of "differences" that
are really the same values one row apart means the trees differ in shape, not the spacing.

**Run it at 390px as well as 1440px.** Horizontal padding is invisible at desktop width and obvious
on a phone; that is exactly how the defect above survived several rounds of checking.
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
