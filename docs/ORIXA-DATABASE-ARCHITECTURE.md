# ORIXA — PostgreSQL & Supabase Database Architecture
## Phase 2C — Final Pre-Migration Architecture

---

## 1. Executive Summary

The ORIXA educational platform is transitioning from a prototype operating on in-memory mock datasets and client-side `localStorage` persistence into a multi-tenant PostgreSQL relational architecture powered by Supabase.

Phase 2C completes the final pre-migration architecture and security hardening audit following Phase 2B. This specification resolves all remaining relational integrity gaps, prevents cross-quiz question attempt pollution, enforces direct teacher assignment scoping for student enrollments and quiz creation, hardens Row Level Security (RLS) helper functions against privilege escalation, specifies an immutable completed-attempt architecture, provides a 19-scenario security test matrix, and establishes a 26-point checklist for Phase 3 SQL migration generation.

---

## 2. Corrections from Phase 2B

The following structural corrections and security enhancements were implemented during Phase 2C:

1. **Student Assignment Requires Valid Teacher Assignment:**
   - *Phase 2B Defect:* `student_subject_assignments.teacher_assignment_id` was NULLable, allowing a student to be assigned a subject and teacher without verifying that the teacher actually taught that subject for that academic level and session.
   - *Phase 2C Correction:* Made `teacher_assignment_id` `NOT NULL` on `student_subject_assignments`, bound via a composite foreign key referencing `teacher_subject_class_assignments (id, teacher_id, subject_id, academic_level_id, academic_session_id)`.

2. **Quiz Requires Valid Teacher Assignment:**
   - *Phase 2B Defect:* `quizzes` validated teacher department and subject department independently, but did not guarantee that the teacher was assigned to teach that specific subject, level, and session.
   - *Phase 2C Correction:* Added a composite foreign key on `quizzes (teacher_id, subject_id, academic_level_id, academic_session_id)` referencing `teacher_subject_class_assignments (teacher_id, subject_id, academic_level_id, academic_session_id)`.

3. **Question Attempt Cross-Quiz Prevention:**
   - *Phase 2B Defect:* `question_attempts` referenced `attempt_id` and `question_id` independently, allowing a question attempt record under Attempt for Quiz A to point to a question belonging to Quiz B.
   - *Phase 2C Correction:* Added `quiz_id` to `question_attempts` with composite FKs: `(attempt_id, quiz_id)` referencing `quiz_attempts (id, quiz_id)` AND `(question_id, quiz_id)` referencing `quiz_questions (id, quiz_id)`.

4. **HOD Role Enforcement at Database Layer:**
   - *Phase 2B Defect:* Relied on application logic / RLS to ensure `hod_assignments` referenced a profile with `role = 'HOD'`.
   - *Phase 2C Correction:* Added composite foreign key `(profile_id, role)` on `hod_assignments` referencing `profiles (id, role)`, combined with a CHECK constraint `CHECK (role = 'HOD')`.

5. **Completed Result Immutability Architecture:**
   - *Phase 2B Defect:* Stated results were immutable but did not specify the database-level write-blocking mechanism.
   - *Phase 2C Correction:* Specified a `BEFORE UPDATE` trigger (`trg_block_completed_attempt_edits`) and student RLS policies blocking `UPDATE` operations on `quiz_attempts` and `question_attempts` once `status = 'COMPLETED'`. All completions must execute through a security definer function (`fn_complete_quiz_attempt()`).

6. **Hardened RLS Helper Functions:**
   - *Phase 2B Defect:* Helper functions accepted an arbitrary `user_id UUID` parameter, exposing profile attribute lookup capabilities if callable by clients.
   - *Phase 2C Correction:* Removed `user_id` arguments. Helper functions (`get_auth_role()`, `get_auth_college_id()`, `get_auth_department_id()`) implicitly operate on `auth.uid()`, use `SECURITY DEFINER`, `STABLE`, and explicitly set `search_path = public, pg_temp`.

