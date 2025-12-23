import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

type TestimonialForm = {
  user_name: string;
  user_role: string;
  user_avatar: string;
  review_text: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

const defaultForm: TestimonialForm = {
  user_name: "",
  user_role: "",
  user_avatar: "",
  review_text: "",
  rating: 5,
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

export default function AdminTestimonials() {
  const { data: testimonials, isLoading } = useTestimonials();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => {
    setSelectedTestimonial(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setForm({
      user_name: testimonial.user_name,
      user_role: testimonial.user_role || "",
      user_avatar: testimonial.user_avatar || "",
      review_text: testimonial.review_text,
      rating: testimonial.rating || 5,
      is_featured: testimonial.is_featured || false,
      is_active: true,
      sort_order: testimonial.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const openDelete = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.user_name || !form.review_text) {
      toast({ title: "Error", description: "Name and review text are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            user_name: form.user_name,
            user_role: form.user_role || null,
            user_avatar: form.user_avatar || null,
            review_text: form.review_text,
            rating: form.rating,
            is_featured: form.is_featured,
            is_active: form.is_active,
            sort_order: form.sort_order,
          })
          .eq("id", selectedTestimonial.id);

        if (error) throw error;
        toast({ title: "Success", description: "Testimonial updated successfully." });
      } else {
        const { error } = await supabase.from("testimonials").insert({
          user_name: form.user_name,
          user_role: form.user_role || null,
          user_avatar: form.user_avatar || null,
          review_text: form.review_text,
          rating: form.rating,
          is_featured: form.is_featured,
          is_active: form.is_active,
          sort_order: form.sort_order,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Testimonial created successfully." });
      }

      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", selectedTestimonial.id);

      if (error) throw error;
      toast({ title: "Success", description: "Testimonial deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground mt-1">Manage customer testimonials displayed on your landing page.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Testimonials</CardTitle>
            <CardDescription>{testimonials?.length || 0} testimonials</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : testimonials && testimonials.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell className="font-medium">{testimonial.user_name}</TableCell>
                        <TableCell>{testimonial.user_role || "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">{testimonial.review_text}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {testimonial.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={testimonial.is_featured ? "default" : "secondary"}>
                            {testimonial.is_featured ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{testimonial.sort_order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(testimonial)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDelete(testimonial)}>
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
              <p className="text-muted-foreground text-center py-8">No testimonials found. Add one to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>
              {selectedTestimonial ? "Update testimonial details." : "Create a new customer testimonial."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_name">Name *</Label>
                <Input
                  id="user_name"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_role">Role</Label>
                <Input
                  id="user_role"
                  value={form.user_role}
                  onChange={(e) => setForm({ ...form, user_role: e.target.value })}
                  placeholder="Marketing Manager"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_avatar">Avatar URL</Label>
              <Input
                id="user_avatar"
                value={form.user_avatar}
                onChange={(e) => setForm({ ...form, user_avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_text">Review Text *</Label>
              <Textarea
                id="review_text"
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                placeholder="This product has been amazing..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedTestimonial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the testimonial from "{selectedTestimonial?.user_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
