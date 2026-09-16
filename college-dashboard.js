/* ==========================================================================
   ORIXA - GENERAL COLLEGE DASHBOARD CONTROLLER (jspmntc)
   ========================================================================== */

const MOCK_COLLEGE_DATA = {
    collegeInfo: {
        id: 'jspmntc',
        name: 'JSPM NTC — Jayawantrao Sawant College of Engineering',
        adminName: 'General College Administrator',
        academicYear: '2024–2025'
    },
    departments: [
        { id: 'DEPT-101', name: 'Computer Engineering', hodName: 'Dr. Rajesh Sharma', hodEmpId: 'HOD-CS-01', totalStudents: 340, activeTeachers: 14, avgAccuracy: 88 },
        { id: 'DEPT-102', name: 'Mechanical Engineering', hodName: 'Prof. Amit Verma', hodEmpId: 'HOD-ME-02', totalStudents: 280, activeTeachers: 12, avgAccuracy: 79 },
        { id: 'DEPT-103', name: 'Electrical Engineering', hodName: 'Dr. Sunita Patil', hodEmpId: 'HOD-EE-03', totalStudents: 220, activeTeachers: 10, avgAccuracy: 84 },
        { id: 'DEPT-104', name: 'Civil Engineering', hodName: 'Prof. Ramesh Kulkarni', hodEmpId: 'HOD-CE-04', totalStudents: 190, activeTeachers: 8, avgAccuracy: 72 }
    ],
    studentPerformance: [
        { id: 'STU-101', name: 'Aarav Sharma', department: 'Computer Engineering', teacher: 'Prof. Sarah Jenkins', year: 'FE', subject: 'Data Structures', quizzesCompleted: 14, avgAccuracy: 94, totalXp: 1650, status: 'Top Performer' },
        { id: 'STU-102', name: 'Ananya Deshmukh', department: 'Computer Engineering', teacher: 'Prof. Sarah Jenkins', year: 'SE', subject: 'Database Management', quizzesCompleted: 11, avgAccuracy: 88, totalXp: 1320, status: 'Above Average' },
        { id: 'STU-103', name: 'Rohan Mehta', department: 'Mechanical Engineering', teacher: 'Prof. Robert Miller', year: 'TE', subject: 'Thermodynamics', quizzesCompleted: 8, avgAccuracy: 76, totalXp: 920, status: 'Average' },
        { id: 'STU-104', name: 'Priya Joshi', department: 'Electrical Engineering', teacher: 'Prof. Alan Turing', year: 'BE', subject: 'Circuit Analysis', quizzesCompleted: 16, avgAccuracy: 96, totalXp: 1890, status: 'Top Performer' },
        { id: 'STU-105', name: 'Vikram Singh', department: 'Civil Engineering', teacher: 'Prof. Sarah Jenkins', year: 'SE', subject: 'Structural Mechanics', quizzesCompleted: 6, avgAccuracy: 64, totalXp: 680, status: 'Needs Improvement' },
        { id: 'STU-106', name: 'Sanya Malhotra', department: 'Computer Engineering', teacher: 'Prof. Alan Turing', year: 'TE', subject: 'Web Technologies', quizzesCompleted: 12, avgAccuracy: 91, totalXp: 1420, status: 'Top Performer' },
        { id: 'STU-107', name: 'Aditya Pawar', department: 'Mechanical Engineering', teacher: 'Prof. Robert Miller', year: 'FE', subject: 'Engineering Physics', quizzesCompleted: 9, avgAccuracy: 82, totalXp: 1080, status: 'Above Average' },
        { id: 'STU-108', name: 'Neha Kulkarni', department: 'Electrical Engineering', teacher: 'Prof. Alan Turing', year: 'SE', subject: 'Control Systems', quizzesCompleted: 15, avgAccuracy: 97, totalXp: 1850, status: 'Top Performer' },
        { id: 'STU-109', name: 'Kunal Shinde', department: 'Civil Engineering', teacher: 'Prof. Robert Miller', year: 'TE', subject: 'Fluid Mechanics', quizzesCompleted: 7, avgAccuracy: 70, totalXp: 780, status: 'Average' },
        { id: 'STU-110', name: 'Isha Gupta', department: 'Computer Engineering', teacher: 'Prof. Sarah Jenkins', year: 'BE', subject: 'Cloud Computing', quizzesCompleted: 13, avgAccuracy: 89, totalXp: 1510, status: 'Above Average' }
    ]
};

