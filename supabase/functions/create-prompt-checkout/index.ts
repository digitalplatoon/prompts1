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
  console.log(`[CREATE-PROMPT-CHECKOUT] ${step}${detailsStr}`);
};

// Server-side price map - source of truth for prompt pricing
// This prevents price manipulation attacks where clients could send arbitrary prices
const PROMPT_PRICES: Record<string, { price: number; title: string }> = {
  '1': { price: 9.99, title: 'Ultimate Blog Post Generator' },
  '2': { price: 14.99, title: 'Cinematic Scene Generator' },
  '3': { price: 12.99, title: 'Code Review Assistant' },
  '4': { price: 19.99, title: 'Marketing Campaign Planner' },
  '5': { price: 24.99, title: 'Business Plan Generator' },
  '6': { price: 11.99, title: 'Fantasy World Builder' },
  '7': { price: 8.99, title: 'Claude Research Assistant' },
  '8': { price: 13.99, title: 'Product Photography Style' },
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { promptId, promptTitle, promptPrice, promptCategory } = await req.json();
    logStep("Request data", { promptId, promptTitle, promptPrice, promptCategory });

    if (!promptId || !promptTitle || !promptPrice) {
      throw new Error("Missing required fields: promptId, promptTitle, promptPrice");
    }

    // Server-side price validation - prevent price manipulation attacks
    const validPrompt = PROMPT_PRICES[promptId];
    if (!validPrompt) {
      logStep("ERROR: Invalid prompt ID", { promptId });
      throw new Error("Invalid prompt ID");
    }

    if (validPrompt.price !== promptPrice) {
      logStep("ERROR: Price mismatch detected", { 
        providedPrice: promptPrice, 
        actualPrice: validPrompt.price,
        promptId 
      });
      throw new Error("Price mismatch - please refresh and try again");
    }

    logStep("Price validation passed", { promptId, price: validPrompt.price });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

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
              name: validPrompt.title,
              description: `AI Prompt: ${validPrompt.title}`,
            },
            unit_amount: Math.round(validPrompt.price * 100), // Use validated server-side price
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
        prompt_price: validPrompt.price.toString(), // Store validated price in metadata
        prompt_title: validPrompt.title,
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
