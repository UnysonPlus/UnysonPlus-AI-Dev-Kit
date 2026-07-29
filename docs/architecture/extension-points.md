# extension-points — Stable Hooks & Helpers for Extending UnysonPlus

The durable, public surface an extension or theme author (or an AI modifying the
framework) hooks into. This is **not** an exhaustive `add_action` dump — only the
high-value, stable seams: the ones a new module, shortcode, option type, or theme
integration is expected to use. Each entry lists whether it is a **filter** or
**action**, its signature, what it does, and a minimal usage example.

Stability legend: **Stable** = safe to rely on long-term. **Convention** = a
naming/wiring pattern (not a single symbol) that is consistent across the codebase.

---

## Options & Rendering

### `fw_shortcode_get_options` — filter — Stable
```php
apply_filters( 'fw_shortcode_get_options', array $options, string $tag )
```
Fires whenever a shortcode's options schema is read. Lets you add, remove, or
mutate a specific shortcode's edit-modal fields by tag — the canonical way a
Section-only Animation Engine module injects its picker, and how you bolt an
option onto a built-in element without editing its `options.php`.

```php
add_filter( 'fw_shortcode_get_options', function ( $options, $tag ) {
    if ( $tag !== 'section' ) { return $options; }
    // Inject INSIDE the Animations organizer, not beside it:
    $options['tab_animation']['options']['animation_stack']['options']['my_effect'] = $field;
    return $options;
}, 10, 2 );
```
Injecting a Section-level field belongs *inside*
`tab_animation → animation_stack → options`; a flat append is only a fallback when
that container is absent.

### `sc_animation_fields` — filter — Stable
```php
apply_filters( 'sc_animation_fields', array $fields )
```
Filters the shared per-element **Animations** tab field set (the "Add Animation"
inserter). A **per-element** module appends its popover `multi-picker` here (the
`hover` module is the reference). One entry per module, keyed by the module id.

```php
add_filter( 'sc_animation_fields', function ( $fields ) {
    $fields['my_mod'] = array(
        'type' => 'multi-picker', 'popover' => true,
        'label' => __( 'My Effect', 'fw' ),
        'value' => array( 'mode' => 'off' ),
        'anim_meta' => array( 'category' => __( 'Pointer', 'fw' ) ),
        'picker' => array( 'mode' => array(
            'type' => 'image-picker', 'label' => false, 'choices' => $tiles ) ),
        'choices' => $reveal_groups,
    );
    return $fields;
} );
```

### `sc_build_wrapper_attr` — filter — Stable
```php
apply_filters( 'sc_build_wrapper_attr', array $attr, array $atts )
```
The single seam for an element's **outer wrapper attributes**. Given the element's
saved `$atts`, it returns the wrapper attribute array (`class`, `data-*`, `style`,
`id`, …). This is how a module attaches its runtime hooks: add classes + `data-*`
attrs when its mode is active, and record each emitted style so the on-demand asset
loader ships only what's used.

```php
add_filter( 'sc_build_wrapper_attr', function ( $attr, $atts ) {
    if ( empty( $atts['my_mod']['mode'] ) || $atts['my_mod']['mode'] === 'off' ) {
        return $attr;
    }
    $style = $atts['my_mod']['mode'];
    $attr['class'][] = 'upw-my-mod';
    $attr['data-mymod'] = $style;
    upw_anim_use_asset( 'my_mod', $style ); // triggers the on-demand enqueue
    return $attr;
}, 10, 2 );
```
Elements that normally render bare must force a wrapper — call
`sc_needs_wrapper( $atts )` (Stable) in the same handler.

### `fw_option_types_init` — action — Stable
```php
do_action( 'fw_option_types_init' )
```
Fires once when the backend is ready to accept custom **option types**. Register a
new `FW_Option_Type` subclass here — this is the only supported timing (registering
earlier or later is rejected). Used by the builder, forms, and the Animation Engine.

```php
add_action( 'fw_option_types_init', function () {
    fw()->backend->register_option_type( new FW_Option_Type_My_Field() );
} );
```

