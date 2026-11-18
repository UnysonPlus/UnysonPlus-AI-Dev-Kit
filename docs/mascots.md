# Mascots that talk (for agents)

A **mascot** is a Kinetic Scenes layer (`type: "mascot"`): a character that talks on the voice-over, blinks, breathes and
changes pose. The person makes it in the Studio (**Insert › Mascot…**: from one picture, a picture per pose, or six poses
drawn by their own image AI; or the sample, **Pip**). You use it: copy it into a video, give it lines, and direct its
poses. Public docs: https://docs.unysonplus.com/kinetic-scenes/mascots

## Tools

| Tool | What it does |
|---|---|
| `mascot_list` | Every mascot in the workspace projects: project, layer id, name, poses (and whether each talks and blinks), drawn mouths, main pose. |
| `mascot_copy` | Copies a mascot and its pictures into another project (`from`, `layer`, `to`, optional `x`, `y`, `height` in % of the stage). Its old Pose clips stay behind. |
| `mascot_direct` | Pins poses to words of the voice-over: `cues: [{ pose, word, index?, hold? }]` (pose by id or name; `word` a word or phrase the voice says; `index` which time it is said, 1 = first; `hold` seconds, default 1.6). Replaces its earlier Pose clips unless `replace: false`. |

## The order that works

1. `mascot_list`. No mascot? Ask the person to make one in the Studio (Insert › Mascot…), or to try Pip. Do not invent
   one: a mascot is their character, and its face boxes are set by looking at the pictures.
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
