import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/Footer";
import { PricingToggle } from "@/components/pricing";
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
  Loader2
} from "lucide-react";
import { usePlans, Plan } from "@/hooks/usePlans";

const features = [
  {
    icon: Globe2,
    title: "Multi-language Support",
    description: "Generate content in 25+ languages including Bangla, Hindi, Spanish, and more.",
  },
  {
    icon: Search,
    title: "SEO Mode",
    description: "Built-in SEO optimization with keyword suggestions and readability scoring.",
  },
  {
    icon: FileText,
    title: "50+ Templates",
    description: "Blog posts, social media, ads, emails, product descriptions and more.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate high-quality content in seconds, not hours. Real-time streaming.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share brand voices, templates, and documents across your entire team.",
  },
  {
    icon: PenTool,
    title: "Brand Voice AI",
    description: "Train the AI to write in your unique style and tone for consistent messaging.",
  },
];

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Choose a Template",
    description: "Select from 50+ professionally crafted templates for any content type.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Customize & Generate",
    description: "Add your inputs, select your brand voice, and let AI create magic.",
  },
  {
    number: "03",
    icon: Download,
    title: "Edit & Export",
    description: "Polish your content in our rich editor and export to any format.",
  },
];

export default function Index() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const [isYearly, setIsYearly] = useState(false);

  const maxDiscount = plans?.reduce((max, plan) => Math.max(max, plan.yearly_discount || 0), 0) || 20;

  const calculatePrice = (plan: Plan) => {
    if (plan.interval === "forever" || plan.price === 0) return plan.price;
    if (isYearly) {
      const yearlyPrice = plan.price * 12 * (1 - (plan.yearly_discount || 0) / 100);
      return Math.round(yearlyPrice / 12);
    }
    // Apply monthly discount
    return Math.round(plan.price * (1 - (plan.monthly_discount || 0) / 100));
  };

  const formatPrice = (plan: Plan) => {
    const displayPrice = calculatePrice(plan);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.currency,
      minimumFractionDigits: 0,
    }).format(displayPrice);
    return plan.interval === "forever" ? formatted : `${formatted}`;
  };

  const formatInterval = (interval: string) => {
    if (interval === "forever") return "forever";
    return isYearly ? "/mo" : "/month";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              MyGen<span className="gradient-text">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Templates
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" className="gradient-primary text-white" asChild>
              <Link to="/signup">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Sparkles className="mr-1 h-3 w-3" />
              Powered by GPT-4 & Claude
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl animate-slide-up">
              Create Amazing Content{" "}
              <span className="gradient-text">10x Faster</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The AI-powered content generator that helps you write blog posts, social media content, 
              ads, and emails in seconds. Train it with your brand voice for consistent messaging.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="gradient-primary text-white shadow-glow h-12 px-8 text-base" asChild>
                <Link to="/signup">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="#pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              No credit card required • 5,000 words free
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
                <div className="relative rounded-lg bg-muted/50 p-4 md:p-8">
                  {/* Mock Editor UI */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-destructive/50" />
                    <div className="h-3 w-3 rounded-full bg-warning/50" />
                    <div className="h-3 w-3 rounded-full bg-success/50" />
                    <span className="ml-4 text-xs text-muted-foreground">MyGenAI Editor</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-3">
                      <div className="h-8 w-3/4 rounded bg-primary/20" />
                      <div className="h-4 w-full rounded bg-muted-foreground/10" />
                      <div className="h-4 w-5/6 rounded bg-muted-foreground/10" />
                      <div className="h-10 w-full rounded-lg bg-primary/30" />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <div className="h-6 w-2/3 rounded bg-foreground/20" />
                      <div className="h-4 w-full rounded bg-muted-foreground/10" />
                      <div className="h-4 w-full rounded bg-muted-foreground/10" />
                      <div className="h-4 w-4/5 rounded bg-muted-foreground/10" />
                      <div className="h-4 w-full rounded bg-muted-foreground/10" />
                      <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Everything You Need to Create{" "}
              <span className="gradient-text">Exceptional Content</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed to help you write better content, faster.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Create Content in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Go from idea to polished content in minutes, not hours.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start free and scale as you grow. No hidden fees.
            </p>
            <PricingToggle isYearly={isYearly} onToggle={setIsYearly} discount={maxDiscount} />
            {isYearly && (
              <p className="mt-3 text-sm text-success">
                Billed annually. Save up to {maxDiscount}% compared to monthly!
              </p>
            )}
          </div>
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className={`mx-auto grid max-w-5xl gap-6 ${
              plans && plans.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
            }`}>
              {plans?.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col ${
                    plan.is_popular 
                      ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                      : "border-border/50"
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-white border-0">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6 text-center">
                      {isYearly && plan.yearly_discount > 0 && plan.price > 0 && (
                        <p className="text-sm text-muted-foreground line-through mb-1">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: plan.currency,
                            minimumFractionDigits: 0,
                          }).format(plan.price)}
                        </p>
                      )}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">{formatPrice(plan)}</span>
                        <span className="text-muted-foreground">{formatInterval(plan.interval)}</span>
                        {isYearly && plan.yearly_discount > 0 && plan.price > 0 && (
                          <Badge variant="secondary" className="text-success ml-1">
                            -{plan.yearly_discount}%
                          </Badge>
                        )}
                        {!isYearly && plan.monthly_discount > 0 && plan.price > 0 && (
                          <Badge variant="secondary" className="text-success ml-1">
                            -{plan.monthly_discount}%
                          </Badge>
                        )}
                      </div>
                      {isYearly && plan.price > 0 && plan.interval !== "forever" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: plan.currency,
                            minimumFractionDigits: 0,
                          }).format(calculatePrice(plan) * 12)}/year total
                        </p>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${plan.is_popular ? "gradient-primary text-white" : ""}`}
                      variant={plan.is_popular ? "default" : "outline"}
                      asChild
                    >
                      <Link to="/signup">{plan.cta_text || "Get Started"}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Ready to Create{" "}
              <span className="gradient-text">Amazing Content?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of content creators, marketers, and businesses 
              who trust MyGenAI for their content needs.
            </p>
            <Button size="lg" className="gradient-primary text-white shadow-glow h-12 px-8 text-base" asChild>
              <Link to="/signup">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
