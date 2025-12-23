-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default which is safer)
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews 
WITH (security_invoker = true) AS
SELECT 
  id,
  prompt_id,
  rating,
  comment,
  created_at,
  updated_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;