---

## Animation Engine

### `upw_anim_engine_module_tabs` — filter — Stable (use sparingly)
```php
apply_filters( 'upw_anim_engine_module_tabs', array $tabs )
```
Adds a full-config **Theme Settings → Animations** sub-tab for a module. Reserved
for modules that genuinely need site-wide configuration (Cursor, Page Transitions,
Scroll Progress, the Engine tab). **Do not register a tab merely to enable/disable
a module** — the "Add Animation" inserter is the control surface, and assets already
load on-demand, so an enable-only tab is redundant and will be stripped.

```php
add_filter( 'upw_anim_engine_module_tabs', function ( $tabs ) {
    $tabs['my_mod'] = array(
        'title'   => __( 'My Effect', 'fw' ),
        'options' => array( /* box → group → fields */ ),
    );
    return $tabs;
} );
```

### `upw_anim_engine_setting()` — reader helper — Stable
```php
upw_anim_engine_setting( string $key, mixed $default = '' ) : mixed
```
Reads one saved Animation Engine setting (from the Theme Settings → Animations
group). Use it PHP-side to feed a module's JS `cfg` (e.g. `reducedMotion`,
`disableMobile`) rather than re-reading the settings blob.

```php
$cfg = array(
    'reducedMotion' => upw_anim_engine_setting( 'respect_reduced_motion', 'yes' ),
    'disableMobile' => upw_anim_engine_setting( 'disable_on_mobile', 'no' ),
);
```

### `upw_<module>_enabled()` — gating convention — Convention
```php
function upw_my_mod_enabled() : bool // reads fw_get_db_settings_option('animation_my_mod')['enable'], default 'yes'
```
Every module ships a programmatic choke-point named `upw_<module>_enabled()`,
defaulting to enabled (`'yes'`). It's a code gate, **not** a UI toggle — keep it even
when the module has no settings tab, so the runtime has a single place to flip the
effect off. Check it in the wrapper filter and enqueue paths.

Related runtime helpers the module JS should reuse instead of re-rolling:
`upw_anim_use_asset( $module, $style )` (records a used style for the on-demand
loader), and the client-side `window.upwAnimRaf` scheduler + `window.upwReduceMotion()`
/ `window.upwIsMobile()` / `window.upwScrollProgress()` helpers.

---

## Shared Helpers

### `fw_upw_uploads_dir()` — required uploads router — Stable
```php
fw_upw_uploads_dir( string $subdir = '' ) : array // [ 'path' => …, 'url' => … ]
```
The **single required** router for anything the plugin/theme writes to the uploads
directory. Returns the absolute `path` and public `url` for
`wp-content/uploads/unysonplus/<subdir>` (no trailing slash). Never hardcode
`wp_upload_dir()['basedir'] . 'unysonplus-<x>'` — new upload folders MUST route
through this helper so everything stays under one parent.

```php
$dir = fw_upw_uploads_dir( 'my-cache' );        // …/uploads/unysonplus/my-cache
wp_mkdir_p( $dir['path'] );
$public_url = $dir['url'] . '/file.css';
```
From the theme, guard it: `function_exists( 'fw_upw_uploads_dir' ) ? fw_upw_uploads_dir( … )['path'] : <fallback>`.

### `sc_color_field_compact()` — color-preset field — Stable
```php
sc_color_field_compact( array $args = array() ) : array
// $args: label, kind ('text'|'bg'), value, desc, picker ('color-picker'|'rgba-color-picker')
```
Builds the **compact color-preset option** (preset dropdown + inline custom picker)
that ties element colors to Theme Settings → Colors. Use this for any element color
option — **not** a raw `color-picker`. `kind => 'text'` yields `text-{slug}` choices,
`kind => 'bg'` yields `bg-{slug}`.

