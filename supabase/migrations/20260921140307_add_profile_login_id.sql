-- =============================================================================
-- ORIXA PLATFORM — ADD PROFILE LOGIN ID MIGRATION
-- Adds login_id column to public.profiles to support custom ORIXA ID logins
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_login_id
  ON public.profiles (lower(login_id))
  WHERE login_id IS NOT NULL;
