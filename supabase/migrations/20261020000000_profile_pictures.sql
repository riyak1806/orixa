-- =============================================================================
-- ORIXA — PROFILE PICTURES
-- * profiles.avatar_url        public URL of the user's picture (NULL = initials are shown)
-- * storage bucket "avatars"   public to read, 2 MB, JPEG / PNG / WebP only
-- * each user can only add, replace or delete files inside their OWN folder: avatars/<user id>/...
-- * fn_set_my_avatar(url)      the only way to change avatar_url, and only to a file inside the caller's folder
-- Safe to run more than once.
-- =============================================================================
BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS avatars_select ON storage.objects;
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
CREATE POLICY avatars_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.fn_set_my_avatar(p_url TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  IF p_url IS NOT NULL AND p_url <> '' AND position('/storage/v1/object/public/avatars/' || v_uid::text || '/' IN p_url) = 0 THEN
    RAISE EXCEPTION 'The picture must be stored in your own avatar folder.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles SET avatar_url = NULLIF(p_url, '') WHERE id = v_uid;
  RETURN jsonb_build_object('avatar_url', NULLIF(p_url, ''));
END;
$$;

REVOKE ALL ON FUNCTION public.fn_set_my_avatar(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_set_my_avatar(TEXT) TO authenticated;

COMMIT;
