# Word pins, translation and per-row voice-overs (Kinetic Scenes)

Three features built on one idea: **time things by the words a voice says, not by seconds.** Public pages:
[Word pins](https://docs.unysonplus.com/kinetic-scenes/word-pins), [Translate a video](https://docs.unysonplus.com/kinetic-scenes/translate),
[Videos from a spreadsheet](https://docs.unysonplus.com/kinetic-scenes/batch-videos#a-voice-over-for-every-row).

## Word pins (scene format)

```json
"at":    { "audio": "vo", "text": "database", "index": 4, "edge": "start", "offset": -0.15 }
"until": { "audio": "vo", "text": "again", "edge": "end" }
```

- On a **layer or group**: `at` moves the layer and all its clips so it starts on the word; `until` sets its end.
  On a **clip**: `at` sets only that clip's start.
- `audio` = a voice clip id; `text` = the word or phrase as said (case and punctuation ignored); `index` = which
  occurrence (kept up to date); `edge` start (default) / end; `offset` seconds.
- Matching: word for word first (in the named clip, then the other parts of the same recording: same `group`), then the
  closest-spelled stretch (one word more or fewer, likeness ≥ 0.72, never for targets under 5 letters).
- Inside a group the time is converted to the group's own clock.
- Applied by the player whenever it plays (so a file with stale seconds still plays on the words), by the Studio on
  every change, and by the kit when it writes a scene: `studio-pins.mjs` (`applyWordPins`, `pinTime`, `wordPins`), the
  same rule as the player's `words.ts`. **Keep the two in step.**
- `lintScene` / `check` warns about a pin whose voice or word is gone (the layer stays where it was).

**When to use them:** whenever something on screen belongs to a spoken word. Pin it rather than typing seconds, so a
better take, a reworded line, a translation or a spreadsheet row's own narration re-times the scene.

## Voice clips keep their script

`audio[].script` (the text it was spoken from, lines separated by `\n`), `voiceId` (the kit voice: a Piper id,
`kokoro:<id>`, `voicebox:<profile>`), `lang` (two-letter code when not English). The Studio sets them for a voice made
from a script; set them yourself when you add a voice clip from `voice_over`.

Voices the kit makes from a script now get **the script's own words on the heard timing** (`wordsFromScript` in
`studio-voice.mjs`): speech recognition can mishear a word, but captions and pins should read the script. Voice jobs take
`language` (`POST /studio/voice { lines, voice, language }`); the free Piper voices for other languages are in `VOICES`
(`voiceForLanguage(code)`), Voicebox voices speak `VOICEBOX_LANGUAGES` (en zh ja ko de fr ru pt es it).

> Only Piper models this kit's Piper build can load are listed: newer models whose phoneme table has multi-letter
> entries (es_ES-davefx, fr_FR-siwis, de_DE-thorsten-medium, it_IT-paola, pt_BR-faber…) fail with
> `"aɪ" is not a single codepoint`. Check a model's `.onnx.json` `phoneme_id_map` before adding it.

## Translate a project

```
kinetic-scenes translate "<project>" --to es [--voice voicebox:<profile>] [--name "New name"]
```

MCP `scene_translate { project, to, voice?, name? }`; Studio Tools › Translate this video (`POST /studio/translate`,
`GET /studio/translate/<id>`). Module: `studio-translate.mjs`.

1. Collects every on-screen wording (text layers and their overrides, alt, link labels, diagram labels, repeat items,
   the title) and each voice clip's script, with its pinned phrases wrapped in `⟦n⟧…⟦/n⟧`.
2. One AI request (`askText`) translates all of it as JSON; markers come back around the translated phrases.
3. Each voice-over is spoken in the target language (default: the free voice for it; `--voice` to keep a Voicebox voice),
   its words timed in that language; pins take the translated phrase and its word index.
4. `applyWordPins`, then a **new project** "<title> (<Language>)" with the original media copied. Nothing is written until
   every voice is made. The original is never changed.

Returns `{ id, link, texts, voices, pins, warnings }`. **Read the warnings**: lines that got longer, a voice-over that now
runs into the next (voice clips stay at their seconds), a longer scene, a pin that lost its word. Then check and look at
stills of the copy as with any scene.

## Batch with voice

`studio-batch.mjs` `voiceRow(template, filled, { dir, voice })`, used by `renderBatch` for every row (and the Studio's
`voiceRow` in `lib/batch.ts`): a voice clip whose `script` changes with the row ({{placeholders}}) is spoken again in its
`voiceId` (else `voice`), only changed lines are spoken (the voice cache), word pins re-time the row, and the row's
duration grows to fit a longer voice. Pin text can hold placeholders too (`"text": "{{product}}"`).
