<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Monochrome editorial

Follows the model in [`README.md`](README.md).

> **A fuller brief exists.** [`prompts/monochrome.md`](prompts/monochrome.md) is the design-system
> prompt for this preset, written to hand to an AI agent. This file records what the preset ships
> **today**; the brief describes where it is going, and the two currently disagree on three points —
> the type pairing (Playfair Display + Source Serif 4 rather than Instrument Serif + Inter), the
> black (`#000000` rather than `#111111`), and the line texture and tokenised rule weights, which are
> not emitted yet. Reconcile both files in the same change as the preset.

## The idea

Pure black and white, a serif headline against a sans body, no corner radius anywhere, and hairlines
instead of cards. The look of a printed journal: the typography carries everything, because nothing else
is allowed to. It suits studios, writers, architects, consultancies — anyone whose credibility rests on
judgement rather than warmth.

**Reach for a different one** when the site needs to feel approachable, when the brand owns a colour
worth showing, or when the content is image-led: this style frames photographs severely and flatters
none of them. It is also unforgiving of weak copy — with no colour, no radius and no shadow to hide
behind, a vague headline is simply a vague headline.

## The system

### Palette — `theme_colors`

Two values doing all the work, plus a grey that is the *only* concession.

```php
$tc = fw_get_db_settings_option('theme_colors', array());
if (empty($tc) && function_exists('unysonplus_default_color_presets')) $tc = unysonplus_default_color_presets();
$roles = array('Primary' => '#111111', 'Secondary' => '#767676', 'Accent' => '#111111');
foreach ($tc as &$p) if (isset($p['name'], $roles[$p['name']])) $p['color'] = $roles[$p['name']];
unset($p); fw_set_db_settings_option('theme_colors', $tc);
```

Accent **equals** Primary deliberately: this style has no accent colour, and leaving the role pointing
at a leftover default is how a stray blue link appears three pages in. `#767676` is the muted grey —
chosen because it clears 4.5:1 on white, which `#999` does not.

### Type — `typography`

A serif display over a sans body: the one contrast the style allows itself.

```php
$t = (array) fw_get_db_settings_option('typography', array());
$t['heading_font'] = array('family' => 'Instrument Serif', 'variation' => 'regular');
$t['body'] = array_merge((array) ($t['body'] ?? array()), array(
  'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.65, 'color' => '#111111',
));
$h = fn($sz, $lh, $ls) => array('family' => '', 'variation' => 'regular', 'size' => $sz,
                                'line-height' => $lh, 'letter-spacing' => $ls, 'color' => '#111111');
$t['h1'] = $h(76, 1.02, -2.0); $t['h2'] = $h(44, 1.10, -1.0);
$t['h3'] = $h(24, 1.30, -0.2); $t['h4'] = $h(18, 1.40, 0);
fw_set_db_settings_option('typography', $t);
```

The headings are `regular`, not bold — weight is this style's loudest instrument and it stays unused.
Size and negative tracking do the work instead.

### Buttons — `button_colors` + `button_sizes`

Square, and mostly not filled.

```php
$c  = fn($hex) => array('predefined' => '', 'custom' => $hex);
$bc = (array) fw_get_db_settings_option('button_colors', array());
if (empty($bc) && function_exists('unysonplus_default_button_color_presets')) $bc = unysonplus_default_button_color_presets();
foreach ($bc as &$p) { $n = strtolower(trim($p['color_name'] ?? ''));
  if ($n === 'primary') {   // inversion on hover — the style's one piece of interaction wit
    $p['states']['default'] = array('text_color'=>$c('#ffffff'),'bg_color'=>$c('#111111'),'border_color'=>$c('#111111'));
    $p['states']['hover']   = array('text_color'=>$c('#111111'),'bg_color'=>$c('#ffffff'),'border_color'=>$c('#111111'));
  }
  if ($n === 'secondary') { // outline resting, inverts to solid
    $p['states']['default'] = array('text_color'=>$c('#111111'),'bg_color'=>$c('#ffffff'),'border_color'=>$c('#111111'));
    $p['states']['hover']   = array('text_color'=>$c('#ffffff'),'bg_color'=>$c('#111111'),'border_color'=>$c('#111111'));
  }
} unset($p); fw_set_db_settings_option('button_colors', $bc);

$bs = (array) fw_get_db_settings_option('button_sizes', array());
if (empty($bs) && function_exists('unysonplus_default_button_size_presets')) $bs = unysonplus_default_button_size_presets();
foreach ($bs as &$s) { $s['border_radius'] = array('value' => '0', 'unit' => 'px'); }  // zero, every size
unset($s); fw_set_db_settings_option('button_sizes', $bs);
```

