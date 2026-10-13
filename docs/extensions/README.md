<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Extensions — overview index

> 📖 **Human manual (live, always current):** [Extensions on the UnysonPlus docs](https://unysonplus.github.io/docs/extensions/overview). These kit files are the AI-optimized reference; the live manual is the human companion.

One overview per plugin extension: what it is, **how a site gets it**, and what it
**provides** (cross-linked to the granular refs). These are summaries — the exact atts/option
shapes live in `../shortcodes/`, `../option-types/`, `../theme-settings/README.md`, and
`../animation-engine/`.

> **The public plugin zip is CORE-ONLY.** `unysonplus.zip` ships the core framework + only the **`blog`**
> and **`update`** extensions. Every other extension is **downloaded and activated from Unyson+ →
> Extensions** (the Extensions manager), which also pulls in an extension's parent and required
> extensions. With `unysonplus-theme` active, activating the plugin opens an *Install Compatible
> Extensions* screen for the theme's recommended set (marked **theme-recommended** below). Nothing
> else is active until someone installs it — check **Unyson+ → Extensions** on the actual site.

| Extension | How a site gets it | Provides (agent-facing) |
|---|---|---|
| **shortcodes** | theme-recommended (parent of Page Builder) | The page-builder + all core shortcodes → `../shortcodes/` |
| **snippets** | theme-recommended | Reusable code/HTML snippets |
| `animation-engine` | download | 26 effect modules → `../animation-engine/`; 6 shortcodes (gallery-3d, image-sequence, model-viewer, svg-draw, svg-morph, webgl-object) |
| `animated-icons` | download | Adds an **"Animated"** tab to the icon picker so any icon option (`icon`/`icon-v2`/`icon-v3`) can use an animated icon → `animated-icons.md` |
| `megamenu` | download | Mega-menu builder for header nav (see `../theme-settings/README.md` Header → Menu) |
| `forms` | download (brings `builder`; its Contact Forms sub-extension needs `mailer`) | `[contact-form]` + a form-builder option type (needs `builder` + `mailer`) |
| `portfolio` | download | `portfolio` CPT + `portfolio` / `project-gallery` shortcodes |
| `breadcrumbs` | download | `[breadcrumbs]` shortcode + schema.org BreadcrumbList |
| `elementor` | download | 64 Unyson+ elements (content, shop, motion) as native Elementor widgets (`up-<tag>`), edited in Elementor's side panel; hides the locked Pro tiles; Design Sync with the Elementor Site Kit (formerly `builder-sync`); `settings_from_atts()` for the Site Converter → `elementor.md` |
| `seo` | theme-recommended | Dynamic `%%tag%%` title/description templates with auto-generation, canonical URLs, robots control, XML sitemaps, live SERP preview → `seo.md` |
| `custom-fields` | download | ACF-style field groups; values stored in the post's framework options (`fw_options`), read with `fw_get_field()` / `fw_get_db_post_option()` → `custom-fields.md` |
| `post-types` | download | Custom post types / taxonomies |
| `site-converter` | download | URL/HTML → UnysonPlus conversion (the automated pipeline) |
| `live-editor` | theme-recommended | Front-end inline editing ("Edit Live"); needs `page-builder` |
| `builder` | download (required by Shortcodes / Forms — pulled in with them) | The base `builder` option type (fifths grid, template AJAX) |
| `theme-builder` | theme-recommended | Header / Body / Footer parts built with the page builder, bundled into Templates with Use On / Exclude From conditions (single posts, CPTs, archives, 404, …); also documents the **Dynamic Content tokens** (`{{post_title}}`, `{{post_meta\|key=…}}`, …) → `theme-builder.md` |
| `template-library` | download | Importable page/section templates |
| `blog` | **in the core zip** (hidden) | Blog rendering (settings in Theme Settings → Blog) |
| `mailer` | download — hidden; pulled in as a requirement of Forms' Contact Forms | Mail transport (`fw_ext_mailer_send_mail()`) |
| `admin-skin` | download (seeded active once **only if** present in the build — the public zip doesn't include it; deactivating sticks) | Token-driven skin over the real wp-admin: grouped sidebar, top bar, light/dark/system + per-user accent, skin packages → `admin-skin.md` |
| `security` | download (never auto-activated — changes how people sign in) | Login throttling, TOTP two-factor, XML-RPC/header/user-listing hardening, custom login address, Site Health checks; each measure off until switched on → `security.md` |
| `asset-optimizer` | theme-recommended | CSS/JS combine + optimization (own settings page) |
| `site-migration` | download | Whole-site push to another install via a connection key; signed transport, staging-and-swap → `site-migration.md` |
| `sidebars` | download | Custom widget areas |
| `chat` | download | Floating chat button (Theme Settings → Site-wide UX) |
| `ai-assistant` *(beta)* | download | `unysonplus/*` abilities (WP Abilities API, WP 6.9+): build/edit pages, Theme Settings, presets, templates, conversion — with validation + undo; builder panel, site-wide assistant, MCP server, Chat AI channel; `fw_ai_register_ability()` for other extensions → `ai-assistant.md` |
| `newsletter-crm` | download | Stores `[newsletter]` signups + the base a CRM (tags/segments, campaigns, ESP sync) grows onto → `newsletter-crm.md` |
| `short-links` | download | Branded short URLs on the site's domain (301/302/307/308) with click tracking, reports, categories, CSV/JSON import + export (incl. from another link plugin), `[short_link]`, `fw-short-links/v1` REST API with API keys + signed webhooks → `short-links.md` |
| `visitor-insights` | download | Self-hosted, privacy-first visitor analytics: cookieless traffic, click / scroll / attention / frustration heatmaps, builder-section reach, goals, funnels, section A/B tests, form analytics, site search, rage / dead / error clicks, script errors, 404s, Core Web Vitals, weekly email, AI Assistant abilities, consent-only session recording → `visitor-insights.md` |
| `update` | **in the core zip** | Plugin/extension auto-updates |
| `woocommerce` | download (does anything only while WooCommerce is active) | Shop integration (only when WooCommerce active) |

**Building a site touches:** `shortcodes` / Page Builder (+ `theme-builder` for post / archive
templates, `animation-engine`, `forms`, `portfolio`, `megamenu` for their elements/effects) — each one downloaded
from Unyson+ → Extensions first. The rest are backend/functional — an agent generating page JSON rarely
sets them. "theme-recommended" = listed in the parent theme's `supported_extensions` (offered for one-click install,
and activated on theme switch once installed); confirm in **Unyson+ → Extensions** on the actual site.
