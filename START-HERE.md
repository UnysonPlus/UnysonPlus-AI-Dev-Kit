# START HERE

New to UnysonPlus? You don't need to learn it. Point an AI agent (Claude Code,
Cursor, …) at this kit and paste the short prompt below — the agent reads the kit's
`AGENTS.md` and does the rest (builds outside-in, matches your mockup, measures parity).

## The prompt (copy, fill the 3 blanks, paste to your agent)

```text
Please turn this site — [SOURCE: a URL, or a file:// path to the mockup HTML] —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: [PATH TO THIS KIT FOLDER]
- The source files I downloaded (mockup, images, video) are in: [PATH TO YOUR FILES]

Start by reading the kit's AGENTS.md and PLAYBOOK.md, then follow them exactly.
```

### Example (filled in)

```text
Please turn this site — https://example.com (or file:///C:/mockups/acme/index.html) —
into a fully functional WordPress site using the UnysonPlus framework.

- The UnysonPlus AI Dev Kit is set up at: C:\dev\UnysonPlus-AI-Dev-Kit
- The source files I downloaded are in: C:\dev\mockups\acme

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

You just need a WordPress install with the **UnysonPlus** plugin + **unysonplus-theme**
active for it to build into. That's it — everything else is in `AGENTS.md` → `PLAYBOOK.md`.
