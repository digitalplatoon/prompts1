import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
  console.log(`[CREATE-PROMPT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key for database queries to bypass RLS
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { promptId, promptTitle, promptPrice, promptCategory } = await req.json();
    logStep("Request data", { promptId, category: promptCategory });

    if (!promptId || !promptTitle || promptPrice === undefined || promptPrice === null) {
      throw new Error("Missing required fields: promptId, promptTitle, promptPrice");
    }

    // Server-side price validation - query actual price from database
    // This prevents price manipulation attacks by validating against the source of truth
    const { data: promptData, error: promptError } = await supabaseAdmin
      .from('prompts')
      .select('price_cents, title, status')
      .eq('id', promptId)
      .single();

    if (promptError || !promptData) {
      logStep("ERROR: Prompt not found in database", { promptId, error: promptError?.message });
      throw new Error("Prompt not found");
    }

    if (promptData.status !== 'published') {
      logStep("ERROR: Prompt not published", { promptId, status: promptData.status });
      throw new Error("Prompt not available for purchase");
    }

    // Calculate server-side price from database (price_cents to dollars)
    const serverPrice = promptData.price_cents / 100;

    // Allow small floating point differences (up to 1 cent)
    if (Math.abs(serverPrice - promptPrice) > 0.01) {
      logStep("ERROR: Price mismatch detected - potential manipulation attempt", { 
        providedPrice: promptPrice, 
        actualPrice: serverPrice,
        promptId 
      });
      throw new Error("Price mismatch - please refresh and try again");
    }

    logStep("Price validation passed", { promptId, price: serverPrice });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create a one-time payment session with validated server-side price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: promptData.title,
              description: `AI Prompt: ${promptData.title}`,
            },
            unit_amount: promptData.price_cents, // Use validated server-side price (already in cents)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&prompt_id=${promptId}`,
      cancel_url: `${origin}/prompt/${promptId}?payment=cancelled`,
      metadata: {
        prompt_id: promptId,
        user_id: user.id,
        prompt_price: serverPrice.toString(), // Store validated price in metadata
        prompt_title: promptData.title,
        prompt_category: promptCategory || "General",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
