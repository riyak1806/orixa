/* ==========================================================================
   ORIXA - COMPUTER DEPARTMENT HOD DASHBOARD CONTROLLER (jspmntccs)
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
            t.subjects.forEach(s => subjectsSet.add(s.trim()));
        });
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
    const formMsg = document.getElementById('teacher-form-msg');

    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const empId = empIdInput.value.trim();
        const subjectsRaw = subjectsInput.value.trim();
        const yearsRaw = yearsInput.value.trim();

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
            setFieldInvalid(yearsInput, 'At least one class / year is required.');
            isValid = false;
        } else {
            setFieldValid(yearsInput);
        }

        if (!isValid) return;

        const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(Boolean);
        const years = yearsRaw.split(',').map(y => y.trim()).filter(Boolean);

        const newTeacher = {
            id: `T-${Date.now().toString().slice(-4)}`,
            name: name,
            empId: empId,
            subjects: subjects,
            years: years
        };

        HOD_MOCK_DATA.teachers.push(newTeacher);

        form.reset();
        [nameInput, empIdInput, subjectsInput, yearsInput].forEach(setFieldValid);

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
}

function initAddStudentForm() {
    const form = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const idInput = document.getElementById('student-id');
    const yearSelect = document.getElementById('student-year');
    const subjectSelect = document.getElementById('student-subject');
    const teacherSelect = document.getElementById('student-teacher');
    const formMsg = document.getElementById('student-form-msg');

    if (!form) return;

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

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const studentId = idInput.value.trim();
        const year = yearSelect.value;
        const subject = subjectSelect.value;
        const teacher = teacherSelect.value;

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

        if (!isValid) return;

        const newStudent = {
            id: studentId,
            name: name,
            studentId: studentId,
            year: year,
            subject: subject,
            teacher: teacher
        };

        HOD_MOCK_DATA.students.push(newStudent);

        form.reset();
        [nameInput, idInput, yearSelect, subjectSelect, teacherSelect].forEach(setFieldValid);

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
                <p>Are you sure you want to log out of the Computer Engineering HOD Dashboard?</p>
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
        ['Faculty Name', 'Employee ID', 'Subjects', 'Classes/Years'],
        ['Prof. Sarah Jenkins', 'EMP-CS-01', 'Data Structures, Web Technologies', '1st Year, 3rd Year'],
        ['Prof. Alan Turing', 'EMP-CS-02', 'Cloud Computing, Database Management', '2nd Year, 4th Year']
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
        ['Student Name', 'Student ID', 'Year/Class', 'Teacher', 'Subject'],
        ['Aarav Sharma', 'STU-CS-101', '1st Year', 'Prof. Sarah Jenkins', 'Data Structures'],
        ['Ananya Deshmukh', 'STU-CS-102', '2nd Year', 'Prof. Alan Turing', 'Database Management']
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

        const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(Boolean);
        const years = yearsRaw.split(',').map(y => y.trim()).filter(Boolean);

        parsedTeacherRecords.push({
            rowNum: i + 1,
            name,
            empId,
            subjects,
            years,
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

function confirmTeacherImport() {
    const validRecords = parsedTeacherRecords.filter(r => r.isValid);
    if (validRecords.length === 0) return;

    validRecords.forEach(r => {
        const newTeacher = {
            id: `T-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
            name: r.name,
            empId: r.empId,
            subjects: r.subjects,
            years: r.years
        };
        HOD_MOCK_DATA.teachers.push(newTeacher);
    });

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

        parsedStudentRecords.push({
            rowNum: i + 1,
            name,
            studentId,
            year,
            teacher: matchedTeacherName,
            subject,
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

function confirmStudentImport() {
    const validRecords = parsedStudentRecords.filter(r => r.isValid);
    if (validRecords.length === 0) return;

    validRecords.forEach(r => {
        const newStudent = {
            id: r.studentId,
            name: r.name,
            studentId: r.studentId,
            year: r.year,
            subject: r.subject,
            teacher: r.teacher
        };
        HOD_MOCK_DATA.students.push(newStudent);
    });

    renderHodStats();
    renderStudentList();
    updateStudentFormDropdowns();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();

    const drawer = document.getElementById('upload-student-drawer');
    if (drawer) drawer.style.display = 'none';
    resetStudentUploadState();
}

async function loadHodDataFromSupabase() {
    if (!window.OrixaAuth || !window.OrixaAuth.client) return;
    const client = window.OrixaAuth.client;
    const profile = await window.OrixaAuth.getCurrentProfile();
    if (!profile) return;

    try {
        if (profile.department_id) {
            const { data: dept } = await client
                .from('departments')
                .select('*')
                .eq('id', profile.department_id)
                .maybeSingle();
            if (dept) {
                HOD_MOCK_DATA.deptInfo.name = dept.name;
                HOD_MOCK_DATA.deptInfo.id = dept.id;
            }
        }

        // Note: email column does not exist on public.profiles or public.teacher_profiles / public.student_profiles (stored in auth.users).
        // A schema migration is required if public email selection is needed.
        const { data: teachers } = await client
            .from('teacher_profiles')
            .select('*, profiles(full_name, login_id)')
            .eq('department_id', profile.department_id);

        if (teachers) {
            HOD_MOCK_DATA.teachers = teachers.map(t => {
                const prof = t.profiles || {};
                return {
                    id: t.id,
                    name: prof.full_name || 'Teacher',
                    empId: prof.login_id || 'EMP',
                    subjects: ['Computer Science'],
                    years: ['1st Year', '2nd Year', '3rd Year', '4th Year']
                };
            });
        }

        const { data: students } = await client
            .from('student_profiles')
            .select('*, profiles!student_profiles_profile_id_fkey(full_name, login_id)')
            .eq('department_id', profile.department_id);

        if (students) {
            HOD_MOCK_DATA.students = students.map(s => {
                const prof = s.profiles || {};
                return {
                    id: s.id,
                    name: prof.full_name || 'Student',
                    studentId: prof.login_id || 'STD',
                    year: '1st Year',
                    subject: 'Computer Science',
                    teacher: 'Department Faculty'
                };
            });
        }
    } catch (e) {
        console.warn('Error fetching HOD data from Supabase:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
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

    initAddTeacherForm();
    initAddStudentForm();
    initDrawerToggles();
    initHodPerformanceFilters();
    initUploadTogglesAndEvents();
});
