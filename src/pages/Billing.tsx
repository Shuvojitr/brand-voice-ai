import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { usePlans } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Billing() {
  const { organization, isLoading: orgLoading, invalidate } = useOrganization();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const currentTier = organization?.subscription_tier || "free";
  const creditsUsed = organization?.credits_used || 0;
  const monthlyCredits = organization?.monthly_credits || 1000;
  const usagePercent = Math.min((creditsUsed / monthlyCredits) * 100, 100);

  const handleMockUpgrade = async (planSlug: string) => {
    if (planSlug === "free" || planSlug === currentTier) return;

    setUpgradingPlan(planSlug);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to upgrade",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("mock-subscribe", {
        body: { plan: planSlug },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Success!",
        description: `Dev Mode: Upgraded to ${plans?.find(p => p.slug === planSlug)?.name} successfully!`,
      });

      invalidate();
    } catch (error) {
      console.error("Upgrade error:", error);
      toast({
        title: "Error",
        description: "Failed to upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgradingPlan(null);
    }
  };

  const getPlanIndex = (tier: string) => plans?.findIndex(p => p.slug === tier) ?? -1;

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
    return interval === "forever" ? formatted : `${formatted}`;
  };

  const formatInterval = (interval: string) => {
    return interval === "forever" ? "forever" : `/${interval}`;
  };

  const isLoading = orgLoading || plansLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing
          </p>
        </div>

        {/* Dev Mode Banner */}
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                Development Mode: Stripe integration bypassed. Upgrades are simulated.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Usage
              <Badge variant="secondary" className="ml-2 capitalize">
                {currentTier}
              </Badge>
            </CardTitle>
            <CardDescription>Your usage this billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Words Used</span>
                  <span>{creditsUsed.toLocaleString()} / {monthlyCredits.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-500" 
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans?.map((plan) => {
              const isCurrent = plan.slug === currentTier;
              const isDowngrade = getPlanIndex(plan.slug) < getPlanIndex(currentTier);
              const isUpgrading = upgradingPlan === plan.slug;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.is_popular ? "border-primary shadow-lg" : ""}`}
                >
                  {plan.is_popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency, plan.interval)}</span>
                      <span className="text-muted-foreground">{formatInterval(plan.interval)}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${plan.is_popular && !isCurrent ? "bg-primary text-primary-foreground" : ""}`}
                      variant={isCurrent ? "outline" : plan.is_popular ? "default" : "outline"}
                      disabled={isCurrent || isDowngrade || isUpgrading}
                      onClick={() => handleMockUpgrade(plan.slug)}
                    >
                      {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCurrent 
                        ? "Current Plan" 
                        : isDowngrade 
                          ? "Downgrade" 
                          : `Upgrade (Dev Mode)`
                      }
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
