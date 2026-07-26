# Extending UnysonPlus — shortcodes, option types, extensions

When a build needs something the framework doesn't ship, the right move is often to **add it to the
framework** rather than hardcode a one-off ([conventions](conventions.md) §1). This is the map + the
conventions for creating shortcodes, option types, and extensions. For *using* what already exists,
see `docs/shortcodes/`, `docs/option-types/`, and `docs/extensions/`.

## Where things live

| To add / modify… | Lives under… |
| --- | --- |
| A **shortcode** (page-builder element) | the shortcodes extension → `shortcodes/<name>/` |
| An **option type** (a new field UI + value shape) | the framework's `includes/option-types/<name>/` |
| An **extension** (a feature module: its own options, admin page, assets) | `framework/extensions/<name>/` |
| An **Animation Engine module** | the animation-engine extension → `modules/<name>/` |

Each area has an `AGENTS.md` beside the code — read the nearest one before editing.

## Creating a shortcode (the shape)

A shortcode folder typically has: a `manifest`/config, an `options.php` (its builder options), a
`views/view.php` (front-end render), and its own `static/` CSS/JS. Conventions that matter:

- **House style**: short array syntax `[]`, not `array()`. Match the surrounding code's density.
- **Colors** → use the color-preset field helper (preset dropdown + inline custom picker), not a raw
  `color-picker`, and resolve its `{predefined, custom}` value where you consume it
  ([conventions](conventions.md) §1).
- **Animations** → element effects are injected via the shared animation-fields filter and baked to
  the wrapper; you don't hand-roll them per shortcode.
- **Clean output** → semantic HTML, no stray classes on prose; expose a `heading_tag` where you render
  a heading; apply the link rules ([conventions](conventions.md) §3).
- **Replaceable media** → any image/video is an editable option/element, never baked-in markup
  ([conventions](conventions.md) §4).
- **Value-shape changes** to an existing option (e.g. scalar → `multi-picker`) need a **migration**
  (and, for builder items, a JS-side migrator) so old saves don't error on edit.

## Creating an extension

An extension is a self-contained feature: a `manifest.php` (name, version, requirements, thumbnail),
a main class that registers its options / Theme Settings section / admin page / assets, and its
`static/`. Conventions:

- **Settings pages** built from option arrays use the **metabox-holder + `box` → `group`** layout and
  **native `nav-tab-wrapper`** tabs ([conventions](conventions.md) §6). A bespoke management dashboard
  is exempt from the postbox chrome.
- **`thumbnail.svg`** (the Extensions-manager card icon) follows a strict set: `viewBox="0 0 256 256"`,
  **monochrome white** (`#ffffff`) line glyph, **no background** (the manager draws the dark tile),
  thick rounded strokes (~12–16), centered with padding. All extension icons must look like one set.
- **Uploads** go under one parent uploads folder via the shared uploads-dir helper — don't hardcode
  scattered upload paths.

## Converting an existing site into UnysonPlus

Two paths share one deterministic algorithm — keep them in sync if you touch the logic:
- **URL** → the capture service (renders the page, extracts tokens + structure).
- **File upload** → the in-plugin converter.

Principles: **Theme-Settings-first** (emit colors/typography/buttons/box presets that elements
*consume*, not scoped CSS); header/footer/nav are **chrome** handled by the generated theme, not
page-builder content; map source elements to **real shortcodes with replaceable media**; work
incrementally and verify each component. See the converter docs for the full playbook and the
SEO/performance/accessibility ship gate.

## Keep docs & artifacts in sync (when you change a surface)

Changing a documented surface means updating what references it, in the same pass:
- The matching **kit doc** (`docs/shortcodes|option-types|animation-engine|extensions|theme-settings/`)
  — this kit ships a `docs/sync.mjs` that flags docs whose source changed.
- **Preset-backed Theme Settings** groups → the Preset Library + downloadable presets can go stale;
  regenerate them and add a schema migration for any value-shape change.
- **Shortcode att changes** → page-builder templates that stored those atts can go stale; regenerate.

## Reminder — version + verify

Bump the affected component's version on any meaningful change, verify the new option renders in the
builder and saves/reloads correctly, and confirm the front end (render, effects, no errors) before
calling it done.
