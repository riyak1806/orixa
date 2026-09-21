# ORIXA — PostgreSQL & Supabase Database Architecture Design Specification

## Document Control & Overview

- **Project:** ORIXA Educational Gaming & Platform
- **Phase:** Phase 2A — Database Architecture Design and Data Model Correction Specification
- **Author:** Jules (Software Engineer)
- **Status:** Architecture Design Specification (Design-Only, Read-Only with respect to Application Code & Database Execution)

---

## 1. Executive Summary & Architectural Overview

The ORIXA platform is expanding from a client-side prototype using in-memory mock datasets and `localStorage` persistence into a multi-tenant PostgreSQL relational architecture powered by Supabase.

This specification presents a corrected, production-ready architecture designed after a comprehensive data model audit across all frontend components (`college-dashboard.js`, `hod-dashboard.js`, `teacher-dashboard.js`, `student-portal.js`, and authentication entry points).

The design guarantees multi-college tenant isolation, database-enforced organizational consistency, role-based access control, strict student-teacher-subject assignment scoping, support for all four ORIXA game types (Tile Puzzle, Match the Following, Fill in the Blanks, True or False), JSONB payload validation, and precise scoring preservation while maintaining user-visible human-readable identifiers.

---

## 2. Existing Application Data Model Audit & Discrepancy Analysis

### 2.1 Codebase Structure Audit

A detailed inspection of the current frontend source code reveals the following data structures and relationships:

#### 1. College Data (`college-dashboard.js`, `college-login.html`)
- **Current State:** Represented in `MOCK_COLLEGE_DATA.collegeInfo`. Contains `id` (`jspmntc`), `name` (`JSPM NTC — Jayawantrao Sawant College of Engineering`), `adminName`, and `academicYear` (`2024–2025`).
- **Discrepancy:** The login handler in `teacher.js` checks hardcoded string `'jspmntc'` to redirect to `college-dashboard.html`. In a relational model, `colleges` must be an independent table with UUID primary keys and unique domain codes (`code = 'jspmntc'`).

#### 2. Departments (`college-dashboard.js`, `hod-dashboard.js`)
- **Current State:** Stored as objects in `MOCK_COLLEGE_DATA.departments` and `DEFAULT_HOD_MOCK_DATA.deptInfo`. Fields include `id` (`DEPT-101`, `jspmntccs`), `name` (`Computer Engineering`), `hodName` (`Dr. Rajesh Sharma`), `hodEmpId` (`HOD-CS-01`), `totalStudents`, `activeTeachers`, and `avgAccuracy`.
- **Discrepancy:** HOD names and metrics are redundantly stored/calculated on department mock objects. Department IDs mix synthetic strings (`DEPT-101`) with login routing keys (`jspmntccs`). In the relational model, departments are linked to a parent `college_id`, with HOD relationships defined via foreign keys to user profiles rather than embedded strings.

#### 3. HODs (`hod-login.html`, `hod-dashboard.js`, `teacher.js`)
- **Current State:** HOD authentication checks hardcoded credentials (`HOD-CS-01` / `password123`) in `teacher.js` and routes code `'jspmntccs'`. HOD data is embedded in `DEFAULT_HOD_MOCK_DATA.deptInfo`.
- **Discrepancy:** HODs exist as static strings without explicit user profile records or clear institutional foreign key bindings. In the relational model, HOD is a role assigned to a `profile` linked to `auth.users` and assigned to a `department`.

#### 4. Teachers (`hod-dashboard.js`, `teacher-dashboard.js`, `teacher.js`)
- **Current State:**
  - `hod-dashboard.js` tracks department teachers in `HOD_MOCK_DATA.teachers`: `{ id: 'T-101', name: 'Prof. Sarah Jenkins', empId: 'EMP-CS-01', subjects: ['Data Structures', 'Web Technologies'], years: ['1st Year', '3rd Year'] }`.
  - `teacher-dashboard.js` tracks logged-in teacher state in `MOCK_DATA.teacher`: `{ name: "Prof. Sarah Jenkins", title: "Senior Mathematics Educator", ... }`.
  - `teacher.js` checks credentials (`EMP-CS-01` / `password123`).
- **Discrepancy:** Subjects and years assigned to teachers are stored as arrays of raw text strings (`subjects: ['Data Structures']`, `years: ['1st Year']`). In the database, these must be relational junction tables (`teacher_subject_class_assignments`) referencing normalized `subjects`, `academic_levels`, and `academic_sessions` tables.

#### 5. Students (`hod-dashboard.js`, `teacher-dashboard.js`, `student-portal.js`, `student.js`)
- **Current State:**
  - In `hod-dashboard.js`: `{ id: 'STU-CS-101', name: 'Aarav Sharma', studentId: 'STU-CS-101', year: '1st Year', subject: 'Data Structures', teacher: 'Prof. Sarah Jenkins' }`.
  - In `teacher-dashboard.js`: `{ id: 'STU-001', name: 'Aarav Sharma', grade: 'Grade 8', section: 'A', rollNo: '801', status: 'Active', avgScore: 88, quizzesTaken: 14 }`.
  - In `student-portal.js`: Hardcoded student profile `{ name: "Aarav Sharma", id: "STU-80214", grade: "Grade 8 - Section A", department: "Computer Engineering", year: "2025-2026" }`.
