import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BATCH_SIZE  = 20;
const MAX_ATTEMPTS = 3;

async function sendDiscord(webhookUrl: string, payload: unknown): Promise<void> {
  const ctrl    = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(webhookUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      signal:  ctrl.signal,
    });
    if (!res.ok) throw new Error(`Discord returned ${res.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.log(JSON.stringify({ event: "notify-worker-start", correlationId }));

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const discordWebhook = Deno.env.get("DISCORD_BOUNTY_WEBHOOK");

    const { data: pending, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.log(JSON.stringify({ event: "notify-worker-fetch-error", correlationId, error: error.message }));
      return new Response(JSON.stringify({ error: error.message, correlationId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = pending ?? [];
    let sent   = 0;
    let failed = 0;

    for (const n of rows) {
      try {
        if (n.type === "discord" && discordWebhook) {
          await sendDiscord(discordWebhook, n.payload);
        }

        await supabase
          .from("notifications")
          .update({ status: "SENT", attempts: n.attempts + 1 })
          .eq("id", n.id);

        sent++;
        console.log(JSON.stringify({ event: "notify-sent", correlationId, id: n.id, type: n.type }));
      } catch (err) {
        const newAttempts = n.attempts + 1;
        const newStatus   = newAttempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING";

        await supabase
          .from("notifications")
          .update({ status: newStatus, attempts: newAttempts, last_error: String(err) })
          .eq("id", n.id);

        failed++;
        console.log(JSON.stringify({ event: "notify-failed", correlationId, id: n.id, type: n.type, attempts: newAttempts, error: String(err) }));
      }
    }

    console.log(JSON.stringify({ event: "notify-worker-done", correlationId, processed: rows.length, sent, failed }));

    return new Response(JSON.stringify({ success: true, correlationId, processed: rows.length, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(JSON.stringify({ event: "notify-worker-error", correlationId, error: String(err) }));
    return new Response(JSON.stringify({ error: String(err), correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
