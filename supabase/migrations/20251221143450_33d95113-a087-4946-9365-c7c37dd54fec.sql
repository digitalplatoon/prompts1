-- Create table for user-submitted prompts pending review
CREATE TABLE public.submitted_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  prompt_content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  suggested_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submitted_prompts ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.submitted_prompts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions"
ON public.submitted_prompts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their pending submissions
CREATE POLICY "Users can update their pending submissions"
ON public.submitted_prompts
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their pending submissions
CREATE POLICY "Users can delete their pending submissions"
ON public.submitted_prompts
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.submitted_prompts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all submissions (for review)
CREATE POLICY "Admins can update all submissions"
ON public.submitted_prompts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_submitted_prompts_updated_at
BEFORE UPDATE ON public.submitted_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();