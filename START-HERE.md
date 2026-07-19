# START HERE

New to UnysonPlus? You don't need to learn it. Point an AI agent (Claude Code,
Cursor, …) at this kit and paste the short prompt below — the agent reads the kit's
`AGENTS.md` and does the rest (builds outside-in, matches your mockup, measures parity).

## First: a WordPress to build into

The agent builds **into a running WordPress** that already has the UnysonPlus **plugin**
and the **unysonplus-theme** parent active. Pick one path:

### Option A — one command (recommended · needs [Node](https://nodejs.org) + [Docker](https://www.docker.com/products/docker-desktop/) + [PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell))

From the kit folder:

```bash
pwsh assemble.ps1 -Source github     # downloads the full plugin (latest release) + parent theme
npx @wordpress/env start             # boots WordPress with BOTH installed & active
```

WordPress is now at **http://localhost:8888** (admin: `http://localhost:8888/wp-admin`,
user `admin` / pass `password`). Use that as your **"Create the dev site at"** URL below.
Stop it later with `npx @wordpress/env stop`. (`.wp-env.json` in this kit mounts the
assembled plugin/theme — that's why `assemble` must run first.)

### Option B — your own WordPress (Local, XAMPP, MAMP, a live dev host…)

Already run WordPress locally? Just install + activate these two, then use your own site URL:

- **UnysonPlus plugin** — the **latest release zip**: <https://github.com/UnysonPlus/UnysonPlus/releases/latest>
  → *Plugins → Add New → Upload*. **Do NOT `git clone` the repo** — that's **core only** (blog +
  update); the release zip is the full plugin with the page builder + all shortcodes.
- **unysonplus-theme (parent)** — <https://github.com/UnysonPlus/UnysonPlus-Theme> → *Code → Download ZIP*
  → *Appearance → Themes → Add New → Upload*.

That is the entire setup. Everything after this, the agent does.

## The prompt (copy, fill the 3 blanks, paste to your agent)

```text
Please turn this site — [SOURCE: a URL, or a file:// path to the mockup HTML] —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: [PATH TO THIS KIT FOLDER]
- The source files I downloaded (mockup, images, video) are in: [PATH TO YOUR FILES]
- Create the dev site at: [DEV SITE URL — e.g. http://localhost/mysite/]

Start by reading the kit's AGENTS.md and PLAYBOOK.md, then follow them exactly.
```

### Example (filled in)

```text
Please turn this site — https://example.com (or file:///C:/mockups/acme/index.html) —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: C:\dev\UnysonPlus-AI-Dev-Kit
- The source files I downloaded are in: C:\dev\mockups\acme
- Create the dev site at: http://localhost/acme/

Start by reading the kit's AGENTS.md and PLAYBOOK.md, then follow them exactly.
```

## What happens next (so you know it's working)

The agent will, on its own:

1. Run `pwsh assemble.ps1` if the plugin/theme folders are empty.
2. Copy the `unysonplus-theme-child/` starter into your WordPress install, rename it
   to your site, and activate it.
3. **Lock the header, footer, and container to your mockup first** — using native
   theme options — and **measure** with `tools/measure/measure.mjs` instead of eyeballing.
4. Build the page section by section, then fill in the details.

The only prerequisite is the WordPress from **"First: a WordPress to build into"** above
(plugin + parent theme active). That's it — everything else is in `AGENTS.md` → `PLAYBOOK.md`.
