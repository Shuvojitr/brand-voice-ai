import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (yearly: boolean) => void;
  discount?: number;
}

export function PricingToggle({ isYearly, onToggle, discount = 20 }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onToggle(false)}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          !isYearly
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle(true)}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
          isYearly
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          isYearly
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "bg-success/20 text-success"
        )}>
          Save {discount}%
        </span>
      </button>
    </div>
  );
}
