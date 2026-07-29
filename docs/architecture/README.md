# Architecture & internals

How the framework works *under the hood* — the render pipeline, option value-shapes, extension
points, and the Animation Engine / theme internals. This is the layer to read **before opening
plugin or theme PHP**: it's the same knowledge, in a fraction of the tokens.

Use it together with the rest of the kit:

- **Using what exists** (what to put on a page, which options a thing has) → `docs/shortcodes/`,
  `docs/option-types/`, `docs/animation-engine/`, `docs/extensions/`, `docs/theme-settings/`.
- **Adding something new** (a shortcode, option type, extension, module) → [`../extending.md`](../extending.md).
- **How the machinery works / how to hook it** (this section) → below.

## Docs in this section

| Doc | What it covers |
|---|---|
| [render-pipeline.md](render-pipeline.md) | How a page-builder element goes from saved options → rendered HTML. The per-shortcode file layout, the **two value-flow paths** (frontend/corrector via `get_value_from_attributes` vs the editor modal's raw atts — the root of the "changed value-shape breaks existing items" bug), the `sc_build_wrapper_attr` wrapper pipeline, and the items-corrector. |
| [option-value-shapes.md](option-value-shapes.md) | The non-scalar **stored value shapes** — `multi-picker` (inline vs popover label rule), the compact **color-preset** value (`{predefined, custom}`), typography, spacing, image-picker — and the **editor-load migration gotcha** (migrate JS-side + PHP + tolerate legacy scalar in the view). |
| [extension-points.md](extension-points.md) | The stable, public **hooks / filters / helpers** to build against: `fw_shortcode_get_options`, `sc_animation_fields`, `sc_build_wrapper_attr`, `fw_option_types_init`, `upw_anim_engine_module_tabs`, `fw_upw_uploads_dir()`, `sc_color_field_compact()` / `sc_normalize_color_value()`, `sc_section_background_field()`, `fw_get_db_settings_option()`. Not an exhaustive hook dump — the durable ones. |
| [animation-engine-internals.md](animation-engine-internals.md) | How the Animation Engine is wired: the module loader, per-element vs site-wide module kinds, the on-demand asset loader, effects-control gating, the shared **Lenis singleton** (`window.__upwLenis` / `__upwLenisBridged`, GSAP/ScrollTrigger bridge) and how the Scrollytelling Stage rides smoothed scroll. |
| [theme-internals.md](theme-internals.md) | The parent theme's systems: Theme Settings storage + schema migrations, the **preset system + Preset Library keep-in-sync** rule, CSS generation (settings → CSS custom properties, cached), the header/footer builder (+ heading-order rule), demo option-page parity, uploads routing, and the importer **manual-edit guard**. |

## The rule this section serves

Consult these docs (and the rest of the kit) **before** reading plugin/theme PHP. If a doc is missing
or looks stale, run `node docs/sync.mjs check` (it hashes source — near-zero tokens) to decide whether
it's genuinely absent or just undocumented, then read the *minimum* source — and **backfill the doc in
the same turn**, generalized (no site/brand names) and matching the existing style.
