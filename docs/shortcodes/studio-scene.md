<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `studio_scene` — Studio Scene

Plays a **timeline motion-graphics scene** made in Unyson+ Kinetic Scenes (`https://kinetic-scenes.unysonplus.com/`):
text, shapes and images animated by presets on a timeline, rendered as live HTML (real text, not video), with its own
layout per breakpoint. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved
instances render empty). Leaf node: `{ type:'simple', shortcode:'studio_scene', _items:[], atts:{…} }` — plus the shared
wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `scene` | textarea | `''` | string: a **scene file** (JSON) **or** the Studio's **embed code** | The scene. Embed code is accepted as pasted: the JSON inside its `<script type="application/json">` is used and the rest ignored. Must have `"format": "unysonplus-scene"` and a `layers` array, or the element renders nothing (an editor notice in the builder). |
| `height_mode` | select | `'scene'` | `scene` `ratio` `ratio-capped` `fill` | Overrides the scene's `stage.heightMode` for this placement. `ratio` keeps the breakpoint's shape (page scrolls if taller than the window); `ratio-capped` keeps it but never taller than the window; `fill` is one window tall. |
| `height_offset` | slider | `0` | 0–300 (px) | Pixels left for a sticky site header in the capped / fill modes (overrides `stage.heightOffset`). `0` keeps the scene's value. |
| `trigger` | select | `'scene'` | `scene` `view` `load` `scroll` | When playback starts. `scroll` makes the page's scroll position the playhead (forwards and back), pinned for `playback.scroll.length` window heights unless the scene sets `pin: false`; pinning sticks below `height_offset`. Visitors with reduced motion always see the scene's still frame (`playback.posterTime`). |
| `scroll_length` | slider | `0` | 0–6 (window heights, step 0.1) | With `trigger` `scroll` (from this option or the scene): how far the page scrolls while the scene is pinned. `0` keeps the scene's `playback.scroll.length` (default 1.5). |
| `loop` | select | `'scene'` | `scene` `yes` `no` | Overrides `playback.loop`. |
| `transcript_headline` | select | `'scene'` | `scene` `h1` `h2` `h3` `p` | (Search tab) What the scene's headline becomes in the transcript written into the page; acts' headlines go one level below. Overrides `transcript.headline` (default `h2`). Use `h1` only when the scene is the page's main title. |
| `transcript_mode` | select | `'scene'` | `scene` `on` `decorative` | (Search tab) `decorative`: no transcript and the scene is hidden from screen readers; `on`: always include the words. Overrides `transcript.decorative`. |

`studio_tools` is a value-less `html` option (the "Open in Kinetic Scenes" button + live summary); it stores nothing.

## Ready-to-use example (the atts object)
```json
{
  "scene": "{\"format\":\"unysonplus-scene\",\"version\":1,\"title\":\"Hello\",\"duration\":3,\"stage\":{\"breakpoints\":[{\"id\":\"desktop\",\"minWidth\":0,\"aspect\":[16,9]}],\"heightMode\":\"ratio-capped\",\"background\":\"#0a0d11\"},\"playback\":{\"trigger\":\"view\",\"loop\":false,\"posterTime\":2},\"layers\":[{\"id\":\"t\",\"type\":\"text\",\"text\":\"Hello\",\"style\":{\"fontSize\":12,\"fontWeight\":800,\"color\":\"#ffffff\"},\"box\":{\"x\":50,\"y\":50},\"clips\":[{\"id\":\"in\",\"preset\":\"text-rise\",\"start\":0.2,\"duration\":0.9}]}]}",
  "height_mode": "scene",
  "height_offset": 0,
  "trigger": "scene",
  "loop": "scene"
}
```

