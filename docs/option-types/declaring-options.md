# Declaring options — the authoring side

The rest of this folder answers **"what JSON does this option store?"** — the question you have
when *generating* a page. This file answers the other one: **"what do I write to create this
option?"** — the question you have when *building* a shortcode, an extension settings page, or
a Theme Settings section.

Start here, then open the per-type file for the details.

---

## The shape of an options array

```php
$options = [
	'tab_content' => [                      // container — not stored
		'title'   => __( 'Content', 'fw' ),
		'type'    => 'tab',
		'options' => [
			'group_main' => [               // container — not stored
				'type'    => 'group',
				'options' => [
					'title' => [            // LEAF — this is what gets stored
						'type'  => 'text',
						'label' => __( 'Title', 'fw' ),
						'value' => '',
					],
				],
			],
		],
	],
];
```

Stores `{"title": "…"}`. Containers are layout only — see [containers.md](containers.md).

**Leaf ids are the identity of the value.** They must be unique across the entire array, and
renaming one orphans every saved value. Restructuring containers is free; renaming leaves is
not.

---

## Keys every leaf accepts

| Key | Purpose |
|---|---|
| `type` | **Required.** The option type id. |
| `label` | The visible field name. `false` removes the label column entirely. |
| `desc` | One line under the label. Say what the option **does**, not what it is. |
| `help` | The `(?)` tooltip — the longer "why / when / what happens if". |
| `value` | The **default**. Omit to use the type's own default. |
| `attr` | Raw HTML attributes on the input, e.g. `[ 'placeholder' => 'https://' ]`. |

Per-type extras (`choices`, `properties`, `units`, `popup-options`, `picker`, …) are documented
in each type's own file.

### Writing `desc` and `help`

These are the only documentation most users will ever read, and they are cheap to get right:

- **`desc` — what it does, in one line.** "Auto-advance slides." Not "Autoplay setting."
- **`help` — the part that is not obvious.** What it interacts with, what the trade-off is, when
  to leave it alone. "Off by default. Autoplay pauses on hover and on keyboard focus, and is
  disabled entirely for visitors who ask for reduced motion."
- Say what a value **means**, not what the control looks like. The user can see the control.

---

## Picking the right type

| You need… | Use | Stores |
|---|---|---|
| A line of text | [`text`](primitives.md) | string |
| A paragraph, plain | [`textarea`](primitives.md) | string |
| Rich content | [`wp-editor`](wp-editor.md) | HTML string |
| On / off **on an element** | [`switch`](switch.md) | `'yes'` / `'no'` |
| On / off, plain boolean | [`checkbox`](primitives.md) | `true` / `false` |
| One of several | [`select`](primitives.md) / [`radio`](primitives.md) | choice key |
| One of several, **visually** | [`image-picker`](image-picker.md) | choice key |
| Several of many | [`checkboxes`](primitives.md) / [`multi-select`](multi-select.md) | map / array |
| A bounded number | [`slider`](slider.md) | number |
| An unbounded number | [`number`](primitives.md) | number |
| A CSS length | [`unit-input`](unit-input.md) | `{value, unit}` |
| A length per breakpoint | [`responsive`](responsive.md) | `{base, md, lg}` |
| **A colour on an element** | `sc_color_field_compact()` → [`compact-color`](compact-color.md) | `{predefined, custom}` |
| A colour when **defining a palette** | [`color-picker`](color-picker.md) | hex string |
| An image / file | [`upload`](upload.md) | `{attachment_id, url}` |
| Several images | [`multi-upload`](multi-upload.md) | array of the above |
| An icon | [`icon`](icon-v3.md) | typed object |
| A repeating list, rows in a modal | [`addable-popup`](addable-popup.md) | array of row objects |
| A repeating list, rows inline | [`addable-option`](addable-option.md) / [`addable-box`](addable-box.md) | array |
| Fields that depend on a choice | [`multi-picker`](multi-picker.md) | **nested** |
| Margin / padding | [`spacing`](spacing.md) | utility classes |
| Typography | [`typography-v2`](typography.md) | typed object |
| A named preset (button / border / box / table / image style) | the matching `*-style-picker` | class key |
| A date / time | [`date-picker`](date-picker.md) · [`time-picker`](time-picker.md) · [`datetime-picker`](datetime-picker.md) | string |

---

## Rules that are not optional

These are conventions the whole framework depends on. Breaking one produces an element that
works in isolation and misbehaves in a real site.

### Colours on elements use the preset field, never a raw `color-picker`

```php
'text_color' => sc_color_field_compact( [
	'label' => __( 'Text Color', 'fw' ),
	'kind'  => 'text',                        // 'text' → color · 'bg' → background
	'desc'  => __( 'Colour of the text.', 'fw' ),
] ),
```

This gives a preset dropdown — populated live from the site palette — plus an inline custom
picker, so the element follows Theme Settings instead of freezing a hex. Resolve it with
`sc_normalize_color_value( $value, $kind )`, which returns `{class, style}` and also tolerates
the legacy plain-string shape.

