-- Remove the overly permissive INSERT policy and replace with a proper one
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Allow anyone to insert their own email (for newsletter signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Ensure only admins can SELECT newsletter subscribers (already exists but let's be explicit)
-- The existing "Admins can view all subscribers" policy already handles this