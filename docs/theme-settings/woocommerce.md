# Theme Settings — WooCommerce

The Theme Settings → WooCommerce tab is a POINTER only, not a settings surface — it holds no configurable options.

## WooCommerce (box)

### WooCommerce pointer — `woo_pointer`
- **Type**: `html-full` (static HTML block; no stored value, no choices).
- **Default**: n/a.
- **Notes**: This tab renders only an informational panel with a button ("Open WooCommerce Extension Settings") linking to `admin.php?page=fw-extensions&sub-page=extension&extension=woocommerce`. The tab is aggregated into the Theme Settings form ONLY when WooCommerce is active.

## Where the real settings live

All actual shop / catalog / single-product / behavior settings are owned by the **WooCommerce extension** (Unyson+ → Extensions → WooCommerce), which bridges them to the theme via the `unysonplus_woocommerce_*` filters. Configure the following THERE, not here: shop/catalog columns, products per page, sidebar, single-product gallery, catalog mode, sale badge, AJAX cart, and breadcrumb. This Theme Settings tab exists purely so those settings are discoverable from Theme Settings without maintaining a conflicting second copy.
