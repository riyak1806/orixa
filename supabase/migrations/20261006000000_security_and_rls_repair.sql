-- =============================================================================
-- ORIXA — SECURITY & RLS REPAIR
-- 1. Drops get_all_profiles_debug(): SECURITY DEFINER, executable by anon -> leaked every profile.
-- 2. Restores private_auth helpers as SECURITY DEFINER (the JWT-fallback version ran with caller
--    rights, so it re-entered profiles RLS and could recurse / return NULL).
-- 3. Restores college-scoped quizzes / student_subject_assignments policies
--    (20261003000000 let any COLLEGE_ADMIN read and write other colleges' rows and removed HOD quiz access).
-- 4. Teacher/student provisioning: refuse to move or reset the password of an account that already
--    belongs to another department/college.
-- =============================================================================
BEGIN;

DROP FUNCTION IF EXISTS public.get_all_profiles_debug();

CREATE OR REPLACE FUNCTION private_auth.get_auth_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_college_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT college_id FROM public.profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_department_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT department_id FROM public.profiles WHERE id = auth.uid(); $$;

DROP POLICY IF EXISTS student_subject_assignments_select ON public.student_subject_assignments;
CREATE POLICY student_subject_assignments_select ON public.student_subject_assignments
  FOR SELECT TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND subject_id IN (SELECT id FROM public.subjects WHERE department_id = (SELECT private_auth.get_auth_department_id())))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND student_id = auth.uid())
  );

DROP POLICY IF EXISTS student_subject_assignments_write ON public.student_subject_assignments;
CREATE POLICY student_subject_assignments_write ON public.student_subject_assignments
  FOR ALL TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND subject_id IN (SELECT id FROM public.subjects WHERE department_id = (SELECT private_auth.get_auth_department_id())))
  )
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND subject_id IN (SELECT id FROM public.subjects WHERE department_id = (SELECT private_auth.get_auth_department_id())))
  );

DROP POLICY IF EXISTS quizzes_select ON public.quizzes;
CREATE POLICY quizzes_select ON public.quizzes
  FOR SELECT TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
    OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND status = 'PUBLISHED' AND college_id = (SELECT private_auth.get_auth_college_id()) AND teacher_assignment_id IN (
          SELECT teacher_assignment_id FROM public.student_subject_assignments
          WHERE student_id = auth.uid()
            AND is_active = true
            AND subject_id = quizzes.subject_id
            AND academic_level_id = quizzes.academic_level_id
            AND academic_session_id = quizzes.academic_session_id
            AND teacher_id = quizzes.teacher_id
        ))
  );

DROP POLICY IF EXISTS quizzes_write ON public.quizzes;
CREATE POLICY quizzes_write ON public.quizzes
  FOR ALL TO authenticated
  USING (
    ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
  )
  WITH CHECK (
    ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND teacher_id = auth.uid())
    OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
  );

