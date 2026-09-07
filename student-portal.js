/* ==========================================================================
   ORIXA - STUDENT PORTAL CONTROLLER (TILE PUZZLE GAME ENGINE)
   ========================================================================= */

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

function generateMockQuestions(category, count) {
    const historyQuestions = [
        { text: "Which river was essential to Ancient Egyptian civilization?", options: ["Nile River", "Amazon River", "Danube River", "Ganges River"], correctAnswer: 0 },
        { text: "What served as monumental tombs for Pharaohs?", options: ["Pyramids", "Colosseum", "Parthenon", "Ziggurat"], correctAnswer: 0 },
        { text: "Which writing paper material was invented by Ancient Egyptians?", options: ["Papyrus", "Vellum", "Parchment", "Cotton"], correctAnswer: 0 },
        { text: "Who was the famous boy King of Ancient Egypt?", options: ["Tutankhamun", "Ramses II", "Cleopatra", "Akhenaten"], correctAnswer: 0 },
        { text: "What system of picture writing was used in Ancient Egypt?", options: ["Hieroglyphics", "Cuneiform", "Latin", "Sanskrit"], correctAnswer: 0 },
        { text: "What is the capital of modern Egypt?", options: ["Cairo", "Alexandria", "Luxor", "Giza"], correctAnswer: 0 },
        { text: "Which sea borders Egypt to the north?", options: ["Mediterranean Sea", "Red Sea", "Black Sea", "Caspian Sea"], correctAnswer: 0 },
        { text: "What large statue with a lion's body guards the Pyramids?", options: ["Great Sphinx", "Anubis", "Horus", "Obelisk"], correctAnswer: 0 },
        { text: "Which queen was the last active ruler of the Ptolemaic Kingdom?", options: ["Cleopatra VII", "Nefertiti", "Hatshepsut", "Nefertari"], correctAnswer: 0 },
        { text: "What process did Egyptians use to preserve dead bodies?", options: ["Mummification", "Embalming", "Fossilization", "Cremation"], correctAnswer: 0 },
        { text: "Which Egyptian god was considered the god of the Sun?", options: ["Ra", "Osiris", "Anubis", "Seth"], correctAnswer: 0 },
        { text: "Which ocean is nearest to Africa's eastern coast?", options: ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], correctAnswer: 0 },
        { text: "What is the longest river in the world?", options: ["Nile", "Amazon", "Mississippi", "Yangtze"], correctAnswer: 0 },
        { text: "What landmark in Giza is one of the Seven Wonders of the Ancient World?", options: ["Great Pyramid", "Hanging Gardens", "Lighthouse", "Colossus"], correctAnswer: 0 },
        { text: "Which crown symbolized unified Upper and Lower Egypt?", options: ["Pschent", "Deshret", "Hedjet", "Khepresh"], correctAnswer: 0 },
        { text: "What metal was valued alongside gold in ancient trade?", options: ["Copper", "Bronze", "Silver", "Iron"], correctAnswer: 0 }
    ];

    const mathQuestions = [
        { text: "Solve: 7 + 8 = ?", options: ["15", "14", "16", "13"], correctAnswer: 0 },
        { text: "What is the square root of 64?", options: ["8", "6", "7", "9"], correctAnswer: 0 },
        { text: "Solve: 12 × 5 = ?", options: ["60", "50", "55", "65"], correctAnswer: 0 },
        { text: "What is a 5-sided polygon called?", options: ["Pentagon", "Hexagon", "Octagon", "Heptagon"], correctAnswer: 0 },
        { text: "Solve: 100 ÷ 4 = ?", options: ["25", "20", "30", "15"], correctAnswer: 0 },
        { text: "What is the value of Pi rounded to 2 decimal places?", options: ["3.14", "3.16", "3.12", "3.18"], correctAnswer: 0 },
        { text: "Which of the following is a prime number?", options: ["17", "18", "20", "21"], correctAnswer: 0 },
        { text: "Solve for x: 2x = 18", options: ["9", "8", "10", "6"], correctAnswer: 0 },
        { text: "What is 15% of 200?", options: ["30", "20", "25", "35"], correctAnswer: 0 },
        { text: "What is the perimeter of a square with side length 6 cm?", options: ["24 cm", "18 cm", "36 cm", "12 cm"], correctAnswer: 0 },
        { text: "What is 3 squared plus 4 squared?", options: ["25", "20", "16", "24"], correctAnswer: 0 },
        { text: "Solve: 1/2 + 1/4 = ?", options: ["3/4", "2/4", "1/3", "4/4"], correctAnswer: 0 },
        { text: "What is the sum of angles in a triangle?", options: ["180°", "90°", "360°", "270°"], correctAnswer: 0 },
        { text: "Solve: 9 × 9 = ?", options: ["81", "72", "90", "89"], correctAnswer: 0 },
        { text: "What is the median of 3, 7, 9, 12, 15?", options: ["9", "7", "12", "8"], correctAnswer: 0 },
        { text: "Solve: 50 - 23 = ?", options: ["27", "25", "28", "26"], correctAnswer: 0 }
    ];

    const scienceQuestions = [
        { text: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], correctAnswer: 0 },
        { text: "What is the largest planet in our solar system?", options: ["Jupiter", "Saturn", "Neptune", "Uranus"], correctAnswer: 0 },
        { text: "What gas do plants absorb during photosynthesis?", options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correctAnswer: 0 },
        { text: "What is the speed of light in vacuum?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "50,000 km/s"], correctAnswer: 0 },
        { text: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], correctAnswer: 0 },
        { text: "What organ pumps blood through the human body?", options: ["Heart", "Lungs", "Liver", "Kidney"], correctAnswer: 0 },
        { text: "What force pulls objects toward Earth's center?", options: ["Gravity", "Friction", "Magnetism", "Inertia"], correctAnswer: 0 },
        { text: "What is the boiling point of water at sea level?", options: ["100°C", "90°C", "120°C", "80°C"], correctAnswer: 0 },
        { text: "Which galaxy contains our Solar System?", options: ["Milky Way", "Andromeda", "Sombrero", "Triangulum"], correctAnswer: 0 },
        { text: "What is the hardest natural substance on Earth?", options: ["Diamond", "Quartz", "Granite", "Titanium"], correctAnswer: 0 },
        { text: "What element does 'O' represent on the periodic table?", options: ["Oxygen", "Osmium", "Gold", "Oganesson"], correctAnswer: 0 },
        { text: "How many planets are in our solar system?", options: ["8", "7", "9", "10"], correctAnswer: 0 },
        { text: "What layer of Earth's atmosphere protects us from UV rays?", options: ["Ozone Layer", "Troposphere", "Thermosphere", "Mesosphere"], correctAnswer: 0 },
        { text: "What particle carries a negative electric charge?", options: ["Electron", "Proton", "Neutron", "Photon"], correctAnswer: 0 },
        { text: "What natural phenomenon is measured on the Richter scale?", options: ["Earthquakes", "Tornadoes", "Hurricanes", "Tsunamis"], correctAnswer: 0 },
        { text: "What is the center of an atom called?", options: ["Nucleus", "Electron Cloud", "Orbit", "Core"], correctAnswer: 0 }
    ];

    let base = historyQuestions;
    if (category.toLowerCase() === 'math') {
        base = mathQuestions;
    } else if (category.toLowerCase() === 'science') {
        base = scienceQuestions;
    }

    return base.slice(0, count);
}

