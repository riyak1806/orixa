/* ==========================================================================
   ORIXA AUDIO: one shared sound system for every page

   - All sounds are generated with the Web Audio API: no audio files, no external URLs.
   - One singleton (window.OrixaAudio). Loading this file twice, or revisiting a page, never adds a
     second set of listeners.
   - Browsers keep an AudioContext suspended until the person interacts with the page, so nothing is
     played "on load": sounds wait for the first tap, click or key press.
   - A sound that cannot play never throws and never blocks login, quizzes, scoring or navigation.
   - There is no background music: no licensed or original music asset exists in this project, so music
     is intentionally not implemented (see EVENT MAP below).

   EVENT MAP (sound name -> where it is triggered)
     click          any trusted click on a button / link / checkbox (suppressed when a specific sound plays)
     select         role-card / navigation links; match-the-pair selecting a card
     open / close   a dialog opening or closing (watched centrally, see observeDialogs)
     welcome        the first interaction on a role-selection or login page of this browser tab
     loginSuccess   login handlers, once the account and role are confirmed, before the redirect
     loginFail      login handlers, when authentication is refused
     logout         the logout confirmation, before the redirect
     error          a form field error or error message appears
     success        a form message turns to success
     gameStart      START GAME buttons of the four games
     tileFlip       tile puzzle: a tile is picked
     tileReveal     tile puzzle: a solved tile is removed and the picture shows
     correct        tile puzzle / fill in the blanks / true or false: a correct answer
     wrong          the same games: a wrong answer (also the "chance used" cue)
     match          match the pair: a correct pair
     drag / drop    fill in the blanks: picking up an option / placing it in the blank
     next           moving to the next question
     victory        a quiz is completed (playVictory also schedules the star sounds and a results chime)
     star           one per star actually awarded, timed to the star animation
     results        short chime after the stars
     achievement    a badge was newly unlocked (student-achievements.js, only unlocks the database just made)
     trophy         a trophy was newly unlocked
   ========================================================================== */
