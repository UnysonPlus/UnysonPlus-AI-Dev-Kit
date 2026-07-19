# UnysonPlus AI Dev Kit

A duplicatable workspace for building **WordPress sites/demos** on **UnysonPlus** +
**unysonplus-theme** — designed so an **AI agent** can match a source mockup on the
first pass (target 95–100%), by building **outside-in** and **measuring** instead of
eyeballing.

> AI agents: read **[`AGENTS.md`](AGENTS.md)** then **[`PLAYBOOK.md`](PLAYBOOK.md)** first.
> Humans: **[`START-HERE.md`](START-HERE.md)** has the copy‑paste kickoff prompt.

## Quick start

```bash
git clone https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit
cd UnysonPlus-AI-Dev-Kit
pwsh assemble.ps1 -Source github     # populates plugin/theme/service repos (see below)
npx @wordpress/env start             # boots WordPress at http://localhost:8888 with the plugin + theme active
```

That gives you a running WordPress (via [`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) —
needs Docker + Node) with the **full** UnysonPlus plugin (from the latest release) and the parent theme
already active, ready for the agent to build into. Already have your own WordPress (Local/XAMPP/MAMP)?
Skip `wp-env` and instead install the plugin ([latest release zip](https://github.com/UnysonPlus/UnysonPlus/releases/latest)
— **not** a git clone of the repo, which is core-only) + the [parent theme](https://github.com/UnysonPlus/UnysonPlus-Theme),
then point the kickoff prompt at your site URL. Full walkthrough: **[`START-HERE.md`](START-HERE.md)**.

On the maintainer's machine (plugin + theme working copies present as siblings of this kit):

```powershell
pwsh assemble.ps1                     # -Source local (default)
```

### Keeping it current

The assembled plugin/theme and the playbook evolve — refresh them with one command:

```powershell
pwsh update.ps1 -Check                # "are there updates?" — reports only, changes nothing
pwsh update.ps1                       # pull kit + re-assemble sources + refresh harness deps
pwsh update.ps1 -Source github        # same, on a non-maintainer machine
```

Run `update.ps1` whenever you come back to the kit so you build against the current
plugin/theme, not a stale snapshot.

## The whole thing in one prompt

New user? You don't learn UnysonPlus — you point an AI agent at this kit and paste
this (fill the 3 blanks). The agent reads `AGENTS.md` and does the rest. Full walkthrough:
**[`START-HERE.md`](START-HERE.md)**.

```text
Please turn this site — [SOURCE: a URL, or a file:// path to the mockup HTML] —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: [PATH TO THIS KIT FOLDER]
- The source files I downloaded (mockup, images, video) are in: [PATH TO YOUR FILES]
- Create the dev site at: [DEV SITE URL — e.g. http://localhost/mysite/]

Start by reading the kit's AGENTS.md and PLAYBOOK.md, then follow them exactly.
```

## What's inside

| Path | |
|---|---|
| `AGENTS.md` | AI entry point — purpose, layout, the process. |
| `PLAYBOOK.md` | The outside-in build process (frame → sections → elements). |
| `docs/theme-settings-reference.md` | **Every** Theme Settings option (Colors/Typography/Layout/Header/Footer/Misc/Blog/Pages) — configure the design from these, not CSS. |
| `design-parity-checklist.md` | Metric set + the measurement algorithm. |
| `tools/measure/measure.mjs` | Frame-metric parity harness (mockup ⟷ dev, pass/fail). |
| `tools/measure/compare.mjs` | Region-by-region ensemble (geometry + pixelmatch + Resemble.js + DOM-structure). |
| `tools/measure/props.mjs` | Full-body property diff — named computed-style deltas per element. |
| `assemble.ps1` | Populates the assembled folders below. |
| `.wp-env.json` | One-command WordPress: mounts the assembled plugin + parent theme + child starter into a `wp-env` install (`npx @wordpress/env start`). Run `assemble` first. |

**Assembled (gitignored — never committed, filled by `assemble.ps1`):**
`unysonplus/` (full plugin), `unysonplus-theme/` (parent theme),
`unysonplus-theme-child/` (child-theme **starter** — copy per site; ships polished-chrome
`design.json`), `UnysonPlus-HTML-to-Wordpress-Conversion/` + `UnysonPlus-Site-Converter-Extension/`
(the automated conversion pipeline this kit shares standards with).

## Why assemble instead of submodules

The **full plugin isn't one repo** — it's core + many `UnysonPlus-<Name>-Extension`
repos; the distributable is the release zip. So the kit commits only its **own**
content (playbooks, starter, tools) and pulls the plugin/theme/services in on demand.
Small repo, zero drift, still fully duplicatable.

## The idea in one line

Lock the **header, footer, and container** to measured parity **first** (native options
+ the starter's `design.json`), then it's just section-by-section — and hard elements
can start as a `code_block` placeholder and be swapped for shortcodes later.

## License

**GPL-2.0-or-later** — see [`LICENSE`](LICENSE). This matches WordPress and the
UnysonPlus framework the kit builds on. Copyright © UnysonPlus contributors.
