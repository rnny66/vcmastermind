# The VC Coach Website

## Project overview

This repository contains the multi-page marketing website for The VC Coach. It is a
static site deployed through GitHub Pages at **https://thevccoach.com** (the custom
domain is configured in `CNAME`).

- Stack: vanilla HTML, CSS, and JavaScript
- Build step: none
- Package manager/runtime dependencies: none
- Shared design reference: `STYLE-GUIDE.md`
- Primary language: English, with English and Dutch versions of the SLIM page

The site now covers executive coaching, testimonials, a newsletter, a directory of
mastermind programs, individual program pages, and SLIM subsidy landing pages. Its
scope is broader than the original Emerging Manager Mastermind landing page.

## Current published status

Snapshot from `masterminds/masterminds-overview.html` on 2026-09-25:

- Emerging Manager Mastermind: enrolling cohort 2
- Investment Manager Mastermind: applications open
- Corporate Venture Capital Mastermind: pilot pre-application
- NextGen Women's Capital Circle / wealth stewards: coming soon

Treat the page copy as the source of truth. When program status, price, dates, or calls
to action change, keep the directory card and its corresponding detail page in sync.
The two SLIM pages currently contain source comments noting that their waitlist CTAs
still point to the eligibility-check form.

`new-pages/` contains concept copy for three possible future offerings—Investor
Relations Mastermind, Mothers in Capital, and a Private Equity Partner Track. These are
draft source documents only; no corresponding HTML routes have been implemented.

## Repository map

### Public pages

```text
index.html                                      Home
1-1-coaching.html                               Executive coaching
newsletter.html                                 Brevo newsletter form
newsletter-confirmed.html                       Subscription confirmation
privacy.html                                    Privacy and cookie disclosures
testimonials.html                               Current testimonials experience
masterminds/masterminds-overview.html            Filterable program directory
masterminds/emerging-manager.html                Emerging Manager program
masterminds/investment-manager.html              Investment Manager program
masterminds/corporate-venture.html               Corporate VC pilot
masterminds/nextgen-womens-capital-circle.html   NextGen / wealth stewardship program
slim/slim-en.html                                SLIM landing page, English
slim/slim-nl.html                                SLIM landing page, Dutch
```

### Compatibility redirects

Keep these lightweight redirect files unless the old URLs are deliberately retired:

```text
mastermind.html                         -> masterminds/emerging-manager.html
im-mastermind.html                      -> masterminds/investment-manager.html
cvc-mastermind.html                     -> masterminds/corporate-venture.html
masterminds/stewardship-circle.html     -> masterminds/nextgen-womens-capital-circle.html
stewardship/female-family-fund.html     -> masterminds/nextgen-womens-capital-circle.html
```

Each redirect preserves the URL hash and includes a canonical URL plus a meta-refresh
fallback.

### Working and reference artifacts

These are not canonical public pages. Do not update them automatically when changing
the live equivalent unless the task explicitly includes them.

```text
cvc-mastermind-lili-onepager.html   Standalone printable CVC one-pager
testimonials-template.html          Earlier video-testimonial layout/reference
testimonials-mockup.html            Testimonials concept mock-up
slim/hero-mockup.html               SLIM hero design exploration
resources/                          Internal source notes; intentionally gitignored
new-pages/                          Draft copy for possible future program pages
ui-ux-report.md                     Original UI/UX audit
DEFERRED-WORK.md                    Deferred audit findings and implementation notes
cookie-plan.md                      Consent implementation plan/reference
to-do.md                            Current operational/SEO follow-up work; gitignored
```

### Shared assets and behavior

