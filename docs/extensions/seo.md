# seo — Search Engine Optimisation

Dynamic title and meta-description templates with auto-generation, canonical URLs,
indexing control, sharing cards, and a live search-result preview in the editor.

- **Slug:** `seo` · **Repo:** `UnysonPlus-SEO-Extension` · **Active by default:** no
  (downloadable from Unyson+ → Extensions)
- **Provides:** `%%tag%%` template engine · title + description resolution ·
  `<link rel="canonical">` · robots directives · **XML sitemaps** ·
  **Open Graph + Twitter cards** · **JSON-LD graph** ·
  **list columns / inline editing** · **import from Yoast / Rank Math /
  SEOPress / AIOSEO** · site-verification tags ·
  two option types (`seo-template`, `seo-preview`)
- **Does not provide (yet):** a redirect manager, per-page schema overrides,
  Product/Event/Recipe types. `BreadcrumbList` lives in the separate
  [`breadcrumbs`](breadcrumbs.md) extension; `FAQPage` is emitted by the
  **accordion shortcode**, not here.

---

## The model

Four objects, each replacing a pattern the pre-2.0 extension repeated per location.

| Class | What it owns |
|---|---|
| `FW_SEO_Context` | The request, resolved once on `wp` into a typed object. Ask it `type()`, `post()`, `term()`, `user()`, `page()`, `template_key()`, `url()`. |
| `FW_SEO_Tags` | The `%%tag%%` registry: lazy resolvers, prefix-matched families, modifiers, and the empty-tag collapsing. |
| `FW_SEO_Chain` | The one `override → template → auto → fallback` ladder every field shares. |
| `FW_SEO_Head` | The single collector everything in `<head>` goes through. Keyed, so a second writer replaces rather than duplicates. |
| `FW_SEO_Sitemap` | The sitemap provider registry + index, chunking, XSL and rewrite rules. |

Supporting: `FW_SEO_Store` (discrete `_fw_seo_*` post/term meta), `FW_SEO_Settings`
(one keyless read of the settings), `FW_SEO_Locations` (the set of places a template
can be defined for), `FW_SEO_Content` (post → plain prose).

---

## Template tags

Written `%%tag%%` in any template or override field. Unknown tags resolve to an
empty string — never to their own literal text.

### Exact tags

| Group | Tags |
|---|---|
| Site | `sitename` `sitedesc` `sep` `permalink` `currentdate` `currenttime` `currentday` `currentmonth` `currentyear` |
| Post | `title` `excerpt` `excerpt_only` `post_content` `date` `modified` `id` `parent_title` `post_type_singular` `post_type_plural` `primary_category` `post_categories` `post_tags` |
| Term | `term_title` `term_description` `taxonomy_title` |
| Archive | `archive_title` `archive_date` |
| Author | `author_name` `author_bio` `author_id` |
| Search | `searchphrase` |
| Paging | `page` `pagenumber` `pagetotal` |

`page` renders "Page 2 of 7" and is **empty on page one**, so it collapses away with
its separator instead of leaving "Page 1 of 1" in every title.

### Dynamic families

One registration serves unlimited tags — this is what lets a template reference
site data the framework has never heard of.

| Family | Reads |
|---|---|
| `%%cf_<key>%%` | Any post meta field — `%%cf_subtitle%%` |
| `%%term_cf_<key>%%` | Any term meta field |
| `%%tax_<taxonomy>%%` | The post's terms in any taxonomy, comma separated — `%%tax_product_cat%%` |
| `%%user_<key>%%` | Any author meta field — `%%user_twitter%%` |

### Modifiers

Chained with `|`, applied left to right: `%%excerpt|words:20|capitalize%%`.

`truncate:<n>` (characters, stops on a word boundary) · `words:<n>` · `upper` ·
`lower` · `capitalize`. Unrecognised names pass through the
`fw_seo_tag_modifier` filter.

### Empty-tag collapsing — the rule that matters

When a tag resolves empty, the renderer drops the separator framing it: the one
**before** if it is separator furniture, otherwise the one **after**, never both.

```
'%%title%% %%sep%% %%primary_category%% %%sep%% %%sitename%%'
   uncategorised post →  "My Post | My Site"          (not "My Post |  | My Site")
'%%searchphrase%% %%sep%% %%title%%'
   not a search page  →  "My Post"
```

A **whitespace-only** literal is deliberately *not* separator furniture — dropping
the space in `A %%missing%% B` would render `AB`.

---

## Resolution order

Every field runs the same ladder; the first non-empty stage wins.

