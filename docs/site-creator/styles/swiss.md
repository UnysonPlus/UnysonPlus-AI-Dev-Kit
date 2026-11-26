<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Swiss grid

Follows the model in [`README.md`](README.md).

## The idea

International Typographic Style: a visible grid, a neutral grotesque at few sizes, flush-left ragged-right
text, generous white space, and one primary colour used structurally rather than decoratively.
Everything aligns to the same columns, and that alignment is the design. It suits design studios,
architecture, consultancies, conferences, and any site whose credibility comes from precision.

**Reach for a different one** when the content is irregular — the style punishes a page whose sections
do not share a rhythm, and most marketing pages do not. It also needs real white space; squeezed, it
reads as plain rather than as composed.

## The system

| Slot | Value |
| --- | --- |
| **Palette** | White ground, `#111111` text, one primary (`#d8232a` is the canonical red; any single saturated hue works), muted **`#6b6b6b`** |
| **Type** | One neutral grotesque throughout, at **three sizes only** — display, subhead, body. `variation: 500` for headings, `regular` for body, `line-height: 1.5`. Flush left, never justified, never centred |
| **Buttons** | `border_radius: 0`. Primary is the colour; secondary is a 1px rule. Text is never centred inside them at display size |
| **Shape** | `border_presets`: radius `0`, border `1px`, shadow none |
| **Surfaces** | White, and one Primary band used once |
| **Rhythm** | **The grid is the style.** `gap_scale` consistent everywhere, `container_width_presets` at **Wide**, and every section uses the same track count so columns line up down the page |
| **Motion** | **Instant** — or one restrained fade at most. Movement undermines a style whose claim is stillness |

Values follow [`theme-settings/programmatic-setup.md`](../../theme-settings/programmatic-setup.md),
structurally as in [`monochrome.md`](monochrome.md); the regen step applies.

### The measured palette, and the two things it costs

Measured against the theme's own surfaces (`#ffffff` page, `#f7f7f7` Alt, `#1a1a1a` Dark):

| | on `#ffffff` | on `#f7f7f7` (Alt) | on `#d8232a` (Primary) | on `#1a1a1a` (Dark) |
| --- | --- | --- | --- | --- |
| `#111111` ink | 18.88 | 17.63 | **3.77** | — |
| `#6b6b6b` muted | 5.33 | **4.97** | **1.10** | — |
| `#d8232a` primary | 5.01 | 4.67 | — | **3.48** |
| `#ffffff` | — | — | 5.01 | 17.40 |

**The brief's `#767676` was wrong, and only on one surface.** It measures 4.54 on white — a pass — and
**4.24 on the Alt band**, which this style's own rhythm alternates onto. `#6b6b6b` clears both.
Build rule 10's first trap, in the style most likely to meet it.

**On the Primary band only white passes.** Ink is 3.77 and muted is 1.10, so the Section Style below
must set `text_color`, `heading_color` AND `link_color` explicitly rather than inherit — and the CTA
recipe's `{{reassurance}}` subtitle, which renders in the muted role, is the line that otherwise
lands at 1.10:1.

### The Primary band has to be created

This style says *"White, and one Primary band used once"* and routes the CTA onto it. **The theme
ships three Section Styles — Alt, Light, Dark. There is no Primary.** A build that does not create one
silently puts the Swiss CTA on `#1a1a1a` and has become a different style. Add it with the other
presets:

```php
$ss = fw_get_db_settings_option('section_style_presets', array());
if (empty($ss)) { $ss = unysonplus_default_section_style_presets(); }
$w = array('predefined'=>'','custom'=>'#ffffff');
$ss[] = array(
  'id' => 's000000010', 'style_name' => 'Primary',
  'background'    => array('color' => array('value' => array('predefined'=>'','custom'=>'#d8232a'))),
  'text_color'    => $w,   // all three, explicitly — see the table above
  'heading_color' => $w,
  'link_color'    => $w,
  'border'        => array('width'=>array('value'=>'','unit'=>'px'),'style'=>'','color'=>array('predefined'=>'','custom'=>'')),
  'border_sides'  => array('top','right','bottom','left'),
  'border_extent' => array('mode'=>'full'),
  'border_radius' => array('value'=>'','unit'=>'px'),
  'padding'       => array('margin'=>array('all'=>'','top'=>'','right'=>'','bottom'=>'','left'=>''),
                           'padding'=>array('all'=>'','top'=>'','right'=>'','bottom'=>'','left'=>'')),
);
fw_set_db_settings_option('section_style_presets', $ss);
```

