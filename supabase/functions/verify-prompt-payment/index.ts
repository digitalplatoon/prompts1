import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
  console.log(`[VERIFY-PROMPT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { sessionId, promptId } = await req.json();
    logStep("Request data", { sessionId, promptId });

    if (!sessionId || !promptId) {
      throw new Error("Missing required fields: sessionId, promptId");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    // Verify the session belongs to this user and prompt
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }
    if (session.metadata?.prompt_id !== promptId) {
      throw new Error("Session does not match this prompt");
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        verified: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if purchase already exists
    const { data: existingPurchase } = await supabaseClient
      .from("purchased_prompts")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .maybeSingle();

    if (existingPurchase) {
      logStep("Purchase already recorded", { purchaseId: existingPurchase.id });
      return new Response(JSON.stringify({ 
        verified: true, 
        message: "Purchase already recorded" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Record the purchase
    const price = parseFloat(session.metadata?.prompt_price || "0");
    const { error: insertError } = await supabaseClient
      .from("purchased_prompts")
      .insert({
        user_id: user.id,
        prompt_id: promptId,
        price: price,
      });

    if (insertError) {
      logStep("Insert error", { error: insertError });
      throw new Error(`Failed to record purchase: ${insertError.message}`);
    }

    logStep("Purchase recorded successfully");

    // Send confirmation email in background
    const promptTitle = session.metadata?.prompt_title || "Your Prompt";
    const promptCategory = session.metadata?.prompt_category || "General";
    
    if (user.email) {
      logStep("Sending confirmation email", { email: user.email });
      
      try {
        const emailResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-purchase-confirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              email: user.email,
              promptTitle,
              promptCategory,
              price,
              purchaseDate: new Date().toISOString(),
            }),
          }
        );
        
        if (emailResponse.ok) {
          logStep("Confirmation email sent successfully");
        } else {
          const errorData = await emailResponse.text();
          logStep("Failed to send confirmation email", { error: errorData });
        }
      } catch (emailError) {
        logStep("Email sending error", { error: emailError instanceof Error ? emailError.message : String(emailError) });
        // Don't throw - we still want to return success for the purchase
      }
    }

    return new Response(JSON.stringify({ 
      verified: true, 
      message: "Purchase verified and recorded" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
