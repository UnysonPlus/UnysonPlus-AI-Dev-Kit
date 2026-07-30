# woocommerce extension

Integrates WooCommerce with UnysonPlus — makes any active theme WooCommerce-aware and adds a **WooCommerce Elements** tab to the page builder (product grids/carousels, single product, categories, add-to-cart, cart icon & mini-cart, cart/checkout/account/order-tracking pages, product search & filters). **Inert until WooCommerce is installed and active.** **Active by default:** no (enable it under Extensions).

## Provides

- **Shortcodes (WooCommerce Elements tab):** `wc_products`, `wc_product`, `wc_product_page`, `wc_product_categories`, `wc_add_to_cart`, `wc_cart`, `wc_cart_link`, `wc_mini_cart`, `wc_free_shipping`, `wc_checkout`, `wc_account`, `wc_my_account`, `wc_order_tracking`, `wc_product_search`, `wc_product_filters` → `../shortcodes/` for atts. Each is a friendly wrapper around the matching classic WooCommerce shortcode (except the custom grid/carousel/mini-cart markup).
- **Settings/options:** a **Shop** settings page. Key ids include `shop_columns`, `products_per_page`, `shop_sidebar`, gallery thumbnail columns, related-products count (`catalog_box` / `single_box`), plus **Shop Behavior** toggles (Catalog Mode, sale-badge style, AJAX add-to-cart, breadcrumb, product-gallery zoom/lightbox/slider).
- **Theme support:** if the current theme hasn't declared WooCommerce support, the extension declares it (+ gallery zoom/lightbox/slider) and enqueues a small generic stylesheet — so any theme renders a reasonable shop.
- **Public hooks/filters:** bridges its settings to the active integration via the theme's `unysonplus_woocommerce_*` filters when present, else WooCommerce's own (`loop_shop_columns`, `loop_shop_per_page`, `woocommerce_product_thumbnails_columns`, `woocommerce_output_related_products_args`).

## Mini-cart branding (`wc_mini_cart`)

Beyond `icon` / `trigger` (click|hover) / `show_count`, the mini-cart flyout can be fully rebranded via four Content options (each empty = keep the WooCommerce default): **Panel Title** (heading at the top of the open panel, shown with the icon), **Subtotal Label** (replaces the word "Subtotal" inside the panel), **Checkout Button Text** (replaces the "Checkout" button label), and **Footnote** (a small reassurance line under the checkout button). Subtotal/Checkout are relabeled with a `gettext` filter scoped to just that panel render (added immediately before `woocommerce_mini_cart()` and removed right after), so they don't leak to the rest of the site. A theme styles the drawer/panel look via `.upwc-minicart__panel` (+ `.upwc-minicart__title` / `.upwc-minicart__note`).

Both the `wc_mini_cart` shortcode and the header/footer element (below) render through **one shared function** — `upwc_render_mini_cart( $atts )` (`includes/mini-cart-render.php`) — so the flyout, live AJAX fragments, and the branding relabel behave identically wherever the cart lives.

### Open As — Dropdown or Drawer (`panel_style`)

The mini-cart opens two ways (shortcode `panel_style` / element `mc_panel_style`; default `dropdown`):

- **Dropdown** — a small flyout contained below the icon (`position:absolute; right:0`), always in-bounds.
- **Drawer** — a right slide-out **side-cart** (the standard e-commerce pattern). Extra options: **Drawer Backdrop** (`drawer_backdrop`, default on) dims the page + **locks body scroll** (close via backdrop / the X button / Esc); with it off the page stays interactive and click-outside closes. **Backdrop Blur** (`drawer_backdrop_blur`: None/Light/Medium/Strong → 0/4/8/12px) frosts the page behind it via `backdrop-filter` (emitted as the `--upwc-drawer-blur` CSS var).