- **Discrepancy:** Student records contain redundant and inconsistent grade/year labels (`1st Year` vs `Grade 8`) and store assigned teachers and subjects as flat text strings (`teacher: 'Prof. Sarah Jenkins'`). In the relational model, students belong to a `college` and `department`, have a single `student_profiles` row, and enroll in subjects via normalized enrollment junction tables.

#### 6. Subjects, Academic Levels & Academic Sessions
- **Current State:** Subjects (`Data Structures`, `DBMS`, `AI`, `Science`, `Maths`), Academic Levels (`1st Year`, `2nd Year`, `FE`, `SE`, `TE`, `BE`, `Grade 8`), and Academic Sessions (`2024–2025`, `2025–2026`) exist strictly as free-form strings scattered across JS arrays.
- **Discrepancy:** Conflating academic level (grade level) with academic session (calendar term year) causes ambiguity in tracking student progression. They must be normalized into two distinct tables: `academic_levels` and `academic_sessions`.

#### 7. Teacher & Student Assignments (`hod-dashboard.js`)
- **Current State:** `hod-dashboard.js` creates assignments by attaching `teacher` (string) and `subject` (string) directly onto the student object in `HOD_MOCK_DATA.students`.
- **Discrepancy:** Flat string assignment prevents multi-teacher subject splitting (e.g., Teacher A teaching DBMS to 2nd Year vs Teacher B teaching AI to 2nd Year). The proposed relational design uses a `student_subject_assignments` junction table linking `student_id`, `subject_id`, `academic_level_id`, `academic_session_id`, and `teacher_id`.

#### 8. Quizzes & Game Types (`teacher-dashboard.js`, `student-portal.js`)
- **Current State:**
  - `teacher-dashboard.js` tracks active quizzes (`MOCK_DATA.quizzes`), past quizzes (`MOCK_DATA.pastQuizzes`), and quiz creation state (`createQuizState`). Supported game types: `'TILE_PUZZLE'`, `'MATCH_FOLLOWING'`, `'FILL_BLANKS'`, `'TRUE_FALSE'`.
  - Questions are stored in `MOCK_DATA.questionBank` or inside `createQuizState.questions`.
- **Discrepancy:** Questions in `questionBank` have fixed multiple-choice fields (`options: [...]`, `correctAnswer: index`), while game builder states use type-specific JSON structures (e.g., pairs for Match, tokens for Fill-in-blanks, statements for T/F). The relational model unifies quiz metadata in a `quizzes` table and uses a `quiz_questions` table with JSONB payloads for game-type-specific structure.

#### 9. Quiz Attempts, Scores & Results (`teacher-dashboard.js`, `student-portal.js`)
- **Current State:**
  - `MOCK_DATA.results` in `teacher-dashboard.js` stores student quiz attempts with overall percentage, score, correct/incorrect counts, and a nested `questionsBreakdown` array.
  - `student-portal.js` calculates live XP, accuracy %, and stars in-memory using `calculateQuizResults()`, saving completed quiz IDs to `localStorage` key `'orixa_completed_quizzes'`.
- **Discrepancy:** Frontend computes and stores pre-aggregated values (`avgAccuracy`, `totalXp`) directly in mock data. The database architecture stores raw attempt events and question-level responses (`quiz_attempts` and `question_attempts`), deriving aggregate stats dynamically or snapshotting finalized attempt records.

#### 10. Notifications (`teacher-dashboard.js`)
- **Current State:** Stored in `MOCK_DATA.notifications` with fields `id`, `title`, `message`, `category`, `priority`, `read` (boolean), `timestamp`, `dateStr`, and `target`.
- **Discrepancy:** Notifications are global in mock data. In production, notifications must belong to a specific user (`user_id`) with foreign key constraints.

---

## 3. Relational Data Model & Entity Specifications

The proposed relational model normalizes ORIXA into 18 core entities structured under PostgreSQL.

### 3.1 Decision Matrix: Table Categorization

