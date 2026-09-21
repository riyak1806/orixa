-- =============================================================================
-- ORIXA PLATFORM — PHASE 3 DATABASE MIGRATION
-- Reference Architecture: docs/ORIXA-DATABASE-ARCHITECTURE.md (Phase 2E)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS & CUSTOM TYPES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'COLLEGE_ADMIN',
      'HOD',
      'TEACHER',
      'STUDENT'
    );
  END IF;
END$$;

-- -----------------------------------------------------------------------------
-- 2. PRIVATE AUTH SCHEMA & SECURITY HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private_auth;

CREATE OR REPLACE FUNCTION private_auth.get_auth_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_college_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT college_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_department_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private_auth FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private_auth TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. CORE PLATFORM TABLES (16 TABLES)
-- -----------------------------------------------------------------------------

-- 3.1 colleges
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_colleges_code_length CHECK (length(code) >= 2)
);

-- 3.2 departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_departments_college_code UNIQUE (college_id, code),
  CONSTRAINT uq_departments_id_college UNIQUE (id, college_id)
);

-- 3.3 academic_levels
CREATE TABLE IF NOT EXISTS public.academic_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  rank_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_academic_levels_college_code UNIQUE (college_id, code),
  CONSTRAINT uq_academic_levels_id_college UNIQUE (id, college_id)
);

-- 3.4 academic_sessions
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_academic_sessions_dates CHECK (end_date > start_date),
  CONSTRAINT uq_academic_sessions_college_code UNIQUE (college_id, code),
  CONSTRAINT uq_academic_sessions_id_college UNIQUE (id, college_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_single_current_session
  ON public.academic_sessions (college_id)
  WHERE is_current = true;

-- 3.5 subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_subjects_department_code UNIQUE (department_id, code),
  CONSTRAINT uq_subjects_id_department UNIQUE (id, department_id)
);

-- 3.6 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
  role public.app_role NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_profiles_id_role UNIQUE (id, role),
  CONSTRAINT uq_profiles_id_college UNIQUE (id, college_id),
  CONSTRAINT uq_profiles_id_department UNIQUE (id, department_id),
  CONSTRAINT uq_profiles_id_college_department UNIQUE (id, college_id, department_id),
  CONSTRAINT uq_profiles_id_role_department UNIQUE (id, role, department_id),
  CONSTRAINT fk_profiles_department_college FOREIGN KEY (department_id, college_id) REFERENCES public.departments (id, college_id),
  CONSTRAINT chk_profiles_role_org_rules CHECK (
    (role = 'COLLEGE_ADMIN' AND college_id IS NOT NULL AND department_id IS NULL) OR
    (role IN ('HOD', 'TEACHER', 'STUDENT') AND college_id IS NOT NULL AND department_id IS NOT NULL)
  )
);

-- 3.7 hod_assignments
CREATE TABLE IF NOT EXISTS public.hod_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role public.app_role NOT NULL DEFAULT 'HOD',
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NULLABLE,
  CONSTRAINT chk_hod_role CHECK (role = 'HOD'),
  CONSTRAINT chk_hod_dates CHECK (ended_at IS NULL OR ended_at >= started_at),
  CONSTRAINT chk_hod_active_ended CHECK (is_active = false OR ended_at IS NULL),
  CONSTRAINT fk_hod_profile_role FOREIGN KEY (profile_id, role) REFERENCES public.profiles (id, role) ON DELETE RESTRICT,
  CONSTRAINT fk_hod_profile_dept FOREIGN KEY (profile_id, department_id) REFERENCES public.profiles (id, department_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_hod_per_dept
  ON public.hod_assignments (department_id)
  WHERE is_active = true;

-- 3.8 teacher_profiles
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  role public.app_role NOT NULL DEFAULT 'TEACHER',
  employee_id VARCHAR(50) NOT NULL,
  designation VARCHAR(100) NULLABLE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_teacher_role CHECK (role = 'TEACHER'),
  CONSTRAINT uq_teacher_college_employee UNIQUE (college_id, employee_id),
  CONSTRAINT fk_teacher_profile_role FOREIGN KEY (profile_id, role) REFERENCES public.profiles (id, role) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_profile_college FOREIGN KEY (profile_id, college_id) REFERENCES public.profiles (id, college_id)
);

