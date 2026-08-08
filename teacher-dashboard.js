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
        { title: 'Solar System Basics', subject: 'Science', questions: 18, status: 'Live', icon: 'trophy' },
        { title: 'Fractions Sprint', subject: 'Maths', questions: 12, status: 'Draft', icon: 'clipboard' },
        { title: 'Ancient Civilizations', subject: 'History', questions: 20, status: 'Closed', icon: 'history' }
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
