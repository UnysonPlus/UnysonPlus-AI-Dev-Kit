<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `shop-cart` — Cart

The visitor's cart: the lines with pictures, quantities and totals, a remove button, the discount code box (Payments coupons) and the Checkout button. Redrawn in place through `POST fw-shop/v1/cart/set` and `cart/coupon`. Requires the **`shop`** extension active and selling. Leaf node: `{ type:'simple', shortcode:'shop_cart', atts:{} }`. Renders `FW_Shop_Pages::cart()`. See [`../extensions/shop.md`](../extensions/shop.md).

## atts

None of its own: what it shows comes from Shop → Settings, Shop → Delivery and Payments. Plus the shared **Animations** and **Advanced** tabs.

## Notes
- Use it once per site, on the page set as `cart_page` in the shop settings (`FW_Shop_Checkout::start_selling()` makes that page).
- In catalog mode it prints nothing (the editor shows a note).
- Shortcode form: `[shop_cart]`.
