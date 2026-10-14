/* ==========================================================================
   ORIXA - TEACHER DASHBOARD CONTROLLER
   RECOMMENDED DATABASE INDEXES FOR OPTIMAL PERFORMANCE:
   - CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_created ON public.quizzes(teacher_id, created_at DESC);
   - CREATE INDEX IF NOT EXISTS idx_quiz_attempts_started ON public.quiz_attempts(started_at DESC);
   - CREATE INDEX IF NOT EXISTS idx_student_subject_assignments_teacher_active ON public.student_subject_assignments(teacher_id, is_active);
   - CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
   - CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
   ========================================================================== */

const ICONS = {
    dashboard: '<path d="M3 13h8V3H3v10Z"></path><path d="M13 21h8V11h-8v10Z"></path><path d="M13 3v6h8V3h-8Z"></path><path d="M3 21h8v-6H3v6Z"></path>',
    list: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
    plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
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
    x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    help: '<circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    tilePuzzle: '<rect x="3" y="3" width="8" height="8" rx="1.5"></rect><rect x="13" y="3" width="8" height="8" rx="1.5"></rect><rect x="3" y="13" width="8" height="8" rx="1.5"></rect><rect x="13" y="13" width="8" height="8" rx="1.5"></rect>',
    matchFollowing: '<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="6" r="3"></circle><circle cx="18" cy="18" r="3"></circle><path d="M9 6h6"></path><path d="M9 18l6-12"></path>',
    fillBlanks: '<path d="M4 6h16"></path><path d="M4 12h5"></path><path d="M11 15h9"></path><path d="M4 18h16"></path>',
    trueFalse: '<path d="m9 12 2 2 4-4"></path><circle cx="12" cy="12" r="9"></circle>'
};

// Centralized Data Architecture (Populated from Supabase)
const MOCK_DATA = {
    teacher: {
        name: "",
        department: "",
        subjects: [],
        classes: [],
        employeeId: ""
    },
    settings: {
        notifications: {
            quiz: true,
            studentActivity: true,
            results: true,
            system: false
        },
        appearance: {
            theme: "System",
            animation: "Enabled"
        },
        quizPreferences: {
            defaultDuration: 15,
            defaultQuestions: 10,
            showCorrectAnswers: true,
            allowLateSubmissions: false
        },
        activeSessions: []
    },
    stats: [
        { label: 'Total Quizzes', value: '0', caption: 'Created this semester', icon: 'clipboard', tone: 'yellow' },
        { label: 'Total Students', value: '0', caption: 'Active: 0 | Inactive: 0', icon: 'users', tone: 'blue' },
        { label: 'Average Score', value: '0%', caption: 'Subject average score', icon: 'target', tone: 'green' },
        { label: 'Recent Activity', value: '0', caption: 'Quiz submissions today', icon: 'clock', tone: 'orange' }
    ],
    students: [],
    quizzes: [],
    results: [],
    searchableItems: [],
};

const navItems = [
    { label: 'Dashboard', icon: 'dashboard', target: 'dashboard' },
    { label: 'Quiz Management', icon: 'list', target: 'quiz-management' },
    { label: 'Create Quiz', icon: 'plus', target: 'create-quiz' },
    { label: 'Students', icon: 'users', target: 'students' },
    { label: 'Results', icon: 'chart', target: 'results' },
    { label: 'Settings', icon: 'settings', target: 'settings' },
    { label: 'Help', icon: 'help', target: 'help' }
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


function createQuizItem(quiz) {
    const item = document.createElement('div');
    item.className = 'quiz-item';
    const statusClass = quiz.status === 'Live' ? 'status-live' : (quiz.status === 'Draft' ? 'status-draft' : 'status-closed');
    item.innerHTML = `
        <span class="quiz-icon">${icon(quiz.icon)}</span>
        <div class="quiz-info">
            <p class="quiz-title">${quiz.title}</p>
            <div class="quiz-bottomline">
                <span class="quiz-meta">${quiz.subject} | ${quiz.questions} questions</span>
                <span class="quiz-status ${statusClass}">${quiz.status}</span>
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

function getInitials(name) {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function updateTopBarProfileChip() {
    const profileChipName = document.querySelector('.profile-chip .profile-name');
    const profileAvatarText = document.querySelector('.profile-chip .profile-avatar');
    if (MOCK_DATA.teacher && MOCK_DATA.teacher.name) {
        const name = MOCK_DATA.teacher.name;
        if (profileChipName) {
            profileChipName.textContent = name;
        }
        if (profileAvatarText) {
            profileAvatarText.textContent = getInitials(name);
        }
    }
    if (window.OrixaAuth) window.OrixaAuth.paintAvatars();
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
                    <div class="profile-avatar" data-user-avatar style="width: 64px; height: 64px; font-size: 1.5rem; border-width: 3px; font-family: var(--font-header); display: inline-flex; align-items: center; justify-content: center; background: var(--color-blue); border: 2px solid var(--border-dark); border-radius: 50%;">
                        ${getInitials(teacher.name)}
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

            <!-- Account Info -->
            <div style="display: flex; flex-direction: column; gap: var(--t-space-2); margin-top: var(--t-space-1); font-family: var(--font-body); font-size: 0.95rem;">
                <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin: 0;">Account Info</h4>
                <div>
                    <span style="font-weight: 700; color: #78909c;">Employee ID:</span>
                    <span style="color: var(--border-dark);">${escapeHTML(teacher.employeeId || '—')}</span>
                </div>
                <div>
                    <span style="font-weight: 700; color: #78909c;">Department:</span>
                    <span style="color: var(--border-dark);">${escapeHTML(teacher.department)}</span>
                </div>
                <div>
                    <span style="font-weight: 700; color: #78909c;">Subjects Taught:</span>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                        ${teacher.subjects.length === 0 ? '<span style="font-size: 0.9rem; color: #546e7a;">No subjects assigned yet. Your HOD assigns them.</span>' : ''}
                        ${teacher.subjects.map(subject => `
                            <span style="font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; background: var(--color-yellow); border: 2px solid var(--border-dark); border-radius: 9999px; padding: 4px 12px; color: var(--border-dark); display: inline-flex; align-items: center; justify-content: center;">
                                ${escapeHTML(subject)}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <span style="font-weight: 700; color: #78909c;">Classes Taught:</span>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                        ${teacher.classes.length === 0 ? '<span style="font-size: 0.9rem; color: #546e7a;">No classes assigned yet. Your HOD assigns them.</span>' : ''}
                        ${teacher.classes.map(cl => `
                            <span style="font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; background: var(--color-blue); border: 2px solid var(--border-dark); border-radius: 9999px; padding: 4px 12px; color: var(--border-dark); display: inline-flex; align-items: center; justify-content: center;">
                                ${escapeHTML(cl)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>

        </div>
    `;

    if (window.OrixaAuth) {
        window.OrixaAuth.paintAvatars();
        window.OrixaAuth.mountAvatarEditor(dynamicPage.querySelector('[data-user-avatar]'));
    }
}

let createQuizState = null;

async function fetchTeacherQuizzesFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const user = await window.OrixaAuth.getCurrentUser();
    if (!user) return;

    try {
        const { data, error } = await client
            .from('quizzes')
            .select('id, title, status, game_type, description, created_at, subjects!quizzes_subject_id_fkey(name), quiz_questions(count)')
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching quizzes from Supabase:', error);
            return;
        }

        if (data) {
            const mappedQuizzes = data.map(q => {
                let statusLabel = 'Draft';
                let iconName = 'clipboard';
                if (q.status === 'PUBLISHED') {
                    statusLabel = 'Live';
                    iconName = 'trophy';
                } else if (q.status === 'CLOSED') {
                    statusLabel = 'Closed';
                    iconName = 'history';
                } else if (q.status === 'ARCHIVED') {
                    statusLabel = 'Archived';
                    iconName = 'x';
                }

                const subjectName = q.subjects ? q.subjects.name : 'Computer Science';
                const questionCount = q.quiz_questions && q.quiz_questions[0] ? q.quiz_questions[0].count : 0;

                return {
                    id: q.id,
                    title: q.title,
                    subject: subjectName,
                    questions: questionCount,
                    status: statusLabel,
                    icon: iconName,
                    attempts: 0,
                    lastUpdated: q.created_at ? q.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                    gameType: q.game_type,
                    description: q.description || ''
                };
            });

            MOCK_DATA.quizzes = mappedQuizzes;
            renderQuizzes();
        }
    } catch (e) {
        console.warn('Could not fetch quizzes from Supabase:', e);
    }
}

async function fetchTeacherResultsFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const user = await window.OrixaAuth.getCurrentUser();
    if (!user) return;

    try {
        const { data: attempts, error } = await client
            .from('quiz_attempts')
            .select('id, final_earned_xp, final_accuracy_pct, started_at, completed_at, quizzes!inner(title, game_type, teacher_id, subjects!quizzes_subject_id_fkey(name)), profiles!quiz_attempts_student_id_fkey(full_name, login_id)')
            .eq('quizzes.teacher_id', user.id)
            .order('started_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching results from Supabase:', error);
            return;
        }

        if (attempts) {
            MOCK_DATA.results = attempts.map(att => {
                const quizName = att.quizzes ? att.quizzes.title : 'Quiz';
                const subjectName = (att.quizzes && att.quizzes.subjects) ? att.quizzes.subjects.name : 'Computer Science';
                const studentName = att.profiles ? (att.profiles.full_name || att.profiles.login_id) : 'Student';
                const studentId = att.profiles ? att.profiles.login_id : 'STD';
                const totalXP = att.final_earned_xp || 0;
                const percentage = att.final_accuracy_pct || 0;
                const attemptDate = att.completed_at || att.started_at;

                return {
                    id: att.id,
                    studentName: studentName,
                    studentId: studentId,
                    quizName: quizName,
                    subject: subjectName,
                    grade: 'Grade 5',
                    percentage: percentage,
                    score: totalXP,
                    totalQuestions: 100,
                    correctCount: percentage >= 50 ? 1 : 0,
                    incorrectCount: percentage < 50 ? 1 : 0,
                    daysOffset: 0,
                    dateAttempted: attemptDate ? attemptDate.split('T')[0] : '',
                    questionsBreakdown: []
                };
            });
        }
    } catch (e) {
        console.warn('Could not fetch results from Supabase:', e);
    }
}

async function fetchTeacherStudentsFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const user = await window.OrixaAuth.getCurrentUser();
    if (!user) return;

    try {
        // A student has one row per subject, so fetch in pages: the API returns at most 1000 rows at a time
        // and a fixed limit would cut the list off.
        const PAGE_SIZE = 1000;
        const assignments = [];
        let error = null;
        for (let from = 0; ; from += PAGE_SIZE) {
            const page = await client
                .from('student_subject_assignments')
                .select('id, student_id, subjects(name), academic_levels!student_subject_assignments_academic_level_id_fkey(display_name), profiles!student_subject_assignments_student_id_fkey(id, full_name, login_id, student_profiles!student_profiles_profile_id_fkey(student_id, roll_number))')
                .eq('teacher_id', user.id)
                .eq('is_active', true)
                .order('id')
                .range(from, from + PAGE_SIZE - 1);
            if (page.error) { error = page.error; break; }
            assignments.push(...page.data);
            if (page.data.length < PAGE_SIZE) break;
        }

        if (error) {
            console.error('Error fetching students from Supabase:', error);
            return;
        }

        if (assignments) {
            const byStudent = new Map();
            assignments.forEach(a => {
                const prof = a.profiles;
                if (!prof) return;
                if (!byStudent.has(prof.id)) {
                    byStudent.set(prof.id, { prof, subjects: new Set(), grades: new Set() });
                }
                const entry = byStudent.get(prof.id);
                if (a.subjects && a.subjects.name) entry.subjects.add(a.subjects.name);
                if (a.academic_levels && a.academic_levels.display_name) entry.grades.add(a.academic_levels.display_name);
            });
            const studentsList = Array.from(byStudent.values()).map(({ prof, subjects, grades }) => {
                return {
                    id: prof.login_id || prof.id,
                    name: prof.full_name || 'Student',
                    grade: Array.from(grades).join(', ') || '—',
                    subject: Array.from(subjects).join(', ') || '—',
                    status: 'Active',
                    averageScore: 0,
                    quizzesAttempted: 0
                };
            });
            MOCK_DATA.students = studentsList;
        }
    } catch (e) {
        console.warn('Could not fetch students from Supabase:', e);
    }
}

function updateDashboardStats() {
    const totalQuizzes = MOCK_DATA.quizzes.length;
    const totalStudents = MOCK_DATA.students.length;
    const activeStudents = MOCK_DATA.students.filter(s => s.status === 'Active').length;
    const inactiveStudents = MOCK_DATA.students.filter(s => s.status === 'Inactive').length;
    const results = MOCK_DATA.results;
    const avgScore = results.length > 0 ? Math.round(results.reduce((a, b) => a + (b.percentage || 0), 0) / results.length) : 0;
    const submissionsToday = results.length;

    MOCK_DATA.stats = [
        { label: 'Total Quizzes', value: String(totalQuizzes), caption: 'Created in system', icon: 'clipboard', tone: 'yellow' },
        { label: 'Total Students', value: String(totalStudents), caption: `Active: ${activeStudents} | Inactive: ${inactiveStudents}`, icon: 'users', tone: 'blue' },
        { label: 'Average Score', value: `${avgScore}%`, caption: 'Class average score', icon: 'target', tone: 'green' },
        { label: 'Recent Activity', value: String(submissionsToday), caption: 'Quiz submissions', icon: 'clock', tone: 'orange' }
    ];
    renderStats();
}

async function saveQuizToSupabase(isPublish) {
    if (!window.OrixaAuth || !window.OrixaAuth.client) {
        return { success: false, error: 'Supabase auth unavailable' };
    }
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile) {
        return { success: false, error: 'Not authenticated' };
    }

    let collegeId = profile.college_id;
    let departmentId = profile.department_id;
    let subjectId = null;
    let levelId = null;
    let sessionId = null;
    let teacherAssignmentId = null;

    const { data: assignments } = await client
        .from('teacher_subject_class_assignments')
        .select('id, college_id, department_id, subject_id, academic_level_id, academic_session_id, subjects!teacher_subject_class_assignments_subject_id_fkey(name), academic_levels!teacher_subject_class_assignments_academic_level_id_fkey(display_name, code)')
        .eq('teacher_id', profile.id)
        .eq('is_active', true);

    const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
    const activeAssignment = (assignments || []).find(a =>
        sameText(a.subjects && a.subjects.name, createQuizState.subject) &&
        (sameText(a.academic_levels && a.academic_levels.display_name, createQuizState.grade) ||
         sameText(a.academic_levels && a.academic_levels.code, createQuizState.grade))
    );

    if (activeAssignment) {
        teacherAssignmentId = activeAssignment.id;
        collegeId = activeAssignment.college_id || collegeId;
        departmentId = activeAssignment.department_id || departmentId;
        subjectId = activeAssignment.subject_id;
        levelId = activeAssignment.academic_level_id;
        sessionId = activeAssignment.academic_session_id;
    } else {
        return {
            success: false,
            error: `You are not assigned to teach "${createQuizState.subject}" for "${createQuizState.grade}". Pick a subject and class you teach, or ask your HOD to assign it.`
        };
    }

    const quizStatus = isPublish ? 'PUBLISHED' : 'DRAFT';

    const quizData = {
        college_id: collegeId,
        department_id: departmentId,
        teacher_id: profile.id,
        teacher_role: 'TEACHER',
        subject_id: subjectId,
        academic_level_id: levelId,
        academic_session_id: sessionId,
        teacher_assignment_id: teacherAssignmentId,
        title: createQuizState.title.trim(),
        description: createQuizState.description ? createQuizState.description.trim() : '',
        game_type: createQuizState.gameType,
        status: quizStatus,
        default_max_chances: Math.min(10, Math.max(1, createQuizState.settings.attempts || 3)),
        total_possible_xp: 100,
        settings: {
            timeLimit: createQuizState.settings.timeLimit || 15,
            passingScore: createQuizState.settings.passingScore || 70,
            shuffleQuestions: createQuizState.settings.shuffleQuestions || false,
            shuffleAnswers: createQuizState.settings.shuffleAnswers || false
        }
    };

    let quizInsert = null;
    let quizError = null;

    if (createQuizState.editingQuizId) {
        const { data: updated, error: uErr } = await client
            .from('quizzes')
            .update(quizData)
            .eq('id', createQuizState.editingQuizId)
            .select()
            .single();
        quizInsert = updated;
        quizError = uErr;

        if (quizInsert) {
            await client.from('quiz_questions').delete().eq('quiz_id', quizInsert.id);
        }
    } else {
        const { data: inserted, error: iErr } = await client
            .from('quizzes')
            .insert(quizData)
            .select()
            .single();
        quizInsert = inserted;
        quizError = iErr;
    }

    if (quizError || !quizInsert) {
        console.error('Failed to save quiz in Supabase:', quizError);
        if (quizError && quizError.code === '42501') {
            return {
                success: false,
                error: 'You do not have permission to save this quiz. Make sure you are logged in as this teacher: another tab in this browser may have signed in as a different user. Log out, log in again, and try once more.'
            };
        }
        return { success: false, error: quizError ? quizError.message : 'Save failed' };
    }

    const questionsToInsert = createQuizState.questions.map((q, idx) => {
        let questionText = q.text || q.statement || `Question ${idx + 1}`;
        let gamePayload = {};

        if (createQuizState.gameType === 'TILE_PUZZLE') {
            if (q.type === 'True / False') {
                // a True/False question inside a tile puzzle is stored as a 2-option question
                gamePayload = {
                    question_text: questionText,
                    options: ['True', 'False'],
                    correct_option_index: q.correctAnswer === 'False' ? '1' : '0'
                };
            } else {
                gamePayload = {
                    question_text: questionText,
                    options: q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                    correct_option_index: String(q.correctAnswer !== null && q.correctAnswer !== undefined ? q.correctAnswer : 0)
                };
            }
        } else if (createQuizState.gameType === 'MATCH_FOLLOWING') {
            gamePayload = {
                pairs: [
                    {
                        id: `p${idx + 1}`,
                        prompt: q.text || `Prompt ${idx + 1}`,
                        correct_match: q.answer || `Choice ${idx + 1}`
                    }
                ]
            };
        } else if (createQuizState.gameType === 'FILL_BLANKS') {
            const statement = q.statement || questionText;
            const options = (q.options || []).filter(o => o && o.trim() !== '');
            const correctWord = (q.options && q.options[q.correctAnswer] && q.options[q.correctAnswer].trim())
                || q.blankAnswer
                || options[0]
                || 'Option 1';
            // The sentence is stored without the answer: [text before the blank, text after the blank]
            const blankAt = q.blankAnswer ? statement.indexOf(q.blankAnswer) : -1;
            const tokens = blankAt >= 0
                ? [statement.slice(0, blankAt), statement.slice(blankAt + q.blankAnswer.length)]
                : [statement];
            gamePayload = {
                sentence_tokens: tokens,
                options: options.length > 0 ? options : [correctWord],
                correct_words: [correctWord]
            };
        } else if (createQuizState.gameType === 'TRUE_FALSE') {
            gamePayload = {
                statement: q.statement || questionText,
                correct_boolean: String(q.correctAnswer).toLowerCase()
            };
        }

        return {
            quiz_id: quizInsert.id,
            question_order: idx + 1,
            question_text: questionText,
            max_chances: Math.min(10, Math.max(1, createQuizState.settings.attempts || 3)),
            game_payload: gamePayload
        };
    });

    if (questionsToInsert.length > 0) {
        const { error: qErr } = await client.from('quiz_questions').insert(questionsToInsert);
        if (qErr) {
            console.error('Failed to save questions in Supabase:', qErr);
            return { success: false, error: qErr.message };
        }
    }

    return { success: true, quiz: quizInsert };
}

function resetCreateQuizState() {
    createQuizState = {
        step: 'select-game',
        gameType: null,
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
        questions: []
    };
}

