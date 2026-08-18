/* ==========================================================================
   ORIXA - STUDENT PORTAL CONTROLLER
   Tile Puzzle Student Interface Implementation
   ========================================================================= */

// Sample Quiz Questions Database (reflecting teacher-created questions)
const MOCK_STUDENT_QUIZZES = {
    'Ancient Egypt Quest': {
        title: 'Ancient Egypt Quest',
        subject: 'History',
        questionCount: 9,
        questions: [
            { id: 1, text: "Which river was essential to Ancient Egyptian civilization?", options: ["Nile River", "Amazon River", "Danube River", "Yangtze River"], correctAnswer: 0 },
            { id: 2, text: "What were the giant tomb structures built for Pharaohs called?", options: ["Pyramids", "Colosseum", "Parthenon", "Ziggurats"], correctAnswer: 0 },
            { id: 3, text: "What writing system did Ancient Egyptians use?", options: ["Hieroglyphics", "Cuneiform", "Latin Alphabet", "Runes"], correctAnswer: 0 },
            { id: 4, text: "Who was known as the Boy King of Egypt?", options: ["Tutankhamun", "Ramses II", "Cleopatra", "Akhenaten"], correctAnswer: 0 },
            { id: 5, text: "Which sea borders Egypt to the North?", options: ["Mediterranean Sea", "Red Sea", "Black Sea", "Caspian Sea"], correctAnswer: 0 },
            { id: 6, text: "What process was used to preserve bodies after death?", options: ["Mummification", "Embalming", "Fossilization", "Cremation"], correctAnswer: 0 },
            { id: 7, text: "What is the famous stone statue with a lion body and human head in Giza?", options: ["The Great Sphinx", "Colossus of Rhodes", "Terracotta Warrior", "Statue of David"], correctAnswer: 0 },
            { id: 8, text: "What plant was used by Egyptians to make early paper?", options: ["Papyrus", "Bamboo", "Hemp", "Cotton"], correctAnswer: 0 },
            { id: 9, text: "Who was the last active ruler of the Ptolemaic Kingdom of Egypt?", options: ["Cleopatra VII", "Nefertiti", "Hatshepsut", "Arsinoe II"], correctAnswer: 0 }
        ]
    },
    'Math Galaxy Challenge': {
        title: 'Math Galaxy Challenge',
        subject: 'Math',
        questionCount: 4,
        questions: [
            { id: 1, text: "Solve for x: 2x + 6 = 14", options: ["x = 4", "x = 3", "x = 5", "x = 8"], correctAnswer: 0 },
            { id: 2, text: "What is the square root of 81?", options: ["9", "8", "7", "81"], correctAnswer: 0 },
            { id: 3, text: "What is 15% of 200?", options: ["30", "25", "20", "15"], correctAnswer: 0 },
            { id: 4, text: "If a triangle has angles 60° and 50°, what is the third angle?", options: ["70°", "80°", "60°", "90°"], correctAnswer: 0 }
        ]
    },
    'Space Explorer Mission': {
        title: 'Space Explorer Mission',
        subject: 'Science',
        questionCount: 16,
        questions: Array.from({ length: 16 }, (_, index) => ({
            id: index + 1,
            text: `Space Explorer Mission Question ${index + 1}: What celestial body is studied in astronomy milestone #${index + 1}?`,
            options: ["The Sun", "The Moon", "Mars", "Jupiter"],
            correctAnswer: 0
        }))
    }
};

// State variable for student Tile Puzzle game
let tileGameState = {
    quizTitle: "",
    questionCount: 9,
    category: "",
    questions: [],
    selectedTileIndex: null,
    completedTiles: new Set(),
    tileStates: [] // 'unopened', 'selected', 'completed'
};

