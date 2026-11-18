<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# shop extension

A store built into Unyson+ (version 1.0.1). The catalogue (roadmap Phase 1): products, options and variants,
stock, digital files, extra fields from Custom Fields, Import / Export and catalog mode. **Selling** (Phase 2): a
cart, a one-page checkout paid through the shared `payments` extension, delivery zones, orders with their admin and
emails. A shop starts in catalog mode (products end in an enquiry button); it sells once
`FW_Shop_Checkout::start_selling()` ran (Shop → Settings → "Start selling online"). **How you get it:** not in the core-only plugin zip; download + activate it from
**Unyson+ → Extensions**. Guard calls with `class_exists( 'FW_Shop_Products' )`. Public pages:
https://docs.unysonplus.com/extensions/shop · roadmap `/extensions/shop/roadmap`.

Different from the `woocommerce` extension, which integrates a site that runs WooCommerce. On a site with
WooCommerce active, Shop's addresses default to `catalog` / `catalog-item` / `catalog-category`.

## Provides

- **Post type `fw_product`** (Shop → Products; public, `show_in_rest`, classic editor), taxonomies
  `fw_product_cat` (hierarchical) and `fw_product_tag`. Title = name, content = long description, excerpt = short
  description, featured image = main picture, `menu_order` = order on the shop page. Addresses from settings:
  archive `shop`, product `product`, category `product-category`.
- **Every product has at least one variant.** A product without options has exactly one, with empty `attrs`. Price,
  sale price, SKU, stock and picture are on the variant, never on the product.
- **Product** (`FW_Shop_Products`): `get( $id )` → `{ id, title, slug, url, status, excerpt, content, image_id,
  gallery[], type physical|digital|service, featured, options [ { name, values[], style buttons|swatch|select,
  colors{} } ], variants[], has_options, price_min, price_max, on_sale, in_stock, manage_stock, low_stock,
  backorders no|notify|yes, weight, length, width, height, sale_from, sale_to, price_hidden, files[],
  download_limit, download_days, categories[], tags[] }`; `create( $data )`, `save( $id, $data, $stock_reason )`
  (only the keys given; `price` / `sale_price` / `sku` / `stock` are a shortcut for the one variant of a product
  without options; `variants` replaces them all; `categories` / `tags` take names, slugs or ids), `query( $args )`
  → `WP_Query` (`category`, `tag`, `featured`, `on_sale`, `in_stock`, `ids`, `search`, `orderby`
  menu|date|title|price|price-desc|rand, `per_page`, `page`), `find_by_handle( $slug )`, `default_variant( $p )`,
  `meta( $id )`, `refresh_mirrors( $id )`. Meta `_fw_shop` (array) + mirrors for queries `_fw_shop_price`,
  `_fw_shop_max_price`, `_fw_shop_on_sale` 1|0, `_fw_shop_stock_status` instock|outofstock, `_fw_shop_featured`,
  `_fw_shop_sku`.
- **Variants** (`FW_Shop_Variants`; table `{prefix}fw_shop_variants`): row `{ id, product_id, attrs { Size: 'M' },
  sku, price, sale_price|null, stock, image_id, weight|null, enabled }`, plus on a read product `current`,
  `on_sale`, `available` (null = stock not counted), `status` in|low|out|backorder, `label`.
  `for_product()`, `get()`, `find( $product_id, $attrs )`, `by_sku()`, `combinations( $options )`,
  `sync( $product_id, $rows, $reason )` (makes the rows EXACTLY these), `key( $attrs )`, `label()`.
- **Stock** (`FW_Shop_Stock`; tables `fw_shop_stock_log`, `fw_shop_holds`): `change( $variant_id, $delta, $reason,
  $note, $ref )`, `set( $variant_id, $qty, $reason, $note )`, `available()`, `status()`, `can_buy( $variant, $qty )`,
  `hold( $variant_id, $qty, $token, $minutes? )` / `commit( $token, $ref )` / `release( $token )`, `held()`,
  `history( $args )`, `reasons()` (first, restock, adjust, damaged, returned, sale, refund, import, pos). The ONLY
  place a stock number changes. One email when a variant reaches its low level.
