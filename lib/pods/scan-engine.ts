export type ScanStep = 'idle' | 'vitals' | 'conversion' | 'seo' | 'complete';
export type Severity = 'Low' | 'Medium' | 'High';

export interface ScanFinding {
  id: string;
  category: 'vitals' | 'conversion' | 'seo';
  title: string;
  description: string;
  impact: number;
  severity: Severity;
}

export interface ScanResult {
  url: string;
  detectedLanguage: string;
  totalLeakEstimate: number;
  severity: Severity;
  findings: ScanFinding[];
  scores: {
    vitals: number;
    conversion: number;
    seo: number;
    overall: number;
  };
  timestamp: Date;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deriveLanguageFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.fr') || lower.includes('/fr')) return 'fr';
  if (lower.includes('.de') || lower.includes('/de')) return 'de';
  if (lower.includes('.es') || lower.includes('/es')) return 'es';
  if (lower.includes('.jp') || lower.includes('/ja')) return 'ja';
  return 'en';
}

const FINDINGS_BANK: Omit<ScanFinding, 'id'>[] = [
  {
    category: 'vitals',
    title: 'Largest Contentful Paint > 4s',
    description: 'LCP is critically slow. Users abandon pages that take longer than 2.5s to load the main content.',
    impact: 18500,
    severity: 'High',
  },
  {
    category: 'vitals',
    title: 'Cumulative Layout Shift detected',
    description: 'Visual instability causes mistaken clicks and erodes trust in checkout flows.',
    impact: 7200,
    severity: 'Medium',
  },
  {
    category: 'vitals',
    title: 'Interaction to Next Paint > 500ms',
    description: 'Slow interactivity degrades perceived performance and frustrates high-intent users.',
    impact: 11000,
    severity: 'High',
  },
  {
    category: 'vitals',
    title: 'First Input Delay elevated',
    description: 'JavaScript blocking is delaying first user interaction by over 200ms.',
    impact: 5400,
    severity: 'Medium',
  },
  {
    category: 'conversion',
    title: 'No urgency signals on primary CTA',
    description: 'Primary call-to-action lacks scarcity or time-bound messaging. A/B data shows 22% uplift with urgency.',
    impact: 24000,
    severity: 'High',
  },
  {
    category: 'conversion',
    title: 'Trust signals absent near purchase point',
    description: 'No security badges, testimonials, or guarantees visible at the point of conversion decision.',
    impact: 16500,
    severity: 'High',
  },
  {
    category: 'conversion',
    title: 'Form friction: 8+ fields before checkout',
    description: 'Excessive form fields increase abandonment by up to 40%. Streamline to 4 essential fields.',
    impact: 9800,
    severity: 'Medium',
  },
  {
    category: 'conversion',
    title: 'Mobile CTA below the fold',
    description: 'On 375px viewports, primary CTA requires 2.3 scrolls. Fixing placement yields 15% conversion uplift.',
    impact: 13200,
    severity: 'High',
  },
  {
    category: 'conversion',
    title: 'Exit-intent not captured',
    description: 'No exit-intent overlay or email capture for abandoning visitors. Industry average recovery: 7%.',
    impact: 6700,
    severity: 'Low',
  },
  {
    category: 'seo',
    title: 'Missing structured data (JSON-LD)',
    description: 'No Product, Review, or FAQ schema detected. Structured data increases rich snippet CTR by 20-30%.',
    impact: 8900,
    severity: 'Medium',
  },
  {
    category: 'seo',
    title: 'Title tags exceed 60 characters',
    description: 'Title tags are being truncated in SERPs, reducing click-through rate on high-intent queries.',
    impact: 5100,
    severity: 'Low',
  },
  {
    category: 'seo',
    title: 'Core pages lack canonical tags',
    description: 'Duplicate content signals are diluting page authority across key landing pages.',
    impact: 12300,
    severity: 'Medium',
  },
  {
    category: 'seo',
    title: 'Image alt text missing on 40+ assets',
    description: 'Missing alt attributes block image search traffic and fail WCAG accessibility compliance.',
    impact: 4200,
    severity: 'Low',
  },
  {
    category: 'seo',
    title: 'Internal linking architecture is shallow',
    description: 'Key conversion pages receive fewer than 3 internal links. PageRank is not flowing to revenue-generating URLs.',
    impact: 9600,
    severity: 'Medium',
  },
];

function selectFindings(count: number): ScanFinding[] {
  const shuffled = [...FINDINGS_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((f, i) => ({ ...f, id: `finding-${i}` }));
}

export async function runScan(
  url: string,
  onStepChange: (step: ScanStep) => void
): Promise<ScanResult> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  onStepChange('vitals');
  await delay(randomBetween(1800, 2400));

  onStepChange('conversion');
  await delay(randomBetween(1600, 2200));

  onStepChange('seo');
  await delay(randomBetween(1400, 2000));

  const findings = selectFindings(randomBetween(6, 9));
  const totalLeak = findings.reduce((sum, f) => sum + f.impact, 0) + randomBetween(5000, 15000);

  const highCount = findings.filter((f) => f.severity === 'High').length;
  const severity: Severity =
    highCount >= 3 ? 'High' : highCount >= 1 ? 'Medium' : 'Low';

  const vitalsFindings = findings.filter((f) => f.category === 'vitals');
  const conversionFindings = findings.filter((f) => f.category === 'conversion');
  const seoFindings = findings.filter((f) => f.category === 'seo');

  const calcScore = (items: ScanFinding[]) => {
    const highPenalty = items.filter((f) => f.severity === 'High').length * 18;
    const medPenalty = items.filter((f) => f.severity === 'Medium').length * 9;
    const lowPenalty = items.filter((f) => f.severity === 'Low').length * 4;
    return Math.max(20, 100 - highPenalty - medPenalty - lowPenalty + randomBetween(-5, 5));
  };

  const vScore = calcScore(vitalsFindings);
  const cScore = calcScore(conversionFindings);
  const sScore = calcScore(seoFindings);
  const overall = Math.round((vScore + cScore + sScore) / 3);

  onStepChange('complete');

  return {
    url,
    detectedLanguage: deriveLanguageFromUrl(url),
    totalLeakEstimate: totalLeak,
    severity,
    findings,
    scores: {
      vitals: vScore,
      conversion: cScore,
      seo: sScore,
      overall,
    },
    timestamp: new Date(),
  };
}
