/* ==========================================================================
   ORIXA - COMPUTER DEPARTMENT HOD DASHBOARD CONTROLLER (jspmntccs)
   ========================================================================== */

const DEFAULT_HOD_MOCK_DATA = {
    deptInfo: {
        id: 'jspmntccs',
        name: 'Computer Engineering Department',
        hodName: 'Dr. Rajesh Sharma',
        hodEmpId: 'HOD-CS-01',
        academicYear: '2024–2025'
    },
    teachers: [
        {
            id: 'T-101',
            name: 'Prof. Sarah Jenkins',
            empId: 'EMP-CS-01',
            subjects: ['Data Structures', 'Web Technologies'],
            years: ['1st Year', '3rd Year']
        },
        {
            id: 'T-102',
            name: 'Prof. Alan Turing',
            empId: 'EMP-CS-02',
            subjects: ['Cloud Computing', 'Database Management'],
            years: ['2nd Year', '4th Year']
        },
        {
            id: 'T-103',
            name: 'Teacher A',
            empId: 'EMP-CS-03',
            subjects: ['DBMS'],
            years: ['2nd Year']
        },
        {
            id: 'T-104',
            name: 'Teacher B',
            empId: 'EMP-CS-04',
            subjects: ['AI'],
            years: ['2nd Year']
        }
    ],
    students: [
        {
            id: 'STU-CS-101',
            name: 'Aarav Sharma',
            studentId: 'STU-CS-101',
            year: '1st Year',
            subject: 'Data Structures',
            teacher: 'Prof. Sarah Jenkins'
        },
        {
            id: 'STU-CS-102',
            name: 'Ananya Deshmukh',
            studentId: 'STU-CS-102',
            year: '2nd Year',
            subject: 'Database Management',
            teacher: 'Prof. Alan Turing'
        },
        {
            id: 'STU-CS-103',
            name: 'Rahul',
            studentId: 'STU-CS-103',
            year: '2nd Year',
            subject: 'DBMS',
            teacher: 'Teacher A'
        },
        {
            id: 'STU-CS-104',
            name: 'Priya',
            studentId: 'STU-CS-104',
            year: '2nd Year',
            subject: 'AI',
            teacher: 'Teacher B'
        }
    ],
    performance: [
        { id: 'STU-CS-101', name: 'Aarav Sharma', year: '1st Year', subject: 'Data Structures', teacher: 'Prof. Sarah Jenkins', quizzesCompleted: 14, avgAccuracy: 94, status: 'Top Performer' },
        { id: 'STU-CS-102', name: 'Ananya Deshmukh', year: '2nd Year', subject: 'Database Management', teacher: 'Prof. Alan Turing', quizzesCompleted: 11, avgAccuracy: 88, status: 'Above Average' },
        { id: 'STU-CS-103', name: 'Rahul', year: '2nd Year', subject: 'DBMS', teacher: 'Teacher A', quizzesCompleted: 9, avgAccuracy: 85, status: 'Above Average' },
        { id: 'STU-CS-104', name: 'Priya', year: '2nd Year', subject: 'AI', teacher: 'Teacher B', quizzesCompleted: 7, avgAccuracy: 78, status: 'Average' },
        { id: 'STU-CS-105', name: 'Sanya Malhotra', year: '3rd Year', subject: 'Web Technologies', teacher: 'Prof. Sarah Jenkins', quizzesCompleted: 12, avgAccuracy: 91, status: 'Top Performer' },
        { id: 'STU-CS-106', name: 'Isha Gupta', year: '4th Year', subject: 'Cloud Computing', teacher: 'Prof. Alan Turing', quizzesCompleted: 13, avgAccuracy: 89, status: 'Above Average' }
    ]
};

let currentHodTeacherFilter = 'ALL';
let currentHodSubjectFilter = 'ALL';
let currentHodYearFilter = 'ALL';

function loadHodMockData() {
    try {
        const stored = localStorage.getItem('orixa_hod_mock_data');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed.teachers) && Array.isArray(parsed.students)) {
                if (!Array.isArray(parsed.performance)) {
                    parsed.performance = JSON.parse(JSON.stringify(DEFAULT_HOD_MOCK_DATA.performance));
                }
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Could not load HOD mock data from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_HOD_MOCK_DATA));
}

function saveHodMockData() {
    try {
        localStorage.setItem('orixa_hod_mock_data', JSON.stringify(HOD_MOCK_DATA));
    } catch (e) {
        console.warn('Could not save HOD mock data to localStorage:', e);
    }
}

// Isolated frontend mock state for Computer Department HOD
const HOD_MOCK_DATA = loadHodMockData();
// Ensure initial data is persisted to localStorage
saveHodMockData();

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
            <td><code class="hod-code-badge">${escapeHtml(teacher.empId)}</code></td>
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
                <td colspan="6" class="hod-no-results">
                    No students added or assigned yet. Use the form above to add student data.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = HOD_MOCK_DATA.students.map(student => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(student.name)}</td>
            <td><code class="hod-code-badge">${escapeHtml(student.studentId)}</code></td>
            <td><span class="hod-badge hod-badge-yellow">${escapeHtml(student.year)}</span></td>
            <td><span class="hod-badge hod-badge-green">${escapeHtml(student.subject)}</span></td>
            <td><span class="hod-badge hod-badge-purple">${escapeHtml(student.teacher)}</span></td>
            <td>
                <div class="assignment-rel-card">
                    <span>${escapeHtml(student.name)}</span>
                    <span class="rel-arrow">&rarr;</span>
                    <span style="color: #1976d2;">${escapeHtml(student.year)}</span>
                    <span class="rel-arrow">&rarr;</span>
                    <span style="color: #388e3c;">${escapeHtml(student.subject)}</span>
                    <span class="rel-arrow">&rarr;</span>
                    <span style="color: #7b1fa2;">${escapeHtml(student.teacher)}</span>
                </div>
            </td>
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
        saveHodMockData();

        form.reset();
        [nameInput, empIdInput, subjectsInput, yearsInput].forEach(setFieldValid);

        if (formMsg) {
            formMsg.textContent = `Teacher "${name}" added successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
            }, 3000);
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
        saveHodMockData();

        form.reset();
        [nameInput, idInput, yearSelect, subjectSelect, teacherSelect].forEach(setFieldValid);

        if (formMsg) {
            formMsg.textContent = `Student "${name}" assigned to ${teacher} for ${subject} (${year}) successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
            }, 4000);
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

    document.getElementById('logout-confirm-btn').addEventListener('click', () => {
        window.location.href = 'hod-login.html';
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

document.addEventListener('DOMContentLoaded', () => {
    renderHodStats();
    renderTeacherList();
    renderStudentList();
    renderHodTeacherAndSubjectFilters();
    renderHodPerformanceTable();
    updateStudentFormDropdowns();

    initAddTeacherForm();
    initAddStudentForm();
    initHodPerformanceFilters();
});
