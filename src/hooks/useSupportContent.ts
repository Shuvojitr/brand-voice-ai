import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface SupportProTip {
  title: string;
  description: string;
  shortcut?: string;
}

export interface SupportResource {
  id: string;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  isInternal: boolean;
}

export interface SupportContact {
  liveChat: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
  };
  email: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    href: string;
  };
}

export interface SupportStatus {
  enabled: boolean;
  text: string;
  statusUrl: string;
}

export interface SupportContentData {
  proTip: SupportProTip;
  resources: SupportResource[];
  contact: SupportContact;
  status: SupportStatus;
}

const DEFAULT_SUPPORT_CONTENT: SupportContentData = {
  proTip: {
    title: "Pro Tip",
    description: "Use keyboard shortcut ⌘K to quickly search for any tool.",
    shortcut: "⌘K",
  },
  resources: [
    {
      id: "1",
      icon: "BookOpen",
      title: "Getting Started Guide",
      description: "Learn the basics of using MyGenAI and create your first content.",
      buttonText: "Read Guide",
      href: "/dashboard/getting-started",
      isInternal: true,
    },
    {
      id: "2",
      icon: "HelpCircle",
      title: "FAQs",
      description: "Find answers to the most commonly asked questions.",
      buttonText: "View FAQs",
      href: "#faqs",
      isInternal: false,
    },
    {
      id: "3",
      icon: "FileText",
      title: "API Documentation",
      description: "Integrate MyGenAI into your own applications.",
      buttonText: "View Docs",
      href: "/docs",
      isInternal: true,
    },
  ],
  contact: {
    liveChat: {
      enabled: true,
      title: "Live Chat",
      description: "Chat with our support team in real-time.",
      buttonText: "Start Chat",
    },
    email: {
      enabled: true,
      title: "Email Support",
      description: "Send us an email and we'll get back to you within 24 hours.",
      buttonText: "Send Email",
      href: "/dashboard/support/email",
    },
  },
  status: {
    enabled: true,
    text: "All systems operational",
    statusUrl: "https://status.mygenai.com",
  },
};

export function useSupportContent() {
  return useQuery({
    queryKey: ["support-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .eq("section_key", "support_page")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (!data) {
        return DEFAULT_SUPPORT_CONTENT;
      }
      
      return data.content as unknown as SupportContentData;
    },
  });
}

export function useUpdateSupportContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: SupportContentData) => {
      // Check if section exists
      const { data: existing } = await supabase
        .from("homepage_content")
        .select("id")
        .eq("section_key", "support_page")
        .single();

      const contentJson = content as unknown as Json;

      if (existing) {
        const { data, error } = await supabase
          .from("homepage_content")
          .update({
            content: contentJson,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("homepage_content")
          .insert([{
            section_key: "support_page",
            content: contentJson,
            is_active: true,
            sort_order: 100,
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-content"] });
      toast({ title: "Support page content saved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to save support page content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export { DEFAULT_SUPPORT_CONTENT };
