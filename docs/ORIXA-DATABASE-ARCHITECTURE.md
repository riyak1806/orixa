# ORIXA — PostgreSQL & Supabase Database Architecture Design Specification

## Document Control & Overview

- **Project:** ORIXA Educational Gaming & Platform
- **Phase:** Phase 2 — Database Architecture Design and Data Model Audit
- **Author:** Jules (Software Engineer)
- **Status:** Architecture Design Specification (Design-Only, Read-Only with respect to Application Code & Database Execution)

---

## 1. Executive Summary & Architectural Overview

The ORIXA platform is expanding from a client-side prototype using in-memory mock datasets and `localStorage` persistence into a multi-tenant PostgreSQL relational architecture powered by Supabase.

This document presents a comprehensive audit of the existing codebase structures across the General College Administration (`college-dashboard.js`), HOD Dashboard (`hod-dashboard.js`), Teacher Portal (`teacher-dashboard.js`), Student Portal (`student-portal.js`), and Authentication flows (`college-login.html`, `hod-login.html`, `teacher-login.html`, `student-login.html`).

Based on this audit, we specify a normalized PostgreSQL database design for production deployment. The architecture enforces multi-college tenant isolation, role-based access boundaries (College Admin → HOD → Teacher → Student), student-teacher-subject assignment boundaries, support for all four ORIXA game types (Tile Puzzle, Match the Following, Fill in the Blanks, True or False), and exact score/XP/star retention while preserving user-visible human-readable identifiers.

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
- **Discrepancy:** Subjects and years assigned to teachers are stored as arrays of raw text strings (`subjects: ['Data Structures']`, `years: ['1st Year']`). In the database, these must be relational junction tables (`teacher_subject_class_assignments`) referencing normalized `subjects` and `academic_years` tables.

#### 5. Students (`hod-dashboard.js`, `teacher-dashboard.js`, `student-portal.js`, `student.js`)
- **Current State:**
  - In `hod-dashboard.js`: `{ id: 'STU-CS-101', name: 'Aarav Sharma', studentId: 'STU-CS-101', year: '1st Year', subject: 'Data Structures', teacher: 'Prof. Sarah Jenkins' }`.
  - In `teacher-dashboard.js`: `{ id: 'STU-001', name: 'Aarav Sharma', grade: 'Grade 8', section: 'A', rollNo: '801', status: 'Active', avgScore: 88, quizzesTaken: 14 }`.
  - In `student-portal.js`: Hardcoded student profile `{ name: "Aarav Sharma", id: "STU-80214", grade: "Grade 8 - Section A", department: "Computer Engineering", year: "2025-2026" }`.
- **Discrepancy:** Student records contain redundant and inconsistent grade/year labels (`1st Year` vs `Grade 8`) and store assigned teachers and subjects as flat text strings (`teacher: 'Prof. Sarah Jenkins'`). In the relational model, students belong to a `college` and `department`, have a single `student_profiles` row, and enroll in subjects via normalized enrollment junction tables.

#### 6. Subjects & Academic Years (`college-dashboard.js`, `hod-dashboard.js`, `teacher-dashboard.js`)
- **Current State:** Subjects (`Data Structures`, `DBMS`, `AI`, `Science`, `Maths`) and Academic Years (`1st Year`, `2nd Year`, `FE`, `SE`, `TE`, `BE`, `Grade 8`) exist strictly as free-form strings scattered across JS arrays.
- **Discrepancy:** Free-form text allows typos and prevents multi-department query joining. They must be normalized into `subjects` and `academic_years` lookup tables within each department/college.

#### 7. Teacher & Student Assignments (`hod-dashboard.js`)
- **Current State:** `hod-dashboard.js` creates assignments by attaching `teacher` (string) and `subject` (string) directly onto the student object in `HOD_MOCK_DATA.students`.
- **Discrepancy:** Flat string assignment prevents multi-teacher subject splitting (e.g., Teacher A teaching DBMS to 2nd Year vs Teacher B teaching AI to 2nd Year). The proposed relational design uses a `student_subject_assignments` junction table linking `student_id`, `subject_id`, `academic_year_id`, and `teacher_id`.

