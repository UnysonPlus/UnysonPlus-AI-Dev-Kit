<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# asset-optimizer extension

Combines enqueued frontend CSS and JavaScript into single minified, cached files to cut HTTP requests and payload. **Active by default:** yes.

## Provides

- **Shortcodes:** none.
- **Settings/options:** its own settings page under Extensions, three native `tab` containers:
  - **General** — `combine_css`, `combine_js` (master switches), `css_scope` (`site` shared bundle vs `per_page`), `css_delivery` (`file` linked stylesheet, default; `inline` = print the bundle in a head style tag when it is ≤ 50 KB gzipped), `webp_images` (off by default: WebP copy of every uploaded JPG/PNG, its sizes and `fw_image_tag` crops, swapped in on the front end when the copy exists and is smaller; existing images convert a few per page view; `.nowebp` marker for a copy that came out larger), `logged_out_only`, `exclude_urls` (one path/line, `*` wildcard).
  - **General** also carries `purge_css` + `purge_safelist` (see **Unused-CSS purging**), `preload_lcp_image` (see **Hero-image preload**) and `image_quality` (see **Image quality**). The first two are off by default; `image_quality` defaults to 82.
  - **CSS** — `css_handles` (checkboxes; every discovered stylesheet, all checked by default).
  - **JavaScript** — `js_handles` (checkboxes; only first-party checked by default), `js_defer`, `js_minify`.
  - Both handle lists render as **collapsible groups** with a tri-state parent checkbox, per-group counts, Check all / Uncheck all, a filter box and an "Only unchecked" toggle. The group comes from `fw_ao_asset_group( $handle, $src )` in `settings-options.php`, which keys off the asset's **path** (never the handle name) and is emitted onto each input as `data-ao-group` / `data-ao-group-label`; the grouped UI itself is progressive enhancement built in `render_settings_page()`'s inline CSS+JS over the stock `checkboxes` option type, so the inputs, their names and the stored value are unchanged and the list degrades to a flat one with JS off. Rows are moved into groups but **never re-sorted** — the server emits them in `prioritize_css_handles()` cascade order and that order is information. The Animation Engine's effect partials (`/css/animate/`, *not* a path containing `animation-engine`) form their own group, since their classes are applied by JS after load.
- **Public hooks/filters:**
  - `fw:ext:asset-optimizer:css_exclude_handles` / `:js_exclude_handles` — force-exclude handles from combining (passed the handle→src map).
  - `fw_image_crop_quality` — core filter on the crop encoder quality (default 82); the extension hooks it with the `image_quality` setting.
  - `fw:ext:asset-optimizer:purge_safelist` — the purge safelist (full preg patterns; defaults from `FW_AO_Purger::default_safelist()`).
  - `fw:ext:asset-optimizer:css_inline_max_bytes` — gzipped-size cap for `css_delivery: inline` (default 51200); a larger bundle stays a linked file.
  - `fw:ext:asset-optimizer:webp_quality` — WebP quality for `webp_images` (default 80).
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

## Notes / gotchas

- **Handle discovery** is done by a one-shot internal homepage fetch; behind a full-page cache (e.g. WP Engine) visit any page with `?fw_asset_optimizer_discover=1` to force a fresh scan.
- **Cascade-aware CSS order:** everything in print order, then parent theme, then `unysonplus-presets`, then the child theme LAST (so the theme keeps override authority). The combine pass runs at `wp_enqueue_scripts:99999` (after the theme's stylesheet orderer).
- **JS combining is conservative** — only local footer scripts with no async/defer and no inline/localized data are merged; core/CDN and per-request-data scripts are always left alone even if ticked. JS is always per-page.
- Cached bundles auto-purge on theme switch, plugin activate/deactivate, or any upgrade.
