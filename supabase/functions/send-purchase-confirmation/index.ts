import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS - restricts which domains can call this endpoint
const allowedOrigins = [
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

interface PurchaseEmailRequest {
  email: string;
  promptTitle: string;
  promptCategory: string;
  price: number;
  purchaseDate: string;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, promptTitle, promptCategory, price, purchaseDate }: PurchaseEmailRequest = await req.json();
    logStep("Request data", { promptTitle, promptCategory });

    if (!email || !promptTitle) {
      throw new Error("Missing required fields: email, promptTitle");
    }

    const formattedPrice = `$${price.toFixed(2)}`;
    const formattedDate = new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "PromptVault <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Purchase Confirmed: ${promptTitle}`,
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
                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${promptTitle}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category:</td>
                                <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${promptCategory}</td>
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
                            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/my-prompts" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
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
                        © ${new Date().getFullYear()} PromptVault. All rights reserved.
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
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
