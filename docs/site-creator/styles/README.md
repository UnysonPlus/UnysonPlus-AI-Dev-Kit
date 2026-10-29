<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Styles — the model

A **style** is a named design direction a person can ask for: *"make it monochrome editorial"*. This
file is the contract every style in this folder follows, so the picker can list them and the create-site
flow can apply one without special-casing.

A style is **not** a theme file and **not** a stylesheet. It is a mapping from a look to the design
system the site already has: Theme Settings presets, a type pairing, a shape language, and an Animation
Engine register. Everything a style sets is a **preset**, which is why one choice can repaint a whole
site and why changing it later still works.

> **Where the thinking comes from.** The taxonomy is informed by the public design-prompt libraries,
> but every style here is **re-authored in our own vocabulary**. Those prompts describe React and
> Tailwind components; ours describe Theme Settings values and page-builder output. A style that reads
> like a copied prompt is a style that will not apply cleanly — and we do not ship other people's words.

## What a style may set, and nothing else

Seven slots. A style that needs an eighth is describing a *section treatment*, which belongs in a
[recipe](../recipes/README.md), not here.

| Slot | Theme Settings option | What the style decides |
| --- | --- | --- |
| **Palette** | `theme_colors` | the role colours — Primary, Secondary, Accent, plus text / muted / bg |
| **Type** | `typography` | `heading_font` + `body`, and the `h1`–`h6` scale |
| **Buttons** | `button_colors`, `button_sizes` | fill vs. outline, and the radius that sets the whole shape language |
| **Shape** | `border_presets` | corner radius, border weight, shadow — the Box Presets everything wears |
| **Surfaces** | `section_style_presets` | the Alt / Light / Dark bands a page alternates between |
| **Rhythm** | `spacing_scale`, `gap_scale`, `container_width_presets` | how much air, and how wide the measure |
| **Motion** | Animation Engine defaults | the register: instant, restrained, or cinematic |

Each style file states all seven. A style that leaves one unstated inherits the theme default, which
is a decision made by absence — so say it, even when the answer is "unchanged".

## The five sections of a style file

| Section | Answers |
| --- | --- |
| **The idea** | what this look is *for*, in two or three sentences, and who it suits |
| **The system** | the seven slots above, as concrete values |
| **Section treatments** | how the archetypes change under this style — which recipe variants it prefers |
| **The motion register** | one sentence, plus the reduced-motion answer |
| **Where it comes from** | the existing skill it maps to, or why it needs its own entry |

### 1 · The idea

Two or three sentences. What the look is for, what it signals, and — as with recipes — **when to reach
for a different one**. A style that cannot say who it is wrong for is not a direction, it is a mood.

### 2 · The system

