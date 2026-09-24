/* ==========================================================================
   ORIXA - STUDENT PORTAL CONTROLLER (TILE PUZZLE GAME ENGINE)
   ========================================================================= */

/* ==========================================================================
   SHARED ORIXA SCORING, ACCURACY, STAR & COMPLETION ENGINE
   ========================================================================== */

let completedQuizzes = new Set();
let activeGameTimeouts = [];

function setGameTimeout(fn, delay) {
    const id = setTimeout(() => {
        activeGameTimeouts = activeGameTimeouts.filter(t => t !== id);
        fn();
    }, delay);
    activeGameTimeouts.push(id);
    return id;
}

function clearGameTimeouts() {
    activeGameTimeouts.forEach(id => clearTimeout(id));
    activeGameTimeouts = [];
}

async function loadCompletedQuizzesFromSupabase() {
    completedQuizzes.clear();
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile) return;

    try {
        const { data: attempts } = await client
            .from('quiz_attempts')
            .select('quiz_id, quizzes(title)')
            .eq('student_id', profile.id)
            .eq('status', 'COMPLETED');

        if (attempts && Array.isArray(attempts)) {
            attempts.forEach(a => {
                if (a.quizzes && a.quizzes.title) {
                    completedQuizzes.add(a.quizzes.title);
                }
                if (a.quiz_id) {
                    completedQuizzes.add(a.quiz_id);
                }
            });
        }
    } catch (e) {
        console.warn('Error fetching completed quizzes from Supabase:', e);
    }
}

function getQuestMaxXP(questName) {
    const xpMap = {
        "Ancient Egypt Quest": 100,
        "Solar System True or False": 110,
        "Geography & Science Blanks": 140,
        "World & Science Matching": 130,
        "Math Galaxy Challenge": 120,
        "Space Explorer Mission": 150
    };
    return xpMap[questName] || 100;
}

function calculateQuestionScoreRatio(mistakes, isSolved) {
    if (!isSolved) return 0;
    if (mistakes <= 0) return 1.0;
    // 1 mistake -> 0.75, 2 mistakes -> 0.50, 3 mistakes -> 0.25, >= 4 mistakes -> 0
    const ratio = 1.0 - (0.25 * mistakes);
    return Math.max(0, ratio);
}

function calculateStarsFromXP(earnedXP, totalPossibleXP) {
    if (!totalPossibleXP || totalPossibleXP <= 0) return 0;
    const pct = (earnedXP / totalPossibleXP) * 100;
    // Less than 33.33% -> 0 stars
    // 33.33% or more -> 1 star
    // 66.66% or more -> 2 stars
    // More than 90% -> 3 stars
    if (pct > 90) {
        return 3;
    } else if (pct >= 66.66 - 0.0001) {
        return 2;
    } else if (pct >= 33.33 - 0.0001) {
        return 1;
    } else {
        return 0;
    }
}

function calculateQuizResults(questionStatsArray, totalPossibleXP) {
    const totalQuestions = questionStatsArray.length;
    if (totalQuestions === 0) {
        return { earnedXP: 0, accuracy: 0, stars: 0, totalPossibleXP: 0 };
    }

    const maxXPPerQuestion = totalPossibleXP / totalQuestions;
    let totalEarnedXP = 0;
    let sumRatios = 0;

    questionStatsArray.forEach(q => {
        const mistakes = q.mistakes || 0;
        const isSolved = Boolean(q.isSolved);
        const ratio = calculateQuestionScoreRatio(mistakes, isSolved);
        const qXP = maxXPPerQuestion * ratio;
        totalEarnedXP += qXP;
        sumRatios += ratio;
    });

    const finalEarnedXP = Math.min(totalPossibleXP, Math.max(0, Math.round(totalEarnedXP)));
    const finalAccuracy = Math.min(100, Math.max(0, Math.round((sumRatios / totalQuestions) * 100)));
    const finalStars = calculateStarsFromXP(finalEarnedXP, totalPossibleXP);

    return {
        earnedXP: finalEarnedXP,
        accuracy: finalAccuracy,
        stars: finalStars,
        totalPossibleXP: totalPossibleXP
    };
}

function getCurrentQuizXP(questionStats, questName) {
    if (!questionStats || !Array.isArray(questionStats) || questionStats.length === 0 || !questName) return 0;
    const totalMaxXP = getQuestMaxXP(questName);
    return calculateQuizResults(questionStats, totalMaxXP).earnedXP;
}