-- 3.9 student_profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  role public.app_role NOT NULL DEFAULT 'STUDENT',
  student_id VARCHAR(50) NOT NULL,
  academic_level_id UUID NOT NULL,
  roll_number VARCHAR(50) NULLABLE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_student_role CHECK (role = 'STUDENT'),
  CONSTRAINT uq_student_college_student_id UNIQUE (college_id, student_id),
  CONSTRAINT fk_student_profile_role FOREIGN KEY (profile_id, role) REFERENCES public.profiles (id, role) ON DELETE CASCADE,
  CONSTRAINT fk_student_profile_college FOREIGN KEY (profile_id, college_id) REFERENCES public.profiles (id, college_id),
  CONSTRAINT fk_student_academic_level_college FOREIGN KEY (academic_level_id, college_id) REFERENCES public.academic_levels (id, college_id) ON DELETE RESTRICT
);

-- 3.10 teacher_subject_class_assignments
CREATE TABLE IF NOT EXISTS public.teacher_subject_class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'TEACHER',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  academic_level_id UUID NOT NULL REFERENCES public.academic_levels(id) ON DELETE RESTRICT,
  academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_tsca_role CHECK (role = 'TEACHER'),
  CONSTRAINT fk_tsca_teacher_role FOREIGN KEY (teacher_id, role) REFERENCES public.profiles (id, role) ON DELETE CASCADE,
  CONSTRAINT uq_tsca_composite_target UNIQUE (id, teacher_id, subject_id, academic_level_id, academic_session_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_teacher_assignment
  ON public.teacher_subject_class_assignments (teacher_id, subject_id, academic_level_id, academic_session_id)
  WHERE is_active = true;

-- 3.11 student_subject_assignments
CREATE TABLE IF NOT EXISTS public.student_subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_role public.app_role NOT NULL DEFAULT 'STUDENT',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  academic_level_id UUID NOT NULL REFERENCES public.academic_levels(id) ON DELETE RESTRICT,
  academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  teacher_assignment_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_ssa_student_role CHECK (student_role = 'STUDENT'),
  CONSTRAINT uq_ssa_student_subject_level_session UNIQUE (student_id, subject_id, academic_level_id, academic_session_id),
  CONSTRAINT fk_ssa_student_role FOREIGN KEY (student_id, student_role) REFERENCES public.profiles (id, role) ON DELETE CASCADE,
  CONSTRAINT fk_ssa_teacher_assignment FOREIGN KEY (teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES public.teacher_subject_class_assignments (id, teacher_id, subject_id, academic_level_id, academic_session_id) ON DELETE RESTRICT
);

-- 3.12 quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  teacher_role public.app_role NOT NULL DEFAULT 'TEACHER',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  academic_level_id UUID NOT NULL REFERENCES public.academic_levels(id) ON DELETE RESTRICT,
  academic_session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE RESTRICT,
  teacher_assignment_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULLABLE,
  game_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  default_max_chances INTEGER NOT NULL DEFAULT 3,
  total_possible_xp INTEGER NOT NULL DEFAULT 100,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_quizzes_teacher_role CHECK (teacher_role = 'TEACHER'),
  CONSTRAINT chk_quizzes_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED')),
  CONSTRAINT chk_quizzes_game_type CHECK (game_type IN ('TILE_PUZZLE', 'MATCH_FOLLOWING', 'FILL_BLANKS', 'TRUE_FALSE')),
  CONSTRAINT chk_quizzes_default_max_chances CHECK (default_max_chances BETWEEN 1 AND 10),
  CONSTRAINT fk_quizzes_teacher_role FOREIGN KEY (teacher_id, teacher_role) REFERENCES public.profiles (id, role) ON DELETE RESTRICT,
  CONSTRAINT fk_quizzes_teacher_dept FOREIGN KEY (teacher_id, department_id) REFERENCES public.profiles (id, department_id) ON DELETE RESTRICT,
  CONSTRAINT fk_quizzes_subject_dept FOREIGN KEY (subject_id, department_id) REFERENCES public.subjects (id, department_id) ON DELETE RESTRICT,
  CONSTRAINT fk_quizzes_teacher_assignment FOREIGN KEY (teacher_assignment_id, teacher_id, subject_id, academic_level_id, academic_session_id) REFERENCES public.teacher_subject_class_assignments (id, teacher_id, subject_id, academic_level_id, academic_session_id) ON DELETE RESTRICT
);

