-- =============================================================================
-- ORIXA — HOD / COLLEGE ADMIN: EDIT AND DELETE TEACHERS AND STUDENTS
-- A HOD cannot touch auth.users from the browser, so these two permission-checked functions do it:
--   fn_admin_update_user : name, login ID (login email, teacher/student ID follow) and/or password
--   fn_admin_delete_user : removes the login, profile and everything attached (needs the cascading-delete
--                          migration 20261013)
-- HODs may only manage TEACHERs and STUDENTs of their own department; a college admin may manage any
-- non-admin user of their college. Calls with no signed-in user (SQL editor / service role) are trusted.
-- =============================================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.fn_admin_update_user(
    p_user_id UUID,
    p_full_name TEXT,
    p_login_id TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_role public.app_role;
    v_caller_college UUID;
    v_caller_dept UUID;
    v_target RECORD;
    v_name TEXT := trim(p_full_name);
    v_login TEXT := lower(trim(p_login_id));
    v_email TEXT;
BEGIN
    SELECT id, role, college_id, department_id, login_id INTO v_target FROM public.profiles WHERE id = p_user_id;
    IF v_target.id IS NULL THEN
        RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
    END IF;

    IF auth.uid() IS NOT NULL THEN
        SELECT role, college_id, department_id INTO v_caller_role, v_caller_college, v_caller_dept
        FROM public.profiles WHERE id = auth.uid() AND is_active = true;

        IF NOT (
            (v_caller_role = 'HOD' AND v_target.role IN ('TEACHER', 'STUDENT') AND v_target.department_id = v_caller_dept)
            OR (v_caller_role = 'COLLEGE_ADMIN' AND v_target.role <> 'COLLEGE_ADMIN' AND v_target.college_id = v_caller_college)
        ) THEN
            RAISE EXCEPTION 'Access denied: you can only edit teachers and students of your own department.' USING ERRCODE = '42501';
        END IF;
    END IF;

    IF v_name IS NULL OR v_name = '' THEN
        RAISE EXCEPTION 'Name is required.' USING ERRCODE = '22023';
    END IF;
    IF v_login IS NULL OR v_login !~ '^[a-z0-9][a-z0-9._-]*$' THEN
        RAISE EXCEPTION 'The ID may only contain letters, numbers, dots, dashes and underscores (no spaces).' USING ERRCODE = '22023';
    END IF;
    IF p_password IS NOT NULL AND p_password <> '' AND length(p_password) < 8 THEN
        RAISE EXCEPTION 'Password must be at least 8 characters long.' USING ERRCODE = '22023';
    END IF;

    v_email := v_login || '@auth.orixa.internal';

    IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(login_id) = v_login AND id <> p_user_id)
       OR EXISTS (SELECT 1 FROM auth.users WHERE email = v_email AND id <> p_user_id) THEN
        RAISE EXCEPTION 'The ID "%" is already used by another user.', v_login USING ERRCODE = '23505';
    END IF;

    UPDATE public.profiles SET full_name = v_name, login_id = v_login WHERE id = p_user_id;

    -- keep the login, identity and teacher/student ID in step (idempotent if the sync trigger already ran)
    UPDATE auth.users
       SET email = v_email,
           raw_user_meta_data = raw_user_meta_data || jsonb_build_object('login_id', v_login, 'full_name', v_name),
           updated_at = now()
     WHERE id = p_user_id;

    UPDATE auth.identities
       SET identity_data = identity_data || jsonb_build_object('email', v_email), updated_at = now()
     WHERE user_id = p_user_id;

    UPDATE public.teacher_profiles SET employee_id = v_login WHERE profile_id = p_user_id;
    UPDATE public.student_profiles SET student_id = v_login WHERE profile_id = p_user_id;

    IF p_password IS NOT NULL AND p_password <> '' THEN
        UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object('user_id', p_user_id, 'login_id', v_login);
END;
$$;


CREATE OR REPLACE FUNCTION public.fn_admin_delete_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_role public.app_role;
    v_caller_college UUID;
    v_caller_dept UUID;
    v_target RECORD;
BEGIN
    SELECT id, role, college_id, department_id INTO v_target FROM public.profiles WHERE id = p_user_id;
    IF v_target.id IS NULL THEN
        RAISE EXCEPTION 'User not found.' USING ERRCODE = '22023';
    END IF;

    IF auth.uid() IS NOT NULL THEN
        SELECT role, college_id, department_id INTO v_caller_role, v_caller_college, v_caller_dept
        FROM public.profiles WHERE id = auth.uid() AND is_active = true;

        IF auth.uid() = p_user_id THEN
            RAISE EXCEPTION 'You cannot delete your own account.' USING ERRCODE = '42501';
        END IF;
        IF NOT (
            (v_caller_role = 'HOD' AND v_target.role IN ('TEACHER', 'STUDENT') AND v_target.department_id = v_caller_dept)
            OR (v_caller_role = 'COLLEGE_ADMIN' AND v_target.role <> 'COLLEGE_ADMIN' AND v_target.college_id = v_caller_college)
        ) THEN
            RAISE EXCEPTION 'Access denied: you can only delete teachers and students of your own department.' USING ERRCODE = '42501';
        END IF;
    END IF;

    PERFORM set_config('orixa.allow_attempt_delete', 'on', true);   -- this transaction only

    -- the profile and everything attached follows (cascading deletes)
    DELETE FROM auth.users WHERE id = p_user_id;
    DELETE FROM public.profiles WHERE id = p_user_id;               -- no-op when the cascade already removed it

    RETURN jsonb_build_object('deleted_user', p_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_admin_update_user(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_admin_delete_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_update_user(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_admin_delete_user(UUID) TO authenticated, service_role;

COMMIT;