Then a section takes it with `'variant' => 'primary'` (the slug is the name, lowercased).

**If you also use the Dark band**, override its `link_color`: it ships `#93c5fd`, a light blue, on
every brand — and the primary red cannot replace it (3.48:1 on `#1a1a1a`). No single red passes both
white and dark, so the dark band needs a lighter tint of the same hue: `#ef4d52` measures 4.85.

**Three type sizes, and no more.** The temptation is a fourth for "a bit smaller here". That is the
decision that turns a Swiss grid into an ordinary page with a red accent.

## Section treatments

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial**, flush left, aligned to the grid's first column | Centred |
| [Navbar](../recipes/navbars.md) | **Classic bar**, `static` | Pill, card, centred |
| [Feature grid](../recipes/feature-grids.md) | **Icon row** at the page's track count — 3 or 4, never 5 | Bento (it breaks the grid) |
| [CTA](../recipes/ctas.md) | **Centred block** on the Primary band | Dual action |
| [Footer](../recipes/footers.md) | **Link columns** on the same tracks as the page | Minimal bar |
| [Marquee](../recipes/marquees.md) | None | — |

The bento exclusion is the one to respect: a deliberately irregular tile layout is the opposite of this
style's argument.

## The signature moment

Swiss motion is **systematic** - it demonstrates the grid rather than decorating it. The moment should
look like the layout was always going to do that, which is a harder brief than it sounds and the reason
this style is the one most often spoiled by a borrowed effect.

| Reach for | Why it fits |
| --- | --- |
| [Motion sequence](../../animation-engine/motion-sequence.md) | Elements entering on the grid's own rhythm, identical timing, no randomness |
| [Scroll reveal](../../animation-engine/scroll-reveal.md), stagger by column | The structure declaring itself as you arrive |
| [Scroll progress](../../animation-engine/scroll-progress.md) | A rule that fills - information, drawn as a line |
| [Scroll var](../../animation-engine/scroll-var.md) | One measured value driving one property. Nothing compound |

**Prefer a participatory one, and this style has them.** [`design-jury.md`](../design-jury.md) is
clear that the moments which separate an award-grade page from a well-made one are the ones the
visitor *operates* — and the four moves above are all scroll-driven, so none of them survives that
file's first test (*move it to a competitor and it should break*). A scroll-staggered reveal
transplants anywhere in ten seconds.

The participatory version of a Swiss moment is **the grid rearranging under the visitor's hand**,
which is not a departure from the style but the oldest thing in it: information design is a reader
reorganising a table. Reach for these before the scroll-driven list:

| Reach for | Why it is still Swiss |
| --- | --- |
| [Tabs](../../shortcodes/tabs.md) switching a [comparison table](../../shortcodes/comparison-table.md)'s column set | The same tracks, re-populated. The layout holds; only the information moves |
| A [form that computes](../../shortcodes/contact-form.md) — a term, a quantity, a size — writing its result into the page | A measured value the reader chose, set in the same type as everything else |
| A sortable / filterable [table](../../shortcodes/table.md) or [posts](../../shortcodes/posts.md) grid | The grid demonstrating that it is a grid |
| [Steps](../../shortcodes/steps.md) or a tabbed sequence re-using one column set | A sequence the reader paces |

**What that costs you: the facts.** Each of these needs real numbers — rates, sizes, prices,
options. If the spec's `missing[]` includes them, the moment is not buildable and the
[Creativity score](../design-jury.md) is capped at whatever a non-participatory moment earns. Say so
when you report, and say which three facts would unlock it; do not invent them
([build rule 4](../../../skills/create-site/build-rules.md)).

**Never:** a [preloader](../../animation-engine/preloader.md), a cinematic reveal, drifting [parallax](../../animation-engine/parallax.md).
This is the style error named in [`design-jury.md`](../design-jury.md): spectacle on a Swiss grid does
not read as ambitious, it reads as a different designer having been let in halfway through.

**Reduced motion:** everything lands at its final position. A grid that is correct at rest loses nothing
at all - which is the clearest sign the style is working.

## Where it comes from

**No existing skill matches.** `minimalist` shares the restraint but not the grid discipline, and
`brutalist` shares the grid but inverts the refinement. A full entry.
