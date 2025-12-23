-- Drop the view that's causing issues
DROP VIEW IF EXISTS public.public_reviews;

-- Remove the overly permissive policies we just created
DROP POLICY IF EXISTS "Public can read reviews for view access" ON public.reviews;
DROP POLICY IF EXISTS "Public can read display names for reviews" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

-- Create a single permissive policy for reading reviews (the table itself doesn't contain PII)
-- The reviews table only has user_id which is a UUID - not PII on its own
-- The privacy concern is addressed by NOT joining to profiles in public queries
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);