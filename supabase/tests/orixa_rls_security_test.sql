-- =============================================================================
-- ORIXA PLATFORM — RLS & DATABASE SECURITY SUITE
-- Comprehensive Administration & Data pgTAP tests
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Isolate test fixtures from pre-existing local seed data in transaction
DELETE FROM public.question_attempts;
DELETE FROM public.quiz_attempts;
DELETE FROM public.quiz_questions;
DELETE FROM public.quizzes;
DELETE FROM public.student_subject_assignments;
DELETE FROM public.teacher_subject_class_assignments;
DELETE FROM public.hod_assignments;
DELETE FROM public.student_profiles;
DELETE FROM public.teacher_profiles;
DELETE FROM public.profiles;
DELETE FROM public.subjects;
DELETE FROM public.academic_sessions;
DELETE FROM public.academic_levels;
DELETE FROM public.departments;
DELETE FROM public.colleges;
DELETE FROM auth.users;

SELECT plan(32);

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
  ('11111111-1111-1111-1111-777777777777', '11111111-1111-1111-1111-333333333333', 'ME101', 'Intro to Mechanical'),
  ('22222222-2222-2222-2222-666666666666', '22222222-2222-2222-2222-333333333333', 'CS101', 'Intro to CS Beta');

-- Mock auth.users & public.profiles
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin.a@col-a.edu'),
  ('aaaaaaaa-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin.b@col-b.edu'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hod.cs.a@col-a.edu'),
  ('bbbbbbbb-cccc-cccc-cccc-cccccccccccc', 'hod.me.a@col-a.edu'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'teacher.a1@col-a.edu'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'teacher.a2@col-a.edu'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'student.a1@col-a.edu'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'student.a2@col-a.edu'),
  ('99999999-9999-9999-9999-999999999999', 'student.b1@col-b.edu');

INSERT INTO public.profiles (id, college_id, department_id, role, full_name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, 'COLLEGE_ADMIN', 'Admin Alpha'),
  ('aaaaaaaa-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', NULL, 'COLLEGE_ADMIN', 'Admin Beta'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'HOD', 'HOD CS Alpha'),
  ('bbbbbbbb-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-333333333333', 'HOD', 'HOD ME Alpha'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'TEACHER', 'Teacher A1'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'TEACHER', 'Teacher A2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'Student A1'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'Student A2'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-333333333333', 'STUDENT', 'Student B1');

INSERT INTO public.hod_assignments (profile_id, role, department_id, is_active) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HOD', '11111111-1111-1111-1111-222222222222', true),
  ('bbbbbbbb-cccc-cccc-cccc-cccccccccccc', 'HOD', '11111111-1111-1111-1111-333333333333', true);

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

-- 1. College A admin cannot access College B data
SELECT set_test_auth_context('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'); -- Admin College A
SELECT is(
  (SELECT count(*)::int FROM public.departments WHERE college_id = '22222222-2222-2222-2222-222222222222'),
  0,
  '1. College A admin cannot access College B departments'
);

-- 2. College A admin can access College A data
SELECT set_test_auth_context('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'); -- Admin College A
SELECT is(
  (SELECT count(*)::int FROM public.departments WHERE college_id = '11111111-1111-1111-1111-111111111111'),
  2,
  '2. College A admin can access College A departments'
);

-- 3. HOD cannot access another department profiles
SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE department_id = '11111111-1111-1111-1111-333333333333'),
  0,
  '3. HOD CS Alpha cannot access ME department profiles'
);

-- 4. HOD can access own department
SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE department_id = '11111111-1111-1111-1111-222222222222' AND id != 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  4,
  '4. HOD CS Alpha can access profiles in own department'
);

-- 5. HOD cannot access another college
SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.departments WHERE college_id = '22222222-2222-2222-2222-222222222222'),
  0,
  '5. HOD CS Alpha cannot access College B departments'
);

-- 6. HOD can manage department teachers
SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.teacher_profiles WHERE profile_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  1,
  '6. HOD CS Alpha can read/manage department teacher profiles'
);

-- 7. HOD can manage department students
SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.student_profiles WHERE profile_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  1,
  '7. HOD CS Alpha can read/manage department student profiles'
);

