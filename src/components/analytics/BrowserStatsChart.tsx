import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Chrome } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { BrowserStats } from "@/hooks/useAdvancedAnalytics";

interface BrowserStatsChartProps {
  data?: BrowserStats[];
  isLoading: boolean;
}

const COLORS = [
  "hsl(217, 91%, 60%)", // Chrome blue
  "hsl(16, 100%, 50%)", // Firefox orange
  "hsl(200, 80%, 50%)", // Safari blue
  "hsl(145, 63%, 42%)", // Edge green
  "hsl(var(--muted-foreground))",
];

export function BrowserStatsChart({ data, isLoading }: BrowserStatsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Chrome className="h-5 w-5 text-blue-500" />
          Browser Usage
        </CardTitle>
        <CardDescription>Sessions by browser type</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data && data.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="browser"
                  label={({ browser, percentage }) => `${browser} ${percentage}%`}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} sessions`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No browser data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