```text
styles.css                          Main shared design system and page styles
css/consent.css                     Portable cookie-banner styles
masterminds/nextgen-womens-capital-circle.css
                                    Isolated NextGen page design system
slim/slim.css                       SLIM component styles
slim/slim-redesign.css              Later SLIM visual overrides
js/site.js                          Mobile nav, scroll reveal, and same-page anchors
js/consent.js                       Consent state, banner UI, and tracker registry
js/testimonials.js                  Current testimonial filters and story dialog
js/video.js                         Custom player used by testimonials-template.html
img/                                Logos, people, backgrounds, and video posters
vid/                                Self-hosted testimonial videos
.agents/skills/                     Local agent skills for design and frontend work
```

## Local agent skills

The repository currently includes 26 project-local skills under `.agents/skills/`.
They cover frontend design and redesign, visual direction, prototyping, brand work,
motion creation and review, mobile/native behavior, and specialist workflows such as
Sonner and Swift.

- Treat each skill's `SKILL.md` as its source of truth. Read it completely before using
  that skill, along with any required files it directly references.
- Use the smallest relevant set of skills for the task and follow any explicit-only
  activation rule in the skill metadata.
- For this vanilla website, prefer the web/frontend, redesign, accessibility, and CSS
  motion skills. Expo, Swift, Sonner, and native-app skills are normally out of scope
  unless the task explicitly calls for them.
- Do not let a generic visual-style skill override this project's brand tokens, voice,
  accessibility requirements, isolated-page architecture, or the user's brief.
- The directory is the authoritative inventory; do not duplicate all skill names here,
  because skills may be added, removed, or renamed independently of this guide.

## Architecture and exceptions

### Main shared system

Most public pages load `styles.css`, `css/consent.css`, `js/consent.js`, and
`js/site.js`. Paths must be relative to the page's directory.

`js/site.js` owns:

- accessible mobile-menu open/close behavior
- `.fade-in` IntersectionObserver reveals
- smooth same-page anchor scrolling and target focus management

Pages using shared scroll reveal add this synchronous line near the top of `<head>` so
content does not flash before JavaScript applies the reveal state:

```html
<script>document.documentElement.classList.add('js');</script>
```

Keep the deferred `js/site.js` include at the bottom of `<body>`. Content must remain
visible when JavaScript is unavailable; the `.js .fade-in` gate in `styles.css` is
intentional, and `.fade-in.visible` must continue to win the cascade.

### NextGen page

`masterminds/nextgen-womens-capital-circle.html` is deliberately isolated from
`styles.css` and `js/site.js`. It uses
`masterminds/nextgen-womens-capital-circle.css` and its own inline behavior. Preserve
that separation unless a task explicitly calls for consolidation.

### SLIM pages

The English and Dutch SLIM pages load the main `styles.css` first, then `slim/slim.css`
and `slim/slim-redesign.css`. Make paired structural or behavioral changes to both
language versions unless the change is language-specific.

### Consent and analytics

`css/consent.css` is intentionally standalone because it must work with both the main
stylesheet and the isolated NextGen stylesheet. It must define no `:root` block and no
bare element selectors; it reads only custom properties supplied by its host page.

Never paste analytics or tracking snippets directly into an HTML `<head>`. Add trackers
only to the `TRACKERS` registry in `js/consent.js`, which gates loading behind consent.
Microsoft Clarity is the only active tracker. The GA4 entry is a commented template and
must remain inactive until a real measurement ID is supplied and the disclosures in
`privacy.html` and the banner copy are updated.

`js/consent.js` is intentionally loaded synchronously in `<head>`: it must read stored
consent and decide whether to load trackers before the banner UI is created. Fourteen
HTML pages currently use the consent layer: the 13 public content pages plus
`testimonials-template.html`.

### External services

- Brevo supplies the newsletter form, remote form CSS, and JavaScript on
  `newsletter.html`.
- Fillout hosts mastermind applications and SLIM eligibility checks.
- Calendly hosts discovery-call booking.
- Google Fonts currently serves Cormorant Garamond and Outfit. Self-hosting remains an
  open privacy improvement documented in `to-do.md`.
- Testimonial MP4 files and posters are self-hosted and do not require consent gating.

