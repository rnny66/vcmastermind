# UI/UX Audit — Deferred / Out-of-Scope Work

Tracks what `ui-ux-report.md` raised that was **not** fixed in this pass, why, and
what was found along the way that the audit didn't call out. See the branch
`ui-ux-audit-fixes` for the fixes that were made.

## Deferred by explicit decision

### High #2 — Color contrast

Not touched. Confirmed by hand-computing WCAG contrast ratios against the actual
brand tokens in `styles.css`:

| Token / usage | Ratio | AA (4.5:1) |
|---|---|---|
| `--color-taupe #6B7A77` on cream — nav links, muted text | 4.12:1 | fail |
| `--color-accent #ff8a00` on cream — accent text (not decorative use) | 2.17:1 | fail, badly |
| `rgba(247,245,240,0.6)` on `--color-primary` — footer text | 4.25:1 | fail (marginal) |

The audit's "772 `color-contrast` hits" figure is inflated — it's the same
handful of shared selectors counted once per element, per page, per viewport
across 65 scans. The distinct defects are the three rows above. Fixing
`--color-taupe` and adding a text-only accent token (e.g. `--color-accent-text`
around `#B85C00`, ~4.6:1) would clear most of the reach. This is the single
highest-reach item left outstanding.

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

Only the newsletter consent checkbox (22px → 24px + padding, ~44px tap area)
and the one-pager print button were resized. The report's other claim —
"several smaller text links measure below the recommended size" — named no
selector or measurement and couldn't be acted on as written. If there's a
specific link in mind, point at it and it can be sized properly.

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
