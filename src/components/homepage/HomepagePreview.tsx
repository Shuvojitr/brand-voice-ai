import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Globe2,
  Search,
  FileText,
  Zap,
  Users,
  ArrowRight,
  PenTool,
  Wand2,
  Download,
  Check,
  Star,
  MousePointerClick,
  Palette,
  Globe,
  Shield
} from "lucide-react";
import { HeroContent, FeaturesContent, HowItWorksContent, CtaContent } from "@/hooks/useHomepageContent";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe2, Search, FileText, Zap, Users, PenTool, Sparkles, Wand2, Download, Palette, Globe, Shield, Star
};

const stepEmojis = ["📝", "✨", "🚀"];

interface HomepagePreviewProps {
  heroForm: HeroContent | null;
  featuresForm: FeaturesContent | null;
  howItWorksForm: HowItWorksContent | null;
  ctaForm: CtaContent | null;
  activeTab: string;
}

export function HomepagePreview({
  heroForm,
  featuresForm,
  howItWorksForm,
  ctaForm,
  activeTab
}: HomepagePreviewProps) {
  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden h-full">
      <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-destructive/60" />
        <div className="h-3 w-3 rounded-full bg-warning/60" />
        <div className="h-3 w-3 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground">Live Preview</span>
      </div>
      
      <div className="p-4 overflow-auto max-h-[600px] space-y-8">
        {/* Hero Preview */}
        {activeTab === "hero" && heroForm && (
          <div className="text-center py-8 px-4">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-2 h-3 w-3" />
              {heroForm.badge}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              {heroForm.title?.replace(heroForm.highlight || "", "").trim()}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {heroForm.highlight}
              </span>
            </h1>
            <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
              {heroForm.description}
            </p>
            <div className="flex justify-center gap-2">
              <Button size="sm">{heroForm.primaryCta}</Button>
              <Button size="sm" variant="outline">{heroForm.secondaryCta}</Button>
            </div>
          </div>
        )}

        {/* Features Preview */}
        {activeTab === "features" && featuresForm && (
          <div className="py-4">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-2">
                <Zap className="mr-1 h-3 w-3" />
                Features
              </Badge>
              <h2 className="text-2xl font-bold">
                {featuresForm.title}
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {featuresForm.highlight}
                </span>
              </h2>
              <p className="text-muted-foreground text-sm mt-2">{featuresForm.description}</p>
            </div>
            <div className="grid gap-3 grid-cols-2">
              {featuresForm.items.slice(0, 4).map((feature, index) => {
                const IconComponent = iconMap[feature.icon] || Sparkles;
                return (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-medium text-xs">{feature.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
            {featuresForm.items.length > 4 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                +{featuresForm.items.length - 4} more features
              </p>
            )}
          </div>
        )}

        {/* How It Works Preview */}
        {activeTab === "howitworks" && howItWorksForm && (
          <div className="py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{howItWorksForm.title}</h2>
              <p className="text-muted-foreground text-sm mt-2">{howItWorksForm.description}</p>
            </div>
            <div className="space-y-4">
              {howItWorksForm.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                    {stepEmojis[index] || "📌"}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Preview */}
        {activeTab === "cta" && ctaForm && (
          <div className="py-8 px-4 text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
            <h2 className="text-2xl font-bold mb-2">{ctaForm.title}</h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">{ctaForm.description}</p>
            <Button size="sm">
              {ctaForm.buttonText}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{ctaForm.subtext}</p>
          </div>
        )}

        {/* Use Cases placeholder */}
        {activeTab === "usecases" && (
          <div className="py-8 px-4 text-center text-muted-foreground">
            <p className="text-sm">Use cases section preview</p>
            <p className="text-xs mt-2">Edit the tabs and content in the form to see changes</p>
          </div>
        )}
      </div>
    </div>
  );
}
