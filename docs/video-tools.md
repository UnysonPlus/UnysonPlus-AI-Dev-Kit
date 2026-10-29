# Video tools: notes, timeline, video check, voice check, clean-up, connect

Reference for the Kinetic Scenes tools an agent uses while making a video. Code in
`assembled/UnysonPlus-Capture-Service/tools/design-capture/`: `studio-workspace.mjs` (notes), `studio-timeline.mjs`,
`studio-cutcheck.mjs`, `studio-cleanup.mjs` (clean-up, best take), `studio-tools.mjs` (`voiceCheck`),
`studio-connect.mjs`. Public page: docs.unysonplus.com/kinetic-scenes/video-checks. The order to use them in is in
[making-videos.md](making-videos.md); projects in [kinetic-workspace.md](kinetic-workspace.md).

| CLI (`node studio-cli.mjs …`) | MCP tool | Returns |
|---|---|---|
| `notes "<project>" [--add "…" --section Plan\|Decided\|"Still to do"]` | `project_notes` | the notes (after adding a dated line) |
| `timeline <scene.json> [--from --to --frames 3-16 --out x.png]` | `scene_timeline` | a PNG + pauses found |
| `cut-check <video> [--scene scene.json]` (also after every `render` of an MP4/WebM; `--no-check` skips) | `video_check`, and inside `scene_render` | issues, cuts, LUFS, voice lines heard |
| `voice-check <line.wav> --text "…" [--max-gap 0.4]` | — | changed words, pauses mid-phrase |
| `best-take --text "…" a.wav b.wav …` | `voice_best_take` | takes ranked, problems listed |
| `cleanup <clip> [--max-pause 0.6 --keep-pause 0.25 --no-fillers --out]` | `footage_cleanup` | cleaned clip + `.edl.json` |
| `connect [--yes]` / `connect --ask` (start scripts) | — | agents found, what was added |

## Notes (`notes.md`)

Template sections **Plan / Decided / Still to do**, made with every project (`createProject`, `sceneIntoProject`).
`addNote(id, line, section)` inserts `- YYYY-MM-DD: line` at the end of the section (made when missing). The kit's
watcher reports outside edits as `{ kind: 'notes' }` events; the Studio's **File › Project notes** follows them unless
there is unsaved typing. Write facts only (made, chosen, rendered), never "published" unless the person said so.

## Timeline

- Frames: `sceneStills` at the middle of `frames` equal slices, 320 px wide.
- Sound: every audio clip decoded with ffmpeg at 2 kHz mono into two tracks, voice (`role: 'voice'`) and the rest, each
  scaled by its `volume`; drawn as peaks per pixel.
- Words: the clip's `words` when the scene has them, else the kit's speech recognition of the clip file (cached per file).
- **Pauses**: silent runs (below about -38 dB) longer than `maxGap` (0.4 s) in the voice clip **between the start of one
  word and the start of the next** (the recogniser stretches a word across the silence after it), kept only where the
  **script** has no punctuation. The script is the text layers on screen during the clip; the recogniser's own
  punctuation is not trusted (it wrote "builder?" because of the very pause it hid), except a full stop when no subtitle
  matches.
- On screen: every text layer (inside groups too) as a bar, in lanes so bars never overlap.

## Video check

- Cuts: ffmpeg `select=gt(scene,0.32)` (counted, reported).
- Black: `blackdetect=d=0.12:pix_th=0.06`, ignoring black that starts in the first 0.05 s.
- Loudness: `ebur128=peak=true`; info outside -20 to -10 LUFS; warn when true peak > -1 dBTP.
- Narration: the video transcribed; for each voice clip its own words (scene `words` or the clip file transcribed),
  only those that fall inside the video, matched **in order** among the video's words from 2 s before to 3 s after the
  line; under 60 % found = a warning naming the line.
- **No click detection.** Measured from the finished sound, hi-hats and "s"/"sh" onsets look like clicks whatever the
  threshold (tested: a music hit at 11.47 s in a reel, the start of "show"). Clicks are prevented instead: `audioMix`
  in `studio-render.mjs` fades every clip in and out by at least 12 ms.
- `ok` is false when any warning is found; fix and render again before handing the video over.

## Voice check and best take

`voiceCheck(file, script, { maxGap })`: transcribes, aligns heard words to script words (a heard word may cover several
script words, "ProPageBuilder"; several heard words may make one, "Unison Plus"; "+" reads as "plus"), reports changed
words, and pauses: ffmpeg `silencedetect` runs longer than `maxGap` between two script words with no punctuation.
`bestTake(files, script)` ranks by number of problems, then the longest pause. Writing rules that came from it are in
making-videos.md (questions need an opening word, short noun chains, lower-case spoken text).

## Clean-up

`planCuts(words, { maxPause, keepPause, fillers, quiet })`:
- false starts: the same 1-4 words twice in a row (normalised); the first is cut, from its first word to the repeat.
  A doubled single common word (that, had, very, really, so, no, yes) is kept;
- fillers: um, umm, uh, uhh, er, erm, ah, hmm, mm, mhm (only when the recogniser writes them; small models often drop
  them, and their silence is then caught as a pause);
