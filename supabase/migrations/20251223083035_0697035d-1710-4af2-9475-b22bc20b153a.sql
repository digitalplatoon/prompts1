-- Fix 1: Create a secure function to get user submissions WITHOUT admin_notes
CREATE OR REPLACE FUNCTION public.get_user_submissions(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  prompt_content text,
  category text,
  tags text[],
  suggested_price numeric,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  user_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.title,
    s.description,
    s.prompt_content,
    s.category,
    s.tags,
    s.suggested_price,
    s.status,
    s.created_at,
    s.updated_at,
    s.user_id
  FROM public.submitted_prompts s
  WHERE s.user_id = p_user_id
  ORDER BY s.created_at DESC;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_user_submissions(uuid) TO authenticated;

-- Fix 2: Update has_role function to include null check for safer operation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return false for null user_id to prevent potential issues
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Fix 3: Add database-level email validation for newsletter_subscribers
CREATE OR REPLACE FUNCTION public.validate_newsletter_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate email format using regex
  IF NOT NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate email length
  IF length(NEW.email) > 255 OR length(NEW.email) < 3 THEN
    RAISE EXCEPTION 'Email must be between 3 and 255 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for email validation
DROP TRIGGER IF EXISTS validate_newsletter_email_trigger ON public.newsletter_subscribers;
CREATE TRIGGER validate_newsletter_email_trigger
  BEFORE INSERT OR UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_newsletter_email();