-- 8. Teacher cannot access unrelated teacher's students
SELECT set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  '8. Teacher A1 cannot access Student A2 (assigned to Teacher A2)'
);

-- 9. Teacher can access assigned students
SELECT set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  1,
  '9. Teacher A1 can access assigned Student A1'
);

-- 10. Teacher cannot create arbitrary student records if product rules prohibit it
SELECT set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT throws_ok(
  $$ INSERT INTO public.profiles (id, college_id, department_id, role, full_name) VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'Illegal Student') $$,
  '42501',
  NULL,
  '10. Teacher cannot insert student profile'
);

-- 11. Student cannot access another student's profile
SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.profiles WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  '11. Student A1 cannot read Student A2 profile'
);

-- 12. Student cannot access another student's assignments
SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.student_subject_assignments WHERE student_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  0,
  '12. Student A1 cannot read Student A2 assignment'
);

-- 13. Student can access own assignment
SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.student_subject_assignments WHERE student_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  1,
  '13. Student A1 can access own subject assignment'
);

-- 14. Cross-college teacher assignment fails
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.teacher_subject_class_assignments (teacher_id, role, college_id, department_id, subject_id, academic_level_id, academic_session_id) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', '22222222-2222-2222-2222-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555') $$,
  '23503',
  NULL,
  '14. Cross-college teacher assignment rejected by FK'
);

-- 15. Cross-department teacher assignment fails
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.teacher_subject_class_assignments (teacher_id, role, college_id, department_id, subject_id, academic_level_id, academic_session_id) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TEACHER', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-333333333333', '11111111-1111-1111-1111-777777777777', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555') $$,
  '23503',
  NULL,
  '15. Cross-department teacher assignment rejected by FK'
);

-- 16. Cross-college student assignment fails
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.student_subject_assignments (student_id, student_role, college_id, subject_id, academic_level_id, academic_session_id, teacher_id, teacher_assignment_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-777777777777', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-3333-3333-3333-111111111111') $$,
  '23503',
  NULL,
  '16. Cross-college student assignment rejected by FK'
);

-- 17. Cross-department student assignment fails
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.student_subject_assignments (student_id, student_role, college_id, subject_id, academic_level_id, academic_session_id, teacher_id, teacher_assignment_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-777777777777', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-3333-3333-3333-111111111111') $$,
  '23503',
  NULL,
  '17. Cross-department student assignment rejected by FK'
);

-- 18. Invalid subject/academic-level/session relationship fails
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.student_subject_assignments (student_id, student_role, college_id, subject_id, academic_level_id, academic_session_id, teacher_id, teacher_assignment_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-666666666666', '22222222-2222-2222-2222-444444444444', '11111111-1111-1111-1111-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-3333-3333-3333-111111111111') $$,
  '23503',
  NULL,
  '18. Invalid academic level relationship fails'
);

-- 19. Duplicate logical assignment is rejected
SELECT set_config('role', 'postgres', true);
SELECT throws_ok(
  $$ INSERT INTO public.student_subject_assignments (student_id, student_role, college_id, subject_id, academic_level_id, academic_session_id, teacher_id, teacher_assignment_id) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-666666666666', '11111111-1111-1111-1111-444444444444', '11111111-1111-1111-1111-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-3333-3333-3333-111111111111') $$,
  '23505',
  NULL,
  '19. Duplicate logical student assignment rejected'
);

-- 20. Valid HOD-created teacher relationship succeeds
SELECT set_config('role', 'postgres', true);
INSERT INTO auth.users (id, email) VALUES ('88888888-8888-8888-8888-888888888888', 'newteacher@col-a.edu');
INSERT INTO public.profiles (id, college_id, department_id, role, full_name) VALUES ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'TEACHER', 'New Teacher');

SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
INSERT INTO public.teacher_profiles (profile_id, college_id, role, employee_id) VALUES ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'TEACHER', 'EMP-NEW');
SELECT is(
  (SELECT count(*)::int FROM public.teacher_profiles WHERE profile_id = '88888888-8888-8888-8888-888888888888'),
  1,
  '20. Valid HOD-created teacher profile relationship succeeds'
);

