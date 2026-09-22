-- =============================================================================
-- ORIXA PLATFORM — ADMINISTRATION & DATA BACKEND MIGRATION
-- =============================================================================

-- Refine teacher_profiles and student_profiles policies for HOD management scope

DROP POLICY IF EXISTS teacher_profiles_select ON public.teacher_profiles;
CREATE POLICY teacher_profiles_select ON public.teacher_profiles
  FOR SELECT TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND profile_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND profile_id IN (
      SELECT teacher_id FROM public.student_subject_assignments WHERE student_id = auth.uid() AND is_active = true
    ))
  );

DROP POLICY IF EXISTS teacher_profiles_write ON public.teacher_profiles;
CREATE POLICY teacher_profiles_write ON public.teacher_profiles
  FOR ALL TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR
    ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
  )
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR
    ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
  );

DROP POLICY IF EXISTS student_profiles_select ON public.student_profiles;
CREATE POLICY student_profiles_select ON public.student_profiles
  FOR SELECT TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND profile_id IN (
      SELECT student_id FROM public.student_subject_assignments WHERE teacher_id = auth.uid() AND is_active = true
    ))
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND profile_id = auth.uid())
  );

DROP POLICY IF EXISTS student_profiles_write ON public.student_profiles;
CREATE POLICY student_profiles_write ON public.student_profiles
  FOR ALL TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR
    ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
  )
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR
    ((SELECT private_auth.get_auth_role()) = 'HOD' AND college_id = (SELECT private_auth.get_auth_college_id()) AND profile_id IN (
      SELECT id FROM public.profiles WHERE department_id = (SELECT private_auth.get_auth_department_id())
    ))
  );
