import { Shield, Lock, Zap, Database, FileCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const securityMeasures = [
  {
    icon: Shield,
    title: "Content Sanitization",
    status: "Active",
    description: "All user-generated HTML content is sanitized using DOMPurify with strict allowlists before rendering.",
    details: [
      "XSS attack prevention via DOMPurify library",
      "Strict HTML tag allowlist (p, h1-h6, a, code, ul, ol, li, etc.)",
      "Attribute filtering for safe content display"
    ],
    docs: "https://github.com/cure53/DOMPurify"
  },
  {
    icon: Lock,
    title: "Authentication & Authorization",
    status: "Active",
    description: "Multi-layer authentication with rate limiting and role-based access control.",
    details: [
      "Supabase Auth with secure session management",
      "Rate limiting: 5 login attempts per 15 minutes",
      "Role-based access (admin, moderator, user)",
      "Protected routes with auth guards"
    ],
    docs: "https://supabase.com/docs/guides/auth"
  },
  {
    icon: Zap,
    title: "API Rate Limiting",
    status: "Active",
    description: "Edge functions implement rate limiting to prevent abuse and DDoS attacks.",
    details: [
      "Newsletter subscription: 3 requests/minute per IP",
      "Authentication: 5 attempts per 15-minute window",
      "Edge function CORS restricted to whitelisted origins"
    ],
    docs: "https://supabase.com/docs/guides/functions"
  },
  {
    icon: Database,
    title: "Row Level Security (RLS)",
    status: "Active",
    description: "Database-level security policies ensure users can only access their own data.",
    details: [
      "All tables protected with RLS policies",
      "SECURITY DEFINER functions for controlled data access",
      "User identity protected in public reviews via RPC",
      "Admin-only access for sensitive operations"
    ],
    docs: "https://supabase.com/docs/guides/auth/row-level-security"
  },
  {
    icon: FileCheck,
    title: "Input Validation",
    status: "Active",
    description: "All user inputs are validated both client-side and server-side.",
    details: [
      "Zod schema validation for forms",
      "Database-level email format validation",
      "Image file type and size validation",
      "URL encoding for external API calls"
    ],
    docs: "https://zod.dev/"
  },
  {
    icon: AlertTriangle,
    title: "Content Security Policy",
    status: "Active",
    description: "CSP headers restrict resource loading to trusted sources.",
    details: [
      "Script sources limited to self, Google Analytics, Stripe",
      "Inline scripts require nonces",
      "Edge function provides additional CSP headers",
      "Frame ancestors restricted"
    ],
    docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"
  }
];

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Security Overview"
        description="1Prompts security measures and protections including authentication, rate limiting, content sanitization, and data protection."
        noindex={true}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Internal Documentation</Badge>
            <h1 className="text-4xl font-bold mb-4">Security Overview</h1>
            <p className="text-muted-foreground text-lg">
              Summary of security protections implemented across the 1Prompts platform.
            </p>
          </div>

          <div className="grid gap-6">
            {securityMeasures.map((measure) => (
              <Card key={measure.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <measure.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{measure.title}</CardTitle>
                        <CardDescription>{measure.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {measure.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {measure.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={measure.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Documentation →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Audit Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>☐ Review RLS policies after any table modifications</li>
                <li>☐ Update CORS origins when deploying to new domains</li>
                <li>☐ Verify rate limits are appropriate for traffic levels</li>
                <li>☐ Check DOMPurify allowlist if new content types are added</li>
                <li>☐ Audit admin role assignments quarterly</li>
                <li>☐ Review edge function logs for unusual patterns</li>
              </ul>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: December 2024 • For internal use only
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Security;
