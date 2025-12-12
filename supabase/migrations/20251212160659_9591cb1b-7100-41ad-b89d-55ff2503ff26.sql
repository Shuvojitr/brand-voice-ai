-- Create custom types
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- ============================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  monthly_credits INTEGER DEFAULT 1000,
  credits_used INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ORGANIZATION_MEMBERS TABLE
-- ============================================
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role org_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is member of org
-- ============================================
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- HELPER FUNCTION: Check if user is admin/owner of org
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
      AND organization_id = _org_id 
      AND role IN ('admin', 'owner')
  )
$$;

-- HELPER FUNCTION: Get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = _user_id
$$;

-- Organizations RLS
CREATE POLICY "Members can view their organizations" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can update their organizations" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(auth.uid(), id));

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (true);

-- Organization Members RLS
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org members" ON public.organization_members
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users can join orgs" ON public.organization_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. BRAND_VOICES TABLE
-- ============================================
CREATE TABLE public.brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tone_keywords TEXT[] DEFAULT '{}',
  sample_text TEXT,
  style_instructions TEXT,
  language TEXT DEFAULT 'en',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view brand voices" ON public.brand_voices
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage brand voices" ON public.brand_voices
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Members can create brand voices" ON public.brand_voices
  FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- ============================================
-- 5. DOCUMENTS TABLE (generated content)
-- ============================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT,
  content_html TEXT,
  template_type TEXT,
  template_inputs JSONB DEFAULT '{}',
  brand_voice_id UUID REFERENCES public.brand_voices(id),
  language TEXT DEFAULT 'en',
  word_count INTEGER DEFAULT 0,
  seo_score INTEGER,
  is_favorite BOOLEAN DEFAULT false,
  folder TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org documents" ON public.documents
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. CREDIT_USAGE TABLE
-- ============================================
CREATE TABLE public.credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  credits_consumed INTEGER DEFAULT 0,
  model_used TEXT,
  template_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org usage" ON public.credit_usage
  FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "System can insert usage" ON public.credit_usage
  FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_brand_voices_updated_at
  BEFORE UPDATE ON public.brand_voices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_documents_org ON public.documents(organization_id);
CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_brand_voices_org ON public.brand_voices(organization_id);
CREATE INDEX idx_credit_usage_org ON public.credit_usage(organization_id);
CREATE INDEX idx_credit_usage_user ON public.credit_usage(user_id);