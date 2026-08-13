# PLAYBOOK — building a UnysonPlus site/demo from a mockup

The process gets a mockup **right on the first pass** by **converting first, then refining** —
let the deterministic Site Converter do the bulk mapping (token-free), then close each gap by
**translating the source's captured Tailwind classes** into native options (Rule 0.6). Build
**outside-in**, **native options before CSS**.

> **Two modes — don't conflate them (this whole playbook assumes a CONVERSION unless noted).** On a
> **conversion** every value already exists as a captured class; you **translate** it, and a wrong value
> is a **converter bug you fix + prove with a browser-free class-string fixture** (`tailwind-matrix.test.mjs`)
> — you do **not** measure the render to hand-tune it. "Measure the gap / measure at every step" below is
> the **FROM-SCRATCH** technique (Phase 2a — no source to translate), where you create values. See
> [`docs/site-build-protocol.md`](docs/site-build-protocol.md) Rule 0.

Prereq: `pwsh assemble.ps1 -Source github` populates the two conversion repos + the plugin/theme (from the
release zip); `-Source local` copies them from sibling working copies instead. Then `pwsh update.ps1`
installs tool deps. Shape references: `docs/` (shortcodes / option-types / theme-settings / animation-engine).
Metrics: `docs/design-parity-checklist.md`.

> **This is the condensed practical view. The AUTHORITATIVE, complete checklist is
> [`docs/site-build-protocol.md`](docs/site-build-protocol.md)** — where the two differ, the protocol wins,
> and the **canonical Phase numbers are the protocol's** (0 Setup · 1 Capture · 2 Design system · 3 Chrome
> · 4 Sections · 5 Report · 6 Motion · 7 Ship). The headings below use those same numbers so a Phase number
> means the same thing in both docs. **Before each section, run the protocol's PER-SECTION CHECKLIST in full
> — Phase 4 here is only a summary of it.**

---

## Phase 1 — Capture / Convert (automated first pass)

**Don't hand-build from a blank page, and don't ask the user for source files — for a URL, run the
capture service FIRST, automatically.** `capture.mjs` renders the page in a real browser, so a single
URL gets you the **full rendered DOM** (JS-built content + inline SVGs — you never need to ask for
them), the **downloaded media**, AND the **computed styles** (exact colors/spacing that no static HTML
carries), then maps sections → shortcodes and tokens → presets. This is the default first move — do it
before any hand-building. One-time setup: `cd assembled/UnysonPlus-Capture-Service/tools/design-capture && npm install` (deps; needs system Google Chrome).
Only fall back to a manual bundle (Phase 2a) when there's **no URL**, or Node/Playwright isn't available.

> **Lesson baked in:** skipping this and hand-building from scratch is what forces you to ask the user
> for assets (SVGs, the hero video) that the capture already had. Capture first, *then* refine.

```
# URL path — the capture service (assembled/UnysonPlus-Capture-Service/tools/design-capture):
node capture.mjs "<source-url>" <outdir>        # → pages.json, presets.json, theme-settings.json,
                                                #    design-config.json, media.json, convert-bundle.zip,
                                                #    + conversion-report.csv/html, style-coverage.csv
# File path — the site-converter extension's PHP Mapper/Stitch (for a saved HTML file).
```
Import the bundle into the dev site (the `site-converter` extension's import), then:

1. **Read the conversion report FIRST.** It traces every source element → the shortcode it became
   and flags **`fallback`** (code_block catch-alls), **`opportunity`** (a richer role it could've
   used), **`styling drop`**, and over-large/under-segmented sections. That report IS your task list.
2. **Two kinds of gap, fixed two ways:**
   - **This site's misses** (bespoke bits the converter can't infer) → fix via native options /
     `misc_custom_css`, using the `docs/` shape references (Phases 1–3 below). This is the normal
     site-build work.
   - **Systematic misses** (a whole *class* it mis-maps — e.g. feature cards → `code_block` instead
     of `icon_box`) → that's a **converter-algorithm** fix, and it only helps if it lands
     **upstream**. **Do NOT fork your local converter to patch one build** — the change would diverge
     from upstream and `update.ps1` may clobber it. Instead **record the miss** (the report already
     flags it) and, with the site owner's consent, **share the report upstream** so a maintainer fixes
     the pattern for everyone. *If you ARE a converter contributor* (you have the
     `UnysonPlus-Capture-Service` + `UnysonPlus-Site-Converter-Extension` repos), improve
     the algorithm there and mirror the change to BOTH paths: JS (`to-pages.mjs`/`capture-extract.mjs`)
     AND PHP (`class-fw-site-converter-mapper.php`/`-stitch.php`) — see CLAUDE.md's conversion-report
     workflow.
