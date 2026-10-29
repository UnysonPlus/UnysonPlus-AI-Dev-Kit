# Reference rhythm: pace a scene like a reel that works

`studio-reference.mjs` reads the timing of a finished video and puts it on a scene as markers. Use it whenever a reel is
made "like" another one, or when the client's own best reel shows the pace their audience responds to. Only timing is
taken; never reuse the reference's footage, design or words.

| CLI | MCP tool | Output |
|---|---|---|
| `reference <video> [--scene s.json] [--sections-only] [--fit <s>] [--threshold 0.2] [--no-sheet] [--json]` | `video_reference` (`file`, `scene_path`, `sections_only`, `threshold`, `out`) | `<video>.reference.json`, `<video>.reference.jpg`, markers `r1…` on the scene |

## What it measures

- **Cuts:** FFmpeg scene detection (`findCuts` from `studio-highlights.mjs`, threshold 0.2 by default), trimmed 0.15 s
  from each end; cuts closer than 0.25 s merge into one.
- **Motion peaks:** grey 64×36 frames at 10 fps, mean absolute difference between neighbours, smoothed (0.25/0.5/0.25).
  A peak counts when it is a local maximum above `max(median × 2.2, median + 4)`, 0.2 s inside the ends, at least 0.5 s
  from the previous peak (the stronger wins). Strength is normalised 0–1. Motion graphics often have few or no cuts
  (one test reel had 0 cuts and 20 peaks), so the peaks are what make the reading useful.
- **Moments:** cuts plus peaks not within 0.35 s of a cut, sorted. `kind` is `cut` or `motion`.
- **Stats:** `moments`, `cuts`, `shots`, `beatEvery` (duration ÷ (moments + 1)), `beatMedian`, `shortestBeat`,
  `longestBeat`, `momentsPer10s`, `shotAverage`, `shotMedian`.
- **Pace:** per 5 s window, moments and cuts. The summary calls the pace very fast / fast / steady / slow at
  < 1.2 / < 2 / < 3.5 s per beat, and the shape "opens faster", "starts calm and speeds up" or "keeps an even pace"
  by comparing the first window with the average of the rest (× 1.4).
- **Sections:** `round(duration / 4.5)` clamped to 3–8; each boundary snaps to the moment nearest the even split within
  45 % of a section, at least 1 s from the previous boundary and the end. Names: `hook`, `beat N`, `ending`.
- **Contact sheet:** the middle frame of each shot (every k-th past 40), numbered, tiled 8 wide for vertical video and
  5 wide otherwise.

## API

```js
import { analyseReference, fitRhythm, rhythmMarkers, planSections } from './studio-reference.mjs';
const map = await analyseReference('reel.mp4', { threshold: 0.2, sheet: 'reel.reference.jpg', onStep });
const fitted = fitRhythm(map, 20);              // every time scaled to 20 s (fittedFrom keeps the original length)
const scene2 = rhythmMarkers(scene, map, { sectionsOnly: false }); // r-markers fitted to scene.duration
```

`rhythmMarkers` replaces earlier `r\d+` markers and keeps all others; labels are the section name at a section start,
otherwise `beat N`.

## Workflow for an outreach or client reel

1. `video_reference` on the reference (the reel to learn from) **before** writing the scene. Look at the contact sheet.
2. Write the scene to the reference's length or your own; call `video_reference` again with `scene_path` to add the markers.
3. Start each part on a marker; let the hook follow the reference's opening pace and hold the closing frame.
4. `scene_check` and `scene_stills` as always; no render until the person asks.

Public page: docs.unysonplus.com/kinetic-scenes/reference-rhythm. Roadmap: Phase 23, `p23-reference-analysis`.
