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
This kit exists for one reason — but it splits cleanly by build type:

> **CONVERSION (a source exists) — get the design right by TRANSLATING, not measuring.** The source is a
> finished design; every value already exists as a captured Tailwind class / computed style. Run the
> converter and **translate** each captured class → native option / scoped CSS; when a value is wrong,
> **fix the converter's class→value rule and prove it with a browser-free class-string fixture** — never
> measure the render to hand-tune, never eyeball, never hand-author the tree (Rule 0).
>
> **FROM-SCRATCH (nothing to reproduce) — get it right on the first pass by building outside-in and
> measuring, not by eyeballing and patching.** Here you *create* values, so measuring the mockup is the
> legitimate proof.

> ## ⛔ CONVERSION? CAPTURE FIRST — hard gate, before anything else
>
> **Detect a conversion by the presence of a SOURCE, not by a keyword.** If the request references or
> supplies **an existing design to reproduce** — a **URL**, a **screenshot/image**, a **PDF/Figma**, an
> **HTML/CSS dump**, or a **named template/site** — it is a **conversion**, whatever verb is used
> ("convert / clone / rebuild / **turn this into** / **make a WordPress version of** / like / based on",
> or just "here's the site: …", "match this"). Only a brief with **nothing to reproduce** ("build me a
> bakery site") is a fresh build. For a conversion, your FIRST action — before Theme Settings, before any
> section, before ANY hand-measuring — is to run the capture/converter pipeline:
>
> ```
> node capture.mjs <url> capture-out/     # capture service — assembled/UnysonPlus-Capture-Service/tools/design-capture
> ```
>
> **Who runs what (audience split — see the 2026-07-19 decision):** building ONE site → run the **capture
> service**, import its output, build Phases 2–7. If you are the **converter maintainer/contributor** (you
> have the converter repos) → ALSO run the **Site Converter extension** (PHP path) and improve **both**
> paths (JS + PHP) from the conversion report in Phase 5. A **fresh build** (no source) skips capture.
>
> It emits the **source of truth**: `design-config` (→ Theme Settings), `pages.json` (per-section
> shortcodes), the **conversion-report** (fallbacks to fix), `animations.json`, a screenshot.
> **Hand-measuring the source with Playwright/devtools and hand-building sections before a
> `capture-out/<site>/` exists is a PROTOCOL VIOLATION** — it's slow, drifts, and skips the tool
> built for exactly this. If no capture exists → **STOP and run it.** Then follow the ordered phases
> in [`docs/site-build-protocol.md`](docs/site-build-protocol.md) (the capture-first gate + the major-steps table).
>
> **The protocol is ALWAYS ON — for every build, whether or not the user mentions a "protocol."** A
> **conversion** runs Phase 1 (capture) first; a **fresh build** (from a prompt/brief, nothing to
> reproduce) is the *only* case that skips capture — but it still follows every other phase (design
> system → chrome → sections region-by-region → motion → ship gate). Following the protocol is the
> default; not following it is the exception you must justify.

Read this file, then `PLAYBOOK.md`, then the **authoritative build checklist**
[`docs/site-build-protocol.md`](docs/site-build-protocol.md), before touching a site. When building or
converting, **`site-build-protocol.md` is CANONICAL** — where any looser summary (PLAYBOOK,
build-a-site) differs, the protocol wins.

> **⛔ REFLEX — RELOAD THE PER-SECTION CHECKLIST BEFORE EACH SECTION. Do not work from memory.**
> Before building *any* section, re-open `site-build-protocol.md` → **"THE PER-SECTION CHECKLIST — run ALL
> of these for EVERY section"** and run every step. The steps are **cumulative, not a menu**: a newer
> procedure (a converter recognizer, a WooCommerce flow, anything) **never replaces** the earlier ones —
> capture-first, **Tailwind detect+translate**, native-options-before-CSS, and the 4-lens fidelity verify
> ALL still apply. The recurring failure is applying the last procedure you touched and silently dropping
> an established step (the Tailwind→CSS translation is the usual casualty). "The protocol is ALWAYS ON" is
> only real if you re-open the checklist each section — so do that, every section.

## Four things this kit lets you do

An all-in-one toolkit for working with UnysonPlus — pick the surface that matches the task:

1. **Build** a site from a prompt — [`docs/build-a-site.md`](docs/build-a-site.md) (workflow) +
   [`docs/building-pages.md`](docs/building-pages.md) + [`tools/upw-build-pages.php`](tools/upw-build-pages.php) (compose pages programmatically).
2. **Convert** an existing site into UnysonPlus — the capture service + Site Converter pipeline
   (see the converter folders below and [`docs/extending.md`](docs/extending.md)).
3. **Extend** the framework — new shortcodes, option types, extensions — [`docs/extending.md`](docs/extending.md).
4. **Know** the rules — [`docs/conventions.md`](docs/conventions.md) + the reference docs under `docs/`
   (one per shortcode / option type / animation module / extension / Theme Settings tab).

Matching a source **mockup** to 95–100% (below) is a **conversion** — a translation job (run the
converter, fix its class→value rules, prove with a class-string fixture), **not** the measure-and-eyeball
discipline. That outside-in, measure-don't-eyeball discipline is for the **from-scratch** builds under #1
where you create values; a conversion never hand-measures a source (Rule 0).

## Using these docs — consult FIRST, then backfill (the reflex)

Before reading UnysonPlus plugin / `unysonplus-theme` **PHP** to answer *"does this shortcode / option /
module exist?" · "what are its options / value shape?" · "how does X work?" · "how do I build X?"* —
**FIRST consult these `docs/`.** They exist so an agent can answer WITHOUT paging through verbose source
(~10–50× cheaper in tokens). Make it the default reflex, not a fallback.

- **Where to look:** build/usage questions → `docs/shortcodes/`, `docs/option-types/`,
  `docs/animation-engine/`, `docs/extensions/`, `docs/theme-settings/`. Architecture/internals (render
  pipeline, option value-shape flows, hooks & extension points, the Animation-Engine module loader +
  Lenis singleton, the theme's preset + CSS-generation systems) → `docs/architecture/`.
- **If the doc answers it → use it and do NOT open the PHP.** That is the entire point of the kit.
- **If the doc is MISSING or ambiguous,** treat it as a signal, not an answer — a missing doc can mean
  "feature doesn't exist" OR "exists but undocumented." FIRST run `node docs/sync.mjs check` (it *hashes*
  the source — a shell op, near-zero tokens) to tell which; only THEN read the **minimum** PHP needed.
- **Any time you DO read plugin/theme source, backfill the kit in the SAME turn** — write/refresh the
  matching doc in the correct category folder, **generalized** (no site/brand names), matching the
  existing doc style, then `node docs/sync.mjs stamp <doc>` it. Every source read must pay for itself by
  making the next lookup free.
- **Don't document exhaustively.** Prefer stable, high-value surfaces (existing elements/options + the
  durable extension points) over volatile internal wiring — every doc added is a doc to keep in sync.
  Quality over volume.

### Human manual (live docs) — deep-links

These kit `docs/` are the AI-optimized reference (flat, every choice listed, generic). The **human**
companion — prose, screenshots of each option panel, live playgrounds — is the published manual at
**https://unysonplus.github.io**. It's the source of truth for humans and is always current; link to
it rather than bundling it. Section landings:

| Kit reference | Live manual |
|---|---|
| `docs/shortcodes/` | https://unysonplus.github.io/docs/shortcodes/overview |
| `docs/option-types/` | https://unysonplus.github.io/docs/options/option-types |
| `docs/extensions/` | https://unysonplus.github.io/docs/extensions/overview |
| `docs/theme-settings/` | https://unysonplus.github.io/theme |
| `docs/animation-engine/` | https://unysonplus.github.io/animation-engine |
| Page builder / dynamic content | https://unysonplus.github.io/docs/page-builder · https://unysonplus.github.io/docs/dynamic-content |
| Guides | https://unysonplus.github.io/guides |

(The manual has its own page structure — link to the section landing above and navigate, rather than
guessing a per-page slug.)

## What's in the kit

| Folder / file | What it is |
|---|---|
| `PLAYBOOK.md` | **The build process.** The outside-in order you must follow. |
| `docs/theme-settings/README.md` | **Every** Theme Settings option catalogued (Colors/Typography/Layout/Header/Footer/Site-UX/Misc/Blog/Pages). Configure the design from these — do **not** reach for CSS first. Bespoke CSS goes in Misc → Custom CSS (`misc_custom_css`). |
| `docs/shortcodes/` | Per-shortcode **atts reference** — the page-builder JSON shape for each shortcode, + the node-model in `README.md` (section/column/leaf, shared wrapper blocks). **Read these instead of plugin source** to generate builder JSON. |
| `docs/option-types/` | Per-option-type **value shapes** (multi-picker, background-pro, compact color, typography, unit-input, …) — the exact JSON to store for any option/att. |
| `docs/animation-engine/` | Per-**module** effect shapes (hover, text-effects, scroll-motion, parallax, …) — the `fx`-block JSON to animate a node. Extension ships inactive. |
| `docs/extensions/` | One **overview** per plugin extension (what it is, active-by-default, what it provides) — cross-links to the granular refs. |
| `docs/design-parity-checklist.md` | The metric set + the measurement algorithm (mockup ⟷ dev, ±2px tolerance). |
| `assembled/unysonplus-theme-child/` | The **child-theme starter** you copy + rename per site. Ships a polished-chrome `design/design.json` so header/footer/container are ~90% right on activation. |
| `tools/measure/measure.mjs` | The frame-metric harness (container/header/logo/footer/type). Run after every change. |
| `tools/measure/compare.mjs` | Region-by-region **ensemble** — header↔header, each section↔section, footer↔footer, scored by geometry + pixelmatch + Resemble.js + a DOM-structure diff (fail-loud). |
| `tools/measure/props.mjs` | Full-body **property diff** — walks both bodies, matches elements by text/region, reports NAMED computed-style deltas (caught the site-wide Inter→Open Sans miss). |
| `tools/upw-build-pages.php` · `docs/building-pages.md` | **Compose UnysonPlus builder pages programmatically** (sections/columns/elements + Animation Engine effects) via `wp eval-file` in ~15 lines, leaving the page EDITABLE in the visual builder. Read the doc first — it documents the builder-value storage rules. For any page — test, demo, or real. |
| `docs/build-a-site.md` | The **prompt → UnysonPlus site** workflow: how to go from "build me an X site" to a finished site (Theme Settings tokens → compose pages → wire animations → verify). The orchestration layer over the reference docs. |
| `docs/conventions.md` | The **generalized UnysonPlus conventions** every build must follow (color presets, clean DOM, heading order, links, replaceable media, option-value shapes). Public, site-agnostic. |
| `docs/extending.md` | **Create / convert shortcodes, option types, and extensions** — where things live, the anatomy of each, the best reference extension per case, the conventions (thumbnail icon spec, settings-page layout, migrations, keep-docs-in-sync). |
| `samples/sample-shortcode/` | **The shortcode TEMPLATE** — a complete, installable skeleton of a page-builder element. Every file present and documented inline, with commented-out reference code for repeaters, uploads, dimensions, icons, conditional options and design variants. `HOW-TO.md` beside it is the procedure for porting a standalone component (a CodePen, a demo, a bought template) into an element. **Copy this folder to start a new element** — don't hand-assemble one. |
| `assembled/unysonplus/` · `assembled/unysonplus-theme/` | The plugin + parent theme. **Assembled, gitignored** — see `assemble.ps1`. Read them for options/shortcode shapes; the working-copy source of truth is your local plugin/theme repos (siblings of this kit — see `assemble.ps1 -WorkDevRoot`). |
| `assembled/UnysonPlus-Capture-Service/` · `assembled/UnysonPlus-Site-Converter-Extension/` | The **automated** conversion pipeline (capture service + converter). This manual kit shares their standards; keep them in sync. |
| **`tools/README.md`** | **The TOOLS INVENTORY — organized by capability ("when you need to DO X, run Y").** Check it BEFORE concluding the kit lacks a tool or building your own. |

Assembled folders are empty until you run `pwsh assemble.ps1` (see that file).

> **REFLEX — need to DO something, not just read? Check [`tools/README.md`](tools/README.md) FIRST.**
> Measuring geometry, running the comparison pass, screenshotting, capturing a source, composing a
> page — the kit already has a self-contained tool for it (each with its **own** playwright/deps via a
> local `npm install`). **NEVER conclude a capability is missing because one folder lacks it** — map the
> *need* to the inventory. (This rule exists because `require('playwright')` failing in the
> capture-service folder was wrongly read as "no playwright to verify with," while `tools/measure/` had
> it installed and documented the whole time.) This is the tool-side twin of the "consult docs FIRST"
> reflex above.

## Phase 0 (Setup) — make sure there's a WordPress to build into (check FIRST)

Before anything, confirm the target site (the "Create the dev site at" URL) is a **running
WordPress with the UnysonPlus plugin AND the unysonplus-theme parent active** — the agent builds
*into* an existing install, it does not hand-roll a LAMP stack.

- **① UPDATE THE KIT FIRST — do this before any build, every time.** Run `pwsh update.ps1 -Check`; if it
  reports commits behind `origin`, run `pwsh update.ps1` (git-pull the kit + re-`assemble` the **latest**
  plugin/theme release + refresh harness/capture deps). This is a **hard gate**: a stale clone means you'd
  follow an outdated playbook and build against an old plugin/converter — silently wrong. (A **zip download**
  isn't a git checkout so it can't self-check — `git clone` the kit, or re-grab the
  [latest release](https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit/releases/latest), so `-Check` works.)
- **Verify:** the URL loads; the plugin + parent theme are active (`wp plugin list` / `wp theme list`
  via wp-cli, or the admin). With `wp-env`, use `npx @wordpress/env run cli wp …`.
- **If nothing is set up:** run the kit's paved path — `pwsh assemble.ps1 -Source github` (fetches the
  **full plugin** from the latest release + the parent theme) then `npx @wordpress/env start` (boots
  WordPress at `http://localhost:8888` with both active). Then use `http://localhost:8888/` as the dev
  URL. If the user already has their own WordPress, point them at **README.md → "First: a WordPress
  to build into" → Option B** to install the plugin + theme, and use their site URL instead.