## The scene file (summary)
The full format is the JSON Schema shipped with the Studio (`packages/player/schema/scene.schema.json` in the
`UnysonPlus-Kinetic-Scenes` repository). In short: `stage` (breakpoints with `minWidth` + `aspect`, `heightMode`,
`heightOffset`, `background`, `safeArea`, `fonts`), `playback` (`trigger`, `loop`, `loopFrom`, `repeatDelay`, `posterTime`) and
`layers` drawn bottom to top (`text` / `shape` / `image`, and `group`: a layer holding `layers` of its own, whose children keep stage coordinates and whose children's clips run on the group's clock from its `start`), each with a `box` (x/y/w in % of the stage, anchored), optional
per-breakpoint `overrides`, an optional `link` (`href`, `newTab`, `label`), an optional `pin: "stage"` (top-level only: x / y become % of the stage, sizes stay frame units, so corner items sit in the real corner of any box; pinned layers ignore the camera), an optional `depth` (-1 far to 1 near: parallax with the camera), and `clips` (a preset id, `start`, `duration`, optional `ease` and `params`). Generate scenes in
the Studio rather than by hand where possible: it validates as you edit.

Since player 0.0.37 there are more layer types, each data the AI can write: `path` (an SVG line in its box, drawn on
with Draw; others ride it with Follow path), `flow` (glowing curves joining two layers by id, redrawn every frame),
`diagram` (nodes and connections with per-node `at` times and a travelling `tag`), `code` (an editor or terminal driven
by Type code, Change code, Highlight code, Code note and Run code clips), `repeat` (one `item` copied per entry of
`items`, with `{{field}}` placeholders; it plays as a group) and `captions` (the words of a transcribed voice-over).
Text layers may carry a `pill`; music clips may carry `beats` and an `envelope` (found in the Studio) for React to music.

## Notes / gotchas

