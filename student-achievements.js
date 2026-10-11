/* ==========================================================================
   STUDENT ACHIEVEMENTS: badges, trophies, progress and the unlock celebration

   The 20 achievements live in Supabase (achievement_definitions); the student's unlocks and progress
   come from fn_get_achievement_state(); new unlocks come only from fn_evaluate_my_achievements().
   This file only presents that data. The artwork is assets/achievements/<id>.png.
   ========================================================================== */
(function () {
    'use strict';

    const ASSET_DIR = 'assets/achievements/';
    const CATEGORIES = [
        { key: 'XP_BADGE', title: 'XP Badges', tone: 'xp' },
        { key: 'TROPHY', title: 'Trophies', tone: 'trophy' },
        { key: 'SPECIAL', title: 'Special Achievement Badges', tone: 'special' }
    ];
    const MISSING_ART = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#9aa3c7" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>');

    // Glow colours for the celebration: [core, halo]
    const GLOWS = {
        BRONZE: ['#ffb45a', '#c9702a'],
        SILVER: ['#cfe3ff', '#6f8fd8'],
        GOLD: ['#ffe27a', '#e0a21a'],
        PLATINUM: ['#d9c6ff', '#6a7bff'],
        'orixa-legend': ['#c9b3ff', '#4f8bff'],
        'perfect-performance': ['#8fc2ff', '#e8b834'],
        'consistency-champion': ['#c0a8ff', '#5a7dff'],
        'three-star-master': ['#e0b8ff', '#e8b834'],
        'unstoppable-learner': ['#ff9a5a', '#e03a2a']
    };

    let definitions = [];
    let state = null;
    let loadedFor = null;
    let status = 'idle'; // idle | loading | ready | error
    let loadPromise = null;
    let collectionEl = null;
    let celebrationEl = null;
    let lastFocus = null;
    const celebrationQueue = [];
    let celebrating = false;
    let scrollLocks = 0;
    let savedOverflow = '';

    const esc = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (n) => Number(n || 0).toLocaleString();
    const client = () => (window.OrixaAuth && window.OrixaAuth.client) || null;
    const artFor = (def) => ASSET_DIR + def.asset_key + '.png';

    function lockScroll() {
        if (scrollLocks === 0) {
            savedOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        }
        scrollLocks++;
    }
    function unlockScroll() {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
    }

    /* ----- progress ----- */

    function progressValue(def) {
        if (!state) return 0;
        switch (def.requirement_type) {
            case 'LIFETIME_XP': return state.lifetime_xp;
            case 'PERFECT_QUIZ': return state.perfect_quizzes;
            case 'DAYS_IN_WINDOW': return state.best_days_in_14;
            case 'THREE_STAR_QUIZZES': return state.three_star_quizzes;
            case 'COMPLETED_QUIZZES': return state.completed_quizzes;
            default: return 0;
        }
    }

    function progressLabel(def) {
        const value = Math.min(progressValue(def), def.threshold);
        switch (def.requirement_type) {
            case 'LIFETIME_XP': return `${fmt(value)} / ${fmt(def.threshold)} XP`;
            case 'PERFECT_QUIZ': return `${value} / ${def.threshold} perfect quiz`;
            case 'DAYS_IN_WINDOW': return `${value} / ${def.threshold} qualifying days`;
            case 'THREE_STAR_QUIZZES': return `${value} / ${def.threshold} three-star quizzes`;
            case 'COMPLETED_QUIZZES': return `${value} / ${def.threshold} completed quizzes`;
            default: return '';
        }
    }

    function earnedText(def) {
        switch (def.requirement_type) {
            case 'LIFETIME_XP': return `${fmt(def.threshold)} lifetime XP reached`;
            case 'PERFECT_QUIZ': return 'You scored 100% on a quiz!';
            case 'DAYS_IN_WINDOW': return `You completed quizzes on ${def.threshold} different days!`;
            case 'THREE_STAR_QUIZZES': return `You earned three stars on ${def.threshold} quizzes!`;
            case 'COMPLETED_QUIZZES': return `You successfully completed ${def.threshold} quizzes!`;
            default: return def.description;
        }
    }

    const unlockedMap = () => new Map(((state && state.unlocked) || []).map(u => [u.achievement_id, u.unlocked_at]));
    const defById = (id) => definitions.find(d => d.id === id);

    /* ----- loading ----- */

    async function loadAll() {
        if (loadPromise) return loadPromise;
        loadPromise = (async () => {
            const c = client();
            if (!c) return;
            const profile = await window.OrixaAuth.getCurrentProfile();
            if (!profile) return;

            if (loadedFor && loadedFor !== profile.id) {   // another account in this browser: show nothing of the old one
                definitions = [];
                state = null;
            }
            loadedFor = profile.id;
            status = 'loading';
            renderAll();

            try {
                if (definitions.length === 0) {
                    const { data, error } = await c.from('achievement_definitions').select('*').eq('is_active', true).order('display_order');
                    if (error) throw error;
                    definitions = data || [];
                }
                const { data: s, error: sErr } = await c.rpc('fn_get_achievement_state');
                if (sErr) throw sErr;
                state = s;
                status = 'ready';
            } catch (e) {
                console.error('Could not load achievements:', e);
                status = 'error';
            }
            renderAll();
        })().finally(() => { loadPromise = null; });
        return loadPromise;
    }

    // Asks the database to unlock whatever the student now qualifies for; only genuinely new unlocks come back
    async function evaluate(attempts = 3) {
        const c = client();
        if (!c) return [];
        for (let i = 0; i < attempts; i++) {
            const { data, error } = await c.rpc('fn_evaluate_my_achievements');
            if (!error) {
                const ids = (data && data.newly_unlocked) || [];
                await loadAll();
                return ids;
            }
            console.error('fn_evaluate_my_achievements error:', error);
            if (i < attempts - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
        return [];
    }

    async function onQuizCompleted() {
        const ids = await evaluate();
        celebrate(ids);
    }

    async function init() {
        await loadAll();
        celebrate(await evaluate(2)); // also reconciles an unlock that an earlier network failure missed
    }

    /* ----- dashboard panel + profile summary ----- */

    function summaryNumbers() {
        const unlocked = unlockedMap();
        const trophies = definitions.filter(d => d.category === 'TROPHY');
        const nextXp = definitions
            .filter(d => d.category === 'XP_BADGE' && !unlocked.has(d.id))
            .sort((a, b) => a.threshold - b.threshold)[0];
        return {
            unlockedCount: definitions.filter(d => unlocked.has(d.id)).length,
            total: definitions.length,
            trophyCount: trophies.filter(d => unlocked.has(d.id)).length,
            trophyTotal: trophies.length,
            nextXp
        };
    }

    function renderPanel() {
        const panel = document.getElementById('achievements-panel');
        if (!panel) return;
        if (status !== 'ready') {
            panel.innerHTML = `<p class="ach-panel-note" ${status === 'error' ? 'role="alert"' : ''}>${status === 'error' ? 'Could not load your badges and trophies.' : 'Loading your badges and trophies...'}</p>
                ${status === 'error' ? '<button type="button" class="quiz-mgmt-action-btn quiz-btn-edit ach-retry-btn" style="height: 42px; max-width: 160px;">TRY AGAIN</button>' : ''}`;
            const retry = panel.querySelector('.ach-retry-btn');
            if (retry) retry.addEventListener('click', () => loadAll());
            return;
        }

        const n = summaryNumbers();
        const unlocked = unlockedMap();
        const next = n.nextXp;
        const nextPct = next ? Math.min(100, Math.round(state.lifetime_xp / next.threshold * 100)) : 100;
        panel.innerHTML = `
            <div class="ach-panel-stats">
                <div><span class="ach-panel-num">${fmt(state.lifetime_xp)}</span><span class="ach-panel-lbl">Lifetime XP</span></div>
                <div><span class="ach-panel-num">${n.unlockedCount} / ${n.total}</span><span class="ach-panel-lbl">Achievements</span></div>
                <div><span class="ach-panel-num">${n.trophyCount} / ${n.trophyTotal}</span><span class="ach-panel-lbl">Trophies</span></div>
            </div>
            <div class="ach-next">
                <div class="ach-next-line"><span>${next ? `Next: ${esc(next.name)}` : 'All XP badges earned'}</span><span>${next ? `${fmt(state.lifetime_xp)} / ${fmt(next.threshold)} XP` : ''}</span></div>
                <div class="ach-next-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${nextPct}" aria-label="Progress to the next XP badge"><span style="width: ${nextPct}%"></span></div>
            </div>
            <div class="ach-strip" aria-hidden="true">
                ${definitions.map(d => `<img src="${artFor(d)}" alt="" class="${unlocked.has(d.id) ? '' : 'is-locked'}" onerror="this.src='${MISSING_ART}'">`).join('')}
            </div>
            <button type="button" class="cartoon-action-btn primary-yellow-btn ach-open-btn">OPEN BADGES &amp; TROPHIES</button>`;
        panel.querySelector('.ach-open-btn').addEventListener('click', openCollection);
    }

    function renderProfileSummary() {
        const el = document.getElementById('student-achievements-summary');
        if (!el) return;
        if (status !== 'ready') {
            el.textContent = status === 'error' ? 'Could not load your badges and trophies.' : 'Loading...';
            return;
        }
        const n = summaryNumbers();
        el.textContent = `${n.unlockedCount} of ${n.total} achievements unlocked, ${n.trophyCount} of ${n.trophyTotal} trophies, ${fmt(state.lifetime_xp)} lifetime XP`;
    }

    /* ----- collection modal ----- */

    function ensureCollection() {
        if (collectionEl) return collectionEl;
        collectionEl = document.createElement('div');
        collectionEl.className = 'ach-modal-overlay';
        collectionEl.hidden = true;
        collectionEl.setAttribute('role', 'dialog');
        collectionEl.setAttribute('aria-modal', 'true');
        collectionEl.setAttribute('aria-labelledby', 'ach-collection-title');
        collectionEl.innerHTML = `
            <div class="ach-modal">
                <header class="ach-modal-head">
                    <h3 id="ach-collection-title">Badges &amp; Trophies</h3>
                    <button type="button" class="ach-close-btn" aria-label="Close badges and trophies">
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
                    </button>
                </header>
                <div class="ach-modal-body" id="ach-collection-body"></div>
                <div class="ach-detail" id="ach-detail" hidden role="dialog" aria-modal="true" aria-labelledby="ach-detail-name"></div>
            </div>`;
        document.body.appendChild(collectionEl);
        collectionEl.querySelector('.ach-close-btn').addEventListener('click', closeCollection);
        collectionEl.addEventListener('mousedown', (e) => { if (e.target === collectionEl) closeCollection(); });
        collectionEl.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            const detail = collectionEl.querySelector('#ach-detail');
            if (!detail.hidden) closeDetail(); else closeCollection();
        });
        collectionEl.querySelector('#ach-collection-body').addEventListener('click', (e) => {
            const tile = e.target.closest('.ach-tile');
            if (tile) openDetail(tile.dataset.id, tile);
        });
        return collectionEl;
    }

    function renderCollection() {
        if (!collectionEl) return;
        const body = collectionEl.querySelector('#ach-collection-body');
        if (status !== 'ready') {
            body.innerHTML = `<p class="ach-note" ${status === 'error' ? 'role="alert"' : ''}>${status === 'error' ? 'Could not load your badges and trophies.' : 'Loading...'}</p>
                ${status === 'error' ? '<button type="button" class="cartoon-action-btn primary-yellow-btn ach-retry-btn">TRY AGAIN</button>' : ''}`;
            const retry = body.querySelector('.ach-retry-btn');
            if (retry) retry.addEventListener('click', () => loadAll());
            return;
        }

        const unlocked = unlockedMap();
        const n = summaryNumbers();
        body.innerHTML = `<p class="ach-modal-summary">${n.unlockedCount} of ${n.total} unlocked &middot; ${fmt(state.lifetime_xp)} lifetime XP</p>` +
            CATEGORIES.map(cat => {
                const items = definitions.filter(d => d.category === cat.key);
                const got = items.filter(d => unlocked.has(d.id)).length;
                return `
                <section class="ach-section ach-tone-${cat.tone}" aria-labelledby="ach-sec-${cat.tone}">
                    <h4 id="ach-sec-${cat.tone}" class="ach-section-title"><span>${cat.title} (${got}/${items.length})</span></h4>
                    <ul class="ach-grid">
                        ${items.map(d => {
                            const isOn = unlocked.has(d.id);
                            return `<li><button type="button" class="ach-tile ${isOn ? 'is-unlocked' : 'is-locked'}" data-id="${esc(d.id)}" aria-label="${esc(d.name)}, ${isOn ? 'unlocked' : 'locked'}. ${esc(isOn ? d.description : progressLabel(d))}">
                                <img src="${artFor(d)}" alt="" loading="lazy" onerror="this.src='${MISSING_ART}'">
                                <span class="ach-tile-name">${esc(d.name)}</span>
                                <span class="ach-tile-sub">${isOn ? 'Unlocked' : esc(progressLabel(d))}</span>
                            </button></li>`;
                        }).join('')}
                    </ul>
                </section>`;
            }).join('');
    }

    function openCollection() {
        ensureCollection();
        lastFocus = document.activeElement;
        collectionEl.hidden = false;
        lockScroll();
        renderCollection();
        if (status !== 'ready') loadAll();
        collectionEl.querySelector('.ach-close-btn').focus();
    }

    function closeCollection() {
        if (!collectionEl || collectionEl.hidden) return;
        closeDetail(true);
        collectionEl.hidden = true;
        unlockScroll();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function openDetail(id, tile) {
        const def = defById(id);
        if (!def) return;
        const unlockedAt = unlockedMap().get(id);
        const detail = collectionEl.querySelector('#ach-detail');
        detail.dataset.returnId = id;
        detail.innerHTML = `
            <div class="ach-detail-card ${unlockedAt ? 'is-unlocked' : 'is-locked'}">
                <img src="${artFor(def)}" alt="" onerror="this.src='${MISSING_ART}'">
                <h4 id="ach-detail-name">${esc(def.name)}</h4>
                <p class="ach-detail-status">${unlockedAt ? 'Unlocked' : 'Locked'}</p>
                <p class="ach-detail-req">${esc(def.description)}</p>
                ${unlockedAt
                    ? `<p class="ach-detail-date">Unlocked on ${esc(new Date(unlockedAt).toLocaleString())}</p>`
                    : `<p class="ach-detail-progress">Progress: ${esc(progressLabel(def))}</p>`}
                <button type="button" class="cartoon-action-btn primary-yellow-btn ach-detail-close">BACK</button>
            </div>`;
        detail.hidden = false;
        detail.querySelector('.ach-detail-close').addEventListener('click', () => closeDetail());
        detail.querySelector('.ach-detail-close').focus();
    }

    function closeDetail(silent) {
        const detail = collectionEl && collectionEl.querySelector('#ach-detail');
        if (!detail || detail.hidden) return;
        detail.hidden = true;
        if (silent) return;
        const tile = collectionEl.querySelector(`.ach-tile[data-id="${detail.dataset.returnId}"]`);
        if (tile) tile.focus();
    }

    /* ----- unlock celebration ----- */

    function ensureCelebration() {
        if (celebrationEl) return celebrationEl;
        celebrationEl = document.createElement('div');
        celebrationEl.className = 'ach-celebrate';
        celebrationEl.hidden = true;
        celebrationEl.setAttribute('role', 'dialog');
        celebrationEl.setAttribute('aria-modal', 'true');
        celebrationEl.setAttribute('aria-labelledby', 'ach-cel-name');
        celebrationEl.innerHTML = `
            <div class="ach-cel-inner">
                <p class="ach-cel-heading">ACHIEVEMENT UNLOCKED!</p>
                <div class="ach-cel-stage">
                    <div class="ach-cel-glow"></div>
                    <div class="ach-cel-rays"></div>
                    <div class="ach-cel-ring"></div>
                    <div class="ach-cel-sparks"></div>
                    <img class="ach-cel-art" alt="">
                </div>
                <h3 class="ach-cel-name" id="ach-cel-name"></h3>
                <p class="ach-cel-desc"></p>
                <p class="ach-cel-meta"></p>
                <button type="button" class="cartoon-action-btn primary-yellow-btn ach-cel-continue">CONTINUE</button>
            </div>`;
        document.body.appendChild(celebrationEl);

        const sparks = celebrationEl.querySelector('.ach-cel-sparks');
        for (let i = 0; i < 14; i++) {
            const s = document.createElement('span');
            s.style.setProperty('--a', `${Math.round(i * 360 / 14 + (i % 2) * 9)}deg`);
            s.style.setProperty('--d', `${120 + (i % 3) * 22}px`);
            s.style.setProperty('--delay', `${0.45 + (i % 5) * 0.07}s`);
            sparks.appendChild(s);
        }

        celebrationEl.querySelector('.ach-cel-continue').addEventListener('click', nextCelebration);
        celebrationEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.preventDefault(); nextCelebration(); }
            if (e.key === 'Tab') { e.preventDefault(); celebrationEl.querySelector('.ach-cel-continue').focus(); }
        });
        return celebrationEl;
    }

    // Presentation queue: only achievements the database just unlocked are ever put in here
    function celebrate(ids) {
        const fresh = (ids || [])
            .map(defById)
            .filter(d => d && !celebrationQueue.some(q => q.id === d.id))
            .sort((a, b) => a.display_order - b.display_order);
        if (fresh.length === 0) return;
        celebrationQueue.push(...fresh);
        if (!celebrating) {
            celebrating = true;
            ensureCelebration();
            lastFocus = document.activeElement;
            lockScroll();
            nextCelebration();
        }
    }

    function nextCelebration() {
        const el = celebrationEl;
        const def = celebrationQueue.shift();
        if (!def) {
            el.hidden = true;
            el.classList.remove('is-playing');
            celebrating = false;
            unlockScroll();
            if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
            return;
        }

        const glow = GLOWS[def.id] || GLOWS[def.rarity] || GLOWS.GOLD;
        el.style.setProperty('--ach-core', glow[0]);
        el.style.setProperty('--ach-halo', glow[1]);
        el.classList.toggle('is-trophy', def.category === 'TROPHY');

        const art = el.querySelector('.ach-cel-art');
        art.onerror = () => { art.onerror = null; art.src = MISSING_ART; };
        art.src = artFor(def);
        el.querySelector('.ach-cel-name').textContent = def.name;
        el.querySelector('.ach-cel-desc').textContent = earnedText(def);
        const remaining = celebrationQueue.length;
        el.querySelector('.ach-cel-meta').textContent = (def.requirement_type === 'LIFETIME_XP' && state ? `Lifetime XP: ${fmt(state.lifetime_xp)}` : '') +
            (remaining > 0 ? `${def.requirement_type === 'LIFETIME_XP' && state ? '  |  ' : ''}${remaining} more to see` : '');
        el.querySelector('.ach-cel-continue').textContent = remaining > 0 ? 'NEXT' : 'CONTINUE';

        el.hidden = false;
        el.classList.remove('is-playing');
        void el.offsetWidth;            // restart the CSS animations for this achievement
        el.classList.add('is-playing');
        el.querySelector('.ach-cel-continue').focus();
    }

    /* ----- wiring ----- */

    function renderAll() {
        renderPanel();
        renderProfileSummary();
        renderCollection();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-open-achievements]').forEach(btn => btn.addEventListener('click', () => {
            // opened from the profile dialog: leave that dialog first
            if (typeof closeStudentProfileModal === 'function') closeStudentProfileModal();
            openCollection();
        }));
    });

    window.OrixaAchievements = { init, onQuizCompleted, openCollection, celebrate, reload: loadAll };
})();
