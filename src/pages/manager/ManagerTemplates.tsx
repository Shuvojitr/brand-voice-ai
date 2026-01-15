import { useState } from "react";
import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplates } from "@/hooks/useTemplates";
import { useAllTemplateCategories } from "@/hooks/useTemplateCategories";
import { useAllTemplateIcons } from "@/hooks/useTemplateIcons";
import { getIconByName } from "@/lib/icon-utils";
import { Search, Plus, Pencil, Eye, EyeOff, Trash2, Folder } from "lucide-react";
import * as LucideIconsAll from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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

export default function ManagerTemplates() {
  const { data: templates, isLoading } = useTemplates(true);
  const { data: categories, isLoading: categoriesLoading } = useAllTemplateCategories();
  const { data: icons, isLoading: iconsLoading } = useAllTemplateIcons();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    icon: "",
    slug: "",
    system_prompt: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIconsAll as any)[iconName];
    return IconComponent || Folder;
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      category: categories?.[0]?.value || "",
      icon: icons?.[0]?.name || "FileText",
      slug: "",
      system_prompt: "",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category,
      icon: template.icon || "FileText",
      slug: template.slug,
      system_prompt: template.system_prompt,
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.system_prompt) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("templates")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            icon: formData.icon,
            slug: formData.slug,
            system_prompt: formData.system_prompt,
            is_active: formData.is_active,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const { error } = await supabase.from("templates").insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          icon: formData.icon,
          slug: formData.slug,
          system_prompt: formData.system_prompt,
          is_active: formData.is_active,
          form_schema_json: [],
        });

        if (error) throw error;

        toast({
          title: "Template Created",
          description: `${formData.name} has been created successfully.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["templates"] });
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

  const toggleTemplateStatus = async (template: any) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: template.is_active ? "Template Disabled" : "Template Enabled",
        description: `${template.name} has been ${template.is_active ? "disabled" : "enabled"}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["templates"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
        const maxSort = categories && categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0;
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
        const maxSort = icons && icons.length > 0 ? Math.max(...icons.map(i => i.sort_order || 0)) : 0;
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

  // Find category label by value
  const getCategoryLabel = (value: string) => {
    const category = categories?.find(c => c.value === value);
    return category?.label || value;
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage content generation templates, categories, and icons.
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
                      {templates?.length || 0} templates available
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
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => {
                        const IconComponent = getIconByName(template.icon);
                        return (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{getCategoryLabel(template.category)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{template.icon}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{template.slug}</TableCell>
                            <TableCell>
                              <Badge variant={template.is_active ? "default" : "outline"}>
                                {template.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(template)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTemplateStatus(template)}
                                >
                                  {template.is_active ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No templates found.
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
                      {categories?.length || 0} categories configured
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
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : categories && categories.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon || "Folder");
                        return (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.label}</TableCell>
                            <TableCell className="text-muted-foreground">{category.value}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{category.icon}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={category.is_active ? "default" : "outline"}>
                                {category.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setDeleteCategoryOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No categories found.
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
                      {icons?.length || 0} icons available
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
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : icons && icons.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {icons.map((icon) => {
                      const IconComponent = getIconComponent(icon.name);
                      return (
                        <div
                          key={icon.id}
                          className={`relative flex flex-col items-center justify-center p-4 border rounded-lg ${
                            icon.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                          }`}
                        >
                          <IconComponent className="h-8 w-8 mb-2" />
                          <span className="text-xs text-center truncate w-full">{icon.name}</span>
                          {!icon.is_active && (
                            <Badge variant="outline" className="absolute top-1 right-1 text-[10px]">
                              Inactive
                            </Badge>
                          )}
                          <div className="absolute top-1 left-1 flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleOpenEditIcon(icon)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setSelectedIcon(icon);
                                setDeleteIconOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No icons found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Update template details." : "Create a new content template."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Template name"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="template-slug"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {icons?.map((icon) => {
                      const IconComponent = getIconByName(icon.name);
                      return (
                        <SelectItem key={icon.id} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {icon.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the template"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>System Prompt *</Label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="Enter the AI system prompt for this template..."
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Update category details." : "Add a new template category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={categoryFormData.label}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                placeholder="Blog & Articles"
              />
            </div>
            <div className="space-y-2">
              <Label>Value *</Label>
              <Input
                value={categoryFormData.value}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, value: e.target.value })}
                placeholder="blog"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={categoryFormData.icon} onValueChange={(v) => setCategoryFormData({ ...categoryFormData, icon: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {icons?.map((icon) => {
                    const IconComponent = getIconComponent(icon.name);
                    return (
                      <SelectItem key={icon.id} value={icon.name}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
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
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCategory} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Icon Dialog */}
      <Dialog open={iconDialogOpen} onOpenChange={setIconDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIcon ? "Edit Icon" : "Add Icon"}</DialogTitle>
            <DialogDescription>
              Enter the exact Lucide icon name (PascalCase).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Icon Name *</Label>
              <Input
                value={iconFormData.name}
                onChange={(e) => setIconFormData({ ...iconFormData, name: e.target.value })}
                placeholder="FileText, Mail, Search..."
              />
              {iconFormData.name && (LucideIconsAll as any)[iconFormData.name] && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  {(() => {
                    const IconPreview = getIconComponent(iconFormData.name);
                    return <IconPreview className="h-6 w-6" />;
                  })()}
                  <span className="text-sm text-muted-foreground">Preview</span>
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
            <Button variant="outline" onClick={() => setIconDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitIcon} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedIcon ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Icon Confirmation */}
      <AlertDialog open={deleteIconOpen} onOpenChange={setDeleteIconOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Icon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedIcon?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIcon} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagerLayout>
  );
}
