-- =============================================================================
-- ORIXA — STUDENTS CAN SEE THE QUIZZES THEY HAVE TAKEN
-- quizzes_select only shows a student PUBLISHED quizzes they are assigned to, so a quiz the teacher
-- later closed or archived vanished from the student's quiz history. This adds read access (title,
-- subject, ...) to quizzes the student has an attempt on. Questions stay hidden (quiz_questions has no
-- student policy). A SECURITY DEFINER helper avoids policy recursion with quiz_attempts_select.
-- =============================================================================
BEGIN;

CREATE OR REPLACE FUNCTION private_auth.has_attempted_quiz(p_quiz_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_id = p_quiz_id AND student_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS quizzes_select_attempted ON public.quizzes;
CREATE POLICY quizzes_select_attempted ON public.quizzes
  FOR SELECT TO authenticated
  USING ((SELECT private_auth.has_attempted_quiz(id)));

COMMIT;
