import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModelUsage {
  model: string;
  requests: number;
  tokensInput: number;
  tokensOutput: number;
  credits: number;
}

export interface DailyUsage {
  date: string;
  requests: number;
  tokensInput: number;
  tokensOutput: number;
  credits: number;
}

export interface AiUsageStats {
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCredits: number;
  modelUsage: ModelUsage[];
  dailyUsage: DailyUsage[];
}

export function useAiUsageStats(days: number = 30) {
  return useQuery({
    queryKey: ['ai-usage-stats', days],
    queryFn: async (): Promise<AiUsageStats> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('credit_usage')
        .select('model_used, tokens_input, tokens_output, credits_consumed, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Aggregate by model
      const modelMap = new Map<string, ModelUsage>();
      const dailyMap = new Map<string, DailyUsage>();

      let totalRequests = 0;
      let totalTokensInput = 0;
      let totalTokensOutput = 0;
      let totalCredits = 0;

      (data || []).forEach((row) => {
        const model = row.model_used || 'unknown';
        const tokensIn = row.tokens_input || 0;
        const tokensOut = row.tokens_output || 0;
        const credits = row.credits_consumed || 0;

        // Update totals
        totalRequests++;
        totalTokensInput += tokensIn;
        totalTokensOutput += tokensOut;
        totalCredits += credits;

        // Update model usage
        const existing = modelMap.get(model);
        if (existing) {
          existing.requests++;
          existing.tokensInput += tokensIn;
          existing.tokensOutput += tokensOut;
          existing.credits += credits;
        } else {
          modelMap.set(model, {
            model,
            requests: 1,
            tokensInput: tokensIn,
            tokensOutput: tokensOut,
            credits,
          });
        }

        // Update daily usage
        const dateKey = new Date(row.created_at || '').toISOString().split('T')[0];
        const dailyExisting = dailyMap.get(dateKey);
        if (dailyExisting) {
          dailyExisting.requests++;
          dailyExisting.tokensInput += tokensIn;
          dailyExisting.tokensOutput += tokensOut;
          dailyExisting.credits += credits;
        } else {
          dailyMap.set(dateKey, {
            date: dateKey,
            requests: 1,
            tokensInput: tokensIn,
            tokensOutput: tokensOut,
            credits,
          });
        }
      });

      return {
        totalRequests,
        totalTokensInput,
        totalTokensOutput,
        totalCredits,
        modelUsage: Array.from(modelMap.values()).sort((a, b) => b.requests - a.requests),
        dailyUsage: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
  });
}
