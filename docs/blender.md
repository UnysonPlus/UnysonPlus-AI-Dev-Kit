# Blender: models and shots for Kinetic Scenes

`studio-blender.mjs` runs Blender in the background on an agent's bpy script and turns the result into a scene layer.
No window, no add-on, no server to start. (The official Blender connector is the tool for live, hands-on Blender work;
this is the pipeline into Kinetic Scenes.)

| CLI | MCP tool | Output |
|---|---|---|
| `blender model <script.py> [--out x.glb] [--project p] [--name]` | `blender_model` (`script` or `script_path`, `out`, `project`, `name`) | GLB, a `model` layer (`kind: gltf`), stats, a 4-view preview PNG (returned to the agent as an image) |
| `blender render <script.py> [--seconds 4 --fps 30 --width 1080 --height 1080] [--out x.webm] [--project p]` | `blender_render` (same plus `seconds`, `fps`, `width`, `height`) | transparent WebM (VP9, alpha), a `video` layer, a preview of 4 frames |
| `blender import <file> [--objects "A,B"] [--out x.glb] [--project p] [--name]` | `blender_import` (`file`, `objects`, `out`, `project`, `name`) | the same as `blender_model`, from a `.blend` or a GLB, glTF, FBX, OBJ, STL, PLY or USD file |
| `blender still <scene.json> --layer <id> [--project p] [--samples 96]` | `blender_still` (`scene_path`, `layer_id`, `project`, `samples`) | a path-traced still of a 3D layer at the scene's still frame (transparent WebP), saved on the layer as `still` / `stillAt` |

## Finding Blender

`BLENDER` env, then the newest 4.x (else the newest) `Blender Foundation/Blender */blender.exe` (Windows), `/Applications/Blender*.app` (macOS),
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

## Path-traced stills

`studio-still.mjs` (`pathTracedStill`, endpoint `POST /studio/still`, MCP `blender_still`, CLI `blender still`): a glTF
3D layer rendered in Cycles at the scene's still frame (`playback.posterTime`), lined up with the live layer.

1. The scene opens in the kit's player (`pageHtml`, the first breakpoint at 1,920 px); at the still frame it reads the
   layer's 3D state (`P.modelState(id)`, player 0.0.75+) and the size of its box.
2. `blenderStill` imports the GLB and rebuilds the player's transform chain in Blender (normalise: largest side 1,
   centred; the resting pose; the 3D state, three.js Euler order YXZ), converting three.js's y-up axes to Blender's
   z-up (`C = (x, -z, y)`). The camera is the player's: 22° vertical lens, the same fitting distance (the posed object's
   half extents measured as three's `Box3.setFromObject`, 80% of the box, the 35% canvas bleed), the orbit, tilt and
   dolly. Lights: a soft grey world plus key, fill and rim area lights, Standard view transform.
3. Cycles on the graphics card (OptiX, CUDA, HIP, Metal or oneAPI; the processor otherwise), denoised, 96 samples, a
   transparent film the size of the layer's 3D canvas (twice its on-screen size, no side over 1,600 px), then WebP with
   alpha through ffmpeg (about 20-100 KB).
4. The layer gets `still` (a data: URL, or `media/<layer>-still.webp` with a project; beside the scene file from the
   CLI / MCP without one) and `stillAt`.