- **Custom code clips** (`preset: "code"`, `params.code` = GSAP JavaScript) run only when the post author has `unfiltered_html`; `view.php` then adds `data-upw-allow-code` to the host and the player runs them. Otherwise the player skips them and plays the rest. Never generate code clips: scenes are data, and the Studio drops any code clip an AI adds.
- **The served transcript** (PHP) reads text, 3D text and image layers; words inside a `repeat`'s item, a diagram or
  captions are not in it yet (the player's own transcript expands repeats).
- **Split into layers** runs in the kit (`POST /studio/split`, `studio-split.mjs`): with `FAL_KEY` (environment or the
  kit's `.env`) it calls fal.ai's Qwen-Image-Layered on the user's account; otherwise it cuts the subject out locally
  (U2-Net-p, downloaded once to `assembled/models/cutout`) in the kit's headless browser and fills the background.
- **Scene tools for agents** (`studio-tools.mjs`), without the Studio open: `node studio-cli.mjs check | inspect |
  stills | render <scene.json>` and `beats | transcribe | separate <audio>` (`--json` for machine output), and the same
  as a stdio MCP server, `studio-mcp.mjs` (`scene_check`, `scene_inspect`, `scene_stills` returns the frames as images,
  `scene_render`, `scene_guide`, `scene_link`, `scene_save`, `audio_beats`, `audio_transcribe`, `audio_separate`).
  **Review step:** `stills` (and the AI review, `studioReview`) default to the player's `settledMoments(scene)`, one
  frame per part once everything has landed and nothing is still arriving, and run `layoutIssues(canvas, scene, t)` on
  each (words on words on the visible ink, words crossing or touching a panel with a visible edge, ticks far from their
  words, uneven or off-centre lists, words off the stage); `check` includes those as `layout` lines. Players before
  0.0.43 lack both, and the kit falls back to `keyMoments`. Register it with
  `claude mcp add kinetic-scenes -- node <kit>/assembled/UnysonPlus-Capture-Service/tools/design-capture/studio-mcp.mjs`.
  The player comes from the Studio's `player/latest.json` (or `--player` / `UPW_PLAYER_BASE`); `beats` uses the same
  analysis as the Studio's `lib/beats.ts`, so keep the two identical.
- **Video mode** (`"mode": "video"`, `video.formats`): each format is a breakpoint with the format's id (`9x16`, `4x5`,
  `1x1`, `16x9`), all from width 0, told apart by `minRatio`. Video scenes are exported as videos, not embedded; the
  element plays one like any other scene (its formats act as layouts by shape). `video` layers (footage) are muted in
  the player; `/studio/render` takes `format: "mov"` (ProRes), `transparent` (WebM alpha / ProRes 4444), `composite`
  (keep `reference` footage) and `cover` (a PNG of the still frame, `GET /studio/render/<id>/cover`), waits for every
  footage frame after each seek (`player.settle()`), and mixes a footage layer's own sound (`sound` = its volume).
  Render bodies may be up to 600 MB (footage travels inside the scene).
- **Footage tools** (`studio-matte.mjs`): `POST /studio/matte { src, cutout?, faces?, quality: fine|fast }` cuts the person
  out of footage into a WebM with transparency (MODNet for the edges plus MediaPipe's selfie segmenter for a solid body,
  both Apache-2.0, downloaded once to `assembled/models/matte`) and finds the face in every frame (MediaPipe face
  detector) as `track` on the video layer, for the `follow` preset. Fine is about 0.5 s a frame, fast about 20 times
  quicker. `POST /studio/footage-audio { src }` returns the footage's sound as an MP3 (a voice track to transcribe).
- **Add-ons** (`studio-addons.mjs`): `GET /studio/addons` lists connectors (apps the person installs: Voicebox; Blender
  coming soon) and downloads (speech, voices, separation; sound identification coming soon) with their state;
  `POST /studio/addons/<id> { location }` sets a connector's location (kept in `assembled/addons.json`; Voicebox only
  accepts an address on this computer). **Voicebox** (MIT, its local server at `http://127.0.0.1:17493` by default):
  `POST /studio/voice { lines, voice: "voicebox:<profile id>" }` speaks each line through `POST /generate` (passing the
  profile's `default_engine`, which Voicebox otherwise ignores), polls `GET /history/<id>` and reads `GET /audio/<id>`,
  brings each WAV to 24 kHz mono, and joins and times the lines like the Piper voices. The first line after Voicebox
  starts loads its model (minutes on a mid-range GPU); later lines take seconds. With `{ location, field: "app" }` the
  person sets Voicebox's program (an `.exe` / `.app` whose name says Voicebox); `voiceboxSpeak` then opens it when it
  is closed and waits for `/health`.
- **ACE-Step music** (`studio-music.mjs`, connector `ace-step`): its location is the ACE-Step 1.5 folder (checked for
  `start_gradio_ui.bat` and `acestep/acestep_v15_pipeline.py`). `POST /studio/music { prompt, seconds, bpm? }` → poll
  `GET /studio/music/<id>` → `{ src (mp3 data URL), bpm, seconds }`; CLI `studio-cli.mjs music "<style>" --seconds --bpm
  --out`. When nothing answers on 127.0.0.1:7860 (`ACE_STEP_PORT` overrides) the kit runs that launcher with
  `ENABLE_API=--enable-api CHECK_UPDATE=false`, hidden (no browser: the pipeline launches with `inbrowser=False`),
  waits for `/health` (up to six minutes), and remembers the listening process's id in a temp file so a restarted kit
  still owns it; it stops that process after ten idle minutes or when the kit exits. An ACE-Step the person opened is
  used as is and never stopped; open without `--enable-api` (`/` answers, `/health` 404s) it reports `no-api`.
  Generation is `POST /release_task` (synchronous) with `lyrics: "[Instrumental]"`, `inference_steps: 8`,
  `use_cot_caption: false`, `thinking: false` (the language-model planning is what made earlier runs take many
  minutes on a 6 GB card), then `POST /query_result` and `GET /v1/audio?path=`. About 45-60 s for 30 s of music from
  cold on a GTX 1660 Ti.
- **Find, Browse, one GPU app at a time.** `POST /studio/addons/<id>/find` scans the program folders plus the top two
  levels of every drive and the home folders for `voicebox.exe` (never `voicebox-server.exe`) or an `ace-step` folder,
  and saves the hit; `POST /studio/addons/<id>/browse` opens a native picker (Windows: WinForms Open/FolderBrowser
  dialog owned by a 1 px top-most form, which keeps it in front; an Opacity 0 owner makes it return Cancel at once;
  macOS: `osascript choose file/folder`). `studio-gpu.mjs` keeps a registry of kit-opened GPU apps: `voiceboxSpeak`
  and `makeMusic` call `claimGpu()` first, which waits for the other app's work, closes it (`taskkill /t` on the
  launched pid and the port's listener, ids kept in temp files) and waits for VRAM to drop. Apps the person opened are
  never closed. Voicebox opened by the kit also closes after ten idle minutes. Measured: Voicebox ~5.2 GB; closed and
  freed in ~2 s; ACE-Step then started in about a minute.
- **Voice and music separation** (`studio-separate.mjs`): `POST /studio/separate/install` installs ONNX Runtime for Node
  (pinned, `npm install` into `assembled/separate/runtime`) and HTDemucs v4 (the MIT `webnn/stem-separator` ONNX export,
  about 170 MB, `assembled/separate/model`); `POST /studio/separate { src }` → poll `GET /studio/separate/<id>` → `{ voice,
  music }` AAC data URLs. The STFT / iSTFT and overlap-add around the model are `vendor/htdemucs.mjs` (Microsoft's MIT
  WebNN demo, unchanged). About real time on a CPU. The Studio adds the two as `voice` and `music` audio clips (music is
  ducked under the voice by the player).
- **Review frames.** `studioReview` uses the settled moments; when there are fewer than four (scenes of continuous
  effects: particles, grades, footage) it renders six frames spread across the scene instead. Known gap: footage the
  Studio keeps in the browser does not reach the review stills, so the AI sees the effects without the footage.
- **Background requests (Studio 0.0.73).** AI assist cuts the person out first when a request is about the background,
  turns the footage's sound into a music clip with beats when the scene has none, sends a brief to build the effects
  between the footage and the cut-out on the whole scene, and keeps the cut-out on top afterwards.
- **Graphics card and speed.** When ONNX Runtime for Node is installed (the separation runtime,
  `assembled/separate/runtime`, 1.30 ships DirectML), MODNet runs in **Node on DirectML** (CUDA elsewhere): ~24.5 ms a
  frame at 320x576 against ~50 ms on WebGPU in the browser and ~145 ms on the CPU, and it runs alongside the browser
  (frames read once more as raw RGB; the browser fetches `/mod/<frame>` as each is ready). MediaPipe's body and face models
  use the `GPU` delegate when a probe succeeds (CPU otherwise). **Three pages** (`UPW_MATTE_PAGES`) each take a continuous
  run of frames (the edge smoothing needs the previous frame). Mattes come back as raw grey bytes into one `mattes.gray`
  for ffmpeg (no PNG round trip), and the see-through WebM uses VP9 `-deadline realtime -cpu-used 6` (48.5 s -> 6.4 s for
  600 frames, ~25% larger). Measured on 20 s of 576x1024 footage (603 frames, GTX 1660 Ti): **104.9 s -> 35.8 s**; masks
  match the old path to 0.63% mean difference (the new one keeps a little more of held objects). `UPW_MATTE_NODE=0`
  forces the browser path. WebGPU (onnxruntime-web 1.20 or later) and the processor stay the fallbacks.
- **Additions only.** `/studio/status` lists `features: ["add"]`; `/studio/ai` with `mode: "add"` returns `{ patch: { add,
  clips }, explanation }` (the Studio merges it), and `/studio/review` with `patch: true` asks the AI for the changed layers
  only and merges them itself. Both answers are a fraction of a whole scene.
- **Rules size.** The Studio's motion rules are over 24,000 characters; the kit keeps up to 60,000 (older kits cut the
  end off, which loses the newest recipes).