function renderStarsRowHtml(starsCount) {
    let html = '<div class="orixa-stars-row" aria-label="' + starsCount + ' Stars Earned">';
    for (let i = 1; i <= 3; i++) {
        const isEarned = i <= starsCount;
        html += `<span class="orixa-star-item ${isEarned ? 'is-earned' : 'is-unearned'}">
            <svg class="orixa-star-svg" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                    <linearGradient id="orixa-star-gold-grad-${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#fff9c4"/>
                        <stop offset="40%" stop-color="#ffd54f"/>
                        <stop offset="100%" stop-color="#ffb300"/>
                    </linearGradient>
                    <linearGradient id="orixa-star-gray-grad-${i}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#cfd8dc"/>
                        <stop offset="100%" stop-color="#90a4ae"/>
                    </linearGradient>
                </defs>
                <path class="star-path" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      fill="${isEarned ? `url(#orixa-star-gold-grad-${i})` : `url(#orixa-star-gray-grad-${i})`}"
                      stroke="var(--border-dark)" stroke-width="1.8" stroke-linejoin="round" />
                <path class="star-gloss" d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21l6.18-3.73V2z"
                      fill="rgba(255, 255, 255, ${isEarned ? '0.35' : '0.15'})" />
            </svg>
            ${isEarned ? '<span class="orixa-star-glint" aria-hidden="true"></span>' : ''}
        </span>`;
    }
    html += '</div>';
    return html;
}

let currentGameState = {
    questName: "",
    category: "",
    questionCount: 4,
    gridDimension: 2,
    questions: [],
    solvedTiles: new Set(),
    selectedTileIndex: null,
    selectedOptionIndex: null,
    score: 0,
    startTime: 0
};


function getQuestThemeStyle(questName, subject) {
    const nameMap = {
        "Ancient Egypt Quest": { bg: "var(--color-green)", text: "var(--border-dark)" },
        "Solar System True or False": { bg: "var(--color-yellow)", text: "var(--border-dark)" },
        "Geography & Science Blanks": { bg: "var(--color-green)", text: "var(--border-dark)" },
        "World & Science Matching": { bg: "var(--color-purple)", text: "white" },
        "Math Galaxy Challenge": { bg: "var(--color-orange)", text: "var(--border-dark)" },
        "Space Explorer Mission": { bg: "var(--color-blue)", text: "white" }
    };
    if (questName && nameMap[questName]) {
        return nameMap[questName];
    }
    const subjLower = (subject || "").toLowerCase();
    if (subjLower.includes("math")) return { bg: "var(--color-orange)", text: "var(--border-dark)" };
    if (subjLower.includes("history")) return { bg: "var(--color-green)", text: "var(--border-dark)" };
    if (subjLower.includes("purple")) return { bg: "var(--color-purple)", text: "white" };
    if (subjLower.includes("blue")) return { bg: "var(--color-blue)", text: "white" };
    return { bg: "var(--color-purple)", text: "white" };
}

function openQuestGame(questName, rawCount, category, chances = 3, teacherName = 'Professor Riley', dbAttemptId = null, dbQuestions = null) {
    const questionList = dbQuestions || [];
    const questionCount = questionList.length;
    let root = Math.round(Math.sqrt(questionCount));
    if (root < 2) root = 2;
    const gridDim = Math.max(2, Math.ceil(Math.sqrt(questionCount || 4)));

    const questionStats = Array.from({ length: questionCount }, () => ({
        mistakes: 0,
        isSolved: false,
        totalAttempts: 0
    }));

    currentGameState = {
        questName: questName,
        subject: category,
        category: category,
        teacherName: teacherName || 'Professor Riley',
        configuredChances: typeof chances === 'number' && chances > 0 ? chances : 3,
        questionCount: questionCount,
        gridDimension: gridDim,
        questions: questionList,
        questionStats: questionStats,
        solvedTiles: new Set(),
        processedTiles: new Set(),
        selectedTileIndex: null,
        score: 0,
        startTime: Date.now(),
        remainingChances: typeof chances === 'number' && chances > 0 ? chances : 3,
        disabledOptions: new Set(),
        isProcessing: false,
        dbAttemptId: dbAttemptId
    };

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    renderGameEntrance();
}

function closeQuestModal() {
    clearGameTimeouts();
    if (typeof activeFitbDrag !== 'undefined' && activeFitbDrag) {
        if (activeFitbDrag.avatar && activeFitbDrag.avatar.parentNode) {
            activeFitbDrag.avatar.parentNode.removeChild(activeFitbDrag.avatar);
        }
        activeFitbDrag = null;
    }
    if (typeof activeMatchDrag !== 'undefined') {
        activeMatchDrag = null;
    }
    if (typeof updateMatchConnectionLines === 'function') {
        window.removeEventListener('resize', updateMatchConnectionLines);
    }

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Phase 1: Game Entrance Screen
function renderGameEntrance() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const theme = getQuestThemeStyle(currentGameState.questName, currentGameState.subject || currentGameState.category);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(currentGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: ${theme.bg}; color: ${theme.text};">${escapeHTML((currentGameState.subject || currentGameState.category || '').toUpperCase())} • TILE PUZZLE</div>
            <h2 class="tile-entrance-title">${escapeHTML(currentGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Uncover the puzzle by solving questions! Select tiles on the <strong>${currentGameState.gridDimension} × ${currentGameState.gridDimension} grid</strong> (${currentGameState.questionCount} Questions) to reveal questions and test your knowledge.
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startTileGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> START GAME
            </button>
        </div>
    `;
}

function startTileGame() {
    renderGameBoard();
}

// Phase 2: Tile Board View
function renderGameBoard() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const dim = currentGameState.gridDimension;
    const solvedCount = currentGameState.solvedTiles.size;
    const totalCount = currentGameState.questionCount;
    const pct = Math.round((solvedCount / totalCount) * 100);
    const currentXP = getCurrentQuizXP(currentGameState.questionStats, currentGameState.questName);

    let tileButtonsHtml = "";
    for (let i = 0; i < totalCount; i++) {
        const isSolved = currentGameState.solvedTiles.has(i);
        const isProcessed = currentGameState.processedTiles.has(i);
        const isDisabled = isSolved || isProcessed;
        let buttonClass = 'tile-button';
        if (isSolved) {
            buttonClass += ' solved';
        } else if (isProcessed) {
            buttonClass += ' failed';
        }

        let buttonText = i + 1;
        if (isSolved) {
            buttonText = `<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>`;
        } else if (isProcessed) {
            buttonText = `<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg>`;
        }

        tileButtonsHtml += `
            <button type="button"
                    class="${buttonClass}"
                    id="tile-btn-${i}"
                    onclick="handleTileClick(${i})"
                    ${isDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
    }

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(currentGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-board-view orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg> TILES SOLVED: ${solvedCount} / ${totalCount}</span>
                    <span style="color: var(--color-purple-dark);" id="tile-live-xp"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 17.9V19H7v2h10v-2h-4v-1.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor"/></svg> SCORE: ${currentXP} XP</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <div class="tile-grid-container" style="grid-template-columns: repeat(${dim}, 1fr);">
                ${tileButtonsHtml}
            </div>

            <p style="font-family: var(--font-body); font-size: 0.88rem; color: #546e7a; margin: 0; text-align: center;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 6px;"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Tap any available tile to reveal its question!
            </p>

            <!-- REQUIREMENT 3: TRUE MODAL OVERLAY LAYERED ABOVE TILE GRID -->
            <div class="tile-question-dim-overlay" id="tile-question-overlay">
                <div class="tile-question-card orixa-question-slide" id="tile-question-card">
                    <!-- Dynamic Question Content rendered when tile clicked -->
                </div>
            </div>
        </div>
    `;
}

function handleTileClick(tileIndex) {
    if (currentGameState.solvedTiles.has(tileIndex) || currentGameState.processedTiles.has(tileIndex)) return;

    currentGameState.selectedTileIndex = tileIndex;
    currentGameState.selectedOptionIndex = null;

    const btn = document.getElementById(`tile-btn-${tileIndex}`);
    if (btn) {
        btn.classList.add('flipping');
        setGameTimeout(() => btn.classList.remove('flipping'), 300);
    }

    // REQUIREMENT 3: Open centered question modal overlay in front of dimmed tile grid
    openQuestionModal(tileIndex);
}

// Phase 3: Centered Question Modal Overlay (REQUIREMENT 3 & 9)
function openQuestionModal(tileIndex) {
    const overlay = document.getElementById('tile-question-overlay');
    const card = document.getElementById('tile-question-card');
    if (!overlay || !card) return;

    const question = currentGameState.questions[tileIndex];
    if (!question) return;

    currentGameState.selectedTileIndex = tileIndex;
    currentGameState.remainingChances = currentGameState.configuredChances;
    currentGameState.disabledOptions = new Set();
    currentGameState.isProcessing = false;

    card.innerHTML = `
        <div class="tile-question-header">
            <span class="tile-question-number-badge">TILE #${tileIndex + 1} QUESTION</span>
            <button type="button" class="sidebar-toggle-btn" onclick="closeQuestionModal()" aria-label="Close question modal" style="width: 32px; height: 32px;"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </div>

        <h4 class="tile-question-text">${escapeHTML(question.text)}</h4>

        <div class="tile-options-list" id="tile-options-container">
            ${question.options.map((opt, idx) => `
                <button type="button"
                        class="tile-option-btn"
                        id="option-btn-${idx}"
                        onclick="handleTileOptionSelect(${tileIndex}, ${idx})">
                    <strong style="margin-right: 6px;">${String.fromCharCode(65 + idx)}.</strong> ${escapeHTML(opt)}
                </button>
            `).join('')}
        </div>

        <div id="tile-question-feedback"></div>
    `;

    // Activate dim overlay
    overlay.classList.add('active');
}

function closeQuestionModal() {
    const overlay = document.getElementById('tile-question-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function handleTileOptionSelect(tileIndex, optIndex) {
    if (currentGameState.isProcessing || currentGameState.disabledOptions.has(optIndex)) {
        return;
    }

    const question = currentGameState.questions[tileIndex];
    if (!question) return;

    currentGameState.isProcessing = true;

    const optBtn = document.getElementById(`option-btn-${optIndex}`);
    const feedbackEl = document.getElementById('tile-question-feedback');
    const optionBtns = document.querySelectorAll('.tile-option-btn');
    const stat = currentGameState.questionStats[tileIndex];

    const processOptionResult = (evaluatedIsCorrect) => {
        if (evaluatedIsCorrect) {
            if (optBtn) optBtn.classList.add('correct');
            currentGameState.solvedTiles.add(tileIndex);
            currentGameState.processedTiles.add(tileIndex);
            if (stat) {
                stat.isSolved = true;
                stat.totalAttempts++;
            }

            optionBtns.forEach(btn => btn.disabled = true);

            if (feedbackEl) {
                feedbackEl.innerHTML = `
                    <div class="tile-feedback-box correct">
                        <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg> CORRECT! You revealed Tile #${tileIndex + 1}
                    </div>
                `;
            }

            setGameTimeout(() => {
                currentGameState.isProcessing = false;
                closeQuestionModal();
                renderGameBoard();

                if (currentGameState.processedTiles.size === currentGameState.questionCount) {
                    setGameTimeout(() => renderVictoryScreen(), 300);
                }
            }, 700);
        } else {
            if (stat) {
                stat.mistakes++;
                stat.totalAttempts++;
            }
            currentGameState.remainingChances -= 1;
            currentGameState.disabledOptions.add(optIndex);

            if (optBtn) {
                optBtn.classList.add('incorrect');
                optBtn.disabled = true;
            }

            const remaining = currentGameState.remainingChances;

            if (remaining > 0) {
                if (feedbackEl) {
                    feedbackEl.innerHTML = `
                        <div class="tile-feedback-box incorrect">
                            <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg> INCORRECT! ${remaining} ${remaining === 1 ? 'chance' : 'chances'} remaining. Try again!
                        </div>
                    `;
                }

                setTimeout(() => {
                    currentGameState.isProcessing = false;
                }, 300);
            } else {
                currentGameState.processedTiles.add(tileIndex);
                if (stat) {
                    stat.isSolved = false;
                }

                const correctBtn = document.getElementById(`option-btn-${question.correctAnswer}`);
                if (correctBtn) {
                    correctBtn.classList.add('correct');
                }

                optionBtns.forEach(btn => btn.disabled = true);

                if (feedbackEl) {
                    feedbackEl.innerHTML = `
                        <div class="tile-feedback-box incorrect">
                            <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg> INCORRECT! No chances remaining.
                        </div>
                    `;
                }

                setTimeout(() => {
                    currentGameState.isProcessing = false;
                    closeQuestionModal();
                    renderGameBoard();

                    if (currentGameState.processedTiles.size === currentGameState.questionCount) {
                        setGameTimeout(() => renderVictoryScreen(), 300);
                    }
                }, 1400);
            }
        }
    };

    if (currentGameState.dbAttemptId) {
        const dbQ = currentGameState.questions[tileIndex];
        if (dbQ && dbQ.dbQuestionId && window.OrixaAuth && window.OrixaAuth.client) {
            window.OrixaAuth.client.rpc('fn_submit_question_answer', {
                p_attempt_id: currentGameState.dbAttemptId,
                p_question_id: dbQ.dbQuestionId,
                p_answer_json: { selected_option_index: String(optIndex) }
            }).then(res => {
                const evalIsCorrect = (res && res.data && typeof res.data.is_correct === 'boolean') ? res.data.is_correct : false;
                processOptionResult(evalIsCorrect);
            }).catch(e => {
                console.warn('RPC submit error:', e);
                processOptionResult(false);
            });
            return;
        }
    }

    processOptionResult(false);
}

// Phase 4: Final Victory & 3-Star Winning Sequence
function renderVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const totalMaxXP = getQuestMaxXP(currentGameState.questName);
    const results = calculateQuizResults(currentGameState.questionStats, totalMaxXP);

    if (currentGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        window.OrixaAuth.client.rpc('fn_complete_quiz_attempt', {
            p_attempt_id: currentGameState.dbAttemptId
        }).then(res => {
            if (res.error) console.warn('Complete tile quiz RPC error:', res.error);
        });
    }

    addCompletedQuiz(currentGameState.questName, results.earnedXP, results.accuracy, results.stars);

    const totalTimeSeconds = Math.max(1, Math.round((Date.now() - currentGameState.startTime) / 1000));

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title" id="tile-modal-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            ${renderStarsRowHtml(results.stars)}
            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                ${results.stars === 3 ? 'PERFECT PUZZLE SOLVED!' : (results.stars >= 1 ? 'QUEST COMPLETED!' : 'QUEST FINISHED')}
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                Awesome job! You finished <strong>"${escapeHTML(currentGameState.questName)}"</strong>!
            </p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${results.accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">EARNED XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+${results.earnedXP} XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TILES SOLVED</span>
                    <div class="orixa-stat-box-value" style="color: var(--border-dark);">${currentGameState.solvedTiles.size} / ${currentGameState.questionCount}</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TIME TAKEN</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-blue-dark);">${totalTimeSeconds}s</div>
                </div>
            </div>

            <button type="button" class="orixa-done-btn" onclick="closeQuestModal()" style="margin-top: 8px;">
                DONE
            </button>
        </div>
    `;
}

function addXPPoints(amount) {
    const xpValueElement = document.getElementById('stat-xp');
    if (!xpValueElement) {
        return;
    }

    let currentXP = parseInt(xpValueElement.textContent.replace(/,/g, ''), 10);
    currentXP += amount;
    xpValueElement.textContent = currentXP.toLocaleString();
}

function hideCompletedQuizzes() {
    const questCards = document.querySelectorAll('.student-quest-grid .quest-card');
    questCards.forEach(card => {
        const title = (card.getAttribute('data-title') || card.querySelector('.quiz-mgmt-card-title')?.textContent || '').trim();
        if (title && completedQuizzes.has(title)) {
            card.classList.add('completed-hidden');
            card.style.display = 'none';
        }
    });

    filterQuizzes();
}

function addCompletedQuiz(questName, earnedXP = 0, accuracy = 100, stars = 3) {
    if (questName) {
        completedQuizzes.add(questName);
    }

    const playedValueElement = document.getElementById('stat-quizzes-played');
    if (playedValueElement) {
        let played = parseInt(playedValueElement.textContent, 10);
        played++;
        playedValueElement.textContent = played;
    }

    if (earnedXP > 0) {
        addXPPoints(earnedXP);
    }

    const starsValueElement = document.getElementById('stat-stars');
    if (starsValueElement) {
        let currentStars = parseInt(starsValueElement.textContent, 10);
        currentStars += (typeof stars === 'number' ? stars : 0);
        starsValueElement.textContent = currentStars;
    }

    const accuracyValueElement = document.getElementById('stat-accuracy');
    if (accuracyValueElement && typeof accuracy === 'number') {
        accuracyValueElement.textContent = accuracy + '%';
    }

    hideCompletedQuizzes();
}

function filterQuizzes() {
    const searchInput = document.getElementById('student-quiz-search');
    const noResults = document.getElementById('no-quizzes-found');
    const questCards = document.querySelectorAll('.student-quest-grid .quest-card');

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;
    let totalAvailable = 0;

    questCards.forEach(card => {
        if (card.classList.contains('completed-hidden')) {
            card.style.display = 'none';
            return;
        }

        totalAvailable++;

        const title = (card.getAttribute('data-title') || card.querySelector('.quiz-mgmt-card-title')?.textContent || '').toLowerCase();
        const subject = (card.getAttribute('data-subject') || card.querySelector('.quiz-mgmt-card-subject')?.textContent || '').toLowerCase();
        const topic = (card.getAttribute('data-topic') || '').toLowerCase();

        const matches = query === '' || title.includes(query) || subject.includes(query) || topic.includes(query);

        if (matches) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (noResults) {
        if (visibleCount === 0) {
            const titleEl = noResults.querySelector('.quiz-mgmt-no-results-title');
            const descEl = noResults.querySelector('.quiz-mgmt-no-results-desc');

            if (totalAvailable === 0) {
                if (titleEl) titleEl.textContent = 'All quizzes done for now!';
                if (descEl) descEl.textContent = 'There are currently no more quizzes available. Please check back later for new quests!';
            } else {
                if (titleEl) titleEl.textContent = 'No quizzes found';
                if (descEl) descEl.textContent = 'Try searching with a different title, subject, or topic.';
            }

            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }
}

function openStudentProfileModal() {
    const modal = document.getElementById('student-profile-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeStudentProfileModal() {
    const modal = document.getElementById('student-profile-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   GAME 2: MATCH THE FOLLOWING ENGINE
   ========================================================================== */

let matchGameState = {
    questName: "",
    category: "",
    pairs: [], // Original pairs { id, text, answer }
    questions: [], // Left column { id, text }
    answers: [], // Right column { id, answer } (shuffled)
    matches: new Map(), // q.id -> a.id
    selectedQuestionId: null, // For tap selection
    incorrectAttempts: 0,
    startTime: 0
};

let activeMatchDrag = null;

function openMatchGame(questName, category, teacherName = 'Professor Riley', chances = 3, dbAttemptId = null, dbQuestions = null) {
    let pairs = [];

    if (dbQuestions && dbQuestions.length > 0) {
        pairs = dbQuestions.map((q, idx) => ({
            id: q.dbQuestionId || `m${idx + 1}`,
            text: q.text,
            answer: q.answer
        }));
    }

    // Left questions order
    const questions = pairs.map(p => ({ id: p.id, text: p.text }));

    // Right answers shuffled (Fisher-Yates)
    const answers = pairs.map(p => ({ id: p.id, answer: p.answer }));
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    const parsedChances = typeof chances === 'number' && chances > 0 ? chances : 3;

    const pairStats = pairs.map(p => ({
        id: p.id,
        mistakes: 0,
        isSolved: false,
        totalAttempts: 0
    }));

    matchGameState = {
        questName: questName,
        subject: category,
        category: category,
        teacherName: teacherName || 'Professor Riley',
        configuredChances: parsedChances,
        pairs: pairs,
        questions: questions,
        answers: answers,
        pairStats: pairStats,
        matches: new Map(),
        failedPairs: new Set(),
        selectedQuestionId: null,
        selectedAnswerId: null,
        incorrectAttempts: 0,
        startTime: Date.now(),
        dbAttemptId: dbAttemptId,
        dbQuestions: dbQuestions
    };

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    renderMatchEntrance();
}

function renderMatchEntrance() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const theme = getQuestThemeStyle(matchGameState.questName, matchGameState.subject || matchGameState.category);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(matchGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: ${theme.bg}; color: ${theme.text};">
                ${escapeHTML((matchGameState.subject || matchGameState.category || 'General Science').toUpperCase())} • MATCH THE FOLLOWING
            </div>
            <h2 class="tile-entrance-title">${escapeHTML(matchGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Connect each question or prompt on the left with its correct answer on the right to complete all <strong>${matchGameState.pairs.length} pairs</strong>!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startMatchGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> START GAME
            </button>
        </div>
    `;
}

function startMatchGame() {
    renderMatchGameBoard();
}

function renderMatchGameBoard() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const matchedCount = matchGameState.matches.size;
    const totalPairs = matchGameState.pairs.length;
    const pct = Math.round((matchedCount / totalPairs) * 100);
    const currentXP = getCurrentQuizXP(matchGameState.pairStats, matchGameState.questName);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(matchGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="match-game-container orixa-game-slide-enter" id="match-game-container">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 6h6M9 18l6-12" stroke="currentColor" stroke-width="2"/></svg> PAIRS MATCHED: ${matchedCount} / ${totalPairs}</span>
                    <span style="color: var(--color-purple-dark);" id="match-live-xp"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 17.9V19H7v2h10v-2h-4v-1.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor"/></svg> SCORE: ${currentXP} XP</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <svg class="match-svg-overlay" id="match-svg-overlay"></svg>

            <div class="match-columns-grid">
                <div class="match-column">
                    <h4 class="match-column-title">Questions</h4>
                    ${matchGameState.questions.map(q => {
                        const isMatched = matchGameState.matches.has(q.id);
                        const isFailed = matchGameState.failedPairs.has(q.id);
                        const isSelected = matchGameState.selectedQuestionId === q.id;
                        return `
                            <div class="match-card match-question-card ${isMatched ? 'is-matched' : ''} ${isFailed ? 'is-matched' : ''} ${isSelected ? 'is-selected' : ''}"
                                 data-q-id="${q.id}"
                                 id="q-card-${q.id}">
                                <span>${escapeHTML(q.text)}</span>
                                <span class="match-card-dot" id="q-dot-${q.id}"></span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="match-column">
                    <h4 class="match-column-title">Possible Answers</h4>
                    ${matchGameState.answers.map(a => {
                        const isMatched = Array.from(matchGameState.matches.values()).includes(a.id);
                        const isFailed = matchGameState.failedPairs.has(a.id);
                        const isSelected = matchGameState.selectedAnswerId === a.id;
                        return `
                            <div class="match-card match-answer-card ${isMatched ? 'is-matched' : ''} ${isFailed ? 'is-matched' : ''} ${isSelected ? 'is-selected' : ''}"
                                 data-a-id="${a.id}"
                                 id="a-card-${a.id}">
                                <span class="match-card-dot" id="a-dot-${a.id}"></span>
                                <span>${escapeHTML(a.answer)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <p style="font-family: var(--font-body); font-size: 0.88rem; color: #546e7a; margin: 4px 0 0 0; text-align: center;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 6px;"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Drag from a question to its answer, or tap a question and then tap its matching answer!
            </p>
        </div>
    `;

    setupMatchInteractions();
    updateMatchConnectionLines();

    requestAnimationFrame(() => {
        updateMatchConnectionLines();
    });

    const matchContainer = document.getElementById('match-game-container');
    if (matchContainer) {
        matchContainer.addEventListener('animationend', () => {
            updateMatchConnectionLines();
        }, { once: true });
    }

    setGameTimeout(() => {
        updateMatchConnectionLines();
    }, 360);
}

function getCircleCenterCoordinates(circleEl, containerEl) {
    if (!circleEl || !containerEl) return { x: 0, y: 0 };
    const circleRect = circleEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    if (circleRect.width === 0 || circleRect.height === 0 || containerRect.width === 0 || containerRect.height === 0) {
        return { x: 0, y: 0 };
    }
    return {
        x: (circleRect.left + circleRect.width / 2) - containerRect.left,
        y: (circleRect.top + circleRect.height / 2) - containerRect.top
    };
}

function setupMatchInteractions() {
    const container = document.getElementById('match-game-container');
    if (!container) return;

    // Question Cards (Pointer Down / Drag / Tap)
    const qCards = container.querySelectorAll('.match-question-card');
    qCards.forEach(card => {
        const qId = card.dataset.qId;

        card.addEventListener('pointerdown', (e) => {
            if (matchGameState.matches.has(qId) || matchGameState.failedPairs.has(qId)) return;

            const prevAnsId = matchGameState.selectedAnswerId;

            activeMatchDrag = {
                qId: qId,
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                isDrag: false
            };

            if (prevAnsId) {
                attemptMatch(qId, prevAnsId);
                return;
            }

            matchGameState.selectedQuestionId = qId;
            qCards.forEach(qc => {
                if (!matchGameState.matches.has(qc.dataset.qId) && !matchGameState.failedPairs.has(qc.dataset.qId)) {
                    qc.classList.toggle('is-selected', qc.dataset.qId === qId);
                }
            });

            if (card.setPointerCapture) {
                try { card.setPointerCapture(e.pointerId); } catch(err) {}
            }
        });

        card.addEventListener('pointermove', (e) => {
            if (!activeMatchDrag || activeMatchDrag.qId !== qId) return;

            const dist = Math.hypot(e.clientX - activeMatchDrag.startX, e.clientY - activeMatchDrag.startY);
            if (dist > 6) {
                activeMatchDrag.isDrag = true;
            }

            if (activeMatchDrag.isDrag) {
                drawDragLine(e.clientX, e.clientY);

                const elem = document.elementFromPoint(e.clientX, e.clientY);
                const aCard = elem ? elem.closest('.match-answer-card') : null;

                container.querySelectorAll('.match-answer-card').forEach(ac => {
                    if (aCard && ac === aCard && !Array.from(matchGameState.matches.values()).includes(ac.dataset.aId)) {
                        ac.classList.add('is-hovered');
                    } else {
                        ac.classList.remove('is-hovered');
                    }
                });
            }
        });

        const handlePointerEnd = (e) => {
            if (!activeMatchDrag || activeMatchDrag.qId !== qId) return;

            const dragData = activeMatchDrag;
            activeMatchDrag = null;

            if (card.releasePointerCapture) {
                try { card.releasePointerCapture(e.pointerId); } catch(err) {}
            }

            container.querySelectorAll('.match-answer-card').forEach(ac => ac.classList.remove('is-hovered'));
            removeTempDragLine();

            if (dragData.isDrag) {
                const elem = document.elementFromPoint(e.clientX, e.clientY);
                const aCard = elem ? elem.closest('.match-answer-card') : null;

                if (aCard) {
                    const aId = aCard.dataset.aId;
                    attemptMatch(qId, aId);
                }
            }
        };

        card.addEventListener('pointerup', handlePointerEnd);
        card.addEventListener('pointercancel', handlePointerEnd);
    });

    // Answer Cards (Tap Selection)
    const aCards = container.querySelectorAll('.match-answer-card');
    aCards.forEach(card => {
        const aId = card.dataset.aId;

        card.addEventListener('click', () => {
            if (Array.from(matchGameState.matches.values()).includes(aId) || matchGameState.failedPairs.has(aId)) return;

            if (matchGameState.selectedQuestionId) {
                const qId = matchGameState.selectedQuestionId;
                attemptMatch(qId, aId);
            } else {
                matchGameState.selectedAnswerId = aId;
                aCards.forEach(ac => {
                    if (!Array.from(matchGameState.matches.values()).includes(ac.dataset.aId) && !matchGameState.failedPairs.has(ac.dataset.aId)) {
                        ac.classList.toggle('is-selected', ac.dataset.aId === aId);
                    }
                });
            }
        });
    });

    // Window resize handler for SVG lines
    window.removeEventListener('resize', updateMatchConnectionLines);
    window.addEventListener('resize', updateMatchConnectionLines);
}

function drawDragLine(pointerX, pointerY) {
    if (!activeMatchDrag) return;
    const container = document.getElementById('match-game-container');
    const svg = document.getElementById('match-svg-overlay');
    if (!container || !svg) return;

    const qDot = document.getElementById(`q-dot-${activeMatchDrag.qId}`);
    if (!qDot) return;

    const startPos = getCircleCenterCoordinates(qDot, svg);

    const svgRect = svg.getBoundingClientRect();
    const endX = pointerX - svgRect.left;
    const endY = pointerY - svgRect.top;

    let tempLine = document.getElementById('temp-drag-line');
    if (!tempLine) {
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempLine.setAttribute('id', 'temp-drag-line');
        tempLine.setAttribute('class', 'match-connection-line');
        tempLine.setAttribute('stroke', 'var(--color-yellow)');
        tempLine.setAttribute('stroke-width', '4');
        tempLine.setAttribute('stroke-dasharray', '6,6');
        svg.appendChild(tempLine);
    }

    tempLine.setAttribute('x1', startPos.x);
    tempLine.setAttribute('y1', startPos.y);
    tempLine.setAttribute('x2', endX);
    tempLine.setAttribute('y2', endY);
}

function removeTempDragLine() {
    const tempLine = document.getElementById('temp-drag-line');
    if (tempLine) tempLine.remove();
}

function attemptMatch(qId, aId) {
    if (matchGameState.matches.has(qId) || matchGameState.failedPairs.has(qId)) return;
    if (Array.from(matchGameState.matches.values()).includes(aId) || matchGameState.failedPairs.has(aId)) return;

    const stat = matchGameState.pairStats ? matchGameState.pairStats.find(p => p.id === qId) : null;

    const processMatchResult = (evaluatedIsCorrect) => {
        if (evaluatedIsCorrect) {
            if (stat) {
                stat.isSolved = true;
                stat.totalAttempts++;
            }
            matchGameState.matches.set(qId, aId);
            matchGameState.selectedQuestionId = null;
            matchGameState.selectedAnswerId = null;

            renderMatchGameBoard();

            if (matchGameState.matches.size + matchGameState.failedPairs.size === matchGameState.pairs.length) {
                setGameTimeout(renderMatchVictoryScreen, 600);
            }
        } else {
            if (stat) {
                stat.mistakes++;
                stat.totalAttempts++;
            }
            matchGameState.incorrectAttempts++;
            matchGameState.selectedQuestionId = null;
            matchGameState.selectedAnswerId = null;

            const qCard = document.getElementById(`q-card-${qId}`);
            const aCard = document.getElementById(`a-card-${aId}`);

            if (qCard) qCard.classList.add('is-wrong');
            if (aCard) aCard.classList.add('is-wrong');

            drawErrorLine(qId, aId);

            setGameTimeout(() => {
                if (qCard) qCard.classList.remove('is-wrong');
                if (aCard) aCard.classList.remove('is-wrong');

                const errLine = document.getElementById(`err-line-${qId}-${aId}`);
                if (errLine) errLine.remove();

                renderMatchGameBoard();
            }, 600);
        }
    };

    if (matchGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        const matchingDbQ = matchGameState.dbQuestions ? matchGameState.dbQuestions.find(q => q.dbQuestionId === qId) : null;
        const targetQId = matchingDbQ ? matchingDbQ.dbQuestionId : (matchGameState.dbQuestions && matchGameState.dbQuestions[0] ? matchGameState.dbQuestions[0].dbQuestionId : qId);

        const pairsPayload = Array.from(matchGameState.matches.entries()).map(([q, a]) => ({ id: q, choice: a }));
        pairsPayload.push({ id: qId, choice: aId });

        window.OrixaAuth.client.rpc('fn_submit_question_answer', {
            p_attempt_id: matchGameState.dbAttemptId,
            p_question_id: targetQId,
            p_answer_json: { pairs: pairsPayload }
        }).then(res => {
            const evalIsCorrect = (res && res.data && typeof res.data.is_correct === 'boolean') ? res.data.is_correct : false;
            processMatchResult(evalIsCorrect);
        }).catch(e => {
            console.warn('RPC match pair error:', e);
            processMatchResult(false);
        });
        return;
    }

    processMatchResult(qId === aId);
}

function drawErrorLine(qId, aId) {
    const container = document.getElementById('match-game-container');
    const svg = document.getElementById('match-svg-overlay');
    if (!container || !svg) return;

    const qDot = document.getElementById(`q-dot-${qId}`);
    const aDot = document.getElementById(`a-dot-${aId}`);
    if (!qDot || !aDot) return;

    const startPos = getCircleCenterCoordinates(qDot, svg);
    const endPos = getCircleCenterCoordinates(aDot, svg);

    let errLine = document.getElementById('temp-error-line');
    if (!errLine) {
        errLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        errLine.setAttribute('id', 'temp-error-line');
        errLine.setAttribute('class', 'match-connection-line');
        errLine.setAttribute('stroke', 'var(--color-red)');
        errLine.setAttribute('stroke-width', '4');
        svg.appendChild(errLine);
    }

    errLine.setAttribute('x1', startPos.x);
    errLine.setAttribute('y1', startPos.y);
    errLine.setAttribute('x2', endPos.x);
    errLine.setAttribute('y2', endPos.y);
}

function removeErrorLine() {
    const errLine = document.getElementById('temp-error-line');
    if (errLine) errLine.remove();
}

function updateMatchConnectionLines() {
    const container = document.getElementById('match-game-container');
    const svg = document.getElementById('match-svg-overlay');
    if (!container || !svg) return;

    // Clear existing permanent lines
    svg.querySelectorAll('.match-permanent-line').forEach(el => el.remove());

    matchGameState.matches.forEach((aId, qId) => {
        const qDot = document.getElementById(`q-dot-${qId}`);
        const aDot = document.getElementById(`a-dot-${aId}`);
        if (!qDot || !aDot) return;

        const startPos = getCircleCenterCoordinates(qDot, svg);
        const endPos = getCircleCenterCoordinates(aDot, svg);

        if ((startPos.x === 0 && startPos.y === 0) || (endPos.x === 0 && endPos.y === 0)) {
            return;
        }

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'match-connection-line match-permanent-line');
        line.setAttribute('x1', startPos.x);
        line.setAttribute('y1', startPos.y);
        line.setAttribute('x2', endPos.x);
        line.setAttribute('y2', endPos.y);
        line.setAttribute('stroke', 'var(--color-green)');
        line.setAttribute('stroke-width', '4');

        svg.appendChild(line);
    });
}

function renderMatchVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const totalMaxXP = getQuestMaxXP(matchGameState.questName);
    const results = calculateQuizResults(matchGameState.pairStats, totalMaxXP);

    if (matchGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        window.OrixaAuth.client.rpc('fn_complete_quiz_attempt', {
            p_attempt_id: matchGameState.dbAttemptId
        }).then(res => {
            if (res.error) console.warn('Complete match quiz RPC error:', res.error);
        });
    }

    addCompletedQuiz(matchGameState.questName, results.earnedXP, results.accuracy, results.stars);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - matchGameState.startTime) / 1000));
    const totalPairs = matchGameState.pairs.length;

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title" id="tile-modal-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            ${renderStarsRowHtml(results.stars)}

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                ${results.stars === 3 ? 'AMAZING MATCHING!' : (results.stars >= 1 ? 'MATCHING COMPLETED!' : 'QUEST FINISHED')}
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                You connected all ${totalPairs} pairs in <strong>"${escapeHTML(matchGameState.questName)}"</strong>!
            </p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${results.accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">EARNED XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+${results.earnedXP} XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">PAIRS MATCHED</span>
                    <div class="orixa-stat-box-value" style="color: var(--border-dark);">${totalPairs} / ${totalPairs}</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TIME TAKEN</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-blue-dark);">${elapsedSeconds}s</div>
                </div>
            </div>

            <button type="button" class="orixa-done-btn" onclick="closeQuestModal()" style="margin-top: 8px;">
                DONE
            </button>
        </div>
    `;
}

/* ==========================================================================
   GAME 3: FILL IN THE BLANKS ENGINE
   ========================================================================== */

let fillBlanksGameState = {
    questName: "",
    category: "",
    teacherName: "Professor Riley",
    configuredChances: 3,
    remainingChances: 3,
    questions: [], // { statement, blankAnswer, options, correctAnswer }
    currentIndex: 0,
    incorrectAttempts: 0,
    startTime: 0,
    selectedOption: null,
    isProcessing: false
};

function openFillBlanksGame(questName, category, customQuestions = null, chances = 3, teacherName = 'Professor Riley', dbAttemptId = null) {
    const questionsSource = (customQuestions && customQuestions.length > 0) ? customQuestions : [];

    // Map & prepare questions with shuffled options while preserving correct answer logic
    const preparedQuestions = questionsSource.map(q => {
        const stmt = q.statement || q.text || "";
        const blank = q.blankAnswer || "";
        let rawOpts = (q.options && q.options.length > 0) ? [...q.options] : [];
        if (rawOpts.length === 0 && blank) {
            rawOpts = [blank, "Option A", "Option B", "Option C"];
        }

        const correctText = (q.correctAnswer !== undefined && q.correctAnswer !== null && rawOpts[q.correctAnswer])
            ? rawOpts[q.correctAnswer]
            : (blank || rawOpts[0]);

        // Fisher-Yates shuffle options
        const shuffledOpts = [...rawOpts];
        for (let i = shuffledOpts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
        }

        return {
            statement: stmt,
            blankAnswer: blank,
            options: shuffledOpts,
            correctAnswerText: correctText
        };
    });

    const parsedChances = typeof chances === 'number' && chances > 0 ? chances : 3;

    const questionStats = preparedQuestions.map(() => ({
        mistakes: 0,
        isSolved: false,
        totalAttempts: 0
    }));

    fillBlanksGameState = {
        questName: questName,
        subject: category,
        category: category,
        teacherName: teacherName || 'Professor Riley',
        configuredChances: parsedChances,
        remainingChances: parsedChances,
        questions: preparedQuestions,
        questionStats: questionStats,
        currentIndex: 0,
        incorrectAttempts: 0,
        startTime: Date.now(),
        selectedOption: null,
        isProcessing: false,
        dbAttemptId: dbAttemptId
    };

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    renderFillBlanksEntrance();
}

function renderFillBlanksEntrance() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const theme = getQuestThemeStyle(fillBlanksGameState.questName, fillBlanksGameState.subject || fillBlanksGameState.category);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(fillBlanksGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: ${theme.bg}; color: ${theme.text};">
                ${escapeHTML((fillBlanksGameState.subject || fillBlanksGameState.category || 'General Science').toUpperCase())} • FILL IN THE BLANKS
            </div>
            <h2 class="tile-entrance-title">${escapeHTML(fillBlanksGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Drag the correct answer option from the answer box and place it into the blank in each statement to complete all <strong>${fillBlanksGameState.questions.length} questions</strong>!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startFillBlanksGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> START GAME
            </button>
        </div>
    `;
}

function startFillBlanksGame() {
    renderFillBlanksGameBoard();
}

let activeFitbDrag = null;

function renderFillBlanksGameBoard() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const currentQ = fillBlanksGameState.questions[fillBlanksGameState.currentIndex];
    const totalQ = fillBlanksGameState.questions.length;
    const currentNum = fillBlanksGameState.currentIndex + 1;
    const pct = Math.round(((currentNum - 1) / totalQ) * 100);
    const currentXP = getCurrentQuizXP(fillBlanksGameState.questionStats, fillBlanksGameState.questName);

    // Build current statement with drop target
    const statement = currentQ.statement;
    const blankWord = currentQ.blankAnswer;

    let sentenceHtml = "";
    if (blankWord && statement.includes(blankWord)) {
        const parts = statement.split(blankWord);
        sentenceHtml = `${escapeHTML(parts[0])}<span class="fitb-drop-target" id="fitb-drop-target" data-blank-target="true">______</span>${escapeHTML(parts.slice(1).join(blankWord))}`;
    } else {
        sentenceHtml = `${escapeHTML(statement)} <span class="fitb-drop-target" id="fitb-drop-target" data-blank-target="true">______</span>`;
    }

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(fillBlanksGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="fitb-game-container orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>QUESTION ${currentNum} OF ${totalQ}</span>
                    <span style="color: var(--color-purple-dark);" id="fitb-live-xp"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 17.9V19H7v2h10v-2h-4v-1.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor"/></svg> SCORE: ${currentXP} XP</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <div class="fitb-sentence-box orixa-question-slide">
                ${sentenceHtml}
            </div>

            <div id="fitb-feedback-banner" style="min-height: 24px; text-align: center; font-family: var(--font-header); font-size: 0.95rem; font-weight: 700;"></div>

            <div class="fitb-options-box" id="fitb-options-box">
                ${currentQ.options.map((optText, idx) => `
                    <div class="fitb-option-card" data-option-text="${escapeHTML(optText)}" data-option-idx="${idx}" draggable="false">
                        ${escapeHTML(optText)}
                    </div>
                `).join('')}
            </div>

            <div style="font-family: var(--font-header); font-size: 0.95rem; color: #546e7a; text-align: center; margin-top: 4px;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 6px;"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Drag an option into the blank, or tap an option and tap the blank!
            </div>
        </div>
    `;

    setupFitbInteractions();
}

function setupFitbInteractions() {
    const container = document.querySelector('.fitb-game-container');
    if (!container) return;

    const target = document.getElementById('fitb-drop-target');
    const optionCards = container.querySelectorAll('.fitb-option-card');

    optionCards.forEach(card => {
        const optionText = card.dataset.optionText;

        // Pointer Dragging (Mouse & Touch)
        card.addEventListener('pointerdown', (e) => {
            if (fillBlanksGameState.isProcessing) return;
            e.preventDefault();
            const rect = card.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            // Keep original card in place so remaining options do NOT reflow or shift
            card.style.opacity = '0.35';
            if (target) target.classList.add('is-target-active');

            // Create floating drag avatar on document.body
            const dragAvatar = document.createElement('div');
            dragAvatar.className = 'fitb-drag-avatar';
            dragAvatar.textContent = optionText;
            dragAvatar.style.cssText = `
                position: fixed;
                left: ${e.clientX - offsetX}px;
                top: ${e.clientY - offsetY}px;
                padding: 12px 24px;
                background: #ffffff;
                border: 3px solid var(--border-dark);
                border-radius: 14px;
                font-family: var(--font-header);
                font-size: 1.15rem;
                color: var(--border-dark);
                box-shadow: 0 10px 20px rgba(0,0,0,0.25);
                transform: scale(1.05) rotate(-2deg);
                z-index: 9999;
                pointer-events: none;
                user-select: none;
                touch-action: none;
            `;
            document.body.appendChild(dragAvatar);

            activeFitbDrag = {
                card: card,
                avatar: dragAvatar,
                optionText: optionText,
                offsetX: offsetX,
                offsetY: offsetY,
                pointerId: e.pointerId
            };

            try {
                card.setPointerCapture(e.pointerId);
            } catch (err) {}
        });

        card.addEventListener('pointermove', (e) => {
            if (!activeFitbDrag || activeFitbDrag.card !== card || !activeFitbDrag.avatar) return;
            const left = e.clientX - activeFitbDrag.offsetX;
            const top = e.clientY - activeFitbDrag.offsetY;
            const avatar = activeFitbDrag.avatar;
            requestAnimationFrame(() => {
                if (avatar) {
                    avatar.style.left = `${left}px`;
                    avatar.style.top = `${top}px`;
                }
            });
        });

        const handlePointerEnd = (e) => {
            if (!activeFitbDrag || activeFitbDrag.card !== card) return;

            const dragInfo = activeFitbDrag;
            activeFitbDrag = null;

            try {
                card.releasePointerCapture(e.pointerId);
            } catch (err) {}

            // Remove drag avatar from DOM
            if (dragInfo.avatar && dragInfo.avatar.parentNode) {
                dragInfo.avatar.parentNode.removeChild(dragInfo.avatar);
            }

            // Restore original card opacity
            card.style.opacity = '';
            if (target) target.classList.remove('is-target-active');

            // Find element under pointer
            const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            const droppedOnTarget = elemBelow ? elemBelow.closest('#fitb-drop-target') : null;

            if (droppedOnTarget) {
                attemptFitbAnswer(optionText, card);
            }
        };

        card.addEventListener('pointerup', handlePointerEnd);
        card.addEventListener('pointercancel', handlePointerEnd);

        // Tap Selection Fallback
        card.addEventListener('click', () => {
            if (fillBlanksGameState.isProcessing) return;
            optionCards.forEach(c => c.classList.remove('is-selected'));
            card.classList.add('is-selected');
            fillBlanksGameState.selectedOption = { text: optionText, card: card };
        });
    });

    if (target) {
        target.addEventListener('click', () => {
            if (fillBlanksGameState.isProcessing) return;
            if (fillBlanksGameState.selectedOption) {
                const { text, card } = fillBlanksGameState.selectedOption;
                attemptFitbAnswer(text, card);
            }
        });
    }
}

function attemptFitbAnswer(optionText, card) {
    if (fillBlanksGameState.isProcessing) return;

    const currentQ = fillBlanksGameState.questions[fillBlanksGameState.currentIndex];
    const target = document.getElementById('fitb-drop-target');
    if (!target) return;

    fillBlanksGameState.isProcessing = true;
    fillBlanksGameState.selectedOption = null;

    const currentStat = fillBlanksGameState.questionStats ? fillBlanksGameState.questionStats[fillBlanksGameState.currentIndex] : null;

    const isCorrectFallback = (optionText === currentQ.correctAnswerText) ||
                              (currentQ.blankAnswer && optionText.toLowerCase() === currentQ.blankAnswer.toLowerCase());

    const processFitbResult = (evaluatedIsCorrect) => {
        if (evaluatedIsCorrect) {
            if (currentStat) {
                currentStat.isSolved = true;
                currentStat.totalAttempts++;
            }

            // Correct feedback
            target.textContent = optionText;
            target.classList.remove('is-incorrect', 'is-target-active');
            target.classList.add('is-correct');

            if (card) {
                card.style.visibility = 'hidden';
            }

            // Transition to next question or victory screen
            setTimeout(() => {
                fillBlanksGameState.isProcessing = false;
                fillBlanksGameState.currentIndex++;
                fillBlanksGameState.remainingChances = fillBlanksGameState.configuredChances;
                if (fillBlanksGameState.currentIndex >= fillBlanksGameState.questions.length) {
                    renderFitbVictoryScreen();
                } else {
                    renderFillBlanksGameBoard();
                }
            }, 700);

        } else {
            if (currentStat) {
                currentStat.mistakes++;
                currentStat.totalAttempts++;
            }

            // Incorrect feedback
            fillBlanksGameState.incorrectAttempts++;
            fillBlanksGameState.remainingChances--;

            target.textContent = optionText;
            target.classList.remove('is-target-active');
            target.classList.add('is-incorrect');

            const feedbackEl = document.getElementById('fitb-feedback-banner');

            if (fillBlanksGameState.remainingChances > 0) {
                if (feedbackEl) {
                    feedbackEl.style.color = "var(--color-red-dark)";
                    feedbackEl.innerHTML = `Incorrect! ${fillBlanksGameState.remainingChances} ${fillBlanksGameState.remainingChances === 1 ? 'chance' : 'chances'} remaining. Try again!`;
                }

                // Chances remain: keep correct answer hidden, allow trying again
                setTimeout(() => {
                    target.textContent = "______";
                    target.classList.remove('is-incorrect');
                    if (card) {
                        card.classList.remove('is-selected', 'is-dragging');
                        card.style.opacity = '';
                    }
                    if (feedbackEl) feedbackEl.innerHTML = '';
                    fillBlanksGameState.isProcessing = false;
                }, 600);
            } else {
                if (currentStat) {
                    currentStat.isSolved = false;
                }

                if (feedbackEl) {
                    feedbackEl.style.color = "var(--color-red-dark)";
                    feedbackEl.innerHTML = `Incorrect! No chances remaining.`;
                }

                // All chances exhausted: move forward
                setTimeout(() => {
                    fillBlanksGameState.isProcessing = false;
                    fillBlanksGameState.currentIndex++;
                    fillBlanksGameState.remainingChances = fillBlanksGameState.configuredChances;
                    if (fillBlanksGameState.currentIndex >= fillBlanksGameState.questions.length) {
                        renderFitbVictoryScreen();
                    } else {
                        renderFillBlanksGameBoard();
                    }
                }, 1200);
            }
        }
    };

    if (fillBlanksGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        const dbQ = fillBlanksGameState.questions[fillBlanksGameState.currentIndex];
        if (dbQ && dbQ.dbQuestionId) {
            window.OrixaAuth.client.rpc('fn_submit_question_answer', {
                p_attempt_id: fillBlanksGameState.dbAttemptId,
                p_question_id: dbQ.dbQuestionId,
                p_answer_json: { submitted_words: [optionText] }
            }).then(res => {
                const evalIsCorrect = (res && res.data && typeof res.data.is_correct === 'boolean') ? res.data.is_correct : isCorrectFallback;
                processFitbResult(evalIsCorrect);
            }).catch(e => {
                console.warn('RPC fitb error:', e);
                processFitbResult(isCorrectFallback);
            });
            return;
        }
    }

    processFitbResult(isCorrectFallback);
}

function renderFitbVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const totalMaxXP = getQuestMaxXP(fillBlanksGameState.questName);
    const results = calculateQuizResults(fillBlanksGameState.questionStats, totalMaxXP);

    if (fillBlanksGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        window.OrixaAuth.client.rpc('fn_complete_quiz_attempt', {
            p_attempt_id: fillBlanksGameState.dbAttemptId
        }).then(res => {
            if (res.error) console.warn('Complete fill blanks quiz RPC error:', res.error);
        });
    }

    addCompletedQuiz(fillBlanksGameState.questName, results.earnedXP, results.accuracy, results.stars);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - fillBlanksGameState.startTime) / 1000));
    const totalQ = fillBlanksGameState.questions.length;

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title" id="tile-modal-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            ${renderStarsRowHtml(results.stars)}

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                ${results.stars === 3 ? 'BLANKS COMPLETED!' : (results.stars >= 1 ? 'QUEST COMPLETED!' : 'QUEST FINISHED')}
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                You evaluated all ${totalQ} statements in <strong>"${escapeHTML(fillBlanksGameState.questName)}"</strong>!
            </p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${results.accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">EARNED XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+${results.earnedXP} XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">STATEMENTS</span>
                    <div class="orixa-stat-box-value" style="color: var(--border-dark);">${totalQ} / ${totalQ}</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TIME TAKEN</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-blue-dark);">${elapsedSeconds}s</div>
                </div>
            </div>

            <button type="button" class="orixa-done-btn" onclick="closeQuestModal()" style="margin-top: 8px;">
                DONE
            </button>
        </div>
    `;
}

/* ==========================================================================
   GAME 4: TRUE OR FALSE ENGINE
   ========================================================================== */

let trueFalseGameState = {
    questName: "",
    category: "",
    teacherName: "Professor Riley",
    configuredChances: 1,
    remainingChances: 1,
    questions: [], // { statement, correctAnswer: true/false }
    currentIndex: 0,
    correctAnswersCount: 0,
    incorrectAttemptsCount: 0,
    startTime: 0,
    isProcessing: false
};

function openTrueFalseGame(questName, category, customQuestions = null, teacherName = 'Professor Riley', chances = 1, dbAttemptId = null) {
    const rawSource = (customQuestions && customQuestions.length > 0) ? customQuestions : [];

    const preparedQuestions = rawSource.map(q => {
        const stmt = q.statement || q.text || "";
        let boolAnswer = false;
        if (typeof q.correctAnswer === 'boolean') {
            boolAnswer = q.correctAnswer;
        } else if (typeof q.correctAnswer === 'string') {
            boolAnswer = q.correctAnswer.toUpperCase() === 'TRUE';
        }
        return {
            statement: stmt,
            correctAnswer: boolAnswer
        };
    });

    const questionStats = preparedQuestions.map(() => ({
        mistakes: 0,
        isSolved: false,
        totalAttempts: 0
    }));

    const parsedChances = typeof chances === 'number' && chances > 0 ? chances : 1;

    trueFalseGameState = {
        questName: questName,
        subject: category,
        category: category,
        teacherName: teacherName || 'Professor Riley',
        configuredChances: parsedChances,
        remainingChances: parsedChances,
        questions: preparedQuestions,
        questionStats: questionStats,
        currentIndex: 0,
        correctAnswersCount: 0,
        incorrectAttemptsCount: 0,
        startTime: Date.now(),
        isProcessing: false,
        dbAttemptId: dbAttemptId
    };

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    renderTrueFalseEntrance();
}

function renderTrueFalseEntrance() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const theme = getQuestThemeStyle(trueFalseGameState.questName, trueFalseGameState.subject || trueFalseGameState.category);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(trueFalseGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: ${theme.bg}; color: ${theme.text};">
                ${escapeHTML((trueFalseGameState.subject || trueFalseGameState.category || 'Science').toUpperCase())} • TRUE OR FALSE
            </div>
            <h2 class="tile-entrance-title">${escapeHTML(trueFalseGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Read each statement carefully and decide whether it is <strong>TRUE</strong> or <strong>FALSE</strong>. Answer all <strong>${trueFalseGameState.questions.length} statements</strong> to complete the game!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startTrueFalseGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> START GAME
            </button>
        </div>
    `;
}

function startTrueFalseGame() {
    renderTrueFalseGameBoard();
}

function renderTrueFalseGameBoard() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const currentQ = trueFalseGameState.questions[trueFalseGameState.currentIndex];
    const totalQ = trueFalseGameState.questions.length;
    const currentNum = trueFalseGameState.currentIndex + 1;
    const pct = Math.round(((currentNum - 1) / totalQ) * 100);
    const currentXP = getCurrentQuizXP(trueFalseGameState.questionStats, trueFalseGameState.questName);

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(trueFalseGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tf-game-container orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>STATEMENT ${currentNum} OF ${totalQ}</span>
                    <span style="color: var(--color-purple-dark);" id="tf-live-xp"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 17.9V19H7v2h10v-2h-4v-1.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor"/></svg> SCORE: ${currentXP} XP</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <div class="tf-statement-card orixa-question-slide" id="tf-statement-card">
                <p class="tf-statement-text">${escapeHTML(currentQ.statement)}</p>
            </div>

            <div id="tf-feedback-banner" style="min-height: 28px; text-align: center; font-family: var(--font-header); font-size: 1.1rem; font-weight: 700;"></div>

            <div class="tf-buttons-row">
                <button type="button" class="tf-choice-btn btn-true" id="btn-true" onclick="evaluateTrueFalseChoice(true)">
                    <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg> TRUE
                </button>
                <button type="button" class="tf-choice-btn btn-false" id="btn-false" onclick="evaluateTrueFalseChoice(false)">
                    <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 4px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg> FALSE
                </button>
            </div>
        </div>
    `;
}

function evaluateTrueFalseChoice(selectedBool) {
    if (trueFalseGameState.isProcessing) return;
    trueFalseGameState.isProcessing = true;

    const currentQ = trueFalseGameState.questions[trueFalseGameState.currentIndex];
    const cardEl = document.getElementById('tf-statement-card');
    const feedbackEl = document.getElementById('tf-feedback-banner');
    const btnTrue = document.getElementById('btn-true');
    const btnFalse = document.getElementById('btn-false');
    const currentStat = trueFalseGameState.questionStats ? trueFalseGameState.questionStats[trueFalseGameState.currentIndex] : null;

    if (btnTrue) btnTrue.disabled = true;
    if (btnFalse) btnFalse.disabled = true;

    const isCorrectFallback = selectedBool === currentQ.correctAnswer;

    const processTrueFalseResult = (evaluatedIsCorrect) => {
        if (evaluatedIsCorrect) {
            if (currentStat) {
                currentStat.isSolved = true;
                currentStat.totalAttempts++;
            }
            trueFalseGameState.correctAnswersCount++;

            if (cardEl) cardEl.classList.add('is-correct');
            if (selectedBool) {
                if (btnTrue) btnTrue.classList.add('selected-correct');
            } else {
                if (btnFalse) btnFalse.classList.add('selected-correct');
            }

            if (feedbackEl) {
                feedbackEl.style.color = "var(--color-green-dark)";
                feedbackEl.innerHTML = `<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg> Correct!`;
            }

            setTimeout(() => {
                trueFalseGameState.isProcessing = false;
                trueFalseGameState.currentIndex++;
                trueFalseGameState.remainingChances = trueFalseGameState.configuredChances;
                if (trueFalseGameState.currentIndex >= trueFalseGameState.questions.length) {
                    renderTrueFalseVictoryScreen();
                } else {
                    renderTrueFalseGameBoard();
                }
            }, 700);

        } else {
            if (currentStat) {
                currentStat.mistakes++;
                currentStat.totalAttempts++;
            }
            trueFalseGameState.incorrectAttemptsCount++;
            trueFalseGameState.remainingChances--;

            if (cardEl) {
                cardEl.classList.add('is-incorrect');
            }
            if (selectedBool) {
                if (btnTrue) btnTrue.classList.add('selected-incorrect');
            } else {
                if (btnFalse) btnFalse.classList.add('selected-incorrect');
            }

            if (trueFalseGameState.remainingChances > 0) {
                if (feedbackEl) {
                    feedbackEl.style.color = "var(--color-red-dark)";
                    feedbackEl.innerHTML = `<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg> Incorrect! Try again.`;
                }

                setTimeout(() => {
                    if (cardEl) cardEl.classList.remove('is-incorrect');
                    if (btnTrue) {
                        btnTrue.classList.remove('selected-incorrect');
                        btnTrue.disabled = false;
                    }
                    if (btnFalse) {
                        btnFalse.classList.remove('selected-incorrect');
                        btnFalse.disabled = false;
                    }
                    if (feedbackEl) feedbackEl.textContent = "";
                    trueFalseGameState.isProcessing = false;
                }, 800);
            } else {
                if (currentStat) {
                    currentStat.isSolved = false;
                }

                if (feedbackEl) {
                    feedbackEl.style.color = "var(--color-red-dark)";
                    feedbackEl.innerHTML = `<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; display: inline-block; vertical-align: -3px; margin-right: 6px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg> Incorrect! No chances remaining.`;
                }

                setTimeout(() => {
                    trueFalseGameState.isProcessing = false;
                    trueFalseGameState.currentIndex++;
                    trueFalseGameState.remainingChances = trueFalseGameState.configuredChances;
                    if (trueFalseGameState.currentIndex >= trueFalseGameState.questions.length) {
                        renderTrueFalseVictoryScreen();
                    } else {
                        renderTrueFalseGameBoard();
                    }
                }, 1200);
            }
        }
    };

    if (trueFalseGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        const dbQ = trueFalseGameState.questions[trueFalseGameState.currentIndex];
        if (dbQ && dbQ.dbQuestionId) {
            window.OrixaAuth.client.rpc('fn_submit_question_answer', {
                p_attempt_id: trueFalseGameState.dbAttemptId,
                p_question_id: dbQ.dbQuestionId,
                p_answer_json: { submitted_boolean: String(selectedBool).toUpperCase() }
            }).then(res => {
                const evalIsCorrect = (res && res.data && typeof res.data.is_correct === 'boolean') ? res.data.is_correct : isCorrectFallback;
                processTrueFalseResult(evalIsCorrect);
            }).catch(e => {
                console.warn('RPC tf error:', e);
                processTrueFalseResult(isCorrectFallback);
            });
            return;
        }
    }

    processTrueFalseResult(isCorrectFallback);
}

function renderTrueFalseVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    const totalMaxXP = getQuestMaxXP(trueFalseGameState.questName);
    const results = calculateQuizResults(trueFalseGameState.questionStats, totalMaxXP);

    if (trueFalseGameState.dbAttemptId && window.OrixaAuth && window.OrixaAuth.client) {
        window.OrixaAuth.client.rpc('fn_complete_quiz_attempt', {
            p_attempt_id: trueFalseGameState.dbAttemptId
        }).then(res => {
            if (res.error) console.warn('Complete true/false quiz RPC error:', res.error);
        });
    }

    addCompletedQuiz(trueFalseGameState.questName, results.earnedXP, results.accuracy, results.stars);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - trueFalseGameState.startTime) / 1000));
    const totalQ = trueFalseGameState.questions.length;

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title" id="tile-modal-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            ${renderStarsRowHtml(results.stars)}

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                ${results.stars === 3 ? 'GREAT DECISIONS!' : (results.stars >= 1 ? 'QUEST COMPLETED!' : 'QUEST FINISHED')}
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                You evaluated all ${totalQ} statements in <strong>"${escapeHTML(trueFalseGameState.questName)}"</strong>!
            </p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${results.accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">EARNED XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+${results.earnedXP} XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">STATEMENTS</span>
                    <div class="orixa-stat-box-value" style="color: var(--border-dark);">${totalQ} / ${totalQ}</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TIME TAKEN</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-blue-dark);">${elapsedSeconds}s</div>
                </div>
            </div>

            <button type="button" class="orixa-done-btn" onclick="closeQuestModal()" style="margin-top: 8px;">
                DONE
            </button>
        </div>
    `;
}

function openOrixaModal(contentHtml) {
    closeOrixaModal();

    const overlay = document.createElement('div');
    overlay.id = 'orixa-modal-overlay';
    overlay.className = 'orixa-modal-overlay';
    overlay.innerHTML = contentHtml;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOrixaModal();
        }
    });

    document.body.appendChild(overlay);
}

function closeOrixaModal() {
    const overlay = document.getElementById('orixa-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function confirmStudentLogout(event) {
    if (event) {
        event.preventDefault();
    }

    openOrixaModal(`
        <div class="orixa-modal-card">
            <header class="orixa-modal-header" style="background: var(--color-red);">
                <h3 class="orixa-modal-title" style="color: var(--border-dark);">Log Out?</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                </button>
            </header>
            <div class="orixa-modal-body" style="padding: var(--t-space-3);">
                <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark); margin: 0;">Are you sure you want to log out?</p>
                <p style="color: #546e7a; font-size: 0.95rem; margin-top: 8px; margin-bottom: 0;">You will be redirected back to the student login screen.</p>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                    Cancel
                </button>
                <button type="button" class="cartoon-action-btn" id="confirm-student-logout-btn" style="padding: 10px 24px; font-size: 0.95rem; background: var(--color-red); color: var(--border-dark); border-width: 3px; font-family: var(--font-header); font-weight: 700; cursor: pointer;">
                    Logout
                </button>
            </footer>
        </div>
    `);

    const confirmBtn = document.getElementById('confirm-student-logout-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (window.OrixaAuth) {
                await window.OrixaAuth.signOut();
            }
            window.location.replace('student-login.html');
        });
    }
}