CREATE OR REPLACE FUNCTION public.fn_admin_provision_teacher(
    p_full_name TEXT,
    p_login_id TEXT,
    p_password TEXT,
    p_department_id UUID,
    p_designation TEXT DEFAULT 'Faculty'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_college_id UUID;
    v_user_id UUID;
    v_clean_login_id TEXT;
    v_clean_full_name TEXT;
    v_clean_designation TEXT;
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
    v_caller_role public.app_role;
    v_caller_college_id UUID;
    v_caller_department_id UUID;
    v_caller_is_active BOOLEAN;
    v_existing_role public.app_role;
BEGIN
    -- 1. Input Validation
    v_clean_full_name := trim(p_full_name);
    v_clean_login_id := lower(trim(p_login_id));
    v_clean_designation := COALESCE(NULLIF(trim(p_designation), ''), 'Faculty');

    IF v_clean_full_name IS NULL OR v_clean_full_name = '' THEN
        RAISE EXCEPTION 'Full name is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF v_clean_login_id IS NULL OR v_clean_login_id = '' THEN
        RAISE EXCEPTION 'Login ID is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF p_password IS NULL OR length(p_password) < 8 THEN
        RAISE EXCEPTION 'Password must be at least 8 characters long' USING ERRCODE = '22023';
    END IF;

    IF p_department_id IS NULL THEN
        RAISE EXCEPTION 'Department ID is required' USING ERRCODE = '22023';
    END IF;

    -- 2. Department & College Resolution
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found' USING ERRCODE = '22023';
    END IF;

    -- 3. Defense-in-depth Caller Authorization Guard
    IF auth.role() <> 'service_role' THEN
        IF auth.uid() IS NULL THEN
            RAISE EXCEPTION 'Access denied: caller is not authenticated' USING ERRCODE = '42501';
        END IF;

        SELECT role, college_id, department_id, is_active
        INTO v_caller_role, v_caller_college_id, v_caller_department_id, v_caller_is_active
        FROM public.profiles
        WHERE id = auth.uid();

        IF v_caller_is_active IS NOT TRUE THEN
            RAISE EXCEPTION 'Access denied: caller profile is inactive or not found' USING ERRCODE = '42501';
        END IF;

        IF v_caller_role = 'COLLEGE_ADMIN' THEN
            IF v_caller_college_id <> v_college_id THEN
                RAISE EXCEPTION 'Access denied: college admin cannot manage a different college' USING ERRCODE = '42501';
            END IF;
        ELSIF v_caller_role = 'HOD' THEN
            IF v_caller_college_id <> v_college_id OR v_caller_department_id <> p_department_id THEN
                RAISE EXCEPTION 'Access denied: HOD can only provision teachers within their own department' USING ERRCODE = '42501';
            END IF;
        ELSE
            RAISE EXCEPTION 'Access denied: insufficient permissions to provision teacher' USING ERRCODE = '42501';
        END IF;
    END IF;

    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- 4. Check if User Already Exists & Validate Role Conflict
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NOT NULL THEN
        SELECT role INTO v_existing_role
        FROM public.profiles
        WHERE id = v_user_id;

        IF v_existing_role IS NOT NULL AND v_existing_role <> 'TEACHER' THEN
            RAISE EXCEPTION 'User % already exists with role %, cannot reprovision as TEACHER', v_clean_login_id, v_existing_role
                USING ERRCODE = '23505';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_user_id
              AND (college_id IS DISTINCT FROM v_college_id OR department_id IS DISTINCT FROM p_department_id)
        ) THEN
            RAISE EXCEPTION 'Login ID % already belongs to another department. Use a different ID.', v_clean_login_id
                USING ERRCODE = '23505';
        END IF;

        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    ELSE
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change,
            email_change_token_new,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            v_internal_email,
            v_encrypted_pw,
            now(),
            '',
            '',
            '',
            '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', v_clean_login_id, 'full_name', v_clean_full_name, 'role', 'TEACHER'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;

    -- 5. Insert/Update Matching auth.identities Record
    IF NOT EXISTS (
        SELECT 1 FROM auth.identities
        WHERE user_id = v_user_id OR (provider = 'email' AND provider_id = v_user_id::text)
    ) THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_internal_email, 'email_verified', true),
            'email',
            v_user_id::text,
            now(),
            now(),
            now()
        );
    END IF;

    -- 6. Upsert public.profiles
    INSERT INTO public.profiles (
        id,
        college_id,
        department_id,
        role,
        full_name,
        login_id,
        is_active
    ) VALUES (
        v_user_id,
        v_college_id,
        p_department_id,
        'TEACHER',
        v_clean_full_name,
        v_clean_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

    -- 7. Upsert public.teacher_profiles
    INSERT INTO public.teacher_profiles (
        profile_id,
        college_id,
        role,
        employee_id,
        designation
    ) VALUES (
        v_user_id,
        v_college_id,
        'TEACHER',
        v_clean_login_id,
        v_clean_designation
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        employee_id = EXCLUDED.employee_id,
        designation = EXCLUDED.designation;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'login_id', v_clean_login_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_admin_provision_student(
    p_full_name TEXT,
    p_login_id TEXT,
    p_password TEXT,
    p_department_id UUID,
    p_academic_level_id UUID,
    p_roll_number TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_college_id UUID;
    v_user_id UUID;
    v_clean_login_id TEXT;
    v_clean_full_name TEXT;
    v_clean_roll_number TEXT;
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
    v_caller_role public.app_role;
    v_caller_college_id UUID;
    v_caller_department_id UUID;
    v_caller_is_active BOOLEAN;
    v_existing_role public.app_role;
BEGIN
    -- 1. Input Validation
    v_clean_full_name := trim(p_full_name);
    v_clean_login_id := lower(trim(p_login_id));
    v_clean_roll_number := NULLIF(trim(p_roll_number), '');

    IF v_clean_full_name IS NULL OR v_clean_full_name = '' THEN
        RAISE EXCEPTION 'Full name is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF v_clean_login_id IS NULL OR v_clean_login_id = '' THEN
        RAISE EXCEPTION 'Login ID is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF p_password IS NULL OR length(p_password) < 8 THEN
        RAISE EXCEPTION 'Password must be at least 8 characters long' USING ERRCODE = '22023';
    END IF;

    IF p_department_id IS NULL THEN
        RAISE EXCEPTION 'Department ID is required' USING ERRCODE = '22023';
    END IF;

    IF p_academic_level_id IS NULL THEN
        RAISE EXCEPTION 'Academic level ID is required' USING ERRCODE = '22023';
    END IF;

    -- 2. Department & College Resolution
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found' USING ERRCODE = '22023';
    END IF;

    -- 3. Academic Level Validation (must belong to same college)
    IF NOT EXISTS (
        SELECT 1 FROM public.academic_levels
        WHERE id = p_academic_level_id AND college_id = v_college_id
    ) THEN
        RAISE EXCEPTION 'Academic level not found in the target college' USING ERRCODE = '22023';
    END IF;

    -- 4. Defense-in-depth Caller Authorization Guard
    IF auth.role() <> 'service_role' THEN
        IF auth.uid() IS NULL THEN
            RAISE EXCEPTION 'Access denied: caller is not authenticated' USING ERRCODE = '42501';
        END IF;

        SELECT role, college_id, department_id, is_active
        INTO v_caller_role, v_caller_college_id, v_caller_department_id, v_caller_is_active
        FROM public.profiles
        WHERE id = auth.uid();

        IF v_caller_is_active IS NOT TRUE THEN
            RAISE EXCEPTION 'Access denied: caller profile is inactive or not found' USING ERRCODE = '42501';
        END IF;

        IF v_caller_role = 'COLLEGE_ADMIN' THEN
            IF v_caller_college_id <> v_college_id THEN
                RAISE EXCEPTION 'Access denied: college admin cannot manage a different college' USING ERRCODE = '42501';
            END IF;
        ELSIF v_caller_role = 'HOD' THEN
            IF v_caller_college_id <> v_college_id OR v_caller_department_id <> p_department_id THEN
                RAISE EXCEPTION 'Access denied: HOD can only provision students within their own department' USING ERRCODE = '42501';
            END IF;
        ELSE
            RAISE EXCEPTION 'Access denied: insufficient permissions to provision student' USING ERRCODE = '42501';
        END IF;
    END IF;

    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- 5. Check if User Already Exists & Validate Role Conflict
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NOT NULL THEN
        SELECT role INTO v_existing_role
        FROM public.profiles
        WHERE id = v_user_id;

        IF v_existing_role IS NOT NULL AND v_existing_role <> 'STUDENT' THEN
            RAISE EXCEPTION 'User % already exists with role %, cannot reprovision as STUDENT', v_clean_login_id, v_existing_role
                USING ERRCODE = '23505';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_user_id
              AND (college_id IS DISTINCT FROM v_college_id OR department_id IS DISTINCT FROM p_department_id)
        ) THEN
            RAISE EXCEPTION 'Login ID % already belongs to another department. Use a different ID.', v_clean_login_id
                USING ERRCODE = '23505';
        END IF;

        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    ELSE
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change,
            email_change_token_new,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            v_internal_email,
            v_encrypted_pw,
            now(),
            '',
            '',
            '',
            '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', v_clean_login_id, 'full_name', v_clean_full_name, 'role', 'STUDENT'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;

    -- 6. Insert/Update Matching auth.identities Record
    IF NOT EXISTS (
        SELECT 1 FROM auth.identities
        WHERE user_id = v_user_id OR (provider = 'email' AND provider_id = v_user_id::text)
    ) THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_internal_email, 'email_verified', true),
            'email',
            v_user_id::text,
            now(),
            now(),
            now()
        );
    END IF;

    -- 7. Upsert public.profiles
    INSERT INTO public.profiles (
        id,
        college_id,
        department_id,
        role,
        full_name,
        login_id,
        is_active
    ) VALUES (
        v_user_id,
        v_college_id,
        p_department_id,
        'STUDENT',
        v_clean_full_name,
        v_clean_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

    -- 8. Upsert public.student_profiles
    INSERT INTO public.student_profiles (
        profile_id,
        college_id,
        role,
        student_id,
        academic_level_id,
        roll_number
    ) VALUES (
        v_user_id,
        v_college_id,
        'STUDENT',
        v_clean_login_id,
        p_academic_level_id,
        COALESCE(v_clean_roll_number, v_clean_login_id)
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        student_id = EXCLUDED.student_id,
        academic_level_id = EXCLUDED.academic_level_id,
        roll_number = EXCLUDED.roll_number;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'login_id', v_clean_login_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_admin_provision_hod(
    p_full_name TEXT,
    p_login_id TEXT,
    p_password TEXT,
    p_department_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_college_id UUID;
    v_user_id UUID;
    v_clean_login_id TEXT;
    v_clean_full_name TEXT;
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
    v_caller_role public.app_role;
    v_caller_college_id UUID;
    v_caller_is_active BOOLEAN;
    v_existing_role public.app_role;
BEGIN
    -- 1. Input Validation
    v_clean_full_name := trim(p_full_name);
    v_clean_login_id := lower(trim(p_login_id));

    IF v_clean_full_name IS NULL OR v_clean_full_name = '' THEN
        RAISE EXCEPTION 'Full name is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF v_clean_login_id IS NULL OR v_clean_login_id = '' THEN
        RAISE EXCEPTION 'Login ID is required and cannot be blank' USING ERRCODE = '22023';
    END IF;

    IF p_password IS NULL OR length(p_password) < 8 THEN
        RAISE EXCEPTION 'Password must be at least 8 characters long' USING ERRCODE = '22023';
    END IF;

    IF p_department_id IS NULL THEN
        RAISE EXCEPTION 'Department ID is required' USING ERRCODE = '22023';
    END IF;

    -- 2. Department & College Resolution
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found' USING ERRCODE = '22023';
    END IF;

    -- 3. Defense-in-depth Caller Authorization Guard
    IF auth.role() <> 'service_role' THEN
        IF auth.uid() IS NULL THEN
            RAISE EXCEPTION 'Access denied: caller is not authenticated' USING ERRCODE = '42501';
        END IF;

        SELECT role, college_id, is_active
        INTO v_caller_role, v_caller_college_id, v_caller_is_active
        FROM public.profiles
        WHERE id = auth.uid();

        IF v_caller_is_active IS NOT TRUE THEN
            RAISE EXCEPTION 'Access denied: caller profile is inactive or not found' USING ERRCODE = '42501';
        END IF;

        IF v_caller_role <> 'COLLEGE_ADMIN' OR v_caller_college_id <> v_college_id THEN
            RAISE EXCEPTION 'Access denied: only college admins can provision HODs for this college' USING ERRCODE = '42501';
        END IF;
    END IF;

    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- 4. Check if User Already Exists & Validate Role Conflict
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NOT NULL THEN
        SELECT role INTO v_existing_role
        FROM public.profiles
        WHERE id = v_user_id;

        IF v_existing_role IS NOT NULL AND v_existing_role <> 'HOD' THEN
            RAISE EXCEPTION 'User % already exists with role %, cannot reprovision as HOD', v_clean_login_id, v_existing_role
                USING ERRCODE = '23505';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.hod_assignments
            WHERE profile_id = v_user_id AND department_id <> p_department_id
        ) THEN
            RAISE EXCEPTION 'Employee ID % is already assigned as HOD of another department. Use a different ID.', v_clean_login_id
                USING ERRCODE = '23505';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = v_user_id AND college_id IS DISTINCT FROM v_college_id
        ) THEN
            RAISE EXCEPTION 'Login ID % already belongs to another college. Use a different ID.', v_clean_login_id
                USING ERRCODE = '23505';
        END IF;

        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    ELSE
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change,
            email_change_token_new,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            v_internal_email,
            v_encrypted_pw,
            now(),
            '',
            '',
            '',
            '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', v_clean_login_id, 'full_name', v_clean_full_name, 'role', 'HOD'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;

    -- 5. Insert/Update Matching auth.identities Record
    IF NOT EXISTS (
        SELECT 1 FROM auth.identities
        WHERE user_id = v_user_id OR (provider = 'email' AND provider_id = v_user_id::text)
    ) THEN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_internal_email, 'email_verified', true),
            'email',
            v_user_id::text,
            now(),
            now(),
            now()
        );
    END IF;

    -- 6. Upsert public.profiles
    INSERT INTO public.profiles (
        id,
        college_id,
        department_id,
        role,
        full_name,
        login_id,
        is_active
    ) VALUES (
        v_user_id,
        v_college_id,
        p_department_id,
        'HOD',
        v_clean_full_name,
        v_clean_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

    -- 7. Deactivate any existing active HOD for this department first to preserve partial index
    UPDATE public.hod_assignments
    SET is_active = false, ended_at = now()
    WHERE department_id = p_department_id AND is_active = true AND profile_id <> v_user_id;

    -- 8. Upsert active HOD assignment
    INSERT INTO public.hod_assignments (
        profile_id,
        role,
        department_id,
        is_active,
        started_at,
        ended_at
    ) VALUES (
        v_user_id,
        'HOD',
        p_department_id,
        true,
        now(),
        NULL
    )
    ON CONFLICT (department_id) WHERE is_active = true
    DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        role = EXCLUDED.role,
        started_at = EXCLUDED.started_at,
        ended_at = NULL;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'login_id', v_clean_login_id
    );
