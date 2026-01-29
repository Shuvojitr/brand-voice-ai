import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { useTemplates } from "@/hooks/useTemplates";
import { useAllTemplateCategories } from "@/hooks/useTemplateCategories";
import { useAllTemplateIcons } from "@/hooks/useTemplateIcons";
import { Search, Plus, Pencil, Eye, EyeOff, Trash2, Folder } from "lucide-react";
import * as LucideIconsAll from "lucide-react";
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
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
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
                    <Button onClick={() => navigate("/manager/templates/new")}>
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
                          <TableHead>Icon</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates.map((template) => {
                          const IconComp = getIconComponent(template.icon || "FileText");
                          return (
                            <TableRow key={template.id}>
                              <TableCell>
                                <IconComp className="h-5 w-5 text-muted-foreground" />
                              </TableCell>
                              <TableCell className="font-medium">{template.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {getCategoryLabel(template.category)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {template.is_active ? (
                                  <Badge variant="outline" className="text-green-600">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/manager/templates/edit/${template.id}`)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant={template.is_active ? "secondary" : "default"}
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
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No templates found. Create your first template to get started.
                    </p>
                    <Button onClick={() => navigate("/manager/templates/new")}>
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
                      Organize templates into logical groups
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
                ) : categories && categories.length > 0 ? (
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
                      Manage icons available for templates. Use Lucide icon names (PascalCase).
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
                ) : icons && icons.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {icons.map((icon) => {
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
                  {icons?.filter(i => i.is_active).map((icon) => {
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
              Are you sure you want to delete "{selectedCategory?.label}"?
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
    </ManagerLayout>
  );
}
