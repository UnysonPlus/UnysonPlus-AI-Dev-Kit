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
```

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

Start by reading the kit's AGENTS.md and PLAYBOOK.md, then follow them exactly.
```

## What's inside

| Path | |
|---|---|
| `AGENTS.md` | AI entry point — purpose, layout, the process. |
| `PLAYBOOK.md` | The outside-in build process (frame → sections → elements). |
| `docs/header-footer-reference.md` | Every Header/Footer **theme option** — configure chrome from these, not CSS. |
| `design-parity-checklist.md` | Metric set + the measurement algorithm. |
| `tools/measure/measure.mjs` | Parity harness (mockup ⟷ dev, pass/fail). |
| `unysonplus-theme-child/` | Child-theme **starter** (copy per site; ships polished-chrome `design.json`). |
| `assemble.ps1` | Populates the assembled folders below. |

**Assembled (gitignored — never committed, filled by `assemble.ps1`):**
`unysonplus/` (full plugin), `unysonplus-theme/` (parent theme),
`UnysonPlus-HTML-to-Wordpress-Conversion/` + `UnysonPlus-Site-Converter-Extension/`
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
