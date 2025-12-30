import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAiProviderSettings, AiProviderSetting } from "@/hooks/useAiProviderSettings";
import { Bot, Key, Settings2, CheckCircle, ExternalLink, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const providerInfo: Record<string, { description: string; docsUrl: string; models: string[] }> = {
  lovable: {
    description: "Built-in AI gateway with pre-configured access. No API key required.",
    docsUrl: "https://docs.lovable.dev/features/ai",
    models: ["google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-5", "openai/gpt-5-mini"],
  },
  openai: {
    description: "OpenAI's GPT models for powerful language generation.",
    docsUrl: "https://platform.openai.com/api-keys",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  google: {
    description: "Google's Gemini models with multimodal capabilities.",
    docsUrl: "https://aistudio.google.com/app/apikey",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  anthropic: {
    description: "Anthropic's Claude models known for safety and helpfulness.",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  },
  deepseek: {
    description: "DeepSeek's efficient and capable language models.",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: ["deepseek-chat", "deepseek-coder"],
  },
  openrouter: {
    description: "Access multiple AI models through a single API.",
    docsUrl: "https://openrouter.ai/keys",
    models: ["openai/gpt-4o", "anthropic/claude-3-opus", "meta-llama/llama-3-70b"],
  },
  mistral: {
    description: "Mistral AI's open and efficient language models.",
    docsUrl: "https://console.mistral.ai/api-keys",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
  },
  bytez: {
    description: "Bytez AI platform for various AI models.",
    docsUrl: "https://bytez.com",
    models: ["Qwen/Qwen2.5-72B-Instruct"],
  },
};

function ProviderCard({ 
  provider, 
  onConfigure, 
  onActivate,
  onTest,
  isActivating,
  isTesting,
}: { 
  provider: AiProviderSetting; 
  onConfigure: () => void;
  onActivate: () => void;
  onTest: () => void;
  isActivating: boolean;
  isTesting: boolean;
}) {
  const info = providerInfo[provider.provider_slug] || { 
    description: "AI provider", 
    docsUrl: "#",
    models: [] 
  };
  const hasApiKey = !!provider.api_key_encrypted;
  const isLovable = provider.provider_slug === 'lovable';

  return (
    <Card className={`relative transition-all ${provider.is_active ? 'ring-2 ring-primary' : ''}`}>
      {provider.is_active && (
        <Badge className="absolute -top-2 -right-2 bg-primary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.provider_name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {info.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Key className="h-4 w-4" />
          <span>
            {isLovable ? 'Pre-configured' : hasApiKey ? 'API key configured' : 'No API key set'}
          </span>
        </div>
        
        {provider.default_model && (
          <div className="text-sm">
            <span className="text-muted-foreground">Model: </span>
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{provider.default_model}</code>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!isLovable && (
            <Button variant="outline" size="sm" onClick={onConfigure} className="flex-1">
              <Settings2 className="h-4 w-4 mr-1" />
              Configure
            </Button>
          )}
          {(isLovable || hasApiKey) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onTest} 
              disabled={isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-1" />
              )}
              Test
            </Button>
          )}
          {!provider.is_active && (isLovable || hasApiKey) && (
            <Button 
              size="sm" 
              onClick={onActivate} 
              disabled={isActivating}
              className="flex-1"
            >
              Activate
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <a href={info.docsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigureDialog({ 
  provider, 
  open, 
  onOpenChange,
  onSave,
  isSaving
}: { 
  provider: AiProviderSetting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { api_key?: string; default_model?: string; api_endpoint?: string }) => void;
  isSaving: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(provider?.default_model || '');
  const [endpoint, setEndpoint] = useState(provider?.api_endpoint || '');
  const [showKey, setShowKey] = useState(false);

  const info = provider ? providerInfo[provider.provider_slug] : null;

  const handleSave = () => {
    onSave({
      api_key: apiKey || undefined,
      default_model: model || undefined,
      api_endpoint: endpoint || undefined,
    });
    setApiKey('');
    onOpenChange(false);
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {provider.provider_name}</DialogTitle>
          <DialogDescription>
            Set up your API key and default model for {provider.provider_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={provider.api_key_encrypted ? "••••••••••••••••" : "Enter your API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {provider.api_key_encrypted && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current API key
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Default Model</Label>
            <Input
              id="model"
              placeholder="e.g., gpt-4o"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            {info?.models && info.models.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {info.models.map((m) => (
                  <Badge 
                    key={m} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setModel(m)}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint (Optional)</Label>
            <Input
              id="endpoint"
              placeholder={provider.api_endpoint || "Default endpoint"}
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAiSettings() {
  const { providers, isLoading, updateProvider, activateProvider, isUpdating, isActivating } = useAiProviderSettings();
  const [configureProvider, setConfigureProvider] = useState<AiProviderSetting | null>(null);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  const handleSave = (data: { api_key?: string; default_model?: string; api_endpoint?: string }) => {
    if (configureProvider) {
      updateProvider({ id: configureProvider.id, ...data });
      setConfigureProvider(null);
    }
  };

  const handleTest = async (providerId: string) => {
    setTestingProviderId(providerId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to test providers");
        return;
      }

      const response = await supabase.functions.invoke('test-ai-provider', {
        body: { providerId },
      });

      if (response.error) {
        toast.error("Test failed: " + response.error.message);
        return;
      }

      const result = response.data;
      if (result.success) {
        toast.success(`API key verified! Response time: ${result.responseTime}ms`, {
          description: result.message?.substring(0, 100),
        });
      } else {
        toast.error("Test failed: " + result.error, {
          description: result.details,
        });
      }
    } catch (error) {
      toast.error("Test failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setTestingProviderId(null);
    }
  };

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">AI Settings</h1>
              <p className="text-muted-foreground">Configure your AI provider and API keys</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">AI Settings</h1>
            <p className="text-muted-foreground">
              Configure your AI provider and API keys. Only one provider can be active at a time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers?.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onConfigure={() => setConfigureProvider(provider)}
                onActivate={() => activateProvider(provider.id)}
                onTest={() => handleTest(provider.id)}
                isActivating={isActivating}
                isTesting={testingProviderId === provider.id}
              />
            ))}
          </div>

          <ConfigureDialog
            provider={configureProvider}
            open={!!configureProvider}
            onOpenChange={(open) => !open && setConfigureProvider(null)}
            onSave={handleSave}
            isSaving={isUpdating}
          />
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
