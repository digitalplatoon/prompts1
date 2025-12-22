import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface NotificationRequest {
  userId: string;
  promptTitle: string;
  status: "approved" | "rejected";
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, promptTitle, status, adminNotes }: NotificationRequest = await req.json();

    console.log("Sending notification for prompt:", promptTitle, "to user:", userId);

    // Get user email from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find user email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = userData.user.email;
    const isApproved = status === "approved";

    const subject = isApproved
      ? `🎉 Your prompt "${promptTitle}" has been approved!`
      : `Update on your prompt "${promptTitle}"`;

    const html = isApproved
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Congratulations! 🎉</h1>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Great news! Your prompt <strong>"${promptTitle}"</strong> has been approved and is now live on 1Prompts.
          </p>
          ${adminNotes ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;"><strong>Admin Notes:</strong></p>
              <p style="margin: 10px 0 0 0; color: #166534;">${adminNotes}</p>
            </div>
          ` : ''}
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Users can now discover and purchase your prompt. Thank you for contributing to our community!
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || '#'}" 
               style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Your Prompt
            </a>
          </div>
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            — The 1Prompts Team
          </p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">Submission Update</h1>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for your submission! Unfortunately, your prompt <strong>"${promptTitle}"</strong> wasn't approved at this time.
          </p>
          ${adminNotes ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Feedback:</strong></p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">${adminNotes}</p>
            </div>
          ` : ''}
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Don't be discouraged! You can revise and resubmit your prompt based on the feedback above. We'd love to see an updated version.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/submit-prompt" 
               style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Submit Another Prompt
            </a>
          </div>
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            — The 1Prompts Team
          </p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "1Prompts <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-submission-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