| Entity Concept | Table Name | Modeling Strategy | Rationale |
| :--- | :--- | :--- | :--- |
| **Colleges** | `colleges` | Independent Table | Root multi-tenant boundary. |
| **Departments** | `departments` | Independent Table | Second-tier organizational unit belonging to a college. |
| **Academic Levels** | `academic_levels` | Independent Table | Standardized grade/year levels (FE, SE, TE, BE, Grade 1-12). |
| **Academic Sessions** | `academic_sessions` | Independent Table | Time periods (2024–2025, 2025–2026, 2026–2027). |
| **Subjects** | `subjects` | Independent Table | Normalized subject master per department. |
| **User Profiles** | `profiles` | Independent Table | Application profile extending Supabase `auth.users`. |
| **Roles** | `app_role` (ENUM) | PostgreSQL ENUM | System roles: `'COLLEGE_ADMIN'`, `'HOD'`, `'TEACHER'`, `'STUDENT'`. |
| **HOD Assignments** | `hod_assignments` | Historical Junction Table | Tracks active & historical HOD assignments per department. |
| **Teacher Profiles** | `teacher_profiles` | Profile Extension Table | Teacher metadata (Employee ID, Designation). |
| **Student Profiles** | `student_profiles` | Profile Extension Table | Student metadata (Student ID, Roll No, Current Level). |
| **Teacher Assignments**| `teacher_subject_class_assignments` | Junction Table | Maps Teacher → Subject → Academic Level → Session. |
| **Student Enrollments** | `student_subject_assignments` | Junction Table | Maps Student → Academic Level → Session → Subject → Teacher. |
| **Quizzes** | `quizzes` | Independent Table | Master quiz record created by a teacher. |
| **Quiz Questions** | `quiz_questions` | Independent Table | Question item attached to a quiz with JSONB game payload. |
| **Quiz Attempts** | `quiz_attempts` | Transactional Table | Header record for a student's quiz session (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`). |
| **Question Attempts** | `question_attempts` | Transactional Table | Detail record for individual question answers & mistakes. |
| **Notifications** | `notifications` | Transactional Table | Per-user notifications. |
| **Dashboard Analytics** | `vw_*` (Views) | PostgreSQL Views | Derived dynamically from transactional tables; NOT stored tables. |

---

## 4. Authentication Architecture & RLS Source of Truth

### 4.1 Authoritative Identity & Access Control Hierarchy

Supabase Auth manages user credentials and authentication in `auth.users`. The authoritative source of truth for authorization in ORIXA is the database relationship chain:

$$\text{auth.uid()} \longrightarrow \text{public.profiles} \longrightarrow \text{role / college\_id / department\_id}$$

```
                  ┌────────────────────────┐
                  │       auth.users       │
                  │ (Supabase Internal)    │
                  │ - id (UUID, PK)        │
                  │ - email                │
                  │ - encrypted_password   │
                  └───────────┬────────────┘
                              │ 1:1
                              ▼
                  ┌────────────────────────┐
                  │    public.profiles     │
                  │ - id (UUID, PK=FK)     │
                  │ - college_id (UUID, FK)│
                  │ - department_id (UUID) │
                  │ - role (app_role enum) │
                  │ - full_name            │
                  └───────────┬────────────┘
         ┌────────────────────┼────────────────────┐
     1:1 │ (Role = TEACHER)   │ 1:1 (Role = STUDENT)│ 1:1 (Role = HOD)
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ teacher_profiles │ │ student_profiles │ │  hod_assignments │
│ - employee_id    │ │ - student_id     │ │ - department_id  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 4.2 Role of JWT Claims vs. Database Relationships

- **JWT Claims (`auth.jwt()`):** May be used solely as optional performance optimizations or initial client context hints.
- **Database Tables (`public.profiles`):** Remain the strict, non-negotiable source of truth for all database security policies.
- **Mitigating Stale Token Claims:** Row Level Security (RLS) policies will query `public.profiles` (or security definer helper functions querying `public.profiles`) directly rather than blindly trusting `auth.jwt()`. This ensures that if an HOD or Teacher's department assignment or status changes, stale JWT claims cannot bypass authorization boundaries.

### 4.3 Security Directive: Password Storage

**CRITICAL SECURITY DIRECTIVE:** No passwords, plain text or hashed, shall ever be stored in ORIXA application tables (`public.profiles`, `teacher_profiles`, etc.). All credential management and password verification are handled exclusively by Supabase Auth (`auth.users`).

---

## 5. Access Control & Organizational Consistency

### 5.1 Organizational Hierarchy & Role Boundaries

1. **College Administration (`COLLEGE_ADMIN`):**
   - Scope: Access to all data where `college_id = profile.college_id`.
   - Access: College-wide student analytics, department management, teacher directory.
   - Cardinality: Multiple college administrators per college are permitted.

2. **Head of Department (`HOD`):**
   - Scope: Access restricted to `department_id = profile.department_id`.
   - Access: Department teachers, department students, teacher assignments, department performance analytics.
   - Cardinality: Exactly **one active HOD** per department at any given time (`UNIQUE (department_id) WHERE is_active = true` on `hod_assignments`). An HOD profile may have historical assignment records.

3. **Teacher (`TEACHER`):**
   - Scope: Access strictly restricted to students assigned to them via active `student_subject_assignments` and quizzes created by them (`quizzes.teacher_id = auth.uid()`).
   - Access: Quiz creation, question bank management, results for **their assigned students only**.
   - Restriction: Teachers **MUST NOT** see unassigned department students or students assigned to other teachers.

4. **Student (`STUDENT`):**
   - Scope: Access restricted strictly to their own student profile and assigned quizzes.
   - Access: View quizzes published for their enrolled subject/level/session, submit quiz attempts, view their own scores, XP, stars, and history.

### 5.2 Preventing Boundary Leakage via Composite Foreign Keys

To prevent organizational inconsistencies (such as a student being assigned a teacher from a different department or a subject from a different college), the database enforces composite foreign key relationships:

```sql
-- Departments belong to Colleges
ALTER TABLE departments
ADD CONSTRAINT uq_dept_college UNIQUE (id, college_id);

