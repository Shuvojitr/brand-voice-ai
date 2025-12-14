import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  History as HistoryIcon, 
  Trash2, 
  Loader2, 
  Plus,
  FileText 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { contentTemplates } from "@/lib/templates";
import { Link } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  template_type: string | null;
  word_count: number | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      
      // Get organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();
      
      if (!membership) {
        setIsLoading(false);
        return;
      }
      
      setOrganizationId(membership.organization_id);
      
      // Get total count
      const { count, error: countError } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id);
      
      if (countError) {
        console.error("Error counting documents:", countError);
      } else {
        setTotalCount(count || 0);
      }
      
      // Fetch paginated documents
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, template_type, word_count, created_at")
        .eq("organization_id", membership.organization_id)
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } else {
        setDocuments(data || []);
      }
      
      setIsLoading(false);
    };
    
    fetchDocuments();
  }, [currentPage, navigate, toast]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } else {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setTotalCount(prev => prev - 1);
      toast({
        title: "Deleted",
        description: "Document deleted successfully",
      });
    }
    
    setDeletingId(null);
  };

  const getTemplateName = (templateType: string | null) => {
    if (!templateType) return "Unknown";
    const template = contentTemplates.find(t => t.id === templateType);
    return template?.name || templateType;
  };

  const handleRowClick = (documentId: string) => {
    navigate(`/dashboard/document/${documentId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your content generation history
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
              <HistoryIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-sm">
                Your content generation history will appear here as you create content.
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
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Title</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead className="text-right">Words</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow 
                        key={doc.id} 
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell 
                          className="font-medium"
                          onClick={() => handleRowClick(doc.id)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[300px]">
                              {doc.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleRowClick(doc.id)}>
                          <Badge variant="secondary">
                            {getTemplateName(doc.template_type)}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={() => handleRowClick(doc.id)}>
                          {doc.created_at 
                            ? format(new Date(doc.created_at), "MMM d, yyyy")
                            : "Unknown"
                          }
                        </TableCell>
                        <TableCell 
                          className="text-right"
                          onClick={() => handleRowClick(doc.id)}
                        >
                          {doc.word_count?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={deletingId === doc.id}
                              >
                                {deletingId === doc.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.title}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(doc.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and adjacent pages
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <span key={page} className="flex items-center">
                            {showEllipsis && (
                              <PaginationItem>
                                <span className="px-3 text-muted-foreground">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </span>
                        );
                      })
                    }
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            {/* Results info */}
            <p className="text-center text-sm text-muted-foreground">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} documents
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