function openQuestGame(questName, questionCount, category) {
    const modal = document.getElementById('quest-modal');
    const modalTitle = document.getElementById('modal-quest-title');
    const introQuizName = document.getElementById('intro-quiz-name');

    // Retrieve quiz data from database or construct dynamically
    let quizData = MOCK_STUDENT_QUIZZES[questName];
    if (!quizData) {
        // Fallback for custom teacher quizzes
        const root = Math.ceil(Math.sqrt(questionCount));
        const squareCount = Math.max(4, root * root);
        quizData = {
            title: questName,
            subject: category || 'General',
            questionCount: squareCount,
            questions: Array.from({ length: squareCount }, (_, idx) => ({
                id: idx + 1,
                text: `${questName} - Question ${idx + 1}`,
                options: [`Option A for Q${idx + 1}`, `Option B for Q${idx + 1}`, `Option C for Q${idx + 1}`, `Option D for Q${idx + 1}`],
                correctAnswer: 0
            }))
        };
    }

    tileGameState = {
        quizTitle: quizData.title,
        questionCount: quizData.questionCount,
        category: category,
        questions: quizData.questions,
        selectedTileIndex: null,
        completedTiles: new Set(),
        tileStates: new Array(quizData.questionCount).fill('unopened')
    };

    if (modalTitle) modalTitle.textContent = quizData.title;
    if (introQuizName) {
        introQuizName.textContent = quizData.title;
        introQuizName.classList.remove('tile-title-entrance');
        // Trigger reflow to restart animation smoothly
        void introQuizName.offsetWidth;
        introQuizName.classList.add('tile-title-entrance');
    }

    // Show Intro Screen, hide Gameplay Screen
    const introScreen = document.getElementById('tile-intro-screen');
    const gameplayScreen = document.getElementById('tile-gameplay-screen');
    if (introScreen) introScreen.classList.remove('hidden');
    if (gameplayScreen) gameplayScreen.classList.add('hidden');

    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeQuestModal() {
    const modal = document.getElementById('quest-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function startTilePuzzleGame() {
    const introScreen = document.getElementById('tile-intro-screen');
    const gameplayScreen = document.getElementById('tile-gameplay-screen');

    if (introScreen) introScreen.classList.add('hidden');
    if (gameplayScreen) gameplayScreen.classList.remove('hidden');

    // Initialize gameplay title and progress
    const titleEl = document.getElementById('gameplay-quiz-title');
    if (titleEl) titleEl.textContent = tileGameState.quizTitle;

    updateTileProgress();
    renderTileBoard();
    resetQuestionPanel();
}

function updateTileProgress() {
    const progressEl = document.getElementById('tile-progress-text');
    if (progressEl) {
        progressEl.textContent = `${tileGameState.completedTiles.size} / ${tileGameState.questionCount} Tiles Completed`;
    }
}

function renderTileBoard() {
    const grid = document.getElementById('tile-board-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const count = tileGameState.questionCount;
    // Dimension = square root of count
    const dimension = Math.round(Math.sqrt(count));
    grid.style.gridTemplateColumns = `repeat(${dimension}, 1fr)`;

    for (let i = 0; i < count; i++) {
        const tile = document.createElement('div');
        tile.className = 'orixa-game-tile';
        tile.dataset.tileIndex = i;

        const currentState = tileGameState.tileStates[i];
        if (currentState === 'completed') {
            tile.classList.add('is-completed');
        } else if (currentState === 'selected') {
            tile.classList.add('is-selected');
        } else {
            tile.classList.add('is-unopened');
        }

        const tileInner = document.createElement('div');
        tileInner.className = 'tile-inner-content';

        if (currentState === 'completed') {
            tileInner.innerHTML = `<span class="tile-check-icon">✓</span><span class="tile-number-label">Tile ${i + 1}</span>`;
        } else {
            tileInner.innerHTML = `<span class="tile-number-label">${i + 1}</span>`;
        }

        tile.appendChild(tileInner);

        tile.addEventListener('click', () => handleTileClick(i));
        grid.appendChild(tile);
    }
}

function handleTileClick(index) {
    if (tileGameState.tileStates[index] === 'completed') {
        return; // Completed tiles stay completed
    }

    // Set previously selected unopened tile back to unopened
    for (let i = 0; i < tileGameState.questionCount; i++) {
        if (tileGameState.tileStates[i] === 'selected') {
            tileGameState.tileStates[i] = 'unopened';
        }
    }

    tileGameState.tileStates[index] = 'selected';
    tileGameState.selectedTileIndex = index;

    renderTileBoard();
    showQuestionInPanel(index);
}

function resetQuestionPanel() {
    const badgeEl = document.getElementById('panel-question-badge');
    const statusEl = document.getElementById('panel-question-status');
    const textEl = document.getElementById('panel-question-text');
    const optionsEl = document.getElementById('panel-answer-options');

    if (badgeEl) badgeEl.textContent = "Select a Tile";
    if (statusEl) statusEl.textContent = "Tile Board";
    if (textEl) textEl.textContent = "Tap or click any unopened tile below to reveal its question.";
    if (optionsEl) optionsEl.innerHTML = "";
}

function showQuestionInPanel(tileIndex) {
    const question = tileGameState.questions[tileIndex];
    if (!question) return;

    const badgeEl = document.getElementById('panel-question-badge');
    const statusEl = document.getElementById('panel-question-status');
    const textEl = document.getElementById('panel-question-text');
    const optionsEl = document.getElementById('panel-answer-options');

    if (badgeEl) badgeEl.textContent = `Question ${tileIndex + 1}`;
    if (statusEl) statusEl.textContent = `Active Tile #${tileIndex + 1}`;
    if (textEl) textEl.textContent = question.text;

    if (optionsEl) {
        optionsEl.innerHTML = question.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            return `
                <button type="button" class="student-answer-option-btn" onclick="submitAnswer(${tileIndex}, ${optIdx})">
                    <span class="option-letter">${letter}</span>
                    <span class="option-text">${escapeHTML(opt)}</span>
                </button>
            `;
        }).join('');
    }
}

function submitAnswer(tileIndex, selectedOptionIndex) {
    const question = tileGameState.questions[tileIndex];
    if (!question) return;

    // Direct answer evaluation or tile completion simulation
    tileGameState.tileStates[tileIndex] = 'completed';
    tileGameState.completedTiles.add(tileIndex);
    tileGameState.selectedTileIndex = null;

    addXPPoints(15);
    updateTileProgress();
    renderTileBoard();

    const optionsEl = document.getElementById('panel-answer-options');
    const statusEl = document.getElementById('panel-question-status');

    if (statusEl) statusEl.textContent = `Tile #${tileIndex + 1} Cleared! ✓`;
    if (optionsEl) {
        optionsEl.innerHTML = `
            <div class="tile-cleared-notice">
                <span>✨ Tile ${tileIndex + 1} Revealed! Select another tile to continue.</span>
            </div>
        `;
    }

    if (tileGameState.completedTiles.size === tileGameState.questionCount) {
        window.setTimeout(() => {
            alert(`🎉 Congratulations! You solved all ${tileGameState.questionCount} tiles in "${tileGameState.quizTitle}"!`);
            addXPPoints(100);
            addCompletedQuiz();
            closeQuestModal();
        }, 350);
    }
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