- pauses: `silencedetect=n=-38dB` runs longer than `maxPause` between the first and last word, cut to `keepPause`.
Cuts are merged; the kept parts are joined with `trim`/`atrim` + `concat`, each part faded 12 ms. Video is re-encoded
(libx264 crf 18), audio-only input stays audio. The edit list (`<out>.edl.json`) lists `cuts` with reasons and `keep`.
ffmpeg 8 has no `-filter_complex_script`: the graph is passed inline.

## Connect

`connectPlan()` finds agents with `where`/`which` (full path, no shell; a `.cmd`/`.bat` launcher via `cmd.exe /c`):
- Claude Code: `claude mcp get kinetic-scenes`, else `claude mcp add --scope user kinetic-scenes -- node <studio-mcp.mjs>`;
  the skill fetched from `<kinetic-scenes site>/skill/` (SKILL.md + 5 references) into `~/.claude/skills/kinetic-scenes`;
- Cursor (`~/.cursor` or `cursor` on PATH): `mcpServers["kinetic-scenes"]` merged into `~/.cursor/mcp.json`;
- Codex (`~/.codex` or `codex`): `[mcp_servers.kinetic-scenes]` appended to `~/.codex/config.toml` when missing.
`connect --ask` (start.bat / start.command, before the server starts) asks once on a terminal and stores the answer as
`agent-connect` in the kit settings (`addons.json`); after a yes it quietly adds agents installed later; never fatal.
Test it against a throwaway home (`USERPROFILE=… HOME=… PATH=<node only>`) rather than the person's real settings.

## Check this computer (`doctor`)

`node studio-cli.mjs doctor [--json]`, the MCP tool `kit_doctor`, and `GET /studio/doctor` (`{ report, text }`, Studio
origins only; the Studio's Add-ons › Check this computer) all run `studio-doctor.mjs`:
kit version (`kit-manifest.json`), capture-service version, Node; OS, CPU, memory; `ffmpeg -version` / `ffprobe -version`;
the rendering browser (launches Chrome, then Edge, then Playwright's Chromium, headless, and reads its version); the GPU
(`nvidia-smi` name, total/free MB, driver; otherwise the Windows video controller or macOS chipset); `aiBackend()`;
Blender (`findBlender()` + `--version`); the workspace root and its free space (`statfsSync`); `listAddons()` with each
add-on's state and location. About 4 s. Plain text for bug reports; nothing is sent anywhere. Run it first when a render,
voice or add-on fails.

## Kokoro voices (`kokoro:<voice>`)

A second set of built-in voices, more natural than Piper's: `kokoro:af_heart`, `kokoro:af_bella`, `kokoro:am_michael`,
`kokoro:am_fenrir`, `kokoro:bf_emma`, `kokoro:bm_george`. They appear in `GET /studio/voice` (`engine: "kokoro"`) and are
used exactly like a Piper voice id in the voice-over job (`POST /studio/voice { voice, lines }`): each line is cached,
joined, then every word is timed.

- **Install:** `POST /studio/voice/install { voice: "kokoro:af_heart" }` installs all six at once into
  `assembled/voices/kokoro/` (its own `package.json`; npm never touches anything else), about 500 MB on disk.
  Add-ons lists it as **Kokoro voices**; `doctor` reports its state.
- **Speed:** runs on the CPU (8-bit model). The model loads once per kit run (about 6 s); a short line then takes
  roughly real time. `pace` maps to Kokoro's speed as `1 / pace`.
- **Code:** `studio-kokoro.mjs` (engine), wired in `studio-voice.mjs`.

## Sound identification (`sounds-in`, `audio_identify`)

Names the sounds in a sound or video file and when each is heard, with CLAP (8-bit ONNX, `Xenova/clap-htsat-unfused`)
on the CPU. Use it to find a cut point, check what a stock sound really contains, or place effects on someone's own
recording.

- **Install once:** `node studio-cli.mjs clap-install` (or Add-ons in the Studio, or `POST /studio/clap/install`), into
  `assembled/clap/` with its own `package.json`; about 560 MB on disk (program about 400 MB, model about 156 MB).
- **Use:** `node studio-cli.mjs sounds-in <file> [--labels "rain,a door slam"] [--json]`; MCP `audio_identify { path,
  labels?, window? }`; HTTP `POST /studio/clap { src, labels? }` then poll `GET /studio/clap/<id>`.
- **Result:** `{ seconds, overall: [{ label, score }], segments: [{ start, end, label, score }] }`, times in the file.
  It listens in 2 s windows every 1 s, keeps a window's best label when its score is 0.3 or more, joins neighbours with
  the same label and splits overlaps down the middle, so boundaries are within about a second.
- **Labels:** CLAP matches sounds to words, so any short description works; the default set is about 40 sounds a video
  editor needs (`DEFAULT_LABELS`). The model loads once per kit run (about 12 s); a window then takes about 0.2 s.
- **Code:** `studio-clap.mjs`; the Studio's **Sounds in this clip** (audio clip Inspector) uses the HTTP route.
