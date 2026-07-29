# render-pipeline — From Saved Options to Rendered HTML

How a page-builder shortcode/element becomes HTML, and the **two distinct value-flow paths** a saved
attribute value can travel: the **frontend / conversion** path (PHP, runs `get_value_from_attributes`)
and the **editor-modal** path (JS, opens the item with its *raw* saved atts and does **not**). The split
between these two is the root cause of the "changed an option's value shape → existing saved items break
/ modal shows a blank error" class of bug. This doc explains the layout, both paths, the wrapper-attribute
pipeline, and the items-corrector.

## Per-shortcode file layout

Every shortcode lives in its own folder under `framework/extensions/shortcodes/shortcodes/<name>/`. The
files that matter to the render pipeline:

- **`options.php`** — the option **schema**. Each field here becomes part of the item's `atts` array,
  serialized into the page-builder JSON. **This file IS the atts contract** an AI generator (or a
  template export) must match.
- **`views/view.php`** — the **frontend render** template. `$atts` (resolved values) and `$content`
  (already-rendered inner items) are in scope. Outputs the semantic HTML.
- **`static.php`** — frontend CSS/JS enqueues (cache-busted with the extension version).
- **`config.php`** — page-builder config (tab, title, icon, `popup_size`).
- **`static/`** — frontend assets: `static/css/<name>.css`, `static/js/<name>.js`, and the builder icon
  `static/img/page_builder.svg`.
- **`includes/page-builder-<name>-item/`** — the editor-side item class
  (`class-page-builder-<name>-item.php`) plus **`static/js/scripts.js`** and `static/css/styles.css`. The
  `scripts.js` here is where JS-side value migration happens (see below).

The atom name uses **underscores** (`text_block`, `special_heading`, `icon_box`) even though the folder is
**hyphenated** (`text-block`).

## The two value-flow paths

A field's saved value shape is consumed in two places that reach it **differently**. Getting the shapes
consistent across both is mandatory.

### (a) Frontend / conversion path — PHP, runs `get_value_from_attributes`

On the **frontend** and during **shortcode-markup → builder-JSON conversion** (the items corrector), a
leaf item runs:

```php
Page_Builder_Simple_Item::get_value_from_attributes()
  → fw_get_options_values_from_input( $options, $atts )   // re-derives every option's value
```

This re-resolves each option against its `options.php` schema, filling defaults and normalizing shapes.
It is wrapped in `try { … } catch ( \Throwable $e ) {}` that **falls back to the raw saved atts** — a
safety net so a single bad option can at worst mis-render one field, never abort the conversion and wipe
the whole item. It is a guard, **not** a substitute for real migration.

### (b) Editor-modal path — JS, RAW atts, NO re-derivation

When a user opens an existing item's edit modal in the builder, the item is opened with its **raw stored
atts** — `get_value_from_attributes` is **not** called:

```js
new fw.OptionsModal({ values: this.model.get('atts') })   // raw saved atts, no PHP re-derivation
```

So the option-type's PHP `_render` receives the **legacy stored value verbatim**. If you converted an
existing scalar option (e.g. a `select` string) into a `multi-picker` (array value), the old string reaches
a renderer expecting an array — triggering *illegal string offset* errors, corrupting the options-render
AJAX, and showing a **blank `error:` modal**. This only happens on **pre-existing** items — newly-added
items start from the new defaults and never hit it.

### Why the split matters + the fix pattern

Because path (b) skips `get_value_from_attributes`, a PHP-only migration in `get_value_from_attributes`
alone does **not** fix an existing item's modal — the editor never runs that code. The fix has **two
halves, both required**:

1. **JS migrator** in the item's `includes/page-builder-<name>-item/static/js/scripts.js` — mirror the PHP
   migrator, run it **before** the modal opens, and persist with `this.model.set('atts', migrated)` so a
   subsequent save writes the new shape. **This is what actually stops the blank-modal error.**
