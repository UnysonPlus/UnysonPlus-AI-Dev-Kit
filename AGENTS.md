# UnysonPlus AI Dev Kit — start here (AI agents)

> **Repo hygiene — READ FIRST.** This is a **public, generic** repo. It must contain
> **no site-specific anything** — never mention or commit the name, content, mockup,
> URLs, or code of any actual site built with the kit. All site-specific work lives in
> that site's own folder (its install / `demo-pages/<name>` / `test-sites/<name>`),
> never here. Update this repo **only** for changes to the process, the option
> reference, the harness, the starter, or the tooling — i.e. **algorithm/kit updates**,
> not site builds. Examples use neutral placeholders (`<site>`, `<abs-path-to>`).


You are building (or polishing) a **WordPress site or demo** on the **UnysonPlus**
plugin + **unysonplus-theme** parent theme, usually to match a **source mockup**.
This kit exists for one reason:

> **Get the mockup's design right on the first pass — target 95–100% — by building
> outside-in and measuring, not by eyeballing and patching.**

Read this file, then `PLAYBOOK.md`, before touching a site.

## What's in the kit

| Folder / file | What it is |
|---|---|
| `PLAYBOOK.md` | **The build process.** The outside-in order you must follow. |
| `docs/theme-settings-reference.md` | **Every** Theme Settings option catalogued (Colors/Typography/Layout/Header/Footer/Site-UX/Misc/Blog/Pages). Configure the design from these — do **not** reach for CSS first. Bespoke CSS goes in Misc → Custom CSS (`misc_custom_css`). |
| `docs/shortcodes/` | Per-shortcode **atts reference** — the page-builder JSON shape for each shortcode, + the node-model in `README.md` (section/column/leaf, shared wrapper blocks). **Read these instead of plugin source** to generate builder JSON. |
| `docs/option-types/` | Per-option-type **value shapes** (multi-picker, background-pro, compact color, typography, unit-input, …) — the exact JSON to store for any option/att. |
| `docs/animation-engine/` | Per-**module** effect shapes (hover, text-effects, scroll-motion, parallax, …) — the `fx`-block JSON to animate a node. Extension ships inactive. |
| `docs/extensions/` | One **overview** per plugin extension (what it is, active-by-default, what it provides) — cross-links to the granular refs. |
| `design-parity-checklist.md` | The metric set + the measurement algorithm (mockup ⟷ dev, ±2px tolerance). |
| `unysonplus-theme-child/` | The **child-theme starter** you copy + rename per site. Ships a polished-chrome `design/design.json` so header/footer/container are ~90% right on activation. |
| `tools/measure/measure.mjs` | The frame-metric harness (container/header/logo/footer/type). Run after every change. |
| `tools/measure/compare.mjs` | Region-by-region **ensemble** — header↔header, each section↔section, footer↔footer, scored by geometry + pixelmatch + Resemble.js + a DOM-structure diff (fail-loud). |
| `tools/measure/props.mjs` | Full-body **property diff** — walks both bodies, matches elements by text/region, reports NAMED computed-style deltas (caught the site-wide Inter→Open Sans miss). |
| `unysonplus/` · `unysonplus-theme/` | The plugin + parent theme. **Assembled, gitignored** — see `assemble.ps1`. Read them for options/shortcode shapes; the working-copy source of truth is your local plugin/theme repos (siblings of this kit — see `assemble.ps1 -WorkDevRoot`). |
| `UnysonPlus-HTML-to-Wordpress-Conversion/` · `UnysonPlus-Site-Converter-Extension/` | The **automated** conversion pipeline (capture service + converter). This manual kit shares their standards; keep them in sync. |

Assembled folders are empty until you run `pwsh assemble.ps1` (see that file).

## Step 0 — make sure there's a WordPress to build into (check FIRST)

Before anything, confirm the target site (the "Create the dev site at" URL) is a **running
WordPress with the UnysonPlus plugin AND the unysonplus-theme parent active** — the agent builds
*into* an existing install, it does not hand-roll a LAMP stack.

