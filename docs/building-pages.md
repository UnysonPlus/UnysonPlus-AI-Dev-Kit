# Building pages programmatically (page-builder + Animation Engine)

Compose any UnysonPlus page — a full site page, a demo, or a quick test — as a page-builder tree,
with Animation Engine effects that render, and with the page left **editable in the visual builder**.
You describe sections/columns/elements as a PHP array and call `upw_build_page()`; it stores the value
the way the builder itself does.

Helpers live in **`tools/upw-build-pages.php`**. This is the *mechanical* how-to. For the end-to-end
"turn a prompt into a site" workflow, see **[build-a-site.md](build-a-site.md)**.

> **⛔ Hand-authoring a tree to reproduce a SOURCE is a Rule-0 violation.** This file's PHP-array
> authoring is legitimate for a **fresh build, a demo, or a test** — where you're *creating* a page. It is
> **forbidden for a conversion** (a URL / screenshot / template / HTML dump to reproduce): there the
> deterministic converter **emits the tree**, and hand-writing one — even inside a `build-<slug>.mjs`
> factory — re-derives values the captured classes already encode and drifts from the source. If a source
> exists, run the converter and follow [`site-build-protocol.md`](site-build-protocol.md) Rule 0; the
> `.mjs` factory is only an *import format* seeded from the converter's output, never a licence to
> hand-measure. (This is the exact loophole that shipped the pinky-bites heading with a wrong emoji + mis-
> measured gaps.)

## Quick start

A page spec is ~15 lines:

```php
<?php
require __DIR__ . '/upw-build-pages.php'; // spec beside the lib; else an absolute path to your kit clone

$page = array(
  upw_section(array( upw_column('1_2', array(
    upw_element('special_heading', array('title'=>'Welcome','heading'=>'h1','alignment'=>'left',
      'scroll_keyframes'=> upw_skf(array('y'=>60,'opacity'=>0), null, array())) ),   // fade-up on scroll
    upw_element('text_block', array('content'=>'<p>Intro copy.</p>')),
  )), upw_column('1_2', array(
    upw_element('image', array()),  // fill via Media Library / attachment id
  )))),
);

echo upw_build_page('about', 'About Us', $page);   // slug (created if missing) or numeric ID
```

```bash
wp --path=/path/to/your/wordpress eval-file spec.php
# OK post #<id> "About Us" (builder editable) -> http://…/about/
#   effects in tree: scroll-keyframes:1
```

Then confirm the front end:

```bash
curl -s <your-site>/<slug>/ | grep -oc 'data-upw-skf'        # matches your keyframed element count
curl -s <your-site>/<slug>/ | grep -c  'scroll-keyframes.js' # >0 (the effect runtime enqueued)
```

## Helpers (`upw-build-pages.php`)

| Helper | Builds |
| --- | --- |
| `upw_element($shortcode, $atts)` | a leaf node (`special_heading`, `text_block`, `button`, `image`, `counter`, `icon_box`, …), auto `unique_id`. |
| `upw_column($width, $items, $atts=[])` | a column — width `1_1`,`1_2`,`1_3`,`2_3`,`1_4`,`3_4`,`1_5`,`5_6`,… (`1_5` is the one supported fifth). |
| `upw_section($columns, $atts=[])` | a section wrapping columns (`$atts` = section options: background, padding, bg_effect…). |
| `upw_spacer($vh)` | a tall empty section — gives scroll-driven effects room to travel. |
| `upw_skf($start,$mid,$end,$end_ease,$run_on_mobile)` | a `scroll_keyframes` att value (below). |
| `upw_effect_defaults($shortcode)` | dump an element's injected effect-option default shapes (below). |
| `upw_build_page($idOrSlug,$title,$builder)` | stores + reports; leaves the page editable in the builder. |

### `upw_skf()` — Scroll Keyframes att shape

Each state is a **sparse** array of any of: `x, y, scale, rotation, rotationX, rotationY, opacity,
blur` (unset = default: translate/rotate `0`, `scale 1`, `opacity 1`, `blur 0`). `$mid` is `null`
or `array('at'=>0-100,'ease'=>…,'v'=>array(…state…))`. Easing (per segment):
`linear | out | in | inout | back | sine`. Progress auto-derives from a Scroll Story scene slice if
the element is inside one, else the element's viewport travel.

### Other Animation-Engine effects

Every effect (`gsap_motion`, `scroll_reveal`, `parallax`, `interaction`/hover, `text_effect`,
`physics`, `marquee`, `motion_path`, `confetti`, …) is an att whose value shape is that module's
saved option value. Don't guess — **dump the live defaults** and edit a key or two:

```php
$d = upw_effect_defaults('special_heading');   // ['gsap_motion'=>[...], 'scroll_reveal'=>[...], ...]
$gsap = $d['gsap_motion']; $gsap['effect'] = 'fade-up';
upw_element('special_heading', array('title'=>'Hi','heading'=>'h2','gsap_motion'=>$gsap));
```

`upw_build_page()`'s `effects in tree` line reports what it detected; if it says `(none)`, your att
shape is off.

## How the storage works (why the helper, not raw meta)

The builder value is a JSON tree kept in post meta. The non-obvious rules the helper encodes — follow
them if you ever store it by hand:

1. **Delete first.** The framework reads the JSON from the flat `fw:opt:ext:pb:page-builder:json`
   meta key, but the **builder-active flag from the `fw_options` aggregate**. A stale value in either
   (from a prior write) makes `fw_get_db_post_option()` return the EMPTY default and the page renders
   nothing. Delete both, then write cleanly.
2. **Write both storages.** Write the flat `..:json` + `..:builder_active` keys AND
   `fw_options['page-builder'] = ['json'=>…, 'builder_active'=>true]`.
3. **Don't `wp_update_post()`** for the row — it fires `save_post`, whose page-builder handler
   re-syncs (and can wipe) the value on a deferred hook. Update the `posts` row with `$wpdb` directly.
4. **Don't render at build time.** Calling `do_shortcode`/`the_content` loads the builder value into
   the framework's request cache, which is flushed back on shutdown and can overwrite your write. The
   front end re-renders from the value on each request anyway (that's what fires each effect's
   enqueue), so no build-time render is needed.
5. **Injected effect atts survive** — `scroll_keyframes`, `gsap_motion`, etc. are registered on every
   shortcode's builder options, so a clean write keeps them. (Attribute completeness is *not*
   required; missing atts are filled with defaults on read.)

The JSON shape matches a real builder-saved page exactly:
`[ {type:'section', _items:[ {type:'column', width:'1_1', _items:[ {type:'simple', shortcode:'…', atts:{…}} ]} ]} ]`.

## When to reach for something else

- **Converting an existing site** → use the Site Converter / capture pipeline, **not** hand-built trees
  (Rule-0 violation — see the gate at the top of this file).
- **A production / heavily hand-tuned page** → prefer a source-JSON → importer flow with a manual-edit
  guard, so later hand edits aren't clobbered.
