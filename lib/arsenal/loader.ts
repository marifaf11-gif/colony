import { createClient } from '@/lib/supabase/client';

export interface ArsenalTool {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  rating: number;
  tags: string[];
}

const SEED_TOOLS: Omit<ArsenalTool, 'id'>[] = [
  {
    name: 'Hunter.io Email Finder',
    description: 'Find professional email addresses for any domain. Best for B2B prospecting.',
    category: 'email',
    endpoint: 'https://api.hunter.io/v2',
    rating: 4.8,
    tags: ['email', 'prospecting', 'b2b', 'lead-gen'],
  },
  {
    name: 'Apollo.io People Search',
    description: 'Search 275M+ contacts with filters for industry, title, company size.',
    category: 'enrichment',
    endpoint: 'https://api.apollo.io/v1',
    rating: 4.7,
    tags: ['contacts', 'enrichment', 'email', 'phone'],
  },
  {
    name: 'Clearbit Enrichment',
    description: 'Real-time company and person enrichment from email or domain.',
    category: 'enrichment',
    endpoint: 'https://company.clearbit.com/v2',
    rating: 4.6,
    tags: ['enrichment', 'company', 'firmographic'],
  },
  {
    name: 'Phantombuster LinkedIn Scraper',
    description: 'Extract LinkedIn profiles, connections, and company employees at scale.',
    category: 'scraping',
    endpoint: 'https://api.phantombuster.com/api/v2',
    rating: 4.5,
    tags: ['linkedin', 'scraping', 'social', 'outreach'],
  },
  {
    name: 'ScraperAPI',
    description: 'Rotating proxy scraping API. Bypass anti-bot measures, render JS.',
    category: 'scraping',
    endpoint: 'https://api.scraperapi.com',
    rating: 4.3,
    tags: ['scraping', 'proxy', 'web', 'javascript'],
  },
  {
    name: 'Google Maps Places API',
    description: 'Find local businesses, addresses, phone numbers, and ratings by category and location.',
    category: 'geo-intelligence',
    endpoint: 'https://maps.googleapis.com/maps/api/place',
    rating: 4.9,
    tags: ['local', 'geo', 'business', 'phone', 'email'],
  },
  {
    name: 'BuiltWith Technology Profiler',
    description: 'Identify technologies used on any website: CMS, analytics, payments, hosting.',
    category: 'tech-intelligence',
    endpoint: 'https://api.builtwith.com/v21/api.json',
    rating: 4.7,
    tags: ['tech-stack', 'cms', 'analytics', 'intelligence'],
  },
  {
    name: 'Wappalyzer API',
    description: 'Detect web technologies, frameworks, and libraries on target domains.',
    category: 'tech-intelligence',
    endpoint: 'https://api.wappalyzer.com/v2',
    rating: 4.4,
    tags: ['tech-stack', 'detection', 'frameworks'],
  },
  {
    name: 'SecurityTrails DNS API',
    description: 'Historical DNS data, subdomains, associated domains, and WHOIS information.',
    category: 'security',
    endpoint: 'https://api.securitytrails.com/v1',
    rating: 4.6,
    tags: ['dns', 'security', 'subdomains', 'recon'],
  },
  {
    name: 'Shodan Search Engine',
    description: 'Search internet-connected devices. Find exposed ports, services, vulnerabilities.',
    category: 'security',
    endpoint: 'https://api.shodan.io',
    rating: 4.8,
    tags: ['security', 'iot', 'ports', 'vulnerabilities', 'recon'],
  },
  {
    name: 'PageSpeed Insights API',
    description: 'Google Core Web Vitals analysis: LCP, CLS, INP scores and improvement recommendations.',
    category: 'performance',
    endpoint: 'https://www.googleapis.com/pagespeedonline/v5',
    rating: 4.9,
    tags: ['performance', 'vitals', 'seo', 'speed', 'lcp', 'cls'],
  },
  {
    name: 'Ahrefs API',
    description: 'SEO metrics: backlinks, domain rating, organic traffic, keyword rankings.',
    category: 'seo',
    endpoint: 'https://apiv2.ahrefs.com',
    rating: 4.8,
    tags: ['seo', 'backlinks', 'keywords', 'traffic', 'authority'],
  },
  {
    name: 'Moz Domain Authority API',
    description: 'Domain Authority, Page Authority, and spam scores for any URL.',
    category: 'seo',
    endpoint: 'https://lsapi.seomoz.com/v2',
    rating: 4.5,
    tags: ['seo', 'authority', 'domain', 'spam'],
  },
  {
    name: 'SendGrid Email API',
    description: 'Transactional and marketing email delivery at scale with analytics.',
    category: 'outreach',
    endpoint: 'https://api.sendgrid.com/v3',
    rating: 4.7,
    tags: ['email', 'outreach', 'transactional', 'delivery'],
  },
  {
    name: 'Stripe Payment Links API',
    description: 'Generate no-code payment links for products and services instantly.',
    category: 'payments',
    endpoint: 'https://api.stripe.com/v1/payment_links',
    rating: 5.0,
    tags: ['payments', 'stripe', 'invoicing', 'checkout'],
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
    .upsert(
      SEED_TOOLS.map((t) => ({ ...t, tags: t.tags })),
      { onConflict: 'name', ignoreDuplicates: true }
    )
    .select('id');

  if (error) throw error;
  return { loaded: (data as { id: string }[] | null)?.length ?? 0, skipped: count ?? 0 };
}

export async function getArsenalTools(category?: string): Promise<ArsenalTool[]> {
  const supabase = createClient();
  let query = supabase
    .from('arsenal_tools')
    .select('id, name, description, category, endpoint, rating, tags')
    .order('rating', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return (data ?? []) as ArsenalTool[];
}
