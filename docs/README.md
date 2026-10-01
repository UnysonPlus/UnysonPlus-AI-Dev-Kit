<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `docs/` — map: which doc for which task

The kit's reference + workflow docs. The agent entry point is the repo-root
[`AGENTS.md`](../AGENTS.md) → [`PLAYBOOK.md`](../PLAYBOOK.md); the **authoritative build checklist** is
[`site-build-protocol.md`](site-build-protocol.md). This page is just a lookup so you don't have to
already know a filename.

## Build / convert a site (workflow — read in this order)

| I need to… | Read |
|---|---|
| **THE PROTOCOL — one document for build, convert, fix and train** (phases, gates, the per-section checklist; nothing else overrides it) | [`site-build-protocol.md`](site-build-protocol.md) |
| Value shapes, translation tables, fresh-build order, parity metrics, known misses (**reference, not authority**) | [`build-reference.md`](build-reference.md) |
| Prompt → finished site (fresh builds — nothing to reproduce) | [`site-build-protocol.md`](site-build-protocol.md) (job selector) + [`build-reference.md`](build-reference.md) Part 2 |
| Compose builder pages programmatically (fresh/demo/test — **not** conversions) | [`building-pages.md`](building-pages.md) + [`../tools/upw-build-pages.php`](../tools/upw-build-pages.php) |
| The generalized conventions every build follows | [`conventions.md`](conventions.md) |
| Verify a region — run every lens, **then open every band image** (both; neither alone is verification) | [`site-build-protocol.md`](site-build-protocol.md) Phases 3-4 + [`../tools/README.md`](../tools/README.md) |
| **"Fix my site" / "train on <url>"** — the same job; the only choice is *where each fix lands* | [`site-build-protocol.md`](site-build-protocol.md) |
| The copy-paste prompts to hand ANOTHER agent (site owner / maintainer) | [`converter-fix-my-site-prompt.md`](converter-fix-my-site-prompt.md) · [`converter-training-prompt.md`](converter-training-prompt.md) |
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