#### 8. Quizzes & Game Types (`teacher-dashboard.js`, `student-portal.js`)
- **Current State:**
  - `teacher-dashboard.js` tracks active quizzes (`MOCK_DATA.quizzes`), past quizzes (`MOCK_DATA.pastQuizzes`), and quiz creation state (`createQuizState`). Supported game types: `'TILE_PUZZLE'`, `'MATCH_FOLLOWING'`, `'FILL_BLANKS'`, `'TRUE_FALSE'`.
  - Questions are stored in `MOCK_DATA.questionBank` or inside `createQuizState.questions`.
- **Discrepancy:** Questions in `questionBank` have fixed multiple-choice fields (`options: [...]`, `correctAnswer: index`), while game builder states use type-specific JSON structures (e.g., pairs for Match, tokens for Fill-in-blanks, statements for T/F). The relational model unifies quiz metadata in a `quizzes` table and uses a `quiz_questions` table with JSONB payloads for game-type-specific structure.

#### 9. Quiz Attempts, Scores & Results (`teacher-dashboard.js`, `student-portal.js`)
- **Current State:**
  - `MOCK_DATA.results` in `teacher-dashboard.js` stores student quiz attempts with overall percentage, score, correct/incorrect counts, and a nested `questionsBreakdown` array.
  - `student-portal.js` calculates live XP, accuracy %, and stars in-memory using `calculateQuizResults()`, saving completed quiz IDs to `localStorage` key `'orixa_completed_quizzes'`.
- **Discrepancy:** Frontend computes and stores pre-aggregated values (`avgAccuracy`, `totalXp`) directly in mock data. The database architecture stores raw attempt events and question-level responses (`quiz_attempts` and `question_attempts`), deriving aggregate stats dynamically or via database views.

#### 10. Notifications (`teacher-dashboard.js`)
- **Current State:** Stored in `MOCK_DATA.notifications` with fields `id`, `title`, `message`, `category`, `priority`, `read` (boolean), `timestamp`, `dateStr`, and `target`.
- **Discrepancy:** Notifications are global in mock data. In production, notifications must belong to a specific user (`user_id`) with foreign key constraints.

---

## 3. Relational Data Model & Entity Specifications

The proposed relational model normalizes ORIXA into 16 core entities structured under PostgreSQL.

### 3.1 Decision Matrix: Table Categorization

| Entity Concept | Modeling Strategy | Rationale |
| :--- | :--- | :--- |
| **Colleges** | Independent Table (`colleges`) | Root multi-tenant boundary. |
| **Departments** | Independent Table (`departments`) | Second-tier organizational unit belonging to a college. |
| **Academic Years / Classes** | Independent Table (`academic_years`) | Standardized year/class levels per college (e.g., FE, SE, TE, BE, Grade 1-12). |
| **Subjects** | Independent Table (`subjects`) | Normalized subject master per department. |
| **User Profiles** | Independent Table (`profiles`) | Application profile extending Supabase `auth.users`. |
| **Roles** | Enum / Check Constraint (`app_role`) | System roles: `'COLLEGE_ADMIN'`, `'HOD'`, `'TEACHER'`, `'STUDENT'`. |
| **Teacher Profiles** | Specific Profile Extension (`teacher_profiles`) | Teacher-specific metadata (Employee ID, Designation). |
| **Student Profiles** | Specific Profile Extension (`student_profiles`) | Student-specific metadata (Student ID, Roll No, Current Year). |
| **Teacher Assignments** | Junction Table (`teacher_subject_class_assignments`) | Maps Teacher → Subject → Academic Year. |
| **Student Enrollments** | Junction Table (`student_subject_assignments`) | Maps Student → Academic Year → Subject → Teacher. |
| **Quizzes** | Independent Table (`quizzes`) | Master quiz record created by a teacher. |
| **Quiz Questions** | Independent Table (`quiz_questions`) | Question item attached to a quiz with JSONB game payload. |
| **Quiz Attempts** | Transactional Table (`quiz_attempts`) | Header record for a student's quiz session. |
| **Question Attempts** | Transactional Table (`question_attempts`) | Detail record for individual question answers & mistakes. |
| **Notifications** | Transactional Table (`notifications`) | Per-user notifications. |
| **Dashboard Analytics** | PostgreSQL Views (`vw_*`) | Derived dynamically from transactional tables; NOT stored tables. |

