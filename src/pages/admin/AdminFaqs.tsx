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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFaqs, FAQ } from "@/hooks/useFaqs";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";

type FAQForm = {
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
};

const defaultForm: FAQForm = {
  question: "",
  answer: "",
  category: "general",
  is_active: true,
  sort_order: 0,
};

const categories = [
  { value: "general", label: "General" },
  { value: "pricing", label: "Pricing" },
  { value: "features", label: "Features" },
  { value: "support", label: "Support" },
  { value: "billing", label: "Billing" },
];

export default function AdminFaqs() {
  const { data: faqs, isLoading } = useFaqs();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => {
    setSelectedFaq(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      is_active: true,
      sort_order: faq.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const openDelete = (faq: FAQ) => {
    setSelectedFaq(faq);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.question || !form.answer) {
      toast({ title: "Error", description: "Question and answer are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedFaq) {
        const { error } = await supabase
          .from("faqs")
          .update({
            question: form.question,
            answer: form.answer,
            category: form.category,
            is_active: form.is_active,
            sort_order: form.sort_order,
          })
          .eq("id", selectedFaq.id);

        if (error) throw error;
        toast({ title: "Success", description: "FAQ updated successfully." });
      } else {
        const { error } = await supabase.from("faqs").insert({
          question: form.question,
          answer: form.answer,
          category: form.category,
          is_active: form.is_active,
          sort_order: form.sort_order,
        });

        if (error) throw error;
        toast({ title: "Success", description: "FAQ created successfully." });
      }

      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFaq) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", selectedFaq.id);

      if (error) throw error;
      toast({ title: "Success", description: "FAQ deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
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
            <h1 className="text-3xl font-bold">FAQs</h1>
            <p className="text-muted-foreground mt-1">Manage frequently asked questions displayed on your landing page.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All FAQs</CardTitle>
            <CardDescription>{faqs?.length || 0} questions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : faqs && faqs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{faq.question}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{faq.answer}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {faq.category || "general"}
                          </Badge>
                        </TableCell>
                        <TableCell>{faq.sort_order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(faq)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDelete(faq)}>
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
              <p className="text-muted-foreground text-center py-8">No FAQs found. Add one to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>
              {selectedFaq ? "Update FAQ details." : "Create a new frequently asked question."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="How does this work?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Our platform uses AI to..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedFaq ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