- **Digital files** (`FW_Shop_Files`; table `fw_shop_downloads`): uploads kept in `uploads/unysonplus/shop-files/`
  (denied by `.htaccess`, random names); `grant( $product_id, { email, user_id, ref } )` → token,
  `links( $token )`, `usable( $grant )`, `revoke( $token )`; served at `?fw_shop_download=TOKEN&f=FILEKEY`. Grants
  are made when an order is paid, and revoked when it is cancelled or refunded in full.
- **Extra fields** (`FW_Shop_Fields`): a Custom Fields group whose location includes `fw_product` shows on the
  product editor (Custom Fields does that); `specs( $product_id )` → `[ { title, rows: [ { name, label, value,
  html, type } ] } ]`, shown as tables on the product page.
- **Catalog mode** (`FW_Shop_Catalog_Mode`; table `fw_shop_enquiries`): `shows_price( $product )`,
  `button( $product )` → `{ type enquiry|link|none, label, url }`, `enquire( { product, variant?, qty?, name,
  email, phone?, message? } )` → id | `WP_Error` (kept, emailed, added to the CRM as a contact + timeline entry
  when the CRM is active), `query()`, `count()`, `set_status( $id, new|answered|closed )`. REST
  `POST /wp-json/fw-shop/v1/enquiry` → `{ ok, message }` (public; trap field, 2-second minimum, 5 per 10 minutes).
- **Settings** (`FW_Shop_Settings`; option `fw_ext_shop`): `currency` (the Payments currency when Payments is
  active), `show_prices` yes|no|members, `button` enquiry|link|none, `button_label`, `button_link`,
  `enquiry_email`, `enquiry_note`, `weight_unit`, `size_unit`, `per_page`, `columns`, `low_stock`,
  `low_stock_email`, `hold_minutes`, `shop_base`, `product_base`, `category_base`, and for selling `selling` 0|1,
  `cart_page`, `checkout_page`, `guest_checkout` yes|no, `order_email`, `order_prefix` (`S-`), `terms_url`.
  `get()`, `save()`, `selling()`, `money( $amount, $currency? )`, `plain()`, `parse()`.
- **Render** (`FW_Shop_Render`): `grid( $args )`, `card( $product, $args )`, `price_html( $product, $variant? )`,
  `single( $product )`, `action( $product, $variant )`, `specs( $product_id )`, `related( $product )`,
  `category_links()`. Views `views/single.php`, `views/archive.php` (theme override:
  `framework-customizations/extensions/shop/views/`); a product built in the page builder uses the theme's own
  template.
- **Elements** `shop_products` ("Products") → [`../shortcodes/shop-products.md`](../shortcodes/shop-products.md);
  `shop_cart` ("Cart") and `shop_checkout` ("Checkout"), no atts of their own →
  [`../shortcodes/shop-cart.md`](../shortcodes/shop-cart.md), [`../shortcodes/shop-checkout.md`](../shortcodes/shop-checkout.md).
  Plain shortcode `[shop_cart_link]` = "Cart" + the item count, linked to the cart.
- **Cart** (`FW_Shop_Cart`; table `fw_shop_carts`, cookie `fw_shop_cart`, merged into the account at login):
  `add( $variant_id, $qty )` / `set()` (0 removes) → true | `WP_Error`, `set_coupon( $code )` (Payments coupons,
  source `shop`), `clear()`, `items()`, `contents()` → `{ lines[ { variant_id, product_id, name, variant, sku, type,
  qty, max, price, total, weight, url, image } ], count, subtotal, weight, needs_shipping, coupon, notices[] }`
  (priced NOW; corrected and explained when stock fell), `totals( $contents, { address, shipping_method, email } )`
  → `{ subtotal, discount, coupon, coupon_label, coupon_error, methods[], shipping, shipping_method,
  shipping_label, shipping_error, tax, tax_label, tax_included, total, currency, coupon_items }`, `url()`,
  `checkout_url()`. Stores no price, ever.