---

## 4. Authentication Architecture

### 4.1 Supabase Auth vs. ORIXA Profiles

Supabase Auth manages user credentials, JWT tokens, and login sessions in its isolated `auth.users` schema. ORIXA application metadata resides in the `public` schema.

```
                  ┌────────────────────────┐
                  │       auth.users       │
                  │ (Supabase Internal)    │
                  │ - id (UUID)            │
                  │ - email                │
                  │ - encrypted_password   │
                  └───────────┬────────────┘
                              │ 1:1
                              ▼
                  ┌────────────────────────┐
                  │    public.profiles     │
                  │ - id (UUID, FK)        │
                  │ - college_id (UUID)    │
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

### 4.2 Auth Metadata vs. Application Tables

- **In `auth.users` / JWT User Metadata:**
  - `sub` (User UUID)
  - `email`
  - `role` (for fast initial RLS checks in JWT token claims)
  - `college_id` (for fast multi-tenant RLS checks)
- **In `public.profiles` & Sub-tables:**
  - `full_name`
  - `department_id`
  - Domain codes (`employee_id`, `student_id`)
  - Status flags (`is_active`)
  - Profile settings and preferences
- **CRITICAL SECURITY DIRECTIVE:** No passwords or password hashes shall ever be stored in ORIXA application tables. All password authentication is strictly handled by Supabase Auth (`auth.users`).

---

## 5. Access Control & Authorization Model

### 5.1 Organizational Hierarchy

```
College Administration (COLLEGE_ADMIN)
         │
         ▼
      College
         │
         ▼
    Departments
         │
         ▼
    HOD (HOD)
         │
         ▼
     Teachers (TEACHER)
         │
         ▼
 Assigned Students (STUDENT)
```

### 5.2 Role Access Boundaries

1. **College Administration (`COLLEGE_ADMIN`):**
   - Scope: Complete read/write access to all data within their assigned `college_id`.
   - Access: College-wide student performance, department management, teacher directory, college-wide analytics.
   - Restriction: Cannot access data belonging to other colleges (`college_id` mismatch).

2. **Head of Department (`HOD`):**
   - Scope: Read/write access within their assigned `department_id`.
   - Access: Department teachers, department students, teacher-subject assignments, student-teacher assignments, department performance analytics.
   - Restriction: Cannot access or manage teachers, students, or performance of other departments.

3. **Teacher (`TEACHER`):**
   - Scope: Access strictly restricted to students assigned to them via `student_subject_assignments` and quizzes created by them.
   - Access: Create/manage quizzes for their assigned subjects/years, view quiz results and performance for **their assigned students only**.
   - Restriction: **MUST NOT** automatically see every student in the department or students assigned to other teachers.

4. **Student (`STUDENT`):**
   - Scope: Access restricted strictly to their own student record.
   - Access: View quizzes published for their enrolled subjects/years, submit quiz attempts, view their own scores, XP, stars, and history.
   - Restriction: Cannot view other students' attempts or access teacher/HOD administrative views.

### 5.3 PostgreSQL Row Level Security (RLS) Strategy

The authorization boundaries will be enforced at the database layer using Supabase Row Level Security policies.

- **Tenant Isolation Policy:** Every query checks `college_id = (auth.jwt() ->> 'college_id')::uuid`.
- **HOD Department Policy:** Queries check `department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid())`.
- **Teacher Student Assignment Policy:** Teachers can only query `student_profiles` where `student_id` exists in `student_subject_assignments` matching `teacher_id = auth.uid()`.
- **Student Ownership Policy:** Students can only query `quiz_attempts` where `student_id = auth.uid()`.

---

## 6. Student-Subject-Teacher Assignment Modeling

### 6.1 The Relational Assignment Architecture

To support the requirement where Teacher A teaches DBMS to 2nd Year students and Teacher B teaches AI to 2nd Year students without granting Teacher A access to Teacher B's students, we introduce two relational junction entities:

```
1. TEACHER_SUBJECT_CLASS_ASSIGNMENTS
   - id (UUID, PK)
   - teacher_id (UUID, FK -> profiles.id)
   - subject_id (UUID, FK -> subjects.id)
   - academic_year_id (UUID, FK -> academic_years.id)

