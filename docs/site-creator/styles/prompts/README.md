<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Style prompts

One design-system brief per preset, written to hand to an AI agent. Each is adapted from a public
design-system prompt written for React/Tailwind; the adaptation is the point, because Unyson+ keeps a
design system in **Theme Settings and presets** rather than in utility classes on each element.

[`monochrome.md`](monochrome.md) carries the full **mapping table** (design-system concept → where it
lives in Unyson+) and the regeneration steps. The other briefs reference it instead of repeating it.

## Source prompts

The original, unadapted prompts are kept as plain text outside any repo, one file per style with its
source URL on the first line:

    d:\Web Dev\unysonplus-website\presets\<slug>.txt

Thirty are saved there. They are third-party text, which is why they live outside the kit rather
than inside it.

## Written

| Preset | Brief | Specimen page | Shipped Unyson+ preset? |
|---|---|---|---|
| Monochrome editorial | [`monochrome.md`](monochrome.md) | `/design-presets/monochrome/` | **Yes** |
| Bauhaus | [`bauhaus.md`](bauhaus.md) | `/design-presets/bauhaus/` | **Yes** |
| Modern dark | [`modern-dark.md`](modern-dark.md) | `/design-presets/modern-dark/` | **Yes** |
| Newsprint | [`newsprint.md`](newsprint.md) | `/design-presets/newsprint/` | **Yes** |
| Minimalist Modern | [`saas.md`](saas.md) | `/design-presets/saas/` | **Yes** |
| Luxury / Editorial | [`luxury.md`](luxury.md) | `/design-presets/luxury/` | **Yes** |
| Terminal CLI | [`terminal.md`](terminal.md) | `/design-presets/terminal/` | **Yes** |
| Swiss International | [`swiss.md`](swiss.md) | `/design-presets/swiss/` | **Yes** |
| Kinetic Typography | [`kinetic.md`](kinetic.md) | `/design-presets/kinetic/` | **Yes** |
| Flat Design | [`flat-design.md`](flat-design.md) | `/design-presets/flat-design/` | **Yes** |
| Art Deco | [`art-deco.md`](art-deco.md) | `/design-presets/art-deco/` | **Yes** |
| Material You | [`material-design.md`](material-design.md) | `/design-presets/material-design/` | **Yes** |
| Neo-brutalism | [`neo-brutalism.md`](neo-brutalism.md) | `/design-presets/neo-brutalism/` | **Yes** |
| Bold Typography | [`bold-typography.md`](bold-typography.md) | `/design-presets/bold-typography/` | **Yes** |
| Academia | [`academia.md`](academia.md) | `/design-presets/academia/` | **Yes** |
| Cyberpunk | [`cyberpunk.md`](cyberpunk.md) | `/design-presets/cyberpunk/` | **Yes** |
| Web3 | [`web3.md`](web3.md) | `/design-presets/web3/` | **Yes** |
| Minimalist Dark | [`minimal-dark.md`](minimal-dark.md) | `/design-presets/minimal-dark/` | **Yes** |
| Playful Geometric | [`playful-geometric.md`](playful-geometric.md) | `/design-presets/playful-geometric/` | **Yes** |
| Claymorphism | [`claymorphism.md`](claymorphism.md) | `/design-presets/claymorphism/` | **Yes** |
| Professional Editorial | [`professional.md`](professional.md) | `/design-presets/professional/` | **Yes** |
| Botanical | [`botanical.md`](botanical.md) | `/design-presets/botanical/` | **Yes** |
| Vaporwave | [`vaporwave.md`](vaporwave.md) | `/design-presets/vaporwave/` | **Yes** |
| Enterprise SaaS | [`enterprise.md`](enterprise.md) | `/design-presets/enterprise/` | **Yes** |
| Sketchbook | [`sketch.md`](sketch.md) | `/design-presets/sketch/` | **Yes** |
| Industrial Control | [`industrial.md`](industrial.md) | `/design-presets/industrial/` | **Yes** |
| Neumorphism | [`neumorphism.md`](neumorphism.md) | `/design-presets/neumorphism/` | **Yes** |
| Organic | [`organic.md`](organic.md) | `/design-presets/organic/` | **Yes** |
| Maximalism | [`maximalism.md`](maximalism.md) | `/design-presets/maximalism/` | **Yes** |
| Retro Desktop | [`retro.md`](retro.md) | `/design-presets/retro/` | **Yes** |

## Queued

Briefs saved and waiting:

Nothing queued — every brief that has source text in `unysonplus-website/presets/` is written and has
a specimen page. Add the next one by dropping its source prompt in that folder.

## What "done" means for one preset

Each takes the same five steps, and the fourth is the one that cannot be skipped:

1. **The specimen page** — `crm-generator/src/static/design-presets/<slug>/index.html`, hand-authored
   to the brief, with the preview badge and an honest FAQ answer about what a generated site carries.
2. **The brief** — this folder, including a *Status* section naming any disagreement with the shipped
   preset rather than papering over it.
3. **Wiring** — dashboard dropdown option + `STYLE_PREVIEWS` entry, the home-page preview card, and
   the sitemap push in `build.mjs`.
4. **Render it and look at it.** Every preset built so far has produced two or three real defects that
   were invisible in the measurements — an invisible button on an inverted panel, a white numeral on a
   white box inside a coloured block, a bold lead-in turned into its own flex column, a note printed
   over by a tier's negative margin. Measure contrast from what *rendered*, drive the hover states,
   and check 390px.
5. **Ship** — version bump, push, confirm the deploy, verify on the live URL.

## The backlog this is accumulating

The specimen pages are running **ahead of the product**. `tools/apply-style.php` carries two presets
(`monochrome`, `modern-dark`), and neither matches its own brief. Every new page widens that gap.

Worth closing at some point rather than at the end: a page that advertises a preset the framework
cannot yet produce is a promise, and the FAQ on each page currently carries the caveat that keeps it
honest.
