/* ==========================================================================
   ORIXA - TEACHER DASHBOARD CONTROLLER
   Dummy data and navigation-ready frontend components only.
   ========================================================================== */

const ICONS = {
    dashboard: '<path d="M3 13h8V3H3v10Z"></path><path d="M13 21h8V11h-8v10Z"></path><path d="M13 3v6h8V3h-8Z"></path><path d="M3 21h8v-6H3v6Z"></path>',
    list: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
    plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
    bank: '<path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    chart: '<path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path><path d="M12 7v5l4 2"></path>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 20.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6A1.65 1.65 0 0 0 10.33 2V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.35.58.6.8.5.43 1.15.58 1.82.4H22a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z"></path>',
    search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1"></rect>',
    target: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>',
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.4 6.36"></path><path d="M3 12A9 9 0 0 1 18.4 5.64"></path><path d="M18 3v5h-5"></path><path d="M6 21v-5h5"></path>',
    arrowRight: '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
    trophy: '<path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M5 5H3v2a4 4 0 0 0 4 4"></path><path d="M19 5h2v2a4 4 0 0 1-4 4"></path>',
    chevronLeft: '<path d="m15 18-6-6 6-6"></path>',
    chevronRight: '<path d="m9 18 6-6-6-6"></path>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
    x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
};

// Centralized Data Architecture
const MOCK_DATA = {
    unreadCount: 3,
    teacher: {
        name: "Professor Riley",
        email: "riley@orixa.edu",
        department: "Science & Technology",
        subjects: ["Biology", "Chemistry", "General Science"],
        classes: ["Grade 7 Science", "Grade 8 Biology", "Grade 9 Chemistry"],
        bio: "Passionate educator specializing in interactive science teaching. Helping students discover the wonders of nature through gamified quizzes."
    },
    stats: [
        { label: 'Total Quizzes', value: '48', caption: 'Created this semester', icon: 'clipboard', tone: 'yellow' },
        { label: 'Total Students', value: '312', caption: 'Active: 285 | Inactive: 27', icon: 'users', tone: 'blue' },
        { label: 'Average Score', value: '84%', caption: 'Subject average score', icon: 'target', tone: 'green' },
        { label: 'Recent Activity', value: '14', caption: 'Quiz submissions today', icon: 'clock', tone: 'orange' }
    ],
    activities: [
        { title: 'Quiz Completed', desc: 'Solar System Basics by 26 students', time: '10 mins ago', icon: 'clipboard' },
        { title: 'Student Submission', desc: 'Rahul Sharma submitted Fractions Sprint', time: '25 mins ago', icon: 'clipboard' },
        { title: 'New Student Added', desc: 'Siddharth Sen registered in Class B', time: '1 hour ago', icon: 'users' },
        { title: 'Result Updated', desc: 'Grade 7 Science results compiled', time: '2 hours ago', icon: 'chart' },
        { title: 'Quiz Published', desc: 'Ancient Civilizations is now Live', time: '1 day ago', icon: 'trophy' },
        { title: 'Question Bank Activity', desc: '35 new algebra questions added', time: '2 days ago', icon: 'bank' }
    ],
    quizzes: [
        { id: 1, title: 'Solar System Basics', subject: 'Science', questions: 18, status: 'Live', icon: 'trophy', attempts: 26, lastUpdated: '2026-08-10' },
        { id: 2, title: 'Fractions Sprint', subject: 'Maths', questions: 12, status: 'Draft', icon: 'clipboard', attempts: 0, lastUpdated: '2026-08-09' },
        { id: 3, title: 'Ancient Civilizations', subject: 'History', questions: 20, status: 'Closed', icon: 'history', attempts: 18, lastUpdated: '2026-08-05' },
        { id: 4, title: 'Cell Structure and Function', subject: 'Science', questions: 15, status: 'Live', icon: 'trophy', attempts: 42, lastUpdated: '2026-08-08' },
        { id: 5, title: 'Algebra Equations', subject: 'Maths', questions: 10, status: 'Live', icon: 'clipboard', attempts: 35, lastUpdated: '2026-08-07' },
        { id: 6, title: 'Periodic Table Review', subject: 'Science', questions: 30, status: 'Closed', icon: 'history', attempts: 55, lastUpdated: '2026-07-28' },
        { id: 7, title: 'Intro to Geometry', subject: 'Maths', questions: 15, status: 'Draft', icon: 'clipboard', attempts: 0, lastUpdated: '2026-08-02' },
        { id: 8, title: 'Roman Empire', subject: 'History', questions: 15, status: 'Live', icon: 'trophy', attempts: 12, lastUpdated: '2026-08-04' }
    ],
    searchableItems: [
        // Quizzes
        { title: "Solar System Basics", type: "Quiz", category: "quizzes", target: "quiz-management" },
        { title: "Fractions Sprint", type: "Quiz", category: "quizzes", target: "quiz-management" },
        { title: "Ancient Civilizations", type: "Quiz", category: "quizzes", target: "quiz-management" },
        { title: "Cell Structure and Function", type: "Quiz", category: "quizzes", target: "quiz-management" },

        // Students
        { title: "Rahul Sharma", type: "Student", category: "students", target: "students" },
        { title: "Anjali Gupta", type: "Student", category: "students", target: "students" },
        { title: "Siddharth Sen", type: "Student", category: "students", target: "students" },
        { title: "Priya Patel", type: "Student", category: "students", target: "students" },

        // Results
        { title: "Grade 7 Science Results", type: "Results", category: "results", target: "results" },
        { title: "Maths fractions Sprint Results", type: "Results", category: "results", target: "results" },
        { title: "History Ancient Civilizations Results", type: "Results", category: "results", target: "results" },

        // Question Bank
        { title: "Photosynthesis Questions", type: "Question Bank", category: "question-bank", target: "question-bank" },
        { title: "Algebraic Equations", type: "Question Bank", category: "question-bank", target: "question-bank" },

        // Past Quizzes
        { title: "Periodic Table Review", type: "Past Quiz", category: "past-quizzes", target: "past-quizzes" },
        { title: "Intro to Geometry", type: "Past Quiz", category: "past-quizzes", target: "past-quizzes" },

        // Teacher Pages / Navigation Pages
        { title: "Teacher Profile", type: "Page", category: "profile", target: "profile" },
        { title: "Settings Page", type: "Page", category: "settings", target: "settings" },
        { title: "Notifications Page", type: "Page", category: "notifications", target: "notifications" }
    ]
};

const navItems = [
    { label: 'Dashboard', icon: 'dashboard', target: 'dashboard' },
    { label: 'Quiz Management', icon: 'list', target: 'quiz-management' },
    { label: 'Create Quiz', icon: 'plus', target: 'create-quiz' },
    { label: 'Question Bank', icon: 'bank', target: 'question-bank' },
    { label: 'Students', icon: 'users', target: 'students' },
    { label: 'Results', icon: 'chart', target: 'results' },
    { label: 'Past Quizzes', icon: 'history', target: 'past-quizzes' },
    { label: 'Notifications', icon: 'bell', target: 'notifications' },
    { label: 'Settings', icon: 'settings', target: 'settings' }
];

function icon(name) {
    return `<svg class="dashboard-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.dashboard}</svg>`;
}

function renderIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(target => {
        target.innerHTML = icon(target.dataset.icon);
    });
}

