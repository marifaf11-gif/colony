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
  'LEAD-GEN': ['email', 'contact', 'address', 'outreach', 'prospect', 'newsletter', 'enrich', 'company', 'firmographic', 'scrape', 'extract', 'crawl', 'local', 'map', 'send', 'deliver', 'payment', 'invoice', 'stripe'],
  SEO: ['seo', 'backlink', 'ranking', 'organic', 'keyword', 'authority', 'domain', 'technology', 'tech stack', 'cms', 'framework', 'performance', 'speed', 'vitals', 'lcp', 'cls', 'pagespeed'],
  SECURITY: ['security', 'vulnerability', 'port', 'dns', 'subdomain', 'hacking', 'recon', 'exploit', 'shodan', 'exposed'],
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
  const allText = `${tool.name} ${tool.description ?? ''} ${tool.category ?? ''}`.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  const hits = words.filter((w) => allText.includes(w)).length;
  return hits / Math.max(words.length, 1);
}

export async function selectWeapon(query: WeaponryQuery): Promise<WeaponryResult[]> {
  const supabase = createClient();
  const topK = query.topK ?? 3;

  let dbQuery = supabase
    .from('arsenal_tools')
    .select('id, name, description, category, endpoint_config, success_rate')
    .order('success_rate', { ascending: false });

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
    const score = kw * 0.6 + tool.success_rate * 0.4;
    const reasoning = `Category: ${tool.category ?? 'general'}. Success rate: ${(tool.success_rate * 100).toFixed(0)}%`;
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
