
-- 1. Protect prompts.full_prompt at the column level.
-- Public/signed-in reads of the prompts table can no longer include full_prompt.
-- Admins fetch it via the new SECURITY DEFINER RPC; purchasers via existing RPC.
REVOKE SELECT (full_prompt) ON public.prompts FROM anon, authenticated;
-- Keep INSERT/UPDATE column privileges (admin RLS still restricts row access)
GRANT INSERT (full_prompt), UPDATE (full_prompt) ON public.prompts TO authenticated;

-- Admin-only RPC to read full_prompt for editing
CREATE OR REPLACE FUNCTION public.get_admin_prompt_full(p_prompt_id uuid)
RETURNS TABLE(full_prompt text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT p.full_prompt FROM public.prompts p WHERE p.id = p_prompt_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_prompt_full(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_prompt_full(uuid) TO authenticated;

-- 2. Storage: prevent listing every avatar. Public URLs still work (bypass RLS).
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Users can list their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Tighten EXECUTE grants on SECURITY DEFINER functions.
-- Triggers: no one needs EXECUTE (called by trigger dispatcher as owner).
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_newsletter_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role: used inside RLS policies. Anon never needs to check roles.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Purchased/user-specific RPCs: authenticated only.
REVOKE ALL ON FUNCTION public.get_purchased_prompt_content(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_purchased_prompt_content(text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_submissions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_submissions(uuid) TO authenticated;

-- Public reviews reader stays callable by everyone (intentional).
REVOKE ALL ON FUNCTION public.get_public_reviews(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_reviews(text) TO anon, authenticated;
