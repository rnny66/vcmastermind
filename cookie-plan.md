# Cookie consent banner

**Status:** Legal review of the §5a privacy-policy draft is complete, and pre-launch Clarity baseline metrics (pageviews/sessions per page for a normal week) have been captured. Both prerequisites from the Verification section are satisfied — implementation can proceed.

## Context

The site loads **Microsoft Clarity** (project `x3997ofagn`) as an inline `<script>` in the `<head>` of 13 pages, including the two SLIM landing pages (`slim/slim-en.html`, `slim/slim-nl.html`) added by the recent `slim` branch merge. It fires unconditionally on page load, before the visitor has agreed to anything, and sets the `_clck` / `_clsk` cookies. There is no consent mechanism anywhere in the repo — no `document.cookie`, no `localStorage`, no banner markup or CSS.

The privacy policy already documents the gap. `privacy.html:217`:

> "For site analytics, we rely on our legitimate interest in understanding site usage. We are reviewing our cookie practices to ensure they meet applicable consent requirements for visitors in the EU and UK…"

Under GDPR/ePrivacy, analytics cookies are not "legitimate interest" — they need prior opt-in consent, and declining must be exactly as easy as accepting. `to-do.md` also has an open task to add GA4 by pasting `gtag.js` straight into the `<head>`, which would repeat the same mistake.

**Outcome:** Clarity does not load, and no analytics cookie exists, until the visitor clicks Accept. Declining loads nothing and clears anything already set. The visitor can change their mind later. Adding GA4 later is a one-line registry entry, not another unguarded `<head>` snippet.

### Decisions taken

| | |
|---|---|
| **Shape** | Bottom-**right** corner card, max-width 430px, `position: fixed`. Non-blocking, no scrim, no preferences panel (there is only one non-essential category). Becomes a full-width inset bar on mobile. |
| **Surface** | Cream `#F7F5F0` with a 3px `--color-accent` top edge — the device `.hero-image-overlay` already uses to mark a floating panel. Chosen over a dark-teal card and a white card. |
| **Copy** | Short version: two sentences plus the policy link. |
| **Disclosure** | **Layered notice** — a "What we collect" expander inside the card gives the second layer (vendor, purpose, stored items, durations) without leaving the page. `privacy.html#cookies` remains the third layer and the durable record. |
| **Buttons** | Accept = orange fill + matching border (`.hero-cta--accent`). Decline = borderless, underlined, identical padding and type. |
| **Google Fonts** | Out of scope — deferred to a separate task, logged in `to-do.md` |
| **GA4** | Registry hook built and commented out; enabled later by pasting the Measurement ID into `js/consent.js` |

---

## Architecture

One new file, `js/consent.js`, loaded in the `<head>` at the exact position the Clarity snippet occupies today. It runs in two phases:

1. **Immediately (synchronous, in `<head>`)** — read the stored decision. If analytics was accepted, fire the tracker loaders right now, so Clarity starts as early as it does today. No banner work, no DOM access.
2. **On `DOMContentLoaded`** — if there is no valid decision, inject and show the banner. Also inject the footer "Cookie settings" control and wire up the privacy-page button.

This split is the whole design: the gating decision must happen before the tracker loads, but the UI must not block rendering.

### Tracker registry

Trackers are data, not code paths:

```js
var TRACKERS = [
    {
        id: 'clarity',
        category: 'analytics',
        cookies: ['_clck', '_clsk'],
        load: function () { /* the existing Clarity IIFE, moved verbatim */ }
    }
    // GA4: uncomment and paste the Measurement ID when you have it.
    // { id: 'ga4', category: 'analytics', cookies: ['_ga', '_ga_XXXXXXXXXX'], load: function () { ... } }
];
```

Adding a tracker = adding an object. Nothing else changes.

### Consent record

`localStorage` key `tvc-consent`, value `{"v":1,"analytics":false,"ts":1754352000000}`.

- `localStorage` rather than a cookie: no server exists to read a cookie, and storing the consent record itself is exempt as strictly necessary.
- Re-prompt after **365 days** (compare `ts`), and whenever `v` doesn't match — so adding a new tracker category later can force a fresh ask.
- Every access wrapped in `try/catch`; Safari private mode throws on `localStorage`. If storage is unavailable, treat as "no consent" and load nothing.

### The decline path (the part that's easy to get wrong)

Declining must not just skip loading — a returning visitor may already have `_clck` / `_clsk` from before this ships.

