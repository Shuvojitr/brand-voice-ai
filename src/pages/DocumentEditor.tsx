import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { AdvancedEditor } from "@/components/editor/AdvancedEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export default function DocumentEditor() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [document, setDocument] = useState<{
    id: string;
    title: string;
    content_html: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentAndAuth = async () => {
      setIsLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      
      setUser(session.user);
      
      // Get organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();
      
      if (membership) {
        setOrganizationId(membership.organization_id);
      }
      
      // Fetch document
      if (documentId) {
        const { data, error } = await supabase
          .from("documents")
          .select("id, title, content_html")
          .eq("id", documentId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching document:", error);
          toast({
            title: "Error",
            description: "Failed to load document",
            variant: "destructive",
          });
          navigate("/dashboard/history");
          return;
        }
        
        if (!data) {
          toast({
            title: "Not Found",
            description: "Document not found",
            variant: "destructive",
          });
          navigate("/dashboard/history");
          return;
        }
        
        setDocument(data);
      }
      
      setIsLoading(false);
    };
    
    fetchDocumentAndAuth();
  }, [documentId, navigate, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!document || !organizationId || !user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <Button onClick={() => navigate("/dashboard/history")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/history")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Edit Document</h1>
        </div>

        {/* Editor */}
        <AdvancedEditor
          documentId={document.id}
          organizationId={organizationId}
          userId={user.id}
          initialContent={document.content_html || ""}
          initialTitle={document.title}
          className="min-h-[calc(100vh-200px)]"
        />
      </div>
    </DashboardLayout>
  );
}
