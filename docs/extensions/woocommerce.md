# woocommerce extension

Integrates WooCommerce with UnysonPlus — makes any active theme WooCommerce-aware and adds a **WooCommerce Elements** tab to the page builder (product grids/carousels, single product, categories, add-to-cart, cart icon & mini-cart, cart/checkout/account/order-tracking pages, product search & filters). **Inert until WooCommerce is installed and active.** **Active by default:** no (enable it under Extensions). Version: 1.0.16.

## Provides

- **Shortcodes (WooCommerce Elements tab):** `wc_products`, `wc_product`, `wc_product_page`, `wc_product_categories`, `wc_add_to_cart`, `wc_cart`, `wc_cart_link`, `wc_mini_cart`, `wc_free_shipping`, `wc_checkout`, `wc_account`, `wc_my_account`, `wc_order_tracking`, `wc_product_search`, `wc_product_filters` → `../shortcodes/` for atts. Each is a friendly wrapper around the matching classic WooCommerce shortcode (except the custom grid/carousel/mini-cart markup).
- **Settings/options:** a **Shop** settings page. Key ids include `shop_columns`, `products_per_page`, `shop_sidebar`, gallery thumbnail columns, related-products count (`catalog_box` / `single_box`), plus **Shop Behavior** toggles (Catalog Mode, sale-badge style, AJAX add-to-cart, breadcrumb, product-gallery zoom/lightbox/slider).
- **Theme support:** if the current theme hasn't declared WooCommerce support, the extension declares it (+ gallery zoom/lightbox/slider) and enqueues a small generic stylesheet — so any theme renders a reasonable shop.
- **Public hooks/filters:** bridges its settings to the active integration via the theme's `unysonplus_woocommerce_*` filters when present, else WooCommerce's own (`loop_shop_columns`, `loop_shop_per_page`, `woocommerce_product_thumbnails_columns`, `woocommerce_output_related_products_args`).

## Notes / gotchas

- **Completely inert without WooCommerce** — elements are hidden from the builder and no-op on the frontend when the plugin is inactive.
- When a WooCommerce-aware theme (e.g. `unysonplus-theme`, which ships its own wrapper/sidebar compat layer) is active, the extension **steps aside** and the theme leads.
- Product grids emit clean self-contained CSS-grid markup (neutralizing WooCommerce float rules) but keep the **native add-to-cart button** so AJAX / variable-product behavior is preserved.
- A `requirements => shortcodes` gate is deferred to Phase 2 (the builder elements depend on the shortcodes extension in practice).
