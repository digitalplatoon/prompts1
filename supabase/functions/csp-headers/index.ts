import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const allowedOrigins = [
  'https://1prompts.com',
  'https://prompts1.lovable.app',
  'https://2837ef4f-55c7-4cf3-94a1-b420d86aacbf.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

// Content Security Policy configuration
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Vite dev and some React patterns
    "https://js.stripe.com",
    "https://cdn.gpteng.co",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and styled-components
    "https://fonts.googleapis.com",
  ],
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "https://api.stripe.com",
    "wss://*.supabase.co",
  ],
  "frame-src": [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "upgrade-insecure-requests": [],
};

function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}

// Additional security headers
const SECURITY_HEADERS = {
  "Content-Security-Policy": buildCSPHeader(),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  console.log("CSP headers request received");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return new Response(
      JSON.stringify({
        success: true,
        headers: SECURITY_HEADERS,
        cspDirectives: CSP_DIRECTIVES,
        message: "Security headers configuration for 1Prompts application",
        usage: "Apply these headers via your CDN, reverse proxy, or use the meta tag approach in index.html",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...SECURITY_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("CSP headers error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate security headers" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
