import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

interface UpgradeBannerProps {
  canClaimFreePlan?: boolean;
}

export function UpgradeBanner({ canClaimFreePlan = false }: UpgradeBannerProps) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-full bg-primary/20">
          <AlertTriangle className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {canClaimFreePlan ? "Get Started with Free Credits" : "Upgrade Required"}
          </h3>
          <p className="text-muted-foreground">
            {canClaimFreePlan
              ? "Claim your free plan to start generating AI-powered content. No credit card required!"
              : "Your plan has expired or you don't have enough credits. Upgrade now to continue creating amazing content."
            }
          </p>
        </div>
        
        <Button asChild size="lg" className="gradient-primary text-white shrink-0">
          <Link to="/dashboard/billing">
            <Sparkles className="h-4 w-4 mr-2" />
            {canClaimFreePlan ? "Claim Free Plan" : "Upgrade Now"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