-- 3.13 quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  max_chances INTEGER NULLABLE,
  game_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_quiz_questions_order UNIQUE (quiz_id, question_order),
  CONSTRAINT uq_quiz_questions_id_quiz UNIQUE (id, quiz_id),
  CONSTRAINT chk_quiz_questions_max_chances CHECK (max_chances IS NULL OR (max_chances BETWEEN 1 AND 10))
);

-- 3.14 quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_role public.app_role NOT NULL DEFAULT 'STUDENT',
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NULLABLE,
  final_earned_xp INTEGER NULLABLE,
  final_accuracy_pct INTEGER NULLABLE,
  final_stars INTEGER NULLABLE,
  CONSTRAINT chk_quiz_attempts_student_role CHECK (student_role = 'STUDENT'),
  CONSTRAINT chk_quiz_attempts_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  CONSTRAINT chk_quiz_attempts_stars CHECK (final_stars IS NULL OR (final_stars BETWEEN 0 AND 3)),
  CONSTRAINT uq_quiz_attempts_id_quiz UNIQUE (id, quiz_id),
  CONSTRAINT fk_quiz_attempts_student_role FOREIGN KEY (student_id, student_role) REFERENCES public.profiles (id, role) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_single_completed_attempt
  ON public.quiz_attempts (student_id, quiz_id)
  WHERE status = 'COMPLETED';

-- 3.15 question_attempts
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  question_id UUID NOT NULL,
  selected_answer_json JSONB NULLABLE,
  mistakes_count INTEGER NOT NULL DEFAULT 0,
  chances_used INTEGER NOT NULL DEFAULT 1,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_question_attempts_attempt_question UNIQUE (attempt_id, question_id),
  CONSTRAINT chk_question_attempts_mistakes CHECK (mistakes_count >= 0),
  CONSTRAINT fk_question_attempts_quiz_attempt FOREIGN KEY (attempt_id, quiz_id) REFERENCES public.quiz_attempts (id, quiz_id) ON DELETE CASCADE,
  CONSTRAINT fk_question_attempts_quiz_question FOREIGN KEY (question_id, quiz_id) REFERENCES public.quiz_questions (id, quiz_id) ON DELETE CASCADE
);

-- 3.16 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'System',
  priority VARCHAR(20) NOT NULL DEFAULT 'Normal',
  is_read BOOLEAN NOT NULL DEFAULT false,
  target_route VARCHAR(100) NULLABLE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_notifications_priority CHECK (priority IN ('Normal', 'Important'))
);

-- -----------------------------------------------------------------------------
-- 4. VALIDATION & IMMUTABILITY TRIGGERS
-- -----------------------------------------------------------------------------

-- 4.1 Active Teaching Assignment Trigger Function & Triggers
CREATE OR REPLACE FUNCTION public.fn_verify_active_teaching_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_active BOOLEAN;
BEGIN
  SELECT is_active INTO v_is_active
  FROM public.teacher_subject_class_assignments
  WHERE id = NEW.teacher_assignment_id;

  IF v_is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Cannot insert or update assignment/quiz: referenced teacher assignment ID % is inactive.', NEW.teacher_assignment_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_active_student_assignment ON public.student_subject_assignments;
CREATE TRIGGER trg_verify_active_student_assignment
  BEFORE INSERT OR UPDATE OF teacher_assignment_id ON public.student_subject_assignments
  FOR EACH ROW EXECUTE FUNCTION public.fn_verify_active_teaching_assignment();

DROP TRIGGER IF EXISTS trg_verify_active_quiz_assignment ON public.quizzes;
CREATE TRIGGER trg_verify_active_quiz_assignment
  BEFORE INSERT OR UPDATE OF teacher_assignment_id ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.fn_verify_active_teaching_assignment();

-- 4.2 Completed Attempt Write-Blocking Trigger Function & Trigger
CREATE OR REPLACE FUNCTION public.fn_block_completed_attempt_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Cannot modify or delete a completed quiz attempt (Attempt ID: %).', OLD.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_completed_attempt_edits ON public.quiz_attempts;
CREATE TRIGGER trg_block_completed_attempt_edits
  BEFORE UPDATE OR DELETE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_completed_attempt_edits();

