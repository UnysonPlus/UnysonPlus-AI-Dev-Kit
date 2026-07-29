# option-value-shapes — Non-Scalar Option Values & the Editor-Load Migration Gotcha

Most framework options store a scalar (a string, a number). Several store a **structured value** —
an array/hash whose shape you must match exactly when you author, consume, or migrate the option.
This page documents the common non-scalar shapes and the single trap that bites hardest: converting
an existing scalar option to an array-valued one **breaks pre-existing page-builder items** unless you
migrate JS-side.

Two rules underpin everything here:

- **The type string is NOT stored.** Values are keyed by option **id**; `type` lives only in the PHP
  schema. Renaming a type needs no migration — but **changing an option's type is a value-SHAPE
  change** and needs tolerance in the view/consumer plus, for builder items, a JS editor-load migrator.
- **`_get_value_from_input` normalizes the submitted shape on save** (a compact color parses to
  `{predefined,custom}`, a unit-input decodes to `{value,unit}`, etc.). Consume the **normalized**
  shape, and tolerate the legacy shape when an option changed type.

## multi-picker — `{ <picker_id>: <choice_key>, <choice_key>: {…} }`

A picker control whose selected choice **reveals** a group of sub-options. The stored value keys the
selection under the picker id, and keys each chosen group's values under that choice:

```php
array(
    'kind' => 'a',              // <picker_id> => selected <choice_key>
    'a'    => array( /* revealed sub-option values for choice "a" */ ),
    'b'    => array( /* revealed sub-option values for choice "b" */ ),
)
```

Switching the picker never loses the other choices' values (they stay in the hash).

Key rules:

- **Default lives in the top-level `value`**, e.g. `'value' => array( 'kind' => 'a' )` — never put a
  `value` inside the picker sub-option.
- **Choice keys must be NON-EMPTY strings** — use `'auto'`, never `''`.
- The picker is **one entry**: `'picker' => array( '<picker_id>' => array( 'type' => 'select|radio|image-picker', 'choices' => … ) )`.
- **`'choices'` maps each picker-choice → its revealed sub-options.** Only choices that reveal
  something need an entry.
- Add `'show_borders' => false`.

### Label placement — INLINE vs POPOVER (opposite rules)

The most common mistake is where `label`/`desc`/`help` go. It depends on the mode:

**Inline** (a plain `select`/`switch`/`image-picker` picker, no `popover`) — label/desc/help live on
the **picker sub-option**; the top level is `label => false`:

```php
'my_field' => array(
    'type'   => 'multi-picker',
    'label'  => false, 'desc' => false,   // ← TOP level: false
    'show_borders' => false,
    'value'  => array( 'kind' => 'a' ),
    'picker' => array( 'kind' => array(
        'type'    => 'select',
        'label'   => __( 'Style', 'fw' ),          // ← label HERE
        'desc'    => __( 'How it reads.', 'fw' ),
        'choices' => array( 'a' => 'A', 'b' => 'B' ),
    ) ),
    'choices' => array( 'a' => array( /* … */ ), 'b' => array( /* … */ ) ),
),
```

**Popover** (`'popover' => true`, usually an image-picker of tiles) — the **OPPOSITE**: label/desc/help
live on the **TOP level**; the picker sub-option is `label => false`:

```php
'my_field' => array(
    'type'    => 'multi-picker',
    'popover' => true,
    'label'   => __( 'Effect', 'fw' ),   // ← label HERE (top level)
    'desc'    => __( 'A motion applied to this element.', 'fw' ),
    'value'   => array( 'effect' => 'none' ),
    'picker'  => array( 'effect' => array(
        'type'    => 'image-picker',
        'label'   => false,              // ← picker: false
        'choices' => array( /* tiles */ ),
    ) ),
    'choices' => array( /* per-effect reveals */ ),
),
```

**The tell you got an inline one wrong** (wrote it like a popover): the label sits oddly at the far
left, and the desc floats to the **bottom** of the whole block — below all revealed rows instead of
under the picker control. Move label/desc onto the picker sub-option.

## Compact color preset — `{ predefined: 'text-…'|'bg-…', custom: '#hex' }`

When an element/shortcode needs a color, use the **preset selector** (`predefined-colors-color-picker-compact`),
built via the helper `sc_color_field_compact()` — a compact preset dropdown **plus** an inline custom
picker on one row. This keeps element colors tied to the theme palette instead of one-off hex values.

