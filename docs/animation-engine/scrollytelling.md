# scrollytelling — Scrollytelling (Animation Engine)

Two layouts, one module. **Media Panel + Steps** (classic): pins one column as a **media panel**
while the other column's steps scroll past — the pinned media swaps to match the active step
(pinned-media narrative). **Full-screen Stage** (Scroll Story): EVERY column becomes a
full-viewport **scene** played in order as the visitor scrolls, over an optional **backdrop**
(numbered image-sequence pattern / scrubbed video / fixed image) driven by story progress — the
cinematic "camera-ride" launch-page model. Rides the Section's **`fx.scrollytelling`** slot (picker
key **`mode`**; "off" value `off`). **Section only** — injected into the Section's Animations tab,
not offered on grid collections. Requires the **animation-engine extension ACTIVE**; global on/off
in Theme Settings → Animations → Effects.

## Effects / styles

28 `mode` keys (transition between media states):
`crossfade` · `slide` · `zoom` · `clip_wipe` · `blur` · `ken_burns` · `parallax` · `pixelate` ·
`push` · `cover` · `curtain` · `split` · `flip` · `cube` · `tilt` · `iris` · `barn` · `blinds` ·
`dissolve` · `glitch` · `flash` · `duotone` · `zoom_blur` · `page_turn` · `scan` · `color_shift` ·
`frame_sequence` · `horizontal_track` · `liquid`.

**Directional styles** (`slide` · `push` · `cover` · `clip_wipe` · `curtain`) add a `direction`
sub-option; all others use the shared group only.

## Value shape

```json
"scrollytelling": { "mode": "crossfade", "crossfade": {
  "layout": "panel",
  "scene_length": 1,
  "backdrop": { "source": "none" },
  "pin_side": "left",
  "media_height": 100,
  "pin_offset": 0,
  "activate_at": 50,
  "transition": 0.6,
  "intensity": 0.5,
  "progress": "dots"
} }
```

Directional styles prepend `"direction": "auto"`.

**Full-screen Stage** (a Scroll Story with a scrubbed frame-sequence camera ride behind the scenes):

```json
"scrollytelling": { "mode": "crossfade", "crossfade": {
  "layout": "stage",
  "scene_length": 1.5,
  "exit": "fade",           // "hold" (hard cut) | "fade" (dissolve into the Section bg near the end)
  "exit_at": 78,            // fade only: % of the story where the fade begins
  "backdrop": { "source": "sequence", "sequence": {
    "url_pattern": "/wp-content/uploads/ride/%d.webp",
    "count": "180", "start": "0", "pad": "0", "fit": "cover"
  } },
  "pin_side": "left", "media_height": 100, "pin_offset": 0,
  "activate_at": 50, "transition": 0.6, "intensity": 0.5, "progress": "none"
} }
```

## Params

