# Making explainer videos, reels and promos: what we learned

Lessons from the first real videos made with Kinetic Scenes and the AI Dev Kit (a page-builder explainer, a
narrated villa tour, unboxing and product reels, a lyric reel, a background-effects attempt). Read it before making
any video; the tools themselves are in [screencasts.md](screencasts.md) (recording, auto-zoom, screenshots),
[addons-setup.md](addons-setup.md) (voices, music) and [shortcodes/studio-scene.md](shortcodes/studio-scene.md).

## Paper cut-out explainers

The start screen's **A paper cut-out explainer** sets the `paper` style and a story brief (`PAPER_BRIEF` in the Studio's `lib/start.ts`): one physical metaphor, a claim in the first three seconds, about 3.5 to 4 words a second. Build it from shape layers with the `paper` preset running for each layer's whole life, `depth` from -0.8 to 0.6 and two `scene.camera` keys. Keep `rough` near 1 to 1.5 on anything with words, or the letters warp. Change sets with a matched out and in pair of `tr-tear`, `tr-page` or `tr-tape`. Sounds: `paper-rustle`, `paper-tear`, `tape-pull`, `stamp`. Template id: `paper`. Public page: https://docs.unysonplus.com/kinetic-scenes/paper-cut-out

## The order that works

0. **Read the project's `notes.md` first and keep it up to date** (`studio-cli notes`): an approved line, a reworded take,
   the chosen music, what was rendered. Several sessions work on one video; the notes are how they agree.
   **Work in a Kinetic Scenes project** ([kinetic-workspace.md](kinetic-workspace.md)) so the person can watch each stage
   in the Studio and export it themselves. **Build everything up to the render, then stop:** a "preview" is the project
   open in the Studio, not a rendered MP4. Do not render until the person asks for the file (they can also export it
   themselves); a render takes 7-15 minutes and is wasted if they want changes. Your own checks use `stills` and short
   test cuts, not the full render.
1. **Script first, as lines tied to moments.** For a screencast, `studio-cli narrate <rec>` drafts them from the
   recording (a line per step, within its word budget) and `voice` speaks and checks them; `guide` writes the matching
   step-by-step page ([screencasts.md](screencasts.md) § 2b). One short line per step or shot; write the brand as "Unisonplus" in
   anything a voice reads.
2. **Pictures:** a screencast (`studio-cli record`), the source's own photos or footage, or both. Real product footage
   reads as genuine; generated text and shapes alone read as "AI-made".
3. **Voice** (Voicebox / Piper), then **check every line** by transcribing it, then **music** (ACE-Step).
4. **Assemble** (`studio-cli screencast`, or a scene script), **check** (`studio-cli check`), **stills** at key moments,
   then a short test render, then the full render.
5. **Look at the finished video frame by frame before sending it.** Every problem below was found this way, not by
   reading data.

## Honesty: show what really happens

- **Narration must match the footage.** A demo that clicked *Save Draft* and opened a *preview* was narrated "Save the
  page… live on your site": a viewer would think it was published. Use `wp.publish` + `wp.view` before saying "live".
- **Facts on screen come from the source**, and anything inferred (a price heard in speech, "faux leather" from a photo)
  is flagged to the person to confirm.
- **Show and say the real interaction.** In the Unyson+ page builder **one click opens an element's settings**; never
  double-click it or narrate "double-click".
