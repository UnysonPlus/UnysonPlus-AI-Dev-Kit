<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `loan_calculator` — Loan Calculator (Shortcodes Library element)

Sliders for the amount and the term (and optionally a deposit and a rate), with the repayment worked
out as the visitor moves them, and a button that can carry the figures into an application form.
Leaf node: `{ type:'simple', shortcode:'loan_calculator', _items:[], atts:{…} }`.

Not bundled in core. Installed from **Unyson+ → Shortcodes → Shortcodes Library**, which puts it in the
active theme at `framework-customizations/extensions/shortcodes/shortcodes/loan-calculator/`, where it
can be edited.

## Files

| File | Role |
| --- | --- |
| `options.php` | The options. A FIXED set of inputs, not a repeater — see below |
| `views/view.php` | Markup, and `fw_sc_lc_calc()`: the first result is rendered on the server |
| `static/js/loan-calculator.js` | Keeps the figures in step with the sliders. No dependencies |
| `static/css/loan-calculator.css` | Layout, the slider, and the card skin used when no Box Style is picked |
| `static.php` | Enqueues the two assets, resolving its own URL from its folder |

## The one rule: two copies of the formula

`fw_sc_lc_calc()` in `views/view.php` and `calc()` in `static/js/loan-calculator.js` are the **same
formula written twice**, on purpose: the server renders the first result so the card shows real
figures before any script runs and nothing shifts when it loads. **Change one, change the other**, or
the number jumps the moment a visitor touches a slider.

## atts

All keys are flat (the option groups store at the parent level).

| key | default | notes |
| --- | --- | --- |
| `title`, `title_tag` | `How much do you need?`, `h3` | Heading above the sliders; tag `h2` `h3` `h4` `div` |
| `amount_label` `amount_min` `amount_max` `amount_step` `amount_default` | `Amount` 1000 50000 500 15000 | Numbers as strings |
| `term_label` `term_unit` `term_min` `term_max` `term_step` `term_default` | `Term` `months` 12 60 6 36 | Unit `months` \| `years` \| `weeks`. Years still pay monthly; weeks pay weekly |
| `deposit_show` `deposit_label` `deposit_max` `deposit_step` `deposit_default` | `no` `Deposit` 10000 250 0 | Taken off the amount before the repayment is worked out |
| `rate_mode` | `example` | `fixed` (owner's rate) \| `range` (visitor slides within `rate_min`–`rate_max`) \| `visitor` (types it) \| `example` (worked at `rate_value`, labelled with `example_note`) |
| `rate_value` `rate_min` `rate_max` `rate_label` `example_note` | 9.9 5 25 `Interest rate` `Representative example` | Yearly percent |
| `formula` | `amortised` | `amortised` (reducing balance) \| `flat` \| `balloon` (a final payment of `balloon_percent` % of the amount) |
| `balloon_percent` | 35 | Balloon formula only |
| `payment_label` | `Monthly payment` | Say "Weekly payment" with a weekly term |
| `show_total` `total_label` | `yes` `Total to repay` | |
| `show_interest` `interest_label` | `no` `Cost of credit` | |
| `show_final` `final_label` | `yes` `Final payment` | Balloon formula only |
| `currency` `currency_position` | `$` `before` | |
| `button_label` `button_link` `button_pass` `button_style` | `Apply now` `` `yes` `btn-primary` | `button_pass` appends `amount`, `term`, `deposit`, `rate` to the link's query string |
| `disclaimer` | a planning-only line | Keep one: a calculator is a guide, not an offer |
| `border_preset` | `` | A Box Preset (`boxp-<slug>`). Empty = the element's own white card |
| `accent_color` | `{predefined:'',custom:''}` | Slider fill, thumb ring and the main figure. Defaults to the theme's Primary |

Plus the shared Animations and Advanced tabs (`css_id`, `css_class`, …).

## Why the inputs are a fixed set

A repayment formula has to know which number is the amount and which is the term. A free repeater
row the formula cannot name would be a slider that changes nothing. What differs between lenders is
which of these inputs appear, their limits and their labels — all options here. A lender with a truly
different formula (tiered rates, fees by band) edits the installed copy: both `calc` functions.

## Pitfalls

- **The rate is a claim.** `fixed` and `example` print a rate on the page. Use them only with a figure
  the business supplied. With no rate, use `range` or `visitor`, so the visitor is exploring and the
  site is not quoting.
- **On a dark band the card stays white.** The card skin states its own ink, because a dark surface
  preset turns headings white and the title would vanish against the card.
- **With a Box Style chosen, the preset is the whole skin.** The stylesheet then adds layout only, and
  text inherits from where the calculator stands.
- **`button_pass` needs a real URL.** A bare `#anchor` is left alone.
- Money is formatted with a comma thousands separator and a point decimal.

## Ready-to-use example (the atts object)

A car-finance hero calculator where NO rate was supplied, so the visitor sets it:

```json
{
  "title": "What would it cost a month?", "title_tag": "h2",
  "amount_label": "Car price", "amount_min": "3000", "amount_max": "40000", "amount_step": "500", "amount_default": "14000",
  "term_label": "Over", "term_unit": "months", "term_min": "12", "term_max": "60", "term_step": "6", "term_default": "48",
  "deposit_show": "yes", "deposit_max": "10000", "deposit_step": "250", "deposit_default": "1500",
  "rate_mode": "range", "rate_label": "Try a rate", "rate_value": "9.9", "rate_min": "4", "rate_max": "30",
  "formula": "amortised", "show_total": "yes", "show_interest": "yes",
  "currency": "£", "button_label": "Start an enquiry", "button_link": "/apply/", "button_pass": "yes",
  "accent_color": { "predefined": "", "custom": "#4f46e5" }
}
```

Install it first: the element is not in core. Programmatically, copy the Library folder into the
active theme's `framework-customizations/extensions/shortcodes/shortcodes/loan-calculator/`.
