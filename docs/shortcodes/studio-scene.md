<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `studio_scene` — Studio Scene

Plays a **timeline motion-graphics scene** made in the Unyson+ Animation Studio (`https://animation-studio.unysonplus.com/`):
text, shapes and images animated by presets on a timeline, rendered as live HTML (real text, not video), with its own
layout per breakpoint. **Requires the `animation-engine` extension active** (without it the tag is unregistered and saved
instances render empty). Leaf node: `{ type:'simple', shortcode:'studio_scene', _items:[], atts:{…} }` — plus the shared
wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `scene` | textarea | `''` | string: a **scene file** (JSON) **or** the Studio's **embed code** | The scene. Embed code is accepted as pasted: the JSON inside its `<script type="application/json">` is used and the rest ignored. Must have `"format": "unysonplus-scene"` and a `layers` array, or the element renders nothing (an editor notice in the builder). |
| `height_mode` | select | `'scene'` | `scene` `ratio` `ratio-capped` `fill` | Overrides the scene's `stage.heightMode` for this placement. `ratio` keeps the breakpoint's shape (page scrolls if taller than the window); `ratio-capped` keeps it but never taller than the window; `fill` is one window tall. |
| `height_offset` | slider | `0` | 0–300 (px) | Pixels left for a sticky site header in the capped / fill modes (overrides `stage.heightOffset`). `0` keeps the scene's value. |
| `trigger` | select | `'scene'` | `scene` `view` `load` `scroll` | When playback starts. `scroll` makes the page's scroll position the playhead (forwards and back), pinned for `playback.scroll.length` window heights unless the scene sets `pin: false`; pinning sticks below `height_offset`. Visitors with reduced motion always see the scene's still frame (`playback.posterTime`). |
| `scroll_length` | slider | `0` | 0–6 (window heights, step 0.1) | With `trigger` `scroll` (from this option or the scene): how far the page scrolls while the scene is pinned. `0` keeps the scene's `playback.scroll.length` (default 1.5). |
| `loop` | select | `'scene'` | `scene` `yes` `no` | Overrides `playback.loop`. |
| `transcript_headline` | select | `'scene'` | `scene` `h1` `h2` `h3` `p` | (Search tab) What the scene's headline becomes in the transcript written into the page; acts' headlines go one level below. Overrides `transcript.headline` (default `h2`). Use `h1` only when the scene is the page's main title. |
| `transcript_mode` | select | `'scene'` | `scene` `on` `decorative` | (Search tab) `decorative`: no transcript and the scene is hidden from screen readers; `on`: always include the words. Overrides `transcript.decorative`. |

`studio_tools` is a value-less `html` option (the "Open in Animation Studio" button + live summary); it stores nothing.

## Ready-to-use example (the atts object)
```json
{
  "scene": "{\"format\":\"unysonplus-scene\",\"version\":1,\"title\":\"Hello\",\"duration\":3,\"stage\":{\"breakpoints\":[{\"id\":\"desktop\",\"minWidth\":0,\"aspect\":[16,9]}],\"heightMode\":\"ratio-capped\",\"background\":\"#0a0d11\"},\"playback\":{\"trigger\":\"view\",\"loop\":false,\"posterTime\":2},\"layers\":[{\"id\":\"t\",\"type\":\"text\",\"text\":\"Hello\",\"style\":{\"fontSize\":12,\"fontWeight\":800,\"color\":\"#ffffff\"},\"box\":{\"x\":50,\"y\":50},\"clips\":[{\"id\":\"in\",\"preset\":\"text-rise\",\"start\":0.2,\"duration\":0.9}]}]}",
  "height_mode": "scene",
  "height_offset": 0,
  "trigger": "scene",
  "loop": "scene"
}
```

