// AI Service Types

export type AIProvider = 'lovable' | 'openai' | 'anthropic';

export type AIModel = 
  | 'google/gemini-2.5-flash'      // Default - fast & balanced
  | 'google/gemini-2.5-pro'        // Most capable
  | 'google/gemini-2.5-flash-lite' // Fastest & cheapest
  | 'openai/gpt-5'                 // Premium reasoning
  | 'openai/gpt-5-mini'            // Balanced performance
  | 'openai/gpt-5-nano';           // Speed optimized

export interface AIRequestOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  model: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
}

// Template System Types

export type TemplateCategory = 
  | 'blog'
  | 'social'
  | 'ads'
  | 'email'
  | 'website'
  | 'product'
  | 'seo';

export type InputFieldType = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'toggle';

export interface TemplateInputField {
  id: string;
  label: string;
  labelBn?: string; // Bangla label
  type: InputFieldType;
  placeholder?: string;
  placeholderBn?: string;
  required?: boolean;
  options?: { value: string; label: string; labelBn?: string }[];
  defaultValue?: string | number | boolean;
  maxLength?: number;
  minLength?: number;
  helpText?: string;
  helpTextBn?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  descriptionBn?: string;
  category: TemplateCategory;
  icon: string;
  inputs: TemplateInputField[];
  systemPrompt: string;
  outputFormat?: 'markdown' | 'html' | 'plain';
  estimatedCredits: number;
  supportedLanguages: ('en' | 'bn')[];
  tags: string[];
}

export interface BrandVoice {
  id: string;
  name: string;
  toneKeywords: string[];
  sampleText?: string;
  styleInstructions?: string;
  language: string;
}

export interface GenerateContentRequest {
  templateId: string;
  inputs: Record<string, string | number | boolean>;
  brandVoiceId?: string;
  language: 'en' | 'bn';
  organizationId: string;
}

export interface GenerateContentResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  creditsConsumed: number;
  documentId?: string;
}
