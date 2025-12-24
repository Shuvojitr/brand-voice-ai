import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import { useFaqs } from "@/hooks/useFaqs";

export function FAQSection() {
  const { data: faqs, isLoading } = useFaqs();

  // Don't render section if no FAQs
  if (!isLoading && (!faqs || faqs.length === 0)) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] items-start">
            {/* FAQ Accordion */}
            <div>
              <div className="mb-8">
                <Badge variant="outline" className="mb-4">FAQ</Badge>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                  Frequently Asked{" "}
                  <span className="gradient-text">Questions</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Everything you need to know about our platform.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id}
                    className="border border-border rounded-lg mb-3 px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Support CTA */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Still have questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:support@mygenai.com">Contact Support</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
