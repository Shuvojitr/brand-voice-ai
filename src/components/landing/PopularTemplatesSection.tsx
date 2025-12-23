import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Icon } from "lucide-react";
import * as Icons from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  slug: string;
}

const getIconComponent = (iconName: string | null) => {
  if (!iconName) return Icons.FileText;
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.FileText;
};

export function PopularTemplatesSection() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["popular-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id, name, description, icon, category, slug")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8);

      if (error) throw error;
      return data as Template[];
    },
  });

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Templates
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            What Can You Create{" "}
            <span className="gradient-text">Today?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Start with a professionally crafted template for blogs, social media, emails, and more.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {templates?.map((template, index) => {
              const IconComponent = getIconComponent(template.icon);
              return (
                <Link
                  key={template.id}
                  to="/signup"
                  className="group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Card className="relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/70 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center text-primary-foreground">
                        <span className="font-semibold text-lg">Try this template</span>
                        <ArrowRight className="h-5 w-5 mx-auto mt-2" />
                      </div>
                    </div>
                    
                    <CardContent className="p-5">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-base mb-1 line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description || `Generate ${template.category} content with AI`}
                      </p>
                      <Badge variant="secondary" className="mt-3 text-xs capitalize">
                        {template.category}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" asChild className="group">
            <Link to="/signup">
              View All 50+ Templates
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
