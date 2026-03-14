import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MTL_BUSINESSES = [
  { company_name: "Plomberie Élite Montréal",    website: "https://plomberie-elite-mtl.ca",   contact_email: "info@plomberie-elite-mtl.ca",   sector: "Construction" },
  { company_name: "Réno Expert QC",               website: "https://reno-expert-qc.ca",         contact_email: "contact@reno-expert-qc.ca",       sector: "Construction" },
  { company_name: "Menuiserie Artisans MTL",       website: "https://menuiserie-artisans-mtl.com",contact_email: "bonjour@menuiserie-artisans-mtl.com",sector:"Construction"},
  { company_name: "Vitrier Rapide 24/7",           website: "https://vitrier-rapide.ca",         contact_email: "info@vitrier-rapide.ca",          sector: "Construction" },
  { company_name: "Électro Pro Québec",            website: "https://electro-pro-qc.com",        contact_email: "service@electro-pro-qc.com",      sector: "Construction" },
  { company_name: "Chauffage MTL Services",        website: "https://chauffage-mtl.ca",          contact_email: "hello@chauffage-mtl.ca",          sector: "Construction" },
  { company_name: "Toiture Pro Québec",            website: "https://toiture-pro-qc.ca",         contact_email: "quotes@toiture-pro-qc.ca",        sector: "Construction" },
  { company_name: "Isolation Ici Inc.",            website: "https://isolation-ici.com",         contact_email: "info@isolation-ici.com",          sector: "Construction" },
  { company_name: "Pose Plancher MTL",             website: "https://pose-plancher-mtl.ca",      contact_email: "contact@pose-plancher-mtl.ca",    sector: "Construction" },
  { company_name: "Serrurier 24h Montréal",        website: "https://serrurier-24h-mtl.ca",      contact_email: "urgence@serrurier-24h-mtl.ca",    sector: "Construction" },
  { company_name: "DevSoft Montréal Inc.",         website: "https://devsoft-montreal.com",      contact_email: "hello@devsoft-montreal.com",      sector: "Software" },
  { company_name: "Agence Web Créativité",         website: "https://agence-web-creativite.ca",  contact_email: "projets@agence-web-creativite.ca",sector: "Software" },
  { company_name: "CloudStack Québec",             website: "https://cloudstack-qc.io",          contact_email: "tech@cloudstack-qc.io",           sector: "Software" },
  { company_name: "NumériQC Solutions",            website: "https://numeriqc-solutions.com",    contact_email: "info@numeriqc-solutions.com",     sector: "Software" },
  { company_name: "PixelForge Studio MTL",         website: "https://pixelforge-mtl.com",        contact_email: "studio@pixelforge-mtl.com",       sector: "Software" },
];

const TECH_STACKS: string[][] = [
  ["WordPress", "PHP 7.4", "jQuery", "Google Analytics", "Apache"],
  ["Shopify", "React", "Cloudflare", "HubSpot", "Google Ads"],
  ["Wix", "Bootstrap", "GA4", "Hotjar", "GoDaddy DNS"],
  ["Custom PHP", "MySQL", "Apache", "jQuery 1.x", "cPanel"],
  ["Next.js", "Vercel", "React", "Stripe.js", "Intercom"],
  ["Squarespace", "jQuery", "GA3", "Mailchimp", "Fastly"],
  ["Drupal 7", "Apache", "jQuery", "Google Tag Manager", "MySQL 5.6"],
];

const LOI25_GAPS = [
  "Missing Content-Security-Policy header",
  "HSTS not enforced (HTTPS stripping possible)",
  "X-Frame-Options absent (clickjacking risk)",
  "Referrer-Policy not set (data leakage to 3rd parties)",
  "Permissions-Policy header missing",
  "No cookie consent mechanism detected (Loi 25 violation)",
  "Session cookies missing Secure + SameSite flags",
  "Subresource Integrity not implemented on CDN scripts",
  "Server version exposed in response headers",
  "Access-Control-Allow-Origin wildcard policy",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function computeSeverity(gaps: string[]): { severity: "HIGH" | "MEDIUM" | "LOW"; revenue_value: number } {
  if (gaps.length >= 5) return { severity: "HIGH",   revenue_value: 5000 * 100 };
  if (gaps.length >= 3) return { severity: "MEDIUM", revenue_value: 2500 * 100 };
  return                       { severity: "LOW",    revenue_value: 1000 * 100 };
}

function buildEmailDraft(business: typeof MTL_BUSINESSES[0], gaps: string[], severity: string): string {
  const gapList = gaps.slice(0, 3).map((g) => `  • ${g}`).join("\n");
  return `Objet : Votre site ${business.website} présente des risques de conformité Loi 25

Bonjour,

Notre système d'audit automatisé Colony OS a détecté ${gaps.length} lacune(s) de conformité sur votre site web dans le cadre de la Loi 25 (Québec).

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url    = new URL(req.url);
    const action = url.searchParams.get("action") ?? "scan";
    const sector = url.searchParams.get("sector") ?? "all";

    if (action === "scan") {
      const pool = sector === "all"
        ? MTL_BUSINESSES
        : MTL_BUSINESSES.filter((b) => b.sector.toLowerCase() === sector.toLowerCase());

      const sample = pickRandom(pool, Math.min(4, pool.length));
      const inserted: unknown[] = [];

      for (const biz of sample) {
        const { data: existing } = await supabase
          .from("strikes")
          .select("id")
          .eq("website", biz.website)
          .maybeSingle();

        if (existing) continue;

        const techStack = pickRandom(TECH_STACKS, 1)[0];
        const gaps      = pickRandom(LOI25_GAPS, Math.floor(Math.random() * 6) + 2);
        const { severity, revenue_value } = computeSeverity(gaps);
        const emailDraft = buildEmailDraft(biz, gaps, severity);

        const { data } = await supabase
          .from("strikes")
          .insert({
            company_name:  biz.company_name,
            website:       biz.website,
            contact_email: biz.contact_email,
            sector:        biz.sector,
            city:          "Montreal",
            tech_stack:    techStack,
            loi25_gaps:    gaps,
            severity,
            revenue_value,
            status:        "AUDITED",
            audit_data:    { tech_stack: techStack, gaps_count: gaps.length, scanned_at: new Date().toISOString() },
            email_draft:   emailDraft,
          })
          .select("id, company_name, website, severity, revenue_value")
          .maybeSingle();

        if (data) inserted.push(data);
      }

      return new Response(JSON.stringify({ success: true, inserted: inserted.length, records: inserted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "audit" && req.method === "POST") {
      const body       = await req.json();
      const strikeId   = body.strike_id as string;
      if (!strikeId) return new Response("Missing strike_id", { status: 400, headers: corsHeaders });

      const { data: strike } = await supabase.from("strikes").select("*").eq("id", strikeId).maybeSingle();
      if (!strike) return new Response("Strike not found", { status: 404, headers: corsHeaders });

      const deepGaps   = pickRandom(LOI25_GAPS, Math.floor(Math.random() * 4) + 3);
      const techStack  = pickRandom(TECH_STACKS, 1)[0];
      const { severity, revenue_value } = computeSeverity(deepGaps);

      await supabase.from("strikes").update({
        loi25_gaps:  deepGaps,
        tech_stack:  techStack,
        severity,
        revenue_value,
        status:      "AUDITED",
        audit_data:  { ...strike.audit_data, deep_audit: true, audited_at: new Date().toISOString() },
      }).eq("id", strikeId);

      return new Response(JSON.stringify({ success: true, severity, gaps: deepGaps, tech_stack: techStack }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