const GAME_OPTIONS = [
    {
        type: 'TILE_PUZZLE',
        name: 'Tile Puzzle',
        icon: 'tilePuzzle',
        description: 'Students reveal questions by selecting tiles. Answer all questions correctly to complete the puzzle.',
        howItWorks: 'Each tile contains one question. Students select a tile to reveal its question and answer it. Clear all tiles to complete the quiz.'
    },
    {
        type: 'MATCH_FOLLOWING',
        name: 'Match the Following',
        icon: 'matchFollowing',
        description: 'Students drag questions and connect them with their correct answers.',
        howItWorks: 'Students will connect each question to its correct answer by dragging from the question to the matching answer. All pairs must be matched correctly to complete the game.'
    },
    {
        type: 'FILL_BLANKS',
        name: 'Fill in the Blanks',
        icon: 'fillBlanks',
        description: 'Students drag the correct words into the missing spaces.',
        howItWorks: 'Create a sentence and select the word or words that should be hidden. Students drag the correct word into each blank.'
    },
    {
        type: 'TRUE_FALSE',
        name: 'True or False',
        icon: 'trueFalse',
        description: 'Students decide whether each statement is true or false.',
        howItWorks: 'Students will read each statement and decide whether it is TRUE or FALSE. They must answer every statement correctly to complete the game.'
    }
];

function renderCreateQuizPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    if (!createQuizState) {
        resetCreateQuizState();
    }

    if (createQuizState.step === 'select-game') {
        renderGameSelectionStep(dynamicPage);
    } else {
        renderGameBuilderStep(dynamicPage);
    }
}

