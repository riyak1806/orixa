/* ==========================================================================
   ORIXA - HOD DASHBOARD CONTROLLER
   ========================================================================== */

const HOD_MOCK_DATA = {
    deptInfo: {
        id: '',
        name: '',
        hodName: '',
        hodEmpId: '',
        academicYear: ''
    },
    teachers: [],
    students: [],
    performance: []
};

window.HOD_CACHED_DB_ENTITIES = { subjects: [], academic_levels: [], academic_session_id: null };

let currentHodTeacherFilter = 'ALL';
let currentHodSubjectFilter = 'ALL';
let currentHodYearFilter = 'ALL';

/* ==========================================================================
   DOM RENDERING FUNCTIONS
   ========================================================================== */

function renderHodStats() {
    const totalTeachersEl = document.getElementById('stat-total-teachers');
    const totalStudentsEl = document.getElementById('stat-total-students');
    const totalSubjectsEl = document.getElementById('stat-total-subjects');
    const totalAssignmentsEl = document.getElementById('stat-total-assignments');

    if (totalTeachersEl) {
        totalTeachersEl.textContent = HOD_MOCK_DATA.teachers.length;
    }

    if (totalStudentsEl) {
        totalStudentsEl.textContent = HOD_MOCK_DATA.students.length;
    }

    if (totalSubjectsEl) {
        const subjectsSet = new Set();
        HOD_MOCK_DATA.teachers.forEach(t => {
            t.subjects.forEach(sub => subjectsSet.add(sub.trim()));
        });
        HOD_MOCK_DATA.students.forEach(s => {
            if (s.subject) subjectsSet.add(s.subject.trim());
        });
        totalSubjectsEl.textContent = subjectsSet.size;
    }

    if (totalAssignmentsEl) {
        totalAssignmentsEl.textContent = HOD_MOCK_DATA.students.length;
    }
}

function renderTeacherList() {
    const tableBody = document.getElementById('teacher-table-body');
    if (!tableBody) return;

    if (HOD_MOCK_DATA.teachers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="hod-no-results">
                    No teachers added yet. Use the form above to add department teachers.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = HOD_MOCK_DATA.teachers.map(teacher => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(teacher.name)}</td>
            <td class="hod-empid-col"><code class="hod-code-badge">${escapeHtml(teacher.empId)}</code></td>
            <td>
                ${teacher.subjects.map(s => `<span class="hod-badge hod-badge-green" style="margin: 2px;">${escapeHtml(s.trim())}</span>`).join('')}
            </td>
            <td>
                ${teacher.years.map(y => `<span class="hod-badge hod-badge-yellow" style="margin: 2px;">${escapeHtml(y.trim())}</span>`).join('')}
            </td>
            <td class="hod-actions-col">${renderUserActionButtons('teacher', teacher.id, teacher.name)}</td>
        </tr>
    `).join('');
}

function renderStudentList() {
    const tableBody = document.getElementById('student-table-body');
    if (!tableBody) return;

    if (HOD_MOCK_DATA.students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="hod-no-results">
                    No students added or assigned yet. Use the form above to add student data.
                </td>
            </tr>
        `;
        return;
    }

    // In login-ID order, with numbers compared as numbers (stu-2 comes before stu-10)
    const studentsInOrder = [...HOD_MOCK_DATA.students].sort((a, b) =>
        String(a.studentId).localeCompare(String(b.studentId), undefined, { numeric: true, sensitivity: 'base' }));

    tableBody.innerHTML = studentsInOrder.map(student => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(student.name)}</td>
            <td style="white-space: nowrap;"><code class="hod-code-badge">${escapeHtml(student.studentId)}</code></td>
            <td><span class="hod-badge hod-badge-yellow">${escapeHtml(student.year)}</span></td>
            <td><span class="hod-badge hod-badge-green">${escapeHtml(student.subject)}</span></td>
            <td><span class="hod-badge hod-badge-purple">${escapeHtml(student.teacher)}</span></td>
            <td class="hod-actions-col">${renderUserActionButtons('student', student.id, student.name)}</td>
        </tr>
    `).join('');
}

function updateStudentFormDropdowns() {
    const subjectSelect = document.getElementById('student-subject');
    const teacherSelect = document.getElementById('student-teacher');
    const yearSelect = document.getElementById('student-year');

    if (!subjectSelect || !teacherSelect) return;

    const currentYear = yearSelect ? yearSelect.value : '';

    // Extract subjects
    const subjectsSet = new Set();
    HOD_MOCK_DATA.teachers.forEach(t => {
        if (!currentYear || t.years.includes(currentYear) || t.years.some(y => y.toLowerCase() === currentYear.toLowerCase())) {
            t.subjects.forEach(s => subjectsSet.add(s.trim()));
        } else if (!currentYear) {
            t.subjects.forEach(s => subjectsSet.add(s.trim()));
        }
    });

    // Also include existing default subjects if set empty
    if (subjectsSet.size === 0) {
        HOD_MOCK_DATA.teachers.forEach(t => {
            (t.subjects || []).forEach(s => subjectsSet.add(s.trim()));
        });
    }

    if (subjectsSet.size === 0) {
        ['Computer Science & Programming', 'Data Structures & Algorithms', 'Database Management', 'Computer Networks'].forEach(s => subjectsSet.add(s));
    }

    const selectedSubject = subjectSelect.value;
    subjectSelect.innerHTML = `<option value="">-- Select Subject --</option>` +
        Array.from(subjectsSet).map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    if (subjectsSet.has(selectedSubject)) {
        subjectSelect.value = selectedSubject;
    }

    updateTeacherDropdownOptions();
}

function updateTeacherDropdownOptions() {
    const subjectSelect = document.getElementById('student-subject');
    const teacherSelect = document.getElementById('student-teacher');
    const yearSelect = document.getElementById('student-year');

    if (!teacherSelect) return;

    const selectedYear = yearSelect ? yearSelect.value : '';
    const selectedSubject = subjectSelect ? subjectSelect.value : '';

    let matchingTeachers = HOD_MOCK_DATA.teachers;

    if (selectedSubject) {
        matchingTeachers = matchingTeachers.filter(t =>
            t.subjects.some(sub => sub.trim().toLowerCase() === selectedSubject.trim().toLowerCase())
        );
    }

    if (selectedYear) {
        const yearFiltered = matchingTeachers.filter(t =>
            t.years.some(y => y.trim().toLowerCase() === selectedYear.trim().toLowerCase())
        );
        if (yearFiltered.length > 0) {
            matchingTeachers = yearFiltered;
        }
    }

    // If no specific match found, fallback to all teachers so user can complete assignment
    if (matchingTeachers.length === 0) {
        matchingTeachers = HOD_MOCK_DATA.teachers;
    }

    const currentTeacherVal = teacherSelect.value;
    teacherSelect.innerHTML = `<option value="">-- Select Teacher --</option>` +
        matchingTeachers.map(t => `<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)} (${escapeHtml(t.empId)})</option>`).join('');

    if (matchingTeachers.some(t => t.name === currentTeacherVal)) {
        teacherSelect.value = currentTeacherVal;
    }
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
   FORM HANDLING & VALIDATION
   ========================================================================== */

function initAddTeacherForm() {
    const form = document.getElementById('add-teacher-form');
    const nameInput = document.getElementById('teacher-name');
    const empIdInput = document.getElementById('teacher-empid');
    const subjectsInput = document.getElementById('teacher-subjects');
    const yearsInput = document.getElementById('teacher-years');
    const passwordInput = document.getElementById('teacher-password');
    const toggleBtn = document.getElementById('teacher-password-toggle');
    const eyeOpen = document.getElementById('teacher-eye-open');
    const eyeClosed = document.getElementById('teacher-eye-closed');
    const formMsg = document.getElementById('teacher-form-msg');

    if (!form) return;

    // The year checkboxes feed the hidden #teacher-years field as "1st Year, 2nd Year"
    const yearOptions = form.querySelectorAll('input[name="teacher_year_option"]');
    const syncYears = () => {
        yearsInput.value = Array.from(yearOptions).filter(o => o.checked).map(o => o.value).join(', ');
        setFieldValid(yearsInput);
    };
    yearOptions.forEach(o => o.addEventListener('change', syncYears));
    form.addEventListener('reset', () => { yearsInput.value = ''; });

    if (toggleBtn && passwordInput && eyeOpen && eyeClosed) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            eyeOpen.classList.toggle('hidden', isPassword);
            eyeClosed.classList.toggle('hidden', !isPassword);
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const empId = empIdInput.value.trim();
        const subjectsRaw = subjectsInput.value.trim();
        const yearsRaw = yearsInput.value.trim();
        const password = passwordInput ? passwordInput.value.trim() : '';

        let isValid = true;

        if (!name) {
            setFieldInvalid(nameInput, 'Teacher name is required.');
            isValid = false;
        } else {
            setFieldValid(nameInput);
        }

        if (!empId) {
            setFieldInvalid(empIdInput, 'Employee ID is required.');
            isValid = false;
        } else {
            setFieldValid(empIdInput);
        }

        if (!subjectsRaw) {
            setFieldInvalid(subjectsInput, 'At least one subject is required.');
            isValid = false;
        } else {
            setFieldValid(subjectsInput);
        }

        if (!yearsRaw) {
            setFieldInvalid(yearsInput, 'Select at least one class / year.');
            isValid = false;
        } else {
            setFieldValid(yearsInput);
        }

        if (password && password.length < 8) {
            if (passwordInput) setFieldInvalid(passwordInput, 'Password must be at least 8 characters.');
            isValid = false;
        } else if (passwordInput) {
            setFieldValid(passwordInput);
        }

        if (!isValid) return;

        const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(Boolean);
        const years = yearsRaw.split(',').map(y => y.trim()).filter(Boolean);

        // Disable submit button while saving
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SAVING…'; }

        const result = await saveTeacherToSupabase(name, empId, subjects, years, password);

        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'ADD TEACHER'; }

        if (!result.success) {
            if (formMsg) {
                formMsg.textContent = `Error: ${result.error}`;
                formMsg.className = 'teacher-form-msg error';
            }
            return;
        }

        // Store subjects/years in local state for student assignment UI
        recordTeacherAssignment({ id: result.userId, name, empId, subjects, years });

        form.reset();
        [nameInput, empIdInput, subjectsInput, yearsInput].forEach(setFieldValid);
        if (passwordInput) setFieldValid(passwordInput);

        if (formMsg) {
            formMsg.textContent = `Teacher "${name}" added successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
                const drawer = document.getElementById('add-teacher-drawer');
                if (drawer) drawer.style.display = 'none';
            }, 1200);
        } else {
            const drawer = document.getElementById('add-teacher-drawer');
            if (drawer) drawer.style.display = 'none';
        }

        renderHodStats();
        renderTeacherList();
        updateStudentFormDropdowns();
    });

    [nameInput, empIdInput, subjectsInput, yearsInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => setFieldValid(input));
        }
    });
    if (passwordInput) {
        passwordInput.addEventListener('input', () => setFieldValid(passwordInput));
    }
}

