import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Save, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Layout, 
  Type, 
  Image, 
  Zap,
  Users,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";
import { useHomepageContent, useUpsertHomepageSection, HomepageSection } from "@/hooks/useHomepageContent";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface HeroContent {
  badge_text: string;
  headline_1: string;
  headline_2: string;
  subheadline: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  trust_text_1: string;
  trust_text_2: string;
  social_proof_text: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface FeaturesContent {
  badge_text: string;
  headline_1: string;
  headline_2: string;
  subheadline: string;
  items: FeatureItem[];
}

interface StepItem {
  number: string;
  title: string;
  description: string;
  emoji: string;
}

interface StepsContent {
  badge_text: string;
  headline_1: string;
  headline_2: string;
  subheadline: string;
  items: StepItem[];
}

interface CtaContent {
  headline_1: string;
  headline_2: string;
  subheadline: string;
  cta_text: string;
  cta_link: string;
  trust_items: string[];
}

const defaultHero: HeroContent = {
  badge_text: "Powered by GPT-4 & Claude",
  headline_1: "Create Content",
  headline_2: "10x Faster",
  subheadline: "The AI-powered content generator that helps you write blog posts, social media content, ads, and emails in seconds.",
  cta_primary_text: "Start for Free",
  cta_primary_link: "/signup",
  cta_secondary_text: "View Pricing",
  cta_secondary_link: "#pricing",
  trust_text_1: "No credit card required",
  trust_text_2: "5,000 words free",
  social_proof_text: "Loved by 10,000+ content creators",
};

const defaultFeatures: FeaturesContent = {
  badge_text: "Features",
  headline_1: "Everything You Need",
  headline_2: "To Create Magic",
  subheadline: "Powerful features designed to help you write better content, faster.",
  items: [
    { icon: "Globe2", title: "Multi-language Support", description: "Generate content in 25+ languages including Bangla, Hindi, Spanish, and more.", color: "coral" },
    { icon: "Search", title: "SEO Mode", description: "Built-in SEO optimization with keyword suggestions and readability scoring.", color: "violet" },
    { icon: "FileText", title: "50+ Templates", description: "Blog posts, social media, ads, emails, product descriptions and more.", color: "cyan" },
    { icon: "Zap", title: "Lightning Fast", description: "Generate high-quality content in seconds, not hours. Real-time streaming.", color: "coral" },
    { icon: "Users", title: "Team Collaboration", description: "Share brand voices, templates, and documents across your entire team.", color: "violet" },
    { icon: "PenTool", title: "Brand Voice AI", description: "Train the AI to write in your unique style and tone for consistent messaging.", color: "cyan" },
  ],
};

const defaultSteps: StepsContent = {
  badge_text: "How It Works",
  headline_1: "Create Content in",
  headline_2: "3 Simple Steps",
  subheadline: "Go from idea to polished content in minutes, not hours.",
  items: [
    { number: "01", title: "Choose a Template", description: "Select from 50+ professionally crafted templates for any content type.", emoji: "📝" },
    { number: "02", title: "Customize & Generate", description: "Add your inputs, select your brand voice, and let AI create magic.", emoji: "✨" },
    { number: "03", title: "Edit & Export", description: "Polish your content in our rich editor and export to any format.", emoji: "🚀" },
  ],
};

const defaultCta: CtaContent = {
  headline_1: "Ready to Create",
  headline_2: "Amazing Content?",
  subheadline: "Join thousands of creators who are already using our AI to produce better content, faster.",
  cta_text: "Get Started for Free",
  cta_link: "/signup",
  trust_items: ["No credit card required", "Cancel anytime", "24/7 support"],
};

export default function AdminHomepage() {
  const { data: sections, isLoading } = useHomepageContent();
  const upsertSection = useUpsertHomepageSection();

  const [hero, setHero] = useState<HeroContent>(defaultHero);
  const [features, setFeatures] = useState<FeaturesContent>(defaultFeatures);
  const [steps, setSteps] = useState<StepsContent>(defaultSteps);
  const [cta, setCta] = useState<CtaContent>(defaultCta);
  const [activeTab, setActiveTab] = useState("hero");

  // Load existing content
  useEffect(() => {
    if (sections) {
      const heroSection = sections.find(s => s.section_key === "hero");
      const featuresSection = sections.find(s => s.section_key === "features");
      const stepsSection = sections.find(s => s.section_key === "steps");
      const ctaSection = sections.find(s => s.section_key === "cta");

      if (heroSection?.content) setHero({ ...defaultHero, ...heroSection.content });
      if (featuresSection?.content) setFeatures({ ...defaultFeatures, ...featuresSection.content });
      if (stepsSection?.content) setSteps({ ...defaultSteps, ...stepsSection.content });
      if (ctaSection?.content) setCta({ ...defaultCta, ...ctaSection.content });
    }
  }, [sections]);

  const handleSaveHero = async () => {
    await upsertSection.mutateAsync({ section_key: "hero", content: hero, sort_order: 1 });
  };

  const handleSaveFeatures = async () => {
    await upsertSection.mutateAsync({ section_key: "features", content: features, sort_order: 2 });
  };

  const handleSaveSteps = async () => {
    await upsertSection.mutateAsync({ section_key: "steps", content: steps, sort_order: 3 });
  };

  const handleSaveCta = async () => {
    await upsertSection.mutateAsync({ section_key: "cta", content: cta, sort_order: 4 });
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all([
        upsertSection.mutateAsync({ section_key: "hero", content: hero, sort_order: 1 }),
        upsertSection.mutateAsync({ section_key: "features", content: features, sort_order: 2 }),
        upsertSection.mutateAsync({ section_key: "steps", content: steps, sort_order: 3 }),
        upsertSection.mutateAsync({ section_key: "cta", content: cta, sort_order: 4 }),
      ]);
      toast({ title: "All sections saved successfully" });
    } catch (error) {
      // Individual errors handled by mutation
    }
  };

  const handleResetHero = () => setHero(defaultHero);
  const handleResetFeatures = () => setFeatures(defaultFeatures);
  const handleResetSteps = () => setSteps(defaultSteps);
  const handleResetCta = () => setCta(defaultCta);

  const addFeatureItem = () => {
    setFeatures({
      ...features,
      items: [...features.items, { icon: "Star", title: "New Feature", description: "Feature description", color: "coral" }],
    });
  };

  const removeFeatureItem = (index: number) => {
    setFeatures({
      ...features,
      items: features.items.filter((_, i) => i !== index),
    });
  };

  const updateFeatureItem = (index: number, field: keyof FeatureItem, value: string) => {
    const newItems = [...features.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFeatures({ ...features, items: newItems });
  };

  const addStepItem = () => {
    const nextNum = String(steps.items.length + 1).padStart(2, "0");
    setSteps({
      ...steps,
      items: [...steps.items, { number: nextNum, title: "New Step", description: "Step description", emoji: "⭐" }],
    });
  };

  const removeStepItem = (index: number) => {
    setSteps({
      ...steps,
      items: steps.items.filter((_, i) => i !== index),
    });
  };

  const updateStepItem = (index: number, field: keyof StepItem, value: string) => {
    const newItems = [...steps.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSteps({ ...steps, items: newItems });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homepage Editor</h1>
            <p className="text-muted-foreground">Edit your landing page content and sections</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button onClick={handleSaveAll} disabled={upsertSection.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">How It Works</span>
            </TabsTrigger>
            <TabsTrigger value="cta" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">CTA</span>
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>The main banner at the top of your homepage</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetHero}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveHero} disabled={upsertSection.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={hero.badge_text}
                      onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                      placeholder="e.g., Powered by GPT-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Social Proof Text</Label>
                    <Input
                      value={hero.social_proof_text}
                      onChange={(e) => setHero({ ...hero, social_proof_text: e.target.value })}
                      placeholder="e.g., Loved by 10,000+ users"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline Line 1</Label>
                    <Input
                      value={hero.headline_1}
                      onChange={(e) => setHero({ ...hero, headline_1: e.target.value })}
                      placeholder="Create Content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Line 2 (Gradient)</Label>
                    <Input
                      value={hero.headline_2}
                      onChange={(e) => setHero({ ...hero, headline_2: e.target.value })}
                      placeholder="10x Faster"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Textarea
                    value={hero.subheadline}
                    onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Primary CTA Text</Label>
                    <Input
                      value={hero.cta_primary_text}
                      onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary CTA Link</Label>
                    <Input
                      value={hero.cta_primary_link}
                      onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Secondary CTA Text</Label>
                    <Input
                      value={hero.cta_secondary_text}
                      onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary CTA Link</Label>
                    <Input
                      value={hero.cta_secondary_link}
                      onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Trust Text 1</Label>
                    <Input
                      value={hero.trust_text_1}
                      onChange={(e) => setHero({ ...hero, trust_text_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trust Text 2</Label>
                    <Input
                      value={hero.trust_text_2}
                      onChange={(e) => setHero({ ...hero, trust_text_2: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Features Section</CardTitle>
                  <CardDescription>Highlight your key features and capabilities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetFeatures}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveFeatures} disabled={upsertSection.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={features.badge_text}
                      onChange={(e) => setFeatures({ ...features, badge_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subheadline</Label>
                    <Input
                      value={features.subheadline}
                      onChange={(e) => setFeatures({ ...features, subheadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline Line 1</Label>
                    <Input
                      value={features.headline_1}
                      onChange={(e) => setFeatures({ ...features, headline_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Line 2 (Gradient)</Label>
                    <Input
                      value={features.headline_2}
                      onChange={(e) => setFeatures({ ...features, headline_2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Feature Items</Label>
                    <Button variant="outline" size="sm" onClick={addFeatureItem}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>

                  <Accordion type="multiple" className="space-y-2">
                    {features.items.map((item, index) => (
                      <AccordionItem key={index} value={`feature-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{item.icon}</Badge>
                            <span>{item.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Icon Name</Label>
                              <Input
                                value={item.icon}
                                onChange={(e) => updateFeatureItem(index, "icon", e.target.value)}
                                placeholder="e.g., Globe2, Zap, Users"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Color</Label>
                              <select
                                value={item.color}
                                onChange={(e) => updateFeatureItem(index, "color", e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="coral">Coral</option>
                                <option value="violet">Violet</option>
                                <option value="cyan">Cyan</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateFeatureItem(index, "title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateFeatureItem(index, "description", e.target.value)}
                              rows={2}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFeatureItem(index)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove Feature
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Steps Section */}
          <TabsContent value="steps" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>How It Works Section</CardTitle>
                  <CardDescription>Guide users through your process</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetSteps}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveSteps} disabled={upsertSection.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={steps.badge_text}
                      onChange={(e) => setSteps({ ...steps, badge_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subheadline</Label>
                    <Input
                      value={steps.subheadline}
                      onChange={(e) => setSteps({ ...steps, subheadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline Line 1</Label>
                    <Input
                      value={steps.headline_1}
                      onChange={(e) => setSteps({ ...steps, headline_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Line 2 (Gradient)</Label>
                    <Input
                      value={steps.headline_2}
                      onChange={(e) => setSteps({ ...steps, headline_2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Steps</Label>
                    <Button variant="outline" size="sm" onClick={addStepItem}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add Step
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {steps.items.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            {item.number}
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Number</Label>
                                <Input
                                  value={item.number}
                                  onChange={(e) => updateStepItem(index, "number", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={item.title}
                                  onChange={(e) => updateStepItem(index, "title", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Emoji</Label>
                                <Input
                                  value={item.emoji}
                                  onChange={(e) => updateStepItem(index, "emoji", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateStepItem(index, "description", e.target.value)}
                                rows={2}
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeStepItem(index)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA Section */}
          <TabsContent value="cta" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Final CTA Section</CardTitle>
                  <CardDescription>The call-to-action at the bottom of your homepage</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleResetCta}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveCta} disabled={upsertSection.isPending}>
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline Line 1</Label>
                    <Input
                      value={cta.headline_1}
                      onChange={(e) => setCta({ ...cta, headline_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Line 2 (Gradient)</Label>
                    <Input
                      value={cta.headline_2}
                      onChange={(e) => setCta({ ...cta, headline_2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Textarea
                    value={cta.subheadline}
                    onChange={(e) => setCta({ ...cta, subheadline: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={cta.cta_text}
                      onChange={(e) => setCta({ ...cta, cta_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Link</Label>
                    <Input
                      value={cta.cta_link}
                      onChange={(e) => setCta({ ...cta, cta_link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Trust Items (comma-separated)</Label>
                  <Input
                    value={cta.trust_items.join(", ")}
                    onChange={(e) => setCta({ ...cta, trust_items: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="No credit card required, Cancel anytime, 24/7 support"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