```php
// kind 'text' → text-{slug} choices; 'bg' → bg-{slug} choices.
'glow_color' => sc_color_field_compact( array( 'label' => __( 'Glow color', 'fw' ), 'kind' => 'bg' ) ),
```

Saved value shape (preset wins when both are set):

```json
{ "predefined": "text-red", "custom": "#00b295" }
```

Resolve it where you consume it — never treat it as a plain hex string:

- **Styling-tab class/inline-style** consumers → run through `sc_normalize_color_value( $value, $kind )`
  → returns `{ class, style }` (also tolerates the legacy plain-string shape).
- **CSS custom-property / JS-hex** consumers → resolve to a color string: `predefined` →
  `var(--color-{slug})` (strip the `text-`/`bg-` prefix; live-linked to the preset); `custom` → the
  hex; legacy string → pass through. For JS needing a real hex, map slug → hex via the palette
  slug-map helper instead of `var()`.
- Guard the helper when the option lives outside the shortcodes extension:
  `function_exists( 'sc_color_field_compact' ) ? sc_color_field_compact( … ) : array( 'type' => 'color-picker', … )`.

**Exception — defining the palette.** The color-preset DEFINITION UI (and any "define a palette swatch"
field) stays a **raw `color-picker`** — you can't pick a preset to define a preset. The compact type is
for CONSUMING colors on elements, not defining the palette.

## typography — `{ family, weight, size, line-height, … }`

The `typography` type (`typography-v2` is a deprecated alias with the identical shape) stores a font
descriptor hash:

```json
{ "family": "Inter", "style": "normal", "weight": "600", "size": "18",
  "line-height": "1.5", "letter-spacing": "0", "color": "#111",
  "google_font": true, "subset": "latin", "variation": "normal" }
```

`size` may be an int (legacy), a `{value,unit}` hash, or a JSON string — resolve it with
`fw_typography_size_css()` rather than reading it directly.

## spacing — nested `{ margin, padding, advanced:{md,lg} }`

The `spacing` type stores responsive margin/padding driven by utility classes:

```json
{ "margin":  { "top": "3", "bottom": "3", "left": "0", "right": "0" },
  "padding": { "top": "4", "bottom": "4", "left": "0", "right": "0" },
  "advanced": { "md": { /* … */ }, "lg": { /* … */ } } }
```

## image-picker — choice-key string (or array in multiple mode)

Visual choice tiles. Stores the selected **choice-key string**; with `'multiple' => true` it stores an
**array** of choice keys (e.g. border sides). Choice keys are the `choices` map keys — keep them
non-empty and stable, since they are what's persisted.

## The editor-load migration gotcha (most important)

Converting an EXISTING scalar option (a `select`, a string) into an **array-valued** one (e.g. a
`multi-picker`, or the compact color type) is a **breaking value-shape change**. The trap:

**`get_value_from_attributes` (PHP) is NOT called on normal page-builder editor load.** It only runs
in the items-corrector (shortcode → builder conversion). A section/column item's edit modal opens with
the **raw saved atts**:

```js
new fw.OptionsModal({ values: this.model.get('atts') })
```

So a legacy **string** reaches the array-valued option's PHP `_render`, triggers an *illegal string
offset* (e.g. `$value['preset']` on a string), corrupts the options-render AJAX, and the modal shows a
**blank "error:"**. This happens ONLY on PRE-EXISTING items — newly-added ones are fine (they start
with the new default).

**The fix has three parts:**

1. **Migrate JS-side in the item's `scripts.js` before the modal opens** — mirror the PHP migrator and
   `this.model.set('atts', migrated)` so a save persists the new shape. *This is what actually stops
   the editor error* — a PHP migration alone does NOT fix existing items.
2. **Keep the PHP migrator** in `get_value_from_attributes` too — it covers the shortcode → builder
   corrector path and the frontend.
3. **Make `view.php` tolerate the legacy scalar** so an un-migrated value still renders instead of
   fatally erroring.

The reference pattern is a builder item that pairs a PHP migrator with a JS mirror of the same
function in the item's `scripts.js`; the frontend view also accepts the old scalar. Apply all three
whenever you flip a scalar option to any structured shape on this page.
