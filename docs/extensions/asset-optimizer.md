<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# asset-optimizer extension

Combines enqueued frontend CSS and JavaScript into single minified, cached files to cut HTTP requests and payload. **How you get it:** not in the core-only plugin zip; it is in the parent theme's recommended set (offered on the *Install Compatible Extensions* screen when the plugin is activated with `unysonplus-theme` active), otherwise download it from **Unyson+ → Extensions**.

## Provides

- **Shortcodes:** none.
- **Settings/options:** its own settings page under Extensions, three native `tab` containers:
  - **General** — `combine_css`, `combine_js` (master switches), `css_scope` (`site` shared bundle vs `per_page`), `css_delivery` (`file` linked stylesheet, default; `inline` = print the bundle in a head style tag when it is ≤ 50 KB gzipped), `webp_images` (off by default: WebP copy of every uploaded JPG/PNG, its sizes and `fw_image_tag` crops, swapped in on the front end when the copy exists and is smaller; existing images convert a few per page view; `.nowebp` marker for a copy that came out larger), `logged_out_only`, `exclude_urls` (one path/line, `*` wildcard).
  - **General** also carries `purge_css` + `purge_safelist` (see **Unused-CSS purging**), `preload_lcp_image` (see **Hero-image preload**) and `image_quality` (see **Image quality**). The first two are off by default; `image_quality` defaults to 82.
  - **General** also carries `drop_admin_assets` (off by default; see **Drop admin-only stylesheets**).
  - **General** also carries `critical_css` and `js_source_map` (both off by default; see **Critical CSS** and **Combined-JS offset map**).
  - **General** also carries `inline_small_css` (off by default; see **Inlining leftover stylesheets**).
  - **General** also carries `webp_quality` (slider, default 80; see **WebP quality**).
  - **General** also carries `speculative_mode`, `speculative_eagerness`, `speculative_skip_sensitive` and `speculative_exclude` (see **Instant navigation**). Both selects default to `auto`, which leaves WP core's own behaviour untouched.
  - **CSS** — `css_handles` (checkboxes; every discovered stylesheet, all checked by default).
  - **JavaScript** — `js_handles` (checkboxes; only first-party checked by default), `js_defer`, `js_minify`.
  - Both handle lists render as **collapsible groups** with a tri-state parent checkbox, per-group counts, Check all / Uncheck all, a filter box and an "Only unchecked" toggle. The group comes from `fw_ao_asset_group( $handle, $src )` in `settings-options.php`, which keys off the asset's **path** (never the handle name) and is emitted onto each input as `data-ao-group` / `data-ao-group-label`; the grouped UI itself is progressive enhancement built in `render_settings_page()`'s inline CSS+JS over the stock `checkboxes` option type, so the inputs, their names and the stored value are unchanged and the list degrades to a flat one with JS off. Rows are moved into groups but **never re-sorted** — the server emits them in `prioritize_css_handles()` cascade order and that order is information. The Animation Engine's effect partials (`/css/animate/`, *not* a path containing `animation-engine`) form their own group, since their classes are applied by JS after load.
- **Public hooks/filters:**
  - `fw:ext:asset-optimizer:css_exclude_handles` / `:js_exclude_handles` — force-exclude handles from combining (passed the handle→src map).
  - `fw_image_crop_quality` — core filter on the crop encoder quality (default 82); the extension hooks it with the `image_quality` setting.
  - `fw:ext:asset-optimizer:purge_safelist` — the purge safelist (full preg patterns; defaults from `FW_AO_Purger::default_safelist()`).
  - `fw_ao_inline_small_css_max_bytes` / `fw_ao_inline_small_css_budget` — per-file cap (4096) and per-page budget (20480) for `inline_small_css`.
  - `fw_ao_critical_css_elements` — how many elements of `<body>` count as the first screen for `critical_css` (default 200).
  - `fw:ext:asset-optimizer:protected_classes` — plain class names/prefixes to keep through the purge; each is `preg_quote`d and anchored with ``, so `sc-toc` covers `sc-toc__num` and the rest. The ergonomic form of the safelist, for elements that generate their own markup — see **Protecting JS-generated markup**.
  - `fw:ext:asset-optimizer:css_inline_max_bytes` — gzipped-size cap for `css_delivery: inline` (default 51200); a larger bundle stays a linked file.
  - `fw:ext:asset-optimizer:webp_quality` — WebP quality for `webp_images` (default 80).
  - `fw:ext:asset-optimizer:speculation_sensitive_paths` — this extension's speculative-loading exclusion list, before it is merged into core's. Use it to REMOVE a built-in commerce exclusion; core's own `wp_speculation_rules_href_exclude_paths` can only add.
  - `fw_image_src_url` — core filter on each `fw_image_tag()` crop URL; `webp_images` hooks it to swap in the WebP.
  - `fw:ext:asset-optimizer:preset_css_handles` — the preset-CSS handle list (cascade ordering).
  - `fw:ext:asset-optimizer:settings-options:before` / `:after` — inject settings.
  - Public methods `is_combine_enabled('css'|'js')` and `combine_files($ordered,'css'|'js')` let cooperating extensions fold their own per-page assets into the cached bundle.

## Unused-CSS purging (`purge_css`, opt-in)

`FW_AO_Purger` (`includes/class-fw-ao-purger.php`) strips rules nothing on the page can match. Measured like-for-like on a real homepage: **256,591 → 85,422 raw, 39.3 → 16.3 KiB gzipped (59%)**, with **0** computed-style differences across six interaction states.

**Where it runs, and why there.** The combined file is built at `wp_enqueue_scripts:99999`, long before the body renders, so there is no DOM to scan at that point. Purging therefore happens on the FINISHED page: `start_purge_buffer()` (on `template_redirect`) buffers the response, `purge_buffer()` scans the HTML for its classes/ids, writes `purged-<key>.css` keyed by (bundle basename + token fingerprint + safelist + bundle mtime), and rewrites the `<link>` href. First view of a page shape generates; later views are cache hits.

