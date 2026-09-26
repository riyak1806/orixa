/* ==========================================================================
   ORIXA - GENERAL COLLEGE DASHBOARD CONTROLLER
   All data is now persisted to and loaded from Supabase.
   ========================================================================== */

const MOCK_COLLEGE_DATA = {
    collegeInfo: { id: '', name: '', adminName: '', academicYear: '2024–2025' },
    departments: [],
    studentPerformance: []
};

let currentDepartmentFilter = 'ALL';
let currentTeacherFilter = 'ALL';
let currentYearFilter = 'ALL';
let currentSubjectFilter = 'ALL';

/* ==========================================================================
   DOM RENDERING FUNCTIONS
   ========================================================================== */

function renderCollegeStats() {
    const totalDeptsEl = document.getElementById('stat-total-departments');
    const totalStudentsEl = document.getElementById('stat-total-students');
    const activeTeachersEl = document.getElementById('stat-active-teachers');
    const avgPerfEl = document.getElementById('stat-college-avg-perf');

    if (totalDeptsEl) totalDeptsEl.textContent = MOCK_COLLEGE_DATA.departments.length;

    if (totalStudentsEl) {
        const total = MOCK_COLLEGE_DATA.departments.reduce((sum, d) => sum + (d.totalStudents || 0), 0);
        totalStudentsEl.textContent = total.toLocaleString();
    }

    if (activeTeachersEl) {
        const total = MOCK_COLLEGE_DATA.departments.reduce((sum, d) => sum + (d.activeTeachers || 0), 0);
        activeTeachersEl.textContent = total;
    }

    if (avgPerfEl) {
        const depts = MOCK_COLLEGE_DATA.departments.filter(d => d.avgAccuracy != null);
        const avg = depts.length > 0
            ? Math.round(depts.reduce((sum, d) => sum + (d.avgAccuracy || 0), 0) / depts.length)
            : 0;
        avgPerfEl.textContent = `${avg}%`;
    }
}

