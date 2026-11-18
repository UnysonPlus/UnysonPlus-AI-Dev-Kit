# Mascots that talk (for agents)

A **mascot** is a Kinetic Scenes layer (`type: "mascot"`): a character that talks on the voice-over, blinks, breathes and
changes pose. The person makes it in the Studio (**Insert › Mascot…**: from one picture, a picture per pose, or six poses
drawn by their own image AI), or uses one of the ten **sample mascots** that come with the Studio. You use it: copy it
into a video, give it lines, and direct its poses. Public docs: https://docs.unysonplus.com/kinetic-scenes/mascots

## Tools

| Tool | What it does |
|---|---|
| `mascot_list` | Every mascot in the workspace projects (project, layer id, name, poses and whether each talks and blinks, drawn mouths, main pose), then the ten samples. |
| `mascot_copy` | Copies a mascot and its pictures into another project (`from`, `layer`, `to`, optional `x`, `y`, `height` in % of the stage). A sample: `from: "sample"`, `layer` = its name (`"Grace"`); its pictures stay on the Studio's site, by full address. Its old Pose clips stay behind. |
| `mascot_direct` | Pins poses to words of the voice-over: `cues: [{ pose, word, index?, hold? }]` (pose by id or name; `word` a word or phrase the voice says; `index` which time it is said, 1 = first; `hold` seconds, default 1.6). Replaces its earlier Pose clips unless `replace: false`. |

## The order that works

1. `mascot_list`. Use the person's own mascot when they have one (it is their brand). Otherwise pick the sample that suits
   the video, or the one they name, and say which you chose. Do not draw a new one yourself: a mascot's face boxes are
   set by looking at the pictures, and the person makes their own in the Studio (Insert › Mascot…).
2. Make the video's project (`project_save`), then the voice-over (`voice_over`, which gives the words with their timing).
3. `mascot_copy` the mascot into it, beside where the words go (e.g. `x: 25` with the text on the right).
4. `mascot_direct` with a few cues: a wave on the greeting, explaining on the first point, thinking on a question, thumbs up
   or cheer on the promise or the call to action. **3 to 6 cues in a minute**: a pose on every sentence looks restless.
5. `scene_check` and `scene_stills` at the cue times: the pose arrives on its word, the mouth is open mid-word.

## What happens by itself (do not animate it)

- **The mouth** opens and closes on the voice's words, shaped by the sounds (wide on "a", round on "o", shut on "m",
  "b", "p"). With the voice's measured loudness (`levels` on its audio clip, which the Studio adds when a mascot goes in),
  it also shuts in the pauses. With drawn mouths (`mouths`), each sound shows its drawn shape.
- **Blinks** every few seconds, **breathes** a little. Turn off with `blink: false` / `breathe: false`.
- **Between Pose clips** it goes back to its main pose (`pose`, else the first).

Add entrances and exits like any layer (a pop or a slide in, a fade out). Do not put other motion presets on it while it
talks (a wobble or a spin fights the talking).

## The sample mascots

All ten have the same six poses (`idle`, `explaining`, `wave`, `thinking`, `thumbs-up`, `cheer`) and nine drawn mouths,
so cues written for one work for any.

| Name | Group | Suits |
|---|---|---|
| Daniel | people | A businessman in a suit: finance, law, consulting, B2B |
| Grace | people | A businesswoman in a blazer: the same, a female host |
| Leo | people | A man in a casual sweater: coaches, creators, small shops |
| Maya | people | A woman in a cardigan: the same, a female host |
| Rosa | people | A chef: restaurants, bakeries, catering |
| Pip | characters | A round, friendly character: anything friendly |
| Bolt | characters | A robot (screen face): apps, software, tech |
| Miso | characters | A purple cat: shops, cafés, kids |
| Drip | characters | A blue water drop: cleaning, plumbing, health |
| Hoot | characters | An owl in a graduation cap (talks with his beak): courses, schools, tutoring |

Match the voice to the mascot (a male voice for Daniel, Leo and Bolt, a female one for Grace, Maya and Rosa; any for the
others, unless the person says otherwise). The list lives at `https://kinetic-scenes.unysonplus.com/mascots/samples.json`.

## Change the mascot's style

Three presets restyle a mascot layer while it talks, with no new pictures (player 0.0.71+). Put the clip on the mascot
layer itself, over the words it belongs to; the mascot keeps talking, blinking and changing pose inside it.

| Preset | Look | Params worth setting |
|---|---|---|
| `silhouette` | One flat ink, the outline kept; the eyes and the whole mouth stay light | `ink`, `keep` (false for scenery), `light`, `level` (0.9: what counts as light) |
| `line-drawing` | Only the outlines, in one colour (white on a dark blue stage = a blueprint) | `color`, `fill` (empty = see-through), `weight` (0.18), `detail` (0.8) |
| `pixel-art` | Square pixels that stay for the clip (`pixelate` only resolves in or out) | `size` (0.7, in % of the stage width), `colors` (0 = all; 4-6 = a short palette) |

All three take `fade` (seconds to blend in and out, default 0.25; 0 = at once) and `hold` (true = stay to the end of
the layer). For several styles in a row, overlap the clips by about 0.25 s so one blends into the next, and change the
background under the mascot at the same moment (a sunset gradient and a pale sun for the silhouette, a blue grid for
the blueprint). `low-poly` (flat triangles) works on image and video layers only, not on a mascot.

```json
{ "id": "k1", "preset": "silhouette",   "start": 6.2,  "duration": 3.15, "params": { "fade": 0.25 } },
{ "id": "k2", "preset": "line-drawing", "start": 9.1,  "duration": 2.85, "params": { "color": "#ffffff", "weight": 0.2 } },
{ "id": "k3", "preset": "pixel-art",    "start": 11.7, "duration": 2.65, "params": { "size": 0.8 } }
```

The same presets work on any other layer (a logo, a picture, a group). The public page:
https://docs.unysonplus.com/kinetic-scenes/restyle-effects

## The format

```json
{ "id": "pip", "type": "mascot", "name": "Pip", "alt": "Pip, the mascot",
  "box": { "x": 25, "y": 58, "w": 26, "h": 74 },
  "poses": [{ "id": "idle", "name": "Idle", "src": "media/pip-idle.png", "ratio": 0.8333,
              "mouth": { "x": 0.43, "y": 0.525, "w": 0.14, "h": 0.08 },
              "eyes": [{ "x": 0.35, "y": 0.375, "w": 0.12, "h": 0.117 }, { "x": 0.53, "y": 0.375, "w": 0.12, "h": 0.117 }] }],
  "mouths": { "rest": "media/mouth-rest.png", "a": "media/mouth-a.png" },
  "clips": [{ "id": "pip-pose-1", "preset": "mascot-pose", "start": 2.76, "duration": 1.6, "params": { "pose": "wave" },
              "at": { "audio": "vo", "text": "June", "index": 13, "offset": -0.08 } }] }
```

Face boxes are fractions (0-1) of each pose picture. `mouths` shapes: rest, a, e, o, u, mbp, fv, l, etc. Voice clips may
carry `levels` (50 a second, one character 0-9a-z each). Full reference: the skill's `reference/scene-format.md`.

## Limits

- The mouth is the pose's own mouth opened (or the drawn mouths): it looks best when the mouth is closed in every pose.
- Pose pictures from an image AI vary; never redraw or edit the person's pictures yourself.
- A mascot on a WordPress page needs the Kinetic Scene element with player 0.0.70 or newer.