- On decline, expire each registered tracker's cookies on `path=/` for both the bare host and the dot-prefixed domain (`thevccoach.com` and `.thevccoach.com`), plus a no-domain variant.
- **Withdrawing a previous accept triggers `location.reload()`.** An injected script cannot be un-injected — Clarity is already running in that tab. Clearing cookies then reloading is the only honest way to actually stop it. Accepting needs no reload (loaders just fire).

### No-JS behaviour

No JS → no `consent.js` → no trackers, no banner, no footer control. That is the correct outcome, and it matches the site's existing `html.js` gating philosophy in `styles.css:1454-1466`.

---

## Changes

### 1. New: `js/consent.js`

Plain ES5 IIFE with `'use strict'`, matching the style of `js/site.js` — `var`, `Array.prototype.forEach.call`, no dependencies, no build step. Public surface: `window.TVCConsent.open()` so any control can reopen the banner.

Banner markup is injected by JS (not duplicated into 13 HTML files) so the copy lives in one place:

```html
<div class="cookie-banner" id="cookieBanner" role="dialog" aria-modal="false"
     aria-labelledby="cookieBannerTitle" hidden>
  <div class="cookie-banner-inner">
    <div class="cookie-banner-text">
      <h2 id="cookieBannerTitle">Cookies</h2>
      <p>We use analytics cookies to see how this site gets used. Nothing is sold or
         shared. Read our <a href="privacy.html#cookies">Privacy Policy</a>.</p>
    </div>

    <button type="button" class="cookie-banner-more" aria-expanded="false"
            aria-controls="cookieDetails">
      What we collect
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round"
           d="M19 9l-7 7-7-7"/></svg>
    </button>

    <div class="cookie-banner-details" id="cookieDetails" hidden>
      <p>Microsoft Clarity shows us which pages get read, where people stop scrolling,
         and what they click. It does not capture what you type into forms.</p>
      <ul>
        <li><strong>_clck</strong> — Clarity, about 1 year, set only if you accept</li>
        <li><strong>_clsk</strong> — Clarity, about 1 day, set only if you accept</li>
        <li><strong>tvc-consent</strong> — this site, about 12 months, remembers your
            choice either way</li>
      </ul>
    </div>

    <div class="cookie-banner-actions">
      <button type="button" class="cookie-btn cookie-btn--accept"><span>Accept</span></button>
      <button type="button" class="cookie-btn cookie-btn--decline">Decline</button>
    </div>
  </div>
</div>
```

Two details that changed with the corner card: the inner wrapper is its own `.cookie-banner-inner`, **not** `.container` — a 430px card has no use for a 1320px content wrapper. And the policy link is a **deep link to `#cookies`**, the new section added in §5, not the top of the page. Only Accept needs the inner `<span>`; Decline has no sliding overlay to sit above.

Accessibility rules:
- Appended as the **last** element in `<body>` so it sits late in the tab order.
- `aria-modal="false"`, no focus trap, **no focus steal on first load** — hijacking focus on a non-blocking card is hostile.
- When reopened via a "Cookie settings" control, focus **does** move into the banner (user-initiated).
- No Escape handler. Dismissing without choosing isn't a choice; both buttons are one Tab away.
- The expander toggles `hidden` on `#cookieDetails` and flips `aria-expanded` on the button. **Focus stays on the button** — do not move it into the revealed panel; the panel is content, not a new context.
- The policy link stays in the **first** layer, not inside the panel, so the full policy is always one click away regardless of expander state.
- Because the card is anchored at `bottom: 2rem`, expanding grows it **upward**. Accept and Decline don't move, so nothing shifts under the pointer mid-click. Keep it that way.
- The privacy-policy link inside the banner must resolve from subdirectories — compute the prefix from `location.pathname` (`../privacy.html` under `masterminds/`), the same relative-path convention the footers already use.

### 2. New: `css/consent.css` — a standalone, token-driven component

**Not** appended to `styles.css`. The banner gets its own small stylesheet, loaded alongside `consent.js` on every page. This is what makes the nextgen page work (see below) and it costs one extra request for ~2KB.

The rule that makes it portable: **`consent.css` defines no `:root` block and no bare element selectors.** It only defines `.cookie-banner*` / `.cookie-btn*` classes, and it reads colour and font values exclusively from custom properties that *both* stylesheets already define:

`--color-cream`, `--color-sage`, `--color-stone`, `--color-charcoal`, `--color-taupe`, `--color-primary`, `--color-primary-light`, `--color-accent`, `--color-accent-light`, `--font-display`, `--font-body`

