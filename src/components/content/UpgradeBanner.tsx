import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, Crown, Rocket, Gift } from "lucide-react";

const STORAGE_KEY = "upgrade-banner-dismissed";

interface UpgradeBannerProps {
  canClaimFreePlan?: boolean;
  variant?: "default" | "expired";
  onDismiss?: () => void;
}

export function UpgradeBanner({ 
  canClaimFreePlan = false, 
  variant = "default",
  onDismiss 
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
    onDismiss?.();
  };

  const isExpired = variant === "expired";
  const Icon = canClaimFreePlan ? Gift : isExpired ? Rocket : Crown;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border-2 p-6 mb-6
      ${isExpired 
        ? "border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-orange-500/10" 
        : "border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10"
      }
    `}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-foreground/10 transition-colors z-10"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Icon */}
        <div className={`
          flex-shrink-0 p-4 rounded-2xl shadow-lg
          ${isExpired 
            ? "bg-gradient-to-br from-destructive to-orange-500" 
            : "bg-gradient-to-br from-primary to-accent"
          }
        `}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-1.5 pr-8 md:pr-0">
          <h3 className="text-xl font-bold text-foreground">
            {canClaimFreePlan 
              ? "🎉 Start Creating for Free!" 
              : isExpired 
                ? "Your Plan Has Expired" 
                : "Upgrade to Unlock More"
            }
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {canClaimFreePlan
              ? "Claim your free plan now and get 1,000 words/month. No credit card required!"
              : isExpired
                ? "Renew your subscription to continue creating amazing AI-powered content."
                : "Upgrade your plan to continue generating content and unlock premium features."
            }
          </p>
        </div>
        
        {/* CTA Button */}
        <Button 
          asChild 
          size="lg" 
          className={`
            shrink-0 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105
            ${isExpired 
              ? "bg-gradient-to-r from-destructive to-orange-500 hover:from-destructive/90 hover:to-orange-500/90" 
              : "gradient-primary"
            }
          `}
        >
          <Link to="/dashboard/billing">
            <Sparkles className="h-4 w-4 mr-2" />
            {canClaimFreePlan ? "Claim Free Plan" : isExpired ? "Renew Now" : "Upgrade Now"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}