- **Classic Editor is required too — ACTIVATE it as a setup step (the plugin only NOTIFIES).** Unyson's
  page builder + meta boxes need the classic editor, not Gutenberg. The UnysonPlus plugin deliberately
  does **not** force-disable the block editor (a user may want to run UnysonPlus without Classic Editor) —
  it just shows an admin *notice* recommending it. So **it is the SETUP's job (yours) to activate it** on
  every site/demo you provision, up front, before building:
  - **Single site (BYO / wp-env):** `wp plugin install classic-editor --activate` (or Plugins → Add New).
    `wp-env` installs it via `.wp-env.json`.
  - **Multisite / a demo subsite (the demos network):** network-install once, then activate for the
    subsite — `wp plugin install classic-editor && wp plugin activate classic-editor --url=<subsite-url>`
    (or `--network`). Do this when you create the subsite, alongside activating the extensions + theme.
  Skipping it lands the page on Gutenberg and the builder won't work — this is the "classic editor wasn't
  active" symptom. Never assume a fresh WordPress / new subsite already has it; activate it explicitly.
- **For a CONVERSION, also activate the Site Converter extension.** It ships **inactive by default**, so
  enable it under **Unyson+ → Extensions → Site Converter** before you convert — otherwise the
  "Unyson+ → Convert" screen (the PHP file-upload path) won't exist. A fresh build doesn't need it.
