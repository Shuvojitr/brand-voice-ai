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
import {
  usePaymentProviders,
  useUpdatePaymentProvider,
  useCreatePaymentProvider,
  useDeletePaymentProvider,
  PaymentProvider,
} from "@/hooks/usePaymentProviders";
import { Plus, Pencil, Trash2, Loader2, CreditCard, Eye, EyeOff, Shield, Zap } from "lucide-react";

const PROVIDER_TYPES = [
  { value: "stripe", label: "Stripe" },
  { value: "lemon_squeezy", label: "Lemon Squeezy" },
  { value: "paddle", label: "Paddle" },
  { value: "razorpay", label: "Razorpay" },
  { value: "manual", label: "Manual / Custom" },
];

type ProviderFormData = {
  name: string;
  slug: string;
  provider_type: string;
  description: string;
  logo_url: string;
  api_key_encrypted: string;
  api_secret_encrypted: string;
  webhook_secret_encrypted: string;
  webhook_url: string;
  mode: "test" | "live";
  is_active: boolean;
  config: Record<string, any>;
  supported_currencies: string[];
  sort_order: number;
};

const defaultForm: ProviderFormData = {
  name: "",
  slug: "",
  provider_type: "manual",
  description: "",
  logo_url: "",
  api_key_encrypted: "",
  api_secret_encrypted: "",
  webhook_secret_encrypted: "",
  webhook_url: "",
  mode: "test",
  is_active: false,
  config: {},
  supported_currencies: ["USD"],
  sort_order: 0,
};

