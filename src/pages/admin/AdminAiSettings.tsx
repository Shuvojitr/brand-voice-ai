import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiProviderSettings, AiProviderSetting } from "@/hooks/useAiProviderSettings";
import { AiUsageStats } from "@/components/admin/AiUsageStats";
import { 
  Bot, Key, Settings2, CheckCircle, ExternalLink, Eye, EyeOff, 
  Loader2, Zap, Sparkles, Shield, Globe, Cpu, BarChart3 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const providerInfo: Record<string, { 
  description: string; 
  docsUrl: string; 
  models: string[];
  icon: string;
  color: string;
}> = {
  lovable: {
    description: "Built-in AI gateway with pre-configured access. No API key required.",
    docsUrl: "https://docs.lovable.dev/features/ai",
    models: ["google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-5", "openai/gpt-5-mini"],
    icon: "💜",
    color: "from-violet-500 to-purple-600",
  },
  openai: {
    description: "OpenAI's GPT models for powerful language generation.",
    docsUrl: "https://platform.openai.com/api-keys",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    icon: "🤖",
    color: "from-emerald-500 to-teal-600",
  },
  google: {
    description: "Google's Gemini models with multimodal capabilities.",
    docsUrl: "https://aistudio.google.com/app/apikey",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    icon: "🔮",
    color: "from-blue-500 to-indigo-600",
  },
  anthropic: {
    description: "Anthropic's Claude models known for safety and helpfulness.",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    icon: "🧠",
    color: "from-orange-500 to-amber-600",
  },
  deepseek: {
    description: "DeepSeek's efficient and capable language models.",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: ["deepseek-chat", "deepseek-coder"],
    icon: "🌊",
    color: "from-cyan-500 to-sky-600",
  },
  openrouter: {
    description: "Access multiple AI models through a single API.",
    docsUrl: "https://openrouter.ai/keys",
    models: ["openai/gpt-4o", "anthropic/claude-3-opus", "meta-llama/llama-3-70b"],
    icon: "🌐",
    color: "from-pink-500 to-rose-600",
  },
  mistral: {
    description: "Mistral AI's open and efficient language models.",
    docsUrl: "https://console.mistral.ai/api-keys",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
    icon: "🌬️",
    color: "from-slate-500 to-zinc-600",
  },
  bytez: {
    description: "Bytez AI platform for various AI models.",
    docsUrl: "https://bytez.com",
    models: ["Qwen/Qwen2.5-72B-Instruct"],
    icon: "⚡",
    color: "from-yellow-500 to-orange-600",
  },
  agentrouter: {
    description: "AgentRouter API for unified access to multiple AI models.",
    docsUrl: "https://agentrouter.ai",
    models: ["google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-4o", "anthropic/claude-3-opus"],
    icon: "🚀",
    color: "from-fuchsia-500 to-purple-600",
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
    models: [],
    icon: "🤖",
    color: "from-gray-500 to-gray-600",
  };
  const hasApiKey = !!provider.api_key_encrypted;
  const isLovable = provider.provider_slug === 'lovable';

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover-lift border-0 ${
      provider.is_active 
        ? 'ring-2 ring-primary shadow-glow' 
        : 'bg-card/50 hover:bg-card'
    }`}>
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Active indicator */}
      {provider.is_active && (
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      )}

      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} shadow-lg`}>
              <span className="text-2xl">{info.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{provider.provider_name}</h3>
                {provider.is_active && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {info.description}
              </p>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            isLovable || hasApiKey 
              ? 'bg-success/10 text-success' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {isLovable ? (
              <>
                <Shield className="h-3 w-3" />
                <span>Pre-configured</span>
              </>
            ) : hasApiKey ? (
              <>
                <Key className="h-3 w-3" />
                <span>API key set</span>
              </>
            ) : (
              <>
                <Key className="h-3 w-3" />
                <span>No API key</span>
              </>
            )}
          </div>

          {provider.default_model && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              <Cpu className="h-3 w-3" />
              <span className="font-mono">{provider.default_model}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {!isLovable && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onConfigure} 
              className="flex-1 h-9"
            >
              <Settings2 className="h-4 w-4 mr-1.5" />
              Configure
            </Button>
          )}
          
          {(isLovable || hasApiKey) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTest} 
              disabled={isTesting}
              className="flex-1 h-9"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-1.5" />
              )}
              Test
            </Button>
          )}
          
          {!provider.is_active && (isLovable || hasApiKey) && (
            <Button 
              size="sm" 
              onClick={onActivate} 
              disabled={isActivating}
              className="flex-1 h-9 gradient-primary text-white border-0"
            >
              {isActivating ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              Activate
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" asChild>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${info?.color || 'from-gray-500 to-gray-600'}`}>
              <span className="text-xl">{info?.icon || '🤖'}</span>
            </div>
            <div>
              <DialogTitle>Configure {provider.provider_name}</DialogTitle>
              <DialogDescription>
                Set up your API credentials
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={provider.api_key_encrypted ? "••••••••••••••••" : "Enter your API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            {provider.api_key_encrypted && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current API key
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">Default Model</Label>
            <Input
              id="model"
              placeholder="e.g., gpt-4o"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            {info?.models && info.models.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {info.models.map((m) => (
                  <Badge 
                    key={m} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors text-xs"
                    onClick={() => setModel(m)}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint" className="text-sm font-medium">
              API Endpoint <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="endpoint"
              placeholder={provider.api_endpoint || "Default endpoint"}
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gradient-primary text-white border-0">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
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

  const activeProvider = providers?.find(p => p.is_active);

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="p-6 lg:p-8 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-0 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
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
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold">AI Settings</h1>
              </div>
              <p className="text-muted-foreground">
                Configure and manage your AI providers. Only one provider can be active at a time.
              </p>
            </div>

            {/* Active Provider Badge */}
            {activeProvider && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Provider</p>
                  <p className="font-medium text-sm">{activeProvider.provider_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="providers" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="providers" className="gap-2 data-[state=active]:bg-background">
                <Globe className="h-4 w-4" />
                Providers
              </TabsTrigger>
              <TabsTrigger value="usage" className="gap-2 data-[state=active]:bg-background">
                <BarChart3 className="h-4 w-4" />
                Usage Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
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
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <AiUsageStats />
            </TabsContent>
          </Tabs>

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