-- -----------------------------------------------------------------------------
-- 5. GAMEPLAY SERVER-SIDE RPC FUNCTIONS
-- -----------------------------------------------------------------------------

-- 5.1 fn_start_quiz_attempt
CREATE OR REPLACE FUNCTION public.fn_start_quiz_attempt(p_quiz_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
  v_role public.app_role;
  v_quiz RECORD;
  v_assigned BOOLEAN;
  v_existing_completed UUID;
  v_existing_in_progress UUID;
  v_attempt_id UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = v_student_id;

  IF v_role IS NULL OR v_role != 'STUDENT' THEN
    RAISE EXCEPTION 'Only students can start quiz attempts.';
  END IF;

  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = p_quiz_id;

  IF v_quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found.';
  END IF;

  IF v_quiz.status != 'PUBLISHED' THEN
    RAISE EXCEPTION 'Quiz is not published.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.student_subject_assignments
    WHERE student_id = v_student_id
      AND subject_id = v_quiz.subject_id
      AND academic_level_id = v_quiz.academic_level_id
      AND academic_session_id = v_quiz.academic_session_id
      AND teacher_id = v_quiz.teacher_id
      AND is_active = true
  ) INTO v_assigned;

  IF NOT v_assigned THEN
    RAISE EXCEPTION 'Student is not actively assigned to this subject and teacher.';
  END IF;

  SELECT id INTO v_existing_completed
  FROM public.quiz_attempts
  WHERE student_id = v_student_id
    AND quiz_id = p_quiz_id
    AND status = 'COMPLETED'
  LIMIT 1;

  IF v_existing_completed IS NOT NULL THEN
    RAISE EXCEPTION 'Student has already completed this quiz.';
  END IF;

  SELECT id INTO v_existing_in_progress
  FROM public.quiz_attempts
  WHERE student_id = v_student_id
    AND quiz_id = p_quiz_id
    AND status = 'IN_PROGRESS'
  LIMIT 1;

  IF v_existing_in_progress IS NOT NULL THEN
    RETURN v_existing_in_progress;
  END IF;

  INSERT INTO public.quiz_attempts (
    student_id,
    student_role,
    quiz_id,
    status,
    started_at
  ) VALUES (
    v_student_id,
    'STUDENT',
    p_quiz_id,
    'IN_PROGRESS',
    now()
  ) RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

-- 5.2 fn_submit_question_answer
CREATE OR REPLACE FUNCTION public.fn_submit_question_answer(
  p_attempt_id UUID,
  p_question_id UUID,
  p_answer_json JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
  v_attempt RECORD;
  v_quiz RECORD;
  v_question RECORD;
  v_max_chances INTEGER;
  v_existing RECORD;
  v_is_correct BOOLEAN := false;
  v_prev_mistakes INTEGER := 0;
  v_prev_chances INTEGER := 0;
  v_new_mistakes INTEGER;
  v_new_chances INTEGER;
  v_is_solved BOOLEAN;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id;

  IF v_attempt.id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found.';
  END IF;

  IF v_attempt.student_id != v_student_id THEN
    RAISE EXCEPTION 'Unauthorized attempt access.';
  END IF;

  IF v_attempt.status != 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'Attempt is not in progress.';
  END IF;

  SELECT * INTO v_question
  FROM public.quiz_questions
  WHERE id = p_question_id AND quiz_id = v_attempt.quiz_id;

  IF v_question.id IS NULL THEN
    RAISE EXCEPTION 'Question does not belong to the attempt quiz.';
  END IF;

  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = v_attempt.quiz_id;

  v_max_chances := COALESCE(v_question.max_chances, v_quiz.default_max_chances);

  SELECT * INTO v_existing
  FROM public.question_attempts
  WHERE attempt_id = p_attempt_id AND question_id = p_question_id;

  IF v_existing.id IS NOT NULL THEN
    v_prev_mistakes := v_existing.mistakes_count;
    v_prev_chances := v_existing.chances_used;
    IF v_existing.is_solved THEN
      RETURN jsonb_build_object(
        'is_correct', true,
        'is_solved', true,
        'chances_used', v_prev_chances,
        'mistakes_count', v_prev_mistakes,
        'max_chances', v_max_chances
      );
    END IF;
  END IF;

  IF v_quiz.game_type = 'TILE_PUZZLE' THEN
    v_is_correct := (p_answer_json->>'selected_option_index' = v_question.game_payload->>'correct_option_index');
  ELSIF v_quiz.game_type = 'MATCH_FOLLOWING' THEN
    v_is_correct := (p_answer_json->'pairs' = v_question.game_payload->'pairs');
  ELSIF v_quiz.game_type = 'FILL_BLANKS' THEN
    v_is_correct := (p_answer_json->'submitted_words' = v_question.game_payload->'correct_words');
  ELSIF v_quiz.game_type = 'TRUE_FALSE' THEN
    v_is_correct := (lower(p_answer_json->>'submitted_boolean') = lower(v_question.game_payload->>'correct_boolean'));
  ELSE
    RAISE EXCEPTION 'Unsupported game type: %', v_quiz.game_type;
  END IF;

  IF v_is_correct THEN
    v_is_solved := true;
    v_new_mistakes := v_prev_mistakes;
    v_new_chances := v_prev_chances + 1;
  ELSE
    v_is_solved := false;
    v_new_mistakes := v_prev_mistakes + 1;
    v_new_chances := v_prev_chances + 1;
  END IF;

  INSERT INTO public.question_attempts (
    attempt_id,
    quiz_id,
    question_id,
    selected_answer_json,
    mistakes_count,
    chances_used,
    is_solved
  ) VALUES (
    p_attempt_id,
    v_attempt.quiz_id,
    p_question_id,
    p_answer_json,
    v_new_mistakes,
    v_new_chances,
    v_is_solved
  )
  ON CONFLICT (attempt_id, question_id) DO UPDATE SET
    selected_answer_json = EXCLUDED.selected_answer_json,
    mistakes_count = EXCLUDED.mistakes_count,
    chances_used = EXCLUDED.chances_used,
    is_solved = EXCLUDED.is_solved;

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'is_solved', v_is_solved,
    'mistakes_count', v_new_mistakes,
    'chances_used', v_new_chances,
    'max_chances', v_max_chances
  );
