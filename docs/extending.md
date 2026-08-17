# Extending UnysonPlus — shortcodes, option types, extensions

When a build needs something the framework doesn't ship, the right move is usually to **add it
to the framework** rather than hardcode a one-off ([conventions](conventions.md) §1). This is
the map, the anatomy of each thing you can add, and the conventions that apply.

For *using* what already exists, see `docs/shortcodes/`, `docs/option-types/`,
`docs/animation-engine/` and `docs/extensions/`.

## Where things live

| To add / modify… | Lives under… | Start from |
|---|---|---|
| A **shortcode** (page-builder element) | the shortcodes extension → `shortcodes/<name>/` | **[`../samples/sample-shortcode/`](../samples/sample-shortcode/)** |
| A **child theme** (one site's / brand's bespoke look + elements) | `wp-content/themes/<slug>/` | **[`../samples/sample-child-theme/`](../samples/sample-child-theme/)** |
| An **option type** (a new field UI + value shape) | the framework's `includes/option-types/<name>/` | an existing type's folder |
| An **extension** (a feature module: options, admin page, assets) | `framework/extensions/<name>/` | the reference extensions below |
| An **Animation Engine module** | the animation-engine extension → `modules/<name>/` | an existing module |

Each area has an `AGENTS.md` beside the code in the plugin source — read the nearest one before
editing. See *[Reading the real source](#reading-the-real-source)* for how to get it.

---

## Creating a child theme

**Use the template: [`samples/sample-child-theme/`](../samples/sample-child-theme/).** Two files — `style.css`
(the header + your CSS, which loads LAST in the cascade so plain selectors win) and
`functions.php` (a guarded `child-style` enqueue fallback + reference blocks for fonts, shipped
elements and template overrides). It installs and runs as-is. Its `README.md` has the full
procedure, the child-vs-plugin decision, and the verify checklist.

A child theme is the home for **one site's / one brand's** bespoke look and bespoke elements —
things that must survive parent-theme updates and only make sense for that site. Reusable code
goes in the plugin instead.

- **`Template: unysonplus-theme`** in the header is the identity (it names the parent folder).
- **Theme Settings are SHARED with the parent** — Unyson keys them by the parent template
  (`fw_theme_settings_options:unysonplus`), not the active stylesheet, so switching a site to a
  child theme of `unysonplus-theme` **keeps every setting** (colours, typography, buttons,
  header/footer, Custom CSS). Do not re-configure them; prefer Theme Settings over CSS even here.
- **Ship bespoke elements** under `framework-customizations/extensions/shortcodes/shortcodes/<name>/`
  (or `.../includes/option-types/<name>/`) — no registration call; the loaders scan the child theme
  when active. Build the element from [`samples/sample-shortcode/`](../samples/sample-shortcode/).
- **Staging:** a demos-network child theme lives in the demos install
  (`htdocs/demos/wp-content/themes/<slug>/`, network-enabled + activated on its subsite) with a
  tracked source under `unysonplus-website/wordpress/demos/demo-themes/<slug>/`; a standalone child
  theme stages in `test-sites/<slug>/` and runs in `testsite`.
- **Version marker** = the `style.css` `Version:` line — bump it on any change.

---

## Creating a shortcode

**Use the template: [`samples/sample-shortcode/`](../samples/sample-shortcode/).** It is a complete, installable
skeleton — every file present, each documenting the rule it enforces, with commented-out
reference code for repeaters, media uploads, dimensions, icons, conditional options and design
variants. `samples/sample-shortcode/HOW-TO.md` covers porting an existing standalone component (a
CodePen, a demo, a bought template) into an element.

### Leaf or section-like

The first decision, and the one most often got wrong.

| | **Leaf** (almost always) | **Section-like** (rare) |
|---|---|---|
| What it is | Renders content: heading, button, card, gallery, slider | Sits at page root and **holds rows and columns**, like `[section]` |
| Files | `config.php` · `options.php` · `views/view.php` (+ `static.php`, `static/`) | The same **plus** `class-fw-shortcode-<folder>.php` and a page-builder item class |
| Registration | **None** — the loader auto-discovers the folder | Two hooks in the class file |
| `$content` in the view | Empty | The rendered inner tree — you must echo it |

A leaf needs no PHP class at all. The class file is optional and the loader skips it when
absent — but if it *exists* without defining the matching class, it warns on every page load.

The folder name is the identity: `hero-banner` → the shortcode tag `hero_banner`.

### Conventions that matter

- **House style**: short array syntax `[]`, not `array()`. Match the surrounding code's density.
- **`options.php` is the contract.** It is both the edit-modal UI and the `atts` shape an AI
  generator must emit. Document it in the element's `AGENTS.md` and keep the two in sync —
  a stale schema means generated JSON is rejected on import.
- **The wrapper is not optional.** `sc_build_wrapper_attr( $atts )` on the outermost node folds
  in the unique class, the Advanced tab, spacing, and every Animation Engine hook. Skip it and
  your element is the only one that cannot be animated or targeted with CSS.
- **The canvas preview (`title_template` in `config.php`) escapes with `{{- }}`, not `{{= }}`.**
  It is an Underscore template: `{{ }}` evaluates, **`{{- }}` escapes**, **`{{= }}` is RAW**.
  Printing a user-typed att through `{{= }}` injects it into wp-admin. A template exception is
  caught and swallowed — the card silently falls back to the plain title and logs to the console
  — so "my preview shows only the title" usually means it threw. Guard every property access
  (`o["icon"] || {}`); atts are partial while the user types. The same delimiters apply to an
  `addable-popup`'s row `template`, except its fields are bare ids and its errors *are* visible
  (`[Template Error] …` inline).
- **Colours** → the compact colour-preset field, never a raw `color-picker`; resolve
  `{predefined, custom}` where you consume it ([conventions](conventions.md) §1).
- **Animations** are injected via the shared animation-fields helper — never hand-rolled per
  element.
- **Clean output** → semantic HTML, no classes on prose, a `heading_tag` wherever you render a
  heading, and the link rules ([conventions](conventions.md) §3).
- **Replaceable media** → every image and video is an editable option, never baked-in markup
  ([conventions](conventions.md) §4).
- **Ship `static/img/page_builder.svg`.** The builder auto-detects that exact path. Simple
  content elements use a 16×16 monochrome `#b3b3b3` pixel glyph; section-like elements use the
  larger `0 0 60 40` outlined style. Spec and rationale are in the template's SVG file.
- **Value-shape changes** to an existing option need a migration — **including a JS-side one**.
  See [`option-types/declaring-options.md`](option-types/declaring-options.md) → *Changing an
  existing option is a migration*.

### Shipping a shortcode inside a theme or child theme

A shortcode does **not** have to live in the plugin. A **theme or child theme can carry its own
shortcodes** — the right home for a bespoke element that only makes sense for one site/brand (a
booking widget, a review card, an interactive configurator) and should travel with the theme, not
be added to the framework for everyone.

**Location — drop the same folder under the theme's `framework-customizations` tree:**

```
<theme>/framework-customizations/extensions/shortcodes/shortcodes/<folder>/
    config.php · options.php · views/view.php · static/{css,js,img/page_builder.svg}
```

**No registration call is needed.** The shortcodes loader
(`extensions/shortcodes/includes/class-fw-shortcodes-loader.php`) scans four locations, in order:

1. **core** (bundled) `shortcodes/`
2. **user-uploaded** (uploads dir)
3. the **parent theme** — `fw_get_template_customizations_directory('/extensions/shortcodes/shortcodes')`
4. the **child theme** — `fw_get_stylesheet_customizations_directory('/extensions/shortcodes/shortcodes')`

So a folder at `<child-theme>/framework-customizations/extensions/shortcodes/shortcodes/cupcake-builder/`
becomes the tag `cupcake_builder`, discovered automatically whenever that theme is active. Folder name
is the identity (`-` → `_`); a same-named **core** tag wins, so don't shadow a bundled one.

**Everything else is identical to a plugin shortcode** — same file contract, same
`sc_build_wrapper_attr()`, same option types, same auto-detection of `static/img/page_builder.svg` for
the picker tile, assets enqueued automatically from the theme URI. The three differences that bite:

- **Plugin-only helpers must be `function_exists()`-guarded.** `sc_color_field_compact()`,
  `sc_normalize_color_value()`, `sc_card_box_style_class()` etc. live in the shortcodes extension.
  They're normally loaded before a theme shortcode, but guard each with a `color-picker` (or plain)
  fallback so the element still works if the plugin is older/absent:
  `function_exists('sc_color_field_compact') ? sc_color_field_compact([…]) : ['type'=>'color-picker', …]`.
- **Swatch/decorative colours** that define a *specific* colour (a cake-frosting swatch) stay a raw
  `color-picker` — the compact preset field is for colours that *consume the site palette*.
- **Version/mirror**: a theme shortcode ships with the THEME (bump `style.css` `Version:`), not a
  plugin manifest.

### Deciding the home — reuse scope × distribution intent (ASK when unclear)

Two independent axes decide where a new shortcode lives — and they are **not** the same question, so
resolve both. **When the intent isn't obvious from the task, ASK the user** (a one-time decision per
shortcode, not a per-build nag):

