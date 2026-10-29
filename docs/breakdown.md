# Breakdown: "how this reel was made"

`studio-breakdown.mjs` builds a 16:9 scene with a finished reel (a video layer) beside its storyboard. One card per step
shows its number, kind, words and start time. A highlight moves to the step on screen, and a progress bar fills under
the cards. Use it for pitches and process videos.

| CLI | MCP tool | Output |
|---|---|---|
| `breakdown <reel.mp4> [--scene s.json] [--beats b.json] [--rhythm r.reference.json] [--title] [--accent] [--out]` | `scene_breakdown` (`video`, `scene_path`, `beats_path`, `rhythm_path`, `title`, `accent`, `out`) | `<reel>.breakdown.json` (markers `s1…`), then Check scene |

**It needs the reel as a video file** (the player has no scene-in-scene layer). When there is none, say so and ask
before rendering; never render unasked.

## Steps (`breakdownSteps`)

1. A beats document **and** a scene with `b1…` markers (from `scene_from_beats`): kind and words (`text · sub`, else
   items or lines) per beat, at its marker.
2. Otherwise the scene's markers in time order (a step "opening" at 0 is added when the first marker is later than
   0.3 s). The kind is the marker label without a leading number; the words are the first text layer (not "Credit")
   that starts inside that step.
3. Otherwise a reference map's sections, scaled to the video's length.

Steps past `duration − 0.2` are dropped, more than 8 are thinned evenly, and the first starts at 0.

## Layout (16:9 stage, sizes in stage-width units)

- Reel: vertical → `{x 25, y 50, w 88·ratio·9/16, ratio}` in a `phone` frame; landscape → `{x 27, w 46}` in a `browser`
  frame; `fit: contain`, `sound: 1`.
- Column: centre x 70 (vertical) / 76, width 46 / 40. Title at y 8 (size 2.3, left, 42 % of the column); credit
  "Made with\nkinetic-scenes.unysonplus.com" at y 8 (size 1.9, right).
- Cards: from y 17 over 68 % of the height, gap 1.6, height `min(13, (68 − gaps) / n)`. Label (size 1.9, accent,
  `NN  KIND`) and time (size 1.9) at `y − 0.22h`; words (size 2.2, one line, max 30 characters) at `y + 0.22h`; inner
  padding 2.6. Entrances: card `slide` from the right, label/time `fade`, words `soft-wipe`, staggered 0.08 s per card.
- Highlight: an outline rect (`h + 0.6` tall). One `keyframes` clip over the whole length: opacity 0 → 1 by 0.6 s; for each
  step i, hold the previous position until `t − 0.2`, then move (`power3.inOut`) to `y = i · step / (h + 0.6) · 100`
  (yPercent of its own height) at `t`.
- Progress: track + accent bar at `y = 17 + 68 + 2.2`, revealed by a linear `wipe` over the whole duration.

These sizes pass Check scene with no warnings (the remaining notes are repeated-entrance and slow-progress-bar info).

Public page: docs.unysonplus.com/kinetic-scenes/breakdown. Roadmap: Phase 23, `p23-breakdown`.