- **Explainer length.** When an explainer or tutorial request names a length ("a 20 second explainer"), the planner
  (`studioPlan`) caps the narration at about 2.6 spoken words a second and, if the script still runs 25% over, asks once
  for a shorter one.
- **The player is bundled** (`static/js/vendor/scene-player.js`, a copy of the Studio's published player): no request
  leaves the site. Filter `fw_studio_scene_player_src` to point elsewhere. To update it, copy the newest
  `apps/studio/public/player/<version>/scene-player.js` from the Studio repository and bump the version in `static.php`.
- **3D layers** (`"type": "model"`) need `static/js/vendor/scene-3d.js` (three.js) beside the player; `static.php` sets `window.UPW_SCENE_ASSET_BASE` to that folder (filter `fw_studio_scene_asset_base`) so it is found even when an optimiser moves the player script. It loads only on pages whose scene has a 3D layer.
- **It carries its own GSAP** internally and does not claim `window.gsap` when another copy is present, so it sits next
  to Scroll Motion without interfering (verified with ScrollTrigger on the same page).
- **Breakpoints follow the element's width, not the screen's.** In a half-width column a scene uses whichever breakpoint
  fits that width (often its mobile layout).
- **The host fills its container** (`[data-upw-scene]{width:100%}` in the player), so it never collapses inside a centred
  flex column.
- **Round trip.** "Open in Kinetic Scenes" opens the Studio (`fw_studio_scene_studio_url` filter, default
  `https://kinetic-scenes.unysonplus.com/`) with `?connect=unysonplus`; the Studio says hello, the builder sends the
  field's scene, and "Save to page" in the Studio writes the edited JSON back into the field. Messages are accepted only
  from the Studio's origin **and** the window the builder opened; the Studio replies only to its opener's origin.
- **Search engines and screen readers (the transcript).** An animation shows its words a few at a time (scrambled, masked
  or duplicated mid-effect), so a crawler's snapshot of the live stage reads as fragments. `view.php` therefore writes the
  scene's words into the page HTML once, as a visually hidden `<div class="upw-scene-text">` after the scene JSON: in
  reading order (by when each layer appears, then top to bottom), the scene's headline as `<h2>` (or `transcript_headline`),
  each act's (top-level group's) headline one level below, everything else `<p>`; display-sized lines next to a headline
  merge into it ("Make it" + "MOVE." → "Make it MOVE."), 3D text counts as its act's headline, duplicates are dropped.
  The player keeps that block, marks the animated stage `aria-hidden`, and gives the scene `role="group"` named by
  `title`. `upw_studio_scene_transcript_items()` (PHP) is a port of the player's `sceneTranscript()`
  (`packages/player/src/transcript.ts`): keep them identical (a parity test of 45 cases passed at 0.0.16). Pages without
  a served transcript (embeds, Studio exports) get one written by the player itself.
- **Links.** A layer's `link` makes it clickable: on the stage, a click area (`a.upw-link`, out of the tab order, inert in
  the editor); in the transcript, the real `<a href data-upw-link="<layer id>">` with the layer's words (a linked group: all
  the words inside it, read as one link, never merged into a heading). Focusing that link rings the layer on the stage
  (`.upw-layer[data-focus]`). Only `https?://`, same-site paths, `#`, `?`, `mailto:` and `tel:` are kept
  (`upw_studio_scene_link()` mirrors the player's `SAFE_HREF`); the player's validator drops any other link with a warning.
  Parity: 49 cases identical at player 0.0.22.
- **Loop the last part.** `playback.loopFrom` (with `loop: true`): the scene plays once, then repeats only from that
  moment to the end. The element's `loop` override still turns looping on or off; `loopFrom` comes from the scene.
- **Output safety:** the scene is re-encoded with `JSON_HEX_TAG`, so text containing `</script>` cannot close the script
  element.
- Re-init: pushes `UnysonPlusScene.autoMount(scope)` onto `window.fwShortcodeInit` for markup inserted after load.
