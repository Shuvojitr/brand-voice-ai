import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Search, Filter, Trash2, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Documents() {
  const navigate = useNavigate();
  const { documents, isLoading, deleteDocument, isDeleting, toggleFavorite } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Get unique template types for filter
  const templateTypes = useMemo(() => {
    const types = new Set(documents.map((doc) => doc.template_type).filter(Boolean));
    return Array.from(types) as string[];
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTemplate = templateFilter === "all" || doc.template_type === templateFilter;
      const matchesFavorite = !showFavoritesOnly || doc.is_favorite;
      return matchesSearch && matchesTemplate && matchesFavorite;
    });
  }, [documents, searchQuery, templateFilter, showFavoritesOnly]);

  const formatTemplateType = (type: string | null) => {
    if (!type) return "Unknown";
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your saved documents
            </p>
          </div>
          <Button className="gradient-primary text-white" asChild>
            <Link to="/dashboard/templates">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Link>
          </Button>
        </div>

        {documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-sm">
                Your generated content will appear here. Start by selecting a template.
              </p>
              <Button className="gradient-primary text-white" asChild>
                <Link to="/dashboard/templates">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {templateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatTemplateType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  title="Show favorites only"
                >
                  <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>

            {/* Documents Table */}
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground text-center">
                    Try adjusting your search or filter criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Words</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite({ id: doc.id, isFavorite: !doc.is_favorite });
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                doc.is_favorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell
                          className="font-medium"
                          onClick={() => navigate(`/dashboard/document/${doc.id}`)}
                        >
                          {doc.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatTemplateType(doc.template_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.word_count || 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.updated_at
                            ? format(new Date(doc.updated_at), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => navigate(`/dashboard/document/${doc.id}`)}
                              title="Open document"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{doc.title}". This action cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteDocument(doc.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
