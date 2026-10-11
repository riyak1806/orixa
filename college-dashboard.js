/* ==========================================================================
   ORIXA - GENERAL COLLEGE DASHBOARD CONTROLLER
   All data is now persisted to and loaded from Supabase.
   ========================================================================== */

const MOCK_COLLEGE_DATA = {
    collegeInfo: { id: '', name: '', adminName: '', academicYear: '' },
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
                <td colspan="7" class="college-no-results">
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
                <td>
                    <div class="college-row-actions">
                        <button type="button" class="quiz-mgmt-action-btn quiz-btn-edit" data-dept-action="edit" data-dept-id="${escapeHtml(dept.id)}" aria-label="Edit ${escapeHtml(dept.name)}">Edit</button>
                        <button type="button" class="quiz-mgmt-action-btn quiz-btn-delete" data-dept-action="delete" data-dept-id="${escapeHtml(dept.id)}" aria-label="Delete ${escapeHtml(dept.name)}">Delete</button>
                    </div>
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

// Students, teachers and average accuracy of every department of the college: Map(department id -> numbers)
async function loadDepartmentStats(client, collegeId) {
    const stats = new Map();
    const { data, error } = await client
        .from('vw_department_analytics')
        .select('department_id, total_students, total_teachers, total_completed_attempts, avg_accuracy_pct')
        .eq('college_id', collegeId);

    if (!error && data) {
        data.forEach(r => stats.set(r.department_id, {
            students: Number(r.total_students) || 0,
            teachers: Number(r.total_teachers) || 0,
            attempts: Number(r.total_completed_attempts) || 0,
            accuracy: Number(r.avg_accuracy_pct) || 0
        }));
        return stats;
    }

    // The view is missing or refused: count the people directly (in pages, the API returns 1000 rows at most)
    console.warn('vw_department_analytics unavailable, counting profiles directly:', error);
    for (let from = 0; ; from += 1000) {
        const page = await client
            .from('profiles')
            .select('department_id, role')
            .eq('college_id', collegeId)
            .in('role', ['STUDENT', 'TEACHER'])
            .order('id')
            .range(from, from + 999);
        if (page.error) { console.error('Could not count department members:', page.error); break; }
        page.data.forEach(r => {
            if (!r.department_id) return;
            const entry = stats.get(r.department_id) || { students: 0, teachers: 0, attempts: 0, accuracy: 0 };
            if (r.role === 'STUDENT') entry.students++; else entry.teachers++;
            stats.set(r.department_id, entry);
        });
        if (page.data.length < 1000) break;
    }
    return stats;
}

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
                    .select('department_id, profile_id, is_active, profiles!hod_assignments_profile_id_fkey(full_name, login_id)')
                    .in('department_id', deptIds)
                    .eq('is_active', true);

                console.log('[CollegeDash] hod_assignments result:', hodAssignments, hodErr);

                if (hodAssignments) {
                    hodAssignments.forEach(h => {
                        if (h.profiles) {
                            hodMap[h.department_id] = { ...h.profiles, id: h.profile_id };
                        }
                    });
                }
            }

            const deptStats = await loadDepartmentStats(client, profile.college_id);

            MOCK_COLLEGE_DATA.departments = depts.map(d => {
                const hod = hodMap[d.id];
                const stats = deptStats.get(d.id);
                return {
                    id: d.id,
                    name: d.name,
                    hodId: hod ? hod.id : null,
                    hodName: hod?.full_name || 'Unassigned',
                    hodEmpId: hod?.login_id || '—',
                    totalStudents: stats ? stats.students : 0,
                    activeTeachers: stats ? stats.teachers : 0,
                    avgAccuracy: stats && stats.attempts > 0 ? stats.accuracy : null
                };
            });
        }


        // Load student performance from quiz_attempts
        const { data: attempts } = await client
            .from('quiz_attempts')
            .select(`
                id, status, final_accuracy_pct, final_earned_xp,
                profiles!quiz_attempts_student_id_fkey(full_name, login_id, department_id,
                    departments!profiles_department_id_fkey(name),
                    student_profiles!student_profiles_profile_id_fkey(academic_level_id, academic_levels(display_name))
                ),
                quizzes(title, subject_id, teacher_id,
                    subjects!quizzes_subject_id_fkey(name),
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
                        year: (Array.isArray(a.profiles?.student_profiles) ? a.profiles.student_profiles[0] : a.profiles?.student_profiles)?.academic_levels?.display_name || '—',
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

async function saveDepartmentToSupabase(name, hodName, hodEmpId, hodPassword) {
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

    if (hodName && hodEmpId) {
        // Provision the HOD; the department and HOD are created together or not at all
        const finalPassword = hodPassword && hodPassword.trim() ? hodPassword.trim() : 'Password123!';
        const { error: hodError } = await client.rpc('fn_admin_provision_hod', {
            p_full_name: hodName,
            p_login_id: hodEmpId,
            p_password: finalPassword,
            p_department_id: data.id
        });

        if (hodError) {
            console.error('HOD RPC provisioning error:', hodError);
            const { error: rollbackErr } = await client.from('departments').delete().eq('id', data.id);
            if (rollbackErr) console.error('Could not roll back department:', rollbackErr);
            return { success: false, error: `HOD account could not be created, so the department was not saved: ${hodError.message}` };
        }
    }

    return { success: true, data };
}

/* ==========================================================================
   ACADEMIC YEAR
   ========================================================================== */

function showAcademicYear(code) {
    const badge = document.getElementById('academic-year-badge');
    if (!badge) return;
    badge.textContent = code ? `Academic Year ${window.OrixaAuth.formatAcademicYear(code)}` : 'Set Academic Year';
}

function initAcademicYearModal() {
    const badge = document.getElementById('academic-year-badge');
    const modal = document.getElementById('academic-year-modal');
    const form = document.getElementById('academic-year-form');
    const select = document.getElementById('academic-year-select');
    const closeBtn = document.getElementById('close-academic-year-btn');
    const saveBtn = document.getElementById('academic-year-save-btn');
    const errorEl = document.getElementById('academic-year-error');
    const msgEl = document.getElementById('academic-year-msg');
    if (!badge || !modal || !form || !select) return;

    // Academic years start in June: from today's date, offer last year, this year and next year
    const today = new Date();
    const currentStart = today.getMonth() >= 5 ? today.getFullYear() : today.getFullYear() - 1;
    const options = [currentStart - 1, currentStart, currentStart + 1].map(y => `${y}-${y + 1}`);

    const open = () => {
        const current = MOCK_COLLEGE_DATA.collegeInfo.academicYear;
        const list = current && !options.includes(current) ? [current, ...options] : options;
        select.innerHTML = list.map(code =>
            `<option value="${code}">${window.OrixaAuth.formatAcademicYear(code)}</option>`).join('');
        select.value = current || `${currentStart}-${currentStart + 1}`;
        errorEl.textContent = '';
        msgEl.textContent = '';
        msgEl.className = 'teacher-form-msg';
        modal.style.display = 'flex';
        select.focus();
    };
    const close = () => { modal.style.display = 'none'; badge.focus(); };

    badge.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') close(); });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const code = select.value;
        const startYear = parseInt(code, 10);
        if (!code || Number.isNaN(startYear)) {
            errorEl.textContent = 'Please choose an academic year.';
            return;
        }
        errorEl.textContent = '';

        saveBtn.disabled = true;
        saveBtn.textContent = 'SAVING…';
        const { error } = await window.OrixaAuth.client.rpc('fn_set_current_academic_year', {
            p_code: code,
            p_start_date: `${startYear}-06-01`,
            p_end_date: `${startYear + 1}-05-31`
        });
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE ACADEMIC YEAR';

        if (error) {
            console.error('Academic year error:', error);
            msgEl.textContent = `Error: ${error.message}`;
            msgEl.className = 'teacher-form-msg error';
            return;
        }

        MOCK_COLLEGE_DATA.collegeInfo.academicYear = code;
        showAcademicYear(code);
        msgEl.textContent = 'Academic year updated.';
        msgEl.className = 'teacher-form-msg success';
        setTimeout(close, 900);
    });
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
    const hodNameInput = document.getElementById('dept-hod-name');
    const hodEmpIdInput = document.getElementById('dept-hod-empid');
    const hodPasswordInput = document.getElementById('dept-hod-password');
    const toggleBtn = document.getElementById('dept-hod-password-toggle');
    const eyeOpen = document.getElementById('dept-hod-eye-open');
    const eyeClosed = document.getElementById('dept-hod-eye-closed');
    const formMsg = document.getElementById('dept-form-msg');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) return;

    if (toggleBtn && hodPasswordInput && eyeOpen && eyeClosed) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = hodPasswordInput.type === 'password';
            hodPasswordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            eyeOpen.classList.toggle('hidden', isPassword);
            eyeClosed.classList.toggle('hidden', !isPassword);
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const hodName = hodNameInput ? hodNameInput.value.trim() : '';
        const hodEmpId = hodEmpIdInput ? hodEmpIdInput.value.trim() : '';
        const hodPassword = hodPasswordInput ? hodPasswordInput.value.trim() : '';
        let isValid = true;

        if (!name) {
            setFieldInvalid(nameInput, 'Department name is required.');
            isValid = false;
        } else {
            setFieldValid(nameInput);
        }

        if (!hodName) {
            if (hodNameInput) setFieldInvalid(hodNameInput, 'HOD Name is required.');
            isValid = false;
        } else {
            if (hodNameInput) setFieldValid(hodNameInput);
        }

        if (!hodEmpId) {
            if (hodEmpIdInput) setFieldInvalid(hodEmpIdInput, 'HOD Employee ID is required.');
            isValid = false;
        } else {
            if (hodEmpIdInput) setFieldValid(hodEmpIdInput);
        }

        if (hodPassword && hodPassword.length < 8) {
            if (hodPasswordInput) setFieldInvalid(hodPasswordInput, 'Password must be at least 8 characters.');
            isValid = false;
        } else if (hodPasswordInput) {
            setFieldValid(hodPasswordInput);
        }

        if (!isValid) return;

        // Disable button while saving
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SAVING…'; }

        const result = await saveDepartmentToSupabase(name, hodName, hodEmpId, hodPassword);

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
        if (hodNameInput) setFieldValid(hodNameInput);
        if (hodEmpIdInput) setFieldValid(hodEmpIdInput);
        if (hodPasswordInput) setFieldValid(hodPasswordInput);

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
    if (hodNameInput) hodNameInput.addEventListener('input', () => setFieldValid(hodNameInput));
    if (hodEmpIdInput) hodEmpIdInput.addEventListener('input', () => setFieldValid(hodEmpIdInput));
    if (hodPasswordInput) hodPasswordInput.addEventListener('input', () => setFieldValid(hodPasswordInput));
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

function initCollegeProfile() {
    const drawer = document.getElementById('college-profile-drawer');
    const openBtn = document.getElementById('open-college-profile-btn');
    const closeBtn = document.getElementById('close-college-profile-btn');
    const form = document.getElementById('college-password-form');
    const toggleBtn = document.getElementById('college-password-toggle-btn');
    if (!drawer || !openBtn || !form || !toggleBtn) return;

    const fields = {
        current: document.getElementById('college-pwd-current'),
        next: document.getElementById('college-pwd-new'),
        confirm: document.getElementById('college-pwd-confirm')
    };
    const errors = {
        current: document.getElementById('college-pwd-current-error'),
        next: document.getElementById('college-pwd-new-error'),
        confirm: document.getElementById('college-pwd-confirm-error')
    };
    const msg = document.getElementById('college-pwd-msg');
    const saveBtn = document.getElementById('college-pwd-save-btn');
    const passwordSafety = window.OrixaAuth.attachPasswordSafety(fields.next);

    const fillProfile = async () => {
        const profile = await window.OrixaAuth.getCurrentProfile();
        if (!profile) return;
        const name = profile.full_name || 'Admin';
        document.getElementById('college-profile-name').textContent = name;
        document.getElementById('college-profile-avatar').textContent =
            name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '--';
        document.getElementById('college-profile-login').textContent = profile.login_id || '\u2014';
        document.getElementById('college-profile-college').textContent = MOCK_COLLEGE_DATA.collegeInfo.name || '\u2014';
        const year = MOCK_COLLEGE_DATA.collegeInfo.academicYear;
        document.getElementById('college-profile-year').textContent = year ? window.OrixaAuth.formatAcademicYear(year) : '\u2014';
    };

    const clearErrors = () => {
        Object.values(fields).forEach(el => el.classList.remove('input-invalid'));
        Object.values(errors).forEach(el => { el.textContent = ''; });
        msg.textContent = '';
        msg.className = 'teacher-form-msg';
    };
    const fail = (key, text) => {
        fields[key].classList.add('input-invalid');
        errors[key].textContent = text;
    };
    const setFormOpen = isOpen => {
        form.classList.toggle('hidden', !isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    };
    const open = () => { drawer.style.display = 'flex'; closeBtn.focus(); fillProfile(); };
    const close = () => { drawer.style.display = 'none'; form.reset(); clearErrors(); setFormOpen(false); openBtn.focus(); };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', e => { if (e.target === drawer) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.style.display !== 'none') close(); });
    toggleBtn.addEventListener('click', () => {
        const opening = form.classList.contains('hidden');
        setFormOpen(opening);
        if (opening) fields.current.focus();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        clearErrors();

        const current = fields.current.value;
        const next = fields.next.value;
        const confirm = fields.confirm.value;

        let valid = true;
        if (!current) { fail('current', 'Current password is required.'); valid = false; }
        if (!next) { fail('next', 'New password is required.'); valid = false; }
        else if (next.length < 8) { fail('next', 'Password must be at least 8 characters.'); valid = false; }
        else if (next === current) { fail('next', 'New password must be different from the current one.'); valid = false; }
        if (!confirm) { fail('confirm', 'Please confirm your new password.'); valid = false; }
        else if (next !== confirm) { fail('confirm', 'New passwords do not match.'); valid = false; }
        if (valid && !passwordSafety.isCopied()) { fail('next', 'Copy your new password first (use COPY NEW PASSWORD) so you can keep it safe. It cannot be recovered if forgotten.'); valid = false; }
        if (!valid) return;

        saveBtn.disabled = true;
        saveBtn.textContent = 'SAVING\u2026';
        const result = await window.OrixaAuth.changePassword(current, next);
        saveBtn.disabled = false;
        saveBtn.textContent = 'SAVE PASSWORD';

        if (result.error) {
            if (result.field === 'current') {
                fail('current', result.error);
            } else {
                msg.textContent = result.error;
                msg.className = 'teacher-form-msg error';
            }
            return;
        }

        form.reset();
        msg.textContent = 'Password changed successfully.';
        msg.className = 'teacher-form-msg success';
    });
}

/* ==========================================================================
   EDIT / DELETE DEPARTMENTS AND HODS
   ========================================================================== */

async function refreshCollegeData() {
    await loadCollegeDataFromSupabase();
    renderCollegeStats();
    renderDepartmentList();
    renderTeacherAndSubjectFilterOptions();
    renderStudentPerformanceTable();
}

// A small confirmation dialog; onConfirm may throw an Error whose message is shown inside the dialog
function showCollegeConfirm({ title, message, confirmLabel, onConfirm }) {
    const existing = document.getElementById('college-confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'college-confirm-modal';
    modal.className = 'orixa-modal-overlay';
    modal.style.zIndex = '1200';
    modal.innerHTML = `
        <div class="orixa-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="college-confirm-title" aria-describedby="college-confirm-msg">
            <div class="orixa-modal-header"><h3 class="orixa-modal-title" id="college-confirm-title">${escapeHtml(title)}</h3></div>
            <div class="orixa-modal-body">
                <p id="college-confirm-msg" style="margin: 0;">${escapeHtml(message)}</p>
                <p id="college-confirm-error" role="alert" style="margin: 8px 0 0; font-weight: 700; color: var(--color-red-dark);"></p>
            </div>
            <div class="orixa-modal-footer">
                <button type="button" class="quiz-mgmt-action-btn" id="college-confirm-cancel" style="background: var(--color-cream);">Cancel</button>
                <button type="button" class="quiz-mgmt-action-btn" id="college-confirm-ok" style="background: var(--color-red);">${escapeHtml(confirmLabel)}</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const okBtn = modal.querySelector('#college-confirm-ok');
    const cancelBtn = modal.querySelector('#college-confirm-cancel');
    const close = () => modal.remove();
    cancelBtn.addEventListener('click', close);
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    okBtn.addEventListener('click', async () => {
        okBtn.disabled = true;
        cancelBtn.disabled = true;
        try {
            await onConfirm();
            close();
        } catch (err) {
            modal.querySelector('#college-confirm-error').textContent = err.message || 'Something went wrong.';
            okBtn.disabled = false;
            cancelBtn.disabled = false;
        }
    });
    cancelBtn.focus();
}