Concrete values, in the shapes
[`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md) documents. Not
prose: a style has to be *applicable*, and the create-site flow writes these literally.

```php
// Palette — role presets by NAME; seed the defaults first, they are empty until saved
$tc = fw_get_db_settings_option('theme_colors', array());
if (empty($tc) && function_exists('unysonplus_default_color_presets')) $tc = unysonplus_default_color_presets();
$roles = array('Primary' => '#111111', 'Secondary' => '#f5f5f5', 'Accent' => '#111111');
foreach ($tc as &$p) if (isset($p['name'], $roles[$p['name']])) $p['color'] = $roles[$p['name']];
unset($p); fw_set_db_settings_option('theme_colors', $tc);
```

> **The regen gotcha, every time.** Preset CSS lives in a generated
> `uploads/**/unysonplus/css/presets-*.css` that a **programmatic** write does **not** rebuild — only the
> admin save flow does. After writing `button_colors` / `button_sizes` or any Components preset, delete
> the generated files and call `unysonplus_hf_regenerate_css()`. Skip it and the site renders Bootstrap's
> blue-and-grey defaults while the database holds your palette — which looks like the style failed to
> apply, and sends you debugging the wrong layer.

### 3 · Section treatments

A style's personality shows in *which recipe variants it picks*, not in new markup. Say so explicitly:

> Monochrome editorial prefers the **editorial hero** over the centred one, `btn-link` over
> `btn-primary`, the **icon row** over the card grid (no cards means no radius to get wrong), and a
> **banner-strip CTA** rather than a filled block.

If a style genuinely needs a section shape the catalogue lacks, that is a **new recipe**, proposed on
its own merits — not a variant smuggled in through a style file.

### 4 · The motion register

One sentence naming the register, then the reduced-motion answer — which is the same in every style:
**content arrives at its final state immediately.** A style never gets to opt out of that.

| Register | Means |
| --- | --- |
| **Instant** | no reveals; state changes only (hover, focus) |
| **Restrained** | one fade-up per band, short, no stagger beyond a peer row |
| **Cinematic** | scroll-linked motion is part of the design; still one idea per section |

### 5 · Where it comes from

Several directions already exist as **design skills** in this workspace — a refined default
(`impeccable`), `minimalist`, `brutalist`, and a high-end agency look (`soft`). Where a style matches
one, **point at it and carry only the mapping** (which skill, plus the seven slots in our values).
Write a full entry only where there is a genuine gap.

This is the rule that keeps the library honest: **reuse, don't duplicate.** Two descriptions of the
same look drift apart, and the one that drifts is always the one nobody opens.

## The skill map

Four design directions already exist as **skills** in this workspace. A style that matches one is a
**mapping** — the seven slots in our values, plus a pointer — never a second description of the same
look. Only a genuine gap earns a full entry.

| Direction | Skill | Style entry |
| --- | --- | --- |
| Refined default | `impeccable` | *none needed* — it is the default the create-site flow assumes when no style is named, and it is palette-agnostic |
| Minimalist / editorial | `minimalist` | [monochrome.md](monochrome.md) — mapping (pure B/W + serif hero are its departures) |
| Brutalist | `brutalist` | [brutalist.md](brutalist.md) — mapping (we drop the degradation effects: per-element CSS cannot live in a preset) |
| High-end agency | `soft` | [luxury.md](luxury.md) — mapping (we fix the radius at 0–2px; the skill is more permissive) |
| **Dark product** | *(none)* | [modern-dark.md](modern-dark.md) — **full entry**: a real gap in the skill set |

> **How to tell a mapping from a gap.** If the skill already decides the look and we are only choosing
> Theme Settings values to express it, that is a mapping: point at the skill, list the seven slots, and
> name only the deliberate departures. If no skill describes the direction at all — as with the dark
> product register — write the entry in full. When a mapping and its skill disagree, **the skill wins**;
> this file carries values, not design opinions.

> **An effect that cannot be a preset cannot be a style.** That is the line the brutalist mapping runs
> into: scanlines and misregistration are per-element CSS, so they belong to a recipe or a child-theme
> fallback, not here. A style that smuggles them in produces a design nobody can restyle later.

## Keeping the library small

- **A style earns its place by being chosen**, not by existing. Six good directions beat twenty
  plausible ones, for the same reason the recipe catalogue is deliberately thin: nothing downstream can
  tell you a plausible style is a bad one.
- **One file per style**, named for the style (`monochrome.md`), listing its variants only where they
  are genuinely distinct looks rather than palette swaps.
- **Never name an external site or brand** in a style, its values or its description. Describe the look
  ("a newsprint grid"), never the site you saw it on.
- **A style stores option VALUES**, so it goes stale when options change — the same maintenance problem
  as the Preset Library and the recipes. When a Theme Settings option changes shape, the styles that set
  it are updated in the same turn.

## Proving a style before it ships

The recipes' bar, applied to a whole site rather than a section:

1. **Apply it to a real site**, then **look at it** — a home page, an inner page and a post.
2. **Check contrast on the real palette**, not on the swatches: every button preset against every
   surface preset it can land on. A style that only works on the light band is half a style.
3. **Phone width.** A look that depends on a wide measure needs to say what it does at 390px.
4. **Reduced motion on.** Then the ship gate.

## The library

| File | Style |
| --- | --- |
| [`monochrome.md`](monochrome.md) | Monochrome editorial — black and white, serif hero, zero radius |
| [`brutalist.md`](brutalist.md) | Industrial brutalist — rigid grid, one utility colour, hard edges |
| [`modern-dark.md`](modern-dark.md) | Modern dark — dark ground, one saturated accent, soft radii |
| [`newsprint.md`](newsprint.md) | Newsprint — warm off-white, condensed serif, dense columns |
| [`swiss.md`](swiss.md) | Swiss grid — visible grid, three type sizes, one structural colour |
| [`terminal.md`](terminal.md) | Terminal — monospace throughout, near-black ground, phosphor accent |
| [`luxury.md`](luxury.md) | Luxury — warm stone, muted metallic, space as the material |

The rest of the seeded set is listed in the
[AI Website Creator roadmap](https://docs.unysonplus.com/ai-dev-kit/ai-website-creator), Phase 2.
