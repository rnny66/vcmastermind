/* Lightweight testimonial video player.
   Three controls only: play/pause, skip forward, mute.

   Progressive enhancement: the markup ships with a real `controls` attribute
   and the custom UI marked `hidden`. This script swaps them the other way
   round, so a visitor without JavaScript still gets native browser controls
   instead of a dead poster image.

   Videos are self-hosted, so nothing here touches the consent gate in
   js/consent.js -- there is no third party to gate. */
(function () {
    'use strict';

    var SKIP_SECONDS = 10;
    var BAR_IDLE_MS = 2500;
    // Slider resolution. 1000 steps over a 4-minute clip lands within ~0.3s.
    var SCRUB_STEPS = 1000;

    var players = document.querySelectorAll('[data-video]');
    if (!players.length) return;

    var videos = [];

    function setup(root) {
        var video = root.querySelector('.t-video-el');
        var bigPlay = root.querySelector('[data-video-play]');
        var bar = root.querySelector('[data-video-controls]');
        if (!video || !bigPlay || !bar) return;

        var toggleBtn = bar.querySelector('[data-video-toggle]');
        var skipBtn = bar.querySelector('[data-video-skip]');
        var muteBtn = bar.querySelector('[data-video-mute]');
        var scrub = bar.querySelector('[data-video-scrub]');
        var timeEl = bar.querySelector('[data-video-time]');
        if (!toggleBtn || !skipBtn || !muteBtn || !scrub) return;

        var label = root.getAttribute('data-video-label') || 'video';
        var hideTimer = null;
        // preload="none" means duration is unknown until playback starts, so
        // show the value already written into the markup until it is.
        var durationBadge = root.querySelector('.t-duration');
        var fallbackDuration = durationBadge ? durationBadge.textContent.trim() : '0:00';

        // Hand control over to the custom UI now that we know JS runs.
        video.removeAttribute('controls');
        bigPlay.hidden = false;
        bar.hidden = false;

        videos.push(video);

        function cancelHide() {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
        }

        // The bar stays put whenever the video is paused; it only fades while
        // playing, so a paused video never hides its own way back.
        function showBar() {
            root.classList.remove('is-bar-hidden');
            cancelHide();
            if (!video.paused && !video.ended) {
                hideTimer = setTimeout(function () {
                    root.classList.add('is-bar-hidden');
                }, BAR_IDLE_MS);
            }
        }

        // The icons are <svg>, and the `hidden` IDL property lives on
        // HTMLElement, not SVGElement -- assigning `.hidden` on them would only
        // set a JS expando and never touch the attribute the CSS matches on.
        function showIcon(el, shown) {
            el.toggleAttribute('hidden', !shown);
        }

        // While the thumb is being dragged the input owns the position;
        // timeupdate must not fight it back to where playback actually is.
        var scrubbing = false;

        function clockText(seconds) {
            if (!isFinite(seconds)) return '0:00';
            var mins = Math.floor(seconds / 60);
            var secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        function syncScrub() {
            var duration = video.duration;
            var known = isFinite(duration) && duration > 0;
            scrub.disabled = !known;

            var fraction = known ? video.currentTime / duration : 0;
            if (!scrubbing) scrub.value = String(Math.round(fraction * SCRUB_STEPS));
            // The filled portion is painted as a gradient stop, which is the
            // one fill technique that behaves the same in every engine.
            scrub.style.setProperty('--t-progress', (fraction * 100) + '%');

            var elapsed = clockText(video.currentTime);
            var total = known ? clockText(duration) : fallbackDuration;
            if (timeEl) timeEl.textContent = elapsed + ' / ' + total;
            // Without this a screen reader announces the raw 0-1000 step number.
            scrub.setAttribute('aria-valuetext', elapsed + ' of ' + total);
        }

        function seekTo(seconds) {
            if (!isFinite(video.duration)) return;
            video.currentTime = Math.min(Math.max(seconds, 0), video.duration);
            syncScrub();
        }

        function syncToggle() {
            var playing = !video.paused && !video.ended;
            toggleBtn.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + label);
            showIcon(toggleBtn.querySelector('[data-icon-play]'), !playing);
            showIcon(toggleBtn.querySelector('[data-icon-pause]'), playing);
        }

        function syncMute() {
            muteBtn.setAttribute('aria-pressed', video.muted ? 'true' : 'false');
            muteBtn.setAttribute('aria-label', video.muted ? 'Unmute ' + label : 'Mute ' + label);
            showIcon(muteBtn.querySelector('[data-icon-sound]'), !video.muted);
            showIcon(muteBtn.querySelector('[data-icon-muted]'), video.muted);
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                video.play();
            } else {
                video.pause();
            }
        }

        bigPlay.addEventListener('click', function () {
            video.play();
        });

        toggleBtn.addEventListener('click', togglePlay);

        scrub.addEventListener('input', function () {
            if (!isFinite(video.duration)) return;
            video.currentTime = (Number(scrub.value) / SCRUB_STEPS) * video.duration;
            syncScrub();
            showBar();
        });

        // Pointer and keyboard drags both need the guard; either ends on change.
        scrub.addEventListener('pointerdown', function () { scrubbing = true; });
        scrub.addEventListener('keydown', function () { scrubbing = true; });
        scrub.addEventListener('change', function () { scrubbing = false; });
        window.addEventListener('pointerup', function () { scrubbing = false; });

        video.addEventListener('timeupdate', syncScrub);
        video.addEventListener('loadedmetadata', syncScrub);
        video.addEventListener('seeked', syncScrub);

        skipBtn.addEventListener('click', function () {
            // duration is NaN until metadata arrives; skipping before then is a no-op.
            seekTo(video.currentTime + SKIP_SECONDS);
            showBar();
        });

        function toggleMute() {
            video.muted = !video.muted;
            // volumechange is async, so sync here too and keep the listener
            // below only as a net for changes made elsewhere.
            syncMute();
        }

        muteBtn.addEventListener('click', function () {
            toggleMute();
            showBar();
        });

        video.addEventListener('play', function () {
            root.classList.add('is-playing');
            // Two testimonials talking over each other helps nobody.
            for (var i = 0; i < videos.length; i++) {
                if (videos[i] !== video) videos[i].pause();
            }
            syncToggle();
            showBar();
        });

        video.addEventListener('pause', function () {
            syncToggle();
            showBar();
        });

        video.addEventListener('volumechange', syncMute);

        video.addEventListener('ended', function () {
            // preload="none" means load() costs no network here; it restores the
            // poster frame so the card reads as replayable rather than frozen.
            root.classList.remove('is-playing', 'is-bar-hidden');
            cancelHide();
            video.load();
            syncToggle();
            syncScrub();
        });

        // Clicking the picture itself is the one gesture people try without
        // being told. The overlay button owns the idle state, so this only
        // applies once playback has started.
        video.addEventListener('click', function () {
            if (root.classList.contains('is-playing')) togglePlay();
        });

        root.addEventListener('pointermove', showBar);
        root.addEventListener('focusin', showBar);

        root.addEventListener('keydown', function (e) {
            // Buttons already handle Space/Enter themselves; don't act twice.
            var onButton = e.target.closest && e.target.closest('button');
            // Arrow keys belong to the slider while it holds focus -- taking
            // them would break the one control people expect to work that way.
            var onScrub = e.target === scrub;

            if ((e.key === ' ' || e.key === 'k' || e.key === 'K') && !onButton) {
                e.preventDefault();
                togglePlay();
            } else if (e.key === 'm' || e.key === 'M') {
                toggleMute();
            } else if ((e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') && !onScrub) {
                e.preventDefault();
                seekTo(video.currentTime + SKIP_SECONDS);
            } else if ((e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') && !onScrub) {
                e.preventDefault();
                seekTo(video.currentTime - SKIP_SECONDS);
            } else {
                return;
            }
            showBar();
        });

        syncToggle();
        syncMute();
        syncScrub();
    }

    Array.prototype.forEach.call(players, setup);
})();
