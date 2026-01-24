-- Create prompt_categories table
CREATE TABLE public.prompt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.prompt_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  preview TEXT NOT NULL,
  full_prompt TEXT NOT NULL,
  usage_instructions TEXT[] DEFAULT '{}',
  example_outputs TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.prompt_categories(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  average_rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX idx_prompts_status ON public.prompts(status);
CREATE INDEX idx_prompts_is_featured ON public.prompts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_prompts_slug ON public.prompts(slug);
CREATE INDEX idx_prompt_categories_slug ON public.prompt_categories(slug);
CREATE INDEX idx_prompt_categories_parent ON public.prompt_categories(parent_id);

-- Enable RLS
ALTER TABLE public.prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_categories (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON public.prompt_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.prompt_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.prompt_categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.prompt_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prompts (published = public read, admin full access)
CREATE POLICY "Anyone can view published prompts"
  ON public.prompts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all prompts"
  ON public.prompts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert prompts"
  ON public.prompts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompts"
  ON public.prompts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prompts"
  ON public.prompts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_prompt_categories_updated_at
  BEFORE UPDATE ON public.prompt_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.prompt_categories IS 'Categories for organizing prompts with optional hierarchy';
COMMENT ON TABLE public.prompts IS 'Main prompts table for the marketplace';
COMMENT ON COLUMN public.prompts.price_cents IS 'Price in cents (e.g., 499 = $4.99)';
COMMENT ON COLUMN public.prompts.created_by IS 'UUID of the admin user who created the prompt';