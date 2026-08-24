/* ============================================================
   COOKIE CONSENT

   Loaded in <head>, at the exact position the Microsoft Clarity
   snippet used to occupy. Runs in two phases:

     1. Immediately (synchronous): read the stored decision and, if
        analytics was accepted, fire the tracker loaders right now —
        so Clarity starts as early as it used to. No DOM access.
     2. On DOMContentLoaded: if there is no valid decision, inject
        and show the banner. Also inject the footer "Cookie settings"
        control and wire up the privacy-page button.

   The gating decision must happen before the tracker loads; the UI
   must not block rendering. That split is the whole design.

   ADDING A TRACKER: add an object to TRACKERS below. Never paste a
   tracker snippet straight into a page <head> — that bypasses
   consent entirely, which is the exact problem this file fixes.
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'tvc-consent';
    var CONSENT_VERSION = 1;
    var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // re-ask after a year

    /* ---------- Tracker registry: trackers are data, not code paths ---------- */

    var TRACKERS = [
        {
            id: 'clarity',
            category: 'analytics',
            cookies: ['_clck', '_clsk'],
            load: function () {
                // The original Clarity IIFE, moved verbatim.
                (function (c, l, a, r, i, t, y) {
                    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
                    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
                })(window, document, "clarity", "script", "x3997ofagn");
            }
        }

        // GA4: uncomment and paste the Measurement ID in both places below.
        // ,{
        //     id: 'ga4',
        //     category: 'analytics',
        //     cookies: ['_ga', '_ga_XXXXXXXXXX'],
        //     load: function () {
        //         var s = document.createElement('script');
        //         s.async = true;
        //         s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        //         document.head.appendChild(s);
        //         window.dataLayer = window.dataLayer || [];
        //         function gtag() { window.dataLayer.push(arguments); }
        //         gtag('js', new Date());
        //         gtag('config', 'G-XXXXXXXXXX');
        //     }
        // }
    ];

    /* ---------- Path prefix ----------
       Pages live at three depths (root, masterminds/, slim/). Derive
       the prefix from this script's own src rather than guessing from
       location.pathname, so it is correct at any hosting root. */

    function scriptPrefix() {
        var src = null;
        if (document.currentScript) {
            src = document.currentScript.getAttribute('src');
        }
        if (!src) {
            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length - 1; i >= 0; i--) {
                var candidate = scripts[i].getAttribute('src');
                if (candidate && candidate.indexOf('consent.js') !== -1) {
                    src = candidate;
                    break;
                }
            }
        }
        if (!src) return '';
        return src.replace(/js\/consent\.js.*$/, '');
    }

    var PREFIX = scriptPrefix();

    /* ---------- Consent record ----------
       localStorage, not a cookie: no server exists to read a cookie,
       and storing the consent record itself is strictly necessary and
       therefore exempt. Every access is wrapped — Safari private mode
       throws. If storage is unavailable, treat it as "no consent" and
       load nothing. */

    function readConsent() {
        var raw;
        try {
            raw = window.localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
        if (!raw) return null;

        var record;
        try {
            record = JSON.parse(raw);
        } catch (err) {
            return null;
        }
        if (!record || record.v !== CONSENT_VERSION) return null;
        if (typeof record.analytics !== 'boolean') return null;
        if (typeof record.ts !== 'number' || (Date.now() - record.ts) > MAX_AGE_MS) return null;
        return record;
    }

    function writeConsent(analytics) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                v: CONSENT_VERSION,
                analytics: analytics,
                ts: Date.now()
            }));
        } catch (err) {
            // Storage unavailable: the choice cannot be remembered, but it is
            // still honoured for this page load.
        }
    }

    /* ---------- Loading and clearing ---------- */

    var loadedThisPage = false;

    function loadCategory(category) {
        for (var i = 0; i < TRACKERS.length; i++) {
            if (TRACKERS[i].category !== category) continue;
            try {
                TRACKERS[i].load();
                loadedThisPage = true;
            } catch (err) {
                // One broken tracker must not take the rest of the page down.
            }
        }
    }

    /* Declining must not merely skip loading: a returning visitor may
       already carry _clck / _clsk from before this shipped. Expire each
       registered cookie across the domain variants a third-party tag
       might have used. */
    function clearTrackerCookies() {
        var host = window.location.hostname;
        var domains = ['', host, '.' + host];

        var parts = host.split('.');
        if (parts.length > 2) {
            var base = parts.slice(-2).join('.');
            domains.push('.' + base);
        }

        for (var i = 0; i < TRACKERS.length; i++) {
            var names = TRACKERS[i].cookies || [];
            for (var n = 0; n < names.length; n++) {
                for (var d = 0; d < domains.length; d++) {
                    var cookie = names[n] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                    if (domains[d]) cookie += '; domain=' + domains[d];
                    try {
                        document.cookie = cookie;
                    } catch (err) {
                        // Nothing to do; keep going through the other variants.
                    }
                }
            }
        }
    }

    /* ---------- Phase 1: gate the trackers, synchronously ---------- */

    var stored = readConsent();
    if (stored && stored.analytics) {
        loadCategory('analytics');
    }

    /* ---------- Phase 2: the UI ---------- */

    var banner = null;
    var detailsPanel = null;
    var moreButton = null;
    var statusLine = null;

    function bannerHTML() {
        return '' +
            '<div class="cookie-banner-inner">' +
                '<div class="cookie-banner-text">' +
                    '<h2 id="cookieBannerTitle">Cookies</h2>' +
                    '<p>We use analytics cookies to see how this site gets used. Nothing is sold or ' +
                    'shared. Read our <a href="' + PREFIX + 'privacy.html#cookies">Privacy Policy</a>.</p>' +
                    '<p class="cookie-banner-status" id="cookieBannerStatus" hidden></p>' +
                '</div>' +

                '<button type="button" class="cookie-banner-more" aria-expanded="false" ' +
                        'aria-controls="cookieDetails">' +
                    'What we collect' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
                         'aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" ' +
                         'd="M19 9l-7 7-7-7"/></svg>' +
                '</button>' +

                '<div class="cookie-banner-details" id="cookieDetails" hidden>' +
                    '<p>Microsoft Clarity shows us which pages get read, where people stop scrolling, ' +
                    'and what they click. It does not capture what you type into forms.</p>' +
                    '<ul>' +
                        '<li><strong>_clck</strong> — Clarity, about 1 year, set only if you accept</li>' +
                        '<li><strong>_clsk</strong> — Clarity, about 1 day, set only if you accept</li>' +
                        '<li><strong>tvc-consent</strong> — this site, about 12 months, remembers your ' +
                        'choice either way</li>' +
                    '</ul>' +
                '</div>' +

                '<div class="cookie-banner-actions">' +
                    '<button type="button" class="cookie-btn cookie-btn--accept"><span>Accept</span></button>' +
                    '<button type="button" class="cookie-btn cookie-btn--decline">Decline</button>' +
                '</div>' +
            '</div>';
    }

    function buildBanner() {
        if (banner) return banner;

        banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.id = 'cookieBanner';
        banner.setAttribute('role', 'dialog');
        // Non-blocking card: no modality, no focus trap, no scrim.
        banner.setAttribute('aria-modal', 'false');
        banner.setAttribute('aria-labelledby', 'cookieBannerTitle');
        banner.hidden = true;
        banner.innerHTML = bannerHTML();

        // Appended last in <body> so it sits late in the tab order.
        document.body.appendChild(banner);

        detailsPanel = banner.querySelector('#cookieDetails');
        moreButton = banner.querySelector('.cookie-banner-more');
        statusLine = banner.querySelector('#cookieBannerStatus');

        moreButton.addEventListener('click', function () {
            var open = moreButton.getAttribute('aria-expanded') === 'true';
            moreButton.setAttribute('aria-expanded', open ? 'false' : 'true');
            detailsPanel.hidden = open;
            // Focus stays on the button: the panel is content, not a new context.
        });

        banner.querySelector('.cookie-btn--accept').addEventListener('click', function () {
            decide(true);
        });
        banner.querySelector('.cookie-btn--decline').addEventListener('click', function () {
            decide(false);
        });

        return banner;
    }

    function showBanner(moveFocus) {
        buildBanner();

        var record = readConsent();
        if (record && statusLine) {
            statusLine.textContent = 'Analytics is currently ' +
                (record.analytics ? 'on' : 'off') + '.';
            statusLine.hidden = false;
        } else if (statusLine) {
            statusLine.hidden = true;
        }

        banner.hidden = false;
        // Two frames: the element has to be laid out before the transform
        // transition has anything to animate from.
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                banner.classList.add('is-visible');
            });
        });

        // Focus is never stolen on first load. It moves only when the
        // visitor opened the banner themselves.
        if (moveFocus) {
            banner.querySelector('.cookie-btn--accept').focus();
        }
    }

    function hideBanner() {
        if (!banner) return;
        banner.classList.remove('is-visible');
        banner.hidden = true;
    }

    function decide(accepted) {
        var wasAccepted = readConsent() ? readConsent().analytics : false;
        writeConsent(accepted);

        if (accepted) {
            if (!loadedThisPage) loadCategory('analytics');
            hideBanner();
            return;
        }

        clearTrackerCookies();
        hideBanner();

        // An injected script cannot be un-injected: if the tracker is
        // already running in this tab, clearing the cookies and reloading
        // is the only honest way to actually stop it.
        if (wasAccepted || loadedThisPage) {
            window.location.reload();
        }
    }

    function injectFooterControl() {
        var list = document.querySelector('.footer-links');
        if (!list) return;

        var item = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'footer-cookie-link';
        button.textContent = 'Cookie settings';
        button.addEventListener('click', function () { showBanner(true); });
        item.appendChild(button);
        list.appendChild(item);
    }

    function wirePrivacyButton() {
        var button = document.getElementById('cookieSettings');
        if (!button) return;
        // Hidden in the markup so a no-JS visitor is not shown a dead control.
        button.hidden = false;
        button.addEventListener('click', function () { showBanner(true); });
    }

    function init() {
        injectFooterControl();
        wirePrivacyButton();
        if (!readConsent()) {
            showBanner(false);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Public surface, so any control anywhere can reopen the banner. */
    window.TVCConsent = {
        open: function () { showBanner(true); }
    };
})();
