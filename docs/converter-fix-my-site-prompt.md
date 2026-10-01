<!-- SPDX-License-Identifier: CC-BY-NC-SA-4.0 -->
# Fix my converted site — the prompt to give your AI agent

The Site Converter gets a site most of the way in about a minute. Closing the rest is a short, mechanical
job — but only if it is done in the right order, with measurements instead of impressions, and in the
right *place*. This is the prompt that makes an agent do that.

> **This is the SITE-BUILDER variant of one protocol.** Fixing a site and *training* the converter are the
> same job — the page must end up matching its source either way, and every rule found is reported upstream
> either way. The only difference is **where a fix may land**, and that follows from what you have: this
> prompt is for an agent **without** the converter source, the goldens or the test corpus, so a fix lands in
> a theme option, scoped CSS, or a site-local hook — never in plugin files, which the next update erases.
> The maintainer's variant is [converter-training-prompt.md](converter-training-prompt.md); the full runbook
> behind both, with every phase and gate, is [site-build-protocol.md](site-build-protocol.md).

**Fill in the four values at the top, paste the whole thing to your agent, and leave it to work.** The
converter's result panel can fill them in for you and give you a Copy button.

---

## The prompt (copy this)

```text
You are closing the gap between a converted WordPress site and the source it was converted from.

  SOURCE URL      : <the original site>
  CONVERTED URL   : <the WordPress site, e.g. http://localhost/>
  CAPTURE FOLDER  : <path to capture-out/<site>/, if you have one — else "none">
  KNOWN FINDINGS  : <paste the converter's result list, or "none">

WHERE FIXES GO — in this order, and never past the last one:
  1. A native Theme Settings option (Unyson+ → Theme Settings). Always prefer this. If an option exists
     for the thing you are fixing, use it, even if CSS would be quicker.
  2. Scoped custom CSS (Theme Settings → Misc → Custom CSS, or the element's own Custom CSS box), when
     no option can express the value.
  3. A converter HOOK, in the site's own code (a child theme's functions.php, or a small plugin in
     framework-customizations/) -- for the rare case where the converter itself mis-maps something and you
     want THIS site right without touching shared code. Three exist:
       - action fw_site_converter_recognizers  -> then FW_Site_Converter_Stitch::register_recognizer(
           $id, $priority, $match, $build ) to claim a DOM element yourself. Priorities 100+ outrank all
           built-ins; re-use a built-in's id to replace it; unregister_recognizer( $id ) removes one.
       - filter fw_site_converter_block_nodes( null, $block, $css_id ) -> return an array of builder nodes
           to claim a block, [] to drop it, or null to leave it to the built-ins.
       - filter fw_site_converter_theme_settings( $values, $replace_chrome, $force ) -> add, change or
           unset the Theme Settings values a conversion writes.
     Only reach for these AFTER an option and scoped CSS have both been ruled out, and re-run the
     conversion to confirm the hook fired -- a hook is invisible until something reconverts.
     PUT THE HOOK IN THE SANDBOX, not loose in functions.php: one file per correction in
     wp-content/unysonplus-sandbox/entries/, returning array( id, summary, fragment, expected, probe,
     apply ). See its README (the converter creates it). Give each entry a `probe` returning TRUE while
     the defect is still present, so a later converter update retires the entry automatically instead of
     leaving it to fight a fix the site has already received. The `fragment` + `expected` you record there
     are what make the entry shareable upstream.
  4. There is no 4. DO NOT edit the Site Converter, the plugin, or the parent theme. Those are shared
     code: a plugin update will overwrite your work, and a "fix" tuned to this one site is wrong for
     every other site anyway. If the converter genuinely mis-maps a pattern, use a hook for this site and
     RECORD the case (see REPORT BACK) rather than patching the converter.

METHOD — measure, change, re-measure. Never eyeball-and-guess:
  - Open the SOURCE and the CONVERTED page side by side in a real browser (headless is fine).
  - For the region you are on, read COMPUTED values from both — not the stylesheet, not the HTML.
  - Change the option or rule, then MEASURE AGAIN to confirm. A change you did not re-measure is not
    a fix, it is a hope.
  - Before every measurement of the converted page: clear the generated CSS caches
    (wp-content/uploads/unysonplus/asset-optimizer/*, wp-content/uploads/unysonplus/css/*) and
    hard-reload. A stale combined stylesheet will show you the previous state and waste an hour.

ORDER — one region at a time, and do not advance until the current one matches:
    header  →  footer  →  each section from the top down
  The header and footer are the chrome the whole site is judged by, so they are locked first.

FOR EACH REGION, CHECK ALL SIX. These are the things that are missed most often, in the order they are
missed. A region is not done until you have checked every one of them:
  1. CONTENT — is every piece of text and media present, and in the SAME ORDER? Something rendered in
     the wrong sequence (a quote above the name that follows it in the source) reads as broken even
     when every word is there. Something missing entirely is invisible to any size measurement.
  2. TYPE — for each matching piece of text, compare font-size, font-family, font-weight, font-style,
     text-align and colour. A box can be exactly the right size with completely wrong type inside it.
     This is the single most common thing a "looks about right" pass misses.
  3. SPACING — the gaps between items. Look for where the source's spacing actually comes from: a flex
     `gap`, a margin on every child but the first, or padding on each item. They produce the same look
     and are set in different options.
  4. LAYOUT — column counts, row heights, image aspect and fill. Count the source's columns; do not
     infer them from the number of items.
  5. STATE — the current/active item, hover colours, the focused state. A missing current-page marker
     in a menu is a real defect and no size check will report it.
  6. SPACE BETWEEN REGIONS — a full-width strip between two sections is easy to lose entirely. Compare
     the vertical gap after each region, not just the region itself.

VERIFY LIKE THIS, not with a single number:
  - Compare the page HEIGHT of each region, source vs converted — a large difference means something is
    missing, duplicated, or laid out differently.
  - Then LOOK at the region as a rendered image. A number that says "close" on a region you have not
    looked at is not evidence. A box metric says nothing about what is inside the box.
  - If you can see a difference that your measurement did not report, your measurement is looking at the
    wrong thing. Fix how you are measuring before you carry on.

IF THIS SITE HAS THE AI ASSISTANT EXTENSION, you have hands as well as eyes: WP admin →
Unyson+ → AI Assistant → "Connect an agent" issues an MCP connection. Prefer its tools —
describe-theme-settings / update-theme-settings, save-preset, list-elements / update-element,
render-check and undo — over editing files: they validate what you send, and every change is
revertible. Ask the site owner for the connection details; they are shown once, and must never be
pasted into a prompt, an issue or a chat.

IF YOU HAVE THE UnysonPlus AI Dev Kit (optional — skip if not):
  - tools/measure/container-check.mjs <converted> <source>   → container content width
  - tools/measure/props.mjs <source> <converted>             → named-property diffs (type, spacing)
  - tools/measure/section-audit.mjs                          → per-section screenshots
  The capture service's verify.mjs adds verifyPixels (per-section heights) and verifyChrome (header and
  footer, including type mismatches). Use them to find candidates — then confirm by looking.

STOP WHEN: every region matches in content, type, spacing, layout and state — and you have looked at
each one, not just measured it.

REPORT BACK at the end, in this shape:
  - What you changed, per region: the option or rule, and the before → after values.
  - Anything you could NOT fix with an option or scoped CSS — for each, the source's HTML fragment and
    what the converter emitted instead. This is the useful part: it is a reproducible case the
    maintainers can turn into a permanent converter fix, so the next conversion needs no manual pass.
  - Anything you fixed that you believe the converter should have got right on its own.

SEND EACH FINDING AS YOU FIND IT, not batched at the end. Ask the site owner ONCE, at the start, whether
findings may be sent upstream -- one "yes" covers the whole run; never ask per bug. Then, the moment you
understand a systematic miss:
  node send-finding.mjs --url=<src-url> --finding='{"region":"s2","property":"font-weight","got":"400",
    "expected":"700","construct":"button.btn-amber .font-bold","path":"capture-out/<site>","twin":"php",
    "loss":"overridden","recurs":true,"ref":"s2:hero buttons",
    "solution":"the GENERAL rule: which source construct -> which converter path"}'
  node send-finding.mjs --url=<src-url> --summary --stats=<capture-out>/<site>/share-stats.json --positives="..."
It posts a few hundred structural-only bytes: a salted host HASH (never the URL), class tokens and property
NAMES, the note auto-redacted of URLs/emails/quoted content. No content text, images, hrefs or screenshots.
The contract is ENFORCED and each refusal has a reason: a finding with no `construct` + `path` cannot be
reproduced; a `fixture` must carry data-sc-cs stamps (cut it with make-fixture.mjs); a `solution` that is an
#id stylesheet rule teaches the converter nothing; "fixed per-site" without the general `solution` throws
away the valuable half; a POSITIVE belongs in --summary --positives. Send the CASE, never a patch.

WHY IT MATTERS. Every rule you worked out by hand here is a rule the converter is missing, and your
report is already in the form that fixes it: a source fragment plus the wrong output is a test case.
Shared, it becomes a permanent improvement — the next site of this shape converts correctly for
everyone, including you, with no manual pass of your own. Open an issue on the UnysonPlus repository
with that list. Two limits on what you send: the FRAGMENT AND THE VALUES, never a patch to the plugin
(a fix tuned to one source is wrong for the rest, and the maintainers have a test corpus to check a
general rule against); and nothing you would not publish — strip client names, private URLs and
credentials, and ask the site's owner before sharing anything of theirs.
```

