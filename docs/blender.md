# Blender: models and shots for Kinetic Scenes

`studio-blender.mjs` runs Blender in the background on an agent's bpy script and turns the result into a scene layer.
No window, no add-on, no server to start. (The official Blender connector is the tool for live, hands-on Blender work;
this is the pipeline into Kinetic Scenes.)

| CLI | MCP tool | Output |
|---|---|---|
| `blender model <script.py> [--out x.glb] [--project p] [--name]` | `blender_model` (`script` or `script_path`, `out`, `project`, `name`) | GLB, a `model` layer (`kind: gltf`), stats, a 4-view preview PNG (returned to the agent as an image) |
| `blender render <script.py> [--seconds 4 --fps 30 --width 1080 --height 1080] [--out x.webm] [--project p]` | `blender_render` (same plus `seconds`, `fps`, `width`, `height`) | transparent WebM (VP9, alpha), a `video` layer, a preview of 4 frames |

## Finding Blender

`BLENDER` env, then the newest `Blender Foundation/Blender */blender.exe` (Windows), `/Applications/Blender*.app` (macOS),
`/opt` or `/usr/local` (Linux), then `blender` on the PATH. Blender 4.2+ (Eevee Next). Runs
`blender -b --factory-startup --python-exit-code 4 --python <wrapper>`.

## The wrapper

1. Deletes every object of the factory scene.
2. Defines `REPORT = {}` and `hex_color('#RRGGBB', alpha=1)` (sRGB hex to linear RGBA).
3. `exec`s the agent's script from a string (indentation-safe). A Python exception prints `UPW_SCRIPT_ERROR` with the
   traceback's last 3,000 characters; the tool throws it, so the agent sees the line and the error.
4. **Model:** gathers mesh-like objects (mesh, curve, surface, metaball, text) and empties; fails if there is no mesh.
   Parents the top-level ones to an empty "Model" that centres the evaluated world bounds and scales the largest side to 2.
   Counts evaluated triangles. Exports GLB (`export_apply`, `export_yup`, no cameras or lights, animations kept).
   Renders 4 views at 512 px (front 0°/12°, three-quarter 40°/22°, side 90°/10°, above 200°/48°, distance 4.3) with
   Eevee, a transparent film, Standard view transform, world strength 0.3, and a 3-light area rig (key 500, fill 150,
   rim 350) unless the script added lights. Warnings: more than 150,000 triangles, more than 6 MB.
5. **Render:** fps and frames (seconds x fps from frame 1, unless the script sets `REPORT['keep_frames'] = True` and its
   own range); Eevee, transparent film, Standard view; adds a camera framing the bounds (2.2 x size back, 0.6 x up) if
   there is none, a world at 0.3, the light rig. PNG frames go to ffmpeg:
   `libvpx-vp9 -pix_fmt yuva420p -crf 30 -b:v 0` (alpha kept; ffprobe shows `alpha_mode=1`).

Previews are 2-column contact sheets on #3a3f47, 480 px per tile.

## Project option

`project` puts the file in the workspace project's `media/` (`addMedia`) and returns `media/<file>`; a project that
doesn't exist is created with an empty 16:9 scene. Without it, the absolute path is returned.

## Writing good scripts

- Build in an empty scene; no camera or lights for a model; don't save or export.
- Principled BSDF materials (`Base Color` via `hex_color`, `Metallic`, `Roughness`); `shade_smooth()`; bevel modifiers
  make product edges read; keep the triangle count web-sized.
- Look at the four views; fix anything that reads wrong (floating parts, inside-out normals, wrong proportions).
- Animation inside a GLB plays on the scene's clock (player 0.0.51+): keyframe objects in the bpy script, export with animations, and the model layer plays them (`animation: { clip?, speed?, loop? }`).

Tested 2026-10-28 with Blender 4.2.3: a lamp (3 objects, 1,904 triangles, 115 KB) plays in a model layer with
`orbit-3d`; a 2 s bouncing-balls shot renders in 14 s and overlays a scene with true transparency.

Public page: docs.unysonplus.com/kinetic-scenes/blender. Roadmap: Phase 6, `p6-blender`.