END;
$$;

-- 5.3 fn_complete_quiz_attempt
CREATE OR REPLACE FUNCTION public.fn_complete_quiz_attempt(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id UUID;
  v_attempt RECORD;
  v_quiz RECORD;
  v_total_questions INTEGER;
  v_attempted_questions INTEGER;
  v_sum_ratio NUMERIC := 0.0;
  v_q RECORD;
  v_ratio NUMERIC;
  v_accuracy_num NUMERIC;
  v_earned_xp INTEGER;
  v_accuracy_pct INTEGER;
  v_stars INTEGER;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT * INTO v_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id;

  IF v_attempt.id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found.';
  END IF;

  IF v_attempt.student_id != v_student_id THEN
    RAISE EXCEPTION 'Unauthorized attempt access.';
  END IF;

  IF v_attempt.status = 'COMPLETED' THEN
    RETURN jsonb_build_object(
      'attempt_id', v_attempt.id,
      'status', v_attempt.status,
      'final_earned_xp', v_attempt.final_earned_xp,
      'final_accuracy_pct', v_attempt.final_accuracy_pct,
      'final_stars', v_attempt.final_stars
    );
  END IF;

  IF v_attempt.status != 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'Attempt is not in progress.';
  END IF;

  SELECT * INTO v_quiz
  FROM public.quizzes
  WHERE id = v_attempt.quiz_id;

  SELECT COUNT(*) INTO v_total_questions
  FROM public.quiz_questions
  WHERE quiz_id = v_attempt.quiz_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'Quiz has no questions.';
  END IF;

  SELECT COUNT(*) INTO v_attempted_questions
  FROM public.question_attempts
  WHERE attempt_id = p_attempt_id;

  IF v_attempted_questions < v_total_questions THEN
    RAISE EXCEPTION 'Not all questions have been answered for this attempt.';
  END IF;

  FOR v_q IN
    SELECT qq.id, qa.is_solved, qa.mistakes_count
    FROM public.quiz_questions qq
    LEFT JOIN public.question_attempts qa
      ON qa.question_id = qq.id AND qa.attempt_id = p_attempt_id
    WHERE qq.quiz_id = v_attempt.quiz_id
  LOOP
    IF v_q.is_solved IS TRUE THEN
      v_ratio := GREATEST(0.0, 1.0 - 0.25 * COALESCE(v_q.mistakes_count, 0));
    ELSE
      v_ratio := 0.0;
    END IF;
    v_sum_ratio := v_sum_ratio + v_ratio;
  END LOOP;

  v_accuracy_num := (v_sum_ratio / v_total_questions::numeric) * 100.0;
  v_accuracy_pct := ROUND(v_accuracy_num);
  v_earned_xp := ROUND((v_sum_ratio / v_total_questions::numeric) * v_quiz.total_possible_xp);

  IF v_accuracy_num > 90.0 THEN
    v_stars := 3;
  ELSIF v_accuracy_num >= 66.66 THEN
    v_stars := 2;
  ELSIF v_accuracy_num >= 33.33 THEN
    v_stars := 1;
  ELSE
    v_stars := 0;
  END IF;

  UPDATE public.quiz_attempts SET
    final_earned_xp = v_earned_xp,
    final_accuracy_pct = v_accuracy_pct,
    final_stars = v_stars,
    completed_at = now(),
    status = 'COMPLETED'
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'attempt_id', p_attempt_id,
    'status', 'COMPLETED',
    'final_earned_xp', v_earned_xp,
    'final_accuracy_pct', v_accuracy_pct,
    'final_stars', v_stars
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hod_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subject_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6.1 colleges
CREATE POLICY colleges_select ON public.colleges
  FOR SELECT TO authenticated
  USING (id = private_auth.get_auth_college_id());

-- 6.2 departments
CREATE POLICY departments_select ON public.departments
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY departments_all_admin ON public.departments
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id())
  WITH CHECK (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id());