(function () {
    'use strict';
    if (window.OrixaAudio) return;

    const STORAGE_KEY = 'orixa.audio.v1';
    const DEFAULTS = Object.freeze({ sfx: true, volume: 0.6 });

    /* ------------------------------ settings ------------------------------ */

    function readSettings() {
        const s = { sfx: DEFAULTS.sfx, volume: DEFAULTS.volume };
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return s;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.sfx === 'boolean') s.sfx = parsed.sfx;
            if (parsed && typeof parsed.volume === 'number' && isFinite(parsed.volume)) {
                s.volume = Math.min(1, Math.max(0, parsed.volume));
            }
        } catch (e) { /* storage blocked or corrupt: use defaults */ }
        return s;
    }

    let settings = readSettings();
    const subscribers = new Set();

    function saveSettings() {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
        applyVolume();
        subscribers.forEach(fn => { try { fn(Object.assign({}, settings)); } catch (e) { /* ignore */ } });
    }

    /* ------------------------------ audio graph ------------------------------ */

    let ctx = null;
    let master = null;
    let noiseBuffer = null;
    let failed = false;               // the browser has no usable Web Audio
    let activeVoices = 0;
    let pendingWelcome = false;
    let lastSpecificAt = 0;
    let victoryBusyUntil = 0;
    let victoryTimers = [];
    let lastVictoryAt = 0;
    const lastPlayed = Object.create(null);

    function ensureContext() {
        if (ctx || failed) return ctx;
        try {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) { failed = true; return null; }
            ctx = new Ctor();
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -16;
            comp.ratio.value = 6;
            master = ctx.createGain();
            master.connect(comp);
            comp.connect(ctx.destination);
            applyVolume();
        } catch (e) {
            failed = true;
            ctx = null;
        }
        return ctx;
    }

    function applyVolume() {
        if (master) master.gain.value = settings.volume * 1.4;
    }

    function getNoise() {
        if (noiseBuffer || !ctx) return noiseBuffer;
        const length = Math.floor(ctx.sampleRate * 0.5);
        noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        return noiseBuffer;
    }

    /* ------------------------------ sound building blocks ------------------------------ */

    // One shaped tone: quick attack, exponential decay
    function tone(t0, o) {
        const start = ctx.currentTime + (o.t || 0) + t0;
        const dur = o.d || 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = o.type || 'sine';
        osc.frequency.setValueAtTime(o.f, start);
        if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, start + dur);
        const peak = Math.max(0.0002, o.g || 0.15);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + (o.a || 0.006));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + dur + 0.05);
        activeVoices++;
        osc.onended = () => { activeVoices = Math.max(0, activeVoices - 1); };
    }

    // A short filtered noise burst (taps, swishes, sparkle)
    function noise(t0, o) {
        const buffer = getNoise();
        if (!buffer) return;
        const start = ctx.currentTime + (o.t || 0) + t0;
        const dur = o.d || 0.1;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = o.filter || 'bandpass';
        filter.frequency.setValueAtTime(o.f || 1500, start);
        if (o.f2) filter.frequency.exponentialRampToValueAtTime(o.f2, start + dur);
        filter.Q.value = o.q || 1;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.g || 0.08), start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start(start);
        src.stop(start + dur + 0.05);
        activeVoices++;
        src.onended = () => { activeVoices = Math.max(0, activeVoices - 1); };
    }

    const N = { C4: 262, G4: 392, B4: 494, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G6: 1568 };

    // dur = seconds the sound lasts (used to delay a redirect just long enough); gap = min ms between plays
    const SOUNDS = {
        click:   { dur: 0.06, gap: 50,  ui: true, play: () => tone(0, { f: 1000, f2: 700, d: 0.045, g: 0.08, type: 'triangle' }) },
        select:  { dur: 0.1,  gap: 60,  play: () => { tone(0, { f: 660, d: 0.07, g: 0.1 }); tone(0.02, { f: 990, d: 0.06, g: 0.05 }); } },
        open:    { dur: 0.14, gap: 120, ui: true, play: () => tone(0, { f: 420, f2: 760, d: 0.12, g: 0.08, type: 'triangle' }) },
        close:   { dur: 0.14, gap: 120, ui: true, play: () => tone(0, { f: 760, f2: 420, d: 0.12, g: 0.07, type: 'triangle' }) },
        welcome: { dur: 0.6,  gap: 800, play: () => { [N.C5, N.E5, N.G5].forEach((f, i) => { tone(i * 0.11, { f, d: 0.28, g: 0.11 }); tone(i * 0.11, { f: f * 2, d: 0.2, g: 0.025, type: 'triangle' }); }); } },
        loginSuccess: { dur: 0.55, gap: 800, play: () => { [N.G4, N.B4, N.D5, N.G5].forEach((f, i) => { tone(i * 0.09, { f, d: 0.24, g: 0.12, type: 'triangle' }); tone(i * 0.09, { f: f * 2, d: 0.18, g: 0.02 }); }); } },
        loginFail:    { dur: 0.4,  gap: 600, play: () => { tone(0, { f: 233, f2: 196, d: 0.2, g: 0.13, type: 'triangle' }); tone(0.16, { f: 208, f2: 165, d: 0.22, g: 0.13, type: 'triangle' }); } },
        error:   { dur: 0.2,  gap: 500, play: () => tone(0, { f: 300, f2: 215, d: 0.16, g: 0.11, type: 'triangle' }) },
        success: { dur: 0.3,  gap: 400, play: () => { tone(0, { f: N.C5, d: 0.14, g: 0.1 }); tone(0.09, { f: N.G5, d: 0.2, g: 0.1 }); } },
        logout:  { dur: 0.45, gap: 800, play: () => { [N.G5, N.D5, N.G4].forEach((f, i) => tone(i * 0.09, { f, d: 0.2, g: 0.1, type: 'triangle' })); } },
        gameStart: { dur: 0.5, gap: 400, play: () => { [N.C5, N.G5, N.C6].forEach((f, i) => tone(i * 0.08, { f, d: 0.22, g: 0.11 })); noise(0.16, { f: 6000, filter: 'highpass', d: 0.18, g: 0.025 }); } },
        tileFlip:  { dur: 0.1, gap: 80, play: () => { noise(0, { f: 1800, d: 0.07, g: 0.08, q: 2 }); tone(0, { f: 500, f2: 900, d: 0.08, g: 0.05, type: 'triangle' }); } },
        tileReveal: { dur: 0.35, gap: 150, play: () => { noise(0, { f: 700, f2: 2400, d: 0.2, g: 0.09, q: 1.5 }); tone(0, { f: 392, f2: 784, d: 0.2, g: 0.09, type: 'triangle' }); tone(0.12, { f: 1568, d: 0.16, g: 0.04 }); } },
        correct: { dur: 0.4, gap: 200, play: () => { tone(0, { f: N.C6, d: 0.2, g: 0.13 }); tone(0.09, { f: N.E6, d: 0.3, g: 0.13 }); tone(0.09, { f: N.E6 * 2, d: 0.15, g: 0.02, type: 'triangle' }); } },
        wrong:   { dur: 0.3, gap: 200, play: () => { tone(0, { f: 220, f2: 140, d: 0.24, g: 0.15, type: 'triangle' }); tone(0, { f: 110, d: 0.24, g: 0.12 }); } },
        match:   { dur: 0.3, gap: 150, play: () => { tone(0, { f: N.B5, d: 0.18, g: 0.12 }); tone(0.07, { f: 1480, d: 0.24, g: 0.1 }); } },
        drag:    { dur: 0.06, gap: 150, play: () => tone(0, { f: 500, f2: 620, d: 0.05, g: 0.06, type: 'triangle' }) },
        drop:    { dur: 0.1, gap: 150, play: () => { tone(0, { f: 300, f2: 180, d: 0.09, g: 0.14 }); noise(0, { f: 400, d: 0.05, g: 0.06 }); } },
        next:    { dur: 0.15, gap: 250, play: () => { noise(0, { f: 1200, f2: 5000, filter: 'highpass', d: 0.14, g: 0.05 }); tone(0, { f: 440, f2: 660, d: 0.1, g: 0.04, type: 'triangle' }); } },
        victory: { dur: 1.3, gap: 1500, play: () => {
            [N.C5, N.E5, N.G5].forEach(f => tone(0, { f, d: 0.55, g: 0.09, type: 'triangle' }));
            [N.G5, N.C6, N.E6].forEach(f => tone(0.22, { f, d: 1.0, g: 0.09, type: 'triangle' }));
            tone(0.22, { f: N.C4 / 2, d: 1.0, g: 0.12 });
            tone(0.22, { f: N.C6 * 2, d: 0.8, g: 0.025 });
        } },
        star:    { dur: 0.35, gap: 60, play: (o) => { const f = [880, 1047, 1319][Math.min(2, Math.max(0, (o && o.step) || 0))]; tone(0, { f, d: 0.35, g: 0.09 }); tone(0, { f: f * 2, d: 0.25, g: 0.035, type: 'triangle' }); } },
        results: { dur: 0.5, gap: 600, play: () => { tone(0, { f: N.G5, d: 0.4, g: 0.06 }); tone(0.1, { f: N.C6, d: 0.4, g: 0.06 }); } },
        achievement: { dur: 1.4, gap: 800, play: () => {
            [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => { tone(i * 0.09, { f, d: 0.35, g: 0.1 }); });
            [N.C6, N.E6, N.G6].forEach(f => tone(0.5, { f, d: 0.9, g: 0.07, type: 'triangle' }));
            noise(0.4, { f: 7000, filter: 'highpass', d: 0.6, g: 0.025 });
        } },
        trophy:  { dur: 1.6, gap: 800, play: () => {
            [N.G4, N.C5, N.E5, N.G5, N.C6].forEach((f, i) => { tone(i * 0.1, { f, d: 0.4, g: 0.11, type: 'triangle' }); });
            [N.C5, N.G5, N.C6, N.E6].forEach(f => tone(0.6, { f, d: 1.0, g: 0.08, type: 'triangle' }));
            tone(0.6, { f: N.C4 / 2, d: 1.0, g: 0.12 });
            noise(0.5, { f: 6500, filter: 'highpass', d: 0.7, g: 0.03 });
        } }
    };

    /* ------------------------------ playing ------------------------------ */

    function canPlayNow() {
        return settings.sfx && !failed && !document.hidden;
    }

    // Returns true when the sound was started
    function play(name, opts) {
        try {
            const def = SOUNDS[name];
            if (!def || !canPlayNow()) return false;

            // achievements wait for a running victory sequence instead of playing over it
            if ((name === 'achievement' || name === 'trophy') && Date.now() < victoryBusyUntil && !(opts && opts._late)) {
                setTimeout(() => play(name, Object.assign({}, opts, { _late: true })), victoryBusyUntil - Date.now());
                return true;
            }

            const c = ensureContext();
            if (!c) return false;
            if (c.state !== 'running') {
                // autoplay policy: the context stays suspended until the person interacts with the page
                const p = c.resume();
                if (p && p.catch) p.catch(() => {});
                return false;
            }

            const now = Date.now();
            if (lastPlayed[name] && now - lastPlayed[name] < def.gap) return false;
            if (activeVoices > 28) return false;
            lastPlayed[name] = now;
            if (!def.ui) lastSpecificAt = now;

            def.play(opts || {});
            if (api._onPlay) api._onPlay(name, opts || {});   // test and diagnostics hook
            return true;
        } catch (e) {
            return false;   // a sound must never break the page
        }
    }

    // Plays a sound, then runs fn (a redirect) once the sound has had time to be heard.
    // Runs fn straight away when nothing can play, so audio can never block navigation.
    function playThen(name, fn, maxDelayMs) {
        const started = play(name);
        const def = SOUNDS[name];
        if (started && def) {
            setTimeout(fn, Math.min(Math.round(def.dur * 1000) + 40, maxDelayMs || 450));
        } else {
            fn();
        }
    }

    // Victory fanfare, then one star ping per star actually awarded (timed to the star animation), then a chime.
    // A second call within 2.5 seconds is ignored, so repeated renders cannot replay it.
    function playVictory(stars) {
        const now = Date.now();
        if (now - lastVictoryAt < 2500) return false;
        lastVictoryAt = now;
        victoryTimers.forEach(clearTimeout);
        victoryTimers = [];

        const count = Math.max(0, Math.min(3, Number(stars) || 0));
        const starDelays = [380, 640, 900];       // the star pop-in animations peak shortly after 0.12s / 0.38s / 0.64s
        victoryBusyUntil = now + (count > 0 ? starDelays[count - 1] + 700 : 1500);

        const started = play('victory');
        for (let i = 0; i < count; i++) {
            victoryTimers.push(setTimeout(() => play('star', { step: i }), starDelays[i]));
        }
        victoryTimers.push(setTimeout(() => play('results'), (count > 0 ? starDelays[count - 1] : 400) + 450));
        return started;
    }

    function stopAll() {
        victoryTimers.forEach(clearTimeout);
        victoryTimers = [];
        victoryBusyUntil = 0;
        if (ctx && ctx.state === 'running') {
            const p = ctx.suspend();
            if (p && p.catch) p.catch(() => {});
        }
    }

    /* ------------------------------ page-level listeners (attached once) ------------------------------ */

    const MODAL_SELECTOR = '.orixa-modal-overlay, .ach-modal-overlay, #quest-modal, #student-profile-modal';
    const modalState = new WeakMap();
    let lastModalSoundAt = 0;
    let lastErrorSoundAt = 0;
    let observer = null;
    const cleanups = [];

    function listen(target, type, handler, options) {
        target.addEventListener(type, handler, options);
        cleanups.push(() => target.removeEventListener(type, handler, options));
    }

    function onFirstGesture() {
        if (failed || !settings.sfx) { return; }
        const c = ensureContext();
        if (!c) return;
        if (c.state !== 'running') {
            const p = c.resume();
            if (p && p.then) {
                p.then(playPendingWelcome).catch(() => {});
            }
        } else {
            playPendingWelcome();
        }
    }

    function playPendingWelcome() {
        if (!pendingWelcome || !ctx || ctx.state !== 'running') return;
        pendingWelcome = false;
        try { sessionStorage.setItem('orixa.welcomed', '1'); } catch (e) { /* ignore */ }
        play('welcome');
    }

    function isWelcomePage() {
        const name = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        return name === '' || name === 'index.html' || name === 'admin-selection.html' || /-login\.html$/.test(name);
    }

    function isOpen(el) {
        if (el.hidden || el.classList.contains('hidden')) return false;
        const display = el.style && el.style.display;
        if (display === 'none') return false;
        if (el.matches('#quest-modal, #student-profile-modal')) return true;   // visible unless hidden above
        return true;
    }

    function noteModal(el, nowOpen) {
        const was = modalState.get(el) === true;
        if (was === nowOpen) return;
        modalState.set(el, nowOpen);
        const now = Date.now();
        if (now - lastModalSoundAt < 150) return;
        lastModalSoundAt = now;
        play(nowOpen ? 'open' : 'close');
    }

    function onMutations(mutations) {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                const t = m.target;
                if (t.nodeType !== 1) continue;
                if (t.matches(MODAL_SELECTOR)) {
                    noteModal(t, isOpen(t));
                } else if (m.attributeName === 'class' && t.classList.contains('teacher-form-msg')) {
                    const old = m.oldValue || '';
                    const inLogin = !!t.closest('form[id*="login"]');
                    if (inLogin) continue;   // the login handlers play loginSuccess / loginFail themselves
                    if (t.classList.contains('success') && !/\bsuccess\b/.test(old)) play('success');
                    else if (t.classList.contains('error') && !/\berror\b/.test(old)) feedbackError();
                }
            } else if (m.type === 'childList') {
                const t = m.target;
                if (t.nodeType === 1 && t.classList && t.classList.contains('field-error') && t.textContent.trim()) {
                    feedbackError();
                }
                m.addedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    if (n.matches && n.matches(MODAL_SELECTOR)) noteModal(n, isOpen(n));
                    else if (n.querySelector) {
                        const inner = n.querySelector(MODAL_SELECTOR);
                        if (inner) noteModal(inner, isOpen(inner));
                    }
                });
                m.removedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    const el = (n.matches && n.matches(MODAL_SELECTOR)) ? n : (n.querySelector && n.querySelector(MODAL_SELECTOR));
                    if (el && modalState.get(el)) noteModal(el, false);
                });
            }
        }
    }

    function feedbackError() {
        const now = Date.now();
        if (now - lastErrorSoundAt < 500) return;
        lastErrorSoundAt = now;
        play('error');
    }

    function onClick(e) {
        if (!e.isTrusted || !settings.sfx) return;
        const el = e.target && e.target.closest
            ? e.target.closest('button, a[href], [role="button"], summary, input[type="checkbox"], input[type="radio"], label.switch')
            : null;
        if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-sound="off"]')) return;

        const isNavLink = el.tagName === 'A' && /role-card|login|admin-selection/.test((el.className || '') + ' ' + (el.getAttribute('href') || ''));
        const clickedAt = Date.now();
        // wait one tick: if a specific sound (tile flip, match, ...) starts for this same click, skip the generic one
        setTimeout(() => {
            if (lastSpecificAt >= clickedAt - 5) return;
            play(isNavLink ? 'select' : 'click');
        }, 0);
    }

    function onVisibility() {
        if (!ctx) return;
        if (document.hidden) {
            const p = ctx.suspend();
            if (p && p.catch) p.catch(() => {});
        } else if (settings.sfx) {
            const p = ctx.resume();
            if (p && p.catch) p.catch(() => {});
        }
    }

    function onStorage(e) {
        if (e.key === STORAGE_KEY) {
            settings = readSettings();
            applyVolume();
            subscribers.forEach(fn => { try { fn(Object.assign({}, settings)); } catch (err) { /* ignore */ } });
        }
    }

    function attach() {
        listen(document, 'pointerdown', onFirstGesture, { capture: true, passive: true });
        listen(document, 'keydown', onFirstGesture, { capture: true, passive: true });
        listen(document, 'click', onClick, { capture: true, passive: true });
        listen(document, 'visibilitychange', onVisibility);
        listen(window, 'storage', onStorage);

        if (window.MutationObserver && document.body) {
            document.querySelectorAll(MODAL_SELECTOR).forEach(el => modalState.set(el, isOpen(el)));
            observer = new MutationObserver(onMutations);
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'], attributeOldValue: true });
        }

        if (isWelcomePage()) {
            try { pendingWelcome = !sessionStorage.getItem('orixa.welcomed'); } catch (e) { pendingWelcome = true; }
        }
    }

    /* ------------------------------ settings UI ------------------------------ */

    const SPEAKER_ON = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" fill="currentColor"/>';
    const SPEAKER_OFF = '<path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>';

    function mountSettings(container) {
        if (!container || container.dataset.orixaAudioSettings) return;
        container.dataset.orixaAudioSettings = 'true';
        const id = 'orixa-audio-' + Math.random().toString(36).slice(2, 7);

        container.innerHTML =
            '<div style="display: flex; flex-direction: column; gap: 12px; font-family: var(--font-body);">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">' +
            `<label for="${id}-sfx" style="font-weight: 700; color: var(--border-dark);">Sound effects</label>` +
            `<button type="button" id="${id}-sfx" role="switch" data-sound="off" style="min-width: 76px; min-height: 40px; flex-shrink: 0; padding: 0 14px; font-family: var(--font-header); font-weight: 700; color: var(--border-dark); border: var(--border-comic-thin); border-radius: 12px; box-shadow: var(--shadow-chunky-pressed); cursor: pointer;"></button>` +
            '</div>' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
            `<label for="${id}-vol" style="font-weight: 700; color: var(--border-dark); flex-shrink: 0;">Volume</label>` +
            `<input type="range" id="${id}-vol" min="0" max="100" step="5" style="flex: 1; min-width: 0; accent-color: var(--color-purple, #7e57c2);">` +
            `<span id="${id}-volval" style="min-width: 3ch; text-align: right; font-weight: 700; color: #546e7a;"></span>` +
            '</div>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 8px;">' +
            `<button type="button" id="${id}-test" class="cartoon-action-btn" data-sound="off" style="padding: 8px 16px; font-size: 0.85rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">TEST SOUND</button>` +
            `<button type="button" id="${id}-reset" class="cartoon-action-btn" data-sound="off" style="padding: 8px 16px; font-size: 0.85rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">RESTORE DEFAULTS</button>` +
            '</div>' +
            '<p style="margin: 0; font-size: 0.8rem; color: #546e7a;">Changes apply immediately and are saved on this device.</p>' +
            '</div>';

        const sfxBtn = container.querySelector(`#${id}-sfx`);
        const vol = container.querySelector(`#${id}-vol`);
        const volVal = container.querySelector(`#${id}-volval`);

        const render = (s) => {
            sfxBtn.textContent = s.sfx ? 'ON' : 'OFF';
            sfxBtn.setAttribute('aria-checked', String(s.sfx));
            sfxBtn.style.background = s.sfx ? 'var(--color-green)' : 'var(--color-red)';
            vol.value = String(Math.round(s.volume * 100));
            vol.disabled = !s.sfx;
            vol.setAttribute('aria-valuetext', `${Math.round(s.volume * 100)} percent`);
            volVal.textContent = `${Math.round(s.volume * 100)}%`;
        };
        render(settings);

        sfxBtn.addEventListener('click', () => { api.setSfxEnabled(!settings.sfx); if (settings.sfx) play('select'); });
        vol.addEventListener('input', () => api.setVolume(Number(vol.value) / 100));
        vol.addEventListener('change', () => play('select'));
        container.querySelector(`#${id}-test`).addEventListener('click', () => { onFirstGesture(); setTimeout(() => play('correct'), 30); });
        container.querySelector(`#${id}-reset`).addEventListener('click', () => { api.reset(); play('select'); });

        const unsubscribe = api.subscribe(render);
        // stop updating a settings block that has been removed from the page
        const watcher = new MutationObserver(() => {
            if (!document.body.contains(container)) { unsubscribe(); watcher.disconnect(); }
        });
        watcher.observe(document.body, { childList: true, subtree: true });
    }

    // A small speaker button for pages that have no Settings screen (role selection and login pages)
    function mountQuickToggle() {
        if (document.getElementById('orixa-sound-toggle') || !document.body) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'orixa-sound-toggle';
        btn.setAttribute('data-sound', 'off');
        btn.style.cssText = 'position: fixed; right: 16px; bottom: 16px; z-index: 900; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border: var(--border-comic-thin, 3px solid #1a1a24); border-radius: 50%; background: var(--surface-white, #fff); color: var(--border-dark, #1a1a24); box-shadow: var(--shadow-chunky-pressed, 0 3px 0 #1a1a24); cursor: pointer; padding: 0;';
        const render = (s) => {
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${s.sfx ? SPEAKER_ON : SPEAKER_OFF}</svg>`;
            btn.setAttribute('aria-pressed', String(!s.sfx));
            btn.setAttribute('aria-label', s.sfx ? 'Sound effects on. Activate to mute.' : 'Sound effects off. Activate to turn on.');
            btn.title = s.sfx ? 'Mute sound effects' : 'Turn on sound effects';
        };
        render(settings);
        btn.addEventListener('click', () => { api.setSfxEnabled(!settings.sfx); if (settings.sfx) { onFirstGesture(); setTimeout(() => play('select'), 30); } });
        api.subscribe(render);
        document.body.appendChild(btn);
    }

    /* ------------------------------ public API ------------------------------ */

    const api = {
        play,
        playThen,
        playVictory,
        stopAll,
        has: (name) => Object.prototype.hasOwnProperty.call(SOUNDS, name),
        names: () => Object.keys(SOUNDS),
        getSettings: () => Object.assign({}, settings),
        setSfxEnabled(on) {
            settings.sfx = !!on;
            saveSettings();
            if (!settings.sfx) stopAll();
        },
        setVolume(v) {
            const n = Number(v);
            settings.volume = isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULTS.volume;
            saveSettings();
        },
        reset() {
            settings = { sfx: DEFAULTS.sfx, volume: DEFAULTS.volume };
            saveSettings();
        },
        subscribe(fn) {
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        },
        mountSettings,
        mountQuickToggle,
        // state for tests and diagnostics
        _state: () => ({ context: ctx ? ctx.state : 'none', failed, activeVoices, listeners: cleanups.length, subscribers: subscribers.size }),
        destroy() {
            cleanups.splice(0).forEach(fn => { try { fn(); } catch (e) { /* ignore */ } });
            if (observer) { observer.disconnect(); observer = null; }
            victoryTimers.forEach(clearTimeout);
            victoryTimers = [];
            if (ctx) { try { ctx.close(); } catch (e) { /* ignore */ } ctx = null; master = null; }
            subscribers.clear();
            delete window.OrixaAudio;
        }
    };
    window.OrixaAudio = api;

    function start() {
        attach();
        if (isWelcomePage()) mountQuickToggle();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
