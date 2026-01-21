import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import type { UserCostAnalysis } from "@/hooks/useAdvancedAnalytics";

interface UserCostAnalysisTableProps {
  data?: UserCostAnalysis[];
  isLoading: boolean;
}

const getEfficiencyColor = (efficiency: string) => {
  switch (efficiency) {
    case "Excellent":
      return "bg-green-500/10 text-green-600";
    case "Good":
      return "bg-blue-500/10 text-blue-600";
    case "Average":
      return "bg-yellow-500/10 text-yellow-600";
    case "Low":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function UserCostAnalysisTable({ data, isLoading }: UserCostAnalysisTableProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Cost Per User Analysis
        </CardTitle>
        <CardDescription>Credit usage vs subscription value</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Credits Used</TableHead>
                  <TableHead className="text-right">Subscription</TableHead>
                  <TableHead className="text-right">Cost/Credit</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.creditsUsed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${user.subscriptionValue}/mo
                    </TableCell>
                    <TableCell className="text-right">
                      ${user.costPerCredit.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={getEfficiencyColor(user.efficiency)} variant="secondary">
                        {user.efficiency}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No user cost data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
