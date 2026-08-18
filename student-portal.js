/* ==========================================================================
   ORIXA - STUDENT PORTAL CONTROLLER
   ========================================================================= */

let currentQuestName = "";
let currentQuestQuestions = 12;
let revealedCount = 0;

function openQuestGame(questName, questionCount, category) {
    const modal = document.getElementById('quest-modal');
    const modalTitle = document.getElementById('modal-quest-title');
    const modalIntro = document.getElementById('modal-quest-intro');

    currentQuestName = questName;
    currentQuestQuestions = questionCount;

    if (modalTitle) {
        modalTitle.textContent = questName;
    }
    if (modalIntro) {
        modalIntro.textContent = `You are playing the ${category.toUpperCase()} category mission! Solve all ${questionCount} tiles to complete the quiz.`;
    }

    // Prepare grid with correct number of tiles
    renderMockTiles(questionCount);

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

function renderMockTiles(count) {
    const grid = document.getElementById('puzzle-grid');
    if (!grid) {
        return;
    }

    // Clear existing tiles except background solver text
    const solverText = grid.firstElementChild;
    grid.innerHTML = "";
    if (solverText) {
        grid.appendChild(solverText);
    }

    revealedCount = 0;

    // Build the grid
    let cols = 3;
    if (count > 9) {
        cols = 4;
    } else if (count <= 6) {
        cols = 2;
    }
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let i = 1; i <= count; i++) {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile-mock';
        tile.id = `tile-${i}`;
        tile.textContent = `${i}`;
        tile.addEventListener('click', () => revealTile(tile.id));
        grid.appendChild(tile);
    }
}

function revealTile(tileId) {
    const tile = document.getElementById(tileId);
    if (tile && !tile.classList.contains('revealed')) {
        tile.classList.add('revealed');
        tile.style.opacity = '0';
        tile.style.pointerEvents = 'none';
        revealedCount++;

        // Add fun reward simulation
        addXPPoints(15);

        if (revealedCount === currentQuestQuestions) {
            // Completed!
            window.setTimeout(() => {
                alert(`✨ Amazing! You successfully finished the "${currentQuestName}" and unlocked the secret image!`);
                addXPPoints(100);
                addCompletedQuiz();
                closeQuestModal();
            }, 300);
        }
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

function resetPuzzleTiles() {
    renderMockTiles(currentQuestQuestions);
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
