import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "@/hooks/useTemplates";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
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
  Search,
  Star,
};

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "social", label: "Social Media", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "product", label: "E-commerce", icon: ShoppingBag },
  { id: "seo", label: "SEO", icon: Globe },
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();
  
  const { data: templates, isLoading } = useTemplates();

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                           (template.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || template.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, search, activeCategory]);

  const handleTemplateClick = (templateSlug: string) => {
    navigate(`/dashboard/create/${templateSlug}`);
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-32 mt-3" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const IconComponent = iconMap[template.icon || 'FileText'] || FileText;
              const isPopular = template.tags?.includes('popular');
              
              return (
                <Card 
                  key={template.id} 
                  className="group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg"
                  onClick={() => handleTemplateClick(template.slug)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {isPopular && (
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
        )}

        {!isLoading && filteredTemplates.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center">
                {templates?.length === 0 
                  ? "No templates have been created yet. An admin can add templates from the Admin Dashboard."
                  : "Try adjusting your search or category filter."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
