import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const model = new Supabase.ai.Session("gte-small");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") ?? "seed";

    if (mode === "seed") {
      const { data: tools, error } = await supabase
        .from("arsenal_tools")
        .select("id, name, description, category")
        .is("embedding", null);

      if (error) throw error;
      if (!tools || tools.length === 0) {
        return new Response(JSON.stringify({ embedded: 0, message: "All tools already embedded" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let embedded = 0;
      for (const tool of tools) {
        const text = [
          tool.name,
          tool.description ?? "",
          tool.category ?? "",
        ].filter(Boolean).join(" | ");

        const embedding = await model.run(text, { mean_pool: true, normalize: true });

        await supabase
          .from("arsenal_tools")
          .update({ embedding })
          .eq("id", tool.id);

        embedded++;
      }

      return new Response(JSON.stringify({ embedded, total: tools.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "search" && req.method === "POST") {
      const { query, top_k = 5 } = await req.json();
      if (!query) {
        return new Response(JSON.stringify({ error: "query required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const queryEmbedding = await model.run(query, { mean_pool: true, normalize: true });

      const { data, error } = await supabase.rpc("match_arsenal_tools", {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: top_k,
      });

      if (error) throw error;

      return new Response(JSON.stringify({ results: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
