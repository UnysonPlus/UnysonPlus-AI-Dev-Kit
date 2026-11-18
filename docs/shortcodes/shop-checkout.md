<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `shop-checkout` — Checkout

The one-page checkout: details, address, delivery choices, ways to pay, note, account and terms, and the order summary; with `?fw_order=NUMBER&key=KEY` in the address it shows that order (status, how to pay, downloads, invoice) instead. Choices and sums are redrawn through `POST fw-shop/v1/checkout/quote`; the order is placed by `POST fw-shop/v1/checkout`. Requires the **`shop`** extension active and selling. Leaf node: `{ type:'simple', shortcode:'shop_checkout', atts:{} }`. Renders `FW_Shop_Pages::checkout()`. See [`../extensions/shop.md`](../extensions/shop.md).

## atts

None of its own: what it shows comes from Shop → Settings, Shop → Delivery and Payments. Plus the shared **Animations** and **Advanced** tabs.

## Notes
- Use it once per site, on the page set as `checkout_page` in the shop settings (`FW_Shop_Checkout::start_selling()` makes that page).
- In catalog mode it prints nothing (the editor shows a note).
- Shortcode form: `[shop_checkout]`.
