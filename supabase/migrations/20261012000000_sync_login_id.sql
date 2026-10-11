-- =============================================================================
-- ORIXA — KEEP profiles.login_id AND THE LOGIN EMAIL IN SYNC
-- The login email is <login_id>@auth.orixa.internal (auth.users). Changing only one of the two
-- left the old ID working and the new one failing. These triggers update both directions:
--   profiles.login_id  -> auth.users.email, auth.identities, teacher/student ID
--   auth.users.email   -> profiles.login_id
-- IDs are stored lower-case and trimmed.
-- =============================================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.fn_sync_login_id_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF NEW.login_id IS NOT NULL THEN
    NEW.login_id := lower(trim(NEW.login_id));
  END IF;
  IF NEW.login_id IS NULL OR NEW.login_id IS NOT DISTINCT FROM OLD.login_id THEN
    RETURN NEW;
  END IF;

  v_email := NEW.login_id || '@auth.orixa.internal';

  UPDATE auth.users
     SET email = v_email,
         raw_user_meta_data = raw_user_meta_data || jsonb_build_object('login_id', NEW.login_id),
         updated_at = now()
   WHERE id = NEW.id AND email IS DISTINCT FROM v_email;

  UPDATE auth.identities
     SET identity_data = identity_data || jsonb_build_object('email', v_email),
         updated_at = now()
   WHERE user_id = NEW.id;

  UPDATE public.teacher_profiles SET employee_id = NEW.login_id WHERE profile_id = NEW.id;
  UPDATE public.student_profiles SET student_id  = NEW.login_id WHERE profile_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_login_id_to_auth ON public.profiles;
CREATE TRIGGER trg_sync_login_id_to_auth
  BEFORE UPDATE OF login_id ON public.profiles
  FOR EACH ROW
  WHEN (OLD.login_id IS DISTINCT FROM NEW.login_id)
  EXECUTE FUNCTION public.fn_sync_login_id_to_auth();


CREATE OR REPLACE FUNCTION public.fn_sync_auth_email_to_login_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_login_id TEXT;
BEGIN
  -- depth > 1: this update was caused by the profiles trigger above, nothing more to do
  IF pg_trigger_depth() > 1 OR NEW.email IS NULL OR NEW.email NOT LIKE '%@auth.orixa.internal' THEN
    RETURN NEW;
  END IF;

  v_login_id := lower(split_part(NEW.email, '@', 1));

  UPDATE public.profiles
     SET login_id = v_login_id
   WHERE id = NEW.id AND login_id IS DISTINCT FROM v_login_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_email_to_login_id ON auth.users;
CREATE TRIGGER trg_sync_auth_email_to_login_id
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.fn_sync_auth_email_to_login_id();

COMMIT;
