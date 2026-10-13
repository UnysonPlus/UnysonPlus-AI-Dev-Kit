<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# theme-builder extension (+ Dynamic Content tokens)

Build global **Headers, Bodies and Footers** with the page builder, bundle them into a **Template**, and
assign each Template to parts of the site with conditional rules (**Use On / Exclude From**). This is
how a site gets a custom single-post layout, a blog / archive / CPT listing, a 404 page, or a different
header on one section of the site. Theme Settings → Header / Footer stays the fallback wherever no
Template applies. Absorbs the former Header & Footer Builder extension (same `up_header` / `up_footer`
post types and render path).

- **Slug:** `theme-builder` · **Repo:** `UnysonPlus-Theme-Builder-Extension` · **Version:** 1.1.54
- **How you get it:** not in the core-only plugin zip. It is in the parent theme's recommended set, so it
  is offered on the *Install Compatible Extensions* screen when the plugin is activated with
  `unysonplus-theme` active; otherwise download it from **Unyson+ → Extensions**. Requires the
  `shortcodes` extension (the page builder).
- **Admin:** top-level **Theme Builder** menu → **Templates** (Canvas / List / Tree views), **Header
  Presets**, **Body Presets**, **Footer Presets**. Capability: `edit_theme_options`.

The page-builder side of a template is ordinary builder content; the part that is easy to get wrong is
the **dynamic values** inside it, documented in the second half of this file.

---

## The model

| Post type | What it is | Edited with |
|---|---|---|
| `up_header` | a header layout ("Header Preset") | the page builder (+ a *Header Type & Behavior* box) |
| `up_body` | a page / single / archive-card body ("Body Preset") | the page builder (+ a *Loop Layout* box) |
| `up_footer` | a footer layout ("Footer Preset") | the page builder |
| `up_template` | a **Template**: which header / body / footer part to use + the conditions | the Theme Builder screen (no post editor) |

Parts are **shared**: one Body Preset can serve several Templates (each part's list shows a "Used by"
column). Each part also has a **Custom CSS & JS** box (`custom_css`, `custom_js`) that is output only
on requests where that part renders.

### Template data (framework post options on the `up_template` post)

| Key | Value | Meaning |
|---|---|---|
| `tb_header_id` | int | `up_header` id; `0` = inherit (per-page → site-wide → Theme Settings header) |
| `tb_body_id` | int | `up_body` id; `0` = none (the normal theme template renders) |
| `tb_footer_id` | int | `up_footer` id; `0` = inherit |
| `tb_conditions` | `{ use_on: rule[], exclude_from: rule[], relation: 'or'\|'and' }` | where it applies |
| `tb_disabled` | `0` / `1` | stored **inverted** — absent / `0` = enabled |
| `tb_priority` | int `-100…100` | tie-break only (see Resolution) |

A **rule** is `{ type, sub_type, ids }`:

| `type` | Label | `sub_type` | `ids` |
|---|---|---|---|
| `df` | Entire site | — | — |
| `pt` | Singular | post type slug | optional — specific post ids (empty = all of that type) |
| `ptc` | Children of | hierarchical post type | **required** — parent page ids |
| `tx` | Singular with term | taxonomy | **required** — term ids |
| `tax` | Term archive | taxonomy | optional — term ids (empty = every archive of it) |
| `au` | Post by author | — | **required** — user ids |
| `tpl` | Page template | template file (`default` or a theme template filename) | — |
| `aar` | Author archive | — | optional — user ids |
| `ar` | Post type archive | post type (only types with an archive) | — |
| `ct` | Special page | `front_page` · `blog_index` · `search` · `error_404` (+ `woo_shop` · `woo_cart` · `woo_checkout` · `woo_account` when WooCommerce is active) | — |

`relation` applies to **Use On** only: `or` (default) = any rule matches; `and` = every rule must match.
Exclusions are always OR — any one matching excludes the Template.

### Resolution (which Template wins)

Every enabled Template whose Use On matches and whose Exclude From does not is ranked by
**specificity** (a specific post 100 › term / author / specific-archive 80 › children-of 75 › page
template 70 › all archives of a type / taxonomy / author 60 › all singulars of a type 50 › entire site),
then by **Priority**, then newest. Priority never lets a broad Template beat a more specific one.

- **A Body Template does not replace a page built with the page builder.** On a singular request whose
  post has the builder active, the Body is skipped and the page's own builder content renders (the
  Template's header / footer still apply). Assign Bodies to posts, CPT singles, archives and special pages.
- **Body render modes:** singular → rendered once for the queried post; archive / blog / search → the
  Body is rendered **once per post in the loop** (a card), laid out by the Body's *Loop Layout*
  (`tb_loop_columns` `auto`/`1`–`6`, default `3`; `tb_loop_gap` `none`/`small`/`medium`/`large`) with
  normal pagination; 404 / empty archive → rendered once with no post.
- **Header Type & Behavior** (header parts): `hf_type` = `standard-top` · `sidebar` · `off-canvas` ·
  `fullscreen-overlay` · `mega`; `hf_behavior` = `static` · `sticky` · `sticky-shrink` ·
  `hide-on-scroll` · `transparent-overlay`.

### Building a template by script