## The scene file (summary)
The full format is the JSON Schema shipped with the Studio (`packages/player/schema/scene.schema.json` in the
`UnysonPlus-Animation-Studio` repository). In short: `stage` (breakpoints with `minWidth` + `aspect`, `heightMode`,
`heightOffset`, `background`, `safeArea`, `fonts`), `playback` (`trigger`, `loop`, `repeatDelay`, `posterTime`) and
`layers` drawn bottom to top (`text` / `shape` / `image`, and `group`: a layer holding `layers` of its own, whose children keep stage coordinates and whose children's clips run on the group's clock from its `start`), each with a `box` (x/y/w in % of the stage, anchored), optional
per-breakpoint `overrides`, and `clips` (a preset id, `start`, `duration`, optional `ease` and `params`). Generate scenes in
the Studio rather than by hand where possible: it validates as you edit.

## Notes / gotchas

- **Custom code clips** (`preset: "code"`, `params.code` = GSAP JavaScript) run only when the post author has `unfiltered_html`; `view.php` then adds `data-upw-allow-code` to the host and the player runs them. Otherwise the player skips them and plays the rest. Never generate code clips: scenes are data, and the Studio drops any code clip an AI adds.
- **The player is bundled** (`static/js/vendor/scene-player.js`, a copy of the Studio's published player): no request
  leaves the site. Filter `fw_studio_scene_player_src` to point elsewhere. To update it, copy the newest
  `apps/studio/public/player/<version>/scene-player.js` from the Studio repository and bump the version in `static.php`.
- **3D layers** (`"type": "model"`) need `static/js/vendor/scene-3d.js` (three.js) beside the player; `static.php` sets `window.UPW_SCENE_ASSET_BASE` to that folder (filter `fw_studio_scene_asset_base`) so it is found even when an optimiser moves the player script. It loads only on pages whose scene has a 3D layer.
- **It carries its own GSAP** internally and does not claim `window.gsap` when another copy is present, so it sits next
  to Scroll Motion without interfering (verified with ScrollTrigger on the same page).
- **Breakpoints follow the element's width, not the screen's.** In a half-width column a scene uses whichever breakpoint
  fits that width (often its mobile layout).
- **The host fills its container** (`[data-upw-scene]{width:100%}` in the player), so it never collapses inside a centred
  flex column.
- **Round trip.** "Open in Animation Studio" opens the Studio (`fw_studio_scene_studio_url` filter, default
  `https://animation-studio.unysonplus.com/`) with `?connect=unysonplus`; the Studio says hello, the builder sends the
  field's scene, and "Save to page" in the Studio writes the edited JSON back into the field. Messages are accepted only
  from the Studio's origin **and** the window the builder opened; the Studio replies only to its opener's origin.
- **Search engines and screen readers (the transcript).** An animation shows its words a few at a time (scrambled, masked
  or duplicated mid-effect), so a crawler's snapshot of the live stage reads as fragments. `view.php` therefore writes the
  scene's words into the page HTML once, as a visually hidden `<div class="upw-scene-text">` after the scene JSON: in
  reading order (by when each layer appears, then top to bottom), the scene's headline as `<h2>` (or `transcript_headline`),
  each act's (top-level group's) headline one level below, everything else `<p>`; display-sized lines next to a headline
  merge into it ("Make it" + "MOVE." → "Make it MOVE."), 3D text counts as its act's headline, duplicates are dropped.
  The player keeps that block, marks the animated stage `aria-hidden`, and gives the scene `role="group"` named by
  `title`. `upw_studio_scene_transcript_items()` (PHP) is a port of the player's `sceneTranscript()`
  (`packages/player/src/transcript.ts`): keep them identical (a parity test of 45 cases passed at 0.0.16). Pages without
  a served transcript (embeds, Studio exports) get one written by the player itself.
- **Output safety:** the scene is re-encoded with `JSON_HEX_TAG`, so text containing `</script>` cannot close the script
  element.
- Re-init: pushes `UnysonPlusScene.autoMount(scope)` onto `window.fwShortcodeInit` for markup inserted after load.
