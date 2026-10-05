/* ==========================================================================
   ORIXA - HOD DASHBOARD CONTROLLER
   ========================================================================== */

const HOD_MOCK_DATA = {
    deptInfo: {
        id: '',
        name: '',
        hodName: '',
        hodEmpId: '',
        academicYear: '2024–2025'
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
                <td colspan="4" class="hod-no-results">
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
        </tr>
    `).join('');
}

function renderStudentList() {
    const tableBody = document.getElementById('student-table-body');
    if (!tableBody) return;

    if (HOD_MOCK_DATA.students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="hod-no-results">
                    No students added or assigned yet. Use the form above to add student data.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = HOD_MOCK_DATA.students.map(student => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(student.name)}</td>
            <td style="white-space: nowrap;"><code class="hod-code-badge">${escapeHtml(student.studentId)}</code></td>
            <td><span class="hod-badge hod-badge-yellow">${escapeHtml(student.year)}</span></td>
            <td><span class="hod-badge hod-badge-green">${escapeHtml(student.subject)}</span></td>
            <td><span class="hod-badge hod-badge-purple">${escapeHtml(student.teacher)}</span></td>
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
        const newTeacher = {
            id: result.userId,
            name: name,
            empId: empId,
            subjects: subjects,
            years: years
        };
        HOD_MOCK_DATA.teachers.push(newTeacher);

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

        const newStudent = { id: studentId, name, studentId, year, subject, teacher };
        HOD_MOCK_DATA.students.push(newStudent);

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

    const existingEmpIds = new Set(HOD_MOCK_DATA.teachers.map(t => String(t.empId).trim().toLowerCase()));
    const fileEmpIds = new Set();

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
            const empIdLower = empId.toLowerCase();
            if (existingEmpIds.has(empIdLower)) {
                errors.push(`Employee ID "${empId}" already exists in faculty list`);
            } else if (fileEmpIds.has(empIdLower)) {
                errors.push(`Duplicate Employee ID "${empId}" in file`);
            } else {
                fileEmpIds.add(empIdLower);
            }
        }

        if (!subjectsRaw) errors.push('Subjects is empty');
        if (!yearsRaw) errors.push('Classes/Years is empty');
        if (password && password.length < 6) errors.push('Password must be at least 6 characters if provided');

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
    
    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
        const batch = validRecords.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async r => {
            const res = await saveTeacherToSupabase(r.name, r.empId, r.subjects, r.years, r.password);
            return { record: r, result: res };
        }));
        
        for (const { record: r, result: res } of batchResults) {
            results.push({ record: r, result: res });
            if (res.success) {
                HOD_MOCK_DATA.teachers.push({
                    id: res.userId,
                    name: r.name,
                    empId: r.empId,
                    subjects: r.subjects,
                    years: r.years
                });
            }
        }
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

    const existingStudentIds = new Set(HOD_MOCK_DATA.students.map(s => String(s.studentId).trim().toLowerCase()));
    const fileStudentIds = new Set();

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
            const idLower = studentId.toLowerCase();
            if (existingStudentIds.has(idLower)) {
                errors.push(`Student ID "${studentId}" already exists`);
            } else if (fileStudentIds.has(idLower)) {
                errors.push(`Duplicate Student ID "${studentId}" in file`);
            } else {
                fileStudentIds.add(idLower);
            }
        }

        if (!year) errors.push('Year/Class is empty');

        let matchedTeacherName = teacher;
        if (!teacher) {
            errors.push('Assigned Teacher is empty');
        } else {
            // Check against existing teachers in HOD_MOCK_DATA
            const teacherMatch = HOD_MOCK_DATA.teachers.find(t =>
                t.name.toLowerCase().trim() === teacher.toLowerCase().trim() ||
                t.name.toLowerCase().includes(teacher.toLowerCase()) ||
                teacher.toLowerCase().includes(t.name.toLowerCase()) ||
                t.empId.toLowerCase().trim() === teacher.toLowerCase().trim()
            );

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
    
    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
        const batch = validRecords.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async r => {
            const levelCode = yearCodeMap[r.year] || r.year;
            const res = await saveStudentToSupabase(r.name, r.studentId, levelCode, r.subject, r.teacher, r.year, r.password);
            return { record: r, result: res };
        }));
        
        for (const { record: r, result: res } of batchResults) {
            results.push({ record: r, result: res });
            if (res.success) {
                HOD_MOCK_DATA.students.push({
                    id: res.userId, name: r.name, studentId: r.studentId,
                    year: r.year, subject: r.subject, teacher: r.teacher
                });
            }
        }
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

// Matches "Second Year", "SE", "2" or "2nd year" to an academic level.
function findAcademicLevel(levels, text) {
    const t = String(text || '').trim().toLowerCase();
    if (!t || !levels) return null;
    const byName = levels.find(l => l.display_name?.toLowerCase() === t || l.code?.toLowerCase() === t);
    if (byName) return byName;
    const n = parseInt(t, 10);
    return Number.isNaN(n) ? null : (levels.find(l => l.rank_order === n) || null);
}

// HODs own their department's subjects, so a subject that does not exist yet is created.
async function ensureDepartmentSubject(ref, deptId, name) {
    const existing = ref.subjects.find(s => s.name?.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'SUBJECT';
    const { data, error } = await window.OrixaAuth.client
        .from('subjects')
        .insert({ department_id: deptId, code, name })
        .select('id, name')
        .single();
    if (error) throw new Error(`Could not create subject "${name}": ${error.message}`);
    ref.subjects.push(data);
    return data;
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
            const { data, error } = await client.rpc('fn_admin_provision_teacher', {
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
                                if (inserts.length > 0) {
                                    const { error: insErr } = await client.from('teacher_subject_class_assignments').insert(inserts);
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
            const { data, error } = await client.rpc('fn_admin_provision_student', {
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
                    const empId = t.login_id || t.teacher_profiles?.[0]?.employee_id || t.id;
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
                    const sp = s.student_profiles?.[0] || {};
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

    renderHodStats();
    renderTeacherList();
    renderStudentList();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();
    updateStudentFormDropdowns();
});