Create parts as builder posts (same storage as a page — `upw_build_page( $slug, $title, $tree, 'up_body' )`
from [`../building-pages.md`](../building-pages.md); its 4th argument is the post type, or pass an
existing part's numeric id), then
write the Template's options with `fw_set_db_post_option( $template_id, 'tb_body_id', $id )` etc. Build
`tb_conditions` through `FW_Theme_Builder_Conditions::rows_to_conditions( $rows, $relation )` — it
validates every row against the vocabulary above and drops invalid ones — and call
`FW_Theme_Builder_Resolver::flush()` afterwards. With the AI Assistant active, the abilities
`theme-builder-list` and `theme-builder-save-template` do the same with validation + undo
(rows: `{ side: 'use_on'|'exclude_from', type, sub_type?, ids? }`).

```php
fw_ext_theme_builder_ai_conditions(); // or require the conditions class outside wp-admin
$cond = FW_Theme_Builder_Conditions::rows_to_conditions( array(
    array( 'side' => 'use_on', 'type' => 'pt', 'sub_type' => 'property' ),   // every single "property"
), 'or' );
fw_set_db_post_option( $template_id, 'tb_conditions', $cond );
```

(`fw_ext_theme_builder_ai_conditions()` is defined by the extension's AI-abilities file and only loads
the conditions class; in wp-admin the class is already loaded.)

**Theme-shipped templates:** a theme may ship `up-templates/*.json`
(`{ name, conditions:{use_on, exclude_from}, header, body, footer }`, child theme overrides parent). They
are seeded into these post types on `after_switch_theme`, with a manual-edit guard: a seeded post the user
has since edited is skipped on re-seed. Templates can also be exported / imported as JSON from the
Theme Builder screen.

### What goes inside a Body

The post-data elements read "the current post" (`get_the_ID()`), so they are what a single or loop Body
is made of: `post_title`, `post_content`, `post_excerpt`, `post_date`, `post_author`, `post_terms`,
`post_meta` (a custom field — [`../shortcodes/post-meta.md`](../shortcodes/post-meta.md)),
`featured_image`, `author_box`, `social_share`, plus `posts` for a custom query. Any other element can
carry a **Dynamic Content token** in its text options (below).

---

## Dynamic Content tokens

Core framework feature (`framework/includes/dynamic-content/`), resolved at element render time by the
`shortcodes` extension. An editor inserts a token from the database icon next to any **Text / Short
Text / Textarea / Rich Editor** option (and an *Insert Dynamic Content* button beside the classic
editor's Add Media); at render the token becomes the live value.

```
{{tag}}                                   simple
{{tag|param=value|fallback=Some text}}    parameters, optional fallback
```

- `fallback` is used when the value is empty. An **unknown tag is left in the output literally** —
  a typo shows up on the page as `{{…}}`, never as a blank or an error.
- The resolved value is plain text and goes through the element's normal escaping — a token cannot
  inject HTML.
- "The post" is the current loop / queried post (`get_the_ID()`), so post tokens belong in single
  pages, Body Templates and loop cards. In a contact form's email **subject**, tokens refer to the page
  the form was sent from.
- Also resolved in post content, excerpts, post titles and the document `<title>`.

### Tags

| Group | Tag | Params | Value |
|---|---|---|---|
| Post | `post_title` | — | title |
| | `post_excerpt` | — | excerpt |
| | `post_content` | — | content, tags stripped |
| | `post_id` | — | ID |
| | `post_url` | — | permalink |
| | `post_date` | `format` (PHP date format; blank = site format) | publish date |
| | `post_modified` | `format` | last-updated date |
| Site | `site_name` · `site_tagline` · `site_url` · `admin_email` | — | from Settings → General |
| Author | `author_name` · `author_bio` · `author_url` | — | the post author's display name / bio / archive URL |
| Date & Time | `current_date` | `format` | today |
| | `current_time` | `format` | now |
| | `current_year` · `copyright_year` | — | `Y` |
| | `current_month` · `current_day` | — | month name / weekday name |
| Unyson+ Fields | `post_meta` | `key` (field name) | a custom-field value — see below |
| Links | `<post_type>_permalink` (e.g. `page_permalink`, `post_permalink`) | `id` (the target post) | live permalink, so a link follows slug changes — use in link fields |
| WooCommerce *(only when active)* | `product_title` · `product_price` · `product_sku` · `product_stock` · `product_rating` | — | the current product's field (price as text) |

Examples: `© {{copyright_year}} {{site_name}}`, `{{post_meta|key=price|fallback=Price on request}}`,
`{{post_date|format=j M Y}}`, link field `{{page_permalink|id=42}}`.

### `{{post_meta}}` and Custom Fields

`{{post_meta|key=<name>}}` reads the post's **framework options first** — where the
[Custom Fields](custom-fields.md) extension (and code-defined post options) store values, via
`fw_get_db_post_option( $post_id, $key )` — and falls back to plain WordPress post meta
(`get_post_meta()`) when nothing is stored there. Non-string values are formatted the same way as the
Post Meta element: a measurement `{ value, unit }` → value, space, unit (e.g. `1200 sq ft`); a list
→ its scalar entries joined with `, `, nested data such as upload objects skipped. Images, galleries,
repeaters and checkbox maps don't render usefully as text — use the dedicated elements or a template.

### Adding a tag (developers)

One filter, `fw:dynamic-content:tags`: add `$tags['my_tag'] = [ 'label', 'group', 'params' => [ [ 'id',
'label', 'type' => 'text'|'select', 'default', 'choices' ] ], 'resolve' => fn( $params, $context ) => '…' ]`.
`$context['post_id']` is the current post when known. Return a scalar (arrays become `''`), never HTML.
Check that an integration is available **inside** the callback so its group disappears when it is
inactive. Hide the picker on one option with `'dynamic_content' => false`; enable it on a custom text-like
option type with `'dynamic_content' => true` in its defaults. Outside an element render, resolve with
`fw_dynamic_content()->resolve( $text, array( 'post_id' => $id ) )`.