Avoid `--color-primary-soft` (only in `styles.css`) and `--fg-on-dark*` / `--border-hairline` (only in the nextgen stylesheet). Stick to the eleven above and the banner renders teal/orange on the main site and mulberry/terracotta on the nextgen page, with no conditional CSS.

- `position: fixed; right: 2rem; bottom: 2rem; left: auto; max-width: 430px; z-index: 1500`. **Fixed, not absolute** — it pins to the browser viewport and is unaffected by scrolling. Both stylesheets use the *same* z-index scale — nav `1000`, mobile-nav `999`, toggle `1001`, skip-link `2000` (`styles.css:32/84/146/182`, `nextgen-womens-capital-circle.css:59/73/80/89`) — so 1500 is the correct gap on both: above an open mobile menu, below skip-to-content.
- `.cookie-banner-inner`: `display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem`. Buttons sit in a row beneath the copy, each `flex: 1 1 0` so they split the card width evenly.
- `background: var(--color-cream)`, `border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)` on all four sides, then `border-top: 3px solid var(--color-accent)` overriding the top edge. `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12)` — the elevation value from `styles.css:661`, slightly deepened since the card floats free of any page edge.
- **No border-radius.** Sharp corners are the brand (`STYLE-GUIDE.md:395`).
- Body copy `0.9rem / weight 300 / var(--color-taupe) / line-height 1.7`; title in `--font-display` at `1.35rem / weight 400`.
- **Accept** echoes `.hero-cta--accent` (`styles.css:370-380`): `background: var(--color-accent)`, matching 1px border, charcoal text, with the sliding `::before` in `var(--color-primary)` running `left: -100%` → `0` over `0.4s`, text going cream on hover. Inner `<span>` at `position: relative; z-index: 1` or the overlay covers the label.
- **Decline** is borderless: transparent background, `border-color: transparent` (keeping the 1px border box from the shared button rule so both buttons stay the same size), `color: var(--color-primary)`, underlined with `text-underline-offset: 3px`. Identical padding, font-size, weight and letter-spacing to Accept.
- Do **not** override `:focus-visible`. Both stylesheets set it globally (`styles.css:22` uses primary, nextgen `:45` uses accent); inheriting means the ring matches each page's palette for free.
- Entrance: `transform: translateY(100%)` → `0`, `0.4s ease`. Neither stylesheet's reduced-motion handling covers a new component (`styles.css:1468-1478` only touches `.fade-in`), so **`consent.css` ships its own `@media (prefers-reduced-motion: reduce)` reset.**
- `@media (max-width: 768px)`: card becomes a full-width inset bar — `left: 1rem; right: 1rem; bottom: 1rem; max-width: none` — with buttons stacked full-width at `min-height: 44px` (matching the `.filter-select` convention at `styles.css:2164`). A 430px card does not fit a 390px screen.
- **`max-height: calc(100vh - 4rem)` with `overflow-y: auto`** on the card itself. Expanded, on a short viewport, the panel would otherwise push the card off the top of the screen. This is the rule that makes the expander safe on a phone.
- **Expander button** echoes `.program-empty-clear` (`styles.css:2321-2331`): `background: none`, no border, `--font-body` at `0.8rem / 500 / 0.08em`, uppercase, `--color-primary`, underlined. Chevron is an inline Heroicons stroke SVG at 16px, rotated `180deg` via `[aria-expanded="true"] svg` with a `0.3s ease` transform.
- **Details panel**: `border-top: 1px solid` the same 22% primary hairline, `padding-top: 1rem`, copy at `0.85rem / weight 300 / --color-taupe`, list items with `<strong>` cookie names. No height animation — show/hide only, which sidesteps reduced-motion handling entirely.
- **No page offset.** Unlike a full-width bar, the card floats over content rather than reserving space, so the `padding-bottom` / `scroll-padding-bottom` treatment in §4b is not needed. The trade-off is that it will sit over the bottom-right of whatever page it's on — check it against the right-aligned Fillout "Pre-Apply" CTAs on the mastermind pages.

**One regulatory note, recorded and not re-litigated:** an orange filled Accept beside an unbordered text Decline is the asymmetry EU regulators examine most closely, and CNIL has fined on this exact pattern. Equal padding and type mitigate it; fill versus no-fill remains a visible weighting. This is a decided, informed choice.

This is a deliberate, documented deviation from the "one shared stylesheet" convention in `CLAUDE.md`. Add a comment at the top of `consent.css` explaining the portability constraint, and a one-line note in `CLAUDE.md`'s file-structure section.