3. **Re-run** the converter → the report + parity should improve. To **preserve parts you've already
   accepted**, pass `--skip-header` / `--skip-footer` / `--skip-sections=<s_index list>` (or
   `--only-sections=<list>`, using the `s_index` from `conversion-report.csv`) so the re-convert only
   touches the bands you're still iterating on. Each pass makes it smarter, so the next site needs less
   manual fixing.

The converter reliably gets **typography, colors, and chrome structure**; where it still misses, the
delta is closed by **translating the captured classes it didn't yet handle** — and a *systematic* miss is
a **converter fix** (teach the class→value rule, prove it with the class-string fixture), not a hand-tune
of the output. The measure-driven Phases 2a/2–4 below are the **fresh-build** path; on a conversion they
apply only as the secondary "did the translated options assemble correctly" check, never as the way you
derive a value.

## Phase 2a — Read the mockup's OUTER layers first (fresh build — when NOT converting)

**Source artifacts — capture the RENDERED DOM, and get BOTH files.** For a JS-rendered / SPA source
(React, Next, Vue…), `view-source` is only the hydration shell — the real content and inline SVGs
aren't there yet. So capture the **rendered DOM**: in browser DevTools, right-click the `<html>` node
→ *Copy → Copy outerHTML* (page at the top, default state, scrolled through once so lazy sections
load) → save as `devtools.html`. **Provide BOTH `devtools.html` (primary — the JS-built content +
inline SVGs) AND `view-source.html`** (original markup, `<head>`/meta, embedded data the rendered copy
can lose), plus the real media and a **reference screenshot** (ground truth for "does it match").
Neither static file carries *computed* styles, so when feasible prefer the capture service
(`capture.mjs <url>`), which renders in a browser AND reads `getComputedStyle`.

Before anything, open the mockup HTML/CSS and extract the **frame tokens** (write
them down — they are the spec you build to):

- **Container**: `max-width` of the main content wrapper, side gutter.
- **Header**: bar height, logo box (w×h) + top/bottom gap, background, border/shadow,
  nav alignment + item style (plain / pill / underline), whether it's a card/pill.
- **Footer**: number of columns + ratio, background, border, padding, what's in each column.
- **Type**: h1/h2/body font-family + sizes; **Color tokens** (primary, accent, text, bg).
- **Spacing**: section padding top/bottom, row gaps.

Do **not** start with the logo or a hero graphic. Start with the frame.

## Phases 2–3 — Design system + lock the CHROME + CONTAINER to parity (native options only)

This is the phase that makes "header and footer already perfect" true. Nothing else
happens until this passes the parity check.

1. **Child theme**: copy `assembled/unysonplus-theme-child/` → rename to the site slug; activate
   it. Its `design/design.json` auto-imports a polished-chrome baseline, so you start
   ~90% there — you're re-skinning, not building from zero.
2. **Container width** (General → Layout) to match the mockup's `max-width`.
3. **Header** — from `header-layout.php` / `header-menu.php` / `header-identity.php`:
   set `container`, `min_height`, `header_border`/`header_shadow`/`header_glass`,
   `header_design` (classic/pill/card/centered), `header_valign`, `header_element_gap`,
   `menu_item_style`, menu colours, and the **logo width** (`logo_type[simple][width]`).
   Use options — see the reference's "use the option, not CSS" table.
