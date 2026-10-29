<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Recipe — a child-theme fallback effect

**When the Animation Engine cannot do a motion you are reproducing**, you write it in the child theme,
using the same three hooks the built-in modules use, and you **report the gap**. This file is the how.

It is a *recipe*, not reference: [`architecture/extension-points.md`](../architecture/extension-points.md)
documents the hooks and their signatures, and [`extending.md`](../extending.md) covers building whole
modules. What follows is the narrower job — one effect, written to be temporary.

> **The order is not optional.** Try a native effect first (the catalogue is
> [`animation-engine/README.md`](README.md)); fall back only when nothing fits; **always report**.
> A fallback that nobody reported is a gap the engine will never learn about, and a page that silently
> stops matching the next time the theme is regenerated.

## Why a fallback is written to be thrown away

The point of reporting is that a frequently-reported motion gets promoted into the engine. When that
happens, your fallback has to come **off cleanly** — otherwise every site that carried it now has two
implementations of the same effect fighting each other, and the child theme's wins because it loaded
later. So the recipe is built around one idea: **everything the fallback touches carries one key, and
that key is the report id.** Removing the effect is then a grep.

| Thing | Name it | Why |
| --- | --- | --- |
| The option | `fb_<id>` | groups under one key in the Animations tab |
| The data attribute | `data-upw-fb-<id>` | one `querySelectorAll` finds every element using it |
| The CSS class | `upw-fb-<id>` | scoped; never a bare utility name |
| The report | fixture id `<id>` | the ledger row, the fixture and the code share one id |

Use the neutral fixture id, never a word from the source — `fb_01`, not `fb_acme_hero`. The no-brand
rule applies here exactly as everywhere else: **never a source site's name or domain**, in the key, the
label, the comment or the report.

## The three hooks

A per-element effect is three filters and a runtime. `scroll-keyframes`
(`animation-engine/modules/scroll-keyframes/scroll-keyframes.php`) registers through all three and is
the cleanest thing to copy — the line numbers below point at it.

### 1 · `sc_animation_fields` — the option (scroll-keyframes.php:52)

Appends your field set to the shared per-element **Animations** tab.

```php
add_filter( 'sc_animation_fields', function ( $fields ) {
    if ( ! is_array( $fields ) ) { return $fields; }      // defensive: another filter may have broken it
    $fields['fb_01'] = array(
        'type'    => 'multi-picker',
        'popover' => true,
        'label'   => __( 'Ribbon Unfurl', 'your-child-theme' ),
        'desc'    => __( 'Fallback effect — reported as fb_01.', 'your-child-theme' ),
        // …picker + choices, exactly as a built-in module declares them
    );
    return $fields;
} );
```

### 2 · `sc_needs_wrapper` — declare the wrapper (scroll-keyframes.php:286)

The element only gets its extra wrapper node when something actually needs one. Return early when it is
already needed, so you never override another module's decision:

```php
add_filter( 'sc_needs_wrapper', function ( $needs, $atts ) {
    if ( $needs ) { return $needs; }                      // somebody else already asked for it
    $c = ( isset( $atts['fb_01'] ) && is_array( $atts['fb_01'] ) ) ? $atts['fb_01'] : array();
    return ! empty( $c['enable'] ) && 'no' !== $c['enable'];
}, 10, 2 );
```

### 3 · `sc_build_wrapper_attr` — emit the config (scroll-keyframes.php:186)

Add your `data-` attributes to the wrapper and **set the page flag** so the runtime loads only where it
is used. Never return a new array — fold into the one you are given.

```php
add_filter( 'sc_build_wrapper_attr', function ( $attr, $atts ) {
    $c = ( isset( $atts['fb_01'] ) && is_array( $atts['fb_01'] ) ) ? $atts['fb_01'] : array();
    if ( empty( $c['enable'] ) || 'no' === $c['enable'] ) { return $attr; }

    $attr['class'] = trim( ( isset( $attr['class'] ) ? $attr['class'] : '' ) . ' upw-fb-01' );
    $attr['data-upw-fb-01'] = wp_json_encode( array(
        'distance' => max( 0, min( 400, (int) ( $c['distance'] ?? 120 ) ) ),   // clamp every value
    ) );
    upw_fb01_flag( true );                                  // "this page uses it"
    return $attr;
}, 10, 2 );
```

**Clamp everything that came from an option.** A value goes straight into a style or a transform; an
unclamped one from a bad import is a broken page, not a broken animation.

## Load it only where it is used

Built-in modules keep a static flag, set while building the wrapper and read in `wp_footer`
(scroll-keyframes.php:40 and :298). Copy that shape — an effect used on one page must not cost every
page a request:

