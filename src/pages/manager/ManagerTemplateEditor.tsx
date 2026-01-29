import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2, Pencil, Eye, Layout, Folder, Loader2 } from "lucide-react";
import * as LucideIconsAll from "lucide-react";

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  icon: string;
  slug: string;
  system_prompt: string;
  form_schema_json: string;
  is_active: boolean;
}

const emptyFormData: TemplateFormData = {
  name: "",
  description: "",
  category: "blog",
  icon: "FileText",
  slug: "",
  system_prompt: "",
  form_schema_json: "[]",
  is_active: true,
};

// Sample values for prompt preview
const getSampleValue = (field: { id: string; type: string; label: string; options?: { value: string; label: string }[] }): string => {
  const id = field.id.toLowerCase();
  const type = field.type;
  
  if (type === "select" && field.options?.length) {
    return field.options[0].value;
  }
  
  if (id.includes("topic") || id.includes("subject")) return "Artificial Intelligence in Healthcare";
  if (id.includes("keyword")) return "AI, machine learning, healthcare, diagnosis";
  if (id.includes("title")) return "The Future of AI in Medicine";
  if (id.includes("tone") || id.includes("style")) return "Professional and informative";
  if (id.includes("audience") || id.includes("target")) return "Healthcare professionals and tech enthusiasts";
  if (id.includes("length") || id.includes("word")) return "1500";
  if (id.includes("product") || id.includes("name")) return "SmartHealth Pro";
  if (id.includes("description") || id.includes("about")) return "A cutting-edge AI-powered health monitoring system";
  if (id.includes("brand")) return "TechMed Solutions";
  if (id.includes("url") || id.includes("link")) return "https://example.com";
  if (id.includes("platform")) return "LinkedIn";
  if (id.includes("language")) return "English";
  if (id.includes("industry")) return "Technology";
  if (id.includes("feature")) return "Real-time health analytics, personalized recommendations";
  if (id.includes("benefit")) return "Improved patient outcomes, reduced costs";
  if (id.includes("cta") || id.includes("action")) return "Learn More";
  
  if (type === "number") return "500";
  if (type === "toggle") return "true";
  if (type === "textarea") return "This is a sample longer text that would be entered in a textarea field. It provides context and details for the AI to work with.";
  
  return `Sample ${field.label}`;
};