> *"How should this shortcode ship — (a) bundled in the **core plugin** (auto-updates for every site, but
> it becomes part of the framework release), (b) inside **this site's child theme** (travels with the
> theme, which is itself an uploadable `.zip`), or (c) as a **standalone extension** — its own
> distributable module a user activates under Unyson+ → Extensions and can hand out independently?"*

| Home | Ships as / distributed by | Right when… | Notes |
|---|---|---|---|
| **Core plugin** `framework/extensions/shortcodes/shortcodes/<name>/` | the full-plugin release ZIP (auto-updater) | it's **generic + reusable** AND belongs in the framework for everyone | contributor task (needs the plugin repo + a version bump); a core tag wins over same-named theme/upload tags |
| **Child theme** `<theme>/framework-customizations/extensions/shortcodes/shortcodes/<name>/` | inside the child-theme ZIP (Appearance → Add New → Upload) | it's **one site's / one brand's bespoke** element that should travel with the theme | no registration call — the loader scans the active theme; version = the theme's `style.css` |
| **Standalone extension** `framework/extensions/<name>/` (manifest `standalone`/`author`/`license`) | its **own** distributable module, activatable in Extensions | the user wants to **ship / sell / hand it out independently** of any one plugin or theme | see *Creating an extension* below; the closest thing to a self-contained, distributable package |
| **User-uploaded** (uploads dir) | dropped into the uploads dir | a quick per-site drop-in with no packaging | lightest path; no packaging UI/zip format today |