The player shows `still` instead of the live 3D when stills are on (`P.showStills(true)`, which the cover image step of
a video export and the Studio's Chrome export call) and for reduced motion. Tested: the live layer and the still at
the same moment match in outline and position (a mug on a coaster with a resting pose and an orbit); 10-40 s on a
GTX 1660 Ti. glTF only (3D text, shapes, logos and devices are built by the player).

## Working in a live Blender window

For hands-on work (the person watches the model take shape in an open Blender and adjusts it), use **Blender's own MCP
connector** (`projects.blender.org/lab/blender_mcp`, GPL-3.0; an add-on inside Blender plus a small server the AI client
starts; tools such as `execute_blender_code`, `get_screenshot_of_window_as_image`, `render_viewport_to_path`,
`search_api_docs`). The person installs it; the kit does not bundle it. The hand-off into a scene:

1. In the live session, save the file: `bpy.ops.wm.save_as_mainfile(filepath="…/lamp.blend")` (or export a GLB).
2. `blender_import` with that path (and `objects` to take only some, e.g. `["Lamp"]`). The kit opens it in a background
   Blender (the live window is untouched), leaves out objects hidden from render, cameras and lights, runs the model
   checks, exports the web GLB with four views and returns the 3D layer (into the project's `media/` with `project`).
3. Fix what the checks report in the live session, save, import again.

For an animated shot made live, render it with `blender_render` from a script, or render it in the live session to a
video and bring that in as footage.

`blender_import` also takes models from other tools and sites (GLB, glTF, FBX, OBJ, STL, PLY, USD): the same checks
apply. On import, the check welds duplicate vertices first (glTF splits them along seams, which would otherwise count
as holes), and skips the bevel note (an imported mesh has its bevels baked in). Tested with a saved .blend (a mug with
a hidden floor, a camera and a light: the mug and handle only), the same file with `--objects Handle`, and a GLB.

## Project option

`project` puts the file in the workspace project's `media/` (`addMedia`) and returns `media/<file>`; a project that
doesn't exist is created with an empty 16:9 scene. Without it, the absolute path is returned.

## Making good models (the checklist)

The model ends up as a GLB in a web 3D layer, lit by the player's studio light and turned by presets. Work in passes and
run the tool after the first one: a blockout that reads wrong is cheaper to fix than a detailed one.

1. **Real proportions.** Build at real size in metres (a mug 0.095 m tall, a phone 0.15, a chair seat 0.45, a door 2.05):
   the kit normalises the size, but proportions come from real measurements, not guesses.
2. **Silhouette first.** Primary forms (the body), then secondary ones (handles, buttons, panels), then edge detail. Run
   the tool after the primary pass and check the silhouette in all four views before adding detail.
3. **Modifier order:** Mirror, Array, Solidify, Boolean (exact solver; apply scale on both objects first), Bevel,
   Weighted Normal, Subdivision (only on topology that supports it, level 1-2). The kit applies the stack at export.
4. **Bevel every hard edge that would catch light.** A product with no bevels reads as computer-made. Bevel width about
   1% of the object's size for the main edges and 0.2-0.5% for panel lines, 2-3 segments, `limit_method = 'ANGLE'`
   (30°), and a Weighted Normal modifier (keep sharp) after it.
5. **Shading:** `shade_smooth()` for curved parts; for hard surfaces smooth by angle at 30-40°
   (`bpy.ops.object.shade_smooth_by_angle(angle=0.6)` in Blender 4.1+). Flat shading only for a low-poly look.
6. **Clean geometry:** merge by distance (0.0001), delete loose vertices and inside faces, recalculate normals outside.
   Closed parts stay closed: on the web faces are one-sided, so a hole shows an empty inside. A thin sheet gets Solidify.
   A hollow vessel (a mug, a bowl): delete the top face, then Solidify.
7. **Materials the web can carry.** The GLB keeps a Principled BSDF's plain values: Base Color, Metallic, Roughness,
   Alpha, Emission, Transmission, Clearcoat, Sheen, IOR, and image textures (with UVs). **Procedural textures (Noise,
   Voronoi, Wave, Brick, Checker, Color Ramp, Bevel and AO nodes) are dropped**: the web gets the plain value. Make
   variation with separate parts or material slots, vertex colours, or an image texture. Starting values:

   | Surface | Metallic | Roughness | Notes |
   |---|---|---|---|
   | Polished metal, chrome | 1 | 0.05-0.25 | |
   | Brushed metal, aluminium | 1 | 0.35-0.55 | |
   | Painted metal, plastic | 0 | 0.3-0.55 | the paint is the Base Color |
   | Glossy ceramic, lacquer | 0 | 0.1-0.25 | add Clearcoat for a deep shine |
   | Rubber, matte plastic | 0 | 0.7-0.9 | |
   | Wood | 0 | 0.5-0.7 | |
   | Fabric | 0 | 0.75-0.95 | Sheen 0.3-0.5 |
   | Glass | 0 | 0-0.05 | Transmission 1, IOR 1.45-1.5 |

   Avoid pure black and pure white base colours (they read flat): about `#111` and `#f2f2f2`. Neighbouring parts should
   differ in brightness, not only hue, so the object reads in greyscale. One or two materials for a simple prop, three to
   five for a hero object; name them `MAT_<surface>`.
8. **Web budget.** Under 100,000 triangles (the kit warns above 150,000); a product is usually 2,000-20,000. Bevel 2-3
   segments, not 8; Subdivision 1-2; textures 1,024 px or less; Decimate (planar for flat parts, collapse for organic
   ones) when it is heavy, then check the silhouette again.
9. **Look, then fix one thing at a time.** In the four views check: the silhouette reads from each angle, edges catch the
   light, nothing floats or pokes through, parts touch where they should, nothing flickers where two faces overlap, no
   dark inside-out patches, the proportions are right. Change one thing (shape, material or bevel) per run; three to
   five runs is normal.
10. **Animation** for a model: keyframe the objects (30 fps); for a loop, make the last key equal the first and set the
    F-curves cyclic. It plays on the scene's clock (player 0.0.51+) through `animation: { clip?, speed?, loop? }`.

Build in an empty scene; no camera or lights for a model; don't save or export (the kit does).

## The model checks

After export the kit checks the model and adds what it finds to the tool's warnings, next to the four views:

- **open edges** on a part with depth (a hole: its inside is invisible on the web);
- **inside-out parts** (a closed part whose normals point inwards: dark or see-through);
- **loose vertices** and **faces with no area**;
- **parts with no material** (plain white);
- **procedural texture nodes** in a material (dropped from the GLB);
- notes: **no Bevel modifier** on any part, **every face flat-shaded**.

Fix them in the script and run it again. Checked on a deliberately broken model (a box with a missing face, an inside-out
sphere with no material, a noise texture, nothing bevelled or smoothed: every check fired) and a clean bevelled mug (no
warnings), on Blender 4.2 and 5.3.

## Blender versions

The kit prefers the newest **4.x** when several Blender versions are installed: Blender 5's Eevee renders about three
times slower in the background (measured on a GTX 1660 Ti: 3.5 s a frame against 1.3 s on 4.2). Set `BLENDER` to use
a particular one. Both work: the kit picks Eevee's name for the version (`BLENDER_EEVEE_NEXT` in 4.2-4.x,
`BLENDER_EEVEE` from 5.0).

More Blender know-how: the open, MIT-licensed blender-skills pack (github.com/arjun988/blender-skills) has 94 skills
for live Blender work; it is an optional extra, not part of the kit.

Tested 2026-10-28 with Blender 4.2.3: a lamp (3 objects, 1,904 triangles, 115 KB) plays in a model layer with
`orbit-3d`; a 2 s bouncing-balls shot renders in 14 s and overlays a scene with true transparency.

Public page: docs.unysonplus.com/kinetic-scenes/blender. Roadmap: Phase 6, `p6-blender`.