## Brand and voice

### Core values

- **Trust & Confidentiality** — a safe space for honest dialogue
- **Expertise Without Hierarchy** — peer-driven, facilitated learning
- **Clarity Over Complexity** — direct, actionable, and jargon-free
- **Human-Centered** — acknowledge the personal side of professional growth
- **Curated Quality** — small, intentional groups rather than mass networking

### Voice

- Direct and clear
- Confident, not arrogant
- Human and relatable
- Honest about limitations and selection criteria

## Implementation conventions

### HTML

- Use semantic landmarks and elements: `<main>`, `<section>`, `<nav>`, `<footer>`, and
  `<article>`.
- Give navigable sections stable IDs matching their anchor links.
- Use the shared structure `<section class="[name]" id="[name]"><div
  class="container">...</div></section>` where the page design follows the main system.
- Preserve the skip link and the `id="main-content"` target on standard pages.
- Use inline Heroicons-style SVGs with `stroke-width="2"` when adding icons.
- Give every informative image useful `alt` text; use empty alt text only for decorative
  images.
- For links opening a new tab, use `target="_blank" rel="noopener noreferrer"` and keep
  the screen-reader-only new-tab notice used elsewhere on the site.
- Add `.fade-in` only on pages using the shared `js/site.js` reveal behavior.

### CSS

- Use the color and font custom properties defined in the applicable stylesheet; do not
  introduce hard-coded brand colors in new shared code.
- Use `rem` for font sizes.
- Keep the standard container at `max-width: 1320px; margin: 0 auto; padding: 0 2rem`.
- Primary responsive breakpoints are 1024px and 768px; 480px is also used for narrow
  mobile adjustments.
- Keep selectors no deeper than three levels where practical.
- Follow existing motion timings: roughly `0.3s ease` for fast interactions, `0.4s ease`
  for standard transitions, and `0.8s–1s ease-out` for entrances.
- Respect `prefers-reduced-motion` for new animation.
- Avoid `!important` except when overriding unavoidable third-party or utility styles.
- Preserve the existing card-hover border and offset-frame patterns when extending those
  components.

### JavaScript

- Use dependency-free browser JavaScript compatible with the existing ES5-style shared
  files unless a page-local script already follows a different established style.
- Prefer shared behavior in `js/site.js`; keep page-specific behavior in the relevant
  page or its dedicated file.
- Guard queries before attaching listeners so shared scripts remain safe on pages that do
  not contain every component.
- Preserve keyboard handling, focus return, live-region announcements, and no-JavaScript
  fallbacks.

## Verification checklist

There is no automated test suite or build pipeline. For meaningful changes:

1. Serve the repository over HTTP; do not rely only on opening `file://` URLs.
2. Check desktop, 1024px, 768px, and a narrow mobile width around 390–480px.
3. Test keyboard navigation, visible focus, skip links, mobile-menu Escape behavior, and
   dialog focus behavior when relevant.
4. Confirm that content remains available with JavaScript disabled and that reduced-motion
   preferences suppress nonessential animation.
5. For consent changes, use a fresh private session and verify that no Clarity request is
   made before acceptance, acceptance loads it, and decline clears its cookies.
6. For shared navigation/footer changes, check both root pages and nested pages for correct
   relative URLs.
7. For program copy changes, compare the overview card with its detail page; for SLIM
   changes, compare the English and Dutch pages.

## Known outstanding work

Use `to-do.md` and `DEFERRED-WORK.md` for the detailed executable notes. Current items
include:

- add GA4 only after receiving a measurement ID, with matching privacy disclosures
- self-host Google Fonts and remove the corresponding third-party disclosure
- add missing meta descriptions and improve one generic homepage link label
- resolve the deferred site-wide color-contrast token changes
- re-check the reported Brevo stylesheet console issue in production

Do not silently fold these broader tasks into unrelated changes.
