/* ==========================================================================
   ORIXA - STUDENT PORTAL & TILE PUZZLE ENGINE
   ========================================================================= */

// Sample Questions Data Store for Tile Puzzle Quizzes
const TILE_PUZZLE_QUIZZES = {
    'Ancient Egypt Quest': {
        id: 'tile-egypt',
        title: 'Ancient Egypt Quest',
        subject: 'History',
        gameType: 'TILE_PUZZLE',
        questions: [
            { id: 1, text: 'Which river was essential to Ancient Egyptian civilization?', options: ['Amazon', 'Nile', 'Mississippi', 'Danube'], correctAnswer: 1 },
            { id: 2, text: 'What were the ancient Egyptian kings called?', options: ['Emperors', 'Pharaohs', 'Sultans', 'Czars'], correctAnswer: 1 },
            { id: 3, text: 'What monumental structures were built as tombs for pharaohs?', options: ['Pyramids', 'Colosseums', 'Ziggurats', 'Pagodas'], correctAnswer: 0 },
            { id: 4, text: 'Which famous paper-like material did Egyptians make from reeds?', options: ['Parchment', 'Papyrus', 'Vellum', 'Linen'], correctAnswer: 1 },
            { id: 5, text: 'What writing system did Ancient Egyptians use?', options: ['Cuneiform', 'Hieroglyphics', 'Runes', 'Latin'], correctAnswer: 1 },
            { id: 6, text: 'Which famous queen ruled Ancient Egypt and allied with Julius Caesar?', options: ['Nefertiti', 'Hatshepsut', 'Cleopatra', 'Sobekneferu'], correctAnswer: 2 },
            { id: 7, text: 'What is the large stone statue with a lion body and human head in Giza?', options: ['The Colossus', 'The Sphinx', 'The Obelisk', 'The Pantheon'], correctAnswer: 1 },
            { id: 8, text: 'Which pharaoh\'s tomb was discovered nearly intact in 1922 by Howard Carter?', options: ['Ramses II', 'Akhenaten', 'Tutankhamun', 'Khufu'], correctAnswer: 2 },
            { id: 9, text: 'Which body of water does the Nile River flow into?', options: ['Red Sea', 'Mediterranean Sea', 'Indian Ocean', 'Persian Gulf'], correctAnswer: 1 },
            { id: 10, text: 'What process was used to preserve dead bodies in Ancient Egypt?', options: ['Mummification', 'Fossilization', 'Embalming', 'Cremation'], correctAnswer: 0 }
        ]
    },
    'Math Galaxy Challenge': {
        id: 'tile-math',
        title: 'Math Galaxy Challenge',
        subject: 'Math',
        gameType: 'TILE_PUZZLE',
        questions: [
            { id: 1, text: 'What is 15 × 8?', options: ['110', '120', '130', '140'], correctAnswer: 1 },
            { id: 2, text: 'Solve for x: 3x - 7 = 14', options: ['5', '6', '7', '8'], correctAnswer: 2 },
            { id: 3, text: 'What is the square root of 144?', options: ['11', '12', '13', '14'], correctAnswer: 1 },
            { id: 4, text: 'Which of the following is a prime number?', options: ['21', '27', '29', '33'], correctAnswer: 2 },
            { id: 5, text: 'What is the area of a rectangle with length 9 cm and width 6 cm?', options: ['30 cm²', '48 cm²', '54 cm²', '60 cm²'], correctAnswer: 2 },
            { id: 6, text: 'What is 3/4 converted to a percentage?', options: ['65%', '70%', '75%', '80%'], correctAnswer: 2 },
            { id: 7, text: 'What is the perimeter of a square with side length 7 cm?', options: ['21 cm', '28 cm', '35 cm', '49 cm'], correctAnswer: 1 },
            { id: 8, text: 'What is the value of 2⁴?', options: ['8', '12', '16', '32'], correctAnswer: 2 }
        ]
    },
    'Space Explorer Mission': {
        id: 'tile-space',
        title: 'Space Explorer Mission',
        subject: 'Science',
        gameType: 'TILE_PUZZLE',
        questions: [
            { id: 1, text: 'What is the largest planet in our Solar System?', options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], correctAnswer: 1 },
            { id: 2, text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Mercury', 'Jupiter'], correctAnswer: 1 },
            { id: 3, text: 'What star is at the center of our Solar System?', options: ['Proxima Centauri', 'Sirius', 'The Sun', 'Betelgeuse'], correctAnswer: 2 },
            { id: 4, text: 'How many planets are in our Solar System?', options: ['7', '8', '9', '10'], correctAnswer: 1 },
            { id: 5, text: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctAnswer: 1 },
            { id: 6, text: 'What force keeps planets in orbit around the Sun?', options: ['Magnetism', 'Gravity', 'Friction', 'Centrifugal Force'], correctAnswer: 1 },
            { id: 7, text: 'What is the hottest planet in our Solar System?', options: ['Mercury', 'Venus', 'Mars', 'Jupiter'], correctAnswer: 1 },
            { id: 8, text: 'Which galaxy is home to Earth and our Solar System?', options: ['Andromeda', 'Milky Way', 'Triangulum', 'Sombrero'], correctAnswer: 1 },
            { id: 9, text: 'What causes the tides on Earth?', options: ['The Sun\'s heat', 'Earth\'s rotation', 'The Moon\'s gravitational pull', 'Ocean currents'], correctAnswer: 2 },
            { id: 10, text: 'What are Saturn\'s rings primarily made of?', options: ['Rock and Dust', 'Ice and Dust', 'Gas', 'Liquid Water'], correctAnswer: 1 },
            { id: 11, text: 'What was the first artificial satellite launched into space in 1957?', options: ['Apollo 11', 'Sputnik 1', 'Voyager 1', 'Hubble'], correctAnswer: 1 },
            { id: 12, text: 'What is a giant cloud of gas and dust in space called?', options: ['Black Hole', 'Nebula', 'Asteroid', 'Pulsar'], correctAnswer: 1 }
        ]
    }
};

