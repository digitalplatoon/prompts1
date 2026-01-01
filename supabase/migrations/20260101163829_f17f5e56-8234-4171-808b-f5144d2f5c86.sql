-- Add explicit SELECT policy to protect newsletter_subscribers
-- Only admins should be able to read subscriber emails

CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));