### 3. HTML pages — 13 files

In each, **delete** the inline Clarity block and **replace** it in place with:

```html
<link rel="stylesheet" href="css/consent.css">   <!-- ../css/consent.css under masterminds/ -->
<script src="js/consent.js"></script>            <!-- ../js/consent.js  under masterminds/ -->
```

| File | Clarity block to remove |
|---|---|
| `index.html` | 17–24 |
| `newsletter.html` | 14–21 |
| `newsletter-confirmed.html` | 14–21 |
| `privacy.html` | 14–21 |
| `1-1-coaching.html` | 17–24 |
| `testimonials.html` | 17–24 |
| `testimonials-template.html` | 18–25 |
| `masterminds/masterminds-overview.html` | 17–24 |
| `masterminds/corporate-venture.html` | 17–24 |
| `masterminds/emerging-manager.html` | 17–24 |
| `masterminds/investment-manager.html` | 17–24 |
| `slim/slim-en.html` | 26–33 |
| `slim/slim-nl.html` | 26–33 |

Both SLIM pages sit one level deep (`slim/`), the same depth as `masterminds/`, and both load the shared `../styles.css` (plus their own `slim.css` / `slim-redesign.css` on top) — not a separate `:root`. So they get the same teal/orange banner as the root and `masterminds/` pages, via the same relative-path tags:

```html
<link rel="stylesheet" href="../css/consent.css">
<script src="../js/consent.js"></script>
```

Grep for `clarity.ms` afterwards — the only remaining hit must be inside `js/consent.js`.

### 3b. `masterminds/nextgen-womens-capital-circle.html` — now included

An earlier draft of this plan excluded this page. That was wrong. It's excluded from `styles.css` for a specific, documented reason (`nextgen-womens-capital-circle.css:1-13`: both files define the *same* custom-property names and the same bare selectors with different values, so loading both would recolour one of them) — but that reason **does not apply to a stylesheet that defines neither.** `consent.css` has no `:root` and no bare selectors, so it composes cleanly with either palette.

So this page gets exactly the same two lines as every other page:

```html
<link rel="stylesheet" href="../css/consent.css">
<script src="../js/consent.js"></script>
```

Insert after line 17 (`<link rel="stylesheet" href="nextgen-womens-capital-circle.css">`). The banner will pick up the mulberry/terracotta palette automatically, because it resolves `--color-primary` etc. against whatever `:root` that page defines.

**This page has no Clarity today** — it was built standalone and never got the snippet, so it's currently a blind spot in your analytics. Decided: let the shared registry run there, so on consent it reports like the other eleven. This needs no page-specific code at all; it falls out of `consent.js` being present. Add a verification step confirming a `clarity.ms` request fires from this page after accepting.

Note also that this page duplicates the mobile-menu and scroll-reveal logic inline (lines 510-563) rather than loading `js/site.js`. `consent.js` is deliberately independent of `site.js`, so that duplication doesn't affect it.

**Still excluded, and why:**
- `cvc-mastermind-lili-onepager.html` — standalone print one-pager, no scripts, no Clarity. Sets nothing. (It does load Google Fonts from `fonts.googleapis.com`, same as every other page — see the self-hosting task in `to-do.md`.)
- The five redirect stubs — see the deeplinks section below.

### 4. Footer "Cookie settings" control

Injected by `consent.js` into `.footer-links` as a `<li><button class="footer-cookie-link">Cookie settings</button></li>`, styled to match the surrounding footer links. Clicking calls `TVCConsent.open()`, which shows the banner pre-set to the current choice and moves focus into it.

`document.querySelector('.footer-links')` works unchanged on all 14 pages that get `consent.js` (the 13 in the table above plus the nextgen page) — including the nextgen page, whose footer is structurally different (`.footer-inner` / `.footer-brand` / `.footer-note`) but still has a single `.footer-links` list holding LinkedIn / Book a Discovery Call / Newsletter (`nextgen-womens-capital-circle.html:485`), same as every other page. The Privacy link itself is never inside `.footer-links` on any page — it lives in the separate `.footer-bottom` block next to the copyright line — so "Cookie settings" lands among the other footer links, not beside Privacy. The two SLIM pages follow the identical pattern (`slim-en.html:340`, `slim-nl.html:342`), so no page-specific handling is needed there either.

Alternative considered: hand-editing the footer in all 14 files. Rejected — same copy 14 times, and it drifts.

### 4b. Deeplinks

Deeplinked entry is the normal case here, not the exception, so it gets explicit handling.