**Zero radius on every size, not just the one you are using.** A single rounded `btn-sm` surviving in a
footer is the detail that makes a monochrome site look like a theme someone partly re-skinned.

> **Then regenerate.** Preset CSS lives in a generated `uploads/**/unysonplus/css/presets-*.css` that a
> programmatic write does not rebuild: delete those files and call `unysonplus_hf_regenerate_css()`.
> Without it the site serves Bootstrap blue while the database holds this palette.

### Shape — `border_presets`

One preset, used everywhere: a 1px black hairline, radius 0, no shadow. This style has no cards — a
"card" here is a rule between things. Set the box presets' radius to `0` and their shadow to none; if a
preset's whole identity was its shadow, this style simply does not use it.

### Surfaces — `section_style_presets`

Two, and they are exact inversions:

| Preset | `background` | `text_color` | `heading_color` | `link_color` |
| --- | --- | --- | --- | --- |
| **Light** (default) | `#ffffff` | `#111111` | `#111111` | `#111111` |
| **Dark** | `#111111` | `#ffffff` | `#ffffff` | `#ffffff` |

Values use the compact shapes the preset carries — `background` as
`array('color' => array('value' => array('predefined' => '', 'custom' => '#111111')))`, each colour as
`array('predefined' => '', 'custom' => '#111111')`, and `border_radius` as
`array('value' => '0', 'unit' => 'px')`.

Alternate Light and Dark down the page. That alternation *is* the visual rhythm — it replaces the
colour, the shadows and the cards all at once.

### Rhythm — `spacing_scale`, `gap_scale`, `container_width_presets`

Generous vertical, narrow measure. The container sits at the **Narrow** preset (768px) for text pages
and **Medium** (896px) for mixed ones — a monochrome page set wide becomes a wall of grey text, which
is the single most common way this style fails.

### Motion

**Instant.** State changes only — the button inversion, a link underline. No reveals.

**Reduced motion:** nothing to disable, which is the point. The inversion is a state change, not an
animation, so it keeps working.

## Section treatments

Which recipe variants this style prefers — the personality lives here, not in new markup:

| Archetype | This style picks | Instead of |
| --- | --- | --- |
| [Hero](../recipes/heroes.md) | **Editorial** — long headline, low in the band, `btn-link` | Centred or media-backed |
| [Navbar](../recipes/navbars.md) | **Classic bar**, `static` position | Floating pill (radius) or card (shadow) |
| [Feature grid](../recipes/feature-grids.md) | **Icon row** — no `box_style` at all | Card grid |
| [CTA](../recipes/ctas.md) | **Centred block** on the inverted Dark surface | Banner strip |
| [Footer](../recipes/footers.md) | **Link columns**, hairline rules | Contact-led |
| [Marquee](../recipes/marquees.md) | A **word strip**, `text_style: outline` | Logo strip |

The CTA is the one place the style raises its voice: a Dark band amid Light ones, which after several
inversions reads as emphasis rather than decoration.

## Where it comes from

Closest existing skill: **`minimalist`** (clean editorial, warm monochrome, typographic contrast, no
gradients, no heavy shadows). This entry is the Unyson+ mapping of that direction — the seven slots in
our own values — and does not restate its design thinking.

It differs from `minimalist` in two deliberate ways: the palette is **pure** black and white rather than
warm monochrome, and the hero is a **serif**, which `minimalist` does not require. Where those two
agree, defer to the skill.
