import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText, 
  Zap, 
  Palette, 
  Download,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Target,
  Clock,
  Star,
  BookOpen,
  Wand2,
  MousePointerClick,
  Rocket
} from "lucide-react";
import { Link } from "react-router-dom";

export default function GettingStarted() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Template",
      description: "Select from our curated collection of 50+ AI-powered templates. Each template is optimized for specific content types—from engaging blog posts and viral social media content to professional emails and compelling ad copy.",
      icon: FileText,
      color: "from-coral/20 to-coral/5",
      iconBg: "bg-coral/10 text-coral",
      action: { label: "Explore Templates", href: "/dashboard/templates" },
      tip: "Pro tip: Start with Blog Posts or Social Media for quick wins",
    },
    {
      number: 2,
      title: "Provide Your Context",
      description: "Fill in the smart form with your topic, target audience, desired tone, and any specific requirements. The more context you provide, the more tailored and relevant your generated content will be.",
      icon: Target,
      color: "from-violet/20 to-violet/5",
      iconBg: "bg-violet/10 text-violet",
      action: null,
      tip: "Include keywords, competitor examples, or reference materials",
    },
    {
      number: 3,
      title: "Apply Your Brand Voice",
      description: "Make every piece of content unmistakably yours. Set up your brand voice profile with tone preferences, vocabulary guidelines, and style rules that the AI will follow consistently.",
      icon: Palette,
      color: "from-cyan/20 to-cyan/5",
      iconBg: "bg-cyan/10 text-cyan",
      action: { label: "Create Brand Voice", href: "/dashboard/brand-voices" },
      tip: "Upload sample content to train the AI on your unique style",
    },
    {
      number: 4,
      title: "Generate & Refine",
      description: "Click generate and watch the magic happen. Review the AI-crafted content, make edits in our powerful editor, and export in your preferred format—Markdown, HTML, or clean plain text.",
      icon: Wand2,
      color: "from-lime/20 to-lime/5",
      iconBg: "bg-lime/10 text-lime",
      action: { label: "Start Creating", href: "/dashboard/create" },
      tip: "Use the regenerate feature to explore different angles",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Save Hours Daily",
      description: "Generate content in seconds that would take hours to write manually.",
    },
    {
      icon: Star,
      title: "Consistent Quality",
      description: "Every output maintains your brand standards and voice guidelines.",
    },
    {
      icon: Rocket,
      title: "Scale Effortlessly",
      description: "Produce more content without increasing your team or budget.",
    },
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: "Be Specific",
      description: "Include details like word count, target keywords, and audience demographics for better results.",
    },
    {
      icon: Sparkles,
      title: "Iterate & Improve",
      description: "Don't settle for the first output. Use regenerate to explore variations and find the perfect version.",
    },
    {
      icon: BookOpen,
      title: "Learn from History",
      description: "Review your past generations to understand what prompts work best for your needs.",
    },
    {
      icon: MousePointerClick,
      title: "Use Quick Actions",
      description: "Save favorite templates and use keyboard shortcuts to speed up your workflow.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-5xl mx-auto pb-12">
        {/* Back Link */}
        <Button asChild variant="ghost" size="sm" className="gap-2 -mb-4">
          <Link to="/dashboard/support">
            <ArrowLeft className="h-4 w-4" />
            Back to Support
          </Link>
        </Button>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-violet/10 to-cyan/10 p-8 md:p-12">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="relative z-10 max-w-2xl">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="h-3 w-3" />
              Quick Start Guide
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Create Amazing Content in{" "}
              <span className="gradient-text">Minutes</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Master our AI content platform with this comprehensive guide. 
              From choosing templates to exporting polished content—we'll walk you through every step.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-primary/20 to-violet/20 rounded-full blur-3xl" />
        </div>

        {/* Why Use Section */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-lift border-border/50 bg-card/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">Four simple steps to content creation</p>
            </div>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] top-[60px] bottom-[60px] w-0.5 bg-gradient-to-b from-coral via-violet to-lime hidden md:block" />
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card 
                  key={step.number} 
                  className="overflow-hidden hover-lift border-border/50 transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Step Number & Icon */}
                      <div className={`md:w-16 flex md:flex-col items-center justify-center p-4 md:py-6 bg-gradient-to-br ${step.color}`}>
                        <div className="h-12 w-12 rounded-full bg-background shadow-lg flex items-center justify-center font-bold text-xl border-2 border-border">
                          {step.number}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className={`h-8 w-8 rounded-lg ${step.iconBg} flex items-center justify-center`}>
                            <step.icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-bold text-lg">{step.title}</h3>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {step.description}
                        </p>
                        
                        {step.tip && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm mb-4">
                            <Lightbulb className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{step.tip}</span>
                          </div>
                        )}
                        
                        {step.action && (
                          <Button asChild variant="outline" size="sm" className="group">
                            <Link to={step.action.href}>
                              {step.action.label}
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Tips Grid */}
        <Card className="overflow-hidden border-border/50">
          <CardHeader className="bg-gradient-to-r from-warning/10 to-transparent border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle>Pro Tips for Better Results</CardTitle>
                <CardDescription>
                  Level up your content game with these expert recommendations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-background shadow-sm flex items-center justify-center flex-shrink-0">
                    <tip.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="gradient-primary p-8 md:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to Create Your First Masterpiece?
              </h3>
              <p className="text-white/80 max-w-md mx-auto mb-6">
                Jump right in and experience the power of AI-driven content creation. 
                Your first amazing piece is just minutes away.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="shadow-lg">
                  <Link to="/dashboard/create">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating Now
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link to="/dashboard/templates">
                    Browse Templates
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/brand-voices" 
            className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Palette className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Set Up Brand Voice</span>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
          </Link>
          <Link 
            to="/docs" 
            className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">View Full Documentation</span>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
          </Link>
          <Link 
            to="/dashboard/support" 
            className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <CheckCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium">Get Support</span>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