function createSidebarLink(item, index) {
    const link = document.createElement('a');
    link.className = `sidebar-link${index === 0 ? ' is-active' : ''}`;
    link.href = `#${item.target}`;
    link.dataset.target = item.target;
    link.title = item.label; // Tooltip on hover when collapsed
    link.innerHTML = `${icon(item.icon)}<span>${item.label}</span>`;
    return link;
}

function renderSidebar() {
    const sidebarNav = document.getElementById('sidebar-nav');

    if (!sidebarNav) {
        return;
    }

    sidebarNav.append(...navItems.map(createSidebarLink));
}

function createStatCard(stat) {
    const card = document.createElement('article');
    card.className = `stat-card cartoon-panel is-${stat.tone}`;
    card.innerHTML = `
        <div class="stat-topline">
            <span class="stat-label">${stat.label}</span>
            <span class="stat-icon">${icon(stat.icon)}</span>
        </div>
        <div>
            <div class="stat-value">${stat.value}</div>
            <p class="stat-caption">${stat.caption}</p>
        </div>
    `;
    return card;
}

function renderStats() {
    const statsGrid = document.getElementById('stats-grid');

    if (!statsGrid) {
        return;
    }

    statsGrid.innerHTML = '';
    statsGrid.append(...MOCK_DATA.stats.map(createStatCard));
}

function createQuickAction(action) {
    const button = document.createElement('button');
    button.className = 'cartoon-action-btn primary-yellow-btn quick-action-btn';
    button.type = 'button';
    button.dataset.target = action.target;
    button.innerHTML = `${icon(action.icon)}<span>${action.label}</span>`;
    return button;
}


function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <span class="activity-icon">${icon(activity.icon)}</span>
        <div>
            <p class="activity-title">${activity.title}</p>
            <span class="activity-meta">${activity.desc} &bull; ${activity.time}</span>
        </div>
    `;
    return item;
}

function renderActivities() {
    const activityList = document.getElementById('activity-list');

    if (!activityList) {
        return;
    }

    activityList.innerHTML = '';
    activityList.append(...MOCK_DATA.activities.map(createActivityItem));
}

function createQuizItem(quiz) {
    const item = document.createElement('div');
    item.className = 'quiz-item';
    item.innerHTML = `
        <span class="quiz-icon">${icon(quiz.icon)}</span>
        <div class="quiz-info">
            <p class="quiz-title">${quiz.title}</p>
            <div class="quiz-bottomline">
                <span class="quiz-meta">${quiz.subject} | ${quiz.questions} questions</span>
                <span class="quiz-status">${quiz.status}</span>
            </div>
        </div>
    `;
    return item;
}

function renderQuizzes() {
    const quizList = document.getElementById('quiz-list');

    if (!quizList) {
        return;
    }

    quizList.innerHTML = '';
    quizList.append(...MOCK_DATA.quizzes.map(createQuizItem));
}

function setActiveNavigation(target) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('is-active', link.dataset.target === target);
    });
}

function renderTeacherProfile() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) {
        return;
    }

    const teacher = MOCK_DATA.teacher;

    dynamicPage.innerHTML = `
        <div class="cartoon-panel" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-3);">

            <!-- Header section of the profile -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: var(--t-space-2);">
                <div style="display: flex; align-items: center; gap: var(--t-space-2);">
                    <div class="profile-avatar" style="width: 64px; height: 64px; font-size: 1.5rem; border-width: 3px; font-family: var(--font-header); display: inline-flex; align-items: center; justify-content: center; background: var(--color-blue); border: 2px solid var(--border-dark); border-radius: 50%;">
                        PR
                    </div>
                    <div>
                        <p class="panel-kicker" style="margin-bottom: 2px;">Faculty Profile</p>
                        <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">${escapeHTML(teacher.name)}</h2>
                    </div>
                </div>
                <button class="cartoon-action-btn primary-yellow-btn" onclick="navigateToView('dashboard')" style="padding: 10px 20px; font-size: 1rem;">
                    Back to Dashboard
                </button>
            </div>

            <!-- Profile Content Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--t-space-3); margin-top: var(--t-space-1);">

                <!-- Account Info -->
                <div style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); box-shadow: var(--shadow-chunky-pressed);">
                        <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: var(--t-space-1);">Account Info</h4>
                        <div style="display: flex; flex-direction: column; gap: var(--t-space-1); font-family: var(--font-body); font-size: 0.95rem;">
                            <div>
                                <span style="font-weight: 700; color: #78909c;">Email:</span>
                                <span style="color: var(--border-dark);">${escapeHTML(teacher.email)}</span>
                            </div>
                            <div>
                                <span style="font-weight: 700; color: #78909c;">Department:</span>
                                <span style="color: var(--border-dark);">${escapeHTML(teacher.department)}</span>
                            </div>
                        </div>
                    </div>

                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); box-shadow: var(--shadow-chunky-pressed);">
                        <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: var(--t-space-1);">About Me</h4>
                        <p style="font-family: var(--font-body); font-size: 0.92rem; color: var(--border-dark); line-height: 1.4;">
                            ${escapeHTML(teacher.bio)}
                        </p>
                    </div>
                </div>

                <!-- Academic Info -->
                <div style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); box-shadow: var(--shadow-chunky-pressed);">
                        <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: var(--t-space-1);">Subjects Taught</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${teacher.subjects.map(subject => `
                                <span style="font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; background: var(--color-yellow); border: 2px solid var(--border-dark); border-radius: 9999px; padding: 4px 12px; color: var(--border-dark); display: inline-flex; align-items: center; justify-content: center;">
                                    ${escapeHTML(subject)}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); box-shadow: var(--shadow-chunky-pressed);">
                        <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: var(--t-space-1);">Classes Taught</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${teacher.classes.map(cl => `
                                <span style="font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; background: var(--color-blue); border: 2px solid var(--border-dark); border-radius: 9999px; padding: 4px 12px; color: var(--border-dark); display: inline-flex; align-items: center; justify-content: center;">
                                    ${escapeHTML(cl)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;
}

function renderNotificationDot() {
    const dot = document.querySelector('.notification-dot');
    if (!dot) {
        return;
    }
    if (MOCK_DATA.unreadCount > 0) {
        dot.classList.remove('hidden');
    } else {
        dot.classList.add('hidden');
    }
}

let createQuizState = null;

function resetCreateQuizState() {
    createQuizState = {
        title: '',
        subject: 'Mathematics',
        grade: 'Grade 5',
        description: '',
        settings: {
            timeLimit: 15,
            attempts: 1,
            passingScore: 70,
            shuffleQuestions: false,
            shuffleAnswers: false
        },
        questions: [
            {
                id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                text: '',
                type: 'Multiple Choice',
                options: ['', '', '', ''],
                correctAnswer: null,
                marks: 5
            }
        ]
    };
}

function renderCreateQuizPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    dynamicPage.innerHTML = `
        <div class="create-quiz-container" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
            <div class="create-quiz-header" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Create Quiz</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Create an engaging quiz for your students</p>
                </div>
                <button type="button" class="cartoon-action-btn create-quiz-back-btn" id="create-quiz-back-btn" style="padding: 10px 20px; font-size: 0.95rem;">
                    ← Back to Quiz Management
                </button>
            </div>

            <div class="create-quiz-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--t-space-2);">
                <!-- Left column for Quiz Basic Info & Settings -->
                <div class="create-quiz-col-left" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <div class="cartoon-panel create-quiz-card" id="quiz-info-card" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
                        <h3 style="font-family: var(--font-header); font-size: 1.4rem; color: var(--border-dark); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin: 0;">Quiz Information</h3>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-title">QUIZ TITLE *</label>
                            <div class="input-shell">
                                <input type="text" id="create-quiz-title" class="cartoon-input" placeholder="Enter quiz title" value="${escapeHTML(createQuizState.title)}" required>
                            </div>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-subject">SUBJECT *</label>
                            <select id="create-quiz-subject" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                                <option value="Mathematics" ${createQuizState.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                <option value="Science" ${createQuizState.subject === 'Science' ? 'selected' : ''}>Science</option>
                                <option value="History" ${createQuizState.subject === 'History' ? 'selected' : ''}>History</option>
                                <option value="English" ${createQuizState.subject === 'English' ? 'selected' : ''}>English</option>
                                <option value="Computer Science" ${createQuizState.subject === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-grade">CLASS / GRADE *</label>
                            <select id="create-quiz-grade" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                                <option value="Grade 5" ${createQuizState.grade === 'Grade 5' ? 'selected' : ''}>Grade 5</option>
                                <option value="Grade 6" ${createQuizState.grade === 'Grade 6' ? 'selected' : ''}>Grade 6</option>
                                <option value="Grade 7" ${createQuizState.grade === 'Grade 7' ? 'selected' : ''}>Grade 7</option>
                                <option value="Grade 8" ${createQuizState.grade === 'Grade 8' ? 'selected' : ''}>Grade 8</option>
                                <option value="Grade 9" ${createQuizState.grade === 'Grade 9' ? 'selected' : ''}>Grade 9</option>
                                <option value="Grade 10" ${createQuizState.grade === 'Grade 10' ? 'selected' : ''}>Grade 10</option>
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-description">DESCRIPTION</label>
                            <div class="input-shell">
                                <textarea id="create-quiz-description" class="cartoon-input" placeholder="Add a short description about this quiz..." style="height: auto; min-height: 100px; padding: var(--t-space-1) var(--t-space-2); resize: vertical; line-height: 1.4;">${escapeHTML(createQuizState.description)}</textarea>
                            </div>
                        </div>
                    </div>

                    <div class="cartoon-panel create-quiz-card" id="quiz-settings-card" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
                        <h3 style="font-family: var(--font-header); font-size: 1.4rem; color: var(--border-dark); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin: 0;">Quiz Settings</h3>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-time">TIME LIMIT (MINUTES) *</label>
                            <div class="input-shell">
                                <input type="number" id="create-quiz-time" class="cartoon-input" min="1" max="180" value="${createQuizState.settings.timeLimit}" required>
                            </div>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-attempts">NUMBER OF ATTEMPTS *</label>
                            <div class="input-shell">
                                <input type="number" id="create-quiz-attempts" class="cartoon-input" min="1" max="10" value="${createQuizState.settings.attempts}" required>
                            </div>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-passing">PASSING SCORE (%) *</label>
                            <div class="input-shell">
                                <input type="number" id="create-quiz-passing" class="cartoon-input" min="1" max="100" value="${createQuizState.settings.passingScore}" required>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: var(--t-space-1); margin-top: 8px;">
                            <label class="cartoon-checkbox-container" style="padding: 4px 0; justify-content: flex-start;">
                                <input type="checkbox" id="create-quiz-shuffle-questions" ${createQuizState.settings.shuffleQuestions ? 'checked' : ''}>
                                <span class="custom-checkbox"></span>
                                <span class="checkbox-text">Shuffle Questions</span>
                            </label>

                            <label class="cartoon-checkbox-container" style="padding: 4px 0; justify-content: flex-start;">
                                <input type="checkbox" id="create-quiz-shuffle-answers" ${createQuizState.settings.shuffleAnswers ? 'checked' : ''}>
                                <span class="custom-checkbox"></span>
                                <span class="checkbox-text">Shuffle Answers</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Right column for Quiz Questions -->
                <div class="create-quiz-col-right" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <div class="cartoon-panel create-quiz-card" id="questions-card" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
                        <h3 style="font-family: var(--font-header); font-size: 1.4rem; color: var(--border-dark); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin: 0;">Questions</h3>

                        <div id="questions-list-container" style="display: flex; flex-direction: column; max-height: 600px; overflow-y: auto; padding-right: 4px; gap: var(--t-space-2);">
                            <!-- Dynamic Questions List -->
                        </div>

                        <button type="button" class="cartoon-action-btn primary-yellow-btn" id="create-quiz-add-question-btn" style="padding: 10px 20px; font-size: 1rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px;">
                            <span data-icon="plus"></span> Add Question
                        </button>
                    </div>
                </div>
            </div>

            <!-- Bottom Actions -->
            <div class="create-quiz-bottom-actions" style="display: flex; align-items: center; justify-content: flex-end; gap: var(--t-space-2); margin-top: var(--t-space-2);">
                <button type="button" class="cartoon-action-btn" id="create-quiz-save-draft-btn" style="padding: 12px 24px; font-size: 1rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                    Save as Draft
                </button>
                <button type="button" class="cartoon-action-btn primary-yellow-btn" id="create-quiz-publish-btn" style="padding: 12px 28px; font-size: 1rem;">
                    Publish Quiz
                </button>
            </div>
        </div>
    `;

    // Render Questions List dynamically
    const renderQuestionsList = () => {
        const questionsListContainer = document.getElementById('questions-list-container');
        if (!questionsListContainer) return;

        if (createQuizState.questions.length === 0) {
            questionsListContainer.innerHTML = `
                <div style="border: 2px dashed rgba(26,26,36,0.15); border-radius: 12px; padding: var(--t-space-3); text-align: center; background: var(--color-cream); margin-bottom: var(--t-space-2);">
                    <span style="font-family: var(--font-header); font-size: 1.1rem; color: #546e7a;">No questions added yet. Click "+ Add Question" to start building!</span>
                </div>
            `;
            return;
        }

        questionsListContainer.innerHTML = createQuizState.questions.map((q, index) => {
            const questionNumber = index + 1;
            const isMultipleChoice = q.type === 'Multiple Choice';

            let answersHtml = '';
            if (isMultipleChoice) {
                answersHtml = `
                    <div style="display: flex; flex-direction: column; gap: var(--t-space-1); margin-top: var(--t-space-1);">
                        <p class="field-label" style="margin-bottom: 4px;">ANSWER OPTIONS (SELECT CORRECT ONE) *</p>
                        ${[0, 1, 2, 3].map(optIndex => {
                            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                            const isChecked = q.correctAnswer === optIndex;
                            return `
                                <div style="display: flex; align-items: center; gap: var(--t-space-1);">
                                    <label style="display: inline-flex; align-items: center; cursor: pointer;">
                                        <input type="radio" name="correct-answer-${q.id}" class="correct-answer-radio" data-question-id="${q.id}" data-option-index="${optIndex}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-green); cursor: pointer;">
                                    </label>
                                    <input type="text" class="cartoon-input question-option-input" data-question-id="${q.id}" data-option-index="${optIndex}" placeholder="Option ${letter}" value="${escapeHTML(q.options[optIndex] || '')}" style="height: 44px; font-size: 0.95rem;">
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                // True / False
                const isTrueChecked = q.correctAnswer === 'True';
                const isFalseChecked = q.correctAnswer === 'False';
                answersHtml = `
                    <div style="display: flex; flex-direction: column; gap: var(--t-space-1); margin-top: var(--t-space-1);">
                        <p class="field-label" style="margin-bottom: 4px;">CORRECT ANSWER *</p>
                        <div style="display: flex; gap: var(--t-space-3); align-items: center;">
                            <label style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-header); font-size: 1rem; color: var(--border-dark); cursor: pointer;">
                                <input type="radio" name="correct-answer-${q.id}" class="correct-answer-radio-tf" data-question-id="${q.id}" data-value="True" ${isTrueChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-green); cursor: pointer;">
                                True
                            </label>
                            <label style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-header); font-size: 1rem; color: var(--border-dark); cursor: pointer;">
                                <input type="radio" name="correct-answer-${q.id}" class="correct-answer-radio-tf" data-question-id="${q.id}" data-value="False" ${isFalseChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-green); cursor: pointer;">
                                False
                            </label>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="question-item-card" data-question-id="${q.id}" style="border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); background: var(--color-cream); margin-bottom: var(--t-space-1); display: flex; flex-direction: column; gap: var(--t-space-1); position: relative; box-shadow: var(--shadow-chunky-pressed);">
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin-bottom: 4px;">
                        <span style="font-family: var(--font-header); font-size: 1.15rem; color: var(--border-dark); font-weight: 700;">Question ${questionNumber}</span>
                        <button type="button" class="question-delete-btn" data-question-id="${q.id}" style="background: var(--color-red); border: 2px solid var(--border-dark); border-radius: 8px; padding: 4px 12px; font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; color: var(--border-dark); cursor: pointer; box-shadow: var(--shadow-chunky-pressed); transition: transform 0.1s ease;">
                            Delete
                        </button>
                    </div>

                    <div class="form-field">
                        <label class="field-label">QUESTION TEXT *</label>
                        <div class="input-shell">
                            <textarea class="cartoon-input question-text-input" data-question-id="${q.id}" placeholder="Enter question text" style="height: auto; min-height: 70px; padding: 8px 12px; resize: vertical; line-height: 1.4; font-size: 0.95rem;">${escapeHTML(q.text)}</textarea>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--t-space-2); margin-top: 4px;">
                        <div class="form-field">
                            <label class="field-label">QUESTION TYPE</label>
                            <select class="cartoon-input question-type-select" data-question-id="${q.id}" style="height: 40px; padding: 0 8px; font-family: var(--font-header); font-size: 0.85rem;">
                                <option value="Multiple Choice" ${isMultipleChoice ? 'selected' : ''}>Multiple Choice</option>
                                <option value="True / False" ${!isMultipleChoice ? 'selected' : ''}>True / False</option>
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label">MARKS / POINTS *</label>
                            <div class="input-shell">
                                <input type="number" class="cartoon-input question-marks-input" data-question-id="${q.id}" min="1" max="50" value="${q.marks}" style="height: 40px; font-size: 0.95rem;">
                            </div>
                        </div>
                    </div>

                    ${answersHtml}
                </div>
            `;
        }).join('');
    };

    // Sync functions
    const syncQuestionsState = () => {
        const titleEl = document.getElementById('create-quiz-title');
        const subjectEl = document.getElementById('create-quiz-subject');
        const gradeEl = document.getElementById('create-quiz-grade');
        const descEl = document.getElementById('create-quiz-description');

        const timeEl = document.getElementById('create-quiz-time');
        const attemptsEl = document.getElementById('create-quiz-attempts');
        const passingEl = document.getElementById('create-quiz-passing');
        const shuffleQEl = document.getElementById('create-quiz-shuffle-questions');
        const shuffleAEl = document.getElementById('create-quiz-shuffle-answers');

        if (titleEl) createQuizState.title = titleEl.value;
        if (subjectEl) createQuizState.subject = subjectEl.value;
        if (gradeEl) createQuizState.grade = gradeEl.value;
        if (descEl) createQuizState.description = descEl.value;

        if (timeEl) createQuizState.settings.timeLimit = parseInt(timeEl.value, 10) || 15;
        if (attemptsEl) createQuizState.settings.attempts = parseInt(attemptsEl.value, 10) || 1;
        if (passingEl) createQuizState.settings.passingScore = parseInt(passingEl.value, 10) || 70;
        if (shuffleQEl) createQuizState.settings.shuffleQuestions = shuffleQEl.checked;
        if (shuffleAEl) createQuizState.settings.shuffleAnswers = shuffleAEl.checked;

        // Sync Question inputs
        const questionTextEls = dynamicPage.querySelectorAll('.question-text-input');
        questionTextEls.forEach(el => {
            const qId = el.dataset.questionId;
            const q = createQuizState.questions.find(item => item.id === qId);
            if (q) q.text = el.value;
        });

        const questionMarksEls = dynamicPage.querySelectorAll('.question-marks-input');
        questionMarksEls.forEach(el => {
            const qId = el.dataset.questionId;
            const q = createQuizState.questions.find(item => item.id === qId);
            if (q) q.marks = parseInt(el.value, 10) || 5;
        });

        const optionInputEls = dynamicPage.querySelectorAll('.question-option-input');
        optionInputEls.forEach(el => {
            const qId = el.dataset.questionId;
            const optIndex = parseInt(el.dataset.optionIndex, 10);
            const q = createQuizState.questions.find(item => item.id === qId);
            if (q) q.options[optIndex] = el.value;
        });
    };

    // Initial render of questions
    renderQuestionsList();
    renderIcons(document.getElementById('questions-card'));

    // Attach listeners
    const backBtn = document.getElementById('create-quiz-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            navigateToView('quiz-management');
        });
    }

    const addQuestionBtn = document.getElementById('create-quiz-add-question-btn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            syncQuestionsState();
            createQuizState.questions.push({
                id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                text: '',
                type: 'Multiple Choice',
                options: ['', '', '', ''],
                correctAnswer: null,
                marks: 5
            });
            renderQuestionsList();
        });
    }

    const container = dynamicPage.querySelector('.create-quiz-container');
    if (container) {
        container.addEventListener('input', syncQuestionsState);
        container.addEventListener('change', (e) => {
            syncQuestionsState();

            // Handle radio changes and type selector changes
            if (e.target.classList.contains('correct-answer-radio')) {
                const qId = e.target.dataset.questionId;
                const optIndex = parseInt(e.target.dataset.optionIndex, 10);
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.correctAnswer = optIndex;
            } else if (e.target.classList.contains('correct-answer-radio-tf')) {
                const qId = e.target.dataset.questionId;
                const val = e.target.dataset.value;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.correctAnswer = val;
            } else if (e.target.classList.contains('question-type-select')) {
                const qId = e.target.dataset.questionId;
                const type = e.target.value;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.type = type;
                    q.correctAnswer = null;
                    if (type === 'Multiple Choice') {
                        q.options = ['', '', '', ''];
                    } else {
                        q.options = [];
                    }
                    renderQuestionsList();
                }
            }
        });

        // Intercept delete clicks
        container.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.question-delete-btn');
            if (deleteBtn) {
                syncQuestionsState();
                const qId = deleteBtn.dataset.questionId;
                const idx = createQuizState.questions.findIndex(item => item.id === qId);
                if (idx !== -1) {
                    createQuizState.questions.splice(idx, 1);
                    renderQuestionsList();
                }
            }
        });
    }

    // Validation Routines
    const validateDraft = () => {
        dynamicPage.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
        dynamicPage.querySelectorAll('.question-item-card.input-invalid').forEach(el => el.classList.remove('input-invalid'));

        const errors = [];
        const titleEl = document.getElementById('create-quiz-title');
        if (!createQuizState.title.trim()) {
            errors.push("Quiz Title is required.");
            if (titleEl) titleEl.classList.add('input-invalid');
        }
        const subjectEl = document.getElementById('create-quiz-subject');
        if (!createQuizState.subject) {
            errors.push("Subject is required.");
            if (subjectEl) subjectEl.classList.add('input-invalid');
        }
        const gradeEl = document.getElementById('create-quiz-grade');
        if (!createQuizState.grade) {
            errors.push("Class / Grade is required.");
            if (gradeEl) gradeEl.classList.add('input-invalid');
        }

        return errors;
    };

    const validatePublish = () => {
        dynamicPage.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
        dynamicPage.querySelectorAll('.question-item-card.input-invalid').forEach(el => el.classList.remove('input-invalid'));

        const errors = validateDraft();

        if (createQuizState.questions.length === 0) {
            errors.push("The quiz must have at least one question.");
        }

        createQuizState.questions.forEach((q, index) => {
            const num = index + 1;
            const qCard = dynamicPage.querySelector(`[data-question-id="${q.id}"]`);

            if (!q.text.trim()) {
                errors.push(`Question ${num}: Question text cannot be blank.`);
                if (qCard) {
                    qCard.querySelector('.question-text-input').classList.add('input-invalid');
                }
            }

            if (q.type === 'Multiple Choice') {
                q.options.forEach((opt, optIdx) => {
                    if (!opt.trim()) {
                        errors.push(`Question ${num}: Option ${String.fromCharCode(65 + optIdx)} cannot be blank.`);
                        if (qCard) {
                            qCard.querySelectorAll('.question-option-input')[optIdx].classList.add('input-invalid');
                        }
                    }
                });

                if (q.correctAnswer === null || q.correctAnswer === undefined) {
                    errors.push(`Question ${num}: Please select a correct answer.`);
                    if (qCard) {
                        qCard.classList.add('input-invalid');
                    }
                }
            } else {
                if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
                    errors.push(`Question ${num}: Please select True or False.`);
                    if (qCard) {
                        qCard.classList.add('input-invalid');
                    }
                }
            }
        });

        return errors;
    };

    const showValidationErrorModal = (errors) => {
        openOrixaModal(`
            <div class="orixa-modal-card">
                <header class="orixa-modal-header" style="background: var(--color-red);">
                    <h3 class="orixa-modal-title" style="color: var(--border-dark); font-family: var(--font-header);">Missing Information</h3>
                    <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                        <span data-icon="x"></span>
                    </button>
                </header>
                <div class="orixa-modal-body" style="max-height: 400px; overflow-y: auto;">
                    <p style="font-weight: 700; color: var(--color-red-dark); margin-bottom: var(--t-space-1);">Please fix the following issues before continuing:</p>
                    <ul style="padding-left: 20px; color: var(--border-dark); line-height: 1.5; font-family: var(--font-body); display: flex; flex-direction: column; gap: 6px;">
                        ${errors.map(err => `<li>${escapeHTML(err)}</li>`).join('')}
                    </ul>
                </div>
                <footer class="orixa-modal-footer">
                    <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                        Got it!
                    </button>
                </footer>
            </div>
        `);
    };

    // Save as Draft Event
    const saveDraftBtn = document.getElementById('create-quiz-save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            syncQuestionsState();
            const errors = validateDraft();
            if (errors.length > 0) {
                showValidationErrorModal(errors);
                return;
            }

            // Save to MOCK_DATA
            const newId = MOCK_DATA.quizzes.length > 0 ? Math.max(...MOCK_DATA.quizzes.map(q => q.id)) + 1 : 1;
            const newQuiz = {
                id: newId,
                title: createQuizState.title,
                subject: createQuizState.subject,
                questions: createQuizState.questions.length,
                status: 'Draft',
                icon: 'clipboard',
                attempts: 0,
                lastUpdated: new Date().toISOString().split('T')[0]
            };
            MOCK_DATA.quizzes.unshift(newQuiz);

            // Show Success Modal
            openOrixaModal(`
                <div class="orixa-modal-card">
                    <header class="orixa-modal-header" style="background: var(--color-green);">
                        <h3 class="orixa-modal-title" style="color: var(--border-dark);">Draft Saved!</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal(); navigateToView('quiz-management');" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                        <p style="font-size: 1.2rem; font-weight: 700; color: var(--border-dark);">"${escapeHTML(createQuizState.title)}" has been saved as a Draft.</p>
                        <p style="color: #546e7a; font-size: 0.95rem; margin-top: 8px;">You can find and edit this quiz in the Quiz Management list at any time.</p>
                    </div>
                    <footer class="orixa-modal-footer">
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal(); navigateToView('quiz-management');" style="padding: 10px 24px; font-size: 0.95rem;">
                            Go to Quiz Management
                        </button>
                    </footer>
                </div>
            `);

            // Reset state
            createQuizState = null;
        });
    }

    // Publish Event
    const publishBtn = document.getElementById('create-quiz-publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            syncQuestionsState();
            const errors = validatePublish();
            if (errors.length > 0) {
                showValidationErrorModal(errors);
                return;
            }

            // Confirmation Popup
            openOrixaModal(`
                <div class="orixa-modal-card">
                    <header class="orixa-modal-header" style="background: var(--color-yellow);">
                        <h3 class="orixa-modal-title" style="color: var(--border-dark);">Publish Quiz</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="padding: var(--t-space-3);">
                        <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">Are you sure you want to publish this quiz?</p>
                        <p style="color: #546e7a; font-size: 0.95rem; margin-top: 8px;">This will make the quiz live and instantly accessible to your students.</p>
                    </div>
                    <footer class="orixa-modal-footer">
                        <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                            Cancel
                        </button>
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" id="confirm-publish-btn" style="padding: 10px 24px; font-size: 0.95rem;">
                            Publish
                        </button>
                    </footer>
                </div>
            `);

            const confirmBtn = document.getElementById('confirm-publish-btn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    const newId = MOCK_DATA.quizzes.length > 0 ? Math.max(...MOCK_DATA.quizzes.map(q => q.id)) + 1 : 1;
                    const newQuiz = {
                        id: newId,
                        title: createQuizState.title,
                        subject: createQuizState.subject,
                        questions: createQuizState.questions.length,
                        status: 'Live',
                        icon: 'trophy',
                        attempts: 0,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };
                    MOCK_DATA.quizzes.unshift(newQuiz);

                    closeOrixaModal();

                    // Success Feedback
                    openOrixaModal(`
                        <div class="orixa-modal-card">
                            <header class="orixa-modal-header" style="background: var(--color-green);">
                                <h3 class="orixa-modal-title" style="color: var(--border-dark);">Published Successfully!</h3>
                                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal(); navigateToView('quiz-management');" aria-label="Close modal">
                                    <span data-icon="x"></span>
                                </button>
                            </header>
                            <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                                <p style="font-size: 1.2rem; font-weight: 700; color: var(--border-dark);">"${escapeHTML(createQuizState.title)}" is now live!</p>
                                <p style="color: #546e7a; font-size: 0.95rem; margin-top: 8px;">Students can now view and attempt this quiz on their portals.</p>
                            </div>
                            <footer class="orixa-modal-footer">
                                <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal(); navigateToView('quiz-management');" style="padding: 10px 24px; font-size: 0.95rem;">
                                    Done
                                </button>
                            </footer>
                        </div>
                    `);

                    // Reset state
                    createQuizState = null;
                });
            }
        });
    }
}

