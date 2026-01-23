import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThirdPartyIntegrations, ThirdPartyIntegration } from "@/hooks/useThirdPartyIntegrations";
import { Plus, Settings, Trash2, Code, BarChart3, Search, Megaphone, MessageSquare, Mail, Sparkles, Loader2 } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  analytics: <BarChart3 className="h-4 w-4" />,
  seo: <Search className="h-4 w-4" />,
  advertising: <Megaphone className="h-4 w-4" />,
  support: <MessageSquare className="h-4 w-4" />,
  marketing: <Mail className="h-4 w-4" />,
  custom: <Code className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  analytics: "Analytics & Tracking",
  seo: "SEO & Webmaster",
  advertising: "Advertising",
  support: "Support & Chat",
  marketing: "Marketing",
  custom: "Custom Scripts",
};

const categoryColors: Record<string, string> = {
  analytics: "bg-blue-500/10 text-blue-500",
  seo: "bg-green-500/10 text-green-500",
  advertising: "bg-yellow-500/10 text-yellow-500",
  support: "bg-purple-500/10 text-purple-500",
  marketing: "bg-pink-500/10 text-pink-500",
  custom: "bg-gray-500/10 text-gray-500",
};

export default function AdminIntegrations() {
  const { integrations, isLoading, updateIntegration, createIntegration, deleteIntegration } = useThirdPartyIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<ThirdPartyIntegration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [editForm, setEditForm] = useState({
    head_code: "",
    body_start_code: "",
    body_end_code: "",
    is_active: false,
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    category: "custom",
    description: "",
    head_code: "",
    body_start_code: "",
    body_end_code: "",
    is_active: false,
    sort_order: 100,
  });

  const handleEditClick = (integration: ThirdPartyIntegration) => {
    setSelectedIntegration(integration);
    setEditForm({
      head_code: integration.head_code || "",
      body_start_code: integration.body_start_code || "",
      body_end_code: integration.body_end_code || "",
      is_active: integration.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedIntegration) {
      updateIntegration.mutate(
        { id: selectedIntegration.id, ...editForm },
        { onSuccess: () => setIsEditDialogOpen(false) }
      );
    }
  };

  const handleCreate = () => {
    createIntegration.mutate(createForm, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setCreateForm({
          name: "",
          slug: "",
          category: "custom",
          description: "",
          head_code: "",
          body_start_code: "",
          body_end_code: "",
          is_active: false,
          sort_order: 100,
        });
      },
    });
  };

  const handleToggleActive = (integration: ThirdPartyIntegration) => {
    updateIntegration.mutate({ id: integration.id, is_active: !integration.is_active });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this integration?")) {
      deleteIntegration.mutate(id);
    }
  };

  const categories = ["all", ...Object.keys(categoryLabels)];
  const filteredIntegrations = integrations?.filter(
    (i) => activeTab === "all" || i.category === activeTab
  );

  const activeCount = integrations?.filter((i) => i.is_active).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Third-Party Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Manage tracking codes, analytics, and marketing scripts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {activeCount} Active
            </Badge>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Custom Integration</DialogTitle>
                  <DialogDescription>
                    Add a new tracking code or script that isn't in the presets.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="My Custom Script"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug (unique identifier)</Label>
                      <Input
                        placeholder="my-custom-script"
                        value={createForm.slug}
                        onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={createForm.category}
                        onValueChange={(value) => setCreateForm({ ...createForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sort Order</Label>
                      <Input
                        type="number"
                        value={createForm.sort_order}
                        onChange={(e) => setCreateForm({ ...createForm, sort_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of this integration"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Head Code (injected in &lt;head&gt;)</Label>
                    <Textarea
                      placeholder="<!-- Paste your head scripts here -->"
                      className="font-mono text-sm min-h-[100px]"
                      value={createForm.head_code}
                      onChange={(e) => setCreateForm({ ...createForm, head_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body Start Code (injected after &lt;body&gt;)</Label>
                    <Textarea
                      placeholder="<!-- Paste your body start scripts here -->"
                      className="font-mono text-sm min-h-[80px]"
                      value={createForm.body_start_code}
                      onChange={(e) => setCreateForm({ ...createForm, body_start_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body End Code (injected before &lt;/body&gt;)</Label>
                    <Textarea
                      placeholder="<!-- Paste your body end scripts here -->"
                      className="font-mono text-sm min-h-[80px]"
                      value={createForm.body_end_code}
                      onChange={(e) => setCreateForm({ ...createForm, body_end_code: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={createForm.is_active}
                      onCheckedChange={(checked) => setCreateForm({ ...createForm, is_active: checked })}
                    />
                    <Label>Enable immediately</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!createForm.name || !createForm.slug || createIntegration.isPending}>
                    {createIntegration.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Integration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === "all" ? "All" : categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations?.map((integration) => (
                  <Card key={integration.id} className={integration.is_active ? "border-primary/50" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-md ${categoryColors[integration.category] || categoryColors.custom}`}>
                            {categoryIcons[integration.category] || categoryIcons.custom}
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">
                              {categoryLabels[integration.category] || integration.category}
                            </Badge>
                          </div>
                        </div>
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={() => handleToggleActive(integration)}
                          disabled={updateIntegration.isPending}
                        />
                      </div>
                      <CardDescription className="mt-2 text-sm">
                        {integration.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(integration)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        {integration.slug === "custom-script" || integration.slug.startsWith("custom-") ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(integration.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>
                      {integration.is_active && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Active - Scripts injected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>
                Paste your tracking codes and scripts in the appropriate sections.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Head Code (injected in &lt;head&gt;)</Label>
                <p className="text-xs text-muted-foreground">
                  Scripts, meta tags, and stylesheets that should load in the page head.
                </p>
                <Textarea
                  placeholder={`<!-- Example for ${selectedIntegration?.name} -->
<script async src="https://..."></script>
<script>
  // Your initialization code
</script>`}
                  className="font-mono text-sm min-h-[120px]"
                  value={editForm.head_code}
                  onChange={(e) => setEditForm({ ...editForm, head_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Body Start Code (injected right after &lt;body&gt;)</Label>
                <p className="text-xs text-muted-foreground">
                  Noscript tags, GTM containers, or elements that need to load first.
                </p>
                <Textarea
                  placeholder="<!-- Body start code here -->"
                  className="font-mono text-sm min-h-[80px]"
                  value={editForm.body_start_code}
                  onChange={(e) => setEditForm({ ...editForm, body_start_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Body End Code (injected before &lt;/body&gt;)</Label>
                <p className="text-xs text-muted-foreground">
                  Chat widgets, conversion scripts, or code that should load last.
                </p>
                <Textarea
                  placeholder="<!-- Body end code here -->"
                  className="font-mono text-sm min-h-[80px]"
                  value={editForm.body_end_code}
                  onChange={(e) => setEditForm({ ...editForm, body_end_code: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                />
                <Label>Enable this integration</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateIntegration.isPending}>
                {updateIntegration.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
