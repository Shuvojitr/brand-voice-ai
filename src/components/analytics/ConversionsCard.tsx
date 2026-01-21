import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, ArrowUpRight } from "lucide-react";
import type { ConversionData } from "@/hooks/useAdvancedAnalytics";

interface ConversionsCardProps {
  data?: ConversionData[];
  isLoading: boolean;
}

export function ConversionsCard({ data, isLoading }: ConversionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          Conversions
        </CardTitle>
        <CardDescription>Goals achieved and conversion rates</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((conversion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{conversion.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {conversion.count} conversions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="font-bold">{conversion.rate}%</span>
                  </div>
                  {conversion.value > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${conversion.value.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Target className="h-8 w-8 mb-2 opacity-50" />
            <p>No conversions tracked yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
