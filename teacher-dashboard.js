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
    trophy: '<path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M5 5H3v2a4 4 0 0 0 4 4"></path><path d="M19 5h2v2a4 4 0 0 1-4 4"></path>'
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

const stats = [
    { label: 'Total Quizzes', value: '48', caption: '12 active this month', icon: 'clipboard', tone: 'yellow' },
    { label: 'Total Students', value: '312', caption: 'Across 8 classes', icon: 'users', tone: 'blue' },
    { label: 'Average Score', value: '84%', caption: 'Up 6% this week', icon: 'target', tone: 'green' },
    { label: 'Pending Attempts', value: '27', caption: 'Need review today', icon: 'clock', tone: 'orange' }
];

const activities = [
    { title: 'Grade 7 Science quiz completed', meta: '26 submissions received', icon: 'clipboard' },
    { title: 'New students joined Class B', meta: '8 profiles added', icon: 'users' },
    { title: 'Maths challenge results updated', meta: 'Average score moved to 88%', icon: 'chart' },
    { title: 'Question bank imported', meta: '35 new questions ready', icon: 'bank' }
];

const quizzes = [
    { title: 'Solar System Basics', meta: 'Science | 18 questions', status: 'Live', icon: 'trophy' },
    { title: 'Fractions Sprint', meta: 'Maths | 12 questions', status: 'Draft', icon: 'clipboard' },
    { title: 'Ancient Civilizations', meta: 'History | 20 questions', status: 'Closed', icon: 'history' }
];

const quickActions = [
    { label: 'Create Quiz', icon: 'plus', target: 'create-quiz' },
    { label: 'View Results', icon: 'chart', target: 'results' },
    { label: 'Manage Students', icon: 'users', target: 'students' }
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

    statsGrid.append(...stats.map(createStatCard));
}

function createQuickAction(action) {
    const button = document.createElement('button');
    button.className = 'cartoon-action-btn primary-yellow-btn quick-action-btn';
    button.type = 'button';
    button.dataset.target = action.target;
    button.innerHTML = `${icon(action.icon)}<span>${action.label}</span>`;
    return button;
}

function renderQuickActions() {
    const quickActionRoot = document.getElementById('quick-actions');

    if (!quickActionRoot) {
        return;
    }

    quickActionRoot.append(...quickActions.map(createQuickAction));
}

function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <span class="activity-icon">${icon(activity.icon)}</span>
        <div>
            <p class="activity-title">${activity.title}</p>
            <span class="activity-meta">${activity.meta}</span>
        </div>
    `;
    return item;
}

function renderActivities() {
    const activityList = document.getElementById('activity-list');

    if (!activityList) {
        return;
    }

    activityList.append(...activities.map(createActivityItem));
}

function createQuizItem(quiz) {
    const item = document.createElement('div');
    item.className = 'quiz-item';
    item.innerHTML = `
        <span class="quiz-icon">${icon(quiz.icon)}</span>
        <div class="quiz-info">
            <p class="quiz-title">${quiz.title}</p>
            <div class="quiz-bottomline">
                <span class="quiz-meta">${quiz.meta}</span>
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

    quizList.append(...quizzes.map(createQuizItem));
}

function setActiveNavigation(target) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('is-active', link.dataset.target === target);
    });
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

        setActiveNavigation(target);
        window.history.replaceState(null, '', `#${target}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderStats();
    renderQuickActions();
    renderActivities();
    renderQuizzes();
    renderIcons();
    initDashboardNavigation();
});
