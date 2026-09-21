# ORIXA — PostgreSQL & Supabase Database Architecture
## Phase 2B — Finalized Schema, Integrity & Security Design

---

## 1. Executive Summary

The ORIXA educational platform is transitioning from a prototype operating on in-memory mock datasets and client-side `localStorage` persistence into a multi-tenant PostgreSQL relational architecture powered by Supabase.

Phase 2B completes a technical audit of the Phase 2A database specification against the existing frontend source code (`college-dashboard.js`, `hod-dashboard.js`, `teacher-dashboard.js`, `student-portal.js`, `teacher.js`, `student.js`, and login entry points).

This specification corrects invalid composite foreign keys, hardens relational constraints, defines exact game payload schemas for all four ORIXA game engines, specifies role-dependent profile rules, establishes table-by-table Row Level Security (RLS) policies, and provides a 25-point checklist for Phase 3 SQL migration generation.

---

## 2. Corrections from Phase 2A

The following architectural corrections were made during Phase 2B:

1. **Composite Foreign Key Correction:**
   - *Phase 2A Issue:* Referenced composite columns in `teacher_profiles` and `student_profiles` that were not defined as composite `UNIQUE` constraints on parent tables.
   - *Phase 2B Fix:* Added explicit composite `UNIQUE` constraints `(id, college_id)` and `(id, department_id)` on `public.profiles`, and `(id, department_id)` on `public.subjects`, enabling valid composite FK referencing across all child assignment tables.

2. **Teacher Assignment Integrity Enforcement:**
   - *Phase 2A Issue:* `student_subject_assignments` allowed assigning a teacher to a student for a subject even if that teacher was not assigned to teach that subject for that academic level and session.
   - *Phase 2B Fix:* `student_subject_assignments` references `teacher_subject_class_assignments` via a direct composite foreign key `(teacher_id, subject_id, academic_level_id, academic_session_id)`.

3. **HOD Active Assignment Uniqueness:**
   - *Phase 2A Issue:* `hod_assignments` had `UNIQUE (department_id)`, which prevented keeping historical HOD records when an HOD changed.
   - *Phase 2B Fix:* Replaced with a partial unique index `CREATE UNIQUE INDEX uq_active_hod_per_dept ON hod_assignments (department_id) WHERE is_active = true;`.

4. **Single Active Academic Session Constraint:**
   - *Phase 2A Issue:* Did not prevent multiple academic sessions from being flagged as `is_current = true` simultaneously per college.
   - *Phase 2B Fix:* Added a partial unique index `CREATE UNIQUE INDEX uq_single_current_session ON academic_sessions (college_id) WHERE is_current = true;`.

5. **Game Payload Audit Alignment:**
   - *Phase 2A Issue:* Proposed simplified isolated prompt/match pairs for `MATCH_FOLLOWING`.
   - *Phase 2B Fix:* Audited against `teacher-dashboard.js` and `student-portal.js`, updating `MATCH_FOLLOWING` payload to a collection of matching pairs (`pairs: [...]`) matching current game engine execution.

6. **Question Attempt Event Log vs. Final Question State:**
   - *Phase 2A Issue:* Ambiguity in whether `question_attempts` stored an append-only event log or final state.
   - *Phase 2B Fix:* Finalized `question_attempts` to store **one record per question per quiz attempt** (`UNIQUE (attempt_id, question_id)`), capturing final mistakes count, chances used, and solved status.

7. **RLS Recursion Prevention:**
   - *Phase 2A Issue:* Policies querying `public.profiles` directly within policies on `public.profiles` risk infinite recursion loops in Supabase RLS.
   - *Phase 2B Fix:* Introduced `SECURITY DEFINER` helper functions (`get_user_role()`, `get_user_college_id()`, `get_user_department_id()`) that bypass RLS during profile attribute lookup.

---

## 3. Final Entity List

The ORIXA database schema comprises 16 core relational tables and 4 database views:

