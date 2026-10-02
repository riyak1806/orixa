-- =============================================================================
-- ORIXA PLATFORM — ADMIN PROVISIONING RPC FUNCTIONS MIGRATION
-- Provides SECURITY DEFINER functions for provisioning HODs, Teachers, and Students
-- from the administrative portals without requiring external service-role scripts.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing functions if signature or parameter defaults changed
DROP FUNCTION IF EXISTS public.fn_admin_provision_hod(TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.fn_admin_provision_teacher(TEXT, TEXT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.fn_admin_provision_student(TEXT, TEXT, TEXT, UUID, UUID, TEXT);

-- 1. Provision HOD Function
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
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
BEGIN
    -- Verify department exists and retrieve college_id
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found';
    END IF;

    v_clean_login_id := lower(trim(p_login_id));
    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Check if user already exists in auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
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
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', p_login_id, 'full_name', p_full_name, 'role', 'HOD'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        -- Update password if existing
        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

    -- Upsert public.profiles
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
        p_full_name,
        p_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

    -- Deactivate any previous active HOD for this department
    UPDATE public.hod_assignments
    SET is_active = false, ended_at = now()
    WHERE department_id = p_department_id AND is_active = true AND profile_id <> v_user_id;

    -- Upsert active HOD assignment
    INSERT INTO public.hod_assignments (
        profile_id,
        role,
        department_id,
        is_active,
        started_at
    ) VALUES (
        v_user_id,
        'HOD',
        p_department_id,
        true,
        now()
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
        'login_id', p_login_id
    );
END;
$$;

-- 2. Provision Teacher Function
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
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
BEGIN
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found';
    END IF;

    v_clean_login_id := lower(trim(p_login_id));
    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
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
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', p_login_id, 'full_name', p_full_name, 'role', 'TEACHER'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

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
        p_full_name,
        p_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

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
        p_login_id,
        p_designation
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        employee_id = EXCLUDED.employee_id,
        designation = EXCLUDED.designation;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'login_id', p_login_id
    );
END;
$$;

-- 3. Provision Student Function
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
    v_internal_email TEXT;
    v_encrypted_pw TEXT;
BEGIN
    SELECT college_id INTO v_college_id
    FROM public.departments
    WHERE id = p_department_id;

    IF v_college_id IS NULL THEN
        RAISE EXCEPTION 'Department not found';
    END IF;

    v_clean_login_id := lower(trim(p_login_id));
    v_internal_email := v_clean_login_id || '@auth.orixa.internal';
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_internal_email;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
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
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('login_id', p_login_id, 'full_name', p_full_name, 'role', 'STUDENT'),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

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
        p_full_name,
        p_login_id,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        college_id = EXCLUDED.college_id,
        department_id = EXCLUDED.department_id,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        login_id = EXCLUDED.login_id,
        is_active = true;

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
        p_login_id,
        p_academic_level_id,
        p_roll_number
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        academic_level_id = EXCLUDED.academic_level_id,
        roll_number = EXCLUDED.roll_number;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'login_id', p_login_id
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.fn_admin_provision_hod TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_provision_teacher TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.fn_admin_provision_student TO authenticated, anon;
