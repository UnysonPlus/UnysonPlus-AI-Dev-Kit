# Web export: a Kinetic Scenes project made light for a live page

`studio-webexport.mjs` · CLI `web-export` · MCP `scene_web_export` · kit route `POST /studio/web-export` · Studio
**Export › For a web page**. Public page: https://docs.unysonplus.com/kinetic-scenes/web-export

Use it whenever a scene is going on a site **live** (the Unyson+ Kinetic Scene element `studio_scene`, the embed code, a
hosted page) and has photos, footage or audio. A project's media is sized for editing and rendering; the web copy is
cut to what the scene uses. Reference result: a 46.8 s 16:9 promo (5 phone videos, 13 photos, music, 10 voice lines)
went from 22.9 MB to 3.8 MB in about 20 s; its rendered MP4 is 5.9 MB.

## Run it

```bash
node studio-cli.mjs web-export "<project name | scene.json>" [--base <url of the output folder>] [--out <folder>] [--dpr 2] [--no-measure] [--json]
```

MCP: `scene_web_export { project | file, base?, out?, dpr? }`. Needs FFmpeg (`studio-cli ffmpeg install`) and Chrome
(the kit's Playwright channel, as for renders).

Output (default `<project>/web/`, replaced each run; the project itself is never changed):

| File | What it is |
|---|---|
| `scene.json` | The scene with media addresses rewritten: `media/<file>` relative, or `<base>media/<file>` with `--base`. Video and audio `offset`s are shifted to match the trims. |
| `media/` | The light files. |
| `report.json` | `{ before, after, measured, sizes, files: [{ src, out, before, after, did, uses }] }` |
| `README.txt` | How to put it on a site. |

## What it does

1. **Measures** (unless `--no-measure`): loads the scene in Chrome through `pageHtml` with every image/video `src`
   replaced by a 1-pixel GIF (only boxes matter), at each layout's full HD size (16:9 → 1920×1080, 9:16 → 1080×1920; a
   half-size viewport, doubled back), seeks every `max(0.25, duration/400)` s and records the largest
   `getBoundingClientRect()` of each layer's `img`/`video` while it is shown. Camera keys, zoom/drift presets, groups and
   media frames are all included because it is the real player. On failure (offline: the player loads from
   kinetic-scenes.unysonplus.com) it falls back to the box × 1.25 and reports `measured: false`.
2. **Pictures** (jpg/png/webp/avif/bmp/tiff): needed source width = the file's width as drawn (cover: the larger of the
   two axis scales; contain: the smaller), × `dpr` up to the stage's long side, never above the original. Encoded to WebP
   (quality 0.8) **by Chrome** (`createImageBitmap` resize + `OffscreenCanvas.convertToBlob`), so ICC profiles, EXIF
   rotation and alpha match what browsers show. FFmpeg's libwebp is only the fallback: it ignores ICC profiles, and an
   Adobe RGB photo came out visibly washed out. A result bigger than the original keeps the original. GIF and SVG are
   copied.
3. **Videos**: one file per source covering every layer that uses it: `[min offset, max(offset + (end − start) × rate) +
   0.5 s]`, clamped to the file. Scaled to the needed width (even), `-an`, libx264 CRF 26 preset slow, yuv420p,
   `+faststart`, fps capped at 30. Layer offsets −= the trim start.
4. **Audio**: per source, the union of `[offset, offset + duration + 0.1]` over its clips (a clip without `duration`
   runs to the file end; any `loop` keeps the whole file). Voice-only sources (every clip `role: "voice"`) → MP3 mono 64
   kbps; others → MP3 128 kbps. Clip offsets shift. Fades/volumes are untouched (the player applies them).
5. **Anything else** named `media/…` in the scene (models, Lottie, picture fills) is copied unchanged. `data:`,
   `https:` and `sfx:` sources are left as they are.

## Putting it in WordPress

The `studio_scene` element takes the scene JSON only, so media addresses must be absolute. Pick the folder under
`wp-content/uploads/unysonplus/scenes/<name>/` (the uploads convention), run with `--base` set to its URL, upload
`web/media` there, verify one URL answers 200, paste `web/scene.json` into the element's Scene box. Re-run after any
change to the project or a site move.

## Limits

- Media still loads when the page opens (the player creates every `img`/`video` up front, `preload="auto"`). Loading
  near the playhead is planned (a player version + the element).
- Footage is muted in the live player, so its sound track is always dropped; sound that matters belongs on an audio clip.
- One run measures at full HD; a scene shown far bigger than 1920 px wide gets soft pictures (raise `--dpr`).
