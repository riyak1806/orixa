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

        <div class="tile-entrance-screen">
            <div class="tile-entrance-badge">${escapeHTML(currentGameState.category.toUpperCase())} QUEST</div>
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

        <div class="tile-board-view">
            <div class="tile-progress-bar-container">
                <span>🧩 TILES SOLVED: ${solvedCount} / ${totalCount}</span>
                <span style="color: var(--color-purple-dark);">✨ SCORE: ${currentGameState.score} XP</span>
            </div>

            <div class="tile-grid-container" style="grid-template-columns: repeat(${dim}, 1fr);">
                ${tileButtonsHtml}
            </div>

            <p style="font-family: var(--font-body); font-size: 0.88rem; color: #546e7a; margin: 0; text-align: center;">
                💡 Tap any available tile to reveal its question!
            </p>

            <!-- REQUIREMENT 3: TRUE MODAL OVERLAY LAYERED ABOVE TILE GRID -->
            <div class="tile-question-dim-overlay" id="tile-question-overlay">
                <div class="tile-question-card" id="tile-question-card">
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

        <div class="tile-victory-screen">
            <div class="tile-stars-display">⭐ ⭐ ⭐</div>
            <h2 style="font-family: var(--font-header); font-size: 2rem; color: var(--border-dark); margin: 0;">
                PERFECT PUZZLE SOLVED!
            </h2>
            <p style="font-family: var(--font-body); font-size: 1.05rem; color: #546e7a; margin: 0;">
                Awesome job! You solved all ${currentGameState.questionCount} tiles in <strong>"${escapeHTML(currentGameState.questName)}"</strong>!
            </p>

            <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 18px; padding: 16px; width: 100%; max-width: 400px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; box-shadow: var(--shadow-chunky-pressed);">
                <div style="text-align: center;">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">ACCURACY</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-green-dark);">100%</div>
                </div>
                <div style="text-align: center;">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">BONUS XP</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-purple-dark);">+100 XP</div>
                </div>
                <div style="text-align: center;">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">TILES SOLVED</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--border-dark);">${currentGameState.questionCount} / ${currentGameState.questionCount}</div>
                </div>
                <div style="text-align: center;">
                    <span style="font-family: var(--font-header); font-size: 0.8rem; color: #78909c;">TIME TAKEN</span>
                    <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-blue-dark);">${totalTimeSeconds}s</div>
                </div>
            </div>

            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeQuestModal()" style="padding: 14px 40px; font-size: 1.2rem; margin-top: 8px;">
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
