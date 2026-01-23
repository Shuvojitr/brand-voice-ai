import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink } from "lucide-react";
import type { PageStats } from "@/hooks/useAdvancedAnalytics";

interface TopPagesTableProps {
  data?: PageStats[];
  isLoading: boolean;
  allPagesData?: PageStats[];
  allPagesLoading?: boolean;
}

export function TopPagesTable({ data, isLoading, allPagesData, allPagesLoading }: TopPagesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const renderTable = (pages: PageStats[] | undefined, loading: boolean, maxHeight?: string) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      );
    }

    if (!pages || pages.length === 0) {
      return (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          No page data available
        </div>
      );
    }

    const tableContent = (
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
          {pages.map((page, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium max-w-[200px] truncate" title={page.path}>
                {page.path}
              </TableCell>
              <TableCell className="text-right">{page.views}</TableCell>
              <TableCell className="text-right">{page.uniqueViews}</TableCell>
              <TableCell className="text-right">{formatDuration(page.avgTimeOnPage)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    if (maxHeight) {
      return <ScrollArea className={maxHeight}>{tableContent}</ScrollArea>;
    }

    return tableContent;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Top Pages
            </CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </div>
          {allPagesData && allPagesData.length > (data?.length || 0) && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    All Pages
                  </DialogTitle>
                  <DialogDescription>
                    Complete list of all visited pages ({allPagesData?.length || 0} pages)
                  </DialogDescription>
                </DialogHeader>
                {renderTable(allPagesData, allPagesLoading || false, "h-[60vh]")}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderTable(data, isLoading)}
      </CardContent>
    </Card>
  );
}
