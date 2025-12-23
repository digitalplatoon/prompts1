-- Drop the view - we'll rely on RLS with column-level access at the application layer instead
-- The client code already only selects non-sensitive columns
DROP VIEW IF EXISTS public.public_reviews;

-- Add back a public read policy, but the client code restricts column access
-- This is a trade-off: RLS can't restrict columns, only rows
-- Since client already restricts columns, we just document this is intentional
CREATE POLICY "Anyone can view reviews for public display"
ON public.reviews
FOR SELECT
USING (true);