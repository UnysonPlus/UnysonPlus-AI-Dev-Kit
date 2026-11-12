# Kinetic Scenes workspace: projects you share with the person

The Kinetic Scenes Studio (kinetic-scenes.unysonplus.com) and an agent work on the same video through **project
folders** kept by the kit. Make every video in a project: the person watches each stage in the Studio as you make it,
changes things by hand, and exports it themselves. Code: `assembled/UnysonPlus-Capture-Service/tools/design-capture/
studio-workspace.mjs` (kit side, routes in `serve.mjs` under `/studio/workspace`) and the Studio's
`apps/studio/src/lib/workspace.ts`.

```
<workspace>/                     KINETIC_WORKSPACE, else the folder chosen in File › Projects › Change…,
                                 else Documents/Kinetic Scenes (the real Documents: Windows lets it move drives)
  <project>/
    scene.json                   the scene; media referred to as "media/…" (relative to the project)
    notes.md                     the plan, what was decided, what is left (the person's and the agent's)
    media/                       footage, voice, music, pictures
    renders/                     exported videos
```

## Connecting agents

`node studio-cli.mjs connect` lists the AI agents on this computer (Claude Code, Cursor, Codex) and what it would add:
the Kinetic Scenes tools (`claude mcp add --scope user`, `~/.cursor/mcp.json`, `~/.codex/config.toml`) and, for Claude
Code, the Kinetic Scenes skill in `~/.claude/skills/kinetic-scenes`. `--yes` applies it; running it again changes nothing.
The kit's start scripts ask once (`connect --ask`) and remember the answer (`agent-connect` in the kit settings).

## For the agent

- **Read the project's notes first:** `node studio-cli.mjs notes "<project>"` (MCP `project_notes`). They hold the plan, what
  the person approved and what is left, from earlier sessions. **Add a dated line when something is decided or done**:
  `notes "<project>" --add "…" --section Decided` (or `Plan`, `Still to do`). Write only facts: what was made, chosen,
  rendered; never that something was published unless the person said so.
- **List / create:** `node studio-cli.mjs projects`; MCP `project_list`.
- **Hand over a scene:** `node studio-cli.mjs project <scene.json> --name "<project>"` (MCP `project_save`). It creates the
  project if new, copies every local file the scene uses into `media/`, rewrites the paths, and prints
  `https://kinetic-scenes.unysonplus.com/?project=<name>`. Give the person that link.
- **Then edit `<project>/scene.json` directly** (keep media paths relative, `media/…`). A Studio with the project open
  reloads it within a second, as one Undo step, with a note "Updated from the project folder".
- **Read before you write.** The person may have changed the scene in the Studio (it saves as they work, 0.8 s after an
  edit). Read `scene.json` again before editing; never write a copy you read minutes ago.
- **Do not render until the person asks.** Build the scene up to the render and hand over the link: they preview it in
  the Studio and ask for changes or export it themselves.
- **Render from the project** when asked for a file: `node studio-cli.mjs render "<workspace>/<project>/scene.json" --out
  "<workspace>/<project>/renders/<name>.mp4"`. Relative media paths work: the renderer serves them itself.
- Stage-by-stage work: one project for the whole video; add each stage to it and tell the person what changed.

## How the Studio behaves

- **File › Projects…** lists projects, opens one, makes a new one from the scene in front of the person, shows the folder.
  The project name and *saved / saving* show at the top right, beside Undo (click it for the Projects list). The last project reopens on the next visit; `?project=` opens
  one directly.
- Saves into `scene.json` as the person works (File › Save saves at once; File › Download a copy downloads). Footage kept
  in the browser and large embedded files (music, voice from the add-ons) are written into `media/` on save.
- Media plays from the kit (`/studio/workspace/<project>/file/<path>`, with range requests so video seeks).
- **Conflicts:** a save sends the file version it started from; if the file changed since (an agent wrote it), the kit
  refuses (409) and returns the current version, which the Studio shows. The person's edit is one Undo away.
- Without the kit running the Studio keeps the scene in the browser, as before.
- **The start screen** opens with the Studio (File › Start something new opens it again). A `?project=` link or a page-editor connection skips it, so the link you give the person lands on the project. Anything new started from it first closes the open project, so a project is never overwritten by it.

## Scene links: handing a project to someone else (Studio 0.1.39)

`https://kinetic-scenes.unysonplus.com/?scene=<https URL of a scene.json>` opens a COPY of a published scene in the
Studio, for someone without the kit (a client who should be able to change their reel). To publish one:

- Upload the project folder's `scene.json` + `media/` unchanged into one web folder on a `unysonplus.com` host (the Studio
  refuses any other host). Relative media paths (`media/p02.jpg`) resolve next to the scene file.