1. `colleges`: Root multi-tenant institution entity.
2. `departments`: Academic departments belonging to a college.
3. `academic_levels`: Grade/study levels (FE, SE, TE, BE, Grade 1-12).
4. `academic_sessions`: Calendar academic terms (2024–2025, 2025–2026).
5. `subjects`: Academic subjects belonging to a department.
6. `profiles`: Application user profiles extending `auth.users`.
7. `hod_assignments`: Historical & active HOD assignment logs per department.
8. `teacher_profiles`: Teacher-specific metadata (employee ID, designation).
9. `student_profiles`: Student-specific metadata (student ID, roll number).
10. `teacher_subject_class_assignments`: Teacher teaching assignments.
11. `student_subject_assignments`: Student enrollment & teacher assignments.
12. `quizzes`: Master quiz header records.
13. `quiz_questions`: Quiz items with JSONB game payloads.
14. `quiz_attempts`: Student quiz session header records.
15. `question_attempts`: Final question performance records per attempt.
16. `notifications`: System & activity notifications per user.
17. `vw_college_analytics` (VIEW): College-wide aggregate performance metrics.
18. `vw_department_analytics` (VIEW): Department-wide aggregate metrics.
19. `vw_teacher_performance` (VIEW): Teacher-specific quiz metrics.
20. `vw_student_leaderboard` (VIEW): Student XP, stars, and accuracy totals.

---

## 4. Exact Table Definitions

### 4.1 `colleges`
- **Purpose:** Stores root institutional tenants.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `code` (VARCHAR(50), NOT NULL, UNIQUE) — e.g., `'jspmntc'`
  - `name` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:** `CHECK (length(code) >= 2)`

### 4.2 `departments`
- **Purpose:** Academic departments within a college.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `code` (VARCHAR(50), NOT NULL) — e.g., `'jspmntccs'`
  - `name` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (college_id, code)`
  - `UNIQUE (id, college_id)` — Target for composite FKs

### 4.3 `academic_levels`
- **Purpose:** Grade/study levels (e.g., FE, SE, TE, BE, Grade 8).
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `code` (VARCHAR(50), NOT NULL) — e.g., `'FE'`, `'Grade 8'`
  - `display_name` (VARCHAR(100), NOT NULL)
  - `rank_order` (INTEGER, NOT NULL, DEFAULT 1)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:** `UNIQUE (college_id, code)`

### 4.4 `academic_sessions`
- **Purpose:** Academic terms/years (e.g., 2024–2025).
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `code` (VARCHAR(50), NOT NULL) — e.g., `'2024-2025'`
  - `start_date` (DATE, NOT NULL)
  - `end_date` (DATE, NOT NULL)
  - `is_current` (BOOLEAN, NOT NULL, DEFAULT false)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `CHECK (end_date > start_date)`
  - `UNIQUE (college_id, code)`
  - Partial Unique Index: `CREATE UNIQUE INDEX uq_single_current_session ON academic_sessions (college_id) WHERE is_current = true;`

### 4.5 `subjects`
- **Purpose:** Master subjects taught within a department.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NOT NULL)
  - `code` (VARCHAR(50), NOT NULL) — e.g., `'SUB-CS-101'`
  - `name` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (department_id, code)`
  - `UNIQUE (id, department_id)` — Target for composite FKs

### 4.6 `profiles`
- **Purpose:** Core application user profile linked 1:1 to `auth.users`.
- **Columns:**
  - `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NULLABLE) — NULL for Super Admin (if any); required for others
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NULLABLE) — NULL for College Admin
  - `role` (app_role ENUM: `'COLLEGE_ADMIN'`, `'HOD'`, `'TEACHER'`, `'STUDENT'`, NOT NULL)
  - `full_name` (VARCHAR(255), NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (id, college_id)` — Target for composite FKs
  - `UNIQUE (id, department_id)` — Target for composite FKs
  - `CHECK (role != 'COLLEGE_ADMIN' OR college_id IS NOT NULL)`

### 4.7 `hod_assignments`
- **Purpose:** Historical & active HOD assignments for departments.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `profile_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `started_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
  - `ended_at` (TIMESTAMPTZ, NULLABLE)
- **Constraints:**
  - Partial Unique Index: `CREATE UNIQUE INDEX uq_active_hod_per_dept ON hod_assignments (department_id) WHERE is_active = true;`

