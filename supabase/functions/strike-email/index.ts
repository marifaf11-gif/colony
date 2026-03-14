import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function buildEmailBody(strike: Record<string, unknown>): string {
  const gaps = (strike.loi25_gaps as string[] ?? []).slice(0, 5);
  const gapList = gaps.map((g) => `  • ${g}`).join("\n");
  const website = strike.website as string ?? "";
  const severity = strike.severity as string ?? "MEDIUM";
  const gapCount = gaps.length;

  return `Objet : Votre site ${website} présente des risques de conformité Loi 25

Bonjour,

Notre système d'audit automatisé Colony OS a détecté ${gapCount} lacune(s) de conformité sur votre site web dans le cadre de la Loi 25 (Québec).

Niveau de risque identifié : ${severity}

Lacunes prioritaires :
${gapList}

Ces lacunes peuvent exposer votre entreprise à des amendes allant jusqu'à 25 M$ ou 4 % de votre chiffre d'affaires annuel mondial en vertu de la Loi 25.

Notre équipe peut corriger l'ensemble de ces problèmes en moins de 5 jours ouvrables pour 299 $ CAD (frais uniques).

Pour activer la remédiation : https://colony-os.app/remediation

Cordialement,
Équipe Colony OS — Strike Engine
`;
}

async function fireDiscordWithRetry(
  webhookUrl: string,
  payload: unknown,
  correlationId: string,
  maxAttempts = 3
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      return;
    } catch (err) {
      console.log(JSON.stringify({ event: "discord-retry", correlationId, attempt: i + 1, error: String(err) }));
      if (i < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, i)));
      }
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const correlationId = crypto.randomUUID();
  console.log(JSON.stringify({ event: "strike-email-start", correlationId }));

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: corsHeaders });
    }

    const body     = await req.json();
    const strikeId = body.strike_id as string;
    if (!strikeId) return new Response("Missing strike_id", { status: 400, headers: corsHeaders });

    const { data: strike } = await supabase
      .from("strikes")
      .select("*")
      .eq("id", strikeId)
      .maybeSingle();

    if (!strike) return new Response("Strike not found", { status: 404, headers: corsHeaders });

    const emailBody = strike.email_draft ?? buildEmailBody(strike);
    const to        = strike.contact_email ?? "";
    const subject   = `Votre site ${strike.website} — risques Loi 25 détectés`;

    const gmailDraftLink = to
      ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
      : null;

    if (gmailDraftLink) {
      const parsed = new URL(gmailDraftLink);
      if (!parsed.searchParams.get("to")) {
        console.log(JSON.stringify({ event: "strike-email-invalid-gmail", correlationId, strikeId }));
      }
    }

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`[Colony OS Strike]\n${subject}\n\n${emailBody.slice(0, 300)}...`)}`;

    await supabase
      .from("strikes")
      .update({ status: "STAGED" })
      .eq("id", strikeId);

    await supabase.from("notifications").insert({
      type: "discord",
      payload: {
        embeds: [{
          title: `[STRIKE STAGED] ${strike.company_name}`,
          description: `Email drafted and ready to send to \`${to || "unknown"}\``,
          color: strike.severity === "HIGH" ? 0xff3b3b : strike.severity === "MEDIUM" ? 0xffb830 : 0x39ff14,
          fields: [
            { name: "Target",      value: strike.website,  inline: true },
            { name: "Severity",    value: strike.severity, inline: true },
            { name: "Bounty",      value: `$${(strike.revenue_value / 100).toLocaleString("en-CA")} CAD`, inline: true },
            { name: "Gmail Draft", value: gmailDraftLink ? `[Open Draft](${gmailDraftLink})` : "No email on file", inline: false },
          ],
          footer: { text: `Colony OS // Strike Engine • ${correlationId}` },
          timestamp: new Date().toISOString(),
        }],
      },
    });

    const discordWebhook = Deno.env.get("DISCORD_BOUNTY_WEBHOOK");
    if (discordWebhook && to) {
      EdgeRuntime.waitUntil(
        fireDiscordWithRetry(
          discordWebhook,
          {
            embeds: [{
              title: `[STRIKE STAGED] ${strike.company_name}`,
              description: `Email drafted and ready to send to \`${to}\``,
              color: strike.severity === "HIGH" ? 0xff3b3b : strike.severity === "MEDIUM" ? 0xffb830 : 0x39ff14,
              fields: [
                { name: "Target",   value: strike.website,  inline: true },
                { name: "Severity", value: strike.severity, inline: true },
                { name: "Bounty",   value: `$${(strike.revenue_value / 100).toLocaleString("en-CA")} CAD`, inline: true },
                { name: "Gmail Draft", value: gmailDraftLink ? `[Open Draft](${gmailDraftLink})` : "No email on file", inline: false },
              ],
              footer: { text: `Colony OS // Strike Engine • ${correlationId}` },
              timestamp: new Date().toISOString(),
            }],
          },
          correlationId
        )
      );
    }

    console.log(JSON.stringify({ event: "strike-email-staged", correlationId, strikeId, severity: strike.severity }));

    return new Response(JSON.stringify({
      success:          true,
      correlationId,
      status:           "STAGED",
      to,
      subject,
      gmail_draft_link: gmailDraftLink,
      whatsapp_link:    whatsappLink,
      body_preview:     emailBody.slice(0, 200),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.log(JSON.stringify({ event: "strike-email-error", correlationId, error: String(err) }));
    return new Response(JSON.stringify({ error: String(err), correlationId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
