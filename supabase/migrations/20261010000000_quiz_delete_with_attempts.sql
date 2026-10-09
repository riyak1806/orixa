-- =============================================================================
-- ORIXA — DELETE A QUIZ TOGETHER WITH ITS STUDENT ATTEMPTS
-- quiz_attempts.quiz_id is ON DELETE RESTRICT and completed attempts are protected by
-- trg_block_completed_attempt_edits, so a quiz that students already played could not be deleted.
-- fn_delete_quiz() removes the attempts (and their answers), the questions and the quiz.
-- =============================================================================
BEGIN;

-- Completed attempts stay immutable, except while fn_delete_quiz (or a developer's SQL session) sets
-- the transaction-local flag orixa.allow_attempt_delete = 'on' and the operation is a DELETE.
CREATE OR REPLACE FUNCTION public.fn_block_completed_attempt_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'COMPLETED'
     AND NOT (TG_OP = 'DELETE' AND COALESCE(current_setting('orixa.allow_attempt_delete', true), '') = 'on') THEN
    RAISE EXCEPTION 'Cannot modify or delete a completed quiz attempt (Attempt ID: %).', OLD.id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.fn_delete_quiz(UUID);

CREATE OR REPLACE FUNCTION public.fn_delete_quiz(p_quiz_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_quiz RECORD;
  v_role public.app_role;
  v_dept UUID;
  v_attempts INTEGER;
BEGIN
  SELECT id, teacher_id, department_id INTO v_quiz FROM public.quizzes WHERE id = p_quiz_id;
  IF v_quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz not found.' USING ERRCODE = '22023';
  END IF;

  -- Callers with no user (service role / SQL editor) are trusted; anon cannot execute this function.
  IF auth.uid() IS NOT NULL THEN
    SELECT role, department_id INTO v_role, v_dept FROM public.profiles WHERE id = auth.uid() AND is_active = true;
    IF NOT (
      (v_role = 'TEACHER' AND v_quiz.teacher_id = auth.uid())
      OR (v_role = 'HOD' AND v_quiz.department_id = v_dept)
    ) THEN
      RAISE EXCEPTION 'Access denied: you can only delete your own quizzes.' USING ERRCODE = '42501';
    END IF;
  END IF;

  PERFORM set_config('orixa.allow_attempt_delete', 'on', true);   -- this transaction only

  SELECT count(*) INTO v_attempts FROM public.quiz_attempts WHERE quiz_id = p_quiz_id;

  DELETE FROM public.quiz_attempts WHERE quiz_id = p_quiz_id;      -- question_attempts cascade
  DELETE FROM public.quizzes WHERE id = p_quiz_id;                 -- quiz_questions cascade

  RETURN jsonb_build_object('deleted_quiz', p_quiz_id, 'deleted_attempts', v_attempts);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_delete_quiz(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_delete_quiz(UUID) TO authenticated, service_role;

COMMIT;