function renderDepartmentList() {
    const listBody = document.getElementById('department-table-body');
    const deptFilterSelect = document.getElementById('filter-department');

    if (!listBody) return;

    if (MOCK_COLLEGE_DATA.departments.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="6" class="college-no-results">
                    No departments created yet. Use the form above to add a department.
                </td>
            </tr>
        `;
    } else {
        listBody.innerHTML = MOCK_COLLEGE_DATA.departments.map(dept => `
            <tr>
                <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(dept.name)}</td>
                <td>${escapeHtml(dept.hodName)}</td>
                <td><code class="college-code-badge">${escapeHtml(dept.hodEmpId)}</code></td>
                <td><strong>${dept.totalStudents || 0}</strong></td>
                <td><strong>${dept.activeTeachers || 0}</strong></td>
                <td>
                    <span class="quiz-status-pill pill-live">${dept.avgAccuracy != null ? dept.avgAccuracy : '—'}% Avg</span>
                </td>
            </tr>
        `).join('');
    }

    if (deptFilterSelect) {
        const selectedVal = deptFilterSelect.value || 'ALL';
        deptFilterSelect.innerHTML = `
            <option value="ALL">All Departments</option>
            ${MOCK_COLLEGE_DATA.departments.map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join('')}
        `;
        deptFilterSelect.value = selectedVal;
    }
}

function renderTeacherAndSubjectFilterOptions() {
    const teacherSelect = document.getElementById('filter-teacher');
    const subjectSelect = document.getElementById('filter-subject');

    let available = MOCK_COLLEGE_DATA.studentPerformance;
    if (currentDepartmentFilter !== 'ALL') available = available.filter(s => s.department === currentDepartmentFilter);
    if (currentYearFilter !== 'ALL') available = available.filter(s => s.year === currentYearFilter);

    if (teacherSelect) {
        const selectedTeacher = teacherSelect.value || 'ALL';
        const teachers = Array.from(new Set(available.map(s => s.teacher))).sort();
        teacherSelect.innerHTML = `
            <option value="ALL">All Teachers</option>
            ${teachers.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
        `;
        teacherSelect.value = teachers.includes(selectedTeacher) ? selectedTeacher : 'ALL';
        if (!teachers.includes(selectedTeacher)) currentTeacherFilter = 'ALL';
    }

    if (subjectSelect) {
        const selectedSubject = subjectSelect.value || 'ALL';
        const subjects = Array.from(new Set(available.map(s => s.subject))).sort();
        subjectSelect.innerHTML = `
            <option value="ALL">All Subjects</option>
            ${subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
        `;
        subjectSelect.value = subjects.includes(selectedSubject) ? selectedSubject : 'ALL';
        if (!subjects.includes(selectedSubject)) currentSubjectFilter = 'ALL';
    }
}

function renderStudentPerformanceTable() {
    const tableBody = document.getElementById('performance-table-body');
    const recordCountEl = document.getElementById('performance-record-count');

    if (!tableBody) return;

    const filtered = MOCK_COLLEGE_DATA.studentPerformance.filter(item => {
        const matchDept = (currentDepartmentFilter === 'ALL' || item.department === currentDepartmentFilter);
        const matchTeacher = (currentTeacherFilter === 'ALL' || item.teacher === currentTeacherFilter);
        const matchYear = (currentYearFilter === 'ALL' || item.year === currentYearFilter);
        const matchSubject = (currentSubjectFilter === 'ALL' || item.subject === currentSubjectFilter);
        return matchDept && matchTeacher && matchYear && matchSubject;
    });

    if (recordCountEl) {
        recordCountEl.textContent = `Showing ${filtered.length} of ${MOCK_COLLEGE_DATA.studentPerformance.length} records`;
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="college-no-results">
                    <div style="padding: 20px 0;">
                        <p style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: 4px;">No student performance records found</p>
                        <p style="font-size: 0.9rem; color: #78909c;">Quizzes must be completed by students for records to appear here.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(item.name)}</td>
            <td><code class="college-code-badge">${escapeHtml(item.id)}</code></td>
            <td>${escapeHtml(item.department)}</td>
            <td>${escapeHtml(item.teacher)}</td>
            <td><span class="college-year-badge">${escapeHtml(item.year)}</span></td>
            <td>${escapeHtml(item.subject)}</td>
            <td><strong>${item.quizzesCompleted}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-header); font-weight: 700; color: var(--border-dark); min-width: 38px;">${item.avgAccuracy}%</span>
                    <span class="quiz-status-pill ${getAccuracyPillClass(item.avgAccuracy)}">${escapeHtml(item.status)}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function getAccuracyPillClass(accuracy) {
    if (accuracy >= 90) return 'pill-live';
    if (accuracy >= 75) return 'pill-draft';
    return 'pill-closed';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
   SUPABASE DATA LAYER
   ========================================================================== */

async function loadCollegeDataFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile || !profile.college_id) return;

    try {
        // Load college info
        const { data: col } = await client
            .from('colleges')
            .select('*')
            .eq('id', profile.college_id)
            .maybeSingle();
        if (col) {
            MOCK_COLLEGE_DATA.collegeInfo.name = col.name;
            MOCK_COLLEGE_DATA.collegeInfo.id = col.code;
            // Update page header
            const titleEl = document.querySelector('.college-title-group h1');
            if (titleEl) titleEl.textContent = `${col.name} — General College Administration`;
        }

        // Load departments — simple query, no nested counts
        const { data: depts, error: deptErr } = await client
            .from('departments')
            .select('id, code, name, college_id')
            .eq('college_id', profile.college_id);

        console.log('[CollegeDash] departments query result:', depts, deptErr);

        if (deptErr) {
            console.error('[CollegeDash] Error loading departments:', deptErr.message, deptErr);
        }

        if (depts && depts.length >= 0) {
            // Load HOD assignments separately
            const deptIds = depts.map(d => d.id);
            let hodMap = {};

            if (deptIds.length > 0) {
                const { data: hodAssignments, error: hodErr } = await client
                    .from('hod_assignments')
                    .select('department_id, profile_id, is_active, profiles(full_name, login_id)')
                    .in('department_id', deptIds)
                    .eq('is_active', true);

                console.log('[CollegeDash] hod_assignments result:', hodAssignments, hodErr);

                if (hodAssignments) {
                    hodAssignments.forEach(h => {
                        hodMap[h.department_id] = h.profiles;
                    });
                }
            }

            MOCK_COLLEGE_DATA.departments = depts.map(d => {
                const hod = hodMap[d.id];
                return {
                    id: d.id,
                    name: d.name,
                    hodName: hod?.full_name || 'Unassigned',
                    hodEmpId: hod?.login_id || '—',
                    totalStudents: 0,
                    activeTeachers: 0,
                    avgAccuracy: null
                };
            });
        }


        // Load student performance from quiz_attempts
        const { data: attempts } = await client
            .from('quiz_attempts')
            .select(`
                id, status, final_accuracy_pct, final_earned_xp,
                profiles!quiz_attempts_student_id_fkey(full_name, login_id, department_id,
                    departments(name),
                    student_profiles(academic_level_id, academic_levels(display_name))
                ),
                quizzes(title, subject_id, teacher_id,
                    subjects(name),
                    profiles!quizzes_teacher_id_fkey(full_name)
                )
            `)
            .eq('status', 'COMPLETED')
            .in('quiz_id',
                (await client.from('quizzes').select('id').eq('college_id', profile.college_id)).data?.map(q => q.id) || []
            );

        if (attempts && attempts.length > 0) {
            // Group by student to get per-student summary
            const studentMap = {};
            attempts.forEach(a => {
                const sid = a.profiles?.login_id || a.id;
                if (!studentMap[sid]) {
                    studentMap[sid] = {
                        name: a.profiles?.full_name || 'Unknown',
                        id: sid,
                        department: a.profiles?.departments?.name || '—',
                        teacher: a.quizzes?.profiles?.full_name || '—',
                        year: a.profiles?.student_profiles?.[0]?.academic_levels?.display_name || '—',
                        subject: a.quizzes?.subjects?.name || '—',
                        quizzesCompleted: 0,
                        totalAccuracy: 0
                    };
                }
                studentMap[sid].quizzesCompleted++;
                studentMap[sid].totalAccuracy += (a.final_accuracy_pct || 0);
            });

            MOCK_COLLEGE_DATA.studentPerformance = Object.values(studentMap).map(s => {
                const avg = Math.round(s.totalAccuracy / s.quizzesCompleted);
                return {
                    ...s,
                    avgAccuracy: avg,
                    status: avg >= 90 ? 'Excellent' : avg >= 75 ? 'Good' : 'Needs Work'
                };
            });
        }
    } catch (e) {
        console.warn('Error loading college data from Supabase:', e);
    }
}

async function saveDepartmentToSupabase(name) {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return { success: false, error: 'Not connected' };
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile || !profile.college_id) return { success: false, error: 'Profile not found' };

    // Auto-generate a department code from the name
    const code = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) + Date.now().toString().slice(-4);

    const { data, error } = await client
        .from('departments')
        .insert({
            college_id: profile.college_id,
            code: code,
            name: name.trim()
        })
        .select()
        .single();

    if (error) {
        console.error('Insert department error:', error);
        return { success: false, error: error.message };
    }
    return { success: true, data };
}

/* ==========================================================================
   EVENT HANDLERS
   ========================================================================== */

function initAddDepartmentDrawer() {
    const toggleBtn = document.getElementById('toggle-add-dept-btn');
    const drawer = document.getElementById('add-dept-drawer');
    const closeBtn = document.getElementById('close-add-dept-btn');

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = drawer.style.display === 'none' || drawer.style.display === '';
            drawer.style.display = isHidden ? 'flex' : 'none';
        });
    }
    if (closeBtn && drawer) {
        closeBtn.addEventListener('click', () => { drawer.style.display = 'none'; });
    }
    if (drawer) {
        drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.style.display = 'none'; });
    }
}

function initAddDepartmentForm() {
    const form = document.getElementById('add-department-form');
    const nameInput = document.getElementById('dept-name');
    const formMsg = document.getElementById('dept-form-msg');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = nameInput.value.trim();

        if (!name) {
            setFieldInvalid(nameInput, 'Department name is required.');
            return;
        }
        setFieldValid(nameInput);

        // Disable button while saving
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SAVING…'; }

        const result = await saveDepartmentToSupabase(name);

        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'ADD DEPARTMENT'; }

        if (!result.success) {
            if (formMsg) {
                formMsg.textContent = `Error: ${result.error}`;
                formMsg.className = 'teacher-form-msg error';
            }
            return;
        }

        form.reset();
        setFieldValid(nameInput);

        if (formMsg) {
            formMsg.textContent = `Department "${name}" saved successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
                const drawer = document.getElementById('add-dept-drawer');
                if (drawer) drawer.style.display = 'none';
            }, 1500);
        }

        // Reload from DB and re-render
        await loadCollegeDataFromSupabase();
        renderCollegeStats();
        renderDepartmentList();
        renderTeacherAndSubjectFilterOptions();
        renderStudentPerformanceTable();
    });

    if (nameInput) nameInput.addEventListener('input', () => setFieldValid(nameInput));
}

