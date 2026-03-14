import { createClient } from '@/lib/supabase/client';
import type { ArsenalTool } from './loader';

export interface WeaponryQuery {
  task: string;
  category?: string;
  topK?: number;
}

export interface WeaponryResult {
  tool: ArsenalTool;
  score: number;
  reasoning: string;
}

const KEYWORD_CATEGORY_MAP: Record<string, string[]> = {
  email: ['email', 'contact', 'address', 'outreach', 'prospect', 'newsletter'],
  enrichment: ['enrich', 'company', 'firmographic', 'employee', 'size', 'industry'],
  scraping: ['scrape', 'extract', 'crawl', 'data', 'website', 'collect'],
  'geo-intelligence': ['local', 'map', 'location', 'city', 'region', 'geography', 'law firm', 'restaurant', 'dentist'],
  'tech-intelligence': ['technology', 'tech stack', 'cms', 'framework', 'platform', 'wordpress'],
  security: ['security', 'vulnerability', 'port', 'dns', 'subdomain', 'hacking', 'recon', 'exploit'],
  performance: ['performance', 'speed', 'vitals', 'lcp', 'cls', 'inp', 'pagespeed', 'load time'],
  seo: ['seo', 'backlink', 'ranking', 'organic', 'keyword', 'authority', 'domain rating'],
  outreach: ['send', 'deliver', 'email campaign', 'cold email', 'sequence'],
  payments: ['payment', 'invoice', 'checkout', 'stripe', 'charge', 'billing', 'remediation'],
};

function detectCategories(task: string): string[] {
  const lower = task.toLowerCase();
  const matched: string[] = [];
  for (const [cat, keywords] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(cat);
    }
  }
  return matched;
}

function keywordScore(tool: ArsenalTool, task: string): number {
  const lower = task.toLowerCase();
  const allText = `${tool.name} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  const hits = words.filter((w) => allText.includes(w)).length;
  return hits / Math.max(words.length, 1);
}

export async function selectWeapon(query: WeaponryQuery): Promise<WeaponryResult[]> {
  const supabase = createClient();
  const topK = query.topK ?? 3;

  let dbQuery = supabase
    .from('arsenal_tools')
    .select('id, name, description, category, endpoint, rating, tags')
    .order('rating', { ascending: false });

  if (query.category) {
    dbQuery = dbQuery.eq('category', query.category);
  } else {
    const detectedCats = detectCategories(query.task);
    if (detectedCats.length > 0) {
      dbQuery = dbQuery.in('category', detectedCats);
    }
  }

  const { data: tools, error } = await dbQuery.limit(20);
  if (error || !tools) return [];

  const scored = (tools as ArsenalTool[]).map((tool) => {
    const kw = keywordScore(tool, query.task);
    const rating = tool.rating / 5;
    const score = kw * 0.6 + rating * 0.4;

    const matchedTags = tool.tags.filter((t) =>
      query.task.toLowerCase().includes(t.toLowerCase())
    );
    const reasoning =
      matchedTags.length > 0
        ? `Matched on: ${matchedTags.slice(0, 3).join(', ')}. Rating: ${tool.rating}/5`
        : `Category match: ${tool.category}. Rating: ${tool.rating}/5`;

    return { tool, score, reasoning };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function selectWeaponForTask(task: string): Promise<WeaponryResult | null> {
  const results = await selectWeapon({ task, topK: 1 });
  return results[0] ?? null;
}
