import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

export interface DailyUsage {
  date: string;
  requests: number;
  credits: number;
}

export interface TemplateUsage {
  template: string;
  count: number;
  credits: number;
}

export interface ApiUsageStats {
  totalRequests: number;
  totalCredits: number;
  dailyUsage: DailyUsage[];
  templateUsage: TemplateUsage[];
}

export const useApiUsageStats = (organizationId?: string, days: number = 30) => {
  return useQuery({
    queryKey: ['api-usage-stats', organizationId, days],
    queryFn: async (): Promise<ApiUsageStats> => {
      const startDate = subDays(new Date(), days);
      
      // Fetch credit usage for the organization
      const { data: usageData, error } = await supabase
        .from('credit_usage')
        .select('created_at, credits_consumed, template_type')
        .eq('organization_id', organizationId!)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Process data for daily usage
      const dailyMap = new Map<string, { requests: number; credits: number }>();
      const templateMap = new Map<string, { count: number; credits: number }>();
      
      // Initialize daily map with all days in range
      for (let i = 0; i <= days; i++) {
        const date = format(subDays(new Date(), days - i), 'yyyy-MM-dd');
        dailyMap.set(date, { requests: 0, credits: 0 });
      }
      
      let totalRequests = 0;
      let totalCredits = 0;
      
      (usageData || []).forEach((record) => {
        const date = format(new Date(record.created_at!), 'yyyy-MM-dd');
        const credits = record.credits_consumed || 0;
        const template = record.template_type || 'unknown';
        
        // Update daily usage
        const dailyEntry = dailyMap.get(date) || { requests: 0, credits: 0 };
        dailyEntry.requests += 1;
        dailyEntry.credits += credits;
        dailyMap.set(date, dailyEntry);
        
        // Update template usage
        const templateEntry = templateMap.get(template) || { count: 0, credits: 0 };
        templateEntry.count += 1;
        templateEntry.credits += credits;
        templateMap.set(template, templateEntry);
        
        totalRequests += 1;
        totalCredits += credits;
      });
      
      // Convert maps to arrays
      const dailyUsage: DailyUsage[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          requests: data.requests,
          credits: data.credits,
        }))
        .slice(-14); // Last 14 days for the chart
      
      const templateUsage: TemplateUsage[] = Array.from(templateMap.entries())
        .map(([template, data]) => ({
          template,
          count: data.count,
          credits: data.credits,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 templates
      
      return {
        totalRequests,
        totalCredits,
        dailyUsage,
        templateUsage,
      };
    },
    enabled: !!organizationId,
  });
};
