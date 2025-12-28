import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, Mail, Sparkles, Share2 } from "lucide-react";
import { useHomepageContent, UseCasesContent } from "@/hooks/useHomepageContent";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, MessageSquare, Mail, Share2, Sparkles
};

const defaultUseCases = [
  {
    id: "blog",
    label: "Blog Post",
    icon: "FileText",
    title: "10 Productivity Hacks That Actually Work",
    content: `In today's fast-paced world, productivity isn't just about working harder—it's about working smarter.

**1. The Two-Minute Rule**
If a task takes less than two minutes, do it immediately.

**2. Time Blocking**
Dedicate specific hours to specific types of work.

Ready to transform your workday? Start with just one technique.`,
  },
  {
    id: "social",
    label: "Social Media",
    icon: "MessageSquare",
    title: "LinkedIn Post",
    content: `🚀 The #1 mistake I see founders make?

Building in silence.

→ Share your journey, not just wins
→ Ask for feedback early and often
→ Your network is your net worth

#startup #founders #buildinpublic`,
  },
  {
    id: "email",
    label: "Email Copy",
    icon: "Mail",
    title: "Product Launch Email",
    content: `Subject: You asked, we built it ✨

Hi [Name],

Introducing **ContentAI Pro** — the AI writing assistant that understands your brand voice.

**What's new:**
• 50+ templates for any content type
• Brand voice training in 3 clicks

[Start Your Free Trial →]`,
  },
];

export function UseCasesSection() {
  const { useCases: useCasesContent, isLoading } = useHomepageContent();
  const [activeTab, setActiveTab] = useState("blog");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<number | null>(null);

  const useCasesData = (useCasesContent as UseCasesContent | null)?.cases || defaultUseCases;
  const sectionTitle = (useCasesContent as UseCasesContent | null)?.title || "See It In Action";
  const sectionDescription = (useCasesContent as UseCasesContent | null)?.description || "Watch AI create professional content for any platform in seconds.";

  const activeUseCase = useCasesData.find((uc) => uc.id === activeTab) || useCasesData[0];

  useEffect(() => {
    if (useCasesData.length > 0 && !useCasesData.find(uc => uc.id === activeTab)) {
      setActiveTab(useCasesData[0].id);
    }
  }, [useCasesData, activeTab]);

  useEffect(() => {
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    setDisplayedText("");
    setIsTyping(true);

    const fullText = activeUseCase?.content || "";
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        const delay = fullText[currentIndex - 1] === "\n" ? 80 : Math.random() * 20 + 10;
        typingRef.current = window.setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    typingRef.current = window.setTimeout(typeNextChar, 300);

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [activeTab, activeUseCase]);

  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4">Use Cases</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {sectionTitle.includes("Action") ? (
              <>See It In <span className="gradient-text">Action</span></>
            ) : (
              sectionTitle
            )}
          </h2>
          <p className="text-muted-foreground text-lg">
            {sectionDescription}
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            {/* Tabs on left */}
            <div className="flex flex-row lg:flex-col gap-2">
              {useCasesData.map((useCase) => {
                const IconComponent = iconMap[useCase.icon] || FileText;
                return (
                  <button
                    key={useCase.id}
                    onClick={() => setActiveTab(useCase.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === useCase.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium hidden sm:inline">{useCase.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mock Editor Window on right */}
            <div className="relative rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-medium">
                  {activeUseCase?.title}
                </span>
                {isTyping && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-primary">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>AI Writing...</span>
                  </div>
                )}
              </div>

              {/* Editor Content */}
              <div className="p-6 min-h-[350px] font-mono text-sm leading-relaxed">
                <div className="whitespace-pre-wrap text-foreground/90">
                  {displayedText.split("\n").map((line, i) => {
                    // Handle bold markdown
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <div key={i} className={line === "" ? "h-4" : ""}>
                        {parts.map((part, j) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <span key={j} className="font-bold text-foreground">
                                {part.slice(2, -2)}
                              </span>
                            );
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </div>
                    );
                  })}
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