// Active Tile Puzzle Gameplay Session State
let tileGameState = {
    quizTitle: '',
    questions: [],
    totalQuestions: 0,
    clearedTiles: [],
    selectedTileIndex: null,
    correctAnswers: 0,
    incorrectAttempts: 0,
    isComplete: false,
    viewMode: 'grid' // 'grid' | 'question' | 'results'
};

/**
 * Launch Tile Puzzle Game
 */
function openQuestGame(questName, questionCount, category) {
    const modal = document.getElementById('quest-modal');
    if (!modal) return;

    // Retrieve preset or build dynamic fallback quiz
    let quiz = TILE_PUZZLE_QUIZZES[questName];
    if (!quiz) {
        // Fallback dynamic generator
        quiz = {
            title: questName,
            gameType: 'TILE_PUZZLE',
            questions: Array.from({ length: questionCount }, (_, idx) => ({
                id: idx + 1,
                text: `Sample question ${idx + 1} for ${questName}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0
            }))
        };
    }

    // Initialize gameplay session state
    tileGameState = {
        quizTitle: quiz.title,
        questions: quiz.questions,
        totalQuestions: quiz.questions.length,
        clearedTiles: [],
        selectedTileIndex: null,
        correctAnswers: 0,
        incorrectAttempts: 0,
        isComplete: false,
        viewMode: 'grid'
    };

    modal.classList.remove('hidden');
    renderTileGameView();
}

function closeQuestModal() {
    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Main Render Controller for Tile Puzzle Modal View
 */
function renderTileGameView() {
    const modalTitle = document.getElementById('modal-quest-title');
    const modalIntro = document.getElementById('modal-quest-intro');
    const puzzleGrid = document.getElementById('puzzle-grid');
    const modalBody = document.querySelector('#quest-modal .orixa-modal-body');
    const modalFooter = document.querySelector('#quest-modal .orixa-modal-footer');

    if (modalTitle) {
        modalTitle.textContent = tileGameState.quizTitle;
    }

    if (!modalBody || !modalFooter) return;

    if (tileGameState.viewMode === 'results') {
        renderResultsAnalyticsView(modalBody, modalFooter);
        return;
    }

    // Render Grid + Question Area
    const clearedCount = tileGameState.clearedTiles.length;
    const totalCount = tileGameState.totalQuestions;

    if (modalIntro) {
        modalIntro.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <span>Select a tile to reveal a question. Answer correctly to clear the tile. Clear all tiles to complete the puzzle.</span>
                <span class="quiz-status-pill pill-live" style="font-size: 0.85rem; font-family: var(--font-header);">Progress: ${clearedCount} / ${totalCount} Completed</span>
            </div>
        `;
    }

    let cols = 3;
    if (totalCount > 9) cols = 4;
    else if (totalCount <= 4) cols = 2;

    const tilesHtml = tileGameState.questions.map((q, idx) => {
        const isCleared = tileGameState.clearedTiles.includes(idx);
        const isSelected = tileGameState.selectedTileIndex === idx;

        if (isCleared) {
            return `
                <div class="tile-puzzle-card cleared" style="visibility: hidden; opacity: 0; pointer-events: none;">
                    ✓
                </div>
            `;
        }

        return `
            <button type="button" class="tile-puzzle-card ${isSelected ? 'selected' : ''}" onclick="handleTileClick(${idx})" aria-label="Tile ${idx + 1}">
                ?
            </button>
        `;
    }).join('');

    let questionAreaHtml = '';
    if (tileGameState.selectedTileIndex !== null) {
        const selectedQ = tileGameState.questions[tileGameState.selectedTileIndex];
        const tileNum = tileGameState.selectedTileIndex + 1;

        questionAreaHtml = `
            <div class="tile-question-panel">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 6px; margin-bottom: 6px;">
                    <span style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); font-weight: 700;">Question for Tile ${tileNum}</span>
                    <button type="button" class="sidebar-toggle-btn" onclick="deselectTile()" style="width: 28px; height: 28px; font-size: 0.8rem;" title="Close question view">✕</button>
                </div>
                <p style="font-family: var(--font-body); font-size: 1.05rem; font-weight: 700; color: var(--border-dark); margin-bottom: 8px; line-height: 1.4;">
                    ${escapeHTML(selectedQ.text)}
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;" id="tile-options-container">
                    ${selectedQ.options.map((opt, oIdx) => `
                        <button type="button" class="tile-option-btn" onclick="handleAnswerSelection(${oIdx})">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 28px; background: var(--surface-white); border: 2px solid var(--border-dark); border-radius: 6px; font-family: var(--font-header);">${String.fromCharCode(65 + oIdx)}</span>
                            <span>${escapeHTML(opt)}</span>
                        </button>
                    `).join('')}
                </div>
                <div id="tile-feedback-msg" style="margin-top: 6px; font-family: var(--font-header); font-size: 0.95rem; text-align: center; min-height: 24px;"></div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <p id="modal-quest-intro" style="margin-0; font-family: var(--font-body); margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 0.92rem; color: #546e7a;">Select a tile to reveal a question. Answer correctly to clear the tile. Clear all tiles to complete the puzzle.</span>
                <span class="quiz-status-pill pill-live" style="font-size: 0.85rem; font-family: var(--font-header); padding: 4px 10px;">Progress: ${clearedCount} / ${totalCount} Completed</span>
            </div>
        </p>

        <!-- Tile Grid -->
        <div class="tile-puzzle-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
            ${tilesHtml}
        </div>

        <!-- Question View -->
        ${questionAreaHtml}
    `;

    modalFooter.innerHTML = `
        <button type="button" class="quiz-mgmt-action-btn quiz-btn-view" style="max-width: 140px; height: 42px;" onclick="resetPuzzleTiles()">RESET BOARD</button>
        <button type="button" class="quiz-mgmt-action-btn quiz-btn-delete" style="max-width: 120px; height: 42px;" onclick="closeQuestModal()">CLOSE</button>
    `;
}

/**
 * Handle Tile Click
 */
function handleTileClick(index) {
    if (tileGameState.clearedTiles.includes(index)) return;
    tileGameState.selectedTileIndex = index;
    renderTileGameView();

    // Smooth scroll down to question panel on mobile/small screens
    const qPanel = document.querySelector('.tile-question-panel');
    if (qPanel) {
        qPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function deselectTile() {
    tileGameState.selectedTileIndex = null;
    renderTileGameView();
}

/**
 * Handle Answer Selection
 */
function handleAnswerSelection(selectedOptionIndex) {
    if (tileGameState.selectedTileIndex === null) return;

    const currentQ = tileGameState.questions[tileGameState.selectedTileIndex];
    const feedbackEl = document.getElementById('tile-feedback-msg');
    const optionsContainer = document.getElementById('tile-options-container');

    if (!currentQ || !feedbackEl || !optionsContainer) return;

    const optionButtons = optionsContainer.querySelectorAll('.tile-option-btn');

    if (selectedOptionIndex === currentQ.correctAnswer) {
        // Correct Answer!
        tileGameState.correctAnswers++;
        const clearedIndex = tileGameState.selectedTileIndex;
        tileGameState.clearedTiles.push(clearedIndex);

        // Feedback
        optionButtons[selectedOptionIndex].classList.add('correct');
        feedbackEl.innerHTML = `<span style="color: var(--color-green-dark); font-weight: 700;">✓ Correct! Clearing tile...</span>`;

        addXPPoints(15);

        // Delay to allow clear animation, then check for game completion
        window.setTimeout(() => {
            tileGameState.selectedTileIndex = null;

            if (tileGameState.clearedTiles.length === tileGameState.totalQuestions) {
                // All tiles cleared! Game Completed!
                tileGameState.isComplete = true;
                triggerWinningSequence();
            } else {
                renderTileGameView();
            }
        }, 500);

    } else {
        // Incorrect Answer
        tileGameState.incorrectAttempts++;
        optionButtons[selectedOptionIndex].classList.add('incorrect');
        feedbackEl.innerHTML = `<span style="color: var(--color-red-dark); font-weight: 700;">✗ Incorrect! Try again.</span>`;

        // Reset button style after short duration
        window.setTimeout(() => {
            optionButtons[selectedOptionIndex].classList.remove('incorrect');
            if (feedbackEl) feedbackEl.innerHTML = '';
        }, 1200);
    }
}

/**
 * Winning Sequence & Three-Star Completion Screen
 */
function triggerWinningSequence() {
    const modalBody = document.querySelector('#quest-modal .orixa-modal-body');
    const modalFooter = document.querySelector('#quest-modal .orixa-modal-footer');

    if (!modalBody || !modalFooter) return;

    // 1. Play Winning Animation & Three Stars Screen
    modalBody.innerHTML = `
        <div style="text-align: center; padding: var(--t-space-3) var(--t-space-1); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--t-space-2);">
            <div style="font-family: var(--font-header); font-size: 2.2rem; color: var(--border-dark); text-shadow: 2px 2px 0 var(--color-yellow);">
                🎉 Quiz Complete! 🎉
            </div>

            <!-- Three Stars Display -->
            <div class="win-stars-display">
                <span style="color: var(--color-yellow); text-shadow: 2px 2px 0 var(--border-dark);">⭐</span>
                <span style="color: var(--color-yellow); text-shadow: 2px 2px 0 var(--border-dark);">⭐</span>
                <span style="color: var(--color-yellow); text-shadow: 2px 2px 0 var(--border-dark);">⭐</span>
            </div>

            <p style="font-family: var(--font-body); font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">
                You solved all tiles in "${escapeHTML(tileGameState.quizTitle)}"!
            </p>

            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="showResultsAnalytics()" style="padding: 12px 32px; font-size: 1.1rem; margin-top: 8px;">
                View Analytics →
            </button>
        </div>
    `;

    modalFooter.innerHTML = `
        <button type="button" class="quiz-mgmt-action-btn quiz-btn-delete" style="max-width: 120px; height: 42px;" onclick="closeQuestModal()">CLOSE</button>
    `;

    addXPPoints(100);
    addCompletedQuiz();
}

/**
 * Show Results Analytics
 */
function showResultsAnalytics() {
    tileGameState.viewMode = 'results';
    renderTileGameView();
}

/**
 * Render Results Analytics View
 */
function renderResultsAnalyticsView(modalBody, modalFooter) {
    const totalQ = tileGameState.totalQuestions;
    const correct = tileGameState.correctAnswers;
    const incorrect = tileGameState.incorrectAttempts;
    const accuracy = Math.round((totalQ / (totalQ + incorrect)) * 100);

    modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: var(--t-space-2); padding: var(--t-space-1);">
            <div style="border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; text-align: center;">
                <p class="panel-kicker" style="margin-bottom: 2px;">GAME ANALYTICS</p>
                <h3 style="font-family: var(--font-header); font-size: 1.6rem; color: var(--border-dark); margin: 0;">${escapeHTML(tileGameState.quizTitle)}</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 4px;">
                <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 14px; padding: 12px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">QUESTIONS</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--border-dark); margin-top: 2px;">${totalQ} / ${totalQ}</div>
                </div>

                <div style="background: #e8f5e9; border: var(--border-comic-thin); border-radius: 14px; padding: 12px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: var(--color-green-dark);">CORRECT</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-green-dark); margin-top: 2px;">${correct}</div>
                </div>

                <div style="background: #ffebee; border: var(--border-comic-thin); border-radius: 14px; padding: 12px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: var(--color-red-dark);">INCORRECT ATTEMPTS</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-red-dark); margin-top: 2px;">${incorrect}</div>
                </div>

                <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 14px; padding: 12px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">ACCURACY</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-blue-dark); margin-top: 2px;">${accuracy}%</div>
                </div>
            </div>

            <div style="background: var(--surface-white); border: var(--border-comic-thin); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-chunky-pressed); margin-top: 4px;">
                <span style="font-family: var(--font-header); font-size: 1rem; color: var(--border-dark);">Stars Earned:</span>
                <span style="font-size: 1.3rem;">⭐⭐⭐</span>
            </div>
        </div>
    `;

    modalFooter.innerHTML = `
        <button type="button" class="cartoon-action-btn primary-yellow-btn" style="padding: 10px 32px; font-size: 1rem;" onclick="closeQuestModal()">
            Done
        </button>
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

function addCompletedQuiz() {
    const playedValueElement = document.getElementById('stat-quizzes-played');
    if (playedValueElement) {
        let played = parseInt(playedValueElement.textContent, 10);
        played++;
        playedValueElement.textContent = played;
    }

    const starsValueElement = document.getElementById('stat-stars');
    if (starsValueElement) {
        let stars = parseInt(starsValueElement.textContent, 10);
        stars += 3;
        starsValueElement.textContent = stars;
    }
}

function resetPuzzleTiles() {
    if (tileGameState.quizTitle) {
        openQuestGame(tileGameState.quizTitle, tileGameState.totalQuestions, 'general');
    }
}

function filterQuizzes() {
    const searchInput = document.getElementById('student-quiz-search');
    const noResults = document.getElementById('no-quizzes-found');
    const questCards = document.querySelectorAll('.student-quest-grid .quest-card');

    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    questCards.forEach(card => {
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
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Close on outside clicks or escape key
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
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
