-- =============================================================================
-- ORIXA PLATFORM — SCHEMA FIX & RLS POLICIES MIGRATION
-- File: supabase/migrations/20260925000000_fix_schema_and_rls.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADDITIVE SCHEMA: CREATE PUBLIC.FEEDBACK TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  problem_type VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user lookup on feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- -----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) FOR PUBLIC.FEEDBACK
-- -----------------------------------------------------------------------------
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feedback_insert ON public.feedback;
CREATE POLICY feedback_insert ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

DROP POLICY IF EXISTS feedback_select ON public.feedback;
CREATE POLICY feedback_select ON public.feedback
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR ((SELECT private_auth.get_auth_role()) = 'COLLEGE_ADMIN' AND user_id IN (SELECT id FROM public.profiles WHERE college_id = (SELECT private_auth.get_auth_college_id())))
  );

-- -----------------------------------------------------------------------------
-- 3. PERMISSIONS & GRANTS
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON public.feedback TO authenticated;