function initDepartmentManagement() {
    const modal = document.getElementById('college-dept-edit-modal');
    const form = document.getElementById('college-dept-edit-form');
    const tableBody = document.getElementById('department-table-body');
    if (!modal || !form || !tableBody) return;

    const f = {
        dept: document.getElementById('college-edit-dept-name'),
        hodName: document.getElementById('college-edit-hod-name'),
        hodId: document.getElementById('college-edit-hod-id'),
        password: document.getElementById('college-edit-hod-password')
    };
    const err = {
        dept: document.getElementById('college-edit-dept-name-error'),
        hodName: document.getElementById('college-edit-hod-name-error'),
        hodId: document.getElementById('college-edit-hod-id-error'),
        password: document.getElementById('college-edit-hod-password-error')
    };
    const msg = document.getElementById('college-dept-edit-msg');
    const saveBtn = document.getElementById('college-dept-edit-save-btn');
    const deleteHodBtn = document.getElementById('college-hod-delete-btn');
    const closeBtn = document.getElementById('close-college-dept-edit-btn');
    const note = document.getElementById('college-edit-hod-note');
    const pwdLabel = document.getElementById('college-edit-hod-password-label');
    let editing = null;
    let opener = null;

    const clearErrors = () => {
        Object.values(f).forEach(el => el.classList.remove('input-invalid'));
        Object.values(err).forEach(el => { el.textContent = ''; });
        msg.textContent = '';
        msg.className = 'teacher-form-msg';
    };
    const fail = (key, text) => { f[key].classList.add('input-invalid'); err[key].textContent = text; };
    const close = () => { modal.style.display = 'none'; editing = null; if (opener && opener.focus) opener.focus(); };

    const open = (dept, trigger) => {
        editing = dept;
        opener = trigger;
        clearErrors();
        f.dept.value = dept.name;
        f.hodName.value = dept.hodId ? dept.hodName : '';
        f.hodId.value = dept.hodId ? dept.hodEmpId : '';
        f.password.value = '';
        deleteHodBtn.style.display = dept.hodId ? '' : 'none';
        note.textContent = dept.hodId
            ? 'Change the HOD\u2019s name or login ID. A new password is only needed if you want to reset it.'
            : 'This department has no HOD yet. Fill in the details below to add one.';
        pwdLabel.textContent = dept.hodId ? 'NEW PASSWORD (OPTIONAL, MIN. 8 CHARACTERS)' : 'PASSWORD (MIN. 8 CHARACTERS)';
        modal.style.display = 'flex';
        f.dept.focus();
    };

    tableBody.addEventListener('click', event => {
        const btn = event.target.closest('[data-dept-action]');
        if (!btn) return;
        const dept = MOCK_COLLEGE_DATA.departments.find(d => String(d.id) === btn.dataset.deptId);
        if (!dept) return;

        if (btn.dataset.deptAction === 'edit') {
            open(dept, btn);
            return;
        }
        showCollegeConfirm({
            title: 'Delete Department',
            message: `Delete "${dept.name}"? This permanently removes the department with its HOD, its ${dept.activeTeachers || 0} teacher(s), its ${dept.totalStudents || 0} student(s), and all of their quizzes and results. This cannot be undone.`,
            confirmLabel: 'Delete Department',
            onConfirm: async () => {
                const { error } = await window.OrixaAuth.client.rpc('fn_admin_delete_department', { p_department_id: dept.id });
                if (error) throw new Error(error.message);
                await refreshCollegeData();
            }
        });
    });

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    deleteHodBtn.addEventListener('click', () => {
        if (!editing || !editing.hodId) return;
        const dept = editing;
        showCollegeConfirm({
            title: 'Delete HOD Account',
            message: `Delete the HOD account of ${dept.hodName} (${dept.hodEmpId})? The department stays and can get a new HOD. This cannot be undone.`,
            confirmLabel: 'Delete HOD',
            onConfirm: async () => {
                const { error } = await window.OrixaAuth.client.rpc('fn_admin_delete_user', { p_user_id: dept.hodId });
                if (error) throw new Error(error.message);
                await refreshCollegeData();
                close();
            }
        });
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!editing) return;
        clearErrors();

        const deptName = f.dept.value.trim();
        const hodName = f.hodName.value.trim();
        const hodId = f.hodId.value.trim();
        const password = f.password.value;
        const hasHod = !!editing.hodId;
        const wantsNewHod = !hasHod && (hodName || hodId || password);

        let valid = true;
        if (!deptName) { fail('dept', 'Department name is required.'); valid = false; }
        if (hasHod || wantsNewHod) {
            if (!hodName) { fail('hodName', 'HOD name is required.'); valid = false; }
            if (!hodId) { fail('hodId', 'HOD login ID is required.'); valid = false; }
            else if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(hodId)) { fail('hodId', 'Use letters, numbers, dots, dashes or underscores (no spaces).'); valid = false; }
        }
        if (wantsNewHod && !password) { fail('password', 'A password is required for a new HOD.'); valid = false; }
        else if (password && password.length < 8) { fail('password', 'Password must be at least 8 characters.'); valid = false; }
        if (!valid) return;

        saveBtn.disabled = true;
        const client = window.OrixaAuth.client;
        try {
            if (deptName !== editing.name) {
                const { error } = await client.from('departments').update({ name: deptName }).eq('id', editing.id);
                if (error) throw new Error(`Department could not be renamed: ${error.message}`);
            }
            if (hasHod && (hodName !== editing.hodName || hodId.toLowerCase() !== String(editing.hodEmpId).toLowerCase() || password)) {
                const { error } = await client.rpc('fn_admin_update_user', {
                    p_user_id: editing.hodId,
                    p_full_name: hodName,
                    p_login_id: hodId,
                    p_password: password || null
                });
                if (error) throw new Error(`HOD could not be updated: ${error.message}`);
            } else if (wantsNewHod) {
                const { error } = await client.rpc('fn_admin_provision_hod', {
                    p_full_name: hodName,
                    p_login_id: hodId,
                    p_password: password,
                    p_department_id: editing.id
                });
                if (error) throw new Error(`HOD could not be created: ${error.message}`);
            }
            await refreshCollegeData();
            msg.textContent = 'Saved.';
            msg.className = 'teacher-form-msg success';
            setTimeout(close, 700);
        } catch (e) {
            msg.textContent = e.message;
            msg.className = 'teacher-form-msg error';
        } finally {
            saveBtn.disabled = false;
        }
    });
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

    const academicYear = await window.OrixaAuth.getCurrentAcademicYear();
    MOCK_COLLEGE_DATA.collegeInfo.academicYear = academicYear ? academicYear.code : '';
    showAcademicYear(MOCK_COLLEGE_DATA.collegeInfo.academicYear);
    initAcademicYearModal();
    initCollegeProfile();

    renderCollegeStats();
    renderDepartmentList();
    renderTeacherAndSubjectFilterOptions();
    renderStudentPerformanceTable();

    initAddDepartmentDrawer();
    initAddDepartmentForm();
    initDepartmentManagement();
    initPerformanceFilters();
});
