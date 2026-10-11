-- =============================================================================
-- ORIXA — LET A STUDENT'S COMPLETED ATTEMPTS GO WITH THE STUDENT
-- Deleting a student (profile or auth user) cascades to quiz_attempts, but
-- trg_block_completed_attempt_edits refused to delete completed attempts.
-- Completed attempts stay protected while the student exists; once the student row is gone
-- (a cascade), or while fn_delete_quiz / a developer session sets orixa.allow_attempt_delete,
-- the delete is allowed.
-- =============================================================================
BEGIN;

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