export default function ManagerTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditMode = !!templateId;
  
  const [formData, setFormData] = useState<TemplateFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "template">("edit");

  // Fetch template data for edit mode
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch icons
  const { data: dbIcons = [] } = useQuery({
    queryKey: ["template-icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_icons")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Populate form when template is loaded
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        category: template.category,
        icon: template.icon || "FileText",
        slug: template.slug,
        system_prompt: template.system_prompt,
        form_schema_json: JSON.stringify(template.form_schema_json || [], null, 2),
        is_active: template.is_active ?? true,
      });
    } else if (!isEditMode && categories.length > 0) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]?.value || "blog",
        icon: dbIcons[0]?.name || "FileText",
      }));
    }
  }, [template, categories, dbIcons, isEditMode]);

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIconsAll as any)[iconName];
    return IconComponent || Folder;
  };

  // Generate prompt preview
  const promptPreview = useMemo(() => {
    try {
      const fields = JSON.parse(formData.form_schema_json || "[]");
      
      const userPromptParts: string[] = [];
      for (const field of fields) {
        const sampleValue = getSampleValue(field);
        userPromptParts.push(`${field.id}: ${sampleValue}`);
      }
      
      const languageInstruction = "\n\nWrite your response in clear, fluent English.";
      const userPrompt = userPromptParts.join("\n") + languageInstruction;
      
      return {
        systemPrompt: formData.system_prompt || "(No system prompt defined)",
        userPrompt: userPrompt || "(No input fields defined)",
        fields,
        isValid: true,
      };
    } catch {
      return {
        systemPrompt: formData.system_prompt || "(No system prompt defined)",
        userPrompt: "(Invalid form schema JSON)",
        fields: [],
        isValid: false,
      };
    }
  }, [formData.form_schema_json, formData.system_prompt]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.system_prompt) {
      toast({
        title: "Missing Fields",
        description: "Name, slug, and system prompt are required.",
        variant: "destructive",
      });
      return;
    }

    let parsedSchema;
    try {
      parsedSchema = JSON.parse(formData.form_schema_json);
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Form schema must be valid JSON.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const templateData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        icon: formData.icon,
        slug: formData.slug,
        system_prompt: formData.system_prompt,
        form_schema_json: parsedSchema,
        is_active: formData.is_active,
      };

      if (isEditMode && templateId) {
        const { error } = await supabase
          .from("templates")
          .update(templateData)
          .eq("id", templateId);
        if (error) throw error;
        toast({ title: "Template Updated" });
      } else {
        const { error } = await supabase
          .from("templates")
          .insert(templateData);
        if (error) throw error;
        toast({ title: "Template Created" });
      }

      queryClient.invalidateQueries({ queryKey: ["templates"] });
      navigate("/manager/templates");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", templateId);
      if (error) throw error;
      toast({ title: "Template Deleted" });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      navigate("/manager/templates");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteOpen(false);
    }
  };

  if (isEditMode && templateLoading) {
    return (
      <ManagerLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/manager/templates")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? "Edit Template" : "Create Template"}
              </h1>
              {isEditMode && template && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Editing: {template.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "template")}>
          <TabsList>
            <TabsTrigger value="edit">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="template">
              <Layout className="h-4 w-4 mr-2" />
              Template Form
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview Prompt
            </TabsTrigger>
          </TabsList>

          {/* Edit Tab */}
          <TabsContent value="edit" className="mt-6">
            <div className="max-w-3xl space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Blog Post"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="blog-post"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.is_active).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(v) => setFormData({ ...formData, icon: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dbIcons.filter(i => i.is_active).map((icon) => {
                      const IconComp = getIconComponent(icon.name);
                      return (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <IconComp className="h-4 w-4" />
                            {icon.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Generate a complete blog post..."
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="system_prompt">System Prompt *</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="You are an expert content writer..."
                  rows={6}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="form_schema">Form Schema (JSON)</Label>
                <Textarea
                  id="form_schema"
                  value={formData.form_schema_json}
                  onChange={(e) => setFormData({ ...formData, form_schema_json: e.target.value })}
                  placeholder='[{"id": "topic", "type": "text", "label": "Topic", "required": true}]'
                  rows={10}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define input fields as JSON array. Each field needs: id, type, label. The field <code className="bg-muted px-1 rounded">id</code> becomes the key in the user prompt.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </TabsContent>

          {/* Template Form Preview Tab */}
          <TabsContent value="template" className="mt-6">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm text-muted-foreground">
                This preview shows how the template form will appear to users when they create content.
              </p>
              
              <div className="border rounded-lg bg-background p-6">
                {!promptPreview.isValid ? (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    ⚠️ Form schema JSON is invalid. Fix the JSON to see the template preview.
                  </div>
                ) : promptPreview.fields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No form fields defined. Add fields to the Form Schema JSON.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Template Header Preview */}
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        {formData.icon && (() => {
                          const IconComp = getIconComponent(formData.icon);
                          return <IconComp className="h-6 w-6 text-primary" />;
                        })()}
                        <h3 className="text-xl font-semibold">{formData.name || "Template Name"}</h3>
                      </div>
                      {formData.description && (
                        <p className="text-muted-foreground text-sm">{formData.description}</p>
                      )}
                    </div>
                    
                    {/* Form Fields Preview */}
                    <div className="space-y-4">
                      {promptPreview.fields.map((field: any) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-destructive">*</span>}
                          </Label>
                          
                          {field.type === "text" && (
                            <Input 
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              disabled
                              className="bg-muted/30"
                            />
                          )}
                          
                          {field.type === "textarea" && (
                            <Textarea 
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              rows={3}
                              disabled
                              className="bg-muted/30"
                            />
                          )}
                          
                          {field.type === "number" && (
                            <Input 
                              type="number"
                              placeholder={field.placeholder || "0"}
                              disabled
                              className="bg-muted/30 w-32"
                            />
                          )}
                          
                          {field.type === "select" && (
                            <Select disabled>
                              <SelectTrigger className="bg-muted/30">
                                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt: any) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {field.type === "toggle" && (
                            <div className="flex items-center gap-2">
                              <Switch disabled />
                              <span className="text-sm text-muted-foreground">
                                {field.placeholder || "Toggle option"}
                              </span>
                            </div>
                          )}
                          
                          {field.description && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Generate Button Preview */}
                    <div className="pt-4 border-t">
                      <Button disabled className="w-full">
                        Generate Content
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Prompt Preview Tab */}
          <TabsContent value="preview" className="mt-6">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm text-muted-foreground">
                This preview shows how the prompt will be sent to the AI with sample input values.
              </p>
              
              {/* Input fields preview */}
              {promptPreview.fields.length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <h4 className="text-sm font-medium mb-2">Sample Input Values:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {promptPreview.fields.map((field: any) => (
                      <div key={field.id} className="flex gap-2">
                        <span className="font-mono text-muted-foreground">{field.id}:</span>
                        <span className="text-foreground truncate">{getSampleValue(field)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg bg-background p-4 space-y-4">
                {/* System prompt section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">System</Badge>
                    <span className="text-xs text-muted-foreground">Sent as system message</span>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md border">
                    {promptPreview.systemPrompt}
                  </pre>
                </div>
                
                {/* User prompt section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs">User</Badge>
                    <span className="text-xs text-muted-foreground">Sent as user message (from form inputs)</span>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md border">
                    {promptPreview.userPrompt}
                  </pre>
                </div>
                
                {!promptPreview.isValid && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    ⚠️ Form schema JSON is invalid. Fix the JSON to see the user prompt preview.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagerLayout>
  );
}
