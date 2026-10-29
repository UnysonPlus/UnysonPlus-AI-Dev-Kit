<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# kinetic-preset — Kinetic Scenes Preset (Animation Engine)

Plays one of the Kinetic Scenes Studio's presets (Rise, Slam, Gravity drop, Strike, Jiggle…) on an ordinary page element,
with the **same player** the Kinetic Scene element ships (`shortcodes/studio-scene/static/js/vendor/scene-player.js`, its
`UnysonPlusScene.playPreset()`), so an effect is built once and used both in scenes and on pages. It is appended to every
element's **Animations tab** as the top-level `kinetic_preset` att (`sc_animation_fields`). Requires the
`animation-engine` extension ACTIVE. Honours "reduce motion" (the element is left as it is).

## Effects / styles
One `multi-picker` (picker id **`mode`**, off = `off`). Four groups; each group's options live inside its choice (lazy):

- **`text` (14):** `text-rise` · `text-slam` · `text-stretch` · `text-scramble` · `text-typewriter` · `text-blur` · `text-flip` · `text-tracking` · `text-count` · `text-carry` · `gravity-drop` · `knockout` · `odometer` · `timecode`
- **`reveal` (9):** `fade` · `wipe` · `iris` · `slide` · `grow` · `stack-in` · `strip-in` · `soft-wipe` · `blinds`
- **`motion` (5):** `pop` · `zoom` · `spin` · `progress` · `turn`
- **`emphasis` (11):** `text-wave` · `pulse` · `shake` · `float` · `recolor` · `glow` · `burst` · `strike` · `jiggle` · `tick` · `sheen`

The list is generated from the player's preset catalogue (`includes/kinetic-preset-presets.php`): presets that need a
scene (another layer, keyframes, sound, a picture's pixels, the camera) are left out. Regenerate it when the catalogue
changes.

## Value shape
```json
"kinetic_preset": { "mode": "text", "text": {
  "preset": "text-rise", "trigger": "view", "direction": "in",
  "duration": 0, "delay": 0, "replay": "no", "settings": "{\"by\": \"words\"}" } }
```

## Params
| key | type | default | notes |
|---|---|---|---|
| `preset` | select | first of the group | a preset id from the group above |
| `trigger` | select | `view` | `view` (a quarter on screen) / `load` / `hover` / `click` |
| `direction` | select | `in` | `in` / `out`; sent only for presets that have both |
| `duration` | number | `0` | seconds; 0 = the preset's own length (max 20) |
| `delay` | number | `0` | seconds (max 20) |
| `replay` | switch | `no` | play again on every re-entry / hover / click |
| `settings` | textarea | `''` | the preset's own params as JSON, same names as in the Studio; only plain values with simple keys are kept (no code) |

## Output
The wrapper gets class `upw-kp` and `data-upw-kp` = `{ p, t, d?, w?, r?, s? }` (preset, trigger, duration, delay, replay,
settings). `sc_needs_wrapper` forces a wrapper when this is the only setting. The asset `kinetic-preset` is registered with
`upw_anim_register_assets` (base JS `static/js/kinetic-preset.js`; `window.upwKineticPresetCfg = { player, reducedMotion }`)
and used on demand; the runtime loads the player once (`data-auto-mount="false"`), so a page that also has a Kinetic Scene
element shares one copy.

## Notes / gotchas
- **Text presets split the element's words and letters** (screen readers keep the words). Use them on headings and short
  text; on a block of mixed content (pictures, buttons) `playPreset` treats the element as a shape instead.
- The vendored player version is set in `shortcodes/studio-scene/static.php`; `playPreset` exists from player 0.0.42, and
  ticks and strikes sit beside the words from 0.0.43.
- Public docs: `docs.unysonplus.com/kinetic-scenes/on-your-pages`.
