import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Allowed origins for CORS - restricts which domains can call this endpoint
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

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PURCHASE-CONFIRMATION] ${step}${detailsStr}`);
};

// HTML entity encoding to prevent XSS in email clients
const escapeHtml = (str: string): string => {
  return str.replace(/[<>&"']/g, (c: string) => 
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c)
  );
};

interface PurchaseEmailRequest {
  email: string;
  promptTitle: string;
  promptCategory: string;
  price: number;
  purchaseDate: string;
}

// Simple in-memory rate limiting (per IP), resets on cold start
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const getClientIp = (req: Request): string =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
  record.count++;
  return true;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is internal-only: it may only be invoked server-to-server
  // (e.g. by verify-prompt-payment) using the service role key.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!serviceRoleKey || token !== serviceRoleKey) {
    logStep("Unauthorized invocation blocked");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!checkRateLimit(getClientIp(req))) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    logStep("Function started");

    // Initialize Resend inside handler to avoid cold-start issues
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");
    const resend = new Resend(resendApiKey);

    const { email, promptTitle, promptCategory, price, purchaseDate }: PurchaseEmailRequest = await req.json();
    logStep("Request data", { promptCategory });

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      throw new Error("Invalid email");
    }
    if (!promptTitle || typeof promptTitle !== "string" || promptTitle.length > 200) {
      throw new Error("Invalid promptTitle");
    }


    // Sanitize user-provided content
    const safeTitle = escapeHtml(promptTitle);
    const safeCategory = escapeHtml(promptCategory || "General");

    const safePrice = typeof price === "number" && isFinite(price) && price >= 0 ? price : 0;
    const formattedPrice = `$${safePrice.toFixed(2)}`;
    const formattedDate = new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "1Prompts <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Purchase Confirmed: ${safeTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Purchase Confirmed! 🎉</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                        Thank you for your purchase! Your prompt is now available in your library.
                      </p>
                      
                      <!-- Purchase Details Card -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px; font-weight: 600;">Order Details</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Prompt:</td>
                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${safeTitle}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category:</td>
                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${safeCategory}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e5e7eb;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Total:</td>
                                <td style="padding: 8px 0; color: #6366f1; font-size: 16px; font-weight: 700; text-align: right;">${formattedPrice}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="https://1prompts.com/my-prompts" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View My Prompts
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        Questions? Reply to this email or contact our support team.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">
                        © ${new Date().getFullYear()} 1Prompts. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailResponse });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Failed to send confirmation email" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
