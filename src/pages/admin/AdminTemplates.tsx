import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Folder, Eye, Layout, icons as LucideIcons } from "lucide-react";
import * as LucideIconsAll from "lucide-react";

const aiModels = [
  { value: "default", label: "Use Default (from AI Settings)" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "openai/gpt-5", label: "GPT-5" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
];

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  icon: string;
  slug: string;
  system_prompt: string;
  form_schema_json: string;
  is_active: boolean;
  model: string;
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
  model: "default",
};

interface CategoryFormData {
  value: string;
  label: string;
  icon: string;
  is_active: boolean;
}

interface IconFormData {
  name: string;
  is_active: boolean;
}

// Sample values for prompt preview
const getSampleValue = (field: { id: string; type: string; label: string; options?: { value: string; label: string }[] }): string => {
  const id = field.id.toLowerCase();
  const type = field.type;
  
  // Use first option for select fields
  if (type === "select" && field.options?.length) {
    return field.options[0].value;
  }
  
  // Generate contextual sample values based on field id/label
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
  
  // Default based on type
  if (type === "number") return "500";
  if (type === "toggle") return "true";
  if (type === "textarea") return "This is a sample longer text that would be entered in a textarea field. It provides context and details for the AI to work with.";
  
  return `Sample ${field.label}`;
};