2. **Keep the PHP migrator** (in the shortcode's `includes/migration.php`, called from
   `get_value_from_attributes` and/or the view) for the shortcode→builder conversion path and the frontend.
3. **Make `view.php` tolerate the legacy scalar** so the field also *renders* correctly, not merely
   survives.

Canonical example: a container's `min_height` migrated from a plain string to a multi-picker
`{ preset, custom:{ custom_height:{ value, unit } } }` — a PHP migrator plus its JS mirror in the item's
`scripts.js`, with the view tolerating the old string. Changing an existing option's value shape is
always a breaking change; do all three steps.

## Wrapper-attribute pipeline (`sc_build_wrapper_attr`)

An element's **outer wrapper** attributes/classes are assembled in `view.php` by calling the helper
function, which returns an attribute array (class, id, data-attrs, style):

```php
$attr = function_exists( 'sc_build_wrapper_attr' )
    ? sc_build_wrapper_attr( $atts )
    : array( 'class' => '<fallback-class>' );
```

`sc_build_wrapper_attr` is **also a filter name**. Styling and Animation-Engine modules attach behavior by
hooking it — they inspect the element's `$atts` and inject `data-*` attributes and classes onto the
wrapper without the shortcode's `view.php` knowing about each module:

```php
add_filter( 'sc_build_wrapper_attr', function ( $attr, $atts ) {
    // e.g. read a text-effect / hover / scroll-motion option from $atts
    // and add data-attrs + a class to the wrapper's attribute array
    return $attr;
}, 10, 2 );
```

This is how text effects, hover interactions, background effects, scroll motion, flip-card, sticky-stack,
confetti, etc. all decorate elements through one shared seam. Two consequences for `view.php` authors:

- **Always build the wrapper through `sc_build_wrapper_attr`** (guarded with `function_exists`), so module
  filters can reach the element.
- **Tolerate legacy scalar values** when reading atts in the view — the same value-shape-change concern as
  above applies; a view that assumes the new array shape will fatal on an old scalar.

## Page-builder items corrector (markup → builder JSON, high level)

The **items corrector** turns flat shortcode markup into the nested builder tree the editor stores. At a
high level it:

- Nests items into the canonical hierarchy **`section → column → simple(leaf)`**, auto-synthesizing
  **rows** and wrapping any non-section root item in a synthetic `[section]` on save (so a bare
  `[text_block]` at root still ends up inside a section).
- Recurses into `_items` so inner rows/columns/leaves are each corrected.
- Runs `get_value_from_attributes` per leaf (path **a** above) — the `try/catch` fallback lives here.
- Recognizes **section-like** types via the `fw_section_like_types` filter so custom containers aren't
  mis-wrapped.

Because the corrector runs on the conversion/save path but **not** on editor-modal open, it is exactly the
boundary that makes the two value-flow paths diverge.

## Builder-tree item shape (for reference)

Every item carries common keys: `unique_id` (32 hex), `css_id`, `css_class`, `custom_css`,
`responsive_hide`, `custom_attrs`, and an `animation` block. Containers add `_items`; a leaf is:

```json
{ "type": "simple", "shortcode": "<atom>", "atts": { }, "_items": [] }
```

Column `width` is a **top-level** key (`"1_2"`, `"1_3"`, underscore not slash), sibling to `type`/`atts`.
The full envelope/skeleton shapes for generating importable templates live in the page-builder
template-format guide; the leaf `atts` for each shortcode live in that shortcode's own options reference.

## Takeaways

- `options.php` = schema, `view.php` = render, `static/` = assets, `config.php` = builder config.
- Two paths to output: **PHP frontend/conversion** runs `get_value_from_attributes`; the **editor modal**
  opens with **raw atts** and does not.
- A value-shape change breaks existing saved items in the modal → fix with a **JS migrator in the item's
  `scripts.js`** *and* keep the **PHP migrator**, and make `view.php` tolerate the legacy value.
- Build wrappers via `sc_build_wrapper_attr` so module filters can decorate the element.
