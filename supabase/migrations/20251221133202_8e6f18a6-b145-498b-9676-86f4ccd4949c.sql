-- Allow admins to view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.purchased_prompts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all favorites
CREATE POLICY "Admins can view all favorites"
ON public.favorites
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));