export default function AdminTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState<TemplateFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogTab, setDialogTab] = useState<"edit" | "preview" | "template">("edit");
  
  // Category management state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    value: "", label: "", icon: "Folder", is_active: true
  });
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  
  // Icon management state
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<any>(null);
  const [iconFormData, setIconFormData] = useState<IconFormData>({ name: "", is_active: true });
  const [deleteIconOpen, setDeleteIconOpen] = useState(false);

  // Generate prompt preview
  const promptPreview = useMemo(() => {
    try {
      const fields = JSON.parse(formData.form_schema_json || "[]");
      
      // Build user prompt from sample inputs (same logic as edge function)
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

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
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

  // Fetch icons from database
  const { data: dbIcons = [], isLoading: iconsLoading } = useQuery({
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

  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIconsAll as any)[iconName];
    return IconComponent || Folder;
  };

  // Template handlers
  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setFormData({
      ...emptyFormData,
      category: categories[0]?.value || "blog",
      icon: dbIcons[0]?.name || "FileText",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category,
      icon: template.icon || "FileText",
      slug: template.slug,
      system_prompt: template.system_prompt,
      form_schema_json: JSON.stringify(template.form_schema_json || [], null, 2),
      is_active: template.is_active,
      model: template.model || "default",
    });
    setDialogOpen(true);
  };

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
        model: formData.model === "default" ? null : formData.model,
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from("templates")
          .update(templateData)
          .eq("id", selectedTemplate.id);
        if (error) throw error;
        toast({ title: "Template Updated" });
      } else {
        const { error } = await supabase
          .from("templates")
          .insert(templateData);
        if (error) throw error;
        toast({ title: "Template Created" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setDialogOpen(false);
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
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", selectedTemplate.id);
      if (error) throw error;
      toast({ title: "Template Deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setDeleteOpen(false);
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

  // Category handlers
  const handleOpenCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryFormData({ value: "", label: "", icon: "Folder", is_active: true });
    setCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = (category: any) => {
    setSelectedCategory(category);
    setCategoryFormData({
      value: category.value,
      label: category.label,
      icon: category.icon || "Folder",
      is_active: category.is_active,
    });
    setCategoryDialogOpen(true);
  };

  const handleSubmitCategory = async () => {
    if (!categoryFormData.value || !categoryFormData.label) {
      toast({ title: "Value and Label are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        const { error } = await supabase
          .from("template_categories")
          .update({
            value: categoryFormData.value,
            label: categoryFormData.label,
            icon: categoryFormData.icon,
            is_active: categoryFormData.is_active,
          })
          .eq("id", selectedCategory.id);
        if (error) throw error;
        toast({ title: "Category Updated" });
      } else {
        const maxSort = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0;
        const { error } = await supabase
          .from("template_categories")
          .insert({
            value: categoryFormData.value,
            label: categoryFormData.label,
            icon: categoryFormData.icon,
            is_active: categoryFormData.is_active,
            sort_order: maxSort + 1,
          });
        if (error) throw error;
        toast({ title: "Category Created" });
      }

      queryClient.invalidateQueries({ queryKey: ["template-categories"] });
      setCategoryDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("template_categories")
        .delete()
        .eq("id", selectedCategory.id);
      if (error) throw error;
      toast({ title: "Category Deleted" });
      queryClient.invalidateQueries({ queryKey: ["template-categories"] });
      setDeleteCategoryOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Icon handlers
  const handleOpenCreateIcon = () => {
    setSelectedIcon(null);
    setIconFormData({ name: "", is_active: true });
    setIconDialogOpen(true);
  };

  const handleOpenEditIcon = (icon: any) => {
    setSelectedIcon(icon);
    setIconFormData({ name: icon.name, is_active: icon.is_active });
    setIconDialogOpen(true);
  };

  const handleSubmitIcon = async () => {
    if (!iconFormData.name) {
      toast({ title: "Icon name is required", variant: "destructive" });
      return;
    }

    // Validate icon exists in Lucide
    if (!(LucideIconsAll as any)[iconFormData.name]) {
      toast({ 
        title: "Invalid Icon", 
        description: "Icon not found in Lucide library. Check spelling (PascalCase).", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedIcon) {
        const { error } = await supabase
          .from("template_icons")
          .update({ name: iconFormData.name, is_active: iconFormData.is_active })
          .eq("id", selectedIcon.id);
        if (error) throw error;
        toast({ title: "Icon Updated" });
      } else {
        const maxSort = dbIcons.length > 0 ? Math.max(...dbIcons.map(i => i.sort_order || 0)) : 0;
        const { error } = await supabase
          .from("template_icons")
          .insert({
            name: iconFormData.name,
            is_active: iconFormData.is_active,
            sort_order: maxSort + 1,
          });
        if (error) throw error;
        toast({ title: "Icon Added" });
      }

      queryClient.invalidateQueries({ queryKey: ["template-icons"] });
      setIconDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIcon = async () => {
    if (!selectedIcon) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("template_icons")
        .delete()
        .eq("id", selectedIcon.id);
      if (error) throw error;
      toast({ title: "Icon Deleted" });
      queryClient.invalidateQueries({ queryKey: ["template-icons"] });
      setDeleteIconOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Template Manager</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI content templates, categories, and icons.
            </p>
          </div>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="icons">Icons</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>All Templates</CardTitle>
                    <CardDescription>
                      {templates?.length || 0} templates configured
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button onClick={handleOpenCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {template.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.model ? (
                                <Badge variant="outline" className="font-mono text-xs">
                                  {template.model.split('/').pop()}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Default</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {template.is_active ? (
                                <Badge variant="outline">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEdit(template)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No templates found. Create your first template to get started.
                    </p>
                    <Button onClick={handleOpenCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Template Categories</CardTitle>
                    <CardDescription>
                      Manage categories that templates can be assigned to
                    </CardDescription>
                  </div>
                  <Button onClick={handleOpenCreateCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : categories.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => {
                        const IconComp = getIconComponent(cat.icon || "Folder");
                        return (
                          <TableRow key={cat.id}>
                            <TableCell>
                              <IconComp className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{cat.value}</TableCell>
                            <TableCell>{cat.label}</TableCell>
                            <TableCell>
                              {cat.is_active ? (
                                <Badge variant="outline">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenEditCategory(cat)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setDeleteCategoryOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No categories found.</p>
                    <Button onClick={handleOpenCreateCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Template Icons</CardTitle>
                    <CardDescription>
                      Manage icons that can be assigned to templates. Use Lucide icon names (PascalCase).
                    </CardDescription>
                  </div>
                  <Button onClick={handleOpenCreateIcon}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Icon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {iconsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : dbIcons.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {dbIcons.map((icon) => {
                      const IconComp = getIconComponent(icon.name);
                      return (
                        <div
                          key={icon.id}
                          className={`relative flex flex-col items-center gap-2 p-4 border rounded-lg ${
                            icon.is_active ? "bg-card" : "bg-muted opacity-60"
                          }`}
                        >
                          <IconComp className="h-6 w-6" />
                          <span className="text-xs font-mono truncate w-full text-center">{icon.name}</span>
                          <div className="absolute top-1 right-1 flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenEditIcon(icon)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => {
                                setSelectedIcon(icon);
                                setDeleteIconOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No icons found.</p>
                    <Button onClick={handleOpenCreateIcon}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Icon
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setDialogTab("edit"); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Configure the template settings and preview how the prompt will look.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as "edit" | "preview" | "template")} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-fit">
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
            
            <TabsContent value="edit" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4 pr-2">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Blog Post"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="blog-post"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(v) => setFormData({ ...formData, icon: v })}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={formData.model}
                      onValueChange={(v) => setFormData({ ...formData, model: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Use Default" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Override the default AI model for this template.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Generate a complete blog post..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="system_prompt">System Prompt *</Label>
                  <Textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="You are an expert content writer..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="form_schema">Form Schema (JSON)</Label>
                  <Textarea
                    id="form_schema"
                    value={formData.form_schema_json}
                    onChange={(e) => setFormData({ ...formData, form_schema_json: e.target.value })}
                    placeholder='[{"id": "topic", "type": "text", "label": "Topic", "required": true}]'
                    rows={6}
                    className="font-mono text-sm"
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
            
            <TabsContent value="template" className="flex-1 overflow-hidden mt-4">
              <div className="h-full flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  This preview shows how the template form will appear to users when they create content.
                </p>
                
                <ScrollArea className="flex-1 border rounded-lg bg-background">
                  <div className="p-6">
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
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
              <div className="h-full flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  This preview shows how the prompt will be sent to the AI with sample input values.
                </p>
                
                {/* Input fields preview */}
                {promptPreview.fields.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <h4 className="text-sm font-medium mb-2">Sample Input Values:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {promptPreview.fields.map((field: any) => (
                        <div key={field.id} className="flex gap-2">
                          <span className="font-mono text-muted-foreground">{field.id}:</span>
                          <span className="text-foreground truncate">{getSampleValue(field)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-4 space-y-4">
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
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Create/Edit Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Value (slug) *</Label>
              <Input
                value={categoryFormData.value}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="social-media"
              />
            </div>
            <div>
              <Label>Label *</Label>
              <Input
                value={categoryFormData.label}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                placeholder="Social Media"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Select
                value={categoryFormData.icon}
                onValueChange={(v) => setCategoryFormData({ ...categoryFormData, icon: v })}
              >
                <SelectTrigger>
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
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryFormData.is_active}
                onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitCategory} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Delete Confirmation */}
      <AlertDialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.label}"? Templates using this category won't be affected but may show an unknown category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Icon Create/Edit Dialog */}
      <Dialog open={iconDialogOpen} onOpenChange={setIconDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIcon ? "Edit Icon" : "Add Icon"}</DialogTitle>
            <DialogDescription>
              Enter a Lucide icon name in PascalCase (e.g., FileText, MessageSquare).
              <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-primary ml-1 underline">
                Browse icons →
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Icon Name *</Label>
              <Input
                value={iconFormData.name}
                onChange={(e) => setIconFormData({ ...iconFormData, name: e.target.value })}
                placeholder="FileText"
              />
              {iconFormData.name && (LucideIconsAll as any)[iconFormData.name] && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {(() => {
                    const IconPreview = getIconComponent(iconFormData.name);
                    return <IconPreview className="h-5 w-5" />;
                  })()}
                  Preview
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={iconFormData.is_active}
                onCheckedChange={(checked) => setIconFormData({ ...iconFormData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIconDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitIcon} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedIcon ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Icon Delete Confirmation */}
      <AlertDialog open={deleteIconOpen} onOpenChange={setDeleteIconOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Icon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedIcon?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIcon} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
