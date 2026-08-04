# UI/UX Audit Report

Audit date: August 4, 2026

Environment:
- Local static server at `http://127.0.0.1:4173`
- Chrome
- Viewports tested: `1440x900`, `1024x768`, `768x1024`, `390x844`, `360x800`
- Automated accessibility checks run alongside manual review

Notes:
- The audit itself was run without modifying repository files.
- This report file was added afterward at the user's request.
- Temporary evidence and automation artifacts live outside the repo in `C:\tmp\vc-audit-tools\output\`.

## Scope Covered

HTML files inspected: 18 total

Content and template pages:
- `index.html`
- `1-1-coaching.html`
- `newsletter.html`
- `newsletter-confirmed.html`
- `privacy.html`
- `testimonials.html`
- `testimonials-template.html`
- `cvc-mastermind-lili-onepager.html`
- `masterminds/masterminds-overview.html`
- `masterminds/emerging-manager.html`
- `masterminds/investment-manager.html`
- `masterminds/corporate-venture.html`
- `masterminds/nextgen-womens-capital-circle.html`

Redirect pages:
- `cvc-mastermind.html`
- `im-mastermind.html`
- `mastermind.html`
- `masterminds/stewardship-circle.html`
- `stewardship/female-family-fund.html`

Interactive states reviewed:
- Desktop and mobile navigation, including mobile menu open/closed states
- Hover and focus states for primary CTAs and navigation items
- Keyboard navigation
- Testimonial category filters
- Mastermind audience/status filters, including empty and clear states
- Newsletter validation and option-selection states without submitting personal data
- One-pager print layout
- Redirect behavior with JavaScript enabled and disabled
- Console errors, failed network requests, missing assets, invalid anchors, and horizontal overflow

Evidence:
- Baseline and state screenshots: `C:\tmp\vc-audit-tools\output\screenshots\`
- 90 viewport baselines captured for the 18 HTML files
- 136 screenshots captured in total, including focused defect and interaction evidence

## Critical

No critical issues were found.

## High

### 1. Mobile navigation toggle is not keyboard- or screen-reader accessible

Affected pages and source files:
- `index.html`
- `1-1-coaching.html`
- `newsletter.html`
- `newsletter-confirmed.html`
- `privacy.html`
- `testimonials.html`
- `testimonials-template.html`
- `masterminds/masterminds-overview.html`
- `masterminds/emerging-manager.html`
- `masterminds/investment-manager.html`
- `masterminds/corporate-venture.html`
- `masterminds/nextgen-womens-capital-circle.html`
- Shared styling in `styles.css`

Problem:
- The mobile menu trigger is implemented as a clickable non-button element using inline `onclick`.
- It is not reliably keyboard focusable, has no button semantics, no accessible name, no `aria-expanded`, and no `aria-controls`.
- The menu also lacks expected keyboard behavior such as Escape-to-close and controlled focus return.

Repro:
- Any of the pages above at `390x844` or `360x800`.

Why it matters:
- Mobile navigation is a primary path through the site.
- Keyboard and assistive-technology users can lose access to core navigation.
- This is a high-impact accessibility and task-completion failure.

Recommended fix:
- Replace the trigger with a real `<button type="button">`.
- Add `aria-label`, `aria-expanded`, and `aria-controls`.
- Move state changes out of inline handlers and keep DOM state in sync.
- Support Escape-to-close and return focus to the trigger when the menu closes.
- Ensure visible focus styling on the trigger and menu links.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\state__index__390__mobile-menu.png`
- `C:\tmp\vc-audit-tools\output\screenshots\state__masterminds__corporate-venture__390__mobile-menu.png`

### 2. Color contrast fails repeatedly across the site

Affected pages and source files:
- All 13 content/template pages listed in the scope section
- Shared styling in `styles.css`

Problem:
- Automated accessibility scans consistently flagged contrast failures.
- Across 65 content-page viewport scans, `axe-core` reported 772 `color-contrast` hits.
- Repeated problem combinations included muted footer text on dark teal, low-contrast navigation text, and orange text accents on light cream backgrounds.

Why it matters:
- Low contrast reduces readability for all users and can make content non-compliant for many users with low vision.
- The issue affects navigation, footers, testimonials, and emphasized copy, so it is systemic rather than isolated.

Recommended fix:
- Audit the site color tokens rather than patching single instances.
- Raise contrast for secondary teal text, footer text, muted nav items, and orange accent text on light surfaces.
- Re-test the adjusted palette against WCAG AA for normal body text and interactive states.