window.openOrixaModal = openOrixaModal;
window.closeOrixaModal = closeOrixaModal;
window.confirmStudentLogout = confirmStudentLogout;

async function fetchPublishedQuizzesFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;

    try {
        const { data: quizzes, error } = await client
            .from('quizzes')
            .select('*, subjects(name), profiles!quizzes_teacher_id_fkey(full_name)')
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false });

        if (error || !quizzes || quizzes.length === 0) return;

        const grid = document.querySelector('.student-quest-grid');
        if (!grid) return;

        quizzes.forEach(q => {
            const subjectName = q.subjects ? q.subjects.name : 'Computer Science';
            const teacherName = q.profiles ? q.profiles.full_name : 'Professor Riley';
            const gameTypeLabel = (q.game_type || 'TILE_PUZZLE').replace('_', ' ');

            // Check if card already exists
            const existing = grid.querySelector(`[data-supabase-id="${q.id}"]`);
            if (existing) return;

            const card = document.createElement('div');
            card.className = 'quest-card cartoon-panel';
            card.dataset.title = q.title;
            card.dataset.subject = subjectName;
            card.dataset.topic = `${q.title} ${subjectName} ${gameTypeLabel}`;
            card.dataset.supabaseId = q.id;

            let themeBg = 'var(--color-green)';
            let themeText = 'var(--border-dark)';
            if (q.game_type === 'MATCH_FOLLOWING') { themeBg = 'var(--color-purple)'; themeText = 'white'; }
            else if (q.game_type === 'TRUE_FALSE') { themeBg = 'var(--color-yellow)'; }
            else if (q.game_type === 'FILL_BLANKS') { themeBg = 'var(--color-green)'; }

            card.innerHTML = `
                <div class="quiz-mgmt-card-header">
                    <div>
                        <h4 class="quiz-mgmt-card-title">${escapeHTML(q.title)}</h4>
                        <span class="quiz-mgmt-card-subject">${escapeHTML(subjectName)}</span>
                    </div>
                    <span class="quest-reward-badge" style="background-color: ${themeBg}; color: ${themeText};">+${q.total_possible_xp || 100} XP</span>
                </div>
                <div class="quiz-mgmt-card-body" style="margin-top: 10px;">
                    <div class="quiz-mgmt-card-info-row">
                        <span>Format</span>
                        <span style="font-family: var(--font-header); color: var(--border-dark); font-weight: 700;">${escapeHTML(gameTypeLabel)}</span>
                    </div>
                    <div class="quiz-mgmt-card-info-row">
                        <span>Teacher</span>
                        <span style="font-family: var(--font-header); color: var(--border-dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(teacherName)}</span>
                    </div>
                </div>
                <button type="button" class="play-quest-btn" style="background-color: ${themeBg}; color: ${themeText};">
                    <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                    <span>LAUNCH QUEST</span>
                </button>
            `;

            const btn = card.querySelector('.play-quest-btn');
            btn.addEventListener('click', () => {
                launchSupabaseQuiz(q, subjectName, teacherName);
            });

            grid.prepend(card);
        });

        hideCompletedQuizzes();
    } catch (e) {
        console.warn('Failed to fetch published quizzes from Supabase:', e);
    }
}