```php
function upw_fb01_flag( $set = false ) {
    static $used = false;
    if ( $set ) { $used = true; }
    return $used;
}

add_action( 'wp_footer', function () {
    if ( ! upw_fb01_flag() ) { return; }
    wp_enqueue_script( 'upw-fb-01', get_stylesheet_directory_uri() . '/js/fb-01.js', array(), '1.0.0', true );
    wp_localize_script( 'upw-fb-01', 'upwFb01Cfg', array(
        'reducedMotion' => ( ! function_exists( 'upw_anim_engine_setting' )
            || upw_anim_engine_setting( 'respect_reduced_motion', 'yes' ) !== 'no' ),
    ) );
} );
```

## Reduced motion is part of the effect

The engine honours it on **both** sides, and so must a fallback. Server-side it passes the
`respect_reduced_motion` theme setting into the runtime config (above); client-side the runtime asks
the shared helper first and the media query second — so a site-wide override still works:

```js
function reduced() {
  if (window.upwFb01Cfg && window.upwFb01Cfg.reducedMotion === false) return false;   // setting says ignore
  if (typeof window.upwReduceMotion === 'function') return window.upwReduceMotion();  // shared helper wins
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

**State the degraded result, do not just skip.** The element must still arrive at its final, readable
state — an effect that returns early and leaves `opacity: 0` has hidden content from the people most
likely to need it.

## Two more conventions worth copying

- **Join the shared rAF loop.** `window.upwAnimRaf.add(fn)` when it exists, your own throttled
  scroll/resize listeners when it does not (scroll-keyframes.js does exactly this). Several effects each
  running their own `requestAnimationFrame` is how a page starts dropping frames.
- **Expose a rescan.** The page builder swaps markup without a reload, so publish
  `window.upwFb01Rescan = scan;` and guard each element with a `__initialised` flag, or the builder
  re-initialises the same node on every edit.

## Galleries: a different shape, same discipline

**Motion Gallery designs became pluggable in Animation Engine 1.4.26.** A gallery design is not an
effect on an element — it is a driver for a whole gallery instance — so it registers through its own
path: **three PHP filters plus a JS driver**. All four are required; miss one and the design either
never appears in the picker, falls back to `carousel_ring` at render, or appears with no behaviour.

| Step | Filter / API | What it does |
| --- | --- | --- |
| 1 | `upw_gallery_3d_design_groups` (options.php) | puts the design in the picker. Value = a label string, or `array( 'label' => ..., 'tile' => '<img url>' )` for a picker tile |
| 2 | `upw_gallery_3d_render_designs` (views/view.php) | adds the key to the **render whitelist** — without this it silently falls back to `carousel_ring` |
| 3 | `upw_gallery_3d_design_assets` (static.php) | `array( '<key>' => array( 'js' => $url, 'css' => $url, 'ver' => '1.0' ) )`, enqueued per instance only when that design is in use |
| 4 | `window.upwGallery3d.registerDesign( key, build )` | the driver itself |

The view emits `.tdg--<dashed-key>` generically (underscores become hyphens), so **no view change is
needed** — the key is the whole binding. The asset bundle from step 3 auto-depends on
`fw-shortcode-gallery-3d`, so `registerDesign` always exists by the time your file runs.

`build(ctx)` drives **one** instance. `ctx` carries `el`, `stage`, `cards`, `reduce`, `IN_EDITOR`,
`clamp`, `num`, `attr`, `progress`, `attachDrag`, `raf`, `loop` and `onResize` — so you read options
through `ctx.num()` / `ctx.attr()`, drive from `ctx.progress()` (0..1, already honouring a pinned stage
and the editor's frozen 0.4), and schedule through `ctx.loop()` rather than your own `requestAnimationFrame`.
`ctx.reduce` is the reduced-motion answer, already resolved for you — **use it; do not re-derive it.**

Two things the runtime does so you do not have to: a `__tdg` once-guard stops an instance being driven
twice, and your `build` runs inside a try/catch, so a faulty driver logs and leaves the rest of the page
working.

The naming convention above still applies — one key across the option, the class, the fixture id and the
report — and a gallery gap is still **reported**, with `surface: "gallery"`. What has changed is that it
is now a registered design rather than a bespoke fallback, so it comes off as cleanly as any other.

## Then report it

A fallback is only half the job. Send a **motion-gap** finding carrying the source motion, the fallback
you wrote and the neutral fixture id — see [`motion-gap-findings.md`](motion-gap-findings.md). Frequency
in the ledger is what decides which effects get promoted into the engine, so an unreported gap is a
fallback you will write again on the next site.