Useful evidence:
- Representative failures were visible on every audited width.
- Strong examples appear in:
  - `C:\tmp\vc-audit-tools\output\screenshots\settled__index__390.png`
  - `C:\tmp\vc-audit-tools\output\screenshots\settled__testimonials__390.png`
  - `C:\tmp\vc-audit-tools\output\screenshots\settled__privacy__390.png`

### 3. The Corporate Venture page overflows horizontally on mobile

Affected pages and source files:
- `masterminds/corporate-venture.html`
- Redirect entry point `cvc-mastermind.html`

Problem:
- At `390x844` and `360x800`, the page width expands to roughly `556px`.
- The hero content is wider than the viewport, causing clipped content and sideways overflow.

Why it matters:
- Horizontal scrolling on a conversion page is a major mobile usability failure.
- It weakens first-impression quality and can hide critical content or CTA context.

Recommended fix:
- Inspect the hero layout and any fixed-width or non-wrapping content in the above-the-fold section.
- Remove hard minimum widths, force long inline content to wrap, and validate the full hero stack at `360px`.
- Re-test with DevTools overflow debugging after the change.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\settled__masterminds__corporate-venture__360.png`
- `C:\tmp\vc-audit-tools\output\screenshots\settled__masterminds__corporate-venture__390.png`

### 4. The standalone one-pager uses a print-sized fixed width that breaks small screens

Affected page and source file:
- `cvc-mastermind-lili-onepager.html`

Problem:
- The page uses a fixed `210mm` width on screen.
- On `768x1024`, `390x844`, and `360x800`, the document overflows horizontally instead of adapting to the viewport.
- Print output itself is fine; the problem is screen behavior.

Why it matters:
- The page is publicly viewable in a browser, so mobile and tablet visitors see a broken layout.
- This makes reading, zooming, and scanning substantially harder.

Recommended fix:
- Keep A4 sizing inside `@media print` only.
- For screen styles, switch the page to a responsive max-width layout, for example a fluid width capped near the intended print measure.
- Re-test both mobile rendering and print output after separating screen and print rules.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\settled__cvc-mastermind-lili-onepager__390.png`
- `C:\tmp\vc-audit-tools\output\screenshots\settled__cvc-mastermind-lili-onepager__360.png`
- `C:\tmp\vc-audit-tools\output\screenshots\state__cvc-onepager__print.png`

### 5. Corporate Venture messaging contains stale cohort dates

Affected pages and source files:
- `masterminds/corporate-venture.html`
- `cvc-mastermind-lili-onepager.html`

Problem:
- The Corporate Venture page and one-pager still say `Starting August 2025`.
- The audit date was August 4, 2026, so those dates are now in the past.

Why it matters:
- Date-sensitive conversion pages need to be current.
- Outdated dates reduce trust and make prospects question whether the program is active.

Recommended fix:
- Replace hard-coded cohort timing with current dates or relative program status.
- If the date changes often, move it to a single shared content variable or content partial to reduce drift between pages.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\settled__masterminds__corporate-venture__390.png`
- `C:\tmp\vc-audit-tools\output\screenshots\settled__cvc-mastermind-lili-onepager__390.png`

### 6. Newsletter validation and selection states are not accessible enough

Affected page and source file:
- `newsletter.html`

Problem:
- The form uses `novalidate`, but empty submission leaves focus on the submit button instead of moving to the first invalid field.
- Error text is injected, but fields do not consistently expose `aria-invalid` and error associations.
- The audience-selection controls use visually rich cards backed by tiny hidden radio inputs, with weak focus visibility on the actual control.

Why it matters:
- This is a core conversion path.
- Users can miss errors, especially keyboard and assistive-technology users, and may abandon the form.

Recommended fix:
- On failed submit, move focus to the first invalid field and expose error messages with `aria-describedby`.
- Keep `aria-invalid` in sync with validation state.
- Make the selectable audience cards keyboard-visible and ensure the actual radio control has an obvious focus indicator.
- Validate the card/radio pattern with screen readers before shipping.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\state__newsletter__invalid-selected__390.png`

### 7. Several pages hide key content until JavaScript runs, without a site-wide reduced-motion fallback

Affected pages and source files:
- `index.html`
- `1-1-coaching.html`
- `testimonials.html`
- `testimonials-template.html`
- `masterminds/masterminds-overview.html`
- `masterminds/emerging-manager.html`
- `masterminds/investment-manager.html`
- `masterminds/corporate-venture.html`
- Shared reveal styling in `styles.css`

Problem:
- Content sections start at `opacity: 0` and are revealed by JavaScript.
- The general shared styles do not include a site-wide `prefers-reduced-motion` fallback.
- If the reveal script fails, loads late, or is blocked, content can remain hidden longer than intended or stay invisible.