-- 6.3 academic_levels
CREATE POLICY academic_levels_select ON public.academic_levels
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY academic_levels_all_admin ON public.academic_levels
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id())
  WITH CHECK (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id());

-- 6.4 academic_sessions
CREATE POLICY academic_sessions_select ON public.academic_sessions
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY academic_sessions_all_admin ON public.academic_sessions
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id())
  WITH CHECK (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id());

-- 6.5 subjects
CREATE POLICY subjects_select ON public.subjects
  FOR SELECT TO authenticated
  USING (department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()));

CREATE POLICY subjects_write ON public.subjects
  FOR ALL TO authenticated
  USING (
    (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()))
    OR
    (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  )
  WITH CHECK (
    (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()))
    OR
    (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  );

-- 6.6 profiles
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD'));

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR private_auth.get_auth_role() = 'COLLEGE_ADMIN'
    OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  )
  WITH CHECK (
    id = auth.uid()
    OR private_auth.get_auth_role() = 'COLLEGE_ADMIN'
    OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  );

CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN');

-- 6.7 hod_assignments
CREATE POLICY hod_assignments_select ON public.hod_assignments
  FOR SELECT TO authenticated
  USING (department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()));

CREATE POLICY hod_assignments_write ON public.hod_assignments
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()))
  WITH CHECK (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND department_id IN (SELECT id FROM public.departments WHERE college_id = private_auth.get_auth_college_id()));

-- 6.8 teacher_profiles
CREATE POLICY teacher_profiles_select ON public.teacher_profiles
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY teacher_profiles_write ON public.teacher_profiles
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() = 'COLLEGE_ADMIN' OR (private_auth.get_auth_role() = 'HOD' AND college_id = private_auth.get_auth_college_id()))
  WITH CHECK (private_auth.get_auth_role() = 'COLLEGE_ADMIN' OR (private_auth.get_auth_role() = 'HOD' AND college_id = private_auth.get_auth_college_id()));

-- 6.9 student_profiles
CREATE POLICY student_profiles_select ON public.student_profiles
  FOR SELECT TO authenticated
  USING (college_id = private_auth.get_auth_college_id());

CREATE POLICY student_profiles_write ON public.student_profiles
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD'))
  WITH CHECK (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD'));

-- 6.10 teacher_subject_class_assignments
CREATE POLICY teacher_subject_class_assignments_select ON public.teacher_subject_class_assignments
  FOR SELECT TO authenticated
  USING (teacher_id IN (SELECT id FROM public.profiles WHERE college_id = private_auth.get_auth_college_id()));

CREATE POLICY teacher_subject_class_assignments_write ON public.teacher_subject_class_assignments
  FOR ALL TO authenticated
  USING (
    private_auth.get_auth_role() = 'COLLEGE_ADMIN'
    OR (private_auth.get_auth_role() = 'HOD' AND teacher_id IN (SELECT id FROM public.profiles WHERE department_id = private_auth.get_auth_department_id()))
  )
  WITH CHECK (
    private_auth.get_auth_role() = 'COLLEGE_ADMIN'
    OR (private_auth.get_auth_role() = 'HOD' AND teacher_id IN (SELECT id FROM public.profiles WHERE department_id = private_auth.get_auth_department_id()))
  );

-- 6.11 student_subject_assignments
CREATE POLICY student_subject_assignments_select ON public.student_subject_assignments
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.profiles WHERE college_id = private_auth.get_auth_college_id()));

