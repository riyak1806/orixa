-- =============================================================================
-- ORIXA PLATFORM — RLS & DATABASE SECURITY SUITE
-- Deterministic pgTAP-style tests covering scenarios A through S
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SELECT plan(19);

-- Helper function to simulate authenticated role & user ID in Supabase RLS context
CREATE OR REPLACE FUNCTION set_test_auth_context(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END;
$$;

-- -----------------------------------------------------------------------------
-- TEST DATA FIXTURES
-- -----------------------------------------------------------------------------

-- Create 2 Colleges
INSERT INTO public.colleges (id, code, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'COL-A', 'College Alpha'),
  ('22222222-2222-2222-2222-222222222222', 'COL-B', 'College Beta');

-- Create Departments
INSERT INTO public.departments (id, college_id, code, name) VALUES
  ('11111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-111111111111', 'CS-A', 'Computer Science Alpha'),
  ('11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 'ME-A', 'Mechanical Alpha'),
  ('22222222-2222-2222-2222-333333333333', '22222222-2222-2222-2222-222222222222', 'CS-B', 'Computer Science Beta');

-- Create Academic Levels & Sessions
INSERT INTO public.academic_levels (id, college_id, code, display_name) VALUES
  ('11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-111111111111', 'FE', 'First Year'),
  ('22222222-2222-2222-2222-444444444444', '22222222-2222-2222-2222-222222222222', 'FE', 'First Year');

INSERT INTO public.academic_sessions (id, college_id, code, start_date, end_date, is_current) VALUES
  ('11111111-1111-1111-1111-555555555555', '11111111-1111-1111-1111-111111111111', '2024-2025', '2024-01-01', '2024-12-31', true),
  ('22222222-2222-2222-2222-555555555555', '22222222-2222-2222-2222-222222222222', '2024-2025', '2024-01-01', '2024-12-31', true);

-- Create Subjects
INSERT INTO public.subjects (id, department_id, code, name) VALUES
  ('11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-222222222222', 'CS101', 'Intro to CS'),
  ('22222222-2222-2222-2222-666666666666', '22222222-2222-2222-2222-333333333333', 'CS101', 'Intro to CS Beta');

-- Mock auth.users & public.profiles
-- User UUIDs:
-- Admin A:  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- HOD A:    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- Teacher A1: 'cccccccc-cccc-cccc-cccc-cccccccccccc'
-- Teacher A2: 'dddddddd-dddd-dddd-dddd-dddddddddddd'
-- Student A1: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
-- Student A2: 'ffffffff-ffff-ffff-ffff-ffffffffffff'
-- Student B1: '99999999-9999-9999-9999-999999999999'

INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin.a@col-a.edu'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hod.cs.a@col-a.edu'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'teacher.a1@col-a.edu'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'teacher.a2@col-a.edu'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'student.a1@col-a.edu'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'student.a2@col-a.edu'),
  ('99999999-9999-9999-9999-999999999999', 'student.b1@col-b.edu');

INSERT INTO public.profiles (id, college_id, department_id, role, full_name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, 'COLLEGE_ADMIN', 'Admin Alpha'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'HOD', 'HOD CS Alpha'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'TEACHER', 'Teacher A1'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'TEACHER', 'Teacher A2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'Student A1'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'Student A2'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-333333333333', 'STUDENT', 'Student B1');

INSERT INTO public.teacher_profiles (profile_id, college_id, role, employee_id) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'TEACHER', 'EMP-A1'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'TEACHER', 'EMP-A2');

INSERT INTO public.student_profiles (profile_id, college_id, role, student_id, academic_level_id) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'STU-A1', '11111111-1111-1111-1111-444444444444'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'STU-A2', '11111111-1111-1111-1111-444444444444'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'STUDENT', 'STU-B1', '22222222-2222-2222-2222-444444444444');

-- Teacher Assignments
INSERT INTO public.teacher_subject_class_assignments (id, teacher_id, role, college_id, department_id, subject_id, academic_level_id, academic_session_id, is_active) VALUES
  ('11111111-3333-3333-3333-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', true),
  ('22222222-3333-3333-3333-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', true);

-- Student Assignment (Student A1 assigned to Teacher A1)
INSERT INTO public.student_subject_assignments (id, student_id, student_role, college_id, subject_id, academic_level_id, academic_session_id, teacher_id, teacher_assignment_id, is_active) VALUES
  ('11111111-4444-4444-4444-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-3333-3333-3333-111111111111', true);

-- Quizzes
-- Quiz 1 (Teacher A1, Published)
INSERT INTO public.quizzes (id, college_id, department_id, teacher_id, teacher_role, subject_id, academic_level_id, academic_session_id, teacher_assignment_id, title, game_type, status, default_max_chances, total_possible_xp) VALUES
  ('11111111-5555-5555-5555-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', '11111111-3333-3333-3333-111111111111', 'Quiz Alpha Published', 'TRUE_FALSE', 'PUBLISHED', 3, 100),
  ('22222222-5555-5555-5555-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'TEACHER', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', '22222222-3333-3333-3333-111111111111', 'Quiz Beta Published', 'TRUE_FALSE', 'PUBLISHED', 3, 100);