**Reuse scope picks the DEFAULT; distribution intent can override it.** "Reusable → plugin, bespoke →
child theme" is the *default*, but they're different axes: a **reusable** shortcode the user wants to
**distribute as their own add-on** goes in a **standalone extension**, not the core plugin — so don't
silently fold a would-be product into the framework. If the task doesn't make the intent clear, ask.

The porting procedure (`samples/sample-shortcode/HOW-TO.md`) is **identical for all homes** — only the destination
folder (and the version marker) changes.

**References:** the `newbingosite` child theme ships `mini-reviews` / `pros-cons` / `casino-matcher` /
`toplist-offers` this way; the `pinky-bites` demo ships an interactive `cupcake-builder` configurator.

---

## Creating an extension

An extension is a self-contained feature module: its own version, options, admin page, assets
and hooks, activatable independently in Unyson+ → Extensions.

### Anatomy

```
framework/extensions/<name>/
├── manifest.php                     REQUIRED   name, slug, version, description, requirements
├── class-fw-extension-<name>.php    REQUIRED   the main class — extends FW_Extension
├── thumbnail.svg                    REQUIRED   the Extensions-manager card icon (strict spec below)
├── settings-options.php             optional   the extension's Settings page (box → group layout)
├── static.php                       optional   front-end enqueues
├── hooks.php                        optional   filters/actions registered at load
├── helpers.php                      optional   public helper functions
├── includes/                        optional   classes the extension owns
├── views/                           optional   templates
├── static/                          optional   css / js / img
├── shortcodes/<name>/               optional   elements this extension ships (same shape as
│                                               the shortcodes extension's own)
└── extensions/<name>/               optional   nested sub-extensions
```

`manifest.php` defines `$manifest` with at least `name`, `slug`, `version`, `description`, and
usually `display` (show it as a row in the manager), `standalone`, `author`, `license`,
`requires_php` and a changelog docblock.

### Best references, by what you are building

Read the one closest to your case rather than a generic example — each is small enough to read
end to end.

| If your extension is… | Read | Why |
|---|---|---|
| **Settings + a front-end feature** — the common case | **`breadcrumbs`** | The canonical minimal extension: manifest, main class, `settings-options.php`, `static.php`, one view, one helper file. Start here. |
| Mostly a **helper/hook layer** | `snippets` | Shows `hooks.php` + `helpers.php` alongside shortcodes the extension ships itself |
| A **custom admin page** with native tabs | `asset-optimizer`, `site-converter` | `render_*_page()` with `nav-tab-wrapper` tabs; option-array tabs rendered via `fw()->backend->render_options()` |
| A **bespoke management dashboard** | the shortcodes extension's own admin page | The documented exception to postbox chrome — a searchable card grid with its own CSS |
| A **large feature with sub-modules** | `animation-engine` | One extension, many self-contained modules |
| Elements + a **shared helper layer** | the `shortcodes` extension | The pattern for `includes/` helpers that other code hooks into |

