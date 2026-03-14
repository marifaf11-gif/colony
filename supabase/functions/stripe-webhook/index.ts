import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret   = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const stripe          = new Stripe(stripeSecretKey, { apiVersion: "2025-02-24.acacia" });

    const body      = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.log(JSON.stringify({ event: "stripe-webhook-sig-fail", correlationId, error: String(err) }));
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(JSON.stringify({ event: "stripe-webhook-received", correlationId, type: event.type }));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.type === "checkout.session.completed") {
      const session  = event.data.object as Stripe.Checkout.Session;
      const strikeId = session.metadata?.strike_id;

      if (strikeId) {
        const [updateErr, paymentErr] = await Promise.all([
          supabase
            .from("strikes")
            .update({ status: "BOUNTY_PAID", updated_at: new Date().toISOString() })
            .eq("id", strikeId)
            .then(({ error }) => error),

          supabase
            .from("payments")
            .insert({
              strike_id:                strikeId,
              stripe_session_id:        session.id,
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
              amount_cents:             session.amount_total ?? 29900,
              currency:                 session.currency    ?? "cad",
              status:                   "succeeded",
              customer_email:           session.customer_email ?? session.customer_details?.email ?? null,
              metadata:                 session.metadata ?? {},
            })
            .then(({ error }) => error),
        ]);

        if (updateErr)  console.log(JSON.stringify({ event: "stripe-webhook-update-error",  correlationId, error: updateErr.message }));
        if (paymentErr) console.log(JSON.stringify({ event: "stripe-webhook-payment-error", correlationId, error: paymentErr.message }));

        if (!updateErr && !paymentErr) {
          await supabase.from("notifications").insert({
            type: "discord",
            payload: {
              content: `[PAID] Strike **${strikeId}** — $${((session.amount_total ?? 0) / 100).toFixed(2)} ${(session.currency ?? "cad").toUpperCase()} received from ${session.customer_email ?? "unknown"}`,
              correlationId,
            },
          });
          console.log(JSON.stringify({ event: "stripe-webhook-paid", correlationId, strikeId, amount: session.amount_total }));
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session  = event.data.object as Stripe.Checkout.Session;
      const strikeId = session.metadata?.strike_id;
      if (strikeId) {
        await supabase
          .from("strikes")
          .update({ status: "AUDITED", updated_at: new Date().toISOString() })
          .eq("id", strikeId)
          .eq("status", "CHECKOUT_PENDING");
        console.log(JSON.stringify({ event: "stripe-webhook-expired", correlationId, strikeId }));
      }
    }

    return new Response(JSON.stringify({ received: true, correlationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(JSON.stringify({ event: "stripe-webhook-error", correlationId, error: String(err) }));
    return new Response(JSON.stringify({ error: String(err), correlationId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