// Router/Switcher mapping targets to readable titles and content.
// Dynamically renders the page context without introducing extra heavy HTML files.
function navigateToView(target) {
    const overviewPage = document.getElementById('dashboard-overview-page');
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!overviewPage || !dynamicPage) {
        return;
    }

    if (target === 'notifications') {
        MOCK_DATA.unreadCount = 0;
        renderNotificationDot();
    }

    // Always hide search dropdown on navigate
    if (searchDropdown) {
        searchDropdown.classList.add('hidden');
    }

    if (target === 'dashboard') {
        overviewPage.classList.remove('hidden');
        dynamicPage.classList.add('hidden');
        setActiveNavigation('dashboard');
        window.history.replaceState(null, '', `#dashboard`);
        return;
    }

    if (target === 'profile') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderTeacherProfile();
        setActiveNavigation('');
        window.history.replaceState(null, '', `#profile`);
        return;
    }

    if (target === 'quiz-management') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderQuizManagementPage();
        setActiveNavigation('quiz-management');
        window.history.replaceState(null, '', `#quiz-management`);
        return;
    }

    if (target === 'create-quiz') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        if (!createQuizState) {
            resetCreateQuizState();
        }
        renderCreateQuizPage();
        setActiveNavigation('create-quiz');
        window.history.replaceState(null, '', `#create-quiz`);
        return;
    }

    // Dynamic dynamic placeholders for unimplemented pages
    const navItem = navItems.find(item => item.target === target);
    const pageTitle = navItem ? navItem.label : target.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    overviewPage.classList.add('hidden');
    dynamicPage.classList.remove('hidden');
    setActiveNavigation(target);
    window.history.replaceState(null, '', `#${target}`);

    dynamicPage.innerHTML = `
        <div class="cartoon-panel" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2rem;">${pageTitle}</h2>
                </div>
                <button class="cartoon-action-btn primary-yellow-btn" onclick="navigateToView('dashboard')" style="padding: 10px 20px; font-size: 1rem;">
                    Back to Dashboard
                </button>
            </div>
            <p style="font-family: var(--font-body); font-size: 1.1rem; color: #546e7a; margin-top: var(--t-space-2);">
                This section is ready for future Orixa integration. All navigation items remain present and prepared.
            </p>
            <div style="border: 2px dashed rgba(26,26,36,0.15); border-radius: 12px; padding: var(--t-space-3); text-align: center; margin-top: var(--t-space-2); background: var(--color-cream);">
                <span style="font-family: var(--font-header); font-size: 1.2rem; color: var(--border-dark);">Future ${pageTitle} Content</span>
            </div>
        </div>
    `;
}

