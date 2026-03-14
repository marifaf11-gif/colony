import { createClient } from '@/lib/supabase/client';

export interface ArsenalTool {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  endpoint_config: Record<string, unknown> | null;
  success_rate: number;
}

const SEED_TOOLS: Omit<ArsenalTool, 'id'>[] = [
  {
    name: 'Hunter.io Email Finder',
    description: 'Find professional email addresses for any domain. Best for B2B prospecting.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.hunter.io/v2', version: 'v2', auth: 'api_key' },
    success_rate: 0.94,
  },
  {
    name: 'Apollo.io People Search',
    description: 'Search 275M+ contacts with filters for industry, title, company size.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.apollo.io/v1', version: 'v1', auth: 'api_key' },
    success_rate: 0.91,
  },
  {
    name: 'Clearbit Enrichment',
    description: 'Real-time company and person enrichment from email or domain.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://company.clearbit.com/v2', version: 'v2', auth: 'bearer' },
    success_rate: 0.89,
  },
  {
    name: 'Phantombuster LinkedIn Scraper',
    description: 'Extract LinkedIn profiles, connections, and company employees at scale.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.phantombuster.com/api/v2', version: 'v2', auth: 'x-phantombuster-key' },
    success_rate: 0.87,
  },
  {
    name: 'ScraperAPI',
    description: 'Rotating proxy scraping API. Bypass anti-bot measures, render JS.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.scraperapi.com', auth: 'api_key', render: true },
    success_rate: 0.85,
  },
  {
    name: 'Google Maps Places API',
    description: 'Find local businesses, addresses, phone numbers, and ratings by category and location.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://maps.googleapis.com/maps/api/place', auth: 'api_key', format: 'json' },
    success_rate: 0.98,
  },
  {
    name: 'BuiltWith Technology Profiler',
    description: 'Identify technologies used on any website: CMS, analytics, payments, hosting.',
    category: 'SEO',
    endpoint_config: { url: 'https://api.builtwith.com/v21/api.json', version: 'v21', auth: 'api_key' },
    success_rate: 0.93,
  },
  {
    name: 'Wappalyzer API',
    description: 'Detect web technologies, frameworks, and libraries on target domains.',
    category: 'SEO',
    endpoint_config: { url: 'https://api.wappalyzer.com/v2', version: 'v2', auth: 'x-api-key' },
    success_rate: 0.88,
  },
  {
    name: 'SecurityTrails DNS API',
    description: 'Historical DNS data, subdomains, associated domains, and WHOIS information.',
    category: 'SECURITY',
    endpoint_config: { url: 'https://api.securitytrails.com/v1', version: 'v1', auth: 'apikey' },
    success_rate: 0.92,
  },
  {
    name: 'Shodan Search Engine',
    description: 'Search internet-connected devices. Find exposed ports, services, vulnerabilities.',
    category: 'SECURITY',
    endpoint_config: { url: 'https://api.shodan.io', auth: 'key', streaming: false },
    success_rate: 0.95,
  },
  {
    name: 'PageSpeed Insights API',
    description: 'Google Core Web Vitals analysis: LCP, CLS, INP scores and improvement recommendations.',
    category: 'SEO',
    endpoint_config: { url: 'https://www.googleapis.com/pagespeedonline/v5', version: 'v5', auth: 'api_key', strategy: 'mobile' },
    success_rate: 0.99,
  },
  {
    name: 'Ahrefs API',
    description: 'SEO metrics: backlinks, domain rating, organic traffic, keyword rankings.',
    category: 'SEO',
    endpoint_config: { url: 'https://apiv2.ahrefs.com', version: 'v2', auth: 'bearer' },
    success_rate: 0.93,
  },
  {
    name: 'Moz Domain Authority API',
    description: 'Domain Authority, Page Authority, and spam scores for any URL.',
    category: 'SEO',
    endpoint_config: { url: 'https://lsapi.seomoz.com/v2', version: 'v2', auth: 'basic' },
    success_rate: 0.90,
  },
  {
    name: 'SendGrid Email API',
    description: 'Transactional and marketing email delivery at scale with analytics.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.sendgrid.com/v3', version: 'v3', auth: 'bearer' },
    success_rate: 0.97,
  },
  {
    name: 'Stripe Payment Links API',
    description: 'Generate no-code payment links for products and services instantly.',
    category: 'LEAD-GEN',
    endpoint_config: { url: 'https://api.stripe.com/v1/payment_links', version: 'v1', auth: 'bearer', idempotent: true },
    success_rate: 1.0,
  },
];

export async function seedArsenal(): Promise<{ loaded: number; skipped: number }> {
  const supabase = createClient();
  const { count } = await supabase
    .from('arsenal_tools')
    .select('*', { count: 'exact', head: true });

  if (count && count >= SEED_TOOLS.length) {
    return { loaded: 0, skipped: count };
  }

  type AnyUpsert = { from: (t: string) => { upsert: (v: unknown, opts?: unknown) => { select: (c: string) => Promise<{ data: { id: string }[] | null; error: unknown }> } } };
  const { data, error } = await (supabase as unknown as AnyUpsert)
    .from('arsenal_tools')
    .upsert(SEED_TOOLS, { onConflict: 'name', ignoreDuplicates: true })
    .select('id');

  if (error) throw error;
  return { loaded: (data as { id: string }[] | null)?.length ?? 0, skipped: count ?? 0 };
}

export async function getArsenalTools(category?: string): Promise<ArsenalTool[]> {
  const supabase = createClient();
  let query = supabase
    .from('arsenal_tools')
    .select('id, name, description, category, endpoint_config, success_rate')
    .order('success_rate', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return (data ?? []) as ArsenalTool[];
}
