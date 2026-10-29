# Setting up Kinetic Scenes add-ons for best results

How to configure the apps the AI Dev Kit drives for Kinetic Scenes (Voicebox voices, ACE-Step music), so they run
fast and do not fight over the graphics card. Read this before changing an add-on's settings, or when an add-on is
slow or "not found". Code: `assembled/UnysonPlus-Capture-Service/tools/design-capture/studio-addons.mjs`,
`studio-music.mjs`, `studio-gpu.mjs`; routes and internals in [`shortcodes/studio-scene.md`](shortcodes/studio-scene.md);
the person-facing page is `docs.unysonplus.com/kinetic-scenes/addons`.

## Check first

```
curl -s http://127.0.0.1:8787/studio/addons            # every add-on, its state and its saved location
curl -s -X POST http://127.0.0.1:8787/studio/addons/voicebox/find   # search and save (also ace-step)
```

Saved locations live in `assembled/addons.json` (`voicebox.url`, `voicebox.app`, `ace-step.path`).

- **The kit must be current.** The Studio sends Browse / Find it only to a kit advertising the `addon-browse`
  feature (`GET /studio/status` → `features`). An older kit read those requests as "set the location to nothing"
  and cleared `addons.json`. After updating kit files, the person must **restart the kit** (start.bat).
- **States:** `connected` (running, kit can use it now), `ready` (closed, but the kit knows where it is and will
  start it), `no-api` (ACE-Step is open without its API), `not-found`.

## ACE-Step 1.5 (music)

**The one setting that matters: turn the API on in the launcher the person uses.** In
`<ACE-Step folder>\start_gradio_ui.bat`, line ~56, `REM set ENABLE_API=--enable-api` → `set ENABLE_API=--enable-api`.

- **Why:** with the API on, an ACE-Step window the person already has open (models loaded) is used as is: a track in
  seconds, and the kit never closes it. Without it, the kit cannot use their window (`no-api`), and when it is
  closed the kit starts its own copy, paying ~40–65 s of model loading every time.
- **`.env` cannot do this.** The launcher reads only certain `.env` keys (`ACESTEP_CONFIG_PATH`,
  `ACESTEP_LM_MODEL_PATH`, `ACESTEP_INIT_LLM`, `ACESTEP_API_KEY`, `PORT`, …), not `ENABLE_API`. Edit the `.bat`.
- **Keep CRLF line endings.** Edit the `.bat` byte-for-byte (e.g. Python, replacing `b"\r\nREM set ENABLE_API=…\r\n"`).
  `sed` on Git Bash silently rewrote all 402 lines to LF, which can break a batch file's `goto` labels. Back it up
  first (`start_gradio_ui.bat.bak-unysonplus`).
- **Updates can undo it.** ACE-Step's update check (asked at launch, or `check_update.bat`) stashes local edits
  before pulling. If the add-on shows `no-api` after an update, re-apply the line.
- **Fast generation settings** (the kit sends these; recommend them in the UI too): `lyrics: "[Instrumental]"` (tick
  Instrumental), `inference_steps: 8` (turbo model), **`thinking: false` and `use_cot_caption: false`** (the UI's
  **Think** box off). Think runs the 5 Hz language model (1.7B on this machine, offloaded to CPU) to plan the song;
  on a 6 GB card that is the step that stalled a run for more than 10 minutes. Turn it on only for a final, polished
  take, by hand.
- **Ask for a few seconds more than you need** (e.g. 32 s for a 25 s reel): tracks end with their own wind-down,
  sometimes a second or two before the requested length.
- **Location** = the folder holding `start_gradio_ui.bat` and `acestep/acestep_v15_pipeline.py`. The kit runs only
  that launcher, with `ENABLE_API`, `CHECK_UPDATE=false`, hidden; no browser opens (the pipeline uses
  `inbrowser=False`). Port 7860 (`ACE_STEP_PORT` overrides, useful for testing beside the person's own window).

## Voicebox (voices)

- **Program** = `voicebox.exe`, **not** `voicebox-server.exe` or `voicebox-mcp.exe` (they sit in the same folder,
  e.g. `D:\AI\voicebox\`). Find it already skips them.
- **Address** stays `http://127.0.0.1:17493` unless the person changed Voicebox's port; only local addresses are
  accepted.
- The first line after Voicebox starts loads its model (about a minute; it takes ~5.2 GB of a 6 GB card). Later lines
  take seconds, so batch a script's lines into one voice-over rather than many separate calls.
- Use only a voice the person has the right to use.

## The graphics card: one AI app at a time

Voicebox and ACE-Step each fill most of a 6 GB card. Before either works, `claimGpu()` closes the other **if the kit
opened it**, then waits for the memory to come back (~2 s). Apps the person opened are never closed, so if they keep
both open themselves, two models may share the card: suggest closing one, or letting the kit open them. Anything the
kit opened closes after ten idle minutes and when the kit exits. A voice-over then music therefore costs two cold
starts (about a minute each); do the voice-overs together, then the music.

## When testing

- Run a second kit (`STUDIO_ORIGINS=http://localhost:<preview port> PORT=8797 node serve.mjs`) and
  `ACE_STEP_PORT=7861`, so the person's own windows and kit are not touched.
- Never stop all `powershell.exe` or `python.exe` processes; stop only the process ids you started (the native
  picker is a `powershell.exe` whose command line contains `FolderBrowserDialog` / `OpenFileDialog`).
- The picker must be owned by a visible 1 px top-most form; an `Opacity = 0` owner makes it return Cancel at once,
  and `UseDescriptionForTitle` does not exist in Windows PowerShell 5.1.