```php
'glow_color' => sc_color_field_compact( array(
    'label' => __( 'Glow color', 'fw' ), 'kind' => 'bg' ) ),
```
Saved value shape: `{ predefined: 'text-red'|'bg-…', custom: '#hex' }` (preset wins).
Guard the call outside the shortcodes extension:
`function_exists( 'sc_color_field_compact' ) ? sc_color_field_compact( … ) : array( 'type' => 'color-picker', … )`.
**Exception:** the palette-*definition* UIs stay raw `color-picker` (you can't pick a
preset to define a preset).

### `sc_normalize_color_value()` — resolver — Stable
```php
sc_normalize_color_value( mixed $value, string $kind = 'text' ) : array // [ 'class' => …, 'style' => … ]
```
Resolves a saved compact-color value into a class + inline style for Styling-tab
consumers. Tolerates the legacy plain-hex string too, so it's migration-safe.

```php
$c = sc_normalize_color_value( $atts['glow_color'], 'bg' );
printf( '<span class="%s" style="%s">', esc_attr( $c['class'] ), esc_attr( $c['style'] ) );
```
For CSS-var / JS-hex consumers instead of a class: `predefined` →
`var(--color-{slug})` (strip the `text-`/`bg-` prefix); `custom` → the hex; for a
real hex (e.g. Three.js) map the slug via `unysonplus_color_preset_slug_map()`.

### `sc_section_background_field()` — use-element-as-Section-background — Stable
```php
sc_section_background_field( array $args = array() ) : array // a 'switch' option
```
Returns the standard **"Use as Section Background"** switch option. When on, the
element stretches to fill its parent Section and sits behind the Section's content
(the Section's other elements are auto-lifted on top). Drop it into an element's
options to make it eligible as a Section backdrop.

```php
'as_bg' => sc_section_background_field(),
```

### `unysonplus_color_preset_slug_map()` — slug→hex palette — Stable
```php
unysonplus_color_preset_slug_map() : array // [ '<slug>' => '#hex', … ]
```
Returns the live color palette as a `slug => hex` map, derived from the Theme
Settings → Colors presets. Use it when you need a **real hex** (WebGL/canvas tints,
JS color math) rather than a CSS `var()`.

```php
$map = unysonplus_color_preset_slug_map();
$hex = $map['red'] ?? '#e5484d';
```

---

## Theme Settings

### `fw_get_db_settings_option()` — read a saved setting — Stable
```php
fw_get_db_settings_option( string $option_id = null, mixed $default_value = null, $get_original_value = null ) : mixed
```
Reads a saved Theme Settings value on both the front end and admin. Pass an option
id (dotted paths work for nested groups) to get one value; omit it to get the whole
settings array. This is the durable read path behind conventions like
`upw_<module>_enabled()`.

```php
$accent  = fw_get_db_settings_option( 'general_colors/accent', '#2f74e6' );
$enabled = fw_get_db_settings_option( 'animation_my_mod' )['enable'] ?? 'yes';
```

---

## When to reach for source anyway

Some surfaces are intentionally **not** documented here because they shift too often
or are internal wiring, and this doc would go stale:

- **A shortcode's exact `options.php` atts schema** — the field ids/types are the AI
  contract but they change per element; read the shortcode's own `AGENTS.md`
  (auto-generated docs live in the Dev Kit's `docs/shortcodes/`).
- **Per-module JS registry shapes** (`window.upw<Mod>Fx`, the `run(el,cfg)` contract)
  and the `upw_anim_register_assets()` config keys — see the module authoring guide;
  they evolve with the asset loader.
- **Section-like registration internals** (`fw_section_like_types`,
  `Page_Builder_Section_Like_Item`, `FW_Section_Like_Registry`) — stable *as a
  recipe* but wired through several files; follow the section-like recipe rather than
  calling them directly.
- **Value-shape migrations** (converting a scalar option to `multi-picker` /
  compact-color) — inherently case-by-case; consult the workspace conventions before
  changing an existing option's type.
- Anything prefixed with an internal marker (`_init`, `_filter_*`, `_action_*`) or
  living under `core/` — implementation detail, not a public seam.
