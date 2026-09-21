-- =============================================================================
-- ORIXA PLATFORM — LOCAL DEVELOPMENT SEED DATA
-- Local seed script providing pre-provisioned demo/test accounts across all roles.
-- Internal email format: <login_id>@auth.orixa.internal
-- Default seed password for local dev accounts: 'Password123!'
-- =============================================================================

BEGIN;

-- 1. Institutional Hierarchy Fixtures
INSERT INTO public.colleges (id, code, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'jspmntc', 'JSPM NTC College of Engineering')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.departments (id, college_id, code, name) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'jspmntccs', 'Computer Engineering Department')
ON CONFLICT (college_id, code) DO NOTHING;

INSERT INTO public.academic_levels (id, college_id, code, display_name, rank_order) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'FE', 'First Year', 1),
  ('33333333-3333-3333-3333-444444444444', '11111111-1111-1111-1111-111111111111', 'SE', 'Second Year', 2)
ON CONFLICT (college_id, code) DO NOTHING;

INSERT INTO public.academic_sessions (id, college_id, code, start_date, end_date, is_current) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '2024-2025', '2024-01-01', '2024-12-31', true)
ON CONFLICT (college_id, code) DO NOTHING;

INSERT INTO public.subjects (id, department_id, code, name) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'CS101', 'Computer Science & Programming')
ON CONFLICT (department_id, code) DO NOTHING;

-- 2. Auth Users & Profiles Data Fixtures
-- Password hash below corresponds to 'Password123!' created via pgcrypto crypt()
-- 2.1 COLLEGE_ADMIN (login_id: 'jspmntc')
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'jspmntc@auth.orixa.internal',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id":"jspmntc"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, college_id, department_id, role, full_name, is_active, login_id
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  NULL,
  'COLLEGE_ADMIN',
  'JSPM NTC General Administrator',
  true,
  'jspmntc'
) ON CONFLICT (id) DO UPDATE SET login_id = EXCLUDED.login_id;

-- 2.2 HOD (login_id: 'HOD-CS-01')
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'hod-cs-01@auth.orixa.internal',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id":"HOD-CS-01"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, college_id, department_id, role, full_name, is_active, login_id
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'HOD',
  'Dr. Rajesh Kumar (HOD CS)',
  true,
  'HOD-CS-01'
) ON CONFLICT (id) DO UPDATE SET login_id = EXCLUDED.login_id;

INSERT INTO public.hod_assignments (
  profile_id, role, department_id, is_active
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  'HOD',
  '22222222-2222-2222-2222-222222222222',
  true
) ON CONFLICT DO NOTHING;

-- 2.3 TEACHER (login_id: 'EMP-CS-01')
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
  '30000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'emp-cs-01@auth.orixa.internal',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id":"EMP-CS-01"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, college_id, department_id, role, full_name, is_active, login_id
) VALUES (
  '30000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'TEACHER',
  'Prof. Sarah Jenkins',
  true,
  'EMP-CS-01'
) ON CONFLICT (id) DO UPDATE SET login_id = EXCLUDED.login_id;

INSERT INTO public.teacher_profiles (
  profile_id, college_id, role, employee_id, designation
) VALUES (
  '30000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'TEACHER',
  'EMP-CS-01',
  'Senior Assistant Professor'
) ON CONFLICT (profile_id) DO NOTHING;

-- 2.4 STUDENT (login_id: 'STAR_STUDENT')
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES (
  '40000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'star_student@auth.orixa.internal',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id":"STAR_STUDENT"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, college_id, department_id, role, full_name, is_active, login_id
) VALUES (
  '40000000-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'STUDENT',
  'Alex Rivera',
  true,
  'STAR_STUDENT'
) ON CONFLICT (id) DO UPDATE SET login_id = EXCLUDED.login_id;

INSERT INTO public.student_profiles (
  profile_id, college_id, role, student_id, academic_level_id, roll_number
) VALUES (
  '40000000-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  'STUDENT',
  'STAR_STUDENT',
  '33333333-3333-3333-3333-333333333333',
  'CS-FE-01'
) ON CONFLICT (profile_id) DO NOTHING;

COMMIT;
