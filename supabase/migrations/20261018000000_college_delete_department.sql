-- =============================================================================
-- ORIXA — COLLEGE ADMIN: DELETE A DEPARTMENT
-- Removes the department with its HOD, teachers and students (their logins included, which the plain
-- cascade cannot reach because logins live in the auth schema), subjects, quizzes and attempts.
-- Needs the cascading-delete migration 20261013. DESTRUCTIVE BY DESIGN: it cannot be undone.
-- Only the college admin of the department's own college may call it. Calls with no signed-in user
-- (SQL editor / service role) are trusted.
-- Renaming a department and editing a HOD use existing tools: the departments table policy for the
-- college admin, and fn_admin_update_user (migration 20261015).
-- =============================================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.fn_admin_delete_department(p_department_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_role public.app_role;
    v_caller_college UUID;
    v_dept RECORD;
    v_users INTEGER;
BEGIN
    SELECT id, college_id INTO v_dept FROM public.departments WHERE id = p_department_id;
    IF v_dept.id IS NULL THEN
        RAISE EXCEPTION 'Department not found.' USING ERRCODE = '22023';
    END IF;

    IF auth.uid() IS NOT NULL THEN
        SELECT role, college_id INTO v_caller_role, v_caller_college
        FROM public.profiles WHERE id = auth.uid() AND is_active = true;

        IF v_caller_role IS DISTINCT FROM 'COLLEGE_ADMIN' OR v_caller_college IS DISTINCT FROM v_dept.college_id THEN
            RAISE EXCEPTION 'Access denied: only the college administrator can delete a department.' USING ERRCODE = '42501';
        END IF;
    END IF;

    PERFORM set_config('orixa.allow_attempt_delete', 'on', true);   -- this transaction only

    SELECT count(*) INTO v_users FROM public.profiles
     WHERE department_id = p_department_id AND role <> 'COLLEGE_ADMIN';

    DELETE FROM auth.users
     WHERE id IN (SELECT id FROM public.profiles WHERE department_id = p_department_id AND role <> 'COLLEGE_ADMIN');
    DELETE FROM public.profiles WHERE department_id = p_department_id AND role <> 'COLLEGE_ADMIN';
    DELETE FROM public.departments WHERE id = p_department_id;

    RETURN jsonb_build_object('deleted_department', p_department_id, 'deleted_users', v_users);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_delete_department(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_delete_department(UUID) TO authenticated, service_role;

COMMIT;