function renderGameSelectionStep(dynamicPage) {
    if (!createQuizState.gameType) {
        createQuizState.gameType = 'TILE_PUZZLE';
    }

    const selectedOption = GAME_OPTIONS.find(g => g.type === createQuizState.gameType) || GAME_OPTIONS[0];

    dynamicPage.innerHTML = `
        <div class="create-quiz-container" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
            <div class="create-quiz-header" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Choose Your Game</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Select how students will play this quiz.</p>
                </div>
                <button type="button" class="cartoon-action-btn create-quiz-back-btn" id="create-quiz-back-btn" style="padding: 10px 20px; font-size: 0.95rem;">
                    ← Back to Quiz Management
                </button>
            </div>

            <!-- Four Game Cards Grid -->
            <div class="game-selection-grid">
                ${GAME_OPTIONS.map(opt => {
                    const isSelected = opt.type === createQuizState.gameType;
                    return `
                        <div class="game-selection-card cartoon-panel ${isSelected ? 'is-selected' : ''}" data-game-type="${opt.type}">
                            <div class="game-card-icon-wrapper">
                                <span data-icon="${opt.icon}"></span>
                            </div>
                            <h3 class="game-card-title">${escapeHTML(opt.name)}</h3>
                            <p class="game-card-desc">${escapeHTML(opt.description)}</p>
                            <div class="game-card-action">
                                <button type="button" class="cartoon-action-btn ${isSelected ? 'primary-yellow-btn' : ''} game-card-select-btn">
                                    ${isSelected ? 'Selected <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; display: inline-block; vertical-align: -1px; margin-left: 2px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>' : 'Select'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- How This Game Works Panel -->
            <div class="cartoon-panel how-it-works-panel" id="how-it-works-panel">
                <div style="display: flex; align-items: center; gap: 8px; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin-bottom: 8px;">
                    <span data-icon="help" style="color: var(--color-blue-dark);"></span>
                    <h4 style="font-family: var(--font-header); font-size: 1.2rem; color: var(--border-dark); margin: 0;">How This Game Works: <span id="how-it-works-title" style="color: var(--color-blue-dark);">${escapeHTML(selectedOption.name)}</span></h4>
                </div>
                <p id="how-it-works-text" style="font-family: var(--font-body); font-size: 1rem; color: var(--border-dark); line-height: 1.5; margin: 0;">
                    ${escapeHTML(selectedOption.howItWorks)}
                </p>
            </div>

            <!-- Bottom Actions -->
            <div class="create-quiz-bottom-actions" style="display: flex; align-items: center; justify-content: flex-end; gap: var(--t-space-2); margin-top: var(--t-space-2);">
                <button type="button" class="cartoon-action-btn primary-yellow-btn" id="game-selection-continue-btn" style="padding: 12px 32px; font-size: 1.05rem;">
                    Continue →
                </button>
            </div>
        </div>
    `;

    renderIcons(dynamicPage);

    // Event listeners
    const backBtn = document.getElementById('create-quiz-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            navigateToView('quiz-management');
        });
    }

    const cards = dynamicPage.querySelectorAll('.game-selection-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.dataset.gameType;
            createQuizState.gameType = gameType;

            // Re-render game selection to update selected states and explanation
            renderGameSelectionStep(dynamicPage);
        });
    });

    const continueBtn = document.getElementById('game-selection-continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            createQuizState.step = 'builder';
            renderCreateQuizPage();
        });
    }
}

/* ==========================================================================
   QUESTION EXCEL UPLOAD (Create Quiz page)
   ========================================================================== */

const QUESTION_EXCEL_FORMATS = {
    TILE_PUZZLE: {
        columns: ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option (A, B, C or D)'],
        note: 'The number of questions must be a square number: 4, 9, 16, 25 and so on, so the tiles form a full grid.',
        sample: [
            ['What is 2 + 2?', '3', '4', '5', '6', 'B'],
            ['Capital of India?', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'B'],
            ['Largest planet?', 'Earth', 'Mars', 'Jupiter', 'Venus', 'C'],
            ['H2O is?', 'Water', 'Salt', 'Gold', 'Air', 'A']
        ]
    },
    MATCH_FOLLOWING: {
        columns: ['Column A', 'Column B (correct match)'],
        note: 'Write each correct pair on its own row. The game shuffles the matches for the students.',
        sample: [['Cat', 'Meow'], ['Dog', 'Bark'], ['Cow', 'Moo']]
    },
    FILL_BLANKS: {
        columns: ['Sentence', 'Option A (correct answer)', 'Option B', 'Option C', 'Option D'],
        note: 'Option A is the word that goes in the blank and must appear in the sentence. The game shuffles the options for the students.',
        sample: [
            ['The capital of India is Delhi', 'Delhi', 'Mumbai', 'Chennai', 'Kolkata'],
            ['Water boils at 100 degrees Celsius', 'Celsius', 'Fahrenheit', 'Kelvin', 'Rankine']
        ]
    },
    TRUE_FALSE: {
        columns: ['Statement', 'Answer (T or F)'],
        note: 'Write T for true or F for false.',
        sample: [['The sun rises in the east', 'T'], ['A triangle has four sides', 'F']]
    }
};

function downloadQuestionTemplate(gameType) {
    const format = QUESTION_EXCEL_FORMATS[gameType];
    if (!format || typeof XLSX === 'undefined') {
        alert('The Excel library could not be loaded. Please refresh the page and try again.');
        return;
    }
    const ws = XLSX.utils.aoa_to_sheet([format.columns, ...format.sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, `Orixa_${gameType.toLowerCase()}_questions_template.xlsx`);
}

// Turns the rows of a sheet into questions for the quiz builder: { questions, errors: [{ row, message }] }
function parseQuestionRows(gameType, rawRows) {
    const cell = (row, i) => String(row[i] === undefined || row[i] === null ? '' : row[i]).trim();
    const questions = [];
    const errors = [];
    let headerSkipped = false;

    const newId = i => `${Date.now()}-${i}-${Math.floor(Math.random() * 100000)}`;
    const letterIndex = (value, options) => {
        const t = value.trim().toUpperCase();
        const letter = t.match(/^(?:OPTION\s*)?([A-D])$/);
        if (letter) return 'ABCD'.indexOf(letter[1]);
        if (/^[1-4]$/.test(t)) return parseInt(t, 10) - 1;
        return options.findIndex(o => o.toLowerCase() === value.trim().toLowerCase());
    };

    rawRows.forEach((row, index) => {
        if (!Array.isArray(row) || row.every(c => String(c === undefined || c === null ? '' : c).trim() === '')) return;
        const rowNumber = index + 1;

        if (!headerSkipped) {
            headerSkipped = true;
            // a heading row has the column names, e.g. "Question" + "Option A"; a real question that merely
            // starts with a similar word is not mistaken for one
            const format = QUESTION_EXCEL_FORMATS[gameType];
            const first = format.columns[0].toLowerCase();
            const secondWord = format.columns[1].toLowerCase().split(/\s+/)[0];
            if (cell(row, 0).toLowerCase() === first || cell(row, 1).toLowerCase().startsWith(secondWord)) return;
        }

        const fail = message => errors.push({ row: rowNumber, message });

        if (gameType === 'TILE_PUZZLE') {
            const text = cell(row, 0);
            const options = [1, 2, 3, 4].map(i => cell(row, i));
            if (!text) return fail('The question is empty.');
            const missing = options.findIndex(o => !o);
            if (missing >= 0) return fail(`Option ${'ABCD'[missing]} is empty. All four options are needed.`);
            const correct = letterIndex(cell(row, 5), options);
            if (correct < 0) return fail('The correct option must be A, B, C or D.');
            questions.push({ id: newId(index), text, type: 'Multiple Choice', options, correctAnswer: correct, marks: 5 });
        } else if (gameType === 'MATCH_FOLLOWING') {
            const a = cell(row, 0);
            const b = cell(row, 1);
            if (!a || !b) return fail('Both Column A and Column B are needed for a pair.');
            questions.push({ id: newId(index), text: a, answer: b, marks: 1 });
        } else if (gameType === 'FILL_BLANKS') {
            let sentence = cell(row, 0);
            const word = cell(row, 1);
            const distractors = [2, 3, 4].map(i => cell(row, i));
            if (!sentence) return fail('The sentence is empty.');
            if (!word) return fail('Option A (the word to fill in) is empty.');
            if (!distractors[0]) return fail('Option B is empty. At least one wrong option is needed.');

            // the word must be in the sentence (or the blank can be written as ____)
            let at = sentence.toLowerCase().indexOf(word.toLowerCase());
            if (at < 0) {
                const marker = sentence.match(/_{2,}/);
                if (!marker) return fail(`The word "${word}" is not in the sentence.`);
                sentence = sentence.replace(marker[0], word);
                at = sentence.toLowerCase().indexOf(word.toLowerCase());
            }
            const blank = sentence.substr(at, word.length);
            questions.push({
                id: newId(index), statement: sentence, text: sentence, blankAnswer: blank,
                options: [word, ...distractors], correctAnswer: 0, marks: 5
            });
        } else if (gameType === 'TRUE_FALSE') {
            const statement = cell(row, 0);
            const answer = cell(row, 1).toUpperCase();
            if (!statement) return fail('The statement is empty.');
            if (answer !== 'T' && answer !== 'F' && answer !== 'TRUE' && answer !== 'FALSE') return fail('The answer must be T or F.');
            questions.push({ id: newId(index), statement, text: statement, correctAnswer: answer.startsWith('T') ? 'TRUE' : 'FALSE', marks: 5 });
        }
    });

    return { questions, errors };
}

function getTilePuzzleGridInfo(questionCount) {
    if (questionCount <= 0) {
        return {
            isValid: false,
            gridDimension: 0,
            targetQuestions: 4,
            neededQuestions: 4,
            statusText: "Tile Puzzle requires a square number of questions. Use 4, 9, 16, 25, ... questions.",
            previewSlotsTotal: 4,
            previewFilledCount: 0
        };
    }

    const root = Math.sqrt(questionCount);
    if (Number.isInteger(root) && root >= 2) {
        return {
            isValid: true,
            gridDimension: root,
            targetQuestions: questionCount,
            neededQuestions: 0,
            statusText: `Ready — ${root} × ${root} Tile Grid`,
            previewSlotsTotal: questionCount,
            previewFilledCount: questionCount
        };
    }

    let targetDim = Math.ceil(root);
    if (targetDim < 2) targetDim = 2;
    const targetQuestions = targetDim * targetDim;
    const neededQuestions = targetQuestions - questionCount;

    return {
        isValid: false,
        gridDimension: targetDim,
        targetQuestions: targetQuestions,
        neededQuestions: neededQuestions,
        statusText: `Add ${neededQuestions} more question${neededQuestions === 1 ? '' : 's'} to create a ${targetDim} × ${targetDim} grid. Tile Puzzle requires a square number of questions. Use 4, 9, 16, 25, ... questions.`,
        previewSlotsTotal: targetQuestions,
        previewFilledCount: questionCount
    };
}

function renderGameBuilderStep(dynamicPage) {
    const selectedOption = GAME_OPTIONS.find(g => g.type === createQuizState.gameType) || GAME_OPTIONS[0];

    dynamicPage.innerHTML = `
        <div class="create-quiz-container" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
            <div class="create-quiz-header" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal &bull; ${escapeHTML(selectedOption.name)} Builder</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Create Quiz</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Build questions for your ${escapeHTML(selectedOption.name)} quiz</p>
                </div>
                <button type="button" class="cartoon-action-btn create-quiz-back-btn" id="create-quiz-back-game-btn" style="padding: 10px 20px; font-size: 0.95rem;">
                    ← Back to Game Selection
                </button>
            </div>

            <!-- How Game Works Banner in Builder -->
            <div class="cartoon-panel how-it-works-panel" style="background: var(--color-cream); padding: var(--t-space-2);">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <span data-icon="${selectedOption.icon}" style="margin-top: 2px;"></span>
                    <div>
                        <strong style="font-family: var(--font-header); font-size: 1rem; color: var(--border-dark);">${createQuizState.gameType === 'TILE_PUZZLE' ? 'How Tile Puzzle works:' : escapeHTML(selectedOption.name) + ':'}</strong>
                        <span style="font-family: var(--font-body); font-size: 0.95rem; color: #546e7a; margin-left: 4px;">
                            ${createQuizState.gameType === 'TILE_PUZZLE' ? 'Students see a grid of tiles. Each tile contains one question. Selecting a tile reveals its question. Students answer each question to clear the tile and complete the puzzle.' : escapeHTML(selectedOption.howItWorks)}
                        </span>
                        ${createQuizState.gameType === 'FILL_BLANKS' ? `
                            <div style="margin-top: 6px; font-size: 0.9rem; color: var(--border-dark); font-weight: 500;">
                                <strong>Steps:</strong> 1. Write the complete statement. &nbsp;|&nbsp; 2. Highlight/Select the word/phrase to hide as the blank. &nbsp;|&nbsp; 3. Add answer choices. &nbsp;|&nbsp; 4. Select the correct answer. &nbsp;|&nbsp; 5. Publish the quiz.
                            </div>
                        ` : ''}
                    </div>
                </div>
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
                                ${MOCK_DATA.teacher.subjects && MOCK_DATA.teacher.subjects.length > 0
                                    ? MOCK_DATA.teacher.subjects.map(sub => `<option value="${escapeHTML(sub)}" ${createQuizState.subject === sub ? 'selected' : ''}>${escapeHTML(sub)}</option>`).join('')
                                    : `<option value="Computer Science" selected>Computer Science</option>`
                                }
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-grade">CLASS / GRADE *</label>
                            <select id="create-quiz-grade" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                                ${MOCK_DATA.teacher.classes && MOCK_DATA.teacher.classes.length > 0
                                    ? MOCK_DATA.teacher.classes.map(cls => `<option value="${escapeHTML(cls)}" ${createQuizState.grade === cls ? 'selected' : ''}>${escapeHTML(cls)}</option>`).join('')
                                    : `<option value="Grade 5" selected>Grade 5</option>`
                                }
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="create-quiz-description">DESCRIPTION</label>
                            <div class="input-shell">
                                <textarea id="create-quiz-description" class="cartoon-input" placeholder="Add a short description about this quiz..." style="height: auto; min-height: 100px; padding: var(--t-space-1) var(--t-space-2); resize: vertical; line-height: 1.4;">${escapeHTML(createQuizState.description)}</textarea>
                            </div>
                        </div>
                    </div>

                    ${createQuizState.gameType === 'TILE_PUZZLE' ? `
                    <div class="cartoon-panel create-quiz-card" id="tile-grid-preview-card" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
                        <h3 style="font-family: var(--font-header); font-size: 1.4rem; color: var(--border-dark); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin: 0;">Tile Grid Preview</h3>
                        <div id="tile-grid-preview-container" class="tile-grid-preview-container">
                            <!-- Dynamic Tile Grid Preview Content -->
                        </div>
                    </div>
                    ` : ''}

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
                            <span data-icon="plus"></span> ${createQuizState.gameType === 'MATCH_FOLLOWING' ? 'Add Matching Pair' : createQuizState.gameType === 'FILL_BLANKS' ? 'Add Blank Statement' : createQuizState.gameType === 'TRUE_FALSE' ? 'Add Statement' : 'Add Question'}
                        </button>
                        <button type="button" class="cartoon-action-btn" id="create-quiz-upload-questions-btn" aria-haspopup="dialog" style="padding: 10px 20px; font-size: 1rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--color-blue);">
                            <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;" aria-hidden="true"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor"/></svg>
                            Upload Questions from Excel
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

    // Render Tile Grid Preview dynamically
    const renderTileGridPreview = () => {
        if (createQuizState.gameType !== 'TILE_PUZZLE') return;
        const container = document.getElementById('tile-grid-preview-container');
        if (!container) return;

        const count = createQuizState.questions.length;
        const info = getTilePuzzleGridInfo(count);

        let gridHtml = '';
        if (info.previewSlotsTotal > 0) {
            let cellsHtml = '';
            for (let i = 0; i < info.previewSlotsTotal; i++) {
                const isFilled = i < info.previewFilledCount;
                cellsHtml += `
                    <div class="tile-preview-cell ${isFilled ? 'is-filled' : 'is-missing'}">
                        ${isFilled ? `Tile ${i + 1}` : '+'}
                    </div>
                `;
            }
            gridHtml = `
                <div class="tile-grid-preview-board" style="grid-template-columns: repeat(${info.gridDimension || 2}, 1fr);">
                    ${cellsHtml}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="tile-grid-preview-status ${info.isValid ? 'is-valid' : 'is-invalid'}">
                ${escapeHTML(info.statusText)}
            </div>
            ${gridHtml}
        `;
    };

    // Render Questions List dynamically
    const renderQuestionsList = () => {
        renderTileGridPreview();
        const questionsListContainer = document.getElementById('questions-list-container');
        if (!questionsListContainer) return;

        if (createQuizState.questions.length === 0) {
            questionsListContainer.innerHTML = `
                <div style="border: 2px dashed rgba(26,26,36,0.15); border-radius: 12px; padding: var(--t-space-3); text-align: center; background: var(--color-cream); margin-bottom: var(--t-space-2);">
                    <span style="font-family: var(--font-header); font-size: 1.1rem; color: #546e7a;">${createQuizState.gameType === 'MATCH_FOLLOWING' ? 'No matching pairs added yet. Click "+ Add Matching Pair" to start building!' : createQuizState.gameType === 'TRUE_FALSE' ? 'No statements added yet. Click "+ Add Statement" to start building!' : 'No questions added yet. Click "+ Add Question" to start building!'}</span>
                </div>
            `;
            return;
        }

        if (createQuizState.gameType === 'MATCH_FOLLOWING') {
            questionsListContainer.innerHTML = createQuizState.questions.map((q, index) => {
                const pairNumber = index + 1;
                return `
                    <div class="question-item-card" data-question-id="${q.id}" style="border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); background: var(--color-cream); margin-bottom: var(--t-space-1); display: flex; flex-direction: column; gap: var(--t-space-1); position: relative; box-shadow: var(--shadow-chunky-pressed);">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin-bottom: 4px;">
                            <span style="font-family: var(--font-header); font-size: 1.15rem; color: var(--border-dark); font-weight: 700;">Matching Pair ${pairNumber}</span>
                            <button type="button" class="question-delete-btn" data-question-id="${q.id}" style="background: var(--color-red); border: 2px solid var(--border-dark); border-radius: 8px; padding: 4px 12px; font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; color: var(--border-dark); cursor: pointer; box-shadow: var(--shadow-chunky-pressed); transition: transform 0.1s ease;">
                                Delete
                            </button>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--t-space-2);">
                            <div class="form-field">
                                <label class="field-label">QUESTION / PROMPT *</label>
                                <div class="input-shell">
                                    <input type="text" class="cartoon-input match-question-input" data-question-id="${q.id}" placeholder="e.g. Capital of France?" value="${escapeHTML(q.text || '')}" style="height: 44px; font-size: 0.95rem;">
                                </div>
                            </div>
                            <div class="form-field">
                                <label class="field-label">CORRECT ANSWER *</label>
                                <div class="input-shell">
                                    <input type="text" class="cartoon-input match-answer-input" data-question-id="${q.id}" placeholder="e.g. Paris" value="${escapeHTML(q.answer || '')}" style="height: 44px; font-size: 0.95rem;">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            return;
        }

        if (createQuizState.gameType === 'TRUE_FALSE') {
            questionsListContainer.innerHTML = createQuizState.questions.map((q, index) => {
                const statementNum = index + 1;
                const statement = q.statement || q.text || '';
                const isTrue = q.correctAnswer === 'TRUE' || q.correctAnswer === true;
                const isFalse = q.correctAnswer === 'FALSE' || q.correctAnswer === false;

                return `
                    <div class="question-item-card" data-question-id="${q.id}" style="border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); background: var(--color-cream); margin-bottom: var(--t-space-1); display: flex; flex-direction: column; gap: var(--t-space-1); position: relative; box-shadow: var(--shadow-chunky-pressed);">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin-bottom: 4px;">
                            <span style="font-family: var(--font-header); font-size: 1.15rem; color: var(--border-dark); font-weight: 700;">Statement ${statementNum}</span>
                            <button type="button" class="question-delete-btn" data-question-id="${q.id}" style="background: var(--color-red); border: 2px solid var(--border-dark); border-radius: 8px; padding: 4px 12px; font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; color: var(--border-dark); cursor: pointer; box-shadow: var(--shadow-chunky-pressed); transition: transform 0.1s ease;">
                                Delete
                            </button>
                        </div>

                        <div class="form-field">
                            <label class="field-label">STATEMENT TEXT *</label>
                            <div class="input-shell">
                                <textarea class="cartoon-input tf-statement-input" data-question-id="${q.id}" placeholder="e.g. Water freezes at 0°C." style="height: auto; min-height: 60px; padding: 8px 12px; resize: vertical; line-height: 1.4; font-size: 0.95rem;">${escapeHTML(statement)}</textarea>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: var(--t-space-1); margin-top: 4px;">
                            <label class="field-label">CORRECT ANSWER *</label>
                            <div style="display: flex; gap: var(--t-space-3); align-items: center;">
                                <label style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-header); font-size: 1rem; color: var(--border-dark); cursor: pointer;">
                                    <input type="radio" name="tf-correct-${q.id}" class="tf-correct-radio" data-question-id="${q.id}" data-value="TRUE" ${isTrue ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-green); cursor: pointer;">
                                    TRUE
                                </label>
                                <label style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-header); font-size: 1rem; color: var(--border-dark); cursor: pointer;">
                                    <input type="radio" name="tf-correct-${q.id}" class="tf-correct-radio" data-question-id="${q.id}" data-value="FALSE" ${isFalse ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-red); cursor: pointer;">
                                    FALSE
                                </label>
                            </div>
                        </div>

                        <!-- Teacher Live Preview -->
                        <div style="margin-top: 8px; padding: 12px; background: #ffffff; border: 2px solid var(--border-dark); border-radius: 12px; box-shadow: var(--shadow-chunky-pressed);">
                            <div style="font-family: var(--font-header); font-size: 0.8rem; text-transform: uppercase; color: #78909c; margin-bottom: 6px;">
                                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg> Student Preview
                            </div>
                            <div class="tf-preview-statement" data-question-id="${q.id}" style="font-family: var(--font-header); font-size: 1.05rem; color: var(--border-dark); margin-bottom: 12px; text-align: center; min-height: 24px;">
                                ${statement.trim() ? escapeHTML(statement) : '<span style="color: #b0bec5; font-style: italic;">Enter statement text above...</span>'}
                            </div>
                            <div style="display: flex; justify-content: center; gap: 16px;">
                                <span style="font-family: var(--font-header); font-size: 0.95rem; font-weight: 700; padding: 6px 20px; border: 2px solid var(--border-dark); border-radius: 10px; background: ${isTrue ? 'var(--color-green)' : '#f5f5f5'}; color: var(--border-dark);">
                                    TRUE ${isTrue ? '<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; display: inline-block; vertical-align: -1px; margin-left: 2px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>' : ''}
                                </span>
                                <span style="font-family: var(--font-header); font-size: 0.95rem; font-weight: 700; padding: 6px 20px; border: 2px solid var(--border-dark); border-radius: 10px; background: ${isFalse ? 'var(--color-red)' : '#f5f5f5'}; color: var(--border-dark);">
                                    FALSE ${isFalse ? '<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; display: inline-block; vertical-align: -1px; margin-left: 2px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            return;
        }

        if (createQuizState.gameType === 'FILL_BLANKS') {
            questionsListContainer.innerHTML = createQuizState.questions.map((q, index) => {
                const questionNumber = index + 1;
                const statement = q.statement || q.text || '';
                const blankAnswer = q.blankAnswer || '';
                const options = q.options || ['', '', '', ''];
                const correctAnswer = q.correctAnswer !== undefined && q.correctAnswer !== null ? q.correctAnswer : 0;

                // Split statement into clickable word tokens
                const words = statement.trim() ? statement.trim().split(/\s+/) : [];

                // Teacher preview statement text
                let previewStatement = statement;
                if (blankAnswer && statement.includes(blankAnswer)) {
                    previewStatement = statement.replace(blankAnswer, '______');
                } else if (statement.trim()) {
                    previewStatement = statement + ' (No blank selected)';
                } else {
                    previewStatement = '______';
                }

                return `
                    <div class="question-item-card" data-question-id="${q.id}" style="border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); background: var(--color-cream); margin-bottom: var(--t-space-1); display: flex; flex-direction: column; gap: var(--t-space-1); position: relative; box-shadow: var(--shadow-chunky-pressed);">
                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px; margin-bottom: 4px;">
                            <span style="font-family: var(--font-header); font-size: 1.15rem; color: var(--border-dark); font-weight: 700;">Statement ${questionNumber}</span>
                            <button type="button" class="question-delete-btn" data-question-id="${q.id}" style="background: var(--color-red); border: 2px solid var(--border-dark); border-radius: 8px; padding: 4px 12px; font-family: var(--font-header); font-size: 0.8rem; font-weight: 700; color: var(--border-dark); cursor: pointer; box-shadow: var(--shadow-chunky-pressed); transition: transform 0.1s ease;">
                                Delete
                            </button>
                        </div>

                        <!-- Complete Statement Input -->
                        <div class="form-field">
                            <label class="field-label">COMPLETE STATEMENT *</label>
                            <div class="input-shell">
                                <input type="text" class="cartoon-input fitb-statement-input" data-question-id="${q.id}" placeholder="e.g. The capital of France is Paris." value="${escapeHTML(statement)}" style="height: 44px; font-size: 0.95rem;">
                            </div>
                        </div>

                        <!-- Word/Phrase Blank Selector -->
                        <div class="form-field" style="margin-top: 4px;">
                            <label class="field-label">SELECT WORD/PHRASE TO HIDE AS BLANK *</label>
                            <div class="fitb-token-container" data-question-id="${q.id}" style="min-height: 44px; padding: 8px; background: #ffffff; border: 2px solid var(--border-dark); border-radius: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                                ${words.length > 0 ? words.map(w => {
                                    const cleanW = w.replace(/^[^\w]+|[^\w]+$/g, '');
                                    const isSel = blankAnswer && (cleanW.toLowerCase() === blankAnswer.toLowerCase() || w === blankAnswer);
                                    return `
                                        <button type="button" class="fitb-token ${isSel ? 'is-selected' : ''}" data-question-id="${q.id}" data-word="${escapeHTML(cleanW || w)}">
                                            ${escapeHTML(w)}
                                        </button>
                                    `;
                                }).join('') : '<span style="font-size: 0.85rem; color: #78909c;">Type a statement above to select a blank word...</span>'}
                            </div>
                            ${blankAnswer ? `
                                <div style="margin-top: 4px; font-size: 0.85rem; font-weight: 700; color: var(--color-purple-dark);">
                                    Selected Blank Word/Phrase: <span style="background: var(--color-yellow); padding: 2px 8px; border-radius: 6px; border: 1px solid var(--border-dark);">${escapeHTML(blankAnswer)}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Answer Options Manager -->
                        <div style="display: flex; flex-direction: column; gap: var(--t-space-1); margin-top: 4px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <label class="field-label" style="margin: 0;">ANSWER OPTIONS (SELECT CORRECT ONE) *</label>
                                <button type="button" class="fitb-add-option-btn" data-question-id="${q.id}" style="background: var(--color-yellow); border: 2px solid var(--border-dark); border-radius: 6px; padding: 2px 8px; font-family: var(--font-header); font-size: 0.75rem; font-weight: 700; cursor: pointer;">+ Add Option</button>
                            </div>
                            ${options.map((opt, optIdx) => {
                                const isChecked = correctAnswer === optIdx;
                                return `
                                    <div style="display: flex; align-items: center; gap: var(--t-space-1);">
                                        <label style="display: inline-flex; align-items: center; cursor: pointer;">
                                            <input type="radio" name="fitb-correct-${q.id}" class="fitb-correct-radio" data-question-id="${q.id}" data-option-index="${optIdx}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-green); cursor: pointer;">
                                        </label>
                                        <input type="text" class="cartoon-input fitb-option-input" data-question-id="${q.id}" data-option-index="${optIdx}" placeholder="Option ${optIdx + 1}" value="${escapeHTML(opt)}" style="height: 40px; font-size: 0.9rem;">
                                        ${options.length > 2 ? `
                                            <button type="button" class="fitb-delete-option-btn" data-question-id="${q.id}" data-option-index="${optIdx}" style="background: var(--color-red); border: 2px solid var(--border-dark); border-radius: 6px; padding: 4px 8px; font-family: var(--font-header); font-size: 0.75rem; color: var(--border-dark); font-weight: 700; cursor: pointer;"><svg class="monotone-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 L19 17.59 13.41 12z" fill="currentColor"/></svg></button>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Teacher Live Preview -->
                        <div style="margin-top: 8px; padding: 12px; background: #ffffff; border: 2px solid var(--border-dark); border-radius: 12px; box-shadow: var(--shadow-chunky-pressed);">
                            <div style="font-family: var(--font-header); font-size: 0.8rem; text-transform: uppercase; color: #78909c; margin-bottom: 6px;">
                                <svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg> Student Preview
                            </div>
                            <div class="fitb-preview-statement" data-question-id="${q.id}" style="font-family: var(--font-header); font-size: 1.05rem; color: var(--border-dark); margin-bottom: 8px;">
                                ${escapeHTML(previewStatement)}
                            </div>
                            <div class="fitb-preview-chips" data-question-id="${q.id}" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                                <span style="font-family: var(--font-header); font-size: 0.8rem; color: #546e7a;">Options:</span>
                                ${options.filter(o => o.trim()).map((o, idx) => `
                                    <span class="fitb-preview-chip ${correctAnswer === idx ? 'is-correct' : ''}">
                                        ${escapeHTML(o)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
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
        if (createQuizState.gameType === 'MATCH_FOLLOWING') {
            const matchQEls = dynamicPage.querySelectorAll('.match-question-input');
            matchQEls.forEach(el => {
                const qId = el.dataset.questionId;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.text = el.value;
            });

            const matchAEls = dynamicPage.querySelectorAll('.match-answer-input');
            matchAEls.forEach(el => {
                const qId = el.dataset.questionId;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.answer = el.value;
            });
        } else if (createQuizState.gameType === 'FILL_BLANKS') {
            const stmtEls = dynamicPage.querySelectorAll('.fitb-statement-input');
            stmtEls.forEach(el => {
                const qId = el.dataset.questionId;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.statement = el.value;
                    q.text = el.value;
                }
            });

            const fitbOptEls = dynamicPage.querySelectorAll('.fitb-option-input');
            fitbOptEls.forEach(el => {
                const qId = el.dataset.questionId;
                const optIdx = parseInt(el.dataset.optionIndex, 10);
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q && q.options) {
                    q.options[optIdx] = el.value;
                }
            });
        } else if (createQuizState.gameType === 'TRUE_FALSE') {
            const tfStmtEls = dynamicPage.querySelectorAll('.tf-statement-input');
            tfStmtEls.forEach(el => {
                const qId = el.dataset.questionId;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.statement = el.value;
                    q.text = el.value;
                }
            });
        } else {
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
        }
    };

    // Initial render of questions
    renderQuestionsList();
    renderIcons(document.getElementById('questions-card'));

    // Attach listeners
    const backGameBtn = document.getElementById('create-quiz-back-game-btn');
    if (backGameBtn) {
        backGameBtn.addEventListener('click', () => {
            createQuizState.step = 'select-game';
            renderCreateQuizPage();
        });
    }

    const backBtn = document.getElementById('create-quiz-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            navigateToView('quiz-management');
        });
    }

    // ----- Upload questions from an Excel sheet -----
    const uploadQuestionsBtn = document.getElementById('create-quiz-upload-questions-btn');
    if (uploadQuestionsBtn) {
        uploadQuestionsBtn.addEventListener('click', () => {
            syncQuestionsState();
            const gameType = createQuizState.gameType;
            const format = QUESTION_EXCEL_FORMATS[gameType];
            if (!format) return;

            const isBlank = q => !(q.text || '').trim() && !(q.statement || '').trim() && !(q.answer || '').trim()
                && !(q.options || []).some(o => (o || '').trim());
            const existing = createQuizState.questions.filter(q => !isBlank(q));

            openOrixaModal(`
                <div class="orixa-modal-card" role="dialog" aria-modal="true" aria-labelledby="qx-title" style="max-width: 640px; max-height: 90vh; overflow-y: auto;">
                    <header class="orixa-modal-header">
                        <h3 class="orixa-modal-title" id="qx-title">Upload Questions from Excel</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                        <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: 14px; box-shadow: var(--shadow-chunky-pressed);">
                            <p style="font-family: var(--font-header); font-size: 0.95rem; font-weight: 700; color: var(--border-dark); margin: 0 0 6px 0;">Excel column order:</p>
                            <p style="font-family: var(--font-header); font-size: 0.9rem; color: var(--color-purple); font-weight: 700; margin: 0 0 6px 0;">${format.columns.map(escapeHTML).join(' &rarr; ')}</p>
                            <p style="font-family: var(--font-body); font-size: 0.88rem; color: #546e7a; font-weight: 600; margin: 0 0 10px 0;">${escapeHTML(format.note)} The first row may be a heading row.</p>
                            <button type="button" class="cartoon-action-btn primary-yellow-btn" id="qx-template-btn" style="padding: 8px 16px; font-size: 0.85rem;">Download Template</button>
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="qx-file">CHOOSE YOUR EXCEL FILE (.xlsx, .xls or .csv)</label>
                            <div class="input-shell"><input type="file" id="qx-file" class="cartoon-input" accept=".xlsx,.xls,.csv" style="padding-top: 10px;"></div>
                        </div>
                        <div id="qx-results" role="status" aria-live="polite"></div>
                    </div>
                    <footer class="orixa-modal-footer" id="qx-actions" style="flex-wrap: wrap;">
                        <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">Cancel</button>
                    </footer>
                </div>
            `);

            document.getElementById('qx-template-btn').addEventListener('click', () => downloadQuestionTemplate(gameType));

            const importQuestions = (questions, replace) => {
                const kept = replace ? [] : existing;
                createQuizState.questions = kept.concat(questions);
                closeOrixaModal();
                renderQuestionsList();
            };

            document.getElementById('qx-file').addEventListener('change', event => {
                const file = event.target.files && event.target.files[0];
                const results = document.getElementById('qx-results');
                const actions = document.getElementById('qx-actions');
                if (!file) return;
                if (typeof XLSX === 'undefined') { results.textContent = 'The Excel library could not be loaded. Please refresh the page.'; return; }

                const reader = new FileReader();
                reader.onload = e => {
                    let parsed;
                    try {
                        const wb = XLSX.read(e.target.result, { type: 'array' });
                        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
                        parsed = parseQuestionRows(gameType, rows);
                    } catch (err) {
                        console.error('Could not read the question sheet:', err);
                        results.innerHTML = '<p style="color: var(--color-red-dark); font-weight: 700;">This file could not be read. Please use an .xlsx, .xls or .csv file.</p>';
                        return;
                    }

                    const { questions, errors } = parsed;
                    const tile = gameType === 'TILE_PUZZLE';
                    const canReplace = questions.length > 0 && (!tile || getTilePuzzleGridInfo(questions.length).isValid);
                    const canAdd = questions.length > 0 && existing.length > 0 && (!tile || getTilePuzzleGridInfo(existing.length + questions.length).isValid);

                    let tileMessage = '';
                    if (tile && questions.length > 0 && !canReplace) {
                        const info = getTilePuzzleGridInfo(questions.length);
                        tileMessage = `<p style="color: var(--color-red-dark); font-weight: 700; margin: 6px 0;">Tile Puzzle needs a square number of questions (4, 9, 16, 25...). This file has ${questions.length} valid question${questions.length === 1 ? '' : 's'}: add ${info.neededQuestions} more, or remove ${questions.length - Math.pow(Math.floor(Math.sqrt(questions.length)), 2)}.</p>`;
                    }

                    results.innerHTML = `
                        <p style="font-family: var(--font-header); font-weight: 700; color: var(--border-dark); margin: 0 0 6px 0;">
                            ${questions.length} valid &middot; <span style="color: ${errors.length ? 'var(--color-red-dark)' : 'inherit'};">${errors.length} need attention</span>
                        </p>
                        ${tileMessage}
                        ${errors.length ? `<ul style="margin: 0; padding-left: 18px; max-height: 160px; overflow-y: auto; font-family: var(--font-body); font-size: 0.88rem; color: var(--color-red-dark);">${errors.slice(0, 50).map(er => `<li>Row ${er.row}: ${escapeHTML(er.message)}</li>`).join('')}${errors.length > 50 ? `<li>&hellip; and ${errors.length - 50} more</li>` : ''}</ul>` : ''}
                        ${errors.length && questions.length ? '<p style="font-family: var(--font-body); font-size: 0.85rem; color: #546e7a; margin: 6px 0 0 0;">Rows with a problem are skipped; the valid rows are imported.</p>' : ''}
                    `;

                    actions.innerHTML = `
                        <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">Cancel</button>
                        ${existing.length ? `<button type="button" class="cartoon-action-btn" id="qx-add" ${canAdd ? '' : 'disabled'} style="padding: 10px 20px; font-size: 0.95rem;" title="${canAdd ? '' : 'The total must be a square number'}">Add to my ${existing.length} question${existing.length === 1 ? '' : 's'}</button>` : ''}
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" id="qx-replace" ${canReplace ? '' : 'disabled'} style="padding: 10px 24px; font-size: 0.95rem;">${existing.length ? 'Replace my questions' : `Import ${questions.length} question${questions.length === 1 ? '' : 's'}`}</button>
                    `;
                    const addBtn = document.getElementById('qx-add');
                    if (addBtn) addBtn.addEventListener('click', () => importQuestions(questions, false));
                    document.getElementById('qx-replace').addEventListener('click', () => importQuestions(questions, true));
                };
                reader.readAsArrayBuffer(file);
            });
        });
    }

    const addQuestionBtn = document.getElementById('create-quiz-add-question-btn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            syncQuestionsState();
            if (createQuizState.gameType === 'MATCH_FOLLOWING') {
                createQuizState.questions.push({
                    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    text: '',
                    answer: '',
                    marks: 1
                });
            } else if (createQuizState.gameType === 'FILL_BLANKS') {
                createQuizState.questions.push({
                    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    statement: '',
                    text: '',
                    blankAnswer: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    marks: 5
                });
            } else if (createQuizState.gameType === 'TRUE_FALSE') {
                createQuizState.questions.push({
                    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    statement: '',
                    text: '',
                    correctAnswer: null,
                    marks: 5
                });
            } else {
                createQuizState.questions.push({
                    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    text: '',
                    type: 'Multiple Choice',
                    options: ['', '', '', ''],
                    correctAnswer: null,
                    marks: 5
                });
            }
            renderQuestionsList();
        });
    }

    const container = dynamicPage.querySelector('.create-quiz-container');
    if (container) {
        container.addEventListener('input', (e) => {
            syncQuestionsState();

            if (createQuizState.gameType === 'FILL_BLANKS') {
                if (e.target.classList.contains('fitb-statement-input')) {
                    const qId = e.target.dataset.questionId;
                    const q = createQuizState.questions.find(item => item.id === qId);
                    if (q) {
                        const stmt = e.target.value;
                        const prevEl = dynamicPage.querySelector(`.fitb-preview-statement[data-question-id="${qId}"]`);
                        if (prevEl) {
                            let previewStatement = stmt;
                            if (q.blankAnswer && stmt.includes(q.blankAnswer)) {
                                previewStatement = stmt.replace(q.blankAnswer, '______');
                            } else if (stmt.trim()) {
                                previewStatement = stmt + ' (No blank selected)';
                            } else {
                                previewStatement = '______';
                            }
                            prevEl.textContent = previewStatement;
                        }

                        // Update word token bubbles without touching the input
                        const tokenContainer = dynamicPage.querySelector(`.fitb-token-container[data-question-id="${qId}"]`);
                        if (tokenContainer) {
                            const words = stmt.trim() ? stmt.trim().split(/\s+/) : [];
                            if (words.length > 0) {
                                tokenContainer.innerHTML = words.map(w => {
                                    const cleanW = w.replace(/^[^\w]+|[^\w]+$/g, '');
                                    const isSel = q.blankAnswer && (cleanW.toLowerCase() === q.blankAnswer.toLowerCase() || w === q.blankAnswer);
                                    return `
                                        <button type="button" class="fitb-token ${isSel ? 'is-selected' : ''}" data-question-id="${q.id}" data-word="${escapeHTML(cleanW || w)}">
                                            ${escapeHTML(w)}
                                        </button>
                                    `;
                                }).join('');
                            } else {
                                tokenContainer.innerHTML = '<span style="font-size: 0.85rem; color: #78909c;">Type a statement above to select a blank word...</span>';
                            }
                        }
                    }
                } else if (e.target.classList.contains('fitb-option-input')) {
                    const qId = e.target.dataset.questionId;
                    const q = createQuizState.questions.find(item => item.id === qId);
                    if (q) {
                        const chipsContainer = dynamicPage.querySelector(`.fitb-preview-chips[data-question-id="${qId}"]`);
                        if (chipsContainer) {
                            const correctAnswer = q.correctAnswer !== undefined && q.correctAnswer !== null ? q.correctAnswer : 0;
                            chipsContainer.innerHTML = `
                                <span style="font-family: var(--font-header); font-size: 0.8rem; color: #546e7a;">Options:</span>
                                ${q.options.filter(o => o && o.trim()).map((o, idx) => `
                                    <span class="fitb-preview-chip ${correctAnswer === idx ? 'is-correct' : ''}">
                                        ${escapeHTML(o)}
                                    </span>
                                `).join('')}
                            `;
                        }
                    }
                }
            } else if (createQuizState.gameType === 'TRUE_FALSE') {
                if (e.target.classList.contains('tf-statement-input')) {
                    const qId = e.target.dataset.questionId;
                    const prevEl = dynamicPage.querySelector(`.tf-preview-statement[data-question-id="${qId}"]`);
                    if (prevEl) {
                        const val = e.target.value.trim();
                        prevEl.textContent = val ? val : 'Enter statement text above...';
                    }
                }
            }
        });

        container.addEventListener('change', (e) => {
            syncQuestionsState();

            // Handle radio changes and type selector changes
            if (e.target.classList.contains('correct-answer-radio')) {
                const qId = e.target.dataset.questionId;
                const optIndex = parseInt(e.target.dataset.optionIndex, 10);
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.correctAnswer = optIndex;
            } else if (e.target.classList.contains('fitb-correct-radio')) {
                const qId = e.target.dataset.questionId;
                const optIndex = parseInt(e.target.dataset.optionIndex, 10);
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.correctAnswer = optIndex;
                    renderQuestionsList();
                }
            } else if (e.target.classList.contains('correct-answer-radio-tf')) {
                const qId = e.target.dataset.questionId;
                const val = e.target.dataset.value;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) q.correctAnswer = val;
            } else if (e.target.classList.contains('tf-correct-radio')) {
                const qId = e.target.dataset.questionId;
                const val = e.target.dataset.value;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.correctAnswer = val;
                    renderQuestionsList();
                }
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

        // Intercept clicks for FITB token selection, add/delete option, delete question
        container.addEventListener('click', (e) => {
            const fitbToken = e.target.closest('.fitb-token');
            if (fitbToken) {
                syncQuestionsState();
                const qId = fitbToken.dataset.questionId;
                const word = fitbToken.dataset.word;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.blankAnswer = word;
                    // Auto-fill selected word into correct answer option if needed
                    const currOptIdx = q.correctAnswer !== undefined && q.correctAnswer !== null ? q.correctAnswer : 0;
                    if (!q.options[currOptIdx] || q.options[currOptIdx].trim() === '') {
                        q.options[currOptIdx] = word;
                    }
                    renderQuestionsList();
                }
                return;
            }

            const addOptBtn = e.target.closest('.fitb-add-option-btn');
            if (addOptBtn) {
                syncQuestionsState();
                const qId = addOptBtn.dataset.questionId;
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q) {
                    q.options.push('');
                    renderQuestionsList();
                }
                return;
            }

            const delOptBtn = e.target.closest('.fitb-delete-option-btn');
            if (delOptBtn) {
                syncQuestionsState();
                const qId = delOptBtn.dataset.questionId;
                const optIdx = parseInt(delOptBtn.dataset.optionIndex, 10);
                const q = createQuizState.questions.find(item => item.id === qId);
                if (q && q.options.length > 2) {
                    q.options.splice(optIdx, 1);
                    if (q.correctAnswer >= q.options.length) {
                        q.correctAnswer = 0;
                    }
                    renderQuestionsList();
                }
                return;
            }

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

        if (createQuizState.gameType === 'TILE_PUZZLE') {
            const gridInfo = getTilePuzzleGridInfo(createQuizState.questions.length);
            if (!gridInfo.isValid) {
                errors.push(gridInfo.statusText);
            }
        }

        return errors;
    };

    const validatePublish = () => {
        dynamicPage.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
        dynamicPage.querySelectorAll('.question-item-card.input-invalid').forEach(el => el.classList.remove('input-invalid'));

        const errors = validateDraft();

        if (createQuizState.questions.length === 0) {
            errors.push(createQuizState.gameType === 'MATCH_FOLLOWING' ? "The quiz must have at least one matching pair." : createQuizState.gameType === 'TRUE_FALSE' ? "The quiz must have at least one statement." : "The quiz must have at least one question.");
        }

        if (createQuizState.gameType === 'MATCH_FOLLOWING') {
            createQuizState.questions.forEach((q, index) => {
                const num = index + 1;
                const qCard = dynamicPage.querySelector(`[data-question-id="${q.id}"]`);

                if (!q.text || !q.text.trim()) {
                    errors.push(`Pair ${num}: Question/Prompt cannot be blank.`);
                    if (qCard) {
                        const input = qCard.querySelector('.match-question-input');
                        if (input) input.classList.add('input-invalid');
                    }
                }

                if (!q.answer || !q.answer.trim()) {
                    errors.push(`Pair ${num}: Correct Answer cannot be blank.`);
                    if (qCard) {
                        const input = qCard.querySelector('.match-answer-input');
                        if (input) input.classList.add('input-invalid');
                    }
                }
            });
        } else if (createQuizState.gameType === 'FILL_BLANKS') {
            createQuizState.questions.forEach((q, index) => {
                const num = index + 1;
                const qCard = dynamicPage.querySelector(`[data-question-id="${q.id}"]`);
                const stmt = (q.statement || q.text || '').trim();

                if (!stmt) {
                    errors.push(`Statement ${num}: Statement text cannot be blank.`);
                    if (qCard) {
                        const input = qCard.querySelector('.fitb-statement-input');
                        if (input) input.classList.add('input-invalid');
                    }
                }

                if (!q.blankAnswer || !q.blankAnswer.trim()) {
                    errors.push(`Statement ${num}: A word or phrase must be selected for the blank.`);
                    if (qCard) {
                        const tokenBox = qCard.querySelector('.fitb-token-container');
                        if (tokenBox) tokenBox.classList.add('input-invalid');
                    }
                }

                const options = (q.options || []).filter(o => o && o.trim() !== '');
                if (options.length === 0) {
                    errors.push(`Statement ${num}: There must be answer options.`);
                    if (qCard) qCard.classList.add('input-invalid');
                }

                if (q.correctAnswer === null || q.correctAnswer === undefined || !q.options[q.correctAnswer] || !q.options[q.correctAnswer].trim()) {
                    errors.push(`Statement ${num}: The correct answer must exist and be one of the available options.`);
                    if (qCard) qCard.classList.add('input-invalid');
                }
            });
        } else if (createQuizState.gameType === 'TRUE_FALSE') {
            createQuizState.questions.forEach((q, index) => {
                const num = index + 1;
                const qCard = dynamicPage.querySelector(`[data-question-id="${q.id}"]`);
                const stmt = (q.statement || q.text || '').trim();

                if (!stmt) {
                    errors.push(`Statement ${num}: Statement text cannot be blank.`);
                    if (qCard) {
                        const input = qCard.querySelector('.tf-statement-input');
                        if (input) input.classList.add('input-invalid');
                    }
                }

                if (q.correctAnswer !== 'TRUE' && q.correctAnswer !== 'FALSE' && q.correctAnswer !== true && q.correctAnswer !== false) {
                    errors.push(`Statement ${num}: Please select TRUE or FALSE as the correct answer.`);
                    if (qCard) qCard.classList.add('input-invalid');
                }
            });
        } else {
            createQuizState.questions.forEach((q, index) => {
                const num = index + 1;
                const qCard = dynamicPage.querySelector(`[data-question-id="${q.id}"]`);

                if (!q.text.trim()) {
                    errors.push(`Question ${num}: Question text cannot be blank.`);
                    if (qCard) {
                        const input = qCard.querySelector('.question-text-input');
                        if (input) input.classList.add('input-invalid');
                    }
                }

                if (q.type === 'Multiple Choice') {
                    q.options.forEach((opt, optIdx) => {
                        if (!opt.trim()) {
                            errors.push(`Question ${num}: Option ${String.fromCharCode(65 + optIdx)} cannot be blank.`);
                            if (qCard) {
                                const inputs = qCard.querySelectorAll('.question-option-input');
                                if (inputs && inputs[optIdx]) inputs[optIdx].classList.add('input-invalid');
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
        }

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

            // Save to Supabase; the list is re-fetched after a successful save
            saveQuizToSupabase(false).then(res => {
                if (!res.success) {
                    console.error('Save draft error:', res.error);
                    openOrixaModal(`
                        <div class="orixa-modal-card">
                            <header class="orixa-modal-header" style="background: var(--color-red);">
                                <h3 class="orixa-modal-title" style="color: #ffffff;">Save Failed</h3>
                                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal();" aria-label="Close modal">
                                    <span data-icon="x"></span>
                                </button>
                            </header>
                            <div class="orixa-modal-body" style="padding: var(--t-space-3);">
                                <p style="font-size: 1.1rem; font-weight: 700; color: var(--border-dark);">Could not save quiz to database:</p>
                                <p style="color: var(--color-red-dark); font-size: 0.95rem; margin-top: 8px;">${escapeHTML(res.error || 'Unknown error')}</p>
                            </div>
                        </div>
                    `);
                    return;
                }
                fetchTeacherQuizzesFromSupabase();

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
                    saveQuizToSupabase(true).then(res => {
                        if (!res.success) {
                            console.error('Publish error:', res.error);
                            closeOrixaModal();
                            openOrixaModal(`
                                <div class="orixa-modal-card">
                                    <header class="orixa-modal-header" style="background: var(--color-red);">
                                        <h3 class="orixa-modal-title" style="color: #ffffff;">Publish Failed</h3>
                                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal();" aria-label="Close modal">
                                            <span data-icon="x"></span>
                                        </button>
                                    </header>
                                    <div class="orixa-modal-body" style="padding: var(--t-space-3);">
                                        <p style="font-size: 1.1rem; font-weight: 700; color: var(--border-dark);">Could not publish quiz to database:</p>
                                        <p style="color: var(--color-red-dark); font-size: 0.95rem; margin-top: 8px;">${escapeHTML(res.error || 'Unknown error')}</p>
                                    </div>
                                </div>
                            `);
                            return;
                        }
                        fetchTeacherQuizzesFromSupabase();

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

    if (target === 'students') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderStudentsPage();
        setActiveNavigation('students');
        window.history.replaceState(null, '', `#students`);
        return;
    }

    if (target === 'results') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderResultsPage();
        setActiveNavigation('results');
        window.history.replaceState(null, '', `#results`);
        return;
    }

    if (target === 'settings') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderSettingsPage();
        setActiveNavigation('settings');
        window.history.replaceState(null, '', `#settings`);
        return;
    }

    if (target === 'help') {
        overviewPage.classList.add('hidden');
        dynamicPage.classList.remove('hidden');
        renderHelpPage();
        setActiveNavigation('help');
        window.history.replaceState(null, '', `#help`);
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
    if (currentHash && currentHash !== 'dashboard' && navItems.some(item => item.target === currentHash)) {
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
        const initialIcon = sidebarToggle.querySelector('[data-icon]');
        if (initialIcon) {
            const isCollapsed = shell.classList.contains('is-sidebar-collapsed');
            initialIcon.dataset.icon = isCollapsed ? 'chevronRight' : 'chevronLeft';
            renderIcons(sidebarToggle);
        }

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
                            <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="viewQuizDetails('${quiz.id}')" title="View Details">
                                <span data-icon="search"></span> View
                            </button>
                            <button class="quiz-mgmt-action-btn quiz-btn-edit" onclick="editQuizDetails('${quiz.id}')" title="Edit Quiz">
                                <span data-icon="clipboard"></span> Edit
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
    const quiz = MOCK_DATA.quizzes.find(q => String(q.id) === String(id));
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
    const quiz = MOCK_DATA.quizzes.find(q => String(q.id) === String(id));
    if (!quiz) return;

    const html = `
        <div class="orixa-modal-card">
            <header class="orixa-modal-header">
                <h3 class="orixa-modal-title">Edit Quiz</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <form id="orixa-edit-quiz-form" onsubmit="saveQuizDetails(event, '${quiz.id}')">
                <div class="orixa-modal-body">
                    <div class="form-field">
                        <label class="field-label" for="edit-quiz-title">QUIZ TITLE</label>
                        <div class="input-shell">
                            <input type="text" id="edit-quiz-title" class="cartoon-input" value="${escapeHTML(quiz.title)}" required>
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

window.saveQuizDetails = async function(event, id) {
    event.preventDefault();
    const quiz = MOCK_DATA.quizzes.find(q => String(q.id) === String(id));
    if (!quiz) return;

    const newTitle = document.getElementById('edit-quiz-title').value.trim();
    const newStatus = document.getElementById('edit-quiz-status').value;

    if (newTitle) {
        let dbStatus = 'DRAFT';
        if (newStatus === 'Live') dbStatus = 'PUBLISHED';
        else if (newStatus === 'Closed') dbStatus = 'CLOSED';

        if (window.OrixaAuth && window.OrixaAuth.client) {
            const { error } = await window.OrixaAuth.client
                .from('quizzes')
                .update({ title: newTitle, status: dbStatus, updated_at: new Date().toISOString() })
                .eq('id', quiz.id);

            if (error) {
                console.error('Error updating quiz in Supabase:', error);
                alert('Could not update quiz: ' + error.message);
            } else {
                await fetchTeacherQuizzesFromSupabase();
            }
        }

        closeOrixaModal();
        renderQuizManagementPage();
    }
};

/* ==========================================================================
   STUDENTS SECTION CONTROLLER
   ========================================================================== */

function renderStudentsPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    // 1. Calculate dynamic statistics
    const totalStudents = MOCK_DATA.students.length;
    const activeStudents = MOCK_DATA.students.filter(s => s.status === 'Active').length;
    const inactiveStudents = MOCK_DATA.students.filter(s => s.status === 'Inactive').length;

    // Calculate average score of students
    let averageScore = 0;
    if (totalStudents > 0) {
        const totalScore = MOCK_DATA.students.reduce((sum, s) => sum + (s.averageScore || 0), 0);
        averageScore = Math.round(totalScore / totalStudents);
    }

    // Get unique classes/grades and subjects for dropdown filters
    const gradesSet = new Set(MOCK_DATA.students.map(s => s.grade));
    const uniqueGrades = Array.from(gradesSet).sort();

    const subjectsSet = new Set(MOCK_DATA.students.map(s => s.subject));
    const uniqueSubjects = Array.from(subjectsSet).sort();

    // 2. Build the structural HTML for Students Page
    dynamicPage.innerHTML = `
        <div class="students-container" style="display: flex; flex-direction: column; gap: var(--t-space-2);">

            <!-- Page Header -->
            <div class="students-header" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Students</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">View and manage your students</p>
                </div>
            </div>

            <!-- Statistics Row (Dynamic) -->
            <div class="stats-grid" style="margin-top: var(--t-space-1); margin-bottom: var(--t-space-1);">
                <article class="stat-card cartoon-panel is-blue">
                    <div class="stat-topline">
                        <span class="stat-label">Total Students</span>
                        <span class="stat-icon" data-icon="users"></span>
                    </div>
                    <div>
                        <div class="stat-value" id="student-stat-total">${totalStudents}</div>
                        <p class="stat-caption">All assigned students</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-green">
                    <div class="stat-topline">
                        <span class="stat-label">Active Students</span>
                        <span class="stat-icon" data-icon="trophy"></span>
                    </div>
                    <div>
                        <div class="stat-value" id="student-stat-active">${activeStudents}</div>
                        <p class="stat-caption">Active class members</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-orange">
                    <div class="stat-topline">
                        <span class="stat-label">Inactive Students</span>
                        <span class="stat-icon" data-icon="clock"></span>
                    </div>
                    <div>
                        <div class="stat-value" id="student-stat-inactive">${inactiveStudents}</div>
                        <p class="stat-caption">Suspended / offline</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-yellow">
                    <div class="stat-topline">
                        <span class="stat-label">Average Score</span>
                        <span class="stat-icon" data-icon="target"></span>
                    </div>
                    <div>
                        <div class="stat-value" id="student-stat-avg">${averageScore}%</div>
                        <p class="stat-caption">Class average performance</p>
                    </div>
                </article>
            </div>

            <!-- Toolbar (Search & Filters) -->
            <div class="quiz-mgmt-toolbar">
                <div class="quiz-mgmt-filters">
                    <div class="quiz-mgmt-search-container">
                        <span class="quiz-mgmt-search-icon" data-icon="search"></span>
                        <input type="search" id="student-search-input" placeholder="Search students by name or ID..." value="${escapeHTML(studentsPageState.searchQuery)}" autocomplete="off">
                    </div>
                    <select id="student-status-filter" class="quiz-mgmt-select">
                        <option value="All" ${studentsPageState.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                        <option value="Active" ${studentsPageState.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${studentsPageState.statusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                    <select id="student-grade-filter" class="quiz-mgmt-select">
                        <option value="All">All Grades</option>
                        ${uniqueGrades.map(g => `<option value="${escapeHTML(g)}" ${studentsPageState.gradeFilter === g ? 'selected' : ''}>${escapeHTML(g)}</option>`).join('')}
                    </select>
                    <select id="student-subject-filter" class="quiz-mgmt-select">
                        <option value="All">All Subjects</option>
                        ${uniqueSubjects.map(sub => `<option value="${escapeHTML(sub)}" ${studentsPageState.subjectFilter === sub ? 'selected' : ''}>${escapeHTML(sub)}</option>`).join('')}
                    </select>
                    <select id="student-sort-select" class="quiz-mgmt-select">
                        <option value="name-asc" ${studentsPageState.sortBy === 'name-asc' ? 'selected' : ''}>Name A-Z</option>
                        <option value="name-desc" ${studentsPageState.sortBy === 'name-desc' ? 'selected' : ''}>Name Z-A</option>
                        <option value="score-desc" ${studentsPageState.sortBy === 'score-desc' ? 'selected' : ''}>Highest Score</option>
                        <option value="score-asc" ${studentsPageState.sortBy === 'score-asc' ? 'selected' : ''}>Lowest Score</option>
                        <option value="recently-added" ${studentsPageState.sortBy === 'recently-added' ? 'selected' : ''}>Recently Added</option>
                    </select>
                    <button type="button" class="cartoon-action-btn" id="student-clear-filters-btn" style="height: 44px; padding: 0 16px; font-size: 0.85rem; border-color: var(--border-dark); background: var(--color-orange); box-shadow: var(--shadow-chunky-pressed); font-family: var(--font-header); font-weight: 700; border-radius: 12px; display: ${(studentsPageState.searchQuery || studentsPageState.statusFilter !== 'All' || studentsPageState.gradeFilter !== 'All' || studentsPageState.subjectFilter !== 'All') ? 'inline-flex' : 'none'}; align-items: center; justify-content: center; border-width: 3px;">
                        Clear Filters
                    </button>
                </div>
            </div>

            <!-- Student List Container -->
            <div id="student-list-container"></div>
        </div>
    `;

    renderIcons(dynamicPage);
    renderStudentsList();

    // Attach control event listeners
    const searchInput = document.getElementById('student-search-input');
    const statusFilter = document.getElementById('student-status-filter');
    const gradeFilter = document.getElementById('student-grade-filter');
    const subjectFilter = document.getElementById('student-subject-filter');
    const sortSelect = document.getElementById('student-sort-select');

    searchInput.addEventListener('input', (e) => {
        studentsPageState.searchQuery = e.target.value;
        renderStudentsList();
    });

    statusFilter.addEventListener('change', (e) => {
        studentsPageState.statusFilter = e.target.value;
        renderStudentsList();
    });

    gradeFilter.addEventListener('change', (e) => {
        studentsPageState.gradeFilter = e.target.value;
        renderStudentsList();
    });

    subjectFilter.addEventListener('change', (e) => {
        studentsPageState.subjectFilter = e.target.value;
        renderStudentsList();
    });

    sortSelect.addEventListener('change', (e) => {
        studentsPageState.sortBy = e.target.value;
        renderStudentsList();
    });

    const clearFiltersBtn = document.getElementById('student-clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            studentsPageState.searchQuery = '';
            studentsPageState.statusFilter = 'All';
            studentsPageState.gradeFilter = 'All';
            studentsPageState.subjectFilter = 'All';
            renderStudentsPage();
        });
    }
}

function renderStudentsList() {
    const listContainer = document.getElementById('student-list-container');
    if (!listContainer) return;

    let filtered = [...MOCK_DATA.students];

    // 1. Search Query
    const query = studentsPageState.searchQuery.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
        );
    }

    // 2. Status Filter
    if (studentsPageState.statusFilter !== 'All') {
        filtered = filtered.filter(s => s.status === studentsPageState.statusFilter);
    }

    // 3. Grade Filter
    if (studentsPageState.gradeFilter !== 'All') {
        filtered = filtered.filter(s => s.grade === studentsPageState.gradeFilter);
    }

    // 4. Subject Filter
    if (studentsPageState.subjectFilter !== 'All') {
        filtered = filtered.filter(s => s.subject === studentsPageState.subjectFilter);
    }

    // 5. Sorting
    const sortBy = studentsPageState.sortBy;
    if (sortBy === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'score-desc') {
        filtered.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortBy === 'score-asc') {
        filtered.sort((a, b) => a.averageScore - b.averageScore);
    } else if (sortBy === 'recently-added') {
        filtered.sort((a, b) => b.id.localeCompare(a.id)); // Assuming ID corresponds to order
    }

    // Empty State Check
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="quiz-mgmt-no-results">
                <div class="quiz-mgmt-no-results-title">No students found</div>
                <div class="quiz-mgmt-no-results-desc">Try modifying your search query or dropdown filter settings.</div>
            </div>
        `;
        return;
    }

    // Output Comic table layout with responsive styling
    listContainer.innerHTML = `
        <div class="cartoon-panel" style="overflow-x: auto; background: var(--surface-white); padding: var(--t-space-1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: var(--font-body); font-size: 0.95rem;">
                <thead>
                    <tr style="border-bottom: 3px solid var(--border-dark); font-family: var(--font-header); font-size: 0.9rem; color: #78909c;">
                        <th style="padding: 12px var(--t-space-2);">STUDENT NAME</th>
                        <th style="padding: 12px var(--t-space-2);">STUDENT ID</th>
                        <th style="padding: 12px var(--t-space-2);">GRADE</th>
                        <th style="padding: 12px var(--t-space-2);">QUIZZES</th>
                        <th style="padding: 12px var(--t-space-2);">AVG SCORE</th>
                        <th style="padding: 12px var(--t-space-2);">STATUS</th>
                        <th style="padding: 12px var(--t-space-2);">LAST ACTIVITY</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(s => {
                        const statusPillClass = s.status === 'Active' ? 'pill-live' : 'pill-closed';
                        return `
                            <tr style="border-bottom: 2px dashed rgba(26,26,36,0.15); transition: background 0.15s ease;">
                                <td style="padding: 12px var(--t-space-2); font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHTML(s.name)}</td>
                                <td style="padding: 12px var(--t-space-2); font-weight: 700; color: #546e7a;">${escapeHTML(s.id)}</td>
                                <td style="padding: 12px var(--t-space-2);">${escapeHTML(s.grade)}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700;">${s.quizzesAttempted}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; color: ${s.averageScore >= 80 ? 'var(--color-green-dark)' : (s.averageScore >= 60 ? 'var(--color-orange-dark)' : 'var(--color-red-dark)')}">${s.averageScore}%</td>
                                <td style="padding: 12px var(--t-space-2);">
                                    <span class="quiz-status-pill ${statusPillClass}" style="font-size: 0.72rem; padding: 2px 8px;">${s.status}</span>
                                </td>
                                <td style="padding: 12px var(--t-space-2); color: #78909c;">${s.lastActivity || 'N/A'}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center;">
                                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                                        <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="viewStudentDetails('${s.id}')" style="height: 32px; border-radius: 8px; font-size: 0.78rem; padding: 0 10px; width: auto; flex: none;" title="View Details">
                                            <span data-icon="search"></span> View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    renderIcons(listContainer);

    // Toggle clear filters button visibility dynamically
    const clearBtn = document.getElementById('student-clear-filters-btn');
    if (clearBtn) {
        const hasActiveFilters = !!(studentsPageState.searchQuery || studentsPageState.statusFilter !== 'All' || studentsPageState.gradeFilter !== 'All' || studentsPageState.subjectFilter !== 'All');
        clearBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }
}

window.viewStudentDetails = function(id) {
    const s = MOCK_DATA.students.find(student => student.id === id);
    if (!s) return;

    const statusPillClass = s.status === 'Active' ? 'pill-live' : 'pill-closed';

    let quizzesHtml = `
        <div style="border: 2px dashed rgba(26,26,36,0.15); border-radius: 12px; padding: var(--t-space-2); text-align: center; background: var(--color-cream);">
            <span style="font-family: var(--font-header); font-size: 0.95rem; color: #546e7a;">No quizzes attempted yet.</span>
        </div>
    `;

    if (s.recentQuizzes && s.recentQuizzes.length > 0) {
        quizzesHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${s.recentQuizzes.map(q => `
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 12px; padding: 10px 14px; box-shadow: var(--shadow-chunky-pressed); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                        <div>
                            <p style="font-family: var(--font-header); font-size: 0.98rem; color: var(--border-dark); margin: 0;">${escapeHTML(q.title)}</p>
                            <span style="font-size: 0.78rem; color: #78909c;">Completed on ${q.date}</span>
                        </div>
                        <span style="font-family: var(--font-header); font-size: 1.1rem; font-weight: 700; color: ${q.score >= 80 ? 'var(--color-green-dark)' : (q.score >= 60 ? 'var(--color-orange-dark)' : 'var(--color-red-dark)')}">${q.score}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const html = `
        <div class="orixa-modal-card" style="width: min(100%, 540px);">
            <header class="orixa-modal-header">
                <h3 class="orixa-modal-title">Student Profile</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body" style="max-height: 520px; overflow-y: auto; gap: var(--t-space-2);">
                <!-- Avatar & Identity Info -->
                <div style="display: flex; align-items: center; gap: 16px; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 12px;">
                    <div class="profile-avatar" style="width: 56px; height: 56px; font-size: 1.4rem; border-width: 3px; font-family: var(--font-header); display: inline-flex; align-items: center; justify-content: center; background: var(--color-blue); border: 2px solid var(--border-dark); border-radius: 50%;">
                        ${s.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="font-family: var(--font-header); font-size: 1.5rem; color: var(--border-dark); margin: 0; line-height: 1.2;">${escapeHTML(s.name)}</h3>
                        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px;">
                            <span style="font-size: 0.8rem; font-weight: 700; color: #78909c;">ID: ${escapeHTML(s.id)}</span>
                            <span class="quiz-status-pill ${statusPillClass}" style="font-size: 0.72rem; padding: 1px 8px;">${s.status}</span>
                        </div>
                    </div>
                </div>

                <!-- Basic Meta Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--t-space-1); font-family: var(--font-body); font-size: 0.9rem;">
                    <div>
                        <span style="font-weight: 700; color: #78909c;">Grade/Class:</span>
                        <div style="color: var(--border-dark); font-weight: 700;">${escapeHTML(s.grade)}</div>
                    </div>
                    <div>
                        <span style="font-weight: 700; color: #78909c;">Subject:</span>
                        <div style="color: var(--border-dark); font-weight: 700;">${escapeHTML(s.subject)}</div>
                    </div>
                    <div>
                        <span style="font-weight: 700; color: #78909c;">Last Activity:</span>
                        <div style="color: var(--border-dark); font-weight: 700;">${s.lastActivity || 'N/A'}</div>
                    </div>
                </div>

                <!-- Performance Highlights Grid -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px;">
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 12px; padding: 10px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                        <span style="font-family: var(--font-header); font-size: 0.78rem; color: #78909c;">ATTEMPTED</span>
                        <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--border-dark); margin-top: 2px;">${s.quizzesAttempted}</div>
                    </div>
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 12px; padding: 10px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                        <span style="font-family: var(--font-header); font-size: 0.78rem; color: #78909c;">AVG SCORE</span>
                        <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-green-dark); margin-top: 2px;">${s.averageScore}%</div>
                    </div>
                    <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 12px; padding: 10px; text-align: center; box-shadow: var(--shadow-chunky-pressed);">
                        <span style="font-family: var(--font-header); font-size: 0.78rem; color: #78909c;">BEST SCORE</span>
                        <div style="font-family: var(--font-header); font-size: 1.5rem; color: var(--color-blue-dark); margin-top: 2px;">${s.bestScore || 0}%</div>
                    </div>
                </div>

                <!-- Recent Quiz Attempts Header -->
                <div style="margin-top: 8px;">
                    <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: 8px; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 4px;">Recent Quiz Performance</h4>
                    ${quizzesHtml}
                </div>
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

/* ==========================================================================
   PAGE STATE
   ========================================================================== */

let studentsPageState = {
    searchQuery: '',
    statusFilter: 'All',
    gradeFilter: 'All',
    subjectFilter: 'All',
    sortBy: 'name-asc'
};

let resultsPageState = {
    searchQuery: '',
    quizFilter: 'All',
    subjectFilter: 'All',
    classFilter: 'All',
    scoreFilter: 'All',
    dateFilter: 'All Time',
    sortBy: 'Most Recent',
    activeTab: 'attempts', // 'attempts', 'quizzes', 'students'
    selectedQuizId: null,
    selectedStudentId: null
};

/* ==========================================================================
   RESULTS SECTION CONTROLLER
   ========================================================================== */

function renderResultsPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    // Apply active filters on MOCK_DATA.results
    let filtered = [...MOCK_DATA.results];

    // Search Query (Student Name, Student ID, Quiz Name)
    const query = resultsPageState.searchQuery.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(r =>
            r.studentName.toLowerCase().includes(query) ||
            r.studentId.toLowerCase().includes(query) ||
            r.quizName.toLowerCase().includes(query)
        );
    }

    // Quiz Filter
    if (resultsPageState.quizFilter !== 'All') {
        filtered = filtered.filter(r => r.quizName === resultsPageState.quizFilter);
    }

    // Subject Filter
    if (resultsPageState.subjectFilter !== 'All') {
        filtered = filtered.filter(r => r.subject === resultsPageState.subjectFilter);
    }

    // Class/Grade Filter
    if (resultsPageState.classFilter !== 'All') {
        filtered = filtered.filter(r => r.grade === resultsPageState.classFilter);
    }

    // Score Filter
    if (resultsPageState.scoreFilter !== 'All') {
        filtered = filtered.filter(r => {
            const pct = r.percentage;
            if (resultsPageState.scoreFilter === 'Excellent') return pct >= 90;
            if (resultsPageState.scoreFilter === 'Good') return pct >= 75 && pct < 90;
            if (resultsPageState.scoreFilter === 'Needs Improvement') return pct >= 50 && pct < 75;
            if (resultsPageState.scoreFilter === 'At Risk') return pct < 50;
            return true;
        });
    }

    // Date Filter (Today, This Week, This Month)
    if (resultsPageState.dateFilter !== 'All Time') {
        filtered = filtered.filter(r => {
            if (resultsPageState.dateFilter === 'Today') return r.daysOffset === 0;
            if (resultsPageState.dateFilter === 'This Week') return r.daysOffset <= 7;
            if (resultsPageState.dateFilter === 'This Month') return r.daysOffset <= 30;
            return true;
        });
    }

    // Sort Options
    if (resultsPageState.sortBy === 'Highest Score') {
        filtered.sort((a, b) => b.percentage - a.percentage);
    } else if (resultsPageState.sortBy === 'Lowest Score') {
        filtered.sort((a, b) => a.percentage - b.percentage);
    } else if (resultsPageState.sortBy === 'Student A-Z') {
        filtered.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (resultsPageState.sortBy === 'Student Z-A') {
        filtered.sort((a, b) => b.studentName.localeCompare(a.studentName));
    } else if (resultsPageState.sortBy === 'Most Recent') {
        filtered.sort((a, b) => a.daysOffset - b.daysOffset);
    }

    // Calculate dynamic stats from the filtered list (or all attempts if filter yields none, but using filtered is better!)
    const totalAttempts = filtered.length;
    let avgScore = 0;
    let highestScore = 0;
    let lowestScore = 0;

    if (totalAttempts > 0) {
        const sum = filtered.reduce((acc, curr) => acc + curr.percentage, 0);
        avgScore = Math.round(sum / totalAttempts);
        highestScore = Math.max(...filtered.map(r => r.percentage));
        lowestScore = Math.min(...filtered.map(r => r.percentage));
    }

    // Calculate Performance Distribution counts
    const excellentCount = filtered.filter(r => r.percentage >= 90).length;
    const goodCount = filtered.filter(r => r.percentage >= 75 && r.percentage < 90).length;
    const improvementCount = filtered.filter(r => r.percentage >= 50 && r.percentage < 75).length;
    const atRiskCount = filtered.filter(r => r.percentage < 50).length;

    const excellentPercent = totalAttempts > 0 ? Math.round((excellentCount / totalAttempts) * 100) : 0;
    const goodPercent = totalAttempts > 0 ? Math.round((goodCount / totalAttempts) * 100) : 0;
    const improvementPercent = totalAttempts > 0 ? Math.round((improvementCount / totalAttempts) * 100) : 0;
    const atRiskPercent = totalAttempts > 0 ? Math.round((atRiskCount / totalAttempts) * 100) : 0;

    // Get unique list of quizzes, subjects, grades/classes for filter options
    const uniqueQuizzes = Array.from(new Set(MOCK_DATA.results.map(r => r.quizName))).sort();
    const uniqueSubjects = Array.from(new Set(MOCK_DATA.results.map(r => r.subject))).sort();
    const uniqueClasses = Array.from(new Set(MOCK_DATA.results.map(r => r.grade))).sort();

    // Check if any filters are active
    const isFiltersActive = resultsPageState.searchQuery !== '' ||
                            resultsPageState.quizFilter !== 'All' ||
                            resultsPageState.subjectFilter !== 'All' ||
                            resultsPageState.classFilter !== 'All' ||
                            resultsPageState.scoreFilter !== 'All' ||
                            resultsPageState.dateFilter !== 'All Time';

    // Build overall container structure
    dynamicPage.innerHTML = `
        <div class="results-container" style="display: flex; flex-direction: column; gap: var(--t-space-2); animation: qb-pop 0.25s ease-out;">
            <!-- Page Header -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Results</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Track student performance and quiz results</p>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="stats-grid" style="margin-top: var(--t-space-1); margin-bottom: var(--t-space-1);">
                <article class="stat-card cartoon-panel is-yellow">
                    <div class="stat-topline">
                        <span class="stat-label">Average Score</span>
                        <span class="stat-icon" data-icon="target"></span>
                    </div>
                    <div>
                        <div class="stat-value">${avgScore}%</div>
                        <p class="stat-caption">Filtered average score</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-green">
                    <div class="stat-topline">
                        <span class="stat-label">Highest Score</span>
                        <span class="stat-icon" data-icon="trophy"></span>
                    </div>
                    <div>
                        <div class="stat-value">${highestScore}%</div>
                        <p class="stat-caption">Filtered highest score</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-orange">
                    <div class="stat-topline">
                        <span class="stat-label">Lowest Score</span>
                        <span class="stat-icon" data-icon="clock"></span>
                    </div>
                    <div>
                        <div class="stat-value">${lowestScore}%</div>
                        <p class="stat-caption">Filtered lowest score</p>
                    </div>
                </article>
                <article class="stat-card cartoon-panel is-blue">
                    <div class="stat-topline">
                        <span class="stat-label">Total Attempts</span>
                        <span class="stat-icon" data-icon="users"></span>
                    </div>
                    <div>
                        <div class="stat-value">${totalAttempts}</div>
                        <p class="stat-caption">Total quiz attempts</p>
                    </div>
                </article>
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; gap: var(--t-space-1); border-bottom: 3px solid var(--border-dark); padding-bottom: var(--t-space-1); margin-bottom: var(--t-space-1);">
                <button type="button" class="cartoon-action-btn results-tab-btn ${resultsPageState.activeTab === 'attempts' ? 'primary-yellow-btn' : ''}" data-tab="attempts" style="padding: 8px 16px; font-size: 0.95rem; border-radius: 12px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-width: 3px; box-shadow: ${resultsPageState.activeTab === 'attempts' ? 'var(--shadow-chunky-pressed)' : 'var(--shadow-chunky-small)'};">
                    Individual Attempts
                </button>
                <button type="button" class="cartoon-action-btn results-tab-btn ${resultsPageState.activeTab === 'quizzes' ? 'primary-yellow-btn' : ''}" data-tab="quizzes" style="padding: 8px 16px; font-size: 0.95rem; border-radius: 12px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-width: 3px; box-shadow: ${resultsPageState.activeTab === 'quizzes' ? 'var(--shadow-chunky-pressed)' : 'var(--shadow-chunky-small)'};">
                    By Quiz
                </button>
                <button type="button" class="cartoon-action-btn results-tab-btn ${resultsPageState.activeTab === 'students' ? 'primary-yellow-btn' : ''}" data-tab="students" style="padding: 8px 16px; font-size: 0.95rem; border-radius: 12px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-width: 3px; box-shadow: ${resultsPageState.activeTab === 'students' ? 'var(--shadow-chunky-pressed)' : 'var(--shadow-chunky-small)'};">
                    By Student
                </button>
            </div>

            <!-- Main Dynamic Area depending on Tab -->
            ${resultsPageState.activeTab === 'attempts' ? `
                <!-- Toolbar for filters -->
                <div class="quiz-mgmt-toolbar">
                    <div class="quiz-mgmt-filters">
                        <div class="quiz-mgmt-search-container">
                            <span class="quiz-mgmt-search-icon" data-icon="search"></span>
                            <input type="search" id="results-search-input" placeholder="Search by student or quiz..." value="${escapeHTML(resultsPageState.searchQuery)}" autocomplete="off">
                        </div>
                        <select id="results-quiz-filter" class="quiz-mgmt-select">
                            <option value="All" ${resultsPageState.quizFilter === 'All' ? 'selected' : ''}>All Quizzes</option>
                            ${uniqueQuizzes.map(qz => `<option value="${escapeHTML(qz)}" ${resultsPageState.quizFilter === qz ? 'selected' : ''}>${escapeHTML(qz)}</option>`).join('')}
                        </select>
                        <select id="results-subject-filter" class="quiz-mgmt-select">
                            <option value="All" ${resultsPageState.subjectFilter === 'All' ? 'selected' : ''}>All Subjects</option>
                            ${uniqueSubjects.map(sub => `<option value="${escapeHTML(sub)}" ${resultsPageState.subjectFilter === sub ? 'selected' : ''}>${escapeHTML(sub)}</option>`).join('')}
                        </select>
                        <select id="results-class-filter" class="quiz-mgmt-select">
                            <option value="All" ${resultsPageState.classFilter === 'All' ? 'selected' : ''}>All Grades</option>
                            ${uniqueClasses.map(cl => `<option value="${escapeHTML(cl)}" ${resultsPageState.classFilter === cl ? 'selected' : ''}>${escapeHTML(cl)}</option>`).join('')}
                        </select>
                        <select id="results-score-filter" class="quiz-mgmt-select">
                            <option value="All" ${resultsPageState.scoreFilter === 'All' ? 'selected' : ''}>All Scores</option>
                            <option value="Excellent" ${resultsPageState.scoreFilter === 'Excellent' ? 'selected' : ''}>90–100% (Excellent)</option>
                            <option value="Good" ${resultsPageState.scoreFilter === 'Good' ? 'selected' : ''}>75–89% (Good)</option>
                            <option value="Needs Improvement" ${resultsPageState.scoreFilter === 'Needs Improvement' ? 'selected' : ''}>50–74% (Needs Imp.)</option>
                            <option value="At Risk" ${resultsPageState.scoreFilter === 'At Risk' ? 'selected' : ''}>Below 50% (At Risk)</option>
                        </select>
                        <select id="results-date-filter" class="quiz-mgmt-select">
                            <option value="All Time" ${resultsPageState.dateFilter === 'All Time' ? 'selected' : ''}>All Time</option>
                            <option value="Today" ${resultsPageState.dateFilter === 'Today' ? 'selected' : ''}>Today</option>
                            <option value="This Week" ${resultsPageState.dateFilter === 'This Week' ? 'selected' : ''}>This Week</option>
                            <option value="This Month" ${resultsPageState.dateFilter === 'This Month' ? 'selected' : ''}>This Month</option>
                        </select>
                        <select id="results-sort-select" class="quiz-mgmt-select">
                            <option value="Most Recent" ${resultsPageState.sortBy === 'Most Recent' ? 'selected' : ''}>Most Recent</option>
                            <option value="Highest Score" ${resultsPageState.sortBy === 'Highest Score' ? 'selected' : ''}>Highest Score</option>
                            <option value="Lowest Score" ${resultsPageState.sortBy === 'Lowest Score' ? 'selected' : ''}>Lowest Score</option>
                            <option value="Student A-Z" ${resultsPageState.sortBy === 'Student A-Z' ? 'selected' : ''}>Student A-Z</option>
                            <option value="Student Z-A" ${resultsPageState.sortBy === 'Student Z-A' ? 'selected' : ''}>Student Z-A</option>
                        </select>
                        ${isFiltersActive ? `
                            <button type="button" class="cartoon-action-btn" id="results-clear-filters-btn" style="height: 44px; padding: 0 16px; font-size: 0.85rem; border-color: var(--border-dark); background: var(--color-orange); box-shadow: var(--shadow-chunky-pressed); font-family: var(--font-header); font-weight: 700; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; border-width: 3px;">
                                Clear Filters
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Performance summary distribution visualization -->
                <article class="cartoon-panel" style="padding: var(--t-space-2); background: var(--surface-white); display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 style="font-family: var(--font-header); font-size: 1.25rem; margin: 0; color: var(--border-dark);">Class Performance Distribution</h3>
                        <span class="quiz-status-pill" style="font-size: 0.78rem; padding: 3px 10px; background: var(--color-cream);">${totalAttempts} Total attempts in view</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 4px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; color: var(--border-dark);">
                                <span style="color: var(--color-green-dark);">Excellent (90-100%)</span>
                                <span>${excellentCount} (${excellentPercent}%)</span>
                            </div>
                            <div style="height: 20px; background: var(--color-cream); border: var(--border-comic-thin); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-chunky-pressed); position: relative;">
                                <div style="height: 100%; width: ${excellentPercent}%; background: var(--color-green); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; color: var(--border-dark);">
                                <span style="color: var(--color-blue-dark);">Good (75-89%)</span>
                                <span>${goodCount} (${goodPercent}%)</span>
                            </div>
                            <div style="height: 20px; background: var(--color-cream); border: var(--border-comic-thin); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-chunky-pressed); position: relative;">
                                <div style="height: 100%; width: ${goodPercent}%; background: var(--color-blue); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; color: var(--border-dark);">
                                <span style="color: var(--color-orange-dark);">Needs Improvement (50-74%)</span>
                                <span>${improvementCount} (${improvementPercent}%)</span>
                            </div>
                            <div style="height: 20px; background: var(--color-cream); border: var(--border-comic-thin); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-chunky-pressed); position: relative;">
                                <div style="height: 100%; width: ${improvementPercent}%; background: var(--color-orange); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; color: var(--border-dark);">
                                <span style="color: var(--color-red-dark);">At Risk (Below 50%)</span>
                                <span>${atRiskCount} (${atRiskPercent}%)</span>
                            </div>
                            <div style="height: 20px; background: var(--color-cream); border: var(--border-comic-thin); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-chunky-pressed); position: relative;">
                                <div style="height: 100%; width: ${atRiskPercent}%; background: var(--color-red); transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                </article>

                <!-- Results table -->
                <div id="results-table-container"></div>
            ` : resultsPageState.activeTab === 'quizzes' ? `
                <!-- Quiz level performance view -->
                <div id="results-quiz-container"></div>
            ` : `
                <!-- Student level performance view -->
                <div id="results-student-container"></div>
            `}
        </div>
    `;

    renderIcons(dynamicPage);

    // Render inner content depending on active tab
    if (resultsPageState.activeTab === 'attempts') {
        renderResultsList(filtered);
    } else if (resultsPageState.activeTab === 'quizzes') {
        renderQuizGroupedView();
    } else {
        renderStudentGroupedView();
    }

    // Attach general listeners
    dynamicPage.querySelectorAll('.results-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            resultsPageState.activeTab = e.target.dataset.tab;
            renderResultsPage();
        });
    });

    // Attach filter listeners
    const searchInput = document.getElementById('results-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            resultsPageState.searchQuery = e.target.value;
            renderResultsPage();
        });
    }

    const quizFilter = document.getElementById('results-quiz-filter');
    if (quizFilter) {
        quizFilter.addEventListener('change', (e) => {
            resultsPageState.quizFilter = e.target.value;
            renderResultsPage();
        });
    }

    const subjectFilter = document.getElementById('results-subject-filter');
    if (subjectFilter) {
        subjectFilter.addEventListener('change', (e) => {
            resultsPageState.subjectFilter = e.target.value;
            renderResultsPage();
        });
    }

    const classFilter = document.getElementById('results-class-filter');
    if (classFilter) {
        classFilter.addEventListener('change', (e) => {
            resultsPageState.classFilter = e.target.value;
            renderResultsPage();
        });
    }

    const scoreFilter = document.getElementById('results-score-filter');
    if (scoreFilter) {
        scoreFilter.addEventListener('change', (e) => {
            resultsPageState.scoreFilter = e.target.value;
            renderResultsPage();
        });
    }

    const dateFilter = document.getElementById('results-date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            resultsPageState.dateFilter = e.target.value;
            renderResultsPage();
        });
    }

    const sortSelect = document.getElementById('results-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            resultsPageState.sortBy = e.target.value;
            renderResultsPage();
        });
    }

    const clearFiltersBtn = document.getElementById('results-clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            clearResultsFilters();
        });
    }
}

function clearResultsFilters() {
    resultsPageState.searchQuery = '';
    resultsPageState.quizFilter = 'All';
    resultsPageState.subjectFilter = 'All';
    resultsPageState.classFilter = 'All';
    resultsPageState.scoreFilter = 'All';
    resultsPageState.dateFilter = 'All Time';
    renderResultsPage();
}

function renderResultsList(filtered) {
    const listContainer = document.getElementById('results-table-container');
    if (!listContainer) return;

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="quiz-mgmt-no-results" style="background: var(--color-cream); border: 3px dashed rgba(26,26,36,0.15); border-radius: 18px; padding: var(--t-space-4) var(--t-space-2); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
                <div class="quiz-mgmt-no-results-title" style="font-family: var(--font-header); font-size: 1.4rem; color: var(--border-dark);">No results found</div>
                <div class="quiz-mgmt-no-results-desc" style="font-family: var(--font-body); font-size: 1rem; color: #546e7a;">Try clearing or adjusting your search queries or drop-down filters!</div>
                <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="clearResultsFilters()" style="margin-top: 12px; padding: 10px 24px; font-size: 0.95rem; border-radius: 12px; height: auto;">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = `
        <div class="cartoon-panel" style="overflow-x: auto; background: var(--surface-white); padding: var(--t-space-1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: var(--font-body); font-size: 0.95rem;">
                <thead>
                    <tr style="border-bottom: 3px solid var(--border-dark); font-family: var(--font-header); font-size: 0.9rem; color: #78909c;">
                        <th style="padding: 12px var(--t-space-2);">STUDENT NAME</th>
                        <th style="padding: 12px var(--t-space-2);">STUDENT ID</th>
                        <th style="padding: 12px var(--t-space-2);">QUIZ NAME</th>
                        <th style="padding: 12px var(--t-space-2);">SUBJECT</th>
                        <th style="padding: 12px var(--t-space-2);">CLASS/GRADE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">PERCENTAGE</th>
                        <th style="padding: 12px var(--t-space-2);">DATE</th>
                        <th style="padding: 12px var(--t-space-2);">STATUS</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(r => {
                        // Date formatted based on offsets (for realistic presentation)
                        let dateStr = "Aug 10, 2026";
                        if (r.daysOffset === 0) dateStr = "Today";
                        else if (r.daysOffset === 1) dateStr = "Yesterday";
                        else dateStr = `Aug ${Math.max(1, 12 - r.daysOffset)}, 2026`;

                        // Score status class
                        let statusText = "Excellent";
                        let statusClass = "pill-live"; // Green
                        const pct = r.percentage;
                        if (pct >= 90) {
                            statusText = "Excellent";
                            statusClass = "pill-live";
                        } else if (pct >= 75) {
                            statusText = "Good";
                            statusClass = "pill-draft"; // Yellow/orange
                        } else if (pct >= 50) {
                            statusText = "Needs Imp.";
                            statusClass = "pill-draft";
                        } else {
                            statusText = "At Risk";
                            statusClass = "pill-closed"; // Red
                        }

                        return `
                            <tr style="border-bottom: 2px dashed rgba(26,26,36,0.15); transition: background 0.15s ease;">
                                <td style="padding: 12px var(--t-space-2); font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHTML(r.studentName)}</td>
                                <td style="padding: 12px var(--t-space-2); font-weight: 700; color: #546e7a;">${escapeHTML(r.studentId)}</td>
                                <td style="padding: 12px var(--t-space-2); font-weight: 700; color: var(--border-dark);">${escapeHTML(r.quizName)}</td>
                                <td style="padding: 12px var(--t-space-2); color: #546e7a;">${escapeHTML(r.subject)}</td>
                                <td style="padding: 12px var(--t-space-2);">${escapeHTML(r.grade)}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700;">
                                    ${r.score}/${r.totalQuestions}
                                    <div style="font-size: 0.75rem; color: #78909c; font-weight: normal;">${r.correctCount} correct</div>
                                </td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; font-size: 1.05rem; color: ${pct >= 90 ? 'var(--color-green-dark)' : (pct >= 75 ? 'var(--color-blue-dark)' : (pct >= 50 ? 'var(--color-orange-dark)' : 'var(--color-red-dark)'))};">
                                    ${pct}%
                                </td>
                                <td style="padding: 12px var(--t-space-2); color: #78909c;">${dateStr}</td>
                                <td style="padding: 12px var(--t-space-2);">
                                    <span class="quiz-status-pill ${statusClass}" style="font-size: 0.72rem; padding: 2px 8px; white-space: nowrap;">${statusText}</span>
                                </td>
                                <td style="padding: 12px var(--t-space-2); text-align: center;">
                                    <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="viewResultDetails('${r.id}')" style="height: 32px; border-radius: 8px; font-size: 0.78rem; padding: 0 12px; width: auto; flex: none; display: inline-flex; align-items: center;" title="View Details">
                                        <span data-icon="search" style="margin-right: 4px;"></span> View
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    renderIcons(listContainer);
}

function renderQuizGroupedView() {
    const container = document.getElementById('results-quiz-container');
    if (!container) return;

    // Aggregate attempts by quiz
    const quizMap = {};
    MOCK_DATA.results.forEach(r => {
        if (!quizMap[r.quizName]) {
            quizMap[r.quizName] = {
                quizName: r.quizName,
                subject: r.subject,
                attempts: 0,
                totalPercentage: 0,
                percentages: [],
                passCount: 0
            };
        }
        const q = quizMap[r.quizName];
        q.attempts++;
        q.totalPercentage += r.percentage;
        q.percentages.push(r.percentage);
        if (r.percentage >= 70) {
            q.passCount++;
        }
    });

    const quizList = Object.values(quizMap).sort((a, b) => b.attempts - a.attempts);

    if (quizList.length === 0) {
        container.innerHTML = `
            <div class="quiz-mgmt-no-results">
                <div class="quiz-mgmt-no-results-title">No quiz metrics available</div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="cartoon-panel" style="overflow-x: auto; background: var(--surface-white); padding: var(--t-space-1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: var(--font-body); font-size: 0.95rem;">
                <thead>
                    <tr style="border-bottom: 3px solid var(--border-dark); font-family: var(--font-header); font-size: 0.9rem; color: #78909c;">
                        <th style="padding: 12px var(--t-space-2);">QUIZ NAME</th>
                        <th style="padding: 12px var(--t-space-2);">SUBJECT</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">ATTEMPTS</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">AVG SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">HIGHEST SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">LOWEST SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">PASS RATE (>=70%)</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${quizList.map(q => {
                        const avg = Math.round(q.totalPercentage / q.attempts);
                        const highest = Math.max(...q.percentages);
                        const lowest = Math.min(...q.percentages);
                        const passRate = Math.round((q.passCount / q.attempts) * 100);

                        return `
                            <tr style="border-bottom: 2px dashed rgba(26,26,36,0.15); transition: background 0.15s ease;">
                                <td style="padding: 12px var(--t-space-2); font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHTML(q.quizName)}</td>
                                <td style="padding: 12px var(--t-space-2); font-weight: 700; color: #546e7a;">${escapeHTML(q.subject)}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700;">${q.attempts} attempts</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; font-size: 1.05rem; color: ${avg >= 80 ? 'var(--color-green-dark)' : (avg >= 60 ? 'var(--color-orange-dark)' : 'var(--color-red-dark)')};">${avg}%</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; color: var(--color-green-dark);">${highest}%</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; color: var(--color-red-dark);">${lowest}%</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center;">
                                    <span class="quiz-status-pill ${passRate >= 75 ? 'pill-live' : 'pill-closed'}" style="font-size: 0.78rem; font-weight: 700; padding: 2px 8px;">${passRate}% Pass</span>
                                </td>
                                <td style="padding: 12px var(--t-space-2); text-align: center;">
                                    <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="filterAttemptsByQuiz('${escapeHTML(q.quizName)}')" style="height: 32px; border-radius: 8px; font-size: 0.78rem; padding: 0 12px; width: auto; flex: none; display: inline-flex; align-items: center;" title="View attempts">
                                        View attempts
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    renderIcons(container);
}

window.filterAttemptsByQuiz = function(quizName) {
    resultsPageState.quizFilter = quizName;
    resultsPageState.activeTab = 'attempts';
    renderResultsPage();
};

function renderStudentGroupedView() {
    const container = document.getElementById('results-student-container');
    if (!container) return;

    // Aggregate attempts by student
    const studentMap = {};
    MOCK_DATA.results.forEach(r => {
        if (!studentMap[r.studentId]) {
            studentMap[r.studentId] = {
                studentId: r.studentId,
                studentName: r.studentName,
                attempts: 0,
                totalPercentage: 0,
                percentages: [],
                recentQuizzes: []
            };
        }
        const s = studentMap[r.studentId];
        s.attempts++;
        s.totalPercentage += r.percentage;
        s.percentages.push(r.percentage);
        s.recentQuizzes.push({ name: r.quizName, score: r.percentage });
    });

    const studentList = Object.values(studentMap).sort((a, b) => a.studentName.localeCompare(b.studentName));

    if (studentList.length === 0) {
        container.innerHTML = `
            <div class="quiz-mgmt-no-results">
                <div class="quiz-mgmt-no-results-title">No student performance metrics available</div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="cartoon-panel" style="overflow-x: auto; background: var(--surface-white); padding: var(--t-space-1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: var(--font-body); font-size: 0.95rem;">
                <thead>
                    <tr style="border-bottom: 3px solid var(--border-dark); font-family: var(--font-header); font-size: 0.9rem; color: #78909c;">
                        <th style="padding: 12px var(--t-space-2);">STUDENT NAME</th>
                        <th style="padding: 12px var(--t-space-2);">STUDENT ID</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">QUIZZES ATTEMPTED</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">AVG SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">HIGHEST SCORE</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">LOWEST SCORE</th>
                        <th style="padding: 12px var(--t-space-2);">RECENT RESULTS</th>
                        <th style="padding: 12px var(--t-space-2); text-align: center;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentList.map(s => {
                        const avg = Math.round(s.totalPercentage / s.attempts);
                        const highest = Math.max(...s.percentages);
                        const lowest = Math.min(...s.percentages);
                        const historyHtml = s.recentQuizzes.slice(0, 2).map(rq => `
                            <span class="quiz-status-pill" style="font-size: 0.7rem; padding: 1px 6px; background: var(--color-cream); margin-right: 4px; display: inline-block; margin-top: 2px;">
                                ${escapeHTML(rq.name)}: ${rq.score}%
                            </span>
                        `).join('');

                        return `
                            <tr style="border-bottom: 2px dashed rgba(26,26,36,0.15); transition: background 0.15s ease;">
                                <td style="padding: 12px var(--t-space-2); font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHTML(s.studentName)}</td>
                                <td style="padding: 12px var(--t-space-2); font-weight: 700; color: #546e7a;">${escapeHTML(s.studentId)}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700;">${s.attempts} attempts</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; font-size: 1.05rem; color: ${avg >= 80 ? 'var(--color-green-dark)' : (avg >= 60 ? 'var(--color-orange-dark)' : 'var(--color-red-dark)')};">${avg}%</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; color: var(--color-green-dark);">${highest}%</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center; font-weight: 700; color: var(--color-red-dark);">${lowest}%</td>
                                <td style="padding: 12px var(--t-space-2);">${historyHtml}</td>
                                <td style="padding: 12px var(--t-space-2); text-align: center;">
                                    <button class="quiz-mgmt-action-btn quiz-btn-view" onclick="filterAttemptsByStudent('${escapeHTML(s.studentName)}')" style="height: 32px; border-radius: 8px; font-size: 0.78rem; padding: 0 12px; width: auto; flex: none; display: inline-flex; align-items: center;" title="View history">
                                        View history
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    renderIcons(container);
}

window.filterAttemptsByStudent = function(studentName) {
    resultsPageState.searchQuery = studentName;
    resultsPageState.activeTab = 'attempts';
    renderResultsPage();
};

/* ==========================================================================
   RESULT DETAILS
   ========================================================================== */

window.viewResultDetails = function(resultId) {
    const r = MOCK_DATA.results.find(res => res.id === resultId);
    if (!r) return;

    let dateStr = "Aug 10, 2026";
    if (r.daysOffset === 0) dateStr = "Today";
    else if (r.daysOffset === 1) dateStr = "Yesterday";
    else dateStr = `Aug ${Math.max(1, 12 - r.daysOffset)}, 2026`;

    // Status label mapping
    let statusText = "Excellent";
    let statusColor = "var(--color-green)";
    const pct = r.percentage;
    if (pct >= 90) {
        statusText = "Excellent";
        statusColor = "var(--color-green)";
    } else if (pct >= 75) {
        statusText = "Good";
        statusColor = "var(--color-blue)";
    } else if (pct >= 50) {
        statusText = "Needs Improvement";
        statusColor = "var(--color-orange)";
    } else {
        statusText = "At Risk";
        statusColor = "var(--color-red)";
    }

    const html = `
        <div class="orixa-modal-card" style="width: min(100%, 600px);">
            <header class="orixa-modal-header" style="background: ${statusColor};">
                <h3 class="orixa-modal-title" style="color: var(--border-dark); font-family: var(--font-header);">Detailed Result</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body" style="max-height: 500px; overflow-y: auto; gap: var(--t-space-2);">
                <!-- Student details & Score Header -->
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 12px; border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 12px;">
                    <div>
                        <h2 style="font-family: var(--font-header); font-size: 1.6rem; color: var(--border-dark); margin: 0 0 4px 0;">${escapeHTML(r.studentName)}</h2>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #546e7a;">STUDENT ID: ${escapeHTML(r.studentId)} | ${escapeHTML(r.grade)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-family: var(--font-header); font-size: 2.2rem; font-weight: 700; line-height: 1; color: ${pct >= 75 ? 'var(--color-green-dark)' : 'var(--color-red-dark)'};">${pct}%</div>
                        <div style="font-size: 0.85rem; font-weight: 700; color: #546e7a; margin-top: 2px;">Score: ${r.score}/${r.totalQuestions}</div>
                    </div>
                </div>

                <!-- Quiz details -->
                <div style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 16px; padding: var(--t-space-2); display: grid; grid-template-columns: 1fr 1fr; gap: 10px; box-shadow: var(--shadow-chunky-pressed);">
                    <div>
                        <span class="quiz-meta" style="color: #78909c;">Quiz Name:</span>
                        <div style="font-weight: 700; color: var(--border-dark);">${escapeHTML(r.quizName)}</div>
                    </div>
                    <div>
                        <span class="quiz-meta" style="color: #78909c;">Subject:</span>
                        <div style="font-weight: 700; color: var(--border-dark);">${escapeHTML(r.subject)}</div>
                    </div>
                    <div>
                        <span class="quiz-meta" style="color: #78909c;">Date Attempted:</span>
                        <div style="font-weight: 700; color: var(--border-dark);">${dateStr}</div>
                    </div>
                    <div>
                        <span class="quiz-meta" style="color: #78909c;">Performance:</span>
                        <div style="font-weight: 700; color: var(--border-dark);"><span class="quiz-status-pill" style="background: ${statusColor}; font-size: 0.72rem; padding: 2px 8px; font-family: var(--font-header);">${statusText}</span></div>
                    </div>
                </div>

                <!-- Breakdowns counts -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; margin-top: 4px;">
                    <div style="border: 2px solid var(--border-dark); border-radius: 10px; padding: 6px; background: #e8f5e9;">
                        <span style="font-size: 0.75rem; color: var(--color-green-dark); font-weight: 700;">CORRECT</span>
                        <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-header); color: var(--border-dark);">${r.correctCount}</div>
                    </div>
                    <div style="border: 2px solid var(--border-dark); border-radius: 10px; padding: 6px; background: #ffebee;">
                        <span style="font-size: 0.75rem; color: var(--color-red-dark); font-weight: 700;">INCORRECT</span>
                        <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-header); color: var(--border-dark);">${r.incorrectCount}</div>
                    </div>
                    <div style="border: 2px solid var(--border-dark); border-radius: 10px; padding: 6px; background: #e3f2fd;">
                        <span style="font-size: 0.75rem; color: var(--color-blue-dark); font-weight: 700;">TOTAL QUESTIONS</span>
                        <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-header); color: var(--border-dark);">${r.totalQuestions}</div>
                    </div>
                </div>

                <!-- Question break down -->
                <div style="margin-top: 8px;">
                    <h3 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: 8px; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 4px;">Question-by-Question Breakdown</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${r.questionsBreakdown.map(q => {
                            const isCorrect = q.isCorrect;
                            const borderCol = isCorrect ? 'var(--color-green)' : 'var(--color-red)';
                            const badgeBg = isCorrect ? 'var(--color-green)' : 'var(--color-red)';
                            const badgeText = isCorrect ? 'Correct' : 'Incorrect';
                            const badgeColorClass = isCorrect ? 'pill-live' : 'pill-closed';
                            return `
                                <div style="border: 2px solid var(--border-dark); border-radius: 12px; padding: var(--t-space-1); background: var(--color-cream); display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow-chunky-pressed);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(26,26,36,0.1); padding-bottom: 4px; margin-bottom: 4px;">
                                        <span style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; color: var(--border-dark);">Question ${q.number}</span>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span class="quiz-status-pill ${badgeColorClass}" style="font-size: 0.68rem; padding: 1px 6px;">${badgeText}</span>
                                            <span class="quiz-status-pill" style="font-size: 0.68rem; padding: 1px 6px; background: var(--color-yellow);">${q.marks} Earned</span>
                                        </div>
                                    </div>
                                    <p style="font-weight: 700; font-size: 0.95rem; line-height: 1.3; color: var(--border-dark); margin: 0 0 4px 0;">${escapeHTML(q.text)}</p>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; font-family: var(--font-body);">
                                        <div style="background: ${isCorrect ? '#e8f5e9' : '#ffebee'}; border: 1px solid var(--border-dark); border-radius: 6px; padding: 4px 8px;">
                                            <span style="font-size: 0.75rem; font-weight: 700; color: #78909c;">Student's Answer:</span>
                                            <div style="font-weight: 700; color: var(--border-dark);">${escapeHTML(q.studentAnswer)}</div>
                                        </div>
                                        <div style="background: #e8f5e9; border: 1px solid var(--border-dark); border-radius: 6px; padding: 4px 8px;">
                                            <span style="font-size: 0.75rem; font-weight: 700; color: #78909c;">Correct Answer:</span>
                                            <div style="font-weight: 700; color: var(--border-dark);">${escapeHTML(q.correctAnswer)}</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                    Close Breakdown
                </button>
            </footer>
        </div>
    `;

    openOrixaModal(html);
};

/* ==========================================================================
   SETTINGS SECTION CONTROLLER
   ========================================================================== */

function renderSettingsPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    const teacher = MOCK_DATA.teacher;
    const settings = MOCK_DATA.settings;

    // Split subjects array
    const subjectsStr = teacher.subjects.join(', ');

    dynamicPage.innerHTML = `
        <div class="settings-container" style="display: flex; flex-direction: column; gap: var(--t-space-2); animation: qb-pop 0.25s ease-out;">
            <!-- Header Section of the Settings -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Settings</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Manage your Teacher Portal preferences</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="quiz-status-pill pill-draft hidden" id="settings-unsaved-badge" style="background: var(--color-orange); font-size: 0.85rem; font-weight: 700; padding: 6px 12px; border-width: 2.5px;">
                        Unsaved Changes
                    </span>
                    <button class="cartoon-action-btn primary-yellow-btn" onclick="navigateToView('dashboard')" style="padding: 10px 20px; font-size: 1rem; height: 44px; display: inline-flex; align-items: center;">
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div class="settings-grid-main">
                <!-- Left column: PROFILE & ACCOUNT, APPEARANCE -->
                <div style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <!-- Profile Card -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Profile Preferences</h3>

                        <div class="form-field">
                            <label class="field-label" for="settings-profile-name">TEACHER NAME *</label>
                            <div class="input-shell">
                                <input type="text" id="settings-profile-name" class="cartoon-input" value="${escapeHTML(teacher.name)}" required>
                            </div>
                            <span class="field-error" id="err-settings-name"></span>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="settings-profile-dept">DEPARTMENT *</label>
                            <div class="input-shell">
                                <input type="text" id="settings-profile-dept" class="cartoon-input" value="${escapeHTML(teacher.department)}" required>
                            </div>
                            <span class="field-error" id="err-settings-dept"></span>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="settings-profile-subjects">SUBJECTS TAUGHT</label>
                            <div class="input-shell">
                                <input type="text" id="settings-profile-subjects" class="cartoon-input" value="${escapeHTML(subjectsStr)}" placeholder="No subjects assigned yet" readonly aria-describedby="settings-subjects-hint" style="cursor: default;">
                            </div>
                            <span id="settings-subjects-hint" style="font-family: var(--font-body); font-size: 0.85rem; color: #546e7a;">Assigned by your HOD when your faculty account was created.</span>
                        </div>
                    </div>

                    <!-- Account Card -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Account Details</h3>
                        <div class="form-field">
                            <label class="field-label" for="settings-account-empid">EMPLOYEE / TEACHER ID</label>
                            <div class="input-shell">
                                <input type="text" id="settings-account-empid" class="cartoon-input" value="${escapeHTML(teacher.employeeId)}" style="opacity: 0.8; background-color: #f1f1f1;" readonly>
                            </div>
                            <span style="font-size: 0.8rem; color: #78909c; font-style: italic; margin-top: 2px;">Teacher ID is generated by administration and cannot be modified.</span>
                        </div>
                    </div>

                    <!-- Appearance Card -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Appearance Preferences</h3>
                        <div class="form-field">
                            <label class="field-label" for="settings-appearance-theme">THEME</label>
                            <select id="settings-appearance-theme" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                                <option value="System" ${settings.appearance.theme === 'System' ? 'selected' : ''}>System Default</option>
                                <option value="Light" ${settings.appearance.theme === 'Light' ? 'selected' : ''}>Light Theme</option>
                                <option value="Dark" ${settings.appearance.theme === 'Dark' ? 'selected' : ''}>Dark Theme</option>
                            </select>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="settings-appearance-animation">ANIMATIONS</label>
                            <select id="settings-appearance-animation" class="cartoon-input" style="padding: 0 var(--t-space-2); font-family: var(--font-header);">
                                <option value="Enabled" ${settings.appearance.animation === 'Enabled' ? 'selected' : ''}>Enabled (Playful)</option>
                                <option value="Reduced" ${settings.appearance.animation === 'Reduced' ? 'selected' : ''}>Reduced Motion</option>
                            </select>
                        </div>
                    </div>

                    <!-- Sound Card (applies immediately, saved on this device) -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Sound</h3>
                        <div id="settings-audio-mount"></div>
                    </div>
                </div>

                <!-- Right column: NOTIFICATIONS, QUIZ PREFERENCES, SECURITY -->
                <div style="display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <!-- Notification Settings -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Notification Preferences</h3>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Quiz Notifications</span>
                                <span class="settings-row-desc">Receive alerts on quiz creations, drafts, and updates</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-noti-quiz" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.notifications.quiz ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-noti-quiz" ${settings.notifications.quiz ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Student Activity</span>
                                <span class="settings-row-desc">Get notified when students join, leave, or show inactive status</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-noti-activity" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.notifications.studentActivity ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-noti-activity" ${settings.notifications.studentActivity ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Result Notifications</span>
                                <span class="settings-row-desc">Alerts when a student completes a quiz with high accuracy</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-noti-results" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.notifications.results ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-noti-results" ${settings.notifications.results ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">System Notifications</span>
                                <span class="settings-row-desc">Receive updates about portal maintenance and version changes</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-noti-system" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.notifications.system ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-noti-system" ${settings.notifications.system ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Quiz Preferences -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Quiz Preferences</h3>
                        <div class="form-field">
                            <label class="field-label" for="settings-quiz-duration">DEFAULT DURATION (MINUTES)</label>
                            <div class="input-shell">
                                <input type="number" id="settings-quiz-duration" class="cartoon-input" min="1" max="180" value="${settings.quizPreferences.defaultDuration}">
                            </div>
                            <span class="field-error" id="err-settings-duration"></span>
                        </div>

                        <div class="form-field">
                            <label class="field-label" for="settings-quiz-questions">DEFAULT NUMBER OF QUESTIONS</label>
                            <div class="input-shell">
                                <input type="number" id="settings-quiz-questions" class="cartoon-input" min="1" max="100" value="${settings.quizPreferences.defaultQuestions}">
                            </div>
                            <span class="field-error" id="err-settings-questions"></span>
                        </div>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Show Correct Answers</span>
                                <span class="settings-row-desc">Reveal correct answers to students immediately after submission</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-quiz-correct" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.quizPreferences.showCorrectAnswers ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-quiz-correct" ${settings.quizPreferences.showCorrectAnswers ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Allow Late Submissions</span>
                                <span class="settings-row-desc">Enable students to attempt quizzes after the deadline</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="toggle-state-text" id="lbl-quiz-late" style="font-family: var(--font-header); font-size: 0.9rem; font-weight: 700; min-width: 32px; text-align: right;">${settings.quizPreferences.allowLateSubmissions ? 'ON' : 'OFF'}</span>
                                <label class="cartoon-switch">
                                    <input type="checkbox" id="settings-quiz-late" ${settings.quizPreferences.allowLateSubmissions ? 'checked' : ''}>
                                    <span class="switch-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Security Preferences -->
                    <div class="cartoon-panel settings-card">
                        <h3 class="settings-card-header">Security & Sessions</h3>

                        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed rgba(26,26,36,0.1); padding-bottom: 12px; margin-bottom: 8px;">
                            <div class="settings-row-label">
                                <span class="settings-row-title">Change Password</span>
                                <span class="settings-row-desc">Update your teacher credentials</span>
                            </div>
                            <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="openChangePasswordModal()" style="padding: 8px 16px; font-size: 0.85rem; height: 38px; border-radius: 10px; border-width: 2.5px; box-shadow: var(--shadow-chunky-pressed);">
                                Change Password
                            </button>
                        </div>

                        <div>
                            <span class="quiz-meta" style="display: block; margin-bottom: 8px;">ACTIVE SESSIONS</span>
                            <div id="settings-sessions-list">
                                ${settings.activeSessions.map((session, index) => `
                                    <div class="session-item">
                                        <div class="session-info">
                                            <span class="session-device">${escapeHTML(session.device)}</span>
                                            <span class="session-meta">${escapeHTML(session.location)} &bull; ${escapeHTML(session.lastActive)}</span>
                                        </div>
                                        ${index === 0 ? `<span class="quiz-status-pill session-badge">Current</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save / Reset Controls -->
            <div class="cartoon-panel" style="padding: var(--t-space-2); background: var(--color-cream); border: var(--border-comic-thin); border-radius: 20px; display: flex; align-items: center; justify-content: flex-end; gap: var(--t-space-2); margin-top: var(--t-space-1); box-shadow: var(--shadow-chunky-pressed);">
                <button type="button" class="cartoon-action-btn" id="settings-reset-btn" style="padding: 10px 24px; font-size: 1rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                    Reset Changes
                </button>
                <button type="button" class="cartoon-action-btn primary-yellow-btn" id="settings-save-btn" style="padding: 10px 28px; font-size: 1rem;">
                    Save Changes
                </button>
            </div>
        </div>
    `;

    renderIcons(dynamicPage);
    setupSettingsListeners();
}

function setupSettingsListeners() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    // Helper: update state texts of the cartoon toggles
    const setupToggleTextUpdate = (checkboxId, labelId) => {
        const chk = document.getElementById(checkboxId);
        const lbl = document.getElementById(labelId);
        if (chk && lbl) {
            chk.addEventListener('change', () => {
                lbl.textContent = chk.checked ? 'ON' : 'OFF';
                checkUnsavedChanges();
            });
        }
    };

    setupToggleTextUpdate('settings-noti-quiz', 'lbl-noti-quiz');
    setupToggleTextUpdate('settings-noti-activity', 'lbl-noti-activity');
    setupToggleTextUpdate('settings-noti-results', 'lbl-noti-results');
    setupToggleTextUpdate('settings-noti-system', 'lbl-noti-system');
    setupToggleTextUpdate('settings-quiz-correct', 'lbl-quiz-correct');
    setupToggleTextUpdate('settings-quiz-late', 'lbl-quiz-late');

    // Function to check if any inputs differ from initial MOCK_DATA state
    const checkUnsavedChanges = () => {
        const isModified = checkIfModified();
        const badge = document.getElementById('settings-unsaved-badge');
        if (badge) {
            if (isModified) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    };

    const checkIfModified = () => {
        const teacher = MOCK_DATA.teacher;
        const settings = MOCK_DATA.settings;

        const nameVal = document.getElementById('settings-profile-name').value.trim();
        const deptVal = document.getElementById('settings-profile-dept').value.trim();
        const subjectsVal = document.getElementById('settings-profile-subjects').value.trim();

        const themeVal = document.getElementById('settings-appearance-theme').value;
        const animVal = document.getElementById('settings-appearance-animation').value;

        const notiQuizVal = document.getElementById('settings-noti-quiz').checked;
        const notiActVal = document.getElementById('settings-noti-activity').checked;
        const notiResVal = document.getElementById('settings-noti-results').checked;
        const notiSysVal = document.getElementById('settings-noti-system').checked;

        const quizDurationVal = parseInt(document.getElementById('settings-quiz-duration').value, 10) || 0;
        const quizQuestionsVal = parseInt(document.getElementById('settings-quiz-questions').value, 10) || 0;

        const quizCorrectVal = document.getElementById('settings-quiz-correct').checked;
        const quizLateVal = document.getElementById('settings-quiz-late').checked;

        // Compare Name, Department
        if (nameVal !== teacher.name) return true;
        if (deptVal !== teacher.department) return true;

        // Compare subjects list (case insensitive split/join comparison)
        const currentSubjects = subjectsVal.split(',').map(s => s.trim()).filter(Boolean);
        const originalSubjects = teacher.subjects;
        if (currentSubjects.length !== originalSubjects.length) return true;
        for (let i = 0; i < currentSubjects.length; i++) {
            if (currentSubjects[i].toLowerCase() !== originalSubjects[i].toLowerCase()) return true;
        }

        // Compare dropdowns
        if (themeVal !== settings.appearance.theme) return true;
        if (animVal !== settings.appearance.animation) return true;

        // Compare toggles
        if (notiQuizVal !== settings.notifications.quiz) return true;
        if (notiActVal !== settings.notifications.studentActivity) return true;
        if (notiResVal !== settings.notifications.results) return true;
        if (notiSysVal !== settings.notifications.system) return true;

        // Compare quiz pref inputs
        if (quizDurationVal !== settings.quizPreferences.defaultDuration) return true;
        if (quizQuestionsVal !== settings.quizPreferences.defaultQuestions) return true;

        // Compare quiz pref toggles
        if (quizCorrectVal !== settings.quizPreferences.showCorrectAnswers) return true;
        if (quizLateVal !== settings.quizPreferences.allowLateSubmissions) return true;

        return false;
    };

    if (window.OrixaAudio) window.OrixaAudio.mountSettings(document.getElementById('settings-audio-mount'));

    // Attach general input listeners to trigger the unsaved indicator
    const inputIds = [
        'settings-profile-name', 'settings-profile-dept',
        'settings-profile-subjects', 'settings-appearance-theme', 'settings-appearance-animation',
        'settings-quiz-duration', 'settings-quiz-questions'
    ];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', checkUnsavedChanges);
            el.addEventListener('change', checkUnsavedChanges);
        }
    });

    // Reset button
    const resetBtn = document.getElementById('settings-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            renderSettingsPage();
            // Show reset success popup or subtle notification
            openOrixaModal(`
                <div class="orixa-modal-card">
                    <header class="orixa-modal-header" style="background: var(--color-blue);">
                        <h3 class="orixa-modal-title" style="color: var(--border-dark);">Settings Reset</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                        <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">All fields restored to their last saved values.</p>
                    </div>
                    <footer class="orixa-modal-footer">
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                            OK
                        </button>
                    </footer>
                </div>
            `);
        });
    }

    // Save button
    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // Validate form fields first
            const errName = document.getElementById('err-settings-name');
            const errDept = document.getElementById('err-settings-dept');
            const errDuration = document.getElementById('err-settings-duration');
            const errQuestions = document.getElementById('err-settings-questions');

            // Reset errors
            [errName, errDept, errDuration, errQuestions].forEach(el => {
                if (el) el.textContent = '';
            });
            dynamicPage.querySelectorAll('.cartoon-input').forEach(el => el.classList.remove('input-invalid'));

            let isValid = true;

            const nameVal = document.getElementById('settings-profile-name').value.trim();
            const deptVal = document.getElementById('settings-profile-dept').value.trim();

            const themeVal = document.getElementById('settings-appearance-theme').value;
            const animVal = document.getElementById('settings-appearance-animation').value;

            const notiQuizVal = document.getElementById('settings-noti-quiz').checked;
            const notiActVal = document.getElementById('settings-noti-activity').checked;
            const notiResVal = document.getElementById('settings-noti-results').checked;
            const notiSysVal = document.getElementById('settings-noti-system').checked;

            const quizDurationVal = parseInt(document.getElementById('settings-quiz-duration').value, 10);
            const quizQuestionsVal = parseInt(document.getElementById('settings-quiz-questions').value, 10);

            const quizCorrectVal = document.getElementById('settings-quiz-correct').checked;
            const quizLateVal = document.getElementById('settings-quiz-late').checked;

            // Required validations
            if (!nameVal) {
                document.getElementById('settings-profile-name').classList.add('input-invalid');
                if (errName) errName.textContent = 'Name is required.';
                isValid = false;
            }

            if (!deptVal) {
                document.getElementById('settings-profile-dept').classList.add('input-invalid');
                if (errDept) errDept.textContent = 'Department is required.';
                isValid = false;
            }

            if (isNaN(quizDurationVal) || quizDurationVal < 1) {
                document.getElementById('settings-quiz-duration').classList.add('input-invalid');
                if (errDuration) errDuration.textContent = 'Please enter a valid duration greater than 0.';
                isValid = false;
            }

            if (isNaN(quizQuestionsVal) || quizQuestionsVal < 1) {
                document.getElementById('settings-quiz-questions').classList.add('input-invalid');
                if (errQuestions) errQuestions.textContent = 'Please enter a valid number of questions greater than 0.';
                isValid = false;
            }

            if (!isValid) {
                const firstErr = dynamicPage.querySelector('.input-invalid');
                if (firstErr) {
                    firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Save values to MOCK_DATA
            MOCK_DATA.teacher.name = nameVal;
            MOCK_DATA.teacher.department = deptVal;

            MOCK_DATA.settings.appearance.theme = themeVal;
            MOCK_DATA.settings.appearance.animation = animVal;

            MOCK_DATA.settings.notifications.quiz = notiQuizVal;
            MOCK_DATA.settings.notifications.studentActivity = notiActVal;
            MOCK_DATA.settings.notifications.results = notiResVal;
            MOCK_DATA.settings.notifications.system = notiSysVal;

            MOCK_DATA.settings.quizPreferences.defaultDuration = quizDurationVal;
            MOCK_DATA.settings.quizPreferences.defaultQuestions = quizQuestionsVal;
            MOCK_DATA.settings.quizPreferences.showCorrectAnswers = quizCorrectVal;
            MOCK_DATA.settings.quizPreferences.allowLateSubmissions = quizLateVal;

            // Re-render the Settings Profile avatar / name display at the top right if present!
            updateTopBarProfileChip();

            // Persist to Supabase
            if (window.OrixaAuth && window.OrixaAuth.client) {
                window.OrixaAuth.getCurrentUser().then(user => {
                    if (user) {
                        window.OrixaAuth.client.from('profiles')
                            .update({ full_name: nameVal })
                            .eq('id', user.id)
                            .then(({error}) => {
                                if (error) console.error('Failed to update profile name:', error);
                            });
                    }
                });
            }

            // Un-trigger unsaved badge
            checkUnsavedChanges();

            // Success feedback modal
            openOrixaModal(`
                <div class="orixa-modal-card">
                    <header class="orixa-modal-header" style="background: var(--color-green);">
                        <h3 class="orixa-modal-title" style="color: var(--border-dark);">Settings Saved</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                        <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">Settings saved successfully.</p>
                        <p style="color: #546e7a; font-size: 0.92rem; margin-top: 6px;">Your preferences have been updated locally in mock memory storage.</p>
                    </div>
                    <footer class="orixa-modal-footer">
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                            Awesome!
                        </button>
                    </footer>
                </div>
            `);
        });
    }
}

window.openChangePasswordModal = function() {
    const html = `
        <div class="orixa-modal-card">
            <header class="orixa-modal-header" style="background: var(--color-yellow);">
                <h3 class="orixa-modal-title" style="color: var(--border-dark);">Change Password</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <form id="orixa-change-password-form" onsubmit="submitChangePassword(event)">
                <div class="orixa-modal-body">
                    <p style="font-family: var(--font-body); font-size: 0.92rem; color: #546e7a; margin-bottom: 8px;">
                        Set a new secure password for your Teacher Portal account.
                    </p>

                    <div class="form-field">
                        <label class="field-label" for="pwd-current">CURRENT PASSWORD *</label>
                        <div class="input-shell">
                            <input type="password" id="pwd-current" class="cartoon-input" placeholder="••••••••" required>
                        </div>
                        <span class="field-error" id="err-pwd-current"></span>
                    </div>

                    <div class="form-field">
                        <label class="field-label" for="pwd-new">NEW PASSWORD *</label>
                        <div class="input-shell">
                            <input type="password" id="pwd-new" class="cartoon-input" placeholder="••••••••" required>
                        </div>
                        <span class="field-error" id="err-pwd-new"></span>
                    </div>

                    <div class="form-field">
                        <label class="field-label" for="pwd-confirm">CONFIRM NEW PASSWORD *</label>
                        <div class="input-shell">
                            <input type="password" id="pwd-confirm" class="cartoon-input" placeholder="••••••••" required>
                        </div>
                        <span class="field-error" id="err-pwd-confirm"></span>
                    </div>
                </div>
                <footer class="orixa-modal-footer">
                    <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                        Cancel
                    </button>
                    <button type="submit" class="cartoon-action-btn primary-yellow-btn" style="padding: 10px 24px; font-size: 0.95rem;">
                        Save Password
                    </button>
                </footer>
            </form>
        </div>
    `;
    openOrixaModal(html);
    teacherPasswordSafety = window.OrixaAuth.attachPasswordSafety(document.getElementById('pwd-new'));
};

let teacherPasswordSafety = null;

window.submitChangePassword = async function(event) {
    event.preventDefault();

    const currEl = document.getElementById('pwd-current');
    const newEl = document.getElementById('pwd-new');
    const confirmEl = document.getElementById('pwd-confirm');

    const errCurr = document.getElementById('err-pwd-current');
    const errNew = document.getElementById('err-pwd-new');
    const errConfirm = document.getElementById('err-pwd-confirm');

    // Reset errors
    [errCurr, errNew, errConfirm].forEach(el => {
        if (el) el.textContent = '';
    });
    [currEl, newEl, confirmEl].forEach(el => {
        if (el) el.classList.remove('input-invalid');
    });

    let isValid = true;

    const currVal = currEl.value.trim();
    const newVal = newEl.value.trim();
    const confirmVal = confirmEl.value.trim();

    if (!currVal) {
        currEl.classList.add('input-invalid');
        if (errCurr) errCurr.textContent = 'Current Password is required.';
        isValid = false;
    }

    if (!newVal) {
        newEl.classList.add('input-invalid');
        if (errNew) errNew.textContent = 'New Password is required.';
        isValid = false;
    } else if (newVal.length < 8) {
        newEl.classList.add('input-invalid');
        if (errNew) errNew.textContent = 'Password must be at least 8 characters.';
        isValid = false;
    } else if (newVal === currVal) {
        newEl.classList.add('input-invalid');
        if (errNew) errNew.textContent = 'New password must be different from the current one.';
        isValid = false;
    }

    if (!confirmVal) {
        confirmEl.classList.add('input-invalid');
        if (errConfirm) errConfirm.textContent = 'Please confirm your new password.';
        isValid = false;
    } else if (newVal !== confirmVal) {
        confirmEl.classList.add('input-invalid');
        if (errConfirm) errConfirm.textContent = 'New passwords do not match.';
        isValid = false;
    }

    if (isValid && teacherPasswordSafety && !teacherPasswordSafety.isCopied()) {
        newEl.classList.add('input-invalid');
        if (errNew) errNew.textContent = 'Copy your new password first (use COPY NEW PASSWORD) so you can keep it safe. It cannot be recovered if forgotten.';
        isValid = false;
    }

    if (!isValid) return;

    if (window.OrixaAuth && window.OrixaAuth.client) {
        const saveBtn = document.querySelector('#orixa-change-password-form button[type="submit"]');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

        // Confirm the current password before allowing a change
        const user = await window.OrixaAuth.getCurrentUser();
        const verify = user && user.email
            ? await window.OrixaAuth.client.auth.signInWithPassword({ email: user.email, password: currVal })
            : { error: new Error('No active session') };

        if (verify.error) {
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Password'; }
            currEl.classList.add('input-invalid');
            if (errCurr) errCurr.textContent = 'Current password is incorrect.';
            return;
        }

        const { error } = await window.OrixaAuth.client.auth.updateUser({
            password: newVal
        });
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Password'; }

        if (error) {
            openOrixaModal(`
                <div class="orixa-modal-card">
                    <header class="orixa-modal-header" style="background: var(--color-red);">
                        <h3 class="orixa-modal-title" style="color: var(--border-dark);">Error</h3>
                        <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                            <span data-icon="x"></span>
                        </button>
                    </header>
                    <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                        <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">Password change failed.</p>
                        <p style="color: #546e7a; font-size: 0.92rem; margin-top: 6px;">${escapeHTML(error.message)}</p>
                    </div>
                    <footer class="orixa-modal-footer">
                        <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                            Close
                        </button>
                    </footer>
                </div>
            `);
            return;
        }
    }

    closeOrixaModal();

    openOrixaModal(`
        <div class="orixa-modal-card">
            <header class="orixa-modal-header" style="background: var(--color-green);">
                <h3 class="orixa-modal-title" style="color: var(--border-dark);">Success</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body" style="text-align: center; padding: var(--t-space-3);">
                <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark);">Password updated successfully.</p>
                <p style="color: #546e7a; font-size: 0.92rem; margin-top: 6px;">Your new password has been saved in the system.</p>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn primary-yellow-btn" onclick="closeOrixaModal()" style="padding: 10px 24px; font-size: 0.95rem;">
                    Got it!
                </button>
            </footer>
        </div>
    `);
};

/* ==========================================================================
   HELP SECTION CONTROLLER
   ========================================================================== */

const HELP_TOPICS = [
    {
        id: 'faq-1',
        title: "I can't create a quiz",
        solution: "Ensure that all required fields (Quiz Title, Subject, Class/Grade) are filled out and at least one question with options and a correct answer is added. Check for red error outlines before clicking Publish or Save as Draft."
    },
    {
        id: 'faq-2',
        title: "My quiz is not appearing",
        solution: "Verify if your quiz is saved as a 'Draft' or 'Live'. Draft quizzes are visible under Quiz Management but will not appear on the student portal until published. Use the status filter in Quiz Management to locate it."
    },
    {
        id: 'faq-3',
        title: "I can't find a student",
        solution: "Navigate to the Students section and clear active search queries or dropdown filters. If a student is missing, ask your HOD to add them."
    },
    {
        id: 'faq-4',
        title: "Results are not showing correctly",
        solution: "Results update automatically upon quiz submission by students. Try switching between 'Individual Attempts', 'By Quiz', and 'By Student' tabs in the Results section or click 'Clear Filters' to refresh the view."
    },
    {
        id: 'faq-5',
        title: "I can't access a feature",
        solution: "Ensure your browser is up to date and JavaScript is enabled. If a section appears locked, check your account permissions or clear your browser cache."
    },
    {
        id: 'faq-6',
        title: "Something is not working",
        solution: "Try refreshing the page or logging out and back in. If the problem persists, contact your HOD or college administrator."
    }
];

function renderHelpPage() {
    const dynamicPage = document.getElementById('dynamic-placeholder-page');
    if (!dynamicPage) return;

    dynamicPage.innerHTML = `
        <div class="help-container" style="display: flex; flex-direction: column; gap: var(--t-space-2); animation: qb-pop 0.25s ease-out;">
            <!-- Header section -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--t-space-2); border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: var(--t-space-2);">
                <div>
                    <p class="panel-kicker" style="margin-bottom: 4px;">Teacher Portal</p>
                    <h2 style="font-family: var(--font-header); color: var(--border-dark); font-size: 2.1rem; line-height: 1.1; margin: 0;">Help</h2>
                    <p class="cartoon-subtitle" style="margin-top: 4px;">Find solutions to common problems</p>
                </div>
                <button class="cartoon-action-btn primary-yellow-btn" onclick="navigateToView('dashboard')" style="padding: 10px 20px; font-size: 1rem; height: 44px; display: inline-flex; align-items: center;">
                    Back to Dashboard
                </button>
            </div>

            <!-- Two Main Sections Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--t-space-2);">

                <!-- AREA 1: COMMON PROBLEMS -->
                <div class="cartoon-panel" style="padding: var(--t-space-3); background: var(--surface-white); display: flex; flex-direction: column; gap: var(--t-space-2);">
                    <div style="border-bottom: 2px dashed rgba(26,26,36,0.15); padding-bottom: 8px;">
                        <p class="panel-kicker" style="margin-bottom: 2px;">FAQ & GUIDES</p>
                        <h3 style="font-family: var(--font-header); font-size: 1.35rem; color: var(--border-dark); margin: 0;">Common Problems</h3>
                    </div>

                    <div id="help-faq-accordion" style="display: flex; flex-direction: column; gap: var(--t-space-1);">
                        ${HELP_TOPICS.map(item => `
                            <div class="help-faq-item" style="background: var(--color-cream); border: var(--border-comic-thin); border-radius: 14px; box-shadow: var(--shadow-chunky-pressed); overflow: hidden;">
                                <button type="button" class="help-faq-trigger" data-faq="${item.id}" style="width: 100%; text-align: left; padding: 12px 16px; background: none; border: none; font-family: var(--font-header); font-size: 1rem; font-weight: 700; color: var(--border-dark); cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                                    <span>${escapeHTML(item.title)}</span>
                                    <span data-icon="chevronRight" class="help-faq-arrow" style="transition: transform 0.2s ease;"></span>
                                </button>
                                <div id="${item.id}-body" class="help-faq-body hidden" style="padding: 0 16px 14px 16px; font-family: var(--font-body); font-size: 0.92rem; color: #546e7a; line-height: 1.5; border-top: 1px dashed rgba(26,26,36,0.1); margin-top: 4px; padding-top: 10px;">
                                    ${escapeHTML(item.solution)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>
        </div>
    `;

    renderIcons(dynamicPage);

    // FAQ Accordion click handler
    const accordion = dynamicPage.querySelector('#help-faq-accordion');
    if (accordion) {
        accordion.addEventListener('click', (e) => {
            const btn = e.target.closest('.help-faq-trigger');
            if (!btn) return;
            const faqId = btn.dataset.faq;
            const body = document.getElementById(`${faqId}-body`);
            const arrow = btn.querySelector('.help-faq-arrow');

            if (body) {
                const isHidden = body.classList.contains('hidden');

                // Collapse all FAQ items first
                dynamicPage.querySelectorAll('.help-faq-body').forEach(el => el.classList.add('hidden'));
                dynamicPage.querySelectorAll('.help-faq-arrow').forEach(el => el.style.transform = 'rotate(0deg)');

                if (isHidden) {
                    body.classList.remove('hidden');
                    if (arrow) arrow.style.transform = 'rotate(90deg)';
                }
            }
        });
    }
}

function confirmTeacherLogout(event) {
    if (event) {
        event.preventDefault();
    }

    openOrixaModal(`
        <div class="orixa-modal-card">
            <header class="orixa-modal-header" style="background: var(--color-red);">
                <h3 class="orixa-modal-title" style="color: var(--border-dark);">Log Out?</h3>
                <button type="button" class="sidebar-toggle-btn" onclick="closeOrixaModal()" aria-label="Close modal">
                    <span data-icon="x"></span>
                </button>
            </header>
            <div class="orixa-modal-body" style="padding: var(--t-space-3);">
                <p style="font-size: 1.15rem; font-weight: 700; color: var(--border-dark); margin: 0;">Are you sure you want to log out?</p>
                <p style="color: #546e7a; font-size: 0.95rem; margin-top: 8px; margin-bottom: 0;">You will be redirected back to the teacher login screen.</p>
            </div>
            <footer class="orixa-modal-footer">
                <button type="button" class="cartoon-action-btn" onclick="closeOrixaModal()" style="padding: 10px 20px; font-size: 0.95rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">
                    Cancel
                </button>
                <button type="button" class="cartoon-action-btn" id="confirm-teacher-logout-btn" style="padding: 10px 24px; font-size: 0.95rem; background: var(--color-red); color: var(--border-dark); border-width: 3px; font-family: var(--font-header); font-weight: 700; cursor: pointer;">
                    Logout
                </button>
            </footer>
        </div>
    `);

    const confirmBtn = document.getElementById('confirm-teacher-logout-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const logoutSound = new Promise(done => (window.OrixaAudio ? window.OrixaAudio.playThen('logout', done, 450) : done()));
            if (window.OrixaAuth) {
                await window.OrixaAuth.signOut();
            }
            await logoutSound;
            window.location.replace('teacher-login.html');
        });
    }
}

window.confirmTeacherLogout = confirmTeacherLogout;

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

async function initCurrentTeacherData() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile) return;

    MOCK_DATA.teacher.name = profile.full_name || '';
    MOCK_DATA.teacher.employeeId = profile.login_id || '';

    // Fetch department name if department_id exists
    if (profile.department_id) {
        const { data: dept } = await client
            .from('departments')
            .select('name')
            .eq('id', profile.department_id)
            .maybeSingle();
        if (dept) {
            MOCK_DATA.teacher.department = dept.name;
        }
    }

    // Fetch active teacher assignments
    const { data: assignments, error: assignmentsError } = await client
        .from('teacher_subject_class_assignments')
        .select('*, subjects!teacher_subject_class_assignments_subject_id_fkey(name), academic_levels!teacher_subject_class_assignments_academic_level_id_fkey(display_name)')
        .eq('teacher_id', profile.id)
        .eq('is_active', true);

    if (assignmentsError) console.error('Error fetching teacher assignments:', assignmentsError);

    if (assignments && assignments.length > 0) {
        MOCK_DATA.teacher.subjects = Array.from(new Set(assignments.map(a => a.subjects ? a.subjects.name : null).filter(Boolean)));
        MOCK_DATA.teacher.classes = Array.from(new Set(assignments.map(a => a.academic_levels ? a.academic_levels.display_name : null).filter(Boolean)));
    }

    updateTopBarProfileChip();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.OrixaAuth) {
        const profile = await window.OrixaAuth.requireRole(['TEACHER', 'HOD', 'COLLEGE_ADMIN'], 'teacher-login.html');
        if (!profile) return;

        if (profile.full_name) {
            MOCK_DATA.teacher.name = profile.full_name;
        }
    }

    await initCurrentTeacherData();
    renderSidebar();
    initDashboardNavigation();
    initSidebarCollapsible();
    initSearch();
    updateTopBarProfileChip();

    await Promise.all([
        fetchTeacherQuizzesFromSupabase(),
        fetchTeacherStudentsFromSupabase(),
        fetchTeacherResultsFromSupabase()
    ]);

    MOCK_DATA.students.forEach(st => {
        const attempts = MOCK_DATA.results.filter(r => r.studentId === st.id);
        st.quizzesAttempted = attempts.length;
        st.averageScore = attempts.length
            ? Math.round(attempts.reduce((sum, r) => sum + (r.percentage || 0), 0) / attempts.length)
            : 0;
    });
    MOCK_DATA.results.forEach(r => {
        const st = MOCK_DATA.students.find(x => x.id === r.studentId);
        if (st) r.grade = st.grade;
    });

    updateDashboardStats();
    renderQuizzes();
    renderIcons();
});