2. STUDENT_SUBJECT_ASSIGNMENTS (Enrollments)
   - id (UUID, PK)
   - student_id (UUID, FK -> profiles.id)
   - subject_id (UUID, FK -> subjects.id)
   - academic_year_id (UUID, FK -> academic_years.id)
   - teacher_id (UUID, FK -> profiles.id)
```

### 6.2 Scenario Demonstration

Consider 2nd Year Computer Engineering students:

- **Subject 1:** DBMS (`subject_id = SUB-DBMS-UUID`)
- **Subject 2:** AI (`subject_id = SUB-AI-UUID`)
- **Year:** 2nd Year (`academic_year_id = YEAR-2-UUID`)
- **Teacher A:** `teacher_id = TEACHER-A-UUID`
- **Teacher B:** `teacher_id = TEACHER-B-UUID`
- **Student Rahul:** enrolled in DBMS with Teacher A → Entry: `(Rahul, SUB-DBMS-UUID, YEAR-2-UUID, TEACHER-A-UUID)`
- **Student Priya:** enrolled in AI with Teacher B → Entry: `(Priya, SUB-AI-UUID, YEAR-2-UUID, TEACHER-B-UUID)`

**Access Control Enforcement:**
When Teacher A views their student list, the database executes:
```sql
SELECT s.*
FROM student_profiles s
JOIN student_subject_assignments ssa ON s.profile_id = ssa.student_id
WHERE ssa.teacher_id = 'TEACHER-A-UUID';
```
This returns **Rahul only**. Priya is completely invisible to Teacher A because her assignment row specifies `TEACHER-B-UUID`.

---

## 7. Quiz & Game Types Architecture

### 7.1 Supporting All Four Game Types

ORIXA features four distinct game engines:

1. **Tile Puzzle (`TILE_PUZZLE`):** Grid of tiles revealing a background image; each tile opens a multiple-choice question.
2. **Match the Following (`MATCH_FOLLOWING`):** Two columns where students connect questions/prompts on the left to correct answers on the right.
3. **Fill in the Blanks (`FILL_BLANKS`):** Sentences containing blank tokens, evaluated against option chips.
4. **True or False (`TRUE_FALSE`):** Single statements evaluated as TRUE or FALSE choices.

### 7.2 Modeling Evaluation: Hybrid Relational + JSONB Approach

We evaluated three structural approaches:

1. *Separate Question Tables per Game Type:* Causes table sprawl and breaks generic quiz-attempt foreign keys.
2. *Pure Relational Schema (options/pairs table):* Over-engineers game-specific layout states and increases query join complexity.
3. *Hybrid Schema (Common Table + JSONB Payload):* **RECOMMENDED.** The core question metadata is normalized, while game-type-specific structure is safely contained in a validated JSONB `game_payload` column.

```
                      ┌────────────────────────┐
                      │        quizzes         │
                      │ - id (UUID, PK)        │
                      │ - title                │
                      │ - game_type (enum)     │
                      │ - teacher_id (FK)      │
                      │ - subject_id (FK)      │
                      │ - academic_year_id (FK)│
                      │ - settings (JSONB)     │
                      └───────────┬────────────┘
                                  │ 1:N
                                  ▼
                      ┌────────────────────────┐
                      │     quiz_questions     │
                      │ - id (UUID, PK)        │
                      │ - quiz_id (FK)         │
                      │ - question_order (INT) │
                      │ - question_text        │
                      │ - max_chances (INT)    │
                      │ - game_payload (JSONB) │
                      └────────────────────────┘
