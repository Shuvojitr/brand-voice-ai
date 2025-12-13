import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const brandVoiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  language: z.enum(["en", "bn"]),
  styleInstructions: z.string().min(10, "Please provide style instructions (at least 10 characters)").max(2000),
  sampleText: z.string().max(5000).optional(),
  toneKeywords: z.array(z.string()).max(10),
  isDefault: z.boolean(),
});

type BrandVoiceFormData = z.infer<typeof brandVoiceSchema>;

interface BrandVoiceFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<BrandVoiceFormData> & { id?: string };
}

const PRESET_TONES = [
  "Professional",
  "Friendly",
  "Witty",
  "Formal",
  "Casual",
  "Authoritative",
  "Empathetic",
  "Inspirational",
  "Conversational",
  "Technical",
];

export function BrandVoiceForm({
  organizationId,
  onSuccess,
  onCancel,
  initialData,
}: BrandVoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const form = useForm<BrandVoiceFormData>({
    resolver: zodResolver(brandVoiceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      language: initialData?.language || "en",
      styleInstructions: initialData?.styleInstructions || "",
      sampleText: initialData?.sampleText || "",
      toneKeywords: initialData?.toneKeywords || [],
      isDefault: initialData?.isDefault || false,
    },
  });

  const toneKeywords = form.watch("toneKeywords");

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !toneKeywords.includes(trimmed) && toneKeywords.length < 10) {
      form.setValue("toneKeywords", [...toneKeywords, trimmed]);
    }
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    form.setValue(
      "toneKeywords",
      toneKeywords.filter((k) => k !== keyword)
    );
  };

  const analyzeText = async () => {
    const sampleText = form.getValues("sampleText");
    if (!sampleText || sampleText.length < 50) {
      toast.error("Please provide at least 50 characters of sample text to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          templateId: "analyze-voice",
          inputs: { sampleText },
          organizationId,
          skipCreditDeduction: true,
        },
      });

      if (error) throw error;

      if (data?.content) {
        form.setValue("styleInstructions", data.content);
        toast.success("Voice analyzed successfully!");
      }
    } catch (error) {
      console.error("Failed to analyze voice:", error);
      toast.error("Failed to analyze voice. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: BrandVoiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        language: data.language,
        style_instructions: data.styleInstructions,
        sample_text: data.sampleText || null,
        tone_keywords: data.toneKeywords,
        is_default: data.isDefault,
        organization_id: organizationId,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("brand_voices")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Brand voice updated successfully!");
      } else {
        const { error } = await supabase.from("brand_voices").insert(payload);
        if (error) throw error;
        toast.success("Brand voice created successfully!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save brand voice:", error);
      toast.error("Failed to save brand voice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {initialData?.id ? "Edit Brand Voice" : "Create Brand Voice"}
        </CardTitle>
        <CardDescription>
          Define your unique writing style for AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Corporate Professional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe when to use this voice..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Tone Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TONES.map((tone) => (
                  <Badge
                    key={tone}
                    variant={toneKeywords.includes(tone) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() =>
                      toneKeywords.includes(tone)
                        ? removeKeyword(tone)
                        : addKeyword(tone)
                    }
                  >
                    {tone}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword(newKeyword);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword(newKeyword)}
                  disabled={!newKeyword.trim()}
                >
                  Add
                </Button>
              </div>
              {toneKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {toneKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="sampleText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample Text (Optional)</FormLabel>
                  <FormDescription>
                    Paste your existing content to analyze and extract your writing style
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Paste a sample of your writing here..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={analyzeText}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze My Style
                        </>
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="styleInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style Instructions</FormLabel>
                  <FormDescription>
                    Describe your desired writing style in detail
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Write in a professional yet approachable tone. Use clear, concise sentences. Avoid jargon unless necessary. Include actionable insights..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-border"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Set as default voice
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                {onCancel && (
                  <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{initialData?.id ? "Update" : "Create"} Brand Voice</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
