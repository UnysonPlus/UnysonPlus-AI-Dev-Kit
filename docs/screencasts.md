# Screencasts: recording Unyson+ demos for reels and tutorials

Real screen footage of the product working reads as genuine in a way generated graphics alone do not. Two kit
commands turn a short step list into a framed, captioned reel. Code: `assembled/UnysonPlus-Capture-Service/tools/
design-capture/studio-record.mjs` and `studio-screencast.mjs`. Lessons from making real videos with them: [making-videos.md](making-videos.md).

```
node studio-cli.mjs record steps.json --out rec            # rec/video.mp4 (2x) + rec/actions.json
node studio-cli.mjs screencast rec --format 9x16 --title "Build a page in a minute" --end "Unyson+" --cta "Free · link in bio" --music rec/music.mp3
node studio-cli.mjs render rec/screencast-9x16.json --out demo.mp4 --width 1080 --height 1920
```

## 1. Record (`record`)

A real Chrome, logged in off camera, runs the steps the way a person would: a visible cursor with click ripples, curved
eased mouse moves, letter-by-letter typing, real jQuery-UI drags. It records Chrome's own frame stream at **2x**
(`--force-device-scale-factor=2`: without the flag the stream is CSS-pixel size even with `deviceScaleFactor: 2`),
restarts the stream after each page load (the stream stops on navigation), and **cuts the loading out** (a WordPress
preview can take minutes to reach "network idle"; the recorder waits for `load` and drops the wait from the video).
Admin notices and the footer are hidden.

`steps.json`:

```json
{ "site": "http://localhost/sshots", "login": { "user": "admin", "pass": "admin" },
  "start": "/wp-admin/post-new.php?post_type=page", "viewport": [1600, 900], "scale": 2,
  "steps": [
    { "do": "wp.title", "text": "Summer Launch", "label": "Name your page" },
    { "do": "pb.addSection", "label": "Add a section" },
    { "do": "pb.add", "tab": "Content Elements", "element": "special_heading", "label": "Drag in a heading" },
    { "do": "pb.edit", "item": "Special Heading" },
    { "do": "pb.set", "field": "title", "text": "Summer is here", "label": "Type your words" },
    { "do": "pb.save" },
    { "do": "wp.saveDraft", "label": "Save the page" },
    { "do": "wp.preview", "label": "See it live" }
  ] }
```

- **Plain steps:** `click`, `dblclick`, `hover` (`target`), `type` (`text`, optional `target`, `clear`), `select` (`target`
  plus `option`, the visible text, or `value`: the cursor goes to the dropdown and the choice is made; a native list does
  not show in a recording), `press` (`key`),
  `drag` (`from`, `to`), `scroll` (`by`), `wait` (`ms`), `goto` (`path`, loading cut), `mark` (a labelled moment).
- **Targets:** a Playwright selector string, `{ "text" }`, `{ "role", "name" }`, `{ "label" }`, or a page-builder target
  `{ "pb": "tile" | "tab" | "item" | "field" | "save" | "first-field", … }`.