END;
$$;


-- 5. Match-the-Following answer check (the old one compared against a shape the client never sent)
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

    IF v_prev_chances >= v_max_chances THEN
      RAISE EXCEPTION 'Maximum chances exhausted for this question (Attempt ID: %, Question ID: %).', p_attempt_id, p_question_id;
    END IF;
  END IF;

  IF v_quiz.game_type = 'TILE_PUZZLE' THEN
    v_is_correct := (p_answer_json->>'selected_option_index' = v_question.game_payload->>'correct_option_index');
  ELSIF v_quiz.game_type = 'MATCH_FOLLOWING' THEN
    -- Client sends [{id: <prompt pair id>, choice: <chosen pair id>}]; correct iff every id matches its choice
    v_is_correct := jsonb_typeof(p_answer_json->'pairs') = 'array'
                AND jsonb_array_length(p_answer_json->'pairs') = jsonb_array_length(v_question.game_payload->'pairs')
                AND NOT EXISTS (
                  SELECT 1 FROM jsonb_array_elements(p_answer_json->'pairs') AS a(elem)
                  WHERE (a.elem->>'id') IS DISTINCT FROM (a.elem->>'choice')
                     OR NOT (v_question.game_payload->'pairs' @> jsonb_build_array(jsonb_build_object('id', a.elem->>'id')))
                );
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

-- 6. Students may read the profile (name) of teachers they are assigned to
DROP POLICY IF EXISTS profiles_select_others ON public.profiles;
CREATE POLICY profiles_select_others ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id != auth.uid() AND (
      ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND college_id = (SELECT private_auth.get_auth_college_id()))
      OR ((SELECT private_auth.get_auth_role()) = 'HOD' AND department_id = (SELECT private_auth.get_auth_department_id()))
      OR ((SELECT private_auth.get_auth_role()) = 'TEACHER' AND id IN (
            SELECT student_id FROM public.student_subject_assignments WHERE teacher_id = auth.uid() AND is_active = true
          ))
      OR ((SELECT private_auth.get_auth_role()) = 'STUDENT' AND id IN (
            SELECT teacher_id FROM public.student_subject_assignments WHERE student_id = auth.uid() AND is_active = true
          ))
    )
  );

COMMIT;
