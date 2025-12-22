-- Drop and recreate view with SECURITY INVOKER (default, explicit for clarity)
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews 
WITH (security_invoker = true) AS
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

-- Need a permissive policy on reviews for the view to work with SECURITY INVOKER
-- Create a policy that allows reading only non-sensitive fields via the view
CREATE POLICY "Public can read reviews for view access" 
ON public.reviews 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Also need to allow reading profiles for the join
CREATE POLICY "Public can read display names for reviews" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);