| Stage | Title | Description | Canonical |
|---|---|---|---|
| `override` | `_fw_seo_title` on the post/term (tags resolve) | `_fw_seo_description` (tags resolve) | `_fw_seo_canonical` |
| `template` | Settings template for the location | Settings template for the location | — |
| `auto` | `%%title%%` | **Generated from the content** | The context's own URL, paging included |
| `fallback` | Site name | Tagline, **homepage only** | — |

The description `fallback` is homepage-only on purpose: the same description on
every page is worse than no description, so an ordinary page with nothing to say
emits no `<meta name="description">` at all.

`FW_SEO_Chain::source( $field, $ctx )` reports which stage won — the editor preview
uses it to tell the user whether they are reading their own text, a template, or
something generated.

### Auto-generated descriptions — builder-aware

`FW_SEO_Content::text()` prefers a hand-written excerpt, then:

1. **Page-builder page** → walks the builder JSON tree in document order and takes
   text only from atts that carry prose (`FW_SEO_Content::prose_map()`, filterable
   via `fw_seo_prose_atts`). Repeater rows are picked up using the parent
   element's att names.
2. **Otherwise** → `post_content` with comments removed, `excerpt_remove_blocks()`,
   `strip_shortcodes()`, then flattened.

Step 1 exists because the builder syncs *rendered HTML* into `post_content`, so
flattening it yields button labels and counter digits. This is why the generic SEO
plugins produce poor descriptions on builder pages and we do not. `do_shortcode()`
is deliberately never called — rendering arbitrary shortcodes inside `wp_head` is
slow and full of side effects.

---

## Storage

Per-object overrides are **discrete meta keys**, not the Unyson option blob, so
`WP_Query` can see them (bulk editing, list-table columns, sitemap filtering).

`_fw_seo_title` `_fw_seo_description` `_fw_seo_canonical` `_fw_seo_noindex`
`_fw_seo_nofollow` `_fw_seo_robots_advanced` `_fw_seo_max_snippet`
`_fw_seo_max_image_preview` `_fw_seo_max_video_preview` `_fw_seo_og_title`
`_fw_seo_og_description` `_fw_seo_og_image` `_fw_seo_twitter_title`
`_fw_seo_twitter_description` `_fw_seo_twitter_image` `_fw_seo_twitter_card`

Image fields hold a **URL string**, not the picker's array — every reader
downstream (head, sitemap, a future schema graph) wants a URL, and a storage
format shaped by one admin widget breaks when the widget changes. The seam is
`FW_SEO_Admin::to_option_value()`, which re-inflates on read.

An empty value **deletes** the row rather than storing `''`. There is no migration
from 1.0.x — the rebuild was a clean break.

Settings live in the normal extension settings; template ids are
`tpl_<field>__<location_slug>`, robots ids `robots_<flag>__<location_slug>`.
A **cleared** template is honoured as "no template, fall through to auto" — the
reader uses `array_key_exists`, not an empty check.

---

## Robots

Emitted through core's `wp_robots` filter, not as a second competing tag.

Order: site's *Discourage search engines* setting → per-object override →
per-location setting → forced `noindex` on search results and 404s.
`noindex` unsets `index`; `nofollow` unsets `follow`.

Supports `noindex` `nofollow` `noarchive` `nosnippet` `noimageindex`
`max-snippet:<n>` `max-image-preview:<none|standard|large>` `max-video-preview:<n>`.

---

## Sitemaps

| URL | What |
|---|---|
| `/sitemap.xml` | The index. Advertised in robots.txt. |
| `/sitemap-<provider>-<page>.xml` | One provider's page of URLs. |
| `/sitemap.xsl` | The stylesheet browsers apply; crawlers ignore it. |

