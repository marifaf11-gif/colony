/*
  # Arsenal Vector Search Function

  ## Overview
  Adds a `match_arsenal_tools` RPC function for cosine-similarity
  vector search against `arsenal_tools.embedding`.

  ## Details
  - Takes a query embedding (vector 1536), threshold, and max count
  - Returns id, name, description, category, endpoint_config, success_rate
    plus a similarity score
  - Used by the arsenal-embedder edge function `?mode=search`
*/

CREATE OR REPLACE FUNCTION match_arsenal_tools(
  query_embedding vector(1536),
  match_threshold  float DEFAULT 0.3,
  match_count      int   DEFAULT 5
)
RETURNS TABLE (
  id             uuid,
  name           text,
  description    text,
  category       text,
  endpoint_config jsonb,
  success_rate   float,
  similarity     float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    t.id,
    t.name,
    t.description,
    t.category,
    t.endpoint_config,
    t.success_rate,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM arsenal_tools t
  WHERE t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) >= match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
$$;