Outside the shortcodes extension, guard the call:

```php
function_exists( 'sc_color_field_compact' )
	? sc_color_field_compact( [ … ] )
	: [ 'type' => 'color-picker', … ]
```

**The one exception** is the UI that *defines* the palette — you cannot pick a preset to define
a preset. Everything that *consumes* a colour uses the helper.

### Some att ids are reserved — and wired for free

A small set of ids is consumed **automatically** by `sc_build_wrapper_attr()` and applied to the
element's wrapper:

```
text_color   bg_color   font_size_preset   spacing
margin   margin_top   margin_bottom   margin_start   margin_end
padding  padding_top  padding_bottom  padding_start  padding_end
```

Use one of these ids and the option is wired with **no view code at all** — declare it and you
are done. `text_color` / `bg_color` accept the compact colour shape (and the legacy string), and
land as a preset class or an inline style; the spacing/margin/padding ids become utility
classes.

**Resolving one of them in your view as well applies it twice** — a duplicated class and a
duplicated inline style. The output still renders, so this survives casual testing; you only
catch it by reading the rendered `class` attribute.

The rule:

- **Wrapper-level styling** → use the reserved id, write no code.
- **Anything you apply yourself** (a colour for one inner node, a size for one part) → use a
  **different** id, and resolve it in the view with `sc_normalize_color_value()`.

```php
// options.php
'text_color'  => sc_color_field_compact( [ 'label' => __( 'Text Color', 'fw' ),  'kind' => 'text' ] ),  // reserved — free
'title_color' => sc_color_field_compact( [ 'label' => __( 'Title Color', 'fw' ), 'kind' => 'text' ] ),  // yours — resolve it

// view.php — only the second one
$title_color = sc_normalize_color_value( $atts['title_color'] ?? '', 'text' );
```

### `switch` stores strings

`'yes'` / `'no'`, never a boolean. Consumers test `=== 'yes'`. Both `right-choice` and
`left-choice` blocks are required.

### Choice keys are non-empty strings

Never integer or boolean array keys — PHP casts them and the comparison against the saved string
then fails. `''` is acceptable only as an explicit "none" choice.

### Anything that renders a heading needs a `heading_tag`

The correct level depends on where the element is placed, which only the user knows. Never
hardcode a level, and never pick a deeper tag to get smaller text — that is what a size option
is for, and skipping a level downward fails the heading-order audit.

### Every image and video is user-replaceable

Media must be an `upload` option or an editable element, reachable from the builder. Not a
hardcoded theme-asset URL, not markup in a `code_block`, not a URL-only text field as the sole
path. A URL/pattern field is fine as an *advanced* extra — never as the only way in.

### Elements get the framework's Animations and Advanced tabs

```php
'tab_animation' => [
	'title' => __( 'Animations', 'fw' ), 'type' => 'tab',
	'options' => sc_get_animation_fields(),
],
'tab_advanced' => [
	'title' => __( 'Advanced', 'fw' ), 'type' => 'tab',
	'options' => [ 'advanced_settings' => [ 'type' => 'group', 'options' => sc_get_advanced_tab() ] ],
],
```

Both are consumed by `sc_build_wrapper_attr()` in the view — you write no code for either. Omit
them and your element is the only one on the page that cannot be animated or targeted with CSS.

---

## Changing an existing option is a migration

Adding a new option is free: it has no saved data, so its default applies everywhere.

**Changing an existing option's value shape is not.** The classic case is a `select` (stores a
string) becoming a [`multi-picker`](multi-picker.md) (stores an array).

The trap is specific and worth memorising: `get_value_from_attributes()` is **not** called on a
normal page-builder editor load. The edit modal opens with the **raw saved atts**, so a legacy
string reaches the new option type's PHP render, throws on `$value['key']`, corrupts the
options-render response, and the modal shows a blank **`error:`** — on **pre-existing items
only**, never on newly-added ones. That asymmetry is what makes it hard to diagnose: it works
perfectly when you test it.

The fix is a **JS-side migrator** in the builder item's `scripts.js`, mirroring the PHP one, run
before the modal opens, with `this.model.set('atts', migrated)` so a save persists the new
shape. Keep the PHP migration too — it covers the front end and the shortcode→builder path —
but the JS one is what stops the editor error.

Also: make the front-end view tolerate the legacy shape. It costs three lines and it is what
keeps already-published pages rendering while content is migrated.

### Knock-on effects

Changing an option surface can invalidate things that stored its **values**:

- **Preset-backed Theme Settings groups** → the preset library and any downloadable presets go
  stale. Regenerate them and add a schema migration.
- **Shortcode atts** → saved page-builder templates that carry those atts go stale. Regenerate
  the affected exports.
- **The element's `AGENTS.md`** → the atts table is the contract an AI generator reads. Update
  it in the same change, not later.

---

See also: [primitives.md](primitives.md) · [containers.md](containers.md) ·
[README.md](README.md) (the stored-shape index) · [`../extending.md`](../extending.md) (creating
shortcodes, option types and extensions) · [`../conventions.md`](../conventions.md).