async function launchSupabaseQuiz(quiz, subjectName, teacherName) {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;

    try {
        const { data: attemptId, error: startErr } = await client.rpc('fn_start_quiz_attempt', {
            p_quiz_id: quiz.id
        });

        if (startErr || !attemptId) {
            console.error('fn_start_quiz_attempt error:', startErr);
            alert(startErr ? startErr.message : 'Could not start quiz attempt.');
            return;
        }

        const { data: questions, error: qErr } = await client.rpc('fn_get_attempt_questions', {
            p_attempt_id: attemptId
        });

        if (qErr || !questions || !Array.isArray(questions)) {
            console.error('fn_get_attempt_questions error:', qErr);
            alert('Could not load quiz questions.');
            return;
        }

        if (quiz.game_type === 'TILE_PUZZLE') {
            const mappedQ = questions.map(q => {
                const payload = q.game_payload || {};
                return {
                    dbQuestionId: q.id,
                    text: q.question_text || payload.question_text || '',
                    options: payload.options || ['Option A', 'Option B', 'Option C', 'Option D']
                };
            });
            openQuestGame(quiz.title, mappedQ.length, subjectName, quiz.default_max_chances || 3, teacherName, attemptId, mappedQ);
        } else if (quiz.game_type === 'MATCH_FOLLOWING') {
            const firstQ = questions[0] || {};
            const payload = firstQ.game_payload || {};
            const prompts = payload.prompts || (payload.pairs ? payload.pairs.map(p => ({ id: p.id, prompt: p.prompt })) : []);
            const choices = payload.choices || (payload.pairs ? payload.pairs.map(p => ({ id: p.id, choice: p.correct_match })) : []);
            const mappedPairs = prompts.map((p, idx) => {
                const c = choices.find(ch => ch.id === p.id) || choices[idx] || {};
                return {
                    dbQuestionId: firstQ.id,
                    id: p.id || `p${idx + 1}`,
                    text: p.prompt || `Prompt ${idx + 1}`,
                    answer: c.choice || `Choice ${idx + 1}`
                };
            });
            openMatchGame(quiz.title, subjectName, teacherName, quiz.default_max_chances || 3, attemptId, mappedPairs);
        } else if (quiz.game_type === 'FILL_BLANKS') {
            const mappedQ = questions.map(q => {
                const payload = q.game_payload || {};
                const tokens = payload.sentence_tokens || [q.question_text];
                const options = payload.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                return {
                    dbQuestionId: q.id,
                    statement: Array.isArray(tokens) ? tokens.join(' ') : q.question_text,
                    options: options
                };
            });
            openFillBlanksGame(quiz.title, subjectName, mappedQ, quiz.default_max_chances || 3, teacherName, attemptId);
        } else if (quiz.game_type === 'TRUE_FALSE') {
            const mappedQ = questions.map(q => {
                const payload = q.game_payload || {};
                return {
                    dbQuestionId: q.id,
                    statement: payload.statement || q.question_text
                };
            });
            openTrueFalseGame(quiz.title, subjectName, mappedQ, teacherName, quiz.default_max_chances || 1, attemptId);
        }
    } catch (e) {
        console.error('Error launching Supabase quiz:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.OrixaAuth) {
        const profile = await window.OrixaAuth.requireRole(['STUDENT'], 'student-login.html');
        if (!profile) return;

        if (profile.full_name) {
            const profileNameEls = document.querySelectorAll('.profile-name, #student-modal-name');
            profileNameEls.forEach(el => {
                el.textContent = profile.full_name;
            });
        }
    }

    await loadCompletedQuizzesFromSupabase();
    hideCompletedQuizzes();
    await fetchPublishedQuizzesFromSupabase();
});

// Close on outside clicks or escape key
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeQuestionModal();
        closeQuestModal();
        closeStudentProfileModal();
    }
});

document.addEventListener('click', event => {
    const questModal = document.getElementById('quest-modal');
    const profileModal = document.getElementById('student-profile-modal');
    if (event.target === questModal) {
        closeQuestModal();
    }
    if (event.target === profileModal) {
        closeStudentProfileModal();
    }
});