CREATE POLICY student_subject_assignments_write ON public.student_subject_assignments
  FOR ALL TO authenticated
  USING (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD'))
  WITH CHECK (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD'));

-- 6.12 quizzes
CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    (private_auth.get_auth_role() = 'COLLEGE_ADMIN' AND college_id = private_auth.get_auth_college_id())
    OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
    OR (private_auth.get_auth_role() = 'TEACHER' AND teacher_id = auth.uid())
    OR (private_auth.get_auth_role() = 'STUDENT' AND status = 'PUBLISHED' AND subject_id IN (
          SELECT subject_id FROM public.student_subject_assignments WHERE student_id = auth.uid() AND is_active = true
        ))
  );

CREATE POLICY quizzes_write ON public.quizzes
  FOR ALL TO authenticated
  USING (
    (private_auth.get_auth_role() = 'TEACHER' AND teacher_id = auth.uid())
    OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  )
  WITH CHECK (
    (private_auth.get_auth_role() = 'TEACHER' AND teacher_id = auth.uid())
    OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id())
  );

-- 6.13 quiz_questions
CREATE POLICY quiz_questions_select ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (quiz_id IN (SELECT id FROM public.quizzes WHERE college_id = private_auth.get_auth_college_id()));

CREATE POLICY quiz_questions_write ON public.quiz_questions
  FOR ALL TO authenticated
  USING (
    quiz_id IN (SELECT id FROM public.quizzes WHERE teacher_id = auth.uid() OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id()))
  )
  WITH CHECK (
    quiz_id IN (SELECT id FROM public.quizzes WHERE teacher_id = auth.uid() OR (private_auth.get_auth_role() = 'HOD' AND department_id = private_auth.get_auth_department_id()))
  );

-- 6.14 quiz_attempts
CREATE POLICY quiz_attempts_select ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR (private_auth.get_auth_role() = 'TEACHER' AND quiz_id IN (SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()))
    OR (private_auth.get_auth_role() = 'HOD' AND quiz_id IN (SELECT id FROM public.quizzes WHERE department_id = private_auth.get_auth_department_id()))
  );
-- Direct client INSERT/UPDATE/DELETE denied via RLS (RPC-only gameplay writes)

-- 6.15 question_attempts
CREATE POLICY question_attempts_select ON public.question_attempts
  FOR SELECT TO authenticated
  USING (
    attempt_id IN (
      SELECT id FROM public.quiz_attempts
      WHERE student_id = auth.uid()
         OR quiz_id IN (SELECT id FROM public.quizzes WHERE teacher_id = auth.uid())
    )
  );
-- Direct client INSERT/UPDATE/DELETE denied via RLS (RPC-only gameplay writes)

-- 6.16 notifications
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (private_auth.get_auth_role() IN ('COLLEGE_ADMIN', 'HOD') OR user_id = auth.uid());

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. ANALYTICS REPORTING VIEWS (security_invoker = true)
-- -----------------------------------------------------------------------------

-- 7.1 vw_college_analytics
CREATE OR REPLACE VIEW public.vw_college_analytics WITH (security_invoker = true) AS
SELECT
  c.id AS college_id,
  c.name AS college_name,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'STUDENT') AS total_students,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'TEACHER') AS total_teachers,
  COUNT(DISTINCT q.id) AS total_quizzes,
  COUNT(DISTINCT qa.id) FILTER (WHERE qa.status = 'COMPLETED') AS total_completed_attempts,
  COALESCE(ROUND(AVG(qa.final_accuracy_pct) FILTER (WHERE qa.status = 'COMPLETED')), 0) AS avg_accuracy_pct,
  COALESCE(SUM(qa.final_earned_xp) FILTER (WHERE qa.status = 'COMPLETED'), 0) AS total_xp_earned
