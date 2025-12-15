import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Mail, 
  MessageSquare, 
  ShoppingBag, 
  Megaphone, 
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  PenTool,
  Newspaper,
  Send,
  Star,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  popular: boolean;
}

const categories: Category[] = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "social", label: "Social Media", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "seo", label: "SEO", icon: Globe },
];

const templates: Template[] = [
  { 
    id: "blog-post", 
    name: "Blog Post Writer", 
    description: "Generate engaging, SEO-optimized blog articles on any topic", 
    category: "blog", 
    icon: PenTool,
    popular: true 
  },
  { 
    id: "blog-outline", 
    name: "Blog Outline", 
    description: "Create structured outlines for your blog posts", 
    category: "blog", 
    icon: FileText,
    popular: false 
  },
  { 
    id: "linkedin-post", 
    name: "LinkedIn Post", 
    description: "Create professional thought leadership content", 
    category: "social", 
    icon: Linkedin,
    popular: true 
  },
  { 
    id: "twitter-thread", 
    name: "Twitter Thread", 
    description: "Craft viral Twitter threads that engage your audience", 
    category: "social", 
    icon: Twitter,
    popular: true 
  },
  { 
    id: "instagram-caption", 
    name: "Instagram Caption", 
    description: "Write captivating captions with relevant hashtags", 
    category: "social", 
    icon: Instagram,
    popular: false 
  },
  { 
    id: "youtube-script", 
    name: "YouTube Script", 
    description: "Generate engaging video scripts with hooks and CTAs", 
    category: "social", 
    icon: Youtube,
    popular: false 
  },
  { 
    id: "email-newsletter", 
    name: "Email Newsletter", 
    description: "Write compelling newsletters that drive engagement", 
    category: "email", 
    icon: Mail,
    popular: true 
  },
  { 
    id: "welcome-email", 
    name: "Welcome Email", 
    description: "Onboard new subscribers with a warm welcome", 
    category: "email", 
    icon: Send,
    popular: false 
  },
  { 
    id: "cold-email", 
    name: "Cold Email", 
    description: "Write personalized outreach emails that get responses", 
    category: "email", 
    icon: Mail,
    popular: false 
  },
  { 
    id: "product-description", 
    name: "Product Description", 
    description: "Sell products with persuasive, benefit-driven copy", 
    category: "ecommerce", 
    icon: ShoppingBag,
    popular: true 
  },
  { 
    id: "facebook-ad", 
    name: "Facebook Ad", 
    description: "High-converting ad copy for Facebook campaigns", 
    category: "ads", 
    icon: Megaphone,
    popular: true 
  },
  { 
    id: "google-ad", 
    name: "Google Ad", 
    description: "Search ad headlines and descriptions that convert", 
    category: "ads", 
    icon: Globe,
    popular: true 
  },
  { 
    id: "meta-description", 
    name: "Meta Description", 
    description: "SEO-optimized meta descriptions for better CTR", 
    category: "seo", 
    icon: Globe,
    popular: false 
  },
  { 
    id: "seo-keywords", 
    name: "SEO Keywords", 
    description: "Generate relevant keywords for your content strategy", 
    category: "seo", 
    icon: Search,
    popular: false 
  },
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateClick = (templateId: string) => {
    navigate(`/dashboard/create/${templateId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Choose a template to start generating content
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={activeCategory === category.id ? "gradient-primary text-white" : ""}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card 
                key={template.id} 
                className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg"
                onClick={() => handleTemplateClick(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {template.popular && (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or category filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