-- Subjects belong to Departments (and indirectly Colleges)
ALTER TABLE subjects
ADD CONSTRAINT uq_subject_dept UNIQUE (id, department_id);

-- Profiles belong to a College and Department
ALTER TABLE profiles
ADD CONSTRAINT uq_profile_college_dept UNIQUE (id, college_id, department_id);

-- Teacher Assignments enforce same College & Department
ALTER TABLE teacher_subject_class_assignments
ADD CONSTRAINT fk_teacher_assignment_dept
FOREIGN KEY (teacher_id, department_id)
REFERENCES profiles(id, department_id);

-- Student Assignments enforce same Subject & Teacher Scoping
ALTER TABLE student_subject_assignments
ADD CONSTRAINT fk_student_assignment_teacher
FOREIGN KEY (teacher_id, department_id)
REFERENCES profiles(id, department_id);
```

---

## 6. Assignment Uniqueness & Academic Scoping

### 6.1 Academic Level vs. Academic Session

To resolve ambiguity in academic terminology:

- **Academic Level (`academic_levels`):** Represents the student's year/grade of study (e.g., `FE`, `SE`, `TE`, `BE`, `Grade 5`, `Grade 8`). Independent of time.
- **Academic Session (`academic_sessions`):** Represents the calendar term year (e.g., `2024–2025`, `2025–2026`, `2026–2027`).

### 6.2 Teacher Assignment Uniqueness

A teacher can be assigned to teach a specific subject to a specific academic level in a specific academic session:

```sql
ALTER TABLE teacher_subject_class_assignments
ADD CONSTRAINT uq_teacher_subject_level_session
UNIQUE (teacher_id, subject_id, academic_level_id, academic_session_id);
```

- Field `is_active` (boolean, default `true`) allows deactivating assignments when terms change while preserving historical audit logs.

### 6.3 Student Assignment Uniqueness & Scoping

In accordance with ORIXA platform requirements, a student has **exactly one assigned teacher** for a given subject, academic level, and academic session:

```sql
ALTER TABLE student_subject_assignments
ADD CONSTRAINT uq_student_subject_level_session
UNIQUE (student_id, subject_id, academic_level_id, academic_session_id);
```

- Field `is_active` (boolean, default `true`) tracks active enrollment.
- Field `teacher_id` specifies the designated teacher responsible for that student's subject instruction.

---

## 7. Quiz Architecture & Availability Model

### 7.1 Quiz Lifecycle States

Quizzes follow a 4-stage lifecycle tracked by `quizzes.status`:

1. `DRAFT`: Quiz is being edited by the teacher; invisible to students.
2. `PUBLISHED`: Quiz is active and available for eligible students to attempt.
3. `CLOSED`: Quiz is no longer accepting new attempts; visible in student history.
4. `ARCHIVED`: Quiz is soft-deleted or hidden from primary management views.

### 7.2 Quiz Availability Rule (No Unnecessary Targeting Table)

A student sees a published quiz if and only if:

$$\begin{aligned}
\text{quiz.status} &= \text{'PUBLISHED'} \\
\land \text{quiz.subject\_id} &= \text{student\_assignment.subject\_id} \\
\land \text{quiz.academic\_level\_id} &= \text{student\_assignment.academic\_level\_id} \\
\land \text{quiz.academic\_session\_id} &= \text{student\_assignment.academic\_session\_id} \\
\land \text{quiz.teacher\_id} &= \text{student\_assignment.teacher\_id}
\end{aligned}$$

No separate targeting junction table is required; availability is cleanly derived from the existing relational assignment model.

---

## 8. Quiz Chances & Game Payload JSONB Validation

### 8.1 Source of Truth for Max Chances

Teacher-configured chances control student gameplay attempts per question:

- **Quiz Default Chances:** Stored in `quizzes.default_max_chances` (INTEGER, default `3`).
- **Question Chance Override:** Stored in `quiz_questions.max_chances` (INTEGER, NULLable).
- **Effective Max Chances Formula:** `COALESCE(quiz_questions.max_chances, quizzes.default_max_chances)`.

### 8.2 Game Payload Validation Specification

All four ORIXA game types store game-specific content inside `quiz_questions.game_payload` (JSONB). PostgreSQL validation functions (`fn_validate_game_payload()`) enforce structural integrity prior to insert or update.

#### 1. Tile Puzzle (`TILE_PUZZLE`)
- **Required JSON Structure:**
  ```json
  {
    "options": ["Earth", "Jupiter", "Mars", "Saturn"],
    "correct_option_index": 1
  }
  ```
- **Validation Rules:**
  - `options` must be a JSON array of strings containing between 2 and 6 items.
  - `correct_option_index` must be an integer where $0 \le \text{correct\_option\_index} < \text{options.length}$.

#### 2. Match the Following (`MATCH_FOLLOWING`)
- **Required JSON Structure (Collection of Pairs):**
  ```json
  {
    "pairs": [
      { "id": "p1", "prompt": "CPU", "correct_match": "Central Processing Unit" },
      { "id": "p2", "prompt": "RAM", "correct_match": "Random Access Memory" },
      { "id": "p3", "prompt": "GPU", "correct_match": "Graphics Processing Unit" }
    ]
  }
  ```
- **Validation Rules:**
  - `pairs` must be a JSON array containing at least 2 pair objects.
  - Each pair object must contain non-empty string fields `id`, `prompt`, and `correct_match`.

#### 3. Fill in the Blanks (`FILL_BLANKS`)
- **Required JSON Structure:**
  ```json
  {
    "sentence_tokens": ["The", "{blank}", "is", "the", "center", "of", "our", "solar", "system."],
    "correct_words": ["Sun"],
    "distractors": ["Moon", "Earth", "Mars"]
  }
  ```
- **Validation Rules:**
  - `sentence_tokens` must be a JSON array of strings containing at least one `"{blank}"` token.
  - `correct_words` must be a JSON array of strings with length matching the count of `"{blank}"` tokens in `sentence_tokens`.
  - `distractors` must be a JSON array of strings.

#### 4. True or False (`TRUE_FALSE`)
- **Required JSON Structure:**
  ```json
  {
    "statement": "The Battle of Hastings was fought in 1066.",
    "correct_boolean": true
  }
  ```
- **Validation Rules:**
  - `statement` must be a non-empty string.
  - `correct_boolean` must be a strict JSON boolean (`true` or `false`).

---

## 9. Scoring Engine & Attempt Lifecycle

### 9.1 Gameplay Scoring Preservation

The exact frontend scoring logic in `student-portal.js` is preserved:

1. **Question Score Ratio:**
   $$\text{ratio} = \begin{cases} 0 & \text{if NOT solved (chance exhaustion)} \\ \max\left(0,\, 1.0 - 0.25 \times \text{mistakes}\right) & \text{if solved} \end{cases}$$
2. **Earned XP:**
   $$\text{Earned XP} = \text{Math.round}\left(\sum \frac{\text{Total Possible XP}}{\text{Total Questions}} \times \text{ratio}\right)$$
3. **Accuracy Percentage:**
   $$\text{Accuracy \%} = \text{Math.round}\left(\frac{\sum \text{ratio}}{\text{Total Questions}} \times 100\right)$$
4. **Star Thresholds:**
   $$\text{Stars} = \begin{cases} 3 & \text{if Earned XP \%} > 90\% \\ 2 & \text{if Earned XP \%} \ge 66.66\% \\ 1 & \text{if Earned XP \%} \ge 33.33\% \\ 0 & \text{if Earned XP \%} < 33.33\% \end{cases}$$

### 9.2 Attempt vs. Finalized Result Storage

- **Transactional Header Table (`quiz_attempts`):**
  - Fields: `id`, `student_id`, `quiz_id`, `status` (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`), `started_at`, `completed_at`, `final_earned_xp`, `final_accuracy_pct`, `final_stars`.
