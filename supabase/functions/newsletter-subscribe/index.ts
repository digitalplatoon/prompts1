import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Allowed origins for CORS - restricts which domains can call this endpoint
const allowedOrigins = [
  'https://2837ef4f-55c7-4cf3-94a1-b420d86aacbf.lovableproject.com',
  'https://prompts1.lovable.app',
  'https://1prompts.com',
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

// In-memory rate limiting store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 subscription attempts per minute per IP

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

function getClientIp(req: Request): string {
  // Check common headers for client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (in production, this should rarely happen)
  return "unknown";
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  console.log("Newsletter subscribe request received");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = getClientIp(req);
    // Note: Not logging IP for privacy - rate limiting still works internally

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      console.log("Rate limit exceeded for request");
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: `Please wait ${rateLimitResult.retryAfter} seconds before trying again`,
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    // Parse and validate request body
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      console.log("Invalid request: missing email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      console.log("Invalid email format received");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert subscriber
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: normalizedEmail });

    if (dbError) {
      if (dbError.code === "23505") {
        // Unique constraint violation - already subscribed
        console.log("Email already subscribed");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "This email is already subscribed",
            alreadySubscribed: true 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Database error:", dbError.code);
      throw dbError;
    }

    console.log("Successfully subscribed new email");

    // Send confirmation email with unsubscribe link
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const siteUrl = Deno.env.get("SITE_URL") || "https://1prompts.com";
        const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`;
        
        await resend.emails.send({
          from: "1Prompts <newsletter@1prompts.com>",
          to: [normalizedEmail],
          subject: "Welcome to 1Prompts Newsletter! ✨",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to 1Prompts! ✨</h1>
                </div>
                <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px;">
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Thank you for subscribing to our newsletter! You'll now receive:
                  </p>
                  <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
                    <li>Weekly curated AI prompts</li>
                    <li>Tips for crafting better prompts</li>
                    <li>Exclusive deals and early access</li>
                    <li>Industry insights and trends</li>
                  </ul>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                    We're excited to have you on board!
                  </p>
                  <div style="text-align: center;">
                    <a href="${siteUrl}/browse" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Browse Prompts
                    </a>
                  </div>
                </div>
                <div style="text-align: center; padding: 30px 20px;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                    © ${new Date().getFullYear()} 1Prompts. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Don't want to receive these emails? 
                    <a href="${unsubscribeUrl}" style="color: #6366f1; text-decoration: underline;">Unsubscribe here</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log("Confirmation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send confirmation email");
        // Don't fail the subscription if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed to newsletter" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Newsletter subscription error");
    return new Response(
      JSON.stringify({ error: "Failed to subscribe. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
