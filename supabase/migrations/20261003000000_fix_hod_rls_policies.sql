-- Fix RLS Policies for HOD Dashboard (student_subject_assignments and quizzes)
-- This migration fixes a SQL syntax bug where policies referenced non-existent columns like 'college_id' or 'profile_id' in tables that didn't have them.

-- 1. Fix student_subject_assignments policies
DROP POLICY IF EXISTS student_subject_assignments_select ON public.student_subject_assignments;
CREATE POLICY student_subject_assignments_select ON public.student_subject_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN'
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND subject_id IN (SELECT id FROM public.subjects WHERE department_id = (SELECT private_auth.get_auth_department_id())))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid() AND is_active = true)
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND student_id = auth.uid())
  );

DROP POLICY IF EXISTS student_subject_assignments_write ON public.student_subject_assignments;
CREATE POLICY student_subject_assignments_write ON public.student_subject_assignments
  FOR ALL TO authenticated
  USING (
    (SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN'
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND subject_id IN (SELECT id FROM public.subjects WHERE department_id = (SELECT private_auth.get_auth_department_id())))
  );

-- 2. Fix quizzes policies (quizzes table actually has department_id, but we need to fix the ADMIN enum)
DROP POLICY IF EXISTS quizzes_select ON public.quizzes;
CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    (SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN'
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND status = 'PUBLISHED' AND teacher_assignment_id IN (
      SELECT teacher_assignment_id FROM public.student_subject_assignments WHERE student_id = auth.uid() AND is_active = true
    ))
  );

DROP POLICY IF EXISTS quizzes_write ON public.quizzes;
CREATE POLICY quizzes_write ON public.quizzes
  FOR ALL TO authenticated
  USING (
    (SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN'
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
  );