function setFieldInvalid(input, msg) {
    input.classList.add('input-invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) errEl.textContent = msg;
}

function setFieldValid(input) {
    input.classList.remove('input-invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) errEl.textContent = '';
}

function initPerformanceFilters() {
    const deptSelect = document.getElementById('filter-department');
    const teacherSelect = document.getElementById('filter-teacher');
    const yearSelect = document.getElementById('filter-year');
    const subjectSelect = document.getElementById('filter-subject');
    const clearBtn = document.getElementById('clear-filters-btn');

    if (deptSelect) {
        deptSelect.addEventListener('change', e => {
            currentDepartmentFilter = e.target.value;
            renderTeacherAndSubjectFilterOptions();
            renderStudentPerformanceTable();
        });
    }
    if (teacherSelect) {
        teacherSelect.addEventListener('change', e => {
            currentTeacherFilter = e.target.value;
            renderStudentPerformanceTable();
        });
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', e => {
            currentYearFilter = e.target.value;
            renderTeacherAndSubjectFilterOptions();
            renderStudentPerformanceTable();
        });
    }
    if (subjectSelect) {
        subjectSelect.addEventListener('change', e => {
            currentSubjectFilter = e.target.value;
            renderStudentPerformanceTable();
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentDepartmentFilter = 'ALL';
            currentTeacherFilter = 'ALL';
            currentYearFilter = 'ALL';
            currentSubjectFilter = 'ALL';
            if (deptSelect) deptSelect.value = 'ALL';
            if (teacherSelect) teacherSelect.value = 'ALL';
            if (yearSelect) yearSelect.value = 'ALL';
            if (subjectSelect) subjectSelect.value = 'ALL';
            renderStudentPerformanceTable();
        });
    }
}