- **Check the result in the database, not only on screen.** On a slow site (the demos network's Coastal) Publish did not
  submit: the page stayed an empty draft and the "live" page was blank. After recording, confirm the page's status and
  content (`SELECT post_status, LENGTH(post_content) …`) before narrating it as published.
- **Lyrics or transcripts:** speech recognition mishears (names, slang) and can bunch the last words at one time;
  spread them, and tell the person which lines may be wrong and that explicit lines are shown as sung.

## Voice

- **Generate voice when nothing heavy runs.** Voicebox needs several GB; beside a render it failed with Windows' "paging
  file is too small" and its server died (the window stayed open, the API did not). Restart Voicebox, then retry.
- **Before hand-over, run `studio-cli voice-review lines.json`** (`{ lines, voice }`, the kit running): every line spoken
  (from the cache) and voice-checked on its own. Never rely on the whole voice-over's transcript: recognition corrects a
  slip from the words around it ("zitemaps" read as "Site maps" in the full file, "Zit Maps" alone). A failed line is
  reworded, not retaken: the same text comes out the same. A word that starts a line with a buzzed "s" can be respelt
  for the voice ("Site maps"); the caption keeps the normal spelling.
- **A line written as a question must sound like one.** `voice-check` fails a take when the line ends in "?" but the pitch
  does not rise (6% or more at the end). The transcript's "?" does not save it: recognition adds one to anything worded
  like a question. It counts only when the pitch cannot be read, and for What / Why / How / When / Where / Who / Which
  questions, which fall when said well. `intonation.change` in its result gives the rise. Check one line at a time. If it
  fails, rephrase rather than retry: the same words come out the same. Short questions that end on the point rise best
  ("Are your WordPress links too long?" +23%, "Are the links on your WordPress site long and ugly?" -10%); "Are you…" helps
  but is no guarantee ("Are you paying every month for a CRM?" -8%). A flat question is the usual offender in a reel's hook.
- **Word times are fitted to their lines.** Recognition over a whole voice-over can run half a second late, so
  `/studio/voice` fits each line's words into that line's real window (`fitWordsToLines`). If the heard word count differs
  from the script's, the times are left as they came: new overlap or short-display warnings in `check` are the sign.
- **Run `studio-cli voice-check <line.wav> --text "<script line>"` on every line, and keep only takes that pass.** It
  flags changed words and **pauses mid-phrase** (longer than 0.4 s where the script has no punctuation), which sound
  machine-made. Comparing words alone missed one: "Paying for a page builder … Pro plan" had a 1.3 s break, the words
  all matched, and the recogniser even stretched "builder" over the silence, so the pause is measured in the sound
  itself. When the same break comes back take after take, reword (here "a Pro page builder plan" fixed it).
- **Write for the voice, not the eye.** A question needs a word that announces it ("Still paying…?", not "Paying…?"):
  without one the voice reads it as a statement, falling at the end, whatever the "?" says. Long noun stacks ("a Pro
  page builder plan") make it break before the last noun: shorten them ("a pro page builder?"). Write words in
  lowercase in the spoken text ("pro", not "Pro"); the subtitle keeps the capitals. Measured on the Elementor-alternative
  hook: "Paying for a Pro page builder plan?" fell 1.1 semitones and paused before "plan" in almost every take; "Still
  paying for a pro page builder?" rose up to 4 semitones with no pauses.
- **Look at the timeline of each stretch with a voice:** `studio-cli timeline <scene.json> --from 0 --to 12` draws one picture
  of frames, the sound wave, every spoken word at its time (pauses inside a phrase in red, judged against the subtitle on
  screen) and the text layers as bars. It shows at a glance whether a subtitle leaves before its words are said, a line
  starts on the cut, or a take breaks mid-phrase. MCP: `scene_timeline`.
- **Several takes of a line: `studio-cli best-take --text "<line>" take1.wav take2.wav …`** ranks them by the voice check;
  keep the first that passes.
- **Recorded speech (a talking head, a voice recording): `studio-cli cleanup <clip>`** cuts false starts ("build your own…
  build your own header"), um / uh and pauses over 0.6 s (measured in the sound: the recogniser stretches a word over the
  silence after it), each cut faded, and writes an edit list beside the cleaned clip. Look at the result before using it.
- **Clicks at cuts are prevented, not hunted:** the renderer fades every sound clip in and out by at least 12 ms. Measuring
  clicks in the finished sound mistook hi-hats and "s" sounds for clicks, so the cut check does not try.
- **Transcribe every line and compare with the script.** A voice can blur a phrase the same way every take ("nowhere"
  heard as "no way" twice): reword the line rather than retrying. A misheard *name* in the transcript is often only the
  recogniser; listen or retry once before rewording.
- **Time lines from per-line transcripts**, shifted to where each line starts. Transcribing the whole joined track
  drifted by seconds.
- **Never speed a voice up to fit**: move the pictures, lengthen pauses, or extend the intro (`--intro`).

## Music (ACE-Step)

- **Check the loudness over time** (`ffmpeg … ebur128`): a "steady" request came back with a silent hole at 8-14 s, and
  tracks end a second or more before the length asked for. Ask for 5-10 s more than needed, and ask for "a constant
  groove from the first second to the end, no breaks, no silence".
- **The tempo you ask for is not always what you get** (asked 120, measured 81): run `studio-cli beats`.
- **Trim the start** (`offset`) so the beat grid sits on the cuts, and/or move cuts onto beats (at most ~0.2 s, never the
  voice). A track's quiet build can be skipped so the drop lands on the first big moment.
- The player lowers music under a voice clip by itself (to 35 %); one master at about −14 LUFS suits social.

## Stock footage, music and sounds

- Use only the sources in [stock-media.md](stock-media.md), free for commercial use, and record each file's source,
  licence and any credit in the project notes. A client's reel is commercial use.

## Pictures and layout

- **Vertical reels:** keep words inside the clear area (about 11-78 % down; nothing under Reels' right-hand buttons:
  centred text ≤ 70 % wide). `studio-cli check` reports both.
- **Photos:** match each line to a photo by *looking* at a labelled contact sheet of the exact files you chose; a sheet
  with labels under the images led to a bathroom sink on "the Pacific on the horizon".
- **Footage in a scene must come from an address that allows seeking** (the renderer serves local files itself now);
  a plain Python server froze every video on its first frame.
- **Pinned layers sit above everything**, including the camera's layers: a pinned full-stage background hid a whole
  screencast. Pin only captions and badges.
- **`stills` can show an empty stage** for a large video that has not loaded yet; confirm with a short render.

## Narration captions (reel style)

The look of most product promos: the sentence being said across the top, each word sharpening as it is spoken, the key
words in an accent colour, and the visual for that sentence below. Build it from one text layer per sentence (not a
captions layer):

```json
{ "id": "line3", "type": "text", "text": "It's *free*, and it runs right in your *browser*.",
  "box": { "x": 50, "y": 16, "w": 90 }, "start": 8.35, "end": 12.55,
  "style": { "fontFamily": "Inter", "fontWeight": 800, "fontSize": 7.3, "color": "#1C1E22", "accent": "#00B295" },
  "clips": [{ "id": "l3in", "preset": "text-blur", "start": 8.4, "duration": 3.5,
              "params": { "direction": "in", "by": "words", "rhythm": "spoken", "blur": 1.2 } },
            { "id": "l3out", "preset": "fade", "start": 12.28, "duration": 0.22, "params": { "direction": "out", "blur": 1 } }] }
```

- `style.accent` + `*asterisks*`: the marked words take the accent colour (several words may share one mark).
- `rhythm: "spoken"` matches the layer's words, in order, to the voice clip's transcribed `words`, so each word arrives
  when it is said. Put the clip at the sentence's first word and give it the sentence's length. The layer must sit at
  the top level (not in a group). A word the transcriber misheard keeps its neighbours' pace.
- Get the times from the voice job's `segments` (one per script line), plus the voice clip's `start`.
- Alternate dark and light sections (a full-stage light shape faded in and out) and keep soft glow shapes (ellipses with
  a `radial-gradient(closest-side, colour, transparent)` fill and a slow `drift`) behind everything: that is the
  "premium" background of such promos.
- Keep each caption up about 0.4 s past its last spoken word; `check` warns when a Spoken-rhythm layer leaves too early
  (the last word then never appears). Lay caption times out from the voice's word times, not its line segments.
- Give every layer an `end` once its exit has finished, or `check` reports overlaps with layers that are already gone.

## Effects behind a person

- **Replacing the whole background looks like a bad green screen.** Keep the original footage and put things *behind*
  the cut-out person (words, a few objects): only their edges cross the cut-out, so its flaws barely show.
- **Words behind a person:** place them where the wall is clear (usually above the head) and expect a raised arm or
  object to hide some; mix looks (heavy tilted type 10-18°, sticker tags, a brush script for soft words, small vertical
  lines) and sizes; tilt goes on `box.rotate`, not the layer. Colour the words from the subject (the toys' orange and
  blue), not white on a light wall.
- **Objects:** 3D models fill less of their box than you expect (double the size you first try); shiny gold rings,
  coins and glossy hearts read well; a spinning flat object looks like a slab edge-on.

## Screencasts

- **Files are looked for in the recording's folder too, and a missing one is an error.** A background passed as a bare
  name was looked for in the folder the command ran from, not found, and replaced by a plain purple shape without a word.
- **An AI building on camera:** record the AI Assistant panel with a `waitFor` on `.upw-aip__undo` (`keep: 3`) so the wait
  is cut. Reset the demo site and re-activate `ai-assistant` before each take (the snapshot does not hold it), hide the
  site's branded header (`#masthead`) and the admin bar's site name with `hide` until the reveal, and look at the live
  page closely: a take once showed PHP warnings and dark-on-dark headings that only the full-size frame revealed.
- **A recording that saves changes the site.** After a take that edits and saves a page, put the page back before the next
  take (the second take could not find "Summer is here": the first had saved "Edit right on the page").

- Record at 2x (`record` does), cut the loading, add a visible cursor. Zoom close on phones (2.2-4x in 9:16): admin text
  at 1.5x is unreadable. Frame a wide text field on its left part. Pull back between steps; show the whole screen on page
  changes.
- **End on something worth seeing:** a styled demo site, not a bare theme with an "assign a menu" notice (see
  screencasts.md, "A styled demo site"). Reset it before recording.
- **Keep subtitles off the action.** A bottom subtitle covered the very element being clicked. `screencast --voice`
  places each line's subtitle at the bottom, or at the top when the action at that moment is in the lower part of the view.
- **Fill long silences** (a 15 s stretch with no narration felt dead): add a line, or speed that part up.

## Long videos (over a reel)

- **One scene is at most 600 s** (the format's limit). The renderer covers the whole scene at any frame rate (it used to
  stop at 10,800 frames, which cut a 10-minute scene at 30 fps to 6 minutes without a word); a longer scene is refused
  with a message, never trimmed.
- **Build long videos as chapters:** one scene per part (intro, chapters, outro), same size and fps, rendered one by one
  (only when the person asks), then `studio-cli join 01-intro.mp4 02-….mp4 … --out video.mp4` (`video_join`). Matching
  parts join losslessly in seconds; the chapter list for the YouTube description lands in `video-chapters.txt`. Name the
  files after the chapters (`02-setting-up`) or pass `--titles`.
- **Music for a long scene:** set `"loop": true` on the music clip (role `music`): the file repeats from `offset` to its
  end until `duration`, or to the end of the scene when `duration` is unset. The player, the Studio's browser export and
  the kit renderer (`aloop`) all honour it; one shared rule, `audioClipLength` in the player's `audio.ts`. Add a
  `fadeOut`. Beats and the React-to-music envelope cover the first pass only.
- **Keep a chapter to a few hundred layers.** Measured in the Studio (production build): a 187-layer reel plays at full
  speed, ~1,500 layers at ~26 fps, ~3,000 at ~17 fps. In the player, mounting and the FIRST far seek grow with the
  square of the layer count (GSAP reads computed styles as each tween first renders, and every layer stays in the
  style tree while hidden): ~1.6 s at 750 layers, ~6 s at 1,500, ~23 s at 3,000. Renders are exact at any size.

## Rendering on this machine

- **Start renders as a separate process** (PowerShell `Start-Process … -WindowStyle Hidden`, output to log files) and
  wait with a watcher: renders started from a background shell died silently when the session was interrupted.
- **One heavy job at a time.** A render plus a test plus Voicebox exhausted memory; the self-test timed out while a render
  ran (rerun it after, never push on a timeout).
- Expect about 12-15 minutes per minute of 1080x1920 video with footage; test the look on a 4-10 s cut first.

## Brand

Unyson+'s own videos use the green and white palette and backgrounds recorded in the workspace `CLAUDE.md` ("brand
look"); a client's video uses the client's brand and is never named in Unyson+ material.

## Before sending: checklist

- [ ] Every claim in the narration is what the footage shows (published, not a draft; prices confirmed).
- [ ] `timeline` over every voiced stretch: no red pauses, subtitles on screen while their words are said.
- [ ] If the person wants a second opinion on the voice, offer `video_listen` before the render. Ask first: it uploads the sound to Google (`docs/video-tools.md`)
- [ ] The cut check after the render is OK (`render` runs it on every MP4; `studio-cli cut-check <video> --scene <scene>`):
      every voice line heard, no unintended black, about -14 LUFS, true peak under -1 dBTP.
- [ ] `voice-review` passes on every line (no changed words, no mid-phrase pauses, questions sound like questions); no line sped up.
- [ ] **The voice is in the finished video:** transcribe the rendered MP4's own audio (not the separate line files) and
      compare with the script. A wrong voice-file path once dropped every line silently and only the music shipped.
- [ ] Music covers the whole video, no silent holes, ends after the video (fade out).
- [ ] `studio-cli check`: no errors, no words outside the clear area.
- [ ] Frames looked at across the whole video (not one): framing, words readable on a phone, nothing hidden that matters.
- [ ] Loudness about −14 LUFS; length as asked.
- [ ] Anything uncertain told to the person in plain words.

## Effects on a person (talking head)

Presets for a person on camera, all best on a person cut out of the footage (`/studio/matte`, the cut-out keeps its
see-through background): `ascii` (Code body), `engrave` (banknote engraving; `oval: true` inside the Banknote piece),
`manga` (impact frame with speed lines; slam a word on top), `blow-away` (over a still of the empty room, so the room
stays), `clone-row`, `ring-text` (two copies of the text: `half: "back"` under the cut-out, `half: "front"` over it),
`rack-focus` (on the footage behind the cut-out) and `explode-3d` (on a group of a frame's parts). Pieces: Voice note,
Predict keys, Newspaper front page, Banknote, Day dial. The redrawn looks read the frame's pixels: footage from another
address must allow it (CORS); the kit's own server does. Clip times are in scene time, like every clip. Public page:
`/kinetic-scenes/video-effects#effects-on-a-person`.

## Wide footage in a tall video (reframe)

To use 16:9 footage of a speaker in a 9:16 (or square) video, don't crop it to the middle: the speaker walks out of
frame. In the Studio, the footage layer's **Reframe to follow the face** does it (Footage tools). In a scene file,
the result is plain to write by hand or to adjust:

- the footage layer's `box` is as tall as the frame and wider than it: `{ "x": 50, "y": 50, "w": W, "ratio": A }`
  with `A` the footage's width / height and `W = 100 * A / frame aspect` (16:9 in 9:16 → `W ≈ 316`, `ratio 1.778`);
- a `keyframes` clip over the layer's length slides it: each key's `x` is a % of the layer's own width, `50 - face x`
  (face x in % of the footage) to centre the face, kept within `±(W - 100) / 2 / W * 100` so no edge shows
  (`±34.2` for 16:9 in 9:16). Use few keys with `"ease": "sine.inOut"` and hold still for small movements: a frame
  that chases every head nod looks machine-made.
- The face path is on the layer as `track` (file seconds; centre and size as fractions of the frame) once the
  Studio's **Follow the face** has found it: read it to place the keys.

## One scene, many videos (a spreadsheet)

For a video per product, listing or person: write `{{column}}` placeholders in the scene's text and media addresses
(names ignore case and spaces), and a CSV with a column per placeholder, one row per video. A picture column may hold an
address or a file name next to the CSV.

```
studio-cli batch scene.json --data rows.csv --check                 # placeholders, columns, what is missing
studio-cli batch scene.json --data rows.csv --name Product          # one MP4 per row into videos/ beside the CSV
```

MCP: `scene_batch { scene_path, data, render?, rows?, name?, out? }`; it only checks unless `render: true`. Render only
when the person asks for the videos: until then, check and hand over the scene; the person previews every row in the
Studio (Tools › Videos from a spreadsheet). Preview the row with the longest text: it is the one that wraps.

## Cut-out methods

`/studio/matte` takes `quality`: `fine` (the default: MODNet fine edges plus a body model, in the browser or on the
graphics card), `fast` (the body model alone, for drafts) or `rvm` (Robust Video Matting in Node: one model with
memory of the frames before, steady edges, about 18 s for 10 s of footage on a graphics card). `rvm` needs ONNX
Runtime for Node, which the separation add-on installs, and downloads a 15 MB GPL-3.0 model on first use: say so before
choosing it for the person. `GET /studio/matte/methods` says which are ready. For people who move a lot or long clips,
`rvm`; for hair against a busy background, compare `fine` and `rvm` on one moment before cutting out the whole clip.
`quality: "hold"` with `points: [{ x, y }, …]` (fractions of the file's FIRST frame; the first is the person, the
rest what they hold, up to 6) follows each object with SAM 2.1 tiny (Apache-2.0, ~155 MB, downloaded on first use)
and keeps RVM's edges for the person: for product demos. Every clicked object must be visible in the first frame;
the slowest method (about 100 s for 6 s on a graphics card).

## A reel from a long video (highlights)

`studio-cli highlights <video> --length 30 --format 9x16 [--music <file>] [--no-titles] --out reel.json` (MCP
`video_highlights`) scores every second (sharp, steady, well lit, and spoken when speech recognition is installed),
finds the cuts (a part never crosses one), takes the best stretches spread over the video, in order, a whole number of
beats long with music, and writes a scene: each part a footage clip with a hard cut and a slow push-in, a title from
the first words said. It judges looks and speech, not meaning: read the part names (they say where each came from and
why), swap any part that misses the point, rewrite the titles (they break mid-sentence when the transcript has little
punctuation), and turn titles off for footage that already has words on screen. Then hand over for preview.

## Motion blur

`studio-cli render … --blur [n]` (MCP `scene_render { blur: n }`) blends n sub-frames (default 8) over half of each
frame (a 180-degree shutter) so fast moves smear like filmed motion. Use it for scenes with whip pans, slams or
objects flying in; skip it for calm type, where it only costs time (the render takes about twice as long or more).

## Handing the edit to another editor

`studio-cli edit-export scene.json [--out dir] [--graphics alpha.mov]` (MCP `scene_interchange`) writes
`project.fcpxml` (Resolve, Final Cut), `project.xml` (Premiere), `captions.srt` and a README: footage and sound
clips each on a track with in/out points and volume; the graphics as one clip on top when a see-through render exists
(render `--transparent --format mov` first, only when the person asks for it). Media paths stay absolute.

## Make one like this

When the person gives a video they like, run `studio-cli like-this video.mp4 --seconds <n>` (MCP `video_like_this`):
it returns a brief (structure, pacing, text, cuts and motion, look, music suggested by the pacing) and the rhythm
fitted to the new length. Build THEIR scene to it: their words, brand and media; never the reference's wording, names,
logos, people or footage. Put a cut, reveal or new line on each listed moment, then check and hand over for preview.

## Music composed to the scene

`studio-cli compose scene.json --mood bright|calm|dark|driving --out score.wav` (MCP `scene_compose`) writes a short
score in about a second with no add-on: tempo from when things land, a chord change per section (markers, else groups),
accents on big landings, a lift into the still frame. Use it for short reels and explainers when no library track
fits; for Unyson+'s own reels, the brand music library still comes first.

## 3D objects from a description

`studio-cli object3d "<description>" --out object.glb` (MCP `object_from_description`) designs the object from
simple parts, measures it (parts touch, none buried, none paper-thin, stands on the ground), fixes it up to three
times and looks at it from four sides. Put the GLB in a model layer (`model: { kind: "gltf", src }`,
`material.original: true`). Good for products, icons and props; not for organic shapes.

