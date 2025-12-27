import { useState } from "react";
import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Search, Plus, Pencil, Star, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ManagerTestimonials() {
  const { data: testimonials, isLoading } = useTestimonials();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<any>(null);
  const [formData, setFormData] = useState({
    user_name: "",
    user_role: "",
    review_text: "",
    rating: 5,
    is_active: true,
    is_featured: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTestimonials = testimonials?.filter(t =>
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.review_text.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setFormData({
      user_name: "",
      user_role: "",
      review_text: "",
      rating: 5,
      is_active: true,
      is_featured: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setFormData({
      user_name: testimonial.user_name,
      user_role: testimonial.user_role || "",
      review_text: testimonial.review_text,
      rating: testimonial.rating || 5,
      is_active: testimonial.is_active,
      is_featured: testimonial.is_featured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.user_name || !formData.review_text) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            user_name: formData.user_name,
            user_role: formData.user_role,
            review_text: formData.review_text,
            rating: formData.rating,
            is_active: formData.is_active,
            is_featured: formData.is_featured,
          })
          .eq("id", editingTestimonial.id);

        if (error) throw error;

        toast({
          title: "Testimonial Updated",
          description: "Testimonial has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("testimonials").insert({
          user_name: formData.user_name,
          user_role: formData.user_role,
          review_text: formData.review_text,
          rating: formData.rating,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        });

        if (error) throw error;

        toast({
          title: "Testimonial Created",
          description: "Testimonial has been created successfully.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
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
    if (!deletingTestimonial) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", deletingTestimonial.id);

      if (error) throw error;

      toast({
        title: "Testimonial Deleted",
        description: "Testimonial has been deleted.",
      });

      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDeleteDialogOpen(false);
      setDeletingTestimonial(null);
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
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer testimonials and reviews.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Testimonial
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Testimonials</CardTitle>
                <CardDescription>
                  {testimonials?.length || 0} testimonials
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
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
            ) : filteredTestimonials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell className="font-medium">{testimonial.user_name}</TableCell>
                      <TableCell className="text-muted-foreground">{testimonial.user_role || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={testimonial.is_active ? "default" : "outline"}>
                          {testimonial.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {testimonial.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(testimonial)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingTestimonial(testimonial);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No testimonials found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Create Testimonial"}</DialogTitle>
            <DialogDescription>
              {editingTestimonial ? "Update testimonial details." : "Add a new customer testimonial."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.user_role}
                  onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                  placeholder="CEO at Company"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review *</Label>
              <Textarea
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                placeholder="Customer review text"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= formData.rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingTestimonial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial from {deletingTestimonial?.user_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  );
}
