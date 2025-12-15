import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template system prompts (mirrored from frontend for security)
const TEMPLATE_PROMPTS: Record<string, string> = {
  'blog-post': `You are an expert content writer. Generate a well-structured blog post based on the user's requirements.

Structure your response with:
- An engaging headline (H1)
- An introduction that hooks the reader
- Multiple sections with H2 subheadings
- Actionable tips and insights
- A conclusion with a call-to-action

Use markdown formatting. Be informative, engaging, and SEO-friendly.`,

  'blog-outline': `Generate a detailed blog post outline with:
- A compelling title
- Introduction hook ideas
- 5-7 main sections with subpoints
- Key talking points for each section
- Conclusion ideas

Format using markdown with proper hierarchy.`,

  'social-linkedin': `Create a compelling LinkedIn post that:
- Opens with a hook (question, bold statement, or story)
- Provides value or insights
- Uses short paragraphs and line breaks for readability
- Ends with a call-to-action or question
- Includes relevant hashtags (3-5)

Keep it authentic and professional. Aim for 150-300 words.`,

  'social-twitter': `Create a Twitter thread that:
- Starts with a hook tweet that makes people want to read more
- Each tweet is under 280 characters
- Numbers each tweet (1/, 2/, etc.)
- Provides actionable insights or interesting facts
- Ends with a summary and call-to-action

Make it shareable and valuable.`,

  'social-instagram': `Write an engaging Instagram caption that:
- Starts with an attention-grabbing first line
- Tells a micro-story or shares an insight
- Includes a call-to-action
- Has relevant hashtags (10-15) at the end
- Uses emojis appropriately

Keep it authentic and scroll-stopping.`,

  'ad-google': `Generate Google Ads copy with:

**Headlines (3 options, max 30 chars each):**
- Focus on benefits and urgency
- Include keywords naturally

**Descriptions (2 options, max 90 chars each):**
- Highlight unique value
- Include call-to-action

**Display URL paths (2 suggestions)**

Make it compelling and action-oriented.`,

  'ad-facebook': `Create Facebook ad copy with:

**Primary Text (3 variations):**
- Hook the audience in first line
- Address pain points
- Include social proof if relevant
- Strong CTA

**Headline (3 options, under 40 chars)**

**Description (2 options)**

Focus on emotional triggers and benefits.`,

  'email-newsletter': `Write an email newsletter with:
- Compelling subject line (3 options)
- Preview text
- Personalized greeting
- Main content sections with headers
- Call-to-action buttons
- Footer with unsubscribe option

Make it scannable and valuable.`,

  'email-cold': `Write a cold email that:
- Has a personalized, curiosity-inducing subject line
- Opens with relevance (why them, why now)
- Clearly states value proposition
- Is under 150 words
- Has a clear, low-friction CTA
- Sounds human, not salesy

Provide 2 versions with different approaches.`,

  'product-description': `Write a product description that:
- Opens with a benefit-focused headline
- Paints a picture of the transformation
- Lists features as benefits
- Addresses potential objections
- Creates urgency
- Includes a strong CTA

Use sensory language and focus on how it improves the customer's life.`,

  'seo-meta': `Generate SEO meta tags:

**Title Tags (3 options):**
- Under 60 characters
- Include target keyword near the beginning
- Compelling and click-worthy

**Meta Descriptions (3 options):**
- 150-160 characters
- Include target keyword naturally
- Clear value proposition
- Call-to-action

**H1 Suggestions (2 options)**

Focus on search intent and CTR optimization.`,
  'analyze-voice': `Analyze the following sample text and describe the writing style in detail. Include:
- Tone (formal, casual, conversational, etc.)
- Vocabulary level (simple, technical, academic)
- Sentence structure patterns
- Unique stylistic elements
- Voice characteristics

Provide actionable instructions that an AI could follow to replicate this writing style. Be specific and detailed.`,
};

// Credit costs per template
const TEMPLATE_CREDITS: Record<string, number> = {
  'blog-post': 50,
  'blog-outline': 15,
  'social-linkedin': 10,
  'social-twitter': 15,
  'social-instagram': 8,
  'ad-google': 12,
  'ad-facebook': 15,
  'email-newsletter': 25,
  'email-cold': 12,
  'product-description': 15,
  'seo-meta': 8,
  'analyze-voice': 5,
};

interface GenerateRequest {
  templateId: string;
  inputs: Record<string, string | number | boolean>;
  brandVoiceId?: string;
  language?: 'en' | 'bn';
  organizationId: string;
  model?: string;
  temperature?: number;
  stream?: boolean;
  skipCreditDeduction?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const body: GenerateRequest = await req.json();
    const { 
      templateId, 
      inputs, 
      brandVoiceId, 
      language = 'en', 
      organizationId,
      model = 'google/gemini-2.5-flash',
      temperature = 0.7,
      stream = true,
    } = body;

    console.log(`[generate-content] User: ${user.id}, Template: ${templateId}, Org: ${organizationId}`);

    // Validate template
    const systemPrompt = TEMPLATE_PROMPTS[templateId];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown template: ${templateId}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is member of organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Not a member of this organization' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check organization credits
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('monthly_credits, credits_used')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creditsAvailable = (org.monthly_credits || 0) - (org.credits_used || 0);
    const skipCreditDeduction = body.skipCreditDeduction === true;

