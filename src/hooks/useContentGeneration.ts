import { useState, useCallback, useRef } from 'react';
import { generateContent } from '@/lib/ai-service';
import type { GenerateContentRequest, AIModel } from '@/lib/types/ai';
import { useToast } from '@/hooks/use-toast';

interface UseContentGenerationOptions {
  onComplete?: (content: string) => void;
}

export function useContentGeneration(options: UseContentGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  const { toast } = useToast();

  const generate = useCallback(async (
    request: GenerateContentRequest,
    model?: AIModel,
    temperature?: number
  ) => {
    setIsGenerating(true);
    setStreamedContent('');
    setError(null);
    abortRef.current = false;

    try {
      await generateContent(
        request,
        {
          onToken: (token) => {
            if (!abortRef.current) {
              setStreamedContent(prev => prev + token);
            }
          },
          onComplete: (fullContent) => {
            setIsGenerating(false);
            if (!abortRef.current) {
              options.onComplete?.(fullContent);
            }
          },
          onError: (err) => {
            setIsGenerating(false);
            setError(err.message);
            toast({
              title: 'Generation Failed',
              description: err.message,
              variant: 'destructive',
            });
          },
        },
        { model, temperature }
      );
    } catch (err) {
      setIsGenerating(false);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: 'Generation Failed',
        description: message,
        variant: 'destructive',
      });
    }
  }, [options, toast]);

  const abort = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
  }, []);

  const reset = useCallback(() => {
    setStreamedContent('');
    setError(null);
    abortRef.current = false;
  }, []);

  return {
    generate,
    abort,
    reset,
    isGenerating,
    streamedContent,
    error,
  };
}