FROM public.colleges c
LEFT JOIN public.profiles p ON p.college_id = c.id
LEFT JOIN public.quizzes q ON q.college_id = c.id
LEFT JOIN public.quiz_attempts qa ON qa.quiz_id = q.id
GROUP BY c.id, c.name;

-- 7.2 vw_department_analytics
CREATE OR REPLACE VIEW public.vw_department_analytics WITH (security_invoker = true) AS
SELECT
  d.id AS department_id,
  d.college_id,
  d.code AS department_code,
  d.name AS department_name,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'STUDENT') AS total_students,
  COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'TEACHER') AS total_teachers,
  COUNT(DISTINCT q.id) AS total_quizzes,
  COUNT(DISTINCT qa.id) FILTER (WHERE qa.status = 'COMPLETED') AS total_completed_attempts,
  COALESCE(ROUND(AVG(qa.final_accuracy_pct) FILTER (WHERE qa.status = 'COMPLETED')), 0) AS avg_accuracy_pct
FROM public.departments d
LEFT JOIN public.profiles p ON p.department_id = d.id
LEFT JOIN public.quizzes q ON q.department_id = d.id
LEFT JOIN public.quiz_attempts qa ON qa.quiz_id = q.id
GROUP BY d.id, d.college_id, d.code, d.name;

-- 7.3 vw_teacher_performance
CREATE OR REPLACE VIEW public.vw_teacher_performance WITH (security_invoker = true) AS
SELECT
  p.id AS teacher_id,
  p.full_name AS teacher_name,
  p.department_id,
  p.college_id,
  COUNT(DISTINCT q.id) AS total_quizzes_created,
  COUNT(DISTINCT qa.id) FILTER (WHERE qa.status = 'COMPLETED') AS total_student_attempts,
  COALESCE(ROUND(AVG(qa.final_accuracy_pct) FILTER (WHERE qa.status = 'COMPLETED')), 0) AS avg_quiz_accuracy_pct,
  COALESCE(ROUND(AVG(qa.final_earned_xp) FILTER (WHERE qa.status = 'COMPLETED')), 0) AS avg_xp_per_attempt
FROM public.profiles p
LEFT JOIN public.quizzes q ON q.teacher_id = p.id
LEFT JOIN public.quiz_attempts qa ON qa.quiz_id = q.id
WHERE p.role = 'TEACHER'
GROUP BY p.id, p.full_name, p.department_id, p.college_id;

-- 7.4 vw_student_leaderboard
CREATE OR REPLACE VIEW public.vw_student_leaderboard WITH (security_invoker = true) AS
SELECT
  p.id AS student_id,
  p.full_name AS student_name,
  p.department_id,
  p.college_id,
  sp.student_id AS institutional_student_id,
  COALESCE(SUM(qa.final_earned_xp) FILTER (WHERE qa.status = 'COMPLETED'), 0) AS total_xp,
  COALESCE(SUM(qa.final_stars) FILTER (WHERE qa.status = 'COMPLETED'), 0) AS total_stars,
  COUNT(DISTINCT qa.id) FILTER (WHERE qa.status = 'COMPLETED') AS completed_quizzes_count,
  COALESCE(ROUND(AVG(qa.final_accuracy_pct) FILTER (WHERE qa.status = 'COMPLETED')), 0) AS overall_accuracy_pct
FROM public.profiles p
JOIN public.student_profiles sp ON sp.profile_id = p.id
LEFT JOIN public.quiz_attempts qa ON qa.student_id = p.id
WHERE p.role = 'STUDENT'
GROUP BY p.id, p.full_name, p.department_id, p.college_id, sp.student_id;

-- -----------------------------------------------------------------------------
-- 8. GRANTS & PRIVILEGE MANAGEMENT
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_attempts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.question_attempts FROM authenticated;

GRANT SELECT ON public.vw_college_analytics TO authenticated;
GRANT SELECT ON public.vw_department_analytics TO authenticated;
GRANT SELECT ON public.vw_teacher_performance TO authenticated;
GRANT SELECT ON public.vw_student_leaderboard TO authenticated;

GRANT EXECUTE ON FUNCTION public.fn_start_quiz_attempt(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_question_answer(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_complete_quiz_attempt(UUID) TO authenticated;
