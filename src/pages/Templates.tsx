import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Mail, MessageSquare, ShoppingBag, Megaphone, Globe } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "social", label: "Social Media", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "seo", label: "SEO", icon: Globe },
];

const templates = [
  { id: "blog-post", name: "Blog Post", description: "Generate engaging blog articles", category: "blog", popular: true },
  { id: "social-caption", name: "Social Caption", description: "Create viral social media posts", category: "social", popular: true },
  { id: "email-newsletter", name: "Email Newsletter", description: "Write compelling newsletters", category: "email", popular: false },
  { id: "product-description", name: "Product Description", description: "Sell with persuasive copy", category: "ecommerce", popular: true },
  { id: "facebook-ad", name: "Facebook Ad", description: "High-converting ad copy", category: "ads", popular: false },
  { id: "meta-description", name: "Meta Description", description: "SEO-optimized meta tags", category: "seo", popular: false },
  { id: "linkedin-post", name: "LinkedIn Post", description: "Professional thought leadership", category: "social", popular: false },
  { id: "welcome-email", name: "Welcome Email", description: "Onboard new subscribers", category: "email", popular: false },
  { id: "google-ad", name: "Google Ad", description: "Search ad headlines & descriptions", category: "ads", popular: true },
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={activeCategory === category.id ? "gradient-primary text-white" : ""}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.popular && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
