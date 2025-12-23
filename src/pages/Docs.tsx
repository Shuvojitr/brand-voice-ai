import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Code, 
  ArrowRight,
  FileText,
  Zap,
  Palette,
  Download,
  Key,
  Server,
  Shield,
  Terminal,
  Copy
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Docs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const gettingStartedSteps = [
    {
      number: 1,
      title: "Choose a Template",
      description: "Browse our library of 50+ AI-powered templates for various content types.",
      icon: FileText,
    },
    {
      number: 2,
      title: "Fill in Your Details",
      description: "Provide topic, tone, target audience, and specific instructions.",
      icon: Zap,
    },
    {
      number: 3,
      title: "Apply Brand Voice",
      description: "Ensure all content matches your unique style and tone.",
      icon: Palette,
    },
    {
      number: 4,
      title: "Generate & Export",
      description: "Create content and export in Markdown, HTML, or plain text.",
      icon: Download,
    },
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/functions/v1/api-completion",
      description: "Generate content with AI",
    },
  ];

  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xaozmulvcdealaemnebz.supabase.co';

  return (
    <Layout>
      <div className="container py-12 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about using MyGenAI, from getting started to API integration.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="getting-started" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Code className="h-4 w-4" />
              API Reference
            </TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-8">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Get up and running with MyGenAI in just a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {gettingStartedSteps.map((step) => (
                    <div key={step.number} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button asChild>
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    50+ pre-built templates for blogs, social media, emails, ads, and more. Each template is optimized for specific use cases.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Brand Voice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Define your brand's unique voice with tone keywords, style instructions, and sample text to ensure consistent content.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    AI Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Powered by advanced AI models to generate high-quality, contextually relevant content in seconds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  All API requests require authentication using your API key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 font-mono text-sm relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <p className="text-muted-foreground">// Include in request headers</p>
                  <p className="mt-1">Authorization: Bearer YOUR_API_KEY</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can find your API key in your dashboard under Settings → API Keys.
                </p>
              </CardContent>
            </Card>

            {/* Base URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(`${baseUrl}/functions/v1`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <p>{baseUrl}/functions/v1</p>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Endpoints
                </CardTitle>
                <CardDescription>
                  Available API endpoints for content generation and management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        endpoint.method === 'GET' 
                          ? 'bg-green-500/20 text-green-600' 
                          : 'bg-blue-500/20 text-blue-600'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm flex-1">{endpoint.endpoint}</code>
                      <span className="text-sm text-muted-foreground hidden md:block">
                        {endpoint.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Example Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Use your API key to generate content programmatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* cURL */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">cURL</p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`curl -X POST ${baseUrl}/functions/v1/api-completion \\
  -H "Authorization: Bearer sk-mygenai-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI in marketing",
    "template": "blog-post"
  }'`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="text-xs md:text-sm">{`curl -X POST ${baseUrl}/functions/v1/api-completion \\
  -H "Authorization: Bearer sk-mygenai-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI in marketing",
    "template": "blog-post"
  }'`}</pre>
                  </div>
                </div>

                {/* JavaScript */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">JavaScript / TypeScript</p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`const response = await fetch('${baseUrl}/functions/v1/api-completion', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-mygenai-YOUR_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Write a blog post about AI in marketing',
    template: 'blog-post',
  }),
});

const data = await response.json();
console.log(data.content);`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="text-xs md:text-sm">{`const response = await fetch('${baseUrl}/functions/v1/api-completion', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-mygenai-YOUR_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Write a blog post about AI in marketing',
    template: 'blog-post',
  }),
});

const data = await response.json();
console.log(data.content);`}</pre>
                  </div>
                </div>

                {/* Python */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Python</p>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`import requests

response = requests.post(
    '${baseUrl}/functions/v1/api-completion',
    headers={
        'Authorization': 'Bearer sk-mygenai-YOUR_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'Write a blog post about AI in marketing',
        'template': 'blog-post',
    }
)

data = response.json()
print(data['content'])`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="text-xs md:text-sm">{`import requests

response = requests.post(
    '${baseUrl}/functions/v1/api-completion',
    headers={
        'Authorization': 'Bearer sk-mygenai-YOUR_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'Write a blog post about AI in marketing',
        'template': 'blog-post',
    }
)

data = response.json()
print(data['content'])`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Format */}
            <Card>
              <CardHeader>
                <CardTitle>Response Format</CardTitle>
                <CardDescription>
                  Successful API responses include the generated content and usage information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-xs md:text-sm">{`{
  "content": "Generated content here...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 500,
    "total_tokens": 550,
    "credits_used": 6
  },
  "model": "google/gemini-2.5-flash"
}`}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">100</p>
                    <p className="text-sm text-muted-foreground">Requests/minute</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">10,000</p>
                    <p className="text-sm text-muted-foreground">Requests/day</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">1MB</p>
                    <p className="text-sm text-muted-foreground">Max payload</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Need more help?</h3>
            <p className="text-muted-foreground mb-4">
              Contact our support team for personalized assistance.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/dashboard/support">Contact Support</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
