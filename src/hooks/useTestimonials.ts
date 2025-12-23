import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  user_name: string;
  user_role: string | null;
  user_avatar: string | null;
  review_text: string;
  rating: number | null;
  is_featured: boolean | null;
  sort_order: number | null;
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
}
