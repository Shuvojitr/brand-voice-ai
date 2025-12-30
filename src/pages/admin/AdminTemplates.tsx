import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const categories = [
  { value: "blog", label: "Blog" },
  { value: "social", label: "Social Media" },
  { value: "ads", label: "Ads" },
  { value: "email", label: "Email" },
  { value: "seo", label: "SEO" },
  { value: "product", label: "Product" },
];

const icons = [
  "FileText", "List", "Linkedin", "Twitter", "Instagram", "Target",
  "Facebook", "Mail", "Send", "Package", "Search", "MessageSquare",
];

const aiModels = [
  { value: "", label: "Use Default (from AI Settings)" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Default)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "openai/gpt-5", label: "GPT-5" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
];

interface TemplateFormData {
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
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
  name_bn: "",
  description: "",
  description_bn: "",
  category: "blog",
  icon: "FileText",
  slug: "",
  system_prompt: "",
  form_schema_json: "[]",
  is_active: true,
  model: "",
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

  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      name_bn: template.name_bn || "",
      description: template.description || "",
      description_bn: template.description_bn || "",
      category: template.category,
      icon: template.icon || "FileText",
      slug: template.slug,
      system_prompt: template.system_prompt,
      form_schema_json: JSON.stringify(template.form_schema_json || [], null, 2),
      is_active: template.is_active,
      model: template.model || "",
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
        name_bn: formData.name_bn || null,
        description: formData.description || null,
        description_bn: formData.description_bn || null,
        category: formData.category,
        icon: formData.icon,
        slug: formData.slug,
        system_prompt: formData.system_prompt,
        form_schema_json: parsedSchema,
        is_active: formData.is_active,
        model: formData.model || null,
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Template Manager</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI content templates.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Templates</CardTitle>
                <CardDescription>
                  {templates?.length || 0} templates configured
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Configure the template settings and form schema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Blog Post"
                />
              </div>
              <div>
                <Label htmlFor="name_bn">Name (Bengali)</Label>
                <Input
                  id="name_bn"
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="ব্লগ পোস্ট"
                />
              </div>
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
                    {categories.map((cat) => (
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
                    {icons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
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
                Define input fields as JSON array. Each field needs: id, type, label.
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
