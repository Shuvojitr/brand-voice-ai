import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Loader2, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTemplate, getFormFields } from "@/hooks/useTemplates";
import { ContentEditor } from "@/components/content/ContentEditor";
import { useOrganization } from "@/hooks/useOrganization";
import { User } from "@supabase/supabase-js";
import type { TemplateInputField } from "@/lib/types/ai";

export default function CreateContent() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [inputs, setInputs] = useState<Record<string, string | number | boolean>>({});
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [brandVoiceId, setBrandVoiceId] = useState<string | null>(null);
  const [brandVoices, setBrandVoices] = useState<Array<{ id: string; name: string }>>([]);
  const [activeModel, setActiveModel] = useState<string>("google/gemini-2.5-flash");
  
  // Use organization hook to get credits and invalidate after generation
  const { invalidate: invalidateOrganization } = useOrganization();

  // Fetch template from database
  const { data: template, isLoading: templateLoading, error: templateError } = useTemplate(templateId);

  // Initialize auth and organization
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Get user's organization
        const { data: membership } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();
        
        if (membership) {
          setOrganizationId(membership.organization_id);
          
          // Fetch brand voices
          const { data: voices } = await supabase
            .from("brand_voices")
            .select("id, name")
            .eq("organization_id", membership.organization_id);
          
          if (voices) {
            setBrandVoices(voices);
          }
        }
      }
      
      // Fetch active AI provider to get the model being used
      const { data: activeProvider } = await supabase
        .from("ai_provider_settings")
        .select("default_model, provider_slug")
        .eq("is_active", true)
        .maybeSingle();
      
      if (activeProvider?.default_model) {
        setActiveModel(activeProvider.default_model);
      }
    };
    
    initAuth();
  }, []);

  // Initialize default values for inputs when template loads
  useEffect(() => {
    if (template?.form_schema_json) {
      const defaults: Record<string, string | number | boolean> = {};
      const formFields = getFormFields(template);
      formFields.forEach((input) => {
        if (input.defaultValue !== undefined) {
          defaults[input.id] = input.defaultValue;
        }
      });
      setInputs(defaults);
    }
  }, [template]);

  const handleInputChange = (inputId: string, value: string | number | boolean) => {
    setInputs(prev => ({ ...prev, [inputId]: value }));
  };

  // Track generation completion for auto-save
  const [shouldAutoSave, setShouldAutoSave] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!template || !organizationId || !user) {
      toast({
        title: "Error",
        description: "Please complete setup before generating content.",
        variant: "destructive",
      });
      return;
    }

    const formFields = getFormFields(template);

    // Validate required inputs
    const missingRequired = formFields
      .filter(input => input.required && !inputs[input.id])
      .map(input => input.label);

    if (missingRequired.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequired.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setShouldAutoSave(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            templateId: template.slug,
            inputs,
            brandVoiceId: brandVoiceId || undefined,
            language,
            organizationId,
            stream: true,
          }),
        }
      );

      // Handle credit errors specifically
      if (response.status === 402) {
        toast({
          title: "Insufficient Credits",
          description: "You don't have enough credits. Please upgrade your plan.",
          variant: "destructive",
        });
        navigate("/dashboard/billing");
        return;
      }

      if (response.status === 429) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setGeneratedContent(fullContent);
            }
          } catch {
            // Incomplete JSON, skip
          }
        }
      }

      // Mark for auto-save after successful generation
      setShouldAutoSave(true);
      
      // Refresh organization data to update credit balance in UI
      invalidateOrganization();

      toast({
        title: "Content generated!",
        description: "Your content has been auto-saved.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [template, inputs, language, brandVoiceId, organizationId, user, toast, navigate, invalidateOrganization]);

  // Loading state
  if (templateLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <Skeleton className="h-96" />
            </div>
            <div className="w-full md:w-1/2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!template || templateError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-2xl font-bold mb-4">Template not found</h1>
          <Button onClick={() => navigate("/dashboard/templates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formFields = getFormFields(template);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>

        {/* Split Layout - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Input Form */}
          <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Settings</CardTitle>
              <CardDescription>
                Configure your content parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dynamic Inputs */}
              {formFields.map((input) => (
                <FormInput
                  key={input.id}
                  input={input}
                  value={inputs[input.id]}
                  language={language}
                  onChange={(value) => handleInputChange(input.id, value)}
                />
              ))}

              <Separator />

              {/* Language Selector */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "bn")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Voice Selector */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Brand Voice
                </Label>
                <Select 
                  value={brandVoiceId || "none"} 
                  onValueChange={(v) => setBrandVoiceId(v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand voice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No brand voice</SelectItem>
                    {brandVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Apply your brand's unique tone and style
                </p>
              </div>

              <Separator />

              {/* Generate Button */}
              <Button
                className="w-full h-12 gradient-primary text-white text-base"
                onClick={handleGenerate}
                disabled={isGenerating || !organizationId}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {!organizationId && (
                <p className="text-sm text-amber-600 text-center">
                  Complete your account setup to start generating content.
                </p>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Right Column - Editor */}
          <div className="w-full md:w-1/2">
            <ContentEditor
              content={generatedContent}
              isGenerating={isGenerating}
              organizationId={organizationId}
              userId={user?.id}
              templateId={templateId}
              autoSave={shouldAutoSave}
              onAutoSaveComplete={() => setShouldAutoSave(false)}
              onCreditsDeducted={invalidateOrganization}
              modelUsed={activeModel}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Dynamic form input component
interface FormInputProps {
  input: TemplateInputField;
  value: string | number | boolean | undefined;
  language: "en" | "bn";
  onChange: (value: string | number | boolean) => void;
}

function FormInput({
  input,
  value,
  language,
  onChange,
}: FormInputProps) {
  const label = language === "bn" && input.labelBn ? input.labelBn : input.label;
  const placeholder = language === "bn" && input.placeholderBn ? input.placeholderBn : input.placeholder;

  switch (input.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {input.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={input.maxLength}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {input.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={input.maxLength}
            rows={4}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label>
            {label}
            {input.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) || input.defaultValue?.toString()}
            onValueChange={onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {language === "bn" && option.labelBn ? option.labelBn : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "toggle":
      return (
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <Switch
            checked={value as boolean}
            onCheckedChange={onChange}
          />
        </div>
      );

    default:
      return null;
  }
}