- **Transactional Detail Table (`question_attempts`):**
  - Fields: `id`, `attempt_id`, `question_id`, `selected_answer_json`, `mistakes_count`, `is_solved`, `chances_used`.
- **Retake Policy & Frontend Alignment:**
  - In accordance with current ORIXA frontend behavior, a completed quiz disappears from the student's active quest grid and moves to history/results.
  - Enforced via: `UNIQUE (student_id, quiz_id) WHERE status = 'COMPLETED'`.
  - When a quiz is completed, `final_earned_xp`, `final_accuracy_pct`, and `final_stars` are computed and stored as an immutable snapshot on `quiz_attempts`, preserving historical results even if quiz questions are edited later.

---

## 10. Identifier Strategy & Domain Code Preservation

All database tables use PostgreSQL UUIDs (`gen_random_uuid()`) as primary keys for security and global uniqueness. Existing human-readable domain codes are preserved as unique domain attributes.

| Entity | Primary Key | Domain Identifier | Example Code | Uniqueness Constraint |
| :--- | :--- | :--- | :--- | :--- |
| **College** | `id` (UUID) | `code` (VARCHAR) | `'jspmntc'` | UNIQUE system-wide |
| **Department** | `id` (UUID) | `code` (VARCHAR) | `'jspmntccs'` | UNIQUE per college |
| **Academic Level**| `id` (UUID) | `code` (VARCHAR) | `'FE'`, `'SE'`, `'Grade 8'` | UNIQUE per college |
| **Academic Session**| `id` (UUID)| `code` (VARCHAR) | `'2024-2025'` | UNIQUE per college |
| **Teacher** | `profile_id` (UUID) | `employee_id` (VARCHAR) | `'EMP-CS-01'` | UNIQUE per college |
| **Student** | `profile_id` (UUID) | `student_id` (VARCHAR) | `'STU-CS-101'` | UNIQUE per college |
| **Subject** | `id` (UUID) | `code` (VARCHAR) | `'SUB-CS-101'` | UNIQUE per department |