function openQuestGame(questName, rawCount, category) {
    // Enforce perfect square question count
    let root = Math.round(Math.sqrt(rawCount));
    if (root < 2) root = 2;
    const questionCount = root * root;

    currentGameState = {
        questName: questName,
        category: category,
        questionCount: questionCount,
        gridDimension: root,
        questions: generateMockQuestions(category, questionCount),
        solvedTiles: new Set(),
        selectedTileIndex: null,
        selectedOptionIndex: null,
        score: 0,
        startTime: Date.now()
    };

    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    // REQUIREMENT 1: Entrance screen with game-style title entrance animation
    renderGameEntrance();
}

function closeQuestModal() {
    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Phase 1: Game Entrance Screen
function renderGameEntrance() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(currentGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge">${escapeHTML(currentGameState.category.toUpperCase())} • TILE PUZZLE</div>
            <h2 class="tile-entrance-title">${escapeHTML(currentGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Uncover the puzzle by solving questions! Select tiles on the <strong>${currentGameState.gridDimension} × ${currentGameState.gridDimension} grid</strong> (${currentGameState.questionCount} Questions) to reveal questions and test your knowledge.
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startTileGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                🎮 START GAME
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

    let tileButtonsHtml = "";
    for (let i = 0; i < totalCount; i++) {
        const isSolved = currentGameState.solvedTiles.has(i);
        tileButtonsHtml += `
            <button type="button"
                    class="tile-button ${isSolved ? 'solved' : ''}"
                    id="tile-btn-${i}"
                    onclick="handleTileClick(${i})"
                    ${isSolved ? 'disabled' : ''}>
                ${isSolved ? '✓' : i + 1}
            </button>
        `;
    }

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title" id="tile-modal-title">${escapeHTML(currentGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-board-view orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>🧩 TILES SOLVED: ${solvedCount} / ${totalCount}</span>
                    <span style="color: var(--color-purple-dark);">✨ SCORE: ${currentGameState.score} XP</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <div class="tile-grid-container" style="grid-template-columns: repeat(${dim}, 1fr);">
                ${tileButtonsHtml}
            </div>

            <p style="font-family: var(--font-body); font-size: 0.88rem; color: #546e7a; margin: 0; text-align: center;">
                💡 Tap any available tile to reveal its question!
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
    if (currentGameState.solvedTiles.has(tileIndex)) return;

    currentGameState.selectedTileIndex = tileIndex;
    currentGameState.selectedOptionIndex = null;

    const btn = document.getElementById(`tile-btn-${tileIndex}`);
    if (btn) {
        btn.classList.add('flipping');
        setTimeout(() => btn.classList.remove('flipping'), 300);
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

    card.innerHTML = `
        <div class="tile-question-header">
            <span class="tile-question-number-badge">TILE #${tileIndex + 1} QUESTION</span>
            <button type="button" class="sidebar-toggle-btn" onclick="closeQuestionModal()" aria-label="Close question modal" style="width: 32px; height: 32px;">✕</button>
        </div>

        <h4 class="tile-question-text">${escapeHTML(question.text)}</h4>

        <div class="tile-options-list" id="tile-options-container">
            ${question.options.map((opt, idx) => `
                <button type="button"
                        class="tile-option-btn"
                        id="option-btn-${idx}"
                        onclick="selectQuestionOption(${idx})">
                    <strong style="margin-right: 6px;">${String.fromCharCode(65 + idx)}.</strong> ${escapeHTML(opt)}
                </button>
            `).join('')}
        </div>

        <div id="tile-question-feedback"></div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px;">
            <button type="button" class="cartoon-action-btn" onclick="closeQuestionModal()" style="padding: 10px 20px; font-size: 0.95rem; background: #cfd8dc; border-color: var(--border-dark); box-shadow: var(--shadow-chunky-pressed);">
                Cancel
            </button>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" id="submit-answer-btn" onclick="submitTileAnswer(${tileIndex})" style="padding: 10px 24px; font-size: 0.95rem;" disabled>
                SUBMIT ANSWER
            </button>
        </div>
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

function selectQuestionOption(optIndex) {
    currentGameState.selectedOptionIndex = optIndex;

    const container = document.getElementById('tile-options-container');
    if (!container) return;

    const buttons = container.querySelectorAll('.tile-option-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === optIndex);
    });

    const submitBtn = document.getElementById('submit-answer-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

function submitTileAnswer(tileIndex) {
    const optIndex = currentGameState.selectedOptionIndex;
    if (optIndex === null || optIndex === undefined) return;

    const question = currentGameState.questions[tileIndex];
    if (!question) return;

    const feedbackEl = document.getElementById('tile-question-feedback');
    const submitBtn = document.getElementById('submit-answer-btn');
    const optionBtns = document.querySelectorAll('.tile-option-btn');

    const isCorrect = optIndex === question.correctAnswer;

    optionBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correctAnswer) {
            btn.classList.add('correct');
        } else if (idx === optIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        currentGameState.solvedTiles.add(tileIndex);
        currentGameState.score += 25;
        addXPPoints(25);

        if (feedbackEl) {
            feedbackEl.innerHTML = `
                <div class="tile-feedback-box correct">
                    🎉 CORRECT! You revealed Tile #${tileIndex + 1} (+25 XP)
                </div>
            `;
        }

        if (submitBtn) {
            submitBtn.textContent = "CONTINUE →";
            submitBtn.disabled = false;
            submitBtn.onclick = () => {
                closeQuestionModal();
                renderGameBoard();

                // Check completion
                if (currentGameState.solvedTiles.size === currentGameState.questionCount) {
                    setTimeout(() => renderVictoryScreen(), 300);
                }
            };
        }
    } else {
        if (feedbackEl) {
            feedbackEl.innerHTML = `
                <div class="tile-feedback-box incorrect">
                    ❌ INCORRECT! Give it another try!
                </div>
            `;
        }

        if (submitBtn) {
            submitBtn.textContent = "TRY AGAIN 🔄";
            submitBtn.disabled = false;
            submitBtn.onclick = () => {
                // Re-enable options for retry
                optionBtns.forEach(btn => {
                    btn.disabled = false;
                    btn.classList.remove('selected', 'correct', 'incorrect');
                });
                currentGameState.selectedOptionIndex = null;
                submitBtn.disabled = true;
                submitBtn.textContent = "SUBMIT ANSWER";
                submitBtn.onclick = () => submitTileAnswer(tileIndex);
                if (feedbackEl) feedbackEl.innerHTML = "";
            };
        }
    }
}

// Phase 4: Final Victory & 3-Star Winning Sequence
function renderVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    addCompletedQuiz();
    addXPPoints(100);

    const totalTimeSeconds = Math.max(1, Math.round((Date.now() - currentGameState.startTime) / 1000));

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title" id="tile-modal-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close">✕</button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            <div class="orixa-stars-row" aria-label="3 Stars Earned">
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
            </div>
            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                PERFECT PUZZLE SOLVED!
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                Awesome job! You solved all ${currentGameState.questionCount} tiles in <strong>"${escapeHTML(currentGameState.questName)}"</strong>!
            </p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">100%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">BONUS XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+100 XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">TILES SOLVED</span>
                    <div class="orixa-stat-box-value" style="color: var(--border-dark);">${currentGameState.questionCount} / ${currentGameState.questionCount}</div>
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

function openMatchGame(questName, category) {
    const pairs = [
        { id: 'm1', text: "Capital of France?", answer: "Paris" },
        { id: 'm2', text: "2 + 2?", answer: "4" },
        { id: 'm3', text: "Largest planet?", answer: "Jupiter" },
        { id: 'm4', text: "Red Planet?", answer: "Mars" }
    ];

    // Left questions order
    const questions = pairs.map(p => ({ id: p.id, text: p.text }));

    // Right answers shuffled (Fisher-Yates)
    const answers = pairs.map(p => ({ id: p.id, answer: p.answer }));
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    matchGameState = {
        questName: questName,
        category: category,
        pairs: pairs,
        questions: questions,
        answers: answers,
        matches: new Map(),
        selectedQuestionId: null,
        incorrectAttempts: 0,
        startTime: Date.now()
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

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title">${escapeHTML(matchGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background: var(--color-purple); color: white;">GENERAL SCIENCE • MATCH THE FOLLOWING</div>
            <h2 class="tile-entrance-title">${escapeHTML(matchGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Connect each question on the left to its correct answer on the right by dragging from the question to the answer card. Match all ${matchGameState.pairs.length} pairs correctly to win!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startMatchGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                🎮 START GAME
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

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title">${escapeHTML(matchGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="match-game-container orixa-game-slide-enter" id="match-game-container">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>🔗 PAIRS MATCHED: ${matchedCount} / ${totalPairs}</span>
                    <span style="color: var(--color-purple-dark);">✨ MATCHING GAME</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <svg class="match-svg-overlay" id="match-svg-overlay"></svg>

            <div class="match-columns-grid">
                <div class="match-column">
                    <h4 class="match-column-title">Questions / Prompts</h4>
                    ${matchGameState.questions.map(q => {
                        const isMatched = matchGameState.matches.has(q.id);
                        const isSelected = matchGameState.selectedQuestionId === q.id;
                        return `
                            <div class="match-card match-question-card ${isMatched ? 'is-matched' : ''} ${isSelected ? 'is-selected' : ''}"
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
                        return `
                            <div class="match-card match-answer-card ${isMatched ? 'is-matched' : ''}"
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
                💡 Drag from a question to its answer, or tap a question and then tap its matching answer!
            </p>
        </div>
    `;

    setupMatchInteractions();
    updateMatchConnectionLines();
}

function setupMatchInteractions() {
    const container = document.getElementById('match-game-container');
    if (!container) return;

    // Pointer events on question cards
    const qCards = container.querySelectorAll('.match-question-card');
    qCards.forEach(card => {
        const qId = card.dataset.qId;

        card.addEventListener('pointerdown', (e) => {
            if (matchGameState.matches.has(qId)) return;

            // Start drag
            activeMatchDrag = {
                qId: qId,
                pointerId: e.pointerId
            };

            matchGameState.selectedQuestionId = qId;
            card.classList.add('is-selected');

            if (card.setPointerCapture) {
                try { card.setPointerCapture(e.pointerId); } catch(err) {}
            }

            drawDragLine(e.clientX, e.clientY);
        });

        card.addEventListener('pointermove', (e) => {
            if (!activeMatchDrag || activeMatchDrag.qId !== qId) return;

            drawDragLine(e.clientX, e.clientY);

            // Highlight answer target under pointer
            const elem = document.elementFromPoint(e.clientX, e.clientY);
            const aCard = elem ? elem.closest('.match-answer-card') : null;

            container.querySelectorAll('.match-answer-card').forEach(ac => {
                if (aCard && ac === aCard && !Array.from(matchGameState.matches.values()).includes(ac.dataset.aId)) {
                    ac.classList.add('is-hovered');
                } else {
                    ac.classList.remove('is-hovered');
                }
            });
        });

        const handlePointerEnd = (e) => {
            if (!activeMatchDrag || activeMatchDrag.qId !== qId) return;

            const elem = document.elementFromPoint(e.clientX, e.clientY);
            const aCard = elem ? elem.closest('.match-answer-card') : null;

            if (card.releasePointerCapture) {
                try { card.releasePointerCapture(e.pointerId); } catch(err) {}
            }

            activeMatchDrag = null;
            card.classList.remove('is-selected');
            container.querySelectorAll('.match-answer-card').forEach(ac => ac.classList.remove('is-hovered'));

            removeTempDragLine();

            if (aCard) {
                const aId = aCard.dataset.aId;
                attemptMatch(qId, aId);
            }
        };

        card.addEventListener('pointerup', handlePointerEnd);
        card.addEventListener('pointercancel', handlePointerEnd);

    });

    // Tap selection on answer cards
    const aCards = container.querySelectorAll('.match-answer-card');
    aCards.forEach(card => {
        const aId = card.dataset.aId;
        card.addEventListener('click', () => {
            if (Array.from(matchGameState.matches.values()).includes(aId)) return;
            if (matchGameState.selectedQuestionId) {
                const qId = matchGameState.selectedQuestionId;
                attemptMatch(qId, aId);
            }
        });
    });

    // Window resize handler for SVG lines
    window.addEventListener('resize', updateMatchConnectionLines);
}

function drawDragLine(pointerX, pointerY) {
    if (!activeMatchDrag) return;
    const container = document.getElementById('match-game-container');
    const svg = document.getElementById('match-svg-overlay');
    if (!container || !svg) return;

    const qDot = document.getElementById(`q-dot-${activeMatchDrag.qId}`);
    if (!qDot) return;

    const cRect = container.getBoundingClientRect();
    const qRect = qDot.getBoundingClientRect();

    const startX = qRect.left + qRect.width / 2 - cRect.left;
    const startY = qRect.top + qRect.height / 2 - cRect.top;

    const endX = pointerX - cRect.left;
    const endY = pointerY - cRect.top;

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

    tempLine.setAttribute('x1', startX);
    tempLine.setAttribute('y1', startY);
    tempLine.setAttribute('x2', endX);
    tempLine.setAttribute('y2', endY);
}

function removeTempDragLine() {
    const tempLine = document.getElementById('temp-drag-line');
    if (tempLine) tempLine.remove();
}

function attemptMatch(qId, aId) {
    if (matchGameState.matches.has(qId)) return;
    if (Array.from(matchGameState.matches.values()).includes(aId)) return;

    if (qId === aId) {
        // CORRECT MATCH
        matchGameState.matches.set(qId, aId);
        matchGameState.selectedQuestionId = null;

        renderMatchGameBoard();

        // Check if all matched
        if (matchGameState.matches.size === matchGameState.pairs.length) {
            setTimeout(renderMatchVictoryScreen, 600);
        }
    } else {
        // INCORRECT MATCH
        matchGameState.incorrectAttempts++;
        matchGameState.selectedQuestionId = null;

        // Visual feedback
        const qCard = document.getElementById(`q-card-${qId}`);
        const aCard = document.getElementById(`a-card-${aId}`);

        if (qCard) qCard.classList.add('is-wrong');
        if (aCard) aCard.classList.add('is-wrong');

        // Draw temporary red error line
        drawErrorLine(qId, aId);

        setTimeout(() => {
            if (qCard) qCard.classList.remove('is-wrong');
            if (aCard) aCard.classList.remove('is-wrong');
            removeErrorLine();
        }, 600);
    }
}

function drawErrorLine(qId, aId) {
    const container = document.getElementById('match-game-container');
    const svg = document.getElementById('match-svg-overlay');
    if (!container || !svg) return;

    const qDot = document.getElementById(`q-dot-${qId}`);
    const aDot = document.getElementById(`a-dot-${aId}`);
    if (!qDot || !aDot) return;

    const cRect = container.getBoundingClientRect();
    const qRect = qDot.getBoundingClientRect();
    const aRect = aDot.getBoundingClientRect();

    const startX = qRect.left + qRect.width / 2 - cRect.left;
    const startY = qRect.top + qRect.height / 2 - cRect.top;

    const endX = aRect.left + aRect.width / 2 - cRect.left;
    const endY = aRect.top + aRect.height / 2 - cRect.top;

    let errLine = document.getElementById('temp-error-line');
    if (!errLine) {
        errLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        errLine.setAttribute('id', 'temp-error-line');
        errLine.setAttribute('class', 'match-connection-line');
        errLine.setAttribute('stroke', 'var(--color-red)');
        errLine.setAttribute('stroke-width', '4');
        svg.appendChild(errLine);
    }

    errLine.setAttribute('x1', startX);
    errLine.setAttribute('y1', startY);
    errLine.setAttribute('x2', endX);
    errLine.setAttribute('y2', endY);
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

    const cRect = container.getBoundingClientRect();

    matchGameState.matches.forEach((aId, qId) => {
        const qDot = document.getElementById(`q-dot-${qId}`);
        const aDot = document.getElementById(`a-dot-${aId}`);
        if (!qDot || !aDot) return;

        const qRect = qDot.getBoundingClientRect();
        const aRect = aDot.getBoundingClientRect();

        const startX = qRect.left + qRect.width / 2 - cRect.left;
        const startY = qRect.top + qRect.height / 2 - cRect.top;

        const endX = aRect.left + aRect.width / 2 - cRect.left;
        const endY = aRect.top + aRect.height / 2 - cRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'match-connection-line match-permanent-line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', 'var(--color-green)');
        line.setAttribute('stroke-width', '4');

        svg.appendChild(line);
    });
}

function renderMatchVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    addCompletedQuiz();
    addXPPoints(130);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - matchGameState.startTime) / 1000));
    const totalPairs = matchGameState.pairs.length;
    const accuracy = Math.round((totalPairs / (totalPairs + matchGameState.incorrectAttempts)) * 100);

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            <div class="orixa-stars-row" aria-label="3 Stars Earned">
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
            </div>

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">AMAZING MATCHING!</h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">You connected all ${totalPairs} pairs correctly in <strong>"${escapeHTML(matchGameState.questName)}"</strong>!</p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">BONUS XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+130 XP</div>
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
    questions: [], // { statement, blankAnswer, options, correctAnswer }
    currentIndex: 0,
    incorrectAttempts: 0,
    startTime: 0,
    selectedOption: null
};