function initAddStudentForm() {
    const form = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const idInput = document.getElementById('student-id');
    const yearSelect = document.getElementById('student-year');
    const subjectSelect = document.getElementById('student-subject');
    const teacherSelect = document.getElementById('student-teacher');
    const passwordInput = document.getElementById('student-password');
    const toggleBtn = document.getElementById('student-password-toggle');
    const eyeOpen = document.getElementById('student-eye-open');
    const eyeClosed = document.getElementById('student-eye-closed');
    const formMsg = document.getElementById('student-form-msg');

    if (!form) return;

    if (toggleBtn && passwordInput && eyeOpen && eyeClosed) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            eyeOpen.classList.toggle('hidden', isPassword);
            eyeClosed.classList.toggle('hidden', !isPassword);
        });
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            setFieldValid(yearSelect);
            updateStudentFormDropdowns();
        });
    }

    if (subjectSelect) {
        subjectSelect.addEventListener('change', () => {
            setFieldValid(subjectSelect);
            updateTeacherDropdownOptions();
        });
    }

    if (teacherSelect) {
        teacherSelect.addEventListener('change', () => {
            setFieldValid(teacherSelect);
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const studentId = idInput.value.trim();
        const year = yearSelect.value;
        const subject = subjectSelect.value;
        const teacher = teacherSelect.value;
        const password = passwordInput ? passwordInput.value.trim() : '';

        let isValid = true;

        if (!name) {
            setFieldInvalid(nameInput, 'Student name is required.');
            isValid = false;
        } else {
            setFieldValid(nameInput);
        }

        if (!studentId) {
            setFieldInvalid(idInput, 'Student ID is required.');
            isValid = false;
        } else {
            setFieldValid(idInput);
        }

        if (!year) {
            setFieldInvalid(yearSelect, 'Please select a Year / Class.');
            isValid = false;
        } else {
            setFieldValid(yearSelect);
        }

        if (!subject) {
            setFieldInvalid(subjectSelect, 'Please select a Subject.');
            isValid = false;
        } else {
            setFieldValid(subjectSelect);
        }

        if (!teacher) {
            setFieldInvalid(teacherSelect, 'Please select an Assigned Teacher.');
            isValid = false;
        } else {
            setFieldValid(teacherSelect);
        }

        if (password && password.length < 8) {
            if (passwordInput) setFieldInvalid(passwordInput, 'Password must be at least 8 characters.');
            isValid = false;
        } else if (passwordInput) {
            setFieldValid(passwordInput);
        }

        if (!isValid) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SAVING…'; }

        // Map year label to academic_level code
        const yearCodeMap = { '1st Year': 'FE', '2nd Year': 'SE', '3rd Year': 'TE', '4th Year': 'BE' };
        const levelCode = yearCodeMap[year] || year;
        const result = await saveStudentToSupabase(name, studentId, levelCode, subject, teacher, year, password);

        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'ADD STUDENT'; }

        if (!result.success) {
            if (formMsg) {
                formMsg.textContent = `Error: ${result.error}`;
                formMsg.className = 'teacher-form-msg error';
            }
            return;
        }

        recordStudentAssignment({ id: result.userId, name, studentId, year, subject, teacher });

        form.reset();
        [nameInput, idInput, yearSelect, subjectSelect, teacherSelect].forEach(setFieldValid);
        if (passwordInput) setFieldValid(passwordInput);

        if (formMsg) {
            formMsg.textContent = `Student "${name}" assigned to ${teacher} for ${subject} (${year}) successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
                const drawer = document.getElementById('add-student-drawer');
                if (drawer) drawer.style.display = 'none';
            }, 1200);
        } else {
            const drawer = document.getElementById('add-student-drawer');
            if (drawer) drawer.style.display = 'none';
        }

        renderHodStats();
        renderStudentList();
        updateStudentFormDropdowns();
    });

    [nameInput, idInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => setFieldValid(input));
        }
    });
    if (passwordInput) {
        passwordInput.addEventListener('input', () => setFieldValid(passwordInput));
    }
}

function initDrawerToggles() {
    const toggleTeacherBtn = document.getElementById('toggle-add-teacher-btn');
    const teacherDrawer = document.getElementById('add-teacher-drawer');
    const closeTeacherBtn = document.getElementById('close-add-teacher-btn');

    const toggleStudentBtn = document.getElementById('toggle-add-student-btn');
    const studentDrawer = document.getElementById('add-student-drawer');
    const closeStudentBtn = document.getElementById('close-add-student-btn');

    if (toggleTeacherBtn && teacherDrawer) {
        toggleTeacherBtn.addEventListener('click', () => {
            teacherDrawer.style.display = 'flex';
        });
    }

    if (closeTeacherBtn && teacherDrawer) {
        closeTeacherBtn.addEventListener('click', () => {
            teacherDrawer.style.display = 'none';
        });
    }

    if (teacherDrawer) {
        teacherDrawer.addEventListener('click', (e) => {
            if (e.target === teacherDrawer) {
                teacherDrawer.style.display = 'none';
            }
        });
    }

    if (toggleStudentBtn && studentDrawer) {
        toggleStudentBtn.addEventListener('click', () => {
            studentDrawer.style.display = 'flex';
        });
    }

    if (closeStudentBtn && studentDrawer) {
        closeStudentBtn.addEventListener('click', () => {
            studentDrawer.style.display = 'none';
        });
    }

    if (studentDrawer) {
        studentDrawer.addEventListener('click', (e) => {
            if (e.target === studentDrawer) {
                studentDrawer.style.display = 'none';
            }
        });
    }
}

function setFieldInvalid(input, msg) {
    if (!input) return;
    input.classList.add('input-invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) errEl.textContent = msg;
}

function setFieldValid(input) {
    if (!input) return;
    input.classList.remove('input-invalid');
    const errEl = document.getElementById(`${input.id}-error`);
    if (errEl) errEl.textContent = '';
}

/* ==========================================================================
   USER MANAGEMENT - edit and delete teachers and students
   ========================================================================== */

const PENCIL_ICON = '<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>';
const TRASH_ICON = '<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>';
const CLOSE_ICON = '<svg class="monotone-icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';

function renderUserActionButtons(kind, id, name) {
    const who = escapeHtml(name);
    return `<span class="hod-row-actions">
        <button type="button" class="hod-icon-btn" data-user-action="edit" data-user-kind="${kind}" data-user-id="${escapeHtml(id)}" aria-label="Edit ${who}" title="Edit">${PENCIL_ICON}</button>
        <button type="button" class="hod-icon-btn is-danger" data-user-action="delete" data-user-kind="${kind}" data-user-id="${escapeHtml(id)}" aria-label="Delete ${who}" title="Delete">${TRASH_ICON}</button>
    </span>`;
}

function openHodDialog(title, bodyHtml) {
    closeHodDialog();
    const overlay = document.createElement('div');
    overlay.id = 'hod-user-dialog';
    overlay.className = 'orixa-modal-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="orixa-modal-card hod-modal-card" role="dialog" aria-modal="true" aria-labelledby="hod-user-dialog-title" style="width: min(100%, 560px);">
            <header class="orixa-modal-header" style="background: var(--color-yellow);">
                <h3 class="orixa-modal-title" id="hod-user-dialog-title" style="color: var(--border-dark);">${escapeHtml(title)}</h3>
                <button type="button" class="sidebar-toggle-btn" data-dialog-close aria-label="Close modal" style="width: 32px; height: 32px;">${CLOSE_ICON}</button>
            </header>
            <div class="orixa-modal-body" style="padding: var(--t-space-3);">${bodyHtml}</div>
        </div>`;
    overlay.addEventListener('click', e => {
        if (e.target === overlay || e.target.closest('[data-dialog-close]')) closeHodDialog();
    });
    document.body.appendChild(overlay);
    const first = overlay.querySelector('input, select, button:not([data-dialog-close])');
    if (first) first.focus();
    return overlay;
}

function closeHodDialog() {
    const existing = document.getElementById('hod-user-dialog');
    if (existing) existing.remove();
}

function hodFormField(id, label, { type = 'text', value = '', placeholder = '', autocomplete = 'off', help = '' } = {}) {
    return `
        <div class="form-field">
            <label for="${id}" class="field-label"><span>${label}</span></label>
            <div class="input-shell">
                <input type="${type}" id="${id}" class="cartoon-input" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="${autocomplete}">
            </div>
            ${help ? `<span style="font-family: var(--font-body); font-size: 0.82rem; color: #546e7a;">${escapeHtml(help)}</span>` : ''}
            <span class="field-error" id="${id}-error"></span>
        </div>`;
}

function setDialogMessage(id, text, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = kind ? `teacher-form-msg ${kind}` : 'teacher-form-msg';
}

async function refreshHodAfterUserChange() {
    hodReferenceDataPromise = null;   // teacher and subject lookups changed
    await loadHodDataFromSupabase();
    renderHodStats();
    renderTeacherList();
    renderStudentList();
    updateStudentFormDropdowns();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();
}

// Shared validation for the name / ID / optional password fields of both edit dialogs
function readUserDetailFields(prefix) {
    const name = document.getElementById(`${prefix}-name`);
    const id = document.getElementById(`${prefix}-id`);
    const password = document.getElementById(`${prefix}-password`);
    let valid = true;

    [name, id, password].forEach(setFieldValid);
    if (!name.value.trim()) { setFieldInvalid(name, 'Name is required.'); valid = false; }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id.value.trim())) {
        setFieldInvalid(id, 'Use letters, numbers, dots, dashes or underscores (no spaces).');
        valid = false;
    }
    if (password.value && password.value.length < 8) {
        setFieldInvalid(password, 'Password must be at least 8 characters.');
        valid = false;
    }
    return valid ? { name: name.value.trim(), loginId: id.value.trim(), password: password.value } : null;
}

async function saveUserDetails(userId, details) {
    return window.OrixaAuth.client.rpc('fn_admin_update_user', {
        p_user_id: userId,
        p_full_name: details.name,
        p_login_id: details.loginId,
        p_password: details.password || null
    });
}

/* ---------------- teachers ---------------- */