function confirmCollegeLogout(event) {
    if (event) event.preventDefault();

    const existingModal = document.getElementById('college-logout-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'college-logout-modal';
    modal.className = 'orixa-modal-overlay';
    modal.innerHTML = `
        <div class="orixa-modal-card">
            <div class="orixa-modal-header">
                <h3 class="orixa-modal-title">Log Out Confirmation</h3>
            </div>
            <div class="orixa-modal-body">
                <p>Are you sure you want to log out of the General College Administration Dashboard?</p>
            </div>
            <div class="orixa-modal-footer">
                <button type="button" class="quiz-mgmt-action-btn" id="logout-cancel-btn" style="background: var(--color-cream);">Cancel</button>
                <button type="button" class="quiz-mgmt-action-btn" id="logout-confirm-btn" style="background: var(--color-red);">Logout</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('logout-cancel-btn').addEventListener('click', () => modal.remove());
    document.getElementById('logout-confirm-btn').addEventListener('click', async () => {
        if (window.OrixaAuth) await window.OrixaAuth.signOut();
        window.location.replace('college-login.html');
    });
}

/* ==========================================================================
   INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    if (window.OrixaAuth) {
        const profile = await window.OrixaAuth.requireRole(['COLLEGE_ADMIN'], 'college-login.html');
        if (!profile) return;
        if (profile.full_name) MOCK_COLLEGE_DATA.collegeInfo.adminName = profile.full_name;
    }

    await loadCollegeDataFromSupabase();

    renderCollegeStats();
    renderDepartmentList();
    renderTeacherAndSubjectFilterOptions();
    renderStudentPerformanceTable();

    initAddDepartmentDrawer();
    initAddDepartmentForm();
    initPerformanceFilters();
});
