import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/layout/Footer";
import { PricingToggle } from "@/components/pricing";
import { UseCasesSection, TestimonialsSection, FAQSection, PopularTemplatesSection } from "@/components/landing";
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
  Loader2,
  Menu,
  Star,
  MousePointerClick
} from "lucide-react";
import { usePlans, Plan } from "@/hooks/usePlans";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const defaultPublicNavLinks = [
  { href: "/", label: "Home" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
];

const features = [
  {
    icon: Globe2,
    title: "Multi-language Support",
    description: "Generate content in 25+ languages including Bangla, Hindi, Spanish, and more.",
    color: "coral",
  },
  {
    icon: Search,
    title: "SEO Mode",
    description: "Built-in SEO optimization with keyword suggestions and readability scoring.",
    color: "violet",
  },
  {
    icon: FileText,
    title: "50+ Templates",
    description: "Blog posts, social media, ads, emails, product descriptions and more.",
    color: "cyan",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate high-quality content in seconds, not hours. Real-time streaming.",
    color: "coral",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share brand voices, templates, and documents across your entire team.",
    color: "violet",
  },
  {
    icon: PenTool,
    title: "Brand Voice AI",
    description: "Train the AI to write in your unique style and tone for consistent messaging.",
    color: "cyan",
  },
];

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Choose a Template",
    description: "Select from 50+ professionally crafted templates for any content type.",
    emoji: "📝",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Customize & Generate",
    description: "Add your inputs, select your brand voice, and let AI create magic.",
    emoji: "✨",
  },
  {
    number: "03",
    icon: Download,
    title: "Edit & Export",
    description: "Polish your content in our rich editor and export to any format.",
    emoji: "🚀",
  },
];

