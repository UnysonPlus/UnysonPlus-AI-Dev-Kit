# `docs/` — map: which doc for which task

The kit's reference + workflow docs. The agent entry point is the repo-root
[`AGENTS.md`](../AGENTS.md) → [`PLAYBOOK.md`](../PLAYBOOK.md); the **authoritative build checklist** is
[`site-build-protocol.md`](site-build-protocol.md). This page is just a lookup so you don't have to
already know a filename.

## Build / convert a site (workflow — read in this order)

| I need to… | Read |
|---|---|
| **The core rule — CONVERSION = translation, not design** (a source exists → translate its captured classes via the converter, fix the converter for a wrong value, prove with a class-string fixture; NEVER measure/eyeball/hand-author) | [`site-build-protocol.md`](site-build-protocol.md) → Rule 0 / Rule −1 |
| **Follow the strict, authoritative build checklist** (canonical — start each section here) | [`site-build-protocol.md`](site-build-protocol.md) → "THE PER-SECTION CHECKLIST" |
| Prompt → finished site (narrative workflow — **fresh builds only**) | [`build-a-site.md`](build-a-site.md) |
| Compose builder pages programmatically (fresh/demo/test — **not** conversions) | [`building-pages.md`](building-pages.md) + [`../tools/upw-build-pages.php`](../tools/upw-build-pages.php) |
| The generalized conventions every build follows | [`conventions.md`](conventions.md) |
| Verify a region — **conversion:** the browser-free class-string fixture is the proof; **fresh build:** the 4-lens rendered PASS gate | [`fidelity-verification.md`](fidelity-verification.md) + [`../tools/README.md`](../tools/README.md) |
| Cloning gotchas (Tailwind, spacing, emoji vs SVG, wp-emoji…) | [`cloning-gotchas.md`](cloning-gotchas.md) |
| The deterministic converter (capture service + Site Converter) | [`extensions/site-converter.md`](extensions/site-converter.md) |

## Reference (shapes & options)

| Surface | Folder |
|---|---|
| **Per-shortcode atts** (page-builder JSON shape) + the node model | [`shortcodes/`](shortcodes/) (see its `README.md`) |
| **Option-type value shapes** (color, multi-picker, spacing, typography, unit-input…) | [`option-types/`](option-types/) |
| **Theme Settings** (Colors / Typography / Layout / Header / Footer / Blog / Misc…) | [`theme-settings/`](theme-settings/) |
| **Animation Engine** per-module effect shapes | [`animation-engine/`](animation-engine/) |
| **One overview per plugin extension** | [`extensions/`](extensions/) |
| Framework internals / architecture | [`architecture/`](architecture/) |

## Extend the framework

| I need to… | Read |
|---|---|
| Create / convert a shortcode, option type, or extension | [`extending.md`](extending.md) + [`../samples/sample-shortcode/`](../samples/sample-shortcode/) (copy the skeleton; `HOW-TO.md` is the porting procedure) |
| Create a child theme | [`extending.md`](extending.md) + [`../samples/sample-child-theme/`](../samples/sample-child-theme/) |

> Docs are kept in sync with the plugin via `sync.mjs` + `.doc-manifest.json`. When you change a
> documented surface, update its doc in the same turn and re-run `node docs/sync.mjs check | stamp <doc>
> | build` (see [`../AGENTS.md`](../AGENTS.md) "Keeping the docs current").
