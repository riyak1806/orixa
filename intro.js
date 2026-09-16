/* ==========================================================================
   ORIXA - GAME CINEMATIC INTRO CONTROLLER
   ========================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'orixa_intro_seen';

    document.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('orixa-intro-overlay');
        const skipBtn = document.getElementById('orixa-intro-skip');
        const arrowGroup = document.getElementById('intro-arrow-group');
        const trophyGroup = document.getElementById('intro-trophy-group');
        const logoContainer = document.getElementById('intro-logo-container');
        const pathElement = document.getElementById('adventure-path');

        if (!overlay) {
            return;
        }

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Check if intro was already played in this browser session
        const hasSeenIntro = sessionStorage.getItem(STORAGE_KEY);
        if (hasSeenIntro || prefersReducedMotion) {
            overlay.remove();
            return;
        }

        let isFinished = false;
        let animationFrameId = null;
        const timeouts = [];

        const finishIntro = () => {
            if (isFinished) return;
            isFinished = true;

            // Mark intro as seen in sessionStorage
            try {
                sessionStorage.setItem(STORAGE_KEY, 'true');
            } catch (e) {
                console.warn('Could not save intro state to sessionStorage:', e);
            }

            // Clear registered timeouts
            timeouts.forEach(t => clearTimeout(t));
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            // Smooth fade out transition into existing login page
            overlay.classList.add('is-fading-out');

            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 700);
        };

        if (skipBtn) {
            skipBtn.addEventListener('click', finishIntro);
        }

        // Path geometry calculation for smooth arrow travel
        if (!pathElement || !arrowGroup) {
            finishIntro();
            return;
        }

        const pathLength = pathElement.getTotalLength();
        const duration = 4000; // 4.0s arrow journey (1.0s to 5.0s sequence)
        let startTime = null;

        // Sequence Timing:
        // 0.0s - 1.0s: Landscape opening
        // 1.0s - 5.0s: Arrow travels along path
        // 5.0s - 5.8s: Trophy reveal
        // 5.8s - 6.8s: Logo reveal
        // 6.8s - 7.5s: Transition to existing login page

        const animateArrow = (timestamp) => {
            if (isFinished) return;

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth Easing function (easeInOutCubic)
            const easedProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const point = pathElement.getPointAtLength(easedProgress * pathLength);

            // Calculate angle along path
            const lookAheadPoint = pathElement.getPointAtLength(Math.min((easedProgress + 0.01), 1) * pathLength);
            const angle = Math.atan2(lookAheadPoint.y - point.y, lookAheadPoint.x - point.x) * (180 / Math.PI);

            // Add subtle floating/bobbing up and down motion
            const bobbing = Math.sin(progress * Math.PI * 8) * 4;

            arrowGroup.setAttribute(
                'transform',
                `translate(${point.x}, ${point.y + bobbing}) rotate(${angle})`
            );

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animateArrow);
            }
        };

        // Start 1.0s: Reveal arrow and begin travel
        timeouts.push(setTimeout(() => {
            if (isFinished) return;
            arrowGroup.classList.add('is-visible');
            animationFrameId = requestAnimationFrame(animateArrow);
        }, 1000));

        // 5.0s: Mountain Summit & Trophy Reveal
        timeouts.push(setTimeout(() => {
            if (isFinished) return;
            if (trophyGroup) {
                trophyGroup.classList.add('is-revealed');
            }
        }, 5000));

        // 5.8s: Logo Reveal
        timeouts.push(setTimeout(() => {
            if (isFinished) return;
            if (logoContainer) {
                logoContainer.classList.add('is-revealed');
            }
        }, 5800));

        // 6.8s: Transition to Login Page
        timeouts.push(setTimeout(() => {
            finishIntro();
        }, 6800));
    });
})();
