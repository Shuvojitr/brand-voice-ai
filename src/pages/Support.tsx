import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFaqs } from "@/hooks/useFaqs";
import { useSupportContent } from "@/hooks/useSupportContent";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Zap, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  MessageCircle, 
  Mail,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  HelpCircle,
  FileText,
  MessageCircle,
  Mail,
  Zap,
};

export default function Support() {
  const { data: faqs, isLoading: faqsLoading } = useFaqs();
  const { data: supportContent, isLoading: contentLoading } = useSupportContent();

  const scrollToFaqs = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "#faqs") {
      e.preventDefault();
      document.getElementById("faqs")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isLoading = faqsLoading || contentLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with MyGenAI and find answers to your questions.
          </p>
        </div>

        {/* Pro Tip Banner */}
        {supportContent?.proTip && (
          <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{supportContent.proTip.title}</p>
                <p className="text-sm text-muted-foreground">
                  {supportContent.proTip.shortcut ? (
                    <>
                      {supportContent.proTip.description.replace(supportContent.proTip.shortcut, "")}
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
                        {supportContent.proTip.shortcut}
                      </kbd>
                    </>
                  ) : (
                    supportContent.proTip.description
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resources Section */}
        {supportContent?.resources && supportContent.resources.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Resources</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {supportContent.resources.map((resource) => {
                const IconComponent = iconMap[resource.icon] || FileText;
                return (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {resource.isInternal ? (
                        <Button asChild variant="outline" className="w-full">
                          <Link to={resource.href}>
                            {resource.buttonText}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full">
                          <a href={resource.href} onClick={(e) => scrollToFaqs(e, resource.href)}>
                            {resource.buttonText}
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact Support Section */}
        {supportContent?.contact && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Support</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {supportContent.contact.liveChat.enabled && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supportContent.contact.liveChat.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {supportContent.contact.liveChat.description}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">{supportContent.contact.liveChat.buttonText}</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {supportContent.contact.email.enabled && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supportContent.contact.email.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {supportContent.contact.email.description}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link to={supportContent.contact.email.href}>
                          {supportContent.contact.email.buttonText}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* FAQs Section */}
        <div id="faqs" className="space-y-4 scroll-mt-8">
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          
          {faqsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-sm transition-shadow">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium list-none">
                      {faq.question}
                      <span className="ml-4 shrink-0 transition-transform group-open:rotate-180">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No FAQs available at the moment.
              </CardContent>
            </Card>
          )}
        </div>

        {/* System Status */}
        {supportContent?.status?.enabled && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{supportContent.status.text}</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <a href={supportContent.status.statusUrl} target="_blank" rel="noopener noreferrer">
                    View Status Page
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
