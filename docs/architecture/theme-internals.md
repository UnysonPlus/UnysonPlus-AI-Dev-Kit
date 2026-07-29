# theme-internals — Parent Theme Architecture

How the `unysonplus-theme` **parent theme** is structured and the systems a builder must understand
to generate or edit sites reliably. Page **content** lives in the plugin's page builder; the theme is
the **site chrome + global design layer** — Theme Settings storage, the preset system, CSS generation,
the header/footer, uploads routing, and the manual-edit guard. This doc is the map; the per-tab option
details live in `docs/theme-settings/` and are not repeated here.

## Theme Settings storage

Global design ("Theme Settings") is stored in **one `wp_option`**:

- Option name: **`fw_theme_settings_options:<theme-id>`** (theme id from the framework manifest — for the
  parent that's `unysonplus`).
- **Read:** `fw_get_db_settings_option( $id = null, $default = null )` — `null` returns the full values
  array keyed by top-level option id; a slash path drills in (`'general_layout/site_bg_color'`).
- **Write:** `fw_set_db_settings_option( $id = null, $value )`.
- **Validate posted input:** `fw_get_options_values_from_input( fw()->theme->get_settings_options(), $input )`.

Each Theme Settings **tab/box is a `multi` container**, so its top-level option id (e.g. `general_layout`,
`header_layout`, `misc_custom_css`) stores a nested array of that group's leaf fields. The tabs — **colors,
typography, buttons, boxes, spacing, header, footer, blog, pages, site-ux, social, misc, woocommerce** —
each have a dedicated reference under **`docs/theme-settings/`** (one `.md` per tab, listing every option and
its choices). Consult those when you need a specific option; this doc only covers the machinery around them.

### Schema migrations

When you change the **shape** of stored settings/preset data (split an option, rename a key, drop a field),
add a migration rather than living on read-time fallbacks forever. Migrations run through one versioned
runner: a `UNYSONPLUS_SCHEMA_VERSION` constant + a `version => callback` map; on `admin_init` every callback
newer than the stored `unysonplus_schema_version` option runs in order, then the stored version advances.
Callbacks **must be idempotent** (a re-run / fresh install is a no-op).

## Preset system & Preset Library — keep in sync

Many tabs carry a **"Quick start" preset picker** (the `preset-loader` option type). Presets are registered
in **`settings-presets.php`**: one entry per group as `{ label, allowed_keys, presets: { key => { label,
desc, values } } }`. Applying a preset whitelists its `values` to `allowed_keys` and overlays them onto the
saved group values. On top of that sits the **Preset Library** — a "Browse Library" modal on each picker
that **downloads** presets from the shared content repo (`UnysonPlus-Library/presets/`) into the uploads
dir and injects them into the registry so they render as cards and Apply through the same flow.

The **preset-backed groups** (high level): the header sections (`header_layout`, `header_menu`,
`header_topbar`, `header_main`, `header_bottombar`), the footer sections (`pre_footer_columns`,
`main_footer_columns`, `post_footer_columns`, `copyright_settings`), plus `general_pages`, `typography`,
`social_style`, `blog_index`, `blog_card`, and `portfolio_archive`.

> **CRITICAL — a preset stores option VALUES keyed by leaf option id.** So the "Quick start" pickers **and**
> the Preset Library go **stale** the moment an option changes. Whenever you **add / remove / rename an
> option, or change its value shape** in a preset-backed group you MUST also:
>
> 1. **`allowed_keys`** — add/remove the leaf id in that group's `allowed_keys` (an unlisted key is silently
>    dropped on Apply; a stale listed key is harmless but should be cleaned).
> 2. **Built-in preset `values`** — update every affected preset's `values` in `settings-presets.php` so
>    they still produce the intended result under the new option shape.
> 3. **Library preset files** — regenerate the affected downloadable presets in `UnysonPlus-Library/presets/`
>    (`<slug>.json` + `catalog.json`). The reliable way is to **re-dump from the live registry** (a
>    WP-loaded script reading the preset groups and writing each preset's `values`), not hand-editing.
> 4. If it's a **value-shape** change, add a **schema migration** (above) so already-saved settings AND
>    already-installed library presets are corrected.
>
> The same staleness applies to the page-builder **Template Library** (`UnysonPlus-Library/templates/`): a
> shortcode att change can make stored template trees stale — regenerate the affected template exports.

## CSS generation

The front-end design CSS is **compiled from the saved settings**, not hand-written per site. Colors,
typography, buttons, boxes, and spacing become **CSS custom properties + rules**:

- Typography → `--h1..h6/body` family/size/line-height/letter-spacing/color tokens (incl. mobile tiers).
- Layout / header / footer / colors → a `:root { … }` var block (`--site-bg-color`, `--container-gutter`,
  `--header-bg`, `--header-min-height`, `--footer-*`, `--color-text`, `--font-body`, `--font-heading`, …).
- Per-section **Custom Styling** rules (each header/footer section) + global rules.

On the front end these are concatenated into **one generated stylesheet** under
`uploads/unysonplus/css/` (part of the single `uploads/unysonplus/<subdir>/` parent — see Uploads). The
file is a **cache**: it's rebuilt and rewritten only when its content hash changes, with proactive rebuilds
on settings save. **Regenerate / clear that cache (or the asset-optimizer cache) after changing settings**
so the new CSS is emitted; a hard refresh in `wp-admin` may be needed to see admin-side builder changes.

### Color presets expose CSS variables

Every **color preset** is available as **`var(--color-<slug>)`**, live-linked to Theme Settings → Colors.
Elements should **consume** a preset rather than hard-code a hex: the compact color-preset picker saves
`{ predefined: 'text-…'|'bg-…', custom: '#hex' }`; a `predefined` value resolves to `var(--color-<slug>)`
(strip the `text-`/`bg-` prefix), so recoloring the palette recolors every element that referenced it.

## Header / footer builder

The theme renders the site **chrome** around builder content:

- A **header region** built from the header settings (Identity, Layout, Top Bar, Main Header, Bottom Bar).
  The bars have **no Enable switch** — a bar renders only when one of its columns holds an element.
- A **footer** output as `#colophon.footer` from the Pre / Main / Post footer sections + copyright.

**Footer Layout options** live in the footer settings (bg color/image/overlay, text/link color, padding,
CSS class). One instructive example is the **"Overlay on last section" toggle**: it is **positioning-only**
— it lifts the footer to overlay the page's final section, is **JS-gated to a sufficiently tall last
section**, and defaults to a **transparent background** so the section shows through. It changes placement,
not the footer's content or which sections render.

### Heading order (required)

The theme's chrome must not break the page heading outline. **Footer and sidebar column titles are `<h2>`
styled small — never `<h4>`/`<h5>`.** A region under the page `<h1>` starts its titles at `<h2>`; make them
look like a small "eyebrow" with CSS (`font-size`, uppercase, letter-spacing), not by reaching for a deeper
tag. Skipping a level going **down** (e.g. `h2 → h4`) fails the accessibility "sequentially-descending
headings" audit; jumping back **up** is fine. Any element that renders a heading should expose a
`heading_tag`/`title_tag` select so the author picks the level for the context.

## Demo option pages — keep both in sync

The theme ships **two** demo option pages that showcase every option type: **`demo.php`** and **`demo-2.php`**.
Their fields mirror each other — `demo-2.php`'s ids carry a **`_2` suffix** (`demo_datetime_range` ↔
`demo_datetime_range_2`) — so both a "Without Box" and a "With Box" layout are demonstrated.