Built-in providers: `home`, `pt-<post_type>` for every public post type, and
`tax-<taxonomy>` for every public taxonomy. Chunked at 1,000 URLs
(`fw_seo_sitemap_per_page`; Google's hard ceiling is 50,000).

**Exclusion is automatic and layered.** A provider is skipped entirely when its
location is set to no-index in the settings or switched off on the Sitemap tab;
individual posts and terms marked no-index are filtered out by a `NOT EXISTS`
meta query on `_fw_seo_noindex`. That query is the concrete payoff of the
discrete-meta storage decision — inside a serialised option blob it is not
expressible. A provider whose count drops to zero disappears from the index, and
its URL 404s rather than serving an empty `<urlset>` (an empty sitemap asserts
"this section legitimately has no URLs").

**Images** are on by default: the featured image plus on-site `<img>` sources
found in the content, capped at 10 per URL, skipping `data:` URIs and off-site
hosts. Because the builder syncs rendered markup into `post_content`, the same
scan finds builder images without a second code path.

**Core's sitemap is replaced by default** (`sitemap_replace_core`) so a site has
one sitemap rather than two. Core registers its `Sitemap:` robots.txt line when it
boots on `init:10` and does not re-check whether sitemaps are still enabled, so
the `wp_sitemaps_enabled` filter is attached at wiring time (not on `init`) **and**
the now-dead line is stripped from robots.txt output.

Registering a provider:

```php
add_action( 'fw_seo_register_sitemap_providers', function () {
    FW_SEO_Sitemap::register_provider( 'events', [
        'label' => __( 'Events', 'fw' ),
        'count' => fn() => fw_seo_sitemap_post_count( 'event' ),
        'urls'  => fn( $page, $per ) => fw_seo_sitemap_post_urls( 'event', $page, $per ),
    ] );
} );
```

**Not implemented, on purpose:** search-engine pinging (Google retired its endpoint
in 2023, Bing followed — discovery is via robots.txt and Search Console) and
`<priority>` / `<changefreq>` (ignored by Google for years; emitting them invites
tuning that cannot have an effect).

Rewrite rules flush once, gated on `FW_SEO_Sitemap::REWRITE_VERSION` stored in the
`fw_seo_rewrite_version` option — bump the constant if the rules change.

---

## Extension points

| Hook | Type | Purpose |
|---|---|---|
| `fw_seo_register_tags` | action | Register custom `%%tags%%` (`FW_SEO_Tags::register` / `register_family`). |
| `fw_seo_register_sitemap_providers` | action | Register a sitemap provider (`FW_SEO_Sitemap::register_provider`). |
| `fw_seo_sitemap_urls` · `fw_seo_sitemap_index_entries` | filter | One page's URL entries / the index entries. |
| `fw_seo_sitemap_post_query_args` | filter | The `WP_Query` args behind a post-type sitemap. |
| `fw_seo_sitemap_per_page` · `fw_seo_sitemap_images_per_url` | filter | Chunk size / images per URL. |
| `fw_seo_register_fields` | action | Register a new chain field. |
| `fw_seo_collect_head` | action | Add tags to the head bag (`FW_SEO_Head::add` / `add_raw`). |
| `fw_seo_head_tags` | filter | The whole bag, immediately before printing. |
| `fw_seo_value` | filter | A field's final value; `$source` names the winning stage. |
| `fw_seo_chain_stage` | filter | One stage's candidate value. |
| `fw_seo_template` | filter | A raw template before its tags resolve. |
| `fw_seo_tag_value` | filter | One resolved tag; `null` means no tag matched. |
| `fw_seo_prose_atts` | filter | Which shortcode atts the description extractor reads. |
| `fw_seo_auto_description` | filter | The generated description before trimming. |
| `fw_seo_canonical_url` · `fw_seo_robots` · `fw_seo_separator` | filter | Self-explanatory. |
| `fw_seo_locations` · `fw_seo_post_types` · `fw_seo_taxonomies` | filter | What gets templates and metaboxes. |

Registering a tag:

```php
add_action( 'fw_seo_register_tags', function () {
    FW_SEO_Tags::register( 'reading_time', [
        'label'    => __( 'Reading time', 'fw' ),
        'group'    => 'post',
        'contexts' => [ FW_SEO_Context::SINGULAR ],
        'resolve'  => function ( FW_SEO_Context $ctx ) {
            if ( ! $ctx->has_post() ) { return ''; }
            $words = str_word_count( FW_SEO_Content::text( $ctx ) );
            return sprintf( '%d min read', max( 1, (int) ceil( $words / 200 ) ) );
        },
    ] );
} );
```

Adding a head tag:

```php
add_action( 'fw_seo_collect_head', function ( FW_SEO_Context $ctx ) {
    FW_SEO_Head::add( 'og:title', [
        'property' => 'og:title',
        'content'  => FW_SEO_Chain::resolve( 'title', $ctx ),
    ], 'meta', 40 );
} );
```

---

## Option types

Both are extension-local (`includes/option-types/`), not framework types.

### `seo-template`

A text input or textarea with tag insert buttons, a searchable tag browser, and a
counter. Stored value: a plain string (markup stripped).

| Config key | Default | Purpose |
|---|---|---|
| `field` | `'title'` | Which chain field this edits — drives the preview. |
| `multiline` | `false` | Render a textarea. |
| `measure` | `'characters'` | `'pixels'` or `'characters'`. |
| `limit` | `0` | Recommended maximum; `0` hides the counter. |
| `insert` | `[]` | Tag ids for the quick-insert buttons. Sensible per-field default. |

The counter measures the **resolved** text, not the template — the pixel width of
`%%title%% %%sep%% %%sitename%%` is not a number worth showing anyone. Titles are
measured on a canvas at `400 20px Arial` because Google truncates on width, not
character count.

**Per-object fields ship PRE-FILLED and editable** — the title as its template
(rendered as chips), the description as the generated prose — matching AIOSEO and
Yoast.

That is only safe because **an untouched pre-fill is never stored**. Each field
carries a hidden `<id>__pristine` companion recording exactly what was rendered
into it; on save a value still equal to that (whitespace aside) is discarded
rather than written, so the post stays bound to its template. Editing stores a
real override; clearing the field, or restoring the original text, removes it
again. Without this, pre-filling would hand every post a frozen copy of the
template and a later site-wide title change would silently update nothing.

The comparison is against the value **we rendered**, not a recomputed one: by
`save_post` the content has already changed, so regenerating the description
would differ from what the form carries and every save of an edited post would
look like a customisation.

**Chips are progressive enhancement.** The real input keeps the value and the form
name and stays in the DOM (hidden); a `contenteditable` layer renders `%%tags%%`
as chips and serialises back into it on every keystroke. Nothing but the element
that submits ever holds the value, and with the script absent the field is still
a plain working text input. Chips are `contenteditable="false"` so backspace
removes a whole tag instead of eating one `%`.

**The metabox is tabbed** (General / Advanced) using the framework's own `tab`
container — the same one the theme's Page Settings metabox uses, so it matches by
construction rather than by CSS. Add a tab via the `fw_seo_object_tabs` filter.
The robots matrix sits behind a `seo_robots_default` disclosure switch (UI only;
never stored).

These tabs set `'lazy_tabs' => false`. The framework's default is lazy: an
unopened tab's fields live in a `data-fw-tab-html` attribute rather than in the
form, and `backend-options.js` injects them all on submit (`initAllTabs` on
`submit.fw-tabs`) — measured on a page metabox, 6 rendered fields become 32 at
submit time. So lazy tabs are **safe**; eager rendering here is for a predictable,
testable DOM in a metabox too small to benefit from laziness.

The save path additionally consults the **raw submission** rather than trusting
`fw_get_options_values_from_input()`, which fills in defaults for anything
missing. That distinguishes "the user cleared this" from "this was never on the
page" — relevant only when the lazy-tab injection does not run at all (a JS error
earlier in the page), since the nonce check already rejects saves that never
rendered the metabox.

