-- =============================================================================
-- ORIXA — STUDENT NICKNAMES (private)
-- A student can give themselves a nickname that ONLY they can see. It lives in its own table, not on
-- profiles, because profiles rows are readable by teachers, HODs and the college admin. Here the only
-- policies are "own row": nobody else can read, change or delete a student's nickname from the app.
-- Safe to run more than once.
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.student_nicknames (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_student_nickname_length CHECK (char_length(btrim(nickname)) BETWEEN 1 AND 30)
);

ALTER TABLE public.student_nicknames ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.student_nicknames FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_nicknames TO authenticated;

DROP POLICY IF EXISTS student_nicknames_select_own ON public.student_nicknames;
CREATE POLICY student_nicknames_select_own ON public.student_nicknames
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS student_nicknames_insert_own ON public.student_nicknames;
CREATE POLICY student_nicknames_insert_own ON public.student_nicknames
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND (SELECT private_auth.get_auth_role()) = 'STUDENT');

DROP POLICY IF EXISTS student_nicknames_update_own ON public.student_nicknames;
CREATE POLICY student_nicknames_update_own ON public.student_nicknames
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() AND (SELECT private_auth.get_auth_role()) = 'STUDENT');

DROP POLICY IF EXISTS student_nicknames_delete_own ON public.student_nicknames;
CREATE POLICY student_nicknames_delete_own ON public.student_nicknames
  FOR DELETE TO authenticated
  USING (student_id = auth.uid());

COMMIT;