**How the drawer avoids a horizontal scrollbar (the non-obvious part).** A bare `position:fixed` panel hidden with `translateX(100%)` parks itself off the right edge and **extends the page's scroll width** — and `overflow-x:hidden` on `html`/`body` does NOT clip a fixed element. So the drawer is wrapped in a `.upwc-minicart__drawer` **clipper** (`position:fixed; inset:0; overflow:hidden`) that the script **portals to `<body>`** on init. Portaling escapes any transformed / `backdrop-filter` header ancestor (which would otherwise become the fixed panel's containing block — e.g. a glassy blurred header), and the clipper's `overflow:hidden` **contains** the off-screen slide → zero page overflow. The panel also offsets below the **WP admin bar** when logged in (`body.admin-bar`). This mirrors how mature WooCommerce side-cart plugins (Caddy, FunnelKit) build off-canvas carts: overlay + drawer as body-level children, slide via transform, scroll-lock, close on backdrop/Esc.

## Mini Cart as a native header/footer element (`mini_cart`)

The extension registers a first-class **Mini Cart** element in the theme's header/footer Add-element popup (via the theme's `unysonplus_hf_elements` API) — so the cart is a proper draggable element, **not** a `custom_html` shortcode wrapper. It exists **only when WooCommerce is active** (the code is in the WooCommerce extension, `includes/mini-cart-hf-element.php`, required only on the WC-active path). Element options (`mc_*`): **Cart Icon** — an **icon-picker** (any library glyph; default lucide `shopping-bag`) so it matches the source's cart icon; **Open As** (`mc_panel_style`: dropdown/drawer) + **Drawer Backdrop** (`mc_drawer_backdrop`) + **Backdrop Blur** (`mc_drawer_backdrop_blur`) — see *Open As* above; plus **Open On** (click/hover, dropdown only), **Item Count** (switch), and the four branding fields (**Panel Title / Subtotal Label / Checkout Button Text / Footnote**). It renders via the `unysonplus_render_hf_element_mini_cart` action → the shared `upwc_render_mini_cart()`, mapping the icon-picker value to HTML through `sc_icon_render()`. Its CSS/JS (handle `fw-shortcode-wc-mini-cart`) are enqueued on `wp_enqueue_scripts` when a header/footer section contains the element (a cheap settings scan), so there's no flash of unstyled flyout. **Prefer this over the old `custom_html` + `[wc_mini_cart]` approach** for header/footer chrome.

### Custom empty-cart content (`empty_*` options + `upwc_mini_cart_empty*` hooks)

WooCommerce's mini-cart template has **no hook for its empty branch** — it hardcodes `<p>No products in the cart.</p>`. So the UnysonPlus mini-cart renders **its own** empty block, two ways:

