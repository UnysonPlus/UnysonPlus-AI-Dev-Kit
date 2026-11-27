<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Vertical: lending

Car finance, personal loans, payday and short-term lenders, loan brokers, credit unions — businesses
where the visitor arrives with **one question (what will it cost me?) and one action (apply)**. A
lending site that makes them read before it lets them calculate has the page in the wrong order.

Format: [`README.md`](README.md). This file also carries a **home-page pattern** section, which the
other verticals do not have yet: it records what sites in this trade actually look like, distilled
from a study of commercial lending templates. Patterns only — no site is named and nothing is copied.

```js
{
  id: 'lending',
  label: 'Lending and loan broking',
  covers: ['car finance', 'auto loan', 'personal loan', 'payday loan', 'loan broker', 'credit union', 'bike finance', 'business loan'],

  vocabulary: { practitioner: 'adviser', service: 'loan', client: 'applicant', engagement: 'application' },

  pages: [
    { id: 'home',       title: 'Home',            purpose: 'The calculator or the application start, in the hero. Then how it works and the loan types.', required: true },
    { id: 'loans',      title: 'Loans',           purpose: 'Each loan type: who it suits, how repayment works, what is needed to apply.', required: true },
    { id: 'calculator', title: 'Loan calculator', purpose: 'The full calculator on its own page, for people who arrive wanting only that.', on: true },
    { id: 'apply',      title: 'Apply',           purpose: 'The application form, in steps. The page every other page points at.', required: true },
    { id: 'how',        title: 'How it works',    purpose: 'The steps from enquiry to payout, and what happens to the applicant\'s data at each.', on: true },
    { id: 'about',      title: 'About',           purpose: 'Who is lending or broking, and under what authorisation.', on: true },
    { id: 'faq',        title: 'FAQ',             purpose: 'Eligibility, credit checks, early settlement, fees.', on: true },
    { id: 'contact',    title: 'Contact',         purpose: 'Phone first: this trade still closes on the phone.', required: true },
    { id: 'privacy',    title: 'Privacy policy',  purpose: 'How application and credit data is handled.', required: true },
  ],

  audience: {
    legend: 'Who you lend to',
    options: [
      { value: 'consumer',  label: 'Private individuals', checked: true },
      { value: 'business',  label: 'Businesses' },
      { value: 'subprime',  label: 'People with poor or thin credit' },
    ],
  },

  forms: [
    { id: 'apply', title: 'Loan application', starter: 'Multi-step',
      fields: ['Loan type (choice)', 'Amount', 'Term', 'Name', 'Email', 'Phone', 'Employment status (choice)', 'Monthly income', 'Consent to a credit search'],
      where: 'The Apply page; its first step may sit in the home hero', required: true },
    { id: 'callback', title: 'Request a call back', starter: 'Contact',
      fields: ['Name', 'Phone', 'Best time to call'], where: 'Header CTA target, Contact, every loan page', on: true },
  ],

  asks: [
    { name: 'rates',         label: 'Your rates', hint: 'representative APR, or the range; without it the calculator runs as a labelled example' },
    { name: 'limits',        label: 'Minimum and maximum amount and term' },
    { name: 'authorisation', label: 'Regulator and authorisation number', hint: 'lender or broker, and which' },
    { name: 'fees',          label: 'Any fees', hint: 'broker fee, arrangement fee, early settlement' },
    { name: 'phone',         label: 'The phone number applicants should call' },
  ],

  extensions: ['forms', 'seo', 'animation-engine'],
  elements:   ['loan_calculator'],   // Shortcodes Library — install before building the hero
}
```

## What a lending home page looks like

The other verticals leave the home page to [`composition.md`](../composition.md). This one cannot,
because the generic shape — headline left, picture right, cards beneath — is exactly what makes a
lending site read as a template. The trade has its own shape:

```
utility bar → header (phone + Apply) → HERO WITH THE TOOL → how it works → loan types
  → why us → [calculator band, if the hero held the form instead] → [proof] → FAQ → CTA
```

### The hero holds the tool

**The loan calculator or the first step of the application sits in the hero**, as a card beside the
headline. This is the pattern that separates a lending site from a generic business page, and it is
there for a reason: the visitor's first question is the repayment, so the page answers it before
anything else.

- **Calculator card** — two sliders (amount, term), three result rows (monthly payment, term, total
  to repay), one Apply button that carries the figures into the application. A white card on a deep
  ground, on the right; headline, one line and two buttons on the left.