function initDashboardNavigation() {
    document.addEventListener('click', event => {
        const navTrigger = event.target.closest('[data-target]');

        if (!navTrigger) {
            return;
        }

        const target = navTrigger.dataset.target;

        if (navTrigger.matches('a')) {
            event.preventDefault();
        }

        navigateToView(target);
    });

    // Handle hash on initial load
    const currentHash = window.location.hash.slice(1);
    if (currentHash && currentHash !== 'dashboard') {
        navigateToView(currentHash);
    }
}

function initSidebarCollapsible() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const shell = document.getElementById('dashboard');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.dashboard-sidebar');

    if (sidebarToggle && shell) {
        sidebarToggle.addEventListener('click', () => {
            const isCollapsed = shell.classList.toggle('is-sidebar-collapsed');

            // Rotate chevron icon smoothly
            const toggleIcon = sidebarToggle.querySelector('[data-icon]');
            if (toggleIcon) {
                toggleIcon.dataset.icon = isCollapsed ? 'chevronRight' : 'chevronLeft';
                renderIcons(sidebarToggle);
            }
        });
    }

    if (mobileMenuToggle && sidebar && sidebarBackdrop) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
            sidebarBackdrop.classList.add('is-active');
        });

        const closeMobileSidebar = () => {
            sidebar.classList.remove('mobile-open');
            sidebarBackdrop.classList.remove('is-active');
        };

        sidebarBackdrop.addEventListener('click', closeMobileSidebar);

        // Also close sidebar when link is clicked on mobile
        sidebar.addEventListener('click', event => {
            if (event.target.closest('.sidebar-link')) {
                closeMobileSidebar();
            }
        });
    }
}

