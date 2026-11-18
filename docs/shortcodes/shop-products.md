<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `shop-products` — Products

A grid of products from the Shop extension: all of them, a category, the featured ones or the ones on sale. Requires the **`shop`** extension active. Leaf node: `{ type:'simple', shortcode:'shop_products', atts:{…} }`. Renders through `FW_Shop_Render::grid()`, so a card here is the same card as on the shop page. See [`../extensions/shop.md`](../extensions/shop.md).

## atts
| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `show` | select | `'all'` | `all` `featured` `sale` | Which products: all, only the featured ones, or only the ones on sale. |
| `categories` | multi-select | `[]` | array of `fw_product_cat` term ids | Limit the grid to these categories (empty = all). |
| `in_stock` | switch | `'no'` | `'yes'` \| `'no'` | Leave out products that are out of stock. |
| `count` | short-text | `'6'` | number string, 1–100 | How many to show (per page when `pagination` is on). |
| `orderby` | select | `'menu'` | `menu` `date` `title` `price` `price-desc` `rand` | Order (`menu` = the owner's own order, then newest). |
| `pagination` | switch | `'no'` | `'yes'` \| `'no'` | Numbered pages under the grid. |
| `columns` | select | `'3'` | `1`–`6` | Products in a row on a wide screen (tablets two, phones one). |
| `heading_tag` | select | `'h3'` | `h2` `h3` `h4` `h5` `h6` `p` | Tag of each product name: pick by the page outline. |
| `show_price` | switch | `'yes'` | `'yes'` \| `'no'` | Show the price. The shop's own price setting still applies. |
| `show_category` | switch | `'no'` | `'yes'` \| `'no'` | Show the first category above the name. |
| `show_excerpt` | switch | `'no'` | `'yes'` \| `'no'` | Show the short description. |
| `image_size` | select | `'medium_large'` | `medium` `medium_large` `large` | Picture size. |
| `text_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Text color (`kind: text`). |
| `bg_color` | color-preset | `{predefined:'',custom:''}` | compact color object | Background color (`kind: bg`). |
| `font_size_preset` | font-size | `''` | preset key | Font size preset. |
| `spacing` | spacing | — | spacing object | Margin and padding. |

Plus the shared **Animations** and **Advanced** tabs.

## Notes
- No product matches → nothing is printed for visitors (the editor shows a note).
- Shortcode form: `[shop_products show="featured" columns="4" count="4" heading_tag="h2"]`.
- Example node for a home page: `{ type:'simple', shortcode:'shop_products', atts:{ show:'featured', count:'3', columns:'3', heading_tag:'h3', show_category:'yes' } }`.