```

### 7.3 Game Payload JSONB Structures

- **`TILE_PUZZLE` Payload:**
  `{ "options": ["Earth", "Jupiter", "Mars", "Saturn"], "correct_option_index": 1 }`
- **`MATCH_FOLLOWING` Payload:**
  `{ "prompt": "CPU", "correct_match": "Central Processing Unit" }`
- **`FILL_BLANKS` Payload:**
  `{ "sentence_tokens": ["The", "{blank}", "is", "the", "center"], "correct_words": ["Sun"], "distractors": ["Moon", "Earth"] }`
- **`TRUE_FALSE` Payload:**
  `{ "correct_boolean": true }`

---

## 8. Scoring Engine & Data Storage Specification

### 8.1 Audit of Existing Frontend Scoring Formulas

The student gameplay engine (`student-portal.js`) uses the following exact scoring rules:

1. **Question Score Ratio (`calculateQuestionScoreRatio`):**
   - If unsolved (`isSolved = false` due to chance exhaustion): `ratio = 0`
   - 0 mistakes (1st try correct): `ratio = 1.0` (100% XP)
   - 1 mistake: `ratio = 0.75` (75% XP)
   - 2 mistakes: `ratio = 0.50` (50% XP)
   - 3 mistakes: `ratio = 0.25` (25% XP)
   - $\ge 4$ mistakes: `ratio = 0.0` (0% XP)
   - Formula: $\text{ratio} = \max(0, 1.0 - 0.25 \times \text{mistakes})$

2. **Quiz Earned XP & Accuracy Calculation (`calculateQuizResults`):**
   - $\text{Max XP Per Question} = \frac{\text{Total Possible XP}}{\text{Total Questions}}$
   - $\text{Total Earned XP} = \text{Math.round}\left(\sum (\text{Max XP Per Question} \times \text{ratio})\right)$
   - $\text{Accuracy Percentage} = \text{Math.round}\left(\frac{\sum \text{ratio}}{\text{Total Questions}} \times 100\right)$

3. **Star Award Criteria (`calculateStarsFromXP`):**
   - Percentage Earned $\text{pct} = \frac{\text{Earned XP}}{\text{Total Possible XP}} \times 100$
   - $\text{pct} > 90\% \longrightarrow 3 \text{ Stars}$
   - $66.66\% \le \text{pct} \le 90\% \longrightarrow 2 \text{ Stars}$
   - $33.33\% \le \text{pct} < 66.66\% \longrightarrow 1 \text{ Star}$
   - $\text{pct} < 33.33\% \longrightarrow 0 \text{ Stars}$

4. **Chance Exhaustion Behavior:**
   - When a student reaches `max_chances` on a question without answering correctly, the question locks, is marked `is_solved = false`, awards `0 XP`, displays the correct answer feedback, and advances the game flow.

### 8.2 Authoritative Stored Data vs. Derived Values

To maintain data integrity and avoid sync errors, we separate stored transactional facts from calculated metrics:

#### Authoritative Stored Values (`quiz_attempts` & `question_attempts` tables)
- `attempt_id`, `student_id`, `quiz_id`, `started_at`, `completed_at`
- `question_id`, `selected_answer_json`, `mistakes_count`, `is_solved` (boolean), `chances_used`

#### Safely Derived / Calculated Values (Computed in SQL Views or API)
- Earned XP
- Accuracy %
- Star Rating (0 to 3)
- Total Quiz Duration
- Pass / Fail Status

---

## 9. Identifier Strategy & Domain Code Preservation

### 9.1 Primary Key Rationale

All database tables will use PostgreSQL UUIDs (`gen_random_uuid()`) as primary keys. UUIDs provide global uniqueness across colleges, prevent sequential ID enumeration attacks, and simplify client-side ID generation.

### 9.2 Preserving Human-Readable Domain Identifiers

Existing human-readable IDs used in college operations (e.g., Student Roll Numbers, Employee IDs, College Codes) **MUST NOT** be discarded. They are preserved as unique domain attributes alongside UUID primary keys.

| Entity | Primary Key | Domain Identifier | Example | Constraint |
| :--- | :--- | :--- | :--- | :--- |
| **College** | `id` (UUID) | `code` (VARCHAR) | `'jspmntc'` | UNIQUE per system |
| **Department** | `id` (UUID) | `code` (VARCHAR) | `'jspmntccs'` | UNIQUE per college |
| **Teacher** | `profile_id` (UUID) | `employee_id` (VARCHAR) | `'EMP-CS-01'`, `'HOD-CS-01'` | UNIQUE per college |
| **Student** | `profile_id` (UUID) | `student_id` (VARCHAR) | `'STU-CS-101'` | UNIQUE per college |
| **Academic Year** | `id` (UUID) | `code` (VARCHAR) | `'FE'`, `'SE'`, `'1st Year'` | UNIQUE per college |
| **Subject** | `id` (UUID) | `code` (VARCHAR) | `'SUB-CS-101'` | UNIQUE per department |

---

## 10. Data Integrity & Constraint Matrix

### 10.1 Key Relational Constraints

```sql
-- Prevent Duplicate Student IDs within a College
ALTER TABLE student_profiles
ADD CONSTRAINT uq_student_college_id UNIQUE (college_id, student_id);

