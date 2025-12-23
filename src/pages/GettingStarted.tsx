import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText, 
  Zap, 
  Palette, 
  Download,
  CheckCircle,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";

export default function GettingStarted() {
  const steps = [
    {
      number: 1,
      title: "Choose a Template",
      description: "Browse our library of 50+ AI-powered templates designed for various content types like blog posts, social media, emails, and more.",
      icon: FileText,
      action: { label: "Browse Templates", href: "/dashboard/templates" },
    },
    {
      number: 2,
      title: "Fill in Your Details",
      description: "Provide the necessary information like topic, tone, target audience, and any specific instructions for your content.",
      icon: Zap,
      action: null,
    },
    {
      number: 3,
      title: "Customize with Brand Voice",
      description: "Apply your brand voice to ensure all generated content matches your unique style and tone guidelines.",
      icon: Palette,
      action: { label: "Set Up Brand Voice", href: "/dashboard/brand-voices" },
    },
    {
      number: 4,
      title: "Generate & Export",
      description: "Click generate to create your content, then edit as needed and export in your preferred format (Markdown, HTML, or plain text).",
      icon: Download,
      action: null,
    },
  ];

  const tips = [
    "Be specific with your inputs - the more detail you provide, the better your results.",
    "Use the brand voice feature to maintain consistency across all your content.",
    "Save frequently used templates to your favorites for quick access.",
    "Review and edit generated content to add your personal touch.",
    "Use the history feature to track and revisit previous generations.",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/dashboard/support">
            <ArrowLeft className="h-4 w-4" />
            Back to Support
          </Link>
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Getting Started Guide</h1>
          <p className="text-muted-foreground text-lg">
            Learn how to create amazing content with MyGenAI in just a few minutes.
          </p>
        </div>

        {/* Quick Start Video (Placeholder) */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent aspect-video flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Play className="h-8 w-8 text-primary ml-1" />
              </div>
              <div>
                <p className="font-medium">Quick Start Tutorial</p>
                <p className="text-sm text-muted-foreground">Watch a 2-minute overview</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.number} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                      {step.action && (
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link to={step.action.href}>
                            {step.action.label}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
                {index < steps.length - 1 && (
                  <div className="absolute left-[39px] top-[76px] h-full w-0.5 bg-border" />
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Pro Tips
            </CardTitle>
            <CardDescription>
              Get the most out of MyGenAI with these helpful tips.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to create your first content?</h3>
            <p className="text-muted-foreground mb-4">
              Start with one of our popular templates and see the magic happen.
            </p>
            <Button asChild>
              <Link to="/dashboard/create">
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
