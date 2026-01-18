-- Tighten RLS policy role targeting to eliminate anonymous-read ambiguity
-- (Policies that rely on auth.uid()/auth.jwt() are already safe, but explicitly limiting
-- them to the authenticated role prevents scanners from treating them as public.)

-- PROFILES: ensure profile data is never readable by anon role
ALTER POLICY "Users can view their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can update their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can insert their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Admins can view all profiles" ON public.profiles TO authenticated;

-- NEWSLETTER_SUBSCRIBERS: ensure only authenticated users can read/update, and only admins can read all
ALTER POLICY "Users can view their own subscription" ON public.newsletter_subscribers TO authenticated;
ALTER POLICY "Users can update their own subscription" ON public.newsletter_subscribers TO authenticated;
ALTER POLICY "Admins can view all subscribers" ON public.newsletter_subscribers TO authenticated;
ALTER POLICY "Admins can manage subscribers" ON public.newsletter_subscribers TO authenticated;
ALTER POLICY "Only admins can view newsletter subscribers" ON public.newsletter_subscribers TO authenticated;

-- Allow public signup (INSERT) while keeping read/update protected
ALTER POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers TO anon, authenticated;