-- Prevent Duplicate Employee IDs within a College
ALTER TABLE teacher_profiles
ADD CONSTRAINT uq_employee_college_id UNIQUE (college_id, employee_id);

-- Ensure Valid Game Types
ALTER TABLE quizzes
ADD CONSTRAINT chk_quiz_game_type
CHECK (game_type IN ('TILE_PUZZLE', 'MATCH_FOLLOWING', 'FILL_BLANKS', 'TRUE_FALSE'));

-- Ensure Mistakes Count Non-Negative
ALTER TABLE question_attempts
ADD CONSTRAINT chk_mistakes_non_negative CHECK (mistakes_count >= 0);
```

### 10.2 Foreign Key Cascading Rules

- `departments` → `colleges`: `ON DELETE RESTRICT` (Cannot delete a college with active departments).
- `profiles` → `colleges`: `ON DELETE RESTRICT`.
- `quizzes` → `profiles` (Teacher): `ON DELETE RESTRICT` (Quizzes preserved even if a teacher leaves).
- `quiz_questions` → `quizzes`: `ON DELETE CASCADE` (Deleting a quiz removes its questions).
- `question_attempts` → `quiz_attempts`: `ON DELETE CASCADE`.

---

## 11. Multi-College Tenant Isolation Architecture

Multi-tenancy is guaranteed by embedding `college_id` foreign keys on all major entity tables (`departments`, `profiles`, `subjects`, `quizzes`, `quiz_attempts`).

```
                    ┌────────────────────────┐
                    │        colleges        │
                    │ - id (UUID, PK)        │
                    │ - code ('jspmntc')     │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  departments  │       │   profiles    │       │    quizzes    │
│-college_id(FK)│       │-college_id(FK)│       │-college_id(FK)│
└───────────────┘       └───────────────┘       └───────────────┘
```

Even if a frontend filter bug occurs, Row Level Security policies check `college_id = auth.jwt() ->> 'college_id'` at the database layer, ensuring zero data bleed between colleges.

---

## 12. Analytics & Reporting Architecture

Rather than creating redundant analytics storage tables, all dashboard metrics are dynamically derived from transactional tables using indexed PostgreSQL Database Views.

### 12.1 Analytical View Hierarchy

1. **`vw_college_analytics` (College Admin Dashboard):**
   - Calculates total students, active teachers, department counts, and overall accuracy % grouped by `college_id`.
2. **`vw_department_analytics` (HOD Dashboard):**
   - Calculates student counts, teacher counts, subject count, and accuracy % grouped by `department_id`.
3. **`vw_teacher_performance` (Teacher Dashboard):**
   - Aggregates attempt counts, average student accuracy, and pass rates for quizzes created by each teacher.
4. **`vw_student_leaderboard` (Student Portal):**
   - Aggregates total XP earned, total stars accumulated, total quizzes completed, and overall accuracy % per student.

---

## 13. Excel Import Compatibility & Entity Resolution Mechanics

The frontend HOD interface includes Excel bulk imports for Faculty (`Faculty Name`, `Employee ID`, `Subjects`, `Classes/Years`) and Students (`Student Name`, `Student ID`, `Year/Class`, `Teacher`, `Subject`).

### 13.1 Server-Side Import Resolution Workflow

```
[Uploaded Excel Row]
       │
       ▼
