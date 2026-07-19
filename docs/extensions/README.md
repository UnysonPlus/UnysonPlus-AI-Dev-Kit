# Extensions — overview index

One overview per plugin extension: what it is, whether it's active by default, and what it
**provides** (cross-linked to the granular refs). These are summaries — the exact atts/option
shapes live in `../shortcodes/`, `../option-types/`, `../theme-settings/README.md`, and
`../animation-engine/`.

| Extension | Active by default | Provides (agent-facing) |
|---|---|---|
| **shortcodes** | **yes** (core) | The page-builder + all core shortcodes → `../shortcodes/` |
| **snippets** | **yes** | Reusable code/HTML snippets |
| `animation-engine` | **no** (activate in Extensions) | 21 effect modules → `../animation-engine/`; 6 shortcodes (gallery-3d, image-sequence, model-viewer, svg-draw, svg-morph, webgl-object) |
| `megamenu` | no | Mega-menu builder for header nav (see `../theme-settings/README.md` Header → Menu) |
| `forms` | no | `[contact-form]` + a form-builder option type (needs `builder` + `mailer`) |
| `portfolio` | no | `portfolio` CPT + `portfolio` / `project-gallery` shortcodes |
| `breadcrumbs` | no | `[breadcrumbs]` shortcode + schema.org BreadcrumbList |
| `custom-fields` | no | ACF-style fields → post meta (`fw_get_field()`) |
| `post-types` | no | Custom post types / taxonomies |
| `site-converter` | no | URL/HTML → UnysonPlus conversion (the automated pipeline) |
| `live-editor` | no | Front-end inline editing ("Edit Live"); needs `page-builder` |
| `builder` | yes (core) | The base `builder` option type (fifths grid, template AJAX) |
| `template-library` | no | Importable page/section templates |
| `blog` | hidden (core) | Blog rendering (settings in Theme Settings → Blog) |
| `mailer` | hidden (dependency) | Mail transport (`fw_ext_mailer_send_mail()`) |
| `asset-optimizer` | no | CSS/JS combine + optimization (own settings page) |
| `sidebars` | no | Custom widget areas |
| `chat` | no | Floating chat button (Theme Settings → Site-wide UX) |
| `update` | core | Plugin/extension auto-updates |
| `woocommerce` | conditional | Shop integration (only when WooCommerce active) |

**Building a site touches:** `shortcodes` (+ `animation-engine`, `forms`, `portfolio`, `megamenu`
for their elements/effects). The rest are backend/functional — an agent generating page JSON rarely
sets them. "Active by default" is inferred from the theme's `supported_extensions` + each
extension's description; confirm in **Unyson+ → Extensions** on the actual site.
