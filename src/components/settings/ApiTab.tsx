import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useApiKeys } from "@/hooks/useApiKeys";
import { supabase } from "@/integrations/supabase/client";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApiTabProps {
  organizationId: string;
}

export function ApiTab({ organizationId }: ApiTabProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const { apiKeys, isLoading, createKey, revokeKey, isCreating } = useApiKeys(organizationId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !userId) return;
    
    try {
      const result = await createKey({ name: newKeyName.trim(), userId });
      setCreatedKey(result.plainKey);
      setNewKeyName("");
      setIsCreateDialogOpen(false);
      setIsKeyDialogOpen(true);
    } catch (error) {
      console.error("Failed to create key:", error);
    }
  };

  const handleCopyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopiedKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeKey(keyId);
    } catch (error) {
      console.error("Failed to revoke key:", error);
    }
  };

  const handleKeyDialogClose = () => {
    setIsKeyDialogOpen(false);
    setCreatedKey(null);
    setCopiedKey(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access to MyGenAI.
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a name to help you identify it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input 
                      id="key-name" 
                      placeholder="e.g., My Production App" 
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={!newKeyName.trim() || isCreating}>
                    {isCreating ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">Keep your API keys secure</p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Do not share your API keys or expose them in client-side code. If you believe a key has been compromised, revoke it immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your API Keys</CardTitle>
          <CardDescription>
            {apiKeys.length} active key{apiKeys.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys yet</p>
              <p className="text-sm">Create your first API key to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.name}</p>
                        {key.is_active && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">
                          {key.key_prefix}
                        </code>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                        </span>
                        {key.last_used_at && (
                          <span>
                            Last used {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to revoke the key "{key.name}"? This action cannot be undone and any applications using this key will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevokeKey(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Key Created Dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={handleKeyDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Make sure to copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={createdKey || ''} 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyKey}
                >
                  {copiedKey ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This is the only time you'll see this key. Store it securely!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleKeyDialogClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Documentation Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start</CardTitle>
          <CardDescription>
            Use your API key to make requests to the MyGenAI API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Example Request (cURL)</Label>
            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`curl -X POST ${window.location.origin}/api/v1/completion \\
  -H "Authorization: Bearer sk-mygenai-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI",
    "template": "blog-post"
  }'`}
              </pre>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(`curl -X POST ${window.location.origin}/api/v1/completion \\
  -H "Authorization: Bearer sk-mygenai-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI",
    "template": "blog-post"
  }'`);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="link" className="px-0" asChild>
            <a href="/docs" target="_blank">
              View full API documentation →
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
