# Beats: build a reel from a few lines

`studio-beats.mjs` compiles a short beats document (brand + ordered beats) into a complete Kinetic Scenes scene. Use it
for outreach and client reels: write the beats from the brief, build, look at the stills, then adjust layers by hand.

| CLI | MCP tool | Output |
|---|---|---|
| `from-beats <x.beats.json> [--duration s] [--rhythm v.reference.json] [--music f] [--out scene.json] [--player url]` | `scene_from_beats` (`beats` or `beats_path`, `out`, `duration`, `rhythm_path`, `music`) | a scene file (+ markers `b1…` at each beat), then Check scene |

## Document

```json
{ "title": "…", "format": "9x16|1x1|4x5|16x9",
  "brand": { "bg": "#0d0d0f", "fg": "#ffffff", "accent": "#00B295", "font": "Inter", "logo": "path-or-url", "transition": "slash|wipe|fade" },
  "beats": [ { "kind": "headline|photo|split|list|proof|logo|close", "text": "", "sub": "", "image": "", "images": ["", ""],
               "items": [], "lines": [], "seconds": 3, "bg": "", "color": "", "alt": "", "ratio": 1 } ] }
```

`checkBeats(doc)` returns problems in words: an unknown kind, a photo without `image`, a split without two `images`, a list
without `items`, a headline or proof without `text`, more than one close, or a close that isn't last.

## Layout rules baked in

- Text sizes are stage-width units divided by the format's width ratio, so the type looks the same in every format.
- **Vertical clear area:** every text box is centred at x 46, at most 74 wide (left-anchored list items at most 64),
  with y clamped to 13–74 %. That keeps words clear of the top bar, the bottom fifth (caption, account) and the right-hand
  button strip that Reels, Shorts and TikTok cover (same rule as `motionRules.ts` and Check scene).
- **Credit:** the close beat always adds "Made with\nkinetic-scenes.unysonplus.com" (size 3.6, at 72 % down on vertical
  formats, 86 % on others, opacity 0.85) on the same frame as the client's details. Never a separate end card.
- Every held layer gets a `drift` (scale 1.05) for the beat's length, so no frame sits still.

## Per kind

| Kind | Layers and motion |
|---|---|
| headline | bg shape (transition in) · text `text-rise` by words · optional sub `fade` |
| photo | full-frame image (transition in + drift) · bottom gradient shade · caption `text-rise` by chars · sub `fade` |
| split | bg · two half-frame images `wipe` in from opposite sides 0.3 s apart · accent divider `wipe` · label `text-slam` in a bg-coloured pill |
| list | bg · title `text-rise` + drift · up to 6 items alternating `slide` / `stack-in`, each with an accent dot `pop` |
| proof | accent bg · big text (size 16) `text-slam` + drift · sub `text-tracking` |
| logo | bg · logo image `pop` (contain) · name `text-tracking` |
| close | accent bg · logo `pop` · name `text-rise` · up to 4 lines `fade` staggered · credit `fade` |

The first beat fades in; later beats arrive by `tr-slash` (angle 25, accent colour), `wipe` (alternating sides) or
`soft-wipe`, set by `brand.transition`.

## Timing

`beatTimes(beats, { duration, rhythm })`: each beat's `seconds` or its kind's default (headline 2.6, photo 3.2, split 3.6,
list 3.8, proof 2.8, logo 2.6, close 4.5), scaled to `duration` (or the rhythm's length). With a rhythm from
`studio-reference.mjs`, each beat start after the first snaps to the nearest reference moment within 0.6 s, provided it
stays at least 1 s after the previous start and 1.2 s before the end.

## Workflow

1. Optional: `video_reference` on a reel that works → `<video>.reference.json`.
2. Write the beats from the brief (public facts only, the client's brand, never the Unyson+ palette or music library).
3. `scene_from_beats` → read the Check scene notes → `scene_stills` and look at every frame → fix layers by hand.
4. `project_save` and hand over the preview link. No render until asked.

Public page: docs.unysonplus.com/kinetic-scenes/beats. Roadmap: Phase 23, `p23-beats`.