**Redirect stubs stay untouched — and that's the correct outcome.** `mastermind.html`, `cvc-mastermind.html`, `im-mastermind.html`, `masterminds/stewardship-circle.html` and `stewardship/female-family-fund.html` are ~13 lines each: a canonical link, `<meta http-equiv="refresh" content="0">`, and `location.replace(target + location.hash)`. They load no fonts, no Clarity, and set nothing. Adding a banner to a page that redirects in 0ms would only produce a flash. They already forward the fragment, so `thevccoach.com/cvc-mastermind.html#pricing` lands on `masterminds/corporate-venture.html#pricing` with the banner shown there.

**Relative paths must resolve from every depth.** This is the one thing a deeplink actually breaks. Pages live at three depths — root, `masterminds/`, `stewardship/` — so `consent.js` must compute its prefix from `location.pathname` for the Privacy Policy link inside the banner (`privacy.html` vs `../privacy.html`), and the `<link>`/`<script>` tags need the right `../` per file. Someone arriving cold on `masterminds/emerging-manager.html` is the first person to hit a broken link here, and they arrive before ever seeing the homepage.

**The card overlaps content rather than displacing it.** This was a full-width bar in an earlier draft, which needed `padding-bottom` and `scroll-padding-bottom` on `<body>` so anchor targets and the footer stayed clear. **The corner card drops both rules** — it occupies only the bottom-right ~430×200px and reserving a full-width strip for it would be wrong.

The residual risk moves from "content hidden behind the bar" to "card lands on a specific control". Three places to check, because each puts something important bottom-right (or, for SLIM, has no fixed/sticky element at all, which is worth confirming rather than assuming):
- `masterminds/corporate-venture.html#apply` and the other three mastermind pages — the Fillout "Pre-Apply" CTAs sit right of centre.
- The nextgen page's `#access` target, which is what its nav CTA points at.
- `slim/slim-en.html#eligibility` and `slim/slim-nl.html#eligibility` — neither `slim.css` nor `slim-redesign.css` defines any `position: fixed` or `sticky` element, so there's no known collision, but the eligibility-check section should still be scrolled past with the card open since it's the page's primary CTA.

If either collides, the fix is to move the card to the **left** corner rather than to reintroduce page padding.

**The decision is origin-wide.** `localStorage` is per-origin, so a visitor who lands deep on a mastermind page, chooses, then browses to `newsletter.html` is not asked twice. Nothing extra to build — worth stating because it's the main reason not to scope consent per-page.

**Known limitation, worth being explicit about:** for a visitor who declines *or simply ignores the card*, Clarity never loads, so nothing about that visit is recorded — no pageview, no scroll depth, no session recording, and no `utm_*` attribution from the deeplink you shared. Today you see every one of those visits. That is the intended trade-off, not a bug to work around, and it applies to any compliant implementation.

**Do this before deploying:** note your current Clarity pageview and session counts for a normal week, per page. The drop after launch is immediate and permanent, and without a baseline you cannot tell "the banner is working as designed" apart from "traffic fell." Published accept rates for a plain two-button bar vary too widely by audience to predict yours — measure it rather than assume it.

### 5. `privacy.html` — content updates

**Yes, the policy has to change, and the short banner copy makes it load-bearing rather than merely tidy.**

GDPR Art. 4(11) and Recital 32 require consent to be *informed*; ePrivacy Art. 5(3) requires "clear and comprehensive information" before storage. The card's first layer is two sentences, and the expander covers vendor, purpose and durations — but legal basis, third parties, retention and your GDPR rights all still live in the policy. `privacy.html#cookies` is the durable record and the third layer of the notice.

**Keep the expander and this section in sync.** The panel is a summary *of* this section. If a cookie name, duration or vendor changes in one place and not the other, the notice contradicts itself — which is worse than either version alone. Treat them as one edit.

Concretely:

- **New section, `id="cookies"`**, inserted after "What we collect", with a matching TOC entry at `privacy.html:179-194`. The `id` must be exactly `cookies` — the banner deep-links to it. It has to carry, at minimum:
  - **Who:** Microsoft Clarity, operated by Microsoft, with a link to Microsoft's privacy statement.
  - **What for:** page views, clicks, scroll behaviour and anonymised session recordings.
  - **What is stored, and for how long** — as a `<ul>` with `<strong>` names, **not a `<table>`**; there is no table styling in `styles.css` and a table would reintroduce the horizontal-overflow problem fixed in the last commit:
    - `_clck` — Microsoft Clarity, ~1 year, analytics, set only after you accept
    - `_clsk` — Microsoft Clarity, ~1 day, analytics, set only after you accept
    - `tvc-consent` — first-party browser storage, ~12 months, records your choice, strictly necessary and set regardless
  - **That it is off by default** and nothing analytics-related loads until Accept is clicked.
  - **How to change your mind** — the Cookie settings control, and what declining does (clears the Clarity cookies and reloads).
  - **That declining costs the visitor nothing** — the site behaves identically either way.