**Gates.** `purge_enabled()` requires `purge_css` on, `combine_css` on, and `css_delivery: file` — with `inline` the bundle is already in the head before the buffer is seen. Admin/AJAX/REST are excluded, as is the discovery crawl (it must see the UNPURGED page or it would learn a handle list derived from an already-purged bundle).

**Matching is token-based**, not a selector engine: a rule is dropped only when a class or id it names is absent from the document. It over-keeps by design (`.a .b` survives when both exist but never nest). A browser-accurate engine measured ~51-55%; this trades a few points for not needing a selector→XPath layer that could disagree with the browser on `:has()` / `:where()`.

**Always kept:** selectors with no class and no id (`body`, `:root`, `a:hover`), any attribute selector (JS toggles those), every `@font-face`, every `@keyframes` (an animation can be started from JS or an inline style), and any at-rule not fully understood. Every failure path in `purge_buffer()` returns the HTML unchanged, and a purge that removed >98% of the bundle is discarded as a failed scan.

**Safelist — `FW_AO_Purger::default_safelist()` is the single source of truth.** The extension imports it; so do the tests. Do NOT copy it: a duplicated copy in the test file drifted, lost its word boundaries and still reported PASS. Patterns use `#` delimiters because the first one contains `~` in its combinator class — with `~` as delimiter PCRE rejects it, and `selector_survives()` suppresses preg errors, so an invalid pattern does not warn, it silently protects nothing. `tests/test-purger.php` asserts every default pattern compiles, for exactly that reason.

Why a safelist at all: purging without one destroyed 111 of 120 hover rules, every `[aria-expanded]` rule and 78 of 79 `.is-`/`.has-` state rules on one page — while a screenshot still looked perfect. Users add entries via `purge_safelist` (substring per line, or `/regex/`).

**Verifying — always run the control.** `verify-purge-live.mjs --control` captures twice with NOTHING changed; a result is only meaningful net of it. On this corpus the control reported 156 of card-stack's 160 differences (3D gallery JS rewrites transforms every frame) and, on one run of the scrollytelling page, reproduced all 10 of its differences with no purge applied at all. Run the control TWICE before believing it: a single clean control there would have convicted a page that is fine.

**Debugging:** `?fw_ao_nopurge=1` serves the full bundle for one request — the way to tell whether a rendering bug is the purge. Verify with `pw-screens/verify-purge-live.mjs`, which swaps the stylesheet INSIDE one page load; comparing two separate loads is invalid (a control with identical settings on both sides reported 1,950 phantom differences).

**Tests:** `php tests/test-purger.php` — 60 assertions, no WordPress needed.

### Also purged: WordPress's INLINE core CSS

`global-styles-inline-css` and `wp-block-library-inline-css` are printed as `<style>` blocks, not handles with a src, so neither the combiner nor the file pass can reach them. `purge_inline_styles()` runs them through the same purger in the same buffer: measured **28,632 → 10,164 bytes (65%)**, with global-styles alone **23,883 → 7,080 (71%)**. Only WordPress's own ids are touched (`purgeable_inline_style_ids()`, filterable) — the plugin's and theme's inline CSS is generated from the site's own settings and measured 0% unused.

Two fixes were needed to get there, both counter-intuitive:

1. **WordPress wraps global styles in `:root :where(...)`.** Stripping pseudo-class arguments left a bare `:root`, which carries no class, counts as "not judgeable" and is always kept — so the whole sheet survived and the pass saved **1%**. `selector_survives()` now looks INSIDE `:is()`/`:where()`, treating commas as OR. `:not()` and `:has()` are still stripped, because `:not(.x)` does not require `.x` to exist.

   **The trap this creates — `:not(:is(...))`.** `:not()` must be stripped WITH its nested parentheses, BEFORE `:is()` requirements are read, and a `[^()]*` regex cannot do that. The theme ships `.entry-content a:not(.btn):not(:is(.posts *))`, meaning "a link NOT inside `.posts`". Reading the `:is()` out of the `:not()` demanded `.posts` exist and dropped the rule on exactly the pages where it applies — every link on the gallery pages rendered teal instead of blue. `strip_pseudo()` does the balanced-paren removal; three regression tests cover it, including that exact selector. 57 unit tests did not catch this: they covered `:is()` and `:not()` separately, never nested. Only running the purge against a real page did.
2. **The `(is|has)-` state safelist was swallowing 16.6 KB.** It protects JS state classes like `.is-open`, but it also matched WordPress's `.has-vivid-red-background`, `.is-layout-flow` and friends — static CONTENT classes, which ordinary token matching judges correctly on its own. The pattern now carves those families out with lookaheads. 4% → 71%.

Verification must restore BOTH halves. `verify-purge-live.mjs` swaps the linked bundle *and* re-injects the original inline `<style>` contents; an earlier version swapped only the file, so the inline CSS was identical on both sides and 65% of it was being removed with nothing checking the result.

## Hero-image preload (`preload_lcp_image`, opt-in)

`preload_lcp_image()` emits `<link rel=preload as=image fetchpriority=high>` for the page's likely LCP element, adds `fetchpriority="high"` to the tag, and **removes its `loading="lazy"`**.

That last part is the point. The page builder marks every image lazy, **including the one in the hero**, so the browser was deliberately deferring the exact element that defines the LCP. A preload alone would have fought the lazy attribute; the two directives contradict each other and Chrome warns about it.

Selection: the first `<img>` after `</header>`, among the first three, that is not tiny (`width`/`height` < 150) and is not a logo/icon/avatar/badge/pixel/spinner by class or id. A first version used "first non-lazy image" and selected the 40px site logo.

Measured at 1.6 Mbps / 150 ms RTT / 4× CPU: LCP **3,208 → 2,320 ms (28% faster)**. The same change on localhost measures **4 ms** — latency is ~0 there, so discovery order cannot matter and the local number is meaningless for this feature. Always throttle.

## Cache headers for generated files (automatic)