1. Validate Required Strings (Non-empty check)
       │
       ▼
2. Resolve Department & College Context (from HOD User Session)
       │
       ▼
3. Map Subject / Year Strings to UUID Primary Keys:
   - SELECT id FROM subjects WHERE name ILIKE row.subject AND department_id = hod.department_id;
   - SELECT id FROM academic_years WHERE code ILIKE row.year AND college_id = hod.college_id;
       │
       ▼
4. Map Teacher Employee ID / Name to Profile UUID:
   - SELECT profile_id FROM teacher_profiles WHERE employee_id = row.teacher_empid;
       │
       ▼
5. Upsert Profiles & Assignment Junction Rows inside a Database Transaction:
   - INSERT INTO profiles (...)
   - INSERT INTO student_profiles (...)
   - INSERT INTO student_subject_assignments (...)
```

---

## 14. Current Frontend Mock → Future Database Mapping Matrix

| Current Frontend / Mock Concept | Current Source File | Proposed Database Table & Column | Mapping Notes |
| :--- | :--- | :--- | :--- |
| `MOCK_COLLEGE_DATA.collegeInfo` | `college-dashboard.js` | `public.colleges` | `id` → `code`, new UUID `id` generated. |
| `MOCK_COLLEGE_DATA.departments` | `college-dashboard.js` | `public.departments` | `hodName` & `hodEmpId` resolved to `profiles.id` via `hod_assignments`. |
| `HOD_MOCK_DATA.teachers` | `hod-dashboard.js` | `public.profiles` + `teacher_profiles` | `empId` stored in `teacher_profiles.employee_id`. |
| `HOD_MOCK_DATA.teachers.subjects` | `hod-dashboard.js` | `teacher_subject_class_assignments` | Converted from string array to relational rows. |
| `HOD_MOCK_DATA.students` | `hod-dashboard.js` | `public.profiles` + `student_profiles` | `studentId` stored in `student_profiles.student_id`. |
| `HOD_MOCK_DATA.students.teacher` | `hod-dashboard.js` | `student_subject_assignments` | Converted from string to `teacher_id` UUID FK. |
| `MOCK_DATA.quizzes` | `teacher-dashboard.js` | `public.quizzes` | Includes `game_type` enum and quiz settings. |
| `MOCK_DATA.questionBank` | `teacher-dashboard.js` | `public.quiz_questions` | Question options stored in `game_payload` JSONB. |
| `MOCK_DATA.results` | `teacher-dashboard.js` | `public.quiz_attempts` | Raw attempt dates & scores recorded. |
| `MOCK_DATA.notifications` | `teacher-dashboard.js` | `public.notifications` | Bound to `user_id` FK. |
| `orixa_completed_quizzes` | `localStorage` | `public.quiz_attempts` | Replaces client-side `localStorage` array. |

---

## 15. Proposed Schema Text-Based ER Diagram (ERD)

```
========================================================================================
                                  COLLEGES
                                  - id (UUID, PK)
                                  - code (VARCHAR, UNIQUE)
                                  - name (VARCHAR)
========================================================================================
       │                                     │                                  │
       │ 1:N                                 │ 1:N                              │ 1:N
       ▼                                     ▼                                  ▼
DEPARTMENTS                           ACADEMIC_YEARS                         PROFILES
- id (UUID, PK)                       - id (UUID, PK)                        - id (UUID, PK) -> auth.users
- college_id (FK)                     - college_id (FK)                      - college_id (FK)
- code (VARCHAR)                      - code (VARCHAR)                       - department_id (FK)
- name (VARCHAR)                      - display_name (VARCHAR)               - role (app_role ENUM)
       │                                     │                               - full_name (VARCHAR)
       │ 1:N                                 │                                  │
       ▼                                     │                                  ├─────────────────┬─────────────────┐