export default function Index() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings?.site_name || "";
  const publicNavLinks = settings?.header_nav?.length ? settings.header_nav : defaultPublicNavLinks;

  const handleMobileNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const maxDiscount = plans?.reduce((max, plan) => Math.max(max, plan.yearly_discount || 0), 0) || 20;

  const calculatePrice = (plan: Plan) => {
    if (plan.interval === "forever" || plan.price === 0) return plan.price;
    if (isYearly) {
      const yearlyPrice = plan.price * 12 * (1 - (plan.yearly_discount || 0) / 100);
      return Math.round(yearlyPrice / 12);
    }
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
      {/* Floating background shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="floating-shape floating-shape-1" />
        <div className="floating-shape floating-shape-2" />
        <div className="floating-shape floating-shape-3" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            {settingsLoading ? (
              <div className="h-10 w-24 animate-pulse bg-muted/20 rounded" />
            ) : settings?.header_logo_url ? (
              <img
                src={settings.header_logo_url}
                alt={siteName || "Logo"}
                className="h-10 w-auto max-w-[200px] object-contain"
                loading="eager"
              />
            ) : siteName ? (
              <span className="text-xl font-display font-bold tracking-tight">
                {siteName.toUpperCase().endsWith("AI") ? (
                  <>
                    {siteName.slice(0, -2)}
                    <span className="gradient-text">{siteName.slice(-2)}</span>
                  </>
                ) : (
                  siteName
                )}
              </span>
            ) : null}
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {publicNavLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-xl transition-all hover:text-foreground hover:bg-accent"
                onClick={(e) => {
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.getElementById(link.href.slice(1));
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" variant="gradient" asChild>
              <Link to="/signup">
                Start Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 pt-8">
                  <div className="flex flex-col gap-2">
                    {publicNavLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith('#')) e.preventDefault();
                          handleMobileNavClick(link.href);
                        }}
                        className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                    </Button>
                    <Button variant="gradient" asChild className="w-full">
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Start Free</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-36">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gradient" className="mb-6 animate-fade-in px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by GPT-4 & Claude
            </Badge>
            
            <h1 className="mb-6 font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl animate-slide-up">
              Create Content
              <br />
              <span className="gradient-text">10x Faster</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The AI-powered content generator that helps you write blog posts, 
              social media content, ads, and emails in seconds.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="xl" variant="glow" asChild className="group">
                <Link to="/signup">
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                className="group"
                onClick={() => {
                  const element = document.getElementById('pricing');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <MousePointerClick className="mr-2 h-5 w-5" />
                View Pricing
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                5,000 words free
              </span>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-20 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="mx-auto max-w-5xl">
              <div className="relative rounded-3xl border border-border/50 bg-card/80 p-3 shadow-dreamy backdrop-blur-sm hover-lift">
                {/* Gradient glow behind */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-coral/20 via-violet/20 to-cyan/20 blur-xl opacity-50" />
                
                <div className="relative rounded-2xl bg-muted/50 p-6 md:p-10">
                  {/* Window controls */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-3 w-3 rounded-full bg-coral/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                    <span className="ml-4 text-xs text-muted-foreground font-medium">{siteName} Editor</span>
                  </div>
                  
                  {/* Mock content */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-4">
                      <div className="h-10 w-3/4 rounded-xl bg-gradient-to-r from-coral/30 to-violet/30" />
                      <div className="h-4 w-full rounded-lg bg-muted-foreground/10" />
                      <div className="h-4 w-5/6 rounded-lg bg-muted-foreground/10" />
                      <div className="h-12 w-full rounded-xl gradient-primary opacity-80" />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="h-8 w-2/3 rounded-lg bg-foreground/15" />
                      <div className="h-4 w-full rounded-lg bg-muted-foreground/10" />
                      <div className="h-4 w-full rounded-lg bg-muted-foreground/10" />
                      <div className="h-4 w-4/5 rounded-lg bg-muted-foreground/10" />
                      <div className="h-4 w-full rounded-lg bg-muted-foreground/10" />
                      <div className="h-4 w-3/4 rounded-lg bg-muted-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-warning text-warning" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Loved by <span className="font-semibold text-foreground">10,000+</span> content creators
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Features
            </Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Everything You Need
              <br />
              <span className="gradient-text">To Create Magic</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed to help you write better content, faster.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className="group card-interactive border-border/50 bg-card/50 backdrop-blur hover:border-primary/50"
              >
                <CardHeader>
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                    feature.color === 'coral' ? 'bg-coral/10 text-coral group-hover:bg-coral group-hover:text-white' :
                    feature.color === 'violet' ? 'bg-violet/10 text-violet group-hover:bg-violet group-hover:text-white' :
                    'bg-cyan/10 text-cyan group-hover:bg-cyan group-hover:text-white'
                  }`}>
                    <feature.icon className="h-7 w-7" />
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

      {/* Templates Section */}
      <section id="templates" className="bg-muted/30 border-y border-border/50">
        <PopularTemplatesSection />
      </section>

      {/* How it Works */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Create Content in
              <br />
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Go from idea to polished content in minutes, not hours.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-coral via-violet to-cyan opacity-30 md:block" />
                )}
                
                {/* Icon container */}
                <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
                  {/* Background circle */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/10 via-violet/10 to-cyan/10 rotate-6 group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-2 rounded-2xl bg-card border border-border/50 shadow-soft" />
                  
                  {/* Emoji */}
                  <span className="relative text-5xl">{step.emoji}</span>
                  
                  {/* Step number */}
                  <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-glow">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="mb-3 font-display text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 bg-muted/30 border-y border-border/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Simple, Transparent
              <br />
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start free and scale as you grow. No hidden fees.
            </p>
            <PricingToggle isYearly={isYearly} onToggle={setIsYearly} discount={maxDiscount} />
            {isYearly && (
              <p className="mt-4 text-sm text-success font-medium">
                🎉 Billed annually. Save up to {maxDiscount}% compared to monthly!
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
              {plans?.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col card-interactive ${
                    plan.is_popular 
                      ? "border-primary shadow-glow scale-[1.02]" 
                      : "border-border/50"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="glow">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6 text-center">
                      {((isYearly && plan.yearly_discount > 0) || (!isYearly && plan.monthly_discount > 0)) && plan.price > 0 && (
                        <p className="text-sm text-muted-foreground line-through mb-1">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: plan.currency,
                            minimumFractionDigits: 0,
                          }).format(plan.price)}
                        </p>
                      )}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="font-display text-5xl font-bold">{formatPrice(plan)}</span>
                        <span className="text-muted-foreground">{formatInterval(plan.interval)}</span>
                      </div>
                      {isYearly && plan.yearly_discount > 0 && plan.price > 0 && (
                        <Badge variant="success" className="mt-2">
                          Save {plan.yearly_discount}%
                        </Badge>
                      )}
                      {!isYearly && plan.monthly_discount > 0 && plan.price > 0 && (
                        <Badge variant="success" className="mt-2">
                          Save {plan.monthly_discount}%
                        </Badge>
                      )}
                      {isYearly && plan.price > 0 && plan.interval !== "forever" && (
                        <p className="text-sm text-muted-foreground mt-2">
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
                        <li key={feature} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                            <Check className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={plan.is_popular ? "gradient" : "outline"}
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

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-6xl mb-6 block">🚀</span>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl mb-6">
              Ready to Create
              <br />
              <span className="gradient-text">Amazing Content?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Join thousands of content creators, marketers, and businesses 
              who trust {siteName} for their content needs.
            </p>
            <Button size="xl" variant="glow" asChild className="group">
              <Link to="/signup">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}