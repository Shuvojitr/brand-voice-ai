-- Create homepage_content table for managing all homepage sections
CREATE TABLE public.homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read active content
CREATE POLICY "Anyone can read homepage content"
ON public.homepage_content
FOR SELECT
USING (is_active = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage homepage content"
ON public.homepage_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_homepage_content_updated_at
  BEFORE UPDATE ON public.homepage_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default content for each section
INSERT INTO public.homepage_content (section_key, content, sort_order) VALUES
('hero', '{
  "badge": "AI-Powered Content Creation",
  "title": "Create Amazing Content in Seconds",
  "highlight": "Seconds",
  "description": "Transform your ideas into polished, professional content with our AI-powered platform. Save hours of writing time and boost your productivity.",
  "primaryCta": "Start Creating for Free",
  "secondaryCta": "See How It Works"
}'::jsonb, 1),

('use_cases', '{
  "title": "Content for Every Need",
  "description": "Watch as our AI generates content tailored to your specific needs",
  "cases": [
    {
      "id": "blog",
      "label": "Blog Posts",
      "icon": "FileText",
      "title": "Engaging Blog Content",
      "content": "# The Future of Content Creation\n\nIn today''s digital landscape, creating **high-quality content** is more important than ever. Here are some key strategies:\n\n## 1. Know Your Audience\nUnderstanding your readers is the first step to creating content that resonates.\n\n## 2. Focus on Value\nEvery piece of content should provide genuine value to your readers.\n\n## 3. Be Consistent\nRegular publishing helps build trust and authority in your niche."
    },
    {
      "id": "social",
      "label": "Social Media",
      "icon": "Share2",
      "title": "Viral Social Posts",
      "content": "🚀 **Exciting news!**\n\nWe''re thrilled to announce our latest feature that will revolutionize how you create content.\n\n✨ AI-powered suggestions\n📈 Analytics dashboard\n🎯 Target audience insights\n\nTry it now and see the difference! Link in bio. 👆\n\n#ContentCreation #AI #Marketing"
    },
    {
      "id": "email",
      "label": "Emails",
      "icon": "Mail",
      "title": "Converting Email Copy",
      "content": "**Subject: Your exclusive invitation awaits**\n\nDear valued customer,\n\nWe''ve been working on something special just for you.\n\nAs one of our most engaged members, you''re getting **early access** to our newest feature before anyone else.\n\n**What''s included:**\n- Priority support\n- Extended trial period\n- Exclusive pricing\n\nClick below to claim your spot.\n\nBest regards,\nThe Team"
    }
  ]
}'::jsonb, 2),

('features', '{
  "title": "Everything You Need to Create",
  "highlight": "Great Content",
  "description": "Our platform provides all the tools you need to create, edit, and publish professional content.",
  "items": [
    {"icon": "Sparkles", "title": "AI-Powered Writing", "description": "Generate high-quality content in seconds with our advanced AI models"},
    {"icon": "Palette", "title": "Brand Voice", "description": "Maintain consistent tone across all your content with custom brand voices"},
    {"icon": "FileText", "title": "Multiple Formats", "description": "Create blog posts, social media, emails, ads, and more from one platform"},
    {"icon": "Globe", "title": "Multi-Language", "description": "Generate content in multiple languages to reach a global audience"},
    {"icon": "Zap", "title": "Fast Generation", "description": "Get your content in seconds, not hours. Boost your productivity instantly"},
    {"icon": "Shield", "title": "Plagiarism Free", "description": "All generated content is original and passes plagiarism checks"}
  ]
}'::jsonb, 3),

('how_it_works', '{
  "title": "How It Works",
  "description": "Get started in minutes with our simple three-step process",
  "steps": [
    {"step": "1", "title": "Choose a Template", "description": "Select from dozens of templates for blogs, social media, emails, and more."},
    {"step": "2", "title": "Describe Your Content", "description": "Tell our AI what you want to create. Add details about your topic and audience."},
    {"step": "3", "title": "Generate & Edit", "description": "Get your content in seconds. Edit, refine, and export in your preferred format."}
  ]
}'::jsonb, 4),

('cta', '{
  "title": "Ready to Transform Your Content Creation?",
  "description": "Join thousands of creators, marketers, and businesses who are already saving hours every week.",
  "buttonText": "Get Started for Free",
  "subtext": "No credit card required"
}'::jsonb, 5);
