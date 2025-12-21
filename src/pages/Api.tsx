import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Key, Zap, Shield, Webhook, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Key,
    title: "Simple Authentication",
    description: "Secure API keys with role-based access control. Generate and manage keys from your dashboard.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "99.9% uptime SLA with global CDN distribution. Average response time under 100ms.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your data is always protected.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Real-time notifications for prompt usage, purchases, and account events.",
  },
];

const endpoints = [
  { method: "GET", path: "/v1/prompts", description: "List all available prompts" },
  { method: "GET", path: "/v1/prompts/:id", description: "Get a specific prompt" },
  { method: "POST", path: "/v1/prompts/generate", description: "Generate prompt variations" },
  { method: "GET", path: "/v1/categories", description: "List all categories" },
  { method: "GET", path: "/v1/user/purchases", description: "Get user's purchased prompts" },
];

const codeExample = `// Initialize the SDK
import { PromptVault } from '@promptvault/sdk';

const client = new PromptVault({
  apiKey: 'your-api-key'
});

// Fetch a prompt
const prompt = await client.prompts.get('prompt-id');
console.log(prompt.content);

// Generate variations
const variations = await client.prompts.generate({
  basePrompt: prompt.id,
  count: 5,
  temperature: 0.7
});`;

const Api = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Code className="w-3 h-3 mr-1" />
            Developer API
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Build with Our API
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Integrate premium AI prompts directly into your applications with our powerful REST API.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">Request API Access</Link>
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
            <p className="text-muted-foreground">
              Get up and running in minutes with our SDK
            </p>
          </div>
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-muted-foreground">example.ts</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="text-foreground">{codeExample}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Endpoints Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">API Endpoints</h2>
            <p className="text-muted-foreground">
              RESTful endpoints for all your prompt needs
            </p>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center gap-4 p-4">
                    <Badge 
                      variant={endpoint.method === "GET" ? "secondary" : "default"}
                      className="w-16 justify-center font-mono"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-primary flex-1">
                      {endpoint.path}
                    </code>
                    <span className="text-sm text-muted-foreground hidden md:block">
                      {endpoint.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
            <p className="text-muted-foreground">
              Three simple steps to integrate our API
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Create Account", description: "Sign up for a Pro or Enterprise plan to get API access." },
              { step: 2, title: "Generate API Key", description: "Create your API key from the developer dashboard." },
              { step: 3, title: "Start Building", description: "Use our SDK or make direct REST calls to the API." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Integrate?</h2>
          <p className="text-muted-foreground mb-8">
            Get started with our API today and supercharge your applications.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">Request API Access</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Api;
