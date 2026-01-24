-- Create a secure function to get full_prompt content only for purchased prompts
-- This prevents direct database access to paid content without purchase verification

CREATE OR REPLACE FUNCTION public.get_purchased_prompt_content(p_prompt_id text)
RETURNS TABLE (full_prompt text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_prompt
  FROM prompts p
  WHERE p.id::text = p_prompt_id
    AND p.status = 'published'
    AND EXISTS (
      SELECT 1 FROM purchased_prompts pp
      WHERE pp.prompt_id = p_prompt_id
        AND pp.user_id = auth.uid()
    );
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_purchased_prompt_content(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_purchased_prompt_content(text) FROM anon, public;