-- 21. Valid HOD-created student relationship succeeds
SELECT set_config('role', 'postgres', true);
INSERT INTO auth.users (id, email) VALUES ('77777777-7777-7777-7777-777777777777', 'newstudent@col-a.edu');
INSERT INTO public.profiles (id, college_id, department_id, role, full_name) VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-222222222222', 'STUDENT', 'New Student');

SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
INSERT INTO public.student_profiles (profile_id, college_id, role, student_id, academic_level_id) VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'STUDENT', 'STU-NEW', '11111111-1111-1111-1111-444444444444');
SELECT is(
  (SELECT count(*)::int FROM public.student_profiles WHERE profile_id = '77777777-7777-7777-7777-777777777777'),
  1,
  '21. Valid HOD-created student profile relationship succeeds'
);

-- Additional Gameplay & Immutability Tests (Preserved from baseline)
SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.quizzes),
  1,
  'Preserved: Student A1 sees Quiz Alpha but not Quiz Beta'
);

SELECT set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_questions WHERE quiz_id = '22222222-5555-5555-5555-111111111111'),
  0,
  'Preserved: Teacher A1 cannot read Teacher A2 quiz questions'
);

SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_questions),
  0,
  'Preserved: Student A1 direct SELECT on quiz_questions yields 0 rows'
);

SELECT set_config('role', 'postgres', true);
INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES
  ('11111111-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS');

SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT is(
  (public.fn_get_attempt_questions('11111111-7777-7777-7777-111111111111')->0->'game_payload'->>'correct_boolean'),
  NULL,
  'Preserved: fn_get_attempt_questions strips correct_boolean from payload'
);

SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES ('99999999-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS') $$,
  '42501',
  NULL,
  'Preserved: Student A1 direct INSERT on quiz_attempts denied'
);

SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved) VALUES ('11111111-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', true) $$,
  '42501',
  NULL,
  'Preserved: Student A1 direct INSERT on question_attempts denied'
);

SELECT set_config('role', 'postgres', true);
INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved, mistakes_count, chances_used) VALUES
  ('11111111-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', false, 1, 1);

SELECT set_test_auth_context('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); -- HOD CS Alpha
SELECT is(
  (SELECT count(*)::int FROM public.question_attempts),
  1,
  'Preserved: HOD CS Alpha can read department question attempts'
);

SELECT set_test_auth_context('cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Teacher A1
SELECT is(
  (SELECT count(*)::int FROM public.quiz_attempts),
  1,
  'Preserved: Teacher A1 can read attempts for own quizzes'
);

SELECT set_config('role', 'postgres', true);
UPDATE public.quiz_attempts SET status = 'COMPLETED' WHERE id = '11111111-7777-7777-7777-111111111111';

SELECT throws_ok(
  $$ UPDATE public.quiz_attempts SET final_earned_xp = 500 WHERE id = '11111111-7777-7777-7777-111111111111' $$,
  'P0001',
  NULL,
  'Preserved: Modifying completed attempt throws exception'
);

SELECT throws_ok(
  $$ DELETE FROM public.quiz_attempts WHERE id = '11111111-7777-7777-7777-111111111111' $$,
  'P0001',
  NULL,
  'Preserved: Deleting completed attempt throws exception'
);

SELECT set_config('role', 'postgres', true);
INSERT INTO public.quiz_attempts (id, student_id, student_role, quiz_id, status) VALUES
  ('22222222-7777-7777-7777-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STUDENT', '11111111-5555-5555-5555-111111111111', 'IN_PROGRESS');
INSERT INTO public.question_attempts (attempt_id, quiz_id, question_id, is_solved, mistakes_count, chances_used) VALUES
  ('22222222-7777-7777-7777-111111111111', '11111111-5555-5555-5555-111111111111', '11111111-6666-6666-6666-111111111111', false, 1, 1);

SELECT set_test_auth_context('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Student A1
SELECT throws_ok(
  $$ SELECT public.fn_complete_quiz_attempt('22222222-7777-7777-7777-111111111111') $$,
  'P0001',
  NULL,
  'Preserved: Completing an unsolved/unexhausted quiz attempt throws exception'
);

SELECT * FROM finish();

ROLLBACK;
