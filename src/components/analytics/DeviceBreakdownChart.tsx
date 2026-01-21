import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { DeviceStats } from "@/hooks/useAdvancedAnalytics";

interface DeviceBreakdownChartProps {
  data?: DeviceStats[];
  isLoading: boolean;
}

const COLORS = {
  Desktop: "hsl(var(--primary))",
  Mobile: "hsl(142, 76%, 36%)",
  Tablet: "hsl(45, 93%, 47%)",
  Unknown: "hsl(var(--muted-foreground))",
};

const ICONS = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

export function DeviceBreakdownChart({ data, isLoading }: DeviceBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-purple-500" />
          Device Breakdown
        </CardTitle>
        <CardDescription>Sessions by device type</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data && data.length > 0 ? (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="device"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} sessions (${data.find(d => d.count === value)?.percentage || 0}%)`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.device as keyof typeof COLORS] || COLORS.Unknown} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {data.map((item) => {
                const Icon = ICONS[item.device as keyof typeof ICONS] || Monitor;
                return (
                  <div key={item.device} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.device}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No device data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
