import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useSupportContent, 
  useUpdateSupportContent,
  SupportContentData,
  SupportResource,
  DEFAULT_SUPPORT_CONTENT,
} from "@/hooks/useSupportContent";
import { 
  Zap, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  Mail,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AVAILABLE_ICONS = [
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "HelpCircle", label: "Help Circle", icon: HelpCircle },
  { value: "FileText", label: "File Text", icon: FileText },
  { value: "MessageCircle", label: "Message", icon: MessageCircle },
  { value: "Mail", label: "Mail", icon: Mail },
  { value: "Zap", label: "Zap", icon: Zap },
];

export default function AdminSupportPage() {
  const { data: supportContent, isLoading } = useSupportContent();
  const updateMutation = useUpdateSupportContent();
  
  const [content, setContent] = useState<SupportContentData>(DEFAULT_SUPPORT_CONTENT);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (supportContent) {
      setContent(supportContent);
    }
  }, [supportContent]);

  const handleSave = () => {
    updateMutation.mutate(content, {
      onSuccess: () => setHasChanges(false),
    });
  };

  const updateProTip = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      proTip: { ...prev.proTip, [field]: value },
    }));
    setHasChanges(true);
  };

  const updateResource = (index: number, field: keyof SupportResource, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      resources: prev.resources.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      ),
    }));
    setHasChanges(true);
  };

  const addResource = () => {
    const newResource: SupportResource = {
      id: crypto.randomUUID(),
      icon: "FileText",
      title: "New Resource",
      description: "Description for this resource.",
      buttonText: "View",
      href: "/",
      isInternal: true,
    };
    setContent(prev => ({
      ...prev,
      resources: [...prev.resources, newResource],
    }));
    setHasChanges(true);
  };

  const removeResource = (index: number) => {
    setContent(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateContact = (type: "liveChat" | "email", field: string, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [type]: { ...prev.contact[type], [field]: value },
      },
    }));
    setHasChanges(true);
  };

  const updateStatus = (field: string, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      status: { ...prev.status, [field]: value },
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Support Page</h1>
            <p className="text-muted-foreground">
              Manage the Help & Support page content
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="pro-tip" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pro-tip">Pro Tip</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Pro Tip Tab */}
          <TabsContent value="pro-tip">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Pro Tip Banner
                </CardTitle>
                <CardDescription>
                  Configure the highlighted tip shown at the top of the support page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proTipTitle">Title</Label>
                  <Input
                    id="proTipTitle"
                    value={content.proTip.title}
                    onChange={(e) => updateProTip("title", e.target.value)}
                    placeholder="Pro Tip"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proTipDescription">Description</Label>
                  <Textarea
                    id="proTipDescription"
                    value={content.proTip.description}
                    onChange={(e) => updateProTip("description", e.target.value)}
                    placeholder="Enter the tip description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proTipShortcut">Keyboard Shortcut (optional)</Label>
                  <Input
                    id="proTipShortcut"
                    value={content.proTip.shortcut || ""}
                    onChange={(e) => updateProTip("shortcut", e.target.value)}
                    placeholder="⌘K"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6 pt-6 border-t">
                  <Label className="text-muted-foreground text-sm mb-3 block">Preview</Label>
                  <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{content.proTip.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {content.proTip.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resources Section</CardTitle>
                    <CardDescription>
                      Manage the resource cards shown on the support page
                    </CardDescription>
                  </div>
                  <Button onClick={addResource} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {content.resources.map((resource, index) => (
                  <div key={resource.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Resource {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select
                          value={resource.icon}
                          onValueChange={(value) => updateResource(index, "icon", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_ICONS.map((icon) => (
                              <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center gap-2">
                                  <icon.icon className="h-4 w-4" />
                                  {icon.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={resource.title}
                          onChange={(e) => updateResource(index, "title", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) => updateResource(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={resource.buttonText}
                          onChange={(e) => updateResource(index, "buttonText", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Link URL</Label>
                        <Input
                          value={resource.href}
                          onChange={(e) => updateResource(index, "href", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Link Type</Label>
                        <div className="flex items-center gap-2 h-10">
                          <Switch
                            checked={resource.isInternal}
                            onCheckedChange={(checked) => updateResource(index, "isInternal", checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {resource.isInternal ? "Internal link" : "External/Anchor"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {content.resources.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No resources added yet. Click "Add Resource" to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Live Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Live Chat</Label>
                    <Switch
                      checked={content.contact.liveChat.enabled}
                      onCheckedChange={(checked) => updateContact("liveChat", "enabled", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={content.contact.liveChat.title}
                      onChange={(e) => updateContact("liveChat", "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={content.contact.liveChat.description}
                      onChange={(e) => updateContact("liveChat", "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={content.contact.liveChat.buttonText}
                      onChange={(e) => updateContact("liveChat", "buttonText", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Email Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Email Support</Label>
                    <Switch
                      checked={content.contact.email.enabled}
                      onCheckedChange={(checked) => updateContact("email", "enabled", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={content.contact.email.title}
                      onChange={(e) => updateContact("email", "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={content.contact.email.description}
                      onChange={(e) => updateContact("email", "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={content.contact.email.buttonText}
                      onChange={(e) => updateContact("email", "buttonText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link URL</Label>
                    <Input
                      value={content.contact.email.href}
                      onChange={(e) => updateContact("email", "href", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Configure the system status indicator at the bottom of the support page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Status Section</Label>
                  <Switch
                    checked={content.status.enabled}
                    onCheckedChange={(checked) => updateStatus("enabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status Text</Label>
                  <Input
                    value={content.status.text}
                    onChange={(e) => updateStatus("text", e.target.value)}
                    placeholder="All systems operational"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status Page URL</Label>
                  <Input
                    value={content.status.statusUrl}
                    onChange={(e) => updateStatus("statusUrl", e.target.value)}
                    placeholder="https://status.example.com"
                  />
                </div>

                {/* Preview */}
                {content.status.enabled && (
                  <div className="mt-6 pt-6 border-t">
                    <Label className="text-muted-foreground text-sm mb-3 block">Preview</Label>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{content.status.text}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          View Status Page
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