export default function AdminPaymentGateways() {
  const { toast } = useToast();
  const { data: providers, isLoading } = usePaymentProviders(true);
  const updateProvider = useUpdatePaymentProvider();
  const createProvider = useCreatePaymentProvider();
  const deleteProvider = useDeletePaymentProvider();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentProvider | null>(null);
  const [form, setForm] = useState<ProviderFormData>(defaultForm);
  const [showSecrets, setShowSecrets] = useState(false);
  const [currencyInput, setCurrencyInput] = useState("");
  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, sort_order: providers?.length || 0 });
    setShowSecrets(false);
    setIsDialogOpen(true);
  };

  const openEdit = (p: PaymentProvider) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      provider_type: p.provider_type,
      description: p.description || "",
      logo_url: p.logo_url || "",
      api_key_encrypted: p.api_key_encrypted || "",
      api_secret_encrypted: p.api_secret_encrypted || "",
      webhook_secret_encrypted: p.webhook_secret_encrypted || "",
      webhook_url: p.webhook_url || "",
      mode: p.mode as "test" | "live",
      is_active: p.is_active,
      config: p.config || {},
      supported_currencies: p.supported_currencies || ["USD"],
      sort_order: p.sort_order,
    });
    setShowSecrets(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateProvider.mutateAsync({ id: editing.id, ...form });
        toast({ title: "Payment gateway updated" });
      } else {
        await createProvider.mutateAsync(form);
        toast({ title: "Payment gateway created" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (p: PaymentProvider) => {
    if (!confirm(`Delete "${p.name}" gateway?`)) return;
    try {
      await deleteProvider.mutateAsync(p.id);
      toast({ title: "Gateway deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (p: PaymentProvider) => {
    try {
      await updateProvider.mutateAsync({ id: p.id, is_active: !p.is_active });
      toast({ title: p.is_active ? "Gateway disabled" : "Gateway enabled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addCurrency = () => {
    const c = currencyInput.trim().toUpperCase();
    if (c && !form.supported_currencies.includes(c)) {
      setForm({ ...form, supported_currencies: [...form.supported_currencies, c] });
      setCurrencyInput("");
    }
  };

  const removeCurrency = (c: string) => {
    setForm({ ...form, supported_currencies: form.supported_currencies.filter(x => x !== c) });
  };

  const addConfigField = () => {
    if (configKey.trim()) {
      setForm({ ...form, config: { ...form.config, [configKey.trim()]: configValue } });
      setConfigKey("");
      setConfigValue("");
    }
  };

  const removeConfigField = (key: string) => {
    const newConfig = { ...form.config };
    delete newConfig[key];
    setForm({ ...form, config: newConfig });
  };

  const getModeColor = (mode: string) => mode === "live" ? "destructive" : "secondary";
  const getTypeLabel = (type: string) => PROVIDER_TYPES.find(t => t.value === type)?.label || type;

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
            <h1 className="text-3xl font-bold">Payment Gateways</h1>
            <p className="text-muted-foreground mt-1">
              Configure and manage payment providers for subscriptions
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Configured Gateways
            </CardTitle>
            <CardDescription>
              Enable or disable payment gateways. Map plan prices in the Plan Manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Currencies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers?.map((p) => (
                  <TableRow key={p.id} className={!p.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(p.provider_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getModeColor(p.mode)}>{p.mode}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.supported_currencies?.slice(0, 3).map(c => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                        {(p.supported_currencies?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{p.supported_currencies!.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!providers || providers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payment gateways configured yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Gateway" : "Add Payment Gateway"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update gateway configuration" : "Configure a new payment gateway"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gateway Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Stripe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                    placeholder="stripe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Type</Label>
                  <Select value={form.provider_type} onValueChange={(v) => setForm({ ...form, provider_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select value={form.mode} onValueChange={(v: "test" | "live") => setForm({ ...form, mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">
                        <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> Test</span>
                      </SelectItem>
                      <SelectItem value="live">
                        <span className="flex items-center gap-2"><Zap className="h-3 w-3" /> Live</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this payment gateway"
                />
              </div>

              {/* API Keys */}
              {form.provider_type !== "manual" && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">API Credentials</Label>
                    <Button variant="ghost" size="sm" onClick={() => setShowSecrets(!showSecrets)}>
                      {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showSecrets ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>API Key / Publishable Key</Label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={form.api_key_encrypted}
                        onChange={(e) => setForm({ ...form, api_key_encrypted: e.target.value })}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={form.api_secret_encrypted}
                        onChange={(e) => setForm({ ...form, api_secret_encrypted: e.target.value })}
                        placeholder="sk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook Secret</Label>
                      <Input
                        type={showSecrets ? "text" : "password"}
                        value={form.webhook_secret_encrypted}
                        onChange={(e) => setForm({ ...form, webhook_secret_encrypted: e.target.value })}
                        placeholder="whsec_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={form.webhook_url}
                        onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                        placeholder="https://your-domain.com/api/webhooks/stripe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Manual payment config */}
              {form.provider_type === "manual" && (
                <div className="space-y-4 border rounded-lg p-4">
                  <Label className="text-base font-semibold">Payment Instructions (Config)</Label>
                  <p className="text-sm text-muted-foreground">
                    Add key-value pairs for payment instructions (e.g., account_number, bank_name, instructions).
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Key (e.g. account_number)"
                      value={configKey}
                      onChange={(e) => setConfigKey(e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={configValue}
                      onChange={(e) => setConfigValue(e.target.value)}
                    />
                    <Button type="button" variant="secondary" onClick={addConfigField}>Add</Button>
                  </div>
                  {Object.entries(form.config).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(form.config).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between bg-muted rounded px-3 py-2 text-sm">
                          <span><strong>{key}:</strong> {String(val)}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeConfigField(key)}>
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Currencies */}
              <div className="space-y-2">
                <Label>Supported Currencies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. BDT"
                    value={currencyInput}
                    onChange={(e) => setCurrencyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCurrency())}
                  />
                  <Button type="button" variant="secondary" onClick={addCurrency}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.supported_currencies.map(c => (
                    <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => removeCurrency(c)}>
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={createProvider.isPending || updateProvider.isPending}
              >
                {(createProvider.isPending || updateProvider.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editing ? "Update Gateway" : "Create Gateway"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