function initSearch() {
    const searchInput = document.getElementById('dashboard-search');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!searchInput || !searchDropdown) {
        return;
    }

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            searchDropdown.classList.add('hidden');
            searchDropdown.innerHTML = '';
            return;
        }

        const matches = MOCK_DATA.searchableItems.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );

        searchDropdown.classList.remove('hidden');

        if (matches.length === 0) {
            searchDropdown.innerHTML = `<div class="search-no-results">No results found for "${escapeHTML(query)}"</div>`;
            return;
        }

        searchDropdown.innerHTML = matches.map(item => `
            <button type="button" class="search-result-item" data-target="${item.target}" data-type="${item.type}">
                <span class="search-result-title">${escapeHTML(item.title)}</span>
                <span class="search-result-type-badge">${escapeHTML(item.type)}</span>
            </button>
        `).join('');
    };

    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('focus', performSearch);

    // Click outside to close
    document.addEventListener('click', event => {
        if (!event.target.closest('.dashboard-search')) {
            searchDropdown.classList.add('hidden');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            searchDropdown.classList.add('hidden');
            searchInput.blur();
        }
    });

    // Intercept result clicks
    searchDropdown.addEventListener('click', event => {
        const itemButton = event.target.closest('.search-result-item');
        if (itemButton) {
            const target = itemButton.dataset.target;
            navigateToView(target);
            searchInput.value = '';
            searchDropdown.classList.add('hidden');
        }
    });
}

/* ==========================================================================
   QUIZ MANAGEMENT CONTROLLER
   ========================================================================== */

let quizManagementState = {
    searchQuery: '',
    statusFilter: 'All',
    subjectFilter: 'All',
    sortBy: 'name-asc'
};

function renderQuizManagementPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    // Calculate dynamic stats from MOCK_DATA.quizzes
    const totalQuizzes = MOCK_DATA.quizzes.length;
    const liveQuizzes = MOCK_DATA.quizzes.filter(q => q.status === 'Live').length;
    const draftQuizzes = MOCK_DATA.quizzes.filter(q => q.status === 'Draft').length;
    const completedQuizzes = MOCK_DATA.quizzes.filter(q => q.status === 'Closed').length;

    // Extract unique subjects from quizzes to build subject filter dynamically
    const subjectsSet = new Set(MOCK_DATA.quizzes.map(q => q.subject));
    const uniqueSubjects = Array.from(subjectsSet).sort();

    dynamicPage.innerHTML = `
        <div class="quiz-mgmt-container" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
            <div>
                <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Quiz Management</h2>
                <p class="cartoon-subtitle" style="margin-top: 4px;">Create, manage, and monitor your quizzes</p>
            </div>

            <!-- Stats Row -->
            <div class="stats-grid" style="margin-top: var(--t-space-1); margin-bottom: var(--t-space-1);">
                <article class="stat-card cartoon-panel is-yellow">
                    <div class="stat-topline">
                        <span class="stat-label">Total Quizzes</span>
                        <span class="stat-icon" data-icon="clipboard"></span>
                    </div>
                    <div>
                        <div class="stat-value">${totalQuizzes}</div>
                        <p class="stat-caption">All registered quizzes</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-green">
                    <div class="stat-topline">
                        <span class="stat-label">Live Quizzes</span>
                        <span class="stat-icon" data-icon="trophy"></span>
                    </div>
                    <div>
                        <div class="stat-value">${liveQuizzes}</div>
                        <p class="stat-caption">Active & live now</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-blue">
                    <div class="stat-topline">
                        <span class="stat-label">Draft Quizzes</span>
                        <span class="stat-icon" data-icon="clipboard"></span>
                    </div>
                    <div>
                        <div class="stat-value">${draftQuizzes}</div>
                        <p class="stat-caption">Work in progress</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-orange">
                    <div class="stat-topline">
                        <span class="stat-label">Completed Quizzes</span>
                        <span class="stat-icon" data-icon="history"></span>
                    </div>
                    <div>
                        <div class="stat-value">${completedQuizzes}</div>
                        <p class="stat-caption">Finished & closed</p>
                    </div>
                </article>
            </div>

            <!-- Toolbar -->
            <div class="quiz-mgmt-toolbar">
                <div class="quiz-mgmt-filters">
                    <div class="quiz-mgmt-search-container">
                        <span class="quiz-mgmt-search-icon" data-icon="search"></span>
                        <input type="search" id="quiz-search-input" placeholder="Search quizzes by name..." value="${escapeHTML(quizManagementState.searchQuery)}" autocomplete="off">
                    </div>
                    <select id="quiz-status-filter" class="quiz-mgmt-select">
                        <option value="All" ${quizManagementState.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                        <option value="Live" ${quizManagementState.statusFilter === 'Live' ? 'selected' : ''}>Live</option>
                        <option value="Draft" ${quizManagementState.statusFilter === 'Draft' ? 'selected' : ''}>Draft</option>
                        <option value="Closed" ${quizManagementState.statusFilter === 'Closed' ? 'selected' : ''}>Closed</option>
                    </select>
                    <select id="quiz-subject-filter" class="quiz-mgmt-select">
                        <option value="All" ${quizManagementState.subjectFilter === 'All' ? 'selected' : ''}>All Subjects</option>
                        ${uniqueSubjects.map(sub => `<option value="${escapeHTML(sub)}" ${quizManagementState.subjectFilter === sub ? 'selected' : ''}>${escapeHTML(sub)}</option>`).join('')}
                    </select>
                    <select id="quiz-sort-select" class="quiz-mgmt-select">
                        <option value="name-asc" ${quizManagementState.sortBy === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
                        <option value="name-desc" ${quizManagementState.sortBy === 'name-desc' ? 'selected' : ''}>Name: Z to A</option>
                        <option value="questions-desc" ${quizManagementState.sortBy === 'questions-desc' ? 'selected' : ''}>Questions: High-Low</option>
                        <option value="questions-asc" ${quizManagementState.sortBy === 'questions-asc' ? 'selected' : ''}>Questions: Low-High</option>
                        <option value="updated-desc" ${quizManagementState.sortBy === 'updated-desc' ? 'selected' : ''}>Recently Updated</option>
                    </select>
                </div>
                <button type="button" class="cartoon-action-btn primary-yellow-btn quiz-create-btn" id="quiz-create-button">
                    <span data-icon="plus"></span> <span>Create Quiz</span>
                </button>
            </div>

            <!-- Quiz List Container -->
            <div id="quiz-grid-container"></div>
        </div>
    `;

    // Render stats section icons
    renderIcons(dynamicPage);

    // Render list/grid based on filters
    renderQuizList();

    // Attach listeners
    const searchInput = document.getElementById('quiz-search-input');
    const statusFilter = document.getElementById('quiz-status-filter');
    const subjectFilter = document.getElementById('quiz-subject-filter');
    const sortSelect = document.getElementById('quiz-sort-select');
    const createBtn = document.getElementById('quiz-create-button');

    searchInput.addEventListener('input', (e) => {
        quizManagementState.searchQuery = e.target.value;
        renderQuizList();
    });

    statusFilter.addEventListener('change', (e) => {
        quizManagementState.statusFilter = e.target.value;
        renderQuizList();
    });

    subjectFilter.addEventListener('change', (e) => {
        quizManagementState.subjectFilter = e.target.value;
        renderQuizList();
    });

    sortSelect.addEventListener('change', (e) => {
        quizManagementState.sortBy = e.target.value;
        renderQuizList();
    });

    createBtn.addEventListener('click', () => {
        navigateToView('create-quiz');
    });
}