async function openEditTeacherDialog(teacherId) {
    const teacher = HOD_MOCK_DATA.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const profile = await window.OrixaAuth.getCurrentProfile();
    const ref = await getHodReferenceData(profile.department_id, profile.college_id);

    const dialog = openHodDialog('Edit Faculty Member', `
        <form id="edit-teacher-form" class="teacher-form" novalidate style="gap: var(--t-space-2);">
            ${hodFormField('edit-teacher-name', 'FACULTY NAME', { value: teacher.name })}
            ${hodFormField('edit-teacher-id', 'EMPLOYEE ID', { value: teacher.empId, help: 'This is also the ID the teacher logs in with.' })}
            ${hodFormField('edit-teacher-password', 'NEW PASSWORD (OPTIONAL)', { type: 'password', autocomplete: 'new-password', placeholder: 'Blank keeps the current one' })}
            <p class="teacher-form-msg" id="edit-teacher-msg" role="status" aria-live="polite"></p>
            <button type="submit" class="cartoon-action-btn primary-yellow-btn" id="edit-teacher-save" style="padding: 10px 24px; font-size: 0.95rem;">SAVE DETAILS</button>
        </form>
        <section aria-labelledby="edit-teacher-assign-title" style="border-top: 2px dashed rgba(26,26,36,0.15); margin-top: var(--t-space-3); padding-top: var(--t-space-2); display: flex; flex-direction: column; gap: 10px;">
            <h4 id="edit-teacher-assign-title" style="margin: 0; font-family: var(--font-header); font-size: 1.05rem; color: var(--border-dark);">Subjects &amp; Years Taught</h4>
            <div id="edit-teacher-assignments" role="list" style="display: flex; flex-direction: column; gap: 8px;"></div>
            <div class="form-field">
                <label for="edit-teacher-new-subject" class="field-label"><span>ADD A SUBJECT</span></label>
                <div class="input-shell"><input type="text" id="edit-teacher-new-subject" class="cartoon-input" placeholder="e.g. Data Structures" autocomplete="off"></div>
            </div>
            <div class="form-field">
                <label for="edit-teacher-new-year" class="field-label"><span>FOR YEAR</span></label>
                <div class="input-shell">
                    <select id="edit-teacher-new-year" class="cartoon-select">
                        ${ref.levels.map(l => `<option value="${escapeHtml(l.display_name)}">${escapeHtml(l.display_name)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <p class="teacher-form-msg" id="edit-teacher-assign-msg" role="status" aria-live="polite"></p>
            <button type="button" class="cartoon-action-btn" id="edit-teacher-add-assignment" style="padding: 10px 24px; font-size: 0.95rem;">ADD SUBJECT &amp; YEAR</button>
        </section>`);

    const renderAssignments = async () => {
        const holder = document.getElementById('edit-teacher-assignments');
        if (!holder) return;
        const { data, error } = await window.OrixaAuth.client
            .from('teacher_subject_class_assignments')
            .select('id, subjects!teacher_subject_class_assignments_subject_id_fkey(name), academic_levels!teacher_subject_class_assignments_academic_level_id_fkey(display_name)')
            .eq('teacher_id', teacherId)
            .eq('is_active', true);
        if (error) {
            holder.innerHTML = `<p style="margin: 0; color: var(--color-red-dark);">Could not load assignments: ${escapeHtml(error.message)}</p>`;
            return;
        }
        holder.innerHTML = (data && data.length > 0)
            ? data.map(a => `
                <div class="hod-assignment-row" role="listitem">
                    <span style="font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHtml(a.subjects ? a.subjects.name : '-')} &middot; ${escapeHtml(a.academic_levels ? a.academic_levels.display_name : '-')}</span>
                    <button type="button" class="hod-icon-btn is-danger" data-remove-assignment="${escapeHtml(a.id)}" aria-label="Remove ${escapeHtml(a.subjects ? a.subjects.name : 'subject')} for ${escapeHtml(a.academic_levels ? a.academic_levels.display_name : 'year')}" title="Remove">${TRASH_ICON}</button>
                </div>`).join('')
            : '<p style="margin: 0; font-family: var(--font-body); font-size: 0.9rem; color: #546e7a;">No subjects assigned yet.</p>';
    };
    await renderAssignments();

    dialog.querySelector('#edit-teacher-form').addEventListener('submit', async event => {
        event.preventDefault();
        const details = readUserDetailFields('edit-teacher');
        if (!details) return;

        const saveBtn = document.getElementById('edit-teacher-save');
        saveBtn.disabled = true; saveBtn.textContent = 'SAVING\u2026';
        const { error } = await saveUserDetails(teacherId, details);
        saveBtn.disabled = false; saveBtn.textContent = 'SAVE DETAILS';

        if (error) {
            console.error('Update teacher error:', error);
            setDialogMessage('edit-teacher-msg', `Error: ${error.message}`, 'error');
            return;
        }
        document.getElementById('edit-teacher-password').value = '';
        setDialogMessage('edit-teacher-msg', 'Details saved.', 'success');
        await refreshHodAfterUserChange();
    });

    dialog.querySelector('#edit-teacher-assignments').addEventListener('click', async event => {
        const btn = event.target.closest('[data-remove-assignment]');
        if (!btn) return;
        if (!window.confirm('Remove this subject and year? Students assigned to this teacher for it, and quizzes the teacher made for it, are removed too.')) return;

        const { error } = await window.OrixaAuth.client
            .from('teacher_subject_class_assignments').delete().eq('id', btn.dataset.removeAssignment);
        if (error) {
            console.error('Remove assignment error:', error);
            setDialogMessage('edit-teacher-assign-msg', `Error: ${error.message}`, 'error');
            return;
        }
        setDialogMessage('edit-teacher-assign-msg', 'Removed.', 'success');
        await renderAssignments();
        await refreshHodAfterUserChange();
    });

    dialog.querySelector('#edit-teacher-add-assignment').addEventListener('click', async () => {
        const subjectInput = document.getElementById('edit-teacher-new-subject');
        const yearName = document.getElementById('edit-teacher-new-year').value;
        const subjectName = subjectInput.value.trim();
        if (!subjectName) { setDialogMessage('edit-teacher-assign-msg', 'Enter a subject to add.', 'error'); return; }

        const freshRef = await getHodReferenceData(profile.department_id, profile.college_id);
        const level = findAcademicLevel(freshRef.levels, yearName);
        if (!level || !freshRef.sessionId) {
            setDialogMessage('edit-teacher-assign-msg', 'The year or the current academic year is not set up for your college.', 'error');
            return;
        }

        try {
            const subject = await ensureDepartmentSubject(freshRef, profile.department_id, subjectName);
            const { error } = await window.OrixaAuth.client.from('teacher_subject_class_assignments').insert({
                teacher_id: teacherId,
                college_id: profile.college_id,
                department_id: profile.department_id,
                subject_id: subject.id,
                academic_level_id: level.id,
                academic_session_id: freshRef.sessionId
            });
            if (error) {
                setDialogMessage('edit-teacher-assign-msg',
                    error.code === '23505' ? 'This teacher already teaches that subject for that year.' : `Error: ${error.message}`, 'error');
                return;
            }
        } catch (err) {
            setDialogMessage('edit-teacher-assign-msg', `Error: ${err.message}`, 'error');
            return;
        }
        subjectInput.value = '';
        setDialogMessage('edit-teacher-assign-msg', 'Added.', 'success');
        await renderAssignments();
        await refreshHodAfterUserChange();
    });
}

/* ---------------- students ---------------- */

async function openEditStudentDialog(studentId) {
    const student = HOD_MOCK_DATA.students.find(st => st.id === studentId);
    if (!student) return;

    const profile = await window.OrixaAuth.getCurrentProfile();
    const ref = await getHodReferenceData(profile.department_id, profile.college_id);
    let currentLevel = findAcademicLevel(ref.levels, student.year);

    const dialog = openHodDialog('Edit Student', `
        <form id="edit-student-form" class="teacher-form" novalidate style="gap: var(--t-space-2);">
            ${hodFormField('edit-student-name', 'STUDENT NAME', { value: student.name })}
            ${hodFormField('edit-student-id', 'STUDENT ID', { value: student.studentId, help: 'This is also the ID the student logs in with.' })}
            <div class="form-field">
                <label for="edit-student-year" class="field-label"><span>YEAR / CLASS</span></label>
                <div class="input-shell">
                    <select id="edit-student-year" class="cartoon-select">
                        ${ref.levels.map(l => `<option value="${escapeHtml(l.id)}" ${currentLevel && currentLevel.id === l.id ? 'selected' : ''}>${escapeHtml(l.display_name)}</option>`).join('')}
                    </select>
                </div>
                <span style="font-family: var(--font-body); font-size: 0.82rem; color: #546e7a;">Changing the year removes the student's current subjects, because they belong to the old year.</span>
            </div>
            ${hodFormField('edit-student-password', 'NEW PASSWORD (OPTIONAL)', { type: 'password', autocomplete: 'new-password', placeholder: 'Blank keeps the current one' })}
            <p class="teacher-form-msg" id="edit-student-msg" role="status" aria-live="polite"></p>
            <button type="submit" class="cartoon-action-btn primary-yellow-btn" id="edit-student-save" style="padding: 10px 24px; font-size: 0.95rem;">SAVE DETAILS</button>
        </form>
        <section aria-labelledby="edit-student-assign-title" style="border-top: 2px dashed rgba(26,26,36,0.15); margin-top: var(--t-space-3); padding-top: var(--t-space-2); display: flex; flex-direction: column; gap: 10px;">
            <h4 id="edit-student-assign-title" style="margin: 0; font-family: var(--font-header); font-size: 1.05rem; color: var(--border-dark);">Subjects &amp; Teachers</h4>
            <div id="edit-student-assignments" role="list" style="display: flex; flex-direction: column; gap: 8px;"></div>
            <p class="teacher-form-msg" id="edit-student-assign-msg" role="status" aria-live="polite"></p>
            <div class="form-field">
                <label for="edit-student-new-subject" class="field-label"><span>ADD A SUBJECT</span></label>
                <div class="input-shell"><select id="edit-student-new-subject" class="cartoon-select"></select></div>
            </div>
            <div class="form-field">
                <label for="edit-student-new-teacher" class="field-label"><span>TEACHER</span></label>
                <div class="input-shell"><select id="edit-student-new-teacher" class="cartoon-select"></select></div>
            </div>
            <p id="edit-student-add-hint" style="margin: 0; font-family: var(--font-body); font-size: 0.82rem; color: #546e7a;"></p>
            <button type="button" class="cartoon-action-btn" id="edit-student-add-assignment" style="padding: 10px 24px; font-size: 0.95rem;">ADD SUBJECT &amp; TEACHER</button>
        </section>`);

    // Subjects this student's year can take: the department's teachers who teach that year
    let teacherOptions = [];
    let assignedSubjectIds = new Set();

    const loadTeacherOptions = async () => {
        if (!currentLevel) { teacherOptions = []; return; }
        const { data, error } = await window.OrixaAuth.client
            .from('teacher_subject_class_assignments')
            .select('id, teacher_id, subject_id, academic_session_id, subjects!teacher_subject_class_assignments_subject_id_fkey(name), profiles!teacher_subject_class_assignments_teacher_id_fkey(full_name)')
            .eq('department_id', profile.department_id)
            .eq('academic_level_id', currentLevel.id)
            .eq('is_active', true);
        if (error) console.error('Error loading teachers for the student:', error);
        teacherOptions = (data || []).map(a => ({
            assignmentId: a.id,
            teacherId: a.teacher_id,
            teacherName: a.profiles ? a.profiles.full_name : '-',
            subjectId: a.subject_id,
            subjectName: a.subjects ? a.subjects.name : '-',
            sessionId: a.academic_session_id
        }));
    };

    const subjectSelect = dialog.querySelector('#edit-student-new-subject');
    const teacherSelect = dialog.querySelector('#edit-student-new-teacher');
    const addBtn = dialog.querySelector('#edit-student-add-assignment');
    const addHint = dialog.querySelector('#edit-student-add-hint');

    const renderTeacherChoices = () => {
        const choices = teacherOptions.filter(o => o.subjectId === subjectSelect.value);
        teacherSelect.innerHTML = choices.map(o =>
            `<option value="${escapeHtml(o.assignmentId)}">${escapeHtml(o.teacherName)}</option>`).join('');
    };

    const renderAssignOptions = () => {
        const seen = new Set();
        const available = teacherOptions.filter(o => {
            if (assignedSubjectIds.has(o.subjectId) || seen.has(o.subjectId)) return false;
            seen.add(o.subjectId);
            return true;
        });
        subjectSelect.innerHTML = available.map(o =>
            `<option value="${escapeHtml(o.subjectId)}">${escapeHtml(o.subjectName)}</option>`).join('');
        renderTeacherChoices();

        const none = available.length === 0;
        subjectSelect.disabled = teacherSelect.disabled = addBtn.disabled = none;
        addHint.textContent = !currentLevel
            ? 'This student has no year set, so subjects cannot be added.'
            : none ? 'No more subjects to add. Subjects appear here once a teacher is assigned to teach them for this year.' : '';
    };
    subjectSelect.addEventListener('change', renderTeacherChoices);

    const renderAssignments = async () => {
        const holder = document.getElementById('edit-student-assignments');
        if (!holder) return;
        const { data, error } = await window.OrixaAuth.client
            .from('student_subject_assignments')
            .select('id, subject_id, subjects(name), profiles!student_subject_assignments_teacher_id_fkey(full_name)')
            .eq('student_id', studentId)
            .eq('is_active', true);
        if (error) {
            holder.innerHTML = `<p style="margin: 0; color: var(--color-red-dark);">Could not load subjects: ${escapeHtml(error.message)}</p>`;
            return;
        }
        holder.innerHTML = (data && data.length > 0)
            ? data.map(a => `
                <div class="hod-assignment-row" role="listitem">
                    <span style="font-family: var(--font-header); font-weight: 700; color: var(--border-dark);">${escapeHtml(a.subjects ? a.subjects.name : '-')} &middot; ${escapeHtml(a.profiles ? a.profiles.full_name : '-')}</span>
                    <button type="button" class="hod-icon-btn is-danger" data-remove-assignment="${escapeHtml(a.id)}" aria-label="Remove ${escapeHtml(a.subjects ? a.subjects.name : 'subject')}" title="Remove">${TRASH_ICON}</button>
                </div>`).join('')
            : '<p style="margin: 0; font-family: var(--font-body); font-size: 0.9rem; color: #546e7a;">No subjects assigned yet.</p>';
        assignedSubjectIds = new Set((data || []).map(a => a.subject_id));
        renderAssignOptions();
    };
    await loadTeacherOptions();
    await renderAssignments();

    addBtn.addEventListener('click', async () => {
        const option = teacherOptions.find(o => o.assignmentId === teacherSelect.value && o.subjectId === subjectSelect.value);
        if (!option) { setDialogMessage('edit-student-assign-msg', 'Choose a subject and a teacher.', 'error'); return; }

        addBtn.disabled = true;
        const { error } = await window.OrixaAuth.client.from('student_subject_assignments').insert({
            student_id: studentId,
            college_id: profile.college_id,
            subject_id: option.subjectId,
            academic_level_id: currentLevel.id,
            academic_session_id: option.sessionId,
            teacher_id: option.teacherId,
            teacher_assignment_id: option.assignmentId
        });
        addBtn.disabled = false;

        if (error) {
            console.error('Add student subject error:', error);
            setDialogMessage('edit-student-assign-msg',
                error.code === '23505' ? 'This student already has that subject.' : `Error: ${error.message}`, 'error');
            return;
        }
        setDialogMessage('edit-student-assign-msg', `Added ${option.subjectName} with ${option.teacherName}.`, 'success');
        await renderAssignments();
        await refreshHodAfterUserChange();
    });

    dialog.querySelector('#edit-student-form').addEventListener('submit', async event => {
        event.preventDefault();
        const details = readUserDetailFields('edit-student');
        if (!details) return;

        const newLevelId = document.getElementById('edit-student-year').value;
        const yearChanged = !!currentLevel && newLevelId !== currentLevel.id;
        if (yearChanged && !window.confirm('Changing the year removes this student\'s current subjects. Continue?')) return;

        const saveBtn = document.getElementById('edit-student-save');
        saveBtn.disabled = true; saveBtn.textContent = 'SAVING\u2026';
        const { error } = await saveUserDetails(studentId, details);
        let yearError = null;
        if (!error && yearChanged) {
            const removal = await window.OrixaAuth.client.from('student_subject_assignments').delete().eq('student_id', studentId);
            const update = removal.error ? removal : await window.OrixaAuth.client
                .from('student_profiles').update({ academic_level_id: newLevelId }).eq('profile_id', studentId);
            yearError = update.error;
        }
        saveBtn.disabled = false; saveBtn.textContent = 'SAVE DETAILS';

        if (error || yearError) {
            const failure = error || yearError;
            console.error('Update student error:', failure);
            setDialogMessage('edit-student-msg', `Error: ${failure.message}`, 'error');
            return;
        }
        document.getElementById('edit-student-password').value = '';
        setDialogMessage('edit-student-msg', 'Details saved.', 'success');
        if (yearChanged) {
            currentLevel = ref.levels.find(l => l.id === newLevelId) || currentLevel;
            await loadTeacherOptions();   // the subjects on offer belong to the new year
        }
        await renderAssignments();
        await refreshHodAfterUserChange();
    });

    dialog.querySelector('#edit-student-assignments').addEventListener('click', async event => {
        const btn = event.target.closest('[data-remove-assignment]');
        if (!btn) return;
        if (!window.confirm('Remove this subject from the student?')) return;

        const { error } = await window.OrixaAuth.client
            .from('student_subject_assignments').delete().eq('id', btn.dataset.removeAssignment);
        if (error) {
            console.error('Remove student subject error:', error);
            setDialogMessage('edit-student-assign-msg', `Error: ${error.message}`, 'error');
            return;
        }
        setDialogMessage('edit-student-assign-msg', 'Removed.', 'success');
        await renderAssignments();
        await refreshHodAfterUserChange();
    });
}

/* ---------------- delete ---------------- */

function openDeleteUserDialog(kind, userId) {
    const person = (kind === 'teacher' ? HOD_MOCK_DATA.teachers : HOD_MOCK_DATA.students).find(x => x.id === userId);
    if (!person) return;

    const consequence = kind === 'teacher'
        ? 'Their login, their subject and year assignments, the quizzes they created and the students\' results on those quizzes will be deleted.'
        : 'Their login, their subjects and all of their quiz results will be deleted.';

    const dialog = openHodDialog(kind === 'teacher' ? 'Delete Faculty Member' : 'Delete Student', `
        <p style="margin: 0 0 8px 0; font-family: var(--font-body); font-size: 1.05rem; font-weight: 700; color: var(--border-dark);">Delete ${escapeHtml(person.name)} (${escapeHtml(kind === 'teacher' ? person.empId : person.studentId)})?</p>
        <p style="margin: 0 0 var(--t-space-2) 0; font-family: var(--font-body); font-size: 0.92rem; color: #546e7a;">${escapeHtml(consequence)} This cannot be undone.</p>
        <p class="teacher-form-msg" id="delete-user-msg" role="alert"></p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" class="quiz-mgmt-action-btn" data-dialog-close style="background: var(--color-cream); height: 42px;">Cancel</button>
            <button type="button" class="quiz-mgmt-action-btn quiz-btn-delete" id="confirm-delete-user" style="height: 42px;">Yes, Delete</button>
        </div>`);

    dialog.querySelector('#confirm-delete-user').addEventListener('click', async event => {
        const btn = event.currentTarget;
        btn.disabled = true; btn.textContent = 'Deleting\u2026';
        const { error } = await window.OrixaAuth.client.rpc('fn_admin_delete_user', { p_user_id: userId });
        if (error) {
            console.error('Delete user error:', error);
            btn.disabled = false; btn.textContent = 'Yes, Delete';
            setDialogMessage('delete-user-msg', `Could not delete: ${error.message}`, 'error');
            return;
        }
        closeHodDialog();
        await refreshHodAfterUserChange();
    });
}

function initUserManagement() {
    const handle = event => {
        const btn = event.target.closest('[data-user-action]');
        if (!btn) return;
        const { userAction, userKind, userId } = btn.dataset;
        if (userAction === 'delete') openDeleteUserDialog(userKind, userId);
        else if (userKind === 'teacher') openEditTeacherDialog(userId);
        else openEditStudentDialog(userId);
    };
    ['teacher-table-body', 'student-table-body'].forEach(id => {
        const body = document.getElementById(id);
        if (body) body.addEventListener('click', handle);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeHodDialog();
    });
}

function initHodProfile() {
    const drawer = document.getElementById('hod-profile-drawer');
    const openBtn = document.getElementById('open-hod-profile-btn');
    const closeBtn = document.getElementById('close-hod-profile-btn');
    const form = document.getElementById('hod-password-form');
    const toggleBtn = document.getElementById('hod-password-toggle-btn');
    if (!drawer || !openBtn || !form || !toggleBtn) return;

    let collegeName = null;
    const fillProfile = async () => {
        const profile = await window.OrixaAuth.getCurrentProfile();
        if (!profile) return;
        const name = profile.full_name || 'HOD';
        document.getElementById('hod-profile-name').textContent = name;
        document.getElementById('hod-profile-avatar').textContent =
            name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '--';
        document.getElementById('hod-profile-empid').textContent = profile.login_id || '\u2014';
        document.getElementById('hod-profile-dept').textContent = HOD_MOCK_DATA.deptInfo.name || '\u2014';
        const yearBadge = document.getElementById('hod-academic-year');
        document.getElementById('hod-profile-year').textContent =
            yearBadge ? yearBadge.textContent.replace(/^Academic Year\s*/, '') || '\u2014' : '\u2014';

        if (collegeName === null && profile.college_id) {
            const { data } = await window.OrixaAuth.client.from('colleges').select('name').eq('id', profile.college_id).maybeSingle();
            collegeName = data && data.name ? data.name : '\u2014';
        }
        document.getElementById('hod-profile-college').textContent = collegeName || '\u2014';
    };

    const fields = {
        current: document.getElementById('hod-pwd-current'),
        next: document.getElementById('hod-pwd-new'),
        confirm: document.getElementById('hod-pwd-confirm')
    };
    const errors = {
        current: document.getElementById('hod-pwd-current-error'),
        next: document.getElementById('hod-pwd-new-error'),
        confirm: document.getElementById('hod-pwd-confirm-error')
    };
    const msg = document.getElementById('hod-pwd-msg');
    const saveBtn = document.getElementById('hod-pwd-save-btn');

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

    toggleBtn.addEventListener('click', () => {
        const opening = form.classList.contains('hidden');
        setFormOpen(opening);
        if (opening) fields.current.focus();
    });
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', e => { if (e.target === drawer) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.style.display !== 'none') close(); });

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
        if (!valid) return;

        saveBtn.disabled = true;
        saveBtn.textContent = 'SAVING…';
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

function confirmHodLogout(event) {
    if (event) event.preventDefault();

    const existingModal = document.getElementById('hod-logout-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'hod-logout-modal';
    modal.className = 'orixa-modal-overlay';
    modal.innerHTML = `
        <div class="orixa-modal-card">
            <div class="orixa-modal-header">
                <h3 class="orixa-modal-title">Log Out Confirmation</h3>
            </div>
            <div class="orixa-modal-body">
                <p>Are you sure you want to log out of the HOD Dashboard?</p>
            </div>
            <div class="orixa-modal-footer">
                <button type="button" class="quiz-mgmt-action-btn" id="logout-cancel-btn" style="background: var(--color-cream);">Cancel</button>
                <button type="button" class="quiz-mgmt-action-btn" id="logout-confirm-btn" style="background: var(--color-red);">Logout</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('logout-cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('logout-confirm-btn').addEventListener('click', async () => {
        if (window.OrixaAuth) {
            await window.OrixaAuth.signOut();
        }
        window.location.replace('hod-login.html');
    });
}

function renderHodTeacherAndSubjectFilters() {
    const teacherSelect = document.getElementById('hod-filter-teacher');
    const subjectSelect = document.getElementById('hod-filter-subject');

    const performanceList = HOD_MOCK_DATA.performance || [];

    let available = performanceList;
    if (currentHodYearFilter !== 'ALL') {
        available = available.filter(s => s.year === currentHodYearFilter);
    }

    if (teacherSelect) {
        const selectedTeacher = teacherSelect.value || 'ALL';
        const teachers = Array.from(new Set(available.map(s => s.teacher))).sort();
        teacherSelect.innerHTML = `
            <option value="ALL">All Department Teachers</option>
            ${teachers.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
        `;
        if (teachers.includes(selectedTeacher)) {
            teacherSelect.value = selectedTeacher;
        } else {
            teacherSelect.value = 'ALL';
            currentHodTeacherFilter = 'ALL';
        }
    }

    if (subjectSelect) {
        const selectedSubject = subjectSelect.value || 'ALL';
        const subjects = Array.from(new Set(available.map(s => s.subject))).sort();
        subjectSelect.innerHTML = `
            <option value="ALL">All Department Subjects</option>
            ${subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
        `;
        if (subjects.includes(selectedSubject)) {
            subjectSelect.value = selectedSubject;
        } else {
            subjectSelect.value = 'ALL';
            currentHodSubjectFilter = 'ALL';
        }
    }
}

function renderHodPerformanceTable() {
    const tableBody = document.getElementById('hod-performance-table-body');
    const countEl = document.getElementById('hod-performance-count');

    if (!tableBody) return;

    const performanceList = HOD_MOCK_DATA.performance || [];

    const filtered = performanceList.filter(item => {
        const matchTeacher = (currentHodTeacherFilter === 'ALL' || item.teacher === currentHodTeacherFilter);
        const matchSubject = (currentHodSubjectFilter === 'ALL' || item.subject === currentHodSubjectFilter);
        const matchYear = (currentHodYearFilter === 'ALL' || item.year === currentHodYearFilter);
        return matchTeacher && matchSubject && matchYear;
    });

    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${performanceList.length} records`;
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="hod-no-results">
                    <div style="padding: 16px 0;">
                        <p style="font-family: var(--font-header); font-size: 1.05rem; color: var(--border-dark); margin-bottom: 4px;">No department student performance records found</p>
                        <p style="font-size: 0.88rem; color: #78909c;">Try adjusting your Teacher, Subject, or Year filters.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(item.name)}</td>
            <td><code class="hod-code-badge">${escapeHtml(item.id)}</code></td>
            <td><span class="hod-badge hod-badge-yellow">${escapeHtml(item.year)}</span></td>
            <td><span class="hod-badge hod-badge-green">${escapeHtml(item.subject)}</span></td>
            <td><span class="hod-badge hod-badge-purple">${escapeHtml(item.teacher)}</span></td>
            <td><strong>${item.quizzesCompleted}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-header); font-weight: 700; color: var(--border-dark); min-width: 38px;">${item.avgAccuracy}%</span>
                    <span class="quiz-status-pill ${getHodAccuracyPillClass(item.avgAccuracy)}">${escapeHtml(item.status)}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function getHodAccuracyPillClass(accuracy) {
    if (accuracy >= 90) return 'pill-live';
    if (accuracy >= 75) return 'pill-draft';
    return 'pill-closed';
}

function initHodPerformanceFilters() {
    const teacherSelect = document.getElementById('hod-filter-teacher');
    const subjectSelect = document.getElementById('hod-filter-subject');
    const yearSelect = document.getElementById('hod-filter-year');
    const clearBtn = document.getElementById('hod-clear-filters-btn');

    if (teacherSelect) {
        teacherSelect.addEventListener('change', e => {
            currentHodTeacherFilter = e.target.value;
            renderHodPerformanceTable();
        });
    }

    if (subjectSelect) {
        subjectSelect.addEventListener('change', e => {
            currentHodSubjectFilter = e.target.value;
            renderHodPerformanceTable();
        });
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', e => {
            currentHodYearFilter = e.target.value;
            renderHodTeacherAndSubjectFilters();
            renderHodPerformanceTable();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentHodTeacherFilter = 'ALL';
            currentHodSubjectFilter = 'ALL';
            currentHodYearFilter = 'ALL';

            if (teacherSelect) teacherSelect.value = 'ALL';
            if (subjectSelect) subjectSelect.value = 'ALL';
            if (yearSelect) yearSelect.value = 'ALL';

            renderHodTeacherAndSubjectFilters();
            renderHodPerformanceTable();
        });
    }
}

/* ==========================================================================
   EXCEL BULK UPLOAD & TEMPLATE FUNCTIONS (FACULTY & STUDENTS)
   ========================================================================== */

let parsedTeacherRecords = [];
let parsedStudentRecords = [];

function initUploadTogglesAndEvents() {
    // Faculty Upload Toggles
    const toggleTeacherUploadBtn = document.getElementById('toggle-upload-teacher-btn');
    const uploadTeacherDrawer = document.getElementById('upload-teacher-drawer');
    const closeTeacherUploadBtn = document.getElementById('close-upload-teacher-btn');
    const cancelTeacherUploadBtn = document.getElementById('cancel-upload-teacher-btn');
    const downloadTeacherTemplateBtn = document.getElementById('download-teacher-template-btn');
    const teacherExcelInput = document.getElementById('teacher-excel-input');
    const resetTeacherUploadBtn = document.getElementById('reset-upload-teacher-btn');
    const confirmTeacherUploadBtn = document.getElementById('confirm-upload-teacher-btn');

    // Student Upload Toggles
    const toggleStudentUploadBtn = document.getElementById('toggle-upload-student-btn');
    const uploadStudentDrawer = document.getElementById('upload-student-drawer');
    const closeStudentUploadBtn = document.getElementById('close-upload-student-btn');
    const cancelStudentUploadBtn = document.getElementById('cancel-upload-student-btn');
    const downloadStudentTemplateBtn = document.getElementById('download-student-template-btn');
    const studentExcelInput = document.getElementById('student-excel-input');
    const resetStudentUploadBtn = document.getElementById('reset-upload-student-btn');
    const confirmStudentUploadBtn = document.getElementById('confirm-upload-student-btn');

    // Faculty Modal Show / Hide
    if (toggleTeacherUploadBtn && uploadTeacherDrawer) {
        toggleTeacherUploadBtn.addEventListener('click', () => {
            uploadTeacherDrawer.style.display = 'flex';
            resetTeacherUploadState();
        });
    }

    if (closeTeacherUploadBtn && uploadTeacherDrawer) {
        closeTeacherUploadBtn.addEventListener('click', () => {
            uploadTeacherDrawer.style.display = 'none';
            resetTeacherUploadState();
        });
    }

    if (cancelTeacherUploadBtn && uploadTeacherDrawer) {
        cancelTeacherUploadBtn.addEventListener('click', () => {
            uploadTeacherDrawer.style.display = 'none';
            resetTeacherUploadState();
        });
    }

    if (uploadTeacherDrawer) {
        uploadTeacherDrawer.addEventListener('click', (e) => {
            if (e.target === uploadTeacherDrawer) {
                uploadTeacherDrawer.style.display = 'none';
                resetTeacherUploadState();
            }
        });
    }

    if (downloadTeacherTemplateBtn) {
        downloadTeacherTemplateBtn.addEventListener('click', downloadFacultyTemplate);
    }

    if (teacherExcelInput) {
        teacherExcelInput.addEventListener('change', handleTeacherExcelFileSelect);
    }

    if (resetTeacherUploadBtn) {
        resetTeacherUploadBtn.addEventListener('click', resetTeacherUploadState);
    }

    if (confirmTeacherUploadBtn) {
        confirmTeacherUploadBtn.addEventListener('click', confirmTeacherImport);
    }

    // Student Modal Show / Hide
    if (toggleStudentUploadBtn && uploadStudentDrawer) {
        toggleStudentUploadBtn.addEventListener('click', () => {
            uploadStudentDrawer.style.display = 'flex';
            resetStudentUploadState();
        });
    }

    if (closeStudentUploadBtn && uploadStudentDrawer) {
        closeStudentUploadBtn.addEventListener('click', () => {
            uploadStudentDrawer.style.display = 'none';
            resetStudentUploadState();
        });
    }

    if (cancelStudentUploadBtn && uploadStudentDrawer) {
        cancelStudentUploadBtn.addEventListener('click', () => {
            uploadStudentDrawer.style.display = 'none';
            resetStudentUploadState();
        });
    }

    if (uploadStudentDrawer) {
        uploadStudentDrawer.addEventListener('click', (e) => {
            if (e.target === uploadStudentDrawer) {
                uploadStudentDrawer.style.display = 'none';
                resetStudentUploadState();
            }
        });
    }

    if (downloadStudentTemplateBtn) {
        downloadStudentTemplateBtn.addEventListener('click', downloadStudentTemplate);
    }

    if (studentExcelInput) {
        studentExcelInput.addEventListener('change', handleStudentExcelFileSelect);
    }

    if (resetStudentUploadBtn) {
        resetStudentUploadBtn.addEventListener('click', resetStudentUploadState);
    }

    if (confirmStudentUploadBtn) {
        confirmStudentUploadBtn.addEventListener('click', confirmStudentImport);
    }
}

// Download Templates
function downloadFacultyTemplate() {
    if (typeof XLSX === 'undefined') {
        alert('SheetJS library is not loaded.');
        return;
    }
    const templateData = [
        ['Faculty Name', 'Employee ID', 'Subjects', 'Classes/Years', 'Password (Optional)'],
        ['Prof. Sarah Jenkins', 'EMP-CS-01', 'Data Structures, Web Technologies', '1st Year, 3rd Year', 'Pass@1234'],
        ['Prof. Alan Turing', 'EMP-CS-02', 'Cloud Computing, Database Management', '2nd Year, 4th Year', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty_Template');
    XLSX.writeFile(wb, 'Faculty_Import_Template.xlsx');
}

function downloadStudentTemplate() {
    if (typeof XLSX === 'undefined') {
        alert('SheetJS library is not loaded.');
        return;
    }
    const templateData = [
        ['Student Name', 'Student ID', 'Year/Class', 'Teacher', 'Subject', 'Password (Optional)'],
        ['Aarav Sharma', 'STU-CS-101', '1st Year', 'Prof. Sarah Jenkins', 'Data Structures', 'Student123!'],
        ['Ananya Deshmukh', 'STU-CS-102', '2nd Year', 'Prof. Alan Turing', 'Database Management', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Template');
    XLSX.writeFile(wb, 'Student_Import_Template.xlsx');
}

// Reset Upload States
function resetTeacherUploadState() {
    parsedTeacherRecords = [];
    const input = document.getElementById('teacher-excel-input');
    if (input) input.value = '';
    const dropzone = document.getElementById('teacher-file-dropzone');
    if (dropzone) dropzone.style.display = 'block';
    const previewContainer = document.getElementById('teacher-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const resetBtn = document.getElementById('reset-upload-teacher-btn');
    if (resetBtn) resetBtn.style.display = 'none';
    const confirmBtn = document.getElementById('confirm-upload-teacher-btn');
    if (confirmBtn) confirmBtn.style.display = 'none';
}

function resetStudentUploadState() {
    parsedStudentRecords = [];
    const input = document.getElementById('student-excel-input');
    if (input) input.value = '';
    const dropzone = document.getElementById('student-file-dropzone');
    if (dropzone) dropzone.style.display = 'block';
    const previewContainer = document.getElementById('student-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const resetBtn = document.getElementById('reset-upload-student-btn');
    if (resetBtn) resetBtn.style.display = 'none';
    const confirmBtn = document.getElementById('confirm-upload-student-btn');
    if (confirmBtn) confirmBtn.style.display = 'none';
}

// Handle Faculty Excel Selection
function handleTeacherExcelFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            parseAndValidateTeacherRows(rawRows);
        } catch (err) {
            console.error('Error reading Faculty Excel:', err);
            alert('Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseAndValidateTeacherRows(rawRows) {
    if (!rawRows || rawRows.length === 0) {
        alert('Uploaded Excel file is empty.');
        resetTeacherUploadState();
        return;
    }

    let startIndex = 0;
    // Check if row 0 is header row
    const firstRowStr = rawRows[0].map(c => String(c).toLowerCase()).join(' ');
    if (firstRowStr.includes('faculty') || firstRowStr.includes('employee') || firstRowStr.includes('teacher') || firstRowStr.includes('subject')) {
        startIndex = 1;
    }

    const fileTeacherNames = new Map();   // employee ID -> name on its first row in this file

    parsedTeacherRecords = [];

    for (let i = startIndex; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.every(cell => String(cell).trim() === '')) {
            continue; // Skip empty rows
        }

        const name = String(row[0] || '').trim();
        const empId = String(row[1] || '').trim();
        const subjectsRaw = String(row[2] || '').trim();
        const yearsRaw = String(row[3] || '').trim();
        const password = String(row[4] || '').trim();

        const errors = [];

        if (!name) errors.push('Faculty Name is empty');
        if (!empId) {
            errors.push('Employee ID is empty');
        } else {
            // An existing teacher, or the same teacher on several rows, only gets more subjects/years
            const empIdLower = empId.toLowerCase();
            const earlierName = fileTeacherNames.get(empIdLower);
            if (earlierName !== undefined && earlierName.toLowerCase() !== name.toLowerCase()) {
                errors.push(`Employee ID "${empId}" has a different name on another row`);
            }
            if (earlierName === undefined) fileTeacherNames.set(empIdLower, name);
        }

        if (!subjectsRaw) errors.push('Subjects is empty');
        if (!yearsRaw) errors.push('Classes/Years is empty');
        if (password && password.length < 8) errors.push('Password must be at least 8 characters if provided');

        const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(Boolean);
        const years = yearsRaw.split(',').map(y => y.trim()).filter(Boolean);

        parsedTeacherRecords.push({
            rowNum: i + 1,
            name,
            empId,
            subjects,
            years,
            password,
            subjectsStr: subjectsRaw,
            yearsStr: yearsRaw,
            isValid: errors.length === 0,
            errors
        });
    }

    renderTeacherPreview();
}

function renderTeacherPreview() {
    const dropzone = document.getElementById('teacher-file-dropzone');
    const previewContainer = document.getElementById('teacher-preview-container');
    const summaryEl = document.getElementById('teacher-preview-summary');
    const tbody = document.getElementById('teacher-preview-tbody');
    const resetBtn = document.getElementById('reset-upload-teacher-btn');
    const confirmBtn = document.getElementById('confirm-upload-teacher-btn');

    if (!previewContainer || !tbody || !summaryEl) return;

    if (dropzone) dropzone.style.display = 'none';
    previewContainer.style.display = 'flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';

    const total = parsedTeacherRecords.length;
    const validCount = parsedTeacherRecords.filter(r => r.isValid).length;
    const invalidCount = total - validCount;

    if (total === 0) {
        summaryEl.innerHTML = `<span style="color: var(--color-red-dark);">No valid data rows found in uploaded file.</span>`;
        tbody.innerHTML = `<tr><td colspan="6" class="hod-no-results">No records to preview</td></tr>`;
        if (confirmBtn) confirmBtn.style.display = 'none';
        return;
    }

    if (invalidCount > 0) {
        summaryEl.style.background = '#fff8e1';
        summaryEl.style.borderColor = 'var(--border-dark)';
        summaryEl.innerHTML = `
            <div>
                <span style="color: var(--border-dark); font-weight: 700;">${total} records found</span> &bull;
                <span style="color: #2e7d32; font-weight: 700;">${validCount} valid</span> &bull;
                <span style="color: #c62828; font-weight: 700;">${invalidCount} need attention</span>
            </div>
            <div style="font-size: 0.8rem; color: #546e7a;">Only valid records will be imported upon confirmation</div>
        `;
    } else {
        summaryEl.style.background = '#e8f5e9';
        summaryEl.style.borderColor = 'var(--border-dark)';
        summaryEl.innerHTML = `
            <div style="color: #2e7d32; font-weight: 700;">
                ${validCount} valid records ready to import
            </div>
        `;
    }

    tbody.innerHTML = parsedTeacherRecords.map(r => `
        <tr style="${r.isValid ? '' : 'background: rgba(255, 82, 82, 0.08);'}">
            <td>${r.rowNum}</td>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(r.name || '—')}</td>
            <td><code class="hod-code-badge">${escapeHtml(r.empId || '—')}</code></td>
            <td>${escapeHtml(r.subjectsStr || '—')}</td>
            <td>${escapeHtml(r.yearsStr || '—')}</td>
            <td>
                ${r.isValid ? `
                    <span class="hod-badge hod-badge-green">Valid</span>
                ` : `
                    <span class="hod-badge" style="background: var(--color-red); color: white;">Invalid</span>
                    <div style="font-size: 0.76rem; color: #c62828; margin-top: 3px; font-weight: 600;">
                        ${r.errors.map(err => escapeHtml(err)).join('; ')}
                    </div>
                `}
            </td>
        </tr>
    `).join('');

    if (confirmBtn) {
        if (validCount > 0) {
            confirmBtn.style.display = 'inline-flex';
            confirmBtn.textContent = validCount === total ? `Import ${validCount} Records` : `Import ${validCount} Valid Records`;
        } else {
            confirmBtn.style.display = 'none';
        }
    }
}

async function confirmTeacherImport() {
    const validRecords = parsedTeacherRecords.filter(r => r.isValid);
    if (validRecords.length === 0) return;

    const confirmBtn = document.getElementById('confirm-upload-teacher-btn');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Saving…'; }

    const results = [];
    const BATCH_SIZE = 5;
    
    // A teacher may have several rows: keep a teacher's rows in order so the account is created once
    const rowsByTeacher = new Map();
    validRecords.forEach(r => {
        const key = r.empId.trim().toLowerCase();
        if (!rowsByTeacher.has(key)) rowsByTeacher.set(key, []);
        rowsByTeacher.get(key).push(r);
    });
    const teacherGroups = Array.from(rowsByTeacher.values());

    for (let i = 0; i < teacherGroups.length; i += BATCH_SIZE) {
        const batch = teacherGroups.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async group => {
            for (const r of group) {
                const res = await saveTeacherToSupabase(r.name, r.empId, r.subjects, r.years, r.password);
                results.push({ record: r, result: res });
                if (res.success) {
                    recordTeacherAssignment({ id: res.userId, name: r.name, empId: r.empId, subjects: r.subjects, years: r.years });
                }
            }
        }));
    }

    if (confirmBtn) { confirmBtn.disabled = false; }

    const failed = results.filter(r => !r.result.success);
    if (failed.length > 0) {
        alert(`${validRecords.length - failed.length} teachers saved. ${failed.length} failed:\n` +
            failed.map(f => `${f.record.empId}: ${f.result.error}`).join('\n'));
    }

    renderHodStats();
    renderTeacherList();
    updateStudentFormDropdowns();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();

    const drawer = document.getElementById('upload-teacher-drawer');
    if (drawer) drawer.style.display = 'none';
    resetTeacherUploadState();
}

// Handle Student Excel Selection
function handleStudentExcelFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            parseAndValidateStudentRows(rawRows);
        } catch (err) {
            console.error('Error reading Student Excel:', err);
            alert('Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseAndValidateStudentRows(rawRows) {
    if (!rawRows || rawRows.length === 0) {
        alert('Uploaded Excel file is empty.');
        resetStudentUploadState();
        return;
    }

    let startIndex = 0;
    // Check if row 0 is header row
    const firstRowStr = rawRows[0].map(c => String(c).toLowerCase()).join(' ');
    if (firstRowStr.includes('student') || firstRowStr.includes('id') || firstRowStr.includes('teacher') || firstRowStr.includes('subject') || firstRowStr.includes('year') || firstRowStr.includes('class')) {
        startIndex = 1;
    }

    // Rows already seen in this file, by student ID: { name, year, subjects }
    const fileStudents = new Map();

    parsedStudentRecords = [];

    for (let i = startIndex; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.every(cell => String(cell).trim() === '')) {
            continue; // Skip empty rows
        }

        const name = String(row[0] || '').trim();
        const studentId = String(row[1] || '').trim();
        const year = String(row[2] || '').trim();
        const teacher = String(row[3] || '').trim();
        const subject = String(row[4] || '').trim();
        const password = String(row[5] || '').trim();

        const errors = [];

        if (!name) errors.push('Student Name is empty');
        if (!studentId) {
            errors.push('Student ID is empty');
        } else {
            // A student may appear on several rows (one per subject), as long as the rows agree
            const idLower = studentId.toLowerCase();
            const subjectLower = subject.toLowerCase();
            const registered = findHodStudent(studentId);
            const earlierRow = fileStudents.get(idLower);

            if (registered && year && registered.year !== '—' && !sameAcademicYear(registered.year, year)) {
                errors.push(`Student ID "${studentId}" is already registered in ${registered.year}`);
            }
            if (registered && subject && splitCommaList(registered.subject).some(x => x.toLowerCase() === subjectLower)) {
                errors.push(`Student ID "${studentId}" already takes "${subject}"`);
            }
            if (earlierRow) {
                if (earlierRow.name.toLowerCase() !== name.toLowerCase() || !sameAcademicYear(earlierRow.year, year)) {
                    errors.push(`Student ID "${studentId}" has a different name or year on another row`);
                }
                if (subject && earlierRow.subjects.has(subjectLower)) {
                    errors.push(`Student ID "${studentId}" lists "${subject}" more than once`);
                }
                if (subject) earlierRow.subjects.add(subjectLower);
            } else {
                fileStudents.set(idLower, { name, year, subjects: new Set(subject ? [subjectLower] : []) });
            }
        }

        if (!year) errors.push('Year/Class is empty');

        let matchedTeacherName = teacher;
        if (!teacher) {
            errors.push('Assigned Teacher is empty');
        } else {
            // Check against existing teachers in HOD_MOCK_DATA
            const wanted = teacher.toLowerCase().trim();
            const teachesSubject = t => !subject || t.subjects.some(sub => sub.toLowerCase().trim() === subject.toLowerCase().trim());
            // An exact name or employee ID wins; otherwise a partial name, preferring a teacher who teaches this subject
            const exactMatches = HOD_MOCK_DATA.teachers.filter(t =>
                t.name.toLowerCase().trim() === wanted || t.empId.toLowerCase().trim() === wanted);
            const partialMatches = HOD_MOCK_DATA.teachers.filter(t =>
                t.name.toLowerCase().includes(wanted) || wanted.includes(t.name.toLowerCase()));
            const candidates = exactMatches.length > 0 ? exactMatches : partialMatches;
            const teacherMatch = candidates.find(teachesSubject) || candidates[0];

            if (!teacherMatch) {
                errors.push(`Teacher "${teacher}" not found in faculty list`);
            } else {
                matchedTeacherName = teacherMatch.name; // Normalize to exact teacher name
                if (subject) {
                    const subjectMatch = teacherMatch.subjects.some(sub =>
                        sub.toLowerCase().trim() === subject.toLowerCase().trim() ||
                        sub.toLowerCase().includes(subject.toLowerCase()) ||
                        subject.toLowerCase().includes(sub.toLowerCase())
                    );
                    if (!subjectMatch) {
                        errors.push(`Subject "${subject}" is not taught by ${matchedTeacherName}`);
                    }
                }
            }
        }

        if (!subject) errors.push('Subject is empty');
        if (password && password.length < 8) errors.push('Password must be at least 8 characters if provided');

        parsedStudentRecords.push({
            rowNum: i + 1,
            name,
            studentId,
            year,
            teacher: matchedTeacherName,
            subject,
            password,
            isValid: errors.length === 0,
            errors
        });
    }

    renderStudentPreview();
}

function renderStudentPreview() {
    const dropzone = document.getElementById('student-file-dropzone');
    const previewContainer = document.getElementById('student-preview-container');
    const summaryEl = document.getElementById('student-preview-summary');
    const tbody = document.getElementById('student-preview-tbody');
    const resetBtn = document.getElementById('reset-upload-student-btn');
    const confirmBtn = document.getElementById('confirm-upload-student-btn');

    if (!previewContainer || !tbody || !summaryEl) return;

    if (dropzone) dropzone.style.display = 'none';
    previewContainer.style.display = 'flex';
    if (resetBtn) resetBtn.style.display = 'inline-flex';

    const total = parsedStudentRecords.length;
    const validCount = parsedStudentRecords.filter(r => r.isValid).length;
    const invalidCount = total - validCount;

    if (total === 0) {
        summaryEl.innerHTML = `<span style="color: var(--color-red-dark);">No valid data rows found in uploaded file.</span>`;
        tbody.innerHTML = `<tr><td colspan="7" class="hod-no-results">No records to preview</td></tr>`;
        if (confirmBtn) confirmBtn.style.display = 'none';
        return;
    }

    if (invalidCount > 0) {
        summaryEl.style.background = '#fff8e1';
        summaryEl.style.borderColor = 'var(--border-dark)';
        summaryEl.innerHTML = `
            <div>
                <span style="color: var(--border-dark); font-weight: 700;">${total} records found</span> &bull;
                <span style="color: #2e7d32; font-weight: 700;">${validCount} valid</span> &bull;
                <span style="color: #c62828; font-weight: 700;">${invalidCount} need attention</span>
            </div>
            <div style="font-size: 0.8rem; color: #546e7a;">Only valid records will be imported upon confirmation</div>
        `;
    } else {
        summaryEl.style.background = '#e8f5e9';
        summaryEl.style.borderColor = 'var(--border-dark)';
        summaryEl.innerHTML = `
            <div style="color: #2e7d32; font-weight: 700;">
                ${validCount} valid records ready to import
            </div>
        `;
    }

    tbody.innerHTML = parsedStudentRecords.map(r => `
        <tr style="${r.isValid ? '' : 'background: rgba(255, 82, 82, 0.08);'}">
            <td>${r.rowNum}</td>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(r.name || '—')}</td>
            <td><code class="hod-code-badge">${escapeHtml(r.studentId || '—')}</code></td>
            <td><span class="hod-badge hod-badge-yellow">${escapeHtml(r.year || '—')}</span></td>
            <td><span class="hod-badge hod-badge-purple">${escapeHtml(r.teacher || '—')}</span></td>
            <td><span class="hod-badge hod-badge-green">${escapeHtml(r.subject || '—')}</span></td>
            <td>
                ${r.isValid ? `
                    <span class="hod-badge hod-badge-green">Valid</span>
                ` : `
                    <span class="hod-badge" style="background: var(--color-red); color: white;">Invalid</span>
                    <div style="font-size: 0.76rem; color: #c62828; margin-top: 3px; font-weight: 600;">
                        ${r.errors.map(err => escapeHtml(err)).join('; ')}
                    </div>
                `}
            </td>
        </tr>
    `).join('');

    if (confirmBtn) {
        if (validCount > 0) {
            confirmBtn.style.display = 'inline-flex';
            confirmBtn.textContent = validCount === total ? `Import ${validCount} Records` : `Import ${validCount} Valid Records`;
        } else {
            confirmBtn.style.display = 'none';
        }
    }
}

async function confirmStudentImport() {
    const validRecords = parsedStudentRecords.filter(r => r.isValid);
    if (validRecords.length === 0) return;

    const confirmBtn = document.getElementById('confirm-upload-student-btn');
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = 'Saving…'; }

    const yearCodeMap = { '1st Year': 'FE', '2nd Year': 'SE', '3rd Year': 'TE', '4th Year': 'BE' };
    const results = [];
    const BATCH_SIZE = 5;
    
    // One student can have several rows (one per subject): keep a student's rows in order so the
    // account is created by the first row and the later rows only add subjects.
    const rowsByStudent = new Map();
    validRecords.forEach(r => {
        const key = r.studentId.trim().toLowerCase();
        if (!rowsByStudent.has(key)) rowsByStudent.set(key, []);
        rowsByStudent.get(key).push(r);
    });
    const studentGroups = Array.from(rowsByStudent.values());

    for (let i = 0; i < studentGroups.length; i += BATCH_SIZE) {
        const batch = studentGroups.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async group => {
            for (const r of group) {
                const levelCode = yearCodeMap[r.year] || r.year;
                const res = await saveStudentToSupabase(r.name, r.studentId, levelCode, r.subject, r.teacher, r.year, r.password);
                results.push({ record: r, result: res });
                if (res.success) {
                    recordStudentAssignment({
                        id: res.userId, name: r.name, studentId: r.studentId,
                        year: r.year, subject: r.subject, teacher: r.teacher
                    });
                }
            }
        }));
    }

    if (confirmBtn) { confirmBtn.disabled = false; }

    const failed = results.filter(r => !r.result.success);
    if (failed.length > 0) {
        alert(`${validRecords.length - failed.length} students saved. ${failed.length} failed:\n` +
            failed.map(f => `${f.record.studentId}: ${f.result.error}`).join('\n'));
    }

    renderHodStats();
    renderStudentList();
    updateStudentFormDropdowns();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();

    const drawer = document.getElementById('upload-student-drawer');
    if (drawer) drawer.style.display = 'none';
    resetStudentUploadState();
}

/* ==========================================================================
   SUPABASE DATA LAYER — HOD
   ========================================================================== */

// Subjects, levels, current session and teachers are fetched once and reused for every add/import.
let hodReferenceDataPromise = null;

function getHodReferenceData(deptId, collegeId) {
    if (!hodReferenceDataPromise) {
        const client = window.OrixaAuth.client;
        hodReferenceDataPromise = Promise.all([
            client.from('subjects').select('id, name').eq('department_id', deptId),
            client.from('academic_levels').select('id, display_name, code, rank_order').eq('college_id', collegeId),
            client.from('academic_sessions').select('id').eq('college_id', collegeId).eq('is_current', true).maybeSingle(),
            client.from('profiles').select('id, full_name, login_id').eq('department_id', deptId).eq('role', 'TEACHER')
        ]).then(([subjects, levels, session, teachers]) => {
            // Do not keep a failed or empty lookup; the next save fetches it again
            if (levels.error || !levels.data?.length || session.error || !session.data) {
                hodReferenceDataPromise = null;
            }
            const cached = window.HOD_CACHED_DB_ENTITIES;
            return {
                subjects: subjects.data?.length ? subjects.data : cached.subjects,
                levels: levels.data?.length ? levels.data : cached.academic_levels,
                sessionId: session.data?.id || cached.academic_session_id,
                teachers: teachers.data || []
            };
        }).catch(err => {
            hodReferenceDataPromise = null;
            throw err;
        });
    }
    return hodReferenceDataPromise;
}

// PostgREST returns a one-to-one embed (e.g. a student's profile) as an object and a one-to-many embed as an array
function firstRelated(value) {
    return Array.isArray(value) ? value[0] : value;
}

// "TE", "3rd Year", "Third Year" and "3" all mean the same academic year
function academicYearRank(text) {
    const t = String(text || '').trim().toLowerCase();
    const byCode = { fe: 1, se: 2, te: 3, be: 4 };
    const byWord = { first: 1, second: 2, third: 3, fourth: 4 };
    if (byCode[t]) return byCode[t];
    const word = t.split(/\s+/)[0];
    if (byWord[word]) return byWord[word];
    const n = parseInt(t, 10);
    return Number.isNaN(n) ? t : n;
}

function sameAcademicYear(a, b) {
    return academicYearRank(a) === academicYearRank(b);
}

function findHodTeacher(empId) {
    const key = String(empId || '').trim().toLowerCase();
    return HOD_MOCK_DATA.teachers.find(t => String(t.empId).trim().toLowerCase() === key) || null;
}

// A teacher can be given more subjects/years later: add them to the existing row or create the row.
function recordTeacherAssignment({ id, name, empId, subjects, years }) {
    const existing = findHodTeacher(empId);
    if (!existing) {
        HOD_MOCK_DATA.teachers.push({ id, name, empId, subjects, years });
        return;
    }
    const merge = (current, added) => {
        const list = (current || []).filter(v => v && v !== '—');
        added.forEach(v => {
            if (!list.some(x => x.toLowerCase() === v.toLowerCase())) list.push(v);
        });
        return list;
    };
    existing.subjects = merge(existing.subjects, subjects);
    existing.years = merge(existing.years, years);
}

function findHodStudent(studentId) {
    const key = String(studentId || '').trim().toLowerCase();
    return HOD_MOCK_DATA.students.find(s => String(s.studentId).trim().toLowerCase() === key) || null;
}

function splitCommaList(value) {
    return String(value || '').split(',').map(v => v.trim()).filter(v => v && v !== '—');
}

// A student can take many subjects, each with its own teacher: add to the existing row or create it.
function recordStudentAssignment({ id, name, studentId, year, subject, teacher }) {
    const existing = findHodStudent(studentId);
    if (!existing) {
        HOD_MOCK_DATA.students.push({ id, name, studentId, year, subject, teacher });
        return;
    }
    const subjects = splitCommaList(existing.subject);
    const teachers = splitCommaList(existing.teacher);
    if (!subjects.some(x => x.toLowerCase() === String(subject).toLowerCase())) subjects.push(subject);
    if (!teachers.some(x => x.toLowerCase() === String(teacher).toLowerCase())) teachers.push(teacher);
    existing.subject = subjects.join(', ');
    existing.teacher = teachers.join(', ');
}

// Matches "Second Year", "SE", "2" or "2nd year" to an academic level.
function findAcademicLevel(levels, text) {
    const t = String(text || '').trim().toLowerCase();
    if (!t || !levels) return null;
    const byName = levels.find(l => l.display_name?.toLowerCase() === t || l.code?.toLowerCase() === t);
    if (byName) return byName;
    const n = parseInt(t, 10);
    return Number.isNaN(n) ? null : (levels.find(l => l.rank_order === n) || null);
}

// Subjects belong to the department and are shared by every teacher who teaches them.
// A subject that does not exist yet is created once, even when several teachers
// in the same upload batch ask for it at the same time.
const pendingSubjectCreations = new Map();

async function ensureDepartmentSubject(ref, deptId, name) {
    const key = name.trim().toLowerCase();
    const existing = ref.subjects.find(s => s.name?.toLowerCase() === key);
    if (existing) return existing;
    if (pendingSubjectCreations.has(key)) return pendingSubjectCreations.get(key);

    const creation = (async () => {
        const client = window.OrixaAuth.client;
        const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'SUBJECT';

        const { data, error } = await client
            .from('subjects')
            .insert({ department_id: deptId, code, name: name.trim() })
            .select('id, name')
            .single();

        let subject = data;
        if (error) {
            // already created (earlier upload or another tab): use that row
            const { data: found } = await client
                .from('subjects')
                .select('id, name')
                .eq('department_id', deptId)
                .eq('code', code)
                .maybeSingle();
            if (!found) throw new Error(`Could not create subject "${name}": ${error.message}`);
            subject = found;
        }
        if (!ref.subjects.some(s => s.id === subject.id)) ref.subjects.push(subject);
        return subject;
    })();

    pendingSubjectCreations.set(key, creation);
    try {
        return await creation;
    } finally {
        pendingSubjectCreations.delete(key);
    }
}

async function saveTeacherToSupabase(fullName, loginId, subjects = [], years = [], password = '') {
    let deptId = null;
    let collegeId = null;
    let profile = null;

    if (window.OrixaAuth) {
        profile = await window.OrixaAuth.getCurrentProfile();
        deptId = profile?.department_id;
        collegeId = profile?.college_id;
    }

    if (!deptId && window.OrixaAuth && window.OrixaAuth.client) {
        try {
            const { data: dept } = await window.OrixaAuth.client.from('departments').select('id, college_id').limit(1).maybeSingle();
            if (dept) {
                deptId = dept.id;
                if (!collegeId) collegeId = dept.college_id;
            }
        } catch (e) {}
    }

    const teacherObj = {
        id: 'T-' + (loginId || Date.now()),
        name: fullName,
        empId: loginId,
        subjects: Array.isArray(subjects) ? subjects : [],
        years: Array.isArray(years) ? years : []
    };

    // Provision in Supabase via RPC
    if (window.OrixaAuth && window.OrixaAuth.client && deptId) {
        const client = window.OrixaAuth.client;
        const finalPassword = password && password.trim() ? password.trim() : 'Password123!';
        try {
            // An existing teacher only gets more subjects/years; the account and password stay as they are
            const existingTeacher = findHodTeacher(loginId);
            const { data, error } = existingTeacher
                ? { data: { user_id: existingTeacher.id }, error: null }
                : await client.rpc('fn_admin_provision_teacher', {
                    p_full_name: fullName,
                    p_login_id: loginId,
                    p_password: finalPassword,
                    p_department_id: deptId,
                    p_designation: 'Faculty'
                });

            if (error) {
                console.error('DB RPC provision teacher error:', error);
                return { success: false, error: `Teacher DB account creation failed: ${error.message}` };
            } else if (data?.user_id) {
                teacherObj.id = data.user_id;
                
                // Add teacher assignments to teacher_subject_class_assignments table
                if (subjects.length > 0 || years.length > 0) {
                    try {
                        if (collegeId) {
                            const ref = await getHodReferenceData(deptId, collegeId);
                            const dbSubjects = ref.subjects;
                            const dbLevels = ref.levels;
                            ref.teachers.push({ id: teacherObj.id, full_name: fullName, login_id: loginId });

                            const validSubjectIds = [];
                            for (const s of subjects) {
                                validSubjectIds.push((await ensureDepartmentSubject(ref, deptId, s)).id);
                            }

                            const validLevelIds = [];
                            const unknownYears = [];
                            for (const y of years) {
                                const lvl = findAcademicLevel(dbLevels, y);
                                if (lvl) validLevelIds.push(lvl.id); else unknownYears.push(y);
                            }
                            if (unknownYears.length > 0) {
                                const known = (dbLevels || []).map(l => l.display_name).join(', ') || 'none defined';
                                return {
                                    success: false,
                                    error: `Teacher account saved, but year "${unknownYears.join(', ')}" was not found. Available years: ${known}.`
                                };
                            }

                            const sessionId = ref.sessionId;

                            if (sessionId && validSubjectIds.length > 0 && validLevelIds.length > 0) {
                                const inserts = [];
                                for (const sid of validSubjectIds) {
                                    for (const lid of validLevelIds) {
                                        inserts.push({
                                            teacher_id: teacherObj.id,
                                            college_id: collegeId,
                                            department_id: deptId,
                                            subject_id: sid,
                                            academic_level_id: lid,
                                            academic_session_id: sessionId
                                        });
                                    }
                                }
                                // skip assignments the teacher already has (re-running an upload)
                                const { data: existingAssignments } = await client
                                    .from('teacher_subject_class_assignments')
                                    .select('subject_id, academic_level_id')
                                    .eq('teacher_id', teacherObj.id)
                                    .eq('academic_session_id', sessionId)
                                    .eq('is_active', true);
                                const have = new Set((existingAssignments || []).map(a => `${a.subject_id}|${a.academic_level_id}`));
                                const newInserts = inserts.filter(i => !have.has(`${i.subject_id}|${i.academic_level_id}`));

                                if (newInserts.length > 0) {
                                    const { error: insErr } = await client.from('teacher_subject_class_assignments').insert(newInserts);
                                    if (insErr) {
                                        console.error('Failed to save teacher assignments to DB:', insErr);
                                        return { success: false, error: `Teacher account saved, but the subject/year assignment failed: ${insErr.message}` };
                                    }
                                }
                            }
                        }
                    } catch (assignErr) {
                        console.warn('Could not sync assignment for teacher:', assignErr);
                        return { success: false, error: `Teacher account saved, but the assignment failed: ${assignErr.message}` };
                    }
                }
            }
        } catch (rpcErr) {
            console.error('RPC provision teacher exception:', rpcErr);
            return { success: false, error: rpcErr.message || 'RPC exception' };
        }
    }

    return { success: true, userId: teacherObj.id };
}

async function saveStudentToSupabase(fullName, loginId, levelCode, subject = '—', teacher = '—', year = '—', password = '') {
    let deptId = null;
    let collegeId = null;
    let profile = null;

    if (window.OrixaAuth) {
        profile = await window.OrixaAuth.getCurrentProfile();
        deptId = profile?.department_id;
        collegeId = profile?.college_id;
    }

    if (!collegeId && window.OrixaAuth && window.OrixaAuth.client && deptId) {
        try {
            const { data: dept } = await window.OrixaAuth.client.from('departments').select('college_id').eq('id', deptId).maybeSingle();
            if (dept) collegeId = dept.college_id;
        } catch (e) {}
    }

    if (!deptId && window.OrixaAuth && window.OrixaAuth.client) {
        try {
            const { data: dept } = await window.OrixaAuth.client.from('departments').select('id, college_id').limit(1).maybeSingle();
            if (dept) {
                deptId = dept.id;
                collegeId = dept.college_id;
            }
        } catch (e) {}
    }

    const existingStudent = findHodStudent(loginId);
    if (existingStudent) {
        if (existingStudent.year && existingStudent.year !== '—' && !sameAcademicYear(year, existingStudent.year)) {
            return { success: false, error: `Student ${loginId} is already registered in ${existingStudent.year}.` };
        }
        if (splitCommaList(existingStudent.subject).some(x => x.toLowerCase() === String(subject).toLowerCase())) {
            return { success: false, error: `Student ${loginId} already takes "${subject}".` };
        }
    }

    const studentObj = {
        id: 'S-' + (loginId || Date.now()),
        name: fullName,
        studentId: loginId,
        year: year || '—',
        subject: subject || '—',
        teacher: teacher || '—'
    };

    // Provision in Supabase via RPC
    if (window.OrixaAuth && window.OrixaAuth.client && deptId) {
        const client = window.OrixaAuth.client;
        let academicLevelId = null;

        try {
            const levels = (await getHodReferenceData(deptId, collegeId)).levels;

            const level = findAcademicLevel(levels, levelCode) || findAcademicLevel(levels, year);
            academicLevelId = level ? level.id : null;
        } catch (e) {}

        if (!academicLevelId) {
            return { success: false, error: `Year "${year}" was not found. Use a year that exists for your college.` };
        }

        const finalPassword = password && password.trim() ? password.trim() : 'Password123!';
        try {
            // An existing student only gets another subject; the account and password stay as they are
            const { data, error } = existingStudent
                ? { data: { user_id: existingStudent.id }, error: null }
                : await client.rpc('fn_admin_provision_student', {
                    p_full_name: fullName,
                    p_login_id: loginId,
                    p_password: finalPassword,
                    p_department_id: deptId,
                    p_academic_level_id: academicLevelId,
                    p_roll_number: loginId
                });

            if (error) {
                console.error('DB RPC provision student error:', error);
                return { success: false, error: `Student DB account creation failed: ${error.message}` };
            } else if (data?.user_id) {
                studentObj.id = data.user_id;

                // Sync assignment if subject and teacher are provided
                if (subject && subject !== '—' && teacher && teacher !== '—') {
                    try {
                        const ref = await getHodReferenceData(deptId, collegeId);
                        const subjectId = ref.subjects.find(s => s.name?.toLowerCase() === subject.toLowerCase())?.id;
                        const wantedTeacher = teacher.toLowerCase();
                        const teacherId = (ref.teachers.find(t => t.full_name?.toLowerCase() === wantedTeacher)
                            || ref.teachers.find(t => t.login_id?.toLowerCase() === wantedTeacher))?.id || null;
                        const sessionId = ref.sessionId;

                        let teacherAssignmentId = null;
                        if (teacherId && subjectId && academicLevelId) {
                            const { data: taData } = await client.from('teacher_subject_class_assignments')
                                .select('id')
                                .eq('teacher_id', teacherId)
                                .eq('subject_id', subjectId)
                                .eq('academic_level_id', academicLevelId)
                                .eq('is_active', true)
                                .maybeSingle();
                            if (taData) teacherAssignmentId = taData.id;
                        }

                        if (subjectId && teacherId && sessionId && teacherAssignmentId) {
                            const { error: insErr } = await client.from('student_subject_assignments').insert({
                                student_id: studentObj.id,
                                college_id: collegeId,
                                subject_id: subjectId,
                                academic_level_id: academicLevelId,
                                academic_session_id: sessionId,
                                teacher_id: teacherId,
                                teacher_assignment_id: teacherAssignmentId
                            });
                            if (insErr) {
                                console.error('Failed to save student assignment to DB:', insErr);
                                return { success: false, error: `Student account saved, but the subject/teacher assignment failed: ${insErr.message}` };
                            }
                        } else {
                            return {
                                success: false,
                                error: `Student account saved, but no matching assignment was found for subject "${subject}" and teacher "${teacher}". Check the teacher teaches that subject to this year.`
                            };
                        }
                    } catch (assignErr) {
                        console.warn('Could not sync assignment for student:', assignErr);
                    }
                }
            }
        } catch (rpcErr) {
            console.error('RPC provision student exception:', rpcErr);
            return { success: false, error: rpcErr.message || 'RPC exception' };
        }
    }

    return { success: true, userId: studentObj.id };
}

async function loadHodDataFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile) return;

    try {
        const deptId = profile.department_id;

        if (deptId) {
            const { data: dept, error: deptErr } = await client
                .from('departments')
                .select('*')
                .eq('id', deptId)
                .maybeSingle();
            if (deptErr) console.error('Error fetching department:', deptErr);
            if (dept) {
                HOD_MOCK_DATA.deptInfo.name = dept.name;
                HOD_MOCK_DATA.deptInfo.id = dept.id;
                const heading = document.getElementById('hod-dashboard-title');
                if (heading) heading.textContent = dept.name + ' HOD Dashboard';
                const perfHeading = document.getElementById('hod-perf-heading');
                if (perfHeading) perfHeading.textContent = dept.name + ' Performance Analytics';
                const studentsCaption = document.getElementById('hod-students-caption');
                if (studentsCaption) studentsCaption.textContent = 'Enrolled ' + dept.name + ' Students';
            } else {
                console.warn('Department not found for deptId:', deptId);
            }
        } else {
            console.warn('No department_id on HOD profile:', profile);
        }

        // Apply dynamically loaded department name to UI
        if (HOD_MOCK_DATA.deptInfo.name) {
            const name = HOD_MOCK_DATA.deptInfo.name;
            const heading = document.getElementById('hod-dashboard-title');
            if (heading) heading.textContent = name + ' HOD Dashboard';
            const perfHeading = document.getElementById('hod-perf-heading');
            if (perfHeading) perfHeading.textContent = name + ' Performance Analytics';
            const studentsCaption = document.getElementById('hod-students-caption');
            if (studentsCaption) studentsCaption.textContent = 'Enrolled ' + name + ' Students';
        }

        // 1. Load teachers
        if (deptId) {
            const { data: teachers, error: tErr } = await client
                .from('profiles')
                .select(`
                    id, full_name, login_id, 
                    teacher_profiles!teacher_profiles_profile_id_fkey(employee_id, designation),
                    teacher_subject_class_assignments!teacher_subject_class_assignments_teacher_id_fkey(
                        is_active,
                        academic_session_id,
                        subjects!teacher_subject_class_assignments_subject_id_fkey(id, name),
                        academic_levels!teacher_subject_class_assignments_academic_level_id_fkey(id, display_name, code)
                    )
                `)
                .eq('department_id', deptId)
                .eq('role', 'TEACHER')
                .eq('is_active', true);
                
            if (tErr) console.error('Error fetching teachers:', tErr);
                
            if (teachers) {
                HOD_MOCK_DATA.teachers = teachers.map(t => {
                    const empId = t.login_id || firstRelated(t.teacher_profiles)?.employee_id || t.id;
                    const activeAssignments = (t.teacher_subject_class_assignments || []).filter(a => a.is_active);
                    const subjects = Array.from(new Set(activeAssignments.map(a => a.subjects?.name).filter(Boolean)));
                    const years = Array.from(new Set(activeAssignments.map(a => a.academic_levels?.display_name).filter(Boolean)));
                    
                    activeAssignments.forEach(a => {
                        if (a.subjects?.id && a.subjects?.name) {
                            if (!window.HOD_CACHED_DB_ENTITIES.subjects.find(s => s.id === a.subjects.id)) {
                                window.HOD_CACHED_DB_ENTITIES.subjects.push(a.subjects);
                            }
                        }
                        if (a.academic_levels?.id && (a.academic_levels?.display_name || a.academic_levels?.code)) {
                            if (!window.HOD_CACHED_DB_ENTITIES.academic_levels.find(l => l.id === a.academic_levels.id)) {
                                window.HOD_CACHED_DB_ENTITIES.academic_levels.push(a.academic_levels);
                            }
                        }
                        if (a.academic_session_id && !window.HOD_CACHED_DB_ENTITIES.academic_session_id) {
                            window.HOD_CACHED_DB_ENTITIES.academic_session_id = a.academic_session_id;
                        }
                    });
                    
                    return {
                        id: t.id,
                        name: t.full_name || 'Teacher',
                        empId: empId,
                        subjects: subjects.length > 0 ? subjects : ['—'],
                        years: years.length > 0 ? years : ['—']
                    };
                });
            }
        }

        // 2. Load students
        if (deptId) {
            const { data: students, error: sErr } = await client
                .from('profiles')
                .select(`
                    id, full_name, login_id,
                    student_profiles!student_profiles_profile_id_fkey(student_id, roll_number, academic_level_id,
                        academic_levels(id, display_name, code)
                    ),
                    student_subject_assignments!student_subject_assignments_student_id_fkey(
                        is_active,
                        academic_session_id,
                        subjects(id, name),
                        profiles!student_subject_assignments_teacher_id_fkey(full_name)
                    )
                `)
                .eq('department_id', deptId)
                .eq('role', 'STUDENT')
                .eq('is_active', true);
                
            if (sErr) console.error('Error fetching students:', sErr);
                
            if (students) {
                HOD_MOCK_DATA.students = students.map(s => {
                    const sp = firstRelated(s.student_profiles) || {};
                    const sId = s.login_id || sp.student_id || s.id;
                    const activeAssignments = (s.student_subject_assignments || []).filter(a => a.is_active);
                    const subjects = Array.from(new Set(activeAssignments.map(a => a.subjects?.name).filter(Boolean))).join(', ') || '—';
                    const teachers = Array.from(new Set(activeAssignments.map(a => a.profiles?.full_name).filter(Boolean))).join(', ') || '—';

                    if (sp.academic_levels?.id && (sp.academic_levels?.display_name || sp.academic_levels?.code)) {
                        if (!window.HOD_CACHED_DB_ENTITIES.academic_levels.find(l => l.id === sp.academic_levels.id)) {
                            window.HOD_CACHED_DB_ENTITIES.academic_levels.push(sp.academic_levels);
                        }
                    }
                    activeAssignments.forEach(a => {
                        if (a.subjects?.id && a.subjects?.name) {
                            if (!window.HOD_CACHED_DB_ENTITIES.subjects.find(sub => sub.id === a.subjects.id)) {
                                window.HOD_CACHED_DB_ENTITIES.subjects.push(a.subjects);
                            }
                        }
                        if (a.academic_session_id && !window.HOD_CACHED_DB_ENTITIES.academic_session_id) {
                            window.HOD_CACHED_DB_ENTITIES.academic_session_id = a.academic_session_id;
                        }
                    });
                    
                    return {
                        id: s.id,
                        name: s.full_name || 'Student',
                        studentId: sId,
                        year: sp.academic_levels?.display_name || sp.academic_levels?.code || '—',
                        subject: subjects,
                        teacher: teachers
                    };
                });
            }
        }

        HOD_MOCK_DATA.performance = [];
        // Load performance data from quiz_attempts for this department's students
        const studentIds = HOD_MOCK_DATA.students.map(s => s.id);
        if (studentIds.length > 0) {
            const { data: attempts } = await client
                .from('quiz_attempts')
                .select(`
                    id, final_accuracy_pct, status,
                    profiles!quiz_attempts_student_id_fkey(full_name, login_id),
                    quizzes(title, subjects!quizzes_subject_id_fkey(name), profiles!quizzes_teacher_id_fkey(full_name))
                `)
                .in('student_id', studentIds)
                .eq('status', 'COMPLETED');

            if (attempts && attempts.length > 0) {
                const studentMap = {};
                attempts.forEach(a => {
                    const sid = a.profiles?.login_id || a.id;
                    if (!studentMap[sid]) {
                        const stuMatch = HOD_MOCK_DATA.students.find(s => s.studentId === sid || s.id === a.profiles?.login_id);
                        studentMap[sid] = {
                            name: a.profiles?.full_name || '—',
                            id: sid,
                            year: stuMatch?.year || '—',
                            subject: a.quizzes?.subjects?.name || '—',
                            teacher: a.quizzes?.profiles?.full_name || '—',
                            quizzesCompleted: 0,
                            totalAccuracy: 0
                        };
                    }
                    studentMap[sid].quizzesCompleted++;
                    studentMap[sid].totalAccuracy += (a.final_accuracy_pct || 0);
                });

                HOD_MOCK_DATA.performance = Object.values(studentMap).map(s => {
                    const avg = Math.round(s.totalAccuracy / s.quizzesCompleted);
                    return {
                        ...s,
                        avgAccuracy: avg,
                        status: avg >= 90 ? 'Excellent' : avg >= 75 ? 'Good' : 'Needs Work'
                    };
                });
            }
        }
    } catch (e) {
        console.warn('Error fetching HOD data from Supabase:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI interactions immediately so buttons work while DB is loading
    initAddTeacherForm();
    initAddStudentForm();
    initDrawerToggles();
    initHodProfile();
    initUserManagement();
    initHodPerformanceFilters();
    initUploadTogglesAndEvents();

    if (window.OrixaAuth) {
        const profile = await window.OrixaAuth.requireRole(['HOD'], 'hod-login.html');
        if (!profile) return;

        if (profile.full_name) {
            HOD_MOCK_DATA.deptInfo.hodName = profile.full_name;
        }
    }

    await loadHodDataFromSupabase();

    const academicYear = await window.OrixaAuth.getCurrentAcademicYear();
    const yearBadge = document.getElementById('hod-academic-year');
    if (yearBadge && academicYear) {
        yearBadge.textContent = `Academic Year ${window.OrixaAuth.formatAcademicYear(academicYear.code)}`;
    }

    renderHodStats();
    renderTeacherList();
    renderStudentList();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();
    updateStudentFormDropdowns();
});
