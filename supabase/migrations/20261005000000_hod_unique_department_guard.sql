-- Reject re-provisioning an HOD who already heads another department (fk_hod_profile_dept would otherwise fail).
BEGIN;

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

COMMIT;