    // Check if user has at least some credits before starting
    if (!skipCreditDeduction && creditsAvailable <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        creditsNeeded: 1,
        creditsAvailable,
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch brand voice if specified
    let brandVoiceInstructions = '';
    if (brandVoiceId) {
      const { data: brandVoice } = await supabase
        .from('brand_voices')
        .select('name, tone_keywords, style_instructions, sample_text, language')
        .eq('id', brandVoiceId)
        .eq('organization_id', organizationId)
        .single();

      if (brandVoice) {
        const toneText = brandVoice.tone_keywords?.length 
          ? `Tone: ${brandVoice.tone_keywords.join(', ')}.` 
          : '';
        
        brandVoiceInstructions = `

---
BRAND VOICE GUIDELINES - FOLLOW THESE CAREFULLY:
Voice Name: "${brandVoice.name}"
${toneText}
${brandVoice.style_instructions ? `
STYLE INSTRUCTIONS:
${brandVoice.style_instructions}
` : ''}
${brandVoice.sample_text ? `
REFERENCE SAMPLE (mimic this style):
"${brandVoice.sample_text.substring(0, 800)}"
` : ''}
---
Write in a style that matches these brand voice guidelines. Maintain consistency with the defined tone and style throughout your response.`;
      }
    }

    // Build user prompt from inputs
    const userPromptParts: string[] = [];
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && value !== '') {
        userPromptParts.push(`${key}: ${value}`);
      }
    }

    // Language instruction - explicit for Bangla
    let languageInstruction = '';
    if (language === 'bn') {
      languageInstruction = `

CRITICAL LANGUAGE REQUIREMENT:
You are a helpful assistant. Your ENTIRE output MUST be in Bengali language (বাংলা).
- All text, headings, and content must be written in Bangla script.
- Do not use English words unless they are technical terms with no Bangla equivalent.
- Maintain proper Bangla grammar and sentence structure.
- Use culturally appropriate expressions and idioms.`;
    } else {
      languageInstruction = '\n\nWrite your response in clear, fluent English.';
    }

    const userPrompt = userPromptParts.join('\n') + languageInstruction;

    // Prepare messages for AI
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt + brandVoiceInstructions 
      },
      { 
        role: 'user', 
        content: userPrompt 
      },
    ];

    console.log(`[generate-content] Calling Lovable AI with model: ${model}`);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[generate-content] AI Gateway error: ${aiResponse.status}`, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    // Helper function to count words - Unicode-aware matching for accuracy with multi-language text
    const countWords = (text: string): number => {
      if (!text) return 0;
      // This regex matches any sequence of Letters (\p{L}) or Numbers (\p{N})
      // It effectively ignores punctuation and symbols, counting only "real" words.
      const matches = text.match(/[\p{L}\p{N}]+/gu);
      return matches ? matches.length : 0;
    };

    // Helper function to deduct credits based on actual word count
    const deductCredits = async (content: string) => {
      if (skipCreditDeduction) return 0;
      
      const wordCount = countWords(content);
      const creditsToDeduct = Math.max(1, wordCount); // Minimum 1 credit
      
      // Check if user has enough credits for the generated content
      if (creditsToDeduct > creditsAvailable) {
        console.log(`[generate-content] Warning: Generated ${wordCount} words but only ${creditsAvailable} credits available. Deducting available amount.`);
      }
      
      const actualDeduction = Math.min(creditsToDeduct, creditsAvailable);
      
      const { error: creditError } = await supabase
        .from('organizations')
        .update({ credits_used: (org.credits_used || 0) + actualDeduction })
        .eq('id', organizationId);

      if (creditError) {
        console.error('[generate-content] Failed to deduct credits:', creditError);
      }

      // Log usage
      await supabase.from('credit_usage').insert({
        organization_id: organizationId,
        user_id: user.id,
        credits_consumed: actualDeduction,
        model_used: model,
        template_type: templateId,
        tokens_input: 0,
        tokens_output: wordCount,
      });

      console.log(`[generate-content] Deducted ${actualDeduction} credits (${wordCount} words) from org ${organizationId}`);
      return actualDeduction;
    };

    // Handle streaming response - we need to collect content while streaming to client
    if (stream) {
      const reader = aiResponse.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      // Create a ReadableStream that processes content and deducts credits at end
      const transformedStream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Forward the chunk to the client
              controller.enqueue(value);

              // Also parse to collect full content
              const text = decoder.decode(value, { stream: true });
              const lines = text.split('\n');
              for (const line of lines) {
                if (!line.trim() || line.startsWith(':')) continue;
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                  }
                } catch {
                  // Incomplete JSON, skip
                }
              }
            }
            
            controller.close();
            
            // Deduct credits based on actual word count after stream completes
            await deductCredits(fullContent);
          } catch (error) {
            console.error('[generate-content] Stream processing error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(transformedStream, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Deduct credits based on actual word count
    const creditsConsumed = await deductCredits(content);

    return new Response(JSON.stringify({ 
      content,
      creditsConsumed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-content] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
