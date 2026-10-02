(function () {
    'use strict';

    // Mobile navigation: button-driven, keyboard accessible.
    var menuToggle = document.querySelector('.mobile-menu-toggle');
    var mobileNav = document.getElementById('mobileNav');

    function openMobileMenu() {
        mobileNav.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            if (mobileNav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        Array.prototype.forEach.call(mobileNav.querySelectorAll('a'), function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileMenu();
                menuToggle.focus();
            }
        });
    }

    // Scroll-reveal: content is visible by default (see html.js gating in styles.css);
    // this only adds the reveal-on-scroll behavior on top of that baseline.
    var fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length) {
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            Array.prototype.forEach.call(fadeElements, function (el) { observer.observe(el); });
        } else {
            Array.prototype.forEach.call(fadeElements, function (el) { el.classList.add('visible'); });
        }
    }

    // Smooth scroll for same-page anchors only; missing targets fall through
    // to normal browser handling instead of silently doing nothing.
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            var target;
            try {
                target = document.querySelector(href);
            } catch (err) {
                return;
            }
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Move keyboard focus to the target so skip links and in-page nav
            // actually advance the tab order, not just the scroll position.
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
        });
    });
})();
