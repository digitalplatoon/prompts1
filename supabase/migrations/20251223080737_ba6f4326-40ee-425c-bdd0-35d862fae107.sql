-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view reviews for public display" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

-- Drop the view if it still exists
DROP VIEW IF EXISTS public.public_reviews;

-- Create a security definer function to get public reviews WITHOUT user_id
CREATE OR REPLACE FUNCTION public.get_public_reviews(p_prompt_id text)
RETURNS TABLE (
  id uuid,
  prompt_id text,
  rating integer,
  comment text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.prompt_id,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at
  FROM public.reviews r
  WHERE r.prompt_id = p_prompt_id
  ORDER BY r.created_at DESC;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION public.get_public_reviews(text) TO anon, authenticated;

-- Now create restrictive RLS policies - no public SELECT on the table itself
-- Users can only SELECT their own reviews (for editing)
CREATE POLICY "Users can view their own reviews"
ON public.reviews
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));