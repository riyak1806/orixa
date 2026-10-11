-- =============================================================================
-- ORIXA — TEACHERS CANNOT DELETE QUIZZES
-- A teacher may still create and edit their own quizzes, but deleting one (and with it every student's
-- attempts and results) is now reserved for the HOD of the department. Enforced in the database, not
-- only in the interface:
--   * fn_delete_quiz() no longer accepts a teacher
--   * the quizzes write policy is split so a teacher has no DELETE right on the table either
-- =============================================================================
BEGIN;

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
    IF NOT (v_role = 'HOD' AND v_quiz.department_id = v_dept) THEN
      RAISE EXCEPTION 'Access denied: teachers cannot delete quizzes. Ask your HOD.' USING ERRCODE = '42501';
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

-- quizzes: teachers and HODs create and change; only HODs delete
DROP POLICY IF EXISTS quizzes_write ON public.quizzes;
DROP POLICY IF EXISTS quizzes_insert ON public.quizzes;
DROP POLICY IF EXISTS quizzes_update ON public.quizzes;
DROP POLICY IF EXISTS quizzes_delete ON public.quizzes;

CREATE POLICY quizzes_insert ON public.quizzes
  FOR INSERT TO authenticated
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
  );

CREATE POLICY quizzes_update ON public.quizzes
  FOR UPDATE TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
  )
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
  );

CREATE POLICY quizzes_delete ON public.quizzes
  FOR DELETE TO authenticated
  USING (
    (SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id())
  );

COMMIT;