- **Application-start card** — loan type, amount, term, one button. Use it where the lender quotes
  per applicant and a calculator would have no honest rate to show.
- **The card is white on the deep ground**, and on a dark surface the buttons invert: the hero's
  primary button becomes the light one, while the calculator's own button, back on white, keeps the
  brand fill. Three button contexts on one screen, each needing its own rule.
- **A hero with neither** is the fallback for a broker with no rates and no form endpoint, and it
  must say what happens next instead ("tell us the car and the term").

Where the hero holds the application start, the calculator moves down the page as its own band:
the calculator card on one side, a photograph on the other, a planning-tool disclaimer beneath.

### The chrome carries the phone

- **A utility bar above the header**: phone, email, sometimes the address; on the other side the
  small links (log in, FAQ, careers).
- **The header's one button is the application** — "Apply for a loan", "Request a loan" — never a
  generic "Contact us". The phone number often sits beside it at heading size.

### The sections, and what each is for

| Band | Shape | Notes |
| --- | --- | --- |
| How it works | Three numbered steps in a row | Almost universal, directly under the hero. Apply → decision → payout |
| Loan types | A grid of cards, or a numbered list with one photograph that changes | Car, personal, home, business. Each links to its loan page. This is the band that carries the trade's vocabulary |
| Introduction | An overlapping picture pair with a tick-list beside it | The overlap is the device; a single flat photo beside text is the generic version |
| Why us | Icon row or a features card straddling the band above | Speed, no hidden fees, decision in principle — only what the owner confirms |
| Proof | Counters, testimonials, lender or partner logos | **Facts. Omitted unless supplied** — see the traps |
| FAQ | Accordion | Eligibility, credit search, early settlement |
| CTA | One line and the Apply button, or the call-back form | The phone number again |

### The devices that make it look designed

Seen across the references. All but two are options; the overlap and the picture pair each take a
few lines of site CSS (a negative top margin; an absolutely placed second image), and the pair needs
the class `upw-overlap-ok` on its container so the layout audit reports it as deliberate instead of
failing it:

- **A deep ground with one bright accent** — navy, charcoal or a saturated brand colour for the hero,
  and a single accent (cyan, red, orange) for buttons, slider fill and eyebrow rules.
- **A card overlapping two bands** — the calculator card or a features strip pulled up over the hero's
  bottom edge, so the bands interlock instead of stacking.
- **Decorative line work** in the hero corners (a pattern or an animated background at low opacity).
- **A cut-out subject** — for car finance, the car itself with its background removed, sitting over a
  soft shape, in place of a rectangular photograph.
- **A floating badge on a photograph** — only when the number on it was supplied.
- **A marquee of the loan types** as a band divider.

## The traps specific to this vertical

**The rate.** A calculator needs an interest rate and an invented one is an invented fact with legal
weight. `fixed` and `example` both PRINT a rate as the business's own, and a "representative" rate is
a regulated statement in many countries — so both need a figure the owner supplied. With no rate
supplied, use `range` or `visitor`: the visitor moves the rate, the label says so ("Try a rate"), and
the site is exploring with them rather than quoting. The line under the calculator saying the figures
are illustrative stays in every configuration.

**Proof is all facts.** "15+ years", "98% satisfied", "$1.2B funded", the row of partner logos, the
approval-rate badge — every reference template ships them because templates are fiction. Each one is
a claim the lender will be held to. None appears unless the owner supplied it.

**Authorisation.** Lending and credit broking are regulated nearly everywhere. The regulator, the
authorisation number, whether the business is a lender or a broker, and any broker fee come from the
owner and go in the footer. If they were not supplied, `missing[]` says so in the first line of the
hand-over, because a lending site without them may not be lawful to publish.

**"Guaranteed", "instant", "no credit check".** Do not write approval promises the owner did not
make. "Decision in principle" and "no credit search at the enquiry stage" are different claims from
"guaranteed approval", and only the owner knows which is true.

## Style

Conservative register by the routing protocol — the visitor is risking money — so `enterprise`,
`professional`, `saas` or `modern-dark`. The references agree: almost all sit on a deep navy or
charcoal with one bright accent. For a consumer car-finance brand that wants more energy, keep the
conservative style and spend the energy on the hero composition (the calculator card, the cut-out
car) rather than switching to an expressive style.

## The signature moment

The calculator itself. Sliders that move the monthly figure as they are dragged are participatory,
on the path every visitor takes, and belong to this trade and no other — which is what
[`design-jury.md`](../design-jury.md) asks of a moment. Do not add a second.
