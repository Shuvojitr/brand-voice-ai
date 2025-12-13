import { DashboardLayout } from "@/components/dashboard";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const templateData: Record<string, { name: string; description: string }> = {
  "blog-post": { name: "Blog Post Writer", description: "Generate engaging, SEO-optimized blog articles" },
  "blog-outline": { name: "Blog Outline", description: "Create structured outlines for your blog posts" },
  "linkedin-post": { name: "LinkedIn Post", description: "Create professional thought leadership content" },
  "twitter-thread": { name: "Twitter Thread", description: "Craft viral Twitter threads" },
  "instagram-caption": { name: "Instagram Caption", description: "Write captivating captions with hashtags" },
  "youtube-script": { name: "YouTube Script", description: "Generate engaging video scripts" },
  "email-newsletter": { name: "Email Newsletter", description: "Write compelling newsletters" },
  "welcome-email": { name: "Welcome Email", description: "Onboard new subscribers" },
  "cold-email": { name: "Cold Email", description: "Write personalized outreach emails" },
  "product-description": { name: "Product Description", description: "Sell with persuasive copy" },
  "facebook-ad": { name: "Facebook Ad", description: "High-converting Facebook ad copy" },
  "google-ad": { name: "Google Ad", description: "Search ad headlines and descriptions" },
  "meta-description": { name: "Meta Description", description: "SEO-optimized meta descriptions" },
  "seo-keywords": { name: "SEO Keywords", description: "Generate relevant keywords" },
};

export default function CreateContent() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const template = templateId ? templateData[templateId] : null;

  if (!template) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground mt-1">{template.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Generation</CardTitle>
            <CardDescription>
              Fill in the details below to generate your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Content generation form will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
