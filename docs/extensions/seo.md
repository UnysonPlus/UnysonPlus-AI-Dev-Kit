<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# seo — Search Engine Optimisation

Dynamic title and meta-description templates with auto-generation, canonical URLs,
indexing control, sharing cards, and a live search-result preview in the editor.

- **Slug:** `seo` · **Repo:** `UnysonPlus-SEO-Extension` · **How you get it:** not in the core-only plugin zip;
  in the parent theme's recommended set (offered on the *Install Compatible Extensions* screen when the
  plugin is activated with `unysonplus-theme` active), otherwise download it from Unyson+ → Extensions
- **Provides:** `%%tag%%` template engine · title + description resolution ·
  `<link rel="canonical">` · robots directives · **XML sitemaps** ·
  **Open Graph + Twitter cards** · **JSON-LD graph** ·
  **list columns / inline editing** · **import from Yoast / Rank Math /
  SEOPress / AIOSEO** · site-verification tags ·
  two option types (`seo-template`, `seo-preview`)
- **Does not provide (yet):** a redirect manager, per-page schema overrides,
  Product/Event/Recipe types, and **no `LocalBusiness` (or subtype: `Dentist`, `MedicalClinic`,
  `LegalService`, `Restaurant`, …) node** — the site identity is only `Organization` or `Person`. Add one
  with the `fw_seo_schema_graph` filter ([JSON-LD graph](#json-ld-graph--adding-localbusiness-and-other-types)). `BreadcrumbList` lives in the separate
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
| `fw_seo_schema_graph` | filter | `( array $nodes, FW_SEO_Context $ctx )` — the whole JSON-LD `@graph` before printing; return the node list. |

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

### JSON-LD graph — adding LocalBusiness and other types

`FW_SEO_Schema::graph( $ctx )` builds one `@graph` of four nodes — the **publisher** (`Organization` or
`Person`, per the *represents* setting; `@id` = `FW_SEO_Schema::publisher_id()`, i.e. `<home>#organization` /
`#person`, carrying name, logo, email, `telephone`, `sameAs`), **`WebSite`**, the **`WebPage`** / article node
(its `publisher` points at the publisher `@id`) and the **author** `Person` — then applies
**`fw_seo_schema_graph`** (`apply_filters( 'fw_seo_schema_graph', $nodes, $ctx )`) and drops empty entries.
There are no built-in `LocalBusiness` types and no address / opening-hours / geo settings, so a local
business adds them in this filter (child theme `functions.php` or a small plugin). Re-typing the publisher
node keeps its `@id`, so every node that references it now references the business:

```php
add_filter( 'fw_seo_schema_graph', function ( array $nodes, FW_SEO_Context $ctx ) {
    foreach ( $nodes as &$node ) {
        if ( ! is_array( $node ) || ( $node['@id'] ?? '' ) !== FW_SEO_Schema::publisher_id() ) {
            continue;
        }
        $node['@type']   = 'Dentist';                 // any LocalBusiness subtype (Organization stays implied)
        $node['address'] = [
            '@type'           => 'PostalAddress',
            'streetAddress'   => '1 Example Street',
            'addressLocality' => 'Example City',
            'postalCode'      => '00000',
            'addressCountry'  => 'US',
        ];
        $node['openingHoursSpecification'] = [ [
            '@type'     => 'OpeningHoursSpecification',
            'dayOfWeek' => [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ],
            'opens'     => '09:00',
            'closes'    => '17:00',
        ] ];
        $node['priceRange'] = '$$';
    }
    unset( $node );
    return $nodes;
}, 10, 2 );
```

- Only when the site *represents* an organization — with **Person** selected the publisher node is a
  `Person` and should stay one; append a separate business node instead (`$nodes[] = [ '@type' => …, '@id' => home_url( '/' ) . '#business', … ]`).
- Use `$ctx->is( FW_SEO_Context::FRONT_PAGE )` (or `$ctx->post_id()`) to add page-specific nodes only where
  they belong. Keep values consistent with the visible page (address / phone in the footer) — the graph is
  the machine-readable copy that gets believed.
- Put the telephone in the SEO settings (`schema_phone`) rather than hard-coding it here; it is already on
  the publisher node.

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
- **The search log aggregates; it does not journal.** One row per normalised
  phrase with a counter, written with a single `INSERT … ON DUPLICATE KEY UPDATE`
  so concurrent searches cannot lose counts to a read-then-write race. Recorded
  on `wp` (not `pre_get_posts`) because the result count is only known after the
  query runs — and the count is the point. Bots are skipped and rows are pruned
  on a daily cron; both are privacy/noise controls, not optimisations.
- **Freshness word counts come from `FW_SEO_Content`,** so a builder page is
  measured by the prose in its tree. Counting `post_content` would measure
  rendered markup and every builder page would read as thin. Split on whitespace,
  not `str_word_count`, which undercounts non-ASCII prose badly.
- **`FW_SEO_Card` bundles no font — it FINDS one** (settings → theme `/fonts` →
  system paths) and `fw_seo_card_font` filters the RESULT, so it can supply,
  replace or return '' to disable. The card sits in `og_image`'s `auto` stage
  AFTER `FW_SEO_Image::find()` returns nothing, so a page with a picture is never
  overridden; `social-test.php` pins that.
- **CrUX 404 means "not enough traffic", NOT an error.** `FW_SEO_Vitals` keeps
  `nodata` distinct from `badkey`/`network`/`error`, caches the negative result
  too, and never renders a zero — a zero reads as a result. Nothing is fetched
  during settings render; refresh is an `admin_post` action behind a 12h transient.
- **A CSV import is a site-wide write — the fences are the feature.** `FW_SEO_CSV::process()`
  is ONE method for both preview and apply (`$apply` flag) so a preview can never
  disagree with what the apply does. Rows match on post ID only; it writes SEO meta
  and never creates/deletes a post or touches content, title, status or terms; an
  absent id is not visited; only columns PRESENT in the file are considered; a blank
  cell in a present column CLEARS (counted separately so it is never silent). All
  pinned in `tests/csv-test.php` — do not "simplify" any of them away.
- **`safe_cell()` / `unsafe_cell()` are a security control, not formatting.** A value
  beginning `=`, `+`, `-` or `@` is a formula in every spreadsheet; the tab prefix is
  what stops an exported description from executing on the opener's machine.
- **The export writes a UTF-8 BOM.** Without it Excel reads the file as the system
  codepage and mangles every accent — and these are multilingual sites.
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

## AI Assistant abilities (2.0.14)

`includes/ai-abilities.php` registers, via the AI Assistant toolkit (only while it is active):
`seo-get-page` (panel; effective values via `FW_SEO_Chain::resolve` + `::source`, overrides from
`FW_SEO_Store`, length hints), `seo-update-page` (panel; `FW_SEO_Store::set_post`, empty string clears,
snapshot of the `_fw_seo_<field>` meta for `undo-change`), `seo-audit` (≤100 published posts).

---

## Search Console (2.0.25) and index coverage (2.0.29)

Two reports on one OAuth connection. **`FW_SEO_Console`** holds the credential and does the talking;
**`FW_SEO_Inspect`** borrows it for the URL Inspection API.

### The connection

- The user creates their **own** Google Cloud project and OAuth client — the site talks to Google
  directly, and no credential of ours is involved. Scope is `webmasters.readonly`.
- `store_tokens()` writes `fw_seo_console_tokens` with `autoload` **off**: read on two admin screens,
  not on every front-end request.
- **A refresh response omits `refresh_token`.** `refresh()` keeps the existing one
  (`! empty( $body['refresh_token'] ) ? … : $existing['refresh']`); overwriting it with the absent
  value disconnects the site on the first refresh, which is a bug that only shows up an hour later.
- **The seven-day trap.** An OAuth app left on "Testing" has its grant cancelled by Google after
  exactly seven days. `looks_like_testing_expiry()` recognises the signature (6–10 days between
  connecting and failing) and says *publish the app*, because "connect again" fixes it for another
  seven days and teaches the wrong lesson.
- `request( $path, $body )` takes **either** a path under `API_BASE` **or** a full `https://` URL.
  That is how URL Inspection — on `searchconsole.googleapis.com`, a different host — reuses one
  token-refresh path instead of growing a second one that forgets to refresh.

### Reporting windows

`LAG_DAYS = 3`: Search Console data is about three days behind, so a window ending today is partly
empty and reads as a collapse in traffic. `missed_clicks()` drops rows under **100 impressions** —
below that a click-through rate is noise, and acting on it means rewriting titles on the strength of
three visitors.

### Index coverage

- **Quota-shaped, not taste-shaped.** Google allows 2,000 inspections per property per day.
  `DAILY_CAP = 1800` leaves room for the on-demand checks someone makes while working, so a 3am
  sweep cannot exhaust the day.
- `spend()` counts **every** call, including failed ones — a refused call still counted at Google's
  end, and pretending otherwise walks straight into a rate limit.
- An hourly cron takes `BATCH` URLs, never-checked first then stalest; `_maybe_schedule()` adds the
  event when connected and removes it when not. The sweep **breaks out** on `revoked`, `noaccess`,
  `ratelimited` or `nobudget` rather than discovering the same refusal nine more times.
- `state()` maps a row to `indexed|excluded|missing|unknown`. **Order matters:** the "no verdict"
  case is checked *before* the exclusion checks, because an absent `indexingState` is not
  `INDEXING_ALLOWED` either — tested last, a page nothing is known about reports as "excluded on
  purpose", which tells the user it is deliberately blocked when nothing is known at all. A test
  pins this.
- `canonical_mismatch` is the derived fact worth surfacing: Google chose a different canonical, so
  the URL is reporting on another page. Only a mismatch between **two present** values counts — an
  empty `userCanonical` has nothing to disagree with.
- Results live in `_fw_seo_inspect` post meta, re-checked after `STALE_DAYS`.
- **Surfaced where people work (2.0.32).** `badge_html( $post_id, $detail )` feeds an **Index**
  column on the posts list (`FW_SEO_List::_filter_index_column`, added only while connected) and a
  line above the SEO metabox (`$detail = true`: Google's phrase plus the canonical it chose). It
  returns `''` when not connected and when the page has not been checked — a "not known" badge on
  every row of a fresh site is noise. Badge CSS prints once per request, inline, because neither
  screen loads the SEO stylesheet; it includes a column width, without which the list clips the
  longest label.

### Gotchas

- **There is no honest "check everything now" button.** It would either spend a day's quota on one
  click or queue work and claim to have finished. Per-row re-check is affordable; a sweep is not.
- **The live API cannot be exercised locally** without a connected property. The suites cover parse,
  state, staleness and the budget with fixtures; the populated report is verified by seeding
  `_fw_seo_inspect` meta on a test site and rendering it. Do not report the HTTP path as verified
  from a green suite.

### Where pages rank (2.0.33)

`FW_SEO_Rank` reads Search Console positions — never scrapes.

- `near_page_one_rows()` keeps query+page pairs at **position 8–15** (both edges inclusive) with
  **≥ 30 impressions**, most-seen first. Pure; tested without a connection.
- `merge_windows( $now, $then )` gives each query a `change` = previous − current, so **positive is
  up** (smaller position = better). `null` means new this window; queries only in the previous window
  are dropped — the list is about now. This direction is the easiest thing here to get backwards; a
  test pins it.
- `page_queries( $url )` filters `dimensionFilterGroups` on `page equals <permalink>`; two calls
  (this and the previous 28 days). Successes cached 6h, failures 10 min so a broken connection does
  not hammer the API on every editor load.
- Surfaces: the `rank_tab` report, and a collapsed `<details>` above the SEO metabox
  (`editor_html()`, published posts only, empty when there is nothing to show).
- **Gotcha found while staging it:** a URL whose post `url_to_postid()` cannot find renders as the raw
  URL. On a local install that turned out to be a permalink structure corrupted by Git Bash path
  conversion (`/%postname%/` stored as `/C:/Program%20Files/Git/%postname%/`). Run `wp rewrite
  structure` with `MSYS_NO_PATHCONV=1` and a `D:/…` path.

### Page speed diagnostics (2.0.34)

`FW_SEO_Speed` calls the PageSpeed Insights API from a button, renders below the CrUX field data on
`vitals_tab`, and caches the result for 12h (failures 10 min).

- **Not a `<form>`.** The report renders inside the settings form; a nested form is dropped by the
  browser and its button would save the settings. It is a nonced `admin-post` link, the inputs
  carry no `name` (so they never ride on a settings save), and a few lines of script build the URL
  from the fields. A test asserts the markup contains no `<form`.
- **Keys.** It reuses `crux_api_key`, retrying once without it on a 403 (the project may not have
  PSI enabled). Keyless requests share one global daily quota that is usually exhausted — a real
  run returned 429 — so the UI treats a key as required in practice and says which API to enable.
- **Parser tolerance.** Savings come from `details.overallSavingsMs`, else the largest of
  `metricSavings` LCP/FCP/TBT, else `null` = unknown. A failing audit with an unknown saving is
  KEPT; and with a score below 90 the screen never says "nothing to fix". Both guard against a
  Lighthouse format change silently becoming a false all-clear.
- **`clip()`, not `wp_html_excerpt()`** for items: element snippets are nothing but tags, and
  `wp_html_excerpt` strips them to an empty string.
- `is_own_url()` restricts runs to this site's host — the button is not an open proxy.
- **Not verified against a live successful response yet** (no key on any local install). The
  error path was verified end to end with a real request.

### Settings transfer (2.0.35)

`FW_SEO_Transfer` — the settings half of Import / Export (the CSV is the page half).

- Exports `exportable()` = stored settings ∩ `known_keys()`. **`known_keys()` excludes `html` /
  `html-full` options**: the settings form stores headings and report panels as empty strings, and
  without the filter a site's OWN export previewed as "19 settings not known to this version". Found
  by a real browser round trip, not by the unit tests — `known_keys( true )` returns the display ids
  so `plan()` skips them silently on import.
- `SECRETS` (`crux_api_key`, `console_client_id`, `console_client_secret`) are omitted unless the
  export is requested with them (confirm dialog). OAuth tokens are a separate option and never move.
- `plan()` writes only known keys, merges over stored values (unmentioned keys keep theirs), and
  reports unknown keys. `validate()` refuses a newer `version` rather than half-reading it.
- The upload is held per user in a transient until Apply / Discard; a leftover pending upload shows
  its preview instead of the upload field.
- Promise pinned by test: a site's own export, through JSON, plans **zero** changes and zero unknowns.

### Automatic redirects (2.0.36)

`FW_SEO_Redirects` fills the gaps in core's `_wp_old_slug` (non-hierarchical posts only): page slugs,
parent moves (with every descendant), and term slugs.

- Map is `old path => {type, id}` in the non-autoloaded `fw_seo_redirects` option — ids, not URLs,
  so the target is always the live permalink and renaming twice never chains.
- `path()` = URL path, decoded, lower-cased, no trailing slash. Recording the new path removes any
  entry for it (an address that is live again is not a redirect).
- `permalink_as( $before )`: `get_permalink( $before )` reads the parent chain from the DB, which
  already holds the NEW parent, so the old path is rebuilt from the old parent's link + old slug.
- Serves on `template_redirect` priority 20, after core's own at 10, and only on `is_404()`;
  preserves the query string; 301. Unpublished targets resolve to '' (no redirect).
- **Gotcha:** the settings schema can be built before `init`, when `get_term_link()` cannot make
  pretty links yet and returns `?cat=N` — whose path is the site root. The report was rendering a
  renamed category as "now goes to /". The schema holds `FW_SEO_Redirects::PLACEHOLDER` and the
  settings page swaps in `report_html()` at render time. Any report that needs rewrite rules must
  do the same.
- **The option-types init trap, fifth time.** `init()` first read the `redirects_auto` switch to decide
  whether to add hooks. Reading extension settings during extension start-up initialises the option
  types before `seo-template` is registered, so **every title and description saved from the editor
  parsed as empty** — caught only because the `prefill` suite regressed. Hooks are now always added
  and each handler checks `enabled()` itself. Rule: **no `FW_SEO_Settings` / settings read in any
  `init()`**; read lazily inside the hook.
- Verified over real HTTP: old page → 301 new; moved child with `?utm_source` → 301 with the query;
  mixed case → 301; unknown path → untouched 404.

### Attachment pages (2.0.37)

`FW_SEO_Attachments` (`includes/class-fw-seo-attachments.php`), setting `attachment_pages` in the
General tab's `attachments_box`: `core` (default) / `parent` / `file` / `keep`.

- It **filters** `pre_option_wp_attachment_pages_enabled` (keep → `'1'`, file/parent → `'0'`) and
  never writes the core option, so `core` restores the site's own behaviour. Core's option is `0` on
  installs made after 6.4 and `1` on older sites that upgraded; `core_state_text()` says which in the
  box description.
- `parent` hooks `template_redirect` at priority **1** (before core's canonical redirect to the file)
  and sends a 301 to `post_parent` only when that post is **published**; otherwise core's file
  redirect handles it.
- Everything is added on `wp`, never `init`: reading SEO settings during `init` is the
  option-types trap (editor saves parsed as empty).
- Public doc: `/seo/attachment-pages`. Tests: `tests/attachments-test.php`.

### robots.txt editor (2.0.38)

`FW_SEO_Robots` (`includes/class-fw-seo-robots.php`), tab `robots_tab`. Settings: `robots_block_search`
(switch), `robots_ai_training` / `robots_ai_search` (checkboxes over the `AI_TRAINING` / `AI_SEARCH`
constants), `robots_rules` (addable-box of `agent` / `directive` / `path`).

- Filter `robots_txt` at priority **9** (before the sitemap's 10, so `Sitemap:` stays last); skipped when
  the site is not public. Settings are read inside the filter, never at startup.
- `build()` is pure (settings → groups + skipped rows); `apply()` merges `*` rules INTO core's
  `User-agent: *` group (no second `*` group, no duplicate lines) and appends other agents' groups.
- Paths must start with `/` or `*`; agents match `[A-Za-z0-9*._/-]+`; any whitespace/control char is
  refused, so a row cannot inject a second line. Invalid rows are skipped and listed in the preview.
- `partial_groups()` flags agents with their own non-block-all group: a crawler obeys only its most
  specific group, so it drops every `*` rule (including core's `/wp-admin/`).
- Preview = `FW_SEO_Robots::PLACEHOLDER` swapped at render by the settings page; it rebuilds core's
  output and runs `apply_filters('robots_txt')`, and warns about a physical `ABSPATH/robots.txt`,
  `blog_public` = 0 and a sub-folder install.
- Public doc: `/seo/robots-txt`. Tests: `tests/robots-test.php`.

### Smaller additions (2.0.39)

`FW_SEO_Additions` (`includes/class-fw-seo-additions.php`) and `FW_SEO_IndexNow`
(`includes/class-fw-seo-indexnow.php`). All settings are read inside hooks, never at startup.

- **`verify_other`** (Verification tab, textarea): `parse_verification()` keeps only
  `<meta name content>` with a name matching `[A-Za-z0-9:._-]{1,100}`; merged into
  `get_verification_tags()` as `verify_other_<n>`.
- **`paged_titles`** (General, switch, default on): `apply_paged_title()` runs at the end of
  `_filter_document_title` and appends `<sep> Page N of M` on page 2+, unless the title already
  contains that label, `Page N`, or ends in the bare number (the `%%page%%` / `%%pagenumber%%` tags).
  Only the document title; og:title is unchanged.
- **`rss_after`** (General → RSS feed box, textarea): `wp_kses_post` then `%%post_link%%` /
  `%%site_link%%` replaced; appended via `the_content_feed` + `the_excerpt_rss`.
- **`editor_roles`** (General → Access and removal, checkboxes of `wp_roles()`): `can_edit()`; empty =
  everyone, `manage_options` always. Gated at the top of `FW_SEO_Admin::_action_add_meta_box`,
  `_action_register_term_fields`, `_action_save_post`, `_action_save_term` and
  `FW_SEO_List::_action_register`, `_action_save_quick_edit`. (Admin hooks only exist under
  `is_admin()`; to test under wp-cli call the handler on `new FW_SEO_Admin( fw_ext('seo') )`.)
- **IndexNow** (`indexnow`, Sitemap tab, default off): key = 32 hex in option `fw_seo_indexnow_key`,
  served at `/<key>.txt` from `parse_request` priority 0 (only while enabled). `transition_post_status`
  queues published posts of covered post types; sent once on `shutdown` as a non-blocking POST to
  `api.indexnow.org/indexnow` with `keyLocation`; 10-minute per-URL throttle in `fw_seo_indexnow_log`
  (also keeps the last 10 for the status box, `PLACEHOLDER` swapped at render). Skipped when
  `blog_public` = 0.
- **`delete_on_uninstall`** (General → Access and removal, default off): the extension's
  `uninstall.php`, run by core's new `FW_Extensions_Manager::run_extension_uninstall_file()` just
  before the folder is deleted (`FW_EXTENSION_UNINSTALL` defined). Removes
  `fw_ext_settings_options:seo`, options/transients `fw_seo_*`, post/term meta `_fw_seo_*`, user meta
  `fw_seo_*`, the `fw_seo_search_terms` table, both crons, `uploads/unysonplus/social-cards/`, and
  `rewrite_rules`. Per site on multisite. Self-contained (no extension classes).
- Public docs: `/seo/indexnow`, `/seo/access-and-removal`, `/seo/settings` (General, Verification),
  `/developers/extension-uninstall`. Tests: `tests/additions-test.php`.

### Site health (2.0.40)

`FW_SEO_Health` (`includes/class-fw-seo-health.php`), view `health_tab` (Reports group,
`PLACEHOLDER` swapped at render). Daily cron `fw_seo_health_check` (scheduled on `admin_init`) +
`admin_post_fw_seo_health_run` ("Check now"); results in option `fw_seo_health` `{time, results[]}`,
each `{id, status: critical|warning|good, label, fix, link}`.

- Fetches what is SERVED (cache-busting query, `sslverify` off): the homepage (`says_noindex()`:
  robots/googlebot meta or `X-Robots-Tag`), **`robots_url()` = domain-root robots.txt** (crawlers and
  WordPress only use the root, even for sub-folder installs; `blocks_everything()` checks the
  Googlebot group first, then `*`, `Disallow: /` without an Allow), and the sitemap index
  (`has_entries()`). Plus `blog_public`, a physical `ABSPATH/robots.txt`, and the Search Console
  token (`access_token()` = '' → expired; `looks_like_testing_expiry()` explains the 7-day case).
- When `blog_public` = 0 the homepage is not fetched (a warning defers to the visibility result).
- Shown in: the report; an `admin_notices` error for **critical only** (administrators, hidden on the
  report itself); WordPress Site Health as direct test `fw_seo_health` reading the stored run (never
  fetching on that screen).
- Public doc: `/seo/reports/site-health`. Tests: `tests/health-test.php`.

### Alerts (2.0.41)

`FW_SEO_Alerts` (`includes/class-fw-seo-alerts.php`), view `alerts_tab` (first in Reports).
Daily cron `fw_seo_alerts_collect` → option `fw_seo_alerts` `{time, alerts[]}`; weekly cron
`fw_seo_alerts_email` (setting `alerts_email`, default off; `alerts_email_to`, default admin email),
skipped when the list's `fingerprint()` equals option `fw_seo_alerts_sent`.

- Pure judges with floors as constants: `is_low_ctr` (≥1000 impressions, position ≤10, CTR <1%),
  `has_dropped` (≥300 before, now ≤50%), `is_stale_with_traffic` (≥ stale months, ≥30 clicks),
  `is_lost_to_noindex` (noindex + ≥10 clicks over both windows). `build($pages, $near, $searches,
  $extra, $stale)` → one alert per page (first match wins, in that urgency order), max 3 "near page
  one" pages, site searches with ≥5 hits, sorted by priority, capped at `CAP` = 8.
- `collect()` makes two Search Console page queries (28-day windows), maps URLs with
  `url_to_postid`, adds `FW_SEO_Rank::near_page_one()` and the zero-result search log; a broken token
  becomes a `connection` alert.
- **Edit links are built at display time** (`list_html`), and stored as plain
  `post.php?post=ID&action=edit`: cron has no user, so `get_edit_post_link()` returns '' there.
- Shown: dashboard widget `fw_seo_alerts` (manage_options), `editor_html()` at the top of the SEO
  metabox, the report. `FW_SEO_Health::_notice()` also raises the Search Console warning (headline
  "the reports have stopped updating").
- Public doc: `/seo/reports/alerts`. Tests: `tests/alerts-test.php`.

### Link report (2.0.42)

`FW_SEO_Links` (`includes/class-fw-seo-links.php`), view `links_tab` (Reports, `PLACEHOLDER`).
Table `{prefix}fw_seo_links` (source_id, target_id, url, host, kind internal|external|affiliate,
rel, anchor), DB version option `fw_seo_links_db`.

- Extraction (pure): `from_html()` (`<a href>` with rel + text) and `from_builder()` over the
  `fw:opt:ext:pb:page-builder:json` tree: string fields named `link`/`url`/`href`/`*_link`/`*_url`
  (not image/bg/video/icon/logo/src keys), values that `looks_like_link()` (http(s), `//`, `/path`;
  not `#`, mailto/tel, media files), plus any rich text; a sibling `rel`/`nofollow`/`sponsored` field
  gives the rel. Header/footer/menus are deliberately NOT read (they would hide every orphan).
- `classify()`: relative → absolute, `www.` ignored; `is_affiliate()` = setting
  `links_affiliate_patterns` (folder `/x/` or host incl. subdomains), internal `/go|out|recommends|
  refer|visit|aff|affiliate|link/…`, or affiliate query params (`aff`, `affid`, `aff_id`, `clickref`…;
  NOT plain `ref`). An internal non-post address that `fw_ext_short_links_get()` knows → affiliate.
- Indexing: `save_post` (priority 30) re-indexes one post (unpublished → its rows removed);
  `deleted_post` forgets. Full build: `start()` truncates + cron chain `fw_seo_links_batch`, 50
  posts per batch by ID (`fw_seo_links_state`); auto-started on first `admin_init` by an admin;
  "Rebuild" runs the first batch inline.
- Questions: `orphans()` (published covered posts with no row targeting them from another post;
  front page + posts page excluded), `domains()`, `unmarked_affiliates()` (rel without sponsored /
  nofollow), `totals()`, `inbound($id)` → the line in the SEO metabox (`editor_html`).
- Uninstall drops the table and the cron. Public doc: `/seo/reports/links`. Tests: `tests/links-test.php`.