Why it matters:
- Core content should not depend on animation JavaScript for basic visibility.
- This creates resilience and accessibility risk, especially on slower devices or restricted environments.

Recommended fix:
- Make content visible by default and progressively enhance with animation only when JavaScript is available.
- Add a shared `prefers-reduced-motion: reduce` rule that disables reveal transitions and ensures immediate visibility.
- Keep the existing motion treatment as an enhancement, not a dependency.

Useful evidence:
- Mobile baselines had to be recaptured in a settled state for several reveal-heavy pages.
- Representative screenshots:
  - `C:\tmp\vc-audit-tools\output\screenshots\settled__index__360.png`
  - `C:\tmp\vc-audit-tools\output\screenshots\settled__masterminds__emerging-manager__360.png`

## Medium

### 1. Testimonial filter controls overflow on narrow mobile widths

Affected pages and source files:
- `testimonials.html`
- `testimonials-template.html`
- Shared styling in `styles.css`

Problem:
- The category tabs exceed the available width on `390x844` and clip on `360x800`.
- On the narrowest viewport, the `Mastermind` tab is visibly constrained.

Why it matters:
- Filters are an active discovery control on the page.
- Clipped controls reduce clarity and make the interface look unstable.

Recommended fix:
- Allow the filter group to wrap, stack, or switch to a compact mobile layout below `390px`.
- Re-test label lengths at `360px` after the update.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\settled__testimonials__360.png`

### 2. Four footer links point to a missing internal anchor

Affected pages and source files:
- `testimonials.html`
- `testimonials-template.html`

Problem:
- Footer links target `index.html#coaching`, but `index.html` does not expose a matching `id="coaching"` anchor.

Why it matters:
- Users land at the top of the home page instead of the intended section.
- This is a broken internal navigation path and weakens footer reliability.

Recommended fix:
- Either add a real `id="coaching"` target on the home page or update the footer links to the correct destination.
- Re-run internal anchor validation after the change.

### 3. Content pages are missing a primary main landmark and skip link

Affected pages and source files:
- All 13 content/template pages listed in the scope section

Problem:
- The pages do not expose a dedicated `<main>` region.
- There is also no skip link for bypassing repeated navigation.

Why it matters:
- This makes keyboard and assistive-technology navigation less efficient, especially on pages with repeated header and footer structures.

Recommended fix:
- Wrap primary page content in `<main id="main-content">`.
- Add a visible-on-focus skip link near the start of the document pointing to that main region.

### 4. Heading hierarchy skips levels on key pages

Affected pages and source files:
- `masterminds/masterminds-overview.html`
- `cvc-mastermind-lili-onepager.html`

Problem:
- The overview page jumps from `h1` to `h3`.
- The one-pager jumps from `h1` to `h4`.

Why it matters:
- Inconsistent heading levels make structure harder to parse for assistive technology and weaken document semantics.

Recommended fix:
- Normalize the heading outline so each section follows a coherent level progression.
- Keep visual styling separate from heading rank.

### 5. Filter controls work visually but do not fully expose state to assistive technology

Affected pages and source files:
- `testimonials.html`
- `testimonials-template.html`
- `masterminds/masterminds-overview.html`

Problem:
- Testimonial filter buttons do not expose `aria-pressed`.
- Filter result changes and empty states are not announced through a live region.
- The mastermind overview empty/clear state works visually but has limited accessible feedback.

Why it matters:
- Users relying on assistive technology may not know which filter is active or whether the result set changed.

Recommended fix:
- Add `aria-pressed` or an equivalent accessible state pattern to the filter buttons.
- Announce result counts and empty states through a polite live region.
- Keep the clear action keyboard reachable and semantically explicit.

Useful evidence:
- `C:\tmp\vc-audit-tools\output\screenshots\state__testimonials__all.png`
- `C:\tmp\vc-audit-tools\output\screenshots\state__testimonials__mastermind.png`
- `C:\tmp\vc-audit-tools\output\screenshots\state__masterminds-overview__empty.png`

### 6. Several secondary controls are undersized for touch input

Affected pages and source files:
- Multiple pages, especially footers and form controls

Problem:
- Several smaller text links measure below the recommended touch target size.
- The newsletter consent checkbox and the one-pager print button are also tight relative to mobile best practice.

Why it matters:
- Small targets increase mis-taps and slow down task completion on mobile.

Recommended fix:
- Increase padding and hit area for secondary links and smaller controls.
- Aim for at least a `44px` target where practical on touch devices.

### 7. Some pages still have masked horizontal overflow even when visible clipping is limited

