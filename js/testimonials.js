(function () {
    'use strict';

    var grid = document.querySelector('[data-proof-grid]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-testimonial]'));
    var ctaCard = document.querySelector('.testimonial-cta-card');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var status = document.getElementById('testimonial-filter-status');
    var dialog = document.getElementById('testimonial-dialog');
    var dialogTitle = document.getElementById('testimonial-dialog-title');
    var dialogEyebrow = document.getElementById('testimonial-dialog-eyebrow');
    var dialogRole = document.getElementById('testimonial-dialog-role');
    var dialogIntro = document.getElementById('testimonial-dialog-intro');
    var dialogPortrait = document.getElementById('testimonial-dialog-portrait');
    var dialogPortraitImage = document.getElementById('testimonial-dialog-portrait-image');
    var dialogContent = document.getElementById('testimonial-dialog-content');
    var closeButton = dialog.querySelector('[data-close-dialog]');
    var dialogVideo = document.getElementById('testimonial-dialog-video');
    var lastTrigger = null;
    var closeTimer = null;

    function setFilter(filter) {
        var visible = 0;
        var revealQueue = [];

        filters.forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
        });

        cards.forEach(function (card) {
            var matches = filter === 'all' || card.dataset.category === filter;
            card.hidden = !matches;
            if (matches) {
                visible += 1;
                revealQueue.push(card);
            }
        });

        grid.dataset.view = filter;
        status.textContent = 'Showing ' + visible + ' testimonial' + (visible === 1 ? '' : 's') + (filter === 'all' ? '' : ' for ' + (filter === 'one-to-one' ? '1:1 coaching' : 'Mastermind'));

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            revealQueue.push(ctaCard);
            revealQueue.forEach(function (card) {
                card.classList.remove('is-filter-entering');
            });
            void grid.offsetWidth;
            revealQueue.forEach(function (card, index) {
                card.style.setProperty('--testimonial-enter-delay', (index * 38) + 'ms');
                card.classList.add('is-filter-entering');
            });
        }
    }

    cards.concat(ctaCard).forEach(function (card) {
        card.addEventListener('animationend', function (event) {
            if (event.animationName === 'proof-card-enter') {
                card.classList.remove('is-filter-entering');
                card.style.removeProperty('--testimonial-enter-delay');
            }
        });
    });

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            setFilter(button.dataset.filter);
        });
    });

    function resetVideo() {
        dialogVideo.pause();
        dialogVideo.removeAttribute('src');
        dialogVideo.removeAttribute('poster');
        dialogVideo.load();
    }

    function openDialog(trigger) {
        var card = trigger.closest('[data-testimonial]');
        var videoMode = card.dataset.kind === 'video';
        var contentTemplate = card.querySelector('[data-dialog-content]');
        var cardPortrait = card.querySelector('.testimonial-avatar img');
        lastTrigger = trigger;
        resetVideo();
        dialog.dataset.mode = videoMode ? 'video' : 'story';
        dialogEyebrow.textContent = card.dataset.program + (videoMode ? ' · Video testimonial' : ' · Client story');
        dialogTitle.textContent = card.dataset.label;
        dialogRole.textContent = card.dataset.role || '';
        dialogIntro.classList.toggle('has-portrait', Boolean(cardPortrait));
        dialogPortrait.hidden = !cardPortrait;
        if (cardPortrait) {
            dialogPortraitImage.src = cardPortrait.getAttribute('src');
            dialogPortraitImage.alt = cardPortrait.getAttribute('alt') || card.dataset.label;
        } else {
            dialogPortraitImage.removeAttribute('src');
            dialogPortraitImage.alt = '';
        }
        dialogContent.replaceChildren();
        if (contentTemplate) {
            dialogContent.appendChild(contentTemplate.content.cloneNode(true));
        }
        if (videoMode) {
            dialogVideo.poster = card.dataset.videoPoster;
            dialogVideo.src = card.dataset.videoSrc;
        }
        dialog.showModal();
        dialogTitle.focus();
        if (videoMode) {
            dialogVideo.play().catch(function () {
                /* Some browsers prefer a second explicit play gesture.
                   Native controls remain available in that case. */
            });
        }
    }

    document.querySelectorAll('[data-open-testimonial]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            openDialog(trigger);
        });

        trigger.addEventListener('keydown', function (event) {
            if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                event.preventDefault();
                openDialog(trigger);
            }
        });
    });

    function finishClose() {
        dialog.classList.remove('is-closing');
        resetVideo();
        if (dialog.open) dialog.close();
    }

    function closeDialog() {
        if (!dialog.open || dialog.classList.contains('is-closing')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finishClose();
            return;
        }
        dialog.classList.add('is-closing');
        closeTimer = window.setTimeout(finishClose, 160);
    }

    closeButton.addEventListener('click', closeDialog);

    dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeDialog();
    });

    dialog.addEventListener('click', function (event) {
        var rect = dialog.getBoundingClientRect();
        var outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) closeDialog();
    });

    dialog.addEventListener('close', function () {
        var restoreTarget = lastTrigger;
        if (closeTimer) window.clearTimeout(closeTimer);
        closeTimer = null;
        dialog.classList.remove('is-closing');
        resetVideo();
        lastTrigger = null;
        if (restoreTarget && document.contains(restoreTarget)) {
            window.setTimeout(function () { restoreTarget.focus(); }, 0);
        }
    });

})();