SUBJECTS                                     │                                  │ 1:1             │ 1:1             │ 1:1
- id (UUID, PK)                              │                                  ▼                 ▼                 ▼
- department_id (FK)                         │                          TEACHER_PROFILES   STUDENT_PROFILES   HOD_ASSIGNMENTS
- code (VARCHAR)                             │                          - profile_id (FK)  - profile_id (FK)  - profile_id (FK)
- name (VARCHAR)                             │                          - employee_id      - student_id       - department_id (FK)
       │                                     │                                  │                 │
       ├─────────────────────────────────────┼──────────────────────────────────┘                 │
       │                                     │                                                    │
       │ 1:N                                 │ 1:N                                                │
       ▼                                     ▼                                                    │
TEACHER_SUBJECT_CLASS_ASSIGNMENTS ───────────┴────────────────────────────────────────────────────┤
- id (UUID, PK)                                                                                   │
- teacher_id (FK -> profiles)                                                                     │
- subject_id (FK -> subjects)                                                                     │
- academic_year_id (FK -> academic_years)                                                         │
                                                                                                  │
                                                                                                  │
STUDENT_SUBJECT_ASSIGNMENTS <─────────────────────────────────────────────────────────────────────┘
- id (UUID, PK)
- student_id (FK -> profiles)
- subject_id (FK -> subjects)
- academic_year_id (FK -> academic_years)
- teacher_id (FK -> profiles)
       │
       │
       ▼
QUIZZES
- id (UUID, PK)
- college_id (FK)
- department_id (FK)
- teacher_id (FK -> profiles)
- subject_id (FK)
- academic_year_id (FK)
- title (VARCHAR)
- game_type (ENUM: TILE_PUZZLE, MATCH_FOLLOWING, FILL_BLANKS, TRUE_FALSE)
- settings (JSONB)
       │
       ├────────────────────────────────────────┐
       │ 1:N                                    │ 1:N
       ▼                                        ▼
QUIZ_QUESTIONS                           QUIZ_ATTEMPTS
- id (UUID, PK)                          - id (UUID, PK)
- quiz_id (FK)                           - quiz_id (FK)
- question_order (INT)                   - student_id (FK -> profiles)
- question_text (TEXT)                   - started_at (TIMESTAMPTZ)
- max_chances (INT)                      - completed_at (TIMESTAMPTZ)
- game_payload (JSONB)                          │
                                                │ 1:N
                                                ▼
                                         QUESTION_ATTEMPTS
                                         - id (UUID, PK)
                                         - attempt_id (FK)
                                         - question_id (FK)
                                         - selected_answer_json (JSONB)
                                         - mistakes_count (INT)
                                         - is_solved (BOOLEAN)
========================================================================================
```

---

## 16. Phase Boundaries & Exclusion Scope

The following items are **INTENTIONALLY EXCLUDED** from Phase 2 and will be implemented in subsequent development phases:

- Executing SQL `CREATE TABLE` statements
- Generating physical SQL migration files
- Creating Supabase Auth users
- Writing or applying Supabase Row Level Security (RLS) policies
- Generating database seed data scripts
- Linking the local environment to a remote Supabase instance (`supabase link`, `supabase db push`)
- Modifying frontend HTML files
- Modifying frontend CSS files
- Modifying frontend JavaScript files (`teacher-dashboard.js`, `student-portal.js`, `hod-dashboard.js`, etc.)
- Altering existing mock data objects or `localStorage` keys
- Modifying game engine scoring or UI behavior

---

## 17. Conclusion & Next Steps

This database architecture specification satisfies all structural, relational, and game-specific requirements of the ORIXA platform. Upon approval of Phase 2, Phase 3 will proceed with generating initial PostgreSQL migrations, defining Supabase RLS policy scripts, and establishing seed scripts.
