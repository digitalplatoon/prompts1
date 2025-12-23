-- Allow authenticated users to view their own subscription by matching their auth email
CREATE POLICY "Users can view their own subscription"
ON public.newsletter_subscribers
FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

-- Allow authenticated users to update their subscription status (for unsubscribe)
CREATE POLICY "Users can update their own subscription"
ON public.newsletter_subscribers
FOR UPDATE
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));