`ensure_cache_headers()` drops an `.htaccess` into the cache dir setting `Cache-Control: public, max-age=31536000, immutable` on `.css`/`.js`. Measured before: the combined files came back with **no cache header at all**, so every repeat visit revalidated them. Caching them forever is safe by construction — each filename contains a hash of its contents, so a rebuild is a different URL. Written whenever the cache dir is created (both combine writers and the purge writer). Apache only; inert on nginx, where the same policy belongs in the server config.

## Image quality (`image_quality`, default 82)

The crop pipeline is CORE - `framework/includes/image-crops.php` - and this setting only surfaces its knob. Core applies the `fw_image_crop_quality` filter (default **82**, WordPress's own default) and calls `set_quality()` after `crop()` and before `save()`; the extension hooks that filter with `_filter_image_crop_quality()`. With the extension inactive the core default still applies.

Until this existed, `$editor->save()` was called with no quality set at all, so crops took whatever the editor defaulted to. Measured on a real site that was roughly **q88 - 0.167 bytes per pixel**, about double what a well-tuned WebP needs. Re-encoding the same pixels: q82 ~12% smaller, q80 ~18%, q75 ~33%. A real crop regenerated from the same source measured **37.8 KiB at q82 vs 31.5 KiB at q75 (-17%)**.

**WebP quality tracks it.** `fw:ext:asset-optimizer:webp_quality` was hard-coded to 80 while a crop could be written at any quality, so the two fought: at Image quality 90 the WebP copy was LOWER fidelity than the JPEG it replaced. The extension now hooks that filter with the same `image_quality` value.

What this does NOT do is force WebP to win. `FW_AO_Webp::make()` discards a copy that comes out larger than its source and writes a `.nowebp` marker, and at low quality the JPEG genuinely is smaller - measured on one image: q55 jpg 23.1 KiB (webp larger, jpg served), q70 27.0 KiB webp, q80 26.9 KiB webp, q90 26.9 KiB webp. Two things follow: serving the JPEG at low quality is the pipeline working, not failing; and **quality above 80 is wasted**, because the WebP flattens at 26.9 KiB while the JPEG balloons to 51 KiB and is never downloaded.

**Quality is part of the crop signature**, and it has to be. The signature is `ratio|crop|filesize|filemtime|q<quality>`; without the quality term every crop would still be found on disk under its old name and the setting would silently do nothing. Because the term is new, the first render after upgrading re-encodes each crop once, on demand - the saving appears gradually rather than all at once, and old files are left behind until the crops directory is cleared.

PNG sources are lossless, so quality is a no-op there. When testing this, note two traps that produced a false negative: pick a JPEG/WebP rather than a PNG, and use a FRESH PHP process per value, because `general_setting()` caches the settings store at bootstrap and an `update_option()` in the same process will not be seen.

## Crop width ladder

`fw_image_crop_widths` (core, `image-crops.php`) offers 320 / 400 / 480 / 560 / 640 / 768 / 900 / 1024 / 1280 / 1600, filtered to those below 90% of the crop's own width plus the crop width itself.

The ladder is dense at the small/middle end on purpose. `srcset` makes the browser take the first candidate at or above the slot it needs, so the wasted bytes are the gap to the next rung - on the old 320/480/640/768 ladder a 540px slot pulled the 640 file and threw ~12 KiB away, because 480 to 640 is a 1.33x step. No step now exceeds ~1.25x below 1024. Measured: a 540px slot picks 560w (13.3 KiB) instead of 640w (15.5 KiB), 14% less. Renditions are written on demand, so a width nothing asks for costs nothing; a typical crop gains about two extra files.

## Per-page memory of late-enqueued stylesheets (`css_scope = per_page`)

With per-page scope the bundle is built from the LIVE `$wp_styles` queue at `wp_enqueue_scripts:99999`. Anything enqueued *after* that point - a shortcode registering its stylesheet while the content renders, a plugin enqueuing during `the_content` - is never in it. Per-page scope had no memory, so the same handles were missed again on every request, forever. Measured on a converted site: **7 shortcode stylesheets, ~35 KB, render-blocking, on every page view.**

Site-wide scope never had this problem (it builds from the persisted map), but switching scope to dodge it is a bad trade - on the same site, site-wide + purge measured **112.0 KiB gzipped against per-page's 27.8**, because the bundle then carries CSS for every page and the safelist protects much of it from the purge. So per-page keeps its small bundle and gains the memory it was missing.

**How it works.** At `shutdown` the extension records which `all`-media handles the page actually used, in a transient keyed by `md5(path)` (`fw_ao_pg_<16 hex>`, `WEEK_IN_SECONDS`, max `PAGE_HANDLES_MAX` = 120 handles). On the next view of that same path, `late_page_css_handles()` returns the remembered handles that are *not* in the live queue and folds them into the bundle.

Guards worth knowing:

- **Keyed by PATH only** - the query string is dropped, so `?utm_source=…` and pagination args do not each mint a row.
- **No row is minted** for admin, AJAX, REST, non-GET/POST requests, or 404s (every typo'd URL is a different path).
- **Only `all` media** is recorded; a print- or query-scoped sheet must stay its own tag and the remembered list carries no media information.
- **Sources resolve through the site-wide map**, which is already filtered for dead files and backend-only assets - so a handle since removed, or one that turns out to be admin-only, cannot come back through this door.
- **The transient is only written when the set changes**, so a page with a stable handle list does not re-write on every view.
- Rows are dropped by `forget_page_css_handles()` on the same events that purge the bundles (theme switch, plugin activate/deactivate, upgrade, settings save).

**Behaviour to expect:** the first view of a path still links the late stylesheets separately; the second and every later view absorbs them. Verified on the converter test site - view 1: 7 stylesheets outside the bundle, views 2 and 3: **0**.

**Verifying a change here - read this first.** Comparing two captures by *hashing* `getComputedStyle` output is wrong: `JSON.stringify` of the property map is **order-sensitive**, and the enumeration order of custom properties shifts when stylesheet order changes, while every resolved value stays identical. That reported `754/754 elements differ` on a change with **zero** real differences - proved by an order-insensitive comparison over 668,703 property values (`0` diffs, and `0` elements differing in property *membership*; all 754 differed in property *order* alone). Compare property-by-property, as `pw-screens/verify-purge-live.mjs` does; never by serialised hash.

## Static-asset cache headers (`static_cache_headers`, opt-in)

Two separate mechanisms, deliberately different:

| | `ensure_cache_headers()` (automatic) | `sync_static_cache_htaccess()` (opt-in) |
|---|---|---|
| Covers | `uploads/unysonplus/asset-optimizer/` only | everything under `wp-content` |
| Policy | `max-age=31536000, immutable` | `max-age=31536000`, **no** `immutable` |
| Why safe | filenames are content hashes | `?ver=` on plugin/theme assets; WP never reuses an upload filename |

`immutable` is withheld from the general rule on purpose: it tells the browser not to revalidate even on an explicit reload, so a file replaced in place (FTP, a "replace media" plugin) would be unfixable for a year. Without it a hard refresh still picks up the replacement.

Measured on a live site before this existed - the extension's own files came back `max-age=31536000, immutable`, while uploads and theme fonts got the host default of `604800` (7 days) and plugin static JS came back with **no `Cache-Control` at all**. Lighthouse estimated 20 KiB, repeat-visit only.

**Why opt-in** rather than automatic like the folder rule: it writes outside the extension's own directory, it can interact with host rules and caching plugins, and the replace-in-place caveat is real. The folder rule is risk-free by construction; this one is a judgement call, so it belongs to the user.

**Implementation.** Written via `insert_with_markers()` under the marker `UnysonPlus Asset Optimizer`, so other rules in `wp-content/.htaccess` survive. Switching the option off calls `remove_static_cache_rules()`, which strips the block *and its markers* and deletes the file when nothing else was in it - `insert_with_markers( …, array() )` is the obvious way to do that but leaves an empty BEGIN/END pair behind for good. Every directive is wrapped in `IfModule`, so a server without `mod_headers` ignores it rather than 500ing. Synced from both save paths (`_maybe_save_settings` and `_after_manager_settings_saved`).

`server_reads_htaccess()` checks `SERVER_SOFTWARE` for apache/litespeed (unknown = assume yes). On nginx the settings description swaps to the equivalent `location` block from `static_cache_nginx_snippet()` instead of offering a switch that would silently do nothing.

Filters: `fw_ao_static_cache_extensions` (default css/js/mjs/woff2/woff/ttf/otf/eot/svg/png/jpe?g/gif/webp/avif/ico/mp4/webm), `fw_ao_static_cache_max_age` (default `YEAR_IN_SECONDS`, floored at a minute).

**Gotcha when editing the rule string:** the `FilesMatch` line is assembled from mixed single/double-quoted PHP and a stray `\"` lands a literal backslash before the closing quote, which is an Apache syntax error - i.e. a 500 on every page, not a silent no-op. Print the generated block (reflection on `static_cache_rules()`) and read it before trusting a change.

## Front-end editors are exempt (automatic)

`request_is_editor()` stands the whole optimizer down - combining **and** purging - for a request carrying a front-end editor's query var. Checked in `should_combine()`, which `purge_enabled()` and the public `is_combine_enabled()` both route through, so one check covers every path.

**Why it is needed.** The Live Editor draws its entire interface with JavaScript after the document loads, so none of the class names it styles exist in the HTML the purger scans. Every rule styling the editor reads as unused and is removed, and the editor comes up as an unstyled stack of links. Reproduced and confirmed by control: with the bypass disabled the editor rendered as a bare list (`liveEditorSheets: 0`, its CSS folded into the purged bundle and stripped); with it enabled, 128 individual stylesheets, no bundle, editor correct.

The safelist cannot solve this - the markup does not exist at scan time, and hand-listing an entire extension's CSS is a list nobody maintains.

**Why combining is disabled too**, though combining is not what broke it: the editor then sees exactly the stylesheets it enqueued in the order it enqueued them, which is the state it was built against. Nothing is lost - a logged-in authoring screen has no visitor performance to win.

Two seams, both public:

- `fw_ao_editor_query_vars` - the query vars that mark an editing context (default `fw-live-editor`, `fw-live-editor-frame`). An extension rendering its own editor through the theme adds its own here.
- `fw_ao_skip_request` - a bool to skip all optimization for this request. The Live Editor hooks this itself (`_filter_asset_optimizer_skip`, registered in its `_init`) so the two stay in step if its query vars are ever renamed; the defaults above are the belt to that braces.

Verified scoped: a plain visitor request to the same URL still receives the purged bundle.

## Protecting JS-generated markup (`protected_classes`)

`collect_tokens()` scans the **rendered HTML**. A class that only ever appears in an external `.js` file is therefore never seen, every rule naming it reads as unused, and the purge removes it. The failure is **silent** - no warning, no error; the rule is simply absent from the served file, and the symptom is an element that loads unstyled.

Confirmed from a live site: the **TOC** element builds its `<li>`/`<a>`/number spans in `scripts.js`, so `sc-toc__num`, `sc-toc__item`, `sc-toc__link` and `sc-toc__sublist` exist nowhere in `views/view.php`. The served `purged-*.css` contained no `sc-toc__num` at all and had lost `.sc-toc__link{display:inline-flex}`, so the links rendered as plain inline text 21px tall and failed Lighthouse's 24px tap-target audit, with the numbers running into the titles. Reproduced against the real stylesheet: with the defaults only, 4 of those 5 classes were purged; with the prefix registered, all of them survive.

**The fix.** Register the class names from the element's own `static.php`:

```php
add_filter( 'fw:ext:asset-optimizer:protected_classes', function ( $classes ) {
	$classes[] = 'sc-toc';   // plain prefix - no delimiters, no regex
	return $classes;
} );
```

Each entry is `preg_quote`d and anchored on a word boundary, so one prefix covers the whole family. Note `preg_quote` escapes the hyphen, so the stored pattern reads `~\bsc\-toc~` - a `strpos( $pattern, 'sc-toc' )` check against the assembled safelist will not find it, though the pattern matches correctly. Use `fw:ext:asset-optimizer:purge_safelist` instead when a genuine pattern is needed.

**Register from `static.php`, not globally.** `static.php` runs only when the element is actually on the page, so the protection is scoped to those pages and the purge stays fully effective everywhere else. It runs at `wp_enqueue_scripts`, comfortably before the purge reads the safelist in the output-buffer pass.

**Scale matters when choosing this vs. the stand-down.** One element's class family → register the prefix. An entire extension's interface drawn by JS (the Live Editor) → stand the optimizer down instead, per **Front-end editors are exempt**; hand-listing a whole extension's CSS is a list nobody maintains.

### Safelist patterns are validated (and failures reported)

`selector_survives()` matches with `@preg_match()`, which treats a malformed pattern as "no match". That is correct there - one bad entry must not warn on every selector of every page - but it meant a typo in `purge_safelist` protected **nothing at all**, with no indication why. That cost real debugging time on a live site.

`validate_safelist()` now compiles each pattern once (memoized per request, keyed by the list's own hash), drops the ones PCRE refuses, records them in a static, and `error_log`s them under `WP_DEBUG`. `_safelist_error_notice()` reports them in wp-admin on every screen - not only the extension's settings page, because the symptom is missing CSS on the **front end** and whoever is chasing that will not think to open the page where the pattern was typed. `FW_Extension_Asset_Optimizer::get_safelist_errors()` exposes the list.

## Drop admin-only stylesheets (`drop_admin_assets`, opt-in)

`is_backend_css_handle()` already recognised `dashicons`, `admin-bar`, `wp-pointer`, `/wp-admin/`, `/includes/option-types/` and the dashicons **path** regardless of registering handle. But it was only ever consulted while **building the combined file**, and excluding a handle from the bundle leaves its own `<link>` in place - so the browser still fetched it as a separate render-blocking request. Measured on a real site: `dashicons.min.css`, 35.6 KB, **100% unused**, downloaded by every logged-out visitor for an icon font only wp-admin draws. Excluding it from the bundle never addressed that; only dequeuing does.

`dequeue_admin_assets()` runs on `wp_enqueue_scripts` at **99998** - deliberately before the combiner at 99999, so the capture sees the list as it will actually be printed.

Two details that matter:

- **It resolves the dependency closure first** (`$styles->all_deps( $styles->queue )`, then walks `$styles->to_do`). `dashicons` normally arrives as a **dependency** of another handle rather than queued directly, so walking `$styles->queue` alone misses it. Verified: the reproduction enqueued it exactly that way and it was still dequeued.
- **It clears `$styles->to_do` afterwards**, since `all_deps()` populated it as a side effect; the normal print pass then recomputes against the changed queue.

Three stand-downs: the **admin toolbar** showing (it draws its own glyphs from dashicons, and logged-in users are not whose page weight this is about), `request_is_editor()`, and `request_is_excluded()`.

Opt-in because "admin-only" is a judgement about intent - a theme may legitimately use a dashicon on the public site, and this would take those glyphs away. Verified on a staged reproduction: logged out, 1 dashicons `<link>` → 0 with the switch on, page still 200 with its other stylesheets intact and no PHP notices; logged in with the toolbar showing, the font is kept.

## Generate missing image sizes (`generate_image_sizes`, opt-in)

`FW_AO_Subsizes` (includes/class-fw-ao-subsizes.php) fills in intermediate sizes an import never produced, so a `srcset` has something between the smallest file and the full original.

**The problem.** A srcset can only offer sizes that exist on disk. The Site Converter imported with `thumbnail` + `medium` only (resizing is the bulk of its media phase), so the browser was handed a 300w file and the original and nothing between, and took the original at every slot. Measured on a converted page: a **1024x434 slot pulled the 1440w file at 91.9 KiB**; with the sizes present it took the **1024w file at 67.7 KiB — 26% less for identical rendered pixels**.

**The hook matters.** `wp_calculate_image_srcset_meta` runs *before* the candidate list is built and returns the metadata used to build it, so generating there corrects the srcset **on the request that triggered the work**, not the next one. Verified: the repair and the smaller download both happened on view 1.

**Budget.** One attachment per request (`fw_ao_subsizes_per_request`), against WebP's eight, because this runs while a visitor waits — measured **~154 ms** to generate 3 sizes from a 1440x611 original. Only images actually rendered on a page are ever touched.

**The bug this nearly shipped with.** Judging success by `is_wp_error()` is not enough: given a **corrupt original, `wp_update_image_subsizes()` returns an ordinary array**, having generated nothing, in ~7 ms. The sizes stay missing, the attachment is picked again next view, and since the budget is 1, that one unfixable image would consume the whole allowance **on every view, blocking every other image on the page forever**. Success is therefore judged by whether the missing-size count actually fell; if not, `_fw_ao_subsizes_failed` is set and the attachment is skipped (cleared on `attachment_updated`). Verified: marker sets on view 1, view 2 moves on.

**Front-end gotcha.** `wp_get_missing_image_subsizes()` and `wp_update_image_subsizes()` live in `wp-admin/includes/image.php`, which is **not loaded on the front end**. Gating registration on `function_exists()` for either is always false exactly where the feature must work, and the filter is never registered — this cost a debugging round. The file is required on demand inside `maybe_fill()`.

**Converter side.** As of site-converter 1.11.25 the import default is `thumbnail, medium, medium_large, large` (filter `fw_sc_media_image_sizes`), measured at **61 ms -> 162 ms per image, about +5 s on a 50-image conversion**. 1536/2048 are still skipped - rarely chosen, most expensive. This option remains the repair path for libraries imported before that change, and for any non-converter site with incomplete metadata.

## Move late CSS into the head (`hoist_late_styles`, opt-in)

`hoist_late_styles()` moves `<style id="...">` blocks printed in the BODY up to the end of `<head>`, inside the existing output buffer (which this option now also triggers on its own).

**Why.** The flexbox shortcode collects each instance's rules while the content renders and prints one consolidated block on `wp_footer` — [class-fw-shortcode-flexbox.php](../../../unysonplus/framework/extensions/shortcodes/shortcodes/flexbox/class-fw-shortcode-flexbox.php) calls it *"Phase 4 of the clean-output plan"*. Consolidating is right; the problem is that those rules include `max-width` and `margin:auto`, i.e. they decide where an element **sits**. The browser lays the element out without them, paints, then re-lays out when the block lands at the bottom of the document.

Measured on a converted page: the hero painted left-aligned at **x=24** and jumped to its centred **x=384** when the footer block arrived (byte 52,223 of 53,437) — a 360px *horizontal* move.

```
hoist OFF   CLS: 0.1468  0.1468  0.1468
hoist ON    CLS: 0       0       0
```

Zero computed-style differences across 249 elements: the page renders identically, it just stops moving.

**⚠ Lighthouse blames the wrong thing.** It attributes this shift to **"Web font"** and names the woff2. It is not the font: blocking every font outright still measured **0.1451**. Earlier work in this repo chased the font on that basis and produced a metric-override fix that is correct in isolation and changes nothing on the real page (the converter's font preload already lands the font before first paint). If a layout shift here is *horizontal*, it is not a font.

**Cascade safety.** Blocks keep their relative order and are inserted at the very end of `<head>`, after every stylesheet already there, so each rule keeps the priority it had; nothing else in a normal document sits between them and the body. Only `id`'d blocks move (an anonymous `<style>` may be hand-placed in content), `<noscript>` blocks are left alone, and `fw_ao_hoist_styles_skip` exempts an id. Skipped in admin/AJAX/REST and in the Live Editor.

**Gotcha for anyone editing the regex:** the pattern was first written through a Python heredoc, which turned `` and `` into literal control bytes (0x08, 0x01) in the PHP source. It compiled, matched nothing, and failed silently — the feature appeared to do nothing while every step passed when tested in isolation. `sed -n 'Np' file | cat -A` is what found it. Verify any regex written by tooling with `cat -A` before trusting it.

## Critical CSS (`critical_css`, opt-in)

Runs as a `filter_buffer()` pass **after** the purge pass, so the `<link>` it splits is already the purged copy. Gated off for `css_delivery: inline` (the sheet is already in the page — there is no blocking request left to remove), the front-end editor and excluded URLs.

**The gap it fills.** A linked sheet blocks first paint. `css_delivery: inline` removes the block only by moving the whole sheet into every HTML response, and `inline_purged_css()` refuses past `css_inline_max_bytes` (**50 KiB GZIPPED** — note `:1281` measures `gzencode($purged, 6)`, not raw bytes). Reported from a live site: 338 KiB raw / **91 KiB gzipped**, nearly 2× the cap, so inlining was refused and was right to be — it would have added 91 KiB to every navigation to save one blocking request on the first. Per-page purging makes that trade *worse*, because each template's sheet differs so nothing is reused across pages.

**How the subset is chosen.** `FW_AO_Purger::collect_tokens_above_fold( $html, $n )` collects tokens from the `<html>` tag plus the first `$n` opening tags of `<body>` (`PREG_OFFSET_CAPTURE` so the slice lands on a tag boundary), then the ordinary purger runs against those tokens **with an empty safelist**. Empty is deliberate: the safelist protects rules for moments a static scan cannot see (hover, open, in-view), and those are by definition not the first paint — they are in the deferred sheet. Safelisting here would defeat the size reduction that is the whole point.

Document order stands in for viewport position. That is the approximation, and its failure mode is named in the docblock: a layout whose hero sits late in the source (placed by grid/`order`) gets a subset that misses it and flashes for a frame. It errs toward *too little* critical CSS, which costs a flash; the opposite error costs the feature's purpose. Hence a generous default `$n` and the `fw_ao_critical_css_elements` filter.

**Delivery of the remainder:** `media="print"` plus `onload="this.media='all';this.onload=null"`, with a `<noscript>` copy of the original tag. Not `rel=preload`: that needs a polyfill to actually apply the sheet and can double-fetch.

**Bails, leaving the page untouched,** when there is no combined/purged `<link>`, when the scan learned nothing, or when the subset is `< 1%` (scan failed) or `> 60%` (no blocking request worth saving) of the source. The 60% guard is why it correctly does **nothing** on a short page: if the document has fewer elements than the window, the "above the fold" tokens are the whole document, the subset equals the source, and there is no split to make. A short page is not a bug report.

**Verified:** 36 KiB inlined of an 87 KiB purged sheet; the deferred link's `media` confirmed flipping to `all` after load; and **0 differing computed styles across 289 elements × 16 properties** against a control run with the option off (the only DOM delta is the added `<style>` and `<noscript>`, which is why a naive positional diff reports 2 extra elements — filter those two tags before comparing). Zero page errors.

## Combined-JS offset map (`js_source_map`, opt-in)

**Why.** A long-task or forced-reflow report against a combined bundle is unactionable: the line number belongs to a file nobody wrote. `build_combined_js_file()` always wrote a `/* ==== handle ==== *` marker before each source, but `$minify` ran `FW_AO_Minifier::js()` over the **whole concatenation** and strips comments — so the markers disappeared in exactly the case that needed them. Worse, the documented workaround (turn `js_minify` off and re-measure) changes the artifact being measured and means touching a production setting on a live site, which is often simply not available.

**How.** With the flag on, each source is minified **separately**, the marker is added *after* minifying so it survives, and the line count is taken as the bundle is assembled. A sidecar `combined-<hash>.js.offsets.json` records `handle`, `source` (via `path_to_relative()`, so the server layout is not leaked) and inclusive 1-based `first_line`/`last_line`.

Per-source minification is equivalent in effect — the minifier removes comments and whitespace, it does not rename or reorder. Verified by rebuilding both ways and comparing: **identical ignoring whitespace**, the difference being line-break placement plus the markers (41,460 vs 41,162 bytes). The map flag therefore joins the bundle hash signature, since it changes where line breaks fall.

**Not a `.map`.** The combiner concatenates whole files, so a line range per source is all there is to say, it needs no tooling to read, and a real source map would promise column-level mappings into originals we do not have — most sources here are already-minified vendor files carrying maps of their own.

**Verified** against a real bundle: 8 sources; ranges contiguous with no gaps; final `last_line` equal to the bundle's own line count; every `first_line` landing on its handle marker; bundle line 354 resolving to `navigation.js`.

## Inlining leftover stylesheets (`inline_small_css`, opt-in)

**The gap.** The combiner cannot reach every stylesheet, and some it is *forbidden* to touch. The worked example is the Animation Engine: `includes/asset-loader.php` registers `fw:ext:asset-optimizer:css_exclude_handles` to keep every `upw-<module>-*` handle out of the **site-wide** bundle. That is correct, not a workaround — the site-wide bundle is built from every handle ever discovered, so folding in on-demand per-style partials would ship every effect's CSS on every page, the exact bloat its on-demand loader exists to prevent. It then folds the partials a page actually used into its own per-page file via AO's public `combine_files()`.

Right in principle, and still a round trip per leftover. Measured on a real page: four blocking sheets of 1.0, 1.0, 0.8 and 1.1 KiB, estimated 380 ms of render-blocking between them, sitting at the end of `<head>` outside an already-inlined main bundle. **At that size the round trips are the cost, not the bytes** — the exact inverse of the full-bundle case `css_inline_max_bytes` exists to refuse, which is why this is a separate switch rather than a bigger cap.

**Where it runs, and why there.** Last among the `filter_buffer()` passes, on the finished HTML. That is deliberate: it therefore does not care which hook enqueued a sheet or how late, which is precisely what put these beyond the combiner's `wp_enqueue_scripts:99999` capture to begin with.

**Refusals**, each for a reason:

- over `fw_ao_inline_small_css_max_bytes` (4096) per file, or past `fw_ao_inline_small_css_budget` (20480) per page;
- a media-scoped sheet (`print`, a media query) — not blocking paint, and the condition would be silently lost once the rules are inline;
- a `<link>` inside `<noscript>` — it would otherwise swallow the fallback copy that critical-CSS delivery puts there, applying it to everyone. Noscript ranges are collected with `PREG_OFFSET_CAPTURE` and matched by offset;
- anything `url_to_path()` cannot resolve to a readable local file.

Relative `url()` paths go through the existing `rewrite_urls( $css, $source_url )`, since the CSS no longer lives at that path. Edits are applied **from the end backwards** with `substr_replace` so earlier offsets stay valid.

**Does it undo the exclusion it works around?** No. The exclusion protects against *site-wide* bloat; this inlines per page, so a page carries only what that page already linked.

**Verified:** two small sheets inlined and their links gone; a `print`-scoped sheet and an over-cap sheet left as links; `url(dot.png)` rewritten absolute; with `critical_css` also on, the deferred `media="print"` link and its `<noscript>` copy both untouched and the purged CSS not wrongly inlined; stylesheet links 8 → 6; and **0 differing computed styles across 276 elements** against a control with the switch off, no page errors.

## WebP quality (`webp_quality`, default 80)

**The bug this fixes, because it is a trap worth knowing generally.** `FW_AO_Webp::make()` called `$editor->set_quality( $q )` and then `$editor->save( $out, 'image/webp' )`. `WP_Image_Editor::save()` re-derives the quality whenever the **output** format differs from the **source's** — which it always does here, JPEG/PNG in and WebP out — so the value set beforehand was discarded and WordPress's own WebP default of **86** used instead.

Measured on a real 768×512 photo from a live site: **75,944 bytes at every requested quality from 80 down to 60**, with `get_quality()` reporting 86 each time. So `fw:ext:asset-optimizer:webp_quality` had never affected a single image since it was introduced. It failed silently and plausibly: the copies were still smaller than the JPEGs, so the "only keep it if it is smaller" guard passed and nothing looked wrong — they were just 7–19% smaller instead of the 25–40% WebP should manage.

**The fix:** set it through `wp_editor_set_quality`, added immediately before the save and removed immediately after, scoped to `image/webp` so nothing else on the request is affected. Same photo: **59,398 at a genuine 80 (−22%), 46,362 at 70, 41,260 at 60.**

Verify a quality change the way it actually happens — **save the setting in one request and encode in another.** `general_setting()` memoizes the settings store per request, so a script that calls `update_option()` and then `make()` in the same process re-encodes at the *previous* value and looks like an off-by-one bug. It is not; it is the memo.

**Staleness.** A twin is out of date when its mtime is older than `max( source mtime, quality_changed_at )`. `quality_changed_at()` keeps `{quality, changed_at}` in the `fw_ao_webp_quality_state` option and stamps a new time whenever the effective quality differs from the stored one, so copies written at the old quality are redone under the existing `MAX_PER_REQUEST` throttle instead of sitting stale forever. Without this, changing the setting would do nothing to the images already on disk — a silent no-op of exactly the kind this extension keeps producing.

`FW_AO_Webp::quality()` resolves the setting, falls back to 80, then applies the `fw:ext:asset-optimizer:webp_quality` filter (so the filter still wins over the UI) and clamps to 1–100.

## Instant navigation (`speculative_mode`, default `auto`)

Speculative loading via the browser's Speculation Rules API: the browser prefetches, or fully
prerenders, a likely next page so a click lands on something already in memory. `FW_AO_Speculation`
(`includes/class-fw-ao-speculation.php`), registered from `_init()` in every context.

**WP core owns the mechanism** (6.8+, `wp-includes/speculative-loading.php`) and this class does not
reimplement any of it. Core already:

- returns `null` from `wp_get_speculation_rules_configuration()` for **logged-in users** and for
  sites with no `permalink_structure`, disabling the feature outright;
- excludes `/wp-*.php`, `/wp-admin/*`, uploads, `wp-content`, plugins, template and stylesheet dirs,
  and — under pretty permalinks — **every URL with a query string** (`/*\?(.+)`);
- excludes `a[rel~="nofollow"]` and `.no-prefetch` / `.no-prerender` (plus their descendants);
- resolves `auto` to `prefetch` / `conservative`, overridable by the host via
  `WP_SPECULATIVE_LOADING_DEFAULT_MODE` / `_EAGERNESS`.

**What the extension adds:**

| Setting | Values | Effect |
|---|---|---|
| `speculative_mode` | `auto` \| `prefetch` \| `prerender` \| `off` | `auto` skips the config filter entirely; `off` returns `null` |
| `speculative_eagerness` | `auto` \| `conservative` \| `moderate` \| `eager` | core refuses `immediate` for document rules |
| `speculative_skip_sensitive` | bool, default **true** | adds the commerce/account exclusions below |
| `speculative_exclude` | one path per line | `#` comments; a pasted full URL is reduced to its path |

Hooks used: `wp_speculation_rules_configuration` (only registered when either select is not `auto`)
and `wp_speculation_rules_href_exclude_paths`.

**Why `speculative_skip_sensitive` exists.** Core's query-string exclusion covers `?add-to-cart=`
and nonce'd action links, but **not** a pretty permalink like `/cart/` or `/my-account/orders/` — and
**WooCommerce registers no exclusions of its own** (verified against the bundled WooCommerce: no
`wp_speculation_rules*` hook anywhere in it). A prefetch is a real request, so it starts a WC session
for a visitor who never went there; a prerender also executes the page's JS. The paths are resolved
from `wc_get_page_id( 'cart' | 'checkout' | 'myaccount' )` and `edd_get_checkout_uri()`, so a renamed
or translated page is still covered; the hard-coded slugs (`/cart/`, `/checkout/`, `/my-account/`,
`/account/`) are a fallback used only when neither plugin answers.

**Gotchas:**

- `filter_configuration()` **returns `null` unchanged** when core passes `null`. Forcing a mode there
  would re-enable speculative loading for logged-in users, which core deliberately disabled.
- Paths are emitted **site-root-relative**. Core's `WP_URL_Pattern_Prefixer::prefix_path_pattern()`
  prefixes the site's subdirectory and strips an already-present one, so `/cart/` and
  `/subdir/cart/` both end up as `/subdir/cart/` — but `relative_path()` normalises anyway so the
  list is uniform.
- **Prerender executes the page.** Scroll-triggered motion can run to completion unseen, and
  analytics can log a phantom view unless the script waits for `prerenderingchange`. Prefetch is the
  safe default to recommend.
- **Chromium-only** today. Other browsers ignore the rules; nothing degrades.
- Verify with DevTools → Application → **Speculative loads**, or over CDP with the `Preload` domain
  (`Preload.ruleSetUpdated` reports `accepted` or an `errorType` — the authoritative validity check;
  note that Playwright's bundled Chromium accepts the rule set but does **not** appear to issue the
  prefetch requests, so a `Sec-Purpose` header count of 0 under automation is not a failure signal).

## Notes / gotchas

- **Handle discovery** is done by a one-shot internal homepage fetch; behind a full-page cache (e.g. WP Engine) visit any page with `?fw_asset_optimizer_discover=1` to force a fresh scan.
- **Cascade-aware CSS order:** everything in print order, then parent theme, then `unysonplus-presets`, then the child theme LAST (so the theme keeps override authority). The combine pass runs at `wp_enqueue_scripts:99999` (after the theme's stylesheet orderer).
- **JS combining is conservative** — only local footer scripts with no async/defer and no inline/localized data are merged; core/CDN and per-request-data scripts are always left alone even if ticked. JS is always per-page.
- Cached bundles auto-purge on theme switch, plugin activate/deactivate, or any upgrade.

## What this extension can and cannot fix (2026-10-01)

A Lighthouse run against a converted site put three of its complaints here, and only two belonged here. The
split is worth stating, because reaching for an optimizer setting to paper over wrong markup wastes the
setting and leaves the markup wrong.

- **Unused CSS is a symptom; an enqueue is the cause.** A converted page shipped Font Awesome's 24 KB
  stylesheet with **zero** elements using it, because three shortcodes named `font-awesome` as a hard CSS
  *dependency*. `purge_css` would have stripped most of its rules and still left the five `@font-face`
  declarations and the font requests — and those faces declare `font-display: block`, which withholds text
  paint until they resolve. Purging a stylesheet that should never have been enqueued treats the wrong layer.
  The fix was in the shortcodes (enqueue FA only where a font icon actually renders); the purger is for CSS
  that is legitimately loaded and only partly used.
- **`preload_lcp_image` and the converter's `fetchpriority` are complementary, not alternatives.** The
  extension can preload the hero; it cannot undo an `<img loading="lazy">` on it. The Site Converter now marks
  a page's first image `fetchpriority: high` (which the media-image view renders as eager) — turn
  `preload_lcp_image` on as well and the two reinforce each other. Measured on a conversion before the fix:
  the above-the-fold hero carried `loading="lazy"` while its source *preloaded* the same image.
- **No setting here can supply a missing `width`/`height`.** Layout shift from an image with no stated box is
  a markup defect; the optimizer only rewrites delivery. (Fixed converter-side — see
  [site-converter.md](site-converter.md) → "A conversion's Lighthouse score is a converter measurement".)

**Reading a conversion's Lighthouse report**: always run the SOURCE too and compare. Its complaints sort into
three piles — ours, the source's (faithfully reproduced), and the host's — and only the first is worth acting
on here. On one real pair the contrast failures and the oversized-image waste were both *inherited*, with the
source wasting more than the conversion.
