import { useState, useEffect } from "react";
import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Plus, Trash2, Sparkles, Layout, Zap, ListOrdered, MousePointerClick, Eye } from "lucide-react";
import { useHomepageContent, HeroContent, UseCasesContent, FeaturesContent, HowItWorksContent, CtaContent } from "@/hooks/useHomepageContent";
import { HomepagePreview } from "@/components/homepage";

export default function ManagerHomepage() {
  const { sections, isLoading, updateSection, hero, useCases, features, howItWorks, cta } = useHomepageContent();
  const [activeTab, setActiveTab] = useState("hero");

  // Local state for editing
  const [heroForm, setHeroForm] = useState<HeroContent | null>(null);
  const [useCasesForm, setUseCasesForm] = useState<UseCasesContent | null>(null);
  const [featuresForm, setFeaturesForm] = useState<FeaturesContent | null>(null);
  const [howItWorksForm, setHowItWorksForm] = useState<HowItWorksContent | null>(null);
  const [ctaForm, setCtaForm] = useState<CtaContent | null>(null);

  // Initialize forms when data loads
  useEffect(() => {
    if (hero) setHeroForm(hero);
    if (useCases) setUseCasesForm(useCases);
    if (features) setFeaturesForm(features);
    if (howItWorks) setHowItWorksForm(howItWorks);
    if (cta) setCtaForm(cta);
  }, [hero, useCases, features, howItWorks, cta]);

  const handleSaveHero = () => {
    if (heroForm) {
      updateSection.mutate({ sectionKey: "hero", content: heroForm });
    }
  };

  const handleSaveUseCases = () => {
    if (useCasesForm) {
      updateSection.mutate({ sectionKey: "use_cases", content: useCasesForm });
    }
  };

  const handleSaveFeatures = () => {
    if (featuresForm) {
      updateSection.mutate({ sectionKey: "features", content: featuresForm });
    }
  };

  const handleSaveHowItWorks = () => {
    if (howItWorksForm) {
      updateSection.mutate({ sectionKey: "how_it_works", content: howItWorksForm });
    }
  };

  const handleSaveCta = () => {
    if (ctaForm) {
      updateSection.mutate({ sectionKey: "cta", content: ctaForm });
    }
  };

  if (isLoading) {
    return (
      <ManagerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Content</h1>
          <p className="text-muted-foreground">Manage all sections of your landing page</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Editor Panel */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hero" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="usecases" className="gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Use Cases</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="howitworks" className="gap-2">
                <ListOrdered className="h-4 w-4" />
                <span className="hidden sm:inline">How It Works</span>
              </TabsTrigger>
              <TabsTrigger value="cta" className="gap-2">
                <MousePointerClick className="h-4 w-4" />
                <span className="hidden sm:inline">CTA</span>
              </TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>The main banner that visitors see first</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroForm && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="hero-badge">Badge Text</Label>
                          <Input
                            id="hero-badge"
                            value={heroForm.badge}
                            onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                            placeholder="e.g., AI-Powered Content Creation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hero-highlight">Highlight Text</Label>
                          <Input
                            id="hero-highlight"
                            value={heroForm.highlight}
                            onChange={(e) => setHeroForm({ ...heroForm, highlight: e.target.value })}
                            placeholder="e.g., Seconds"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-title">Title</Label>
                        <Input
                          id="hero-title"
                          value={heroForm.title}
                          onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                          placeholder="Main headline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hero-description">Description</Label>
                        <Textarea
                          id="hero-description"
                          value={heroForm.description}
                          onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                          placeholder="Supporting description text"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="hero-primary-cta">Primary Button Text</Label>
                          <Input
                            id="hero-primary-cta"
                            value={heroForm.primaryCta}
                            onChange={(e) => setHeroForm({ ...heroForm, primaryCta: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hero-secondary-cta">Secondary Button Text</Label>
                          <Input
                            id="hero-secondary-cta"
                            value={heroForm.secondaryCta}
                            onChange={(e) => setHeroForm({ ...heroForm, secondaryCta: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveHero} disabled={updateSection.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Hero Section
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Use Cases Section */}
            <TabsContent value="usecases">
              <Card>
                <CardHeader>
                  <CardTitle>Use Cases Section</CardTitle>
                  <CardDescription>Showcase different content types with typing animation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {useCasesForm && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={useCasesForm.title}
                            onChange={(e) => setUseCasesForm({ ...useCasesForm, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Description</Label>
                          <Input
                            value={useCasesForm.description}
                            onChange={(e) => setUseCasesForm({ ...useCasesForm, description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Use Cases</Label>
                        <Accordion type="single" collapsible className="space-y-2">
                          {useCasesForm.cases.map((useCase, index) => (
                            <AccordionItem key={useCase.id} value={useCase.id} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{index + 1}</Badge>
                                  <span>{useCase.label}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-4 pt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>Tab Label</Label>
                                    <Input
                                      value={useCase.label}
                                      onChange={(e) => {
                                        const newCases = [...useCasesForm.cases];
                                        newCases[index] = { ...newCases[index], label: e.target.value };
                                        setUseCasesForm({ ...useCasesForm, cases: newCases });
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Icon Name (Lucide)</Label>
                                    <Input
                                      value={useCase.icon}
                                      onChange={(e) => {
                                        const newCases = [...useCasesForm.cases];
                                        newCases[index] = { ...newCases[index], icon: e.target.value };
                                        setUseCasesForm({ ...useCasesForm, cases: newCases });
                                      }}
                                      placeholder="e.g., FileText, Mail, Share2"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    value={useCase.title}
                                    onChange={(e) => {
                                      const newCases = [...useCasesForm.cases];
                                      newCases[index] = { ...newCases[index], title: e.target.value };
                                      setUseCasesForm({ ...useCasesForm, cases: newCases });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Content (Markdown supported)</Label>
                                  <Textarea
                                    value={useCase.content}
                                    onChange={(e) => {
                                      const newCases = [...useCasesForm.cases];
                                      newCases[index] = { ...newCases[index], content: e.target.value };
                                      setUseCasesForm({ ...useCasesForm, cases: newCases });
                                    }}
                                    rows={6}
                                    className="font-mono text-sm"
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const newCases = useCasesForm.cases.filter((_, i) => i !== index);
                                    setUseCasesForm({ ...useCasesForm, cases: newCases });
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Use Case
                                </Button>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newCase = {
                              id: `case-${Date.now()}`,
                              label: "New Use Case",
                              icon: "FileText",
                              title: "New Title",
                              content: "Your content here...",
                            };
                            setUseCasesForm({ ...useCasesForm, cases: [...useCasesForm.cases, newCase] });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Use Case
                        </Button>
                      </div>

                      <Button onClick={handleSaveUseCases} disabled={updateSection.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Use Cases
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Section */}
            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Features Section</CardTitle>
                  <CardDescription>Highlight your platform's key features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuresForm && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={featuresForm.title}
                            onChange={(e) => setFeaturesForm({ ...featuresForm, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Highlight Text</Label>
                          <Input
                            value={featuresForm.highlight}
                            onChange={(e) => setFeaturesForm({ ...featuresForm, highlight: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={featuresForm.description}
                          onChange={(e) => setFeaturesForm({ ...featuresForm, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Features</Label>
                        <div className="grid gap-3">
                          {featuresForm.items.map((item, index) => (
                            <Card key={index} className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{index + 1}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newItems = featuresForm.items.filter((_, i) => i !== index);
                                    setFeaturesForm({ ...featuresForm, items: newItems });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <Input
                                  value={item.icon}
                                  onChange={(e) => {
                                    const newItems = [...featuresForm.items];
                                    newItems[index] = { ...newItems[index], icon: e.target.value };
                                    setFeaturesForm({ ...featuresForm, items: newItems });
                                  }}
                                  placeholder="Icon name (e.g., Sparkles)"
                                />
                                <Input
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...featuresForm.items];
                                    newItems[index] = { ...newItems[index], title: e.target.value };
                                    setFeaturesForm({ ...featuresForm, items: newItems });
                                  }}
                                  placeholder="Feature title"
                                />
                              </div>
                              <Textarea
                                value={item.description}
                                onChange={(e) => {
                                  const newItems = [...featuresForm.items];
                                  newItems[index] = { ...newItems[index], description: e.target.value };
                                  setFeaturesForm({ ...featuresForm, items: newItems });
                                }}
                                placeholder="Feature description"
                                rows={2}
                              />
                            </Card>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newItem = { icon: "Star", title: "New Feature", description: "Feature description" };
                            setFeaturesForm({ ...featuresForm, items: [...featuresForm.items, newItem] });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Feature
                        </Button>
                      </div>

                      <Button onClick={handleSaveFeatures} disabled={updateSection.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Features
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* How It Works Section */}
            <TabsContent value="howitworks">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works Section</CardTitle>
                  <CardDescription>Explain your process in simple steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {howItWorksForm && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={howItWorksForm.title}
                            onChange={(e) => setHowItWorksForm({ ...howItWorksForm, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={howItWorksForm.description}
                            onChange={(e) => setHowItWorksForm({ ...howItWorksForm, description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Steps</Label>
                        <div className="space-y-3">
                          {howItWorksForm.steps.map((step, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                                  {step.step}
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={step.step}
                                      onChange={(e) => {
                                        const newSteps = [...howItWorksForm.steps];
                                        newSteps[index] = { ...newSteps[index], step: e.target.value };
                                        setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                                      }}
                                      placeholder="Step number"
                                      className="w-20"
                                    />
                                    <Input
                                      value={step.title}
                                      onChange={(e) => {
                                        const newSteps = [...howItWorksForm.steps];
                                        newSteps[index] = { ...newSteps[index], title: e.target.value };
                                        setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                                      }}
                                      placeholder="Step title"
                                      className="flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newSteps = howItWorksForm.steps.filter((_, i) => i !== index);
                                        setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={step.description}
                                    onChange={(e) => {
                                      const newSteps = [...howItWorksForm.steps];
                                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                                      setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                                    }}
                                    placeholder="Step description"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newStep = {
                              step: String(howItWorksForm.steps.length + 1),
                              title: "New Step",
                              description: "Step description",
                            };
                            setHowItWorksForm({ ...howItWorksForm, steps: [...howItWorksForm.steps, newStep] });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Step
                        </Button>
                      </div>

                      <Button onClick={handleSaveHowItWorks} disabled={updateSection.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save How It Works
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CTA Section */}
            <TabsContent value="cta">
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action Section</CardTitle>
                  <CardDescription>The final section that encourages signups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ctaForm && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={ctaForm.title}
                          onChange={(e) => setCtaForm({ ...ctaForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={ctaForm.description}
                          onChange={(e) => setCtaForm({ ...ctaForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={ctaForm.buttonText}
                            onChange={(e) => setCtaForm({ ...ctaForm, buttonText: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtext (below button)</Label>
                          <Input
                            value={ctaForm.subtext}
                            onChange={(e) => setCtaForm({ ...ctaForm, subtext: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveCta} disabled={updateSection.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save CTA Section
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Live Preview Panel */}
          <div className="hidden lg:block sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            <HomepagePreview
              heroForm={heroForm}
              featuresForm={featuresForm}
              howItWorksForm={howItWorksForm}
              ctaForm={ctaForm}
              activeTab={activeTab}
            />
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
