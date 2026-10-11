-- =============================================================================
-- ORIXA — CASCADING DELETES
--   delete a college    -> everything of that college (departments, years, sessions, users, subjects,
--                          assignments, quizzes, attempts, notifications)
--   delete a department -> its subjects, HOD/teacher/student users and everything attached to them
--   delete a user       -> the user's login, profile, assignments, quizzes, attempts, notifications
-- Every foreign key inside the public schema becomes ON DELETE CASCADE.
-- DESTRUCTIVE BY DESIGN: a delete cannot be undone.
-- =============================================================================
BEGIN;

-- 1. Every public foreign key that does not cascade yet (RESTRICT / NO ACTION) now cascades.
DO $$
DECLARE
  r RECORD;
  new_def TEXT;
BEGIN
  FOR r IN
    SELECT c.conrelid::regclass AS tbl, c.conname, pg_get_constraintdef(c.oid) AS def
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.connamespace = 'public'::regnamespace
      AND c.confdeltype <> 'c'
      AND (SELECT relnamespace FROM pg_class WHERE oid = c.confrelid) = 'public'::regnamespace
  LOOP
    IF r.def ~* '(DEFERRABLE|NOT VALID)' THEN
      RAISE EXCEPTION 'Constraint % on % has options this script does not rewrite: %', r.conname, r.tbl, r.def;
    END IF;

    new_def := regexp_replace(r.def, ' ON DELETE (CASCADE|RESTRICT|NO ACTION|SET NULL|SET DEFAULT)', '', 'i');

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s ON DELETE CASCADE', r.tbl, r.conname, new_def);
  END LOOP;
END $$;

-- 2. Deleting a profile (directly, or through its department / college) also deletes the login.
CREATE OR REPLACE FUNCTION public.fn_delete_auth_user_with_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;   -- identities and sessions cascade
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_delete_auth_user_with_profile ON public.profiles;
CREATE TRIGGER trg_delete_auth_user_with_profile
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_delete_auth_user_with_profile();

-- 3. Completed attempts stay protected from edits and from direct deletes, but they may go
--    when the quiz or the student they belong to is being deleted (cascade), or when
--    fn_delete_quiz / a developer session sets orixa.allow_attempt_delete.
CREATE OR REPLACE FUNCTION public.fn_block_completed_attempt_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'COMPLETED' AND NOT (
    TG_OP = 'DELETE' AND (
      COALESCE(current_setting('orixa.allow_attempt_delete', true), '') = 'on'
      OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = OLD.student_id)
      OR NOT EXISTS (SELECT 1 FROM public.quizzes  WHERE id = OLD.quiz_id)
    )
  ) THEN
    RAISE EXCEPTION 'Cannot modify or delete a completed quiz attempt (Attempt ID: %).', OLD.id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMIT;
