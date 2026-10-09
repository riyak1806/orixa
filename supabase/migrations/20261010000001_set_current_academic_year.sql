-- =============================================================================
-- ORIXA — CHANGE THE CURRENT ACADEMIC YEAR
-- A college admin picks the academic year (e.g. 2026-2027). The session is created if it does not
-- exist yet and becomes the single current session; the previous one stays as history.
-- Teacher / student assignments belong to the session they were created in, so they are not moved.
-- =============================================================================
BEGIN;

DROP FUNCTION IF EXISTS public.fn_set_current_academic_year(TEXT, DATE, DATE);

CREATE OR REPLACE FUNCTION public.fn_set_current_academic_year(
  p_code TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role public.app_role;
  v_college UUID;
  v_code TEXT := trim(p_code);
  v_session_id UUID;
BEGIN
  SELECT role, college_id INTO v_role, v_college
  FROM public.profiles WHERE id = auth.uid() AND is_active = true;

  IF v_role IS DISTINCT FROM 'COLLEGE_ADMIN' OR v_college IS NULL THEN
    RAISE EXCEPTION 'Access denied: only a college admin can change the academic year.' USING ERRCODE = '42501';
  END IF;
  IF v_code IS NULL OR v_code = '' THEN
    RAISE EXCEPTION 'Academic year is required.' USING ERRCODE = '22023';
  END IF;
  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date <= p_start_date THEN
    RAISE EXCEPTION 'The end date must be after the start date.' USING ERRCODE = '22023';
  END IF;

  -- only one current session per college (uq_single_current_session)
  UPDATE public.academic_sessions SET is_current = false
  WHERE college_id = v_college AND is_current = true AND code <> v_code;

  INSERT INTO public.academic_sessions (college_id, code, start_date, end_date, is_current)
  VALUES (v_college, v_code, p_start_date, p_end_date, true)
  ON CONFLICT (college_id, code) DO UPDATE SET is_current = true
  RETURNING id INTO v_session_id;

  RETURN jsonb_build_object('session_id', v_session_id, 'code', v_code);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_set_current_academic_year(TEXT, DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_set_current_academic_year(TEXT, DATE, DATE) TO authenticated;

COMMIT;
