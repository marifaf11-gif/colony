import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.log(JSON.stringify({ event: "create-checkout-start", correlationId }));

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: corsHeaders });
    }

    const body     = await req.json();
    const strikeId = body.strike_id as string;
    if (!strikeId) {
      return new Response("Missing strike_id", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: strike } = await supabase
      .from("strikes")
      .select("id, company_name, website, severity, revenue_value, contact_email")
      .eq("id", strikeId)
      .maybeSingle();

    if (!strike) {
      return new Response("Strike not found", { status: 404, headers: corsHeaders });
    }

    const stripe  = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const hostUrl = Deno.env.get("APP_HOST_URL") ?? "https://colony-os.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email:       strike.contact_email ?? undefined,
      line_items: [{
        price_data: {
          currency:     "cad",
          product_data: {
            name:        "Loi 25 Compliance Remediation",
            description: `Full remediation for ${strike.website} — all ${strike.severity} severity gaps resolved within 5 business days.`,
          },
          unit_amount: 29900,
        },
        quantity: 1,
      }],
      mode:        "payment",
      success_url: `${hostUrl}/remediation/success?strike=${strikeId}&session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${hostUrl}/remediation/cancel?strike=${strikeId}`,
      metadata: {
        strike_id:    strikeId,
        company_name: strike.company_name,
        website:      strike.website,
        severity:     strike.severity,
        correlation_id: correlationId,
      },
    });

    await supabase.from("notifications").insert({
      type: "discord",
      payload: {
        content: `[CHECKOUT] Stripe session created for **${strike.company_name}** | $299 CAD | ${correlationId}`,
      },
    });

    console.log(JSON.stringify({ event: "create-checkout-done", correlationId, strikeId, sessionId: session.id }));

    return new Response(JSON.stringify({ success: true, correlationId, url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(JSON.stringify({ event: "create-checkout-error", correlationId, error: String(err) }));
    return new Response(JSON.stringify({ error: String(err), correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