- **Update "What we collect"** (`privacy.html:203`). It currently states Clarity "may set cookies and record anonymized session data" with no mention of consent. It has to say this happens only after the visitor accepts.
- **Rewrite the second paragraph of "Legal basis"** (`privacy.html:217`): analytics now runs on **consent** (Art. 6(1)(a)), off by default, withdrawable at any time. The "we are reviewing our cookie practices to ensure they meet applicable consent requirements" admission goes away — that sentence is the main reason this work exists, and leaving it in after shipping would be worse than never having written it.
- **Extend "Third parties"** (`privacy.html:219-224`) with **Google Fonts** (currently undisclosed and still loading from Google's CDN — see the deferred task; disclose it honestly as loading on every page regardless of consent), **Calendly**, and **Fillout**. All three are used today and none are listed.
- **Disclose the Brevo form assets as strictly necessary.** `newsletter.html` loads CSS and JS from `sibforms.com` without consent. That is defensible — they render the form the visitor came for — but it should be stated rather than left silent, so the "nothing loads before consent" claim isn't overbroad.
- Add a `<button id="cookieSettings" hidden>Cookie settings</button>` in the new section; `consent.js` unhides it. Hidden by default so a no-JS visitor isn't shown a dead control.
- Bump **Last updated** (`privacy.html:175`) to the deploy date.

**Sequencing:** the policy section must be live *before or with* the banner, never after. A banner that links to a `#cookies` anchor that doesn't exist yet is worse than no banner — it advertises information that isn't there. Ship §3 and §5 in the same commit.

### 5a. Draft copy for `privacy.html`

Written to the brand voice in `CLAUDE.md` — direct, plain, no hedging. Edit freely; this is a starting point, not finished legal text. **Have someone qualified read it before it goes live** — this plan is engineering work, not legal advice.

**TOC** (`privacy.html:179-194`) — insert as item 3, renumbering the rest:

```html
<li><a href="#cookies">Cookies and similar technologies</a></li>
```

**Replace the "Site analytics" bullet** at `privacy.html:203`:

```html
<li><strong>Site analytics — only if you accept.</strong> We use Microsoft Clarity to
understand how visitors use this site: page views, clicks, and scroll behaviour. It sets
cookies and records anonymised session data, but only after you accept analytics cookies.
It does not collect the contents of forms unless masking is disabled, which we have not
done. See <a href="#cookies">Cookies and similar technologies</a> for the detail.</li>
```

**New section**, after "What we collect":

```html
<h2 id="cookies">Cookies and similar technologies</h2>

<p>We use one analytics tool on this site, and it does not run until you say yes.</p>

<p>The first time you visit, we ask whether you accept analytics cookies. Nothing
analytics-related loads before you answer. If you decline, we clear anything that was
set previously and load nothing further. The site works exactly the same either way —
declining costs you nothing.</p>

<h3>What we use</h3>
<p><strong>Microsoft Clarity</strong> shows us how people use this site: which pages get
read, where visitors stop scrolling, what they click. It records anonymised session data
and does not capture what you type into forms. See
<a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank"
rel="noopener noreferrer">Microsoft's privacy statement<span class="sr-only"> (opens in a
new tab)</span></a>.</p>

<h3>What gets stored, and for how long</h3>
<ul>
  <li><strong>_clck</strong> — Microsoft Clarity. About 1 year. Set only if you accept.</li>
  <li><strong>_clsk</strong> — Microsoft Clarity. About 1 day. Set only if you accept.</li>
  <li><strong>tvc-consent</strong> — stored by this site in your browser. About 12 months.
  Records whether you accepted or declined so we don't ask again on every page. This one
  is stored either way: we cannot remember your choice without it.</li>
</ul>

<h3>Changing your mind</h3>
<p>Use Cookie settings in the footer of any page. Accepting starts analytics straight
away. Declining clears the Clarity cookies and reloads the page, so nothing keeps
running in the background.</p>
<button type="button" id="cookieSettings" hidden>Cookie settings</button>

<h3>What loads regardless</h3>
<p>Two things load without asking, because they are needed for the page to work rather
than to track you:</p>
<ul>
  <li><strong>Google Fonts.</strong> Our typefaces load from Google's servers, which
  means Google receives your IP address. We are working on hosting them ourselves.</li>
  <li><strong>Brevo form assets.</strong> On the newsletter page, the sign-up form's
  styles and script load from Brevo. Without them there is no form.</li>
</ul>
```

**Replace the second paragraph of "Legal basis"** at `privacy.html:217`:

```html
<p>For site analytics, our legal basis is your <strong>consent</strong> (Article
6(1)(a)). Analytics is off by default: nothing loads until you accept, and you can
withdraw at any time using Cookie settings in the footer, which takes effect
immediately. See <a href="#cookies">Cookies and similar technologies</a> above.</p>
```

**Add to "Third parties"** at `privacy.html:219-224`:

```html
<li><strong>Google Fonts</strong> (Google Ireland Limited) serves the typefaces used
across this site. Because the files load from Google's servers, Google receives your IP
address on every page. This happens regardless of your cookie choice; we are working on
hosting the fonts ourselves to remove it.</li>
<li><strong>Calendly</strong> (Calendly LLC, United States) handles coaching call
bookings. Nothing is shared with Calendly unless you click through to book, at which
point their own privacy policy applies.</li>
<li><strong>Fillout</strong> (Fillout Inc., United States) hosts our mastermind
application forms. Nothing is shared with Fillout unless you click through to apply.</li>
```

Then bump **Last updated** at `privacy.html:175`.

### 6. `to-do.md` — rewrite

- Replace the GA4 instructions: no longer "paste `gtag.js` into `<head>`" but "uncomment the `ga4` entry in `js/consent.js` and paste the Measurement ID". Add a bold warning that adding any tracker directly to `<head>` bypasses consent.
- Add a new task: self-host Cormorant Garamond + Outfit to remove the pre-consent IP transfer to Google. Note that the `@font-face` rules need to land in **both** `styles.css` and `masterminds/nextgen-womens-capital-circle.css`, since the two stylesheets are never loaded together — and that the `fonts.googleapis.com` links come out of all 14 `consent.js` pages (the SLIM pages load fonts via the shared `styles.css` rule, not a page-specific one, so no extra `@font-face` location) plus the one-pager, which also loads Google Fonts despite having no scripts and no Clarity.

---

## Verification

Serve locally (`python -m http.server` from the repo root) and use a fresh incognito window for each run.

**Default state — nothing loads**
1. Open `index.html`. DevTools → Network, filter `clarity` → **zero requests**.
2. Application → Cookies → **no `_clck` / `_clsk`**. Local Storage → **no `tvc-consent`**.
3. The card is visible in the bottom-right corner, cream with a 3px orange top edge.
3b. Scroll the page. The card must **not move** — `fixed`, not `absolute`. This is the single easiest thing to get wrong.
3c. Click "What we collect". The panel opens, the chevron rotates, `aria-expanded` flips to `true`, focus stays on the button, and Accept/Decline do **not** shift position. Click again to collapse.
3d. Expand the panel at 375×600 and at 375×480 (a small phone in landscape). The card must stay fully on screen and scroll internally rather than running off the top — this is what `max-height: calc(100vh - 4rem)` is for.

**Accept**
4. Click Accept → a `clarity.ms/tag/x3997ofagn` request appears (200), `_clck` / `_clsk` get set, banner disappears.
5. Reload → banner stays hidden, Clarity loads immediately, no flash of the banner.

**Decline**
6. Clear storage, reload, click Decline → still zero `clarity` requests, no cookies, `tvc-consent` shows `analytics: false`.
7. Reload → banner stays hidden, still nothing loads.

**Withdrawal (the important one)**
8. Accept, confirm `_clck` exists, then footer → Cookie settings → Decline. Page reloads, `_clck` and `_clsk` are **gone**, no `clarity` request on the reloaded page.

**Deeplinks — enter cold, never via the homepage**
9. Open `masterminds/corporate-venture.html` directly in a fresh window. Confirm `../css/consent.css` and `../js/consent.js` both return 200, the card is styled (not unstyled text), and its Privacy Policy link resolves to `../privacy.html#cookies` **and actually scrolls to that section** — a deep link to a missing anchor fails silently at the top of the page.
10. Open `cvc-mastermind.html#pricing` → confirm it lands on `masterminds/corporate-venture.html#pricing`, the fragment survives the redirect, and the banner appears on arrival with no flash on the stub itself.
11. With the card showing, open `masterminds/corporate-venture.html#apply`, then the equivalent on the other three mastermind pages, then the nextgen page's `#access`, then `slim/slim-en.html#eligibility`. The card must not land on top of a Fillout "Pre-Apply" button, the SLIM eligibility section, or any other right-aligned control. Scroll to the footer on each and confirm nothing important sits permanently underneath it.
12. Confirm a decision made on `index.html` is respected on `newsletter.html` and on `slim/slim-en.html` (same origin, same `localStorage`).

**Nextgen page — the palette test**
13. Open `masterminds/nextgen-womens-capital-circle.html` cold. The banner must render in **mulberry/terracotta**, not teal/orange — that proves the token-driven CSS is resolving against the page's own `:root`.
14. Confirm the page itself is visually unchanged: the mulberry nav, terracotta eyebrows and warm cream background must all be exactly as before. Any teal anywhere means `consent.css` is leaking a `:root` or a bare selector and must be fixed.
15. Confirm the Cookie settings control lands in the `.footer-links` list (LinkedIn / Book a Discovery Call / Newsletter), not in the separate `.footer-bottom` block that holds Privacy and the copyright line — that's true on every page, nextgen included, not just this one.
16. Check the banner sits above that page's own sticky nav and mobile overlay — it uses the same z-index scale (1000/999), so 1500 should win.
16b. Accept on this page and confirm a `clarity.ms/tag/x3997ofagn` request fires. This page reported nothing before, so this is a new data source, not a regression check.

**SLIM pages**
16c. Open `slim/slim-en.html` and `slim/slim-nl.html` cold. Both load `../styles.css`, so the banner renders teal/orange like the root pages — no separate palette test needed, but confirm `slim.css` / `slim-redesign.css` don't visibly clash with the card (they define no `:root` or bare selectors that would conflict).
16d. Accept on `slim-en.html`, confirm `clarity.ms/tag/x3997ofagn` fires — these two pages had Clarity firing unconditionally before this change, so this is a real behavior change to confirm, not just a smoke test.

**Regression**
17. `newsletter.html` — the Brevo form still renders and submits. Its `sibforms.com` assets are intentionally left ungated (strictly necessary: they are the form the visitor came for).
18. `testimonials.html` and `masterminds-overview.html` — their page-local filter scripts still work alongside the banner.
19. Mobile menu still opens on both `styles.css` pages, the two SLIM pages, and the nextgen page, and the banner sits **above** the open overlay (z-index 1500 vs 999).
19b. `slim/slim-en.html#eligibility` and the `slim-nl.html` equivalent — the eligibility-check interaction still works with the banner present.

**Accessibility / responsive**
20. Keyboard only: Tab reaches Accept and Decline; the global focus ring is visible on both; focus is **not** stolen on first page load, but **is** moved into the banner when reopened from the footer.
21. Resize to 768px and 375px — buttons stack full-width, tap targets ≥44px, no horizontal page scroll. Check the nextgen page too; it has `.sc-root { overflow-x: hidden }`, which can mask an overflow that would show elsewhere.
22. Enable "Emulate `prefers-reduced-motion: reduce`" in DevTools Rendering → banner appears without the slide.
23. Optional: run an accessibility audit on `index.html` with the banner shown.

**Privacy policy — the consent depends on it**
P0. Expand "What we collect" in the card and read it side by side with the `#cookies` section. Cookie names, durations and the vendor must match exactly.
P1. `privacy.html#cookies` exists, appears in the TOC, and the anchor actually scrolls there.
P2. The section names Microsoft Clarity, lists `_clck` / `_clsk` / `tvc-consent` with durations, states analytics is off until Accept, and explains how to withdraw. Read it as a visitor who has seen only the two-sentence card — everything the card omits should be here.
P3. The "we are reviewing our cookie practices" sentence at `privacy.html:217` is gone.
P4. Google Fonts, Calendly and Fillout appear under Third parties; the Brevo form assets are disclosed as strictly necessary.
P5. The Cookie settings button on the page unhides with JS and opens the card; with JS disabled it stays hidden rather than sitting there dead.
P6. **Last updated** reflects the deploy date.

**Final sweep**
24. `grep -r "clarity.ms" --include=*.html .` returns nothing.
25. `grep -rn ":root\|^\s*body\s*{\|^\s*nav\s*{" css/consent.css` returns nothing — the portability guarantee, checked mechanically.