Affected pages and source files:
- `index.html`
- `1-1-coaching.html`
- `masterminds/emerging-manager.html`
- `masterminds/investment-manager.html`
- Shared overflow handling in `styles.css`

Problem:
- At `360px` and `390px`, the document width expands beyond the viewport on some pages, but the site-level overflow hiding masks the issue.
- This did not produce obvious major clipping in the settled screenshots, but it indicates fragile layout behavior.

Why it matters:
- Hidden overflow can conceal layout defects that later become visible after content edits or browser differences.

Recommended fix:
- Remove the root cause rather than relying on `overflow-x: hidden`.
- Inspect the hero/button/card rows on the listed pages and verify true viewport-width containment at `360px`.

## Low

### 1. Newsletter form disables useful browser autofill hints

Affected page and source file:
- `newsletter.html`

Problem:
- The first-name and email fields use `autocomplete="off"`.

Why it matters:
- Disabling autofill adds friction to a form that should be as lightweight as possible.

Recommended fix:
- Use appropriate autocomplete tokens such as `given-name` and `email`.

### 2. Navigation does not indicate the current page

Affected pages and source files:
- Shared navigation across content pages

Problem:
- The active page is not distinguished visually or semantically.

Why it matters:
- Current-location feedback improves orientation, especially across the large set of related program pages.

Recommended fix:
- Add an active state and `aria-current="page"` to the current navigation link.

### 3. External-link behavior is inconsistent

Affected pages and source files:
- Multiple pages

Problem:
- Some external links open new tabs while others do not.

Why it matters:
- Inconsistent behavior increases cognitive load and makes outbound navigation less predictable.

Recommended fix:
- Define a clear external-link rule and apply it consistently.
- If links open a new tab, communicate that accessibly and use the correct `rel` attributes.

### 4. A public template page is exposed alongside the live testimonials page

Affected page and source file:
- `testimonials-template.html`

Problem:
- The template page appears publicly accessible and close in content to the live page.

Why it matters:
- Public template pages can confuse users, split SEO signals, and create maintenance drift.

Recommended fix:
- Remove it from public navigation and publishing if it is only an internal scaffold.
- If it must remain public, clearly distinguish its purpose and ownership.

### 5. One console stylesheet error appears to be local/environment-specific rather than a confirmed site bug

Affected page and source file:
- `newsletter.html`

Problem:
- One mobile run logged a Brevo stylesheet load error (`sib-styles.css`) related to local restrictions/CORS behavior.
- The form still rendered and remained usable in the audit environment.

Why it matters:
- It should be tracked, but it is not currently strong enough evidence for a production defect by itself.

Recommended fix:
- Re-check the stylesheet request in production hosting and a normal browser session before treating it as a site bug.
- If reproducible there, host the required styles more reliably or adjust the third-party embed strategy.

## Cross-Site Patterns

- Accessibility issues are mostly systemic rather than page-specific: nav semantics, contrast, landmark structure, and filter-state announcement patterns repeat across many files.
- Mobile responsiveness is generally solid on the main content pages, but a few layouts rely too much on overflow masking or fixed sizing.
- The site uses a consistent visual language overall, but conversion-critical details need tightening on the newsletter and Corporate Venture flows.
- Redirect coverage is in good shape; the more meaningful remaining issues are inside the live destination pages.

## Checks That Passed

- All 5 redirect pages reached the correct destinations with JavaScript enabled.
- Redirect scripts preserved `location.hash`.
- Each redirect page exposed a no-JavaScript fallback link.
- Testimonial filtering returned the expected visible sets for `All`, `1:1`, and `Mastermind`.
- The mastermind overview filters supported both empty state and clear/reset behavior.
- Newsletter invalid states prevented submission during pre-submit testing.
- The one-pager print stylesheet produced a clean single-page A4 print result.
- No confirmed missing local images were found.
- No confirmed local `4xx` page requests were found during the audit.
- No uncaught JavaScript exceptions were confirmed in the audited flows.

## External Links and Third-Party Caveats

- Genuine site failures were separated from local restrictions as far as possible.
- Google Fonts, Clarity, Brevo, Calendly, Fillout, and LinkedIn behavior can be affected by local environment restrictions, bot protection, or request-method differences.
- LinkedIn profile URLs and the Microsoft privacy statement did not present as confirmed broken destination pages during follow-up checks, even where `HEAD` requests were restrictive.

## Limitations

- This was a local static-server audit, not a production-hosted audit.
- External embeds and third-party resources were reviewed only to the extent possible without submitting live personal data or changing external account state.
- Some mobile baseline captures required a settled recapture because scroll-triggered reveal animations and fast automation can produce misleading intermediate screenshots. The final evidence set reflects the verified settled state.