- **Unyson+ actions:** `wp.title`, `wp.saveDraft`, `wp.preview` (a draft's preview; admin bar hidden), `wp.publish` (publishes and waits for the confirmation), `wp.view` (the published page through its real link). Say "live" only after `wp.publish`: a draft preview is not live; `pb.tab` (`name`),
  `pb.addSection` (`kind`: Section, Bleed Section…), `pb.add` (`element`: the shortcode slug, e.g. `special_heading`,
  `button`; optional `tab`; drops into the last section), `pb.edit` (`item`: its name in the builder; one click opens its settings), `pb.set`
  (`field`: the option id, e.g. `title`, `overline`; without it, the first text field of the open settings), `pb.save`.
- **Builder facts these rely on:** tiles are `.builder-item-type` (jQuery UI draggables, so drags must be real mouse
  moves) holding `.fw-page-builder-thumb-shortcode--<slug>` (layout tiles have none: match their title); a section's drop
  zone is its inner `.builder-items` ("Drop elements here" is CSS, not text); an element's settings open on double-click
  in an `.fw-modal` with fields named `fw_edit_options_modal[<id>]`; its Save is `button.media-button.button-primary`
  (`.fw-modal` itself has no box, so `:visible` on it never matches).
- **Live Editor actions:** the page sits in a frame; a target with `"frame": true` (plus `text`, `css`, `role` or `label`)
  is looked for inside it. `le.select` (`text`: click an element on the page), `le.edit` (its toolbar's edit button: the
  same settings as the builder, then `pb.set` / `pb.save`), `le.device` (`name`: Desktop, Tablet, Mobile; the switch gets no
  caption), `le.save` (the editor's Save). Start at `/?page_id=<id>&fw-live-editor=1`.
- `label` names the step in the reel's captions. Each step can set `pause` (ms after it).

`actions.json`: `{ video, width, height, seconds, actions: [{ kind, label, t, end, rect }] }`, with times in the video
and `rect` in video pixels (where the click, typing or drag happened).

## 2. Frame it (`screencast`)

Writes `screencast-<format>.json` next to the recording (it refers to `video.mp4` and the music by file name; the
renderer serves local files itself). The camera arrives at each place a little before the action, holds through it,
and pulls back to the whole screen when the next action is more than about two seconds away; a click and the typing that
follows are one stop. Zoom: 1.5-3.4 in 9:16 (the screen is a band across the middle), 1-2.4 in 16:9; the view never
leaves the video. Each step label becomes a numbered caption pinned to the stage (once, in order; tab clicks, Save and
"Open its settings" are left out). Optional `--title` (2.6 s before, `--intro` to change), `--end` and `--cta` (3 s after), `--music`; brand: `--accent` (caption colour), `--bg` (an image behind the screencast), `--title-bg` / `--end-bg` (images for the opener and end card); `--voice voice.json` ([{ at: seconds in the recording or "intro", file, seconds, text }]: each line as a voice clip with a subtitle placed clear of the action).

- **Do not pin the background.** Pinned layers are drawn above the camera's layers, so a pinned full-stage background
  hides the screencast (this cost an evening). It is a large unpinned shape instead.
- `stills` can show a blank stage for a big screencast: it may take the picture before the video has loaded. Check
  with a short `render`.

## 3. Screenshots (`shot`)

`node studio-cli.mjs shot shots.json --out shots`: sharp 2x PNGs of a page (or `full` page) or one `element` with `pad`,
logged in the same way as `record`. Annotations are drawn on the page itself: `highlight` (a ring), `callout`
(`{ target, text, side }`), `arrow` (`{ to, from: left|right|top|bottom|top-left… }`, ending just outside the target's
nearest edge) and `blur` (a list of targets). An element crop widens to take in its annotations. Optional `steps` (click,
type, hover, wait) set the page up first.

## 4. Into a project

`node studio-cli.mjs project rec/screencast-9x16.json --name "Product tour"` copies the scene and every file it uses
(video, voice, music, pictures) into the workspace project and prints the link that opens it in the Studio, where the
person previews and exports it. See [kinetic-workspace.md](kinetic-workspace.md).

## 5. In the Studio (without a project)

File > **New from a screencast…**: pick the recording's `video.mp4` and `actions.json` together; the Studio builds the
same scene (same rules, `apps/studio/src/lib/screencast.ts`, kept in step with `studio-screencast.mjs`), with the
camera keys editable on the Camera row.

## Framing rules

Close-ups 2.2-4x (9:16) or 1.2-2.6x (16:9); pull-backs between steps 1.6x; page changes show the whole screen. A target
wider than the view (a long text field) is framed on its left part, where the typing is. `--intro` sets the title's
length (to fit a first voice line under it).

## Renderer: local files

`render`, `stills` and `check` serve footage, pictures and sound given as file paths (relative to the scene file) from a
small built-in server that allows seeking and answers Chrome's private-network preflight
(`Access-Control-Allow-Private-Network`); a page from the web is otherwise refused files on this computer.

## A styled demo site

End demos on a real, designed site, not a bare theme. Recipe (the kit's own reels use it): clone a designed site to a
demo-only install (copy the files; dump and import the database into a new one; `wp search-replace` the old address
everywhere, **twice**: plain `http://old` and the page builder's escaped `http:\/\/old`, with `--all-tables-with-prefix`;
then once more including `guid`; delete `uploads/unysonplus/css/*.css` and `asset-optimizer/combined-*.css` so the
generated CSS rebuilds with the new address; check the rendered HTML has no old address left). Snapshot its database
and uploads, and reset to the snapshot before each recording: recordings publish and edit pages. Keep plugin and theme
files out of the snapshot so a reset never rolls back code.

## For good-looking demos

Use a styled demo site for anything that ends on the front end (the screenshots site has a bare theme). Keep a reel
to one task; give steps short, verb-first labels ("Drag in a heading"); for 9:16, act on things near each other so the
camera does not travel far.

## Voice-overs

Write the brand as **"Unisonplus"** in any text a voice speaks (Voicebox, Piper): spelled "Unyson+" or "Unyson Plus" it is
read wrongly. On screen it stays "Unyson+". Generate voice lines when nothing heavy is running: Voicebox's model needs
several GB, and running it beside a render has failed with Windows' "paging file is too small" and taken its server down.
