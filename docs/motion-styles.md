# Motion styles, the film's shape and the jury review

Phase 23's sibling, Phase 19 of the Kinetic Scenes roadmap. What an agent needs in order to build a scene in a named
motion-design style, plan it like a film, and review it the way the Studio's AI does.

## Styles

20 motion-design styles live in the Studio (`apps/studio/src/lib/motionStyles.ts`), next to the 8 original looks in
`BUILT_IN_STYLES` (28 in all): flat vector, line art, isometric, toy 3D, Bauhaus, Swiss grid, synthwave, aurora glass,
collage, HUD and terminal, dark tech keynote, data story, living UI, vertical social, risograph, VHS and CRT, pixel art,
watercolour and ink, hand-drawn cel, liquid and morph.

Each is a `SceneStyle` (palette, fonts with a Google Fonts `href`, motion moves for headline / text / shape / exit plus
alternates, eases, pace, a sound palette, sample words) with two extra fields:

- `guide: { signs, build }`: what makes it recognisable at a glance, and how to build it from the Studio's parts.
  `styleBrief(style)` adds both to the art direction AI assist receives, and `MOTION_RULES` lists every style's guide
  under "MOTION-DESIGN STYLES", so a style named in a request works with no style selected.
- `signature`: its signature look. `starterScene(style)` puts it on the starter: `liquid` on the glow blob, `scanlines`
  on a see-through full-stage "Screen texture" layer on top, other looks (`boil`, `halftone`, the text looks, `sheen`,
  `glow`…) on the headline once it has landed. Long looks (boil, liquid, scanlines, text-gradient, float, drift,
  gradient-flow) run until the exit; the rest ease in over 0.6 s and hold. Entrance presets never count as a signature.

When building a scene in a style by hand: read the style's `guide`, use its palette, fonts and moves, and make the signs
visible in every part of the scene, not only the title. `apps/studio/test/motionStyles.test.ts` checks every style uses
real presets and sounds, has a guide, and that its starter scene validates (`STYLE_STARTERS_OUT=<folder>` writes them).

## Effects (player 0.0.47, `packages/player/src/presets/looks.ts`)

| id | category | params | notes |
|---|---|---|---|
| `boil` | ambient | `amount` 0.5-10 (2.5), `fps` 2-24 (8) | SVG turbulence + displacement; the seed changes `fps` times a second |
| `liquid` | ambient (shape, image, video) | `speed` 0.2-4 | border-radius blob morph through 4 shapes |
| `pixelate` | reveal | `direction`, `size` 2-80 px (24) | SVG pixelate filter; default ease `steps(8)` |
| `brush` | reveal | `direction`, `strokes` 1-8, `from` left/right | stacked gradient masks, alternating direction, ragged tails |
| `halftone` | emphasis | `direction`, `dot` cqw, `ink`, `offset` cqw | dot overlay (multiply) + offset drop-shadow plate |
| `scanlines` | ambient | `bleed`, `jitter`, `tracking` | lines, vignette, red/blue fringes, jitter, rolling band |
| `text-outline` | text | `direction`, `width` cqw, `color` | text-stroke, fill drains |
| `text-3d` | text | `direction`, `depth` 1-14, `step` cqw, `color` | stacked text-shadows |
| `text-gradient` | text | `from`, `to`, `angle` | background-clip text, gradient travels |
| `text-skew` | text | `direction`, `angle` ° | skews the letters (`.upw-txt`), not the layer |

Text looks act on the visible letters (`.upw-txt`) so the layer's own transform stays free for other presets. Filters
are combined per layer, so a look and a grade or another look can share a layer. All are deterministic in time.

## The film's shape (MOTION_RULES "THE FILM'S SHAPE")

A hook in the first 0.5 s; one hero moment about two-thirds through (strongest move, biggest sound hit, nothing
competing); a composed end frame held about 1 s with gentle movement; key frames planned as stills first; sound hits on
the picture's cue times. Plus COMPOSITION, CUTTING TO THE BEAT, RESTRAINT and STYLES sections. The rules are about 37k
characters; the kit takes up to 60k.

## The jury review (`studio-director.mjs` → `studioReview`)

- Frames: the settled moments; with fewer than 6 of them, frames spread across the scene (10, 28, 46, 64, 82, 96 %) are
  added, at least 0.25 s apart; at most 10.
- After the layout checklist the AI scores **style, idea, motion, design, finish, sound, technical** (1-5; sound 3 when
  silent), fixes the weakest first, ties every fix to a moment and numbers, and treats measured problems (`check`,
  `layout`) as overruling its impressions (this also closes p17-measured).
- Answer: `{ ok, notes, scores }` or `{ scene | update/add/remove, explanation, scores }`. `ok` only when no point is below
  4 and nothing was measured. The result carries `scores` (or `null` from an older model answer); the Studio appends
  "Jury (1-5): …" to the review note.

## Benchmark (`benchmarks/films/run.mts` in the Studio repo)

Five film briefs (app launch → keynote, logo reveal → liquid, poster breaking out → collage, a history in 20 s → Swiss,
wordless explainer → flat vector) are built by `studioScene` with the style's brief, then reviewed by `studioReview`.
Results (scene, scores, notes, seconds) go to `benchmarks/films/results/`. Run:
`KIT=<design-capture folder> PLAYER=<player base> node --import tsx benchmarks/films/run.mts [brief-id]`.

Public page: docs.unysonplus.com/kinetic-scenes/motion-styles.
