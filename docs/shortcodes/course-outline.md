<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# `course_outline` — Course Outline

One course's modules and lessons with the student's progress (ticks, a progress bar) and a **Start the course** / **Resume the course** button — or, for people who cannot take it yet, how to get in (the plans that include it, a Buy button when it is sold on its own, Log in). Requires the **`membership`** extension with its **Courses** module (it lives in `framework/extensions/membership/shortcodes/course-outline/`, palette tab **Membership**) — not in the core-only plugin zip; download it from **Unyson+ → Extensions**. Leaf node: `{ type:'simple', shortcode:'course_outline', _items:[], atts:{…} }` — plus the shared wrapper blocks (`common`, `fx`, `spacing`) documented in `README.md`. This file lists only the **shortcode-specific** atts.

## atts

All atts are **flat leaves** — the tabs and groups in the modal (Content / Membership / Advanced) are containers only and are not part of the saved shape.

| key | type | default | value shape / choices | what it does |
|---|---|---|---|---|
| `course` | select | `''` | `''` (— Choose a course —) \| a course post id as a string, e.g. `'57'` | The course (post type `fw_course`, made under **Courses** in the admin menu). Must be published. |
| `show_title` | switch | `'yes'` | `'yes'` \| `'no'` | The course title as an `<h2>` linking to the course page. |

## Ready-to-use example (the atts object)
```json
{
  "course": "57",
  "show_title": "yes"
}
```
Course ids are site-specific — look them up (e.g. `wp post list --post_type=fw_course --fields=ID,post_title`); never guess them.

## Notes
- **A student who can take the course** (logged in, and the course's access allows them) sees a progress bar, then **Start the course** (nothing completed yet) or **Resume the course** (to the next lesson to do; hidden at 100 %), then each module title (`<h3>`) and its numbered lessons: completed ones ticked, lessons still closed (a drip day not reached, or a gating quiz not passed) shown locked and unlinked, the rest linked.
- **Anyone who cannot take it** (logged out, or without a plan that includes it) sees a box titled "Join to take this course" (or "Log in to take this course" when the course is for any logged-in person), "Included in *Plan*…", a **Buy this course for *price*** button when the course is sold on its own (pay per item, Payments module, checkout page set), and **Log in** when logged out — then the full outline with every lesson locked and unlinked. For a course open to chosen plans the box also shows **Join** (logged out) or **See the plans** (logged in), going to Settings → Join page, or to the checkout when exactly one priced plan includes the course (`FW_Membership_Settings::join_url()`; Membership 1.0.22).
- A student is enrolled the first time they open a lesson they may see; their courses also appear as "Your courses" on the Member Account page.
- **The course's own page already shows this outline** (Courses appends it after the course description). Use the element on other pages — a course catalogue, a landing page, a member dashboard — not on the course post itself, or the outline appears twice.
- **Admins only** see a notice when the Courses module is off or when no published course is chosen; everyone else sees nothing.
- Place it **in the page builder** — an element on a builder page renders from the builder data (`fw:opt:ext:pb:page-builder:json`), not from `post_content`. Build pages with `tools/upw-build-pages.php` (see `README.md`).
- Like every builder element, it also gets a **Membership** tab (`mbr_show`, `mbr_plans`, `mbr_denied`); usually left at `everyone`, since the outline already explains how to get in. Documented in the extension reference.
- Full reference: [../extensions/membership.md](../extensions/membership.md) (Courses). Building a member site end to end: [../extensions/membership-building.md](../extensions/membership-building.md).