- The folder must send `Access-Control-Allow-Origin: https://kinetic-scenes.unysonplus.com` for json/picture/sound/video
  files (an `.htaccess` `FilesMatch` + `Header set`; the exact block is on docs.unysonplus.com → Kinetic Scenes → Export
  → Scene links). Check with `curl -sI -H "Origin: https://kinetic-scenes.unysonplus.com" <url>`.
- Custom `code` clips are stripped on open (`stripCode` in `apps/studio/src/lib/share.ts`); the `?scene=` parameter is
  removed from the address after reading (`lib/sceneLink.ts`).
- In Chrome 157+ the person can export the MP4 with nothing installed (HTML-in-Canvas, `content="drawable"`); remote
  pictures are fetched to blob copies first so they are drawn. Other browsers need the kit for video.

The Unyson+ outreach share pages (`share.unysonplus.com/<lead>/`) use this for their "Change the words or photos" button.

## Kit routes (the Studio's origin only)

`GET/POST /studio/workspace` (list / create), `GET/POST /studio/workspace/<id>` (read / save with `base`),
`POST /studio/workspace/<id>/media?name=` (raw file), `GET /studio/workspace/<id>/file/<path>`,
`GET /studio/workspace/<id>/events` (server-sent `{ kind: scene|media, mtime }`; the kit's own writes are not reported),
`GET/POST /studio/workspace-root` (where it is; `{ choose: true }` opens the folder picker, `{ reset: true }`),
`POST /studio/workspace/<id>/reveal` and `/studio/workspace/reveal` (open in Explorer / Finder). `/studio/status` lists
`workspace` among its `features`.

## AI assist in steps (studio-agent.mjs)

With a project open and the `claude` command on PATH, the Studio's AI assist can run the request as an agent in the
project folder, whichever AI the kit otherwise uses (`/studio/status` lists the `agent` and `agent-create` features). Three
things start the same run: AI assist in steps, the start screen's **Create**, and the Kit Assistant's `work_on_project`.

- **Routes** (Studio origin only): `POST /studio/agent { project, prompt, create?, url?, voice?, music? }` → `{ id, snapshot }`;
  `GET /studio/agent/<id>` → `{ state: running|done|error|cancelled, steps: [{ t, text }], summary, error, seconds, snapshot }`;
  `POST /studio/agent/<id>/cancel` (kills the process tree).
- **A new scene** (`create`): the brief says to build the whole scene and keep `mode`, `video` and `stage`. `url` reads the
  website first (`studioQuick`): its facts go to `website.md`, its screenshots to `media/`. `voice` asks for `voice_over`,
  `music` for `scene_compose` at volume 0.25. An older kit ignores these, so the Studio only sends them when
  `agent-create` is listed.
- **Snapshots:** every run first copies `scene.json` to `snapshots/scene-<time>.json` (the last ten stay).
  `restoreSnapshot(project, name)` puts one back, and a Studio with the project open follows the file.
- **Run:** `claude -p <brief> --output-format stream-json --verbose --mcp-config <tmp: kinetic-scenes → studio-mcp.mjs>
  --strict-mcp-config --permission-mode acceptEdits`, working directory = the project folder, the full path of `claude`
  (no shell). **Allowed:** `mcp__kinetic-scenes`, Read, Edit, Write, Glob, ToolSearch (MCP tools load lazily).
  **Denied:** Bash, PowerShell, Monitor, Agent, Task, WebFetch, WebSearch, NotebookEdit, and the MCP tools
  `project_save`, `scene_save`, `scene_render`. 20-minute limit.
- **The brief** (in the code): read notes.md first; scene_guide when unsure; edit only scene.json; check with
  scene_check / scene_stills / scene_timeline (scene_path "scene.json"); never render or touch other folders; add a dated
  line to the notes; end with two or three plain sentences.
- **Steps** come from the stream: each `tool_use` named in plain words ("Reading notes.md", "Looking at frames (2, 35 s)"),
  the first line of each text block; the final `result` is the summary.
- **Learned in the first runs:** a project copied without its media made every check fail (fixed in `sceneIntoProject`:
  "media/…" paths from another project are copied); with ordinary tools the agent saved a duplicate project with
  `project_save` and then reached for Monitor to delete it, hence the deny-list. A small change takes about a minute and
  15 steps.

## The kit's secure address (Safari)

The kit answers on `http://127.0.0.1:8787` and, for Safari, on `https://127.0.0.1:8789` (studio-https.mjs; the same
routes). Its certificate is made once for 127.0.0.1 and localhost only (`assembled/https/`, or `~/.unysonplus/https/`)
and is never added to the system's trusted certificates: Safari users trust it once by opening
`https://127.0.0.1:8789/health` and choosing to visit it. `HTTPS_PORT` changes the port; `KIT_HTTPS=0` turns it off.