- **Critical:** the plugin MUST be the **release bundle / assembled `./unysonplus`** (all 22 extensions).
  A `git clone` of the `UnysonPlus` repo is **core-only** (blog + update) — it activates cleanly but has
  **no page builder and no shortcodes**, so nothing can be built. Never install the site from a clone of
  the core repo.

Only once WP + plugin + parent theme are confirmed active do you start the process below.

## The non-negotiable process (why we made this kit)

The failure mode this kit fixes: building **inside-out** (patching the logo, then
the hero, then a table, then back to the logo) and **guessing sizes** from
screenshots. That never converges. Instead — **convert first, then refine:**

0. **Convert first (automated, token-free) — for a URL, RUN THE CAPTURE SERVICE; don't ask for files.**
   `cd assembled/UnysonPlus-Capture-Service/tools/design-capture && npm install` (once), then `node capture.mjs "<url>" <out>`. It renders
   the page in a real browser, so ONE url gives you the full **rendered DOM** (JS-built content + inline
   SVGs — never ask the user for these), the **downloaded media**, AND **computed styles** — then maps
   structure → shortcodes and tokens → presets, so you refine a real page, not a blank one. Skipping
   this and hand-building from scratch is what forces asking for assets the capture already had. (Only
   fall back to a manual bundle when there's no URL / no Node+Playwright.) Read its **conversion report**
   to see what it mapped vs. fell back on. **Close *this site's* delta with native options /
   `misc_custom_css` — do NOT edit the shared Site Converter to fix one site.** A whole *class* of
   misses (a pattern it mis-maps everywhere) is a converter-*algorithm* change, which is a
   **maintainer/contributor** task — it needs the converter repos and the fix must be **upstreamed**
   (see `docs/extensions/site-converter.md`). As a site builder you instead **record the miss in the
   conversion report** and, with the site owner's consent, **share that report upstream** rather than
   forking your local copy. The steps below then apply to its output (or to a blank page if you skip
   conversion):
> **Steps 1–4 below (read the mockup's outer layers, lock chrome to *measured* parity, "measure — never
> eyeball") are the FROM-SCRATCH path — they *create* values from a mockup you were given with nothing to
> reproduce.** On a **CONVERSION** (a real source), you do NOT hand-read/measure the source: the converter
> emits the chrome + every section, and each value comes from **translating the captured class list**
> (Rule 0.6). A wrong value → **fix the converter and prove it with the class-string fixture**
> (`tailwind-matrix.test.mjs`), never by measuring the render. The rendered lenses are only the secondary
> "did the translated options assemble right" check.

1. **Read the mockup's OUTER layers first.** Open the mockup HTML/CSS and extract
   the frame tokens: container `max-width`, header height + logo box, footer
   structure, spacing scale, color tokens, type scale. The mockup is the spec.
2. **Lock the chrome + container to measured parity FIRST**, using **native theme
   options** (General → Layout width; every Header option; every Footer option —
   see `docs/theme-settings/README.md`). Header + footer + container must pass
   the parity check **before any section is built**.
3. **Build the section / row skeleton** — correct widths, paddings, gaps.
   Structure before content.
4. **Fill elements last.** A hard element (e.g. a reviews-table) goes in as a
   **`code_block` placeholder** first so the layout keeps moving; swap it for the
   real shortcode later.

After every change **on a fresh build**: run `tools/measure/measure.mjs` and fix anything outside
tolerance. **Measure — never eyeball.** *(On a conversion the equivalent is: re-run the class-string
fixture after each converter fix — the render check is only the secondary confirmation.)*

## Hard rules

- **Native options before CSS.** If a look is achievable via a Theme Settings
  option, use it. Only fall back to the child theme's `assets/chrome.css` for
  things no option covers, and record those as enhancement candidates.
- **Don't hand-edit the assembled folders** (`assembled/unysonplus/`, `assembled/unysonplus-theme/`).
  Edit the working-copy sources (the plugin/theme repos, siblings of this kit — see
  `assemble.ps1 -WorkDevRoot`) and re-`assemble`.
- **Keep the kit current.** Run `pwsh update.ps1` (pull kit + re-assemble sources +
  refresh harness deps) so you build against the latest plugin/theme/playbook, not a
  stale snapshot; `pwsh update.ps1 -Check` reports whether updates exist without changing
  anything.
- **Per-site work happens in a copy of `assembled/unysonplus-theme-child/`**, renamed to the
  site slug.
- Keep this kit's docs and the two conversion repos **in sync** — a standard added
  here should be reflected there and vice-versa.

## Keeping the docs (and the published manual) current when options change

- **Kit docs (`docs/`).** These are the reference base — one markdown per shortcode / option type /
  animation module / extension / Theme Settings tab. When you change a documented surface (a shortcode's
  atts, an option type's value shape, an AE module's effect options, a Theme Settings option), **update
  the matching doc in the SAME turn**, then re-record it: `node docs/sync.mjs check` (lists only docs
  whose *source hash* changed — near-zero tokens), `node docs/sync.mjs stamp <doc.md> …` (re-record
  hash+date after regenerating), `node docs/sync.mjs build` (rebuild the whole manifest baseline). Keep
  docs **generic/public** (no site/brand names). A NEW shortcode/option-type/module/extension → write its
  doc, then `build` (or `stamp`).
- **Published-manual screenshots.** The human manual's shortcode/element pages carry screenshots of each
  element's **options panel** (one per builder-modal tab, except Animations/Advanced) + its backend
  builder canvas. When a shortcode's options change (add/remove/rename an option, change a type, change an
  `image-picker`'s choices), **the affected screenshots must be regenerated** so the manual matches the
  live UI, using the project's screenshot tooling against a running local WP with the plugin+theme active.
  If that WP isn't reachable, say so and list which screenshots are now stale — don't silently skip.