- **Delivery** (`FW_Shop_Shipping`; option `fw_ext_shop_shipping`): zones `{ name, countries[] | ['*'],
  postcodes "1000-1999\nSW*", methods[ { id, type flat|weight|free|pickup, label, cost, per_unit, min_order } ] }`,
  first zone that fits wins; no zones = free everywhere; an address in no zone cannot order. `zones()`,
  `save( $zones )` (countries may be text "PH, SG"), `methods_for( $address, $contents )` → `[ { id
  "<zone>-<method>", label, cost } ]` cheapest first | `WP_Error`, `countries()` (what the checkout offers),
  `all_countries()`.
- **Checkout** (`FW_Shop_Checkout`): `place( { email, name, phone?, address{ line1, line2, city, state, postcode,
  country }, shipping_method, payment "gateway:method", note?, create_account?, terms? } )` → `WP_Error` (code =
  the field) | `{ order, status redirect|on_hold|paid, redirect?, instructions? }`. Re-reads and re-prices the
  cart, holds stock (token = order key), calls `FW_Payments::charge()` (source `shop`, source_id = order id,
  reference = order number). `payment_methods( $total, $country )`, `start_selling()` / `stop_selling()`,
  `mark_paid( $order_id )`, hourly `cleanup()` (pending checkouts past the hold time → cancelled).
- **Orders** (`FW_Shop_Orders`; tables `fw_shop_orders`, `fw_shop_order_items` (a COPY of each line),
  `fw_shop_order_events`): statuses pending · on_hold · paid · packed · shipped · completed · cancelled · refunded.
  `get( $id )` (with `items`, `needs_ship`), `get_by_number()`, `find_by_key( $number, $key )`, `query( { status
  ('open' = paid+packed+on_hold), user_id, email, search, with_pending, per_page, page } )`, `count()`,
  `update( $id, { tracking, note, meta… } )`, `move( $id, $from[], $to, $note )` (the ONLY status change; true
  for the call that made it), `log()`, `events()`, `url( $order )` (buyer's page `?fw_order=&key=` on the checkout
  page), `admin_url( $id )`.
- **Emails** (`FW_Shop_Emails`, through `wp_mail`): how_to_pay, receipt, shipped, cancelled, refunded to the
  buyer; new_order to the shop once per order. Filter `unysonplus_shop_email( $mail|false, $type, $order )`.
- **REST** `fw-shop/v1` (403 in catalog mode): `GET cart`, `POST cart/add|cart/set|cart/coupon`,
  `POST checkout/quote`, `POST checkout`. Answers carry the pages' own HTML (`FW_Shop_Pages`). Logged-in browsers
  send `X-WP-Nonce` from `admin-ajax.php?action=fw_shop_nonce`.
- **Import / Export** (`FW_Shop_Import_Export`; Shop → Import / Export): `export()` → the Shop file
  `{ format: 'unysonplus-shop', version, settings, categories, products }`; `csv_rows()` (one row per variant;
  columns `COLUMNS`); `from_csv( $rows )`; `import( $package, $dry )` → `{ created, updated, variants, categories,
  settings, errors[] }`. A product is recognised by its handle (slug), so an import is safe to run twice.
- **Admin:** menu **Shop** (`fw-shop`): Products, Categories, Tags, **Stock** (`fw-shop-stock`; type `+5`, `-2`
  or a count, with a reason; a history per variant), **Enquiries** (`fw-shop-enquiries`), **Import / Export**
  (`fw-shop-import-export`), **Settings** (`fw-shop-settings`; the selling switch), and once selling **Orders**
  (`fw-shop-orders`, `&order=ID`) and **Delivery** (`fw-shop-delivery`).