| Param | Type | Default | Notes |
|---|---|---|---|
| `layout` | select | `'panel'` | `panel` (media + steps columns) / `stage` (every column = a full-viewport scene). |
| `scene_length` | slider | `1` (0.5–3) | **Stage only** — screens of scroll each scene owns (higher = slower pacing). |
| `exit` | select | `'hold'` | **Stage only** — `hold` (last frame stays until the pin releases) / `fade` (the pinned stage fades to 0 near the end, revealing the Section background — set that bg to the next section's colour for a seamless hand-off). |
| `exit_at` | slider | `78` (50–95) | **Stage + `exit:fade` only** — % of the story where the fade begins. |
| `backdrop` | multi-picker | `{source:'none'}` | **Stage only** — `source`: `none` / `frames` / `sequence` / `video` / `image`. `frames` → `{frames (multi-upload, in order), fit}` — the **Media-Library, user-replaceable default**; `sequence` → `{url_pattern (%d), count, start, pad, fit}` (advanced, best for 100+ frames); both scrub frame-by-frame with story progress. `video` → `{video_file (upload), video_url, fit}` (paused + scrubbed); `image` → `{image (upload), fit}` (fixed). |
| `backdrop_motion` | select | `'none'` | **Stage + a set backdrop only** — the "camera glide" illusion (moving the backdrop, not a real camera): `none` / `pan` (backdrop slides sideways/up as the story scrubs) / `dolly` (backdrop scales in) / `pan_dolly` (both — a cinematic desk drift). Best on a fixed `image` (or `video`) backdrop; leave `none` for a `frames`/`sequence` backdrop that is already animating. |
| `motion_direction` | select | `'left'` | **`backdrop_motion` pan only** — which way the backdrop travels: `left` / `right` / `up` / `down`. Ignored for a pure `dolly`. |
| `motion_intensity` | slider | `50` (0–100) | **`backdrop_motion` only** — strength of the glide (pan travel + dolly zoom). ~40–50 reads as a gentle cinematic drift; 100 is a strong sweep. |
| `pin_side` | select | `'left'` | **Panel only** — `left` / `right` / `top` (stacked). Which column is the pinned media. |
| `media_height` | slider | `100` (60–100) | Pinned panel height (vh). |
| `pin_offset` | slider | `0` (0–160) | Top gap where the panel pins (clear a sticky header). |
| `activate_at` | slider | `50` (20–80) | Viewport % where a step becomes active. |
| `transition` | slider | `0.6` (0.2–1.2) | Crossfade / transition seconds. |
| `intensity` | slider | `0.5` (0–1) | Style strength (zoom / parallax / blur / drift). |
| `progress` | select | `'dots'` | `dots` / `bar` / `none`. |
| `direction` | select | `'auto'` | Directional styles only: `auto` / `up` / `down` / `left` / `right`. |

## Notes

- **Panel layout:** build the Section with **two columns**: one stacks N media layers, the other
  holds N step blocks. Media layers map to steps by index (step 1 → media 1, …).
- **Stage layout:** build the Section with **one `1_1` column per scene** — each column's elements
  are that scene's content (headings, text, buttons; no wrappers needed). Scenes transition with the
  picked `mode` style; the runtime auto-groups 2+ consecutive buttons into a side-by-side CTA row
  and pins the stage full-bleed for `scenes × scene_length` screens of scroll. The backdrop scrubs
  with total story progress (a `sequence` backdrop = the Apple-style product camera ride). When a
  backdrop is set, scene copy defaults to a **legible light treatment** (white + soft shadow + a low
  top/bottom scrim) since photographic backdrops are almost always dark — any explicit per-element
  colour option still wins, so a light backdrop can be paired with dark scene text as usual.
- **Persistent layer (a scene that never fades):** give a scene column the CSS class
  **`upw-story-persist`** (Advanced → CSS Class) and it stays on screen the WHOLE ride while the
  remaining "beat" scenes cross-fade over it — put it **first** so it sits behind the beats. Use it
  for a device mockup or a gallery that morphs with scroll while the copy changes above it (e.g. a
  `gallery_3d` **photo_scatter** in `cycle: scroll` mode, which organizes the pile as the story
  progresses). Persistent scenes don't own scroll time — the pin length is `beats × scene_length`. **Ranged persist:** add `upw-persist-to-N` (and/or `upw-persist-from-N`) to the persist column and it stays only while the active beat is in `[from,to]`, cross-fading out after — so one Stage can hand a persistent element off to different content a few beats later (e.g. a scatter gallery for beats 0–1, then film-strip / chat beats). A ranged-persist `gallery_3d` in `cycle: scroll` remaps its morph to its own beat slice (via the published `el.__storyBeats`), so it completes within its range rather than over the whole ride.
- **Backdrop Motion (the "camera glide"):** set `backdrop_motion` to `pan` / `dolly` / `pan_dolly` and
  the backdrop is driven by story progress as a real **3D camera move** — not a flat parallax slide.
  The backdrop is treated as a plane the camera glides across: it **pans** (translate), **yaws through
  a perspective** (a subtle `rotateY`/`rotateX` keystone so the near edge sweeps faster than the far
  edge — depth *within* the single image, which is what reads as a camera physically turning rather
  than a layer sliding), arcs gently on the cross axis, and **dollies in** (scale). So a *static* photo
  backdrop reads as a slow cinematic camera move (how a reference site's rendered "camera" is faithfully faked with
  one still image). It transforms the backdrop **container**, so it composes with any per-image CSS
  (e.g. a blur) without fighting it — do **not** hand-write a `transform` on the backdrop `<img>` too,
  or the two stack. Use `motion_direction` for the pan axis and `motion_intensity` (~50–60 reads as a
  present-but-cinematic move; lower for a gentle drift).
- **Published progress:** the Stage writes its 0→1 scroll progress to the section every frame as the
  CSS var **`--story-progress`** and the JS property **`el.__storyProgress`**, so child elements
  (galleries, scroll-driven group moves) can scrub in perfect sync with the scene — the mechanism the
  photo_scatter organize-on-scroll uses when nested in a Stage.
- Pure CSS sticky + IntersectionObserver (+ one rAF loop for stage/scrub); honours "reduce motion"
  (panel: media shows statically above each step; stage: scenes flow as a normal stack) and loads
  only on pages that use it.