function renderQuizList() {
    const gridContainer = document.getElementById('quiz-grid-container');
    if (!gridContainer) return;

    let filteredQuizzes = [...MOCK_DATA.quizzes];

    // Search filter
    const query = quizManagementState.searchQuery.trim().toLowerCase();
    if (query) {
        filteredQuizzes = filteredQuizzes.filter(q => q.title.toLowerCase().includes(query));
    }

    // Status filter
    const status = quizManagementState.statusFilter;
    if (status !== 'All') {
        filteredQuizzes = filteredQuizzes.filter(q => q.status === status);
    }

    // Subject filter
    const subj = quizManagementState.subjectFilter;
    if (subj !== 'All') {
        filteredQuizzes = filteredQuizzes.filter(q => q.subject === subj);
    }

    // Sort options
    const sortBy = quizManagementState.sortBy;
    if (sortBy === 'name-asc') {
        filteredQuizzes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
        filteredQuizzes.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'questions-desc') {
        filteredQuizzes.sort((a, b) => b.questions - a.questions);
    } else if (sortBy === 'questions-asc') {
        filteredQuizzes.sort((a, b) => a.questions - b.questions);
    } else if (sortBy === 'updated-desc') {
        filteredQuizzes.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }

    // Render empty state or grid
    if (filteredQuizzes.length === 0) {
        gridContainer.innerHTML = `
            <div class="quiz-mgmt-no-results">
                <div class="quiz-mgmt-no-results-title">No Quizzes Found</div>
                <div class="quiz-mgmt-no-results-desc">Try modifying your search or filter settings.</div>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = `
        <div class="quiz-grid">
            ${filteredQuizzes.map(quiz => {
                const pillClass = quiz.status === 'Live' ? 'pill-live' : (quiz.status === 'Draft' ? 'pill-draft' : 'pill-closed');
                return `
                    <article class="quiz-mgmt-card">
                        <div class="quiz-mgmt-card-header">
                            <div>
                                <h3 class="quiz-mgmt-card-title">${escapeHTML(quiz.title)}</h3>
                                <div class="quiz-mgmt-card-subject">${escapeHTML(quiz.subject)}</div>
                            </div>
                            <span class="quiz-status-pill ${pillClass}">${quiz.status}</span>
                        </div>
                        <div class="quiz-mgmt-card-body">
                            <div class="quiz-mgmt-card-info-row">
                                <span class="quiz-meta">Questions</span>
                                <span style="font-weight: 700;">${quiz.questions}</span>
                            </div>
                            <div class="quiz-mgmt-card-info-row">
                                <span class="quiz-meta">Students / Attempts</span>
                                <span style="font-weight: 700;">${quiz.attempts}</span>
                            </div>
                            <div class="quiz-mgmt-card-info-row">
                                <span class="quiz-meta">Last Updated</span>
                                <span style="font-weight: 700; color: #546e7a;">${quiz.lastUpdated}</span>
                            </div>
                        </div>
                        <div class="quiz-mgmt-card-actions">
                            <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="viewQuizDetails(${quiz.id})" title="View Details">
                                <span data-icon="search"></span> View
                            </button>
                            <button class="quiz-mgmt-action-btn quiz-btn-edit" onclick="editQuizDetails(${quiz.id})" title="Edit Quiz">
                                <span data-icon="clipboard"></span> Edit
                            </button>
                            <button class="quiz-mgmt-action-btn quiz-btn-delete" onclick="deleteQuizConfirm(${quiz.id})" title="Delete Quiz">
                                <span data-icon="x"></span> Delete
                            </button>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
    renderIcons(gridContainer);
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
    renderIcons(overlay);
}

function closeOrixaModal() {
    const overlay = document.getElementById('orixa-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

window.openOrixaModal = openOrixaModal;
window.closeOrixaModal = closeOrixaModal;

window.viewQuizDetails = function(id) {
    const quiz = MOCK_DATA.quizzes.find(q => q.id === id);
    if (!quiz) return;

    const statusPillClass = quiz.status === 'Live' ? 'pill-live' : (quiz.status === 'Draft' ? 'pill-draft' : 'pill-closed');

    const html = `
        <div class="orixa-modal-card">
            <header class="orixa-modal-header">
                <h3 class="orixa-modal-title">Quiz Details</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body">
                <div style="text-align: center; margin-bottom: var(--t-space-1);">
                    <h2 style="font-family: var(--font-header); font-size: 1.6rem; color: var(--border-dark); margin: 0 0 4px 0;">${escapeHTML(quiz.title)}</h2>
                    <span class="quiz-status-pill ${statusPillClass}">${quiz.status}</span>
                </div>
                <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); display: flex; flex-direction: column; gap: var(--t-space-1); box-shadow: var(--shadow-chunky-pressed);">
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 6px;">
                        <span class="quiz-meta">Subject</span>
                        <span style="font-weight: 700;">${escapeHTML(quiz.subject)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 6px;">
                        <span class="quiz-meta">Questions Count</span>
                        <span style="font-weight: 700;">${quiz.questions}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 6px;">
                        <span class="quiz-meta">Total Attempts</span>
                        <span style="font-weight: 700;">${quiz.attempts} students</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-bottom: 0;">
                        <span class="quiz-meta">Last Updated</span>
                        <span style="font-weight: 700; color: #546e7a;">${quiz.lastUpdated}</span>
                    </div>
                </div>
                <p style="font-size: 0.95rem; line-height: 1.4; color: #546e7a; margin-top: 8px;">
                    This quiz is fully integrated into the Orixa Student Module. You can monitor student progress, review individual answers, and download grading templates.
                </p>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                    Close Details
                </button>
            </footer>
        </div>
    `;
    openOrixaModal(html);
};

window.editQuizDetails = function(id) {
    const quiz = MOCK_DATA.quizzes.find(q => q.id === id);
    if (!quiz) return;

    const html = `
        <div class="orixa-modal-card">
            <header class="orixa-modal-header">
                <h3 class="orixa-modal-title">Edit Quiz</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <form id="orixa-edit-quiz-form" onsubmit="saveQuizDetails(event, ${quiz.id})">
                <div class="orixa-modal-body">
                    <div class="form-field">
                        <label class="field-label" for="edit-quiz-title">QUIZ TITLE</label>
                        <div class="input-shell">
                            <input type="text" id="edit-quiz-title" class="cartoon-input" value="${escapeHTML(quiz.title)}" required>
                        </div>
                    </div>
                    <div class="form-field" style="display: flex; flex-direction: column; gap: var(--t-space-1);">
                        <label class="field-label" for="edit-quiz-subject">SUBJECT</label>
                        <select id="edit-quiz-subject" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                            <option value="Science" ${quiz.subject === 'Science' ? 'selected' : ''}>Science</option>
                            <option value="Maths" ${quiz.subject === 'Maths' ? 'selected' : ''}>Maths</option>
                            <option value="History" ${quiz.subject === 'History' ? 'selected' : ''}>History</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label class="field-label" for="edit-quiz-questions">QUESTIONS COUNT</label>
                        <div class="input-shell">
                            <input type="number" id="edit-quiz-questions" class="cartoon-input" value="${quiz.questions}" min="1" max="100" required>
                        </div>
                    </div>
                    <div class="form-field" style="display: flex; flex-direction: column; gap: var(--t-space-1);">
                        <label class="field-label" for="edit-quiz-status">STATUS</label>
                        <select id="edit-quiz-status" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                            <option value="Live" ${quiz.status === 'Live' ? 'selected' : ''}>Live</option>
                            <option value="Draft" ${quiz.status === 'Draft' ? 'selected' : ''}>Draft</option>
                            <option value="Closed" ${quiz.status === 'Closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                </div>
                <footer class="orixa-modal-footer">
                    <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                        Cancel
                    </button>
                    <button type="submit" class="cartoon-action-btn primary-yellow-btn" style="padding: 10px 24px; font-size: 0.95rem;">
                        Save Changes
                    </button>
                </footer>
            </form>
        </div>
    `;
    openOrixaModal(html);
};

window.saveQuizDetails = function(event, id) {
    event.preventDefault();
    const quiz = MOCK_DATA.quizzes.find(q => q.id === id);
    if (!quiz) return;

    const newTitle = document.getElementById('edit-quiz-title').value.trim();
    const newSubject = document.getElementById('edit-quiz-subject').value;
    const newQuestions = parseInt(document.getElementById('edit-quiz-questions').value, 10);
    const newStatus = document.getElementById('edit-quiz-status').value;

    if (newTitle) {
        quiz.title = newTitle;
        quiz.subject = newSubject;
        quiz.questions = newQuestions;
        quiz.status = newStatus;
        quiz.lastUpdated = new Date().toISOString().split('T')[0];

        closeOrixaModal();
        renderQuizManagementPage();
    }
};

window.deleteQuizConfirm = function(id) {
    const quiz = MOCK_DATA.quizzes.find(q => q.id === id);
    if (!quiz) return;

    const html = `
        <div class="orixa-modal-card">
            <header class="orixa-modal-header" style="background: #ffebee;">
                <h3 class="orixa-modal-title" style="color: var(--color-red-dark);">Confirm Delete</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body">
                <p style="font-size: 1.1rem; line-height: 1.4; color: var(--border-dark); font-weight: 700;">
                    Are you sure you want to delete <span style="color: var(--color-red-dark); font-family: var(--font-header);">${escapeHTML(quiz.title)}</span>?
                </p>
                <p style="font-size: 0.9rem; color: #546e7a;">
                    This action will permanently delete the quiz and remove all student history. This action cannot be undone.
                </p>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                    Cancel
                </button>
                <button type="button" class="cartoon-action-btn quiz-btn-delete" onclick="performDeleteQuiz(${quiz.id})" style="padding: 10px 24px; font-size: 0.95rem;">
                    Yes, Delete
                </button>
            </footer>
        </div>
    `;
    openOrixaModal(html);
};

window.performDeleteQuiz = function(id) {
    const index = MOCK_DATA.quizzes.findIndex(q => q.id === id);
    if (index !== -1) {
        MOCK_DATA.quizzes.splice(index, 1);
        closeOrixaModal();
        renderQuizManagementPage();
    }
};

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

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderStats();
    renderActivities();
    renderQuizzes();
    renderIcons();
    initDashboardNavigation();
    initSidebarCollapsible();
    initSearch();
    renderNotificationDot();
});
