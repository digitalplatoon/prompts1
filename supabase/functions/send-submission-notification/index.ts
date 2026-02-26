import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const allowedOrigins = [
  'https://2837ef4f-55c7-4cf3-94a1-b420d86aacbf.lovableproject.com',
  'https://prompts1.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin role
    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { userId, promptTitle, status, adminNotes }: NotificationRequest = await req.json();

    // Input validation
    if (!userId || !promptTitle || !["approved", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid request parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending notification for prompt submission status update");

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

    // Sanitize user-provided content for HTML email
    const safeTitle = promptTitle.replace(/[<>&"']/g, (c: string) => 
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c)
    );
    const safeNotes = adminNotes?.replace(/[<>&"']/g, (c: string) => 
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c)
    );

    const subject = isApproved
      ? `🎉 Your prompt "${safeTitle}" has been approved!`
      : `Update on your prompt "${safeTitle}"`;

    const html = isApproved
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Congratulations! 🎉</h1>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Great news! Your prompt <strong>"${safeTitle}"</strong> has been approved and is now live on 1Prompts.
          </p>
          ${safeNotes ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;"><strong>Admin Notes:</strong></p>
              <p style="margin: 10px 0 0 0; color: #166534;">${safeNotes}</p>
            </div>
          ` : ''}
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Users can now discover and purchase your prompt. Thank you for contributing to our community!
          </p>
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
            Thank you for your submission! Unfortunately, your prompt <strong>"${safeTitle}"</strong> wasn't approved at this time.
          </p>
          ${safeNotes ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Feedback:</strong></p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">${safeNotes}</p>
            </div>
          ` : ''}
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Don't be discouraged! You can revise and resubmit your prompt based on the feedback above. We'd love to see an updated version.
          </p>
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

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-submission-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
