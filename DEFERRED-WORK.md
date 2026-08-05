# UI/UX Audit — Deferred / Out-of-Scope Work

Tracks what `ui-ux-report.md` raised that was **not** fixed in this pass, why, and
what was found along the way that the audit didn't call out. See the branch
`ui-ux-audit-fixes` for the fixes that were made.

## Deferred by explicit decision

### High #2 — Color contrast

Still not touched — this is a sitewide brand-token change (39 selectors across
`styles.css`) and was judged too large to make unreviewed in a UI/UX-fix pass.
Confirmed by hand-computing WCAG contrast ratios against the actual brand
tokens, then investigated further to turn this into an executable spec rather
than leaving it vague. The audit's "772 `color-contrast` hits" figure is
inflated — it's the same handful of shared selectors counted once per element,
per page, per viewport across 65 scans. The real defect surface is below. This
remains the single highest-reach item left outstanding; the spec below is
ready to execute in a future pass.

**Token changes needed (`:root` in `styles.css`):**

- `--color-taupe` (`#6B7A77`) — fails not just on cream (4.12:1) but worse on
  `--color-stone` (3.54:1) and `--color-sage` (3.86:1); the 25 usages span all
  three backgrounds. A replacement must clear 4.5:1 against stone, the
  worst case, not just cream.
- New `--color-accent-text` (~`#B85C00`, ~4.6:1 on cream) for text-only accent
  usage. Must be documented/scoped as **light-background only** — it measures
  only 2.05:1 against `--color-primary`, so it must never replace the 3
  dark-bg `--color-accent-light` usages that already pass (`styles.css:727`,
  `1994`, `2024`).

**`--color-taupe` → new token, all 25 usages** (16 on cream, 5 on stone worst
case, 4 on sage): `styles.css:128, 304, 579, 622, 684, 832, 1009, 1041, 1186,
1519, 1584, 1624, 1661, 1682, 1781, 1850, 2002, 2010, 2091, 2160, 2220, 2232,
2261` — all genuine body/label/muted text, no dark-background instances.

**`--color-accent` → `--color-accent-text`, small/normal text (5 clear
cases):** `.hero-badge:267`, `.section-label:505` (worst case ~1.86:1 on
stone via the "Services" section), `.timeline-date:886`,
`.service-link:hover:1538`, `.program-badge--open:2237`.

**Headline emphasis — decided: darken to `--color-accent-text`** (4 instances,
currently 1.86–2.17:1, failing even the 3:1 large-text threshold — this is a
recurring brand device, italic orange emphasis inside H1s, so keeping the
device but closing the gap was a deliberate choice, not a default):
`.hero h1 em:298`, `.cta-title em:1180` (on sage, 2.03:1),
`.testimonials-hero h1 em:1845`, `.t-tile--light .t-quote em:1993` (on stone,
1.86:1).

**Dark-bg text — bump opacity, not color:** `rgba(247,245,240,0.6)` at
`styles.css:1271` (footer base), `1300` (`.footer-links a`), and `1113`
(`.price-comparison`) all sit on `--color-primary` at ~4.25:1 — bump opacity
to clear 4.5:1. While in there, spot-check the two lower-opacity siblings the
audit didn't flag (likely `.price-period`/`.price-note` at 0.5 opacity) —
since 0.5 < 0.6 opacity implies contrast is *also* below 4.25:1, they're
probably failing too and were just missed.

**Open call, not yet decided:** the 2 decorative opacity-0.6 step numerals
(`.offering-number:668`, `.process-number:1568`) — large ornamental numbers,
arguably not semantic content. Default if no further input is given when this
is executed: nudge their opacity up slightly rather than a full color swap,
since they read as decoration rather than text.

### Low #5 — Brevo stylesheet console error

Not reproducible from source; the report itself flags it as possibly
environment-specific. No action — re-check in production hosting.

## Reduced from the audit's stated scope

### Medium #5 — Filter state exposed to assistive tech

Report said this applied to both `testimonials.html`/`testimonials-template.html`
**and** `masterminds-overview.html`. Fixed on the testimonials pages
(`aria-pressed` on the filter buttons + a live region announcing result counts).
**Not** applied to `masterminds-overview.html`'s audience/status controls —
those are native `<select>` elements with correct `<label for>` already; they
don't need `aria-pressed`. A live region announcing result counts was added
there too, since that part of the finding was valid.

### Medium #6 — Touch targets

Originally only the newsletter consent checkbox (22px → 24px + padding, ~44px
tap area) and the one-pager print button were resized, since the report's
other claim — "several smaller text links measure below the recommended
size" — named no selector or measurement. Investigated afterward and resolved:
found 5 concrete undersized targets sitewide, all following the same
padding-expansion pattern as the consent checkbox (`padding: 0.65rem 0` on the
clickable element, growing the tap area without changing visual text size) —
`.nav-links a`, `.footer-links a`, `.service-link`, `.t-linkedin`
(`styles.css:123, 1298, 1524, 2013`), plus `.mobile-menu-toggle`
(`styles.css:140`) grown from a hard-coded 30×30px to 44×44px, with its bars
kept at a fixed 24px width so the icon doesn't visually stretch. Not touched:
`nextgen-womens-capital-circle.html`'s own isolated stylesheet, which doesn't
share `styles.css` and wasn't in scope for this pass. Checked and already
adequate: `.filter-select` (44px min-height), `.filter-tab` (~48px effective),
`.nav-cta` (~43px), `.mobile-nav a` (24px text + full-width tap area).

### Medium #7 — Masked horizontal overflow on 4 pages

Report listed `index.html`, `1-1-coaching.html`, `emerging-manager.html`,
`investment-manager.html`. Investigated all four:

