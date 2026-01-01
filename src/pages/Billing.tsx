import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingToggle } from "@/components/pricing";
import { Check, CreditCard, Loader2, Sparkles, AlertTriangle, Clock, CalendarX } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { usePlans, Plan } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Billing() {
  const { organization, isLoading: orgLoading, invalidate, subscriptionStatus } = useOrganization();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const currentTier = organization?.subscription_tier || "free";
  const remainingCredits = organization?.remaining_credits || 0;
  const monthlyCredits = organization?.monthly_credits || 1000;
  const creditsUsed = organization?.credits_used || 0;
  const wordsGenerated = Math.round(creditsUsed / 1.33);
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

  const maxDiscount = plans?.reduce((max, plan) => Math.max(max, plan.yearly_discount || 0), 0) || 20;

  const calculatePrice = (plan: Plan) => {
    if (plan.interval === "forever" || plan.price === 0) return plan.price;
    if (isYearly) {
      const yearlyPrice = plan.price * 12 * (1 - (plan.yearly_discount || 0) / 100);
      return Math.round(yearlyPrice / 12);
    }
    return plan.price;
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

  const getStatusBadge = () => {
    if (subscriptionStatus.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (subscriptionStatus.isExpiringSoon) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Expiring Soon</Badge>;
    }
    if (organization?.subscription_status === "active") {
      return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
    }
    return <Badge variant="secondary" className="capitalize">{currentTier}</Badge>;
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

        {/* Expiration Warning */}
        {subscriptionStatus.isExpired && (
          <Alert variant="destructive">
            <CalendarX className="h-4 w-4" />
            <AlertTitle>Plan Expired</AlertTitle>
            <AlertDescription>
              Your subscription has expired. Please renew to continue using all features.
              {subscriptionStatus.expiryDate && (
                <span className="block mt-1 text-sm">
                  Expired on {format(subscriptionStatus.expiryDate, "MMMM d, yyyy")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {subscriptionStatus.isExpiringSoon && !subscriptionStatus.isExpired && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700 dark:text-amber-400">Plan Expiring Soon</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-300">
              Your subscription will expire in {subscriptionStatus.daysUntilExpiry} day{subscriptionStatus.daysUntilExpiry !== 1 ? "s" : ""}.
              {subscriptionStatus.expiryDate && (
                <span className="block mt-1 text-sm">
                  Expires on {format(subscriptionStatus.expiryDate, "MMMM d, yyyy")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

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
              <div className="ml-2 flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </CardTitle>
            <CardDescription>
              Your usage this billing period
              {subscriptionStatus.expiryDate && !subscriptionStatus.isExpired && (
                <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Renews {format(subscriptionStatus.expiryDate, "MMM d, yyyy")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Words Generated</span>
                  <span>{wordsGenerated.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      subscriptionStatus.isExpired 
                        ? "bg-destructive" 
                        : subscriptionStatus.isExpiringSoon 
                          ? "bg-amber-500" 
                          : "bg-primary"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{currentTier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{organization?.subscription_status || "None"}</p>
                </div>
                {subscriptionStatus.expiryDate && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionStatus.isExpired ? "Expired On" : "Renews On"}
                      </p>
                      <p className="font-medium">{format(subscriptionStatus.expiryDate, "MMM d, yyyy")}</p>
                    </div>
                    {!subscriptionStatus.isExpired && (
                      <div>
                        <p className="text-sm text-muted-foreground">Days Remaining</p>
                        <p className={`font-medium ${subscriptionStatus.isExpiringSoon ? "text-amber-600" : ""}`}>
                          {subscriptionStatus.daysUntilExpiry} days
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold">Available Plans</h2>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <PricingToggle isYearly={isYearly} onToggle={setIsYearly} discount={maxDiscount} />
              {isYearly && (
                <p className="text-xs text-success">Save up to {maxDiscount}% with annual billing</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans?.map((plan) => {
              const isCurrent = plan.slug === currentTier;
              const isDowngrade = getPlanIndex(plan.slug) < getPlanIndex(currentTier);
              const isUpgrading = upgradingPlan === plan.slug;
              const canRenew = isCurrent && (subscriptionStatus.isExpired || subscriptionStatus.isExpiringSoon);

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
                      <span className="text-3xl font-bold">{formatPrice(plan)}</span>
                      <span className="text-muted-foreground">{formatInterval(plan.interval)}</span>
                      {isYearly && plan.yearly_discount > 0 && plan.price > 0 && (
                        <Badge variant="secondary" className="ml-2 text-success text-xs">
                          -{plan.yearly_discount}%
                        </Badge>
                      )}
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
                      variant={isCurrent && !canRenew ? "outline" : plan.is_popular ? "default" : "outline"}
                      disabled={(isCurrent && !canRenew) || (isDowngrade && !subscriptionStatus.isExpired) || isUpgrading}
                      onClick={() => handleMockUpgrade(plan.slug)}
                    >
                      {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCurrent && !canRenew
                        ? "Current Plan" 
                        : canRenew
                          ? "Renew Plan"
                          : isDowngrade && !subscriptionStatus.isExpired
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
