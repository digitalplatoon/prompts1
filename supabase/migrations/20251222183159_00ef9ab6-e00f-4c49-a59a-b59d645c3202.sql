-- Create a secure view for public review display that hides user_id
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  r.id,
  r.prompt_id,
  r.rating,
  r.comment,
  r.created_at,
  p.display_name
FROM public.reviews r
LEFT JOIN public.profiles p ON r.user_id = p.user_id;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create more restrictive policies for direct table access
-- Only the review author can see their full review (including user_id)
CREATE POLICY "Users can view their own reviews" 
ON public.reviews 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all reviews with full details
CREATE POLICY "Admins can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));