function openFillBlanksGame(questName, category, customQuestions = null) {
    const defaultQuestions = [
        {
            statement: "The capital of France is Paris.",
            blankAnswer: "Paris",
            options: ["Paris", "London", "Berlin", "Madrid"],
            correctAnswer: 0
        },
        {
            statement: "The largest planet is Jupiter.",
            blankAnswer: "Jupiter",
            options: ["Earth", "Jupiter", "Saturn", "Mars"],
            correctAnswer: 1
        },
        {
            statement: "Water freezes at 0 degrees Celsius.",
            blankAnswer: "0",
            options: ["100", "50", "0", "-10"],
            correctAnswer: 2
        }
    ];

    const questionsSource = (customQuestions && customQuestions.length > 0) ? customQuestions : defaultQuestions;

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

    fillBlanksGameState = {
        questName: questName,
        category: category,
        questions: preparedQuestions,
        currentIndex: 0,
        incorrectAttempts: 0,
        startTime: Date.now(),
        selectedOption: null
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

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title">${escapeHTML(fillBlanksGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: var(--color-green); color: var(--border-dark);">
                GENERAL SCIENCE • FILL IN THE BLANKS
            </div>
            <h2 class="tile-entrance-title">${escapeHTML(fillBlanksGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Drag the correct answer option from the answer box and place it into the blank in each statement to complete all <strong>${fillBlanksGameState.questions.length} questions</strong>!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startFillBlanksGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                🎮 START GAME
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
            <h3 class="tile-game-title">${escapeHTML(fillBlanksGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="fitb-game-container orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>QUESTION ${currentNum} OF ${totalQ}</span>
                    <span style="color: var(--color-green-dark);">✨ PROGRESS: ${pct}%</span>
                </div>
                <div class="orixa-progress-track">
                    <div class="orixa-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <div class="fitb-sentence-box orixa-question-slide">
                ${sentenceHtml}
            </div>

            <div class="fitb-options-box" id="fitb-options-box">
                ${currentQ.options.map((optText, idx) => `
                    <div class="fitb-option-card" data-option-text="${escapeHTML(optText)}" data-option-idx="${idx}" draggable="false">
                        ${escapeHTML(optText)}
                    </div>
                `).join('')}
            </div>

            <div style="font-family: var(--font-header); font-size: 0.95rem; color: #546e7a; text-align: center; margin-top: 4px;">
                💡 Drag an option into the blank, or tap an option and tap the blank!
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
            e.preventDefault();
            const rect = card.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            card.classList.add('is-dragging');
            if (target) target.classList.add('is-target-active');

            activeFitbDrag = {
                card: card,
                optionText: optionText,
                initialParent: card.parentNode,
                initialNextSibling: card.nextSibling,
                offsetX: offsetX,
                offsetY: offsetY
            };

            card.style.position = 'fixed';
            card.style.left = `${e.clientX - offsetX}px`;
            card.style.top = `${e.clientY - offsetY}px`;
            card.setPointerCapture(e.pointerId);
        });

        card.addEventListener('pointermove', (e) => {
            if (!activeFitbDrag || activeFitbDrag.card !== card) return;
            card.style.left = `${e.clientX - activeFitbDrag.offsetX}px`;
            card.style.top = `${e.clientY - activeFitbDrag.offsetY}px`;
        });

        const handlePointerUp = (e) => {
            if (!activeFitbDrag || activeFitbDrag.card !== card) return;

            card.style.display = 'none';
            const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            card.style.display = '';

            card.classList.remove('is-dragging');
            if (target) target.classList.remove('is-target-active');

            card.style.position = '';
            card.style.left = '';
            card.style.top = '';

            const droppedOnTarget = elemBelow ? elemBelow.closest('#fitb-drop-target') : null;

            activeFitbDrag = null;

            if (droppedOnTarget) {
                attemptFitbAnswer(optionText, card);
            } else {
                // Return option to box
                const optionsBox = document.getElementById('fitb-options-box');
                if (optionsBox && card.parentNode !== optionsBox) {
                    optionsBox.appendChild(card);
                }
            }
        };

        card.addEventListener('pointerup', handlePointerUp);
        card.addEventListener('pointercancel', handlePointerUp);

        // Tap Selection Fallback
        card.addEventListener('click', () => {
            optionCards.forEach(c => c.classList.remove('is-selected'));
            card.classList.add('is-selected');
            fillBlanksGameState.selectedOption = { text: optionText, card: card };
        });
    });

    if (target) {
        target.addEventListener('click', () => {
            if (fillBlanksGameState.selectedOption) {
                const { text, card } = fillBlanksGameState.selectedOption;
                attemptFitbAnswer(text, card);
            }
        });
    }
}

function attemptFitbAnswer(optionText, card) {
    const currentQ = fillBlanksGameState.questions[fillBlanksGameState.currentIndex];
    const target = document.getElementById('fitb-drop-target');
    if (!target) return;

    const isCorrect = (optionText === currentQ.correctAnswerText) ||
                      (currentQ.blankAnswer && optionText.toLowerCase() === currentQ.blankAnswer.toLowerCase());

    fillBlanksGameState.selectedOption = null;

    if (isCorrect) {
        // Correct feedback
        target.textContent = optionText;
        target.classList.remove('is-incorrect', 'is-target-active');
        target.classList.add('is-correct');

        if (card) {
            card.style.visibility = 'hidden';
        }

        // Transition to next question or victory screen
        setTimeout(() => {
            fillBlanksGameState.currentIndex++;
            if (fillBlanksGameState.currentIndex >= fillBlanksGameState.questions.length) {
                renderFitbVictoryScreen();
            } else {
                renderFillBlanksGameBoard();
            }
        }, 700);

    } else {
        // Incorrect feedback
        fillBlanksGameState.incorrectAttempts++;
        target.textContent = optionText;
        target.classList.remove('is-target-active');
        target.classList.add('is-incorrect');

        // Reset after shake animation
        setTimeout(() => {
            target.textContent = "______";
            target.classList.remove('is-incorrect');
            const optionsBox = document.getElementById('fitb-options-box');
            if (optionsBox && card && card.parentNode !== optionsBox) {
                optionsBox.appendChild(card);
            }
            if (card) {
                card.classList.remove('is-selected', 'is-dragging');
            }
        }, 600);
    }
}

function renderFitbVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    addCompletedQuiz();
    addXPPoints(140);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - fillBlanksGameState.startTime) / 1000));
    const totalQ = fillBlanksGameState.questions.length;
    const accuracy = Math.round((totalQ / (totalQ + fillBlanksGameState.incorrectAttempts)) * 100);

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            <div class="orixa-stars-row" aria-label="3 Stars Earned">
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
            </div>

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">BLANKS COMPLETED!</h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">You solved all ${totalQ} statements in <strong>"${escapeHTML(fillBlanksGameState.questName)}"</strong>!</p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">BONUS XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+140 XP</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">SOLVED</span>
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
    questions: [], // { statement, correctAnswer: true/false }
    currentIndex: 0,
    correctAnswersCount: 0,
    incorrectAttemptsCount: 0,
    startTime: 0,
    isProcessing: false
};

