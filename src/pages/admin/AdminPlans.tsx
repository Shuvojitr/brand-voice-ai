import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan, Plan } from "@/hooks/usePlans";
import { Plus, Pencil, Trash2, Loader2, DollarSign, Star, X, GripVertical } from "lucide-react";

type PlanFormData = Omit<Plan, "id" | "created_at" | "updated_at">;

const defaultFormData: PlanFormData = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  price_yearly: 0,
  currency: "USD",
  interval: "month",
  features_monthly: [],
  features_yearly: [],
  credits: 1000,
  credits_yearly: null,
  is_active: true,
  is_popular: false,
  sort_order: 0,
  cta_text: "Get Started",
  yearly_discount: 20,
  monthly_discount: 0,
};

export default function AdminPlans() {
  const { toast } = useToast();
  const { data: plans, isLoading } = usePlans(true);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultFormData);
  const [newFeatureMonthly, setNewFeatureMonthly] = useState("");
  const [newFeatureYearly, setNewFeatureYearly] = useState("");
  

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      ...defaultFormData,
      sort_order: (plans?.length || 0),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      price: plan.price,
      price_yearly: plan.price_yearly ?? 0,
      currency: plan.currency,
      interval: plan.interval,
      features_monthly: plan.features_monthly || [],
      features_yearly: plan.features_yearly || [],
      credits: plan.credits,
      credits_yearly: plan.credits_yearly,
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      sort_order: plan.sort_order,
      cta_text: plan.cta_text || "Get Started",
      yearly_discount: plan.yearly_discount ?? 20,
      monthly_discount: plan.monthly_discount ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "Validation Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...formData });
        toast({ title: "Plan updated successfully" });
      } else {
        await createPlan.mutateAsync(formData);
        toast({ title: "Plan created successfully" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) return;

    try {
      await deletePlan.mutateAsync(plan.id);
      toast({ title: "Plan deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (plan: Plan) => {
    try {
      await updatePlan.mutateAsync({ id: plan.id, is_active: !plan.is_active });
      toast({
        title: plan.is_active ? "Plan deactivated" : "Plan activated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addFeatureMonthly = () => {
    if (newFeatureMonthly.trim()) {
      setFormData({
        ...formData,
        features_monthly: [...formData.features_monthly, newFeatureMonthly.trim()],
      });
      setNewFeatureMonthly("");
    }
  };

  const addFeatureYearly = () => {
    if (newFeatureYearly.trim()) {
      setFormData({
        ...formData,
        features_yearly: [...formData.features_yearly, newFeatureYearly.trim()],
      });
      setNewFeatureYearly("");
    }
  };

  const removeFeatureMonthly = (index: number) => {
    setFormData({
      ...formData,
      features_monthly: formData.features_monthly.filter((_, i) => i !== index),
    });
  };

  const removeFeatureYearly = (index: number) => {
    setFormData({
      ...formData,
      features_yearly: formData.features_yearly.filter((_, i) => i !== index),
    });
  };

  const copyMonthlyToYearly = () => {
    setFormData({
      ...formData,
      features_yearly: [...formData.features_monthly],
    });
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
    return interval === "forever" ? `${formatted}` : `${formatted}/${interval}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plan Manager</h1>
            <p className="text-muted-foreground mt-1">
              Manage subscription plans displayed on the pricing page
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Changes here reflect immediately on the public pricing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discounts</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        {plan.sort_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {plan.is_popular && (
                          <Badge variant="default" className="bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{plan.slug}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{formatPrice(plan.price, plan.currency, "month")}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatPrice(plan.price_yearly ?? 0, plan.currency, "year")}/yr
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          Monthly: {plan.monthly_discount}%
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          Yearly: {plan.yearly_discount}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{plan.credits.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {plan.features_monthly?.length || 0} features
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(plan)}
                        >
                          {plan.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(plan)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update the plan details below"
                  : "Fill in the details to create a new subscription plan"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })
                    }
                    placeholder="pro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Best for professionals and creators"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_yearly">Yearly Price (total annual)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_yearly ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BDT">BDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Base Interval</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={(value: "month" | "year" | "forever") =>
                      setFormData({ ...formData, interval: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                      <SelectItem value="forever">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Monthly Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits_yearly">Yearly Credits (optional)</Label>
                  <Input
                    id="credits_yearly"
                    type="number"
                    min="0"
                    placeholder="Leave empty for 12x monthly"
                    value={formData.credits_yearly ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, credits_yearly: e.target.value ? parseInt(e.target.value) : null })
                    }
                  />
                </div>
              </div>


              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_discount">Monthly Discount (%)</Label>
                  <Input
                    id="monthly_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.monthly_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_discount: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Discount for monthly billing
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearly_discount">Yearly Discount (%)</Label>
                  <Input
                    id="yearly_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.yearly_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, yearly_discount: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Discount for yearly billing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">CTA Button Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, cta_text: e.target.value })
                    }
                    placeholder="Get Started"
                  />
                </div>
              </div>

              {/* Monthly Features Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Monthly Plan Features</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeatureMonthly}
                    onChange={(e) => setNewFeatureMonthly(e.target.value)}
                    placeholder="Add a monthly feature..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeatureMonthly())}
                  />
                  <Button type="button" variant="secondary" onClick={addFeatureMonthly}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features_monthly.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeatureMonthly(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Yearly Features Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Yearly Plan Features</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyMonthlyToYearly}
                    className="text-xs"
                  >
                    Copy Monthly to Yearly
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeatureYearly}
                    onChange={(e) => setNewFeatureYearly(e.target.value)}
                    placeholder="Add a yearly feature..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeatureYearly())}
                  />
                  <Button type="button" variant="secondary" onClick={addFeatureYearly}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features_yearly.map((feature, index) => (
                    <Badge key={index} variant="outline" className="pr-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeatureYearly(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_popular: checked })
                    }
                  />
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createPlan.isPending || updatePlan.isPending}
              >
                {(createPlan.isPending || updatePlan.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
