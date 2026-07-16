# UnysonPlus AI Dev Kit — start here (AI agents)

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
| `docs/header-footer-reference.md` | Every Header & Footer **theme option** catalogued. Configure chrome from these — do **not** reach for CSS first. |
| `design-parity-checklist.md` | The metric set + the measurement algorithm (mockup ⟷ dev, ±2px tolerance). |
| `unysonplus-theme-child/` | The **child-theme starter** you copy + rename per site. Ships a polished-chrome `design/design.json` so header/footer/container are ~90% right on activation. |
| `tools/measure/measure.mjs` | The measurement harness. Run it after every change. |
| `unysonplus/` · `unysonplus-theme/` | The plugin + parent theme. **Assembled, gitignored** — see `assemble.ps1`. Read them for options/shortcode shapes; the working-copy source of truth lives at `D:\Web Dev\unysonplus*`. |
| `UnysonPlus-HTML-to-Wordpress-Conversion/` · `UnysonPlus-Site-Converter-Extension/` | The **automated** conversion pipeline (capture service + converter). This manual kit shares their standards; keep them in sync. |

Assembled folders are empty until you run `pwsh assemble.ps1` (see that file).

## The non-negotiable process (why we made this kit)

The failure mode this kit fixes: building **inside-out** (patching the logo, then
the hero, then a table, then back to the logo) and **guessing sizes** from
screenshots. That never converges. Instead:

1. **Read the mockup's OUTER layers first.** Open the mockup HTML/CSS and extract
   the frame tokens: container `max-width`, header height + logo box, footer
   structure, spacing scale, color tokens, type scale. The mockup is the spec.
2. **Lock the chrome + container to measured parity FIRST**, using **native theme
   options** (General → Layout width; every Header option; every Footer option —
   see `docs/header-footer-reference.md`). Header + footer + container must pass
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
  Edit the working-copy sources under `D:\Web Dev` and re-`assemble`.
- **Per-site work happens in a copy of `unysonplus-theme-child/`**, renamed to the
  site slug.
- Keep this kit's docs and the two conversion repos **in sync** — a standard added
  here should be reflected there and vice-versa.
