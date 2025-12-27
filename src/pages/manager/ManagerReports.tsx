import { ManagerLayout } from "@/components/manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates } from "@/hooks/useTemplates";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useFaqs } from "@/hooks/useFaqs";
import { usePages } from "@/hooks/usePages";
import { FileText, FileStack, MessageSquareQuote, HelpCircle, CheckCircle, XCircle } from "lucide-react";

export default function ManagerReports() {
  const { data: templates } = useTemplates(true);
  const { data: testimonials } = useTestimonials();
  const { data: faqs } = useFaqs();
  const { data: pages } = usePages();

  const activeTemplates = templates?.filter(t => t.is_active).length || 0;
  const inactiveTemplates = (templates?.length || 0) - activeTemplates;

  const activeTestimonials = testimonials?.filter(t => t.is_active).length || 0;
  const featuredTestimonials = testimonials?.filter(t => t.is_featured).length || 0;

  const activeFaqs = faqs?.filter(f => f.is_active).length || 0;
  const faqsByCategory = faqs?.reduce((acc, faq) => {
    const cat = faq.category || "general";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const publishedPages = pages?.filter(p => p.is_published).length || 0;
  const draftPages = (pages?.length || 0) - publishedPages;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Reports</h1>
          <p className="text-muted-foreground mt-1">
            Overview of content statistics and metrics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{activeTemplates} active</span>
                {inactiveTemplates > 0 && (
                  <span className="text-red-600"> · {inactiveTemplates} inactive</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileStack className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{publishedPages} published</span>
                {draftPages > 0 && (
                  <span className="text-yellow-600"> · {draftPages} drafts</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
              <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testimonials?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{activeTestimonials} active</span>
                {featuredTestimonials > 0 && (
                  <span className="text-blue-600"> · {featuredTestimonials} featured</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqs?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{activeFaqs} active</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Templates by Category</CardTitle>
              <CardDescription>Distribution of templates across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  templates?.reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>) || {}
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
                {(!templates || templates.length === 0) && (
                  <p className="text-sm text-muted-foreground">No templates yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQs by Category</CardTitle>
              <CardDescription>Distribution of FAQs across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(faqsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
                {Object.keys(faqsByCategory).length === 0 && (
                  <p className="text-sm text-muted-foreground">No FAQs yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Status Summary</CardTitle>
            <CardDescription>Quick overview of all content items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Templates</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" /> {activeTemplates}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3 w-3" /> {inactiveTemplates}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileStack className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pages</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" /> {publishedPages}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <XCircle className="h-3 w-3" /> {draftPages}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquareQuote className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Testimonials</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" /> {activeTestimonials}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      ★ {featuredTestimonials}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">FAQs</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" /> {activeFaqs}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3 w-3" /> {(faqs?.length || 0) - activeFaqs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