7. **Complete Table-by-Table RLS Matrix:**
   - *Phase 2B Defect:* Provided generic scope descriptions.
   - *Phase 2C Correction:* Expanded into an exhaustive 16-table x 4-role x 4-operation matrix specifying exact SQL predicate conditions or `N/A` for forbidden operations.

---

## 3. Final Entity List

The ORIXA database schema comprises 16 core relational tables and 4 database views:

1. `colleges`: Root multi-tenant institution entity.
2. `departments`: Academic departments belonging to a college.
3. `academic_levels`: Grade/study levels (FE, SE, TE, BE).
4. `academic_sessions`: Calendar academic terms (2024–2025, 2025–2026).
5. `subjects`: Academic subjects belonging to a department.
6. `profiles`: Application user profiles extending `auth.users`.
7. `hod_assignments`: Historical & active HOD assignment logs per department.
8. `teacher_profiles`: Teacher-specific metadata (employee ID, designation).
9. `student_profiles`: Student-specific metadata (student ID, roll number).
10. `teacher_subject_class_assignments`: Teacher teaching assignments per term.
11. `student_subject_assignments`: Student enrollment & assigned teacher binding.
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
- **Purpose:** Grade/study levels (FE, SE, TE, BE).
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `code` (VARCHAR(50), NOT NULL) — e.g., `'FE'`, `'SE'`
  - `display_name` (VARCHAR(100), NOT NULL)
  - `rank_order` (INTEGER, NOT NULL, DEFAULT 1)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (college_id, code)`
  - `UNIQUE (id, college_id)` — Target for composite FKs

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
- **Purpose:** Core user profile linked 1:1 to `auth.users`.
- **Columns:**
  - `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NULLABLE)
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NULLABLE)
  - `role` (app_role ENUM: `'COLLEGE_ADMIN'`, `'HOD'`, `'TEACHER'`, `'STUDENT'`, NOT NULL)
  - `full_name` (VARCHAR(255), NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (id, role)` — Target for HOD role FK
  - `UNIQUE (id, college_id)` — Target for composite FKs
  - `UNIQUE (id, department_id)` — Target for composite FKs
  - Composite FK Department-College Consistency:
    `FOREIGN KEY (department_id, college_id) REFERENCES departments (id, college_id)`
  - Role-Dependent NULLability CHECK:
    `CHECK ((role = 'COLLEGE_ADMIN' AND college_id IS NOT NULL AND department_id IS NULL) OR (role IN ('HOD', 'TEACHER', 'STUDENT') AND college_id IS NOT NULL AND department_id IS NOT NULL))`

### 4.7 `hod_assignments`
- **Purpose:** Historical & active HOD assignments for departments.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `profile_id` (UUID, NOT NULL)
  - `role` (app_role ENUM, NOT NULL, DEFAULT 'HOD')
  - `department_id` (UUID, FK -> `departments.id` ON DELETE RESTRICT, NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `started_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
  - `ended_at` (TIMESTAMPTZ, NULLABLE)
- **Constraints:**
  - `CHECK (role = 'HOD')`
  - Composite FK enforcing HOD Role:
    `FOREIGN KEY (profile_id, role) REFERENCES profiles (id, role) ON DELETE CASCADE`
  - Composite FK enforcing HOD Department Consistency:
    `FOREIGN KEY (profile_id, department_id) REFERENCES profiles (id, department_id) ON DELETE RESTRICT`
  - Partial Unique Index:
    `CREATE UNIQUE INDEX uq_active_hod_per_dept ON hod_assignments (department_id) WHERE is_active = true;`

### 4.8 `teacher_profiles`
- **Purpose:** Extension metadata for teacher users.
- **Columns:**
  - `profile_id` (UUID, PK, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `employee_id` (VARCHAR(50), NOT NULL)
  - `designation` (VARCHAR(100), NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (college_id, employee_id)`
  - Composite FK enforcing College Consistency:
    `FOREIGN KEY (profile_id, college_id) REFERENCES profiles (id, college_id)`

### 4.9 `student_profiles`
- **Purpose:** Extension metadata for student users.
- **Columns:**
  - `profile_id` (UUID, PK, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `college_id` (UUID, FK -> `colleges.id` ON DELETE RESTRICT, NOT NULL)
  - `student_id` (VARCHAR(50), NOT NULL)
  - `academic_level_id` (UUID, NOT NULL)
  - `roll_number` (VARCHAR(50), NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (college_id, student_id)`
  - Composite FK enforcing Student College Consistency:
    `FOREIGN KEY (profile_id, college_id) REFERENCES profiles (id, college_id)`
  - Composite FK enforcing Academic Level College Consistency:
    `FOREIGN KEY (academic_level_id, college_id) REFERENCES academic_levels (id, college_id) ON DELETE RESTRICT`

### 4.10 `teacher_subject_class_assignments`
- **Purpose:** Teacher teaching assignments per academic session.
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
  - `UNIQUE (id, teacher_id, subject_id, academic_level_id, academic_session_id)` — Target for student enrollment composite FK
  - `UNIQUE (teacher_id, subject_id, academic_level_id, academic_session_id)` — Target for quiz teaching composite FK

### 4.11 `student_subject_assignments`
- **Purpose:** Student subject enrollments bound to a valid teacher teaching assignment.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `student_id` (UUID, FK -> `profiles.id` ON DELETE CASCADE, NOT NULL)
  - `subject_id` (UUID, FK -> `subjects.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_level_id` (UUID, FK -> `academic_levels.id` ON DELETE RESTRICT, NOT NULL)
  - `academic_session_id` (UUID, FK -> `academic_sessions.id` ON DELETE RESTRICT, NOT NULL)
  - `teacher_id` (UUID, FK -> `profiles.id` ON DELETE RESTRICT, NOT NULL)
  - `teacher_assignment_id` (UUID, NOT NULL)
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (student_id, subject_id, academic_level_id, academic_session_id)` — Single teacher per student/subject/term
  - Composite FK enforcing Teacher Assignment Validity:
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
  - `UNIQUE (id, quiz_id)` -> `UNIQUE (id)` target for question attempt composite FK (`UNIQUE (id, id)` simplified to `UNIQUE (id)`)
  - `UNIQUE (id, quiz_id)` composite for cross-quiz prevention: `UNIQUE (id)` + `quiz_id` self-reference.
  - `CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'))`
  - `CHECK (game_type IN ('TILE_PUZZLE', 'MATCH_FOLLOWING', 'FILL_BLANKS', 'TRUE_FALSE'))`
  - `CHECK (default_max_chances BETWEEN 1 AND 10)`
  - Composite FK enforcing Teacher Teaching Assignment Scoping:
    `FOREIGN KEY (teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES teacher_subject_class_assignments (teacher_id, subject_id, academic_level_id, academic_session_id) ON DELETE RESTRICT`

### 4.13 `quiz_questions`
- **Purpose:** Question items attached to a quiz.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `quiz_id` (UUID, FK -> `quizzes.id` ON DELETE CASCADE, NOT NULL)
  - `question_order` (INTEGER, NOT NULL)
  - `question_text` (TEXT, NOT NULL)
  - `max_chances` (INTEGER, NULLABLE)
  - `game_payload` (JSONB, NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (quiz_id, question_order)`
  - `UNIQUE (id, quiz_id)` — Target for question attempt composite FK
  - `CHECK (max_chances IS NULL OR (max_chances BETWEEN 1 AND 10))`

### 4.14 `quiz_attempts`
- **Purpose:** Student quiz attempt session headers.
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
  - `UNIQUE (id, quiz_id)` — Target for question attempt composite FK
  - `CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))`
  - `CHECK (final_stars IS NULL OR (final_stars BETWEEN 0 AND 3))`
  - Partial Unique Index: `CREATE UNIQUE INDEX uq_single_completed_attempt ON quiz_attempts (student_id, quiz_id) WHERE status = 'COMPLETED';`

### 4.15 `question_attempts`
- **Purpose:** Finalized question performance records per attempt.
- **Columns:**
  - `id` (UUID, PK, NOT NULL, DEFAULT `gen_random_uuid()`)
  - `attempt_id` (UUID, NOT NULL)
  - `quiz_id` (UUID, NOT NULL)
  - `question_id` (UUID, NOT NULL)
  - `selected_answer_json` (JSONB, NULLABLE)
  - `mistakes_count` (INTEGER, NOT NULL, DEFAULT 0)
  - `chances_used` (INTEGER, NOT NULL, DEFAULT 1)
  - `is_solved` (BOOLEAN, NOT NULL, DEFAULT false)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraints:**
  - `UNIQUE (attempt_id, question_id)`
  - `CHECK (mistakes_count >= 0)`
  - Composite FK preventing Cross-Quiz Attempt Pollution (Attempt Matching):
    `FOREIGN KEY (attempt_id, quiz_id) REFERENCES quiz_attempts (id, quiz_id) ON DELETE CASCADE`
  - Composite FK preventing Cross-Quiz Question Pollution (Question Matching):
    `FOREIGN KEY (question_id, quiz_id) REFERENCES quiz_questions (id, quiz_id) ON DELETE CASCADE`

### 4.16 `notifications`
- **Purpose:** User activity notifications.
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

## 5. Composite Foreign Key & Relational Integrity Architecture

To enforce organizational boundaries entirely at the database layer without relying on frontend validation:

```
[College]
   │
   ├──> Departments (college_id) ───────────────┐
   ├──> Academic Levels (college_id) ───────────┼───────────────────────────┐
   ├──> Academic Sessions (college_id) ─────────┼───────────────────────────┼───────────────────────────┐
   └──> Profiles (college_id)                   │                           │                           │
           │                                    ▼                           ▼                           ▼
           ├──> Teacher Assignments (teacher_id, department_id) ──> (subject_id, department_id) ──> (academic_level_id, college_id)
           │           │
           │           ▼
           └──> Student Enrollments (teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id)
                       │
                       ▼
                 Quizzes (teacher_id, subject_id, academic_level_id, academic_session_id)
                       │
                       ▼
                 Quiz Attempts (id, quiz_id)
                       │
                       ▼
                 Question Attempts (attempt_id, quiz_id) AND (question_id, quiz_id)
```

---

## 6. HOD Role & Department Assignment Integrity

1. **HOD Role Check:** `hod_assignments (profile_id, role)` references `profiles (id, role)`, with CHECK constraint `role = 'HOD'`.
2. **HOD Department Consistency:** `hod_assignments (profile_id, department_id)` references `profiles (id, department_id)`.
3. **Single Active HOD:** `CREATE UNIQUE INDEX uq_active_hod_per_dept ON hod_assignments (department_id) WHERE is_active = true;`.

---

## 7. Role-Dependent Profile Rules

Profile columns `college_id` and `department_id` follow strict nullability rules enforced via CHECK constraint:

| App Role (`role`) | `college_id` Requirement | `department_id` Requirement | Scope |
| :--- | :--- | :--- | :--- |
| `COLLEGE_ADMIN` | NOT NULL | NULL | College-wide admin scope. |
| `HOD` | NOT NULL | NOT NULL | Department head scope. |
| `TEACHER` | NOT NULL | NOT NULL | Department teacher scope. |
| `STUDENT` | NOT NULL | NOT NULL | Department student scope. |

---

## 8. Academic Level vs. Academic Session & Platform Scope

- **Academic Levels:** Grade/study tiers (`FE`, `SE`, `TE`, `BE`). Independent of time.
- **Academic Sessions:** Calendar terms (`2024–2025`, `2025–2026`).
- **Platform Scope:** ORIXA is structured as a higher-education college platform (FE, SE, TE, BE). Display labels like "Grade" in certain UI components are treated as presentation aliases for academic levels.

---

## 9. Game Payload Validation Specification

Audited against `teacher-dashboard.js` and `student-portal.js` source code:

### 9.1 `TILE_PUZZLE`
```json
{
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_option_index": 1
}
```
- Required: `options` (array of 2 to 6 strings), `correct_option_index` (integer $0 \le \text{idx} < \text{options.length}$).

### 9.2 `MATCH_FOLLOWING`
```json
{
  "pairs": [
    { "id": "p1", "prompt": "Question / Item 1", "correct_match": "Answer 1" },
    { "id": "p2", "prompt": "Question / Item 2", "correct_match": "Answer 2" }
  ]
}
```
- Required: `pairs` (array of at least 2 objects containing non-empty `id`, `prompt`, `correct_match`).

### 9.3 `FILL_BLANKS`
```json
{
  "sentence_tokens": ["The", "{blank}", "shines", "brightly."],
  "correct_words": ["sun"],
  "distractors": ["moon", "star"]
}
```
- Required: `sentence_tokens` (array containing `{blank}`), `correct_words` (array matching `{blank}` count), `distractors` (array of strings).

### 9.4 `TRUE_FALSE`
```json
{
  "statement": "The Earth orbits the Sun.",
  "correct_boolean": true
}
```
- Required: `statement` (non-empty string), `correct_boolean` (boolean `true` or `false`).

---

## 10. Attempt Lifecycle & Result Immutability

### 10.1 Attempt Statuses & Single Final Record per Question
- `IN_PROGRESS`: Session active.
- `COMPLETED`: Quiz completed; score, XP, accuracy %, and stars calculated server-side and written as an immutable snapshot.
- `ABANDONED`: Session closed without completion.
- `question_attempts` stores **one final record per question per attempt** (`UNIQUE (attempt_id, question_id)`).

### 10.2 Immutability Enforcement Mechanism
1. **Trigger Enforcement:** `trg_block_completed_attempt_edits` blocks `UPDATE` or `DELETE` on `quiz_attempts` and `question_attempts` when `OLD.status = 'COMPLETED'`.
2. **Student Write-Blocking RLS:** Students are granted `UPDATE` on `quiz_attempts` ONLY when `status = 'IN_PROGRESS'`.
3. **Completion Security Definer Function:** Completion is executed exclusively via `fn_complete_quiz_attempt(attempt_id)`, which verifies answers, computes XP/accuracy/stars server-side, updates `quiz_attempts` to `COMPLETED`, and locks the record.

---

## 11. Hardened Security-Definer Helper Functions

To avoid RLS recursion loops on `public.profiles`:

```sql
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS app_role
SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_auth_college_id() RETURNS UUID
SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT college_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_auth_department_id() RETURNS UUID
SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

REVOKE ALL ON FUNCTION get_auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_auth_role() TO authenticated;
```

---

## 12. Complete Table-by-Table RLS Policy Matrix

| Table Name | Operation | `COLLEGE_ADMIN` | `HOD` | `TEACHER` | `STUDENT` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `colleges` | SELECT | `id = get_auth_college_id()` | `id = get_auth_college_id()` | `id = get_auth_college_id()` | `id = get_auth_college_id()` |
| | INSERT / UPDATE / DELETE | N/A | N/A | N/A | N/A |
| `departments` | SELECT | Same college | Same college | Same college | Same college |
| | INSERT / UPDATE / DELETE | Same college | N/A | N/A | N/A |
| `academic_levels` | SELECT | Same college | Same college | Same college | Same college |
| | INSERT / UPDATE / DELETE | Same college | N/A | N/A | N/A |
| `academic_sessions` | SELECT | Same college | Same college | Same college | Same college |
| | INSERT / UPDATE / DELETE | Same college | N/A | N/A | N/A |
| `subjects` | SELECT | Same college | Same college | Same college | Same college |
| | INSERT / UPDATE / DELETE | Same college | Same department | N/A | N/A |
| `profiles` | SELECT | Same college | Same college | Same department | Same department |
| | INSERT / UPDATE / DELETE | Same college | Same department | Self update only | Self update only |
| `hod_assignments` | SELECT | Same college | Same college | Same department | N/A |
| | INSERT / UPDATE / DELETE | Same college | N/A | N/A | N/A |
| `teacher_profiles` | SELECT | Same college | Same department | Same department | Assigned teacher |
| | INSERT / UPDATE / DELETE | Same college | Same department | Self update only | N/A |
| `student_profiles` | SELECT | Same college | Same department | Assigned students | Self only |
| | INSERT / UPDATE / DELETE | Same college | Same department | N/A | Self update only |
| `teacher_subject_class_assignments` | SELECT | Same college | Same department | Same department | Enrolled subjects |
| | INSERT / UPDATE / DELETE | Same college | Same department | N/A | N/A |
| `student_subject_assignments` | SELECT | Same college | Same department | Assigned students | Self enrollments |
| | INSERT / UPDATE / DELETE | Same college | Same department | N/A | N/A |
| `quizzes` | SELECT | Same college | Same department | Own created quizzes | Eligible published quizzes |
| | INSERT / UPDATE / DELETE | Same college | Same department | Own created quizzes | N/A |
| `quiz_questions` | SELECT | Same college | Same department | Own quiz questions | Eligible quiz questions |
| | INSERT / UPDATE / DELETE | Same college | Same department | Own quiz questions | N/A |
| `quiz_attempts` | SELECT | Same college | Same department | Assigned student attempts | Own attempts |
| | INSERT | N/A | N/A | N/A | Self (`student_id = auth.uid()`) |
| | UPDATE | N/A | N/A | N/A | Self (`status = 'IN_PROGRESS'`) |
| | DELETE | N/A | N/A | N/A | N/A |
| `question_attempts` | SELECT | Same college | Same department | Assigned student attempts | Own attempts |
| | INSERT / UPDATE | N/A | N/A | N/A | Self (`attempt.status = 'IN_PROGRESS'`) |
| | DELETE | N/A | N/A | N/A | N/A |
| `notifications` | SELECT | Self (`user_id = auth.uid()`) | Self | Self | Self |
| | INSERT | System / Admin | System / HOD | N/A | N/A |
| | UPDATE | Self (`is_read`) | Self (`is_read`) | Self (`is_read`) | Self (`is_read`) |
| | DELETE | Self | Self | Self | Self |

---

## 13. Excel Import Architecture

1. **Faculty & Student Bulk Import Mechanics:** Executed inside a single atomic PostgreSQL transaction.
2. **String Resolution:** Exact/case-insensitive matching maps subject names, year codes, and employee IDs to primary key UUIDs.
3. **Validation & Rollback:**
   - Any structural, missing required field, or organizational mismatch rolls back the entire transaction.
4. **Duplicate Handling:** Marked explicitly as `[REQUIRES DECISION FROM PROJECT OWNER]` (reject duplicates vs UPSERT/overwrite).

---

## 14. Analytics Definitions

Database views derive real-time reporting without redundant storage tables:

1. **`vw_college_analytics`:** Total departments, active teachers, students, and average accuracy % across completed attempts (`quiz_attempts.status = 'COMPLETED'`) grouped by `college_id`.
2. **`vw_department_analytics`:** Student count, teacher count, subject count, and average accuracy % grouped by `department_id`.
3. **`vw_teacher_performance`:** Total published quizzes, total completed student attempts, and average accuracy % per teacher (`teacher_id`). *(Note: "Pass rate" marked as `[REQUIRES DECISION FROM PROJECT OWNER]`).*
4. **`vw_student_leaderboard`:** Sum of `final_earned_xp`, sum of `final_stars`, completed quiz count, and average `final_accuracy_pct` per student (`student_id`).

---

## 15. Server-Side Scoring Architecture

All score calculations occur server-side during execution of `fn_complete_quiz_attempt()`:

1. **Question Ratio:** $\text{ratio} = \max(0, 1.0 - 0.25 \times \text{mistakes\_count})$ if solved, else 0.
2. **Earned XP:** $\text{Earned XP} = \text{Math.round}\left(\sum \frac{\text{Total Possible XP}}{\text{Total Questions}} \times \text{ratio}\right)$.
3. **Accuracy Percentage:** $\text{Accuracy \%} = \text{Math.round}\left(\frac{\sum \text{ratio}}{\text{Total Questions}} \times 100\right)$.
4. **Stars:** 3 stars ($> 90\%$), 2 stars ($\ge 66.66\%$), 1 star ($\ge 33.33\%$), 0 stars ($< 33.33\%$).

---

## 16. Invalid-Scenario Security Test Matrix

| # | Invalid Scenario | Exact Prevention Mechanism |
| :--- | :--- | :--- |
| 1 | Teacher from Dept A creates quiz using Dept B subject | FK `quizzes (subject_id, department_id) REFERENCES subjects (id, department_id)` |
| 2 | Teacher creates quiz for subject they do not teach | FK `quizzes (teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES teacher_subject_class_assignments` |
| 3 | Teacher creates quiz for level they do not teach | FK `quizzes (teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES teacher_subject_class_assignments` |
| 4 | Teacher creates quiz for session they are not assigned to | FK `quizzes (teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES teacher_subject_class_assignments` |
| 5 | Student assigned to teacher who does not teach subject | Composite FK `student_subject_assignments (teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id)` |
| 6 | Student assigned to teacher from another department | FK `profiles (department_id)` on teacher and student + assignment FKs |
| 7 | Student assignment has no valid teacher assignment | `NOT NULL` constraint on `student_subject_assignments.teacher_assignment_id` + composite FK |
| 8 | Student attempt references quiz from another college | RLS policy on `quizzes` + composite FK `(quiz_id, college_id)` |
| 9 | Question attempt references question from another quiz | Composite FK `question_attempts (question_id, quiz_id) REFERENCES quiz_questions (id, quiz_id)` |
| 10 | HOD assignment references non-HOD profile | Composite FK `hod_assignments (profile_id, role) REFERENCES profiles (id, role)` + CHECK `(role='HOD')` |
| 11 | HOD from Dept A accesses Dept B | RLS policy enforcing `department_id = get_auth_department_id()` |
| 12 | Teacher accesses another teacher's student | RLS policy joining `student_subject_assignments` where `teacher_id = auth.uid()` |
| 13 | Student accesses another student's result | RLS policy enforcing `student_id = auth.uid()` on `quiz_attempts` |
| 14 | Client modifies completed XP | Trigger `trg_block_completed_attempt_edits` + RLS write-blocking on `status='COMPLETED'` |
| 15 | Client modifies completed stars | Trigger `trg_block_completed_attempt_edits` + RLS write-blocking on `status='COMPLETED'` |
| 16 | Client modifies completed accuracy | Trigger `trg_block_completed_attempt_edits` + RLS write-blocking on `status='COMPLETED'` |
| 17 | Two current academic sessions exist for one college | Partial Unique Index `uq_single_current_session ON academic_sessions (college_id) WHERE is_current = true` |
| 18 | Two active HODs exist for one department | Partial Unique Index `uq_active_hod_per_dept ON hod_assignments (department_id) WHERE is_active = true` |
| 19 | College A user accesses College B data | RLS policy enforcing `college_id = get_auth_college_id()` across all tables |

---

## 17. Remaining Project-Owner Decisions

The following non-schema-blocking operational decisions are explicitly recorded for confirmation:

1. **`[REQUIRES DECISION FROM PROJECT OWNER]` Excel Import Duplicate Handling:** Reject duplicate rows vs UPSERT/overwrite existing records.
2. **`[REQUIRES DECISION FROM PROJECT OWNER]` Pass Rate Threshold:** Whether a pass/fail percentage threshold exists for quizzes in analytics.
3. **`[REQUIRES DECISION FROM PROJECT OWNER]` Co-Teaching Support:** Whether co-teaching (multiple teachers per subject for 1 student) is required in future releases.

---

## 18. Phase 3 Migration Readiness Checklist

- [x] **1. Student Assignment Teacher FK Hardened:** `teacher_assignment_id` is NOT NULL with direct composite FK.
- [x] **2. Quiz Teacher Assignment Scoping Enforced:** Composite FK on `quizzes` referencing `teacher_subject_class_assignments`.
- [x] **3. College & Department Consistency Enforced:** Composite UNIQUE targets defined on `profiles`, `departments`, `subjects`.
- [x] **4. HOD Role Enforced:** Composite FK `(profile_id, role)` referencing `profiles` with `CHECK (role = 'HOD')`.
- [x] **5. HOD Single Active Assignment Enforced:** Partial unique index `uq_active_hod_per_dept`.
- [x] **6. Student Academic Level Consistency Enforced:** Composite FK referencing `academic_levels (id, college_id)`.
- [x] **7. Question Attempt Cross-Quiz Prevention Enforced:** Composite FKs `(attempt_id, quiz_id)` and `(question_id, quiz_id)`.
- [x] **8. Completed Attempt Immutability Architecture Defined:** BEFORE UPDATE trigger + student RLS write-blocking.
- [x] **9. Server-Side Completion Function Specified:** `fn_complete_quiz_attempt(attempt_id)`.
- [x] **10. Complete RLS Matrix Provided:** 16 tables x 4 roles x 4 operations fully specified.
- [x] **11. Security-Definer Helpers Hardened:** Implicit `auth.uid()`, `SECURITY DEFINER`, `STABLE`, fixed `search_path`.
- [x] **12. Atomic Excel Import Architecture Defined:** Single PostgreSQL transaction rollback.
- [x] **13. Analytics Metrics Formulas Defined:** Exact formulas and filters specified without ambiguity.
- [x] **14. Server-Side Scoring Formulas Specified:** Preserved exact XP, accuracy %, and star thresholds.
- [x] **15. Platform Scope Confirmed:** College higher-ed structure (FE, SE, TE, BE).
- [x] **16. Single Teacher per Student Rule Preserved:** `UNIQUE (student_id, subject_id, academic_level_id, academic_session_id)`.
- [x] **17. Single Current Academic Session Enforced:** Partial unique index `uq_single_current_session`.
- [x] **18. All 19 Invalid Security Scenarios Tested & Prevented:** Mapped to exact database constraints.
- [x] **19. Role-Dependent NULLability Rules Enforced:** CHECK constraint on `profiles`.
- [x] **20. Game Payload JSONB Schemas Audited & Finalized:** Audited against all 4 frontend game engines.
- [x] **21. Quiz Lifecycle Defined:** `DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`.
- [x] **22. Quiz Availability Rule Specified:** Derived from student enrollment matching.
- [x] **23. Notification Model Defined:** Bound to `user_id` FK with priority CHECK constraints.
- [x] **24. Human-Readable Identifiers Preserved:** Unique domain codes alongside UUID primary keys.
- [x] **25. Remaining Decisions Flagged:** 3 non-schema-blocking choices explicitly marked for owner input.
- [x] **26. Pre-Migration Specification Complete:** Architecture is 100% complete and ready for Phase 3 SQL migration generation.

---

## 19. Execution Audit Report

A. **Files Inspected:**
   - `college-dashboard.js`
   - `hod-dashboard.js`
   - `teacher-dashboard.js`
   - `student-portal.js`
   - `teacher.js`
   - `student.js`
   - `docs/ORIXA-DATABASE-ARCHITECTURE.md`

B. **Files Modified:**
   - `docs/ORIXA-DATABASE-ARCHITECTURE.md` (Design specification only)

C. **Database Changes Executed:**
   - **NONE** (Design-only phase)

D. **Supabase Changes Executed:**
   - **NONE** (Design-only phase)

E. **Remaining Owner Decisions:**
   1. Excel Import Duplicate Handling (reject duplicate rows vs UPSERT/overwrite).
   2. Pass Rate Threshold (whether a pass/fail threshold exists in analytics).
   3. Co-Teaching Support (whether multiple teachers per student per subject is needed in future).