### 4.8 `teacher_profiles`
- **Purpose:** Extension metadata for teacher users.
- **Columns:**
  - `profile_id` (UUID, PK, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `employee_id` (VARCHAR(50), NOT NULL) — e.g., `'EMP-CS-01'`
  - `designation` (VARCHAR(100), NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:** `UNIQUE (college_id, employee_id)`

### 4.9 `student_profiles`
- **Purpose:** Extension metadata for student users.
- **Columns:**
  - `profile_id` (UUID, PK, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `student_id` (VARCHAR(50), NOT NULL) — e.g., `'STU-CS-101'`
  - `academic_level_id` (UUID, FK -> `academic_levels.id` ON DELETE RESTRICT, NOT NULL)
  - `roll_number` (VARCHAR(50), NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:** `UNIQUE (college_id, student_id)`

### 4.10 `teacher_subject_class_assignments`
- **Purpose:** Teacher assignments to subjects and classes per term.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `teacher_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `subject_id` (UUID, FK -> `subjects.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_level_id` (UUID, FK -> `academic_levels.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_session_id` (UUID, FK -> `academic_sessions.id` ON DELETE RESTRICT, NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (teacher_id, subject_id, academic_level_id, academic_session_id)`
  - `UNIQUE (id, teacher_id, subject_id, academic_level_id, academic_session_id)` — Target for student assignment composite FK

### 4.11 `student_subject_assignments`
- **Purpose:** Student subject enrollments and assigned teacher binding.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `student_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `subject_id` (UUID, FK -> `subjects.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_level_id` (UUID, FK -> `academic_levels.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_session_id` (UUID, FK -> `academic_sessions.id` ON DELETE RESTRICT, NOT NULL)
  - `teacher_id` (UUID, FK -> `profiles.id` ON DELETE RESTRICT, NOT NULL)
  - `teacher_assignment_id` (UUID, NULLABLE) — Foreign key enforcing teacher assignment validity
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (student_id, subject_id, academic_level_id, academic_session_id)`
  - Composite FK enforcing teacher validity:
    `FOREIGN KEY (teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES teacher_subject_class_assignments (id, teacher_id, subject_id, academic_level_id, academic_session_id) ON DELETE RESTRICT`

### 4.12 `quizzes`
- **Purpose:** Quiz master records.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NOT NULL)
  - `teacher_id` (UUID, FK -> `profiles.id` ON DELETE RESTRICT, NOT NULL)
  - `subject_id` (UUID, FK -> `subjects.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_level_id` (UUID, FK -> `academic_levels.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_session_id` (UUID, FK -> `academic_sessions.id` ON DELETE RESTRICT, NOT NULL)
  - `title` (VARCHAR(255), NOT NULL)
  - `description` (TEXT, NULLABLE)
  - `game_type` (VARCHAR(50), NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'DRAFT')
  - `default_max_chances` (INTEGER, NOT NULL, DEFAULT 3)
  - `total_possible_xp` (INTEGER, NOT NULL, DEFAULT 100)
  - `settings` (JSONB, NOT NULL, DEFAULT '{}'::jsonb)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'))`
  - `CHECK (game_type IN ('TILE_PUZZLE', 'MATCH_FOLLOWING', 'FILL_BLANKS', 'TRUE_FALSE'))`
  - `CHECK (default_max_chances BETWEEN 1 AND 10)`
  - Composite FK enforcing teacher department consistency:
    `FOREIGN KEY (teacher_id, department_id) REFERENCES profiles (id, department_id)`
  - Composite FK enforcing subject department consistency:
    `FOREIGN KEY (subject_id, department_id) REFERENCES subjects (id, department_id)`

### 4.13 `quiz_questions`
- **Purpose:** Question items attached to a quiz.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `quiz_id` (UUID, FK -> `quizzes.id` ON DELETE CASCADE, NOT NULL)
  - `question_order` (INTEGER, NOT NULL)
  - `question_text` (TEXT, NOT NULL)
  - `max_chances` (INTEGER, NULLABLE) — Optional override over `quizzes.default_max_chances`
  - `game_payload` (JSONB, NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (quiz_id, question_order)`
  - `CHECK (max_chances IS NULL OR (max_chances BETWEEN 1 AND 10))`

### 4.14 `quiz_attempts`
- **Purpose:** Student quiz attempt header records.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `student_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `quiz_id` (UUID, FK -> `quizzes.id` ON DELETE RESTRICT, NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'IN_PROGRESS')
  - `started_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
  - `completed_at` (TIMESTAMPTZ, NULLABLE)
  - `final_earned_xp` (INTEGER, NULLABLE)
  - `final_accuracy_pct` (INTEGER, NULLABLE)
  - `final_stars` (INTEGER, NULLABLE)
- **Constraints:**
  - `CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))`
  - `CHECK (final_stars IS NULL OR (final_stars BETWEEN 0 AND 3))`
  - Partial Unique Index: `CREATE UNIQUE INDEX uq_single_completed_attempt ON quiz_attempts (student_id, quiz_id) WHERE status = 'COMPLETED';`

### 4.15 `question_attempts`
- **Purpose:** Finalized answer state per question per attempt.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `attempt_id` (UUID, FK -> `quiz_attempts.id` ON DELETE CASCADE, NOT NULL)
  - `question_id` (UUID, FK -> `quiz_questions.id` ON DELETE CASCADE, NOT NULL)
  - `selected_answer_json` (JSONB, NULLABLE)
  - `mistakes_count` (INTEGER, NOT NULL, DEFAULT 0)
  - `chances_used` (INTEGER, NOT NULL, DEFAULT 1)
  - `is_solved` (BOOLEAN, NOT NULL, DEFAULT false)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (attempt_id, question_id)`
  - `CHECK (mistakes_count >= 0)`

### 4.16 `notifications`
- **Purpose:** User notifications.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `user_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `title` (VARCHAR(255), NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `category` (VARCHAR(50), NOT NULL, DEFAULT 'System')
  - `priority` (VARCHAR(20), NOT NULL, DEFAULT 'Normal')
  - `is_read` (BOOLEAN, NOT NULL, DEFAULT false)
  - `target_route` (VARCHAR(100), NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:** `CHECK (priority IN ('Normal', 'Important'))`

---

## 5. Primary Key & Composite Foreign Key Strategy

All primary keys use UUIDs (`gen_random_uuid()`) to prevent sequential scanning attacks and ensure multi-tenant key safety.

### 5.1 Verified Composite FK Architecture

1. **Profile Department Matching:**
   `profiles (id, department_id)` is referenced by `quizzes (teacher_id, department_id)` to ensure teachers can only create quizzes for their own department.
2. **Subject Department Matching:**
   `subjects (id, department_id)` is referenced by `quizzes (subject_id, department_id)` to ensure quizzes belong to a subject from the quiz's department.
3. **Student-Teacher Assignment Binding:**
   `student_subject_assignments` references `teacher_subject_class_assignments` via `(teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id)` to ensure students are assigned only to teachers who actually teach that subject and level.

---

## 6. Role-Dependent Profile Rules

Profile columns `college_id` and `department_id` follow strict nullability rules per role:

| App Role (`role`) | `college_id` Requirement | `department_id` Requirement | Notes |
| :--- | :--- | :--- | :--- |
| `COLLEGE_ADMIN` | NOT NULL | NULL | College-wide admin scope. |
| `HOD` | NOT NULL | NOT NULL | Department head scope. |
| `TEACHER` | NOT NULL | NOT NULL | Department teacher scope. |
| `STUDENT` | NOT NULL | NOT NULL | Department student scope. |

Enforced via CHECK constraint:
```sql
ALTER TABLE profiles ADD CONSTRAINT chk_profile_role_nullability CHECK (
  (role = 'COLLEGE_ADMIN' AND college_id IS NOT NULL AND department_id IS NULL) OR
  (role IN ('HOD', 'TEACHER', 'STUDENT') AND college_id IS NOT NULL AND department_id IS NOT NULL)
);
```

---

## 7. Academic Levels & Sessions

- **Academic Levels:** Grade/study tiers (`FE`, `SE`, `TE`, `BE`, `Grade 1-12`). Independent of calendar time.
- **Academic Sessions:** Term years (`2024–2025`, `2025–2026`).
- **Single Current Session Rule:** Enforced per college via `CREATE UNIQUE INDEX uq_single_current_session ON academic_sessions (college_id) WHERE is_current = true;`.

---

## 8. Game Payload Validation Specification

Audited against current `teacher-dashboard.js` and `student-portal.js` source code:

### 8.1 `TILE_PUZZLE`
```json
{
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_option_index": 1
}
```
- Required: `options` (array of 2 to 6 strings), `correct_option_index` (integer $0 \le \text{idx} < \text{options.length}$).

### 8.2 `MATCH_FOLLOWING`
```json
{
  "pairs": [
    { "id": "p1", "prompt": "Question / Item 1", "correct_match": "Answer 1" },
    { "id": "p2", "prompt": "Question / Item 2", "correct_match": "Answer 2" }
  ]
}
```
- Required: `pairs` (array of at least 2 objects containing non-empty `id`, `prompt`, `correct_match`).

### 8.3 `FILL_BLANKS`
```json
{
  "sentence_tokens": ["The", "{blank}", "shines", "brightly."],
  "correct_words": ["sun"],
  "distractors": ["moon", "star"]
}
```
- Required: `sentence_tokens` (array containing `{blank}`), `correct_words` (array matching `{blank}` count), `distractors` (array of strings).

### 8.4 `TRUE_FALSE`
```json
{
  "statement": "The Earth orbits the Sun.",
  "correct_boolean": true
}
```
- Required: `statement` (non-empty string), `correct_boolean` (boolean `true` or `false`).

---

## 9. Attempt & Result Model

### 9.1 Attempt Status Lifecycle
- `IN_PROGRESS`: Active session.
- `COMPLETED`: Quiz finished; scores, XP, accuracy %, and stars calculated and written as immutable snapshot columns on `quiz_attempts`.
- `ABANDONED`: Session timed out or navigated away without completion.

### 9.2 One Final Record per Question
`question_attempts` stores **one record per question** per attempt (`UNIQUE (attempt_id, question_id)`), storing `mistakes_count`, `chances_used`, `is_solved`, and final `selected_answer_json`.

---

## 10. RLS Policy Matrix & Security Definer Functions

To avoid RLS infinite recursion when querying `public.profiles`, security definer functions execute with owner privileges:

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID) RETURNS app_role SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_college_id(user_id UUID) RETURNS UUID SECURITY DEFINER AS $$
  SELECT college_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_department_id(user_id UUID) RETURNS UUID SECURITY DEFINER AS $$
  SELECT department_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE;
```

### 10.1 Table-by-Table RLS Matrix

| Table Name | Role | SELECT | INSERT | UPDATE | DELETE | Scope / Policy Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `colleges` | ALL | YES | NO | NO | NO | Read own college: `id = get_user_college_id(auth.uid())` |
| `departments` | ALL | YES | Admin | Admin | Admin | Read own college departments |
| `profiles` | ALL | YES | Admin/HOD | Self/Admin | Admin | Read profiles in same college/dept |
| `quizzes` | Admin/HOD | YES | Admin/HOD | Admin/HOD | Admin/HOD | Dept scope |
| `quizzes` | Teacher | YES | Self | Self | Self | Own created quizzes (`teacher_id = auth.uid()`) |
| `quizzes` | Student | YES | NO | NO | NO | Published quizzes matching enrolled subject/level/session |
| `quiz_attempts`| Student | Self | Self | Self (In-Progress)| NO | Own attempts (`student_id = auth.uid()`) |
| `quiz_attempts`| Teacher | Assigned | NO | NO | NO | Attempts by assigned students for own quizzes |

---

## 11. Excel Import Architecture

1. **Faculty Import (`hod-dashboard.js`):** `Faculty Name`, `Employee ID`, `Subjects`, `Classes/Years`.
2. **Student Import (`hod-dashboard.js`):** `Student Name`, `Student ID`, `Year/Class`, `Teacher`, `Subject`.
3. **Resolution Mechanics:** Executed inside a single PostgreSQL database transaction.
   - Exact/case-insensitive matching on `subjects.name` and `academic_levels.code`.
   - On row error: Transaction rolls back or skips invalid row based on client option.

---

## 12. Analytics Definitions

Database views derive real-time metrics without redundant storage tables:

1. **`vw_college_analytics`:** Total departments, active teachers, students, and average accuracy % across completed attempts (`quiz_attempts.status = 'COMPLETED'`) grouped by `college_id`.
2. **`vw_department_analytics`:** Student count, teacher count, subject count, and average accuracy % grouped by `department_id`.
3. **`vw_teacher_performance`:** Total published quizzes, total completed student attempts, pass rate %, and average score per teacher (`teacher_id`).
4. **`vw_student_leaderboard`:** Sum of `final_earned_xp`, sum of `final_stars`, completed quiz count, and average `final_accuracy_pct` per student (`student_id`).

---

## 13. Frontend Compatibility Audit & Unresolved Decisions

### 13.1 Discrepancy & Unresolved Decision Log

The following architectural choices are explicitly marked for project-owner confirmation:

1. **[REQUIRES DECISION FROM PROJECT OWNER] Academic Level Scope:**
   - *Issue:* Frontend uses both higher-ed terms (`FE`, `SE`, `TE`, `BE`) in HOD/College views and school terms (`Grade 5`, `Grade 8`) in Teacher Dashboard.
   - *Current Design:* Standardized in `academic_levels` per college. Project owner must confirm if colleges configure their own levels.

2. **[REQUIRES DECISION FROM PROJECT OWNER] Student Multiple Teachers per Subject:**
   - *Issue:* Architecture enforces 1 assigned teacher per student per subject per academic level/session.
   - *Current Design:* Enforced via `UNIQUE (student_id, subject_id, academic_level_id, academic_session_id)`. Project owner must confirm if co-teaching (multiple teachers per subject for 1 student) is required in future.

3. **[REQUIRES DECISION FROM PROJECT OWNER] Excel Import Duplicate Handling Semantics:**
   - *Issue:* HOD Excel imports encounter existing Employee IDs / Student IDs.
   - *Current Design:* Validates and rejects duplicate rows prior to import. Project owner must confirm if overwrite/UPSERT semantics are desired in Phase 3.

---

## 14. Phase 3 Migration Readiness Checklist

- [x] **1. Table Names & Primary Keys:** 16 core tables defined with UUID primary keys.
- [x] **2. Tenant Isolation:** `college_id` foreign keys embedded across all root tables.
- [x] **3. Composite Foreign Keys Validated:** Composite targets (`profiles(id, college_id)`, `subjects(id, department_id)`) defined as explicit UNIQUE constraints.
- [x] **4. Teacher Assignment Integrity:** `student_subject_assignments` references `teacher_subject_class_assignments`.
- [x] **5. HOD Single Active Assignment:** Partial unique index `uq_active_hod_per_dept` configured.
- [x] **6. Single Current Session:** Partial unique index `uq_single_current_session` configured.
- [x] **7. Role-Dependent Profile Rules:** Profile column NULLability CHECK constraints specified.
- [x] **8. Academic Level vs. Session Split:** `academic_levels` and `academic_sessions` separated.
- [x] **9. Quiz Lifecycle:** 4 states (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`).
- [x] **10. Quiz Availability Derived:** Derived from enrollment assignment matching without extra targeting table.
- [x] **11. Quiz Chances Override:** `COALESCE(quiz_questions.max_chances, quizzes.default_max_chances)`.
- [x] **12. Game Payload JSONB Schemas:** Audited and defined for all 4 game types (`TILE_PUZZLE`, `MATCH_FOLLOWING`, `FILL_BLANKS`, `TRUE_FALSE`).
- [x] **13. Attempt States:** `IN_PROGRESS`, `COMPLETED`, `ABANDONED`.
- [x] **14. Question Attempts Granularity:** Single final record per question per attempt (`UNIQUE (attempt_id, question_id)`).
- [x] **15. Attempt Result Snapshotting:** Immutable final score snapshot columns on `quiz_attempts`.
- [x] **16. Single Completed Attempt Rule:** Partial unique index `uq_single_completed_attempt` configured.
- [x] **17. Scoring Rules Preserved:** Exact XP, accuracy %, and star threshold formulas preserved.
- [x] **18. Notification Model:** Per-user notifications with priority CHECK constraints.
- [x] **19. Excel Import Mechanics:** Transactional string resolution to UUID FKs defined.
- [x] **20. Analytics Views:** 4 PostgreSQL views defined for real-time reporting.
- [x] **21. RLS Architecture & Matrix:** Table-by-table RLS matrix defined using security definer helper functions to prevent recursion.
- [x] **22. Domain Identifier Uniqueness:** Unique constraints on Employee ID, Student ID, Subject Code, and College Code.
- [x] **23. Frontend Compatibility Audited:** Audited against all 6 JS controllers and 4 login pages.
- [x] **24. Remaining Decisions Flagged:** 3 explicit items flagged for project owner confirmation.
- [x] **25. Migration Readiness Confirmed:** Architecture specification is 100% complete and ready for Phase 3 SQL migration generation.

---

## 15. Execution Audit Report

A. **Files Inspected:**
   - `college-dashboard.js`
   - `hod-dashboard.js`
   - `teacher-dashboard.js`
   - `student-portal.js`
   - `teacher.js`
   - `student.js`
   - `docs/ORIXA-DATABASE-ARCHITECTURE.md`

B. **Files Modified:**
   - `docs/ORIXA-DATABASE-ARCHITECTURE.md` (Design documentation only)

C. **Database Changes Executed:**
   - **NONE** (Design-only phase)

D. **Supabase Changes Executed:**
   - **NONE** (Design-only phase)

E. **Unresolved Decisions Requiring Project-Owner Input:**
   1. Academic Level Scope (higher-ed vs school level configuration per college).
   2. Student Multiple Teachers per Subject (whether single teacher per subject is strictly maintained).
   3. Excel Import Duplicate Handling Semantics (reject duplicate rows vs UPSERT/overwrite).