---

## Why each rule is in there

**"There is no 4."** The most damaging thing an agent can do is patch the converter to fix one site. It
feels like the real fix and it is the opposite: the change is tuned to a single source, it is lost on the
next plugin update, and it silently alters the result for every other site that plugin touches. This rule
used to read "there is no 3" and forbid the whole idea; the converter now exposes three hooks, so there IS
a legitimate third place — the site's *own* code. That distinction is the entire point: a hook in a child
theme survives updates and affects one site, while the same logic pasted into the plugin does neither. The
hooks come last in the order because they are the least visible fix: nothing changes until something
reconverts, so an agent that stops at writing one has not verified anything.

**"Measure, change, re-measure."** An agent that changes a value and moves on will report a list of fixes
that were never confirmed. Re-measuring is the difference between a fix and an intention.

**The cache purge.** UnysonPlus writes a combined stylesheet. Measure without clearing it and you measure
the previous state — the most reliable way to lose an hour and conclude a correct fix did not work.

**The six checks, in that order.** They are ordered by how often each is missed. Content and type come
first because they are invisible to size measurements: a footer paragraph can be the right width, in the
right place, at the right line count — and rendered in a display serif where the source sets body sans.

**"Look at the region, not just the number."** A pixel comparison over a region that is mostly flat
background is dominated by the background, which matches perfectly — so three real defects in a
masthead can read as a 3% difference. Numbers narrow the search. Eyes close it.

**The report shape.** An agent that reports only what it fixed leaves the maintainers with nothing. The
valuable output is the *unfixable* residue: the source fragment plus what the converter emitted is a
reproducible case, and reproducible cases are what turn into permanent converter improvements.

**Asking for that report to be shared — and saying what it is for.** An agent told only to "report back"
reports to the person in the room, and the finding stops there; the next site of the same shape gets
solved by hand all over again. Told what the report is *for* — that a fragment plus the wrong output is a
test case, and that one shared case is fixed once for everybody — it writes something a maintainer can
act on. The ask is deliberately narrow: **the case, not the patch.** A patch tuned to a single source is
precisely what the converter must not take; a reproducible case can be run against the whole corpus,
which is the only way to tell a general rule from a coincidence. And it is an invitation, not a condition
of finishing — the site is fixed either way — with the privacy limits stated as part of the ask rather
than left to the agent's judgement.