- **No-code options** (shortcode `empty_*` / element `mc_empty_*`): **Empty Icon** (icon-picker — supports emoji, so a source's 🧁 reproduces verbatim), **Empty Heading**, **Empty Text**, **Empty Button Label**, **Empty Button URL** (empty URL = the Shop page). Set none = keep the WooCommerce default.
- **Child-PHP hooks** (for full custom markup): `add_action('upwc_mini_cart_empty', fn($e)=>…)` prepends into the block; `add_filter('upwc_mini_cart_empty_html', fn($html,$e)=>…, 10, 2)` replaces it. `$e` = `{icon_html,heading,text,button_label,button_url}`.

**Survives AJAX:** because the empty branch is normally re-rendered from WC's template on add/remove-to-cart, the block is **re-applied to the `div.widget_shopping_cart_content` fragment** (`woocommerce_add_to_cart_fragments`) whenever the cart is empty — the pieces are persisted to the `upwc_minicart_empty` option on render (last-rendered-wins, same pattern as the branding labels). Markup: `.upwc-minicart__empty` › `__empty-icon` / `__empty-heading` / `__empty-text` / `__empty-btn` (a `.button`; style the CTA from the child theme).

> **Extension point — add your own header/footer element.** The `unysonplus_hf_elements` filter (theme) lets any extension register a draggable element: return `$els['<slug>'] = ['label'=>…, 'context'=>'header'|'footer'|'both', 'options'=>[<option schema>]]`, then render it by hooking `add_action('unysonplus_render_hf_element_<slug>', fn($settings,$element,$where) => …)`. `$settings` is the element's saved option values. The Mini Cart is the reference implementation.

## Building a store demo (products → grid → chrome)

The e-commerce equivalent of the [build-a-site](../build-a-site.md) flow:

1. **Detect it's a store.** "Add to Cart"/"Basket" buttons, per-item prices, a Shop/Menu nav, product cards → build on WooCommerce, not static columns.
2. **Activate + provision.** Add `woocommerce` to `fw_active_extensions`. On a **multisite subsite**, network-activating the WooCommerce plugin does **not** create that blog's WC tables — run `WC_Install::install()` once while `switch_to_blog()`'d (delete `woocommerce_db_version` first to force it), then `WC_Install::create_pages()` for shop/cart/checkout/account. Set currency/`woocommerce_currency_pos` to match the source.
3. **Create real products** (`WC_Product_Simple`: name, slug, price, description, `set_category_ids`, `set_image_id` from a sideloaded attachment). Idempotent upsert by slug.
4. **Grid, not cards.** Replace the static product columns with one `wc_products` element (`source: 'category'`, `category: '<slug>'`, `columns`, `image_ratio`, `show_price`/`show_add_to_cart`). Style the emitted `.products li.product` markup from the child theme (cap the product `img` height — square-ratio images render large in a wide container).
5. **Chrome.** Put the **native `mini_cart` header element** (branded, icon-picker) in the header's right slot + the nav in the center — element shape `['element_type'=>['element'=>'mini_cart','mini_cart'=>['mc_icon'=>…,'mc_panel_title'=>…, …]]]`. (The old `custom_html` + `[wc_mini_cart]` wrapper still works but the native element is preferred — see above.)

## Custom configurator → cart (bespoke element pattern)

To let a **bespoke child-theme element** (e.g. a product configurator) add a custom-priced, custom-described line to the cart — the reusable recipe:

- **One hidden product** as the cart target: a `WC_Product_Simple` with `set_catalog_visibility('hidden')`; store its id in an option the element's JS can read.
- **JS** collects the configuration + computed price and POSTs to WooCommerce's own add-to-cart AJAX (`WC_AJAX::get_endpoint('add_to_cart')`) with `product_id`, `quantity`, and custom fields; then applies the returned `fragments` to the DOM (the mini-cart panel + count refresh live) and opens the flyout. Reusing WC's endpoint means fragments "just work".
- **PHP** (child-theme `functions.php`):
  - `woocommerce_add_cart_item_data` — read the posted fields into `$cart_item_data['<key>']`. WooCommerce hashes cart-item data into the cart id, so **distinct configs are separate lines and identical ones merge quantity automatically** — no manual unique key needed.
  - `woocommerce_before_calculate_totals` — `$item['data']->set_price( $item['<key>']['price'] )` to apply the computed price.
  - `woocommerce_cart_item_name` — show the chosen name + a recipe/spec line (the configured options) under the title, in cart **and** mini-cart.
- The bespoke element stays **store-agnostic**: gate the JS on a localized global (e.g. `window.PinkyCart`) so with WooCommerce inactive it's a pure visual configurator, and the cart glue lives in the theme, not the element.

## Notes / gotchas

- **Completely inert without WooCommerce** — elements are hidden from the builder and no-op on the frontend when the plugin is inactive.
- When a WooCommerce-aware theme (e.g. `unysonplus-theme`, which ships its own wrapper/sidebar compat layer) is active, the extension **steps aside** and the theme leads.
- Product grids emit clean self-contained CSS-grid markup (neutralizing WooCommerce float rules) but keep the **native add-to-cart button** so AJAX / variable-product behavior is preserved.
- A `requirements => shortcodes` gate is deferred to Phase 2 (the builder elements depend on the shortcodes extension in practice).