### `seo-preview`

Display only; holds no value (`_get_value_from_input` returns `null`). Renders the
Google-style card that the `seo-template` fields in the same scope write into.
Scope is the nearest `.fw-seo-metabox`, `.fw-seo-term-fields`, option box, or form
— which is what lets the settings page show several previews without them
overwriting each other.

Resolution happens server-side through `wp_ajax_fw_seo_preview`, so the preview
shows the same values the front end will.

The endpoint is **per field**: `{ nonce, post_id, field, template }` in,
`{ field, value, source, url, sample, post }` out. Two behaviours worth knowing:

- **An empty `template` suppresses the `override` stage.** The store still holds
  the last *saved* override, and echoing that back while the user is clearing the
  field would show them the opposite of what they are about to get.
- **`post_id: 0` resolves against a sample post** (the most recent published one,
  `sample: true` in the response). That is what makes the settings screen useful —
  measuring the literal characters of `%%title%% %%sep%% %%sitename%%` is a number
  with no meaning.

On the client the unit of work is the **field**, not the card: the settings screen
has a template pair per location and no preview card at all, so anything keyed to
the card leaves every counter there blank. Visible fields resolve on load
(staggered ~60ms apart); fields on an unopened tab wait for first focus, so a
screen with 30 template fields does not fire 30 requests at once.

---

## Gotchas

- **`FW_SEO_Context` is null before `wp`.** `fw_seo_context()` returns `null` on
  earlier hooks; guard it.
- **Dates go through `wp_date()`**, never `date()`. The pre-2.0 extension used
  `date()`, so `%%currentyear%%` was wrong on any UTC-offset site and month names
  were never translated.
- **Overrides may contain tags.** Someone templating one important page still
  expects `%%sitename%%` to resolve there.
- **Canonical on page 2 is page 2.** Pointing every paged URL at page one hides the
  rest of the archive, which is the opposite of what the setting is reached for.
- **The theme yields surface by surface, not all at once.** Three filters —
  `unysonplus_emit_meta_description`, `unysonplus_emit_meta_canonical` (theme
  2.5.47) and `unysonplus_emit_meta_social` (theme 2.5.48) — let the extension
  claim exactly what it emits. Adding a fourth surface means adding a fourth
  filter; do NOT convert these into one all-or-nothing switch, which is what
  makes a partial hand-over impossible.
