import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Image, Twitter, Save, Loader2, Upload, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSeo() {
  const { settings, isLoading, updateSettings } = useSiteSettings();
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setSeoTitle(settings.seo_title || "");
      setSeoDescription(settings.seo_description || "");
      setSeoKeywords(settings.seo_keywords || "");
      setOgImageUrl(settings.og_image_url || "");
      setTwitterHandle(settings.twitter_handle || "");
    }
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `og-image-${Date.now()}.${fileExt}`;
      const filePath = `seo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setOgImageUrl(urlData.publicUrl);
      toast.success("OG Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        og_image_url: ogImageUrl || null,
        twitter_handle: twitterHandle || null,
      });
      toast.success("SEO settings saved successfully");
    } catch (error) {
      toast.error("Failed to save SEO settings");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SEO Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your website's search engine optimization metadata.
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Basic SEO
              </CardTitle>
              <CardDescription>
                Configure title, description, and keywords for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  placeholder="MyGenAI - AI Content Generator"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {seoTitle.length}/60 characters. This appears in browser tabs and search results.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Meta Description</Label>
                <Textarea
                  id="seo-description"
                  placeholder="AI-powered content creation platform that helps you create engaging content in seconds."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {seoDescription.length}/160 characters. Shown in search result snippets.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  placeholder="AI, content generator, writing assistant"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords for search engines.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Social Media
              </CardTitle>
              <CardDescription>
                Configure how your site appears when shared on social platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-handle">Twitter Handle</Label>
                <Input
                  id="twitter-handle"
                  placeholder="@MyGenAI"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your Twitter/X username for Twitter Cards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* OG Image */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Open Graph Image
              </CardTitle>
              <CardDescription>
                The image shown when your site is shared on social media. Recommended size: 1200x630px.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="og-image-url">OG Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="og-image-url"
                      placeholder="https://example.com/og-image.png"
                      value={ogImageUrl}
                      onChange={(e) => setOgImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    {ogImageUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOgImageUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Label
                      htmlFor="og-image-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span className="text-sm">Upload Image</span>
                      </div>
                      <input
                        id="og-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </Label>
                  </div>
                </div>

                {ogImageUrl && (
                  <div className="md:w-80">
                    <Label>Preview</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden aspect-[1200/630] bg-muted">
                      <img
                        src={ogImageUrl}
                        alt="OG Image Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Result Preview</CardTitle>
            <CardDescription>
              This is how your site might appear in Google search results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-background max-w-xl">
              <div className="text-sm text-muted-foreground truncate">
                {typeof window !== "undefined" ? window.location.origin : "https://yoursite.com"}
              </div>
              <div className="text-lg text-primary font-medium truncate mt-1">
                {seoTitle || "MyGenAI - AI Content Generator"}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {seoDescription || "AI-powered content creation platform that helps you create engaging content in seconds."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