---

## 11. Data Integrity & Constraint Matrix

| Table Name | Primary Key | Foreign Keys | Unique Constraints | CHECK / Rule Constraints | ON DELETE |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `colleges` | `id` (UUID) | None | `code` | `length(code) >= 2` | RESTRICT |
| `departments` | `id` (UUID) | `college_id` | `(college_id, code)` | `length(code) >= 2` | RESTRICT |
| `academic_levels` | `id` (UUID) | `college_id` | `(college_id, code)` | None | RESTRICT |
| `academic_sessions` | `id` (UUID) | `college_id` | `(college_id, code)` | `end_date > start_date` | RESTRICT |
| `subjects` | `id` (UUID) | `department_id` | `(department_id, code)` | None | RESTRICT |
| `profiles` | `id` (UUID) | `college_id`, `department_id` | None | `role IN ('COLLEGE_ADMIN', 'HOD', 'TEACHER', 'STUDENT')` | CASCADE (Auth) |
| `hod_assignments` | `id` (UUID) | `profile_id`, `department_id` | `(department_id) WHERE is_active=true` | Single active HOD per dept | RESTRICT |
| `teacher_profiles`| `profile_id` | `college_id` | `(college_id, employee_id)` | None | CASCADE |
| `student_profiles`| `profile_id` | `college_id`, `academic_level_id` | `(college_id, student_id)` | None | CASCADE |
| `teacher_subject_class_assignments` | `id` (UUID) | `teacher_id`, `subject_id`, `academic_level_id`, `academic_session_id` | `(teacher_id, subject_id, academic_level_id, academic_session_id)` | None | CASCADE |
| `student_subject_assignments` | `id` (UUID) | `student_id`, `subject_id`, `academic_level_id`, `academic_session_id`, `teacher_id` | `(student_id, subject_id, academic_level_id, academic_session_id)` | Single teacher per student/subject/level/term | CASCADE |
| `quizzes` | `id` (UUID) | `college_id`, `department_id`, `teacher_id`, `subject_id`, `academic_level_id`, `academic_session_id` | None | `status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED')` | RESTRICT |
| `quiz_questions` | `id` (UUID) | `quiz_id` | `(quiz_id, question_order)` | `fn_validate_game_payload()` | CASCADE |
| `quiz_attempts` | `id` (UUID) | `student_id`, `quiz_id` | `(student_id, quiz_id) WHERE status='COMPLETED'` | `status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')` | CASCADE |
| `question_attempts`| `id` (UUID) | `attempt_id`, `question_id` | `(attempt_id, question_id)` | `mistakes_count >= 0` | CASCADE |
| `notifications` | `id` (UUID) | `user_id` (profile_id) | None | `priority IN ('Normal', 'Important')` | CASCADE |

---

## 12. Multi-College Tenant Isolation Architecture

Tenant isolation is built directly into all table schemas by attaching `college_id` foreign keys to `departments`, `profiles`, `academic_levels`, `academic_sessions`, `quizzes`, and `quiz_attempts`.

At the database level, Supabase Row Level Security (RLS) policies enforce:

```sql
-- Conceptual RLS Policy Blueprint
CREATE POLICY tenant_isolation_policy ON quizzes
FOR ALL TO authenticated
USING (
  college_id = (
    SELECT college_id FROM public.profiles WHERE id = auth.uid()
  )
);
```

This prevents any possibility of cross-college data leaks even in the event of client-side filtering errors.

---

## 13. Analytics & Reporting Architecture

All dashboard analytics are dynamically calculated from transactional tables using PostgreSQL Views rather than redundant stored metric tables:

1. **`vw_college_analytics` (College Admin Dashboard):** Calculates total department count, active teacher count, student count, and average accuracy % per college.
2. **`vw_department_analytics` (HOD Dashboard):** Calculates student count, teacher count, subject count, and average quiz performance per department.
3. **`vw_teacher_performance` (Teacher Dashboard):** Aggregates total quizzes published, total student attempts, pass rate, and average score per teacher.
4. **`vw_student_leaderboard` (Student Portal):** Computes total XP earned, total stars accumulated, completed quiz count, and overall accuracy % per student.

---

## 14. Excel Import Compatibility & Resolution Mechanics

The frontend HOD interface includes Excel bulk imports for Faculty and Students. Server-side import resolution processes raw text rows into relational records within a single database transaction:

```
[Excel Row Uploaded]
       │
       ▼
1. Validate required string fields (Non-empty checks).
       │
       ▼
2. Bind HOD session context (college_id, department_id).
       │
       ▼
3. Resolve Foreign Keys via exact/case-insensitive matching:
   - Subject: SELECT id FROM subjects WHERE name ILIKE row.subject AND department_id = hod.department_id
   - Level: SELECT id FROM academic_levels WHERE code ILIKE row.year AND college_id = hod.college_id
   - Session: SELECT id FROM academic_sessions WHERE is_current = true AND college_id = hod.college_id
   - Teacher: SELECT profile_id FROM teacher_profiles WHERE employee_id = row.teacher_empid
       │
       ▼
4. Execute transactional INSERT / UPSERT into profiles, student_profiles, and student_subject_assignments.
```

---

## 15. Current Frontend Mock → Future Database Mapping Matrix

| Current Frontend / Mock Concept | Current Source File | Proposed Database Table & Column | Mapping Notes |
| :--- | :--- | :--- | :--- |
| `MOCK_COLLEGE_DATA.collegeInfo` | `college-dashboard.js` | `public.colleges` | `id` → `code`, UUID primary key generated. |
| `MOCK_COLLEGE_DATA.departments` | `college-dashboard.js` | `public.departments` | `hodName` & `hodEmpId` resolved to `profiles.id` via `hod_assignments`. |
| `HOD_MOCK_DATA.teachers` | `hod-dashboard.js` | `public.profiles` + `teacher_profiles` | `empId` stored in `teacher_profiles.employee_id`. |
| `HOD_MOCK_DATA.teachers.subjects` | `hod-dashboard.js` | `teacher_subject_class_assignments` | Converted from string array to relational rows. |
| `HOD_MOCK_DATA.students` | `hod-dashboard.js` | `public.profiles` + `student_profiles` | `studentId` stored in `student_profiles.student_id`. |
| `HOD_MOCK_DATA.students.teacher` | `hod-dashboard.js` | `student_subject_assignments` | Converted from string to `teacher_id` UUID FK. |
| `MOCK_DATA.quizzes` | `teacher-dashboard.js` | `public.quizzes` | Includes `game_type` enum and quiz settings. |
| `MOCK_DATA.questionBank` | `teacher-dashboard.js` | `public.quiz_questions` | Options/pairs/tokens stored in `game_payload` JSONB. |
| `MOCK_DATA.results` | `teacher-dashboard.js` | `public.quiz_attempts` | Transactional attempt dates & snapshot scores recorded. |
| `MOCK_DATA.notifications` | `teacher-dashboard.js` | `public.notifications` | Bound to `user_id` FK. |
| `orixa_completed_quizzes` | `localStorage` | `public.quiz_attempts` | Replaces client-side `localStorage` array. |

---

## 16. Proposed Schema Text-Based ER Diagram (ERD)

```
================================================================================================
                                          COLLEGES
                                          - id (UUID, PK)
                                          - code (VARCHAR, UNIQUE)
                                          - name (VARCHAR)
================================================================================================
       │                                     │                                      │
       │ 1:N                                 │ 1:N                                  │ 1:N
       ▼                                     ▼                                      ▼
DEPARTMENTS                           ACADEMIC_LEVELS                        ACADEMIC_SESSIONS
- id (UUID, PK)                       - id (UUID, PK)                        - id (UUID, PK)
- college_id (FK)                     - college_id (FK)                      - college_id (FK)
- code (VARCHAR)                      - code (VARCHAR)                       - code (VARCHAR)
- name (VARCHAR)                      - display_name (VARCHAR)               - is_current (BOOLEAN)
       │                                     │                                      │
       │ 1:N                                 │                                      │
       ▼                                     │                                      │
SUBJECTS                                     │                                      │
- id (UUID, PK)                              │                                      │
- department_id (FK)                         │                                      │
- code (VARCHAR)                             │                                      │
- name (VARCHAR)                             │                                      │
       │                                     │                                      │
       │                                     │                                      │
       │                                     ▼                                      │
       │                              PROFILES <────────────────────────────────────┘
       │                              - id (UUID, PK) -> auth.users
       │                              - college_id (FK)
       │                              - department_id (FK)
       │                              - role (app_role ENUM)
       │                              - full_name (VARCHAR)
       │                                 │
       │        ┌────────────────────────┼────────────────────────┐
       │        │ 1:1                    │ 1:1                    │ 1:N
       │        ▼                        ▼                        ▼
       │ TEACHER_PROFILES         STUDENT_PROFILES         HOD_ASSIGNMENTS
       │ - profile_id (FK)        - profile_id (FK)        - id (UUID, PK)
       │ - employee_id (VARCHAR)  - student_id (VARCHAR)   - profile_id (FK)
       │                          - academic_level_id (FK) - department_id (FK)
       │                                 │                 - is_active (BOOLEAN)
       │                                 │
       ├─────────────────────────────────┼──────────────────────────────────┐
       │                                 │                                  │
       │ 1:N                             │ 1:N                              │ 1:N
       ▼                                 ▼                                  ▼
TEACHER_SUBJECT_CLASS_ASSIGNMENTS  STUDENT_SUBJECT_ASSIGNMENTS          QUIZZES
- id (UUID, PK)                    - id (UUID, PK)                      - id (UUID, PK)
- teacher_id (FK -> profiles)      - student_id (FK -> profiles)        - college_id (FK)
- subject_id (FK -> subjects)      - subject_id (FK -> subjects)        - department_id (FK)
- academic_level_id (FK)           - academic_level_id (FK)             - teacher_id (FK -> profiles)
- academic_session_id (FK)         - academic_session_id (FK)           - subject_id (FK)
- is_active (BOOLEAN)              - teacher_id (FK -> profiles)        - academic_level_id (FK)
                                   - is_active (BOOLEAN)                - academic_session_id (FK)
                                                                        - title (VARCHAR)
                                                                        - status (ENUM)
                                                                        - game_type (ENUM)
                                                                        - default_max_chances (INT)
                                                                        - settings (JSONB)
                                                                               │
                                                   ┌───────────────────────────┤
                                                   │ 1:N                       │ 1:N
                                                   ▼                           ▼
                                            QUIZ_QUESTIONS              QUIZ_ATTEMPTS
                                            - id (UUID, PK)             - id (UUID, PK)
                                            - quiz_id (FK)              - quiz_id (FK)
                                            - question_order (INT)      - student_id (FK -> profiles)
                                            - max_chances (INT, NULL)   - status (ENUM)
                                            - game_payload (JSONB)      - started_at (TIMESTAMPTZ)
                                                                        - completed_at (TIMESTAMPTZ)
                                                                        - final_earned_xp (INT)
                                                                        - final_accuracy_pct (INT)
                                                                        - final_stars (INT)
                                                                               │
                                                                               │ 1:N
                                                                               ▼
                                                                        QUESTION_ATTEMPTS
                                                                        - id (UUID, PK)
                                                                        - attempt_id (FK)
                                                                        - question_id (FK)
                                                                        - selected_answer_json (JSONB)
                                                                        - mistakes_count (INT)
                                                                        - is_solved (BOOLEAN)
================================================================================================
```