- **Social fields inherit through the CHAIN, not by copying.** `og_title`'s
  *template* stage is `FW_SEO_Chain::resolve('title')`, and `twitter_title`'s is
  `og_title`. Never reimplement title logic inside a social field — that is how
  the search result and the share card drift apart, which is the bug the feature
  was built to remove.
- **The image ladder skips images under 200px** (`FW_SEO_Image::MIN_EDGE`), which
  is Open Graph's own floor. Without it the finder lands on the site logo, since
  a logo appears in the markup before any content image. Only images we host can
  be measured; a remote URL is trusted rather than fetched, and a **featured
  image is honoured whatever its size** because it was chosen deliberately.
- **`FW_SEO_Chain` holds a reference to every cached context** (`self::$contexts`).
  `spl_object_id()` is unique only among LIVE objects, so without the reference a
  collected context's id is reused and the next context reads its values. One
  context per request hides this completely; a list table resolving many in a
  loop showed row three carrying row one's title. Never "optimise" that array
  away — and if you add another per-context cache, key it the same way.
- **Quick Edit has its OWN nonce and handler** (`FW_SEO_List::_action_save_quick_edit`),
  deliberately not the metabox path. The metabox bails without `fw_seo_nonce`,
  which is exactly what stops an inline save — a form that never rendered the SEO
  fields — from wiping every override. Do not merge the two paths.
- **List filters are limited to what SQL can answer.** "Pages with no
  description" is NOT offered: descriptions resolve at render time, so there is
  nothing stored to query. Adding it means materialising resolved values into an
  index (the site-wide audit), not a cleverer `meta_query`.
- **The importer translates template tags; it does not copy them.** Each source
  in `FW_SEO_Import::sources()` carries a `tags` map, applied longest-key-first
  so `%%category_description%%` is not eaten by `%%category%%`. Adding a source
  without a tag map ships silent data loss: an untranslated `%title%` renders as
  nothing. Untranslatable tags are LEFT IN and reported, never stripped.
- **Import must not manufacture overrides.** Another plugin's "use the default"
  (Yoast writes `2` for index) must not become an explicit switch here, and an
  empty source value must not become an empty override. Both are pinned in
  `tests/import-test.php`; both would corrupt a site quietly.
- **AIOSEO v4 reads from `{prefix}aioseo_posts`**, not post meta — hence the
  `storage => table` branch. Do not assume meta for new sources.
- **The meta key names are from documentation, not from a site running those
  plugins.** A wrong key finds nothing rather than corrupting anything, so the
  failure mode is safe but silent — validate against real data before trusting a
  zero count.
- **Settings live at Unyson+ → SEO** (`FW_SEO_Settings_Page`, slug
  `fw-seo-settings`), not in the Extensions manager. The manager card's Settings
  link is redirected there via `fw_ext_manager_settings_url`. The page renders
  the SAME `settings-options.php` schema into the same store — only the route
  differs — and its save re-fires `fw_extension_settings_form_saved:seo` because
  the manager's save did. It merges over the stored array rather than writing
  the form wholesale, so a filtered-out tab cannot drop keys it never rendered.
- **The theme yields FOUR surfaces now**, each its own filter:
  `unysonplus_emit_meta_description`, `unysonplus_emit_meta_canonical` (theme
  2.5.47), `unysonplus_emit_meta_social` (2.5.48) and `unysonplus_emit_schema`
  (pre-existing, defaults to `! unysonplus_seo_plugin_active()` — a list that
  does NOT include us, so it must be claimed explicitly). Add a filter per new
  surface; never collapse them into one switch.
- **`FAQPage` is already emitted by the accordion shortcode**
  (`shortcodes/accordion/views/view.php`, opt-in per element). Do NOT add FAQ
  data to the graph without removing it there — two representations of the same
  questions is worse than one unlinked block.
- **Schema reads FW_SEO_Chain, never the post directly.** Headline, description
  and image come from the resolved chain so the graph cannot contradict the meta
  tags. Recomputing any of them locally reintroduces exactly the drift the
  extension exists to remove.
- **`FW_SEO_Schema::default_type()` must not read settings.** The settings form
  calls it at file scope; `type_for()` (which does read) would trip the
  option-types init trap and fatal every builder page.
- **The metabox is not wired through `fw_post_options`.** It borrows
  `render_options()` and `fw_get_options_values_from_input()` but keeps its own
  storage. A save with no `fw_seo_nonce` in `$_POST` is ignored, so quick-edit and
  REST saves cannot silently wipe the overrides.