function openTrueFalseGame(questName, category, customQuestions = null) {
    const defaultQuestions = [
        {
            statement: "Water freezes at 0°C at standard atmospheric pressure.",
            correctAnswer: true
        },
        {
            statement: "The Sun revolves around the Earth.",
            correctAnswer: false
        },
        {
            statement: "Jupiter is the largest planet in our solar system.",
            correctAnswer: true
        }
    ];

    const rawSource = (customQuestions && customQuestions.length > 0) ? customQuestions : defaultQuestions;

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

    trueFalseGameState = {
        questName: questName,
        category: category,
        questions: preparedQuestions,
        currentIndex: 0,
        correctAnswersCount: 0,
        incorrectAttemptsCount: 0,
        startTime: Date.now(),
        isProcessing: false
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

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title">${escapeHTML(trueFalseGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-entrance-screen orixa-game-slide-enter">
            <div class="tile-entrance-badge" style="background-color: var(--color-yellow); color: var(--border-dark);">
                SCIENCE • TRUE OR FALSE
            </div>
            <h2 class="tile-entrance-title">${escapeHTML(trueFalseGameState.questName)}</h2>
            <p class="tile-entrance-desc">
                Read each statement carefully and decide whether it is <strong>TRUE</strong> or <strong>FALSE</strong>. Answer all <strong>${trueFalseGameState.questions.length} statements</strong> to complete the game!
            </p>
            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="startTrueFalseGame()" style="padding: 14px 36px; font-size: 1.15rem;">
                🎮 START GAME
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

    windowEl.innerHTML = `
        <header class="tile-game-header">
            <h3 class="tile-game-title">${escapeHTML(trueFalseGameState.questName)}</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tf-game-container orixa-game-slide-enter">
            <div class="orixa-progress-container">
                <div class="orixa-progress-header">
                    <span>STATEMENT ${currentNum} OF ${totalQ}</span>
                    <span style="color: var(--color-yellow-dark);">✨ PROGRESS: ${pct}%</span>
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
                    ✓ TRUE
                </button>
                <button type="button" class="tf-choice-btn btn-false" id="btn-false" onclick="evaluateTrueFalseChoice(false)">
                    ✕ FALSE
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

    if (btnTrue) btnTrue.disabled = true;
    if (btnFalse) btnFalse.disabled = true;

    const isCorrect = selectedBool === currentQ.correctAnswer;

    if (isCorrect) {
        trueFalseGameState.correctAnswersCount++;

        if (cardEl) cardEl.classList.add('is-correct');
        if (selectedBool) {
            if (btnTrue) btnTrue.classList.add('selected-correct');
        } else {
            if (btnFalse) btnFalse.classList.add('selected-correct');
        }

        if (feedbackEl) {
            feedbackEl.style.color = "var(--color-green-dark)";
            feedbackEl.textContent = "✓ Correct!";
        }

        setTimeout(() => {
            trueFalseGameState.isProcessing = false;
            trueFalseGameState.currentIndex++;
            if (trueFalseGameState.currentIndex >= trueFalseGameState.questions.length) {
                renderTrueFalseVictoryScreen();
            } else {
                renderTrueFalseGameBoard();
            }
        }, 700);

    } else {
        trueFalseGameState.incorrectAttemptsCount++;

        if (cardEl) {
            cardEl.classList.add('is-incorrect');
        }
        if (selectedBool) {
            if (btnTrue) btnTrue.classList.add('selected-incorrect');
        } else {
            if (btnFalse) btnFalse.classList.add('selected-incorrect');
        }

        if (feedbackEl) {
            feedbackEl.style.color = "var(--color-red-dark)";
            feedbackEl.textContent = "✕ Incorrect! Try again.";
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
    }
}

function renderTrueFalseVictoryScreen() {
    const windowEl = document.getElementById('tile-game-window');
    if (!windowEl) return;

    addCompletedQuiz();
    addXPPoints(110);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - trueFalseGameState.startTime) / 1000));
    const totalQ = trueFalseGameState.questions.length;
    const accuracy = Math.round((totalQ / (totalQ + trueFalseGameState.incorrectAttemptsCount)) * 100);

    windowEl.innerHTML = `
        <header class="tile-game-header" style="background: var(--color-green);">
            <h3 class="tile-game-title">QUEST COMPLETED!</h3>
            <button type="button" class="tile-game-close-btn" onclick="closeQuestModal()" aria-label="Close quiz">✕</button>
        </header>

        <div class="tile-victory-screen orixa-game-slide-enter">
            <div class="orixa-stars-row" aria-label="3 Stars Earned">
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
                <span class="orixa-star-item">⭐</span>
            </div>

            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">GREAT DECISIONS!</h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">You evaluated all ${totalQ} statements in <strong>"${escapeHTML(trueFalseGameState.questName)}"</strong>!</p>

            <div class="orixa-victory-analytics-card">
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">ACCURACY</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-green-dark);">${accuracy}%</div>
                </div>
                <div class="orixa-stat-box">
                    <span class="orixa-stat-box-label">BONUS XP</span>
                    <div class="orixa-stat-box-value" style="color: var(--color-purple-dark);">+110 XP</div>
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