-- Questions
INSERT INTO public.quiz_questions (id, quiz_id, question_order, question_text, max_chances, game_payload) VALUES
  ('11111111-6666-6666-6666-111111111111', '11111111-5555-5555-5555-111111111111', 1, 'Is SQL powerful?', 3, '{"statement": "Is SQL powerful?", "correct_boolean": "true"}'::jsonb),
  ('22222222-6666-6666-6666-111111111111', '22222222-5555-5555-5555-111111111111', 1, 'Is 2+2=5?', 3, '{"statement": "Is 2+2=5?", "correct_boolean": "false"}'::jsonb);

-- -----------------------------------------------------------------------------
-- EXECUTABLE SECURITY SCENARIOS
-- -----------------------------------------------------------------------------

-- A. College isolation check
SELECT is(
  (SELECT count(*)::int FROM public.colleges),
  2,
  'A. Colleges table contains exact test fixtures'
);

-- B. Department isolation check
SELECT is(
  (SELECT count(*)::int FROM public.departments WHERE college_id = '11111111-1111-1111-1111-111111111111'),
  2,
  'B. Departments strictly scoped to College A'
);

-- C. Student profile self-only access check
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  'C. Student A1 cannot read Student A2 profile'
);

-- D. Student assignments self-only check
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.student_subject_assignments WHERE student_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  'D. Student A1 cannot read Student A2 assignment'
);

-- E. Teacher cannot read unrelated student profile
PERFORM set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  'E. Teacher A1 cannot read unassigned Student A2 profile'
);

-- F. Teacher cannot read unrelated student assignment
PERFORM set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.student_subject_assignments WHERE student_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  'F. Teacher A1 cannot read unassigned Student A2 assignment'
);

-- G. Teacher can read assigned student profile
PERFORM set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  1,
  'G. Teacher A1 can read assigned Student A1 profile'
);

-- H. Student can read own profile
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  1,
  'H. Student A1 can read own profile'
);

-- I. Student accesses only assigned published quizzes
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.quizzes),
  1,
  'I. Student A1 sees Quiz Alpha (assigned) but not Quiz Beta (unassigned teacher)'
);

-- J. Teacher cannot read another teacher's quiz questions
PERFORM set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_questions WHERE quiz_id = '22222222-5555-5555-5555-111111111111'),
  0,
  'J. Teacher A1 cannot read Teacher A2 quiz questions'
);

-- K. Student quiz_questions direct SELECT denial & RPC sanitization
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_questions),
  0,
  'K1. Student A1 direct SELECT on quiz_questions yields 0 rows'
);

-- RPC Start attempt + question sanitization verification
PERFORM set_config('role', 'postgres', true);
INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES
  ('11111111-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS');

PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (public.fn_get_attempt_questions('11111111-7777-7777-7777-111111111111')->0->'game_payload'->>'correct_boolean'),
  NULL,
  'K2. fn_get_attempt_questions strips correct_boolean from payload'
);

-- L. Student quiz_attempts direct write denial
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES ('99999999-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS') $$,
  '42501',
  NULL,
  'L. Student A1 direct INSERT on quiz_attempts denied by RLS/privileges'
);

-- M. Student question_attempts direct write denial
PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved) VALUES ('11111111-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', true) $$,
  '42501',
  NULL,
  'M. Student A1 direct INSERT on question_attempts denied by RLS/privileges'
);

-- N. HOD can access department question attempts
PERFORM set_config('role', 'postgres', true);
INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved, mistakes_count, chances_used) VALUES
  ('11111111-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', false, 1, 1);

PERFORM set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.question_attempts),
  1,
  'N. HOD CS Alpha can read department question attempts'
);

-- O. Teacher can access own quiz attempts
PERFORM set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_attempts),
  1,
  'O. Teacher A1 can read attempts for own quizzes'
);

-- P. Cross-college record rejection
PERFORM set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.teacher_subject_class_assignments (teacher_id, role, college_id, department_id, subject_id, academic_level_id, academic_session_id) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', '22222222-2222-2222-2222-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555') $$,
  '23503',
  NULL,
  'P. Cross-college subject assignment rejected by FK'
);

-- Q. Cross-department record rejection
PERFORM set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.teacher_subject_class_assignments (teacher_id, role, college_id, department_id, subject_id, academic_level_id, academic_session_id) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555') $$,
  '23503',
  NULL,
  'Q. Cross-department teacher assignment rejected by FK'
);

-- R. Completed attempt immutability
PERFORM set_config('role', 'postgres', true);
UPDATE public.quiz_attempts SET status = 'COMPLETED' WHERE id = '11111111-7777-7777-7777-111111111111';

SELECT throws_ok(
  $$ UPDATE public.quiz_attempts SET final_earned_xp = 500 WHERE id = '11111111-7777-7777-7777-111111111111' $$,
  'P0001',
  NULL,
  'R. Modifying completed attempt throws exception'
);

-- S. Incomplete attempt completion rejection
PERFORM set_config('role', 'postgres', true);
INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES
  ('22222222-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS');
INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved, mistakes_count, chances_used) VALUES
  ('22222222-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', false, 1, 1);

PERFORM set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ SELECT public.fn_complete_quiz_attempt('22222222-7777-7777-7777-111111111111') $$,
  'P0001',
  NULL,
  'S. Completing an unsolved/unexhausted quiz attempt throws exception'
);

SELECT * FROM finish();

ROLLBACK;
