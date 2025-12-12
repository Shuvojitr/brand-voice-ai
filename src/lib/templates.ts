import type { ContentTemplate, TemplateCategory } from './types/ai';

// Content Templates Library
export const contentTemplates: ContentTemplate[] = [
  // BLOG TEMPLATES
  {
    id: 'blog-post',
    name: 'Blog Post',
    nameBn: 'ব্লগ পোস্ট',
    description: 'Generate a complete blog post with introduction, body, and conclusion',
    descriptionBn: 'ভূমিকা, মূল অংশ এবং উপসংহার সহ একটি সম্পূর্ণ ব্লগ পোস্ট তৈরি করুন',
    category: 'blog',
    icon: 'FileText',
    estimatedCredits: 50,
    supportedLanguages: ['en', 'bn'],
    tags: ['blog', 'article', 'content'],
    outputFormat: 'markdown',
    inputs: [
      {
        id: 'topic',
        label: 'Blog Topic',
        labelBn: 'ব্লগের বিষয়',
        type: 'text',
        placeholder: 'e.g., "10 Tips for Remote Work Productivity"',
        placeholderBn: 'যেমন: "রিমোট কাজে উৎপাদনশীলতার ১০টি টিপস"',
        required: true,
        maxLength: 200,
      },
      {
        id: 'keywords',
        label: 'Target Keywords',
        labelBn: 'টার্গেট কীওয়ার্ড',
        type: 'text',
        placeholder: 'remote work, productivity, home office',
        required: false,
        maxLength: 150,
      },
      {
        id: 'tone',
        label: 'Writing Tone',
        labelBn: 'লেখার ধরন',
        type: 'select',
        required: true,
        options: [
          { value: 'professional', label: 'Professional', labelBn: 'পেশাদার' },
          { value: 'casual', label: 'Casual & Friendly', labelBn: 'আনফর্মাল ও বন্ধুসুলভ' },
          { value: 'authoritative', label: 'Authoritative', labelBn: 'প্রামাণিক' },
          { value: 'humorous', label: 'Humorous', labelBn: 'হাস্যকর' },
        ],
        defaultValue: 'professional',
      },
      {
        id: 'wordCount',
        label: 'Target Word Count',
        labelBn: 'টার্গেট শব্দ সংখ্যা',
        type: 'select',
        required: true,
        options: [
          { value: '500', label: 'Short (~500 words)' },
          { value: '1000', label: 'Medium (~1000 words)' },
          { value: '1500', label: 'Long (~1500 words)' },
          { value: '2000', label: 'Detailed (~2000 words)' },
        ],
        defaultValue: '1000',
      },
    ],
    systemPrompt: `You are an expert content writer. Generate a well-structured blog post based on the user's requirements.

Structure your response with:
- An engaging headline (H1)
- An introduction that hooks the reader
- Multiple sections with H2 subheadings
- Actionable tips and insights
- A conclusion with a call-to-action

Use markdown formatting. Be informative, engaging, and SEO-friendly.`,
  },
  
  {
    id: 'blog-outline',
    name: 'Blog Outline',
    nameBn: 'ব্লগ আউটলাইন',
    description: 'Create a detailed outline for your blog post',
    descriptionBn: 'আপনার ব্লগ পোস্টের জন্য একটি বিস্তারিত আউটলাইন তৈরি করুন',
    category: 'blog',
    icon: 'List',
    estimatedCredits: 15,
    supportedLanguages: ['en', 'bn'],
    tags: ['outline', 'planning', 'structure'],
    outputFormat: 'markdown',
    inputs: [
      {
        id: 'topic',
        label: 'Blog Topic',
        labelBn: 'ব্লগের বিষয়',
        type: 'text',
        placeholder: 'What is your blog post about?',
        required: true,
        maxLength: 200,
      },
      {
        id: 'audience',
        label: 'Target Audience',
        labelBn: 'টার্গেট অডিয়েন্স',
        type: 'text',
        placeholder: 'e.g., small business owners, students',
        required: false,
        maxLength: 100,
      },
    ],
    systemPrompt: `Generate a detailed blog post outline with:
- A compelling title
- Introduction hook ideas
- 5-7 main sections with subpoints
- Key talking points for each section
- Conclusion ideas

Format using markdown with proper hierarchy.`,
  },

  // SOCIAL MEDIA TEMPLATES
  {
    id: 'social-linkedin',
    name: 'LinkedIn Post',
    nameBn: 'লিংকডইন পোস্ট',
    description: 'Create engaging LinkedIn posts for professional networking',
    descriptionBn: 'পেশাদার নেটওয়ার্কিংয়ের জন্য আকর্ষণীয় লিংকডইন পোস্ট তৈরি করুন',
    category: 'social',
    icon: 'Linkedin',
    estimatedCredits: 10,
    supportedLanguages: ['en', 'bn'],
    tags: ['linkedin', 'social', 'professional'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'topic',
        label: 'Post Topic',
        labelBn: 'পোস্টের বিষয়',
        type: 'textarea',
        placeholder: 'What do you want to share or discuss?',
        required: true,
        maxLength: 300,
      },
      {
        id: 'goal',
        label: 'Post Goal',
        labelBn: 'পোস্টের উদ্দেশ্য',
        type: 'select',
        required: true,
        options: [
          { value: 'thought-leadership', label: 'Thought Leadership' },
          { value: 'engagement', label: 'Drive Engagement' },
          { value: 'announcement', label: 'Announcement' },
          { value: 'story', label: 'Personal Story' },
        ],
        defaultValue: 'engagement',
      },
      {
        id: 'includeEmoji',
        label: 'Include Emojis',
        labelBn: 'ইমোজি অন্তর্ভুক্ত করুন',
        type: 'toggle',
        defaultValue: true,
      },
    ],
    systemPrompt: `Create a compelling LinkedIn post that:
- Opens with a hook (question, bold statement, or story)
- Provides value or insights
- Uses short paragraphs and line breaks for readability
- Ends with a call-to-action or question
- Includes relevant hashtags (3-5)

Keep it authentic and professional. Aim for 150-300 words.`,
  },

  {
    id: 'social-twitter',
    name: 'Twitter/X Thread',
    nameBn: 'টুইটার/এক্স থ্রেড',
    description: 'Generate viral Twitter threads',
    descriptionBn: 'ভাইরাল টুইটার থ্রেড তৈরি করুন',
    category: 'social',
    icon: 'Twitter',
    estimatedCredits: 15,
    supportedLanguages: ['en', 'bn'],
    tags: ['twitter', 'thread', 'viral'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'topic',
        label: 'Thread Topic',
        labelBn: 'থ্রেডের বিষয়',
        type: 'text',
        placeholder: 'What knowledge do you want to share?',
        required: true,
        maxLength: 200,
      },
      {
        id: 'tweetCount',
        label: 'Number of Tweets',
        labelBn: 'টুইটের সংখ্যা',
        type: 'select',
        required: true,
        options: [
          { value: '5', label: '5 tweets' },
          { value: '7', label: '7 tweets' },
          { value: '10', label: '10 tweets' },
        ],
        defaultValue: '7',
      },
    ],
    systemPrompt: `Create a Twitter thread that:
- Starts with a hook tweet that makes people want to read more
- Each tweet is under 280 characters
- Numbers each tweet (1/, 2/, etc.)
- Provides actionable insights or interesting facts
- Ends with a summary and call-to-action

Make it shareable and valuable.`,
  },

  {
    id: 'social-instagram',
    name: 'Instagram Caption',
    nameBn: 'ইনস্টাগ্রাম ক্যাপশন',
    description: 'Write captivating Instagram captions',
    descriptionBn: 'আকর্ষণীয় ইনস্টাগ্রাম ক্যাপশন লিখুন',
    category: 'social',
    icon: 'Instagram',
    estimatedCredits: 8,
    supportedLanguages: ['en', 'bn'],
    tags: ['instagram', 'caption', 'social'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'imageDescription',
        label: 'Image/Post Description',
        labelBn: 'ছবি/পোস্টের বিবরণ',
        type: 'textarea',
        placeholder: 'Describe your image or what you want to post about',
        required: true,
        maxLength: 300,
      },
      {
        id: 'mood',
        label: 'Caption Mood',
        labelBn: 'ক্যাপশনের মেজাজ',
        type: 'select',
        required: true,
        options: [
          { value: 'inspiring', label: 'Inspiring' },
          { value: 'funny', label: 'Funny' },
          { value: 'informative', label: 'Informative' },
          { value: 'promotional', label: 'Promotional' },
        ],
        defaultValue: 'inspiring',
      },
    ],
    systemPrompt: `Write an engaging Instagram caption that:
- Starts with an attention-grabbing first line
- Tells a micro-story or shares an insight
- Includes a call-to-action
- Has relevant hashtags (10-15) at the end
- Uses emojis appropriately

Keep it authentic and scroll-stopping.`,
  },

  // ADS TEMPLATES
  {
    id: 'ad-google',
    name: 'Google Ads Copy',
    nameBn: 'গুগল অ্যাডস কপি',
    description: 'Create high-converting Google Ads headlines and descriptions',
    descriptionBn: 'উচ্চ কনভার্টিং গুগল অ্যাডস হেডলাইন এবং বিবরণ তৈরি করুন',
    category: 'ads',
    icon: 'Target',
    estimatedCredits: 12,
    supportedLanguages: ['en', 'bn'],
    tags: ['google', 'ads', 'ppc'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'product',
        label: 'Product/Service',
        labelBn: 'পণ্য/সেবা',
        type: 'text',
        placeholder: 'What are you advertising?',
        required: true,
        maxLength: 150,
      },
      {
        id: 'usp',
        label: 'Unique Selling Point',
        labelBn: 'অনন্য বিক্রয় পয়েন্ট',
        type: 'text',
        placeholder: 'What makes you different?',
        required: true,
        maxLength: 150,
      },
      {
        id: 'cta',
        label: 'Call to Action',
        labelBn: 'কল টু অ্যাকশন',
        type: 'select',
        required: true,
        options: [
          { value: 'buy', label: 'Buy Now' },
          { value: 'learn', label: 'Learn More' },
          { value: 'signup', label: 'Sign Up' },
          { value: 'contact', label: 'Contact Us' },
        ],
        defaultValue: 'learn',
      },
    ],
    systemPrompt: `Generate Google Ads copy with:

**Headlines (3 options, max 30 chars each):**
- Focus on benefits and urgency
- Include keywords naturally

**Descriptions (2 options, max 90 chars each):**
- Highlight unique value
- Include call-to-action

**Display URL paths (2 suggestions)**

Make it compelling and action-oriented.`,
  },

  {
    id: 'ad-facebook',
    name: 'Facebook/Meta Ad',
    nameBn: 'ফেসবুক/মেটা অ্যাড',
    description: 'Create scroll-stopping Facebook ad copy',
    descriptionBn: 'স্ক্রোল-স্টপিং ফেসবুক অ্যাড কপি তৈরি করুন',
    category: 'ads',
    icon: 'Facebook',
    estimatedCredits: 15,
    supportedLanguages: ['en', 'bn'],
    tags: ['facebook', 'meta', 'ads'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'product',
        label: 'Product/Service',
        labelBn: 'পণ্য/সেবা',
        type: 'textarea',
        placeholder: 'Describe what you are promoting',
        required: true,
        maxLength: 300,
      },
      {
        id: 'audience',
        label: 'Target Audience',
        labelBn: 'টার্গেট অডিয়েন্স',
        type: 'text',
        placeholder: 'Who is this ad for?',
        required: true,
        maxLength: 150,
      },
      {
        id: 'adType',
        label: 'Ad Format',
        labelBn: 'অ্যাডের ফরম্যাট',
        type: 'select',
        required: true,
        options: [
          { value: 'image', label: 'Single Image' },
          { value: 'carousel', label: 'Carousel' },
          { value: 'video', label: 'Video Ad' },
        ],
        defaultValue: 'image',
      },
    ],
    systemPrompt: `Create Facebook ad copy with:

**Primary Text (3 variations):**
- Hook the audience in first line
- Address pain points
- Include social proof if relevant
- Strong CTA

**Headline (3 options, under 40 chars)**

**Description (2 options)**

Focus on emotional triggers and benefits.`,
  },

  // EMAIL TEMPLATES
  {
    id: 'email-newsletter',
    name: 'Newsletter',
    nameBn: 'নিউজলেটার',
    description: 'Write engaging email newsletters',
    descriptionBn: 'আকর্ষণীয় ইমেইল নিউজলেটার লিখুন',
    category: 'email',
    icon: 'Mail',
    estimatedCredits: 25,
    supportedLanguages: ['en', 'bn'],
    tags: ['email', 'newsletter', 'marketing'],
    outputFormat: 'html',
    inputs: [
      {
        id: 'topic',
        label: 'Newsletter Topic',
        labelBn: 'নিউজলেটারের বিষয়',
        type: 'textarea',
        placeholder: 'What is this newsletter about?',
        required: true,
        maxLength: 300,
      },
      {
        id: 'sections',
        label: 'Number of Sections',
        labelBn: 'সেকশনের সংখ্যা',
        type: 'select',
        required: true,
        options: [
          { value: '2', label: '2 sections' },
          { value: '3', label: '3 sections' },
          { value: '4', label: '4 sections' },
        ],
        defaultValue: '3',
      },
    ],
    systemPrompt: `Write an email newsletter with:
- Compelling subject line (3 options)
- Preview text
- Personalized greeting
- Main content sections with headers
- Call-to-action buttons
- Footer with unsubscribe option

Make it scannable and valuable.`,
  },

  {
    id: 'email-cold',
    name: 'Cold Outreach Email',
    nameBn: 'কোল্ড আউটরিচ ইমেইল',
    description: 'Write personalized cold emails that get responses',
    descriptionBn: 'ব্যক্তিগতকৃত কোল্ড ইমেইল লিখুন যা সাড়া পায়',
    category: 'email',
    icon: 'Send',
    estimatedCredits: 12,
    supportedLanguages: ['en', 'bn'],
    tags: ['email', 'cold', 'outreach', 'sales'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'purpose',
        label: 'Email Purpose',
        labelBn: 'ইমেইলের উদ্দেশ্য',
        type: 'select',
        required: true,
        options: [
          { value: 'sales', label: 'Sales Pitch' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'networking', label: 'Networking' },
          { value: 'job', label: 'Job Inquiry' },
        ],
        defaultValue: 'sales',
      },
      {
        id: 'context',
        label: 'Context/Offer',
        labelBn: 'প্রসঙ্গ/অফার',
        type: 'textarea',
        placeholder: 'What are you offering or asking for?',
        required: true,
        maxLength: 400,
      },
      {
        id: 'recipientInfo',
        label: 'Recipient Info',
        labelBn: 'প্রাপকের তথ্য',
        type: 'text',
        placeholder: 'Their role, company, or any personalization details',
        required: false,
        maxLength: 200,
      },
    ],
    systemPrompt: `Write a cold email that:
- Has a personalized, curiosity-inducing subject line
- Opens with relevance (why them, why now)
- Clearly states value proposition
- Is under 150 words
- Has a clear, low-friction CTA
- Sounds human, not salesy

Provide 2 versions with different approaches.`,
  },

  // PRODUCT TEMPLATES
  {
    id: 'product-description',
    name: 'Product Description',
    nameBn: 'পণ্যের বিবরণ',
    description: 'Write compelling product descriptions that sell',
    descriptionBn: 'বিক্রি করে এমন আকর্ষণীয় পণ্যের বিবরণ লিখুন',
    category: 'product',
    icon: 'Package',
    estimatedCredits: 15,
    supportedLanguages: ['en', 'bn'],
    tags: ['product', 'ecommerce', 'description'],
    outputFormat: 'markdown',
    inputs: [
      {
        id: 'productName',
        label: 'Product Name',
        labelBn: 'পণ্যের নাম',
        type: 'text',
        placeholder: 'Enter the product name',
        required: true,
        maxLength: 100,
      },
      {
        id: 'features',
        label: 'Key Features',
        labelBn: 'প্রধান বৈশিষ্ট্য',
        type: 'textarea',
        placeholder: 'List the main features and specifications',
        required: true,
        maxLength: 500,
      },
      {
        id: 'targetAudience',
        label: 'Target Customer',
        labelBn: 'টার্গেট গ্রাহক',
        type: 'text',
        placeholder: 'Who is this product for?',
        required: true,
        maxLength: 150,
      },
    ],
    systemPrompt: `Write a product description that:
- Opens with a benefit-focused headline
- Paints a picture of the transformation
- Lists features as benefits
- Addresses potential objections
- Creates urgency
- Includes a strong CTA

Use sensory language and focus on how it improves the customer's life.`,
  },

  // SEO TEMPLATES
  {
    id: 'seo-meta',
    name: 'SEO Meta Tags',
    nameBn: 'এসইও মেটা ট্যাগ',
    description: 'Generate optimized meta titles and descriptions',
    descriptionBn: 'অপ্টিমাইজড মেটা টাইটেল এবং বিবরণ তৈরি করুন',
    category: 'seo',
    icon: 'Search',
    estimatedCredits: 8,
    supportedLanguages: ['en', 'bn'],
    tags: ['seo', 'meta', 'optimization'],
    outputFormat: 'plain',
    inputs: [
      {
        id: 'pageContent',
        label: 'Page Topic/Content',
        labelBn: 'পেজের বিষয়/কন্টেন্ট',
        type: 'textarea',
        placeholder: 'Describe what the page is about',
        required: true,
        maxLength: 400,
      },
      {
        id: 'targetKeyword',
        label: 'Target Keyword',
        labelBn: 'টার্গেট কীওয়ার্ড',
        type: 'text',
        placeholder: 'Primary keyword to target',
        required: true,
        maxLength: 50,
      },
    ],
    systemPrompt: `Generate SEO meta tags:

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
  },
];

// Helper functions
export function getTemplateById(id: string): ContentTemplate | undefined {
  return contentTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): ContentTemplate[] {
  return contentTemplates.filter(t => t.category === category);
}

export function getAllCategories(): { category: TemplateCategory; label: string; labelBn: string; icon: string }[] {
  return [
    { category: 'blog', label: 'Blog & Articles', labelBn: 'ব্লগ ও আর্টিকেল', icon: 'FileText' },
    { category: 'social', label: 'Social Media', labelBn: 'সোশ্যাল মিডিয়া', icon: 'Share2' },
    { category: 'ads', label: 'Advertisements', labelBn: 'বিজ্ঞাপন', icon: 'Target' },
    { category: 'email', label: 'Email Marketing', labelBn: 'ইমেইল মার্কেটিং', icon: 'Mail' },
    { category: 'product', label: 'Product Content', labelBn: 'পণ্য কন্টেন্ট', icon: 'Package' },
    { category: 'seo', label: 'SEO', labelBn: 'এসইও', icon: 'Search' },
  ];
}

export function searchTemplates(query: string): ContentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return contentTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
