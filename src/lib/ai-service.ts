import { supabase } from '@/integrations/supabase/client';
import type { 
  GenerateContentRequest, 
  StreamCallbacks,
  AIModel 
} from './types/ai';

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`;

interface GenerateOptions {
  model?: AIModel;
  temperature?: number;
  stream?: boolean;
}

/**
 * AI Service - Abstraction layer for content generation
 * Supports streaming responses and multiple AI providers
 */
export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate content with streaming support
   */
  async generateContent(
    request: GenerateContentRequest,
    callbacks: StreamCallbacks,
    options: GenerateOptions = {}
  ): Promise<void> {
    const { templateId, inputs, brandVoiceId, language, organizationId } = request;
    const { model = 'google/gemini-2.5-flash', temperature = 0.7, stream = true } = options;

    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      callbacks.onError(new Error('Authentication required'));
      return;
    }

    try {
      const response = await fetch(GENERATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          templateId,
          inputs,
          brandVoiceId,
          language,
          organizationId,
          model,
          temperature,
          stream,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          callbacks.onError(new Error('Rate limit exceeded. Please try again later.'));
          return;
        }
        if (response.status === 402) {
          callbacks.onError(new Error('Insufficient credits. Please upgrade your plan.'));
          return;
        }
        
        callbacks.onError(new Error(errorData.error || 'Failed to generate content'));
        return;
      }

      if (stream && response.body) {
        await this.handleStreamResponse(response.body, callbacks);
      } else {
        const data = await response.json();
        callbacks.onToken(data.content);
        callbacks.onComplete(data.content);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  /**
   * Handle SSE streaming response
   */
  private async handleStreamResponse(
    body: ReadableStream<Uint8Array>,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            callbacks.onComplete(fullContent);
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              callbacks.onToken(content);
            }
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              callbacks.onToken(content);
            }
          } catch { /* ignore */ }
        }
      }

      callbacks.onComplete(fullContent);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Stream processing failed'));
    }
  }

  /**
   * Estimate credits for a template (default value, actual comes from DB)
   */
  estimateCredits(_templateId: string): number {
    return 10; // Default estimate - actual value fetched from database
  }

  /**
   * Get available models
   */
  getAvailableModels(): { id: AIModel; name: string; description: string }[] {
    return [
      {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini Flash',
        description: 'Fast & balanced - Best for most content',
      },
      {
        id: 'google/gemini-2.5-pro',
        name: 'Gemini Pro',
        description: 'Most capable - Complex reasoning & analysis',
      },
      {
        id: 'google/gemini-2.5-flash-lite',
        name: 'Gemini Lite',
        description: 'Fastest - Simple content & summaries',
      },
      {
        id: 'openai/gpt-5',
        name: 'GPT-5',
        description: 'Premium - Maximum accuracy & nuance',
      },
      {
        id: 'openai/gpt-5-mini',
        name: 'GPT-5 Mini',
        description: 'Balanced - Strong performance, lower cost',
      },
    ];
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Convenience function for direct usage
export async function generateContent(
  request: GenerateContentRequest,
  callbacks: StreamCallbacks,
  options?: GenerateOptions
): Promise<void> {
  return aiService.generateContent(request, callbacks, options);
}