- **Verify:** the URL loads; the plugin + parent theme are active (`wp plugin list` / `wp theme list`
  via wp-cli, or the admin). With `wp-env`, use `npx @wordpress/env run cli wp …`.
- **If nothing is set up:** run the kit's paved path — `pwsh assemble.ps1 -Source github` (fetches the
  **full plugin** from the latest release + the parent theme) then `npx @wordpress/env start` (boots
  WordPress at `http://localhost:8888` with both active). Then use `http://localhost:8888/` as the dev
  URL. If the user already has their own WordPress, point them at **START-HERE.md → "First: a WordPress
  to build into" → Option B** to install the plugin + theme, and use their site URL instead.
- **Critical:** the plugin MUST be the **release bundle / assembled `./unysonplus`** (all 21 extensions).
  A `git clone` of the `UnysonPlus` repo is **core-only** (blog + update) — it activates cleanly but has
  **no page builder and no shortcodes**, so nothing can be built. Never install the site from a clone of
  the core repo.

Only once WP + plugin + parent theme are confirmed active do you start the process below.

## The non-negotiable process (why we made this kit)

The failure mode this kit fixes: building **inside-out** (patching the logo, then
the hero, then a table, then back to the logo) and **guessing sizes** from
screenshots. That never converges. Instead — **convert first, then refine:**

0. **Convert first (automated, token-free).** Run the **Site Converter** on the source
   (see `PLAYBOOK.md` Phase 0) — it deterministically maps structure → shortcodes and tokens
   → presets, so you refine a real page, not a blank one. Read its **conversion report** to see
   what it mapped vs. fell back on. **Close *this site's* delta with native options /
   `misc_custom_css` — do NOT edit the shared Site Converter to fix one site.** A whole *class* of
   misses (a pattern it mis-maps everywhere) is a converter-*algorithm* change, which is a
   **maintainer/contributor** task — it needs the converter repos and the fix must be **upstreamed**
   (see `docs/extensions/site-converter.md`). As a site builder you instead **record the miss in the
   conversion report** and, with the site owner's consent, **share that report upstream** rather than
   forking your local copy. The steps below then apply to its output (or to a blank page if you skip
   conversion):
1. **Read the mockup's OUTER layers first.** Open the mockup HTML/CSS and extract
   the frame tokens: container `max-width`, header height + logo box, footer
   structure, spacing scale, color tokens, type scale. The mockup is the spec.
2. **Lock the chrome + container to measured parity FIRST**, using **native theme
   options** (General → Layout width; every Header option; every Footer option —
   see `docs/theme-settings-reference.md`). Header + footer + container must pass
   the parity check **before any section is built**.
3. **Build the section / row skeleton** — correct widths, paddings, gaps.
   Structure before content.
4. **Fill elements last.** A hard element (e.g. a reviews-table) goes in as a
   **`code_block` placeholder** first so the layout keeps moving; swap it for the
   real shortcode later.

After every change: run `tools/measure/measure.mjs` and fix anything outside
tolerance. **Measure — never eyeball.**

## Hard rules

- **Native options before CSS.** If a look is achievable via a Theme Settings
  option, use it. Only fall back to the child theme's `assets/chrome.css` for
  things no option covers, and record those as enhancement candidates.
- **Don't hand-edit the assembled folders** (`unysonplus/`, `unysonplus-theme/`).
  Edit the working-copy sources (the plugin/theme repos, siblings of this kit — see
  `assemble.ps1 -WorkDevRoot`) and re-`assemble`.
- **Keep the kit current.** Run `pwsh update.ps1` (pull kit + re-assemble sources +
  refresh harness deps) so you build against the latest plugin/theme/playbook, not a
  stale snapshot; `pwsh update.ps1 -Check` reports whether updates exist without changing
  anything.
- **Per-site work happens in a copy of `unysonplus-theme-child/`**, renamed to the
  site slug.
- Keep this kit's docs and the two conversion repos **in sync** — a standard added
  here should be reflected there and vice-versa.