4. **Footer** — set `footer_background`, `footer_border_*`, `footer_padding_*`, the
   `main_footer_columns` count/ratio, and fill columns with **elements** (footer_logo,
   menu_area, custom_html, text, social_icons). Set `copyright_settings`.
5. **Measure**: run `node tools/measure/measure.mjs <mockupUrl> <devUrl>`. Fix every
   metric outside ±2px / tolerance. Only after container + header + footer **pass** do
   you move on. CSS in the child `assets/chrome.css` is a **last resort** for things no
   option covers — log each as an enhancement candidate.

## Phase 4 — Sections: section / row skeleton

> **Conversion vs fresh build.** On a **conversion** the converter emits each section; you **translate**
> its remaining captured classes (Rule 0.6) and, for a systematic miss, **fix the converter + re-run the
> class-string fixture** — the "measure section paddings/column widths against the mockup" steps below are
> then only the secondary assembly check. The measure-driven build here is the **fresh-build** path.

Build the page structure before content, in the page builder (or via the builder JSON):

1. One **section per band** of the mockup, in order. Set section `is_fullwidth`,
   `container_width`, `background`, `padding_top/bottom`, and (via the section's
   `css_class` Advanced field) a hook for any bespoke CSS.
2. Inside each section, the **columns** with the right widths (`1_1`, `2_3`+`1_3`, etc.)
   and gaps — match the mockup's grid (e.g. main table + sidebar = `2_3` + `1_3`).
3. **Measure** section paddings + column widths against the mockup. Get the skeleton
   right with empty/placeholder columns before filling them.

## Phase 4 (cont.) — Fill elements (hard ones as placeholders first)

1. Drop in the simple elements (special_heading, text_block, image, button, accordion).
2. **A hard element** (e.g. a reviews-table, a bespoke comparison grid) goes in as a
   **`code_block` placeholder** — paste the mockup's static HTML for that band with
   `render_as_code=false` so it renders as real markup and the layout keeps moving.
   Swap it for the real shortcode once the surrounding page is right. This keeps a
   difficult element from blocking the whole build.
3. **Measure** again; polish element spacing/typography last. For a full-page check,
   run `tools/measure/compare.mjs "<mockup>" "<dev>" --out ./parity` — the region-by-region
   **ensemble** (geometry + pixelmatch + Resemble.js + DOM-structure) flags missing/extra/short
   bands *and* missing content (links/icons/CTAs). Use the **live source URL** as the mockup.
   See `docs/design-parity-checklist.md`.

## Rules

- **Native options before CSS.** If it's in `docs/theme-settings/README.md`, use it.
- **Translate (conversion) or measure (fresh) — never eyeball.** On a **conversion**, values come from
  translating the captured class list; a wrong one is a converter fix proven by the class-string fixture
  (`tailwind-matrix.test.mjs`), not a number read off the render. On a **fresh build**, run the measure
  harness after each phase. Either way, never "looks right".
- **Outside-in.** Frame → sections → elements. Never patch an inner element before the
  frame passes parity.
- **Placeholders unblock.** A `code_block` of the mockup's HTML is a legitimate interim
  for any element that's slow to build natively.
- Anything you had to solve with child CSS that *should* be an option → note it in the
  build's report as an **enhancement candidate** for the parent theme.

## Relationship to the automated pipeline

`UnysonPlus-Capture-Service` (capture service) and
`UnysonPlus-Site-Converter-Extension` do this **automatically** (URL/file → sections →
shortcodes + presets). This manual playbook and those tools must share the **same
standards** — colors/typography/buttons/boxes as Theme-Settings presets that elements
consume, clean DOM, chrome via options. When you improve a mapping here, mirror it there
(and vice-versa); see the converter's `docs/site-conversion-playbook.md`.
