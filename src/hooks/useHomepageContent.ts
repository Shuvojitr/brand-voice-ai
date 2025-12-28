import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions for each section
export interface HeroContent {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface UseCaseItem {
  id: string;
  label: string;
  icon: string;
  title: string;
  content: string;
}

export interface UseCasesContent {
  title: string;
  description: string;
  cases: UseCaseItem[];
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent {
  title: string;
  highlight: string;
  description: string;
  items: FeatureItem[];
}

export interface StepItem {
  step: string;
  title: string;
  description: string;
}

export interface HowItWorksContent {
  title: string;
  description: string;
  steps: StepItem[];
}

export interface CtaContent {
  title: string;
  description: string;
  buttonText: string;
  subtext: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  content: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useHomepageContent() {
  const queryClient = useQueryClient();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["homepage-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ sectionKey, content }: { sectionKey: string; content: any }) => {
      const { error } = await supabase
        .from("homepage_content")
        .update({ content })
        .eq("section_key", sectionKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-content"] });
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update section");
      console.error(error);
    },
  });

  // Helper to get content by section key
  const getSection = <T>(key: string): T | null => {
    const section = sections?.find((s) => s.section_key === key);
    return section?.content as T || null;
  };

  return {
    sections,
    isLoading,
    error,
    updateSection,
    getSection,
    hero: getSection<HeroContent>("hero"),
    useCases: getSection<UseCasesContent>("use_cases"),
    features: getSection<FeaturesContent>("features"),
    howItWorks: getSection<HowItWorksContent>("how_it_works"),
    cta: getSection<CtaContent>("cta"),
  };
}
