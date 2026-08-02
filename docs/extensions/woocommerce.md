# woocommerce extension

Integrates WooCommerce with UnysonPlus — makes any active theme WooCommerce-aware and adds a **WooCommerce Elements** tab to the page builder (product grids/carousels, single product, categories, add-to-cart, cart icon & mini-cart, cart/checkout/account/order-tracking pages, product search & filters). **Inert until WooCommerce is installed and active.** **Active by default:** no (enable it under Extensions).

## Provides

- **Shortcodes (WooCommerce Elements tab):** `wc_products`, `wc_product`, `wc_product_page`, `wc_product_categories`, `wc_add_to_cart`, `wc_cart`, `wc_cart_link`, `wc_mini_cart`, `wc_free_shipping`, `wc_checkout`, `wc_account`, `wc_my_account`, `wc_order_tracking`, `wc_product_search`, `wc_product_filters` → `../shortcodes/` for atts. The commerce-page elements (`wc_cart`/`wc_checkout`/`wc_my_account`/`wc_order_tracking`/`wc_product_page`) are friendly wrappers around the matching classic WooCommerce shortcode. The **catalog / storefront** elements are **custom UnysonPlus markup with their own option UIs** — `wc_products` + `wc_product` on the shared **Card Rows** engine, `wc_product_categories` on the same card model, `wc_add_to_cart` + `wc_product_search` on the shared **Button Style** system, and `wc_product_filters` as a drag-sortable filter **panel** — see the per-element sections below.
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

### Empty-cart count badge — hidden when count is 0

The item-count badge on both the **cart link** (`wc_cart_link`) and the **mini-cart** trigger (`wc_mini_cart` / the header element) is **suppressed while the cart is empty** — no stray "0" sitting on the icon. Implemented in **three coordinated places** so it holds through a live AJAX update, not just the first server render:

- **Server render** — `view.php` (cart link) and `includes/mini-cart-render.php` (mini-cart) add a `--empty` modifier to the count span when `count < 1` (`.upwc-cart__count--empty` / `.upwc-minicart__count--empty`).
- **WC fragment refresh** — `class-fw-extension-woocommerce.php::_filter_cart_fragments` re-emits both count spans **with the same `--empty` modifier** when the AJAX count drops to 0 (the fragment selectors are `.upwc-cart .upwc-cart__count` and `.upwc-minicart .upwc-minicart__count`), so removing the last item re-hides the badge without a reload.
- **CSS** — the `--empty` classes (in each element's `styles.css`) hide the badge. (`wc_cart_link` still also has the separate `hide_when_empty` option that removes the *whole element*; the `--empty` badge behavior is independent and always on.)

> **Extension point — add your own header/footer element.** The `unysonplus_hf_elements` filter (theme) lets any extension register a draggable element: return `$els['<slug>'] = ['label'=>…, 'context'=>'header'|'footer'|'both', 'options'=>[<option schema>]]`, then render it by hooking `add_action('unysonplus_render_hf_element_<slug>', fn($settings,$element,$where) => …)`. `$settings` is the element's saved option values. The Mini Cart is the reference implementation.

## Building a store demo (products → grid → chrome)

The e-commerce equivalent of the [build-a-site](../build-a-site.md) flow:

1. **Detect it's a store.** "Add to Cart"/"Basket" buttons, per-item prices, a Shop/Menu nav, product cards → build on WooCommerce, not static columns.
2. **Activate + provision.** Add `woocommerce` to `fw_active_extensions`. On a **multisite subsite**, network-activating the WooCommerce plugin does **not** create that blog's WC tables — run `WC_Install::install()` once while `switch_to_blog()`'d (delete `woocommerce_db_version` first to force it), then `WC_Install::create_pages()` for shop/cart/checkout/account. Set currency/`woocommerce_currency_pos` to match the source.
3. **Create real products** (`WC_Product_Simple`: name, slug, price, description, `set_category_ids`, `set_image_id` from a sideloaded attachment). Idempotent upsert by slug.
4. **Grid, not cards.** Replace the static product columns with one `wc_products` element (`source: 'category'`, `category: '<slug>'`, `columns`, `image_ratio`, `show_price`/`show_add_to_cart`). Style the emitted `.products li.product` markup from the child theme (cap the product `img` height — square-ratio images render large in a wide container).
5. **Chrome.** Put the **native `mini_cart` header element** (branded, icon-picker) in the header's right slot + the nav in the center — element shape `['element_type'=>['element'=>'mini_cart','mini_cart'=>['mc_icon'=>…,'mc_panel_title'=>…, …]]]`. (The old `custom_html` + `[wc_mini_cart]` wrapper still works but the native element is preferred — see above.)

## `wc_products` — the Products element options

Modal tabs (UI grouping only; atts are flat):

- **Content** — *which* products: `source` (recent/featured/sale/best_selling/top_rated/category/tag/attribute/ids/recently_viewed/cross_sells), `category`, `tags`, `attribute`, `attribute_terms`, `product_ids`, `posts_per_page`, plus `orderby`/`order`.
- **Grid** — *how the grid arranges*: `layout` (grid/carousel), `columns` (2–6), `gap` (sm/md/lg), `alignment` (text alignment), `pagination` (none/load_more), `carousel_arrows`.
- **Card** — *what each card shows*, in three groups (**rows-only since 2026-08-01** — see below):
  - **Card Layout:** `card_rows` (the single card model), `box_style` (Box Preset skin), `image_ratio`, `image_size`.
  - **Badges:** `show_ribbon` (from `_upwc_ribbon` product meta), `show_sale_badge` (+ `badge_style` text/percent), `show_featured_badge`, `show_new_badge` (+ `new_days`). These pick **which** badges appear in the `badges` slot.
  - **Add to Cart:** `add_to_cart_text` (the `cart` slot's button label).

**Card Layout = the row designer (the ONE card model).** The old `card_layout` Classic/Slot toggle and the per-element **presence switches** (`show_price`/`show_rating`/`show_excerpt`/`show_wishlist`/`show_quick_view`/`show_add_to_cart`/`show_rating_count`/`show_stock`) were **removed 2026-08-01** — they were never used and double-controlled what the rows already own. **Presence is now "is the slot in a row"** (a slot renders when it's in a row AND the product has that data; remove the slot to hide it).

- `card_rows` = an addable, drag-sortable list of ROWS. Each row = `{ slots:[…], direction:'inline'|'stack', justify:'start'|'center'|'between'|'end', align:'start'|'center'|'end'|'stretch' }`. Known slots: `badges, wishlist, media, title, excerpt, rating, rating_count, price, cart, quickview`. Empty slots (and empty rows) collapse, so a card with no rating/ribbon degrades cleanly. Seeded default (mirrors the Site Converter's emission): `[badges,wishlist] between` · `[media,title,excerpt] stack/center` · `[rating,rating_count] center` · `[price,cart] between`.
- Cards render `.upwc-product--slotted` with `.upwc-product__row` (flex, `.upwc-row--{inline|stack}` + `.upwc-j-*` + `.upwc-a-*`). `rating` renders our own star markup (no WooCommerce "Rated X out of 5" screen-reader leak); `rating_count` shows the **average score** (e.g. 4.9), not the review count. The `badges` slot is a static row element (badge types chosen by the toggles above).
- **Structure vs skin.** The rows set STRUCTURE. The card **skin** (border / corners / shadow / fill + hover) comes from **`box_style`** — a **Box Preset** picker (`sc_card_box_style_field()`; saved as a `boxp-{slug}` class applied to each `.upwc-product`, managed in Theme Settings → Components → Box Presets) — the native, on-brand way to skin the card. Scoped Custom CSS (`.upwc-products .upwc-product{…}`) is the fallback when a build needs a one-off skin (what the Site Converter emits from a captured card).

**Image Ratio + Image Size.** `image_ratio` (auto/square/portrait/landscape) owns the image **shape**; `image_size` (unit-input width, empty = auto/fill) owns the **scale**, emitted as the `--upwc-img-size` custom property on the grid wrapper. Together they replace the old "cap the product `img` height from the child theme" workaround.

## `wc_product` — Single Product (same card engine)

Rebuilt to render **ONE product through the SAME engine as `wc_products`** (`upwc_wc_products_card`) instead of Woo's raw `[product id]` loop tile. It shares the whole Card tab with the grid via one helper — **`upwc_wc_card_option_groups()` in `helpers.php`** (the single source of truth for the card model, so the two can never drift): the **Card Rows** designer + live wireframe preview, the **Card Box Style** preset, **Image Ratio/Size**, the shared **Rating** style (`sc_rating_style_field()` — symbol / colors / size), the **Badges** group, Quick View and AJAX add-to-cart. The grid-only concerns (source query, columns, pagination, carousel) are omitted since they don't apply to one product, so its tabs are **Content** (a product picker) + **Card** + Animations + Advanced. Same slots/rows semantics as `wc_products` above.

## `wc_product_categories` — Category grid on the card model

Rebuilt off Woo's fixed `[product_categories]` loop onto the **flexible card model**. Each category card is composed from the shared **Card Rows** designer (`sc_card_rows_field()`) with **category slots** — `image` (Image), `title` (Name), `count` (Product Count), `button` (View link) — plus a live wireframe preview (`sc_card_preview_mount_html()`), a **Card Box Style** preset, and **Image Ratio/Size**. Seeded default = image · name · count (stacked, centered). Tabs: **Content** (query — `number`, `orderby`/`order`, `parent`, specific `ids`, `hide_empty`), **Grid** (`columns` 1–6, `gap` sm/md/lg, `alignment`), **Card** (rows + box style + image), plus `button_text` for the Button slot (default "View"), and Advanced. Emits its own lightweight grid stylesheet.

## `wc_add_to_cart` — Add to Cart button (Button Style system)

Rebuilt off Woo's raw `[add_to_cart]` onto **our own themed `<a>`** that keeps the WooCommerce AJAX add-to-cart behavior (the `add_to_cart_button`/`ajax_add_to_cart` classes + data attributes; variable / grouped / external products link to the product page instead). It wears the **same Button Style system as the `[button]` shortcode** — Theme Settings → Buttons presets, Size, Shape, Width, Alignment — via the shared `sc_button_style_field()` / `sc_button_style_atts()` helpers (a **Style** tab). **Content** tab: `product` (picker), `quantity`, a custom `label`, `show_price` + `price_position` (before/after the button).

## `wc_product_search` — Product search (layout + Button Style)

Was a bare placeholder-only form; now a product-scoped (`post_type=product`) search form with real layout/style controls. **Content:** `placeholder`, `button_text` (empty = icon-only), `button_icon` (icon-picker, default magnifier). **Style:** `layout` (`attached` button beside / `below` full-width button under / `compact` icon inside the field edge), `field_shape` (default / pill / rounded / square), `size` (sm/md/lg), a themed `button_style` (Button Style preset, for the Attached/Below layouts), `width` (auto max-22rem / full), and `alignment`.

## `wc_product_filters` — Filter PANEL (drag-sortable stack)

Was one Woo filter widget per element (price OR rating OR a single attribute); now a whole **filter PANEL** — an ordered, drag-sortable **stack of filter blocks** (`filters` addable-popup). Each block has a `type` (Price / Attribute / Rating / Active Filters), an optional block `title`, and — for the Attribute type — an `attribute` (picked from a select of the store's product attribute taxonomies), `display_type` (list / dropdown) and `query_type` (AND / OR). So one sidebar element can stack e.g. Price + Color + Size + Active Filters. **Style** tab wraps the stack in a styled panel: `panel_title`, `collapsible` (each block title toggles its block via a tiny event-delegated script), a **Card Box Style** preset skin, and `divider` (thin line between blocks). **Legacy single-filter instances still render** via a back-compat fallback when no blocks are configured. Filter widgets still only function on **shop / product-category pages**, where they filter the listing.

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