// State variables
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

    if (totalDeptsEl) {
        totalDeptsEl.textContent = MOCK_COLLEGE_DATA.departments.length;
    }

    if (totalStudentsEl) {
        const total = MOCK_COLLEGE_DATA.departments.reduce((sum, d) => sum + (d.totalStudents || 0), 0);
        totalStudentsEl.textContent = total.toLocaleString();
    }

    if (activeTeachersEl) {
        const total = MOCK_COLLEGE_DATA.departments.reduce((sum, d) => sum + (d.activeTeachers || 0), 0);
        activeTeachersEl.textContent = total;
    }

    if (avgPerfEl) {
        const avg = Math.round(
            MOCK_COLLEGE_DATA.departments.reduce((sum, d) => sum + (d.avgAccuracy || 0), 0) /
            (MOCK_COLLEGE_DATA.departments.length || 1)
        );
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
        return;
    }

    listBody.innerHTML = MOCK_COLLEGE_DATA.departments.map(dept => `
        <tr>
            <td style="font-weight: 700; color: var(--border-dark);">${escapeHtml(dept.name)}</td>
            <td>${escapeHtml(dept.hodName)}</td>
            <td><code class="college-code-badge">${escapeHtml(dept.hodEmpId)}</code></td>
            <td><strong>${dept.totalStudents || 0}</strong></td>
            <td><strong>${dept.activeTeachers || 0}</strong></td>
            <td>
                <span class="quiz-status-pill pill-live">${dept.avgAccuracy || 80}% Avg</span>
            </td>
        </tr>
    `).join('');

    // Update department filter options
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

    let availableStudents = MOCK_COLLEGE_DATA.studentPerformance;
    if (currentDepartmentFilter !== 'ALL') {
        availableStudents = availableStudents.filter(s => s.department === currentDepartmentFilter);
    }
    if (currentYearFilter !== 'ALL') {
        availableStudents = availableStudents.filter(s => s.year === currentYearFilter);
    }

    if (teacherSelect) {
        const selectedTeacher = teacherSelect.value || 'ALL';
        const teachers = Array.from(new Set(availableStudents.map(s => s.teacher))).sort();
        teacherSelect.innerHTML = `
            <option value="ALL">All Teachers</option>
            ${teachers.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
        `;
        if (teachers.includes(selectedTeacher)) {
            teacherSelect.value = selectedTeacher;
        } else {
            teacherSelect.value = 'ALL';
            currentTeacherFilter = 'ALL';
        }
    }

    if (subjectSelect) {
        const selectedSubject = subjectSelect.value || 'ALL';
        const subjects = Array.from(new Set(availableStudents.map(s => s.subject))).sort();
        subjectSelect.innerHTML = `
            <option value="ALL">All Subjects</option>
            ${subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
        `;
        if (subjects.includes(selectedSubject)) {
            subjectSelect.value = selectedSubject;
        } else {
            subjectSelect.value = 'ALL';
            currentSubjectFilter = 'ALL';
        }
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
                        <p style="font-family: var(--font-header); font-size: 1.1rem; color: var(--border-dark); margin-bottom: 4px;">No student records found</p>
                        <p style="font-size: 0.9rem; color: #78909c;">Try adjusting your Department, Teacher, Year, or Subject filters.</p>
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
   EVENT HANDLERS & INITIALIZATION
   ========================================================================== */

function initAddDepartmentDrawer() {
    const toggleBtn = document.getElementById('toggle-add-dept-btn');
    const drawer = document.getElementById('add-dept-drawer');

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = drawer.style.display === 'none' || !drawer.style.display;
            drawer.style.display = isHidden ? 'block' : 'none';
        });
    }
}

function initAddDepartmentForm() {
    const form = document.getElementById('add-department-form');
    const nameInput = document.getElementById('dept-name');
    const hodInput = document.getElementById('dept-hod-name');
    const hodEmpIdInput = document.getElementById('dept-hod-empid');
    const formMsg = document.getElementById('dept-form-msg');

    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const hodName = hodInput.value.trim();
        const hodEmpId = hodEmpIdInput.value.trim();

        let isValid = true;

        if (!name) {
            setFieldInvalid(nameInput, 'Department name is required.');
            isValid = false;
        } else {
            setFieldValid(nameInput);
        }

        if (!hodName) {
            setFieldInvalid(hodInput, 'HOD name is required.');
            isValid = false;
        } else {
            setFieldValid(hodInput);
        }

        if (!hodEmpId) {
            setFieldInvalid(hodEmpIdInput, 'HOD Employee ID is required.');
            isValid = false;
        } else {
            setFieldValid(hodEmpIdInput);
        }

        if (!isValid) return;

        // Create new department object in isolated local mock state
        const newDept = {
            id: `DEPT-${Date.now().toString().slice(-4)}`,
            name: name,
            hodName: hodName,
            hodEmpId: hodEmpId,
            totalStudents: 0,
            activeTeachers: 1,
            avgAccuracy: 80
        };

        MOCK_COLLEGE_DATA.departments.push(newDept);

        // Reset form
        form.reset();
        [nameInput, hodInput, hodEmpIdInput].forEach(setFieldValid);

        if (formMsg) {
            formMsg.textContent = `Department "${name}" added successfully!`;
            formMsg.className = 'teacher-form-msg success';
            setTimeout(() => {
                formMsg.textContent = '';
                formMsg.className = 'teacher-form-msg';
            }, 3000);
        }

        // Re-render UI
        renderCollegeStats();
        renderDepartmentList();
    });

    [nameInput, hodInput, hodEmpIdInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => setFieldValid(input));
        }
    });
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

    document.getElementById('logout-cancel-btn').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('logout-confirm-btn').addEventListener('click', () => {
        window.location.href = 'college-login.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCollegeStats();
    renderDepartmentList();
    renderTeacherAndSubjectFilterOptions();
    renderStudentPerformanceTable();

    initAddDepartmentDrawer();
    initAddDepartmentForm();
    initPerformanceFilters();
});