- **Hooks:** actions `unysonplus_shop_product_saved`, `unysonplus_shop_stock_changed`, `unysonplus_shop_low_stock`,
  `unysonplus_shop_enquiry`, `unysonplus_shop_downloaded`, `unysonplus_shop_imported`,
  `unysonplus_shop_before_single`, `unysonplus_shop_after_single`, `unysonplus_shop_order_{status}( $order )`,
  `unysonplus_shop_order_status( $order, $old )`, `unysonplus_shop_order_refund( $order, $amount )`; filters `unysonplus_shop_product`,
  `unysonplus_shop_products_query`, `unysonplus_shop_price_html`, `unysonplus_shop_shows_price`,
  `unysonplus_shop_catalog_button`, `unysonplus_shop_product_action`, `unysonplus_shop_card`,
  `unysonplus_shop_single`, `unysonplus_shop_specs`, `unysonplus_shop_enquiry_mail`,
  `unysonplus_shop_low_stock_mail`, `unysonplus_shop_enquiry_to_crm`, `unysonplus_shop_setting`,
  `unysonplus_shop_selling`, `unysonplus_shop_capability`, `unysonplus_shop_cart`,
  `unysonplus_shop_shipping_methods`, `unysonplus_shop_countries`, `unysonplus_shop_email`,
  `unysonplus_shop_customer_role`.

## Building a catalogue (recipe)

1. Activate `shop`. Set **Shop → Settings**: currency, who sees prices, the button, the enquiry address.
2. Add products with `FW_Shop_Products::create()` (or the editor, or a spreadsheet through Import / Export). Give
   each a main picture; use options + variants for sizes and colours.
3. Link `/<shop_base>/` in the menu, and place the **Products** element on the home page
   (`show: 'featured'`).
4. For specifications, add a Custom Fields group located on `fw_product`.

## Selling (recipe)

1. `FW_Shop_Checkout::start_selling()` (activates `payments`, makes the Cart + Checkout builder pages, sets
   `selling`). Re-running it reuses existing pages.
2. Turn on at least one provider in Payments (`offline` = bank transfer needs no account). Currency, coupons, tax
   and invoices are set in Payments, not here.
3. Delivery: `FW_Shop_Shipping::save( [ … ] )`, or leave empty for free delivery everywhere.
4. Put `[shop_cart_link]` in the header (or a menu link to `FW_Shop_Cart::url()`).

## Notes / gotchas

- **Never write a stock number, a variant row or `_fw_shop` meta directly.** Use the classes: they keep the
  history, the mirrors and the caches right.
- `FW_Shop_Variants::sync()` and `save( …, [ 'variants' => … ] )` DELETE variants that are not in the list.
- The page works no price out: each variant reaches the browser with its finished price HTML and stock line.
- Sort and filter products on the `_fw_shop_*` mirrors, never on `_fw_shop`.
- A sale price counts only when lower than the price and inside `sale_from` … `sale_to`; the mirrors of dated
  sales refresh daily.
- **No payment code in the shop.** The checkout calls `FW_Payments::charge()` and listens to
  `unysonplus_payments_{waiting|paid|failed|cancelled|refunded}`. Never add a gateway, coupon list, tax table or
  invoice numbering here.
- **Never change an order's status with SQL**; `FW_Shop_Orders::move()` fires the hooks that send emails, put
  stock back and revoke downloads. Stock is taken once (`stock_taken` flag) on paid / waiting, given back once on
  cancel; a refund alone returns no stock.
- **Never price anything in the browser.** Totals come from `FW_Shop_Cart::totals()`; `place()` re-prices.
- A page made in code must be a builder page (`fw:opt:ext:pb:page-builder:json` + `builder_active`): the theme
  renders pages through the builder, so a shortcode only in `post_content` shows nothing.
- A product with "Price on request" keeps its enquiry button while the shop sells.
- Working rules for editing it: the extension's own `AGENTS.md`.
