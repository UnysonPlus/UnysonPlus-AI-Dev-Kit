# UnysonPlus AI Dev Kit

A duplicatable workspace for building **WordPress sites/demos** on **UnysonPlus** +
**unysonplus-theme** — designed so an **AI agent** can match a source mockup on the
first pass (target 95–100%), by building **outside-in** and **measuring** instead of
eyeballing.

> **This is the front door — one entry, two audiences.**
> - **AI agents:** your entry point is **[`AGENTS.md`](AGENTS.md)** → **[`PLAYBOOK.md`](PLAYBOOK.md)**. Read those and follow them.
> - **Humans:** stay here. Set up a WordPress (below), paste the one prompt, and the agent does the rest — you don't need to learn UnysonPlus.

## First: a WordPress to build into

The agent builds **into a running WordPress** that already has the UnysonPlus **plugin** and
the **unysonplus-theme** parent active. Pick one path:

### Option A — one command (recommended · needs [Node](https://nodejs.org) + [Docker](https://www.docker.com/products/docker-desktop/) + [PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell))

```bash
git clone https://github.com/UnysonPlus/UnysonPlus-AI-Dev-Kit
cd UnysonPlus-AI-Dev-Kit
pwsh assemble.ps1 -Source github     # downloads the full plugin (latest release) + parent theme
npx @wordpress/env start             # boots WordPress with BOTH installed & active
```

WordPress is now at **http://localhost:8888** (admin `http://localhost:8888/wp-admin`,
user `admin` / pass `password`) — use that as your **"Create the dev site at"** URL below.
Stop it later with `npx @wordpress/env stop`. (`.wp-env.json` mounts the assembled
plugin/theme, so `assemble` must run first. On the maintainer's machine, plain
`pwsh assemble.ps1` uses the local working copies.)

### Option B — your own WordPress (Local, XAMPP, MAMP, a live dev host…)

Already run WordPress locally? Install + activate these, then use your own site URL:

- **UnysonPlus plugin** — the **latest release zip**: <https://github.com/UnysonPlus/UnysonPlus/releases/latest>
  → *Plugins → Add New → Upload*. **Do NOT `git clone` the repo** — that's **core only**; the release
  zip is the full plugin with the page builder + all shortcodes.
- **unysonplus-theme (parent)** — <https://github.com/UnysonPlus/UnysonPlus-Theme> → *Code → Download ZIP*
  → *Appearance → Themes → Add New → Upload*.
- **Classic Editor** — install + activate from *Plugins → Add New* (search "Classic Editor"). UnysonPlus's
  page builder + meta boxes need the classic editor, not Gutenberg. (Option A installs it automatically.)
- **Site Converter extension** (only if converting a source) — activate under *Unyson+ → Extensions →
  Site Converter*; it's inactive by default, and the "Unyson+ → Convert" screen needs it.

That is the entire setup. Everything after this, the agent does.

## The whole thing in one prompt

Point your agent (Claude Code, Cursor, …) at this kit and paste this, filling the 3 blanks. The
agent reads `AGENTS.md` and does the rest.

```text
Please turn this site — [SOURCE: a URL, or a file:// path to the mockup HTML] —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: [PATH TO THIS KIT FOLDER]
- The source files I downloaded (mockup, images, video) are in: [PATH TO YOUR FILES]
- Create the dev site at: [DEV SITE URL — e.g. http://localhost/mysite/]

Read the kit's AGENTS.md and PLAYBOOK.md and follow them. Do Phase 0 FIRST when I gave a URL:
run the capture service — `node capture.mjs "<url>" <out>` in the assembled
UnysonPlus-Capture-Service/tools/design-capture (one-time `npm install` there) — to grab
the rendered DOM + media + computed styles, then import that bundle with the site-converter extension
and refine. Don't hand-build from scratch, and don't ask me for assets (SVGs, video…) the capture
already has.
```

## The source bundle (what goes in your "files" folder)

The **"source files I downloaded are in …"** folder is a small **source bundle**:

| File | Why |
|---|---|
| `devtools.html` | **The rendered DOM** — DevTools → right-click `<html>` → *Copy → Copy outerHTML* (scrolled once). Primary source: has the JS-built content + inline SVGs a `view-source` misses. |
| `view-source.html` | The original served markup — catches `<head>`/fonts/meta + embedded data the rendered copy can lose. |
| `video.mp4`, images | The **real media** the page loads from external URLs — sideloaded + used, not hot-linked. |
| `screenshot.png` | The reference image — ground truth for "does it match". |

That same folder, **zipped, is a valid upload** for the Site Converter's *Upload a file* (Unyson+ →
Convert). Best of all when feasible: give the agent the live **URL** + let it run `capture.mjs`, which
also reads computed styles.

## What happens next (so you know it's working)

The agent will, on its own:

1. Run `pwsh assemble.ps1` if the plugin/theme folders are empty.
2. Copy the `unysonplus-theme-child/` starter into your WordPress, rename + activate it.
3. **Lock the header, footer, and container to your mockup first** — native theme options — and
   **measure** with `tools/measure/measure.mjs` instead of eyeballing.
4. Build the page section by section, then fill in the details. (Hard elements can start as a
   `code_block` placeholder and be swapped for shortcodes later.)

## Keeping it current

The assembled plugin/theme and the playbook evolve — refresh with one command:

```powershell
pwsh update.ps1 -Check                # "are there updates?" — reports only, changes nothing
pwsh update.ps1                       # pull kit + re-assemble sources + refresh harness deps
pwsh update.ps1 -Source github        # same, on a non-maintainer machine
```

Run `update.ps1` whenever you come back, so you build against the current plugin/theme.

## What's inside

| Path | |
|---|---|
| `AGENTS.md` | **AI entry point** — purpose, layout, the process, the tools reflex. |
| `PLAYBOOK.md` | The outside-in build process (frame → sections → elements). |
| `tools/README.md` | **Tools inventory** — every runnable tool by capability (measure, compare, capture, build). |
| `docs/theme-settings/README.md` | **Every** Theme Settings option — configure the design from these, not CSS. |
| `design-parity-checklist.md` | Metric set + the measurement algorithm. |
| `tools/measure/*.mjs` | The parity harness — frame metrics, region ensemble (pixelmatch + Resemble.js + DOM), full-body property diff. |
| `assemble.ps1` · `.wp-env.json` | Populate the assembled folders; one-command WordPress. |

**Assembled (gitignored — never committed, filled by `assemble.ps1`):** `unysonplus/` (full plugin),
`unysonplus-theme/` (parent theme), `unysonplus-theme-child/` (child-theme **starter** — copy per site;
ships polished-chrome `design.json`), `UnysonPlus-Capture-Service/` + `UnysonPlus-Site-Converter-Extension/`
(the automated conversion pipeline this kit shares standards with).

## Why assemble instead of submodules

The **full plugin isn't one repo** — it's core + many `UnysonPlus-<Name>-Extension` repos; the
distributable is the release zip. So the kit commits only its **own** content (playbooks, starter,
tools) and pulls the plugin/theme/services in on demand. Small repo, zero drift, still fully duplicatable.

## The idea in one line

Lock the **header, footer, and container** to measured parity **first** (native options + the starter's
`design.json`), then it's just section-by-section — and hard elements can start as a `code_block`
placeholder and be swapped for shortcodes later.

## License

**GPL-2.0-or-later** — see [`LICENSE`](LICENSE). This matches WordPress and the UnysonPlus framework the
kit builds on. Copyright © UnysonPlus contributors.
