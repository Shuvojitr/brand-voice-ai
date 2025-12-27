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
  is_active: boolean | null;
  sort_order: number | null;
}

export function useTestimonials(includeInactive = false) {
  return useQuery({
    queryKey: ["testimonials", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}