---

## 17. Migration Readiness Checklist

Before proceeding to Phase 3 (SQL Migration Generation), all 22 architectural prerequisites have been verified:

- [x] **Tenant model defined:** Multi-college isolation via `college_id` FK on all root tables.
- [x] **Authentication model defined:** `auth.users` mapped 1:1 to `public.profiles`.
- [x] **Role model defined:** PostgreSQL ENUM (`'COLLEGE_ADMIN'`, `'HOD'`, `'TEACHER'`, `'STUDENT'`).
- [x] **Department/HOD model defined:** Single active HOD per department via `hod_assignments`.
- [x] **Teacher model defined:** `teacher_profiles` with unique `employee_id` per college.
- [x] **Student model defined:** `student_profiles` with unique `student_id` per college.
- [x] **Academic level/session model defined:** Distinct `academic_levels` and `academic_sessions` tables.
- [x] **Subject model defined:** Normalized `subjects` table per department.
- [x] **Teacher assignment model defined:** `teacher_subject_class_assignments` with uniqueness constraint.
- [x] **Student assignment model defined:** `student_subject_assignments` with single-teacher scoping per subject/level/session.
- [x] **Quiz lifecycle defined:** 4 states (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`).
- [x] **Quiz availability defined:** Derived from student-subject-level-session assignment matching.
- [x] **Question/game model defined:** Hybrid common `quiz_questions` table + JSONB payload.
- [x] **Game payload validation defined:** Strict JSON schemas & validation rules for all 4 game types.
- [x] **Attempt model defined:** States (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`) and retake restrictions.
- [x] **Scoring storage/derivation defined:** Exact formulas preserved; finalized attempt snapshots persisted on completion.
- [x] **Notification model defined:** Bound to `user_id` FK with priorities.
- [x] **Analytics model defined:** Derived PostgreSQL views (`vw_*`).
- [x] **Excel compatibility defined:** Transactional string resolution to relational UUID foreign keys.
- [x] **RLS strategy defined conceptually:** Security policies based on `public.profiles` relationships.
- [x] **Multi-college isolation defined:** Composite foreign keys and database-level RLS policies.
- [x] **No unresolved schema-critical ambiguity remains:** Architecture is fully specified and ready for SQL migration generation.

---

## 18. Phase Boundaries & Exclusion Scope

The following items are **INTENTIONALLY EXCLUDED** from Phase 2A and will be executed in subsequent development phases:

- Executing SQL `CREATE TABLE` statements in PostgreSQL
- Generating physical `.sql` migration files
- Creating Supabase Auth users
- Applying Row Level Security (RLS) SQL policies
- Writing database seed scripts
- Executing remote Supabase CLI commands (`supabase link`, `supabase db push`)
- Modifying frontend HTML, CSS, or JavaScript files
- Altering existing mock data objects or client-side `localStorage` keys

---

## 19. Conclusion

This corrected database architecture specification eliminates all ambiguity, enforces database-level organizational consistency, supports all four ORIXA game engines, preserves exact scoring rules, and establishes a secure multi-tenant PostgreSQL/Supabase foundation ready for SQL migration generation in Phase 3.