### Conventions

- **Settings pages built from option arrays use `box` → `group`.** Each `box` renders as a
  WordPress postbox; the nested `group` removes the borders between rows so the fields read as
  one section. Apply it to *every* box — one un-grouped box among grouped ones is immediately
  visible. Full detail: [`option-types/containers.md`](option-types/containers.md).
- **Custom admin pages must not hand-roll `<div class="postbox">`.** Keep `get_page_options()`
  returning raw leaves, add `get_page_boxes()` wrapping them in `box` → `group`, and render with
  `fw()->backend->render_options()`. Leaf ids stay the same, so save and enqueue paths are
  unchanged.
- **Tabs are native WordPress `nav-tab-wrapper` markup**, not a hand-rolled pill UI.
- **Any `wp_ajax_nopriv_*` endpoint gets `fw_rate_limit_ajax()` right after its nonce
  check.** A nonce is printed into every page a visitor receives — it proves the request
  came from a page we rendered, not that it is the first of thousands. Pick the limit from
  what the request *costs*: core uses `fw_rate_limit_ajax( 'x', 5, 600 )` for newsletter
  signup (it sends mail on every call) and 40–90 per minute for query-backed endpoints.
  The IP is salted-hashed (never stored in cleartext), `edit_posts` users are exempt, and
  it fails open. Available since core 2.16.20; full reference:
  [PHP Helpers → Rate limiting](https://unysonplus.github.io/docs/helpers/php#rate-limiting).
- **Guard destructive actions with `fw.confirm()`, and declare `'fw'` in BOTH the script and
  the style dependency arrays.** The confirm dialog renders WordPress's own `.media-modal`
  markup and takes its appearance from the `fw` **style** handle. Declaring only the script is
  the trap that has bitten this codebase: `fw.confirm()` runs, but with no `fw.css` the dialog
  renders as unstyled text in normal document flow at the bottom of the page, leaving the
  action unconfirmable. So `array( 'jquery', 'fw' )` for the script *and* `array( 'fw' )` for
  the style. `fw.css` pulls in core's `media-views` itself, so `wp_enqueue_media()` is not
  needed for a confirm (it still is for `fw.OptionsModal`, which needs the media JS). The
  action goes inside the callback — the dialog is asynchronous, so there is no return value to
  branch on. The dialog sizes itself to its message; never add height for longer text. Full
  API: [JavaScript Helpers → Confirmation](https://unysonplus.github.io/docs/helpers/javascript#confirmation).
- **`thumbnail.svg` follows a strict spec** so every extension card looks like one set:
  `viewBox="0 0 256 256"`, **monochrome white** (`#ffffff`) line glyph, **no background** (the
  manager draws the dark tile — a self-drawn one renders as a dark box inside the tile), thick
  rounded strokes (~12–16), centred with padding.
- **Uploads go under one parent uploads folder** via the shared uploads-dir helper. Never
  hardcode a scattered upload path; new folders route through the helper so the uploads root
  stays a single directory.
- **Public API is deliberate.** Helpers and filters an extension exposes are contracts other
  extensions and themes will depend on. Name them with the extension's prefix, and treat
  renaming one as a breaking change.

---

## Creating an option type

An option type is a folder under `framework/includes/option-types/<name>/` with a class
extending `FW_Option_Type`, plus its view and static assets. The methods that matter:

| Method | Responsibility |
|---|---|
| `get_type()` | The type id used in `'type' => '…'` |
| `_get_defaults()` | The config keys the option accepts **and their defaults** |
| `_render()` | The admin-side markup |
| `_get_value_from_input()` | **Validation.** Turn submitted input into the stored value — and fall back to the default when it is invalid. This is the security boundary. |
| `_enqueue_static()` | The option's own admin CSS/JS |

Before writing one, check whether an existing type plus a `*_field()` builder helper gets you
there. Most "new option types" turn out to be a `select` or a `multi-picker` with a helper that
builds its choices from a live registry — which is cheaper to maintain and inherits every
existing behaviour.

If you do add one: document its **stored shape** and its **config keys** in
`docs/option-types/<name>.md`, in the same change.

---

## Converting an existing site into UnysonPlus

Two paths share one deterministic algorithm — keep them in sync if you touch the logic:

- **URL** → the capture service (renders the page, extracts tokens + structure).
- **File upload** → the in-plugin converter.

Principles: **Theme-Settings-first** (emit colour/typography/button/box presets that elements
*consume*, not scoped CSS); header/footer/nav are **chrome** handled by the generated theme, not
page-builder content; map source elements to **real shortcodes with replaceable media**; work
incrementally and verify each component. See the converter docs for the full playbook and the
SEO / performance / accessibility ship gate.

---

## Reading the real source

This kit is a curated reference, not a copy of the codebase. For depth — how an option type
validates its input, how a shipped element solved a specific problem, what helpers exist — read
the source.

**First check [`architecture/`](architecture/) — it harvests most of the "how it works" prose
(render pipeline, value-shapes, extension points, Animation Engine / theme internals) so you
usually don't need the source at all.** Only when it doesn't cover what you need, read the PHP —
and backfill the matching doc in the same turn (see [`architecture/README.md`](architecture/README.md)).

**The kit fetches it for you.** `assemble.ps1` populates the gitignored `unysonplus/` and
`unysonplus-theme/` folders:

```bash
pwsh assemble.ps1 -Source github     # latest full plugin release + parent theme
```

**Or clone directly:**

| Repo | Contains | Read it for |
|---|---|---|
| `https://github.com/UnysonPlus/UnysonPlus-Shortcodes-Extension.git` | The shortcodes extension | Every element's real `options.php` / `view.php`, each with its own `AGENTS.md`; the shared helper layer in `includes/` (styling, animation, icons, backgrounds, pluggable designs); the section-like recipe in `shortcodes/AGENTS.md` |
| `https://github.com/UnysonPlus/UnysonPlus.git` | The plugin **core** | `FW_Option_Type` and the option/container type internals under `framework/includes/`; the extension base class |
| `https://github.com/UnysonPlus/UnysonPlus-Theme.git` | The parent theme | How Theme Settings define the presets elements consume — colours, typography, buttons, box presets, spacing |

Individual extensions also have their own repos, named
`UnysonPlus-<Name>-Extension` (every word hyphenated).

> **Trap:** cloning `UnysonPlus.git` gets you **core only** — no page builder and no shortcodes.
> It activates cleanly, which is what makes the mistake hard to spot. For a working install use
> the **release zip** (or `assemble.ps1`); for shortcode source, use the Shortcodes-Extension
> repo.

---

## Keep docs & artifacts in sync

Changing a documented surface means updating what references it, in the same pass:

- The matching **kit doc** (`docs/shortcodes|option-types|animation-engine|extensions|theme-settings/`).
  `docs/sync.mjs` flags docs whose source has changed.
- The element's own **`AGENTS.md`** — its atts table is the contract AI generators read.
- **Preset-backed Theme Settings** groups → the preset library and downloadable presets go
  stale; regenerate them and add a schema migration for any value-shape change.
- **Shortcode att changes** → saved page-builder templates carrying those atts go stale;
  regenerate the affected exports.

## Reminder — version + verify

Bump the affected component's version on any meaningful change. Then verify, in this order: the
option renders in the builder, it **saves and survives a reload**, the front end renders with no
PHP notices or JS errors, and **two instances on one page** work independently. That last one
catches the `document.querySelector` and hardcoded-id bugs that nothing else will.

**If you touched an option type, value handling, or the builder's stored JSON, run the core
contracts suite** — it guards the things that fail silently rather than loudly (nested value
access, option value shapes, and the page-builder round trip):

```
php D:/xampp/wp-cli.phar --path=D:/xampp/htdocs/core-upgrade eval-file \
    "D:/xampp/htdocs/core-upgrade/wp-content/plugins/unysonplus/framework/tests/core-contracts-test.php"
```

Exit 0 = all pass, 1 = something regressed. It is deliberately small — it does not chase coverage,
it pins the contracts whose breakage shows up later as corrupted saved data. Two things it
encodes that are easy to get wrong from reading the code alone: `fw_akg()` treats `0`, `''` and
`false` as **values**, not as missing; and the `switch` option type's wire format (`'true'`) is
not its storage format (`true`), so its output is not valid as its own input.
