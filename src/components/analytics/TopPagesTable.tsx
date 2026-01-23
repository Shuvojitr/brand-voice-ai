import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import type { PageStats } from "@/hooks/useAdvancedAnalytics";

interface TopPagesTableProps {
  data?: PageStats[];
  isLoading: boolean;
}

export function TopPagesTable({ data, isLoading }: TopPagesTableProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          Top Pages
        </CardTitle>
        <CardDescription>Most visited pages on your site</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Unique</TableHead>
                <TableHead className="text-right">Avg. Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {page.path}
                  </TableCell>
                  <TableCell className="text-right">{page.views}</TableCell>
                  <TableCell className="text-right">{page.uniqueViews}</TableCell>
                  <TableCell className="text-right">{formatDuration(page.avgTimeOnPage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No page data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
