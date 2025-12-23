-- Create a public view that excludes user_id for anonymous access
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  id,
  prompt_id,
  rating,
  comment,
  created_at,
  updated_at
FROM public.reviews;

-- Grant access to the view for authenticated and anonymous users
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Drop the overly permissive policy that exposes user_id
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create a new restrictive policy: users can only view their own reviews directly
-- (the public_reviews view handles public access without user_id)
CREATE POLICY "Users can view their own reviews"
ON public.reviews
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can still view all reviews with full details
CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));