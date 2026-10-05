-- Add fallback to public.profiles if JWT app_metadata is missing.
-- This ensures seed users without app_metadata can still bypass RLS properly.

CREATE OR REPLACE FUNCTION private_auth.get_auth_role()
RETURNS public.app_role
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role')::public.app_role,
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );
$$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_college_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'college_id')::UUID,
    (SELECT college_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );
$$;

CREATE OR REPLACE FUNCTION private_auth.get_auth_department_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'department_id')::UUID,
    (SELECT department_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );
$$;
