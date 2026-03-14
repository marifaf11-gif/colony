import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: corsHeaders });
    }

    const body      = await req.json();
    const strikeId  = body.strike_id as string;
    if (!strikeId) return new Response("Missing strike_id", { status: 400, headers: corsHeaders });

    const { data: strike } = await supabase
      .from("strikes")
      .select("*")
      .eq("id", strikeId)
      .maybeSingle();

    if (!strike) return new Response("Strike not found", { status: 404, headers: corsHeaders });

    const to      = strike.contact_email ?? "";
    const subject = `Votre site ${strike.website} — risques Loi 25 détectés`;
    const body_text = strike.email_draft ?? "";

    const gmailDraftLink = to
      ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body_text)}`
      : null;

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`[Colony OS Strike]\n${subject}\n\n${body_text.slice(0, 300)}...`)}`;

    await supabase
      .from("strikes")
      .update({ status: "STAGED" })
      .eq("id", strikeId);

    const discordWebhook = Deno.env.get("DISCORD_BOUNTY_WEBHOOK");
    if (discordWebhook && to) {
      const sevColor = strike.severity === "HIGH" ? 0xff3b3b : strike.severity === "MEDIUM" ? 0xffb830 : 0x39ff14;
      await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: `[STRIKE STAGED] ${strike.company_name}`,
            description: `Email drafted and ready to send to \`${to}\``,
            color: sevColor,
            fields: [
              { name: "Target",   value: strike.website,  inline: true },
              { name: "Severity", value: strike.severity, inline: true },
              { name: "Bounty",   value: `$${(strike.revenue_value / 100).toLocaleString("en-CA")} CAD`, inline: true },
              { name: "Gmail Draft", value: `[Open Draft](${gmailDraftLink ?? "#"})`, inline: false },
            ],
            footer: { text: "Colony OS // Strike Engine" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({
      success: true,
      status:        "STAGED",
      to,
      subject,
      gmail_draft_link: gmailDraftLink,
      whatsapp_link:    whatsappLink,
      body_preview:     body_text.slice(0, 200),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
