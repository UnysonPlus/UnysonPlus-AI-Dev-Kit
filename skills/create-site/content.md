<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Content: growing the site after it exists

A separate flow from [building the site](SKILL.md). The site is already there; this adds a page or a
post around a topic, in the design system that already exists.

**Three steps and two gates:**

```
research & recommend  →  [GATE 1: approve the plan]  →  draft & optimize  →  [GATE 2: approve publishing]  →  publish
```

Two gates, never one. The first stops you writing the wrong thing well; the second stops a draft
becoming public before anyone read it. They are separate decisions and they are made at different
times, by a person who has seen different things.

## The site is the source of truth

Before asking anything, read what is already known:

- the **site spec** from the build (`business`, `pages`, `brand`, `seo`, and critically `missing[]`);
- the **live sitemap** and the existing internal link structure;
- the **design system** in Theme Settings — the new page uses it, it does not introduce anything.

**Never re-ask for facts the site already carries.** Being asked your own business name by the tool
that built your site is the clearest possible signal that nothing is joined up. And whatever is in
`missing[]` is still missing — it did not become known by the passage of time.

---

## Step 1 · Research and recommend — GATE 1

Study the sitemap, the internal links, the topic and what someone searching for it actually wants.
Then come back with a **plan, not a draft**:

| Return | Why it matters |
| --- | --- |
| **Page or post**, with the reason | Evergreen service content is a page in the nav; timely or topical content is a post. Getting this wrong is expensive to undo once links exist |
| **The angle** | What this piece says that the existing pages do not. If the answer is "nothing", say so — the right recommendation is sometimes *improve the page you already have* |
| **Title options** | Two or three, with the trade-off between clarity and search demand stated |
| **The heading structure** | One `h1`, descending outline, section by section |
| **Internal links to add** | Specific existing URLs, in both directions — what this links to, and what should link to it |
| **The expert questions** | The things **only the owner knows** |

### The expert questions are the point

This is the step that separates a useful piece from generic filler. Ask the handful of questions whose
answers cannot be looked up: what actually goes wrong for their customers, what they do differently,
what the real price range is, what they refuse to do and why.

Then **wait**. Do not draft. A draft written before these answers arrives is a piece of generic content
with their name on it, and once it exists it anchors everything that follows.

---

## Step 2 · Draft and optimize

Only after Gate 1.

**The draft is editable builder content**, in the current design system — the same rule as every page
([build-rules.md](build-rules.md) §1). A post that arrives as a wall of raw HTML is not maintainable by
the person who asked for it.

Set the SEO fields natively. The `seo` extension stores per-object overrides as **discrete meta keys**:

| Field | Meta key |
| --- | --- |
| Title | `_fw_seo_title` |
| Description | `_fw_seo_description` |
| Canonical | `_fw_seo_canonical` |
| Social title / description / image | `_fw_seo_og_*`, `_fw_seo_twitter_*` |

An **empty value deletes the row** rather than storing `''`, and a cleared template means "fall through
to auto" — so leaving a field alone is a real choice, not an omission. Where the site's templates
already generate a good title, let them; an override exists for when they do not.

Set the permalink deliberately, add the internal links agreed at Gate 1, and give images real alt text.

### The two things not to do

**Do not keyword-stuff.** A phrase repeated to move a score reads badly to the person it was written
for, who is the only reader that matters.

**Do not invent facts to satisfy a checklist.** No statistics, no customer quotes, no claims about the
business that nobody made — the same rule as [build-rules.md](build-rules.md) §4, and it is under more
pressure here, because an SEO checklist will happily ask for a number that does not exist.

If the piece cannot be good without a fact you do not have, go back and ask. That is a better outcome
than a confident sentence nobody can stand behind.

---

## Step 3 · Publish — GATE 2

**Only on an explicit go-ahead**, and the approval is to *publish the draft that was read* — not to
publish a new version of it.

**Do not rewrite on the way out.** Tidying the draft between approval and publishing means what goes
live is not what was approved, and that is exactly the kind of small, well-intentioned step that makes
a tool untrustworthy.

Then verify, on the public URL:

- the page loads and the permalink is the one agreed;
- the title and description in the rendered `<head>` are the ones set;
- the canonical points where it should;
- the internal links resolve, both directions;
- no `noindex` left over from a staging default.

Report the live URL and what you verified.

## Why both gates, stated plainly

Collapsing them is the obvious efficiency, and it is wrong in both directions. One gate before
research means approving a plan nobody has made; one gate before publishing means a draft nobody read
goes live. The two decisions are *approve the thinking* and *approve the result*, and only the person
whose business it is can make either.