- **`index.html`** — real cause found and fixed: the two hero CTA buttons used
  `flex: 1 0 240px; white-space: nowrap`, which has `flex-shrink: 0` — the
  buttons could never shrink below their nowrap text width. Changed to
  `flex: 1 1 240px` and dropped `white-space: nowrap`.
- **`1-1-coaching.html`, `emerging-manager.html`, `investment-manager.html`** —
  no equivalent markup exists on these pages. Not touched.

The actual (and much larger) source of masked overflow sitewide is
`.cta-section::before` in `styles.css` — a decorative radial-gradient circle
fixed at `width: 600px; height: 600px`, centered via
`left:50%; transform:translate(-50%,-50%)`. At narrow viewports this
mathematically extends ~127px past each side of the viewport. It is
`pointer-events: none`, `opacity: 0.06`, and fully clipped by the site's
`overflow-x: hidden` — confirmed via Playwright on every page that has a
`.cta-section`: no element's `getBoundingClientRect()` ever exceeds the
viewport, so there is no actual visible defect, only a `scrollWidth` reading
that's technically inflated. This is the same *class* of issue M7 describes,
just not one of the four pages the audit named it on, and it's structural to
the shared CTA-section decoration rather than a page bug. Left alone,
consistent with the M7 scope decision (don't touch `overflow-x: hidden` or the
site's decorative frame pattern for a cosmetic, invisible measurement).

## Found during this work, not in the original audit

### `.fade-in` content never revealed — specificity bug introduced by the High #7 fix, not present on `main`

While browser-verifying the Medium #6 touch-target fixes (screenshotting a
`.service-card`, which happens to also be `.fade-in`), found that scroll-reveal
content never actually appears: `.service-card`, `.facilitator-card`,
`.testimonial-card`, `.cta-content`, and every other `.fade-in` section stay
permanently at `opacity: 0; transform: translateY(30px)` even after the
`IntersectionObserver` in `js/site.js` correctly adds the `visible` class.

Root cause: `html.js .fade-in { opacity: 0; ... }` (added by the High #7
reduced-motion fix, `styles.css:1463`) has higher CSS specificity — 2 classes
**+ 1 type selector** (`html`) — than `.fade-in.visible { opacity: 1; ... }`
(`styles.css:1468`, 2 classes, 0 type selectors). The `visible` class was
being added to the DOM correctly; it just never won the cascade. Verified with
`getComputedStyle`: forcibly removing the `js` class from `<html>` made
`opacity` compute to `1` as expected; re-adding it snapped back to `0`.

This bug is **not present on `main`** — confirmed by diffing `main`'s
`.fade-in` rules, which have no `html.js` gating and no specificity conflict.
It was introduced by this branch's own reduced-motion fallback work and would
have shipped a severe regression (most below-the-fold content on every
content page permanently invisible) had it merged unnoticed.

Fixed in `styles.css:1463` by dropping the redundant `html` type selector —
`.js .fade-in` still scopes to the same element (`.js` is only ever set on
`<html>`) but now ties in specificity with `.fade-in.visible`, and since the
`.visible` rule appears later in source order, it correctly wins the tie.
Re-verified in-browser: `.service-card` content now transitions to
`opacity: 1` on scroll as intended.

### Skip link had no effect without a focus fix

While browser-testing the new skip link (added for Medium #3), found that
`scrollIntoView()` alone doesn't move keyboard focus — after activating the
skip link, the next Tab press would land back on the nav, not inside
`<main>`, defeating its entire purpose. Fixed in `js/site.js`: any same-page
anchor jump now also sets `tabindex="-1"` on the target (if it doesn't already
have one) and calls `.focus()`. This benefits every `href="#..."` anchor on the
site, not just skip links.

### One-pager: `.stat-item` / `.facilitators-row` overflow (real bug, found while verifying the H4 fix)

Fixing the one-pager's `.page` width (High #4) surfaced a **second**, unrelated
overflow bug at narrow widths: `.stats-bar` (`display:flex`, no wrap) and
`.facilitators-row` (`display:grid; grid-template-columns: repeat(3, 1fr)`)
both hit the classic flex/grid `min-width: auto` trap — child content
couldn't shrink below its own min-content size, so the items overflowed their
container by ~127px even though the container itself was correctly sized.
Unlike `corporate-venture.html`'s masked overflow above, **this page has no
`overflow-x: hidden`**, so it would have rendered as a real, visible
horizontal scrollbar. Fixed with `min-width: 0` on `.stat-item` and
`minmax(0, 1fr)` on the grid columns, plus a 2-column wrap layout for the
stats bar under 480px screen width (kept inside `@media screen`, separate
from the existing `@media print` block, so print output is untouched).

Caught by the plan's own verification step, not by re-reading the report —
worth noting as a case where "the fix for the named bug" and "browser-testing
the fix" turned up a second bug in the same neighborhood.

### `js/site.js` extraction deviates from the CLAUDE.md convention

`CLAUDE.md` says to keep inline `<script>` at the bottom of `<body>`. The
mobile nav toggle logic (open/close/Escape/focus-return) was duplicated
near-identically across 12 pages; extracting it to `js/site.js` was flagged in
the plan as a deviation and carried through. `nextgen-womens-capital-circle.html`
was deliberately **not** wired to the shared file — it already keeps its own
isolated CSS/JS by design (documented in its own header comment), so its nav
toggle was fixed inline instead, to match that page's existing isolation
pattern rather than pull in the shared file.

A second, unavoidable exception: each page also gets a one-line synchronous
`<script>document.documentElement.classList.add('js')</script>` in `<head>`,
before the deferred `site.js`. This has to run before first paint (the
standard "no-js/js" pattern) so `.fade-in` content doesn't flash
visible-then-hidden on load — a deferred script running at the bottom of
`<body>` would be too late for that specific job.