> **Whenever you change one, change the OTHER the same way** — adding, removing, reordering, or reconfiguring
> a demo option, or fixing caption/`desc` copy. Apply the equivalent edit to the `_2` field so the two pages
> never drift; a quick diff of field order + captions across both confirms parity.

## Uploads

The theme writes to the uploads dir through the **same shared helper as the plugin**, so everything lands
under the single **`uploads/unysonplus/<subdir>/`** parent (no scattered sibling folders). Because the theme
can't assume the plugin is active, the call is **guarded**:

```php
$dir = function_exists( 'fw_upw_uploads_dir' )
    ? fw_upw_uploads_dir( 'presets' )['path']   // uploads/unysonplus/presets
    : $fallback;
```

`fw_upw_uploads_dir( $subdir )` returns `array( 'path' => …, 'url' => … )` (no trailing slash). Theme-owned
sub-dirs include `presets` (Preset Library) and `css` (generated stylesheet). Never hard-code a
`wp_upload_dir()` path.

## Manual-edit guard

Importers that regenerate builder pages from source JSON must **never clobber a page the user hand-edited**.
On import they **fingerprint** the builder JSON they wrote (`_upw_import_hash` post meta); on a later run they
**SKIP** any page whose current builder JSON differs from that fingerprint (= the user edited it) or that has
no fingerprint yet. Override only with an explicit force env flag (`UPW_FORCE=1`), and only **after** folding
the user's manual edits back into the source JSON so nothing is lost. Any new importer you add must carry the
same guard. When editing theme/source files in bulk, likewise **read the current file first** and preserve
manual tweaks rather than restoring a stale version.

## Child theme relationship

The parent is designed to be extended by a **child theme** (there is a sample child theme in the workspace):

- A child theme documents only its **deltas** — extra options, changed defaults, overridden header/footer
  templates, its own CSS-token map — in a thin `framework-customizations/theme/options/AGENTS.md` that links
  back to the parent. Features like settings export/import are inherited from the parent automatically.
- Child / demo themes may **bundle Theme Builder templates** as `up-templates/*.json` at the theme root;
  these **auto-import on activation** (the theme-builder seeder runs on `after_switch_theme`), so activating
  the theme brings its header/footer/page templates with it.

## Quick reference

- Settings option: `fw_theme_settings_options:<theme-id>`; read `fw_get_db_settings_option()`, write
  `fw_set_db_settings_option()`.
- Preset registry: `settings-presets.php` (`allowed_keys` + built-in `values`); Library downloads into
  `uploads/unysonplus/presets/`. Change an option → update both **and** regenerate downloadable presets +
  add a migration.
- Generated CSS: cached under `uploads/unysonplus/css/`; color presets → `var(--color-<slug>)`; clear the
  cache after settings changes.
- Chrome: header region + `#colophon.footer`; footer column titles are `<h2>` styled small.
- Demo pages: `demo.php` **and** `demo-2.php` (mirror `_2` fields) stay in sync.
- Uploads: guarded `fw_upw_uploads_dir()`; importers guard with `_upw_import_hash`.
